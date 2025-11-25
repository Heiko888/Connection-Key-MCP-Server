# 🗺️ Roadmap: Nächste Schritte

Diese Roadmap zeigt Ihnen, wie Sie Schritt für Schritt vorgehen sollten.

## ✅ Was ist bereits fertig?

- [x] **MCP Server** - 12 Tools implementiert
- [x] **ChatGPT-Agent** - Vollständig mit Memory, Tools, API
- [x] **Docker-Compose** - Alle Services konfiguriert
- [x] **Dokumentation** - Vollständig dokumentiert

## 🎯 Phase 1: Lokales Testing (JETZT)

### Schritt 1.1: Services starten und testen

```bash
# 1. Dependencies installieren (falls noch nicht geschehen)
npm install

# 2. OpenAI API Key setzen
export OPENAI_API_KEY="your-key-here"

# 3. MCP Server starten (Terminal 1)
npm start

# 4. ChatGPT-Agent starten (Terminal 2)
npm run start:agent

# 5. Testen
curl http://localhost:4000/health
```

**Ziel:** Beide Services laufen lokal und kommunizieren.

### Schritt 1.2: Erste Chat-Tests

```bash
# Einfacher Chat
curl -X POST http://localhost:4000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "message": "Hallo, kannst du mir helfen?"
  }'

# Reading generieren (ohne n8n - wird Fehler geben, aber Agent funktioniert)
curl -X POST http://localhost:4000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "message": "Erstelle mir ein Human Design Reading für 1990-05-15, 14:30, Berlin"
  }'
```

**Ziel:** Agent antwortet, auch wenn n8n noch nicht läuft.

### Schritt 1.3: n8n lokal installieren und konfigurieren

```bash
# n8n installieren (global)
npm install -g n8n

# n8n starten
n8n start

# Oder mit Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

**Ziel:** n8n läuft auf http://localhost:5678

## 🎯 Phase 2: n8n Workflows erstellen

### Schritt 2.1: Reading-Workflow erstellen

1. **n8n öffnen:** http://localhost:5678
2. **Neuen Workflow erstellen**
3. **Webhook-Node hinzufügen:**
   - Method: POST
   - Path: `/webhook/reading`
   - Response: "Last Node"
4. **Code-Node hinzufügen:**
   ```javascript
   // Chart-Berechnung (vereinfacht)
   const birthDate = $input.item.json.birthDate;
   const birthTime = $input.item.json.birthTime;
   const birthPlace = $input.item.json.birthPlace;
   
   // Hier würde echte Human Design Berechnung stattfinden
   const chartData = {
     type: "Generator",
     centers: { /* ... */ },
     channels: { /* ... */ }
   };
   
   return {
     json: {
       readingId: `reading-${Date.now()}`,
       chartData,
       reading: `Human Design Reading für ${birthDate}...`,
       success: true
     }
   };
   ```
5. **Workflow aktivieren**

**Ziel:** `/webhook/reading` antwortet mit Reading-Daten

### Schritt 2.2: Matching-Workflow erstellen

Ähnlich wie Reading-Workflow, aber für Partner-Matching.

**Ziel:** `/webhook/matching` funktioniert

### Schritt 2.3: Workflows testen

```bash
# Reading-Webhook testen
curl -X POST http://localhost:5678/webhook/reading \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin"
  }'
```

**Ziel:** Workflows antworten korrekt

## 🎯 Phase 3: Integration testen

### Schritt 3.1: MCP → n8n Verbindung testen

```bash
# MCP Server sollte n8n erreichen können
# In config.js: N8N_BASE_URL auf http://localhost:5678 setzen
```

### Schritt 3.2: Agent → MCP → n8n Test

```bash
# Vollständiger Flow testen
curl -X POST http://localhost:4000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "message": "Erstelle mir ein Human Design Reading für 1990-05-15, 14:30, Berlin"
  }'
```

**Ziel:** Kompletter Flow funktioniert: Agent → MCP → n8n → Reading

### Schritt 3.3: Session-Management testen

```bash
# Mehrere Nachrichten in einer Session
curl -X POST http://localhost:4000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "message": "Hallo"
  }'

curl -X POST http://localhost:4000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "message": "Was war meine letzte Nachricht?"
  }'
