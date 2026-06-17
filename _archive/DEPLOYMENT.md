# Deployment-Anleitung: Hetzner Setup

Diese Anleitung zeigt, wie Sie das komplette System (MCP Server + ChatGPT-Agent + n8n) auf einem Hetzner Server deployen.

## 📋 Voraussetzungen

- Hetzner VPS (mindestens 2GB RAM, 2 CPU Cores empfohlen)
- Domain oder Subdomains
- Node.js 20+ installiert
- Docker & Docker Compose (optional, aber empfohlen)
- OpenAI API Key

## 🚀 Option 1: Docker-Compose (Empfohlen)

### Schritt 1: Server vorbereiten

```bash
# SSH zum Server
ssh root@your-server-ip

# Updates
apt update && apt upgrade -y

# Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Docker Compose installieren
apt install docker-compose -y
```

### Schritt 2: Code deployen

```bash
# Projekt-Verzeichnis erstellen
mkdir -p /opt/mcp-connection-key
cd /opt/mcp-connection-key

# Code hochladen (via Git oder SCP)
git clone your-repo .
# ODER
scp -r . root@your-server:/opt/mcp-connection-key/
```

### Schritt 3: Umgebungsvariablen setzen

```bash
# .env Datei erstellen
cat > .env << EOF
OPENAI_API_KEY=your-openai-api-key-here
N8N_BASE_URL=http://n8n.deinedomain.tld
N8N_API_KEY=your-n8n-api-key
N8N_PASSWORD=secure-password
MCP_SERVER_URL=http://mcp.deinedomain.tld
EOF

# Sicherheit: Berechtigungen setzen
chmod 600 .env
```

### Schritt 4: Docker-Compose starten

```bash
# Services bauen und starten
docker-compose up -d

# Status prüfen
docker-compose ps

# Logs anzeigen
docker-compose logs -f
```

### Schritt 5: Nginx Reverse Proxy (Optional)

```bash
# Nginx installieren
apt install nginx -y

# Konfiguration erstellen
cat > /etc/nginx/sites-available/mcp-system << EOF
# n8n
server {
    listen 80;
    server_name n8n.deinedomain.tld;
    
    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}

# ChatGPT-Agent
server {
    listen 80;
    server_name agent.deinedomain.tld;
    
    location / {
        proxy_pass http://localhost:4000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}

# MCP Server (wenn HTTP-API vorhanden)
server {
    listen 80;
    server_name mcp.deinedomain.tld;
    
    location / {
        proxy_pass http://localhost:7777;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

# Symlink erstellen
ln -s /etc/nginx/sites-available/mcp-system /etc/nginx/sites-enabled/

# Nginx testen und neu laden
nginx -t
systemctl reload nginx
```

### Schritt 6: SSL mit Let's Encrypt

```bash
# Certbot installieren
apt install certbot python3-certbot-nginx -y

# SSL-Zertifikate erstellen
certbot --nginx -d n8n.deinedomain.tld
certbot --nginx -d agent.deinedomain.tld
certbot --nginx -d mcp.deinedomain.tld
```

## 🚀 Option 2: PM2 (Ohne Docker)

### Schritt 1: Node.js installieren

```bash
# Node.js 20 installieren
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PM2 installieren
npm install -g pm2
```

### Schritt 2: Code deployen

```bash
# Projekt-Verzeichnis
mkdir -p /opt/mcp-connection-key
cd /opt/mcp-connection-key

# Code hochladen
git clone your-repo .
# ODER
scp -r . root@your-server:/opt/mcp-connection-key/

# Dependencies installieren
npm install
```

### Schritt 3: Umgebungsvariablen

```bash
# .env Datei
cat > .env << EOF
OPENAI_API_KEY=your-openai-api-key
N8N_BASE_URL=http://localhost:5678
MCP_SERVER_URL=http://localhost:7777
PORT=4000
EOF
```

### Schritt 4: Services starten

```bash
# n8n (wenn lokal installiert)
pm2 start n8n --name n8n

# MCP Server
cd /opt/mcp-connection-key
pm2 start index.js --name mcp-server

# ChatGPT-Agent
pm2 start chatgpt-agent/server.js --name chatgpt-agent

# PM2 beim Boot starten
pm2 startup
pm2 save
```

### Schritt 5: Nginx konfigurieren

Siehe Option 1, Schritt 5.

## 🔍 Verifikation

### Health Checks

```bash
# ChatGPT-Agent
curl http://localhost:4000/health

# MCP Server (wenn HTTP-API)
curl http://localhost:7777/health

# n8n
curl http://localhost:5678/healthz
```

### Test-Chat

```bash
curl -X POST http://localhost:4000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "message": "Hallo, kannst du mir helfen?"
  }'
```

## 📊 Monitoring

### PM2 Monitoring

```bash
# Status anzeigen
pm2 status

# Logs anzeigen
pm2 logs

# Monitoring Dashboard
pm2 monit
```

### Docker Monitoring

```bash
# Container-Status
docker-compose ps

# Logs
docker-compose logs -f chatgpt-agent
docker-compose logs -f mcp-server
docker-compose logs -f n8n

# Ressourcen
docker stats
```

## 🔧 Wartung

### Updates

```bash
# Code aktualisieren
cd /opt/mcp-connection-key
git pull

# Dependencies aktualisieren
npm install

# Services neu starten
pm2 restart all
# ODER
docker-compose restart
```

### Backups

```bash
# n8n Daten sichern
docker exec n8n tar -czf /tmp/n8n-backup.tar.gz /home/node/.n8n

# Oder mit PM2
cp -r ~/.n8n /backup/n8n-$(date +%Y%m%d)
```

## 🐛 Troubleshooting

### Services starten nicht

```bash
# Logs prüfen
pm2 logs
# ODER
docker-compose logs

# Ports prüfen
netstat -tulpn | grep LISTEN
```

### OpenAI API Fehler

```bash
# API Key prüfen
echo $OPENAI_API_KEY

# Test-Request
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### n8n nicht erreichbar

```bash
# n8n Status
docker exec n8n n8n status
# ODER
pm2 status n8n

# Port prüfen
curl http://localhost:5678/healthz
```

## 🔐 Sicherheit

1. **Firewall konfigurieren:**
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

2. **SSH Key-basiert:**
```bash
# SSH Keys verwenden statt Passwörter
# /etc/ssh/sshd_config anpassen
```

3. **Regelmäßige Updates:**
```bash
apt update && apt upgrade -y
```

4. **Logs rotieren:**
```bash
# PM2 Logs rotieren automatisch
# Docker Logs: docker-compose.yml anpassen
```

## 📈 Skalierung

Für höhere Lasten:

1. **Mehr Ressourcen:** Größerer Hetzner VPS
2. **Load Balancer:** Mehrere Instanzen hinter Nginx
3. **Database:** Separate Datenbank für Sessions
4. **Caching:** Redis für Memory-Management

## ✅ Checkliste

- [ ] Server vorbereitet
- [ ] Code deployed
- [ ] Umgebungsvariablen gesetzt
- [ ] Services gestartet
- [ ] Nginx konfiguriert
- [ ] SSL-Zertifikate installiert
- [ ] Health Checks erfolgreich
- [ ] Test-Chat funktioniert
- [ ] Monitoring eingerichtet
- [ ] Backups konfiguriert

## 🎉 Fertig!

Ihr System sollte jetzt laufen. Testen Sie es mit:

```bash
curl -X POST http://agent.deinedomain.tld/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test",
    "message": "Erstelle mir ein Human Design Reading"
  }'
```

