/**
 * ============================================================================
 * LEGACY ENDPOINT - DEAKTIVIERT (410 Gone)
 * ============================================================================
 * 
 * POST /api/reading/generate
 * 
 * Dieser Legacy-Endpunkt wurde entfernt.
 * Migration: POST /api/coach/readings-v2/create
 * 
 * Siehe: API-LEITPLANKE-READING.md
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'LEGACY_ENDPOINT_REMOVED',
      message: 'Dieser Legacy-Endpunkt wurde entfernt.',
      removedAt: '2024-01-XX',
      migrationPath: '/api/coach/readings-v2/create',
      migrationGuide: {
        oldEndpoint: 'POST /api/reading/generate',
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
