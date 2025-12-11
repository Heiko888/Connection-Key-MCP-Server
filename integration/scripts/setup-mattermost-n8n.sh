#!/bin/bash

# Mattermost + n8n Integration Setup
# Erstellt n8n Workflows für Mattermost Integration

set -e

echo "========================================"
echo "Mattermost + n8n Integration Setup"
echo "========================================"
echo ""

# Prüfe ob n8n Workflows Verzeichnis existiert
WORKFLOWS_DIR="n8n-workflows"
if [ ! -d "$WORKFLOWS_DIR" ]; then
    echo "📁 Erstelle n8n-workflows Verzeichnis..."
    mkdir -p "$WORKFLOWS_DIR"
fi

echo "✅ Workflows-Verzeichnis vorhanden"
echo ""

# Prüfe Environment Variables
echo "🔧 Prüfe Environment Variables..."
echo ""

if [ -z "$MATTERMOST_WEBHOOK_URL" ]; then
    echo "⚠️  MATTERMOST_WEBHOOK_URL nicht gesetzt"
    echo ""
    echo "Bitte setzen Sie die Mattermost Webhook-URL:"
    echo "  export MATTERMOST_WEBHOOK_URL='https://mattermost.ihre-domain.de/hooks/xxxxx'"
    echo ""
    read -p "Mattermost Webhook-URL eingeben: " MATTERMOST_WEBHOOK_URL
    export MATTERMOST_WEBHOOK_URL
fi

if [ -z "$MATTERMOST_CHANNEL" ]; then
    echo "⚠️  MATTERMOST_CHANNEL nicht gesetzt (Standard: #general)"
    read -p "Mattermost Channel eingeben (z.B. #general): " MATTERMOST_CHANNEL
    MATTERMOST_CHANNEL=${MATTERMOST_CHANNEL:-"#general"}
    export MATTERMOST_CHANNEL
fi

echo ""
echo "✅ Environment Variables:"
echo "   MATTERMOST_WEBHOOK_URL: $MATTERMOST_WEBHOOK_URL"
echo "   MATTERMOST_CHANNEL: $MATTERMOST_CHANNEL"
echo ""

# Workflows sind bereits erstellt
echo "📋 Verfügbare Workflows:"
echo "   1. mattermost-agent-notification.json - Agent → Mattermost"
echo "   2. mattermost-scheduled-reports.json - Scheduled Reports → Mattermost"
echo "   3. mattermost-reading-notification.json - Reading → Mattermost"
echo ""

echo "📝 Nächste Schritte:"
echo ""
echo "1. Mattermost Webhook erstellen:"
echo "   - Mattermost öffnen"
echo "   - Integrations → Incoming Webhooks"
echo "   - Add Incoming Webhook"
echo "   - Webhook-URL kopieren"
echo ""
echo "2. n8n Workflows importieren:"
echo "   - n8n öffnen: https://n8n.werdemeisterdeinergedankenagent.de"
echo "   - Workflows → Import"
echo "   - Workflow-Dateien auswählen:"
echo "     - n8n-workflows/mattermost-agent-notification.json"
echo "     - n8n-workflows/mattermost-scheduled-reports.json"
echo "     - n8n-workflows/mattermost-reading-notification.json"
echo ""
echo "3. Environment Variables in n8n setzen:"
echo "   - Settings → Environment Variables"
echo "   - MATTERMOST_WEBHOOK_URL: $MATTERMOST_WEBHOOK_URL"
echo "   - MATTERMOST_CHANNEL: $MATTERMOST_CHANNEL"
echo ""
echo "4. Workflows aktivieren:"
echo "   - Jeden Workflow öffnen"
echo "   - 'Active' Toggle aktivieren"
echo ""
echo "5. Testen:"
echo "   - Webhook testen:"
echo "     curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"agentId\": \"marketing\", \"message\": \"Test\"}'"
echo ""

echo "✅ Setup abgeschlossen!"
echo ""
echo "📚 Dokumentation:"
echo "   - MATTERMOST_SELBST_GEHOSTET_SETUP.md"
echo "   - MATTERMOST_N8N_INTEGRATION.md"
echo ""

