-- ============================================
-- DEBUG TEST TABLE
-- ============================================
-- Minimale Tabelle für Debug-Tests
-- ⚠️ FEHLERQUELLE: Migration muss in Supabase ausgeführt werden!

-- Tabelle erstellen
CREATE TABLE IF NOT EXISTS debug_test (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index für created_at (optional, für Performance)
CREATE INDEX IF NOT EXISTS idx_debug_test_created_at ON debug_test(created_at);

-- ============================================
-- POLICY: Erlaube Inserts ohne Auth
-- ============================================
-- ⚠️ FEHLERQUELLE: Policy muss nach Tabellenerstellung erstellt werden!

-- Alte Policy löschen (falls vorhanden)
DROP POLICY IF EXISTS "Allow public inserts" ON debug_test;

-- Neue Policy: Erlaube Inserts für alle (ohne Auth)
CREATE POLICY "Allow public inserts" ON debug_test
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- VERIFICATION
-- ============================================
-- Test-Insert (optional, kann nach Test gelöscht werden)
-- INSERT INTO debug_test (message) VALUES ('Migration test');

