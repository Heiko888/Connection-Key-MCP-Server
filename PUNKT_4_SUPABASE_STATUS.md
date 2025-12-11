# ✅ Punkt 4: Supabase - Status

**Datum:** 17.12.2025

**Status:** Environment Variables gesetzt ✅, Migration muss noch ausgeführt werden

---

## ✅ Was bereits erledigt ist

### Environment Variables
- ✅ `NEXT_PUBLIC_SUPABASE_URL` = `https://njjcywgskzepikyzhihy.supabase.co`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = Gesetzt

---

## ⚠️ Was noch zu tun ist

### Migration ausführen

**Die Migration-Datei existiert im Workspace, muss aber in Supabase ausgeführt werden.**

---

## 🚀 Migration ausführen - Schritt für Schritt

### Schritt 1: SQL kopieren

**Hier ist der SQL-Code, den du in Supabase ausführen musst:**

```sql
-- Migration: User Registration → Welcome Reading Trigger
-- Erstellt Funktion und Trigger für automatische Reading-Generierung

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

-- Trigger: User Registration Reading
DROP TRIGGER IF EXISTS user_registration_reading_trigger ON auth.users;

CREATE TRIGGER user_registration_reading_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
WHEN (NEW.raw_user_meta_data->>'birth_date' IS NOT NULL)
EXECUTE FUNCTION trigger_user_registration_reading();
```

---

### Schritt 2: In Supabase ausführen

1. **Supabase Dashboard öffnen:** https://supabase.com
2. **Projekt auswählen:** `njjcywgskzepikyzhihy`
3. **SQL Editor** öffnen (links im Menü)
4. **"New query"** klicken
5. **SQL oben kopieren** und einfügen
6. **"Run"** klicken (oder Ctrl+Enter)

---

### Schritt 3: pg_net Extension aktivieren (falls Fehler)

**Falls Fehler: "function net.http_post does not exist":**

**In Supabase SQL Editor:**

```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

**Dann Migration erneut ausführen.**

---

### Schritt 4: Prüfen - Migration erfolgreich?

**In Supabase SQL Editor:**

```sql
-- Prüfe ob Funktion existiert
SELECT proname 
FROM pg_proc 
WHERE proname = 'trigger_user_registration_reading';

-- Prüfe ob Trigger existiert
SELECT tgname, tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname = 'user_registration_reading_trigger';
```

**Erwartung:**
- ✅ Funktion sollte existieren
- ✅ Trigger sollte existieren
- ✅ Trigger auf `auth.users` Tabelle

---

## ✅ Checkliste: Punkt 4

- [x] `NEXT_PUBLIC_SUPABASE_URL` in `.env` ✅
- [x] `SUPABASE_SERVICE_ROLE_KEY` in `.env` ✅
- [ ] Migration in Supabase ausgeführt
- [ ] Funktion `trigger_user_registration_reading()` existiert
- [ ] Trigger `user_registration_reading_trigger` existiert
- [ ] pg_net Extension aktiviert (falls nötig)

---

## 🎯 Zusammenfassung

**Was funktioniert:**
- ✅ Environment Variables gesetzt
- ✅ Supabase URL konfiguriert

**Was noch fehlt:**
- ⚠️ Migration in Supabase ausführen (5 Min)

**Nach Migration:**
- ✅ User-Registrierung → Reading Automation funktioniert vollständig
- ✅ Supabase Trigger löst automatisch n8n Webhook aus

---

**🎯 Nächster Schritt: Migration in Supabase ausführen!** 🚀
