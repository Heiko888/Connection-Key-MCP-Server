# 🏗️ System-Übersicht: Kompletter System-Check

**Stand:** 28.12.2024

---

## 📍 Server-Architektur

### **Server 1: Hetzner (138.199.237.34)**
**Funktionen:**
- ✅ MCP HTTP Gateway (Port 7000) - Docker
- ✅ n8n (Port 5678) - Docker
- ✅ ChatGPT-Agent (Port 4000) - Docker
- ✅ Connection-Key (Port 3000) - Docker (optional)

**Verzeichnis:**
```bash
/opt/mcp-connection-key
```

**Docker-Compose:**
```bash
docker-compose.yml  # Hauptdatei für MCP, n8n, ChatGPT-Agent
```

**Services:**
- `mcp-gateway` - MCP HTTP Gateway
- `n8n` - Workflow Engine
- `chatgpt-agent` - KI-Agent
- `connection-key` - Zentrale API (optional)

---

### **Server 2: CK-App (167.235.224.149)**
**Funktionen:**
- ✅ Next.js Frontend (Port 3000) - Docker
- ✅ nginx Reverse Proxy (Port 80/443)
- ✅ Redis (intern, Port 6379)
- ✅ Grafana (Port 3001)
- ✅ Prometheus (Port 9090)

**Verzeichnis:**
```bash
/opt/hd-app/The-Connection-Key
```

**Docker-Compose:**
```bash
docker-compose.yml  # Hauptdatei für Frontend
```

**Services:**
- `frontend` - Next.js App
- `nginx` - Reverse Proxy
- `redis` - Cache
- `grafana` - Monitoring
- `prometheus` - Metrics

---

## 🔄 Deployment-Prozesse

### **1. Frontend-Routen deployen (Server 167)**

**Lokale Dateien:**
```
integration/api-routes/app-router/
  ├── reading/generate/route.ts
  ├── agents/marketing/route.ts
  ├── agents/automation/route.ts
  └── ...
```

**Deployment-Prozess:**

**Option A: Manuell kopieren**
```powershell
# Von Windows PowerShell
scp integration/api-routes/app-router/reading/generate/route.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/reading/generate/route.ts
```

**Option B: Git Pull (wenn auf Server)**
```bash
# Auf Server 167
cd /opt/hd-app/The-Connection-Key
git pull origin feature/reading-agent-option-a-complete
```

**Option C: Script verwenden**
```bash
# deploy-reading-agent-fix.ps1 oder deploy-reading-agent-fix.sh
```

**Nach Deployment:**
```bash
# Container neu bauen
cd /opt/hd-app/The-Connection-Key/frontend
docker stop the-connection-key-frontend-1
docker rm the-connection-key-frontend-1
docker build --no-cache -t the-connection-key-frontend -f Dockerfile .
docker run -d \
  --name the-connection-key-frontend-1 \
  -p 3000:3000 \
  --env-file /opt/hd-app/The-Connection-Key/.env \
  the-connection-key-frontend
```

---

### **2. Dependencies kopieren (Server 167)**

**Lokale Dateien:**
```
integration/api-routes/
  ├── reading-validation.ts
  └── reading-response-types.ts
```

**Ziel auf Server:**
```
/opt/hd-app/The-Connection-Key/frontend/app/
  ├── reading-validation.ts
  └── reading-response-types.ts
```

**Kopieren:**
```powershell
# Von Windows PowerShell
scp integration/api-routes/reading-validation.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/
scp integration/api-routes/reading-response-types.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/
```

**Dann Container neu bauen (siehe oben)**

---

### **3. MCP Gateway deployen (Server 138)**

**Lokale Dateien:**
```
index.js
mcp-gateway.js
config.js
package.json
```

**Deployment-Prozess:**

**Option A: Git Pull**
```bash
# Auf Server 138
cd /opt/mcp-connection-key
git pull origin feature/reading-agent-option-a-complete
```

