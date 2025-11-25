# Architektur-Dokumentation: MCP Server + n8n + ChatGPT-Agent

## 🏗️ System-Architektur

```
┌─────────────┐
│     App     │ (Frontend / Mobile App)
└──────┬──────┘
       │ HTTP/API
       ↓
┌──────────────────────┐
│ Connection-Key Server│ (Zentrale API, Port 3000)
│  - API Endpoints      │
│  - Business Logic     │
│  - Auth & Validation  │
└──────┬────────────────┘
       │
       │ HTTP/API
       ↓
┌──────────────────────┐
│  ChatGPT-Agent       │ (KI-Gehirn, Port 4000)
│  - OpenAI GPT-4       │
│  - Memory/Sessions    │
│  - Tool Management    │
└──────┬────────┬───────┘
       │        │
       │        │ HTTP/API
       │        ↓
       │  ┌─────────────┐
       │  │ MCP Server  │ (Tool-Server, Port 7777)
       │  │  - Tools    │
       │  │  - n8n API  │
       │  └──────┬──────┘
       │         │
       │         │ HTTP/Webhook
       │         ↓
       │  ┌─────────────┐
       │  │    n8n      │ (Workflow Engine, Port 5678)
       │  │  - Workflows│
       │  │  - Automation│
       │  └─────────────┘
       │
       │ HTTP/API
       ↓
┌─────────────┐
│    n8n      │ (Direkt von Connection-Key)
└─────────────┘
```

## 🔄 Datenfluss

### 1. App → Connection-Key Server
```
POST /api/chat
{
  "userId": "user123",
  "message": "Erstelle mir ein Human Design Reading für 1990-05-15, 14:30, Berlin"
}
```

### 2. Connection-Key Server → ChatGPT-Agent
```javascript
// Connection-Key ruft ChatGPT-Agent auf
const response = await fetch("http://chatgpt-agent:4000/chat", {
  method: "POST",
  body: JSON.stringify({
    userId: "user123",
    message: "Erstelle mir ein Human Design Reading...",
    context: { birthDate, birthTime, birthPlace }
  })
});
```

### 3. ChatGPT-Agent → MCP Server
```javascript
// Agent ruft MCP Tool auf
const result = await mcpClient.callTool("generateReading", {
  birthDate: "1990-05-15",
  birthTime: "14:30",
  birthPlace: "Berlin"
});
```

### 4. MCP Server → n8n
```javascript
// MCP ruft n8n Webhook auf
await fetch("https://n8n.deinedomain.tld/webhook/reading", {
  method: "POST",
  body: JSON.stringify({ birthDate, birthTime, birthPlace })
});
```

### 5. n8n → Processing
- n8n Workflow verarbeitet die Daten
- Ruft ggf. OpenAI API auf
- Speichert Daten in Datenbank
- Generiert Reading

### 6. Antwort zurück
```
n8n → MCP → ChatGPT-Agent → Connection-Key → App
```

Der ChatGPT-Agent verarbeitet die Antwort, formatiert sie natürlich und gibt sie zurück.

## 🛠️ Verfügbare Tools

### ChatGPT-Agent Tools (über MCP)
Der ChatGPT-Agent kann folgende Tools nutzen:

#### Human Design
- **generateReading**: Generiert Human Design Readings
- **analyzeChart**: Analysiert Chart-Daten
- **matchPartner**: Führt Partner-Matching durch

#### n8n Integration
- **callN8NWorkflow**: Ruft n8n Workflows über Webhook auf
- **createN8NWorkflow**: Erstellt neue Workflows programmatisch

#### User Management
- **saveUserData**: Speichert User-Daten über n8n

### MCP Server Tools
- **callN8N**: Direkter API-Aufruf zu n8n
- **createN8NWorkflow**: Erstellt neue Workflows programmatisch
- **triggerN8NWebhook**: Löst Webhook-Workflows aus
- **generateReading**: Generiert Human Design Readings
- **analyzeChart**: Analysiert Chart-Daten
- **matchPartner**: Führt Partner-Matching durch
- **saveUserData**: Speichert User-Daten über n8n

## 📋 Beispiel-Workflows in n8n

### Workflow 1: Reading Generation
**Webhook:** `/webhook/reading`

**Input:**
```json
{
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "birthPlace": "Berlin",
  "readingType": "basic"
}
```

**Schritte:**
1. Webhook empfängt Daten
2. Chart-Berechnung (Human Design Library)
3. OpenAI API: Reading generieren
4. Datenbank: Reading speichern
5. Response zurückgeben

### Workflow 2: Partner Matching
**Webhook:** `/webhook/matching`

