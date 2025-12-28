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

    // Status aus reading_jobs Tabelle lesen
    let query = supabase
      .from('reading_jobs')
      .select('id, status, result, error, created_at, updated_at')
      .eq('id', readingId)
      .single();

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: jobData, error: jobError } = await query;

    if (jobError) {
      if (jobError.code === 'PGRST116') {
        return NextResponse.json(
          createErrorResponse('Reading job not found', 'READING_NOT_FOUND'),
          { status: 404 }
        );
      }
      console.error('[Reading Status API] Supabase fetch error:', jobError);
      return NextResponse.json(
        createErrorResponse('Failed to fetch reading status', 'DB_FETCH_ERROR', jobError.message),
        { status: 500 }
      );
    }

    // Response mit Status und optionalem Result
    return NextResponse.json({
      success: true,
      status: {
        readingId: jobData.id,
        status: jobData.status,
        result: jobData.result, // JSONB mit reading, chartData, etc.
        error: jobData.error, // Fehlermeldung falls status='failed'
        createdAt: jobData.created_at,
        updatedAt: jobData.updated_at
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

