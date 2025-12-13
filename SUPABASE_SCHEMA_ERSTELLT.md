# ✅ B1: Supabase Schema erstellt

## 📋 Was wurde erstellt

### 1. **001_create_readings_tables.sql** - Tabellen-Migration

**Erstellt:**
- ✅ `readings` Tabelle - Speichert alle Readings
- ✅ `reading_history` Tabelle - Speichert User-Interaktionen
- ✅ Indizes für Performance (8 Indizes)
- ✅ Row Level Security (RLS) Policies
- ✅ Trigger für `updated_at` automatische Aktualisierung

**Features:**
- ✅ UUID Primary Keys
- ✅ Foreign Keys zu `auth.users`
- ✅ JSONB für Sections und Chart-Daten
- ✅ Check Constraints für Reading-Typen und Status
- ✅ Timestamps mit Timezone

---

### 2. **002_create_readings_functions.sql** - Helper-Funktionen

**Erstellt:**
- ✅ `get_user_readings()` - User Readings mit Pagination
- ✅ `get_reading_by_id()` - Spezifisches Reading
- ✅ `get_reading_statistics()` - User-Statistiken
- ✅ `track_reading_view()` - History-Tracking
- ✅ `mark_reading_shared()` - Sharing-Tracking
- ✅ `mark_reading_exported()` - Export-Tracking

---

## 📊 Tabellen-Details

### **readings Tabelle**

```sql
CREATE TABLE readings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  reading_type VARCHAR(50) NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  birth_place VARCHAR(255) NOT NULL,
  birth_date2 DATE,              -- Für Compatibility
  birth_time2 TIME,               -- Für Compatibility
  birth_place2 VARCHAR(255),      -- Für Compatibility
  reading_text TEXT NOT NULL,
  reading_sections JSONB,         -- Strukturierte Sections
  chart_data JSONB,               -- Chart-Daten
  metadata JSONB,                 -- tokens, model, etc.
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indizes:**
- `idx_readings_user_id` - User-ID
- `idx_readings_reading_type` - Reading-Typ
- `idx_readings_created_at` - Erstellt am (DESC)
- `idx_readings_status` - Status
- `idx_readings_birth_date` - Geburtsdatum
- `idx_readings_user_type_created` - Composite
- `idx_readings_reading_sections_gin` - GIN für JSONB
- `idx_readings_chart_data_gin` - GIN für JSONB

---

### **reading_history Tabelle**

```sql
CREATE TABLE reading_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  reading_id UUID REFERENCES readings(id),
  viewed_at TIMESTAMP WITH TIME ZONE,
  shared BOOLEAN DEFAULT false,
  exported BOOLEAN DEFAULT false,
  exported_format VARCHAR(20),
  exported_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);
```

**Indizes:**
- `idx_reading_history_user_id` - User-ID
- `idx_reading_history_reading_id` - Reading-ID
- `idx_reading_history_viewed_at` - Angesehen am (DESC)
- `idx_reading_history_user_viewed` - Composite

---

## 🔒 Row Level Security (RLS)

### **readings Policies:**
- ✅ Users können ihre eigenen Readings sehen
- ✅ Users können ihre eigenen Readings erstellen
- ✅ Users können ihre eigenen Readings aktualisieren
- ✅ Users können ihre eigenen Readings löschen
- ✅ Service Role kann alle Readings sehen/erstellen (für API)

### **reading_history Policies:**
- ✅ Users können ihre eigene History sehen
- ✅ Users können ihre eigene History erstellen
- ✅ Users können ihre eigene History aktualisieren
- ✅ Service Role kann alle History-Einträge sehen/erstellen (für API)

---

## 🔧 Helper-Funktionen

### **get_user_readings(user_id, limit, offset, reading_type)**
```sql
SELECT * FROM get_user_readings(
  'user-uuid-here',
  50,    -- limit
  0,     -- offset
  'detailed'  -- reading_type (optional)
);
```

### **get_reading_by_id(reading_id, user_id)**
```sql
SELECT * FROM get_reading_by_id(
  'reading-uuid-here',
  'user-uuid-here'  -- optional
);
```

### **get_reading_statistics(user_id)**
```sql
SELECT * FROM get_reading_statistics('user-uuid-here');
-- Gibt zurück:
-- - total_readings
-- - readings_by_type (JSONB)
-- - latest_reading_date
-- - total_tokens
```

### **track_reading_view(user_id, reading_id)**
```sql
SELECT track_reading_view('user-uuid-here', 'reading-uuid-here');
-- Erstellt oder aktualisiert History-Eintrag
```

### **mark_reading_shared(user_id, reading_id)**
```sql
SELECT mark_reading_shared('user-uuid-here', 'reading-uuid-here');
-- Markiert Reading als geteilt
```

### **mark_reading_exported(user_id, reading_id, format)**
```sql
SELECT mark_reading_exported(
  'user-uuid-here',
  'reading-uuid-here',
  'pdf'  -- format: 'pdf', 'text', 'json'
);
-- Markiert Reading als exportiert
```

---

## 🚀 Installation

### **Schritt 1: Supabase Dashboard**

1. Öffne Supabase Dashboard
2. Gehe zu **SQL Editor**
3. Kopiere Inhalt von `001_create_readings_tables.sql`
4. Führe Migration aus
5. Wiederhole für `002_create_readings_functions.sql`

### **Schritt 2: Prüfung**

```sql
-- Tabellen prüfen
SELECT * FROM readings LIMIT 10;
SELECT * FROM reading_history LIMIT 10;

-- RLS prüfen
SELECT * FROM readings WHERE user_id = auth.uid();

-- Funktionen testen
SELECT * FROM get_user_readings('user-uuid', 10, 0);
```

---

## ✅ Status

- ✅ **B1: Supabase Schema** - FERTIG
- ⏭️ **B2: Persistenz in API-Route** - NÄCHSTER SCHRITT

---

## 📝 Nächste Schritte

1. **Migration ausführen** auf Supabase
2. **API-Route erweitern** für Persistenz (B2)
3. **Reading-History API-Route** erstellen
4. **Frontend-Integration** für History

Die vollständige Dokumentation ist in `integration/supabase/README.md` gespeichert.

