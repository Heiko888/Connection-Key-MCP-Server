-- ============================================================================
-- SUPABASE TABELLEN FÜR CONNECTION-KEY SERVER
-- Datum: 8. Januar 2026
-- ============================================================================

-- ============================================================================
-- 1. PARTNER_MATCHINGS TABELLE
-- Speichert Partner-Matching Ergebnisse
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.partner_matchings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id_1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id_2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  matching_type TEXT NOT NULL DEFAULT 'full',
  result JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'completed',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_partner_matchings_user_id_1 ON public.partner_matchings(user_id_1);
CREATE INDEX IF NOT EXISTS idx_partner_matchings_user_id_2 ON public.partner_matchings(user_id_2);
CREATE INDEX IF NOT EXISTS idx_partner_matchings_created_at ON public.partner_matchings(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE public.partner_matchings ENABLE ROW LEVEL SECURITY;

-- Policy: User kann eigene Matchings sehen
CREATE POLICY "Users can view their own matchings"
  ON public.partner_matchings
  FOR SELECT
  USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Policy: Service Role kann alles
CREATE POLICY "Service role has full access to partner_matchings"
  ON public.partner_matchings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_partner_matchings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER partner_matchings_updated_at
  BEFORE UPDATE ON public.partner_matchings
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_matchings_updated_at();

COMMENT ON TABLE public.partner_matchings IS 'Speichert Partner-Matching Ergebnisse zwischen zwei Usern';

-- ============================================================================
-- 2. USER_SUBSCRIPTIONS TABELLE
-- Speichert Stripe Subscription Informationen
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  payment_status TEXT,
  amount_total INTEGER,
  currency TEXT DEFAULT 'eur',
  metadata JSONB DEFAULT '{}',
  activated_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_session_id ON public.user_subscriptions(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_created_at ON public.user_subscriptions(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: User kann eigene Subscriptions sehen
CREATE POLICY "Users can view their own subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Service Role kann alles
CREATE POLICY "Service role has full access to user_subscriptions"
  ON public.user_subscriptions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_user_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_subscriptions_updated_at();

COMMENT ON TABLE public.user_subscriptions IS 'Speichert Stripe Subscription Informationen für User';

-- ============================================================================
-- 3. PAYMENT_HISTORY TABELLE
-- Speichert Stripe Payment Historie
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'eur',
  status TEXT NOT NULL,
  payment_intent TEXT,
  paid_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_payment_history_stripe_invoice_id ON public.payment_history(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_stripe_customer_id ON public.payment_history(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_stripe_subscription_id ON public.payment_history(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON public.payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON public.payment_history(created_at DESC);

-- Row Level Security (RLS)
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Policy: Nur Service Role hat Zugriff
CREATE POLICY "Service role has full access to payment_history"
  ON public.payment_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.payment_history IS 'Speichert Stripe Payment Historie (Invoices)';

-- ============================================================================
-- 4. USER_PROFILES TABELLE (OPTIONAL)
-- Erweiterte User Profile Informationen
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  birth_date DATE,
  birth_time TIME,
  birth_place TEXT,
  birth_latitude NUMERIC,
  birth_longitude NUMERIC,
  timezone TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: User kann eigenes Profil sehen und bearbeiten
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Service Role kann alles
CREATE POLICY "Service role has full access to user_profiles"
  ON public.user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

COMMENT ON TABLE public.user_profiles IS 'Erweiterte User Profile Informationen (optional)';

-- ============================================================================
-- GRANTS FÜR AUTHENTICATED USERS
-- ============================================================================

-- Partner Matchings: SELECT für authenticated
GRANT SELECT ON public.partner_matchings TO authenticated;

-- User Subscriptions: SELECT für authenticated
GRANT SELECT ON public.user_subscriptions TO authenticated;

-- User Profiles: SELECT, INSERT, UPDATE für authenticated
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;

-- ============================================================================
-- FERTIG!
-- ============================================================================

-- ============================================================================
-- 5. CHARTS TABELLE
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

-- Indexes für Performance
CREATE INDEX IF NOT EXISTS idx_charts_user_id ON public.charts(user_id);
CREATE INDEX IF NOT EXISTS idx_charts_type ON public.charts(type);
CREATE INDEX IF NOT EXISTS idx_charts_profile ON public.charts(profile);
CREATE INDEX IF NOT EXISTS idx_charts_authority ON public.charts(authority);
CREATE INDEX IF NOT EXISTS idx_charts_created_at ON public.charts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_charts_birth_date ON public.charts(birth_date);

-- GIN Index für JSONB Suche
CREATE INDEX IF NOT EXISTS idx_charts_chart_data_gin ON public.charts USING GIN (chart_data);
CREATE INDEX IF NOT EXISTS idx_charts_birth_place_gin ON public.charts USING GIN (birth_place);

-- Row Level Security (RLS)
ALTER TABLE public.charts ENABLE ROW LEVEL SECURITY;

-- Policy: User kann eigene Charts sehen
CREATE POLICY "Users can view their own charts"
  ON public.charts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: User kann eigene Charts erstellen
CREATE POLICY "Users can create their own charts"
  ON public.charts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: User kann eigene Charts aktualisieren
CREATE POLICY "Users can update their own charts"
  ON public.charts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: User kann eigene Charts löschen
CREATE POLICY "Users can delete their own charts"
  ON public.charts
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy: Service Role hat vollen Zugriff
CREATE POLICY "Service role has full access to charts"
  ON public.charts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Trigger für updated_at
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

COMMENT ON TABLE public.charts IS 'Human Design Chart Berechnungen mit vollständigen Chart-Daten';
COMMENT ON COLUMN public.charts.chart_data IS 'Vollständiges Chart-JSON mit allen Berechnungen';
COMMENT ON COLUMN public.charts.birth_place IS 'Geburtsort als JSONB: {name, latitude, longitude, timezone}';
COMMENT ON COLUMN public.charts.type IS 'Human Design Typ: Generator, Manifestor, Projektor, Reflektor, Manifestierender Generator';
COMMENT ON COLUMN public.charts.profile IS 'Profile-Linie z.B. "1/3", "4/6"';
COMMENT ON COLUMN public.charts.authority IS 'Autorität: Emotional, Sacral, Splenic, Ego, Self-Projected, Mental, Lunar, No Inner Authority';

-- Grants: SELECT, INSERT, UPDATE, DELETE für authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON public.charts TO authenticated;

-- ============================================================================
-- FERTIG!
-- ============================================================================

-- Prüfe ob alle Tabellen erstellt wurden
DO $$
BEGIN
  RAISE NOTICE 'Tabellenerstellung abgeschlossen!';
  RAISE NOTICE '✅ partner_matchings';
  RAISE NOTICE '✅ user_subscriptions';
  RAISE NOTICE '✅ payment_history';
  RAISE NOTICE '✅ user_profiles';
  RAISE NOTICE '✅ charts';
END $$;
