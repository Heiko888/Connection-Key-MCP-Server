# ✅ Supabase Struktur-Korrektur - Zusammenfassung

**Datum:** 28.12.2025  
**Status:** Migration 010 bereit für Ausführung

---

## 📊 ERKANNTE PROBLEME

### Aktuelle Struktur (aus Prüfung):

| Spalte | Status | Aktion |
|---|---|---|
| `id` | ✅ Vorhanden | Behalten |
| `user_id` | ✅ Vorhanden | Behalten |
| `status` | ✅ Vorhanden | Behalten |
| `result` | ✅ Vorhanden | Behalten |
| `created_at` | ✅ Vorhanden | Behalten |
| `updated_at` | ✅ Vorhanden | Behalten |
| `reading_id` | ⚠️ Zusätzlich | **ENTFERNEN** (nicht in Migration 009) |
| `payload` | ⚠️ Zusätzlich | **ENTFERNEN** (nicht in Migration 009) |
| `reading_type` | ❌ Fehlt | **HINZUFÜGEN** |
| `error` | ❌ Fehlt | **HINZUFÜGEN** |

---

## 🛠️ MIGRATION 010 - AUSFÜHRUNG

### Schritt 1: Fehlende Spalten hinzufügen

```sql
ALTER TABLE reading_jobs 
  ADD COLUMN IF NOT EXISTS reading_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS error TEXT;
```

**Erwartet:** ✅ 2 Spalten hinzugefügt

---

### Schritt 2: Hängende Jobs als `failed` markieren

```sql
UPDATE reading_jobs
SET 
  status = 'failed',
  error = 'Job stuck in pending - cleaned up on 2025-12-28',
  updated_at = timezone('utc', now())
WHERE 
  status = 'pending' 
  AND result IS NULL
  AND updated_at < timezone('utc', now()) - INTERVAL '1 hour';
```

**Erwartet:** ✅ 6 Jobs aktualisiert (aus CSV bekannt)

---

### Schritt 3: Nicht benötigte Spalten entfernen

```sql
ALTER TABLE reading_jobs DROP COLUMN IF EXISTS reading_id;
ALTER TABLE reading_jobs DROP COLUMN IF EXISTS payload;
```

**Erwartet:** ✅ 2 Spalten entfernt

---

## ✅ ERWARTETE ENDSTRUKTUR (nach Migration 010)

| Spalte | Datentyp | Nullable | Beschreibung |
|---|---|---|---|
| `id` | UUID | NO | Primary Key |
| `user_id` | UUID | YES | Foreign Key zu `auth.users` |
| `reading_type` | VARCHAR(50) | YES | Reading-Typ (basic, detailed, etc.) |
| `status` | VARCHAR(20) | NO | Status (pending, processing, completed, failed, cancelled) |
| `result` | JSONB | YES | Ergebnis (JSON) |
| `error` | TEXT | YES | Fehlermeldung |
| `created_at` | TIMESTAMPTZ | NO | Erstellungszeit |
| `updated_at` | TIMESTAMPTZ | NO | Update-Zeit |

**Total:** 8 Spalten (entspricht Migration 009)

---

## 📋 PRÜFUNG NACH MIGRATION

### 1. Struktur prüfen:

```sql
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'reading_jobs'
ORDER BY ordinal_position;
```

**Erwartet:** 8 Spalten (siehe Tabelle oben)

---

### 2. Hängende Jobs prüfen:

```sql
SELECT 
  COUNT(*) as pending_jobs
FROM reading_jobs
WHERE status = 'pending';
```

**Erwartet:** `0` (alle als `failed` markiert)

---

### 3. Failed Jobs prüfen:

```sql
SELECT 
  id,
  status,
  error,
  updated_at
FROM reading_jobs
WHERE status = 'failed'
ORDER BY updated_at DESC
LIMIT 10;
```

**Erwartet:** 6 Jobs mit `error = 'Job stuck in pending - cleaned up on 2025-12-28'`

---

## ⚠️ WICHTIGE HINWEISE

### Warum `reading_id` entfernen?

- **Nicht in Migration 009:** Die Spalte wurde nie definiert
- **Nicht im Code verwendet:** Frontend verwendet `id` als Primary Key
- **Verwirrend:** `reading_id` vs. `id` führt zu Verwirrung
- **Keine Datenverluste:** Spalte ist immer `NULL` (aus CSV ersichtlich)

### Warum `payload` entfernen?

- **Nicht in Migration 009:** Die Spalte wurde nie definiert
- **Nicht im Code verwendet:** Payload wird nur zwischen Services übergeben, nicht gespeichert
- **Keine Datenverluste:** Spalte ist immer `NULL` (aus CSV ersichtlich)

---

## 🚀 NÄCHSTE SCHRITTE

1. ✅ Migration 010 in Supabase ausführen
2. ✅ Struktur prüfen (Schritt 1)
3. ✅ Hängende Jobs prüfen (Schritt 2)
4. ✅ Failed Jobs prüfen (Schritt 3)
5. ✅ Test-Request durchführen (neuer Job)
6. ✅ Prüfen ob neuer Job korrekt verarbeitet wird

---

**Status:** ✅ **Bereit für Ausführung**
