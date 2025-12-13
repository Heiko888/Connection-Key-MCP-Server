# ✅ B2: Persistenz in API-Route implementiert

## 📋 Was wurde erstellt

### 1. **API-Route erweitert** - `/api/reading/generate/route.ts`

**Features:**
- ✅ Supabase-Client integriert
- ✅ Reading wird nach Generierung automatisch gespeichert
- ✅ Reading-ID wird zurückgegeben (aus Supabase)
- ✅ Fehlerbehandlung für Datenbank-Operationen
- ✅ Fallback: Reading wird auch zurückgegeben, wenn Speicherung fehlschlägt

**Speicherung:**
- ✅ Reading-Text
- ✅ Strukturierte Sections (JSONB)
- ✅ Chart-Daten (JSONB)
- ✅ Metadaten (tokens, model, timestamp)
- ✅ Geburtsdaten
- ✅ Compatibility Reading Daten (Person 2)
- ✅ Status (completed)

---

### 2. **Reading History API-Route** - `/api/readings/history/route.ts`

**Features:**
- ✅ Gibt alle Readings eines Users zurück
- ✅ Pagination (limit, offset)
- ✅ Filter nach Reading-Typ
- ✅ Gesamtanzahl für Pagination

**Query Parameters:**
- `userId` (required) - User UUID
- `limit` (optional, default: 50) - Anzahl Readings
- `offset` (optional, default: 0) - Offset für Pagination
- `readingType` (optional) - Filter nach Typ

---

### 3. **Reading by ID API-Route** - `/api/readings/[id]/route.ts`

**Features:**
- ✅ Gibt ein spezifisches Reading zurück
- ✅ Optional: User-ID Prüfung (zusätzliche Sicherheit)
- ✅ Standardisierte Response-Struktur

**Path Parameter:**
- `id` (required) - Reading UUID

**Query Parameters:**
- `userId` (optional) - User UUID für zusätzliche Sicherheit

---

## 📊 API-Endpunkte

### **POST /api/reading/generate**

**Request:**
```json
{
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "birthPlace": "Berlin, Germany",
  "readingType": "detailed",
  "userId": "user-uuid-here" // optional
}
```

**Response:**
```json
{
  "success": true,
  "readingId": "reading-uuid-from-database",
  "reading": {
    "text": "...",
    "sections": {...}
  },
  "metadata": {...},
  "chartData": {...}
}
```

**Was passiert:**
1. Input-Validierung
2. Reading Agent aufrufen
3. Reading in Supabase speichern
4. Standardisierte Response zurückgeben

---

### **GET /api/readings/history?userId=...&limit=50&offset=0&readingType=detailed**

**Response:**
```json
{
  "success": true,
  "readings": [
    {
      "id": "reading-uuid",
      "reading_type": "detailed",
      "birth_date": "1990-05-15",
      "birth_time": "14:30",
      "birth_place": "Berlin, Germany",
      "reading_text": "...",
      "reading_sections": {...},
      "chart_data": {...},
      "metadata": {...},
      "status": "completed",
      "created_at": "2025-12-13T...",
      "updated_at": "2025-12-13T..."
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  },
  "timestamp": "2025-12-13T..."
}
```

---

### **GET /api/readings/[id]?userId=...**

**Response:**
```json
{
  "success": true,
  "readingId": "reading-uuid",
  "reading": {
    "text": "...",
    "sections": {...}
  },
  "metadata": {...},
  "chartData": {...}
}
```

---

## 🔒 Sicherheit

### **Row Level Security (RLS)**
- ✅ Users können nur ihre eigenen Readings sehen
- ✅ Service Role kann alle Readings sehen/erstellen (für API)
- ✅ User-ID wird validiert (UUID-Format)

### **Fehlerbehandlung**
- ✅ Datenbank-Fehler werden geloggt
- ✅ Reading wird auch zurückgegeben, wenn Speicherung fehlschlägt
- ✅ Duplicate Key Error wird behandelt (neue ID generieren)

---

## 📝 Environment Variables

**Erforderlich in `.env.local`:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Reading Agent
READING_AGENT_URL=http://138.199.237.34:4001
```

---

## 🚀 Installation

### **Schritt 1: Supabase Migration ausführen**

Falls noch nicht geschehen:
1. Öffne Supabase Dashboard
2. Gehe zu **SQL Editor**
3. Führe `001_create_readings_tables.sql` aus
4. Führe `002_create_readings_functions.sql` aus

### **Schritt 2: API-Routes kopieren**

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# API-Route (bereits vorhanden, wird aktualisiert)
# integration/api-routes/app-router/reading/generate/route.ts

# Neue API-Routes
mkdir -p app/api/readings/history
mkdir -p app/api/readings/[id]

cp integration/api-routes/app-router/readings/history/route.ts \
   app/api/readings/history/route.ts

cp integration/api-routes/app-router/readings/[id]/route.ts \
   app/api/readings/[id]/route.ts
```

### **Schritt 3: Environment Variables prüfen**

```bash
# Prüfe ob vorhanden
grep -E "NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY" .env.local
```

---

## ✅ Status

- ✅ **B1: Supabase Schema** - FERTIG
- ✅ **B2: Persistenz in API-Route** - FERTIG
- ⏭️ **B3: Reading-History Frontend** - NÄCHSTER SCHRITT (optional)

---

## 🧪 Testen

### **1. Reading generieren und speichern:**

```bash
curl -X POST http://localhost:3000/api/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany",
    "readingType": "detailed",
    "userId": "user-uuid-here"
  }'
```

### **2. Reading-History abrufen:**

```bash
curl "http://localhost:3000/api/readings/history?userId=user-uuid-here&limit=10"
```

### **3. Reading by ID abrufen:**

```bash
curl "http://localhost:3000/api/readings/reading-uuid-here?userId=user-uuid-here"
```

---

## 📊 Nächste Schritte

1. ✅ **Persistenz implementiert** - FERTIG
2. ⏭️ **Frontend-Integration** - Reading-History anzeigen
3. ⏭️ **Export-Funktionen** - PDF, Text, JSON
4. ⏭️ **Sharing-Funktionen** - Reading teilen

Die vollständige Dokumentation ist in `PERSISTENZ_API_ROUTE_IMPLEMENTIERT.md` gespeichert.

