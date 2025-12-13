-- Migration: Create Readings Tables
-- Created: 2025-12-13
-- Description: Erstellt Tabellen für Reading-Persistenz

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Tabelle: readings
-- ============================================
-- Speichert alle generierten Readings
CREATE TABLE IF NOT EXISTS readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User-Zuordnung (optional für anonyme Readings)
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Reading-Typ
  reading_type VARCHAR(50) NOT NULL CHECK (reading_type IN (
    'basic',
    'detailed',
    'business',
    'relationship',
    'career',
    'health',
    'parenting',
    'spiritual',
    'compatibility',
    'life-purpose'
  )),
  
  -- Geburtsdaten (Person 1)
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  birth_place VARCHAR(255) NOT NULL,
  
  -- Geburtsdaten (Person 2 - nur für Compatibility Reading)
  birth_date2 DATE,
  birth_time2 TIME,
  birth_place2 VARCHAR(255),
  
  -- Reading-Content
  reading_text TEXT NOT NULL,
  reading_sections JSONB, -- Strukturierte Sections (optional)
  
  -- Chart-Daten (optional)
  chart_data JSONB,
  
  -- Metadaten
  metadata JSONB DEFAULT '{}'::jsonb, -- tokens, model, etc.
  
  -- Status
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN (
    'pending',
    'completed',
    'failed',
    'cancelled'
  )),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- ============================================
-- Tabelle: reading_history
-- ============================================
-- Speichert User-Interaktionen mit Readings
CREATE TABLE IF NOT EXISTS reading_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- User-Zuordnung
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Reading-Zuordnung
  reading_id UUID REFERENCES readings(id) ON DELETE CASCADE NOT NULL,
  
  -- Interaktions-Daten
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  shared BOOLEAN DEFAULT false,
  exported BOOLEAN DEFAULT false,
  exported_format VARCHAR(20), -- 'pdf', 'text', 'json'
  exported_at TIMESTAMP WITH TIME ZONE,
  
  -- Zusätzliche Metadaten
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- Indizes für Performance
-- ============================================

-- Readings Indizes
CREATE INDEX IF NOT EXISTS idx_readings_user_id ON readings(user_id);
CREATE INDEX IF NOT EXISTS idx_readings_reading_type ON readings(reading_type);
CREATE INDEX IF NOT EXISTS idx_readings_created_at ON readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_readings_status ON readings(status);
CREATE INDEX IF NOT EXISTS idx_readings_birth_date ON readings(birth_date);

-- Composite Index für häufige Queries
CREATE INDEX IF NOT EXISTS idx_readings_user_type_created 
  ON readings(user_id, reading_type, created_at DESC);

-- JSONB Indizes (für Sections und Chart-Daten)
CREATE INDEX IF NOT EXISTS idx_readings_reading_sections_gin 
  ON readings USING GIN (reading_sections);
CREATE INDEX IF NOT EXISTS idx_readings_chart_data_gin 
  ON readings USING GIN (chart_data);

-- Reading History Indizes
CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_reading_id ON reading_history(reading_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_viewed_at ON reading_history(viewed_at DESC);

-- Composite Index für User-History
CREATE INDEX IF NOT EXISTS idx_reading_history_user_viewed 
  ON reading_history(user_id, viewed_at DESC);

-- ============================================
-- Trigger: updated_at automatisch aktualisieren
-- ============================================

-- Function für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für readings
CREATE TRIGGER update_readings_updated_at
  BEFORE UPDATE ON readings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies: readings
-- ============================================

-- Policy: Users können ihre eigenen Readings sehen
CREATE POLICY "Users can view their own readings"
  ON readings
  FOR SELECT
  USING (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Policy: Users können ihre eigenen Readings erstellen
CREATE POLICY "Users can create their own readings"
  ON readings
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Policy: Users können ihre eigenen Readings aktualisieren
CREATE POLICY "Users can update their own readings"
  ON readings
  FOR UPDATE
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
  );

-- Policy: Users können ihre eigenen Readings löschen
CREATE POLICY "Users can delete their own readings"
  ON readings
  FOR DELETE
  USING (
    auth.uid() = user_id
  );

-- Policy: Service Role kann alle Readings sehen (für API)
CREATE POLICY "Service role can view all readings"
  ON readings
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Policy: Service Role kann alle Readings erstellen (für API)
CREATE POLICY "Service role can create all readings"
  ON readings
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- ============================================
-- RLS Policies: reading_history
-- ============================================

-- Policy: Users können ihre eigene History sehen
CREATE POLICY "Users can view their own reading history"
  ON reading_history
  FOR SELECT
  USING (
    auth.uid() = user_id
  );

-- Policy: Users können ihre eigene History erstellen
CREATE POLICY "Users can create their own reading history"
  ON reading_history
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Policy: Users können ihre eigene History aktualisieren
CREATE POLICY "Users can update their own reading history"
  ON reading_history
  FOR UPDATE
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
  );

-- Policy: Service Role kann alle History-Einträge sehen (für API)
CREATE POLICY "Service role can view all reading history"
  ON reading_history
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- Policy: Service Role kann alle History-Einträge erstellen (für API)
CREATE POLICY "Service role can create all reading history"
  ON reading_history
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
  );

-- ============================================
-- Kommentare für Dokumentation
-- ============================================

COMMENT ON TABLE readings IS 'Speichert alle generierten Human Design Readings';
COMMENT ON TABLE reading_history IS 'Speichert User-Interaktionen mit Readings';

COMMENT ON COLUMN readings.user_id IS 'User-ID (optional für anonyme Readings)';
COMMENT ON COLUMN readings.reading_type IS 'Reading-Typ (basic, detailed, business, etc.)';
COMMENT ON COLUMN readings.reading_sections IS 'Strukturierte Sections (JSONB)';
COMMENT ON COLUMN readings.chart_data IS 'Chart-Daten (JSONB)';
COMMENT ON COLUMN readings.metadata IS 'Metadaten (tokens, model, etc.)';
COMMENT ON COLUMN readings.status IS 'Status (pending, completed, failed, cancelled)';

COMMENT ON COLUMN reading_history.viewed_at IS 'Wann wurde das Reading angesehen';
COMMENT ON COLUMN reading_history.shared IS 'Wurde das Reading geteilt';
COMMENT ON COLUMN reading_history.exported IS 'Wurde das Reading exportiert';
COMMENT ON COLUMN reading_history.exported_format IS 'Export-Format (pdf, text, json)';

