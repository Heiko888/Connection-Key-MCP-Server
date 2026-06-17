# 📝 .env Konfigurations-Guide

Diese Anleitung erklärt, welche Variablen in die `.env` Datei gehören und wie Sie sie konfigurieren.

## 🚀 Schnellstart

```bash
# 1. Beispiel-Datei kopieren
cp .env.example .env

# 2. Datei bearbeiten
nano .env

# 3. Wichtige Werte anpassen (siehe unten)
```

## ✅ ERFORDERLICHE Variablen

Diese Variablen **MÜSSEN** gesetzt werden:

### 1. OPENAI_API_KEY (ERFORDERLICH)
```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```
- **Was:** Ihr OpenAI API Key
- **Woher:** [OpenAI Platform](https://platform.openai.com/api-keys)
- **Warum:** ChatGPT-Agent benötigt diesen Key

### 2. API_KEY (ERFORDERLICH wenn AUTH_ENABLED=true)
```bash
API_KEY=your-secure-api-key-change-me
```
- **Was:** API Key für Connection-Key Server
- **Generieren:** Zufälliger String (z.B. `openssl rand -hex 32`)
- **Warum:** Authentifizierung für API-Zugriff

### 3. N8N_PASSWORD (ERFORDERLICH für n8n)
```bash
N8N_PASSWORD=secure-password-change-me
```
- **Was:** Passwort für n8n Web-Interface
- **Generieren:** Starkes Passwort
- **Warum:** n8n Basic Auth

## 🔧 WICHTIGE Optionale Variablen

### URLs (für Produktion)

```bash
# Lokal (Development)
N8N_BASE_URL=http://localhost:5678
MCP_SERVER_URL=http://localhost:7777
CHATGPT_AGENT_URL=http://localhost:4000
CONNECTION_KEY_URL=http://localhost:3000

# Produktion (Hetzner mit Domain)
N8N_BASE_URL=https://n8n.yourdomain.com
MCP_SERVER_URL=https://mcp.yourdomain.com
CHATGPT_AGENT_URL=https://agent.yourdomain.com
CONNECTION_KEY_URL=https://api.yourdomain.com
```

### CORS (für Frontend)

```bash
# Lokal
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080

# Produktion
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

## 📋 Vollständige Variablen-Liste

### OpenAI
- `OPENAI_API_KEY` - **ERFORDERLICH** - OpenAI API Key
- `OPENAI_MODEL` - Optional - Model (Standard: gpt-4o)
- `OPENAI_TEMPERATURE` - Optional - 0.0-2.0 (Standard: 0.7)
- `OPENAI_MAX_TOKENS` - Optional - Max Tokens (Standard: 2000)

### n8n
- `N8N_BASE_URL` - n8n Base URL
- `N8N_API_KEY` - Optional - n8n API Key
- `N8N_PASSWORD` - **ERFORDERLICH** - n8n Basic Auth Passwort
- `N8N_HOST` - Optional - n8n Host

### MCP Server
- `MCP_SERVER_URL` - MCP Server URL
- `MCP_SERVER_TIMEOUT` - Optional - Timeout in ms (Standard: 30000)

### ChatGPT-Agent
- `CHATGPT_AGENT_URL` - ChatGPT-Agent URL
- `CHATGPT_AGENT_PORT` - Optional - Port (Standard: 4000)
- `CHATGPT_AGENT_TIMEOUT` - Optional - Timeout in ms (Standard: 30000)

### Connection-Key Server
- `PORT` - Optional - Port (Standard: 3000)
- `CONNECTION_KEY_URL` - Connection-Key Server URL

### Authentication
- `AUTH_ENABLED` - Optional - Auth aktivieren (Standard: true)
- `API_KEY` - **ERFORDERLICH wenn AUTH_ENABLED=true** - API Key
- `CONNECTION_KEY_API_KEY` - Alternative zu API_KEY
- `JWT_SECRET` - Optional - JWT Secret
- `JWT_EXPIRES_IN` - Optional - JWT Expires (Standard: 24h)

### CORS
- `CORS_ORIGINS` - Erlaubte Origins (komma-separiert)

### Rate Limiting
- `RATE_LIMIT_ENABLED` - Optional - Rate Limiting (Standard: true)
- `RATE_LIMIT_WINDOW_MS` - Optional - Window in ms (Standard: 60000)
- `RATE_LIMIT_MAX` - Optional - Max Requests (Standard: 100)

### Logging
- `LOG_LEVEL` - Optional - Log Level (Standard: info)
- `LOG_FORMAT` - Optional - Log Format (Standard: json)

### Docker
- `NODE_ENV` - Optional - Environment (development/production)

## 🎯 Beispiel-Konfigurationen

### Lokal (Development)

```bash
OPENAI_API_KEY=sk-your-key
N8N_BASE_URL=http://localhost:5678
MCP_SERVER_URL=http://localhost:7777
CHATGPT_AGENT_URL=http://localhost:4000
PORT=3000
AUTH_ENABLED=false
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
NODE_ENV=development
```

### Produktion (Hetzner)

```bash
OPENAI_API_KEY=sk-your-production-key
N8N_BASE_URL=https://n8n.yourdomain.com
MCP_SERVER_URL=https://mcp.yourdomain.com
CHATGPT_AGENT_URL=https://agent.yourdomain.com
CONNECTION_KEY_URL=https://api.yourdomain.com
PORT=3000
AUTH_ENABLED=true
API_KEY=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)
N8N_PASSWORD=$(openssl rand -hex 16)
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
NODE_ENV=production
LOG_LEVEL=info
```

## 🔐 Sichere Passwörter generieren

```bash
# API Key generieren (32 Zeichen)
openssl rand -hex 32

# JWT Secret generieren (32 Zeichen)
openssl rand -hex 32

# n8n Passwort generieren (16 Zeichen)
openssl rand -hex 16
```

## ✅ Checkliste

Vor dem Deployment:

- [ ] `OPENAI_API_KEY` gesetzt
- [ ] `API_KEY` generiert und gesetzt
- [ ] `N8N_PASSWORD` generiert und gesetzt
- [ ] URLs für Produktion angepasst
- [ ] `CORS_ORIGINS` für Ihre Domains gesetzt
- [ ] `JWT_SECRET` generiert (falls JWT verwendet)
- [ ] `NODE_ENV=production` gesetzt
- [ ] `.env` Datei ist NICHT in Git (prüfen Sie .gitignore)

## ⚠️ Sicherheitshinweise

1. **NIEMALS** `.env` Datei committen
2. **NIEMALS** `.env` Datei öffentlich teilen
3. **IMMER** starke, zufällige Passwörter verwenden
4. **IMMER** unterschiedliche Keys für Development und Produktion
5. **IMMER** Backups der `.env` Datei erstellen (verschlüsselt)

## 📝 Beispiel: .env für Hetzner Deployment

```bash
# Minimal-Konfiguration für Hetzner
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx
N8N_PASSWORD=secure-password-here
API_KEY=your-api-key-here
JWT_SECRET=your-jwt-secret-here
NODE_ENV=production
AUTH_ENABLED=true
```

## 🆘 Hilfe

Bei Problemen:
1. Prüfen Sie, ob alle erforderlichen Variablen gesetzt sind
2. Prüfen Sie die Logs: `docker-compose logs`
3. Prüfen Sie die Syntax: Keine Leerzeichen um `=`
4. Prüfen Sie Anführungszeichen: Nur bei Leerzeichen nötig

