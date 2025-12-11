# 🔧 Fix: Endpoint-Inkonsistenz zwischen 'agent' und 'agents'

## ❌ Problem

Serverübergreifend gibt es Inkonsistenzen zwischen:
- `/agent/...` (ohne 's')
- `/agents/...` (mit 's')

---

## 📊 Aktuelle Situation

### Frontend (AgentChat.tsx)
```typescript
fetch(`/api/agents/${agentId}`)  // ✅ Mit 's' - KORREKT
```

### Next.js API-Routes (sollten sein)
```typescript
// pages/api/agents/marketing.ts
fetch(`${MCP_SERVER_URL}/agent/${AGENT_ID}`)  // ✅ Ohne 's' - KORREKT
```

### MCP Server (sollte sein)
```javascript
// /opt/mcp/server.js
app.post('/agent/:agentId', ...)  // ✅ Ohne 's' - KORREKT
app.get('/agents', ...)           // ✅ Mit 's' - KORREKT (Liste)
```

---

## 🔍 Verifikation

### Schritt 1: Prüfe MCP Server

**Auf Hetzner Server:**
```bash
# Prüfe Server.js
grep "app.post('/agent" /opt/mcp/server.js

# Sollte zeigen:
# app.post('/agent/:agentId', ...)  ✅
```

**Teste Endpoints:**
```bash
# Liste (mit 's') - sollte funktionieren
curl http://138.199.237.34:7000/agents

# Agent-Aufruf (ohne 's') - sollte funktionieren
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

### Schritt 2: Prüfe Next.js API-Routes

**Auf CK-App Server:**
```bash
cd /opt/hd-app/The-Connection-Key/frontend/pages/api/agents

# Prüfe alle Routes
for file in *.ts; do
    echo "=== $file ==="
    grep -E "(/agent/|/agents/)" "$file" || echo "Kein Endpoint gefunden"
    echo ""
done
```

**Sollte zeigen:**
```typescript
// ✅ Korrekt
fetch(`${MCP_SERVER_URL}/agent/${AGENT_ID}`)

// ❌ Falsch (falls vorhanden)
fetch(`${MCP_SERVER_URL}/agents/${AGENT_ID}`)
```

---

## 🔧 Fix-Anleitung

### Fix 1: Next.js API-Routes korrigieren

**Auf CK-App Server:**
```bash
cd /opt/hd-app/The-Connection-Key/frontend/pages/api/agents

# Korrigiere alle Routes
sed -i 's|/agents/\${AGENT_ID}|/agent/\${AGENT_ID}|g' *.ts
sed -i 's|/agents/`|/agent/`|g' *.ts
sed -i 's|/agents/"|/agent/"|g' *.ts
sed -i "s|/agents/'|/agent/'|g" *.ts

# Prüfe Änderungen
grep -E "(/agent/|/agents/)" *.ts
```

### Fix 2: MCP Server prüfen

**Auf Hetzner Server:**
```bash
cd /opt/mcp

# Prüfe Server.js
grep "app.post" server.js

# Falls falsch, korrigieren:
# Sollte sein: app.post('/agent/:agentId', ...)
```

### Fix 3: Frontend prüfen

**AgentChat.tsx sollte aufrufen:**
```typescript
// ✅ Korrekt
fetch(`/api/agents/${agentId}`)  // Mit 's' - für Next.js API
```

**NICHT:**
```typescript
// ❌ Falsch
fetch(`http://138.199.237.34:7000/agents/${agentId}`)  // Direkt MCP
```

---

## ✅ Korrekte Endpoint-Hierarchie

```
┌─────────────────────────────────────────┐
│ Frontend (AgentChat.tsx)               │
│ /api/agents/marketing                   │ ← Mit 's'
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ Next.js API (pages/api/agents/*.ts)    │
│ Ruft auf:                               │
│ http://138.199.237.34:7000/agent/...   │ ← Ohne 's'
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ MCP Server (/opt/mcp/server.js)         │
│ POST /agent/:agentId                    │ ← Ohne 's'
│ GET  /agents                            │ ← Mit 's' (Liste)
└─────────────────────────────────────────┘
```

---

## 🧪 Test-Script

```bash
#!/bin/bash
# Teste alle Endpoints

MCP_SERVER="http://138.199.237.34:7000"

echo "🧪 Endpoint-Tests"
echo "================="
echo ""

# Test 1: MCP Server Health
echo "1. MCP Server Health:"
curl -s "$MCP_SERVER/health" | jq -r '.status' || echo "❌ Fehler"
echo ""

# Test 2: Agent-Liste (mit 's')
echo "2. Agent-Liste (GET /agents):"
curl -s "$MCP_SERVER/agents" | jq -r '.agents[].id' || echo "❌ Fehler"
echo ""

# Test 3: Agent-Aufruf (ohne 's')
echo "3. Agent-Aufruf (POST /agent/marketing):"
curl -s -X POST "$MCP_SERVER/agent/marketing" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}' | jq -r '.agent' || echo "❌ Fehler"
echo ""

# Test 4: Falscher Endpoint (sollte 404 geben)
echo "4. Falscher Endpoint (POST /agents/marketing - sollte 404):"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$MCP_SERVER/agents/marketing" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}')
if [ "$STATUS" = "404" ]; then
    echo "   ✅ Korrekt: 404 (Endpoint existiert nicht)"
else
    echo "   ⚠️  Status: $STATUS"
fi
echo ""
```

---

## 📋 Checkliste

### MCP Server
- [ ] `POST /agent/:agentId` existiert (ohne 's')
- [ ] `GET /agents` existiert (mit 's' - Liste)
- [ ] Server läuft: `systemctl status mcp`

### Next.js API-Routes
- [ ] Route: `/api/agents/marketing` (mit 's')
- [ ] Ruft auf: `/agent/marketing` (ohne 's')
- [ ] Dateien existieren auf CK-App Server

### Frontend
- [ ] Ruft auf: `/api/agents/${agentId}` (mit 's')
- [ ] NICHT direkt MCP Server

---

## 🚀 Quick Fix

**Falls Next.js API-Routes falsch sind:**

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend/pages/api/agents

# Korrigiere alle Dateien
for file in *.ts; do
    sed -i 's|/agents/\${AGENT_ID}|/agent/\${AGENT_ID}|g' "$file"
    sed -i 's|/agents/`|/agent/`|g' "$file"
    sed -i 's|/agents/"|/agent/"|g' "$file"
done

# Prüfe
grep -E "(/agent/|/agents/)" *.ts
```

**Dann Next.js App neu starten:**
```bash
docker restart the-connection-key-frontend-1
```

---

## ✅ Zusammenfassung

**Korrekte Endpoints:**
- Frontend → Next.js: `/api/agents/...` (mit 's')
- Next.js → MCP: `/agent/...` (ohne 's')
- MCP Server: `POST /agent/:agentId` (ohne 's')

**Verwenden Sie das Verification-Script:**
```bash
chmod +x integration/scripts/verify-endpoints.sh
./integration/scripts/verify-endpoints.sh
```

