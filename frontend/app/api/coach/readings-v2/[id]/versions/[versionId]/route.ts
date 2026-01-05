import { NextRequest, NextResponse } from 'next/server';
import { checkCoachAuth } from '@/lib/coach-auth';
import { getCoachReadingById } from '@/lib/db/coach-readings';
import { getReadingVersionById } from '@/lib/db/reading-versions';

export const runtime = 'nodejs';

type VersionResponse =
  | {
      success: true;
      version: {
        id: string;
        input: Record<string, any>;
        generatedText: string | null;
        readingType: string;
        schemaVersion: string;
        versionNumber: number;
        createdAt: string;
        mcpRuntimeMs: number | null;
        status: string;
        promptId?: string;
        promptVersion?: string;
        error?: string;
      };
    }
  | { success: false; error: string };

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const { user, isCoach } = await checkCoachAuth(req);

    if (!user || !isCoach) {
      return NextResponse.json<VersionResponse>(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const readingId = params.id;
    const versionId = params.versionId;

    if (!readingId || !versionId) {
      return NextResponse.json<VersionResponse>(
        { success: false, error: 'Reading-ID oder Version-ID fehlt' },
        { status: 400 }
      );
    }

    // Reading laden (für Ownership-Prüfung)
    const reading = await getCoachReadingById(user.id, readingId);

    if (!reading) {
      return NextResponse.json<VersionResponse>(
        { success: false, error: 'Reading nicht gefunden' },
        { status: 404 }
      );
    }

    // Ownership prüfen
    if (reading.coach_id !== user.id) {
      return NextResponse.json<VersionResponse>(
        { success: false, error: 'Kein Zugriff auf dieses Reading' },
        { status: 403 }
      );
    }

    // Version laden
    const version = await getReadingVersionById(versionId);

    if (!version) {
      return NextResponse.json<VersionResponse>(
        { success: false, error: 'Version nicht gefunden' },
        { status: 404 }
      );
    }

    // Prüfen ob Version zu Reading gehört
    if (version.reading_id !== readingId) {
      return NextResponse.json<VersionResponse>(
        { success: false, error: 'Version gehört nicht zu diesem Reading' },
        { status: 403 }
      );
    }

    // Response
    return NextResponse.json<VersionResponse>({
      success: true,
      version: {
        id: version.id,
        input: version.input,
        generatedText: version.generated_text,
        readingType: version.reading_type,
        schemaVersion: version.schema_version,
        versionNumber: version.version_number,
        createdAt: version.created_at,
        mcpRuntimeMs: version.mcp_runtime_ms,
        status: version.status,
        promptId: version.prompt_id || undefined,
        promptVersion: version.prompt_version || undefined,
        error: version.error_message || undefined,
      },
    });
  } catch (error: any) {
    console.error('Fehler beim Laden der Version:', error);
    return NextResponse.json<VersionResponse>(
      {
        success: false,
        error: error?.message || 'Unbekannter Serverfehler',
      },
      { status: 500 }
    );
  }
}

