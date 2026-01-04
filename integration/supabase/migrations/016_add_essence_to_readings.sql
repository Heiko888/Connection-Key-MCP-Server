-- Migration: Add Essence Column to readings Table
-- Created: 2025-01-03
-- Description: Fügt Essence-Spalte zur readings Tabelle hinzu
-- 
-- Essence ist eine verdichtete, energetische Kernbeschreibung des Readings
-- Wird vom Reading Agent generiert, aber separat gespeichert
--
-- WICHTIG: Diese Migration setzt voraus, dass die readings Tabelle existiert!
-- Falls die Tabelle nicht existiert, führe zuerst 001_create_readings_tables.sql aus.

-- ============================================
-- Prüfe ob readings Tabelle existiert
-- ============================================
DO $$
BEGIN
  -- Prüfe ob Tabelle existiert
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'readings'
  ) THEN
    RAISE EXCEPTION 'Tabelle "readings" existiert nicht. Bitte führe zuerst 001_create_readings_tables.sql aus.';
  END IF;
END $$;

-- ============================================
-- Add Essence Column
-- ============================================
ALTER TABLE readings
  ADD COLUMN IF NOT EXISTS essence TEXT;

-- ============================================
-- Kommentar
-- ============================================
COMMENT ON COLUMN readings.essence IS 
  'Essence: Energetischer Kern, innere Bewegung und zentrales Thema der aktuellen Phase. '
  'Wird vom Reading Agent generiert. 150-250 Wörter. Keine Zusammenfassung, kein Coaching, kein Rat.';

-- ============================================
-- Index (optional, für Suche nach Readings mit Essence)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_readings_essence 
  ON readings(essence) 
  WHERE essence IS NOT NULL;

-- ============================================
-- Update Views (Essence hinzufügen)
-- ============================================
-- v_readings View aktualisieren (nur wenn View existiert)
DO $$
BEGIN
  -- Prüfe ob View existiert
  IF EXISTS (
    SELECT 1 FROM information_schema.views 
    WHERE table_schema = 'public' AND table_name = 'v_readings'
  ) THEN
    -- View aktualisieren mit Essence
    EXECUTE '
    CREATE OR REPLACE VIEW public.v_readings
    AS
    SELECT
      id,
      user_id,
      reading_type,
      birth_date,
      birth_time,
      birth_place,
      birth_date2,
      birth_time2,
      birth_place2,
      reading_text,
      reading_sections,
      chart_data,
      essence,
      metadata,
      status,
      created_at,
      updated_at
    FROM readings;
    
    ALTER VIEW public.v_readings SET (security_invoker = true);
    
    COMMENT ON VIEW public.v_readings IS 
      ''API-Layer für readings Tabelle - RLS aktiv. Enthält Essence-Feld.'';
    ';
    RAISE NOTICE 'v_readings View aktualisiert (Essence hinzugefügt)';
  ELSE
    RAISE NOTICE 'v_readings View existiert nicht - wird übersprungen';
  END IF;
END $$;
