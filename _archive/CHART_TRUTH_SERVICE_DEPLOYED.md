# 🎯 CHART-TRUTH-SERVICE - DEPLOYMENT-DOKUMENTATION

**Datum:** 8. Januar 2026  
**Status:** ✅ Produktiv auf Hetzner MCP  
**URL:** https://mcp.the-connection-key.de/api/chart

---

## 📊 ÜBERSICHT

Der **Chart-Truth-Service** ist die zentrale Instanz für Human Design Chart-Berechnungen im Connection-Key System. Er verwendet die astronomy-engine für präzise astrologische Berechnungen und persistiert alle Charts in Supabase.

---

## 🏗️ ARCHITEKTUR

```
┌─────────────────────────────────────────────────────────────┐
│                    Chart-Truth-Service                       │
│                 (Hetzner MCP Server 138)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Chart-API Routes                                   │    │
│  │  /api/chart/calculate                              │    │
│  │  /api/chart/:chartId                               │    │
│  │  /api/chart/user/:userId                           │    │
│  └────────────────────────────────────────────────────┘    │
│           ↓                                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Chart-Calculation Library (TypeScript)            │    │
│  │  - chartCalculation.ts (46 KB)                     │    │
│  │  - Human-Design Library (14 Dateien)               │    │
│  │  - Astronomy-Engine Integration                     │    │
│  └────────────────────────────────────────────────────┘    │
│           ↓                                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Supabase Charts Table                             │    │
│  │  - RLS Policies                                     │    │
│  │  - JSONB Indexes                                    │    │
│  │  - Auto-Timestamps                                  │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 DEPLOYMENT-DETAILS

### **Server:**
- **Host:** 138.199.237.34 (Hetzner MCP)
- **Container:** `connection-key`
- **Port:** 3000 (intern), 443 (extern via Nginx)
- **Runtime:** Node.js 20 Alpine + tsx

### **TypeScript Support:**
- **Tool:** tsx (TypeScript Execute)
- **CMD:** `npx tsx connection-key/server.js`
- **Vorteil:** Direkte Ausführung von .ts Dateien ohne Transpilierung

### **Docker-Image:**
```dockerfile
FROM node:20-alpine
RUN npm ci --only=production && npm install -g tsx
COPY connection-key/ ./connection-key/
CMD ["npx", "tsx", "connection-key/server.js"]
```

### **Status:**
```bash
docker-compose ps connection-key
# State: Up
# Ports: 0.0.0.0:3000->3000/tcp
```

---

## 📡 API-ENDPOINTS

### **1. POST /api/chart/calculate**

Berechnet ein Human Design Chart und speichert es in Supabase.

**Headers:**
```
Content-Type: application/json
x-api-key: 5a8b6d93510555871f206fd59eb042195d32249ad48b45fcb52f90a00c1f8b5f
```

**Request Body:**
```json
{
  "userId": "uuid-v4",
  "birthDate": "1990-01-15",
  "birthTime": "14:30",
  "birthPlace": {
    "name": "Berlin",
    "latitude": 52.52,
    "longitude": 13.40,
    "timezone": "Europe/Berlin"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "chartId": "uuid-xxx",
  "chart": {
    "id": "uuid-xxx",
    "type": "Generator",
    "profile": "1/3",
    "authority": "Sacral",
    "strategy": "To Respond",
    "definition": "Single",
    "incarnationCross": "Right Angle Cross of...",
    "gates": [...],
    "channels": [...],
    "centers": {...},
    "createdAt": "2026-01-08T07:00:00.000Z"
  },
  "source": "astronomy-engine",
  "version": "1.0.0"
}
```

**Errors:**
- `400`: Missing required fields
- `401`: Invalid API key
- `500`: Calculation or database error

---

### **2. GET /api/chart/:chartId**

Lädt ein gespeichertes Chart aus der Datenbank.

**Headers:**
```
x-api-key: <API_KEY>
```

**Response (200):**
```json
{
  "success": true,
  "chart": {
    "id": "uuid-xxx",
    "userId": "uuid-yyy",
    "birthDate": "1990-01-15",
    "birthTime": "14:30",
    "birthPlace": {...},
    "type": "Generator",
    "profile": "1/3",
    "authority": "Sacral",
    "strategy": "To Respond",
    "definition": "Single",
    "incarnationCross": "...",
    "chartData": {...},
    "version": "1.0.0",
    "engine": "astronomy-engine",
    "createdAt": "2026-01-08T07:00:00.000Z"
  }
}
```

**Errors:**
- `404`: Chart not found
- `401`: Invalid API key

---

### **3. GET /api/chart/user/:userId**

Lädt alle Charts eines bestimmten Users.

**Headers:**
```
x-api-key: <API_KEY>
```

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "charts": [
    {
      "id": "uuid-1",
      "birth_date": "1990-01-15",
      "birth_time": "14:30",
      "type": "Generator",
      "profile": "1/3",
      "authority": "Sacral",
      "created_at": "2026-01-08T07:00:00.000Z"
    },
    ...
  ]
}
```

---

## 🗄️ DATENBANK-SCHEMA

### **Tabelle: public.charts**

```sql
CREATE TABLE public.charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Geburtsdaten
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  birth_place JSONB NOT NULL,
  
  -- Chart-Daten (vollständig)
  chart_data JSONB NOT NULL,
  
  -- Schnellzugriff (denormalisiert)
  type TEXT NOT NULL,
  profile TEXT NOT NULL,
  authority TEXT NOT NULL,
  strategy TEXT,
  definition TEXT,
  incarnation_cross TEXT,
  
  -- Versionierung
  chart_version TEXT DEFAULT '1.0.0',
  calculation_engine TEXT DEFAULT 'astronomy-engine',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### **Indexes:**
- `idx_charts_user_id` - Schneller Zugriff per User
- `idx_charts_type` - Filterung nach Typ
- `idx_charts_profile` - Filterung nach Profil
- `idx_charts_authority` - Filterung nach Autorität
- `idx_charts_created_at` - Sortierung nach Datum
- `idx_charts_birth_date` - Filterung nach Geburtsdatum
- `idx_charts_chart_data_gin` - JSONB-Suche im Chart
- `idx_charts_birth_place_gin` - JSONB-Suche im Geburtsort

### **Row Level Security (RLS):**
- ✅ User kann eigene Charts sehen
- ✅ User kann eigene Charts erstellen
- ✅ User kann eigene Charts aktualisieren
- ✅ User kann eigene Charts löschen
- ✅ Service Role hat vollen Zugriff

---

## 📁 DATEI-STRUKTUR

```
/opt/mcp-connection-key/connection-key/
├── lib/
│   ├── astro/
│   │   ├── chartCalculation.ts       (46 KB)
│   │   ├── chartCalculationV2.ts     (8 KB)
│   │   └── ephemeris.ts              (13 KB)
│   ├── human-design/
│   │   ├── centers.ts
│   │   ├── channels.ts
│   │   ├── circuits.ts
│   │   ├── connection-key-engine.ts  (39 KB)
│   │   ├── connection-key.ts         (31 KB)
│   │   ├── gate-calculator.ts
│   │   ├── gate-descriptions.ts      (52 KB)
│   │   ├── incarnation-cross.ts
│   │   ├── index.ts
│   │   ├── precise-ephemeris.ts
│   │   ├── profile.ts
│   │   ├── simplified-ephemeris.ts
│   │   ├── type-authority.ts
│   │   └── variables.ts
│   └── utils/
│       └── geocoding.ts
├── routes/
│   └── chart.js                      (182 Zeilen)
└── server.js
```

**Gesamtgröße:** ~250 KB Code

---

## 🔧 WARTUNG & MONITORING

### **Logs prüfen:**
```bash
docker logs connection-key --tail=100
```

### **Container-Status:**
```bash
docker-compose ps connection-key
```

### **Health-Check:**
```bash
curl https://mcp.the-connection-key.de/health
# {"status":"ok","service":"connection-key-server","timestamp":"..."}
```

### **Chart-API testen:**
```bash
curl -X POST https://mcp.the-connection-key.de/api/chart/calculate \
  -H "Content-Type: application/json" \
  -H "x-api-key: <API_KEY>" \
  -d '{"userId":"<UUID>","birthDate":"1990-01-15","birthTime":"14:30","birthPlace":{"name":"Berlin","latitude":52.52,"longitude":13.40,"timezone":"Europe/Berlin"}}'
```

### **Container neu starten:**
```bash
cd /opt/mcp-connection-key
docker-compose restart connection-key
```

### **Container neu bauen:**
```bash
cd /opt/mcp-connection-key
docker-compose down connection-key
docker-compose build --no-cache connection-key
docker-compose up -d connection-key
```

---

## ⚠️ WICHTIGE HINWEISE

### **User-ID Validierung:**
- Die `userId` muss als UUID in `auth.users` existieren
- Foreign Key Constraint: `charts_user_id_fkey`
- Fehler: `violates foreign key constraint` = User existiert nicht

### **Geburtsort-Format:**
```json
{
  "name": "Berlin",
  "latitude": 52.52,
  "longitude": 13.40,
  "timezone": "Europe/Berlin"
}
```

### **Authentifizierung:**
- API-Key ist erforderlich für alle Endpoints
- Wird via `x-api-key` Header gesendet
- ENV-Variable: `API_KEY`

### **Performance:**
- Chart-Berechnung: ~1-2 Sekunden
- Datenbankzugriff: ~50-100ms
- JSONB-Indizes für schnelle Queries

---

## 📊 METRIKEN

**Deployment-Datum:** 8. Januar 2026  
**Entwicklungszeit:** 6 Stunden  
**Code-Migration:** 17 TypeScript-Dateien (~250 KB)  
**Container-Status:** ✅ Up und produktiv  
**Tests:** ✅ Alle erfolgreich

---

## 🎯 NÄCHSTE SCHRITTE

1. ⏳ Integration mit Frontend Bodygraph Engine
2. ⏳ Caching-Layer für häufige Anfragen
3. ⏳ Batch-Calculation für Multiple Charts
4. ⏳ Chart-Comparison Endpoint
5. ⏳ Chart-Export (PDF, PNG)

---

## 📚 SIEHE AUCH

- `CHART_TRUTH_SERVICE_PLAN.md` - Ursprünglicher Implementierungsplan
- `CHANGES_2026-01-08.md` - Vollständiges Änderungsprotokoll
- `SYSTEM_ÜBERSICHT_2026-01-08.md` - System-Architektur
- `supabase/create_charts_only.sql` - Datenbank-Schema

---

**Status:** ✅ Produktiv  
**Maintainer:** Heiko  
**Letztes Update:** 8. Januar 2026
