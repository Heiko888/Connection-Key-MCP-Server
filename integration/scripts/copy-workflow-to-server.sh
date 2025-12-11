#!/bin/bash
# Kopiert Workflow-Datei auf Server (für lokale Ausführung)

set -e

WORKFLOW_FILE="integration/n8n-workflows/chart-calculation-workflow.json"
SERVER="root@138.199.237.34"
SERVER_PATH="/opt/mcp-connection-key/integration/n8n-workflows/"

echo "📤 Kopiere Workflow auf Server"
echo "=============================="
echo ""

# Prüfe ob Datei existiert
if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "❌ Workflow-Datei nicht gefunden: $WORKFLOW_FILE"
    exit 1
fi

echo "✅ Workflow-Datei gefunden: $WORKFLOW_FILE"
echo ""

# Kopiere via SCP
echo "📤 Kopiere auf Server..."
scp "$WORKFLOW_FILE" "$SERVER:$SERVER_PATH"

if [ $? -eq 0 ]; then
    echo "✅ Workflow erfolgreich kopiert!"
    echo ""
    echo "📋 Nächste Schritte:"
    echo "1. Öffnen Sie n8n: https://werdemeisterdeinergedankenagent.de"
    echo "2. Workflows → Import from File"
    echo "3. Wählen Sie: $SERVER_PATH/chart-calculation-workflow.json"
    echo "4. Importieren und aktivieren"
else
    echo "❌ Fehler beim Kopieren"
    echo ""
    echo "📋 Alternative: Nutzen Sie Option 2 aus COPY_WORKFLOW_TO_SERVER.md"
    echo "   (Direkt in n8n hochladen)"
fi

echo ""

