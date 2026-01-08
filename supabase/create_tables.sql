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

-- Prüfe ob alle Tabellen erstellt wurden
DO $$
BEGIN
  RAISE NOTICE 'Tabellenerstellung abgeschlossen!';
  RAISE NOTICE '✅ partner_matchings';
  RAISE NOTICE '✅ user_subscriptions';
  RAISE NOTICE '✅ payment_history';
  RAISE NOTICE '✅ user_profiles';
END $$;
