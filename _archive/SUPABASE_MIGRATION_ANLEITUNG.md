# 🔧 Supabase Migration ausführen

## ❌ Problem

```
Could not find the 'birth_date' column of 'readings' in the schema cache
```

**Ursache:** Die Supabase-Migration wurde noch nicht ausgeführt. Die Tabelle `readings` existiert nicht.

---

## ✅ Lösung: Migration ausführen

### Option 1: Via Supabase Dashboard (empfohlen)

1. **Öffne Supabase Dashboard**
   - Gehe zu: https://supabase.com/dashboard
   - Wähle dein Projekt aus

2. **Gehe zu SQL Editor**
   - Klicke auf **SQL Editor** im linken Menü

3. **Führe Migration 001 aus**
   - Öffne die Datei: `integration/supabase/migrations/001_create_readings_tables.sql`
   - Kopiere den **kompletten Inhalt**
   - Füge ihn in den SQL Editor ein
   - Klicke auf **Run** (oder drücke `Ctrl+Enter`)

4. **Führe Migration 002 aus** (optional, für Funktionen)
   - Öffne die Datei: `integration/supabase/migrations/002_create_readings_functions.sql`
   - Kopiere den **kompletten Inhalt**
   - Füge ihn in den SQL Editor ein
   - Klicke auf **Run**

5. **Führe Migration 003 aus** (optional, für Status-History)
   - Öffne die Datei: `integration/supabase/migrations/003_add_processing_status.sql`
   - Kopiere den **kompletten Inhalt**
   - Füge ihn in den SQL Editor ein
   - Klicke auf **Run**

---

### Option 2: Via Supabase CLI

```bash
# Falls Supabase CLI installiert ist
supabase db push

# Oder einzeln
supabase migration up
```

---

## 🧪 Nach der Migration testen

```bash
# Teste erneut
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

## 📋 Migration-Dateien

1. **001_create_readings_tables.sql**
   - Erstellt `readings` Tabelle
   - Erstellt `reading_history` Tabelle
   - Indizes und RLS Policies

2. **002_create_readings_functions.sql** (optional)
   - Helper-Funktionen für Readings
   - User-Statistiken

3. **003_add_processing_status.sql** (optional)
   - Status-History Tabelle
   - Processing-Status Support

---

## ✅ Nach erfolgreicher Migration

Die Tabelle `readings` sollte jetzt existieren mit folgenden Spalten:
- `id` (UUID)
- `user_id` (UUID, optional)
- `reading_type` (VARCHAR)
- `birth_date` (DATE) ✅
- `birth_time` (TIME) ✅
- `birth_place` (VARCHAR) ✅
- `reading_text` (TEXT)
- `reading_sections` (JSONB)
- `chart_data` (JSONB)
- `metadata` (JSONB)
- `status` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

---

## 🔍 Prüfen ob Migration erfolgreich war

Im Supabase Dashboard:
1. Gehe zu **Table Editor**
2. Suche nach Tabelle `readings`
3. Prüfe ob die Spalten vorhanden sind

Oder via SQL:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'readings';
```

---

**Status:** ⏳ **Migration muss ausgeführt werden**

