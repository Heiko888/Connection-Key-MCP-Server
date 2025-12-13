/**
 * Reading Status API Route (App Router)
 * Route: /api/readings/[id]/status
 * 
 * Ruft den Status eines Readings ab (inkl. Status-History)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createErrorResponse } from '../../../../reading-response-types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const readingId = params.id;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // Optional: für RLS

    if (!readingId) {
      return NextResponse.json(
        createErrorResponse('Reading ID is required', 'MISSING_READING_ID'),
        { status: 400 }
      );
    }

    // Status mit History abrufen (via Supabase Function)
    const { data, error } = await supabase
      .rpc('get_reading_status', { p_reading_id: readingId });

    if (error) {
      // Fallback: Direkt aus readings Tabelle lesen
      let query = supabase
        .from('readings')
        .select('id, status, created_at, updated_at')
        .eq('id', readingId)
        .single();

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data: readingData, error: readingError } = await query;

      if (readingError) {
        if (readingError.code === 'PGRST116') {
          return NextResponse.json(
            createErrorResponse('Reading not found', 'READING_NOT_FOUND'),
            { status: 404 }
          );
        }
        console.error('Supabase fetch error:', readingError);
        return NextResponse.json(
          createErrorResponse('Failed to fetch reading status', 'DB_FETCH_ERROR', readingError.message),
          { status: 500 }
        );
      }

      // Status-History abrufen
      const { data: historyData } = await supabase
        .from('reading_status_history')
        .select('*')
        .eq('reading_id', readingId)
        .order('changed_at', { ascending: false });

      return NextResponse.json({
        success: true,
        status: {
          readingId: readingData.id,
          status: readingData.status,
          createdAt: readingData.created_at,
          updatedAt: readingData.updated_at,
          statusHistory: historyData?.map(h => ({
            oldStatus: h.old_status,
            newStatus: h.new_status,
            changedBy: h.changed_by,
            changedAt: h.changed_at,
            reason: h.reason
          })) || []
        }
      });
    }

    // Function hat funktioniert
    if (!data || data.length === 0) {
      return NextResponse.json(
        createErrorResponse('Reading not found', 'READING_NOT_FOUND'),
        { status: 404 }
      );
    }

    const statusData = data[0];

    return NextResponse.json({
      success: true,
      status: {
        readingId: statusData.reading_id,
        status: statusData.status,
        createdAt: statusData.created_at,
        updatedAt: statusData.updated_at,
        statusHistory: statusData.status_history || []
      }
    });

  } catch (error: any) {
    console.error('Reading Status API Error:', error);
    return NextResponse.json(
      createErrorResponse(error.message || 'Internal server error', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}

