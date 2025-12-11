# ✅ Supabase Migration 001 ausführen

## 📋 Situation

Die Tabelle `readings` wurde gelöscht. Jetzt kann Migration 001 neu ausgeführt werden, die die komplette Tabelle mit allen Spalten erstellt.

---

## 🚀 Migration ausführen

### Schritt 1: Supabase Dashboard öffnen

1. Gehe zu: https://supabase.com/dashboard
2. Wähle dein Projekt aus

### Schritt 2: SQL Editor öffnen

- Klicke auf **SQL Editor** im linken Menü

### Schritt 3: Migration 001 ausführen

1. **Öffne die Datei:**
   - `integration/supabase/migrations/001_create_readings_tables.sql`

2. **Kopiere den KOMPLETTEN Inhalt** (267 Zeilen)

3. **Füge ihn in den SQL Editor ein**

4. **Klicke auf Run** (oder drücke `Ctrl+Enter`)

---

## ✅ Was wird erstellt

### Tabelle: `readings`

Mit folgenden Spalten:
- ✅ `id` (UUID, Primary Key)
- ✅ `user_id` (UUID, optional)
- ✅ `reading_type` (VARCHAR)
- ✅ `birth_date` (DATE) ✅
- ✅ `birth_time` (TIME) ✅
- ✅ `birth_place` (VARCHAR) ✅
- ✅ `birth_date2` (DATE, optional)
- ✅ `birth_time2` (TIME, optional)
- ✅ `birth_place2` (VARCHAR, optional)
- ✅ `reading_text` (TEXT)
- ✅ `reading_sections` (JSONB)
- ✅ `chart_data` (JSONB)
- ✅ `metadata` (JSONB)
- ✅ `status` (VARCHAR) ✅ **WICHTIG!**
- ✅ `created_at` (TIMESTAMP)
- ✅ `updated_at` (TIMESTAMP)

### Tabelle: `reading_history`

Für User-Interaktionen mit Readings.

### Indizes

Für Performance-Optimierung.

### Row Level Security (RLS)

Für sicheren Zugriff.

---

## 🧪 Nach der Migration testen

```bash
curl -X POST http://localhost:3000/api/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "detailed"
  }'
```

**Erwartete Response:**
```json
{
  "success": true,
  "readingId": "...",
  "reading": {
    "text": "..."
  },
  "metadata": { ... },
  "essence": { ... }
}
```

---

## ⚠️ Wichtig

- ✅ Migration 001 erstellt **ALLES** (inkl. `status` Spalte)
- ❌ Migration 004 ist **NICHT mehr nötig** (nur wenn Tabelle bereits existiert)
- ✅ Nach Migration 001 sollte alles funktionieren

---

## 📝 Optional: Weitere Migrationen

Falls du später möchtest:

- **002_create_readings_functions.sql** - Helper-Funktionen (optional)
- **003_add_processing_status.sql** - Status-History Tabelle (optional)

Aber für die Essence-Integration reicht Migration 001!

---

**Status:** ⏳ **Migration 001 ausführen**

