-- Migration: User Registration → Welcome Reading Trigger
-- Created: 2025-12-14
-- Description: Automatisch Welcome Reading bei User-Registrierung generieren

-- ============================================
-- Funktion: Trigger User Registration Reading
-- ============================================
-- Ruft n8n Webhook auf, wenn neuer User registriert wird

CREATE OR REPLACE FUNCTION trigger_user_registration_reading()
RETURNS TRIGGER AS $$
BEGIN
  -- Prüfe ob Geburtsdaten vorhanden sind
  IF NEW.raw_user_meta_data->>'birth_date' IS NOT NULL THEN
    -- Rufe n8n Webhook auf (via pg_net extension)
    PERFORM net.http_post(
      url := 'https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'userId', NEW.id::text,
        'birthDate', NEW.raw_user_meta_data->>'birth_date',
        'birthTime', COALESCE(NEW.raw_user_meta_data->>'birth_time', '12:00'),
        'birthPlace', COALESCE(NEW.raw_user_meta_data->>'birth_place', 'Unknown')
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Trigger: User Registration Reading
-- ============================================
-- Wird ausgelöst nach User-Registrierung

DROP TRIGGER IF EXISTS user_registration_reading_trigger ON auth.users;

CREATE TRIGGER user_registration_reading_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
WHEN (NEW.raw_user_meta_data->>'birth_date' IS NOT NULL)
EXECUTE FUNCTION trigger_user_registration_reading();

-- ============================================
-- Alternative: Falls pg_net nicht verfügbar
-- ============================================
-- Verwende dann HTTP Request über Supabase Edge Function
-- ODER rufe direkt die Reading API auf

-- Alternative Funktion (falls pg_net nicht funktioniert):
/*
CREATE OR REPLACE FUNCTION trigger_user_registration_reading()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT := 'https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered';
  payload JSONB;
BEGIN
  IF NEW.raw_user_meta_data->>'birth_date' IS NOT NULL THEN
    payload := json_build_object(
      'userId', NEW.id::text,
      'birthDate', NEW.raw_user_meta_data->>'birth_date',
      'birthTime', COALESCE(NEW.raw_user_meta_data->>'birth_time', '12:00'),
      'birthPlace', COALESCE(NEW.raw_user_meta_data->>'birth_place', 'Unknown')
    );
    
    -- Hier würde ein HTTP Request gemacht werden
    -- Falls pg_net nicht verfügbar, verwende Supabase Edge Function
    -- ODER rufe direkt /api/reading/generate auf
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/

