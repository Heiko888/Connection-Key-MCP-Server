-- Rollback: reading_validation_log
-- Achtung: Loescht alle Validator-Logs.

DROP TABLE IF EXISTS public.reading_validation_log CASCADE;
