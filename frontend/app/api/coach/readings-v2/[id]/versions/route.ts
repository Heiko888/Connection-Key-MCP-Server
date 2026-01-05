import { NextRequest, NextResponse } from 'next/server';
import { checkCoachAuth } from '@/lib/coach-auth';
import { getCoachReadingById } from '@/lib/db/coach-readings';
import { getReadingVersions } from '@/lib/db/reading-versions';

export const runtime = 'nodejs';

type VersionsResponse =
  | { success: true; versions: Array<{ id: string; versionNumber: number; createdAt: string; mcpRuntimeMs: number | null; schemaVersion: string }> }
  | { success: false; error: string };

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, isCoach } = await checkCoachAuth(req);

    if (!user || !isCoach) {
      return NextResponse.json<VersionsResponse>(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const readingId = params.id;

    if (!readingId) {
      return NextResponse.json<VersionsResponse>(
        { success: false, error: 'Reading-ID fehlt' },
        { status: 400 }
      );
    }

    // Reading laden (für Ownership-Prüfung)
    const reading = await getCoachReadingById(user.id, readingId);

    if (!reading) {
      return NextResponse.json<VersionsResponse>(
        { success: false, error: 'Reading nicht gefunden' },
        { status: 404 }
      );
    }

    // Ownership prüfen
    if (reading.coach_id !== user.id) {
      return NextResponse.json<VersionsResponse>(
        { success: false, error: 'Kein Zugriff auf dieses Reading' },
        { status: 403 }
      );
    }

    // Versionen laden
    const versions = await getReadingVersions(readingId);

    // Response
    return NextResponse.json<VersionsResponse>({
      success: true,
      versions: versions.map((v) => ({
        id: v.id,
        versionNumber: v.version_number,
        createdAt: v.created_at,
        mcpRuntimeMs: v.mcp_runtime_ms,
        schemaVersion: v.schema_version,
      })),
    });
  } catch (error: any) {
    console.error('Fehler beim Laden der Versionen:', error);
    return NextResponse.json<VersionsResponse>(
      {
        success: false,
        error: error?.message || 'Unbekannter Serverfehler',
      },
      { status: 500 }
    );
  }
}

