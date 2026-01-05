import { NextRequest, NextResponse } from 'next/server';
import { getReadingShareByToken } from '@/lib/db/reading-share';
import { getLastReadingVersion } from '@/lib/db/reading-versions';
import { getReadingType } from '@/lib/readingTypes';

export const runtime = 'nodejs';

/**
 * PDF-Export für geteilte Readings
 * 
 * Token-basierter Zugriff, keine Auth erforderlich.
 * Gleiche PDF-Logik wie normale PDF-Export-Route.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    if (!token) {
      return NextResponse.json(
        { error: 'Token fehlt' },
        { status: 400 }
      );
    }

    // Share laden und validieren
    const share = await getReadingShareByToken(token);
    if (!share) {
      return NextResponse.json(
        { error: 'Share nicht gefunden oder abgelaufen' },
        { status: 404 }
      );
    }

    // Reading laden
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();

    const { data: reading, error: readingError } = await supabase
      .from('coach_readings')
      .select('*')
      .eq('id', share.reading_id)
      .maybeSingle(); // ✅ Tolerant: verhindert PGRST116

    if (readingError || !reading) {
      return NextResponse.json(
        { error: 'Reading nicht gefunden' },
        { status: 404 }
      );
    }

    // OPTION-B-GUARD: Prüfe ob current_version_id existiert
    if (!reading.current_version_id) {
      return NextResponse.json(
        { 
          error: 'Reading wird gerade generiert',
          message: 'Das PDF kann erst erstellt werden, wenn die Generierung abgeschlossen ist.',
          status: 'pending'
        },
        { status: 400 }
      );
    }

    // Version laden - nur wenn current_version_id existiert
    const version = await getLastReadingVersion(share.reading_id);
    if (!version || !version.generated_text) {
      return NextResponse.json(
        { 
          error: 'Reading wird gerade generiert',
          message: 'Das PDF kann erst erstellt werden, wenn die Generierung abgeschlossen ist.',
          status: 'pending'
        },
        { status: 400 }
      );
    }

    // PDF generieren (gleiche Logik wie normale PDF-Route)
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

    const brandGold: [number, number, number] = [232, 184, 109];
    const textDark: [number, number, number] = [11, 10, 15];
    const textGray: [number, number, number] = [128, 128, 128];

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

    const drawPageHeader = () => {
      pdf.setFontSize(16);
      pdf.setTextColor(brandGold[0], brandGold[1], brandGold[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Human Design Reading', pageWidth / 2, 15, { align: 'center' });
      pdf.setDrawColor(brandGold[0], brandGold[1], brandGold[2]);
      pdf.setLineWidth(0.5);
      pdf.line(margin, 20, pageWidth - margin, 20);
    };

    drawPageHeader();
    yPos = 30;

    const readingConfig = getReadingType(reading.reading_type);
    addText(readingConfig?.label || reading.reading_type, 20, true, textDark, 'center');
    yPos += 10;
    addText(reading.client_name, 16, true, textDark, 'center');
    yPos += 15;

    pdf.setDrawColor(textGray[0], textGray[1], textGray[2]);
    pdf.setLineWidth(0.3);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

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
    yPos += 10;
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    addText('Analyse', 14, true, textDark);
    yPos += 10;

    const paragraphs = version.generated_text.split('\n\n');
    for (const paragraph of paragraphs) {
      if (paragraph.trim()) {
        addText(paragraph.trim(), 11, false, textDark);
        yPos += 5;
      }
    }

    const drawFooter = () => {
      const footerY = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(textGray[0], textGray[1], textGray[2]);
      pdf.setFont('helvetica', 'normal');
      pdf.text('The Connection Key', pageWidth / 2, footerY, { align: 'center' });
      pdf.text('Geteilt von The Connection Key', pageWidth / 2, footerY + 5, { align: 'center' });
    };

    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      drawFooter();
    }

    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    const filename = `reading-${reading.client_name.replace(/\s+/g, '-')}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Robots-Tag': 'noindex, nofollow', // Kein Indexing
        'Cache-Control': 'no-cache, no-store, must-revalidate', // Kein Caching
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

