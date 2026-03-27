-- Live Reading Sessions
-- Schema: public_core (entsprechend der bestehenden Tabellen)

CREATE TABLE IF NOT EXISTS public.live_reading_sessions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  mode            TEXT        NOT NULL CHECK (mode IN ('single', 'connection')),
  template        TEXT        NOT NULL CHECK (template IN ('full', 'short')),
  language        TEXT        NOT NULL DEFAULT 'de' CHECK (language IN ('de', 'en')),
  chart_data      JSONB       NOT NULL,
  steps           JSONB       NOT NULL DEFAULT '[]',
  completed_steps JSONB       NOT NULL DEFAULT '{}',
  status          TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_live_reading_sessions_status
  ON public.live_reading_sessions (status);

CREATE OR REPLACE FUNCTION public.update_live_reading_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_live_reading_sessions_updated_at
  ON public.live_reading_sessions;

CREATE TRIGGER trg_live_reading_sessions_updated_at
  BEFORE UPDATE ON public.live_reading_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_live_reading_sessions_updated_at();