**Option B: Manuell kopieren**
```powershell
# Von Windows PowerShell
scp index.js root@138.199.237.34:/opt/mcp-connection-key/
scp mcp-gateway.js root@138.199.237.34:/opt/mcp-connection-key/
```

**Nach Deployment:**
```bash
# Container neu bauen
cd /opt/mcp-connection-key
docker compose build mcp-gateway
docker compose up -d mcp-gateway
docker logs mcp-gateway --tail 50
```

---

### **4. n8n Workflows deployen (Server 138)**

**Lokale Dateien:**
```
n8n-workflows/
  ├── reading-generation-workflow.json
  ├── user-registration-reading.json
  └── scheduled-reading-generation.json
```

**Deployment-Prozess:**

**Option A: n8n UI Import**
1. Öffne n8n: `https://n8n.werdemeisterdeinergedankenagent.de`
2. Workflows → Import
3. Datei auswählen und importieren

**Option B: n8n API**
```bash
# Auf Server 138
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/api/v1/workflows \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: YOUR_API_KEY" \
  -d @n8n-workflows/reading-generation-workflow.json
```

**Nach Import:**
1. Credentials konfigurieren (Supabase API, HTTP Header Auth)
2. Nodes konfigurieren (Table Names, Fields)
3. Workflow aktivieren

---

## 📁 Dateistruktur

### **Server 167 (Frontend)**

```
/opt/hd-app/The-Connection-Key/
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── reading/
│   │   │   │   └── generate/
│   │   │   │       └── route.ts          ← API Route
│   │   │   ├── agents/
│   │   │   │   ├── marketing/
│   │   │   │   │   └── route.ts
│   │   │   │   └── automation/
│   │   │   │       └── route.ts
│   │   │   └── notifications/
│   │   │       └── reading/
│   │   │           └── route.ts          ← n8n benachrichtigt hier
│   │   ├── reading-validation.ts         ← Dependency
│   │   └── reading-response-types.ts     ← Dependency
│   ├── Dockerfile                         ← Build-Datei
│   └── package.json
├── docker-compose-redis-fixed.yml         ← Docker Compose
└── .env                                    ← Environment Variables
```

**Wichtig:**
- `docker-compose-redis-fixed.yml` wird verwendet (NICHT `docker-compose.yml`)
- Frontend wird direkt mit `Dockerfile` gebaut (nicht über docker-compose build)
- Container-Name: `the-connection-key-frontend-1`

---

### **Server 138 (MCP/n8n)**

```
/opt/mcp-connection-key/
├── index.js                                ← MCP Core
├── mcp-gateway.js                          ← HTTP Gateway
├── config.js                               ← Konfiguration
├── package.json
├── docker-compose.yml                      ← Docker Compose
├── .env                                    ← Environment Variables
└── n8n-workflows/                          ← (optional, lokal)
    └── reading-generation-workflow.json
```

**Wichtig:**
- `docker-compose.yml` wird verwendet
- MCP Gateway läuft auf Port 7000
- n8n läuft auf Port 5678

---

## 🔗 n8n ↔ Frontend Integration

### **1. Frontend → n8n (Reading generieren)**

**Flow:**
```
Frontend (167)
  ↓ POST /api/reading/generate
  ↓ Bearer MCP_API_KEY
MCP Gateway (138:7000)
  ↓ POST /agents/run
  ↓ domain: 'reading', task: 'generate'
MCP Core (138)
  ↓ Tool: generateReading
  ↓ fetch(http://n8n:5678/webhook/reading)
n8n Workflow (138:5678)
  ↓ Reading generieren
  ↓ Supabase Update
  ↓ Notify Frontend
```

