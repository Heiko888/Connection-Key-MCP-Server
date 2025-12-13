/**
 * Reading by ID API Route (App Router)
 * Route: /api/readings/[id]
 * 
 * Gibt ein spezifisches Reading zurück
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createErrorResponse, createReadingResponse, ReadingResponse } from '../../../reading-response-types';

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
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId'); // Optional für zusätzliche Sicherheit

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

    // Reading aus Supabase abrufen
    let query = supabase
      .from('readings')
      .select('*')
      .eq('id', readingId)
      .single();

    // Optional: User-ID prüfen (zusätzliche Sicherheit)
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: reading, error } = await query;

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return NextResponse.json(
          createErrorResponse(
            'Reading not found',
            'READING_NOT_FOUND'
          ),
          { status: 404 }
        );
      }

      console.error('Supabase Query Error:', error);
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

