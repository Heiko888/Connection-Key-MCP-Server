/**
 * ============================================================================
 * LEGACY ENDPOINT - DEAKTIVIERT (410 Gone)
 * ============================================================================
 * 
 * GET /api/reading/templates
 * 
 * Dieser Legacy-Endpunkt wurde entfernt (Mock-Daten).
 * Migration: Templates werden zukünftig über Datenbank-Tabelle reading_templates verwaltet
 * 
 * Siehe: API-LEITPLANKE-READING.md
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'LEGACY_ENDPOINT_REMOVED',
      message: 'Dieser Legacy-Endpunkt wurde entfernt.',
      removedAt: '2024-01-XX',
      migrationPath: '/api/coach/readings-v2/create',
      migrationGuide: {
        oldEndpoint: 'GET /api/reading/templates',
        newEndpoint: 'POST /api/coach/readings-v2/create',
        note: 'Templates werden zukünftig über Datenbank-Tabelle reading_templates verwaltet'
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
