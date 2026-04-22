-- ================================================================
-- reading_validation_log — Baustein 8 (Monitoring)
-- Stand: 2026-04-22
-- ================================================================
--
-- Jeder Validator-Lauf (reading-pipeline.js) schreibt einen Eintrag hier.
-- Erlaubt Fehlerraten pro Reading-Typ, pro CHECK-Nummer, pro Chart-
-- Konstellation zu berechnen und eine Stichproben-Queue fuer manuelle
-- Review zu pflegen.

-- Primaeres Schema: v4 (Coach-Portal-Readings laufen ueberwiegend in v4)
-- Fallback: public (ohne FK auf v4.reading_results), damit auch Preview/
-- Stream-Readings geloggt werden koennen, die nicht in der DB persistiert sind.

CREATE TABLE IF NOT EXISTS public.reading_validation_log (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_id              uuid,                                -- OHNE FK (Preview-Readings haben keine persistente ID)
  reading_type            text,
  template                text,
  validated_at            timestamptz NOT NULL DEFAULT now(),
  error_count             int NOT NULL DEFAULT 0,
  errors                  jsonb,                               -- [{ check, severity, description, expected, found, location }]
  correction_applied      boolean NOT NULL DEFAULT false,
  pre_correction_length   int,
  post_correction_length  int,
  chart_fingerprint       text,                                -- SHA-Hash der normalisierten chartData
  model_used              text,                                -- z.B. claude-sonnet-4-6
  duration_ms             int,                                 -- Validator-Laufzeit
  strict_mode             boolean,                             -- READING_STRICT_MODE beim Lauf
  sampled_for_review      boolean NOT NULL DEFAULT false,      -- fuer Stichproben-Queue
  reviewed_at             timestamptz,
  reviewed_by             uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  review_verdict          text                                 -- 'ok' | 'fehler' | 'unklar'
);

-- Indizes fuer Dashboard-Queries
CREATE INDEX IF NOT EXISTS idx_rvl_validated_at    ON public.reading_validation_log(validated_at DESC);
CREATE INDEX IF NOT EXISTS idx_rvl_reading_type    ON public.reading_validation_log(reading_type);
CREATE INDEX IF NOT EXISTS idx_rvl_error_count     ON public.reading_validation_log(error_count) WHERE error_count > 0;
CREATE INDEX IF NOT EXISTS idx_rvl_sampled         ON public.reading_validation_log(sampled_for_review) WHERE sampled_for_review = true;
CREATE INDEX IF NOT EXISTS idx_rvl_reading_id      ON public.reading_validation_log(reading_id) WHERE reading_id IS NOT NULL;

-- RLS: service-role-only (Frontend-Coach liest via server-side)
ALTER TABLE public.reading_validation_log ENABLE ROW LEVEL SECURITY;

-- Coaches duerfen lesen (fuer /admin/reading-health)
CREATE POLICY "coaches_select_validation_log" ON public.reading_validation_log
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'service_role'
    OR EXISTS (
      SELECT 1 FROM public.coaches WHERE coaches.user_id = auth.uid()
    )
  );

-- Service-Role darf insertieren (reading-worker)
CREATE POLICY "service_role_insert_validation_log" ON public.reading_validation_log
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Coaches duerfen reviewen (nur review-Felder updaten)
CREATE POLICY "coaches_update_review" ON public.reading_validation_log
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.coaches WHERE coaches.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.coaches WHERE coaches.user_id = auth.uid())
  );

COMMENT ON TABLE public.reading_validation_log IS
  'Baustein 8 Monitoring: Jeder Validator-Lauf schreibt hier. Fehlerraten pro Typ/Check, Stichproben-Queue fuer manuelle Review.';
