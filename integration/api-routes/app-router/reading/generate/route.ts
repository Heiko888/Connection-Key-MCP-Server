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

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const MCP_API_KEY = process.env.MCP_API_KEY;

if (!MCP_API_KEY) {
  console.error('❌ MCP_API_KEY nicht gesetzt!');
}

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
    // SCHRITT 3: MCP HTTP Gateway aufrufen
    // ============================================
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const mcpResponse = await fetch(`${MCP_SERVER_URL}/agents/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MCP_API_KEY}`
      },
      body: JSON.stringify({
        domain: 'reading',
        task: 'generate',
        payload: {
          birthDate: data?.birthDate,
          birthTime: data?.birthTime,
          birthPlace: data?.birthPlace,
          userId: data?.userId || null,
          readingType: readingType
        },
        requestId
      })
    });

    if (!mcpResponse.ok) {
      const errorData = await mcpResponse.json().catch(() => ({ error: { message: 'Unknown error' } }));
      
      // Status auf 'failed' setzen
      await supabase
        .from('readings')
        .update({ 
          status: 'failed',
          metadata: {
            error: errorData.error?.message || 'MCP Gateway error',
            failedAt: new Date().toISOString()
          }
        })
        .eq('id', readingId);

      return NextResponse.json(
        createErrorResponse(
          errorData.error?.message || 'MCP Gateway request failed',
          errorData.error?.code || 'MCP_ERROR',
          errorData.error?.details || {}
        ),
        { status: mcpResponse.status }
      );
    }

    const mcpResult = await mcpResponse.json();

    if (!mcpResult.success) {
      // Status auf 'failed' setzen
      await supabase
        .from('readings')
        .update({ 
          status: 'failed',
          metadata: {
            error: mcpResult.error?.message || 'Reading generation failed',
            failedAt: new Date().toISOString()
          }
        })
        .eq('id', readingId);

      return NextResponse.json(
        createErrorResponse(
          mcpResult.error?.message || 'Reading generation failed',
          mcpResult.error?.code || 'READING_ERROR',
          mcpResult.error?.details || {}
        ),
        { status: 500 }
      );
    }

    const readingText = mcpResult.data?.reading || '';

    // ============================================
    // SCHRITT 4: Reading-Daten in Supabase aktualisieren (Status: completed)
    // ============================================
    const metadata = {
      birthDate: data?.birthDate || '',
      birthTime: data?.birthTime || '',
      birthPlace: data?.birthPlace || '',
      tokens: mcpResult.data?.tokens || 0,
      model: 'gpt-4',
      timestamp: new Date().toISOString(),
      userId: data?.userId,
      runtimeMs: mcpResult.runtimeMs || 0,
      // Für Compatibility Reading
      ...(data?.readingType === 'compatibility' && {
        birthDate2: data?.birthDate2,
        birthTime2: data?.birthTime2,
        birthPlace2: data?.birthPlace2
      })
    };

    await supabase
      .from('readings')
      .update({
        reading_text: readingText,
        reading_sections: null,
        chart_data: mcpResult.data?.chartData || null,
        metadata: {
          tokens: mcpResult.data?.tokens || 0,
          model: 'gpt-4',
          timestamp: new Date().toISOString(),
          runtimeMs: mcpResult.runtimeMs || 0
        },
        status: 'completed'
      })
      .eq('id', readingId)
      .select()
      .single();

    // ============================================
    // SCHRITT 5: Standardisierte Response zurückgeben
    // ============================================
    const standardizedResponse: ReadingResponse = createReadingResponse(
      readingId,
      readingText,
      readingType,
      metadata,
      undefined,
      mcpResult.data?.chartData
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

