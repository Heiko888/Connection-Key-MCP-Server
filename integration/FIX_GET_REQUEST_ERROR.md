# 🔧 Fix: "Cannot GET /agent/marketing"

## ❌ Problem

**Fehler:** `Cannot GET /agent/marketing`

**Ursache:** Der MCP Server akzeptiert nur POST-Requests, aber es wurde ein GET-Request gesendet.

---

## ✅ Lösung

### Option 1: GET-Request in POST ändern (Empfohlen)

**Wenn Sie direkt im Browser testen:**
- Browser machen automatisch GET-Requests
- Verwenden Sie stattdessen `curl` oder Postman

**Richtiger Aufruf:**
```bash
# ✅ POST-Request (funktioniert)
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'

# ❌ GET-Request (funktioniert NICHT)
curl http://138.199.237.34:7000/agent/marketing
```

### Option 2: MCP Server erweitern (GET-Support hinzufügen)

Falls Sie GET-Requests unterstützen möchten, können wir den MCP Server erweitern:

```javascript
// In /opt/mcp/server.js hinzufügen:

// GET-Request für Agent-Info (ohne Ausführung)
app.get('/agent/:agentId', (req, res) => {
  const { agentId } = req.params;
  const agentConfig = loadAgentConfig(agentId);
  
  if (!agentConfig) {
    return res.status(404).json({ 
      error: `Agent ${agentId} not found`,
      availableAgents: ['marketing', 'automation', 'sales', 'social-youtube', 'chart-development']
    });
  }
  
  res.json({
    agent: agentConfig.id,
    name: agentConfig.name,
    description: agentConfig.description,
    note: 'Use POST /agent/:agentId to execute the agent',
    example: {
      method: 'POST',
      url: `/agent/${agentId}`,
      body: { message: 'Your message here' }
    }
  });
});
```

---

## 🔍 Wo kommt der GET-Request her?

### Mögliche Quellen:

1. **Browser-Direktaufruf:**
   - Jemand öffnet `http://138.199.237.34:7000/agent/marketing` im Browser
   - Browser macht automatisch GET-Request

2. **n8n Workflow:**
   - HTTP Request Node ist auf GET statt POST eingestellt

3. **Frontend:**
   - Frontend macht GET statt POST

4. **Link/Bookmark:**
   - Jemand hat einen Link gespeichert

---

## ✅ Korrekte Verwendung

### Für n8n Workflow:

**HTTP Request Node:**
- Method: `POST` (nicht GET!)
- URL: `http://138.199.237.34:7000/agent/marketing`
- Body: `{"message": "..."}`

### Für Frontend:

**AgentChat.tsx:**
```typescript
// ✅ Korrekt
const res = await fetch('/api/agents/marketing', {
  method: 'POST',  // Wichtig: POST!
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ message }),
});
```

### Für direkten Test:

```bash
# ✅ Korrekt
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

---

## 🛠️ Quick Fix für n8n

Falls der Fehler aus n8n kommt:

1. Öffnen Sie den HTTP Request Node
2. Prüfen Sie **Method:** Muss `POST` sein (nicht GET!)
3. Prüfen Sie **Send Body:** Muss aktiviert sein
4. Prüfen Sie **Body Content Type:** Muss `JSON` sein

---

## 📋 Zusammenfassung

**Problem:** GET-Request wird gesendet, aber MCP Server akzeptiert nur POST

**Lösung:**
- ✅ Verwenden Sie POST-Requests
- ✅ Prüfen Sie n8n Workflow (Method: POST)
- ✅ Prüfen Sie Frontend (method: 'POST')
- ✅ Verwenden Sie curl mit -X POST

**MCP Server Endpoints:**
- `GET /health` ✅ (funktioniert)
- `GET /agents` ✅ (funktioniert - Liste)
- `POST /agent/:agentId` ✅ (funktioniert - Agent ausführen)
- `GET /agent/:agentId` ❌ (funktioniert NICHT - nur POST)