**Input:**
```json
{
  "user1Chart": { ... },
  "user2Chart": { ... },
  "matchingType": "compatibility"
}
```

**Schritte:**
1. Webhook empfängt Chart-Daten
2. Kompatibilitäts-Analyse
3. OpenAI API: Matching-Report generieren
4. Datenbank: Matching speichern
5. Response zurückgeben

## 🔧 Konfiguration

### MCP Server (`config.js`)
```javascript
export const config = {
  n8n: {
    baseUrl: process.env.N8N_BASE_URL || "http://localhost:5678",
    apiKey: process.env.N8N_API_KEY || "",
    webhooks: {
      reading: "/webhook/reading",
      matching: "/webhook/matching",
      chartAnalysis: "/webhook/chart-analysis",
      userData: "/webhook/user-data"
    }
  }
};
```

### Umgebungsvariablen
```bash
# n8n
N8N_BASE_URL=https://n8n.deinedomain.tld
N8N_API_KEY=your-api-key

# Connection-Key (optional)
CONNECTION_KEY_URL=http://localhost:3000
CONNECTION_KEY_API_KEY=your-key
```

## 🚀 Deployment auf Hetzner

### 1. Domain-Setup
```
api.deinedomain.tld    → Connection-Key Server (Port 3000)
agent.deinedomain.tld  → ChatGPT-Agent (Port 4000)
mcp.deinedomain.tld    → MCP Server (Port 7777)
n8n.deinedomain.tld    → n8n (Port 5678)
```

### 2. Docker-Compose (Empfohlen)
```bash
# Alle Services mit einem Befehl starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f

# Services stoppen
docker-compose down
```

Die vollständige `docker-compose.yml` ist im Hauptverzeichnis verfügbar.

### 3. PM2 Setup (Alternative)
```bash
# n8n
pm2 start n8n --name n8n

# MCP Server
pm2 start index.js --name mcp-server

# ChatGPT-Agent
pm2 start chatgpt-agent/server.js --name chatgpt-agent

# Connection-Key (wenn vorhanden)
pm2 start connection-key/server.js --name connection-key
```

### 4. Umgebungsvariablen
Erstellen Sie eine `.env` Datei:
```bash
OPENAI_API_KEY=your-openai-api-key
N8N_BASE_URL=http://n8n.deinedomain.tld
N8N_API_KEY=your-n8n-api-key
MCP_SERVER_URL=http://mcp.deinedomain.tld
```

## 💡 Verwendungsbeispiele

### Beispiel 1: Reading via Cursor Agent
```
User: "Erstelle mir ein Human Design Reading für einen User, 
       geboren am 1990-05-15 um 14:30 in Berlin"

Cursor Agent → MCP Tool: generateReading
MCP → n8n Webhook: /webhook/reading
n8n → Processing → Response
MCP → Cursor Agent → User
```

### Beispiel 2: Workflow erstellen
```
User: "Erstelle einen n8n Workflow für User-Login-Readings"

Cursor Agent → MCP Tool: createN8NWorkflow
MCP → n8n API: POST /api/v1/workflows
n8n → Workflow erstellt
MCP → Cursor Agent → User
```

### Beispiel 3: Partner-Matching
```
User: "Führe ein Matching zwischen User 123 und User 456 durch"

Cursor Agent → MCP Tool: matchPartner
MCP → n8n Webhook: /webhook/matching
n8n → Matching-Analyse → Response
MCP → Cursor Agent → User
```

## 🔐 Sicherheit

1. **API Keys**: Verwenden Sie Umgebungsvariablen für alle API-Keys
2. **HTTPS**: In Produktion immer HTTPS verwenden
3. **Authentication**: n8n Basic Auth oder API Keys aktivieren
4. **Rate Limiting**: Implementieren Sie Rate Limiting im Connection-Key Server
5. **Validation**: Validiere alle Eingaben mit Zod Schemas

## 📊 Monitoring

### Logs
- MCP Server: `console.error()` für wichtige Logs
- n8n: Native Logging-Funktionen
- Connection-Key: Strukturiertes Logging

### Health Checks
```javascript
// MCP Server Health Check
GET /health → { status: "ok", tools: 12 }

// n8n Health Check
GET /healthz → n8n Status

// Connection-Key Health Check
GET /api/health → { status: "ok", services: {...} }
```

## 🎯 Nächste Schritte

1. ✅ MCP Server mit n8n Tools erstellt
2. ⏭️ n8n Workflows erstellen (Reading, Matching, etc.)
3. ⏭️ Connection-Key Server implementieren
4. ⏭️ App-Integration
5. ⏭️ Deployment auf Hetzner
6. ⏭️ Monitoring & Logging einrichten

