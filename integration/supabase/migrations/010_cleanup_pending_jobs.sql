-- Migration: Cleanup Pending Reading Jobs + Struktur-Korrektur
-- Created: 2025-12-28
-- Description: Markiert hängende Reading-Jobs als failed und korrigiert Tabellenstruktur

-- ============================================
-- SCHRITT 1: Füge fehlende Spalten hinzu
-- ============================================
-- Füge fehlende Spalten hinzu (falls nicht vorhanden)
ALTER TABLE reading_jobs 
  ADD COLUMN IF NOT EXISTS reading_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS error TEXT;

-- ============================================
-- SCHRITT 2: Markiere hängende Jobs als failed
-- ============================================
-- Markiere alle Jobs, die länger als 1 Stunde im Status 'pending' sind
-- ⚠️ WICHTIG: error Spalte muss existieren (Schritt 1)!
UPDATE reading_jobs
SET 
  status = 'failed',
  error = 'Job stuck in pending - cleaned up on 2025-12-28',
  updated_at = timezone('utc', now())
WHERE 
  status = 'pending' 
  AND result IS NULL
  AND updated_at < timezone('utc', now()) - INTERVAL '1 hour';

-- ============================================
-- SCHRITT 3: Entferne nicht benötigte Spalten
-- ============================================
-- ⚠️ VORSICHT: Prüfe zuerst ob Spalten Daten enthalten!
-- Prüfe ob reading_id Spalte existiert und Daten enthält:
-- SELECT COUNT(*) FROM reading_jobs WHERE reading_id IS NOT NULL;

-- Entferne reading_id Spalte (nicht in Migration 009, nicht im Code verwendet)
ALTER TABLE reading_jobs DROP COLUMN IF EXISTS reading_id;

-- Entferne payload Spalte (nicht in Migration 009, nicht im Code verwendet)
ALTER TABLE reading_jobs DROP COLUMN IF EXISTS payload;

-- ============================================
-- SCHRITT 4: Prüfe Ergebnis
-- ============================================
-- Führe diese Query aus, um zu prüfen, ob Cleanup erfolgreich war:
-- SELECT 
--   id,
--   status,
--   reading_type,
--   error,
--   created_at,
--   updated_at
-- FROM reading_jobs
-- WHERE status = 'failed'
-- ORDER BY updated_at DESC
-- LIMIT 10;

-- ============================================
-- SCHRITT 5: Prüfe ob alle Spalten vorhanden sind
-- ============================================
-- Erwartete Spalten:
-- - id (UUID, PRIMARY KEY)
-- - user_id (UUID, nullable)
-- - reading_type (VARCHAR(50), nullable)
-- - status (VARCHAR(20), DEFAULT 'pending')
-- - result (JSONB, nullable)
-- - error (TEXT, nullable)
-- - created_at (TIMESTAMP WITH TIME ZONE)
-- - updated_at (TIMESTAMP WITH TIME ZONE)

-- Prüfe ob alle Spalten vorhanden sind:
-- SELECT 
--   column_name, 
--   data_type, 
--   is_nullable,
--   column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'reading_jobs'
-- ORDER BY ordinal_position;
