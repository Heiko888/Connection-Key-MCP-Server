/**
 * Reading History API Route (App Router)
 * Route: /api/readings/history
 * 
 * Gibt Reading-History eines Users zurück
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createErrorResponse } from '../../../reading-response-types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Query Parameters
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const readingType = searchParams.get('readingType');

    // Validierung
    if (!userId) {
      return NextResponse.json(
        createErrorResponse(
          'userId query parameter is required',
          'MISSING_USER_ID'
        ),
        { status: 400 }
      );
    }

    // UUID-Format prüfen
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        createErrorResponse(
          'userId must be a valid UUID',
          'INVALID_USER_ID'
        ),
        { status: 400 }
      );
    }

    // Limit validieren
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        createErrorResponse(
          'limit must be between 1 and 100',
          'INVALID_LIMIT'
        ),
        { status: 400 }
      );
    }

    // Readings aus Supabase abrufen
    let query = supabase
      .from('readings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Optional: Nach Reading-Typ filtern
    if (readingType) {
      query = query.eq('reading_type', readingType);
    }

    const { data: readings, error } = await query;

    if (error) {
      console.error('Supabase Query Error:', error);
      return NextResponse.json(
        createErrorResponse(
          'Failed to fetch readings',
          'DATABASE_ERROR',
          error.message
        ),
        { status: 500 }
      );
    }

    // Gesamtanzahl für Pagination
    let countQuery = supabase
      .from('readings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (readingType) {
      countQuery = countQuery.eq('reading_type', readingType);
    }

    const { count } = await countQuery;

    // Erfolgreiche Antwort
    return NextResponse.json({
      success: true,
      readings: readings || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Reading History API Error:', error);
    return NextResponse.json(
      createErrorResponse(
        error.message || 'Internal server error',
        'INTERNAL_ERROR'
      ),
      { status: 500 }
    );
  }
}

