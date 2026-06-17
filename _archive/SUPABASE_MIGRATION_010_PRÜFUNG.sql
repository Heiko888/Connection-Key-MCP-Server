-- ============================================
-- PRÜFUNG: Migration 010 - Cleanup & Struktur-Korrektur
-- Datum: 2025-12-28
-- ============================================

-- ============================================
-- PRÜFUNG 1: Tabellenstruktur (8 Spalten erwartet)
-- ============================================
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'reading_jobs'
ORDER BY ordinal_position;

-- Erwartet: 8 Spalten
-- - id (UUID)
-- - user_id (UUID)
-- - reading_type (VARCHAR(50)) ← NEU
-- - status (VARCHAR(20))
-- - result (JSONB)
-- - error (TEXT) ← NEU
-- - created_at (TIMESTAMPTZ)
-- - updated_at (TIMESTAMPTZ)

-- ============================================
-- PRÜFUNG 2: Hängende Jobs (sollten 0 sein)
-- ============================================
SELECT 
  COUNT(*) as pending_jobs
FROM reading_jobs
WHERE status = 'pending';

-- Erwartet: 0

-- ============================================
-- PRÜFUNG 3: Failed Jobs (6 Jobs erwartet)
-- ============================================
SELECT 
  id,
  status,
  reading_type,
  error,
  created_at,
  updated_at
FROM reading_jobs
WHERE status = 'failed'
ORDER BY updated_at DESC
LIMIT 10;

-- Erwartet: 6 Jobs mit error = 'Job stuck in pending - cleaned up on 2025-12-28'

-- ============================================
-- PRÜFUNG 4: Gesamt-Statistik
-- ============================================
SELECT
  COUNT(*) as total_jobs,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_jobs,
  COUNT(*) FILTER (WHERE status = 'processing') as processing_jobs,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_jobs,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_jobs,
  COUNT(*) FILTER (WHERE reading_type IS NOT NULL) as jobs_with_type,
  COUNT(*) FILTER (WHERE error IS NOT NULL) as jobs_with_error
FROM reading_jobs;

-- Erwartet:
-- - total_jobs: 6 (oder mehr)
-- - pending_jobs: 0
-- - failed_jobs: 6 (oder mehr)
-- - jobs_with_error: 6 (oder mehr)

-- ============================================
-- PRÜFUNG 5: Prüfe ob reading_id und payload entfernt wurden
-- ============================================
SELECT 
  column_name
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'reading_jobs'
  AND column_name IN ('reading_id', 'payload');

-- Erwartet: 0 Zeilen (Spalten sollten nicht mehr existieren)
