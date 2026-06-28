-- Nervensystem-/Regulations-Reading (Welle 2)
-- Einzel-Chart-Analyse analog Psychology (workers/nervous-system-worker.js,
-- Queue reading-queue-v4-nervous-system). Erdet das natale Chart als
-- deterministischen Faktenblock und mappt offene/definierte Zentren, Autorität,
-- Typ/Strategie und Not-Self-Stress auf Nervensystem-Regulation (Polyvagal).
-- Projekt connection-key-v3 (wdiadklhvhlndnjojrfu). VOR Betrieb anwenden.
CREATE TABLE IF NOT EXISTS public.nervous_system_readings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID,                 -- Eigentümer (user_id ODER profile_id des Readings)
  reading_id           UUID,                 -- Quell-Reading in public.readings (Chart-Quelle)

  -- Status
  status               VARCHAR(20) NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','processing','completed','failed')),
  progress             INTEGER DEFAULT 0,

  -- Ergebnis-Dimensionen
  regulation_score     INTEGER,              -- 0-100: gelebte Selbst-/Co-Regulation
  baseline_state       TEXT,                 -- dominante NS-Tendenz im Not-Self
  state_map            JSONB DEFAULT '{}'::jsonb,   -- Polyvagal: ventral/sympathetisch/dorsal
  center_sensitivities JSONB DEFAULT '[]'::jsonb,   -- je offenem Zentrum: Aufnahme → Regulation
  authority_regulation JSONB DEFAULT '{}'::jsonb,   -- Autorität/Strategie als somatische Steuerung
  triggers             JSONB DEFAULT '[]'::jsonb,   -- Trigger → Körperreaktion → Reset
  daily_practices      JSONB DEFAULT '[]'::jsonb,   -- konkrete Regulations-Übungen
  insights             JSONB DEFAULT '{}'::jsonb,   -- summary/strengths/watch_outs
  narrative            TEXT,                 -- warmer Markdown-Bericht

  -- Meta
  metadata             JSONB DEFAULT '{}'::jsonb,
  model                TEXT,
  error_message        TEXT,

  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now(),
  completed_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_nervous_system_user_created
  ON public.nervous_system_readings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_nervous_system_reading
  ON public.nervous_system_readings(reading_id) WHERE reading_id IS NOT NULL;

ALTER TABLE public.nervous_system_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role manages nervous_system_readings" ON public.nervous_system_readings;
CREATE POLICY "service_role manages nervous_system_readings" ON public.nervous_system_readings
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "users read own nervous_system_readings" ON public.nervous_system_readings;
CREATE POLICY "users read own nervous_system_readings" ON public.nervous_system_readings
  FOR SELECT USING (auth.uid() = user_id);
