# 🔒 n8n Secure Cookie Problem beheben

Fehlermeldung: "Your n8n server is configured to use a secure cookie, however you are either visiting this via an insecure URL"

## 🔧 Lösung 1: Secure Cookie deaktivieren (Schnell, für Entwicklung)

### Auf Hetzner Server:

```bash
cd /opt/mcp-connection-key

# .env Datei bearbeiten
nano .env

# Fügen Sie hinzu:
N8N_SECURE_COOKIE=false
```

**Oder direkt per Befehl:**

```bash
cd /opt/mcp-connection-key

# Prüfe ob bereits vorhanden
grep N8N_SECURE_COOKIE .env || echo "N8N_SECURE_COOKIE=false" >> .env

# n8n neu starten
docker-compose restart n8n
```

### docker-compose.yml anpassen

Falls die Environment Variable nicht über .env lädt, direkt in docker-compose.yml:

```bash
cd /opt/mcp-connection-key
nano docker-compose.yml
```

Bei `n8n` Service unter `environment:` hinzufügen:
```yaml
- N8N_SECURE_COOKIE=false
```

Dann:
```bash
docker-compose restart n8n
```

## 🔒 Lösung 2: HTTPS einrichten (Empfohlen für Produktion)

### 2.1 Nginx installieren

```bash
apt install -y nginx certbot python3-certbot-nginx
```

### 2.2 Nginx Konfiguration

```bash
cat > /etc/nginx/sites-available/n8n << 'EOF'
server {
    listen 80;
    server_name n8n.yourdomain.com;  # Oder Ihre Domain

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
ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Nginx testen
nginx -t

# Nginx starten
systemctl restart nginx
systemctl enable nginx
```

### 2.3 SSL-Zertifikat

```bash
# DNS-Eintrag erstellen: n8n.yourdomain.com → 138.199.237.34
# Dann:
certbot --nginx -d n8n.yourdomain.com
```

### 2.4 n8n Environment anpassen

In `.env` oder `docker-compose.yml`:
```bash
N8N_HOST=n8n.yourdomain.com
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.yourdomain.com/
```

## ✅ Schnellste Lösung (für jetzt)

**Auf Hetzner Server ausführen:**

```bash
cd /opt/mcp-connection-key

# Secure Cookie deaktivieren
echo "N8N_SECURE_COOKIE=false" >> .env

# n8n neu starten
docker-compose restart n8n

# Prüfen
sleep 5
docker-compose ps | grep n8n
```

**Dann n8n erneut öffnen:**
```
http://138.199.237.34:5678
```

## 🔍 Prüfen ob es funktioniert

```bash
# Auf Hetzner Server
docker-compose logs n8n | grep -i "secure\|cookie" | tail -10
```

## ⚠️ Wichtige Hinweise

### Für Entwicklung (HTTP):
- ✅ `N8N_SECURE_COOKIE=false` ist okay
- ✅ Funktioniert sofort
- ⚠️ Nicht für Produktion empfohlen

### Für Produktion (HTTPS):
- ✅ HTTPS mit SSL-Zertifikat einrichten
- ✅ `N8N_SECURE_COOKIE=true` (Standard)
- ✅ Sicherer

## 🎯 Empfehlung

**Für jetzt (schnell):**
```bash
N8N_SECURE_COOKIE=false
```

**Später (produktionsreif):**
- Domain einrichten
- Nginx + SSL
- `N8N_SECURE_COOKIE=true`


