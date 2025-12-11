-- Migration: Create Agent Tasks & Responses Tables
-- Created: 2025-12-18
-- Description: Erstellt Tabellen für Agent-Task-Management und Ergebnis-Speicherung

-- Enable UUID extension (falls noch nicht aktiviert)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Tabelle: agent_tasks
-- ============================================
-- Speichert alle Agent-Aufgaben mit Status-Tracking
CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User-Zuordnung (optional)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Agent-Informationen
  agent_id VARCHAR(100) NOT NULL, -- z.B. 'marketing', 'automation', 'sales', etc.
  agent_name VARCHAR(255), -- Human-readable Name
  
  -- Task-Informationen
  task_message TEXT NOT NULL, -- Die ursprüngliche Anfrage
  task_type VARCHAR(50), -- z.B. 'chat', 'generation', 'analysis', 'automation'
  
  -- Status-Tracking (ähnlich wie readings)
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled'
  )),
  
  -- Ergebnis (wird nach Abschluss gefüllt)
  response TEXT,
  response_data JSONB, -- Strukturierte Antwort-Daten
  
  -- Metadaten
  metadata JSONB DEFAULT '{}'::jsonb, -- tokens, model, duration, etc.
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Fehler-Informationen
  error_message TEXT,
  error_details JSONB
);

-- ============================================
-- Tabelle: agent_responses
-- ============================================
-- Speichert alle Agent-Antworten (für n8n-Workflows und historische Daten)
CREATE TABLE IF NOT EXISTS agent_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Task-Referenz (optional)
  task_id UUID REFERENCES agent_tasks(id) ON DELETE SET NULL,
  
  -- Agent-Informationen
  agent VARCHAR(100) NOT NULL,
  agent_id VARCHAR(100), -- Alias für agent (Kompatibilität)
  
  -- Response-Content
  response TEXT NOT NULL,
  response_data JSONB, -- Strukturierte Daten
  
  -- Metadaten
  tokens INTEGER,
  model VARCHAR(100),
  duration_ms INTEGER, -- Verarbeitungsdauer in Millisekunden
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Zusätzliche Metadaten
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- Indizes für Performance
-- ============================================

-- agent_tasks Indizes
CREATE INDEX IF NOT EXISTS idx_agent_tasks_user_id ON agent_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent_id ON agent_tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_created_at ON agent_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_task_type ON agent_tasks(task_type);

-- agent_responses Indizes
CREATE INDEX IF NOT EXISTS idx_agent_responses_task_id ON agent_responses(task_id);
CREATE INDEX IF NOT EXISTS idx_agent_responses_agent ON agent_responses(agent);
CREATE INDEX IF NOT EXISTS idx_agent_responses_created_at ON agent_responses(created_at DESC);

-- ============================================
-- Trigger für updated_at automatische Aktualisierung
-- ============================================

CREATE OR REPLACE FUNCTION update_agent_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agent_tasks_updated_at
  BEFORE UPDATE ON agent_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_agent_tasks_updated_at();

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- RLS aktivieren
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Users können ihre eigenen Tasks sehen
CREATE POLICY "Users can view own agent tasks"
  ON agent_tasks
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Users können ihre eigenen Tasks erstellen
CREATE POLICY "Users can create own agent tasks"
  ON agent_tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Users können ihre eigenen Tasks aktualisieren
CREATE POLICY "Users can update own agent tasks"
  ON agent_tasks
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Alle können agent_responses sehen (für n8n-Workflows)
CREATE POLICY "Anyone can view agent responses"
  ON agent_responses
  FOR SELECT
  USING (true);

-- Policy: Authenticated users können agent_responses erstellen
CREATE POLICY "Authenticated users can create agent responses"
  ON agent_responses
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR true); -- Für n8n-Workflows

-- ============================================
-- Helper-Funktionen
-- ============================================

-- Funktion: User-Tasks abrufen
CREATE OR REPLACE FUNCTION get_user_agent_tasks(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0,
  p_status VARCHAR DEFAULT NULL,
  p_agent_id VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  agent_id VARCHAR,
  agent_name VARCHAR,
  task_message TEXT,
  task_type VARCHAR,
  status VARCHAR,
  response TEXT,
  response_data JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    at.id,
    at.agent_id,
    at.agent_name,
    at.task_message,
    at.task_type,
    at.status,
    at.response,
    at.response_data,
    at.metadata,
    at.created_at,
    at.updated_at,
    at.completed_at
  FROM agent_tasks at
  WHERE (p_user_id IS NULL OR at.user_id = p_user_id)
    AND (p_status IS NULL OR at.status = p_status)
    AND (p_agent_id IS NULL OR at.agent_id = p_agent_id)
  ORDER BY at.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion: Task-Statistiken
CREATE OR REPLACE FUNCTION get_agent_task_statistics(
  p_user_id UUID DEFAULT NULL,
  p_agent_id VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  total_tasks BIGINT,
  pending_tasks BIGINT,
  processing_tasks BIGINT,
  completed_tasks BIGINT,
  failed_tasks BIGINT,
  avg_duration_ms NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_tasks,
    COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_tasks,
    COUNT(*) FILTER (WHERE status = 'processing')::BIGINT as processing_tasks,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'failed')::BIGINT as failed_tasks,
    AVG(
      EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000
    )::NUMERIC as avg_duration_ms
  FROM agent_tasks
  WHERE (p_user_id IS NULL OR user_id = p_user_id)
    AND (p_agent_id IS NULL OR agent_id = p_agent_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kommentare
COMMENT ON TABLE agent_tasks IS 'Speichert alle Agent-Aufgaben mit Status-Tracking';
COMMENT ON TABLE agent_responses IS 'Speichert alle Agent-Antworten für n8n-Workflows und historische Daten';
COMMENT ON FUNCTION get_user_agent_tasks IS 'Ruft User-Tasks mit Filterung und Pagination ab';
COMMENT ON FUNCTION get_agent_task_statistics IS 'Berechnet Statistiken für Agent-Tasks';

