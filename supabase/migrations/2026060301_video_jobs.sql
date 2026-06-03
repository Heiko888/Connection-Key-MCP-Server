-- Video-Generierung (Runway / Seedance 2.0): Job-Tracking + permanenter Storage
-- Angewendet am 2026-06-03 auf Projekt connection-key-v3 (wdiadklhvhlndnjojrfu).
CREATE TABLE IF NOT EXISTS public.video_jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  coach_id      UUID,

  -- Request
  mode          VARCHAR(20) NOT NULL DEFAULT 'text'
                  CHECK (mode IN ('text','image','reference')),
  prompt        TEXT NOT NULL,
  shots         JSONB,                 -- Multi-Shot: Array von Szenen-Beschreibungen
  images        JSONB,                 -- Eingangs-Bild-URLs (image/reference)
  ratio         VARCHAR(20) DEFAULT '1280:720',
  duration      INTEGER DEFAULT 5,
  model         VARCHAR(40) DEFAULT 'seedance2',

  -- Runway
  runway_task_id TEXT,

  -- Status
  status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','processing','generating','completed','failed','timeout','cancelled')),
  progress      INTEGER DEFAULT 0,

  -- Ergebnis
  video_path    TEXT,                  -- Pfad im Storage-Bucket
  video_url     TEXT,                  -- permanente Public-URL
  result        JSONB,                 -- Metadaten (size, source_url, duration, …)

  -- Fehler
  error         TEXT,
  error_code    VARCHAR(50),
  error_meta    JSONB,

  -- Retry / Timing
  started_at    TIMESTAMPTZ,
  finished_at   TIMESTAMPTZ,
  retry_count   INTEGER DEFAULT 0,
  max_retries   INTEGER DEFAULT 2,

  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_video_jobs_user_status ON public.video_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_video_jobs_status_created ON public.video_jobs(status, created_at);
CREATE INDEX IF NOT EXISTS idx_video_jobs_runway_task ON public.video_jobs(runway_task_id) WHERE runway_task_id IS NOT NULL;

ALTER TABLE public.video_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role manages video_jobs" ON public.video_jobs;
CREATE POLICY "service_role manages video_jobs" ON public.video_jobs
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "users read own video_jobs" ON public.video_jobs;
CREATE POLICY "users read own video_jobs" ON public.video_jobs
  FOR SELECT USING (auth.uid() = user_id);

-- Public Storage-Bucket für fertige Videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-videos', 'generated-videos', true)
ON CONFLICT (id) DO NOTHING;
