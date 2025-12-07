# 🚀 Nächste Schritte auf dem Server

## ✅ Was wurde erledigt

- ✅ Git Pull erfolgreich
- ✅ Production Reading Agent Code ist auf dem Server
- ✅ n8n Enterprise-Flags hinzugefügt
- ✅ Alle Commits gepusht

## 📋 Nächste Schritte

### 1. Production Reading Agent einrichten

```bash
cd /opt/mcp-connection-key/production

# 1. Dependencies installieren
npm install

# 2. Environment konfigurieren
cp env.example .env
nano .env
# OPENAI_API_KEY eintragen (aus /opt/mcp-connection-key/.env kopieren)

# 3. Knowledge & Templates prüfen
ls -la knowledge/
ls -la templates/

# 4. Agent starten
chmod +x start.sh
./start.sh
```

### 2. Nginx für Reading Agent konfigurieren

```bash
# Nginx-Config kopieren
cp /opt/mcp-connection-key/deployment/nginx-reading-agent.conf /etc/nginx/sites-available/reading-agent

# Symlink erstellen
ln -sf /etc/nginx/sites-available/reading-agent /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Nginx testen
nginx -t

# Nginx neu laden
systemctl reload nginx
```

### 3. SSL-Zertifikat für agent.the-connection-key.de

```bash
# DNS muss auf 138.199.237.34 zeigen!
# Prüfen:
dig +short @8.8.8.8 agent.the-connection-key.de

# SSL-Zertifikat erstellen
certbot --nginx -d agent.the-connection-key.de --non-interactive --agree-tos --email admin@the-connection-key.de --redirect
```

### 4. Testen

```bash
# Health Check
curl https://agent.the-connection-key.de/health

# Reading generieren
curl -X POST https://agent.the-connection-key.de/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test",
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "detailed"
  }'
```

## 📊 Status prüfen

### Production Reading Agent
```bash
pm2 status reading-agent
pm2 logs reading-agent
```

### Nginx
```bash
systemctl status nginx
tail -f /var/log/nginx/error.log
```

### DNS
```bash
dig +short @8.8.8.8 agent.the-connection-key.de
# Sollte zeigen: 138.199.237.34
```

## 🔐 Sicherheit

### Token rotieren (empfohlen)
Da Ihr GitHub Token sichtbar war, sollten Sie ihn rotieren:
1. GitHub → Settings → Developer settings → Personal access tokens
2. Alten Token löschen
3. Neuen Token erstellen
4. Auf Server: `git remote set-url origin https://Heiko888:NEUER_TOKEN@github.com/...`

### Oder auf SSH umstellen
```bash
# SSH-Key generieren
ssh-keygen -t ed25519 -C "server@the-connection-key.de"

# Public Key anzeigen
cat ~/.ssh/id_ed25519.pub

# Zu GitHub hinzufügen (GitHub → Settings → SSH and GPG keys)

# Git auf SSH umstellen
git remote set-url origin git@github.com:Heiko888/Connection-Key-MCP-Server.git
```

## ✅ Checkliste

- [ ] Production Reading Agent eingerichtet
- [ ] PM2 läuft
- [ ] Nginx konfiguriert
- [ ] DNS-Eintrag für agent.the-connection-key.de
- [ ] SSL-Zertifikat erstellt
- [ ] Health Check funktioniert
- [ ] Reading-Generierung funktioniert
- [ ] GitHub Token rotiert oder SSH eingerichtet

