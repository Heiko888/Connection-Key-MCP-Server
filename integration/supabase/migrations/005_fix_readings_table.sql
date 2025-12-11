-- Migration: Fix readings table - Add missing columns
-- Created: 2025-12-14
-- Description: Fügt fehlende Spalten zur readings Tabelle hinzu

-- Prüfe und füge fehlende Spalten hinzu
DO $$
BEGIN
  -- birth_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'readings' AND column_name = 'birth_date'
  ) THEN
    ALTER TABLE readings ADD COLUMN birth_date DATE NOT NULL DEFAULT '1900-01-01';
    RAISE NOTICE 'birth_date Spalte hinzugefügt';
  END IF;

  -- birth_time
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'readings' AND column_name = 'birth_time'
  ) THEN
    ALTER TABLE readings ADD COLUMN birth_time TIME NOT NULL DEFAULT '00:00:00';
    RAISE NOTICE 'birth_time Spalte hinzugefügt';
  END IF;

  -- birth_place
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'readings' AND column_name = 'birth_place'
  ) THEN
    ALTER TABLE readings ADD COLUMN birth_place VARCHAR(255) NOT NULL DEFAULT '';
    RAISE NOTICE 'birth_place Spalte hinzugefügt';
  END IF;

  -- reading_text
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'readings' AND column_name = 'reading_text'
  ) THEN
    ALTER TABLE readings ADD COLUMN reading_text TEXT NOT NULL DEFAULT '';
    RAISE NOTICE 'reading_text Spalte hinzugefügt';
  END IF;

  -- reading_sections
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'readings' AND column_name = 'reading_sections'
  ) THEN
    ALTER TABLE readings ADD COLUMN reading_sections JSONB;
    RAISE NOTICE 'reading_sections Spalte hinzugefügt';
  END IF;

  -- chart_data
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'readings' AND column_name = 'chart_data'
  ) THEN
    ALTER TABLE readings ADD COLUMN chart_data JSONB;
    RAISE NOTICE 'chart_data Spalte hinzugefügt';
  END IF;

  -- metadata
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'readings' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE readings ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE 'metadata Spalte hinzugefügt';
  END IF;

  -- status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'readings' AND column_name = 'status'
  ) THEN
    ALTER TABLE readings ADD COLUMN status VARCHAR(20) DEFAULT 'pending' 
      CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) 
      NOT NULL;
    RAISE NOTICE 'status Spalte hinzugefügt';
  END IF;

  -- birth_date2 (optional)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'readings' AND column_name = 'birth_date2'
  ) THEN
    ALTER TABLE readings ADD COLUMN birth_date2 DATE;
    RAISE NOTICE 'birth_date2 Spalte hinzugefügt';
  END IF;

  -- birth_time2 (optional)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'readings' AND column_name = 'birth_time2'
  ) THEN
    ALTER TABLE readings ADD COLUMN birth_time2 TIME;
    RAISE NOTICE 'birth_time2 Spalte hinzugefügt';
  END IF;

  -- birth_place2 (optional)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'readings' AND column_name = 'birth_place2'
  ) THEN
    ALTER TABLE readings ADD COLUMN birth_place2 VARCHAR(255);
    RAISE NOTICE 'birth_place2 Spalte hinzugefügt';
  END IF;

  -- created_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'readings' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE readings ADD COLUMN created_at TIMESTAMP WITH TIME ZONE 
      DEFAULT timezone('utc', now()) NOT NULL;
    RAISE NOTICE 'created_at Spalte hinzugefügt';
  END IF;

  -- updated_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'readings' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE readings ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE 
      DEFAULT timezone('utc', now()) NOT NULL;
    RAISE NOTICE 'updated_at Spalte hinzugefügt';
  END IF;

END $$;

-- Entferne Defaults von NOT NULL Spalten (falls Daten vorhanden)
DO $$
BEGIN
  -- Entferne Defaults nach dem Hinzufügen
  ALTER TABLE readings ALTER COLUMN birth_date DROP DEFAULT;
  ALTER TABLE readings ALTER COLUMN birth_time DROP DEFAULT;
  ALTER TABLE readings ALTER COLUMN birth_place DROP DEFAULT;
  ALTER TABLE readings ALTER COLUMN reading_text DROP DEFAULT;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignoriere Fehler wenn Defaults nicht existieren
    NULL;
END $$;

-- Kommentare hinzufügen
COMMENT ON COLUMN readings.birth_date IS 'Geburtsdatum (Person 1)';
COMMENT ON COLUMN readings.birth_time IS 'Geburtszeit (Person 1)';
COMMENT ON COLUMN readings.birth_place IS 'Geburtsort (Person 1)';
COMMENT ON COLUMN readings.reading_text IS 'Vollständiger Reading-Text';
COMMENT ON COLUMN readings.reading_sections IS 'Strukturierte Sections (JSONB)';
COMMENT ON COLUMN readings.chart_data IS 'Chart-Daten (JSONB)';
COMMENT ON COLUMN readings.metadata IS 'Metadaten (tokens, model, etc.)';
COMMENT ON COLUMN readings.status IS 'Status (pending, processing, completed, failed, cancelled)';

