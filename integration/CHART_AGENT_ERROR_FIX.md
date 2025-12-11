# 🔧 Fix: "failed to call chart agent"

## ❌ Problem

**Fehler:** "failed to call chart agent"

**Mögliche Ursachen:**
1. Frontend-Komponente ruft falschen API-Endpoint auf
2. API-Route hat einen Fehler
3. MCP Server ist nicht erreichbar
4. Environment Variables fehlen
5. CORS-Problem
6. Browser-Console zeigt spezifischen Fehler

---

## 🔍 Diagnose

Führen Sie das Diagnose-Script aus:

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend
chmod +x integration/DIAGNOSE_CHART_AGENT_ERROR.sh
./integration/DIAGNOSE_CHART_AGENT_ERROR.sh
```

Das Script prüft:
1. ✅ Chart-Seite existiert und verwendet ChartDevelopment
2. ✅ ChartDevelopment-Komponente ruft richtigen API-Endpoint auf
3. ✅ API-Route existiert und ist korrekt konfiguriert
4. ✅ API-Route funktioniert (direkter Test)
5. ✅ Environment Variables sind gesetzt
6. ✅ MCP Server ist erreichbar und hat Chart Agent
7. ✅ MCP Server funktioniert (direkter Test)

---

## 🛠️ Häufige Fehler und Lösungen

### Fehler 1: "Cannot GET /api/agents/chart-development"

**Ursache:** Frontend macht GET statt POST

**Lösung:** Prüfen Sie ChartDevelopment.tsx:

```typescript
// ✅ Korrekt
const res = await fetch('/api/agents/chart-development', {
  method: 'POST',  // Wichtig: POST!
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ message }),
});

// ❌ Falsch
const res = await fetch('/api/agents/chart-development', {
  method: 'GET',  // Falsch!
  ...
});
```

### Fehler 2: "Network Error" oder "Failed to fetch"

**Ursache:** API-Route nicht erreichbar oder CORS-Problem

**Lösung:**
1. Prüfen Sie ob Next.js läuft: `docker ps | grep frontend`
2. Prüfen Sie CORS auf Hetzner Server
3. Prüfen Sie Firewall-Regeln

### Fehler 3: "Agent chart-development not found"

**Ursache:** Chart Agent nicht im MCP Server konfiguriert

**Lösung:**
```bash
# Auf Hetzner Server
curl http://138.199.237.34:7000/agents | grep chart-development

# Falls nicht vorhanden:
cd /opt/mcp-connection-key
chmod +x integration/install-chart-agent.sh
./integration/install-chart-agent.sh
```

### Fehler 4: "MCP_SERVER_URL is not defined"

**Ursache:** Environment Variable fehlt

**Lösung:**
```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe .env.local
grep MCP_SERVER_URL .env.local

# Falls nicht vorhanden:
echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local

# Next.js neu starten
docker restart the-connection-key-frontend-1
```

### Fehler 5: Browser-Console zeigt spezifischen Fehler

**Ursache:** JavaScript-Fehler in der Komponente

**Lösung:**
1. Öffnen Sie Browser-Console (F12)
2. Prüfen Sie den Fehler
3. Prüfen Sie Network-Tab für API-Request
4. Prüfen Sie Response-Status und -Body

---

## 📋 Quick Fix Checklist

### Auf CK-App Server:

```bash
# 1. Prüfe Chart-Seite
cat app/agents/chart/page.tsx | grep ChartDevelopment

# 2. Prüfe ChartDevelopment-Komponente
grep "chart-development" components/agents/ChartDevelopment.tsx

# 3. Teste API-Route
curl -X POST http://localhost:3000/api/agents/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'

# 4. Prüfe Environment Variables
grep MCP_SERVER_URL .env.local

# 5. Prüfe Next.js läuft
docker ps | grep frontend
```

### Auf Hetzner Server:

```bash
# 1. Prüfe Chart Agent
curl http://localhost:7000/agents | grep chart-development

# 2. Teste Chart Agent direkt
curl -X POST http://localhost:7000/agent/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'

# 3. Prüfe MCP Server läuft
systemctl status mcp
```

---

## 🔍 Browser-Console prüfen

**Wichtig:** Öffnen Sie die Browser-Console (F12) und prüfen Sie:

1. **Console-Tab:**
   - Gibt es JavaScript-Fehler?
   - Gibt es Fehlermeldungen?

2. **Network-Tab:**
   - Wird `/api/agents/chart-development` aufgerufen?
   - Welcher Status-Code wird zurückgegeben?
   - Was ist in der Response?

3. **Request-Details:**
   - Method: Muss `POST` sein
   - Headers: `Content-Type: application/json`
   - Body: `{"message": "..."}`

---

## ✅ Erwartetes Verhalten

### Erfolgreicher API-Call:

**Request:**
```
POST /api/agents/chart-development
Content-Type: application/json
Body: {"message": "Erstelle eine Bodygraph-Komponente"}
```

**Response:**
```json
{
  "success": true,
  "agent": "chart-development",
  "message": "Erstelle eine Bodygraph-Komponente",
  "response": "...",
  "tokens": 1552,
  "model": "gpt-4",
  "timestamp": "2025-12-08T22:26:07.823Z"
}
```

---

## 📋 Zusammenfassung

**Problem:** "failed to call chart agent"

**Lösung:**
1. ✅ Führen Sie Diagnose-Script aus
2. ✅ Prüfen Sie Browser-Console (F12)
3. ✅ Prüfen Sie Network-Tab
4. ✅ Prüfen Sie API-Route direkt
5. ✅ Prüfen Sie MCP Server

**Häufigste Ursachen:**
- GET statt POST
- Falscher API-Endpoint
- Environment Variables fehlen
- MCP Server nicht erreichbar

