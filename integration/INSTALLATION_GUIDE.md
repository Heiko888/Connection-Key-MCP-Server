# 🚀 Komplette Installations-Anleitung

## 📋 Übersicht

Alle 4 Schritte sind abgeschlossen:
1. ✅ API-Routes für alle 5 Agenten
2. ✅ Frontend-Komponenten
3. ✅ CORS-Konfiguration
4. ✅ Reading Agent Integration

---

## 📁 Datei-Struktur

```
integration/
├── api-routes/
│   ├── agents-marketing.ts
│   ├── agents-automation.ts
│   ├── agents-sales.ts
│   ├── agents-social-youtube.ts
│   └── readings-generate.ts
├── frontend/
│   ├── components/
│   │   ├── AgentChat.tsx
│   │   └── ReadingGenerator.tsx
│   └── pages/
│       └── agents-dashboard.tsx
├── cors/
│   ├── setup-cors.sh
│   └── CORS_SETUP.md
└── reading-agent/
    └── INTEGRATION_COMPLETE.md
```

---

## 🔧 Installation auf CK-App Server (167.235.224.149)

### Schritt 1: API-Routes installieren

```bash
cd /path/to/your/nextjs-app

# Für Pages Router
mkdir -p pages/api/agents
mkdir -p pages/api/readings

cp integration/api-routes/agents-*.ts pages/api/agents/
cp integration/api-routes/readings-generate.ts pages/api/readings/generate.ts

# Für App Router (Anpassung nötig)
# Siehe README_API_ROUTES.md
```

### Schritt 2: Environment Variables

```bash
# .env.local
MCP_SERVER_URL=http://138.199.237.34:7000
READING_AGENT_URL=http://138.199.237.34:4001
```

### Schritt 3: Frontend-Komponenten installieren

```bash
# Für Pages Router
mkdir -p components/agents
cp integration/frontend/components/*.tsx components/agents/
cp integration/frontend/pages/agents-dashboard.tsx pages/

# Für App Router (Anpassung nötig)
# Siehe README_COMPONENTS.md
```

### Schritt 4: CSS hinzufügen

```bash
# Erstellen Sie styles/agents.css
# Siehe README_COMPONENTS.md für CSS-Code
```

---

## 🔧 Installation auf Hetzner Server (138.199.237.34)

### Schritt 1: CORS konfigurieren

```bash
cd /opt/mcp-connection-key

# Kopiere CORS-Script
cp integration/cors/setup-cors.sh .
chmod +x setup-cors.sh

# Ausführen
./setup-cors.sh
```

### Schritt 2: Firewall prüfen

```bash
# Prüfe ob Port 4001 offen ist
ufw status | grep 4001

# Falls nicht:
ufw allow 4001/tcp
```

### Schritt 3: Services prüfen

```bash
# Prüfe alle Services
docker-compose ps
pm2 status
systemctl status mcp

# Alle sollten "running" sein
```

---

## 🧪 Testing

### 1. API-Routes testen

```bash
# Marketing Agent
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'

# Reading Agent
curl -X POST http://localhost:3000/api/readings/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin"
  }'
```

### 2. Frontend testen

1. Öffnen Sie `http://localhost:3000/agents-dashboard`
2. Testen Sie jeden Agenten
3. Öffnen Sie `/readings/create`
4. Generieren Sie ein Reading

### 3. CORS testen

```bash
# Vom Browser (DevTools Console)
fetch('http://138.199.237.34:4001/health')
  .then(r => r.json())
  .then(console.log)
```

---

## ✅ Fertig!

Nach der Installation sollten alle Agenten über das Frontend erreichbar sein:

- ✅ Marketing Agent
- ✅ Automation Agent
- ✅ Sales Agent
- ✅ Social-YouTube Agent
- ✅ Reading Agent

**Viel Erfolg!** 🎉

