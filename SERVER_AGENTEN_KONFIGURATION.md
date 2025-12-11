# 🖥️ Vollständige Server- und Agenten-Konfiguration

## 📍 Server-Übersicht

### Hetzner Server: 138.199.237.34

| Service | Port | Status | Verzeichnis | Management |
|---------|------|--------|-------------|------------|
| **n8n** | 5678 | ✅ Docker | `/opt/mcp-connection-key` | `docker-compose` |
| **chatgpt-agent** | 4000 | ✅ Docker | `/opt/mcp-connection-key` | `docker-compose` |
| **connection-key** | 3000 | ✅ Docker | `/opt/mcp-connection-key` | `docker-compose` |
| **MCP Server** | 7000 | ✅ Systemd | `/opt/mcp` | `systemctl` |
| **Reading Agent** | 4001 | ✅ PM2 | `/opt/mcp-connection-key/production` | `pm2` |

---

## 1. 🐳 Docker Compose Konfiguration

**Datei:** `docker-compose.yml`

### Services:

#### n8n (Workflow Engine)
```yaml
n8n:
  image: n8nio/n8n:latest
  ports:
    - "5678:5678"
  environment:
    - N8N_BASIC_AUTH_ACTIVE=true
    - N8N_BASIC_AUTH_USER=admin
    - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
    - N8N_HOST=${N8N_HOST}
    - N8N_PORT=5678
    - N8N_PROTOCOL=http
    - WEBHOOK_URL=http://localhost:5678/
  volumes:
    - n8n_data:/home/node/.n8n
```

#### chatgpt-agent (KI-Gehirn)
```yaml
chatgpt-agent:
  build:
    context: .
    dockerfile: Dockerfile.agent
  ports:
    - "4000:4000"
  environment:
    - NODE_ENV=production
    - OPENAI_API_KEY=${OPENAI_API_KEY}
    - N8N_BASE_URL=http://n8n:5678
    - PORT=4000
  depends_on:
    - n8n
```

#### connection-key (Zentrale API)
```yaml
connection-key:
  build:
    context: .
    dockerfile: Dockerfile.connection-key
  ports:
    - "3000:3000"
  environment:
    - NODE_ENV=production
    - PORT=3000
    - CHATGPT_AGENT_URL=http://chatgpt-agent:4000
    - N8N_BASE_URL=http://n8n:5678
    - AUTH_ENABLED=${AUTH_ENABLED:-true}
    - API_KEY=${API_KEY:-}
    - CORS_ORIGINS=${CORS_ORIGINS:-*}
  depends_on:
    - chatgpt-agent
    - n8n
```

**Verzeichnis:** `/opt/mcp-connection-key`

---

## 2. 🔄 MCP Server Konfiguration

**Verzeichnis:** `/opt/mcp`  
**Port:** 7000  
**Management:** Systemd (`systemctl`)

### Server-Datei: `/opt/mcp/server.js`

```javascript
const express = require('express');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
require('dotenv').config({ path: '/opt/mcp-connection-key/.env' });

const app = express();
const PORT = 7000;
const AGENT_DIR = '/opt/ck-agent';

app.use(express.json());
app.use(cors()); // CORS aktiviert

// Endpoints:
// - GET /health
// - GET /agents
// - POST /agent/:agentId
```

### Systemd Service: `/etc/systemd/system/mcp.service`

```ini
[Unit]
Description=MCP Multi-Agent Server
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/node /opt/mcp/server.js
Restart=always
RestartSec=10
User=root
Environment=NODE_ENV=production
WorkingDirectory=/opt/mcp

[Install]
WantedBy=multi-user.target
```

**Befehle:**
```bash
systemctl status mcp
systemctl restart mcp
systemctl stop mcp
systemctl start mcp
```

---

## 3. 🤖 Agent-Konfigurationen

**Verzeichnis:** `/opt/ck-agent`

### Struktur:
```
/opt/ck-agent/
├── agents/          # Agent JSON-Konfigurationen
│   ├── marketing.json
│   ├── automation.json
│   ├── sales.json
│   ├── social-youtube.json
│   └── chart-development.json
└── prompts/         # Agent Prompts
    ├── marketing.txt
    ├── automation.txt
    ├── sales.txt
    ├── social-youtube.txt
    └── chart-development.txt
```

### Agent 1: Marketing Agent

**Config:** `/opt/ck-agent/agents/marketing.json`
```json
{
  "id": "marketing",
  "name": "Marketing & Growth Agent",
  "description": "Erstellt Marketingstrategien, Reels, Newsletter, Funnels und Salescopy.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/marketing.txt",
  "model": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 5000
}
```

**Prompt:** `/opt/ck-agent/prompts/marketing.txt`
- Spezialgebiete: Marketingstrategien, Reels, Newsletter, Funnels, Salescopy
- Arbeitsweise: ANALYSE → STRATEGIE → KREATION → OPTIMIERUNG
- Sprache: Deutsch

### Agent 2: Automation Agent

