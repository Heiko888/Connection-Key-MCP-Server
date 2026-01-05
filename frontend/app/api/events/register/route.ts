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
    const { eventId, userId, eventTitle, eventDate, eventTime, eventLocation, eventType } = body;

    if (!eventId || !userId) {
      return NextResponse.json(
        { error: 'Event ID und User ID sind erforderlich' },
        { status: 400 }
      );
    }

    // Prüfe ob bereits registriert (nur wenn Supabase konfiguriert ist)
    if (supabase) {
      const { data: existing } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Bereits für dieses Event registriert' },
          { status: 400 }
        );
      }

      // Erstelle Event-Registrierung
      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: userId,
          event_title: eventTitle,
          event_date: eventDate,
          event_time: eventTime,
          event_location: eventLocation,
          event_type: eventType,
          status: 'registered',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Fehler beim Erstellen der Event-Registrierung:', error);
        // Fallback: Speichere in localStorage (wird bereits im Frontend gemacht)
        return NextResponse.json(
          { success: true, message: 'Event-Registrierung gespeichert (localStorage)' },
          { status: 200 }
        );
      }

      return NextResponse.json({
        success: true,
        registration: data,
        message: 'Erfolgreich für Event registriert'
      });
    } else {
      // Supabase nicht konfiguriert - nur localStorage-Fallback
      return NextResponse.json(
        { success: true, message: 'Event-Registrierung gespeichert (localStorage - Supabase nicht konfiguriert)' },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error('Fehler bei Event-Registrierung:', error);
    return NextResponse.json(
      { error: 'Fehler bei der Event-Registrierung', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

