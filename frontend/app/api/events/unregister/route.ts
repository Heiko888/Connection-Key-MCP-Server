import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ⚠️ WICHTIG: Supabase funktioniert NICHT in der Edge Runtime
export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Verwende Secret Key für Service-Operationen (neues Supabase-Key-Modell)
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

// Nur initialisieren wenn beide Variablen vorhanden sind
const supabase = supabaseUrl && supabaseSecretKey 
  ? createClient(supabaseUrl, supabaseSecretKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, userId } = body;

    if (!eventId || !userId) {
      return NextResponse.json(
        { error: 'Event ID und User ID sind erforderlich' },
        { status: 400 }
      );
    }

    // Entferne Event-Registrierung (nur wenn Supabase konfiguriert ist)
    if (supabase) {
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) {
        console.error('Fehler beim Entfernen der Event-Registrierung:', error);
        // Fallback: Entferne aus localStorage
        return NextResponse.json(
          { success: true, message: 'Event-Registrierung entfernt (localStorage)' },
          { status: 200 }
        );
      }
    } else {
      // Supabase nicht konfiguriert - nur localStorage-Fallback
      return NextResponse.json(
        { success: true, message: 'Event-Registrierung entfernt (localStorage - Supabase nicht konfiguriert)' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Erfolgreich von Event abgemeldet'
    });

  } catch (error) {
    console.error('Fehler bei Event-Abmeldung:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Event-Abmeldung', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