**Config:** `/opt/ck-agent/agents/automation.json`
```json
{
  "id": "automation",
  "name": "Automation Agent",
  "description": "Erstellt n8n-Flows, API-Strukturen, Webhooks, Integrationen und technische Prozesse.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/automation.txt",
  "model": "gpt-4",
  "temperature": 0.2,
  "maxTokens": 6000
}
```

**Prompt:** `/opt/ck-agent/prompts/automation.txt`
- Spezialgebiete: n8n Workflows, APIs, Webhooks, Serverkonfiguration
- Arbeitsweise: ANALYSE → PLANUNG → IMPLEMENTIERUNG → TEST
- Sprache: Deutsch

### Agent 3: Sales Agent

**Config:** `/opt/ck-agent/agents/sales.json`
```json
{
  "id": "sales",
  "name": "Sales Agent",
  "description": "Experte für Verkaufstexte, Funnels, Buyer Journey, Closing und Verkaufspsychologie.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/sales.txt",
  "model": "gpt-4",
  "temperature": 0.6,
  "maxTokens": 6000
}
```

**Prompt:** `/opt/ck-agent/prompts/sales.txt`
- Spezialgebiete: Verkaufstexte, Funnels, Closing-Techniken
- Arbeitsweise: ANALYSE → STRATEGIE → KREATION → OPTIMIERUNG
- Sprache: Deutsch

### Agent 4: Social-YouTube Agent

**Config:** `/opt/ck-agent/agents/social-youtube.json`
```json
{
  "id": "social-youtube",
  "name": "Social Media & YouTube Agent",
  "description": "Erstellt YouTube-Video-Skripte, Reels, Posts, Captions, Thumbnail-Ideen und Social-Media-Content.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/social-youtube.txt",
  "model": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 6000
}
```

**Prompt:** `/opt/ck-agent/prompts/social-youtube.txt`
- Spezialgebiete: Video-Skripte, Reels, Posts, Thumbnails, SEO
- Arbeitsweise: ANALYSE → STRUKTUR → KREATION → OPTIMIERUNG → FORMAT
- Sprache: Deutsch

### Agent 5: Chart Development Agent

**Config:** `/opt/ck-agent/agents/chart-development.json`
```json
{
  "id": "chart-development",
  "name": "Chart Development Agent",
  "description": "Entwickelt Human Design Charts, Penta-Analyse Charts und Connection Key Charts.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/chart-development.txt",
  "model": "gpt-4",
  "temperature": 0.3,
  "maxTokens": 6000
}
```

**Prompt:** `/opt/ck-agent/prompts/chart-development.txt`
- Spezialgebiete: Bodygraph, Penta-Analyse, Connection Key Charts
- Arbeitsweise: BERECHNUNG → ANALYSE → ENTWICKLUNG → CODE
- Sprache: Deutsch

---

## 4. 📚 Reading Agent Konfiguration

**Verzeichnis:** `/opt/mcp-connection-key/production`  
**Port:** 4001  
**Management:** PM2

### Environment: `production/.env`

```bash
OPENAI_API_KEY=sk-...
AGENT_SECRET=...
MCP_PORT=4001
KNOWLEDGE_PATH=/opt/mcp-connection-key/production/knowledge
TEMPLATE_PATH=/opt/mcp-connection-key/production/templates
LOGS_PATH=/opt/mcp-connection-key/production/logs
LOG_LEVEL=info
NODE_ENV=production
```

### Server: `production/server.js`

- **Endpoints:**
  - `GET /health` - Health Check
  - `POST /reading/generate` - Reading generieren
  - `POST /admin/reload-knowledge` - Knowledge neu laden
  - `POST /admin/reload-templates` - Templates neu laden

- **Konfiguration:**
  - Model: `gpt-4`
  - Temperature: `0.7`
  - Max Tokens: `4000`
  - Sprache: Deutsch

### Knowledge-Dateien: `production/knowledge/`

```
knowledge/
├── human-design-basics.txt      # Grundlagen
├── reading-types.txt            # Reading-Typen
├── channels-gates.txt           # Channels & Gates
├── strategy-authority.txt       # Strategie & Autorität
└── incarnation-cross.txt        # Inkarnationskreuz
```

### Templates: `production/templates/`

```
templates/
├── default.txt          # Fallback
├── basic.txt           # Basic Reading
├── detailed.txt         # Detailed Reading
├── business.txt        # Business Reading
├── relationship.txt    # Relationship Reading
├── career.txt          # Career Reading
├── health.txt          # Health Reading
├── parenting.txt       # Parenting Reading
├── spiritual.txt      # Spiritual Reading
├── compatibility.txt  # Compatibility Reading
└── life-purpose.txt   # Life Purpose Reading
```

### PM2 Konfiguration

**Start-Script:** `production/start.sh`

```bash
pm2 start server.js \
  --name reading-agent \
  -o logs/reading-agent-out.log \
  -e logs/reading-agent-error.log \
  --merge-logs \
  --time \
  --update-env
```

**Befehle:**
```bash
pm2 status reading-agent
pm2 logs reading-agent
pm2 restart reading-agent
pm2 stop reading-agent
pm2 delete reading-agent
```

---

## 5. 🌐 Nginx Konfiguration

### Reading Agent: `deployment/nginx-reading-agent.conf`

