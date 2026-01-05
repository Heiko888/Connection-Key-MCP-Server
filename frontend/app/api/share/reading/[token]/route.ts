import { NextRequest, NextResponse } from 'next/server';
import { getReadingShareByToken, incrementShareViews } from '@/lib/db/reading-share';
import { getCoachReadingById } from '@/lib/db/coach-readings';
import { getLastReadingVersion } from '@/lib/db/reading-versions';
import { getReadingType } from '@/lib/readingTypes';

export const runtime = 'nodejs';

type ShareResponse =
  | {
      success: true;
      reading: {
        id: string;
        readingType: string;
        clientName: string;
        generatedText: string | null;
        createdAt: string;
      };
      share: {
        accessLevel: string;
        views: number;
        maxViews: number | null;
        expiresAt: string | null;
      };
    }
  | { success: false; error: string };

/**
 * Öffentliche Ansicht für geteilte Readings
 * 
 * Token-basierter Zugriff, keine Auth erforderlich.
 * Jeder Zugriff erhöht views und aktualisiert client_status.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const token = params.token;
    if (!token) {
      return NextResponse.json<ShareResponse>(
        { success: false, error: 'Token fehlt' },
        { status: 400 }
      );
    }

    // Share laden und validieren
    const share = await getReadingShareByToken(token);
    if (!share) {
      return NextResponse.json<ShareResponse>(
        { success: false, error: 'Share nicht gefunden oder abgelaufen' },
        { status: 404 }
      );
    }

    // Prüfe nochmal Ablaufdatum (Double-Check)
    if (share.expires_at && new Date(share.expires_at) < new Date()) {
      return NextResponse.json<ShareResponse>(
        { success: false, error: 'Share ist abgelaufen' },
        { status: 410 } // Gone
      );
    }

    // Prüfe max_views (Double-Check)
    if (share.max_views !== null && share.views >= share.max_views) {
      return NextResponse.json<ShareResponse>(
        { success: false, error: 'Maximale Anzahl Aufrufe erreicht' },
        { status: 410 } // Gone
      );
    }

    // Reading laden (öffentlich, ohne Coach-Auth)
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = createClient();

    const { data: reading, error: readingError } = await supabase
      .from('coach_readings')
      .select('*')
      .eq('id', share.reading_id)
      .maybeSingle(); // ✅ Tolerant: verhindert PGRST116

    if (readingError || !reading) {
      return NextResponse.json<ShareResponse>(
        { success: false, error: 'Reading nicht gefunden' },
        { status: 404 }
      );
    }

    // OPTION-B-GUARD: Prüfe ob current_version_id existiert
    if (!reading.current_version_id) {
      return NextResponse.json<ShareResponse>(
        { success: false, error: 'Reading wird gerade generiert' },
        { status: 400 }
      );
    }

    // Version laden (letzte) - nur wenn current_version_id existiert
    const version = await getLastReadingVersion(share.reading_id);
    if (!version || !version.generated_text) {
      return NextResponse.json<ShareResponse>(
        { success: false, error: 'Reading wird gerade generiert' },
        { status: 400 }
      );
    }

    // Views erhöhen (asynchron, nicht blockierend)
    incrementShareViews(share.id).catch((err) => {
      console.error('Fehler beim Erhöhen der Share-Views:', err);
    });

    // Response
    return NextResponse.json<ShareResponse>({
      success: true,
      reading: {
        id: reading.id,
        readingType: reading.reading_type,
        clientName: reading.client_name,
        generatedText: version.generated_text,
        createdAt: version.created_at,
      },
      share: {
        accessLevel: share.access_level,
        views: share.views + 1, // Vorausschauend
        maxViews: share.max_views,
        expiresAt: share.expires_at,
      },
    });
  } catch (error: any) {
    console.error('Fehler beim Laden des geteilten Readings:', error);
    return NextResponse.json<ShareResponse>(
      {
        success: false,
        error: error?.message || 'Unbekannter Serverfehler',
      },
      { status: 500 }
    );
  }
}

