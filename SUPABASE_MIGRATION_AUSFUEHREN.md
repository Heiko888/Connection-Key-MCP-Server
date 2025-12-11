# 🔧 Supabase Migration ausführen

**Datum:** 17.12.2025

**Status:** Schritt-für-Schritt Anleitung

---

## 📋 Übersicht

**Migration:** `008_user_registration_trigger.sql`

**Zweck:** Automatisch Welcome Reading bei User-Registrierung generieren

**Was macht die Migration:**
- Erstellt Funktion `trigger_user_registration_reading()`
- Erstellt Trigger `user_registration_reading_trigger`
- Ruft n8n Webhook auf, wenn neuer User mit Geburtsdaten registriert wird

---

## 🚀 Schritt 1: Supabase Dashboard öffnen

1. **Supabase öffnen:** https://supabase.com
2. **Einloggen**
3. **Projekt auswählen** (dein ConnectionKey Projekt)

---

## 🚀 Schritt 2: SQL Editor öffnen

1. **Links im Menü:** **"SQL Editor"** klicken
2. **"New query"** klicken (oder "+" Button)

---

## 🚀 Schritt 3: Migration-Datei öffnen

**Auf Server:**

```bash
cd /opt/mcp-connection-key
cat integration/supabase/migrations/008_user_registration_trigger.sql
```

**Oder lokal:** Datei im Workspace öffnen:
```
integration/supabase/migrations/008_user_registration_trigger.sql
```

---

## 🚀 Schritt 4: SQL kopieren und ausführen

1. **SQL kopieren** aus der Migration-Datei (Zeilen 10-43, ohne Kommentare)
2. **In Supabase SQL Editor einfügen**
3. **"Run"** klicken (oder Ctrl+Enter)

**Wichtig:** Die Migration ist sicher:
- `DROP TRIGGER IF EXISTS` verhindert Fehler
- `CREATE OR REPLACE FUNCTION` ist idempotent

---

## ✅ Schritt 5: Prüfen - Migration erfolgreich?

**In Supabase SQL Editor:**

```sql
-- Prüfe ob Funktion existiert
SELECT proname 
FROM pg_proc 
WHERE proname = 'trigger_user_registration_reading';
```

**Erwartung:**
```
proname
--------------------------------
trigger_user_registration_reading
```

**Trigger prüfen:**

```sql
-- Prüfe ob Trigger existiert
SELECT tgname, tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname = 'user_registration_reading_trigger';
```

**Erwartung:**
```
tgname                              | table_name
------------------------------------|------------
user_registration_reading_trigger   | auth.users
```

---

## ⚠️ Wichtig: pg_net Extension

**Die Migration verwendet `pg_net` Extension für HTTP Requests.**

**Falls Fehler: "function net.http_post does not exist":**

1. **Supabase Dashboard** → **Database** → **Extensions**
2. **Suche:** `pg_net`
3. **Aktivieren** (falls nicht aktiviert)

**Oder via SQL:**

```sql
CREATE EXTENSION IF NOT EXISTS pg_net;
```

---

## 🧪 Schritt 6: Test (Optional)

**Nach Migration ausgeführt:**

**In Supabase SQL Editor:**

```sql
-- Test: Prüfe Trigger-Struktur
SELECT 
  t.tgname as trigger_name,
  t.tgrelid::regclass as table_name,
  p.proname as function_name,
  t.tgenabled as enabled
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE t.tgname = 'user_registration_reading_trigger';
```

**Erwartung:**
- ✅ Trigger existiert
- ✅ Funktion ist verknüpft
- ✅ Trigger ist aktiviert (`tgenabled = 'O'`)

---

## ✅ Checkliste

- [ ] Supabase Dashboard geöffnet
- [ ] SQL Editor geöffnet
- [ ] Migration-Datei geöffnet
- [ ] SQL kopiert
- [ ] SQL in Supabase ausgeführt
- [ ] Funktion existiert (Prüfung)
- [ ] Trigger existiert (Prüfung)
- [ ] pg_net Extension aktiviert (falls nötig)

---

## 🎯 Zusammenfassung

**Was wurde erstellt:**
- ✅ Funktion `trigger_user_registration_reading()`
- ✅ Trigger `user_registration_reading_trigger` auf `auth.users`

**Was passiert jetzt:**
- ✅ Bei neuer User-Registrierung mit Geburtsdaten
- ✅ Trigger wird ausgelöst
- ✅ Funktion ruft n8n Webhook auf
- ✅ n8n Workflow startet automatisch
- ✅ Welcome Reading wird generiert

---

**🎉 Migration erfolgreich! Weiter mit Environment Variables!** 🚀
