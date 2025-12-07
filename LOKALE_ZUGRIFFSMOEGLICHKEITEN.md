# 🌐 Lokale Zugriffsmöglichkeiten auf Hetzner Server

Welche Möglichkeiten haben Sie, um von Ihrem lokalen Rechner auf die Services auf dem Hetzner Server zuzugreifen?

## 🔗 Direkter HTTP-Zugriff

### 1. **Connection-Key API**
```bash
# Health Check
curl http://IHR-SERVER-IP:3000/health

# API-Endpoints
curl -X POST http://IHR-SERVER-IP:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: IHR-API-KEY" \
  -d '{"userId": "test", "message": "Hallo"}'
```

**Im Browser:**
- `http://IHR-SERVER-IP:3000/health`
- `http://IHR-SERVER-IP:3000` (API Info)

### 2. **ChatGPT-Agent**
```bash
# Health Check
curl http://IHR-SERVER-IP:4000/health

# Chat-Endpoint
curl -X POST http://IHR-SERVER-IP:4000/chat \
  -H "Content-Type: application/json" \
  -d '{"userId": "test", "message": "Hallo"}'
```

**Im Browser:**
- `http://IHR-SERVER-IP:4000/health`

### 3. **n8n Web Interface**
**Im Browser:**
- `http://IHR-SERVER-IP:5678`
- **Login:** `admin` / Passwort aus `.env` (N8N_PASSWORD)

**n8n Webhooks:**
```bash
# Webhook aufrufen
curl -X POST http://IHR-SERVER-IP:5678/webhook/reading \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin"}'
```

## 🖥️ SSH-Zugriff

### Server-Verwaltung
```bash
# SSH-Verbindung
ssh root@IHR-SERVER-IP

# Nach dem Login
cd /opt/mcp-connection-key

# Logs anzeigen
docker-compose logs -f

# Status prüfen
docker-compose ps

# Services neu starten
docker-compose restart
```

## 📡 API-Zugriff von lokaler App

### Beispiel: JavaScript/TypeScript
```javascript
// Connection-Key API
const response = await fetch('http://IHR-SERVER-IP:3000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'IHR-API-KEY'
  },
  body: JSON.stringify({
    userId: 'user123',
    message: 'Hallo!'
  })
});

const data = await response.json();
```

### Beispiel: Python
```python
import requests

# Connection-Key API
response = requests.post(
    'http://IHR-SERVER-IP:3000/api/chat',
    headers={
        'Content-Type': 'application/json',
        'X-API-Key': 'IHR-API-KEY'
    },
    json={
        'userId': 'user123',
        'message': 'Hallo!'
    }
)

print(response.json())
```

## 🔐 Authentifizierung

### API Key verwenden
```bash
# API Key aus .env holen (auf Server)
cd /opt/mcp-connection-key
grep API_KEY .env

# Dann in Requests verwenden
curl -H "X-API-Key: IHR-API-KEY" http://IHR-SERVER-IP:3000/api/chat
```

## 🌍 Domain-Setup (Optional)

Falls Sie eine Domain haben:

### DNS-Einträge
```
api.yourdomain.com     → IHR-SERVER-IP
agent.yourdomain.com   → IHR-SERVER-IP
n8n.yourdomain.com     → IHR-SERVER-IP
```

### Dann erreichbar über:
- `https://api.yourdomain.com`
- `https://agent.yourdomain.com`
- `https://n8n.yourdomain.com`

## 📋 Verfügbare Endpoints

### Connection-Key Server (Port 3000)
- `GET /health` - Health Check
- `GET /` - API Info
- `POST /api/chat` - Chat-Nachricht
- `POST /api/reading/generate` - Reading generieren
- `POST /api/matching` - Partner-Matching
- `GET /api/user/:userId` - User-Daten

### ChatGPT-Agent (Port 4000)
- `GET /health` - Health Check
- `POST /chat` - Chat-Verarbeitung
- `POST /reading/generate` - Reading direkt generieren
- `POST /matching` - Partner-Matching
- `GET /session/:userId` - Session-Info
- `DELETE /session/:userId` - Session löschen

