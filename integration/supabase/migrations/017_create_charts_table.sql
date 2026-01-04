-- Migration: Create Charts Table
-- Created: 2025-01-03
-- Description: Erstellt immutable Charts-Tabelle in public_core Schema
--
-- Charts werden als immutable entities gespeichert
-- Dedupe über (input_hash, chart_version) → gleicher Input + Version = gleiche chart_id

-- ============================================
-- Schema: public_core
-- ============================================
CREATE SCHEMA IF NOT EXISTS public_core;

-- ============================================
-- Tabelle: public_core.charts
-- ============================================
-- Immutable Chart-Entities
-- Chart wird nie überschrieben
-- Re-Calculation bei gleichem Input: identische Chart wiederverwenden (dedupe)
CREATE TABLE IF NOT EXISTS public_core.charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Chart-Version (Truth Contract Version)
  chart_version TEXT NOT NULL,
  
  -- Input-Hash (SHA256) für Dedupe
  input_hash TEXT NOT NULL,
  
  -- Original Input (JSONB)
  input JSONB NOT NULL,
  
  -- Chart-Daten (vollständiger Truth-Contract ohne calculated_at)
  -- Enthält: core, centers, channels, gates
  chart JSONB NOT NULL,
  
  -- Timestamps
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now()),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc', now())
);

-- ============================================
-- Constraints / Indizes
-- ============================================
-- Unique Constraint: Dedupe über (input_hash, chart_version)
-- Gleicher Input + gleiche Version → gleiche chart_id
-- WICHTIG: Unique Constraint (nicht nur Index) für Upsert onConflict
ALTER TABLE public_core.charts
  ADD CONSTRAINT charts_input_hash_version_unique 
  UNIQUE (input_hash, chart_version);

-- Index: created_at desc (für Queries nach neuesten Charts)
CREATE INDEX IF NOT EXISTS idx_charts_created_at 
  ON public_core.charts(created_at DESC);

-- Index: chart_version (für Queries nach Version)
CREATE INDEX IF NOT EXISTS idx_charts_chart_version 
  ON public_core.charts(chart_version);

-- ============================================
-- Kommentare
-- ============================================
COMMENT ON TABLE public_core.charts IS 
  'Immutable Chart-Entities. Charts werden nie überschrieben. Dedupe über (input_hash, chart_version).';

COMMENT ON COLUMN public_core.charts.id IS 'Primary Key (UUID)';
COMMENT ON COLUMN public_core.charts.chart_version IS 'Chart-Version (Truth Contract Version, z.B. 1.0.0)';
COMMENT ON COLUMN public_core.charts.input_hash IS 'SHA256 Hash des Inputs (für Dedupe)';
COMMENT ON COLUMN public_core.charts.input IS 'Original Input (birth_date, birth_time, latitude, longitude, timezone)';
COMMENT ON COLUMN public_core.charts.chart IS 'Chart-Daten (vollständiger Truth-Contract ohne calculated_at: core, centers, channels, gates)';
COMMENT ON COLUMN public_core.charts.calculated_at IS 'Zeitpunkt der Berechnung';
COMMENT ON COLUMN public_core.charts.created_at IS 'Zeitpunkt der Erstellung in DB';

-- ============================================
-- RLS (Row Level Security)
-- ============================================
-- Für jetzt: service role only schreiben, read ggf. via server routes
-- Minimal konservativ: Keine RLS Policies (service role hat Zugriff)
ALTER TABLE public_core.charts ENABLE ROW LEVEL SECURITY;

-- Policy: Service Role kann alles
CREATE POLICY "Service role can do everything" ON public_core.charts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users können lesen (optional, falls nötig)
CREATE POLICY "Authenticated users can read" ON public_core.charts
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- GRANTs
-- ============================================
-- Service Role kann alles
GRANT ALL ON public_core.charts TO service_role;

-- Authenticated users können lesen
GRANT SELECT ON public_core.charts TO authenticated;

-- Anon kann lesen (falls nötig, RLS greift)
GRANT SELECT ON public_core.charts TO anon;
