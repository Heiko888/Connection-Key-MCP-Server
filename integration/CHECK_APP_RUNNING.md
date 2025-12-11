# 🔍 Prüfe wie die Next.js App läuft

## Option 1: Docker

```bash
# Prüfe ob Docker läuft
docker ps

# Prüfe docker-compose.yml
cd /opt/hd-app/The-Connection-Key/frontend
ls -la docker-compose.yml

# Oder im Root-Verzeichnis
cd /opt/hd-app/The-Connection-Key
ls -la docker-compose.yml

# App neu starten (Docker)
docker-compose restart
# oder
docker-compose down && docker-compose up -d
```

## Option 2: PM2 (andere Namen)

```bash
# Prüfe alle PM2 Prozesse
pm2 list

# Prüfe ob Next.js unter anderem Namen läuft
pm2 list | grep -i next
pm2 list | grep -i node
```

## Option 3: Systemd Service

```bash
# Prüfe Systemd Services
systemctl list-units | grep -i next
systemctl list-units | grep -i connection

# Oder
systemctl status next-app
systemctl status connection-key
```

## Option 4: Direkt npm/node

```bash
# Prüfe laufende Node-Prozesse
ps aux | grep node
ps aux | grep next

# Prüfe ob npm run dev läuft
ps aux | grep "npm run dev"
```

## Option 5: Port prüfen

```bash
# Prüfe welcher Prozess auf Port 3000 läuft
lsof -i :3000
# oder
netstat -tulpn | grep 3000
```

## Schnell-Check

```bash
# Alles in einem
echo "=== Docker ===" && docker ps 2>/dev/null | head -5 && \
echo "" && echo "=== PM2 ===" && pm2 list 2>/dev/null && \
echo "" && echo "=== Port 3000 ===" && lsof -i :3000 2>/dev/null || netstat -tulpn | grep 3000
```

