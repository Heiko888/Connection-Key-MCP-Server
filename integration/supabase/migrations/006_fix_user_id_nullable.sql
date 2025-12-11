-- Migration: Fix user_id to be nullable
-- Created: 2025-12-14
-- Description: Macht user_id Spalte optional (NULL erlaubt) für anonyme Readings

-- Prüfe ob user_id Spalte existiert und ändere sie zu nullable
DO $$
BEGIN
  -- Prüfe ob user_id Spalte existiert
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'readings' AND column_name = 'user_id'
  ) THEN
    -- Entferne NOT NULL Constraint falls vorhanden
    ALTER TABLE readings ALTER COLUMN user_id DROP NOT NULL;
    
    RAISE NOTICE 'user_id Spalte ist jetzt optional (NULL erlaubt)';
  ELSE
    RAISE NOTICE 'user_id Spalte existiert nicht';
  END IF;
END $$;

-- Kommentar aktualisieren
COMMENT ON COLUMN readings.user_id IS 'User-ID (optional für anonyme Readings)';

