# 🔍 Endpoint-Verification - Serverübergreifend

## 📊 Aktuelle Endpoint-Struktur

### Frontend → Next.js API (CK-App Server)

**Frontend ruft auf:**
```
POST /api/agents/marketing     ✅ (mit 's')
POST /api/agents/automation    ✅ (mit 's')
POST /api/agents/sales         ✅ (mit 's')
POST /api/agents/social-youtube ✅ (mit 's')
```

### Next.js API → MCP Server (Hetzner Server)

**Next.js API ruft auf:**
```
POST http://138.199.237.34:7000/agent/marketing      ✅ (ohne 's')
POST http://138.199.237.34:7000/agent/automation     ✅ (ohne 's')
POST http://138.199.237.34:7000/agent/sales           ✅ (ohne 's')
POST http://138.199.237.34:7000/agent/social-youtube  ✅ (ohne 's')
```

### MCP Server Endpoints (Hetzner Server)

**Verfügbare Endpoints:**
```
GET  /health                    ✅
GET  /agents                   ✅ (mit 's' - Liste aller Agenten)
POST /agent/:agentId            ✅ (ohne 's' - Agent aufrufen)
```

---

## ✅ Korrekte Struktur

```
Frontend (https://www.the-connection-key.de)
    │
    │ POST /api/agents/marketing (mit 's')
    ▼
Next.js API Route (pages/api/agents/marketing.ts)
    │
    │ POST http://138.199.237.34:7000/agent/marketing (ohne 's')
    ▼
MCP Server (138.199.237.34:7000)
    │
    │ POST /agent/marketing (ohne 's')
    ▼
OpenAI API
```

---

## 🔍 Verifikation

### 1. Prüfe Next.js API-Routes

**Auf CK-App Server:**
```bash
# Prüfe ob Routes existieren
ls -la /opt/hd-app/The-Connection-Key/frontend/pages/api/agents/

# Sollte zeigen:
# - marketing.ts
# - automation.ts
# - sales.ts
# - social-youtube.ts
```

**Prüfe Inhalt einer Route:**
```bash
# Marketing Route prüfen
cat /opt/hd-app/The-Connection-Key/frontend/pages/api/agents/marketing.ts | grep -A 5 "MCP_SERVER_URL"
```

**Sollte enthalten:**
```typescript
const response = await fetch(`${MCP_SERVER_URL}/agent/${AGENT_ID}`, {
  // ✅ /agent/marketing (ohne 's')
});
```

### 2. Prüfe MCP Server Endpoints

**Auf Hetzner Server:**
```bash
# Prüfe MCP Server Status
systemctl status mcp

# Teste Health
curl http://138.199.237.34:7000/health

# Teste Agent-Liste
curl http://138.199.237.34:7000/agents

# Teste Agent-Aufruf
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

**Prüfe MCP Server Code:**
```bash
# Prüfe Server.js
grep -A 10 "app.post('/agent" /opt/mcp/server.js

# Sollte zeigen:
# app.post('/agent/:agentId', async (req, res) => {
#   ✅ /agent/:agentId (ohne 's')
```

### 3. Prüfe Frontend-Komponente

**AgentChat.tsx sollte aufrufen:**
```typescript
const res = await fetch(`/api/agents/${agentId}`, {
  // ✅ /api/agents/marketing (mit 's')
});
```

---

## ❌ Häufige Fehler

### Fehler 1: Frontend ruft falschen Endpoint auf

**Falsch:**
```typescript
// Frontend ruft direkt MCP Server auf
fetch('http://138.199.237.34:7000/agents/marketing') // ❌ mit 's'
```

**Richtig:**
```typescript
// Frontend ruft Next.js API auf
fetch('/api/agents/marketing') // ✅ mit 's'
```

### Fehler 2: Next.js API ruft falschen Endpoint auf

**Falsch:**
```typescript
// In pages/api/agents/marketing.ts
fetch(`${MCP_SERVER_URL}/agents/marketing`) // ❌ mit 's'
```

**Richtig:**
```typescript
// In pages/api/agents/marketing.ts
fetch(`${MCP_SERVER_URL}/agent/marketing`) // ✅ ohne 's'
```

### Fehler 3: MCP Server hat falschen Endpoint

**Falsch:**
```javascript
// In /opt/mcp/server.js
app.post('/agents/:agentId', ...) // ❌ mit 's'
```

**Richtig:**
```javascript
// In /opt/mcp/server.js
app.post('/agent/:agentId', ...) // ✅ ohne 's'
```

---

## 🔧 Fix-Script

### Prüfe und korrigiere alle Endpoints

```bash
#!/bin/bash
# Endpoint-Verification Script