**Domain:** `agent.the-connection-key.de`  
**Port:** 4001

```nginx
server {
    listen 80;
    server_name agent.the-connection-key.de;

    location / {
        proxy_pass http://127.0.0.1:4001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**HTTPS:** Wird von Certbot automatisch hinzugefügt

---

## 6. 🔐 Environment Variables

### Hauptverzeichnis: `/opt/mcp-connection-key/.env`

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# n8n
N8N_PASSWORD=...
N8N_HOST=n8n.werdemeisterdeinergedankenagent.de
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.werdemeisterdeinergedankenagent.de/
N8N_SECURE_COOKIE=true
N8N_API_KEY=...

# Connection-Key Server
CORS_ORIGINS=https://www.the-connection-key.de,https://the-connection-key.de,http://localhost:3000
AUTH_ENABLED=true
API_KEY=...

# n8n Enterprise (deaktiviert)
N8N_DISABLE_UI_FEATURES=enterprise
N8N_ENFORCE_SETTINGS_FILE=false
N8N_LICENSE_AUTO_ACCEPT=false
```

### Reading Agent: `/opt/mcp-connection-key/production/.env`

```bash
OPENAI_API_KEY=sk-...
AGENT_SECRET=...
MCP_PORT=4001
KNOWLEDGE_PATH=/opt/mcp-connection-key/production/knowledge
TEMPLATE_PATH=/opt/mcp-connection-key/production/templates
LOGS_PATH=/opt/mcp-connection-key/production/logs
LOG_LEVEL=info
NODE_ENV=production
```

---

## 7. 📡 API-Endpoints Übersicht

### MCP Server (Port 7000)

```
GET  /health                    # Health Check
GET  /agents                    # Liste aller Agenten
POST /agent/:agentId            # Agent ansprechen
```

**Beispiel:**
```bash
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Gib mir 3 Hooks für ein Reel"}'
```

### Reading Agent (Port 4001)

```
GET  /health                    # Health Check
POST /reading/generate          # Reading generieren
POST /admin/reload-knowledge    # Knowledge neu laden
POST /admin/reload-templates    # Templates neu laden
```

**Beispiel:**
```bash
curl -X POST http://138.199.237.34:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "detailed"
  }'
```

### Connection-Key Server (Port 3000)

```
GET  /health                    # Health Check
POST /api/chat                  # Chat
POST /api/reading/generate      # Reading
POST /api/matching              # Partner-Matching
GET  /api/user/:userId          # User-Info
```

### ChatGPT-Agent (Port 4000)

```
GET  /health                    # Health Check
POST /chat                      # Chat
GET  /session/:userId           # Session-Info
DELETE /session/:userId         # Session löschen
POST /reading/generate          # Reading direkt
POST /matching                  # Partner-Matching
```

### n8n (Port 5678)

```
https://n8n.werdemeisterdeinergedankenagent.de
```

---

## 8. 🔍 Status-Checks

### Alle Services prüfen:

```bash
# Docker Services
docker ps

# MCP Server
systemctl status mcp
curl http://localhost:7000/health

# Reading Agent
pm2 status reading-agent
curl http://localhost:4001/health

# Connection-Key Server
curl http://localhost:3000/health

# ChatGPT-Agent
curl http://localhost:4000/health
```

### Agent-Status:

```bash
# MCP Agenten auflisten
curl http://138.199.237.34:7000/agents

# Reading Agent Health
curl http://138.199.237.34:4001/health
```

---

## 9. 📊 Zusammenfassung

### Server-Struktur:

```
Hetzner Server (138.199.237.34)
├── /opt/mcp-connection-key/          # Docker Services
│   ├── docker-compose.yml
│   ├── .env
│   ├── n8n/                          # Port 5678
│   ├── chatgpt-agent/                # Port 4000
│   ├── connection-key/               # Port 3000
│   └── production/                   # Reading Agent
│       ├── server.js
│       ├── .env
│       ├── knowledge/
│       ├── templates/
│       └── logs/
├── /opt/mcp/                         # MCP Server
│   ├── server.js                     # Port 7000
│   └── package.json
└── /opt/ck-agent/                   # Agent-Konfigurationen
    ├── agents/
    │   ├── marketing.json
    │   ├── automation.json
    │   ├── sales.json
    │   ├── social-youtube.json
    │   └── chart-development.json
    └── prompts/
        ├── marketing.txt
        ├── automation.txt
        ├── sales.txt
        ├── social-youtube.txt
        └── chart-development.txt
```

### Agenten-Übersicht:

| # | Agent | Port | Server | Status |
|---|-------|------|--------|--------|
| 1 | Marketing | 7000 | MCP | ✅ |
| 2 | Automation | 7000 | MCP | ✅ |
| 3 | Sales | 7000 | MCP | ✅ |
| 4 | Social-YouTube | 7000 | MCP | ✅ |
| 5 | Reading | 4001 | PM2 | ✅ |
| 6 | Chart Development | 7000 | MCP | ✅ |

---

## ✅ Vollständige Konfiguration dokumentiert!

Alle Server- und Agent-Konfigurationen sind hier erfasst.

