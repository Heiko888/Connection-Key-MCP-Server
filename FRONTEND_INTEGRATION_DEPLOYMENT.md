# 🚀 Frontend-Integration - Deployment-Anleitung

**Priorität 1, Aufgabe 2: Frontend-Integration**

---

## 📋 Übersicht

### Was muss auf CK-App Server (167.235.224.149) deployt werden:

1. **API-Routes** (5 Dateien)
2. **Frontend-Komponenten** (2 Komponenten)
3. **Dashboard-Seite** (1 Seite)
4. **Environment Variables** (.env.local)
5. **CORS-Konfiguration** (auf Hetzner Server)

---

## 📁 Dateien-Struktur

### API-Routes (Pages Router)

```
pages/
  api/
    agents/
      marketing.ts          ← Von integration/api-routes/
      automation.ts          ← Von integration/api-routes/
      sales.ts               ← Von integration/api-routes/
      social-youtube.ts      ← Von integration/api-routes/
    readings/
      generate.ts            ← Von integration/api-routes/
```

### Frontend-Komponenten

```
components/
  agents/
    AgentChat.tsx           ← Von integration/frontend/components/
    AgentCard.tsx           ← Neu erstellen
```

### Pages

```
pages/
  coach/
    agents/
      index.tsx             ← Agent Dashboard
      [agentId].tsx         ← Einzelner Agent
    readings/
      create.tsx            ← Reading Generator (erweitern)
```

---

## 🚀 Deployment-Schritte

### Schritt 1: API-Routes kopieren

**Auf CK-App Server:**

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Erstelle Verzeichnisse
mkdir -p pages/api/agents
mkdir -p pages/api/readings

# Kopiere API-Routes
cp /path/to/integration/api-routes/agents-marketing.ts pages/api/agents/marketing.ts
cp /path/to/integration/api-routes/agents-automation.ts pages/api/agents/automation.ts
cp /path/to/integration/api-routes/agents-sales.ts pages/api/agents/sales.ts
cp /path/to/integration/api-routes/agents-social-youtube.ts pages/api/agents/social-youtube.ts
cp /path/to/integration/api-routes/readings-generate.ts pages/api/readings/generate.ts
```

### Schritt 2: Frontend-Komponenten kopieren

```bash
# Erstelle Verzeichnis
mkdir -p components/agents

# Kopiere Komponenten
cp /path/to/integration/frontend/components/AgentChat.tsx components/agents/
```

### Schritt 3: Environment Variables setzen

**In `.env.local` auf CK-App Server:**

```bash
# MCP Server (für Agenten 1-4)
MCP_SERVER_URL=http://138.199.237.34:7000
NEXT_PUBLIC_MCP_SERVER_URL=http://138.199.237.34:7000

# Reading Agent (für Agent 5)
READING_AGENT_URL=http://138.199.237.34:4001
NEXT_PUBLIC_READING_AGENT_URL=http://138.199.237.34:4001
```

### Schritt 4: CORS konfigurieren

**Auf Hetzner Server (138.199.237.34):**

```bash
# Prüfe MCP Server CORS-Konfiguration
# In /opt/mcp/server.js sollte stehen:
# CORS_ORIGINS=https://www.the-connection-key.de,https://the-connection-key.de

# Oder in .env:
echo "CORS_ORIGINS=https://www.the-connection-key.de,https://the-connection-key.de" >> /opt/mcp/.env
systemctl restart mcp
```

### Schritt 5: App neu starten

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend
npm run build
pm2 restart the-connection-key
# Oder: npm run dev (für Development)
```

---

## ✅ Checkliste

- [ ] API-Routes kopiert (5 Dateien)
- [ ] Frontend-Komponenten kopiert
- [ ] Environment Variables gesetzt
- [ ] CORS konfiguriert
- [ ] App neu gestartet
- [ ] Tests durchgeführt

---

**Status:** 📋 Bereit für Deployment

