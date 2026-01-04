/**
 * DEBUG API Route
 * Route: POST /api/debug
 * 
 * Minimaler Test für Supabase-Integration
 * 
 * ⚠️ FEHLERQUELLEN:
 * 1. SUPABASE_SERVICE_ROLE_KEY nicht gesetzt
 * 2. NEXT_PUBLIC_SUPABASE_URL nicht gesetzt
 * 3. Tabelle debug_test existiert nicht
 * 4. Policy nicht erstellt
 * 5. JSON-Parse-Fehler
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSystemSupabaseClient } from '../../../lib/supabase-clients';

// ⚠️ FEHLERQUELLE: Environment-Variablen müssen gesetzt sein!
// System-Client: Debug-Route für System-Tests
// Service Role Key notwendig für Debug-Operationen
function getSupabaseClient() {
  return getSystemSupabaseClient();
}

export async function POST(request: NextRequest) {
  try {
    // ⚠️ FEHLERQUELLE: JSON-Parse kann fehlschlagen
    const body = await request.json();
    
    // ⚠️ FEHLERQUELLE: message-Feld fehlt oder ist falscher Typ
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'message field is required and must be a string' },
        { status: 400 }
      );
    }

    // Supabase Client initialisieren
    const supabase = getSupabaseClient();

    // ⚠️ FEHLERQUELLE: Insert kann fehlschlagen (Tabelle existiert nicht, Policy fehlt, etc.)
    const { data, error } = await supabase
      .from('debug_test')
      .insert([
        {
          message: body.message
          // id und created_at werden automatisch generiert
        }
      ])
      .select()
      .single();

    // ⚠️ FEHLERQUELLE: Supabase-Fehler
    if (error) {
      console.error('Supabase Insert Error:', error);
      return NextResponse.json(
        { 
          error: 'Database insert failed',
          details: error.message,
          code: error.code
        },
        { status: 500 }
      );
    }

    // ⚠️ FEHLERQUELLE: data ist null (Insert erfolgreich, aber kein Daten zurück)
    if (!data) {
      return NextResponse.json(
        { error: 'Insert succeeded but no data returned' },
        { status: 500 }
      );
    }

    // Erfolg
    return NextResponse.json({ status: 'ok' });

  } catch (error: any) {
    console.error('Debug API Error:', error);

    // ⚠️ FEHLERQUELLE: Verschiedene Fehlertypen
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    if (error.message === 'Supabase credentials missing') {
      return NextResponse.json(
        { error: 'Server configuration error: Supabase credentials missing' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET: API Info
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/debug',
    method: 'POST',
    description: 'Minimaler Supabase-Debug-Test',
    requiredFields: {
      message: 'string - Die Nachricht, die in die Tabelle geschrieben werden soll'
    },
    example: {
      message: 'Hello World'
    },
    possibleErrors: [
      'Supabase credentials missing',
      'Table debug_test does not exist',
      'Policy not created',
      'Invalid JSON',
      'message field missing'
    ]
  });
}

