-- Migration: Create reading_jobs Table
-- Created: 2025-12-26
-- Description: Erstellt reading_jobs Tabelle für Job-Management

-- Enable UUID extension (falls nicht vorhanden)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Tabelle: reading_jobs
-- ============================================
-- Speichert Reading-Jobs mit Status-Tracking
CREATE TABLE IF NOT EXISTS reading_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User-Zuordnung (optional für anonyme Readings)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Reading-Typ
  reading_type VARCHAR(50),
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Ergebnis (JSONB)
  result JSONB,
  
  -- Fehler (Text)
  error TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- ============================================
-- Indizes für Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_reading_jobs_status ON reading_jobs(status);
CREATE INDEX IF NOT EXISTS idx_reading_jobs_user_id ON reading_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_jobs_created_at ON reading_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reading_jobs_updated_at ON reading_jobs(updated_at DESC);

-- Composite Index für häufige Queries
CREATE INDEX IF NOT EXISTS idx_reading_jobs_user_status_created 
  ON reading_jobs(user_id, status, created_at DESC);

-- ============================================
-- Trigger für updated_at automatische Aktualisierung
-- ============================================
CREATE OR REPLACE FUNCTION update_reading_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reading_jobs_updated_at
  BEFORE UPDATE ON reading_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_reading_jobs_updated_at();

-- ============================================
-- Row Level Security (RLS)
-- ============================================
ALTER TABLE reading_jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Users können ihre eigenen Jobs sehen
CREATE POLICY "Users can view their own reading_jobs"
  ON reading_jobs
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Service Role kann alles sehen/ändern
CREATE POLICY "Service role can manage all reading_jobs"
  ON reading_jobs
  FOR ALL
  USING (auth.role() = 'service_role');
