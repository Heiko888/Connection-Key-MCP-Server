-- Reading → Video (v8 Phase 2): Job-Tracking + permanenter Storage.
-- Analog video_jobs / audio_jobs. Projekt connection-key-v3 (wdiadklhvhlndnjojrfu).
CREATE TABLE IF NOT EXISTS public.reading_video_jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  coach_id      UUID,

  -- Request
  reading_id    UUID NOT NULL,          -- Quelle in public.readings
  voice_id      TEXT,                    -- optionale Stimme (sonst Provider-Default)

  -- Status
  status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','processing','generating','completed','failed','timeout','cancelled')),
  progress      INTEGER DEFAULT 0,

  -- Ergebnis
  video_path    TEXT,
  video_url     TEXT,
  duration      INTEGER,                 -- Sekunden
  result        JSONB,                   -- size, slides, tts_provider, resolution

  -- Fehler
  error         TEXT,
  error_code    VARCHAR(50),

  started_at    TIMESTAMPTZ,
  finished_at   TIMESTAMPTZ,
  retry_count   INTEGER DEFAULT 0,
  max_retries   INTEGER DEFAULT 1,

  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reading_video_jobs_user_status ON public.reading_video_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_reading_video_jobs_status_created ON public.reading_video_jobs(status, created_at);
CREATE INDEX IF NOT EXISTS idx_reading_video_jobs_reading ON public.reading_video_jobs(reading_id);

ALTER TABLE public.reading_video_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role manages reading_video_jobs" ON public.reading_video_jobs;
CREATE POLICY "service_role manages reading_video_jobs" ON public.reading_video_jobs
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "users read own reading_video_jobs" ON public.reading_video_jobs;
CREATE POLICY "users read own reading_video_jobs" ON public.reading_video_jobs
  FOR SELECT USING (auth.uid() = user_id);

-- Public Storage-Bucket für fertige Reading-Videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-reading-videos', 'generated-reading-videos', true)
ON CONFLICT (id) DO NOTHING;
