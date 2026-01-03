-- Migration: Create Timeout Handler RPC
-- Created: 2025-01-03
-- Description: Erstellt RPC-Funktion zum Erkennen und Markieren von Timeout-Jobs
-- 
-- Requirements:
-- - SECURITY DEFINER (runs as postgres, bypasses RLS)
-- - Idempotent (safe to run repeatedly)
-- - Uses started_at for deterministic timeout detection
-- - Sets explicit error_code and error_meta
-- - Returns count and array of affected job IDs

-- ============================================
-- Function: check_reading_timeouts
-- ============================================
CREATE OR REPLACE FUNCTION check_reading_timeouts()
RETURNS TABLE (
  updated_count INTEGER,
  updated_jobs UUID[]
) 
LANGUAGE plpgsql
SECURITY DEFINER  -- Runs as postgres (bypasses RLS for system operations)
STABLE            -- Function does not modify database state (only updates rows)
AS $$
DECLARE
  timeout_threshold INTERVAL := INTERVAL '120 seconds';
  updated_jobs_array UUID[] := ARRAY[]::UUID[];
  job_record RECORD;
  affected_id UUID;
BEGIN
  -- Find all jobs in 'generating' status that have exceeded timeout threshold
  -- Uses started_at for deterministic timeout detection (not updated_at or created_at)
  FOR job_record IN
    SELECT 
      id, 
      started_at, 
      retry_count, 
      max_retries
    FROM reading_jobs
    WHERE status = 'generating'
      AND started_at IS NOT NULL
      AND started_at < timezone('utc', now()) - timeout_threshold
    FOR UPDATE SKIP LOCKED  -- Prevents concurrent execution conflicts
  LOOP
    -- Determine new status based on retry eligibility
    IF job_record.retry_count < job_record.max_retries THEN
      -- Retry available: set to 'timeout' status
      UPDATE reading_jobs
      SET 
        status = 'timeout',
        error = 'Reading generation timeout after 120 seconds',
        error_code = 'TIMEOUT',
        error_meta = jsonb_build_object(
          'threshold_seconds', 120,
          'started_at', job_record.started_at,
          'detected_at', timezone('utc', now())
        ),
        updated_at = timezone('utc', now())
      WHERE id = job_record.id
      RETURNING id INTO affected_id;
    ELSE
      -- Max retries exceeded: set to 'failed' status
      UPDATE reading_jobs
      SET 
        status = 'failed',
        error = 'Reading generation timeout after 120 seconds (max retries exceeded)',
        error_code = 'TIMEOUT_MAX_RETRIES',
        error_meta = jsonb_build_object(
          'threshold_seconds', 120,
          'started_at', job_record.started_at,
          'retry_count', job_record.retry_count,
          'max_retries', job_record.max_retries,
          'detected_at', timezone('utc', now())
        ),
        updated_at = timezone('utc', now())
      WHERE id = job_record.id
      RETURNING id INTO affected_id;
    END IF;
    
    -- Add affected job ID to result array
    IF affected_id IS NOT NULL THEN
      updated_jobs_array := array_append(updated_jobs_array, affected_id);
    END IF;
  END LOOP;
  
  -- Return result
  RETURN QUERY SELECT 
    COALESCE(array_length(updated_jobs_array, 1), 0)::INTEGER AS updated_count,
    updated_jobs_array AS updated_jobs;
END;
$$;

-- Function comment
COMMENT ON FUNCTION check_reading_timeouts() IS 
  'Detects and marks reading jobs that have exceeded the 120-second timeout threshold. '
  'Uses started_at for deterministic timeout detection. '
  'Runs as SECURITY DEFINER (bypasses RLS). '
  'Idempotent: safe to run repeatedly. '
  'Returns count and array of affected job IDs.';

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION check_reading_timeouts() TO authenticated;
GRANT EXECUTE ON FUNCTION check_reading_timeouts() TO service_role;
