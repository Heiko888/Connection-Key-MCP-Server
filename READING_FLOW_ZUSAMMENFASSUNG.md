# ✅ Reading-Flow Implementation - Zusammenfassung

**Datum:** 26.12.2025  
**Status:** ✅ Implementierung abgeschlossen

---

## 📋 DELIVERABLES

### 1. JSON Schemas (Verbindlich)

#### Request Schema (`/agents/run`)
```json
{
  "domain": "reading",
  "task": "generate",
  "payload": {
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Deutschland",
    "userId": "optional-user-id",
    "readingType": "detailed"
  },
  "requestId": "optional-request-id-uuid"
}
```

#### Response Schema (Immer gleich)
```json
{
  "success": true,
  "requestId": "request-id-uuid",
  "data": {
    "readingId": "reading-uuid",
    "reading": "Generierter Reading-Text...",
    "chartData": {},
    "tokens": 1234
  },
  "error": null,
  "runtimeMs": 2345
}
```

**Bei Fehler:**
```json
{
  "success": false,
  "requestId": "request-id-uuid",
  "data": null,
  "error": {
    "code": "INVALID_PAYLOAD",
    "message": "birthDate is required",
    "details": {}
  },
  "runtimeMs": 12
}
```

---

### 2. Code-Änderungen

#### ✅ Neu erstellt:
- **`mcp-gateway.js`** - MCP HTTP Gateway (Port 7000, POST /agents/run)
- **`Dockerfile.mcp-gateway`** - Docker Image für Gateway
- **`READING_FLOW_TESTS.sh`** - End-to-End Tests

#### ✅ Angepasst:
- **`index.js`** - MCP Core Tool-Handler (`generateReading`) normalisiert Response
- **`integration/api-routes/app-router/reading/generate/route.ts`** - Frontend Route verwendet MCP Gateway

---

### 3. HTTP Status Codes

| Code | Bedeutung | Wann |
|------|-----------|------|
| **200** | Success | `success=true` |
| **400** | Invalid Payload | Fehlende/ungültige Felder |
| **401** | Unauthorized | Fehlender/invalid `MCP_API_KEY` |
| **429** | Busy | MCP Core verarbeitet bereits Request |
| **500** | Internal Error | MCP Core Fehler oder n8n Fehler |

---

### 4. Flow-Diagramm

```
Frontend (Next.js)
  ↓ POST /api/reading/generate
  ↓ Bearer MCP_API_KEY
MCP HTTP Gateway (Port 7000)
  ↓ POST /agents/run
  ↓ spawn('node', ['index.js'])
MCP Core (stdio)
  ↓ Tool: generateReading
  ↓ fetch(http://n8n:5678/webhook/reading)
n8n Workflow
  ↓ Reading generieren
  ↓ Response
MCP Core
  ↓ Normalisierte Response
MCP HTTP Gateway
  ↓ Standard Response Schema
Frontend
  ↓ Supabase Update
  ↓ Response an Client
```

---

## 🚀 DEPLOYMENT

### Hetzner Server (138.199.237.34)

#### 1. ENV-Variablen prüfen
```bash
cd /opt/mcp-connection-key
grep MCP_API_KEY .env
grep MCP_PORT .env
grep N8N_BASE_URL .env
```

**Erforderlich:**
- `MCP_API_KEY=your-secret-key-here`
- `MCP_PORT=7000` (optional)
- `N8N_BASE_URL=http://n8n:5678`

#### 2. Docker Compose anpassen
```yaml
services:
  mcp-gateway:
    build:
      context: .
      dockerfile: Dockerfile.mcp-gateway
    container_name: mcp-gateway
    ports:
      - "7000:7000"
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - MCP_PORT=7000
    restart: unless-stopped
    networks:
      - app-network
```

#### 3. Container bauen und starten
```bash
cd /opt/mcp-connection-key
docker compose build mcp-gateway
docker compose up -d mcp-gateway
docker logs mcp-gateway --tail 50
```

#### 4. Health Check
```bash
curl http://localhost:7000/health
```

---

### CK-App Server (167.235.224.149)

#### 1. ENV-Variablen prüfen
```bash
cd /opt/hd-app/The-Connection-Key/frontend
grep MCP_SERVER_URL .env.local
grep MCP_API_KEY .env.local
```

**Erforderlich:**
- `MCP_SERVER_URL=http://138.199.237.34:7000`
- `MCP_API_KEY=your-secret-key-here` (MUSS identisch mit Hetzner sein!)

