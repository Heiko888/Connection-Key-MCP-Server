/**
 * Coach Readings v2 Status API Route (App Router)
 * Route: /api/coach/readings-v2/[id]/status
 * 
 * CORRECTION: Uses /api/coach/readings-v2/* namespace
 * CORRECTION: Uses started_at for deterministic timeout detection
 * CORRECTION: Uses error_code for retry eligibility
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserSupabaseClient, requireUserAuth } from '../../../../lib/supabase-clients';

const READING_GENERATION_TIMEOUT_MS = parseInt(
  process.env.READING_GENERATION_TIMEOUT_MS || '120000',
  10
);

// CORRECTION: Retry-Eligibility basiert auf error_code
function isRetryableErrorCode(errorCode: string | null): boolean {
  if (!errorCode) return false;
  
  const retryableCodes = ['TIMEOUT', 'NETWORK_ERROR', 'AGENT_TIMEOUT', 'RATE_LIMIT'];
  const nonRetryableCodes = ['VALIDATION_ERROR', 'AUTH_ERROR', 'QUOTA_EXCEEDED', 'TIMEOUT_MAX_RETRIES'];
  
  if (nonRetryableCodes.includes(errorCode)) return false;
  return retryableCodes.includes(errorCode);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const readingId = params.id;
    const userJwt = requireUserAuth(request);
    const supabase = getUserSupabaseClient(userJwt);

    // Status abrufen
    const { data: job, error } = await supabase
      .from('v_reading_jobs')
      .select('id, status, started_at, retry_count, max_retries, error_code, error, error_meta, created_at, updated_at')
      .eq('id', readingId)
      .single();

    if (error || !job) {
      return NextResponse.json(
        { success: false, error: 'Reading not found' },
        { status: 404 }
      );
    }

    // CORRECTION: Timeout-Check mit started_at (deterministic)
    if (job.status === 'generating' && job.started_at) {
      const now = new Date();
      const startedAt = new Date(job.started_at);
      const elapsedMs = now.getTime() - startedAt.getTime();

      if (elapsedMs > READING_GENERATION_TIMEOUT_MS) {
        // Timeout erkannt → Update Job
        const newStatus = job.retry_count < job.max_retries ? 'timeout' : 'failed';
        const newErrorCode = job.retry_count < job.max_retries ? 'TIMEOUT' : 'TIMEOUT_MAX_RETRIES';

        const { error: updateError } = await supabase
          .from('v_reading_jobs')
          .update({
            status: newStatus,
            error: `Reading generation timeout after ${Math.round(elapsedMs / 1000)} seconds`,
            error_code: newErrorCode,
            error_meta: {
              timeout_after_seconds: READING_GENERATION_TIMEOUT_MS / 1000,
              started_at: job.started_at,
              detected_at: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', readingId);

        if (!updateError) {
          // Status aktualisieren für Response
          job.status = newStatus;
          job.error_code = newErrorCode;
          job.error = `Reading generation timeout after ${Math.round(elapsedMs / 1000)} seconds`;
        }
      }
    }

    // Response
    return NextResponse.json({
      success: true,
      status: {
        readingId: job.id,
        status: job.status,
        retryAvailable: (job.status === 'timeout' || job.status === 'failed') 
          && job.retry_count < job.max_retries
          && isRetryableErrorCode(job.error_code),
        retryCount: job.retry_count,
        maxRetries: job.max_retries,
        errorCode: job.error_code || null,
        error: job.error || null,
        errorMeta: job.error_meta || null,
        createdAt: job.created_at,
        updatedAt: job.updated_at,
        startedAt: job.started_at || null
      }
    });

  } catch (error: any) {
    console.error('Reading Status API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
