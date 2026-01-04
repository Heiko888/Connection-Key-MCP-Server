# 🔍 Reading Jobs Pending - Analyse & Cleanup

**Datum:** 28.12.2025  
**Problem:** 6 Reading-Jobs bleiben im Status `pending` und wurden nie aktualisiert

---

## 📊 AKTUELLER STATUS (aus CSV)

### Hängende Jobs:

| ID | Status | Created | Updated | reading_id |
|---|---|---|---|---|
| `33e51256-af27-40ca-9ce8-4920186e0cc1` | `pending` | 2025-12-28 18:27:22 | 2025-12-28 18:27:22 | `70884761-d156-43a4-8c18-68b77c5efc1d` |
| `5aeee44e-5eed-40ba-bfc4-f05550cd8a90` | `pending` | 2025-12-28 19:27:05 | 2025-12-28 19:27:05 | `3257c13c-440d-4222-a406-5c60dad3abd1` |
| `62519b09-cb01-499b-aed1-a37c55b6f8b4` | `pending` | 2025-12-28 19:32:51 | 2025-12-28 19:32:51 | `f832808e-595b-4e78-af50-0dcba96f7520` |
| `c642b2c9-c0b1-4b9e-a33b-e47c4755e814` | `pending` | 2025-12-28 18:24:54 | 2025-12-28 18:24:54 | `326227f9-0870-4981-aa63-128d2b0cf726` |
| `ce0c058d-d944-415e-b620-bb4a7184f5c3` | `pending` | 2025-12-28 11:47:52 | 2025-12-28 11:47:52 | `e3912bfa-cccf-4a33-96ba-a5a340b6a665` |
| `ce2b7102-fd86-46b4-9000-b4f3c69ce672` | `pending` | 2025-12-27 18:18:37 | 2025-12-27 18:18:37 | `07cffdeb-a6d6-4f04-ba65-cc83326e117b` |

**Gemeinsame Probleme:**
- ✅ `status` = `pending` (nie aktualisiert)
- ✅ `result` = `NULL` (kein Ergebnis gespeichert)
- ✅ `payload` = `NULL` (kein Payload gespeichert)
- ✅ `updated_at` = `created_at` (nie aktualisiert)
- ⚠️ **Tabellenstruktur weicht ab:** CSV zeigt `reading_id` und `payload` Spalten, die in Migration `009` nicht existieren

---

## 🔍 ROOT CAUSE ANALYSE

### Problem 1: Tabellenstruktur-Inkonsistenz

**CSV zeigt:**
```sql
reading_jobs (
  id,
  user_id,
  status,
  payload,        -- ← NICHT in Migration 009!
  result,
  created_at,
  updated_at,
  reading_id      -- ← NICHT in Migration 009!
)
```

**Migration 009 definiert:**
```sql
reading_jobs (
  id,
  user_id,
  reading_type,   -- ← FEHLT in CSV!
  status,
  result,
  error,          -- ← FEHLT in CSV!
  created_at,
  updated_at
)
```

**⚠️ FAZIT:** Die Tabelle wurde **NICHT** mit Migration `009` erstellt, sondern mit einer anderen/älteren Struktur!

---

### Problem 2: Jobs werden nie aktualisiert

**Mögliche Ursachen:**

1. **n8n Workflow wurde nie aufgerufen**
   - MCP Gateway antwortet nicht
   - MCP Core Tool `generateReading` wird nicht ausgeführt
   - n8n Webhook-Pfad falsch

2. **n8n Workflow schlägt fehl (silent)**
   - Validierung schlägt fehl
   - CK-Agent antwortet nicht
   - Supabase UPDATE schlägt fehl (RLS Policy?)

3. **readingId wird nicht korrekt weitergegeben**
   - Frontend sendet `readingId` nicht
   - MCP Core empfängt `readingId` nicht
   - n8n erhält `readingId` nicht

4. **UPDATE findet falschen Datensatz**
   - `readingId` stimmt nicht mit `reading_jobs.id` überein
   - UPDATE verwendet `reading_id` statt `id`

---

## 🛠️ CLEANUP-STRATEGIE

### Option A: Jobs als `failed` markieren (Empfohlen)

**Begründung:**
- Jobs sind zu alt (> 1 Stunde)
- Keine Möglichkeit, sie nachträglich zu verarbeiten
- System sollte neue Jobs mit korrekter Struktur erstellen

**SQL:**
```sql
-- Markiere alle hängenden Jobs als failed
UPDATE reading_jobs
SET 
  status = 'failed',
  error = 'Job stuck in pending - system cleanup',
  updated_at = timezone('utc', now())
WHERE 
  status = 'pending' 
  AND updated_at < timezone('utc', now()) - INTERVAL '1 hour';
```

---

### Option B: Jobs löschen

**Begründung:**
- Jobs sind fehlerhaft (falsche Struktur)
- Keine Datenverluste (kein `result` vorhanden)

