# 📤 Dateien auf Server übertragen

## Option 1: Git Pull (Empfohlen)

```bash
# Auf Hetzner Server
cd /opt/mcp-connection-key
git pull origin main

# Dann können Sie die Scripts ausführen
chmod +x integration/install-hetzner-server.sh
./integration/install-hetzner-server.sh
```

## Option 2: SCP (vom lokalen Rechner)

```bash
# Von Ihrem Windows-Rechner (PowerShell)
# Kopieren Sie das integration/ Verzeichnis

scp -r integration/ root@138.199.237.34:/opt/mcp-connection-key/
```

## Option 3: Manuelle Befehle (Schnellste Lösung)

Falls Git/SCP nicht möglich ist, führen Sie die Befehle direkt aus (siehe MANUAL_CORS_SETUP.md)

