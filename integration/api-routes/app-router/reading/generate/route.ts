/**
 * Reading Generate API Route (App Router)
 * Route: /api/reading/generate
 * 
 * Vollständige Input-Validierung und Reading-Generierung
 * Standardisierte Output-Struktur
 * Persistenz in Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateReadingRequest, formatValidationErrors } from '../../../reading-validation';
import { createReadingResponse, createErrorResponse, ReadingResponse } from '../../../reading-response-types';

const READING_AGENT_URL = process.env.READING_AGENT_URL || 'http://138.199.237.34:4001';

// Supabase Client (Service Role für Admin-Zugriff)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Request Body parsen
    const body = await request.json();

    // Input-Validierung
    const validation = validateReadingRequest(body);

    if (!validation.valid) {
      return NextResponse.json(
        formatValidationErrors(validation.errors),
        { status: 400 }
      );
    }

    // Validierte Daten
    const { data } = validation;

    // Reading Agent aufrufen
    const response = await fetch(`${READING_AGENT_URL}/reading/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: data?.userId || 'anonymous',
        birthDate: data?.birthDate,
        birthTime: data?.birthTime,
        birthPlace: data?.birthPlace,
        readingType: data?.readingType,
        // Für Compatibility Reading
        ...(data?.readingType === 'compatibility' && {
          birthDate2: data?.birthDate2,
          birthTime2: data?.birthTime2,
          birthPlace2: data?.birthPlace2
        })
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Reading Agent Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });

      const errorResponse = createErrorResponse(
        'Reading Agent request failed',
        'READING_AGENT_ERROR',
        errorText
      );

      return NextResponse.json(
        errorResponse,
        { status: response.status || 500 }
      );
    }

    const readingData = await response.json();

    // Standardisierte Response erstellen
    const readingId = readingData.readingId || `reading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const readingText = readingData.reading || readingData.text || '';
    const readingType = (readingData.readingType || data?.readingType || 'detailed') as any;

    // Metadaten für Persistenz
    const metadata = {
      birthDate: data?.birthDate || '',
      birthTime: data?.birthTime || '',
      birthPlace: data?.birthPlace || '',
      tokens: readingData.tokens || 0,
      model: readingData.model || 'gpt-4',
      timestamp: readingData.timestamp || new Date().toISOString(),
      userId: data?.userId,
      // Für Compatibility Reading
      ...(data?.readingType === 'compatibility' && {
        birthDate2: data?.birthDate2,
        birthTime2: data?.birthTime2,
        birthPlace2: data?.birthPlace2
      })
    };

    // Reading in Supabase speichern
    try {
      const { data: savedReading, error: dbError } = await supabase
        .from('readings')
        .insert([{
          id: readingId, // Verwende generierte ID
          user_id: data?.userId || null,
          reading_type: readingType,
          birth_date: data?.birthDate,
          birth_time: data?.birthTime,
          birth_place: data?.birthPlace,
          // Für Compatibility Reading
          ...(data?.readingType === 'compatibility' && {
            birth_date2: data?.birthDate2,
            birth_time2: data?.birthTime2,
            birth_place2: data?.birthPlace2
          }),
          reading_text: readingText,
          reading_sections: readingData.sections || null,
          chart_data: readingData.chartData || null,
          metadata: {
            tokens: readingData.tokens || 0,
            model: readingData.model || 'gpt-4',
            timestamp: new Date().toISOString()
          },
          status: 'completed'
        }])
        .select()
        .single();

      if (dbError) {
        console.error('Supabase Insert Error:', dbError);
        
        // Falls Duplicate Key Error (ID bereits vorhanden), versuche mit neuer ID
        if (dbError.code === '23505') {
          const newReadingId = `reading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          const { data: retryReading, error: retryError } = await supabase
            .from('readings')
            .insert([{
              id: newReadingId,
              user_id: data?.userId || null,
              reading_type: readingType,
              birth_date: data?.birthDate,
              birth_time: data?.birthTime,
              birth_place: data?.birthPlace,
              ...(data?.readingType === 'compatibility' && {
                birth_date2: data?.birthDate2,
                birth_time2: data?.birthTime2,
                birth_place2: data?.birthPlace2
              }),
              reading_text: readingText,
              reading_sections: readingData.sections || null,
              chart_data: readingData.chartData || null,
              metadata: {
                tokens: readingData.tokens || 0,
                model: readingData.model || 'gpt-4',
                timestamp: new Date().toISOString()
              },
              status: 'completed'
            }])
            .select()
            .single();

          if (retryError) {
            console.error('Supabase Retry Insert Error:', retryError);
            // Weiter mit Reading, auch wenn Speicherung fehlgeschlagen ist
          } else {
            // Verwende neue ID
            const standardizedResponse: ReadingResponse = createReadingResponse(
              newReadingId,
              readingText,
              readingType,
              metadata,
              readingData.sections || undefined,
              readingData.chartData || undefined
            );
            return NextResponse.json(standardizedResponse);
          }
        } else {
          // Anderer Datenbank-Fehler - loggen, aber Reading trotzdem zurückgeben
          console.error('Supabase Insert Error (non-duplicate):', dbError);
        }
      } else {
        // Erfolgreich gespeichert - verwende gespeicherte ID
        const standardizedResponse: ReadingResponse = createReadingResponse(
          savedReading.id,
          readingText,
          readingType,
          metadata,
          readingData.sections || undefined,
          readingData.chartData || undefined
        );
        return NextResponse.json(standardizedResponse);
      }
    } catch (dbError: any) {
      // Datenbank-Fehler - loggen, aber Reading trotzdem zurückgeben
      console.error('Supabase Error:', dbError);
    }

    // Falls Speicherung fehlgeschlagen ist, Reading trotzdem zurückgeben
    // (Reading wurde generiert, nur Persistenz fehlgeschlagen)
    const standardizedResponse: ReadingResponse = createReadingResponse(
      readingId,
      readingText,
      readingType,
      metadata,
      readingData.sections || undefined,
      readingData.chartData || undefined
    );

    // Erfolgreiche Antwort (auch wenn Persistenz fehlgeschlagen ist)
    return NextResponse.json(standardizedResponse);

  } catch (error: any) {
    console.error('Reading Generate API Error:', error);

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
    message: 'Reading Generate API',
    endpoint: '/api/reading/generate',
    method: 'POST',
    requiredFields: ['birthDate', 'birthTime', 'birthPlace'],
    optionalFields: ['readingType', 'userId'],
    readingTypes: [
      'basic',
      'detailed',
      'business',
      'relationship',
      'career',
      'health',
      'parenting',
      'spiritual',
      'compatibility',
      'life-purpose'
    ],
    compatibilityFields: {
      note: 'Für compatibility Reading zusätzlich erforderlich:',
      fields: ['birthDate2', 'birthTime2', 'birthPlace2']
    }
  });
}

