-- Migration: Fix reading_data column issue
-- Created: 2025-12-14
-- Description: Entfernt oder macht reading_data Spalte optional

-- Prüfe ob reading_data Spalte existiert
DO $$
BEGIN
  -- Prüfe ob reading_data Spalte existiert
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'readings' AND column_name = 'reading_data'
  ) THEN
    -- Option 1: Spalte löschen (falls nicht benötigt)
    -- ALTER TABLE readings DROP COLUMN reading_data;
    
    -- Option 2: Spalte optional machen (falls benötigt)
    ALTER TABLE readings ALTER COLUMN reading_data DROP NOT NULL;
    ALTER TABLE readings ALTER COLUMN reading_data SET DEFAULT NULL;
    
    RAISE NOTICE 'reading_data Spalte wurde optional gemacht';
  ELSE
    RAISE NOTICE 'reading_data Spalte existiert nicht - kein Problem';
  END IF;
END $$;

