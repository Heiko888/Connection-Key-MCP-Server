/**
 * Reading by ID API Route (App Router)
 * Route: /api/readings/[id]
 * 
 * Gibt ein spezifisches Reading zurück
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, createReadingResponse, ReadingResponse } from '../../../reading-response-types';
import { getUserSupabaseClient, requireUserAuth } from '../../../lib/supabase-clients';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const readingId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const userIdParam = searchParams.get('userId'); // Optional für zusätzliche Validierung

    // Validierung
    if (!readingId) {
      return NextResponse.json(
        createErrorResponse(
          'Reading ID is required',
          'MISSING_READING_ID'
        ),
        { status: 400 }
      );
    }

    // UUID-Format prüfen
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(readingId)) {
      return NextResponse.json(
        createErrorResponse(
          'Reading ID must be a valid UUID',
          'INVALID_READING_ID'
        ),
        { status: 400 }
      );
    }

    // Reading aus Supabase abrufen via RPC
    // RPC verwendet SECURITY INVOKER → RLS filtert automatisch nach auth.uid() aus JWT
    const { data: readingData, error: readingError } = await supabase
      .rpc('get_reading_by_id', {
        p_reading_id: readingId
      });

    // RPC gibt ein Array zurück, nehmen wir das erste Element
    const reading = readingData && readingData.length > 0 ? readingData[0] : null;
    const error = readingError;

    if (error) {
      console.error('Supabase RPC Error:', error);
      return NextResponse.json(
        createErrorResponse(
          'Failed to fetch reading',
          'DATABASE_ERROR',
          error.message
        ),
        { status: 500 }
      );
    }

    if (!reading) {
      // RLS hat gefiltert → Reading existiert nicht oder User hat keinen Zugriff
      return NextResponse.json(
        createErrorResponse(
          'Reading not found',
          'READING_NOT_FOUND'
        ),
        { status: 404 }
      );
    }

    // Standardisierte Response erstellen
    const standardizedResponse: ReadingResponse = createReadingResponse(
      reading.id,
      reading.reading_text,
      reading.reading_type as any,
      {
        birthDate: reading.birth_date,
        birthTime: reading.birth_time,
        birthPlace: reading.birth_place,
        tokens: (reading.metadata as any)?.tokens || 0,
        model: (reading.metadata as any)?.model || 'gpt-4',
        timestamp: reading.created_at,
        userId: reading.user_id || undefined,
        ...(reading.reading_type === 'compatibility' && {
          birthDate2: reading.birth_date2 || undefined,
          birthTime2: reading.birth_time2 || undefined,
          birthPlace2: reading.birth_place2 || undefined
        })
      },
      reading.reading_sections || undefined,
      reading.chart_data || undefined
    );

    // Erfolgreiche Antwort
    return NextResponse.json(standardizedResponse);

  } catch (error: any) {
    console.error('Reading by ID API Error:', error);
    return NextResponse.json(
      createErrorResponse(
        error.message || 'Internal server error',
        'INTERNAL_ERROR'
      ),
      { status: 500 }
    );
  }
}

