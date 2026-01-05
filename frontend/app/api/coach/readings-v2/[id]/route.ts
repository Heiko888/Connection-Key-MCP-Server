import { NextRequest, NextResponse } from 'next/server';
import { checkCoachAuth } from '@/lib/coach-auth';
import { getReadingV2JSONById } from '@/lib/db/readings-v2-json';

export const runtime = 'nodejs';

type GetResponse =
  | {
      success: true;
             reading: {
               id: string;
               readingType: string;
               clientName: string;
               status: string;
               approvalStatus?: string;
               createdAt: string;
               updatedAt: string;
               currentVersionId: string;
             };
      versions: Array<{
        id: string;
        createdAt: string;
        generatedText: string | null;
        status: string;
        error?: string;
        meta: {
          agent: string;
          mcpType: string;
          requestId: string;
        };
      }>;
    }
  | { success: false; error: string };

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, isCoach } = await checkCoachAuth(req);

    if (!user || !isCoach) {
      return NextResponse.json<GetResponse>(
        { success: false, error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    const readingId = params.id;

    if (!readingId) {
      return NextResponse.json<GetResponse>(
        { success: false, error: 'Reading-ID fehlt' },
        { status: 400 }
      );
    }

    // Reading mit Versionen laden
    const reading = await getReadingV2JSONById(user.id, readingId);

    if (!reading) {
      return NextResponse.json<GetResponse>(
        { success: false, error: 'Reading nicht gefunden' },
        { status: 404 }
      );
    }

    // Ownership prüfen
    if (reading.coach_id !== user.id) {
      return NextResponse.json<GetResponse>(
        { success: false, error: 'Kein Zugriff auf dieses Reading' },
        { status: 403 }
      );
    }

    // OPTION-B-GUARD: Prüfe ob currentVersionId existiert und Version vorhanden ist
    // Für V2 JSON System: Prüfe reading_data.currentVersionId und ob Version existiert
    if (!reading.reading_data?.currentVersionId || !reading.reading_data?.versions || reading.reading_data.versions.length === 0) {
      // Reading existiert, aber noch keine Version erstellt (Race Condition)
      // Saubere Response zurückgeben
      return NextResponse.json<GetResponse>({
        success: true,
        reading: {
          id: reading.id,
          readingType: reading.reading_type,
          clientName: reading.client_name,
          status: 'pending',
          createdAt: reading.created_at,
          updatedAt: reading.updated_at,
          currentVersionId: '',
        },
        versions: [],
      });
    }

    // Prüfe ob currentVersionId auf existierende Version verweist
    const currentVersion = reading.reading_data.versions.find(
      (v) => v.id === reading.reading_data.currentVersionId
    );

    if (!currentVersion) {
      // currentVersionId verweist auf nicht existierende Version (inkonsistenter Zustand)
      // Fallback: Pending-Response
      return NextResponse.json<GetResponse>({
        success: true,
        reading: {
          id: reading.id,
          readingType: reading.reading_type,
          clientName: reading.client_name,
          status: 'pending',
          createdAt: reading.created_at,
          updatedAt: reading.updated_at,
          currentVersionId: '',
        },
        versions: [],
      });
    }

    // Response
    return NextResponse.json<GetResponse>({
      success: true,
      reading: {
        id: reading.id,
        readingType: reading.reading_type,
        clientName: reading.client_name,
        status: reading.status,
        createdAt: reading.created_at,
        updatedAt: reading.updated_at,
        currentVersionId: reading.reading_data.currentVersionId,
      },
      versions: reading.reading_data.versions.map((v) => ({
        id: v.id,
        createdAt: v.createdAt,
        generatedText: v.generatedText,
        status: v.status,
        error: v.error,
        meta: v.meta,
      })),
    });
  } catch (error: any) {
    console.error('Fehler beim Laden des Readings:', error);
    return NextResponse.json<GetResponse>(
      {
        success: false,
        error: error?.message || 'Unbekannter Serverfehler',
      },
      { status: 500 }
    );
  }
}
