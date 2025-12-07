# Reading Agent - Production

Produktionsversion des Reading-Agenten, läuft unabhängig von Docker über PM2.

## 📁 Struktur

```
production/
├── server.js          # Hauptserver
├── package.json       # Dependencies
├── start.sh           # PM2 Start-Script
├── env.example        # Environment-Vorlage
├── .env               # Environment (nicht in Git)
├── knowledge/         # Knowledge-Dateien (.txt, .md)
├── templates/         # Template-Dateien (.txt, .md, .json)
└── logs/              # PM2 Logs
```

## 🚀 Setup

1. **Dependencies installieren:**
   ```bash
   cd production
   npm install
   ```

2. **Environment konfigurieren:**
   ```bash
   cp env.example .env
   nano .env
   ```

3. **Start:**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

## 📡 API-Endpoints

- `GET /health` - Health Check
- `POST /reading/generate` - Reading generieren
- `POST /admin/reload-knowledge` - Knowledge neu laden (mit Secret)
- `POST /admin/reload-templates` - Templates neu laden (mit Secret)

## 🔧 PM2 Befehle

```bash
# Status
pm2 status reading-agent

# Logs
pm2 logs reading-agent

# Neustart
pm2 restart reading-agent

# Stoppen
pm2 stop reading-agent

# Löschen
pm2 delete reading-agent
```