echo "🔍 Endpoint-Verification"
echo "======================="
echo ""

# 1. Prüfe MCP Server
echo "1. MCP Server Endpoints:"
echo "   Health:"
curl -s http://138.199.237.34:7000/health | jq -r '.status' || echo "   ❌ MCP Server nicht erreichbar"
echo ""

echo "   Agent-Liste (/agents mit 's'):"
curl -s http://138.199.237.34:7000/agents | jq -r '.agents[].id' || echo "   ❌ Fehler"
echo ""

echo "   Agent-Aufruf (/agent ohne 's'):"
curl -s -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}' | jq -r '.agent' || echo "   ❌ Fehler"
echo ""

# 2. Prüfe Next.js API-Routes (falls auf Server)
if [ -d "/opt/hd-app/The-Connection-Key/frontend/pages/api/agents" ]; then
    echo "2. Next.js API-Routes:"
    for file in /opt/hd-app/The-Connection-Key/frontend/pages/api/agents/*.ts; do
        if [ -f "$file" ]; then
            echo "   $(basename $file):"
            if grep -q "/agent/\${AGENT_ID}" "$file" || grep -q "/agent/\`" "$file"; then
                echo "      ✅ Korrekt: /agent/... (ohne 's')"
            else
                echo "      ❌ Falsch: Prüfe Endpoint"
            fi
        fi
    done
else
    echo "2. Next.js API-Routes: Nicht gefunden auf diesem Server"
fi
echo ""

echo "✅ Verification abgeschlossen"
```

---

## 📋 Checkliste

### Frontend (AgentChat.tsx)
- [ ] Ruft `/api/agents/${agentId}` auf (mit 's')
- [ ] NICHT direkt MCP Server

### Next.js API (pages/api/agents/*.ts)
- [ ] Route existiert: `/api/agents/marketing` (mit 's')
- [ ] Ruft MCP Server auf: `/agent/marketing` (ohne 's')
- [ ] URL: `http://138.199.237.34:7000/agent/${AGENT_ID}`

### MCP Server (/opt/mcp/server.js)
- [ ] Endpoint: `POST /agent/:agentId` (ohne 's')
- [ ] Liste: `GET /agents` (mit 's')
- [ ] Health: `GET /health`

---

## 🚀 Quick Fix

Falls Endpoints falsch sind:

### Fix Next.js API-Route

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend/pages/api/agents

# Prüfe und korrigiere
sed -i 's|/agents/${AGENT_ID}|/agent/${AGENT_ID}|g' *.ts
sed -i 's|/agents/`|/agent/`|g' *.ts
```

### Fix MCP Server (falls nötig)

```bash
# Auf Hetzner Server
cd /opt/mcp

# Prüfe Server.js
grep "app.post('/agent" server.js

# Falls falsch, korrigieren:
# app.post('/agent/:agentId', ...) ✅
```

---

## ✅ Zusammenfassung

**Korrekte Endpoint-Struktur:**

1. **Frontend:** `/api/agents/marketing` (mit 's')
2. **Next.js API:** `http://138.199.237.34:7000/agent/marketing` (ohne 's')
3. **MCP Server:** `POST /agent/:agentId` (ohne 's')

**Wichtig:**
- Frontend → Next.js: `/api/agents/...` (mit 's')
- Next.js → MCP: `/agent/...` (ohne 's')
- MCP Server: `/agent/:agentId` (ohne 's')

