-- Produktivität ohne Burnout-Reading (Welle 2)
-- Einzel-Chart-Analyse analog Nervous-System (workers/productivity-worker.js,
-- Queue reading-queue-v4-productivity). Bildet Typ/Strategie/Autorität +
-- definierte/offene Zentren auf nachhaltige Produktivität & Burnout-Prävention ab.
-- Projekt connection-key-v3 (wdiadklhvhlndnjojrfu). VOR Betrieb anwenden.
CREATE TABLE IF NOT EXISTS public.productivity_readings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID,
  reading_id           UUID,

  status               VARCHAR(20) NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','processing','completed','failed')),
  progress             INTEGER DEFAULT 0,

  productivity_score   INTEGER,              -- 0-100: nachhaltige, designgerechte Produktivität
  work_rhythm          JSONB DEFAULT '{}'::jsonb,    -- Typ-spezifischer Arbeits-/Energierhythmus
  energy_management    JSONB DEFAULT '[]'::jsonb,    -- definierte (Output) vs offene (Leak) Zentren
  decision_load        JSONB DEFAULT '{}'::jsonb,    -- Autorität: woran sich binden / falsches Ja
  burnout_signals      JSONB DEFAULT '{}'::jsonb,    -- Not-Self als Frühwarnsystem
  focus_practices      JSONB DEFAULT '[]'::jsonb,    -- konkrete Fokus-/Energie-Praktiken
  boundaries           JSONB DEFAULT '[]'::jsonb,    -- Grenzen/Nein gegen Überlastung
  insights             JSONB DEFAULT '{}'::jsonb,
  narrative            TEXT,

  metadata             JSONB DEFAULT '{}'::jsonb,
  model                TEXT,
  error_message        TEXT,

  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now(),
  completed_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_productivity_user_created
  ON public.productivity_readings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_productivity_reading
  ON public.productivity_readings(reading_id) WHERE reading_id IS NOT NULL;

ALTER TABLE public.productivity_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role manages productivity_readings" ON public.productivity_readings;
CREATE POLICY "service_role manages productivity_readings" ON public.productivity_readings
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "users read own productivity_readings" ON public.productivity_readings;
CREATE POLICY "users read own productivity_readings" ON public.productivity_readings
  FOR SELECT USING (auth.uid() = user_id);