**Frontend Route:**
```typescript
// app/api/reading/generate/route.ts
const mcpResponse = await fetch(`${MCP_SERVER_URL}/agents/run`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${MCP_API_KEY}`
  },
  body: JSON.stringify({
    domain: 'reading',
    task: 'generate',
    payload: { readingId, name, birthDate, ... }
  })
});
```

**MCP Gateway:**
```javascript
// mcp-gateway.js
POST /agents/run
→ spawn('node', ['index.js'])
→ MCP Core Tool: generateReading
→ fetch('http://n8n:5678/webhook/reading')
```

**n8n Webhook:**
```
POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading
Body: { readingId, name, birthDate, birthTime, birthPlace, readingType, focus }
```

---

### **2. n8n → Frontend (Reading fertig)**

**Flow:**
```
n8n Workflow (138:5678)
  ↓ Reading generiert
  ↓ Supabase: reading_jobs.status = 'completed'
  ↓ POST https://www.the-connection-key.de/api/notifications/reading
Frontend (167:3000)
  ↓ POST /api/notifications/reading
  ↓ Bearer N8N_API_KEY
  ↓ Supabase: readings Tabelle
  ↓ Response: { success: true }
```

**n8n Node:**
```json
{
  "name": "Notify Frontend",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "https://www.the-connection-key.de/api/notifications/reading",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpHeaderAuth",
    "sendBody": true,
    "bodyParameters": {
      "readingId": "={{ $json.readingId }}",
      "status": "completed"
    }
  }
}
```

**Frontend Route:**
```typescript
// app/api/notifications/reading/route.ts
export async function POST(request: NextRequest) {
  // Prüfe Authorization Header
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.N8N_API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Speichere Reading in Supabase
  // ...
}
```

---

## 🔐 Environment Variables

### **Server 167 (Frontend)**

**Datei:** `/opt/hd-app/The-Connection-Key/.env`

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# MCP Server
MCP_SERVER_URL=http://138.199.237.34:7000
MCP_API_KEY=your-secret-key-here

# n8n (für Notifications)
N8N_API_KEY=your-n8n-api-key-here
FRONTEND_URL=https://www.the-connection-key.de
```

---

### **Server 138 (MCP/n8n)**

**Datei:** `/opt/mcp-connection-key/.env`

```bash
# MCP Gateway
MCP_API_KEY=your-secret-key-here  # MUSS identisch mit Server 167 sein!
MCP_PORT=7000

# n8n
N8N_BASE_URL=http://n8n:5678
N8N_WEBHOOK_URL=https://n8n.werdemeisterdeinergedankenagent.de
N8N_PASSWORD=your-password

# OpenAI
OPENAI_API_KEY=xxx

# Supabase (für n8n)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
```

---

## 🚀 Was passiert bei Änderungen?

### **1. Frontend-Route ändern**

**Schritte:**
1. Route-Datei lokal ändern: `integration/api-routes/app-router/reading/generate/route.ts`
2. Auf Server kopieren: `scp ... route.ts root@167.235.224.149:/opt/hd-app/.../route.ts`
3. Dependencies prüfen (falls Imports geändert)
4. Container neu bauen: `docker build --no-cache ...`
5. Container starten: `docker run ...`

**Wichtig:**
- `--no-cache` verwenden, damit neue Dateien kopiert werden
- Dependencies müssen auch kopiert werden, falls geändert

---

### **2. Frontend-Dependencies ändern**

**Schritte:**
1. Dependency-Datei lokal ändern: `integration/api-routes/reading-validation.ts`
2. Auf Server kopieren: `scp ... reading-validation.ts root@167.235.224.149:/opt/hd-app/.../app/`
3. Container neu bauen: `docker build --no-cache ...`
4. Container starten: `docker run ...`

---

### **3. MCP Gateway ändern**

**Schritte:**
1. Datei lokal ändern: `index.js` oder `mcp-gateway.js`
2. Auf Server kopieren: `scp ... root@138.199.237.34:/opt/mcp-connection-key/`
3. Container neu bauen: `docker compose build mcp-gateway`
4. Container neu starten: `docker compose up -d mcp-gateway`

---

### **4. n8n Workflow ändern**