**SQL:**
```sql
-- Lösche alle hängenden Jobs ohne Ergebnis
DELETE FROM reading_jobs
WHERE 
  status = 'pending' 
  AND result IS NULL
  AND updated_at < timezone('utc', now()) - INTERVAL '1 hour';
```

---

### Option C: Tabellenstruktur korrigieren

**Wenn `reading_id` und `payload` Spalten tatsächlich existieren:**

1. **Prüfe aktuelle Struktur:**
```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'reading_jobs'
ORDER BY ordinal_position;
```

2. **Migration anpassen:**
   - Entweder: Spalten entfernen (wenn nicht benötigt)
   - Oder: Migration erweitern (wenn benötigt)

---

## ✅ EMPFOHLENE VORGEHENSWEISE

### Schritt 1: Tabellenstruktur prüfen

```sql
-- Prüfe aktuelle Struktur
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'reading_jobs'
ORDER BY ordinal_position;
```

### Schritt 2: Hängende Jobs markieren

```sql
-- Markiere alle hängenden Jobs als failed
UPDATE reading_jobs
SET 
  status = 'failed',
  error = 'Job stuck in pending - cleaned up on 2025-12-28',
  updated_at = timezone('utc', now())
WHERE 
  status = 'pending' 
  AND result IS NULL
  AND updated_at < timezone('utc', now()) - INTERVAL '1 hour';

-- Prüfe Ergebnis
SELECT 
  id,
  status,
  error,
  updated_at
FROM reading_jobs
WHERE id IN (
  '33e51256-af27-40ca-9ce8-4920186e0cc1',
  '5aeee44e-5eed-40ba-bfc4-f05550cd8a90',
  '62519b09-cb01-499b-aed1-a37c55b6f8b4',
  'c642b2c9-c0b1-4b9e-a33b-e47c4755e814',
  'ce0c058d-d944-415e-b620-bb4a7184f5c3',
  'ce2b7102-fd86-46b4-9000-b4f3c69ce672'
);
```

### Schritt 3: Tabellenstruktur korrigieren (falls nötig)

**Falls `reading_id` und `payload` Spalten existieren, aber nicht benötigt werden:**
```sql
-- Entferne nicht benötigte Spalten (VORSICHT: Backup vorher!)
ALTER TABLE reading_jobs DROP COLUMN IF EXISTS reading_id;
ALTER TABLE reading_jobs DROP COLUMN IF EXISTS payload;
```

**Falls `reading_type` und `error` Spalten fehlen:**
```sql
-- Füge fehlende Spalten hinzu
ALTER TABLE reading_jobs 
  ADD COLUMN IF NOT EXISTS reading_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS error TEXT;
```

### Schritt 4: Migration 009 neu ausführen (falls Struktur komplett falsch)

**⚠️ WICHTIG:** Nur wenn Struktur komplett abweicht!

```sql
-- Backup erstellen
CREATE TABLE reading_jobs_backup AS SELECT * FROM reading_jobs;

-- Tabelle neu erstellen (Migration 009)
-- (siehe: integration/supabase/migrations/009_create_reading_jobs_table.sql)

-- Daten migrieren (falls möglich)
-- ...
```

---

## 🔍 DEBUGGING: Warum bleiben neue Jobs hängen?

### Prüfschritte:

1. **Frontend Logs prüfen:**
   ```bash
   # Server 167 (CK-App)
   docker logs the-connection-key-frontend-1 --tail 100 | grep "Reading Generate API"
   ```

2. **MCP Core Logs prüfen:**
   ```bash
   # Server 138 (Hetzner)
   journalctl -u mcp -n 100 | grep "MCP Core"
   # ODER
   pm2 logs mcp --lines 50
   ```

3. **n8n Workflow Execution prüfen:**
   - Öffne n8n UI: https://n8n.werdemeisterdeinergedankenagent.de
   - Gehe zu: Workflows → "Reading Generation Workflow"
   - Prüfe: "Executions" Tab
   - Prüfe: Letzte Executions auf Fehler

4. **Supabase RLS Policies prüfen:**
   ```sql
   -- Prüfe Policies
   SELECT * FROM pg_policies WHERE tablename = 'reading_jobs';
   
   -- Prüfe ob Service Role Zugriff hat
   SET ROLE service_role;
   SELECT COUNT(*) FROM reading_jobs WHERE status = 'pending';
   ```

---

## 📋 CHECKLISTE

- [ ] Tabellenstruktur prüfen (Schritt 1)
- [ ] Hängende Jobs markieren (Schritt 2)
- [ ] Tabellenstruktur korrigieren (Schritt 3, falls nötig)
- [ ] Frontend Logs prüfen
- [ ] MCP Core Logs prüfen
- [ ] n8n Workflow Execution prüfen
- [ ] Supabase RLS Policies prüfen
- [ ] Test-Request durchführen (neuer Job)
- [ ] Prüfen ob neuer Job korrekt verarbeitet wird

---

**Status:** ⚠️ **Bereit für Cleanup - Struktur-Inkonsistenz erkannt**
