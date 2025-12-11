-- Migration: Fix client_name column
-- Created: 2025-12-14
-- Description: Macht client_name Spalte optional (falls NOT NULL)

-- Prüfe ob client_name Spalte existiert und mache sie optional
DO $$
BEGIN
  -- Prüfe ob client_name Spalte existiert
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'readings' AND column_name = 'client_name'
  ) THEN
    -- Prüfe ob NOT NULL
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'readings' 
      AND column_name = 'client_name' 
      AND is_nullable = 'NO'
    ) THEN
      -- Entferne NOT NULL Constraint
      ALTER TABLE readings ALTER COLUMN client_name DROP NOT NULL;
      RAISE NOTICE 'client_name Spalte ist jetzt optional (NULL erlaubt)';
    ELSE
      RAISE NOTICE 'client_name Spalte ist bereits optional';
    END IF;
  ELSE
    RAISE NOTICE 'client_name Spalte existiert nicht';
  END IF;
END $$;

