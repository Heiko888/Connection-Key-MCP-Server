-- Migration: Add Chart References to Readings
-- Created: 2025-01-03
-- Description: Fügt chart_id, chart_version, chart_input_hash zur readings Tabelle hinzu
--
-- Readings referenzieren jetzt chart_id statt Chart-JSON einzubetten
-- Backward Compatibility: Bestehende Readings bleiben unverändert (chart_id = null)

-- ============================================
-- Add Columns to readings Table
-- ============================================
-- chart_id: Foreign Key zu public_core.charts.id
ALTER TABLE readings
  ADD COLUMN IF NOT EXISTS chart_id UUID;

-- chart_version: Chart-Version (für Referenz ohne JOIN)
ALTER TABLE readings
  ADD COLUMN IF NOT EXISTS chart_version TEXT;

-- chart_input_hash: Input-Hash (für Referenz ohne JOIN)
ALTER TABLE readings
  ADD COLUMN IF NOT EXISTS chart_input_hash TEXT;

-- ============================================
-- Foreign Key Constraint
-- ============================================
-- Foreign Key: chart_id → public_core.charts.id
-- Optional (nullable) für Backward Compatibility
ALTER TABLE readings
  DROP CONSTRAINT IF EXISTS fk_readings_chart_id;

ALTER TABLE readings
  ADD CONSTRAINT fk_readings_chart_id
  FOREIGN KEY (chart_id)
  REFERENCES public_core.charts(id)
  ON DELETE SET NULL;

-- ============================================
-- Indizes
-- ============================================
-- Index: chart_id (für JOINs)
CREATE INDEX IF NOT EXISTS idx_readings_chart_id 
  ON readings(chart_id)
  WHERE chart_id IS NOT NULL;

-- Index: chart_version (für Queries nach Version)
CREATE INDEX IF NOT EXISTS idx_readings_chart_version 
  ON readings(chart_version)
  WHERE chart_version IS NOT NULL;

-- Index: chart_input_hash (für Queries nach Input-Hash)
CREATE INDEX IF NOT EXISTS idx_readings_chart_input_hash 
  ON readings(chart_input_hash)
  WHERE chart_input_hash IS NOT NULL;

-- ============================================
-- Kommentare
-- ============================================
COMMENT ON COLUMN readings.chart_id IS 
  'Foreign Key zu public_core.charts.id. NULL für legacy Readings.';

COMMENT ON COLUMN readings.chart_version IS 
  'Chart-Version (für Referenz ohne JOIN). NULL für legacy Readings.';

COMMENT ON COLUMN readings.chart_input_hash IS 
  'Input-Hash (SHA256) für Referenz ohne JOIN. NULL für legacy Readings.';

-- ============================================
-- Backward Compatibility
-- ============================================
-- Bestehende Readings bleiben unverändert
-- chart_id, chart_version, chart_input_hash bleiben NULL
-- chart_data JSONB bleibt erhalten (legacy)

-- Optional: Setze chart_version = 'legacy' für bestehende Readings
-- (nur wenn System es verlangt, hier nicht automatisch)
-- UPDATE readings SET chart_version = 'legacy' WHERE chart_id IS NULL;
