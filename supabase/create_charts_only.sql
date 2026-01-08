-- ============================================================================
-- CHARTS TABELLE - Human Design Chart Berechnungen
-- Datum: 8. Januar 2026
-- NUR CHARTS - Andere Tabellen existieren bereits
-- ============================================================================

-- ============================================================================
-- CHARTS TABLE
-- Speichert Human Design Chart Berechnungen
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Geburtsdaten
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  birth_place JSONB NOT NULL, -- {name, latitude, longitude, timezone}
  
  -- Chart-Daten (vollständiges Chart-JSON)
  chart_data JSONB NOT NULL,
  
  -- Schnellzugriff (denormalisiert für Performance)
  type TEXT NOT NULL, -- Generator, Manifestor, Projektor, Reflektor, Manifestierender Generator
  profile TEXT NOT NULL, -- z.B. "1/3", "4/6", "6/2"
  authority TEXT NOT NULL, -- z.B. "Emotional", "Sacral", "Splenic"
  strategy TEXT, -- z.B. "To Respond", "To Inform"
  
  -- Definition
  definition TEXT, -- Single, Split, Triple Split, Quadruple Split, No Definition
  
  -- Inkarnationskreuz (optional)
  incarnation_cross TEXT,
  
  -- Versionierung
  chart_version TEXT DEFAULT '1.0.0',
  calculation_engine TEXT DEFAULT 'astronomy-engine',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES für Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_charts_user_id ON public.charts(user_id);
CREATE INDEX IF NOT EXISTS idx_charts_type ON public.charts(type);
CREATE INDEX IF NOT EXISTS idx_charts_profile ON public.charts(profile);
CREATE INDEX IF NOT EXISTS idx_charts_authority ON public.charts(authority);
CREATE INDEX IF NOT EXISTS idx_charts_created_at ON public.charts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_charts_birth_date ON public.charts(birth_date);

-- GIN Index für JSONB Suche
CREATE INDEX IF NOT EXISTS idx_charts_chart_data_gin ON public.charts USING GIN (chart_data);
CREATE INDEX IF NOT EXISTS idx_charts_birth_place_gin ON public.charts USING GIN (birth_place);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.charts ENABLE ROW LEVEL SECURITY;

-- Policy: User kann eigene Charts sehen
DROP POLICY IF EXISTS "Users can view their own charts" ON public.charts;
CREATE POLICY "Users can view their own charts"
  ON public.charts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: User kann eigene Charts erstellen
DROP POLICY IF EXISTS "Users can create their own charts" ON public.charts;
CREATE POLICY "Users can create their own charts"
  ON public.charts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: User kann eigene Charts aktualisieren
DROP POLICY IF EXISTS "Users can update their own charts" ON public.charts;
CREATE POLICY "Users can update their own charts"
  ON public.charts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: User kann eigene Charts löschen
DROP POLICY IF EXISTS "Users can delete their own charts" ON public.charts;
CREATE POLICY "Users can delete their own charts"
  ON public.charts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Service Role hat vollen Zugriff
DROP POLICY IF EXISTS "Service role has full access to charts" ON public.charts;
CREATE POLICY "Service role has full access to charts"
  ON public.charts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- TRIGGER für updated_at
-- ============================================================================

DROP TRIGGER IF EXISTS charts_updated_at ON public.charts;
DROP FUNCTION IF EXISTS update_charts_updated_at();

CREATE OR REPLACE FUNCTION update_charts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER charts_updated_at
  BEFORE UPDATE ON public.charts
  FOR EACH ROW
  EXECUTE FUNCTION update_charts_updated_at();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.charts IS 'Human Design Chart Berechnungen mit vollständigen Chart-Daten';
COMMENT ON COLUMN public.charts.chart_data IS 'Vollständiges Chart-JSON mit allen Berechnungen';
COMMENT ON COLUMN public.charts.birth_place IS 'Geburtsort als JSONB: {name, latitude, longitude, timezone}';
COMMENT ON COLUMN public.charts.type IS 'Human Design Typ: Generator, Manifestor, Projektor, Reflektor, Manifestierender Generator';
COMMENT ON COLUMN public.charts.profile IS 'Profile-Linie z.B. "1/3", "4/6"';
COMMENT ON COLUMN public.charts.authority IS 'Autorität: Emotional, Sacral, Splenic, Ego, Self-Projected, Mental, Lunar, No Inner Authority';

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.charts TO authenticated;

-- ============================================================================
-- FERTIG!
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Charts-Tabelle erstellt!';
  RAISE NOTICE '✅ public.charts';
  RAISE NOTICE '✅ 8 Indexes';
  RAISE NOTICE '✅ 5 RLS Policies';
  RAISE NOTICE '✅ Trigger für updated_at';
END $$;
