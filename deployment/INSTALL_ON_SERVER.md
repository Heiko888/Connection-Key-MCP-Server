# 🚀 Reading Agent - Installation auf Server

**Server:** 138.199.237.34  
**Domain:** agent.the-connection-key.de  
**Port:** 4000

## 📋 Voraussetzungen

- ✅ SSH-Zugang zum Server
- ✅ Node.js 18+ installiert
- ✅ Domain DNS konfiguriert (agent.the-connection-key.de → 138.199.237.34)

---

## 🔧 Schritt 1: Server vorbereiten

### 1.1 SSH zum Server

```bash
ssh root@138.199.237.34
```

### 1.2 Node.js prüfen/installieren

```bash
# Prüfe Node.js
node --version

# Falls nicht installiert:
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# PM2 installieren
npm install -g pm2
```

### 1.3 Verzeichnis erstellen

```bash
mkdir -p /opt/reading-agent
cd /opt/reading-agent
```

---

## 📦 Schritt 2: Code deployen

### Option A: Git Clone (empfohlen)

```bash
cd /opt/reading-agent
git clone https://github.com/Heiko888/Connection-Key-MCP-Server.git .
cd production
```

### Option B: SCP Upload

```bash
# Von lokal (auf Ihrem Rechner)
scp -r production/* root@138.199.237.34:/opt/reading-agent/
```

---

## ⚙️ Schritt 3: Konfiguration

### 3.1 Environment-Datei erstellen

```bash
cd /opt/reading-agent/production
cp env.example .env
nano .env
```

**Inhalt:**
```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
AGENT_SECRET=your-secret-key-here
MCP_PORT=4000
KNOWLEDGE_PATH=./knowledge
TEMPLATE_PATH=./templates
LOG_LEVEL=info
NODE_ENV=production
```

### 3.2 Dependencies installieren

```bash
npm install
```

### 3.3 Knowledge & Templates vorbereiten

```bash
# Knowledge-Verzeichnis
mkdir -p knowledge
# Fügen Sie Ihre .txt oder .md Dateien hinzu

# Templates-Verzeichnis
mkdir -p templates
# Fügen Sie Ihre Template-Dateien hinzu
```

---

## 🚀 Schritt 4: Agent starten

### 4.1 Start-Script ausführbar machen

```bash
chmod +x start.sh
```

### 4.2 Agent starten

```bash
./start.sh
```

**Oder manuell:**
```bash
pm2 start server.js \
  --name reading-agent \
  --log logs/reading-agent.log \
  --error logs/reading-agent-error.log \
  --out logs/reading-agent-out.log \
  --merge-logs \
  --time

pm2 save
pm2 startup
```

---

## 🌐 Schritt 5: Nginx konfigurieren

### 5.1 Nginx installieren (falls nicht vorhanden)

```bash
apt update
apt install -y nginx certbot python3-certbot-nginx
```

### 5.2 Nginx-Config erstellen

```bash
cat > /etc/nginx/sites-available/reading-agent << 'EOF'
server {
    listen 80;
    server_name agent.the-connection-key.de;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# Symlink erstellen
ln -sf /etc/nginx/sites-available/reading-agent /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Nginx testen
nginx -t

# Nginx neu laden
systemctl reload nginx
```

### 5.3 SSL-Zertifikat erstellen

```bash
certbot --nginx -d agent.the-connection-key.de --non-interactive --agree-tos --email admin@the-connection-key.de --redirect
```

---

## ✅ Schritt 6: Testen

### 6.1 Health Check

```bash
# Lokal
curl http://localhost:4000/health

# Über Domain (nach SSL)
curl https://agent.the-connection-key.de/health
```

### 6.2 Reading generieren

```bash
curl -X POST https://agent.the-connection-key.de/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "detailed"
  }'
```

---

## 🔄 Wartung & Debug

### PM2 Status

```bash
# Status prüfen
pm2 status reading-agent

# Logs anzeigen
pm2 logs reading-agent

# Logs der letzten 100 Zeilen
pm2 logs reading-agent --lines 100

# Logs in Echtzeit
pm2 logs reading-agent --lines 0
```

### Agent neu starten

```bash
pm2 restart reading-agent
```

### Agent stoppen

```bash
pm2 stop reading-agent
```

### Agent löschen

```bash
pm2 delete reading-agent
```

### Knowledge/Templates neu laden

```bash
curl -X POST https://agent.the-connection-key.de/admin/reload-knowledge \
  -H "Authorization: Bearer YOUR_AGENT_SECRET"

curl -X POST https://agent.the-connection-key.de/admin/reload-templates \
  -H "Authorization: Bearer YOUR_AGENT_SECRET"
```

### Nginx Logs

```bash
# Access Logs
tail -f /var/log/nginx/access.log

# Error Logs
tail -f /var/log/nginx/error.log
```

### Firewall prüfen

```bash
# Port 4000 sollte intern erreichbar sein
# Port 80/443 für Nginx
ufw status
```

---

## 🐛 Troubleshooting

### Agent startet nicht

```bash
# Prüfe Logs
pm2 logs reading-agent --err

# Prüfe Environment
cd /opt/reading-agent/production
cat .env

# Prüfe Node.js
node --version
```

### Agent antwortet nicht

```bash
# Prüfe ob Agent läuft
pm2 status

# Prüfe Port
netstat -tuln | grep 4000

# Teste lokal
curl http://localhost:4000/health
```

### Nginx Fehler

```bash
# Nginx Config testen
nginx -t

# Nginx Logs
tail -f /var/log/nginx/error.log

# Nginx neu starten
systemctl restart nginx
```

### SSL-Zertifikat Probleme

```bash
# Certbot Status
certbot certificates

# Zertifikat erneuern
certbot renew --dry-run
```

---

## 📊 Monitoring

### PM2 Monitoring

```bash
# PM2 Dashboard
pm2 monit

# PM2 Status
pm2 status
```

### Health Check regelmäßig prüfen

```bash
# Cron-Job für Health Check
crontab -e

# Fügen Sie hinzu:
*/5 * * * * curl -f http://localhost:4000/health || pm2 restart reading-agent
```

---

## 🔐 Sicherheit

### Firewall

```bash
# Nur notwendige Ports öffnen
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
# Port 4000 sollte NICHT öffentlich sein (nur über Nginx)
```

### Agent Secret

```bash
# Starker Secret generieren
openssl rand -hex 32

# In .env setzen
AGENT_SECRET=generierter-secret
```

---

## ✅ Checkliste

- [ ] Node.js installiert
- [ ] PM2 installiert
- [ ] Code deployed
- [ ] .env konfiguriert
- [ ] Dependencies installiert
- [ ] Agent gestartet
- [ ] Nginx konfiguriert
- [ ] SSL-Zertifikat erstellt
- [ ] Health Check funktioniert
- [ ] Reading-Generierung funktioniert
- [ ] Firewall konfiguriert

---

## 🎉 Fertig!

Der Reading-Agent läuft jetzt produktionsbereit auf:
- **URL:** https://agent.the-connection-key.de
- **Health:** https://agent.the-connection-key.de/health
- **API:** https://agent.the-connection-key.de/reading/generate

