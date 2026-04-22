-- =============================================================
-- Dynamic Blueprint System — Phase 1: Schema
-- Stand: 2026-04-16
-- =============================================================

-- 1) client_profiles: Klammer um Klient + Coach + Chart-Quelle
CREATE TABLE IF NOT EXISTS public.client_profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  member_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name     text NOT NULL,
  birth_data      jsonb,
  source_reading_id uuid REFERENCES public.readings(id) ON DELETE SET NULL,
  is_archived     boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_profiles_coach  ON public.client_profiles(coach_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_member ON public.client_profiles(member_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_name   ON public.client_profiles(client_name);

-- 2) reading_sections: Inhalte pro Bereich, versioniert, freigebbar
CREATE TABLE IF NOT EXISTS public.reading_sections (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_id      uuid NOT NULL REFERENCES public.readings(id) ON DELETE CASCADE,
  client_id       uuid NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
  area            text NOT NULL,
  content         text NOT NULL,
  content_format  text NOT NULL DEFAULT 'markdown',
  is_released     boolean NOT NULL DEFAULT false,
  released_at     timestamptz,
  released_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  priority        integer NOT NULL DEFAULT 0,
  version         integer NOT NULL DEFAULT 1,
  superseded_by   uuid REFERENCES public.reading_sections(id) ON DELETE SET NULL,
  coach_note      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_reading_sections_reading_area_version
  ON public.reading_sections(reading_id, area, version);

CREATE INDEX IF NOT EXISTS idx_reading_sections_client_area_active
  ON public.reading_sections(client_id, area)
  WHERE is_released = true AND superseded_by IS NULL;

CREATE INDEX IF NOT EXISTS idx_reading_sections_reading ON public.reading_sections(reading_id);

-- 3) updated_at Trigger
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_client_profiles_updated ON public.client_profiles;
CREATE TRIGGER trg_client_profiles_updated
  BEFORE UPDATE ON public.client_profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

DROP TRIGGER IF EXISTS trg_reading_sections_updated ON public.reading_sections;
CREATE TRIGGER trg_reading_sections_updated
  BEFORE UPDATE ON public.reading_sections
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4) Kanonische Liste der Bereiche
ALTER TABLE public.reading_sections
  ADD CONSTRAINT chk_reading_sections_area CHECK (area IN (
    'incarnation_cross','profile','type','authority','strategy',
    'centers','channels','gates','definition','variables',
    'relationship','business','sleep','shadow_patterns',
    'development','purpose','health','money','parenting',
    'sexuality','trauma','life_phases','summary','other'
  ));

-- 5) RLS aktivieren
ALTER TABLE public.client_profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sections  ENABLE ROW LEVEL SECURITY;

-- 5a) client_profiles Policies
CREATE POLICY client_profiles_coach_select ON public.client_profiles
  FOR SELECT USING (coach_id = auth.uid());

CREATE POLICY client_profiles_member_select ON public.client_profiles
  FOR SELECT USING (member_id = auth.uid());

CREATE POLICY client_profiles_coach_modify ON public.client_profiles
  FOR ALL USING (coach_id = auth.uid()) WITH CHECK (coach_id = auth.uid());

-- 5b) reading_sections Policies
CREATE POLICY reading_sections_coach_all ON public.reading_sections
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.client_profiles cp
            WHERE cp.id = reading_sections.client_id AND cp.coach_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.client_profiles cp
            WHERE cp.id = reading_sections.client_id AND cp.coach_id = auth.uid())
  );

CREATE POLICY reading_sections_member_released ON public.reading_sections
  FOR SELECT USING (
    is_released = true AND superseded_by IS NULL
    AND EXISTS (SELECT 1 FROM public.client_profiles cp
                WHERE cp.id = reading_sections.client_id AND cp.member_id = auth.uid())
  );

-- 6) Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_profiles   TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_sections  TO authenticated;