**Schritte:**
1. Workflow lokal ändern: `n8n-workflows/reading-generation-workflow.json`
2. In n8n UI importieren: Workflows → Import
3. Oder via API: `curl -X POST ... /api/v1/workflows`
4. Credentials prüfen (falls geändert)
5. Nodes konfigurieren (falls geändert)
6. Workflow aktivieren

---

## 📋 Checkliste: System-Check

### **Server 167 (Frontend)**

```bash
# 1. Container Status
docker ps | grep frontend

# 2. Container Logs
docker logs the-connection-key-frontend-1 --tail 50

# 3. Route-Dateien prüfen
ls -la /opt/hd-app/The-Connection-Key/frontend/app/api/reading/generate/route.ts
ls -la /opt/hd-app/The-Connection-Key/frontend/app/reading-validation.ts

# 4. Environment Variables prüfen
grep MCP_SERVER_URL /opt/hd-app/The-Connection-Key/.env
grep MCP_API_KEY /opt/hd-app/The-Connection-Key/.env

# 5. Route testen
curl -X POST http://localhost:3000/api/reading/generate \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","birthDate":"1990-05-15","birthTime":"14:30","birthPlace":"Berlin","readingType":"basic","focus":"Karriere"}'
```

---

### **Server 138 (MCP/n8n)**

```bash
# 1. Container Status
docker ps | grep -E "mcp-gateway|n8n"

# 2. MCP Gateway Logs
docker logs mcp-gateway --tail 50

# 3. n8n Status
curl https://n8n.werdemeisterdeinergedankenagent.de/healthz

# 4. Environment Variables prüfen
grep MCP_API_KEY /opt/mcp-connection-key/.env
grep N8N_BASE_URL /opt/mcp-connection-key/.env

# 5. MCP Gateway testen
curl -X POST http://localhost:7000/agents/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MCP_API_KEY" \
  -d '{"domain":"reading","task":"generate","payload":{...}}'
```

---

## 🔗 n8n ↔ Frontend Verbindung

### **n8n benachrichtigt Frontend:**

**n8n Node Konfiguration:**
- **URL:** `https://www.the-connection-key.de/api/notifications/reading`
- **Method:** `POST`
- **Authentication:** HTTP Header Auth
- **Header:** `Authorization: Bearer N8N_API_KEY`
- **Body:**
  ```json
  {
    "readingId": "...",
    "userId": "...",
    "status": "completed",
    "timestamp": "..."
  }
  ```

**Frontend Route:**
- **Pfad:** `/opt/hd-app/The-Connection-Key/frontend/app/api/notifications/reading/route.ts`
- **Prüft:** `Authorization: Bearer N8N_API_KEY`
- **Speichert:** Reading in Supabase `readings` Tabelle
- **Response:** `{ success: true }`

**Environment Variables:**
- **Server 167:** `N8N_API_KEY` muss gesetzt sein
- **Server 138:** `FRONTEND_URL` muss gesetzt sein (optional, Standard: `https://www.the-connection-key.de`)

---

## ✅ Zusammenfassung

**Server 167 (Frontend):**
- Verwendet `docker-compose.yml`
- Frontend wird mit `Dockerfile` gebaut
- Routes in `frontend/app/api/`
- Dependencies in `frontend/app/`

**Server 138 (MCP/n8n):**
- Verwendet `docker-compose.yml`
- MCP Gateway auf Port 7000
- n8n auf Port 5678
- Workflows in n8n UI oder via API

**n8n ↔ Frontend:**
- n8n benachrichtigt Frontend via `/api/notifications/reading`
- Authentifizierung: `Bearer N8N_API_KEY`
- Frontend speichert Reading in Supabase

**Deployment:**
- Routes: `scp` → Server → Container neu bauen
- Dependencies: `scp` → Server → Container neu bauen
- MCP: `scp` → Server → `docker compose build`
- n8n: UI Import oder API
