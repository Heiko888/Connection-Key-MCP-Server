# 🚀 Website / UX Agent - Frontend API Route Deployment

**Status:** Agent aktiv auf MCP Server ✅ | Frontend API Route fehlt ❌

---

## 📋 Deployment

### Schritt 1: Route auf Server kopieren

```bash
# Auf CK-App Server (167.235.224.149)
ssh root@167.235.224.149

# Verzeichnis erstellen
mkdir -p /opt/hd-app/The-Connection-Key/frontend/app/api/agents/website-ux-agent

# Datei kopieren (von lokal)
# Windows PowerShell:
scp integration/api-routes/app-router/agents/website-ux-agent/route.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/agents/website-ux-agent/route.ts
```

### Schritt 2: Container neu bauen

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key

# Container neu bauen (ohne Cache)
docker compose build --no-cache frontend

# Container neu starten
docker compose up -d frontend

# Warte 15 Sekunden
sleep 15
```

### Schritt 3: Testen

```bash
# GET: API Info
curl -X GET http://localhost:3000/api/agents/website-ux-agent

# POST: Test
curl -X POST http://localhost:3000/api/agents/website-ux-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Analysiere folgende Seite aus UX- und Conversion-Sicht: https://www.the-connection-key.de/agents"
  }'
```

---

## ✅ Nach dem Deployment

Der Agent ist dann verfügbar über:
- **MCP Server:** `http://138.199.237.34:7000/agent/website-ux-agent` ✅
- **Frontend API:** `http://167.235.224.149:3000/api/agents/website-ux-agent` ⚠️ (nach Deployment)

---

**🎯 Führe die Schritte aus, um die Frontend API Route zu aktivieren!** 🚀



