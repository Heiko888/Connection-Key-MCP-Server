/**
 * Public Reading by ID API Route (App Router)
 * Route: /api/readings/[id]/public
 *
 * Öffentlicher read-only Zugriff auf Readings
 * KEIN Login erforderlich
 *
 * V4-Readings: Wenn public.readings noch status 'pending' hat, der V4-Worker
 * aber bereits fertig ist, wird das Ergebnis aus v4.reading_results geladen
 * und optional in public.readings nachgeführt (damit Status und Inhalt konsistent sind).
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

    const supabase = getSystemSupabaseClient();

    // 1) Zuerst: public.readings mit status 'completed'
    const { data: reading, error } = await supabase
      .from('readings')
      .select('id, reading_text, reading_type, essence, chart_id, chart_version, agent_id, agent_version, created_at')
      .eq('id', readingId)
      .eq('status', 'completed')
      .single();

    if (!error && reading && reading.reading_text) {
      const response: PublicReadingResponse = {
        success: true,
        reading: {
          id: reading.id,
          reading_text: reading.reading_text,
          reading_type: reading.reading_type ?? '',
          essence: reading.essence ?? null,
          chart_id: reading.chart_id ?? null,
          chart_version: reading.chart_version ?? null,
          agent_id: reading.agent_id ?? null,
          agent_version: reading.agent_version ?? null,
          created_at: reading.created_at,
        },
      };
      return NextResponse.json<PublicReadingResponse>(response, { status: 200 });
    }

    // 2) V4-Fallback: Job mit reading_id und status 'completed', dann Ergebnis aus v4.reading_results
    const { data: v4Jobs } = await supabase
      .schema('v4')
      .from('reading_jobs')
      .select('id')
      .eq('payload->>reading_id', readingId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1);

    const v4Job = v4Jobs?.[0];
    if (v4Job) {
      const { data: v4Result, error: resErr } = await supabase
        .schema('v4')
        .from('reading_results')
        .select('result, content')
        .eq('job_id', v4Job.id)
        .maybeSingle();

      const resultText =
        (v4Result?.result ?? (v4Result as any)?.content) ?? null;
      if (resErr || resultText == null) {
        return NextResponse.json<PublicReadingError>(
          {
            success: false,
            error: 'READING_NOT_FOUND',
            message: `Reading with ID ${readingId} not found or not accessible`,
          },
          { status: 404 }
        );
      }

      // Optional: public.readings nachführen, damit künftig der normale Pfad greift
      const { data: row } = await supabase
        .from('readings')
        .select('id, reading_type, created_at')
        .eq('id', readingId)
        .maybeSingle();

      if (row) {
        await supabase
          .from('readings')
          .update({
            status: 'completed',
            reading_text: typeof resultText === 'string' ? resultText : JSON.stringify(resultText),
            error: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', readingId);
      }

      const response: PublicReadingResponse = {
        success: true,
        reading: {
          id: readingId,
          reading_text: typeof resultText === 'string' ? resultText : String(resultText),
          reading_type: (row?.reading_type as string) ?? 'basic',
          essence: null,
          chart_id: null,
          chart_version: null,
          agent_id: null,
          agent_version: null,
          created_at: (row as any)?.created_at ?? new Date().toISOString(),
        },
      };
      return NextResponse.json<PublicReadingResponse>(response, { status: 200 });
    }

    return NextResponse.json<PublicReadingError>(
      {
        success: false,
        error: 'READING_NOT_FOUND',
        message: `Reading with ID ${readingId} not found or not accessible`,
      },
      { status: 404 }
    );
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
