# 🔒 HTTPS Setup für n8n auf Hetzner

Komplette Anleitung zum Einrichten von HTTPS für n8n mit Let's Encrypt SSL.

## 📋 Voraussetzungen

- ✅ Hetzner Server (138.199.237.34)
- ✅ Domain oder Subdomain (z.B. n8n.yourdomain.com)
- ✅ DNS-Eintrag: `n8n.yourdomain.com → 138.199.237.34`

## 🚀 Schritt 1: DNS-Eintrag erstellen

**In Ihrem DNS-Provider (z.B. Cloudflare, Namecheap, etc.):**

Erstellen Sie einen **A-Record**:
```
n8n.yourdomain.com  →  138.199.237.34
TTL: 300 (oder Auto)
```

**Warten Sie bis DNS propagiert ist:**
```bash
# Prüfen (von lokal)
nslookup n8n.yourdomain.com
# Oder
dig n8n.yourdomain.com
```

## 🔧 Schritt 2: Nginx installieren

**Auf Hetzner Server:**

```bash
# System aktualisieren
apt update

# Nginx installieren
apt install -y nginx

# Certbot installieren (für Let's Encrypt)
apt install -y certbot python3-certbot-nginx

# Nginx starten
systemctl start nginx
systemctl enable nginx

# Status prüfen
systemctl status nginx
```

## 🌐 Schritt 3: Nginx Konfiguration erstellen

**Ersetzen Sie `n8n.yourdomain.com` mit Ihrer Domain!**

```bash
cat > /etc/nginx/sites-available/n8n << 'EOF'
server {
    listen 80;
    server_name n8n.yourdomain.com;

    location / {
        proxy_pass http://localhost:5678;
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
ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/

# Standard-Konfiguration entfernen
rm -f /etc/nginx/sites-enabled/default

# Nginx Konfiguration testen
nginx -t

# Nginx neu laden
systemctl reload nginx
```

## 🔒 Schritt 4: SSL-Zertifikat erstellen

```bash
# SSL-Zertifikat erstellen (ersetzen Sie die Domain!)
certbot --nginx -d n8n.yourdomain.com

# Folgen Sie den Anweisungen:
# - E-Mail eingeben
# - Terms of Service akzeptieren
# - Optional: E-Mail für Renewal-Benachrichtigungen
```

Certbot konfiguriert Nginx automatisch für HTTPS!

## ✅ Schritt 5: n8n Environment anpassen

```bash
cd /opt/mcp-connection-key

# .env Datei bearbeiten
nano .env
```

**Hinzufügen/Anpassen:**
```bash
# n8n HTTPS Konfiguration
N8N_HOST=n8n.yourdomain.com
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.yourdomain.com/
N8N_SECURE_COOKIE=true
```

**Oder direkt per Befehl:**
```bash
cd /opt/mcp-connection-key

# Alte HTTP-Einstellungen entfernen/ersetzen
sed -i '/^N8N_HOST=/d' .env
sed -i '/^N8N_PROTOCOL=/d' .env
sed -i '/^WEBHOOK_URL=/d' .env
sed -i '/^N8N_SECURE_COOKIE=/d' .env

# Neue HTTPS-Einstellungen hinzufügen
echo "" >> .env
echo "# n8n HTTPS Konfiguration" >> .env
echo "N8N_HOST=n8n.yourdomain.com" >> .env
echo "N8N_PROTOCOL=https" >> .env
echo "WEBHOOK_URL=https://n8n.yourdomain.com/" >> .env
echo "N8N_SECURE_COOKIE=true" >> .env

# ⚠️ WICHTIG: Ersetzen Sie n8n.yourdomain.com mit Ihrer echten Domain!
```

## 🔄 Schritt 6: n8n neu starten

```bash
cd /opt/mcp-connection-key
docker-compose restart n8n

# Prüfen
docker-compose ps | grep n8n
docker-compose logs n8n | tail -20
```

## ✅ Schritt 7: Testen

### HTTPS-Zugriff testen:
```bash
# Health Check
curl https://n8n.yourdomain.com/healthz

# Im Browser öffnen
https://n8n.yourdomain.com
```

### Webhook-URL für Mailchimp:
```
https://n8n.yourdomain.com/webhook/mailchimp-confirmed
```

## 🔄 Schritt 8: Auto-Renewal prüfen

```bash
# Certbot Auto-Renewal testen
certbot renew --dry-run

# Auto-Renewal ist standardmäßig aktiviert
# Prüfen:
systemctl status certbot.timer
```

## 🔧 Optional: Weitere Services mit HTTPS

Falls Sie auch für Connection-Key und ChatGPT-Agent HTTPS einrichten möchten:

### Connection-Key (Port 3000)
```bash
cat > /etc/nginx/sites-available/api << 'EOF'
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
EOF

ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
certbot --nginx -d api.yourdomain.com
```

### ChatGPT-Agent (Port 4000)
```bash
cat > /etc/nginx/sites-available/agent << 'EOF'
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
EOF

ln -s /etc/nginx/sites-available/agent /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
certbot --nginx -d agent.yourdomain.com
```

## 📋 Checkliste

- [ ] DNS-Eintrag erstellt: `n8n.yourdomain.com → 138.199.237.34`
- [ ] DNS propagiert (prüfen mit `nslookup`)
- [ ] Nginx installiert
- [ ] Nginx Konfiguration erstellt
- [ ] SSL-Zertifikat erstellt (`certbot`)
- [ ] n8n Environment angepasst (HTTPS)
- [ ] n8n neu gestartet
- [ ] HTTPS-Zugriff getestet
- [ ] Auto-Renewal getestet

## 🆘 Troubleshooting

### DNS nicht propagiert
```bash
# Prüfen
nslookup n8n.yourdomain.com
dig n8n.yourdomain.com

# Warten Sie 5-15 Minuten
```

### Certbot Fehler
```bash
# Logs prüfen
tail -f /var/log/letsencrypt/letsencrypt.log

# Manuell testen
certbot certonly --nginx -d n8n.yourdomain.com --dry-run
```

### Nginx Fehler
```bash
# Konfiguration testen
nginx -t

# Logs prüfen
tail -f /var/log/nginx/error.log
```

### n8n nicht erreichbar über HTTPS
```bash
# Prüfe ob n8n lokal läuft
curl http://localhost:5678/healthz

# Prüfe Nginx
systemctl status nginx
curl http://localhost:5678

# Prüfe Firewall
ufw status
```

## 🎯 Nach dem Setup

**Ihre URLs:**
- n8n: `https://n8n.yourdomain.com`
- Webhook: `https://n8n.yourdomain.com/webhook/mailchimp-confirmed`

**Mailchimp Webhook URL aktualisieren:**
- Alte URL: `http://138.199.237.34:5678/webhook/mailchimp-confirmed`
- Neue URL: `https://n8n.yourdomain.com/webhook/mailchimp-confirmed`

## 🔐 Sicherheit

✅ HTTPS aktiviert
✅ Secure Cookies aktiviert
✅ SSL-Zertifikat automatisch erneuert
✅ Firewall konfiguriert


