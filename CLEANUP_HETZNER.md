# 🧹 Hetzner Server Cleanup - Anleitung

Diese Anleitung zeigt, wie Sie alte Verzeichnisse und Container auf dem Hetzner Server sicher löschen, bevor Sie neu deployen.

## ⚠️ WICHTIG: Backups erstellen!

**Bevor Sie löschen, erstellen Sie Backups:**

```bash
# n8n Daten sichern
docker exec n8n tar -czf /tmp/n8n-backup-$(date +%Y%m%d).tar.gz /home/node/.n8n

# Backup herunterladen
scp root@your-server:/tmp/n8n-backup-*.tar.gz ./
```

## 🚀 Option 1: Automatisches Cleanup-Script

### Schritt 1: Script hochladen

```bash
# Auf Ihrem lokalen Rechner
scp cleanup-hetzner.sh root@your-server-ip:/root/

# Auf Server
ssh root@your-server-ip
chmod +x /root/cleanup-hetzner.sh
```

### Schritt 2: Script ausführen

```bash
/root/cleanup-hetzner.sh
```

Das Script fragt Sie bei jedem Schritt nach Bestätigung.

## 🛠️ Option 2: Manuelles Cleanup

### Schritt 1: Docker Container stoppen

```bash
# In Projekt-Verzeichnis
cd /opt/mcp-connection-key

# Container stoppen und entfernen
docker-compose down -v

# Oder einzeln
docker stop mcp-server chatgpt-agent connection-key n8n
docker rm mcp-server chatgpt-agent connection-key n8n
```

### Schritt 2: Docker Images entfernen

```bash
# Images anzeigen
docker images

# Unsere Images entfernen
docker rmi mcp-connection-key-mcp-server
docker rmi mcp-connection-key-chatgpt-agent
docker rmi mcp-connection-key-connection-key
```

### Schritt 3: Verzeichnisse löschen

```bash
# Projekt-Verzeichnis löschen
rm -rf /opt/mcp-connection-key

# Weitere mögliche Verzeichnisse
rm -rf /opt/mcp-server
rm -rf /opt/chatgpt-agent
rm -rf /opt/connection-key
```

### Schritt 4: n8n Daten (optional)

```bash
# n8n Daten löschen (wenn gewünscht)
rm -rf /root/.n8n
rm -rf /home/node/.n8n

# Docker Volume
docker volume rm n8n_data
```

### Schritt 5: Docker aufräumen (optional)

```bash
# Ungenutzte Volumes
docker volume prune

# Ungenutzte Images, Container, Networks
docker system prune
```

## ✅ Verifikation

Nach dem Cleanup prüfen:

```bash
# Container prüfen
docker ps -a | grep -E "(mcp|agent|connection|n8n)"

# Verzeichnisse prüfen
ls -la /opt/ | grep -E "(mcp|agent|connection)"

# Docker Images prüfen
docker images | grep -E "(mcp|agent|connection)"
```

Alles sollte leer sein.

## 🚀 Nach dem Cleanup: Neu deployen

```bash
# 1. Code klonen
git clone https://github.com/Heiko888/Connection-Key-MCP-Server.git /opt/mcp-connection-key
cd /opt/mcp-connection-key

# 2. .env erstellen
nano .env

# 3. Deployen
chmod +x deploy.sh
./deploy.sh
```

## 📋 Checkliste

- [ ] Backups erstellt
- [ ] Container gestoppt
- [ ] Container entfernt
- [ ] Images entfernt
- [ ] Verzeichnisse gelöscht
- [ ] n8n Daten gesichert/gelöscht (optional)
- [ ] Docker aufgeräumt (optional)
- [ ] Verifikation durchgeführt

## ⚠️ Häufige Fehler

### "Container läuft noch"

```bash
# Container forciert stoppen
docker kill $(docker ps -q)

# Dann entfernen
docker rm $(docker ps -aq)
```

### "Permission denied"

```bash
# Als root ausführen
sudo su

# Oder mit sudo
sudo rm -rf /opt/mcp-connection-key
```

### "Verzeichnis nicht gefunden"

Das ist normal, wenn das Verzeichnis bereits gelöscht wurde oder nie existiert hat.

## 🔄 Schnell-Cleanup (nur Container)

Wenn Sie nur Container neu starten möchten:

```bash
cd /opt/mcp-connection-key
docker-compose down
docker-compose up -d --build
```

## 📞 Support

Bei Problemen:
1. Prüfen Sie die Logs: `docker-compose logs`
2. Prüfen Sie Container-Status: `docker ps -a`
3. Prüfen Sie Disk Space: `df -h`

