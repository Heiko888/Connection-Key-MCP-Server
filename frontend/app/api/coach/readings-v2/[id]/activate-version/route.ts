import { NextRequest, NextResponse } from 'next/server';
import { checkCoachAuth } from '@/lib/coach-auth';
import { getCoachReadingById } from '@/lib/db/coach-readings';
import { getReadingVersionById } from '@/lib/db/reading-versions';
import { setCurrentVersion } from '@/lib/db/reading-versions';

export const runtime = 'nodejs';

type ActivateResponse =
  | { success: true }
  | { success: false; error: string };

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, isCoach } = await checkCoachAuth(req);

    if (!user || !isCoach) {
      return NextResponse.json<ActivateResponse>(
        { success: false, error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const readingId = params.id;
    const body = await req.json();
    const { versionId } = body ?? {};

    if (!readingId || !versionId) {
      return NextResponse.json<ActivateResponse>(
        { success: false, error: 'Reading-ID oder Version-ID fehlt' },
        { status: 400 }
      );
    }

    // Reading laden (für Ownership-Prüfung)
    const reading = await getCoachReadingById(user.id, readingId);

    if (!reading) {
      return NextResponse.json<ActivateResponse>(
        { success: false, error: 'Reading nicht gefunden' },
        { status: 404 }
      );
    }

    // Ownership prüfen
    if (reading.coach_id !== user.id) {
      return NextResponse.json<ActivateResponse>(
        { success: false, error: 'Kein Zugriff auf dieses Reading' },
        { status: 403 }
      );
    }

    // Version laden und prüfen
    const version = await getReadingVersionById(versionId);

    if (!version) {
      return NextResponse.json<ActivateResponse>(
        { success: false, error: 'Version nicht gefunden' },
        { status: 404 }
      );
    }

    // Prüfen ob Version zu Reading gehört
    if (version.reading_id !== readingId) {
      return NextResponse.json<ActivateResponse>(
        { success: false, error: 'Version gehört nicht zu diesem Reading' },
        { status: 403 }
      );
    }

    // Version aktivieren
    await setCurrentVersion(readingId, versionId);

    return NextResponse.json<ActivateResponse>({
      success: true,
    });
  } catch (error: any) {
    console.error('Fehler beim Aktivieren der Version:', error);
    return NextResponse.json<ActivateResponse>(
      {
        success: false,
        error: error?.message || 'Unbekannter Serverfehler',
      },
      { status: 500 }
    );
  }
}

