# 📊 Supabase Schema für Readings

## 📋 Übersicht

Dieses Verzeichnis enthält die Supabase-Migrationen für die Reading-Persistenz.

---

## 🗂️ Dateien

### **001_create_readings_tables.sql**
- Erstellt `readings` Tabelle
- Erstellt `reading_history` Tabelle
- Indizes für Performance
- Row Level Security (RLS) Policies
- Trigger für `updated_at`

### **002_create_readings_functions.sql**
- Helper-Funktionen für Readings
- User-Statistiken
- History-Tracking

---

## 🚀 Installation

### **Option 1: Via Supabase Dashboard**

1. Öffne Supabase Dashboard
2. Gehe zu **SQL Editor**
3. Kopiere den Inhalt von `001_create_readings_tables.sql`
4. Führe die Migration aus
5. Wiederhole für `002_create_readings_functions.sql`

### **Option 2: Via Supabase CLI**

```bash
# Migrationen ausführen
supabase db push

# Oder einzeln
supabase migration up
```

### **Option 3: Via SQL Editor (manuell)**

```sql
-- 1. Führe 001_create_readings_tables.sql aus
-- 2. Führe 002_create_readings_functions.sql aus
```

---

## 📊 Tabellen-Struktur

### **readings**

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primary Key |
| `user_id` | UUID | User-Zuordnung (optional) |
| `reading_type` | VARCHAR(50) | Reading-Typ |
| `birth_date` | DATE | Geburtsdatum |
| `birth_time` | TIME | Geburtszeit |
| `birth_place` | VARCHAR(255) | Geburtsort |
| `birth_date2` | DATE | Geburtsdatum Person 2 (Compatibility) |
| `birth_time2` | TIME | Geburtszeit Person 2 (Compatibility) |
| `birth_place2` | VARCHAR(255) | Geburtsort Person 2 (Compatibility) |
| `reading_text` | TEXT | Vollständiger Reading-Text |
| `reading_sections` | JSONB | Strukturierte Sections |
| `chart_data` | JSONB | Chart-Daten |
| `metadata` | JSONB | Metadaten (tokens, model, etc.) |
| `status` | VARCHAR(20) | Status (pending, completed, failed) |
| `created_at` | TIMESTAMP | Erstellt am |
| `updated_at` | TIMESTAMP | Aktualisiert am |

### **reading_history**

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primary Key |
| `user_id` | UUID | User-Zuordnung |
| `reading_id` | UUID | Reading-Zuordnung |
| `viewed_at` | TIMESTAMP | Angesehen am |
| `shared` | BOOLEAN | Wurde geteilt |
| `exported` | BOOLEAN | Wurde exportiert |
| `exported_format` | VARCHAR(20) | Export-Format (pdf, text, json) |
| `exported_at` | TIMESTAMP | Exportiert am |
| `metadata` | JSONB | Zusätzliche Metadaten |

---

## 🔒 Row Level Security (RLS)

### **readings**
- ✅ Users können ihre eigenen Readings sehen
- ✅ Users können ihre eigenen Readings erstellen
- ✅ Users können ihre eigenen Readings aktualisieren
- ✅ Users können ihre eigenen Readings löschen
- ✅ Service Role kann alle Readings sehen/erstellen (für API)

### **reading_history**
- ✅ Users können ihre eigene History sehen
- ✅ Users können ihre eigene History erstellen
- ✅ Users können ihre eigene History aktualisieren
- ✅ Service Role kann alle History-Einträge sehen/erstellen (für API)

---

## 📈 Indizes

### **readings**
- `idx_readings_user_id` - User-ID
- `idx_readings_reading_type` - Reading-Typ
- `idx_readings_created_at` - Erstellt am (DESC)
- `idx_readings_status` - Status
- `idx_readings_birth_date` - Geburtsdatum
- `idx_readings_user_type_created` - Composite (User, Typ, Datum)
- `idx_readings_reading_sections_gin` - GIN Index für JSONB Sections
- `idx_readings_chart_data_gin` - GIN Index für JSONB Chart-Daten

### **reading_history**
- `idx_reading_history_user_id` - User-ID
- `idx_reading_history_reading_id` - Reading-ID
- `idx_reading_history_viewed_at` - Angesehen am (DESC)
- `idx_reading_history_user_viewed` - Composite (User, Datum)

---

## 🔧 Funktionen

### **get_user_readings(user_id, limit, offset, reading_type)**
Gibt alle Readings eines Users zurück (mit Pagination).

### **get_reading_by_id(reading_id, user_id)**
Gibt ein spezifisches Reading zurück.

### **get_reading_statistics(user_id)**
Gibt Statistiken für einen User zurück (Anzahl, nach Typ, etc.).

### **track_reading_view(user_id, reading_id)**
Erstellt oder aktualisiert einen History-Eintrag beim Ansehen.

### **mark_reading_shared(user_id, reading_id)**
Markiert ein Reading als geteilt.

### **mark_reading_exported(user_id, reading_id, format)**
Markiert ein Reading als exportiert.

---

## ✅ Prüfung

### **Tabellen prüfen:**
```sql
SELECT * FROM readings LIMIT 10;
SELECT * FROM reading_history LIMIT 10;
```

### **RLS prüfen:**
```sql
-- Als normaler User
SELECT * FROM readings WHERE user_id = auth.uid();

-- Als Service Role (sollte alle sehen)
-- (via API mit Service Role Key)
```

### **Funktionen testen:**
```sql
-- User Readings
SELECT * FROM get_user_readings('user-uuid-here', 10, 0);

-- Reading by ID
SELECT * FROM get_reading_by_id('reading-uuid-here');

-- Statistics
SELECT * FROM get_reading_statistics('user-uuid-here');
```

---

## 📝 Nächste Schritte

Nach der Migration:
1. ✅ API-Route erweitern für Persistenz (B2)
2. ✅ Reading-History API-Route erstellen
3. ✅ Frontend-Integration für History

