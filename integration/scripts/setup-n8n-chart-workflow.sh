#!/bin/bash
# Setup n8n Chart-Berechnungs-Workflow

set -e

N8N_DIR="/opt/mcp-connection-key"
WORKFLOW_FILE="$N8N_DIR/integration/n8n-workflows/chart-calculation-workflow.json"

echo "🔧 Setup n8n Chart-Berechnungs-Workflow"
echo "========================================"
echo ""

# 1. Prüfe ob Workflow-Datei existiert
if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "❌ Workflow-Datei nicht gefunden: $WORKFLOW_FILE"
    echo "   📋 Bitte erstellen Sie die Datei manuell"
    exit 1
fi

echo "✅ Workflow-Datei gefunden: $WORKFLOW_FILE"
echo ""

# 2. Zeige Webhook-URL
echo "📋 Webhook-URL:"
echo "   https://werdemeisterdeinergedankenagent.de/webhook/chart-calculation"
echo "   oder"
echo "   http://138.199.237.34:5678/webhook/chart-calculation"
echo ""

# 3. Test n8n erreichbar
echo "3. Prüfe n8n Erreichbarkeit..."
if curl -s --max-time 2 http://localhost:5678 > /dev/null 2>&1; then
    echo "   ✅ n8n erreichbar"
else
    echo "   ⚠️  n8n nicht erreichbar"
    echo "   📋 Prüfen Sie: docker ps | grep n8n"
fi
echo ""

# 4. Zeige Import-Anleitung
echo "4. Import-Anleitung:"
echo "   📋 1. Öffnen Sie n8n: https://werdemeisterdeinergedankenagent.de"
echo "   📋 2. Klicken Sie auf 'Workflows' → 'Import from File'"
echo "   📋 3. Wählen Sie: $WORKFLOW_FILE"
echo "   📋 4. Klicken Sie auf 'Import'"
echo "   📋 5. Aktivieren Sie den Workflow (Toggle oben rechts)"
echo ""

# 5. Zeige Test-Command
echo "5. Test-Command:"
echo "   curl -X POST http://138.199.237.34:5678/webhook/chart-calculation \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"birthDate\": \"1990-05-15\", \"birthTime\": \"14:30\", \"birthPlace\": \"Berlin, Germany\"}'"
echo ""

echo "========================================"
echo "✅ Setup-Anleitung abgeschlossen!"
echo "========================================"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Importieren Sie den Workflow in n8n"
echo "2. Implementieren Sie die Chart-Berechnungs-Logik im Code Node"
echo "3. Erweitern Sie den Reading Agent (siehe N8N_CHART_CALCULATION_SETUP.md)"
echo ""

