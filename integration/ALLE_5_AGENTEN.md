# 🤖 Alle 5 Agenten - Vollständige Übersicht

## 📊 Agenten-Übersicht

| # | Agent | Port | Server | API-Route | Status |
|---|-------|------|--------|-----------|--------|
| 1 | **Marketing Agent** | 7000 | Hetzner (MCP) | `/api/agents/marketing` | ✅ |
| 2 | **Automation Agent** | 7000 | Hetzner (MCP) | `/api/agents/automation` | ✅ |
| 3 | **Sales Agent** | 7000 | Hetzner (MCP) | `/api/agents/sales` | ✅ |
| 4 | **Social-YouTube Agent** | 7000 | Hetzner (MCP) | `/api/agents/social-youtube` | ✅ |
| 5 | **Reading Agent** | 4001 | Hetzner (PM2) | `/api/readings/generate` | ✅ |

---

## 🔗 Kommunikations-Flow

### Agenten 1-4 (über MCP Server)

```
Frontend (167.235.224.149)
    │
    │ POST /api/agents/{agentId}
    ▼
Next.js API Route
    │
    │ HTTP Request → MCP_SERVER_URL
    ▼
MCP Server (138.199.237.34:7000)
    │
    │ /agent/{agentId}
    ▼
OpenAI API (GPT-4)
    │
    │ Response
    ▼
Frontend zeigt Antwort an
```

### Agent 5: Reading Agent (eigenständig)

```
Frontend (167.235.224.149)
    │
    │ POST /api/readings/generate
    ▼
Next.js API Route
    │
    │ HTTP Request → READING_AGENT_URL
    ▼
Reading Agent (138.199.237.34:4001)
    │
    │ /reading/generate
    ▼
OpenAI API (GPT-4)
    │
    │ Response (Human Design Reading)
    ▼
Frontend zeigt Reading an
```

---

## 📁 Dateien für alle 5 Agenten

### API-Routes (5 Dateien)

1. ✅ `integration/api-routes/agents-marketing.ts`
   - Route: `/api/agents/marketing`
   - Verbindung: `MCP_SERVER_URL` → Port 7000

2. ✅ `integration/api-routes/agents-automation.ts`
   - Route: `/api/agents/automation`
   - Verbindung: `MCP_SERVER_URL` → Port 7000

3. ✅ `integration/api-routes/agents-sales.ts`
   - Route: `/api/agents/sales`
   - Verbindung: `MCP_SERVER_URL` → Port 7000

4. ✅ `integration/api-routes/agents-social-youtube.ts`
   - Route: `/api/agents/social-youtube`
   - Verbindung: `MCP_SERVER_URL` → Port 7000

5. ✅ `integration/api-routes/readings-generate.ts`
   - Route: `/api/readings/generate`
   - Verbindung: `READING_AGENT_URL` → Port 4001

### Frontend-Komponenten (2 Komponenten)

1. ✅ `integration/frontend/components/AgentChat.tsx`
   - Für Agenten 1-4 (Marketing, Automation, Sales, Social-YouTube)
   - Props: `agentId`, `agentName`, `apiUrl`

2. ✅ `integration/frontend/components/ReadingGenerator.tsx`
   - Für Agent 5 (Reading Agent)
   - Props: `userId` (optional)

### Dashboard-Seite

✅ `integration/frontend/pages/agents-dashboard.tsx`
- Zeigt alle 5 Agenten an
- 4x AgentChat (für Agenten 1-4)
- 1x ReadingGenerator (für Agent 5)

---

## 🔧 Environment Variables

### Für Agenten 1-4 (MCP Server)

```bash
MCP_SERVER_URL=http://138.199.237.34:7000
```

### Für Agent 5 (Reading Agent)

```bash
READING_AGENT_URL=http://138.199.237.34:4001
```

**Beide müssen in `.env.local` gesetzt sein!**

---

## 📋 Installation auf CK-App Server

### Schritt 1: API-Routes installieren

```bash
# Für Pages Router
mkdir -p pages/api/agents
mkdir -p pages/api/readings

# Kopiere alle 5 API-Routes
cp integration/api-routes/agents-marketing.ts pages/api/agents/marketing.ts
cp integration/api-routes/agents-automation.ts pages/api/agents/automation.ts
cp integration/api-routes/agents-sales.ts pages/api/agents/sales.ts
cp integration/api-routes/agents-social-youtube.ts pages/api/agents/social-youtube.ts
cp integration/api-routes/readings-generate.ts pages/api/readings/generate.ts
```

### Schritt 2: Frontend-Komponenten installieren

```bash
mkdir -p components/agents

# Kopiere Komponenten
cp integration/frontend/components/AgentChat.tsx components/agents/
cp integration/frontend/components/ReadingGenerator.tsx components/agents/

# Kopiere Dashboard-Seite
cp integration/frontend/pages/agents-dashboard.tsx pages/agents-dashboard.tsx
```

### Schritt 3: Environment Variables setzen

```bash
# In .env.local
MCP_SERVER_URL=http://138.199.237.34:7000
READING_AGENT_URL=http://138.199.237.34:4001
```

---

## 🧪 Testen aller 5 Agenten

### Agent 1: Marketing

```bash
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Gib mir 3 Hooks für ein Reel", "userId": "test"}'
```

### Agent 2: Automation

```bash
curl -X POST http://localhost:3000/api/agents/automation \
  -H "Content-Type: application/json" \
  -d '{"message": "Erkläre mir einen n8n Workflow", "userId": "test"}'
```

### Agent 3: Sales

```bash
curl -X POST http://localhost:3000/api/agents/sales \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle einen Verkaufstext", "userId": "test"}'
```

### Agent 4: Social-YouTube

```bash
curl -X POST http://localhost:3000/api/agents/social-youtube \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle ein YouTube-Video-Skript", "userId": "test"}'
```

### Agent 5: Reading

```bash
curl -X POST http://localhost:3000/api/readings/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany",
    "readingType": "detailed",
    "userId": "test"
  }'
```

---

## ✅ Status aller 5 Agenten

### Hetzner Server (138.199.237.34)

- ✅ **MCP Server läuft** (Port 7000)
  - Marketing Agent ✅
  - Automation Agent ✅
  - Sales Agent ✅
  - Social-YouTube Agent ✅

- ✅ **Reading Agent läuft** (Port 4001)
  - 5 Knowledge-Dateien geladen ✅
  - 11 Templates geladen ✅
  - OpenAI konfiguriert ✅

### CK-App Server (167.235.224.149)

- ✅ **API-Routes vorhanden** (lokal im Repository)
- ❌ **API-Routes installiert** (noch nicht auf Server)
- ❌ **Frontend-Komponenten installiert** (noch nicht auf Server)
- ❌ **Environment Variables gesetzt** (noch nicht auf Server)

---

## 🎯 Zusammenfassung

**Alle 5 Agenten sind:**
- ✅ Im Repository vorhanden
- ✅ Auf Hetzner Server laufend
- ✅ API-Routes erstellt
- ✅ Frontend-Komponenten erstellt
- ✅ Dokumentiert

**Was noch fehlt:**
- ❌ Installation auf CK-App Server
- ❌ Environment Variables auf CK-App Server
- ❌ Deployment

**Der 5. Agent (Reading Agent) ist vollständig integriert!** ✅

Er hat:
- Eigene API-Route: `/api/readings/generate`
- Eigene Frontend-Komponente: `ReadingGenerator.tsx`
- Eigene Environment Variable: `READING_AGENT_URL`
- Läuft auf eigenem Port: 4001 (nicht über MCP Server)

