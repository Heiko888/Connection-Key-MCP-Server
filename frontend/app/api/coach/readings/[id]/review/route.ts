import { NextRequest, NextResponse } from 'next/server';
import { checkCoachAuth } from '@/lib/coach-auth';
import { getCoachReadingById, updateCoachReading } from '@/lib/db/coach-readings';
import { getLastReadingVersion } from '@/lib/db/reading-versions';
import { createReadingQuality } from '@/lib/db/reading-quality';

export const runtime = 'nodejs';

type ReviewResponse =
  | { success: true; qualityId: string }
  | { success: false; error: string };

/**
 * Human Review für ein Reading
 * 
 * Speichert Quality-Bewertung und aktualisiert approval_status.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, isCoach } = await checkCoachAuth(req);

    if (!user || !isCoach) {
      return NextResponse.json<ReviewResponse>(
        { success: false, error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const readingId = params.id;
    if (!readingId) {
      return NextResponse.json<ReviewResponse>(
        { success: false, error: 'Reading-ID fehlt' },
        { status: 400 }
      );
    }

    // Reading laden und Ownership prüfen
    const reading = await getCoachReadingById(user.id, readingId);
    if (!reading) {
      return NextResponse.json<ReviewResponse>(
        { success: false, error: 'Reading nicht gefunden' },
        { status: 404 }
      );
    }

    // Body parsen
    const body = await req.json();
    const { clarity, relevance, depth, tone, actionability, comment, action } = body ?? {};

    // Validierung
    if (
      clarity === undefined ||
      relevance === undefined ||
      depth === undefined ||
      tone === undefined ||
      actionability === undefined
    ) {
      return NextResponse.json<ReviewResponse>(
        { success: false, error: 'Alle Metriken (clarity, relevance, depth, tone, actionability) sind Pflichtfelder' },
        { status: 400 }
      );
    }

    // Werte validieren (0-5)
    const metrics = { clarity, relevance, depth, tone, actionability };
    for (const [key, value] of Object.entries(metrics)) {
      if (typeof value !== 'number' || value < 0 || value > 5) {
        return NextResponse.json<ReviewResponse>(
          { success: false, error: `${key} muss eine Zahl zwischen 0 und 5 sein` },
          { status: 400 }
        );
      }
    }

    // Action validieren
    if (action && !['approve', 'revision_required'].includes(action)) {
      return NextResponse.json<ReviewResponse>(
        { success: false, error: 'action muss "approve" oder "revision_required" sein' },
        { status: 400 }
      );
    }

    // Quality-Bewertung speichern
    const quality = await createReadingQuality({
      reading_id: readingId,
      clarity,
      relevance,
      depth,
      tone,
      actionability,
      reviewer_type: 'human',
      reviewer_id: user.id,
      comment: comment || null,
    });

    // Approval-Status aktualisieren
    const approvalStatus = action === 'approve' ? 'approved' : action === 'revision_required' ? 'revision_required' : 'ai_reviewed';
    await updateCoachReading(user.id, readingId, {
      approval_status: approvalStatus,
    });

    return NextResponse.json<ReviewResponse>({
      success: true,
      qualityId: quality.id,
    });
  } catch (error: any) {
    console.error('Fehler beim Speichern der Review:', error);
    return NextResponse.json<ReviewResponse>(
      {
        success: false,
        error: error?.message || 'Unbekannter Serverfehler',
      },
      { status: 500 }
    );
  }
}

