/**
 * ============================================================================
 * LEGACY API - ADAPTER auf V2 System
 * ============================================================================
 * 
 * /api/readings - READ-ONLY Forwarder
 * 
 * POST: DEAKTIVIERT (410 Gone) → Migration: /api/coach/readings-v2/create
 * GET:  AKTIV als Forwarder zu V2 System (coach_readings)
 * 
 * REGELN:
 * - Keine Business-Logik in diesem Adapter
 * - Nur Format-Transformation (Legacy → V2 Format)
 * - Einheitliche readingId = coach_readings.id
 * 
 * Siehe: API-LEITPLANKE-READING.md
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCoachReadings } from '@/lib/db/coach-readings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * ============================================================================
 * LEGACY ENDPOINT - DEAKTIVIERT (410 Gone)
 * ============================================================================
 * 
 * POST /api/readings
 * 
 * Dieser Legacy-Endpunkt wurde entfernt.
 * Migration: POST /api/coach/readings-v2/create
 * 
 * Siehe: API-LEITPLANKE-READING.md
 * ============================================================================
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'LEGACY_ENDPOINT_REMOVED',
      message: 'Dieser Legacy-Endpunkt wurde entfernt.',
      removedAt: '2024-01-XX',
      migrationPath: '/api/coach/readings-v2/create',
      migrationGuide: {
        oldEndpoint: 'POST /api/readings',
        newEndpoint: 'POST /api/coach/readings-v2/create',
        changes: [
          'Reading wird in Datenbank gespeichert',
          'Asynchrone Generierung über reading_jobs',
          'Versions-Management verfügbar'
        ]
      },
      documentation: '/api/coach/readings-v2'
    },
    { 
      status: 410, // Gone
      headers: {
        'X-Legacy-Endpoint': 'true',
        'X-Migration-Path': '/api/coach/readings-v2/create'
      }
    }
  );
}

/**
 * GET /api/readings - Listet Readings auf (Forwarder auf V2)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Prüfen ob Benutzer authentifiziert ist
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Bestimme user_id (coach_id im V2 System)
    let finalUserId: string;
    
    if (user?.id) {
      finalUserId = user.id;
    } else if (userId && userId !== 'anonymous') {
      finalUserId = userId;
    } else {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Lade Readings aus V2 System
    const readings = await getCoachReadings(finalUserId, {
      sortBy: 'created_at',
      order: 'desc',
    });

    // Response: Legacy-kompatibles Format
    const legacyReadings = readings.map((r) => ({
      id: r.id, // Einheitliche readingId = coach_readings.id
      user_id: r.coach_id,
      reading_type: r.reading_type,
      reading_data: r.reading_data,
      client_name: r.client_name,
      created_at: r.created_at,
      // Legacy-kompatibles Format
      title: r.client_name,
      question: r.reading_data?.question || r.reading_data?.input?.question || '',
      category: r.reading_data?.category || r.reading_data?.input?.category || '',
    }));

    return NextResponse.json(legacyReadings);
  } catch (error: any) {
    console.error('[api/readings] Server-Fehler:', error);
    return NextResponse.json(
      { error: error?.message || 'Interner Server-Fehler' },
      { status: 500 }
    );
  }
}
