-- Migration: Add Agent Metadata to Readings (C2)
-- Created: 2025-01-03
-- Description: Fügt Agent-Metadaten zur readings Tabelle hinzu
--
-- C2 Multi-Agent-Strategie: Readings werden von spezialisierten Agents erzeugt
-- Metadaten für vollständige Reproduzierbarkeit

-- ============================================
-- Add Columns to readings Table
-- ============================================
-- agent_id: Welcher Agent hat das Reading erzeugt
ALTER TABLE readings
  ADD COLUMN IF NOT EXISTS agent_id VARCHAR(50);

-- agent_version: Agent-Version (optional, für Reproduzierbarkeit)
ALTER TABLE readings
  ADD COLUMN IF NOT EXISTS agent_version TEXT;

-- prompt_hash: Hash des System-Prompts (optional, für Reproduzierbarkeit)
ALTER TABLE readings
  ADD COLUMN IF NOT EXISTS prompt_hash TEXT;

-- ============================================
-- Constraints
-- ============================================
-- Constraint: agent_id muss gültiger Agent sein
ALTER TABLE readings
  DROP CONSTRAINT IF EXISTS readings_agent_id_check;

ALTER TABLE readings
  ADD CONSTRAINT readings_agent_id_check
  CHECK (agent_id IS NULL OR agent_id IN ('business', 'relationship', 'crisis', 'personality'));

-- ============================================
-- Indizes
-- ============================================
-- Index: agent_id (für Queries nach Agent)
CREATE INDEX IF NOT EXISTS idx_readings_agent_id 
  ON readings(agent_id)
  WHERE agent_id IS NOT NULL;

-- Index: chart_id + agent_id (für Multi-Agent-Queries)
CREATE INDEX IF NOT EXISTS idx_readings_chart_agent 
  ON readings(chart_id, agent_id)
  WHERE chart_id IS NOT NULL AND agent_id IS NOT NULL;

-- ============================================
-- Kommentare
-- ============================================
COMMENT ON COLUMN readings.agent_id IS 
  'Agent-ID, der das Reading erzeugt hat (business, relationship, crisis, personality). NULL für legacy Readings.';

COMMENT ON COLUMN readings.agent_version IS 
  'Agent-Version (für Reproduzierbarkeit). NULL für legacy Readings.';

COMMENT ON COLUMN readings.prompt_hash IS 
  'Hash des System-Prompts (SHA256, optional, für Reproduzierbarkeit). NULL für legacy Readings.';

-- ============================================
-- Backward Compatibility
-- ============================================
-- Bestehende Readings bleiben unverändert
-- agent_id, agent_version, prompt_hash bleiben NULL
