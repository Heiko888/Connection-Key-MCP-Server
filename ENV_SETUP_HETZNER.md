# 📝 .env Datei auf Hetzner Server anlegen

Diese Anleitung zeigt Ihnen genau, wo und wie Sie die `.env` Datei auf dem Hetzner Server erstellen.

## 📍 Wo die .env Datei hin gehört

Die `.env` Datei muss im **Hauptverzeichnis des Projekts** liegen:

```
/opt/mcp-connection-key/.env
```

## 🚀 Schritt-für-Schritt Anleitung

### Schritt 1: Auf Hetzner Server verbinden

```bash
ssh root@your-server-ip
```

### Schritt 2: Projekt-Verzeichnis erstellen (falls noch nicht vorhanden)

```bash
mkdir -p /opt/mcp-connection-key
cd /opt/mcp-connection-key
```

### Schritt 3: Code klonen (falls noch nicht geschehen)

```bash
git clone https://github.com/Heiko888/Connection-Key-MCP-Server.git /opt/mcp-connection-key
cd /opt/mcp-connection-key
```

### Schritt 4: .env Datei erstellen

**Option A: Von .env.example kopieren (Empfohlen)**

```bash
# Beispiel-Datei kopieren
cp .env.example .env

# Datei bearbeiten
nano .env
```

**Option B: Direkt erstellen**

```bash
# Neue .env Datei erstellen
nano .env
```

### Schritt 5: Inhalt einfügen

Fügen Sie folgende Minimal-Konfiguration ein:

```bash
# ERFORDERLICH
OPENAI_API_KEY=sk-your-openai-api-key-here
N8N_PASSWORD=secure-password-change-me
API_KEY=your-secure-api-key-change-me

# Optional (Standard-Werte funktionieren)
N8N_BASE_URL=http://n8n:5678
MCP_SERVER_URL=http://mcp-server:7777
CHATGPT_AGENT_URL=http://chatgpt-agent:4000
PORT=3000
AUTH_ENABLED=true
NODE_ENV=production
```

### Schritt 6: Speichern und schließen

In `nano`:
- `Ctrl + O` - Speichern
- `Enter` - Bestätigen
- `Ctrl + X` - Schließen

### Schritt 7: Berechtigungen setzen

```bash
# Nur root darf die Datei lesen/schreiben
chmod 600 .env

# Prüfen
ls -la .env
```

Sollte zeigen: `-rw-------` (nur root hat Zugriff)

## ✅ Verifikation

```bash
# Prüfen ob Datei existiert
ls -la /opt/mcp-connection-key/.env

# Inhalt anzeigen (ohne Passwörter zu zeigen)
grep -v "KEY\|PASSWORD\|SECRET" .env
```

## 🔐 Sichere Passwörter generieren

Auf dem Server:

```bash
# API Key generieren
openssl rand -hex 32

# JWT Secret generieren
openssl rand -hex 32

# n8n Passwort generieren
openssl rand -hex 16
```

## 📋 Vollständige .env für Hetzner

```bash
# ============================================
# ERFORDERLICH
# ============================================
OPENAI_API_KEY=sk-your-openai-api-key-here
N8N_PASSWORD=$(openssl rand -hex 16)
API_KEY=$(openssl rand -hex 32)

# ============================================
# URLs (Docker interne Namen)
# ============================================
N8N_BASE_URL=http://n8n:5678
MCP_SERVER_URL=http://mcp-server:7777
CHATGPT_AGENT_URL=http://chatgpt-agent:4000
CONNECTION_KEY_URL=http://connection-key:3000

# ============================================
# Server Ports
# ============================================
PORT=3000

# ============================================
# Authentication
# ============================================
AUTH_ENABLED=true
JWT_SECRET=$(openssl rand -hex 32)
JWT_EXPIRES_IN=24h

# ============================================
# CORS (Ihre Domains)
# ============================================
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# ============================================
# Environment
# ============================================
NODE_ENV=production
LOG_LEVEL=info
LOG_FORMAT=json

# ============================================
# Rate Limiting
# ============================================
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

## 🎯 Schnell-Setup (Ein Befehl)

```bash
cd /opt/mcp-connection-key

# .env erstellen mit Minimal-Konfiguration
cat > .env << EOF
OPENAI_API_KEY=sk-your-openai-api-key-here
N8N_PASSWORD=$(openssl rand -hex 16)
API_KEY=$(openssl rand -hex 32)
N8N_BASE_URL=http://n8n:5678
MCP_SERVER_URL=http://mcp-server:7777
CHATGPT_AGENT_URL=http://chatgpt-agent:4000
PORT=3000
AUTH_ENABLED=true
NODE_ENV=production
EOF

# Berechtigungen setzen
chmod 600 .env
```

**Wichtig:** Passen Sie `OPENAI_API_KEY` an!

## 🔄 Nach dem Erstellen

```bash
# Prüfen
cat .env

# Deploy starten
./deploy.sh
```

## ⚠️ Wichtige Hinweise

1. **Pfad:** Die `.env` Datei muss in `/opt/mcp-connection-key/.env` liegen
2. **Berechtigungen:** `chmod 600 .env` (nur root)
3. **Nicht committen:** Die `.env` ist bereits in `.gitignore`
4. **Backup:** Erstellen Sie ein Backup der `.env` Datei (verschlüsselt)

## 🆘 Troubleshooting

### "Datei nicht gefunden"

```bash
# Prüfen Sie den Pfad
pwd
# Sollte zeigen: /opt/mcp-connection-key

# Prüfen Sie ob Datei existiert
ls -la .env
```

### "Permission denied"

```bash
# Als root ausführen
sudo su

# Oder Berechtigungen prüfen
ls -la .env
chmod 600 .env
```

### "Docker kann .env nicht lesen"

```bash
# Prüfen Sie ob Datei im richtigen Verzeichnis ist
cd /opt/mcp-connection-key
ls -la .env

# Docker-Compose sollte .env automatisch lesen
docker-compose config
```

## 📝 Zusammenfassung

**Wo:** `/opt/mcp-connection-key/.env`

**Wie:**
1. `cd /opt/mcp-connection-key`
2. `cp .env.example .env` oder `nano .env`
3. Werte anpassen
4. `chmod 600 .env`
5. Fertig!

