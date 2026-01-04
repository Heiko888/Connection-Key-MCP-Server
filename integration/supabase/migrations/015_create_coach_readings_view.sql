-- Migration: Create coach_readings View
-- Created: 2025-01-03
-- Description: Erstellt View als Aggregat aus reading_jobs und reading_versions
-- 
-- Zweck:
-- - Kompatibilitäts-Layer für Legacy-Code, der coach_readings erwartet
-- - Read-Model / Aggregat ohne Business-Logik
-- - Joint reading_jobs (Write-Model) mit reading_versions (Content/Versioning)
--
-- Annahmen:
-- - reading_versions.reading_id = reading_jobs.id (Foreign Key)
-- - reading_versions.is_active = true für aktive Version
-- - Falls reading_versions nicht existiert, wird nur reading_jobs verwendet

-- ============================================
-- View: coach_readings
-- ============================================
-- Aggregat-View, die reading_jobs und reading_versions joint
-- Fallback: Falls reading_versions nicht existiert, nur reading_jobs
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
  WHERE reading_id = rj.id
    AND is_active = true
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
  'Dient als Kompatibilitäts-Layer für Legacy-Code. Nur Read-Operationen.';

-- ============================================
-- GRANTs
-- ============================================
-- Authenticated users können lesen (RLS greift)
GRANT SELECT ON public.coach_readings TO authenticated;

-- Service Role kann alles (für System-Operationen)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.coach_readings TO service_role;

-- Anon kann lesen (falls nötig, RLS greift)
GRANT SELECT ON public.coach_readings TO anon;
