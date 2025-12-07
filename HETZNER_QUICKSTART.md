# 🚀 Hetzner Quickstart

Schnelleinrichtung des MCP Connection-Key Systems auf einem Hetzner Server.

## 📋 Voraussetzungen

- Hetzner VPS (mindestens 2GB RAM, 2 CPU Cores)
- SSH-Zugang zum Server
- OpenAI API Key

## ⚡ Schnellstart (Automatisch)

### Option 1: Vollautomatisches Setup

```bash
# 1. Auf Hetzner Server verbinden
ssh root@your-server-ip

# 2. Setup-Script herunterladen und ausführen
curl -o setup-hetzner.sh https://raw.githubusercontent.com/Heiko888/Connection-Key-MCP-Server/main/setup-hetzner.sh
chmod +x setup-hetzner.sh
sudo ./setup-hetzner.sh
```

Das Script führt Sie durch:
- ✅ System-Update
- ✅ Docker Installation
- ✅ Code von GitHub klonen
- ✅ .env Datei erstellen (interaktiv)
- ✅ Firewall konfigurieren
- ✅ Services starten
- ✅ Health Checks
- ✅ Optional: Nginx + SSL Setup

### Option 2: Manuelles Setup

Falls Sie das automatische Script nicht verwenden möchten:

```bash
# 1. System vorbereiten
apt update && apt upgrade -y
apt install -y curl wget git vim ufw

# 2. Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install -y docker-compose

# 3. Code klonen
mkdir -p /opt/mcp-connection-key
cd /opt/mcp-connection-key
git clone https://github.com/Heiko888/Connection-Key-MCP-Server.git .

# 4. .env Datei erstellen
cp .env.example .env
nano .env  # Werte anpassen!

# 5. Services starten
docker-compose up -d

# 6. Firewall konfigurieren
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

## 🔐 .env Datei konfigurieren

Die `.env` Datei **MUSS** folgende Werte enthalten:

```bash
# ERFORDERLICH
OPENAI_API_KEY=sk-your-openai-api-key-here
N8N_PASSWORD=secure-password-change-me
API_KEY=your-secure-api-key-change-me
```

**Sichere Passwörter generieren:**
```bash
# n8n Passwort
openssl rand -hex 16

# API Key
openssl rand -hex 32

# JWT Secret
openssl rand -hex 32
```

Siehe auch: [ENV_SETUP_HETZNER.md](./ENV_SETUP_HETZNER.md)

## ✅ Verifikation

Nach dem Setup prüfen Sie ob alles läuft:

```bash
# Health Checks
curl http://localhost:3000/health
curl http://localhost:4000/health
curl http://localhost:5678/healthz

# Docker Container Status
docker-compose ps

# Logs anzeigen
docker-compose logs -f
```

## 🌐 Domain Setup (Optional)

Falls Sie eine Domain verwenden möchten:

1. **DNS-Einträge erstellen:**
   ```
   api.yourdomain.com     → Server-IP
   agent.yourdomain.com   → Server-IP
   n8n.yourdomain.com      → Server-IP
   ```

2. **Nginx installieren:**
   ```bash
   apt install -y nginx
   ```

3. **Nginx konfigurieren:**
   Siehe [DEPLOYMENT_HETZNER.md](./DEPLOYMENT_HETZNER.md) Schritt 5

4. **SSL-Zertifikate:**
   ```bash
   apt install -y certbot python3-certbot-nginx
   certbot --nginx -d api.yourdomain.com
   certbot --nginx -d agent.yourdomain.com
   certbot --nginx -d n8n.yourdomain.com
   ```

## 📊 Services

Nach erfolgreichem Setup sind folgende Services verfügbar:

- **Connection-Key API:** `http://your-server-ip:3000` oder `https://api.yourdomain.com`
- **ChatGPT-Agent:** `http://your-server-ip:4000` oder `https://agent.yourdomain.com`
- **n8n:** `http://your-server-ip:5678` oder `https://n8n.yourdomain.com`

## 🔧 Wartung

### Services neu starten
```bash
cd /opt/mcp-connection-key
docker-compose restart
```

### Logs anzeigen
```bash
cd /opt/mcp-connection-key
docker-compose logs -f
```

### Code aktualisieren
```bash
cd /opt/mcp-connection-key
git pull
docker-compose build
docker-compose up -d
```

### Services stoppen
```bash
cd /opt/mcp-connection-key
docker-compose down
```

## 🐛 Troubleshooting

### Services starten nicht
```bash
# Logs prüfen
docker-compose logs

# Container-Status
docker-compose ps

# Container neu starten
docker-compose restart
```

### Port bereits belegt
```bash
# Ports prüfen
netstat -tulpn | grep LISTEN

# Service finden, der Port verwendet
lsof -i :3000
```

### n8n nicht erreichbar
```bash
# n8n Container-Status
docker ps | grep n8n

# n8n Logs
docker-compose logs n8n

# n8n neu starten
docker-compose restart n8n
```

## 📚 Weitere Dokumentation

- [DEPLOYMENT_HETZNER.md](./DEPLOYMENT_HETZNER.md) - Detaillierte Schritt-für-Schritt Anleitung
- [ENV_SETUP_HETZNER.md](./ENV_SETUP_HETZNER.md) - .env Datei Setup
- [ENV_GUIDE.md](./ENV_GUIDE.md) - Alle Umgebungsvariablen erklärt
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System-Architektur

## 🆘 Support

Bei Problemen:
1. Logs prüfen: `docker-compose logs -f`
2. Health Checks: Alle `/health` Endpoints testen
3. Firewall prüfen: `ufw status`
4. Nginx prüfen: `nginx -t` und `systemctl status nginx`

