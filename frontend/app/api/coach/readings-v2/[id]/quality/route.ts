import { NextRequest, NextResponse } from 'next/server';
import { checkCoachAuth } from '@/lib/coach-auth';
import { getCoachReadingById } from '@/lib/db/coach-readings';
import { getReadingVersionById } from '@/lib/db/reading-versions';
import {
  createReadingQuality,
  getReadingQualities,
  type ReadingQualityInput,
} from '@/lib/db/reading-quality';

export const runtime = 'nodejs';

type QualityResponse =
  | { success: true; quality: any }
  | { success: false; error: string };

type QualityListResponse =
  | { success: true; qualities: any[] }
  | { success: false; error: string };

/**
 * GET: Holt alle Bewertungen für ein Reading
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, isCoach } = await checkCoachAuth(req);

    if (!user || !isCoach) {
      return NextResponse.json<QualityListResponse>(
        { success: false, error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const readingId = params.id;

    // Reading laden, um Ownership zu prüfen
    const reading = await getCoachReadingById(user.id, readingId);
    if (!reading) {
      return NextResponse.json<QualityListResponse>(
        { success: false, error: 'Reading nicht gefunden' },
        { status: 404 }
      );
    }

    if (reading.coach_id !== user.id) {
      return NextResponse.json<QualityListResponse>(
        { success: false, error: 'Kein Zugriff auf dieses Reading' },
        { status: 403 }
      );
    }

    const qualities = await getReadingQualities(readingId);

    return NextResponse.json<QualityListResponse>({
      success: true,
      qualities,
    });
  } catch (error: any) {
    console.error('Fehler beim Laden der Bewertungen:', error);
    return NextResponse.json<QualityListResponse>(
      { success: false, error: error?.message || 'Unbekannter Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * POST: Erstellt eine neue Bewertung
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, isCoach } = await checkCoachAuth(req);

    if (!user || !isCoach) {
      return NextResponse.json<QualityResponse>(
        { success: false, error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const readingId = params.id;

    // Reading laden, um Ownership zu prüfen
    const reading = await getCoachReadingById(user.id, readingId);
    if (!reading) {
      return NextResponse.json<QualityResponse>(
        { success: false, error: 'Reading nicht gefunden' },
        { status: 404 }
      );
    }

    if (reading.coach_id !== user.id) {
      return NextResponse.json<QualityResponse>(
        { success: false, error: 'Kein Zugriff auf dieses Reading' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      versionId,
      promptId,
      promptVersion,
      scoreClarity,
      scoreStructure,
      scoreDepth,
      scoreRelevance,
      scoreTone,
      scoreActionability,
      feedbackText,
    } = body;

    // Validierung
    if (
      scoreClarity === undefined ||
      scoreStructure === undefined ||
      scoreDepth === undefined ||
      scoreRelevance === undefined
    ) {
      return NextResponse.json<QualityResponse>(
        { success: false, error: 'Alle Bewertungen sind erforderlich' },
        { status: 400 }
      );
    }

    // Werte prüfen (1-5)
    const scores = [scoreClarity, scoreStructure, scoreDepth, scoreRelevance, scoreTone || 3, scoreActionability || 3];
    if (scores.some((s) => s < 1 || s > 5 || !Number.isInteger(s))) {
      return NextResponse.json<QualityResponse>(
        { success: false, error: 'Bewertungen müssen ganze Zahlen zwischen 1 und 5 sein' },
        { status: 400 }
      );
    }

    // Wenn versionId angegeben, prüfe ob Version existiert und zum Reading gehört
    if (versionId) {
      const version = await getReadingVersionById(versionId);
      if (!version || version.reading_id !== readingId) {
        return NextResponse.json<QualityResponse>(
          { success: false, error: 'Version nicht gefunden oder gehört nicht zu diesem Reading' },
          { status: 400 }
        );
      }
    }

    const qualityData: ReadingQualityInput = {
      reading_id: readingId,
      clarity: scoreClarity,
      relevance: scoreRelevance,
      depth: scoreDepth,
      tone: scoreTone || scoreStructure || 3,
      actionability: scoreActionability || 3,
      reviewer_type: 'human',
      reviewer_id: user.id,
      comment: feedbackText || null,
    };

    const quality = await createReadingQuality(qualityData);

    return NextResponse.json<QualityResponse>({
      success: true,
      quality,
    });
  } catch (error: any) {
    console.error('Fehler beim Erstellen der Bewertung:', error);
    return NextResponse.json<QualityResponse>(
      { success: false, error: error?.message || 'Unbekannter Serverfehler' },
      { status: 500 }
    );
  }
}

// PUT: Aktualisiert eine bestehende Bewertung
// TODO: Implementiere updateReadingQuality wenn benötigt