### n8n (Port 5678)
- `GET /healthz` - Health Check
- `POST /webhook/reading` - Reading Webhook
- `POST /webhook/matching` - Matching Webhook
- `POST /webhook/chart-analysis` - Chart-Analyse Webhook
- `POST /webhook/user-data` - User-Daten Webhook
- Web Interface: `http://IHR-SERVER-IP:5678`

## 🧪 Test-Beispiele

### 1. Health Checks testen
```bash
# Alle Services prüfen
curl http://IHR-SERVER-IP:3000/health
curl http://IHR-SERVER-IP:4000/health
curl http://IHR-SERVER-IP:5678/healthz
```

### 2. Chat testen
```bash
# Über Connection-Key
curl -X POST http://IHR-SERVER-IP:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: IHR-API-KEY" \
  -d '{
    "userId": "test-user",
    "message": "Hallo, wie geht es dir?"
  }'

# Direkt über ChatGPT-Agent
curl -X POST http://IHR-SERVER-IP:4000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "message": "Hallo!"
  }'
```

### 3. Reading generieren
```bash
curl -X POST http://IHR-SERVER-IP:3000/api/reading/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: IHR-API-KEY" \
  -d '{
    "userId": "test-user",
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "detailed"
  }'
```

## 🔧 Entwicklung

### Lokale Entwicklung mit Server-Services
```javascript
// In Ihrer lokalen App
const API_BASE_URL = 'http://IHR-SERVER-IP:3000';
const API_KEY = 'IHR-API-KEY';

// API-Calls
async function sendMessage(userId, message) {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY
    },
    body: JSON.stringify({ userId, message })
  });
  return response.json();
}
```

## 🛠️ Tools für lokalen Zugriff

### 1. **Postman / Insomnia**
- API-Endpoints testen
- Requests sammeln
- Environment-Variablen setzen

### 2. **curl / httpie**
```bash
# curl
curl -X POST http://IHR-SERVER-IP:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: IHR-API-KEY" \
  -d '{"userId": "test", "message": "Hallo"}'

# httpie (falls installiert)
http POST http://IHR-SERVER-IP:3000/api/chat \
  X-API-Key:IHR-API-KEY \
  userId=test message=Hallo
```

### 3. **Browser**
- n8n Interface: `http://IHR-SERVER-IP:5678`
- Health Checks: Direkt im Browser öffnen

## 🔒 Sicherheit

### Firewall
- Stellen Sie sicher, dass die Ports erreichbar sind
- Oder verwenden Sie Nginx Reverse Proxy mit SSL

### API Key
- API Key sicher aufbewahren
- Nicht in Code committen
- Environment-Variablen verwenden

## 📊 Monitoring

### Logs von lokal aus prüfen
```bash
# SSH und Logs anzeigen
ssh root@IHR-SERVER-IP "cd /opt/mcp-connection-key && docker-compose logs --tail=50"
```

### Health Checks automatisieren
```bash
# Script für regelmäßige Checks
#!/bin/bash
SERVER_IP="IHR-SERVER-IP"

curl -f http://$SERVER_IP:3000/health && echo "✅ Connection-Key OK" || echo "❌ Connection-Key FEHLER"
curl -f http://$SERVER_IP:4000/health && echo "✅ ChatGPT-Agent OK" || echo "❌ ChatGPT-Agent FEHLER"
curl -f http://$SERVER_IP:5678/healthz && echo "✅ n8n OK" || echo "❌ n8n FEHLER"
```

## ✅ Zusammenfassung

**Verfügbare Zugriffsmöglichkeiten:**

1. ✅ **HTTP/HTTPS** - Direkter API-Zugriff
2. ✅ **SSH** - Server-Verwaltung
3. ✅ **n8n Web Interface** - Workflow-Management
4. ✅ **Webhooks** - n8n Webhooks aufrufen
5. ✅ **REST API** - Alle Endpoints über HTTP

**Von lokal aus können Sie:**
- ✅ Alle APIs aufrufen
- ✅ n8n Workflows verwalten
- ✅ Server über SSH verwalten
- ✅ Logs prüfen
- ✅ Services neu starten