```

**Ziel:** Agent erinnert sich an vorherige Nachrichten

## 🎯 Phase 4: Connection-Key Server (Optional, aber empfohlen)

### Schritt 4.1: Connection-Key Server erstellen

Der Connection-Key Server ist Ihre zentrale API für die App.

**Grundstruktur:**
```
connection-key/
├── server.js          # Express Server
├── routes/
│   ├── chat.js        # Chat-Endpoints
│   ├── reading.js     # Reading-Endpoints
│   └── matching.js    # Matching-Endpoints
├── middleware/
│   ├── auth.js        # Authentication
│   └── validation.js  # Input Validation
└── config.js          # Konfiguration
```

**Basis-Implementierung:**
```javascript
// connection-key/server.js
import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

const CHATGPT_AGENT_URL = process.env.CHATGPT_AGENT_URL || 'http://localhost:4000';

// Chat-Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    // An ChatGPT-Agent weiterleiten
    const response = await axios.post(`${CHATGPT_AGENT_URL}/chat`, {
      userId,
      message
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Connection-Key Server läuft auf Port 3000');
});
```

**Ziel:** Zentrale API für Ihre App

### Schritt 4.2: Authentication hinzufügen

- API Keys
- JWT Tokens
- OAuth (optional)

**Ziel:** Sichere API

## 🎯 Phase 5: App-Integration

### Schritt 5.1: Frontend erstellen

**Beispiel (React):**
```javascript
// App.js
const [messages, setMessages] = useState([]);
const [input, setInput] = useState('');

const sendMessage = async () => {
  const response = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'user123',
      message: input
    })
  });
  
  const data = await response.json();
  setMessages([...messages, { role: 'user', content: input }, { role: 'assistant', content: data.message }]);
  setInput('');
};
```

**Ziel:** App kommuniziert mit Connection-Key Server

## 🎯 Phase 6: Production Deployment

### Schritt 6.1: Hetzner Server vorbereiten

Siehe `DEPLOYMENT.md` für Details.

**Kurzfassung:**
1. Hetzner VPS erstellen
2. Docker installieren
3. Code deployen
4. Umgebungsvariablen setzen
5. Docker-Compose starten
6. Nginx konfigurieren
7. SSL-Zertifikate installieren

### Schritt 6.2: Monitoring einrichten

- PM2 Monitoring (wenn ohne Docker)
- Docker Logs
- Health Checks
- Error Tracking

**Ziel:** System läuft stabil in Produktion

## 📋 Prioritäten

### 🔥 HOCH (Jetzt)
1. ✅ Services lokal testen
2. ✅ n8n installieren und konfigurieren
3. ✅ Erste Workflows erstellen
4. ✅ Integration testen

### ⚡ MITTEL (Diese Woche)
5. Connection-Key Server implementieren
6. Authentication hinzufügen
7. App-Integration vorbereiten

### 📅 NIEDRIG (Später)
8. Production Deployment
9. Monitoring & Logging
10. Performance-Optimierung

## 🛠️ Nützliche Befehle

```bash
# Alle Services starten
npm run start:all

# Einzelne Services
npm start              # MCP Server
npm run start:agent    # ChatGPT-Agent

# Docker
docker-compose up -d
docker-compose logs -f

# Tests
curl http://localhost:4000/health
curl -X POST http://localhost:4000/chat -H "Content-Type: application/json" -d '{"userId":"test","message":"Hallo"}'
```

## ❓ Häufige Fragen

### "Wo fange ich an?"
→ **Phase 1, Schritt 1.1**: Services lokal starten und testen

### "n8n funktioniert nicht"
→ Prüfen Sie:
- Läuft n8n? `curl http://localhost:5678/healthz`
- Webhook-Pfad korrekt? `/webhook/reading`
- Workflow aktiviert?

### "Agent antwortet nicht"
→ Prüfen Sie:
- OpenAI API Key gesetzt?
- Agent läuft? `curl http://localhost:4000/health`
- Logs: `pm2 logs chatgpt-agent`

### "MCP Tools werden nicht aufgerufen"
→ Aktuell: MCP läuft über stdio für Cursor
→ Für HTTP-API: MCP Server muss HTTP-Server haben (noch nicht implementiert)

## 🎯 Nächster konkreter Schritt

**JETZT tun:**

1. **Terminal öffnen**
2. **Services starten:**
   ```bash
   # Terminal 1
   npm start
   
   # Terminal 2
   npm run start:agent
   ```

3. **Testen:**
   ```bash
   curl http://localhost:4000/health
   ```

4. **Erste Chat-Nachricht:**
   ```bash
   curl -X POST http://localhost:4000/chat \
     -H "Content-Type: application/json" \
     -d '{"userId":"test","message":"Hallo!"}'
   ```

**Wenn das funktioniert → Weiter zu Phase 2 (n8n Workflows)**

