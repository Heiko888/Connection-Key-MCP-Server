-- Gene Keys-Reading (Welle 3 — die große Wette)
-- Einzel-Chart-Analyse analog Nervous-System (workers/gene-keys-worker.js,
-- Queue reading-queue-v4-gene-keys). Mappt die Tore des Charts auf Gene Keys
-- (Schatten → Geschenk → Siddhi). Aktivierungssequenz aus Sonne/Erde
-- (Persönlichkeit & Design). Projekt connection-key-v3 (wdiadklhvhlndnjojrfu).
CREATE TABLE IF NOT EXISTS public.gene_keys_readings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID,
  reading_id           UUID,

  status               VARCHAR(20) NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending','processing','completed','failed')),
  progress             INTEGER DEFAULT 0,

  core_theme           TEXT,                 -- Kernthema der Reise (1 Satz)
  activation_sequence  JSONB DEFAULT '[]'::jsonb,    -- 4 Sphären: Life's Work/Evolution/Radiance/Purpose
  spheres              JSONB DEFAULT '[]'::jsonb,     -- weitere relevante Tore als Gene Keys (optional)
  shadow_work          JSONB DEFAULT '{}'::jsonb,     -- zentrale Schatten + Weg ins Geschenk
  contemplation        JSONB DEFAULT '[]'::jsonb,     -- Kontemplations-Impulse
  insights             JSONB DEFAULT '{}'::jsonb,
  narrative            TEXT,                 -- kontemplativer Markdown-Bericht

  metadata             JSONB DEFAULT '{}'::jsonb,
  model                TEXT,
  error_message        TEXT,

  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now(),
  completed_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_gene_keys_user_created
  ON public.gene_keys_readings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gene_keys_reading
  ON public.gene_keys_readings(reading_id) WHERE reading_id IS NOT NULL;

ALTER TABLE public.gene_keys_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role manages gene_keys_readings" ON public.gene_keys_readings;
CREATE POLICY "service_role manages gene_keys_readings" ON public.gene_keys_readings
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "users read own gene_keys_readings" ON public.gene_keys_readings;
CREATE POLICY "users read own gene_keys_readings" ON public.gene_keys_readings
  FOR SELECT USING (auth.uid() = user_id);
