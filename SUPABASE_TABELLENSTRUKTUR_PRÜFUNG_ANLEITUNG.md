# 🔍 Supabase Tabellenstruktur Prüfung - Anleitung

**Datum:** 28.12.2025  
**Ziel:** Prüfe aktuelle Struktur der `reading_jobs` Tabelle

---

## 📋 VORGEHENSWEISE

### Schritt 1: Supabase Dashboard öffnen

1. Gehe zu: **https://supabase.com/dashboard**
2. Wähle dein Projekt aus
3. Klicke auf: **SQL Editor** (linke Sidebar)

### Schritt 2: Prüfungs-Query ausführen

1. **Klicke auf:** "New query" (oben rechts)
2. **Öffne Datei:** `SUPABASE_TABELLENSTRUKTUR_PRÜFUNG.sql`
3. **Kopiere den kompletten Inhalt** der Datei
4. **Füge in SQL Editor ein**
5. **Klicke auf:** "Run" (oder `Ctrl+Enter`)

### Schritt 3: Ergebnisse analysieren

Die Query liefert 9 Ergebnis-Sets:

1. **Tabelle existiert?** → Sollte `reading_jobs` zeigen
2. **Spalten-Informationen** → Zeigt alle Spalten mit Datentypen
3. **Constraints** → Primary Key, Foreign Keys, Checks
4. **Indizes** → Alle Indizes auf der Tabelle
5. **Trigger** → `updated_at` Trigger sollte vorhanden sein
6. **RLS Policies** → 2 Policies sollten vorhanden sein
7. **Daten-Statistik** → Anzahl Jobs pro Status
8. **Struktur-Vergleich** → Fehlende/extra Spalten
9. **Beispiel-Datensatz** → Zeigt einen aktuellen Datensatz

---

## ✅ ERWARTETE STRUKTUR (Migration 009)

### Spalten:

| Spalte | Datentyp | Nullable | Default | Beschreibung |
|---|---|---|---|---|
| `id` | UUID | NO | `uuid_generate_v4()` | Primary Key |
| `user_id` | UUID | YES | NULL | Foreign Key zu `auth.users` |
| `reading_type` | VARCHAR(50) | YES | NULL | Reading-Typ (basic, detailed, etc.) |
| `status` | VARCHAR(20) | NO | `'pending'` | Status mit CHECK Constraint |
| `result` | JSONB | YES | NULL | Ergebnis (JSON) |
| `error` | TEXT | YES | NULL | Fehlermeldung |
| `created_at` | TIMESTAMPTZ | NO | `timezone('utc', now())` | Erstellungszeit |
| `updated_at` | TIMESTAMPTZ | NO | `timezone('utc', now())` | Update-Zeit |

### Constraints:

- **Primary Key:** `id`
- **Foreign Key:** `user_id` → `auth.users(id)` ON DELETE SET NULL
- **Check:** `status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')`

### Indizes (5 Stück):

1. `idx_reading_jobs_status` auf `status`
2. `idx_reading_jobs_user_id` auf `user_id`
3. `idx_reading_jobs_created_at` auf `created_at DESC`
4. `idx_reading_jobs_updated_at` auf `updated_at DESC`
5. `idx_reading_jobs_user_status_created` auf `(user_id, status, created_at DESC)`

### Trigger:

- `trigger_update_reading_jobs_updated_at` → Aktualisiert `updated_at` bei UPDATE

### RLS Policies (2 Stück):

1. `Users can view their own reading_jobs` → SELECT für eigene Jobs
2. `Service role can manage all reading_jobs` → ALL für Service Role

---

## ⚠️ ERKANNTE INKONSISTENZEN (aus CSV)

### CSV zeigt zusätzliche Spalten:

- `reading_id` → **NICHT** in Migration 009!
- `payload` → **NICHT** in Migration 009!

### CSV zeigt fehlende Spalten:

- `reading_type` → **FEHLT** in CSV!
- `error` → **FEHLT** in CSV!

---

## 🔍 INTERPRETATION DER ERGEBNISSE

### Wenn alle Spalten korrekt sind:

✅ **Tabelle wurde mit Migration 009 erstellt**  
→ Cleanup-Migration `010` kann ausgeführt werden

### Wenn `reading_id` und `payload` vorhanden sind:

⚠️ **Tabelle wurde mit alter/anderer Struktur erstellt**  
→ Optionen:
1. Spalten entfernen (wenn nicht benötigt)
2. Migration anpassen (wenn benötigt)

### Wenn `reading_type` und `error` fehlen:

⚠️ **Tabelle ist unvollständig**  
→ Migration `010` fügt fehlende Spalten hinzu

---

## 📊 NÄCHSTE SCHRITTE

### Falls Struktur korrekt ist:

1. ✅ Cleanup-Migration `010` ausführen
2. ✅ Hängende Jobs als `failed` markieren
3. ✅ Test-Request durchführen

### Falls Struktur inkonsistent ist:

1. ⚠️ Struktur korrigieren (Migration `010` anpassen)
2. ⚠️ Backup erstellen
3. ⚠️ Spalten hinzufügen/entfernen
4. ⚠️ Test-Request durchführen

---

**Status:** ⏳ **Warte auf Prüfungsergebnisse**
