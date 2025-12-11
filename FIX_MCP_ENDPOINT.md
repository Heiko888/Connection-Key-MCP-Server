# 🔧 MCP Server Endpoint-Fix

## ❌ Problem

**Fehler:**
```
Cannot POST /agents/marketing
```

**Ursache:** Falscher Endpoint-Pfad

---

## ✅ Lösung

### Korrekte Endpoints:

Der MCP Server verwendet **`/agent/:agentId`** (ohne 's'), nicht `/agents/:agentId`

### Korrekte API-Aufrufe:

#### Marketing Agent
```bash
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Gib mir 3 Hooks für ein Reel"}'
```

#### Automation Agent
```bash
curl -X POST http://138.199.237.34:7000/agent/automation \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle einen n8n Workflow"}'
```

#### Sales Agent
```bash
curl -X POST http://138.199.237.34:7000/agent/sales \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle einen Sales-Text"}'
```

#### Social-YouTube Agent
```bash
curl -X POST http://138.199.237.34:7000/agent/social-youtube \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle ein YouTube-Skript"}'
```

#### Chart Development Agent
```bash
curl -X POST http://138.199.237.34:7000/agent/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle eine Bodygraph-Komponente"}'
```

---

## 📋 Verfügbare Endpoints

### MCP Server (Port 7000)

| Endpoint | Methode | Beschreibung |
|----------|---------|--------------|
| `/health` | GET | Health Check |
| `/agents` | GET | Liste aller Agenten |
| `/agent/:agentId` | POST | Agent ansprechen |

**Wichtig:** 
- ✅ `/agent/marketing` (korrekt)
- ❌ `/agents/marketing` (falsch - mit 's')

---

## 🔍 MCP Server Status prüfen

### 1. Server läuft?
```bash
curl http://138.199.237.34:7000/health
```

**Erwartete Antwort:**
```json
{
  "status": "ok",
  "port": 7000,
  "openai": "configured"
}
```

### 2. Agenten auflisten
```bash
curl http://138.199.237.34:7000/agents
```

**Erwartete Antwort:**
```json
{
  "agents": [
    {
      "id": "marketing",
      "name": "Marketing & Growth Agent",
      "description": "..."
    },
    {
      "id": "automation",
      "name": "Automation Agent",
      "description": "..."
    }
    // ...
  ]
}
```

### 3. Systemd Status
```bash
systemctl status mcp
```

---

## 🛠️ Falls Server nicht läuft

### MCP Server starten:
```bash
systemctl start mcp
systemctl status mcp
```

### MCP Server neu starten:
```bash
systemctl restart mcp
```

### Logs prüfen:
```bash
journalctl -u mcp -n 50
```

---

## 📝 Frontend/API-Route Anpassung

Falls Sie eine Next.js API-Route verwenden, stellen Sie sicher, dass der Endpoint korrekt ist:

### ❌ Falsch:
```typescript
const response = await fetch(`${mcpServerUrl}/agents/marketing`, {
  method: 'POST',
  // ...
});
```

### ✅ Korrekt:
```typescript
const response = await fetch(`${mcpServerUrl}/agent/marketing`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ message }),
});
```

---

## ✅ Zusammenfassung

**Problem:** Endpoint `/agents/marketing` existiert nicht  
**Lösung:** Verwenden Sie `/agent/marketing` (ohne 's')

**Korrekte Endpoints:**
- `GET /health` - Health Check
- `GET /agents` - Liste aller Agenten
- `POST /agent/:agentId` - Agent ansprechen

