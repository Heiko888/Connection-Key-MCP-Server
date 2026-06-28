-- Weibliches Design / Hormonzyklus-Reading (Welle 2)
-- Einzel-Chart-Analyse analog Nervous-System (workers/womens-design-worker.js,
-- Queue reading-queue-v4-womens-design). Verbindet das natale Chart (Typ,
-- Strategie, Autorität, offene Zentren, Not-Self) mit den vier Zyklusphasen
-- (Menstruation/Follikel/Ovulation/Luteal). Selbsterkenntnis & Selbstfürsorge,
-- KEINE medizinische Beratung. Projekt connection-key-v3 (wdiadklhvhlndnjojrfu).
CREATE TABLE IF NOT EXISTS public.womens_design_readings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID,                 -- Eigentümer (user_id ODER profile_id des Readings)
  reading_id            UUID,                 -- Quell-Reading in public.readings (Chart-Quelle)

  -- Status
  status                VARCHAR(20) NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','processing','completed','failed')),
  progress              INTEGER DEFAULT 0,

  -- Ergebnis-Dimensionen
  cycle_alignment_score INTEGER,              -- 0-100: gelebte Stimmigkeit mit zyklischer Natur + Design
  baseline_pattern      TEXT,                 -- Kernmuster im Umgang mit Energie/Zyklus
  cycle_phases          JSONB DEFAULT '[]'::jsonb,   -- 4 Phasen: Energie/Fokus/Praxis je Typ
  type_rhythm           JSONB DEFAULT '{}'::jsonb,   -- HD-Typ-Energie × zyklische Energie
  authority_in_cycle    JSONB DEFAULT '{}'::jsonb,   -- Autorität über den Zyklus (v.a. emotional/luteal)
  center_amplification  JSONB DEFAULT '[]'::jsonb,   -- offene Zentren über den Zyklus verstärkt
  not_self_amplified    JSONB DEFAULT '{}'::jsonb,   -- wo PMS/Luteal das Not-Self verstärkt
  selfcare_practices    JSONB DEFAULT '[]'::jsonb,   -- konkrete Selbstfürsorge je Phase
  insights              JSONB DEFAULT '{}'::jsonb,   -- summary/strengths/watch_outs
  narrative             TEXT,                 -- warmer Markdown-Bericht

  -- Meta
  metadata              JSONB DEFAULT '{}'::jsonb,
  model                 TEXT,
  error_message         TEXT,

  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  completed_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_womens_design_user_created
  ON public.womens_design_readings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_womens_design_reading
  ON public.womens_design_readings(reading_id) WHERE reading_id IS NOT NULL;

ALTER TABLE public.womens_design_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role manages womens_design_readings" ON public.womens_design_readings;
CREATE POLICY "service_role manages womens_design_readings" ON public.womens_design_readings
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "users read own womens_design_readings" ON public.womens_design_readings;
CREATE POLICY "users read own womens_design_readings" ON public.womens_design_readings
  FOR SELECT USING (auth.uid() = user_id);
