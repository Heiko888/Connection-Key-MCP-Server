/**
 * Reading Notification API Route (App Router)
 * Route: /api/notifications/reading
 * 
 * Empfängt Notifications von n8n nach Reading-Generierung
 * Kann für Real-time Updates verwendet werden
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createErrorResponse } from '../../../reading-response-types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // API-Key Authentifizierung (optional, aber empfohlen)
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');
    
    // Prüfe API-Key (falls N8N_API_KEY gesetzt ist)
    if (process.env.N8N_API_KEY) {
      if (!apiKey || apiKey !== process.env.N8N_API_KEY) {
        return NextResponse.json(
          createErrorResponse(
            'Unauthorized - Invalid or missing API Key',
            'UNAUTHORIZED'
          ),
          { status: 401 }
        );
      }
    }

    // Request Body parsen
    const body = await request.json();
    const { readingId, userId, readingType, status, timestamp } = body;

    // Validierung
    if (!readingId) {
      return NextResponse.json(
        createErrorResponse(
          'readingId is required',
          'MISSING_READING_ID'
        ),
        { status: 400 }
      );
    }

    // Reading aus Supabase abrufen (für Verifikation)
    const { data: reading, error: readError } = await supabase
      .from('readings')
      .select('id, user_id, reading_type, status')
      .eq('id', readingId)
      .single();

    if (readError || !reading) {
      return NextResponse.json(
        createErrorResponse(
          'Reading not found',
          'READING_NOT_FOUND'
        ),
        { status: 404 }
      );
    }

    // History-Eintrag erstellen (wenn User vorhanden)
    if (userId && reading.user_id === userId) {
      try {
        await supabase
          .from('reading_history')
          .insert([{
            user_id: userId,
            reading_id: readingId,
            viewed_at: new Date().toISOString()
          }]);
      } catch (historyError) {
        // History-Fehler nicht kritisch, nur loggen
        console.warn('Reading History Error:', historyError);
      }
    }

    // Erfolgreiche Antwort
    return NextResponse.json({
      success: true,
      message: 'Notification received',
      readingId,
      userId,
      readingType: reading.reading_type,
      status: reading.status,
      timestamp: timestamp || new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Reading Notification API Error:', error);

    // JSON Parse Error
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        createErrorResponse(
          'Invalid JSON in request body',
          'INVALID_JSON'
        ),
        { status: 400 }
      );
    }

    // Allgemeiner Fehler
    return NextResponse.json(
      createErrorResponse(
        error.message || 'Internal server error',
        'INTERNAL_ERROR'
      ),
      { status: 500 }
    );
  }
}

// GET: API Info
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Reading Notification API',
    endpoint: '/api/notifications/reading',
    method: 'POST',
    description: 'Empfängt Notifications von n8n nach Reading-Generierung',
    authentication: 'Bearer Token (N8N_API_KEY) - optional',
    requiredFields: ['readingId'],
    optionalFields: ['userId', 'readingType', 'status', 'timestamp']
  });
}

