/**
 * Coach Readings v2 Retry API Route (App Router)
 * Route: /api/coach/readings-v2/[id]/retry
 * 
 * CORRECTION: Uses /api/coach/readings-v2/* namespace
 * CORRECTION: Retry-Eligibility basiert auf error_code
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserSupabaseClient, requireUserAuth } from '../../../../../lib/supabase-clients';

// CORRECTION: Retry-Eligibility basiert auf error_code
function isRetryableErrorCode(errorCode: string | null): boolean {
  if (!errorCode) return false;
  
  const retryableCodes = ['TIMEOUT', 'NETWORK_ERROR', 'AGENT_TIMEOUT', 'RATE_LIMIT'];
  const nonRetryableCodes = ['VALIDATION_ERROR', 'AUTH_ERROR', 'QUOTA_EXCEEDED', 'TIMEOUT_MAX_RETRIES'];
  
  if (nonRetryableCodes.includes(errorCode)) return false;
  return retryableCodes.includes(errorCode);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const readingId = params.id;
    const userJwt = requireUserAuth(request);
    const supabase = getUserSupabaseClient(userJwt);

    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    // Job abrufen
    const { data: job, error: fetchError } = await supabase
      .from('v_reading_jobs')
      .select('id, status, retry_count, max_retries, error_code')
      .eq('id', readingId)
      .single();

    if (fetchError || !job) {
      return NextResponse.json(
        { success: false, error: 'Reading not found' },
        { status: 404 }
      );
    }

    // Prüfe ob Retry möglich
    if (job.status !== 'timeout' && job.status !== 'failed') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Retry not available for this status',
          currentStatus: job.status
        },
        { status: 400 }
      );
    }

    if (job.retry_count >= job.max_retries) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Maximum retries exceeded',
          retryCount: job.retry_count,
          maxRetries: job.max_retries
        },
        { status: 400 }
      );
    }

    // CORRECTION: Retry-Eligibility basiert auf error_code
    if (!isRetryableErrorCode(job.error_code)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'This error cannot be retried',
          errorCode: job.error_code
        },
        { status: 400 }
      );
    }

    // Retry durchführen
    const { data: updatedJob, error: updateError } = await supabase
      .from('v_reading_jobs')
      .update({
        status: 'pending',
        retry_count: job.retry_count + 1,
        last_retry_at: new Date().toISOString(),
        retry_reason: reason || 'User requested retry',
        error: null,
        error_code: null,  // Reset error_code
        error_meta: null,  // Reset error_meta
        started_at: null,  // Reset started_at (wird beim nächsten Start gesetzt)
        updated_at: new Date().toISOString()
      })
      .eq('id', readingId)
      .select()
      .single();

    if (updateError) {
      console.error('Retry Update Error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to retry reading' },
        { status: 500 }
      );
    }

    // Job erneut verarbeiten (Trigger n8n Workflow oder API Route)
    // NOTE: Dies muss in der create-Route oder n8n Workflow implementiert werden
    // Für jetzt: Job ist zurück auf 'pending', wird beim nächsten Polling/Trigger verarbeitet

    return NextResponse.json({
      success: true,
      message: 'Reading retry initiated',
      readingId: updatedJob.id,
      status: updatedJob.status,
      retryCount: updatedJob.retry_count,
      maxRetries: updatedJob.max_retries
    });

  } catch (error: any) {
    console.error('Reading Retry API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
