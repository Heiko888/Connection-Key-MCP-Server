import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/utils/logger';

// Runtime-Konfiguration: Node.js Runtime erzwingen (nicht Edge)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const limit = searchParams.get('limit');

    logger.apiCall(`/api/moon-calendar/tracking/${userId}`, 'GET');

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
