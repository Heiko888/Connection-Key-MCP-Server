-- ============================================
-- PRÜFUNG: reading_jobs Tabellenstruktur
-- Datum: 2025-12-28
-- ============================================

-- ============================================
-- SCHRITT 1: Prüfe ob Tabelle existiert
-- ============================================
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'reading_jobs';

-- ============================================
-- SCHRITT 2: Detaillierte Spalten-Informationen
-- ============================================
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'reading_jobs'
ORDER BY ordinal_position;

-- ============================================
-- SCHRITT 3: Constraints (Primary Key, Foreign Keys, Checks)
-- ============================================
-- Primary Key
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'reading_jobs'
  AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'CHECK')
ORDER BY tc.constraint_type, kcu.ordinal_position;

-- ============================================
-- SCHRITT 4: Indizes
-- ============================================
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'reading_jobs'
ORDER BY indexname;

-- ============================================
-- SCHRITT 5: Trigger
-- ============================================
SELECT
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'reading_jobs'
ORDER BY trigger_name;

-- ============================================
-- SCHRITT 6: Row Level Security (RLS) Policies
-- ============================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'reading_jobs'
ORDER BY policyname;

-- ============================================
-- SCHRITT 7: Aktuelle Daten-Statistik
-- ============================================
-- Basis-Statistik (nur Spalten die definitiv existieren)
SELECT
  COUNT(*) as total_jobs,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_jobs,
  COUNT(*) FILTER (WHERE status = 'processing') as processing_jobs,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_jobs,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_jobs
FROM reading_jobs;

-- ============================================
-- SCHRITT 8: Vergleich mit erwarteter Struktur
-- ============================================
-- Erwartete Spalten (aus Migration 009):
-- - id (UUID, PRIMARY KEY)
-- - user_id (UUID, nullable, FK zu auth.users)
-- - reading_type (VARCHAR(50), nullable)
-- - status (VARCHAR(20), DEFAULT 'pending', CHECK)
-- - result (JSONB, nullable)
-- - error (TEXT, nullable)
-- - created_at (TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT now())
-- - updated_at (TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT now())

-- Prüfe ob alle erwarteten Spalten vorhanden sind:
WITH expected_columns AS (
  SELECT unnest(ARRAY[
    'id',
    'user_id',
    'reading_type',
    'status',
    'result',
    'error',
    'created_at',
    'updated_at'
  ]) AS column_name
),
actual_columns AS (
  SELECT column_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'reading_jobs'
)
SELECT
  'Fehlende Spalten:' as check_type,
  ec.column_name as missing_column
FROM expected_columns ec
LEFT JOIN actual_columns ac ON ec.column_name = ac.column_name
WHERE ac.column_name IS NULL

UNION ALL

SELECT
  'Zusätzliche Spalten:' as check_type,
  ac.column_name as extra_column
FROM actual_columns ac
LEFT JOIN expected_columns ec ON ac.column_name = ec.column_name
WHERE ec.column_name IS NULL;

-- ============================================
-- SCHRITT 9: Beispiel-Datensatz (falls vorhanden)
-- ============================================
SELECT *
FROM reading_jobs
ORDER BY created_at DESC
LIMIT 1;
