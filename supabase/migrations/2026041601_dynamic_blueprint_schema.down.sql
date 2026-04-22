-- Rollback: Dynamic Blueprint System — Phase 1
-- Achtung: Löscht alle Daten in diesen Tabellen!

DROP TABLE IF EXISTS public.reading_sections CASCADE;
DROP TABLE IF EXISTS public.client_profiles CASCADE;
-- Trigger-Funktion bleibt (wird ggf. von anderen Tabellen genutzt)
