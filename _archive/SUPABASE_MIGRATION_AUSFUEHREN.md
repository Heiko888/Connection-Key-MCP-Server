# 📋 Supabase Migration ausführen - reading_jobs Tabelle

**Datei:** `integration/supabase/migrations/009_create_reading_jobs_table.sql`

---

## 🎯 SCHNELLANLEITUNG

### Schritt 1: Supabase Dashboard öffnen

1. Gehe zu: **https://supabase.com/dashboard**
2. Wähle dein Projekt aus
3. Klicke auf: **SQL Editor** (linke Sidebar)

### Schritt 2: Migration ausführen

1. **Klicke auf:** "New query" (oder öffne einen neuen Tab)
2. **Kopiere den kompletten Inhalt** von `009_create_reading_jobs_table.sql`
3. **Füge den SQL-Code** in den Editor ein
4. **Klicke auf:** "Run" (oder drücke `Ctrl+Enter` / `Cmd+Enter`)

### Schritt 3: Prüfung

**Führe diese Query aus, um zu prüfen, ob die Tabelle erstellt wurde:**

```sql
-- Prüfe ob Tabelle existiert
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'reading_jobs';
```

**✅ Erwartet:** Eine Zeile mit `reading_jobs`

**Prüfe Schema:**

```sql
-- Prüfe alle Spalten
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'reading_jobs'
ORDER BY ordinal_position;
```

**✅ Erwartet:** 8 Spalten:
- `id` (uuid, NOT NULL)
- `user_id` (uuid, nullable)
- `reading_type` (varchar, nullable)
- `status` (varchar, NOT NULL, default 'pending')
- `result` (jsonb, nullable)
- `error` (text, nullable)
- `created_at` (timestamp with time zone, NOT NULL)
- `updated_at` (timestamp with time zone, NOT NULL)

**Prüfe Indizes:**

```sql
-- Prüfe Indizes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'reading_jobs';
```

**✅ Erwartet:** 5 Indizes

**Prüfe Trigger:**

```sql
-- Prüfe Trigger
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'reading_jobs';
```

**✅ Erwartet:** 1 Trigger (`trigger_update_reading_jobs_updated_at`)

**Prüfe RLS Policies:**

```sql
-- Prüfe RLS Policies
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'reading_jobs';
```

**✅ Erwartet:** 2 Policies:
- `Users can view their own reading_jobs` (SELECT)
- `Service role can manage all reading_jobs` (ALL)

---

## ⚠️ WICHTIGE HINWEISE

### Falls Fehler auftreten:

**Fehler: "extension uuid-ossp already exists"**
- ✅ **OK** - Extension existiert bereits, wird übersprungen

**Fehler: "table reading_jobs already exists"**
- ✅ **OK** - Tabelle existiert bereits
- Prüfe ob Schema korrekt ist (siehe Prüfung oben)

**Fehler: "policy already exists"**
- ✅ **OK** - Policy existiert bereits
- Migration ist idempotent (kann mehrfach ausgeführt werden)

**Fehler: "function already exists"**
- ✅ **OK** - Function existiert bereits
- Wird durch `CREATE OR REPLACE` aktualisiert

---

## 🧪 TEST: Tabelle funktioniert

**Nach erfolgreicher Migration, teste die Tabelle:**

```sql
-- Test 1: INSERT
INSERT INTO reading_jobs (user_id, reading_type, status)
VALUES (NULL, 'basic', 'pending')
RETURNING id, status, created_at;

-- Test 2: SELECT
SELECT id, status, created_at 
FROM reading_jobs 
ORDER BY created_at DESC 
LIMIT 1;

-- Test 3: UPDATE (Trigger testen)
UPDATE reading_jobs 
SET status = 'processing'
WHERE id = (SELECT id FROM reading_jobs ORDER BY created_at DESC LIMIT 1)
RETURNING id, status, updated_at;

-- Prüfe: updated_at sollte sich geändert haben
SELECT id, status, created_at, updated_at
FROM reading_jobs
WHERE id = (SELECT id FROM reading_jobs ORDER BY created_at DESC LIMIT 1);
```

**✅ Erwartet:**
- INSERT funktioniert
- SELECT funktioniert
- UPDATE funktioniert
- `updated_at` wird automatisch aktualisiert (Trigger)

---

## ✅ ERFOLGSKRITERIEN

- [ ] Migration ohne Fehler ausgeführt
- [ ] Tabelle `reading_jobs` existiert
- [ ] Alle 8 Spalten vorhanden
- [ ] Alle 5 Indizes erstellt
- [ ] Trigger funktioniert (`updated_at` wird automatisch aktualisiert)
- [ ] RLS Policies aktiv
- [ ] Test-INSERT/UPDATE funktioniert

---

**Status:** ✅ **Bereit für Ausführung**

**Nächster Schritt:** Nach erfolgreicher Migration → Frontend deployen (Schritt 2)
