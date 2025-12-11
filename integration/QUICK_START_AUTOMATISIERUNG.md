# 🚀 Quick Start: Agenten automatisch arbeiten lassen

## ✅ Was bereits funktioniert

1. **Automatischer Start beim Server-Boot:**
   - ✅ MCP Server (Systemd)
   - ✅ Reading Agent (PM2)
   - ✅ Docker Services (Docker Compose)

## 🎯 Schnellstart-Optionen

### Option 1: n8n Workflow (Empfohlen)

**Schritt 1: n8n öffnen**
```
https://n8n.werdemeisterdeinergedankenagent.de
```

**Schritt 2: Neuen Workflow erstellen**
1. Klicke auf "New Workflow"
2. Ziehe "Schedule Trigger" Node hinein
3. Konfiguriere: `0 9 * * *` (täglich 9:00)
4. Ziehe "HTTP Request" Node hinein
5. Konfiguriere:
   - Method: POST
   - URL: `http://138.199.237.34:7000/agent/marketing`
   - Body: `{"message": "Erstelle 5 Social Media Posts für heute"}`
6. Aktiviere Workflow

**Fertig!** Der Agent wird täglich um 9:00 automatisch aufgerufen.

### Option 2: Cron Job

```bash
# Crontab bearbeiten
crontab -e

# Täglich um 9:00 Marketing-Content generieren
0 9 * * * curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle 5 Social Media Posts für heute"}' \
  > /var/log/marketing-agent-$(date +\%Y-\%m-\%d).log 2>&1
```

### Option 3: Multi-Agent Pipeline

```bash
# Script herunterladen/kopieren
chmod +x integration/scripts/agent-pipeline.sh

# Ausführen
./integration/scripts/agent-pipeline.sh "Neue Kampagne: Human Design"
```

## 📋 Verfügbare Scripts

1. **`agent-pipeline.sh`** - Multi-Agent Pipeline
2. **`agent-status.sh`** - Status-Check aller Agenten

## 🔄 Nächste Schritte

1. Erstellen Sie n8n Workflows für Ihre Use Cases
2. Richten Sie Cron Jobs für regelmäßige Tasks ein
3. Nutzen Sie Webhooks für Event-basierte Automatisierung

**Detaillierte Anleitung:** Siehe `integration/AUTOMATISIERUNG_AGENTEN.md`

