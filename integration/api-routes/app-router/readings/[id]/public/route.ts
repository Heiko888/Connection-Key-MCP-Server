/**
 * Public Reading by ID API Route (App Router)
 * Route: /api/readings/[id]/public
 * 
 * Öffentlicher read-only Zugriff auf Readings
 * KEIN Login erforderlich
 * KEIN Schreiben, KEIN Side-Effect
 * 
 * Fehlerfälle:
 * - Reading nicht gefunden → 404
 * - Zugriff verboten → explizite Meldung
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSystemSupabaseClient } from '../../../../../lib/supabase-clients';

interface PublicReadingResponse {
  success: true;
  reading: {
    id: string;
    reading_text: string;
    reading_type: string;
    essence: string | null;
    chart_id: string | null;
    chart_version: string | null;
    agent_id: string | null;
    agent_version: string | null;
    created_at: string;
  };
}

interface PublicReadingError {
  success: false;
  error: string;
  message: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const readingId = params.id;

    // Validierung: readingId muss UUID sein
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(readingId)) {
      return NextResponse.json<PublicReadingError>(
        {
          success: false,
          error: 'INVALID_READING_ID',
          message: `Invalid reading ID format: ${readingId}`,
        },
        { status: 400 }
      );
    }

    // Lade Reading aus Supabase (read-only, System Client)
    const supabase = getSystemSupabaseClient();
    const { data: reading, error } = await supabase
      .from('readings')
      .select('id, reading_text, reading_type, essence, chart_id, chart_version, agent_id, agent_version, created_at')
      .eq('id', readingId)
      .eq('status', 'completed') // Nur completed Readings
      .single();

    // Fehler: Reading nicht gefunden
    if (error || !reading) {
      return NextResponse.json<PublicReadingError>(
        {
          success: false,
          error: 'READING_NOT_FOUND',
          message: `Reading with ID ${readingId} not found or not accessible`,
        },
        { status: 404 }
      );
    }

    // Erfolgreiche Antwort
    const response: PublicReadingResponse = {
      success: true,
      reading: {
        id: reading.id,
        reading_text: reading.reading_text,
        reading_type: reading.reading_type,
        essence: reading.essence,
        chart_id: reading.chart_id,
        chart_version: reading.chart_version,
        agent_id: reading.agent_id,
        agent_version: reading.agent_version,
        created_at: reading.created_at,
      },
    };

    return NextResponse.json<PublicReadingResponse>(response, { status: 200 });
  } catch (error: any) {
    console.error('[GET /api/readings/[id]/public] Error:', error);
    return NextResponse.json<PublicReadingError>(
      {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
