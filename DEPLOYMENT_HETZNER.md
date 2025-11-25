# 🚀 Hetzner Deployment - Schritt für Schritt

Diese Anleitung führt Sie durch das komplette Deployment auf einen Hetzner Server.

## 📋 Voraussetzungen

- ✅ Hetzner VPS (mindestens 2GB RAM, 2 CPU Cores empfohlen)
- ✅ Domain oder Subdomains (optional, aber empfohlen)
- ✅ SSH-Zugang zum Server
- ✅ Code auf GitHub/GitLab (oder bereit zum Upload)

## 🎯 Schritt 1: Hetzner Server vorbereiten

### 1.1 Server erstellen

1. Gehen Sie zu [Hetzner Cloud Console](https://console.hetzner.cloud/)
2. Erstellen Sie einen neuen Server:
   - **Image:** Ubuntu 22.04
   - **Type:** CPX11 (2 vCPU, 2GB RAM) oder größer
   - **Location:** Wählen Sie einen Standort
   - **SSH Key:** Fügen Sie Ihren SSH-Key hinzu

### 1.2 Server verbinden

```bash
# SSH zum Server
ssh root@your-server-ip

# Oder mit SSH-Key
ssh -i ~/.ssh/your-key root@your-server-ip
```

### 1.3 System aktualisieren

```bash
# Updates
apt update && apt upgrade -y

# Basis-Tools installieren
apt install -y curl wget git vim ufw
```

## 🐳 Schritt 2: Docker installieren

### 2.1 Docker installieren

```bash
# Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose installieren
apt install docker-compose -y

# Docker starten
systemctl start docker
systemctl enable docker

# Prüfen
docker --version
docker-compose --version
```

## 📦 Schritt 3: Code auf Server bringen

### Option A: Git (Empfohlen)

```bash
# Git installieren (falls nicht vorhanden)
apt install -y git

# Projekt-Verzeichnis erstellen
mkdir -p /opt/mcp-connection-key
cd /opt/mcp-connection-key

# Code von GitHub/GitLab klonen
git clone https://github.com/your-username/your-repo.git .

# Oder wenn bereits vorhanden
cd /opt/mcp-connection-key
git pull
```

### Option B: SCP (Direkter Upload)

```bash
# Auf Ihrem lokalen Rechner
scp -r . root@your-server-ip:/opt/mcp-connection-key/
```

### Option C: Manueller Upload

1. Code als ZIP packen
2. Auf Server hochladen
3. Entpacken

## 🔐 Schritt 4: Umgebungsvariablen konfigurieren

### 4.1 .env Datei erstellen

```bash
cd /opt/mcp-connection-key

# .env Datei erstellen
cat > .env << EOF
# OpenAI API Key (ERFORDERLICH)
OPENAI_API_KEY=your-openai-api-key-here

# n8n Konfiguration
N8N_BASE_URL=http://n8n:5678
N8N_PASSWORD=secure-password-change-me
N8N_API_KEY=your-n8n-api-key-if-needed

# MCP Server
MCP_SERVER_URL=http://mcp-server:7777

# ChatGPT-Agent
CHATGPT_AGENT_URL=http://chatgpt-agent:4000

# Connection-Key Server
PORT=3000
AUTH_ENABLED=true
API_KEY=your-secure-api-key-here
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Optional: JWT
JWT_SECRET=your-super-secret-jwt-key-change-me
EOF

# Sicherheit: Berechtigungen setzen
chmod 600 .env
```

### 4.2 Wichtige Werte anpassen

**MUSS angepasst werden:**
- `OPENAI_API_KEY` - Ihr OpenAI API Key
- `N8N_PASSWORD` - Sicheres Passwort für n8n
- `API_KEY` - API Key für Connection-Key Server
- `JWT_SECRET` - Geheimer Schlüssel für JWT

## 🌐 Schritt 5: Domain konfigurieren (Optional)

### 5.1 DNS-Einträge erstellen

Erstellen Sie in Ihrem DNS-Provider folgende A-Records:

```
api.yourdomain.com     → Server-IP
agent.yourdomain.com   → Server-IP
n8n.yourdomain.com     → Server-IP
```

### 5.2 Nginx installieren und konfigurieren

```bash
# Nginx installieren
apt install -y nginx

# Konfiguration erstellen
cat > /etc/nginx/sites-available/mcp-system << 'EOF'
# Connection-Key Server (API)
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# ChatGPT-Agent
server {
    listen 80;
    server_name agent.yourdomain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# n8n
server {
    listen 80;
    server_name n8n.yourdomain.com;

    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Symlink erstellen
ln -s /etc/nginx/sites-available/mcp-system /etc/nginx/sites-enabled/

# Standard-Konfiguration entfernen
rm /etc/nginx/sites-enabled/default

# Nginx testen
nginx -t

# Nginx starten
systemctl restart nginx
systemctl enable nginx
```

**Wichtig:** Ersetzen Sie `yourdomain.com` mit Ihrer Domain!

## 🔒 Schritt 6: SSL-Zertifikate (Let's Encrypt)

```bash
# Certbot installieren
apt install -y certbot python3-certbot-nginx

# SSL-Zertifikate erstellen
certbot --nginx -d api.yourdomain.com
certbot --nginx -d agent.yourdomain.com
certbot --nginx -d n8n.yourdomain.com

# Auto-Renewal testen
certbot renew --dry-run
```

## 🚀 Schritt 7: Services starten

### 7.1 Docker-Compose starten

```bash
cd /opt/mcp-connection-key

# Services bauen und starten
docker-compose up -d

# Status prüfen
docker-compose ps

# Logs anzeigen
docker-compose logs -f
```

### 7.2 Services einzeln prüfen

```bash
# n8n
curl http://localhost:5678/healthz

# ChatGPT-Agent
curl http://localhost:4000/health

# Connection-Key Server
curl http://localhost:3000/health
```

## 🔥 Schritt 8: Firewall konfigurieren

```bash
# Firewall aktivieren
ufw enable

# SSH erlauben (WICHTIG!)
ufw allow 22/tcp

# HTTP/HTTPS erlauben
ufw allow 80/tcp
ufw allow 443/tcp

# Status prüfen
ufw status
```

## ✅ Schritt 9: Verifikation

### 9.1 Health Checks

```bash
# Lokal auf dem Server
curl http://localhost:3000/health
curl http://localhost:4000/health
curl http://localhost:5678/healthz

# Von außen (wenn Domain konfiguriert)
curl https://api.yourdomain.com/health
curl https://agent.yourdomain.com/health
```

### 9.2 Test-Chat

```bash
# API testen
curl -X POST https://api.yourdomain.com/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "userId": "test-user",
    "message": "Hallo!"
  }'
```

## 📊 Schritt 10: Monitoring einrichten

### 10.1 Logs anzeigen

```bash
# Alle Services
docker-compose logs -f

# Einzelner Service
docker-compose logs -f chatgpt-agent
docker-compose logs -f connection-key
docker-compose logs -f n8n
```

### 10.2 System-Monitoring

```bash
# Ressourcen prüfen
docker stats

# Disk Space
df -h

# Memory
free -h
```

## 🔧 Schritt 11: Wartung

### 11.1 Updates

```bash
cd /opt/mcp-connection-key

# Code aktualisieren
git pull

# Services neu bauen
docker-compose build

# Services neu starten
docker-compose up -d
```

### 11.2 Backups

```bash
# n8n Daten sichern
docker exec n8n tar -czf /tmp/n8n-backup-$(date +%Y%m%d).tar.gz /home/node/.n8n

# Backup herunterladen
scp root@your-server:/tmp/n8n-backup-*.tar.gz ./
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

## 📋 Checkliste

- [ ] Hetzner Server erstellt
- [ ] Docker installiert
- [ ] Code auf Server gebracht
- [ ] .env Datei konfiguriert
- [ ] Domain konfiguriert (optional)
- [ ] Nginx konfiguriert (optional)
- [ ] SSL-Zertifikate installiert (optional)
- [ ] Firewall konfiguriert
- [ ] Services gestartet
- [ ] Health Checks erfolgreich
- [ ] Test-Requests funktionieren

## 🎉 Fertig!

Ihr System sollte jetzt auf Hetzner laufen!

**Zugriff:**
- API: `https://api.yourdomain.com` (oder `http://your-server-ip:3000`)
- Agent: `https://agent.yourdomain.com` (oder `http://your-server-ip:4000`)
- n8n: `https://n8n.yourdomain.com` (oder `http://your-server-ip:5678`)

## 📞 Support

Bei Problemen:
1. Logs prüfen: `docker-compose logs -f`
2. Health Checks: Alle `/health` Endpoints testen
3. Firewall prüfen: `ufw status`
4. Nginx prüfen: `nginx -t` und `systemctl status nginx`

