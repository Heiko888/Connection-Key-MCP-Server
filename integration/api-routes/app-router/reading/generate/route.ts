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
    // SCHRITT 1: reading_jobs Eintrag in Supabase erstellen (Status: pending)
    // ============================================
    // Supabase generiert UUID automatisch - das ist unsere zentrale ID
    console.log(`[Reading Generate API] Erstelle reading_jobs Eintrag für readingType: ${readingType}`);
    
    const { data: pendingJob, error: createError } = await supabase
      .from('reading_jobs')
      .insert([{
        // id wird von Supabase generiert (UUID)
        user_id: data?.userId || null,
        reading_type: readingType,
        status: 'pending',
        result: null,
        error: null
      }])
      .select()
      .single();

    if (createError || !pendingJob) {
      console.error('[Reading Generate API] Supabase Create Error:', createError);
      return NextResponse.json(
        createErrorResponse(
          'Failed to create reading_jobs entry',
          'DB_CREATE_ERROR',
          createError?.message || 'Unknown error'
        ),
        { status: 500 }
      );
    }

    // Zentrale ID verwenden (von Supabase generiert)
    readingId = pendingJob.id;
    console.log(`[Reading Generate API] reading_jobs erstellt mit ID: ${readingId}`);

    // ============================================
    // SCHRITT 2: MCP HTTP Gateway aufrufen
    // ============================================
    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Payload-Struktur (Contract) - PFLICHTFELDER
    const payload = {
      readingId: readingId, // ← ZWINGEND: readingId muss im Payload sein
      name: data?.name, // ← PFLICHTFELD
      birthDate: data?.birthDate, // ← PFLICHTFELD (YYYY-MM-DD)
      birthTime: data?.birthTime, // ← PFLICHTFELD (HH:mm)
      birthPlace: data?.birthPlace, // ← PFLICHTFELD
      readingType: readingType, // ← PFLICHTFELD
      focus: data?.focus, // ← PFLICHTFELD
      userId: data?.userId || null,
      // Für Compatibility Reading
      ...(data?.readingType === 'compatibility' && {
        birthDate2: data?.birthDate2,
        birthTime2: data?.birthTime2,
        birthPlace2: data?.birthPlace2
      })
    };
    
    // Explizite Validierung: Alle PFLICHTFELDER müssen vorhanden sein
    const requiredFields = ['name', 'birthDate', 'birthTime', 'birthPlace', 'readingType', 'focus'];
    const missingFields = requiredFields.filter(field => !payload[field as keyof typeof payload]);
    
    if (missingFields.length > 0) {
      console.error(`[Reading Generate API] FEHLER: Pflichtfelder fehlen: ${missingFields.join(', ')}`);
      
      // Status auf 'failed' setzen
      await supabase
        .from('reading_jobs')
        .update({ 
          status: 'failed',
          error: `Pflichtfelder fehlen: ${missingFields.join(', ')}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', readingId);

      return NextResponse.json(
        createErrorResponse(
          `Pflichtfelder fehlen: ${missingFields.join(', ')}`,
          'MISSING_REQUIRED_FIELDS',
          { missingFields }
        ),
        { status: 400 }
      );
    }
    
    console.log(`[Reading Generate API] Rufe MCP Gateway auf mit readingId: ${readingId}`);
    console.log(`[Reading Generate API] Payload:`, JSON.stringify(payload, null, 2));
    
    const mcpResponse = await fetch(`${MCP_SERVER_URL}/agents/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MCP_API_KEY}`
      },
      body: JSON.stringify({
        domain: 'reading',
        task: 'generate',
        payload: payload,
        requestId
      })
    });

    if (!mcpResponse.ok) {
      const errorData = await mcpResponse.json().catch(() => ({ error: { message: 'Unknown error' } }));
      
      console.error(`[Reading Generate API] MCP Gateway Fehler (${mcpResponse.status}) für readingId: ${readingId}`, errorData);
      
      // Status auf 'failed' setzen
      await supabase
        .from('reading_jobs')
        .update({ 
          status: 'failed',
          error: errorData.error?.message || 'MCP Gateway error',
          updated_at: new Date().toISOString()
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
    console.log(`[Reading Generate API] MCP Gateway Response für readingId: ${readingId}`, { success: mcpResult.success });

    if (!mcpResult.success) {
      console.error(`[Reading Generate API] MCP Gateway Fehler für readingId: ${readingId}`, mcpResult.error);
      
      // Status auf 'failed' setzen
      await supabase
        .from('reading_jobs')
        .update({ 
          status: 'failed',
          error: mcpResult.error?.message || 'Reading generation failed',
          updated_at: new Date().toISOString()
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

    // ============================================
    // SCHRITT 3: n8n updated reading_jobs automatisch
    // Frontend wartet auf Status-Update via Polling
    // ============================================
    console.log(`[Reading Generate API] MCP Gateway erfolgreich für readingId: ${readingId}. n8n wird reading_jobs updaten.`);

    // Standardisierte Response zurückgeben (Status wird via Polling abgefragt)
    return NextResponse.json({
      success: true,
      readingId: readingId,
      message: 'Reading generation started',
      status: 'processing'
    });

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

