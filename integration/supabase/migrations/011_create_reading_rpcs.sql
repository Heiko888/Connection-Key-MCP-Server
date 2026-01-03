-- Migration: Create Reading RPCs (SECURITY INVOKER)
-- Created: 2025-12-28
-- Description: Erstellt lesende RPC-Funktionen mit RLS-Unterstützung
-- 
-- WICHTIG: SECURITY INVOKER bedeutet, dass RLS greift!
-- Die Funktionen laufen mit den Rechten des aufrufenden Users (nicht postgres)

-- ============================================
-- Function: Get User Readings (History-Liste)
-- ============================================
-- Gibt Readings eines Users zurück (mit Pagination und Filter)
-- Verwendet auth.uid() für RLS (automatische User-Filterung)
CREATE OR REPLACE FUNCTION get_user_readings_list(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_reading_type VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  reading_type VARCHAR(50),
  reading_text TEXT,
  status VARCHAR(20),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE sql
SECURITY INVOKER  -- ← RLS greift!
STABLE
AS $$
  SELECT 
    r.id,
    r.user_id,
    r.reading_type,
    r.reading_text,
    r.status,
    r.metadata,
    r.created_at,
    r.updated_at
  FROM readings r
  WHERE 
    -- RLS filtert automatisch nach auth.uid()
    -- Zusätzliche explizite Prüfung für Sicherheit
    r.user_id = auth.uid()
    AND (p_reading_type IS NULL OR r.reading_type = p_reading_type)
  ORDER BY r.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;

-- ============================================
-- Function: Get User Readings Count
-- ============================================
-- Gibt die Gesamtanzahl der Readings eines Users zurück (für Pagination)
CREATE OR REPLACE FUNCTION get_user_readings_count(
  p_reading_type VARCHAR(50) DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE sql
SECURITY INVOKER  -- ← RLS greift!
STABLE
AS $$
  SELECT COUNT(*)::BIGINT
  FROM readings r
  WHERE 
    -- RLS filtert automatisch nach auth.uid()
    r.user_id = auth.uid()
    AND (p_reading_type IS NULL OR r.reading_type = p_reading_type);
$$;

-- ============================================
-- Function: Get Reading by ID
-- ============================================
-- Gibt ein spezifisches Reading zurück (mit allen benötigten Feldern)
CREATE OR REPLACE FUNCTION get_reading_by_id(
  p_reading_id UUID
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  reading_type VARCHAR(50),
  reading_text TEXT,
  birth_date DATE,
  birth_time TIME,
  birth_place VARCHAR(255),
  birth_date2 DATE,
  birth_time2 TIME,
  birth_place2 VARCHAR(255),
  reading_sections JSONB,
  chart_data JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY INVOKER  -- ← RLS greift!
STABLE
AS $$
  SELECT 
    r.id,
    r.user_id,
    r.reading_type,
    r.reading_text,
    r.birth_date,
    r.birth_time,
    r.birth_place,
    r.birth_date2,
    r.birth_time2,
    r.birth_place2,
    r.reading_sections,
    r.chart_data,
    r.metadata,
    r.created_at
  FROM readings r
  WHERE 
    r.id = p_reading_id
    -- RLS filtert automatisch nach auth.uid()
    AND r.user_id = auth.uid();
$$;

-- ============================================
-- Function: Get Reading Job Status
-- ============================================
-- Gibt den Status eines Reading-Jobs zurück
CREATE OR REPLACE FUNCTION get_reading_job_status(
  p_reading_id UUID
)
RETURNS TABLE (
  id UUID,
  status VARCHAR(20),
  result JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY INVOKER  -- ← RLS greift!
STABLE
AS $$
  SELECT 
    rj.id,
    rj.status,
    rj.result,
    rj.error,
    rj.created_at,
    rj.updated_at
  FROM reading_jobs rj
  WHERE 
    rj.id = p_reading_id
    -- RLS filtert automatisch nach auth.uid()
    AND (rj.user_id = auth.uid() OR rj.user_id IS NULL);
$$;

-- ============================================
-- Kommentare für Dokumentation
-- ============================================

COMMENT ON FUNCTION get_user_readings_list IS 'Gibt Readings eines Users zurück (History-Liste) - RLS aktiv';
COMMENT ON FUNCTION get_user_readings_count IS 'Gibt die Gesamtanzahl der Readings eines Users zurück - RLS aktiv';
COMMENT ON FUNCTION get_reading_by_id IS 'Gibt ein spezifisches Reading zurück - RLS aktiv';
COMMENT ON FUNCTION get_reading_job_status IS 'Gibt den Status eines Reading-Jobs zurück - RLS aktiv';
