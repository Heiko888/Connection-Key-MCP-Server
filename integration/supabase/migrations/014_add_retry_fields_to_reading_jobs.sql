-- Migration: Add Retry Fields, Error Codes, and started_at to reading_jobs
-- Created: 2025-01-03
-- Description: Fügt Retry-Felder, Error-Codes und started_at zur reading_jobs Tabelle hinzu
-- 
-- Requirements:
-- - Additive changes only (no breaking changes)
-- - All existing rows remain valid
-- - Supports deterministic timeout detection via started_at
-- - Explicit error classification via error_code
-- - Retry tracking via retry_count/max_retries

-- ============================================
-- Add Columns (Additive, Safe)
-- ============================================
-- started_at: Set when status transitions to 'generating', used exclusively for timeout detection
ALTER TABLE reading_jobs
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;

-- retry_count: Track number of retry attempts (NOT NULL with default for existing rows)
ALTER TABLE reading_jobs
  ADD COLUMN IF NOT EXISTS retry_count INTEGER;

-- Set default for existing rows (if column was just added)
UPDATE reading_jobs
SET retry_count = 0
WHERE retry_count IS NULL;

-- Make NOT NULL after setting defaults
ALTER TABLE reading_jobs
  ALTER COLUMN retry_count SET DEFAULT 0,
  ALTER COLUMN retry_count SET NOT NULL;

-- max_retries: Maximum allowed retries (NOT NULL with default)
ALTER TABLE reading_jobs
  ADD COLUMN IF NOT EXISTS max_retries INTEGER;

-- Set default for existing rows
UPDATE reading_jobs
SET max_retries = 3
WHERE max_retries IS NULL;

-- Make NOT NULL after setting defaults
ALTER TABLE reading_jobs
  ALTER COLUMN max_retries SET DEFAULT 3,
  ALTER COLUMN max_retries SET NOT NULL;

-- last_retry_at: Timestamp of last retry attempt (nullable)
ALTER TABLE reading_jobs
  ADD COLUMN IF NOT EXISTS last_retry_at TIMESTAMP WITH TIME ZONE;

-- retry_reason: Optional reason for retry (nullable)
ALTER TABLE reading_jobs
  ADD COLUMN IF NOT EXISTS retry_reason TEXT;

-- error_code: Explicit error classification (nullable)
ALTER TABLE reading_jobs
  ADD COLUMN IF NOT EXISTS error_code VARCHAR(50);

-- error_meta: Additional error metadata (nullable JSONB)
ALTER TABLE reading_jobs
  ADD COLUMN IF NOT EXISTS error_meta JSONB;

-- ============================================
-- Constraints
-- ============================================
-- Constraint: retry_count >= 0
ALTER TABLE reading_jobs
  DROP CONSTRAINT IF EXISTS reading_jobs_retry_count_check;

ALTER TABLE reading_jobs
  ADD CONSTRAINT reading_jobs_retry_count_check 
  CHECK (retry_count >= 0);

-- Constraint: max_retries >= 0
ALTER TABLE reading_jobs
  DROP CONSTRAINT IF EXISTS reading_jobs_max_retries_check;

ALTER TABLE reading_jobs
  ADD CONSTRAINT reading_jobs_max_retries_check 
  CHECK (max_retries >= 0);

-- ============================================
-- Status Constraint Update (Additive)
-- ============================================
-- Extend status constraint to include 'generating' and 'timeout'
-- Preserve existing statuses: 'pending', 'processing', 'completed', 'failed', 'cancelled'
-- Add new statuses: 'generating', 'done', 'timeout'
-- Note: 'cancelled' remains for backward compatibility but is not used in Phase 1
ALTER TABLE reading_jobs
  DROP CONSTRAINT IF EXISTS reading_jobs_status_check;

ALTER TABLE reading_jobs
  ADD CONSTRAINT reading_jobs_status_check 
  CHECK (status IN (
    'pending',      -- Initial state
    'processing',   -- Legacy/alternative to 'generating'
    'generating',   -- Active generation (new)
    'completed',    -- Legacy success state
    'done',         -- Success state (new)
    'failed',       -- Error state
    'timeout',      -- Timeout state (new)
    'cancelled'     -- Cancelled state (backward compatibility, Phase 2)
  ));

-- ============================================
-- Indexes (Justified by Query Patterns)
-- ============================================
-- Index 1: Timeout detection query (critical for RPC function)
-- Query: WHERE status = 'generating' AND started_at < now() - INTERVAL '120 seconds'
CREATE INDEX IF NOT EXISTS idx_reading_jobs_timeout_detection 
  ON reading_jobs(status, started_at) 
  WHERE status = 'generating' AND started_at IS NOT NULL;

-- Index 2: Retry-eligible jobs query
-- Query: WHERE status IN ('failed', 'timeout') AND retry_count < max_retries
CREATE INDEX IF NOT EXISTS idx_reading_jobs_retry_eligible 
  ON reading_jobs(status, retry_count, max_retries) 
  WHERE status IN ('failed', 'timeout');

-- Index 3: Error code queries (for retry eligibility checks)
-- Query: WHERE error_code IN ('TIMEOUT', 'NETWORK_ERROR', ...)
CREATE INDEX IF NOT EXISTS idx_reading_jobs_error_code 
  ON reading_jobs(error_code) 
  WHERE error_code IS NOT NULL;

-- ============================================
-- Kommentare
-- ============================================
COMMENT ON COLUMN reading_jobs.started_at IS 'Zeitpunkt, zu dem die Generierung gestartet wurde (für deterministische Timeout-Erkennung)';
COMMENT ON COLUMN reading_jobs.retry_count IS 'Anzahl der durchgeführten Retries';
COMMENT ON COLUMN reading_jobs.max_retries IS 'Maximale Anzahl erlaubter Retries';
COMMENT ON COLUMN reading_jobs.last_retry_at IS 'Zeitpunkt des letzten Retry-Versuchs';
COMMENT ON COLUMN reading_jobs.retry_reason IS 'Grund für den Retry (z.B. "User requested retry", "Automatic retry")';
COMMENT ON COLUMN reading_jobs.error_code IS 'Expliziter Error-Code (z.B. TIMEOUT, VALIDATION_ERROR, NETWORK_ERROR)';
COMMENT ON COLUMN reading_jobs.error_meta IS 'Zusätzliche Fehler-Metadaten (JSONB)';
