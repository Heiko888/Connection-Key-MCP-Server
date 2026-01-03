/**
 * Reading History API Route (App Router)
 * Route: /api/readings/history
 * 
 * Gibt Reading-History eines Users zurück
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse } from '../../../reading-response-types';
import { getUserSupabaseClient, requireUserAuth } from '../../../lib/supabase-clients';

export async function GET(request: NextRequest) {
  try {
    // User-Authentifizierung: JWT aus Authorization Header extrahieren
    let userJwt: string;
    try {
      userJwt = requireUserAuth(request);
    } catch (authError: any) {
      return NextResponse.json(
        createErrorResponse(
          authError.message || 'Unauthorized - Missing or invalid Authorization header',
          'UNAUTHORIZED'
        ),
        { status: 401 }
      );
    }

    // Supabase Client mit User-JWT (RLS aktiv)
    const supabase = getUserSupabaseClient(userJwt);

    // Query Parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const readingType = searchParams.get('readingType');

    // User-ID wird automatisch aus JWT extrahiert (RLS filtert)
    // Optional: userId als Query-Parameter für zusätzliche Validierung
    const userIdParam = searchParams.get('userId');

    // Optional: userId Query-Parameter validieren (falls vorhanden)
    if (userIdParam) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userIdParam)) {
        return NextResponse.json(
          createErrorResponse(
            'userId must be a valid UUID',
            'INVALID_USER_ID'
          ),
          { status: 400 }
        );
      }
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

    // Readings aus Supabase abrufen via RPC
    // RPC verwendet SECURITY INVOKER → RLS filtert automatisch nach auth.uid() aus JWT
    const { data: readings, error: readingsError } = await supabase
      .rpc('get_user_readings_list', {
        p_limit: limit,
        p_offset: offset,
        p_reading_type: readingType || null
      });

    if (readingsError) {
      console.error('Supabase RPC Error:', readingsError);
      return NextResponse.json(
        createErrorResponse(
          'Failed to fetch readings',
          'DATABASE_ERROR',
          readingsError.message
        ),
        { status: 500 }
      );
    }

    // Gesamtanzahl für Pagination via RPC
    // RPC verwendet SECURITY INVOKER → RLS filtert automatisch nach auth.uid() aus JWT
    const { data: countData, error: countError } = await supabase
      .rpc('get_user_readings_count', {
        p_reading_type: readingType || null
      });

    if (countError) {
      console.error('Supabase RPC Count Error:', countError);
      // Count-Fehler nicht kritisch, verwende 0 als Fallback
      console.warn('Count query failed, using 0 as fallback');
    }

    const count = countData || 0;

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

