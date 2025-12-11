# 🚀 Website / UX Agent aktivieren

**Status:** Agent noch nicht aktiv ❌

---

## 📋 Schritt-für-Schritt Aktivierung

### Schritt 1: Agent auf MCP Server erstellen

```bash
# Auf MCP Server (138.199.237.34)
ssh root@138.199.237.34

# Script auf Server kopieren (von lokal)
# Windows PowerShell:
scp create-website-ux-agent.sh root@138.199.237.34:/opt/mcp-connection-key/

# Auf Server einloggen
cd /opt/mcp-connection-key

# Script ausführbar machen
chmod +x create-website-ux-agent.sh

# Script ausführen
./create-website-ux-agent.sh
```

**Das Script erstellt automatisch:**
- ✅ Agent-Konfiguration: `/opt/ck-agent/agents/website-ux-agent.json`
- ✅ System-Prompt: `/opt/ck-agent/prompts/website-ux-agent.txt`
- ✅ Startet MCP Server neu

### Schritt 2: Agent testen

```bash
# Auf MCP Server
curl -X POST http://localhost:7000/agent/website-ux-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Analysiere folgende Seite aus UX- und Conversion-Sicht: https://www.the-connection-key.de/agents\n\nZiel: Orientierung, Vertrauen, Premium-Wirkung\nZielgruppe: Externe Nutzer (keine internen Agenten)"
  }'
```

### Schritt 3: Frontend API Route erstellen (optional)

```bash
# Auf CK-App Server (167.235.224.149)
ssh root@167.235.224.149

# Prüfe ob Pages Router oder App Router
cd /opt/hd-app/The-Connection-Key/frontend

# Falls Pages Router:
mkdir -p pages/api/agents
scp integration/api-routes/agents-website-ux-agent.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/pages/api/agents/website-ux-agent.ts

# Falls App Router:
mkdir -p app/api/agents/website-ux-agent
# Erstelle route.ts (siehe integration/api-routes/agents-website-ux-agent.ts)

# Container neu starten
cd /opt/hd-app/The-Connection-Key
docker compose restart frontend
```

---

## ✅ Nach der Aktivierung

Der Agent ist dann verfügbar über:
- **MCP Server:** `http://138.199.237.34:7000/agent/website-ux-agent`
- **Frontend API:** `http://167.235.224.149:3000/api/agents/website-ux-agent`

---

**🎯 Führe Schritt 1 aus, um den Agent zu aktivieren!** 🚀