#### 2. Frontend Container neu bauen
```bash
cd /opt/hd-app/The-Connection-Key
docker compose -f docker-compose-redis-fixed.yml build frontend
docker compose -f docker-compose-redis-fixed.yml up -d frontend
docker logs the-connection-key-frontend-1 --tail 50
```

#### 3. API Route testen
```bash
curl -X POST http://localhost:3000/api/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin"
  }'
```

---

## 🧪 TESTS

### Test 1: Health Check
```bash
curl http://138.199.237.34:7000/health
```

### Test 2: Reading Generate (End-to-End)
```bash
curl -X POST http://138.199.237.34:7000/agents/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MCP_API_KEY" \
  -d '{
    "domain": "reading",
    "task": "generate",
    "payload": {
      "birthDate": "1990-05-15",
      "birthTime": "14:30",
      "birthPlace": "Berlin, Deutschland",
      "readingType": "detailed"
    }
  }'
```

### Test 3: Frontend API Route
```bash
curl -X POST http://167.235.224.149:3000/api/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin"
  }'
```

### Alle Tests ausführen
```bash
chmod +x READING_FLOW_TESTS.sh
./READING_FLOW_TESTS.sh
```

---

## ⚠️ WICHTIGE HINWEISE

### MCP_API_KEY
- **MUSS** auf beiden Servern identisch sein!
- Hetzner: `/opt/mcp-connection-key/.env`
- CK-App: `/opt/hd-app/The-Connection-Key/frontend/.env.local`

### Ports
- ✅ Port 7000: MCP HTTP Gateway
- ✅ Port 4000: chatgpt-agent (bleibt unverändert)
- ✅ Port 5678: n8n (intern, Docker Network)
- ❌ Port 4001: NICHT mehr verwenden!
- ❌ Port 7777: NICHT mehr verwenden!

### n8n Webhook
- Webhook-Pfad: `/webhook/reading` (aus `config.js`)
- URL: `http://n8n:5678/webhook/reading` (intern, Docker Network)
- MCP Core ruft diesen Webhook auf

### Request Queue
- Max 1 Request gleichzeitig (verhindert Race Conditions)
- Bei `isProcessing=true` → HTTP 429 (Busy)

---

## 📁 DATEIEN

### Neu erstellt:
- `mcp-gateway.js` - MCP HTTP Gateway
- `Dockerfile.mcp-gateway` - Docker Image
- `READING_FLOW_TESTS.sh` - Tests
- `READING_FLOW_IMPLEMENTATION.md` - Vollständige Dokumentation
- `READING_FLOW_ZUSAMMENFASSUNG.md` - Diese Datei

### Angepasst:
- `index.js` - MCP Core Tool-Handler
- `integration/api-routes/app-router/reading/generate/route.ts` - Frontend Route

---

## ✅ CHECKLISTE

### Vor Deployment:
- [ ] `MCP_API_KEY` auf beiden Servern gesetzt (identisch!)
- [ ] `MCP_SERVER_URL` auf CK-App Server gesetzt
- [ ] `N8N_BASE_URL` auf Hetzner Server gesetzt
- [ ] n8n Webhook `/webhook/reading` existiert und ist aktiv
- [ ] Docker Compose Datei angepasst (mcp-gateway Service)

### Deployment Hetzner:
- [ ] `mcp-gateway.js` nach Server kopiert
- [ ] `Dockerfile.mcp-gateway` nach Server kopiert
- [ ] `docker-compose.yml` angepasst
- [ ] Container gebaut: `docker compose build mcp-gateway`
- [ ] Container gestartet: `docker compose up -d mcp-gateway`
- [ ] Health Check erfolgreich: `curl http://localhost:7000/health`

### Deployment CK-App:
- [ ] Frontend API Route aktualisiert
- [ ] Container neu gebaut: `docker compose build frontend`
- [ ] Container gestartet: `docker compose up -d frontend`
- [ ] API Route getestet: `curl -X POST http://localhost:3000/api/reading/generate ...`

### Nach Deployment:
- [ ] End-to-End Test erfolgreich
- [ ] Logs prüfen (keine Fehler)
- [ ] Response-Schema korrekt
- [ ] Supabase Updates funktionieren

---

**Status:** ✅ **Implementierung abgeschlossen - Bereit für Deployment**
