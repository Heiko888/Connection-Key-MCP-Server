/**
 * Reading Status API Route (App Router)
 * Route: /api/readings/[id]/status
 * 
 * Ruft den Status eines Readings ab (inkl. Status-History)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse } from '../../../../reading-response-types';
import { getUserSupabaseClient, requireUserAuth } from '../../../../lib/supabase-clients';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // User-Authentifizierung: JWT aus Authorization Header extrahieren
    let userJwt: string;
    try {
      userJwt = requireUserAuth(request);
    } catch (authError: any) {
      return NextResponse.json(
        createErrorResponse(
          authError.message || 'Unauthorized - Missing or invalid Authorization header',
          'UNAUTHORIZED'
        ),
        { status: 401 }
      );
    }

    // Supabase Client mit User-JWT (RLS aktiv)
    const supabase = getUserSupabaseClient(userJwt);

    const readingId = params.id;
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId'); // Optional: für zusätzliche Validierung

    if (!readingId) {
      return NextResponse.json(
        createErrorResponse('Reading ID is required', 'MISSING_READING_ID'),
        { status: 400 }
      );
    }

    // Status aus reading_jobs Tabelle lesen via RPC
    // RPC verwendet SECURITY INVOKER → RLS filtert automatisch nach auth.uid() aus JWT
    const { data: jobDataArray, error: jobError } = await supabase
      .rpc('get_reading_job_status', {
        p_reading_id: readingId
      });

    // RPC gibt ein Array zurück, nehmen wir das erste Element
    const jobData = jobDataArray && jobDataArray.length > 0 ? jobDataArray[0] : null;

    if (jobError) {
      console.error('[Reading Status API] Supabase RPC error:', jobError);
      return NextResponse.json(
        createErrorResponse('Failed to fetch reading status', 'DB_FETCH_ERROR', jobError.message),
        { status: 500 }
      );
    }

    if (!jobData) {
      // RLS hat gefiltert → Reading Job existiert nicht oder User hat keinen Zugriff
      return NextResponse.json(
        createErrorResponse('Reading job not found', 'READING_NOT_FOUND'),
        { status: 404 }
      );
    }

    // Response mit Status und optionalem Result
    return NextResponse.json({
      success: true,
      status: {
        readingId: jobData.id,
        status: jobData.status,
        result: jobData.result, // JSONB mit reading, chartData, etc.
        error: jobData.error, // Fehlermeldung falls status='failed'
        createdAt: jobData.created_at,
        updatedAt: jobData.updated_at
      }
    });

  } catch (error: any) {
    console.error('Reading Status API Error:', error);
    return NextResponse.json(
      createErrorResponse(error.message || 'Internal server error', 'INTERNAL_ERROR'),
      { status: 500 }
    );
  }
}

