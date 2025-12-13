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
  let readingId: string | null = null;
  
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
    const readingType = (data?.readingType || 'detailed') as any;

    // ============================================
    // SCHRITT 1: Reading-Eintrag in Supabase erstellen (Status: pending)
    // ============================================
    // Supabase generiert UUID automatisch - das ist unsere zentrale ID
    const { data: pendingReading, error: createError } = await supabase
      .from('readings')
      .insert([{
        // id wird von Supabase generiert (UUID)
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
        reading_text: '', // Wird später gefüllt
        status: 'pending' // Start-Status
      }])
      .select()
      .single();

    if (createError || !pendingReading) {
      console.error('Supabase Create Error:', createError);
      return NextResponse.json(
        createErrorResponse(
          'Failed to create reading entry',
          'DB_CREATE_ERROR',
          createError?.message || 'Unknown error'
        ),
        { status: 500 }
      );
    }

    // Zentrale ID verwenden (von Supabase generiert)
    readingId = pendingReading.id;

    // ============================================
    // SCHRITT 2: Status auf 'processing' setzen
    // ============================================
    const { error: processingError } = await supabase
      .from('readings')
      .update({ status: 'processing' })
      .eq('id', readingId);

    if (processingError) {
      console.error('Supabase Status Update Error (processing):', processingError);
      // Weiter machen, auch wenn Status-Update fehlschlägt
    }

    // ============================================
    // SCHRITT 3: Reading Agent aufrufen
    // ============================================
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
        readingType: readingType,
        // Für Compatibility Reading
        ...(data?.readingType === 'compatibility' && {
          birthDate2: data?.birthDate2,
          birthTime2: data?.birthTime2,
          birthPlace2: data?.birthPlace2
        })
      }),
    });

    if (!response.ok) {
      // ============================================
      // FEHLER: Status auf 'failed' setzen
      // ============================================
      const errorText = await response.text();
      console.error('Reading Agent Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        readingId
      });

      // Status auf 'failed' setzen
      await supabase
        .from('readings')
        .update({ 
          status: 'failed',
          metadata: {
            error: errorText,
            failedAt: new Date().toISOString()
          }
        })
        .eq('id', readingId);

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
    const readingText = readingData.reading || readingData.text || '';

    // ============================================
    // SCHRITT 4: Reading-Daten in Supabase aktualisieren (Status: completed)
    // ============================================
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

    const { data: completedReading, error: updateError } = await supabase
      .from('readings')
      .update({
        reading_text: readingText,
        reading_sections: readingData.sections || null,
        chart_data: readingData.chartData || null,
        metadata: {
          tokens: readingData.tokens || 0,
          model: readingData.model || 'gpt-4',
          timestamp: new Date().toISOString()
        },
        status: 'completed'
      })
      .eq('id', readingId)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase Update Error:', updateError);
      // Weiter machen, auch wenn Update fehlschlägt
    }

    // ============================================
    // SCHRITT 5: Standardisierte Response zurückgeben
    // ============================================
    const standardizedResponse: ReadingResponse = createReadingResponse(
      readingId, // Zentrale ID (von Supabase generiert)
      readingText,
      readingType,
      metadata,
      readingData.sections || undefined,
      readingData.chartData || undefined
    );

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

