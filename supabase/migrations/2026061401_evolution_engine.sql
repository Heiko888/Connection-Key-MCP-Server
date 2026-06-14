-- W7 — Evolution Engine (.138)
-- Erweitert public.evolution_analyses um die Spalten der mehrdimensionalen
-- Dekonditionierungs-Analyse (Zentren-/Autoritäts-Verlauf, Not-Self-Tracking,
-- Zeitleiste, Coaching/Lernpfad-Verknüpfung, Narrativ).
-- Idempotent: ADD COLUMN IF NOT EXISTS.

ALTER TABLE public.evolution_analyses
  ADD COLUMN IF NOT EXISTS center_evolution    jsonb   DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS authority_alignment jsonb   DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS not_self_tracking   jsonb   DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS timeline            jsonb   DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS coaching_links      jsonb   DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS narrative           text,
  ADD COLUMN IF NOT EXISTS error_message       text,
  ADD COLUMN IF NOT EXISTS model               text;

-- Schnellzugriff auf die Analysen eines Users (Übersicht / Liste).
CREATE INDEX IF NOT EXISTS idx_evolution_analyses_user_created
  ON public.evolution_analyses (user_id, created_at DESC);
