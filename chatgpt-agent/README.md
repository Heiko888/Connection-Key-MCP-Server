# ChatGPT-Agent

Der ChatGPT-Agent ist das KI-Gehirn deiner App. Er verarbeitet natürliche Sprache, nutzt MCP Tools, ruft n8n Workflows auf und verwaltet Chat-Sessions.

## 🚀 Features

- ✅ **OpenAI GPT-4 Integration** - Nutzt GPT-4o für intelligente Antworten
- ✅ **MCP Tool-Integration** - Ruft Tools vom MCP Server auf
- ✅ **n8n Integration** - Startet Workflows und Automatisierungen
- ✅ **Memory Management** - Verwaltet Chat-Sessions mit Konversationsverlauf
- ✅ **Human Design Tools** - Generiert Readings, analysiert Charts, macht Matching
- ✅ **REST API** - Vollständige API für App-Integration
- ✅ **Production-Ready** - Bereit für Deployment auf Hetzner

## 📁 Struktur

```
chatgpt-agent/
├── agent.js           # Hauptklasse des Agents
├── server.js          # Express Server mit API-Endpoints
├── mcp-client.js      # Client für MCP Server Kommunikation
├── memory.js          # Session- und Memory-Management
├── tools/             # Tool-Registry
│   ├── index.js
│   ├── human-design.js
│   ├── n8n.js
│   └── user.js
└── README.md
```

## 🛠️ Installation

```bash
# Dependencies installieren
npm install

# Umgebungsvariablen setzen
export OPENAI_API_KEY="your-openai-api-key"
export MCP_SERVER_URL="http://localhost:7777"
export N8N_BASE_URL="http://localhost:5678"
```

## 🚀 Starten

```bash
# Agent Server starten
npm run start:agent

# Oder direkt
node chatgpt-agent/server.js
```

Der Server läuft dann auf `http://localhost:4000`

## 📡 API-Endpoints

### POST /chat
Verarbeitet eine Chat-Nachricht vom Nutzer.

**Request:**
```json
{
  "userId": "user123",
  "message": "Erstelle mir ein Human Design Reading",
  "context": {
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ich habe ein Reading für dich generiert...",
  "toolCalls": [...],
  "sessionId": "user123"
}
```

### GET /session/:userId
Gibt Session-Informationen zurück.

### DELETE /session/:userId
Löscht eine Session.

### POST /reading/generate
Generiert direkt ein Human Design Reading.

**Request:**
```json
{
  "userId": "user123",
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "birthPlace": "Berlin",
  "readingType": "detailed"
}
```

### POST /matching
Führt Partner-Matching durch.

**Request:**
```json
{
  "userId1": "user123",
  "userId2": "user456",
  "user1Chart": {...},
  "user2Chart": {...}
}
```

### GET /health
Health Check Endpoint.

## 🔧 Konfiguration

Der Agent kann über Umgebungsvariablen konfiguriert werden:

```bash
OPENAI_API_KEY=your-key          # OpenAI API Key (erforderlich)
MCP_SERVER_URL=http://localhost:7777  # MCP Server URL
N8N_BASE_URL=http://localhost:5678     # n8n Base URL
PORT=4000                              # Server Port (Standard: 4000)
```

## 💡 Verwendungsbeispiele

### Beispiel 1: Reading generieren
```javascript
const response = await fetch('http://localhost:4000/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    message: 'Erstelle mir ein Human Design Reading für 1990-05-15, 14:30, Berlin'
  })
});
```

### Beispiel 2: Partner-Matching
```javascript
const response = await fetch('http://localhost:4000/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    message: 'Führe ein Matching zwischen mir und user456 durch'
  })
});
```

## 🔌 Integration mit MCP Server

Der Agent kommuniziert mit dem MCP Server über den `MCPClient`. 

**Wichtig:** Der MCP Server muss eine HTTP-API bereitstellen, oder der Client muss angepasst werden, um direkt mit dem MCP Server zu kommunizieren (z.B. über stdio).

## 🧠 Memory Management

Der Agent verwaltet automatisch Chat-Sessions:
- Speichert Konversationsverlauf
- Begrenzt auf 50 Nachrichten pro Session (Performance)
- Löscht alte Nachrichten automatisch
- Unterstützt Session-Metadaten

## 🛠️ Tools

Der Agent hat Zugriff auf folgende Tools:

### Human Design
- `generateReading` - Generiert Readings
- `analyzeChart` - Analysiert Charts
- `matchPartner` - Partner-Matching

### n8n
- `callN8NWorkflow` - Ruft Workflows auf
- `createN8NWorkflow` - Erstellt Workflows

### User
- `saveUserData` - Speichert User-Daten

## 🐳 Docker

Siehe `docker-compose.yml` im Hauptverzeichnis für Docker-Setup.

## 📊 Monitoring

- Health Check: `GET /health`
- Logs: Alle Requests werden geloggt
- Error Handling: Vollständige Fehlerbehandlung

## 🔐 Sicherheit

- API Keys über Umgebungsvariablen
- Input-Validierung
- Error Handling
- Rate Limiting (empfohlen für Produktion)

## 🚀 Deployment auf Hetzner

1. Server aufsetzen
2. Node.js installieren
3. Code deployen
4. Umgebungsvariablen setzen
5. PM2 oder Docker verwenden
6. Reverse Proxy (nginx) konfigurieren

Siehe `ARCHITECTURE.md` für Details.

