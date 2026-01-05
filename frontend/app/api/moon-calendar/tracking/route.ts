import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

// Runtime-Konfiguration: Node.js Runtime erzwingen (nicht Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    logger.apiCall('/api/moon-calendar/tracking', 'POST');

    const body = await request.json();
    const { user_id, date, moon_phase, mood, energy, notes, rituals_completed } = body;

    // Validierung
    if (!user_id || !date || !moon_phase) {
      return NextResponse.json(
        { error: 'user_id, date und moon_phase sind erforderlich' },
        { status: 400 }
      );
    }

    // Moon Tracking in Supabase speichern
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('moon_tracking')
      .insert({
        user_id,
        date,
        moon_phase,
        mood: mood || null,
        energy: energy || null,
        notes: notes || null,
        rituals_completed: rituals_completed || []
      })
      .select()
      .single();

    if (error) {
      logger.error('Fehler beim Speichern des Moon Trackings:', error);
      return NextResponse.json(
        { error: 'Fehler beim Speichern des Moon Trackings' },
        { status: 500 }
      );
    }

    logger.info('Moon Tracking erfolgreich gespeichert', { 
      user_id, 
      date, 
      moon_phase 
    });

    return NextResponse.json({
      success: true,
      tracking: data
    });

  } catch (error) {
    logger.error('Failed to save moon tracking', error);
    return NextResponse.json(
      { error: 'Failed to save moon tracking' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    logger.apiCall('/api/moon-calendar/tracking', 'GET');

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = searchParams.get('limit');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id ist erforderlich' },
        { status: 400 }
      );
    }

    // Moon Tracking aus Supabase laden
    const supabase = await createClient();
    let query = supabase
      .from('moon_tracking')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Fehler beim Laden des Moon Trackings:', error);
      return NextResponse.json(
        { error: 'Fehler beim Laden des Moon Trackings' },
        { status: 500 }
      );
    }

    logger.info('Moon Tracking erfolgreich geladen', { 
      user_id: userId, 
      count: data?.length || 0 
    });

    return NextResponse.json({
      success: true,
      tracking: data || []
    });

  } catch (error) {
    logger.error('Failed to fetch moon tracking', error);
    return NextResponse.json(
      { error: 'Failed to fetch moon tracking' },
      { status: 500 }
    );
  }
}
