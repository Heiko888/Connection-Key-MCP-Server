-- Migration: Add status column to readings table
-- Created: 2025-12-14
-- Description: Fügt die status Spalte zur readings Tabelle hinzu, falls sie fehlt

-- Prüfe ob Spalte existiert und füge sie hinzu falls nicht
DO $$
BEGIN
  -- Prüfe ob status Spalte existiert
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'readings' 
    AND column_name = 'status'
  ) THEN
    -- Füge status Spalte hinzu
    ALTER TABLE readings 
    ADD COLUMN status VARCHAR(20) DEFAULT 'pending' 
    CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) 
    NOT NULL;
    
    -- Setze Default für bestehende Einträge
    UPDATE readings SET status = 'completed' WHERE status IS NULL;
    
    RAISE NOTICE 'Status Spalte wurde hinzugefügt';
  ELSE
    RAISE NOTICE 'Status Spalte existiert bereits';
  END IF;
END $$;

-- Kommentar hinzufügen
COMMENT ON COLUMN readings.status IS 'Status (pending, processing, completed, failed, cancelled)';

