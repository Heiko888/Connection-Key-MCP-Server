# 🔍 Website / UX Agent - Status prüfen

**Datum:** 18.12.2025

---

## ✅ Prüfe ob Agent aktiv ist

### Schritt 1: Prüfe auf MCP Server

```bash
# Auf MCP Server (138.199.237.34)
ssh root@138.199.237.34

# Prüfe ob Agent-Konfiguration existiert
ls -la /opt/ck-agent/agents/website-ux-agent.json

# Prüfe ob Prompt existiert
ls -la /opt/ck-agent/prompts/website-ux-agent.txt

# Prüfe ob Agent in MCP Server Liste ist
curl -s http://localhost:7000/agents | grep -i "website-ux-agent"
```

### Schritt 2: Teste Agent direkt

```bash
# Auf MCP Server
curl -X POST http://localhost:7000/agent/website-ux-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Analysiere folgende Seite aus UX- und Conversion-Sicht: https://www.the-connection-key.de/agents\n\nZiel: Orientierung, Vertrauen, Premium-Wirkung\nZielgruppe: Externe Nutzer (keine internen Agenten)"
  }'
```

### Schritt 3: Prüfe Frontend API Route

```bash
# Auf CK-App Server (167.235.224.149)
ssh root@167.235.224.149

# Prüfe ob API Route existiert
ls -la /opt/hd-app/The-Connection-Key/frontend/pages/api/agents/website-ux-agent.ts
# ODER (App Router)
ls -la /opt/hd-app/The-Connection-Key/frontend/app/api/agents/website-ux-agent/route.ts

# Teste API Route
curl -X POST http://localhost:3000/api/agents/website-ux-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Analysiere folgende Seite aus UX- und Conversion-Sicht: https://www.the-connection-key.de/agents"
  }'
```

---

## 📋 Status-Checkliste

- [ ] Agent-Konfiguration existiert auf MCP Server
- [ ] Prompt-Datei existiert auf MCP Server
- [ ] Agent wird von MCP Server erkannt
- [ ] Agent antwortet auf Test-Anfrage
- [ ] Frontend API Route existiert
- [ ] Frontend API Route funktioniert

---

**🎯 Führe die Prüfungen aus, um den Status zu ermitteln!** 🚀



