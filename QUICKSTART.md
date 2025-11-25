# 🚀 Quick Start Guide

Schnellstart-Anleitung für das komplette System.

## 📦 Was wurde erstellt?

### ✅ MCP Server
- **Datei:** `index.js`
- **Port:** 7777 (für Cursor IDE)
- **Tools:** 12 Tools (n8n, Human Design, Matching, etc.)

### ✅ ChatGPT-Agent
- **Datei:** `chatgpt-agent/server.js`
- **Port:** 4000
- **Features:** OpenAI GPT-4, Memory, Tools, API

### ✅ Docker-Compose
- **Datei:** `docker-compose.yml`
- **Services:** n8n, MCP Server, ChatGPT-Agent

### ✅ Dokumentation
- `README.md` - Hauptdokumentation
- `ARCHITECTURE.md` - Architektur-Übersicht
- `DEPLOYMENT.md` - Hetzner Deployment
- `chatgpt-agent/README.md` - Agent-Dokumentation

## 🏃 Lokaler Start (Entwicklung)

### Schritt 1: Dependencies installieren
```bash
npm install
```

### Schritt 2: Umgebungsvariablen setzen
```bash
# Windows PowerShell
$env:OPENAI_API_KEY="your-openai-api-key"
$env:N8N_BASE_URL="http://localhost:5678"
$env:MCP_SERVER_URL="http://localhost:7777"

# Linux/Mac
export OPENAI_API_KEY="your-openai-api-key"
export N8N_BASE_URL="http://localhost:5678"
export MCP_SERVER_URL="http://localhost:7777"
```

### Schritt 3: Services starten

**Option A: Alles zusammen**
```bash
npm run start:all
```

**Option B: Einzeln**
```bash
# Terminal 1: MCP Server
npm start

# Terminal 2: ChatGPT-Agent
npm run start:agent

# Terminal 3: n8n (wenn lokal installiert)
n8n start
```

## 🧪 Testen

### 1. MCP Server testen
```bash
# Server sollte laufen
# In Cursor IDE: Tools sollten sichtbar sein
```

### 2. ChatGPT-Agent testen
```bash
# Health Check
curl http://localhost:4000/health

# Chat testen
curl -X POST http://localhost:4000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "message": "Hallo, kannst du mir helfen?"
  }'
```

### 3. Reading generieren
```bash
curl -X POST http://localhost:4000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "message": "Erstelle mir ein Human Design Reading für 1990-05-15, 14:30, Berlin"
  }'
```

## 🐳 Docker Start

### Alle Services starten
```bash
docker-compose up -d
```

### Logs anzeigen
```bash
docker-compose logs -f
```

### Services stoppen
```bash
docker-compose down
```

## 📡 API-Endpoints

### ChatGPT-Agent
- `GET /health` - Health Check
- `POST /chat` - Chat-Nachricht verarbeiten
- `GET /session/:userId` - Session-Info
- `DELETE /session/:userId` - Session löschen
- `POST /reading/generate` - Reading direkt generieren
- `POST /matching` - Partner-Matching

## 🔧 Konfiguration

### MCP Server (`config.js`)
```javascript
export const config = {
  n8n: {
    baseUrl: process.env.N8N_BASE_URL || "http://localhost:5678",
    // ...
  }
};
```

### ChatGPT-Agent
Umgebungsvariablen:
- `OPENAI_API_KEY` (erforderlich)
- `MCP_SERVER_URL`
- `N8N_BASE_URL`
- `PORT` (Standard: 4000)

## 📚 Nächste Schritte

1. **n8n Workflows erstellen:**
   - `/webhook/reading` - Reading-Generierung
   - `/webhook/matching` - Partner-Matching
   - `/webhook/chart-analysis` - Chart-Analyse

2. **Connection-Key Server implementieren:**
   - API-Endpoints für App
   - Integration mit ChatGPT-Agent
   - Authentication & Authorization

3. **App-Integration:**
   - API-Calls an Connection-Key Server
   - Chat-Interface
   - User-Management

## 🐛 Troubleshooting

### "Cannot find module"
```bash
npm install
```

### "OPENAI_API_KEY ist erforderlich"
```bash
export OPENAI_API_KEY="your-key"
```

### Port bereits belegt
```bash
# Port ändern in .env oder config
PORT=4001
```

### MCP Server nicht erreichbar
```bash
# Prüfen ob MCP Server läuft
# Für HTTP-API: MCP Server muss HTTP-Server haben
# Aktuell: MCP läuft über stdio für Cursor
```

## 📖 Weitere Dokumentation

- **README.md** - Hauptdokumentation
- **ARCHITECTURE.md** - System-Architektur
- **DEPLOYMENT.md** - Hetzner Deployment
- **chatgpt-agent/README.md** - Agent-Details

## ✅ Checkliste

- [ ] Dependencies installiert (`npm install`)
- [ ] OpenAI API Key gesetzt
- [ ] MCP Server läuft
- [ ] ChatGPT-Agent läuft
- [ ] Health Checks erfolgreich
- [ ] Test-Chat funktioniert
- [ ] n8n konfiguriert (optional)

## 🎉 Fertig!

Ihr System ist jetzt bereit. Starten Sie mit:

```bash
npm run start:all
```

Und testen Sie den Agent:

```bash
curl -X POST http://localhost:4000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test",
    "message": "Hallo!"
  }'
```

