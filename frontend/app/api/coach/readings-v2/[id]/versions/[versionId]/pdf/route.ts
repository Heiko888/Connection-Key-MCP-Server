import { NextRequest, NextResponse } from 'next/server';
import { checkCoachAuth } from '@/lib/coach-auth';
import { getCoachReadingById } from '@/lib/db/coach-readings';
import { getReadingVersionById } from '@/lib/db/reading-versions';
import { getReadingType } from '@/lib/readingTypes';

export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const { user, isCoach } = await checkCoachAuth(req);

    if (!user || !isCoach) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const readingId = params.id;
    const versionId = params.versionId;

    if (!readingId || !versionId) {
      return NextResponse.json(
        { error: 'Reading-ID oder Version-ID fehlt' },
        { status: 400 }
      );
    }

    // Reading laden (für Ownership-Prüfung)
    const reading = await getCoachReadingById(user.id, readingId);

    if (!reading) {
      return NextResponse.json(
        { error: 'Reading nicht gefunden' },
        { status: 404 }
      );
    }

    // Ownership prüfen
    if (reading.coach_id !== user.id) {
      return NextResponse.json(
        { error: 'Kein Zugriff auf dieses Reading' },
        { status: 403 }
      );
    }

    // Version laden
    const version = await getReadingVersionById(versionId);

    if (!version) {
      return NextResponse.json(
        { error: 'Version nicht gefunden' },
        { status: 404 }
      );
    }

    // Prüfen ob Version zu Reading gehört
    if (version.reading_id !== readingId) {
      return NextResponse.json(
        { error: 'Version gehört nicht zu diesem Reading' },
        { status: 403 }
      );
    }

    // Reading-Config für Label
    const readingConfig = getReadingType(version.reading_type);

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
      readingConfig?.label || version.reading_type,
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

    addText(`Version: V${version.version_number}`, 10, false, textGray);
    addText(`Erstellt am: ${formatDate(version.created_at)}`, 10, false, textGray);
    addText(`Schema-Version: ${version.schema_version}`, 10, false, textGray);
    addText(`MCP-Agent: ${version.mcp_agent}`, 10, false, textGray);
    if (version.mcp_runtime_ms) {
      addText(`Laufzeit: ${version.mcp_runtime_ms}ms`, 10, false, textGray);
    }
    yPos += 10;

    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    // 3. Eingabedaten (optional, formatiert)
    if (version.input && Object.keys(version.input).length > 0) {
      addText('Eingabedaten', 12, true, textDark);
      yPos += 5;

      const formatInput = (obj: Record<string, any>, indent: number = 0): string[] => {
        const lines: string[] = [];
        for (const [key, value] of Object.entries(obj)) {
          const indentStr = '  '.repeat(indent);
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            lines.push(`${indentStr}${key}:`);
            lines.push(...formatInput(value, indent + 1));
          } else if (Array.isArray(value)) {
            lines.push(`${indentStr}${key}: [${value.length} Einträge]`);
          } else {
            lines.push(`${indentStr}${key}: ${String(value)}`);
          }
        }
        return lines;
      };

      const inputLines = formatInput(version.input);
      for (const line of inputLines) {
        addText(line, 9, false, textGray);
      }
      yPos += 10;
    }

    // 4. Analyse-Text
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    addText('Analyse', 14, true, textDark);
    yPos += 10;

    if (version.generated_text) {
      // Text in Absätze aufteilen und formatieren
      const paragraphs = version.generated_text.split('\n\n');
      for (const paragraph of paragraphs) {
        if (paragraph.trim()) {
          addText(paragraph.trim(), 11, false, textDark);
          yPos += 5; // Abstand zwischen Absätzen
        }
      }
    } else {
      addText('Kein Text verfügbar', 11, false, textGray);
    }

    // 5. Footer auf jeder Seite
    const drawFooter = () => {
      const footerY = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
      pdf.setFont('helvetica', 'normal');
      pdf.text('The Connection Key', pageWidth / 2, footerY, { align: 'center' });
      pdf.text(
        `Versioniert & reproduzierbar | ID: ${version.id.substring(0, 8)}...`,
        pageWidth / 2,
        footerY + 5,
        { align: 'center' }
      );
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
    const filename = `reading-${readingId.substring(0, 8)}-v${version.version_number}.pdf`;

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

