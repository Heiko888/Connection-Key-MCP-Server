-- Voice-Reading (ElevenLabs TTS): Job-Tracking + permanenter Audio-Storage
-- v8 Phase 1 — analog zu video_jobs (2026060301).
-- Projekt connection-key-v3 (wdiadklhvhlndnjojrfu).
CREATE TABLE IF NOT EXISTS public.audio_jobs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  coach_id      UUID,

  -- Request
  source        VARCHAR(20) NOT NULL DEFAULT 'text'
                  CHECK (source IN ('text','reading')),
  reading_id    UUID,                  -- wenn source='reading': Quelle in public.readings
  text          TEXT,                  -- direkter Text ODER vom Worker aus dem Reading aufgelöst
  title         TEXT,                  -- optionaler Anzeigename
  voice_id      TEXT,                  -- ElevenLabs Voice-ID (Default via ENV)
  model_id      TEXT DEFAULT 'eleven_multilingual_v2',
  language      VARCHAR(10) DEFAULT 'de',

  -- Status
  status        VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','processing','generating','completed','failed','timeout','cancelled')),
  progress      INTEGER DEFAULT 0,

  -- Ergebnis
  audio_path    TEXT,                  -- Pfad im Storage-Bucket
  audio_url     TEXT,                  -- permanente Public-URL
  result        JSONB,                 -- Metadaten (size, char_count, chunks, …)

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

CREATE INDEX IF NOT EXISTS idx_audio_jobs_user_status ON public.audio_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_audio_jobs_status_created ON public.audio_jobs(status, created_at);
CREATE INDEX IF NOT EXISTS idx_audio_jobs_reading ON public.audio_jobs(reading_id) WHERE reading_id IS NOT NULL;

ALTER TABLE public.audio_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role manages audio_jobs" ON public.audio_jobs;
CREATE POLICY "service_role manages audio_jobs" ON public.audio_jobs
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "users read own audio_jobs" ON public.audio_jobs;
CREATE POLICY "users read own audio_jobs" ON public.audio_jobs
  FOR SELECT USING (auth.uid() = user_id);

-- Public Storage-Bucket für fertige Audios
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-audio', 'generated-audio', true)
ON CONFLICT (id) DO NOTHING;
