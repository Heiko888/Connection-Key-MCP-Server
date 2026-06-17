-- ============================================================================
-- Migration: mcp_usage für Worker-seitiges Kosten-Tracking erweitern
-- ============================================================================
-- Zweck: Der reading-worker (.138, reading-worker/server.js + usage.js) schreibt
--        ab sofort pro Claude-Call einen Eintrag in public.mcp_usage (Gegenstück
--        zum Frontend-Tracking auf .167, frontend/lib/db/mcp-usage.ts).
--
-- Worker-Calls haben nicht immer einen auslösenden Coach (z. B. interne/
-- automatisierte Readings), darum muss coach_id NULLABLE sein. Zusätzlich wird
-- eine source-Spalte ergänzt, um Frontend- ('frontend') von Worker-Einträgen
-- ('reading-worker') unterscheiden zu können.
--
-- Idempotent: kann mehrfach ausgeführt werden.
-- ============================================================================

-- 1) coach_id NULLABLE machen (war zuvor NOT NULL)
ALTER TABLE public.mcp_usage
  ALTER COLUMN coach_id DROP NOT NULL;

-- 2) source-Spalte hinzufügen (Default 'frontend', damit Bestandszeilen
--    rückwirkend dem Frontend zugeordnet werden)
ALTER TABLE public.mcp_usage
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'frontend';

-- 3) Index für Auswertungen nach Quelle (z. B. Worker-Kosten separat)
CREATE INDEX IF NOT EXISTS idx_mcp_usage_source
  ON public.mcp_usage (source);
