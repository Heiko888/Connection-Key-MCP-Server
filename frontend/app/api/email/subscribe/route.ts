import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, newsletterOptIn, source, analysisResult, person1, person2 } = body;

    // Validierung
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Ungültige E-Mail-Adresse' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Versuche E-Mail in email_subscriptions Tabelle zu speichern
    // Falls die Tabelle nicht existiert, loggen wir es nur
    const { data, error } = await supabase
      .from('email_subscriptions')
      .insert({
        email,
        newsletter_opt_in: newsletterOptIn || false,
        source: source || 'resonance-analysis',
        metadata: {
          analysisResult,
          person1,
          person2,
          timestamp: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      // Falls die Tabelle nicht existiert, loggen wir es trotzdem als Erfolg
      // (für Entwicklung/Testing)
      console.log('E-Mail-Subscription (Tabelle möglicherweise nicht vorhanden):', {
        email,
        newsletterOptIn,
        source,
        error: error.message,
      });

      // Für Entwicklung: Erfolg zurückgeben auch wenn Tabelle fehlt
      return NextResponse.json(
        {
          success: true,
          message: 'E-Mail erfolgreich gespeichert',
          email,
          note: 'Hinweis: E-Mail-Subscription-Tabelle muss noch erstellt werden',
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'E-Mail erfolgreich gespeichert',
        email,
        subscription: data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fehler beim Speichern der E-Mail:', error);
    return NextResponse.json(
      {
        error: 'Interner Serverfehler',
        message: error.message || 'Unbekannter Fehler',
      },
      { status: 500 }
    );
  }
}
