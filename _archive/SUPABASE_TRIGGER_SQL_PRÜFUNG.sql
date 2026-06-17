-- 🔍 Prüfe Supabase Trigger: user_registration_reading_trigger
-- In Supabase SQL Editor ausführen

-- ============================================
-- 1. Prüfe ob Trigger existiert
-- ============================================
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  CASE 
    WHEN tgenabled = 'O' THEN 'Enabled'
    WHEN tgenabled = 'D' THEN 'Disabled'
    ELSE 'Unknown'
  END as status
FROM pg_trigger 
WHERE tgname = 'user_registration_reading_trigger';

-- ============================================
-- 2. Prüfe ob Funktion existiert
-- ============================================
SELECT proname as function_name
FROM pg_proc 
WHERE proname = 'trigger_user_registration_reading';

-- ============================================
-- 3. Prüfe Trigger-Details (komplett)
-- ============================================
SELECT 
  t.tgname as trigger_name,
  t.tgrelid::regclass as table_name,
  p.proname as function_name,
  CASE 
    WHEN t.tgenabled = 'O' THEN 'Enabled ✅'
    WHEN t.tgenabled = 'D' THEN 'Disabled ⚠️'
    ELSE 'Unknown'
  END as status
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'user_registration_reading_trigger';

-- ============================================
-- 4. Falls Trigger disabled: Aktivieren
-- ============================================
-- ALTER TABLE auth.users ENABLE TRIGGER user_registration_reading_trigger;
