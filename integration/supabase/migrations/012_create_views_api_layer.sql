-- Migration: Create Views as API & Compatibility Layer
-- Created: 2025-12-28
-- Description: Erstellt Views im public Schema als Abstraktionsschicht
-- 
-- WICHTIG: Views dienen als stabile API-Verträge
-- Tabellen können intern verschoben werden, Views bleiben stabil

-- ============================================
-- View: v_readings
-- ============================================
-- API-Layer für readings Tabelle
-- Ermöglicht spätere Schema-Moves ohne Code-Änderungen
CREATE OR REPLACE VIEW public.v_readings
AS
SELECT *
FROM public.readings;

-- RLS-Kompatibilität sicherstellen
ALTER VIEW public.v_readings
SET (security_invoker = true);

-- Kommentar
COMMENT ON VIEW public.v_readings IS 'API-Layer für readings Tabelle - RLS aktiv';

-- ============================================
-- View: v_reading_jobs
-- ============================================
-- API-Layer für reading_jobs Tabelle
CREATE OR REPLACE VIEW public.v_reading_jobs
AS
SELECT *
FROM public.reading_jobs;

-- RLS-Kompatibilität sicherstellen
ALTER VIEW public.v_reading_jobs
SET (security_invoker = true);

-- Kommentar
COMMENT ON VIEW public.v_reading_jobs IS 'API-Layer für reading_jobs Tabelle - RLS aktiv';

-- ============================================
-- View: v_agent_tasks
-- ============================================
-- API-Layer für agent_tasks Tabelle
CREATE OR REPLACE VIEW public.v_agent_tasks
AS
SELECT *
FROM public.agent_tasks;

-- RLS-Kompatibilität sicherstellen
ALTER VIEW public.v_agent_tasks
SET (security_invoker = true);

-- Kommentar
COMMENT ON VIEW public.v_agent_tasks IS 'API-Layer für agent_tasks Tabelle - RLS aktiv';

-- ============================================
-- View: v_agent_responses
-- ============================================
-- API-Layer für agent_responses Tabelle
CREATE OR REPLACE VIEW public.v_agent_responses
AS
SELECT *
FROM public.agent_responses;

-- RLS-Kompatibilität sicherstellen
ALTER VIEW public.v_agent_responses
SET (security_invoker = true);

-- Kommentar
COMMENT ON VIEW public.v_agent_responses IS 'API-Layer für agent_responses Tabelle - RLS aktiv';
