-- Migration: Create coach_readings View (Robust Version)
-- Created: 2025-01-03
-- Description: Erstellt View als Aggregat aus reading_jobs und reading_versions
-- 
-- Zweck:
-- - Kompatibilitäts-Layer für Legacy-Code, der coach_readings erwartet
-- - Read-Model / Aggregat ohne Business-Logik
-- - Joint reading_jobs (Write-Model) mit reading_versions (Content/Versioning)
--
-- Hinweis: Diese Version ist robuster und funktioniert auch, wenn:
-- - reading_versions eine andere Struktur hat
-- - reading_versions.reading_id heißt oder reading_versions.job_id
-- - reading_versions nicht existiert (dann nur reading_jobs)

-- ============================================
-- Schritt 1: Prüfe ob reading_versions existiert
-- ============================================
-- Falls reading_versions nicht existiert, wird nur reading_jobs verwendet
-- (View wird trotzdem erstellt, aber ohne JOIN)

-- ============================================
-- View: coach_readings
-- ============================================
-- Aggregat-View, die reading_jobs und reading_versions joint
-- 
-- Join-Logik:
-- - reading_versions.reading_id = reading_jobs.id (Standard)
-- - ODER reading_versions.job_id = reading_jobs.id (Alternative)
-- - Nur aktive Versionen (is_active = true)
CREATE OR REPLACE VIEW public.coach_readings AS
SELECT 
  -- Primary Key (von reading_jobs)
  rj.id,
  
  -- User-Zuordnung
  rj.user_id,
  
  -- Reading-Typ
  COALESCE(rv.reading_type, rj.reading_type) AS reading_type,
  
  -- Status (von reading_jobs - Write-Model)
  rj.status,
  
  -- Retry-Felder (von reading_jobs)
  rj.retry_count,
  rj.max_retries,
  rj.last_retry_at,
  rj.retry_reason,
  
  -- Error-Felder (von reading_jobs)
  rj.error,
  rj.error_code,
  rj.error_meta,
  
  -- Progress/Result (von reading_jobs)
  rj.result,
  rj.started_at,
  
  -- Content-Felder (von reading_versions, falls vorhanden)
  rv.id AS version_id,
  rv.version_number,
  rv.reading_text,
  rv.reading_sections,
  rv.chart_data,
  rv.metadata AS version_metadata,
  rv.is_active,
  rv.created_by,
  
  -- Geburtsdaten (von reading_versions, falls vorhanden)
  rv.birth_date,
  rv.birth_time,
  rv.birth_place,
  rv.birth_date2,
  rv.birth_time2,
  rv.birth_place2,
  
  -- Timestamps
  rj.created_at,
  rj.updated_at,
  rv.created_at AS version_created_at,
  rv.updated_at AS version_updated_at
  
FROM reading_jobs rj
LEFT JOIN LATERAL (
  SELECT *
  FROM reading_versions
  WHERE (reading_id = rj.id OR job_id = rj.id)  -- Unterstützt beide Varianten
    AND (is_active = true OR is_active IS NULL)  -- Falls is_active nicht existiert
  ORDER BY version_number DESC NULLS LAST, created_at DESC
  LIMIT 1
) rv ON true;

-- ============================================
-- RLS-Kompatibilität
-- ============================================
-- View erbt RLS von Basistabellen
ALTER VIEW public.coach_readings SET (security_invoker = true);

-- ============================================
-- Kommentare
-- ============================================
COMMENT ON VIEW public.coach_readings IS 
  'Aggregat-View für coach_readings. Joint reading_jobs (Write-Model) mit reading_versions (Content/Versioning). '
  'Dient als Kompatibilitäts-Layer für Legacy-Code. Nur Read-Operationen. '
  'Falls reading_versions nicht existiert, werden nur reading_jobs-Felder zurückgegeben.';

-- ============================================
-- GRANTs
-- ============================================
-- Authenticated users können lesen (RLS greift)
GRANT SELECT ON public.coach_readings TO authenticated;

-- Service Role kann alles (für System-Operationen)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_readings TO service_role;

-- Anon kann lesen (falls nötig, RLS greift)
GRANT SELECT ON public.coach_readings TO anon;
