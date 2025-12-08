# 📡 API-Routes für Agenten-Integration

## 📁 Dateien

Alle API-Routes befinden sich in `integration/api-routes/`:

1. **agents-marketing.ts** → `/api/agents/marketing`
2. **agents-automation.ts** → `/api/agents/automation`
3. **agents-sales.ts** → `/api/agents/sales`
4. **agents-social-youtube.ts** → `/api/agents/social-youtube`
5. **readings-generate.ts** → `/api/readings/generate`

## 🚀 Installation auf CK-App Server

### Schritt 1: Dateien kopieren

```bash
# Auf CK-App Server (167.235.224.149)
cd /path/to/your/nextjs-app

# Kopiere API-Routes
# Für Pages Router:
mkdir -p pages/api/agents
mkdir -p pages/api/readings
cp integration/api-routes/agents-*.ts pages/api/agents/
cp integration/api-routes/readings-generate.ts pages/api/readings/generate.ts

# Oder für App Router:
mkdir -p app/api/agents/[agentId]/route.ts
mkdir -p app/api/readings/generate/route.ts
# (Anpassung der Dateien nötig)
```

### Schritt 2: Environment Variables

Fügen Sie in `.env.local` hinzu:

```bash
# MCP Server URL (für Marketing, Automation, Sales, Social-YouTube)
MCP_SERVER_URL=http://138.199.237.34:7000

# Reading Agent URL
READING_AGENT_URL=http://138.199.237.34:4001
```

### Schritt 3: Testen

```bash
# Marketing Agent testen
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Gib mir 3 Hooks für ein Reel"}'

# Reading Agent testen
curl -X POST http://localhost:3000/api/readings/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "detailed"
  }'
```

## 📋 API-Endpunkte

### MCP Agenten (Port 7000)

| Endpoint | Agent | Beschreibung |
|----------|-------|--------------|
| `POST /api/agents/marketing` | Marketing | Marketingstrategien, Reels, Newsletter |
| `POST /api/agents/automation` | Automation | n8n, APIs, Webhooks |
| `POST /api/agents/sales` | Sales | Verkaufstexte, Funnels |
| `POST /api/agents/social-youtube` | Social-YouTube | Video-Skripte, Posts |

**Request:**
```json
{
  "message": "Ihre Anfrage",
  "userId": "optional-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "agent": "marketing",
  "message": "Ihre Anfrage",
  "response": "KI-generierte Antwort",
  "tokens": 1234,
  "model": "gpt-4",
  "timestamp": "2025-12-07T23:00:00.000Z"
}
```

### Reading Agent (Port 4001)

| Endpoint | Beschreibung |
|----------|--------------|
| `POST /api/readings/generate` | Human Design Reading generieren |

**Request:**
```json
{
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "birthPlace": "Berlin",
  "readingType": "detailed",
  "userId": "optional-user-id"
}
```

**Response:**
```json
{
  "success": true,
  "readingId": "reading-1234567890",
  "reading": "Vollständiges Reading...",
  "readingType": "detailed",
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "birthPlace": "Berlin",
  "tokens": 2345,
  "timestamp": "2025-12-07T23:00:00.000Z"
}
```

## 🔒 Sicherheit

**Empfohlen:**
- API-Key Authentifizierung hinzufügen
- Rate Limiting implementieren
- Input-Validierung erweitern
- Error-Logging

## ✅ Schritt 1 abgeschlossen!

Die API-Routes sind erstellt und bereit für die Installation auf dem CK-App Server.

