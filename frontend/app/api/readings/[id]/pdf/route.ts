import { NextRequest, NextResponse } from 'next/server';
import { getLastReadingVersion } from '@/lib/db/reading-versions';
import { getReadingType } from '@/lib/readingTypes';
import { getPromptVersion } from '@/lib/prompts/promptRegistry';

export const runtime = 'nodejs';

/**
 * ============================================================================
 * LEGACY API - ADAPTER auf V2 System
 * ============================================================================
 * 
 * GET /api/readings/[id]/pdf - PDF-Export für Readings
 * 
 * Öffentlicher Zugriff (mit optionalem Token-Auth).
 * Lädt Reading aus V2 System (coach_readings) und rendert PDF serverseitig.
 * 
 * REGELN:
 * - Nutzt V2 System als Datenquelle
 * - PDF-Logik bleibt (keine Business-Logik für Reading-Generierung)
 * - KEIN MCP-Call, KEIN Regenerate - nur Darstellung
 * - Einheitliche readingId = coach_readings.id
 * 
 * Siehe: API-LEITPLANKE-READING.md
 * ============================================================================
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const readingId = params.id;
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token'); // Optional: Token für öffentlichen Zugriff

    if (!readingId) {
      return NextResponse.json(
        { error: 'Reading-ID fehlt' },
        { status: 400 }
      );
    }

    // TODO: Token-Validierung für öffentlichen Zugriff
    // Für jetzt: Öffentlicher Zugriff (später mit Token-Auth erweitern)
    // const { user, isCoach } = await checkCoachAuth(req);
    // if (!user || !isCoach) {
    //   return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    // }

    // Reading laden aus V2 System (coach_readings)
    // WICHTIG: Kein .single() ohne eindeutige Filter - nutze .maybeSingle() um PGRST116 zu vermeiden
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();
    
    const { data: reading, error: readingError } = await supabase
      .from('coach_readings')
      .select('*')
      .eq('id', readingId) // id ist PRIMARY KEY, daher eindeutig
      .maybeSingle();

    if (readingError || !reading) {
      return NextResponse.json(
        { error: 'Reading nicht gefunden' },
        { status: 404 }
      );
    }

    // OPTION-B-GUARD: Prüfe ob current_version_id existiert
    // Wenn nicht, ist das Reading noch nicht vollständig generiert (Race Condition)
    if (!reading.current_version_id) {
      // Reading existiert, aber noch keine Version erstellt
      // Für PDF: 400 Bad Request mit klarer Meldung
      return NextResponse.json(
        { 
          error: 'Reading wird gerade generiert',
          message: 'Das PDF kann erst erstellt werden, wenn die Generierung abgeschlossen ist.',
          status: 'pending'
        },
        { status: 400 }
      );
    }

    // Version laden (letzte oder spezifische) - nur wenn current_version_id existiert
    const version = await getLastReadingVersion(readingId);

    if (!version) {
      // current_version_id existiert, aber Version nicht gefunden (inkonsistenter Zustand)
      return NextResponse.json(
        { 
          error: 'Reading wird gerade generiert',
          message: 'Das PDF kann erst erstellt werden, wenn die Generierung abgeschlossen ist.',
          status: 'pending'
        },
        { status: 400 }
      );
    }

    if (!version.generated_text) {
      return NextResponse.json(
        { error: 'Reading hat noch keinen generierten Text' },
        { status: 400 }
      );
    }

    // Reading-Config für Label
    const readingConfig = getReadingType(reading.reading_type);
    
    // Prompt-Version-Info (falls vorhanden)
    let promptVersionInfo: { version: string; label: string } | null = null;
    if (version.prompt_id) {
      const parts = version.prompt_id.split('.');
      if (parts.length >= 2) {
        const readingType = parts[0];
        const promptVersion = parts[parts.length - 1];
        const promptData = getPromptVersion(readingType, promptVersion);
        if (promptData) {
          promptVersionInfo = {
            version: promptVersion,
            label: promptData.label,
          };
        }
      }
    }

    // PDF generieren (dynamischer Import für Node.js-Kompatibilität)
    const { default: jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPos = margin;

    // Branding-Farben
    const brandGold: [number, number, number] = [232, 184, 109]; // #e8b86d
    const textDark: [number, number, number] = [11, 10, 15]; // #0b0a0f
    const textGray: [number, number, number] = [128, 128, 128];

    // Hilfsfunktion für Text mit Zeilenumbruch
    const addText = (
      text: string,
      fontSize: number,
      isBold: boolean = false,
      color: [number, number, number] = [0, 0, 0],
      align: 'left' | 'center' | 'right' = 'left'
    ) => {
      pdf.setFontSize(fontSize);
      pdf.setTextColor(color[0], color[1], color[2]);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');

      const lines = pdf.splitTextToSize(text, maxWidth);

      // Prüfe ob neue Seite nötig
      if (yPos + lines.length * fontSize * 0.4 > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
        drawPageHeader();
      }

      const xPos =
        align === 'center'
          ? pageWidth / 2
          : align === 'right'
          ? pageWidth - margin
          : margin;
      pdf.text(lines, xPos, yPos, { align });
      yPos += lines.length * fontSize * 0.4 + 5;
    };

    // Header auf jeder Seite
    const drawPageHeader = () => {
      pdf.setFontSize(16);
      pdf.setTextColor(brandGold[0], brandGold[1], brandGold[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Human Design Reading', pageWidth / 2, 15, { align: 'center' });
      pdf.setDrawColor(brandGold[0], brandGold[1], brandGold[2]);
      pdf.setLineWidth(0.5);
      pdf.line(margin, 20, pageWidth - margin, 20);
    };

    // 1. Titel
    drawPageHeader();
    yPos = 30;

    addText(
      readingConfig?.label || reading.reading_type,
      20,
      true,
      textDark,
      'center'
    );
    yPos += 10;

    addText(reading.client_name, 16, true, textDark, 'center');
    yPos += 15;

    // 2. Meta-Block
    pdf.setDrawColor(textGray[0], textGray[1], textGray[2]);
    pdf.setLineWidth(0.3);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    addText('Metadaten', 12, true, textDark);
    yPos += 5;

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    addText(`Erstellt am: ${formatDate(version.created_at)}`, 10, false, textGray);
    
    if (promptVersionInfo) {
      addText(`Prompt-Version: ${promptVersionInfo.label} (${promptVersionInfo.version})`, 10, false, textGray);
    }
    
    yPos += 10;
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    // 3. Hauptinhalt: generatedText
    addText('Analyse', 14, true, textDark);
    yPos += 10;

    // Text in Absätze aufteilen und formatieren
    const paragraphs = version.generated_text.split('\n\n');
    for (const paragraph of paragraphs) {
      if (paragraph.trim()) {
        addText(paragraph.trim(), 11, false, textDark);
        yPos += 5; // Abstand zwischen Absätzen
      }
    }

    // 4. Footer auf jeder Seite
    const drawFooter = () => {
      const footerY = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
      pdf.setFont('helvetica', 'normal');
      pdf.text('The Connection Key', pageWidth / 2, footerY, { align: 'center' });
      
      if (promptVersionInfo) {
        pdf.text(
          `Versioniert & reproduzierbar | Prompt: ${promptVersionInfo.version}`,
          pageWidth / 2,
          footerY + 5,
          { align: 'center' }
        );
      } else {
        pdf.text(
          `Versioniert & reproduzierbar | ID: ${version.id.substring(0, 8)}...`,
          pageWidth / 2,
          footerY + 5,
          { align: 'center' }
        );
      }
    };

    // Footer auf allen Seiten
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      drawFooter();
    }

    // PDF als Buffer generieren
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    // Response mit PDF
    const filename = `reading-${readingId.substring(0, 8)}-${reading.client_name.replace(/\s+/g, '-')}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Fehler beim Generieren des PDFs:', error);
    return NextResponse.json(
      {
        error: error?.message || 'Fehler beim Generieren des PDFs',
      },
      { status: 500 }
    );
  }
}

