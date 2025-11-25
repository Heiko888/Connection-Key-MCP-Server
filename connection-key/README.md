# Connection-Key Server

Der Connection-Key Server ist die zentrale API für Ihre App. Er kommuniziert mit dem ChatGPT-Agent, verwaltet Authentication und stellt alle benötigten Endpoints bereit.

## 🚀 Features

- ✅ **REST API** - Vollständige REST-API für Ihre App
- ✅ **ChatGPT-Agent Integration** - Kommuniziert mit dem Agent
- ✅ **Authentication** - API Key und JWT Support
- ✅ **Input Validation** - Validiert alle Eingaben
- ✅ **Error Handling** - Vollständige Fehlerbehandlung
- ✅ **Request Logging** - Loggt alle Requests
- ✅ **CORS Support** - Konfigurierbare CORS-Einstellungen
- ✅ **Production-Ready** - Bereit für Deployment

## 📁 Struktur

```
connection-key/
├── server.js              # Hauptserver
├── config.js             # Konfiguration
├── routes/               # API Routes
│   ├── chat.js           # Chat-Endpoints
│   ├── reading.js        # Reading-Endpoints
│   ├── matching.js       # Matching-Endpoints
│   └── user.js           # User-Endpoints
├── middleware/           # Middleware
│   ├── auth.js           # Authentication
│   ├── validation.js     # Input Validation
│   ├── error-handler.js   # Error Handling
│   └── logger.js         # Request Logging
└── README.md
```

## 🛠️ Installation

```bash
# Dependencies sind bereits installiert
npm install
```

## 🚀 Starten

```bash
# Connection-Key Server starten
npm run start:connection-key

# Oder direkt
node connection-key/server.js
```

Der Server läuft dann auf `http://localhost:3000`

## 📡 API-Endpoints

### Health Check
```
GET /health
```

### Chat
```
POST /api/chat
GET /api/chat/session/:userId
DELETE /api/chat/session/:userId
```

### Reading
```
POST /api/reading/generate
GET /api/reading/:readingId
```

### Matching
```
POST /api/matching
GET /api/matching/:matchId
```

### User
```
GET /api/user/:userId
PUT /api/user/:userId
```

## 🔧 Konfiguration

Umgebungsvariablen:

```bash
PORT=3000                                    # Server Port
CHATGPT_AGENT_URL=http://localhost:4000     # ChatGPT-Agent URL
AUTH_ENABLED=true                            # Authentication aktivieren
API_KEY=your-api-key                         # API Key für Auth
CORS_ORIGINS=http://localhost:5173          # CORS Origins (komma-separiert)
```

## 🔐 Authentication

### API Key Authentication

**Request:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "userId": "user123",
    "message": "Hallo!"
  }'
```

**Oder als Query-Parameter:**
```bash
curl -X POST "http://localhost:3000/api/chat?apiKey=your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user123","message":"Hallo!"}'
```

### Authentication deaktivieren

```bash
AUTH_ENABLED=false npm run start:connection-key
```

## 💡 Verwendungsbeispiele

### Chat-Nachricht senden

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "message": "Erstelle mir ein Human Design Reading für 1990-05-15, 14:30, Berlin"
  }'
```

### Reading generieren

```bash
curl -X POST http://localhost:3000/api/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "detailed"
  }'
```

### Partner-Matching

```bash
curl -X POST http://localhost:3000/api/matching \
  -H "Content-Type: application/json" \
  -d '{
    "userId1": "user123",
    "userId2": "user456",
    "user1Chart": {...},
    "user2Chart": {...}
  }'
```

## 🔄 Datenfluss

```
App → Connection-Key Server → ChatGPT-Agent → MCP Server → n8n
```

1. **App** sendet Request an Connection-Key Server
2. **Connection-Key Server** validiert Input und authentifiziert
3. **ChatGPT-Agent** verarbeitet die Anfrage
4. **MCP Server** ruft Tools auf
5. **n8n** führt Workflows aus
6. Antwort geht zurück durch die Kette

## 🐳 Docker

Siehe `docker-compose.yml` im Hauptverzeichnis.

## 📊 Monitoring

- **Health Check:** `GET /health`
- **Logs:** Alle Requests werden geloggt
- **Error Tracking:** Vollständige Fehlerbehandlung

## 🔐 Sicherheit

- API Key Authentication
- Input Validation
- CORS Konfiguration
- Error Handling ohne Stack Traces in Production

## 🚀 Deployment

Siehe `DEPLOYMENT.md` im Hauptverzeichnis.

## 📚 Weitere Dokumentation

- **ROADMAP.md** - Nächste Schritte
- **ARCHITECTURE.md** - System-Architektur
- **QUICKSTART.md** - Schnellstart

