-- Migration: Create Readings Functions
-- Created: 2025-12-13
-- Description: Erstellt Helper-Funktionen für Readings

-- ============================================
-- Function: Get User Readings
-- ============================================
-- Gibt alle Readings eines Users zurück (mit Pagination)
CREATE OR REPLACE FUNCTION get_user_readings(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_reading_type VARCHAR(50) DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  reading_type VARCHAR(50),
  birth_date DATE,
  birth_time TIME,
  birth_place VARCHAR(255),
  reading_text TEXT,
  reading_sections JSONB,
  chart_data JSONB,
  metadata JSONB,
  status VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.reading_type,
    r.birth_date,
    r.birth_time,
    r.birth_place,
    r.reading_text,
    r.reading_sections,
    r.chart_data,
    r.metadata,
    r.status,
    r.created_at,
    r.updated_at
  FROM readings r
  WHERE 
    (r.user_id = p_user_id OR (r.user_id IS NULL AND p_user_id IS NULL))
    AND (p_reading_type IS NULL OR r.reading_type = p_reading_type)
  ORDER BY r.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Get Reading by ID
-- ============================================
-- Gibt ein spezifisches Reading zurück
CREATE OR REPLACE FUNCTION get_reading_by_id(
  p_reading_id UUID,
  p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  reading_type VARCHAR(50),
  birth_date DATE,
  birth_time TIME,
  birth_place VARCHAR(255),
  birth_date2 DATE,
  birth_time2 TIME,
  birth_place2 VARCHAR(255),
  reading_text TEXT,
  reading_sections JSONB,
  chart_data JSONB,
  metadata JSONB,
  status VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.user_id,
    r.reading_type,
    r.birth_date,
    r.birth_time,
    r.birth_place,
    r.birth_date2,
    r.birth_time2,
    r.birth_place2,
    r.reading_text,
    r.reading_sections,
    r.chart_data,
    r.metadata,
    r.status,
    r.created_at,
    r.updated_at
  FROM readings r
  WHERE 
    r.id = p_reading_id
    AND (p_user_id IS NULL OR r.user_id = p_user_id OR r.user_id IS NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Get Reading Statistics
-- ============================================
-- Gibt Statistiken für einen User zurück
CREATE OR REPLACE FUNCTION get_reading_statistics(
  p_user_id UUID
)
RETURNS TABLE (
  total_readings BIGINT,
  readings_by_type JSONB,
  latest_reading_date TIMESTAMP WITH TIME ZONE,
  total_tokens BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_readings,
    jsonb_object_agg(
      reading_type, 
      count
    ) FILTER (WHERE reading_type IS NOT NULL) as readings_by_type,
    MAX(created_at) as latest_reading_date,
    COALESCE(
      SUM((metadata->>'tokens')::BIGINT), 
      0
    ) as total_tokens
  FROM (
    SELECT 
      reading_type,
      COUNT(*) as count,
      MAX(created_at) as created_at,
      metadata
    FROM readings
    WHERE user_id = p_user_id
    GROUP BY reading_type, metadata
  ) sub;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Track Reading View
-- ============================================
-- Erstellt oder aktualisiert einen History-Eintrag beim Ansehen
CREATE OR REPLACE FUNCTION track_reading_view(
  p_user_id UUID,
  p_reading_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_history_id UUID;
BEGIN
  -- Prüfe ob bereits ein Eintrag existiert
  SELECT id INTO v_history_id
  FROM reading_history
  WHERE user_id = p_user_id AND reading_id = p_reading_id;

  IF v_history_id IS NULL THEN
    -- Neuer Eintrag
    INSERT INTO reading_history (user_id, reading_id, viewed_at)
    VALUES (p_user_id, p_reading_id, timezone('utc', now()))
    RETURNING id INTO v_history_id;
  ELSE
    -- Update viewed_at
    UPDATE reading_history
    SET viewed_at = timezone('utc', now())
    WHERE id = v_history_id;
  END IF;

  RETURN v_history_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Mark Reading as Shared
-- ============================================
-- Markiert ein Reading als geteilt
CREATE OR REPLACE FUNCTION mark_reading_shared(
  p_user_id UUID,
  p_reading_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated BOOLEAN;
BEGIN
  UPDATE reading_history
  SET shared = true
  WHERE user_id = p_user_id AND reading_id = p_reading_id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  -- Falls kein History-Eintrag existiert, erstelle einen
  IF v_updated = 0 THEN
    INSERT INTO reading_history (user_id, reading_id, shared, viewed_at)
    VALUES (p_user_id, p_reading_id, true, timezone('utc', now()));
    v_updated := true;
  END IF;

  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Function: Mark Reading as Exported
-- ============================================
-- Markiert ein Reading als exportiert
CREATE OR REPLACE FUNCTION mark_reading_exported(
  p_user_id UUID,
  p_reading_id UUID,
  p_format VARCHAR(20)
)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated BOOLEAN;
BEGIN
  UPDATE reading_history
  SET 
    exported = true,
    exported_format = p_format,
    exported_at = timezone('utc', now())
  WHERE user_id = p_user_id AND reading_id = p_reading_id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  -- Falls kein History-Eintrag existiert, erstelle einen
  IF v_updated = 0 THEN
    INSERT INTO reading_history (
      user_id, 
      reading_id, 
      exported, 
      exported_format, 
      exported_at,
      viewed_at
    )
    VALUES (
      p_user_id, 
      p_reading_id, 
      true, 
      p_format, 
      timezone('utc', now()),
      timezone('utc', now())
    );
    v_updated := true;
  END IF;

  RETURN v_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Kommentare für Dokumentation
-- ============================================

COMMENT ON FUNCTION get_user_readings IS 'Gibt alle Readings eines Users zurück (mit Pagination)';
COMMENT ON FUNCTION get_reading_by_id IS 'Gibt ein spezifisches Reading zurück';
COMMENT ON FUNCTION get_reading_statistics IS 'Gibt Statistiken für einen User zurück';
COMMENT ON FUNCTION track_reading_view IS 'Erstellt oder aktualisiert einen History-Eintrag beim Ansehen';
COMMENT ON FUNCTION mark_reading_shared IS 'Markiert ein Reading als geteilt';
COMMENT ON FUNCTION mark_reading_exported IS 'Markiert ein Reading als exportiert';

