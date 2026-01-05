/**
 * ============================================================================
 * LEGACY ENDPOINT - DEAKTIVIERT (410 Gone)
 * ============================================================================
 * 
 * POST /api/readings/generate
 * 
 * Dieser Legacy-Endpunkt wurde entfernt.
 * Migration: POST /api/coach/readings-v2/[id]/generate
 * 
 * Hinweis: Reading muss zuerst über /api/coach/readings-v2/create erstellt werden.
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
      migrationPath: '/api/coach/readings-v2/[id]/generate',
      migrationGuide: {
        oldEndpoint: 'POST /api/readings/generate',
        newEndpoint: 'POST /api/coach/readings-v2/[id]/generate',
        changes: [
          'Reading muss zuerst über /api/coach/readings-v2/create erstellt werden',
          'Generierung erfolgt auf existierendem Reading',
          'Job-Tracking über reading_jobs'
        ]
      },
      documentation: '/api/coach/readings-v2'
    },
    { 
      status: 410, // Gone
      headers: {
        'X-Legacy-Endpoint': 'true',
        'X-Migration-Path': '/api/coach/readings-v2/[id]/generate'
      }
    }
  );
}
