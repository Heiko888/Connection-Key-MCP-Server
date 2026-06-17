# 📋 Reading Agent Deployment - Zusammenfassung

## ✅ Erstellte Dateien

### Production-Verzeichnis
- ✅ `production/server.js` - Hauptserver (angepasst für Knowledge/Templates)
- ✅ `production/package.json` - Dependencies
- ✅ `production/start.sh` - PM2 Start-Script
- ✅ `production/env.example` - Environment-Vorlage
- ✅ `production/.gitignore` - Git-Ignore
- ✅ `production/README.md` - Dokumentation
- ✅ `production/knowledge/` - Knowledge-Verzeichnis (leer, für .txt/.md Dateien)
- ✅ `production/templates/` - Template-Verzeichnis (mit default.txt)

### Deployment-Verzeichnis
- ✅ `deployment/INSTALL_ON_SERVER.md` - Vollständige Installationsanleitung
- ✅ `deployment/nginx-reading-agent.conf` - Nginx-Konfiguration
- ✅ `deploy-to-mcp.sh` - Automatisches Deploy-Script

## 🔧 Modifizierte Dateien

Keine bestehenden Dateien wurden modifiziert. Alle Dateien sind neu erstellt.

## 📦 Was wurde erstellt?

### 1. Production-Struktur
```
production/
├── server.js          # Express Server mit Knowledge/Template-Support
├── package.json       # Dependencies (express, cors, openai, dotenv)
├── start.sh           # PM2 Start-Script
├── env.example        # Environment-Vorlage
├── .gitignore         # Git-Ignore
├── README.md          # Dokumentation
├── knowledge/         # Knowledge-Dateien (.txt, .md)
│   └── .gitkeep
└── templates/         # Template-Dateien (.txt, .md, .json)
    ├── .gitkeep
    └── default.txt    # Beispiel-Template
```

### 2. Deployment-Dokumentation
- Vollständige Installationsanleitung
- Nginx-Konfiguration
- PM2 Setup
- SSL-Setup
- Troubleshooting

### 3. Deploy-Script
- Automatisches Deployment per SCP
- PM2 Reload/Restart
- Dependencies-Installation

## 🚀 SSH-Befehle für Server (138.199.237.34)

### Schritt 1: Code deployen

**Option A: Mit Deploy-Script (von lokal)**
```bash
chmod +x deploy-to-mcp.sh
./deploy-to-mcp.sh
```

**Option B: Manuell**
```bash
# Auf Server
ssh root@138.199.237.34
mkdir -p /opt/reading-agent
cd /opt/reading-agent

# Git Clone oder SCP
git clone https://github.com/Heiko888/Connection-Key-MCP-Server.git .
cd production
```

### Schritt 2: Konfiguration

```bash
# Environment-Datei
cp env.example .env
nano .env
# OPENAI_API_KEY, AGENT_SECRET, etc. eintragen

# Dependencies
npm install
```

### Schritt 3: Knowledge & Templates

```bash
# Knowledge-Dateien hinzufügen (optional)
# Fügen Sie .txt oder .md Dateien in knowledge/ hinzu

# Templates anpassen (optional)
# Bearbeiten Sie templates/default.txt oder erstellen Sie neue
```

### Schritt 4: Agent starten

```bash
chmod +x start.sh
./start.sh
```

### Schritt 5: Nginx konfigurieren

```bash
# Nginx-Config kopieren
cp /opt/reading-agent/deployment/nginx-reading-agent.conf /etc/nginx/sites-available/reading-agent

# Symlink erstellen
ln -sf /etc/nginx/sites-available/reading-agent /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Nginx testen und neu laden
nginx -t
systemctl reload nginx
```

### Schritt 6: SSL-Zertifikat

```bash
certbot --nginx -d agent.the-connection-key.de --non-interactive --agree-tos --email admin@the-connection-key.de --redirect
```

## ✅ Testen

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

## 📝 Wichtige Hinweise

1. **DNS-Eintrag:** Stellen Sie sicher, dass `agent.the-connection-key.de` auf `138.199.237.34` zeigt
2. **OPENAI_API_KEY:** Muss in `.env` gesetzt sein
3. **Knowledge/Templates:** Werden beim Start geladen, können über Admin-Endpoints neu geladen werden
4. **PM2:** Agent läuft als PM2-Prozess, startet automatisch beim Boot

## 🎯 Nächste Schritte

1. ✅ Code deployen
2. ✅ .env konfigurieren
3. ✅ Agent starten
4. ✅ Nginx konfigurieren
5. ✅ SSL einrichten
6. ✅ Testen

## 📚 Vollständige Anleitung

Siehe: `deployment/INSTALL_ON_SERVER.md`

