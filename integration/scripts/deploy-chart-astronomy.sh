#!/bin/bash
# Deployment-Script für Chart-Berechnung mit astronomy-engine
# Kopiert Dateien auf Server und führt Setup aus

set -e

SERVER="root@138.199.237.34"
REMOTE_DIR="/opt/mcp-connection-key"
LOCAL_SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 Deploy Chart-Berechnung mit astronomy-engine"
echo "================================================"
echo ""

# 1. Kopiere Dateien auf Server
echo "1. Kopiere Dateien auf Server..."
scp "$LOCAL_SCRIPT_DIR/chart-calculation-astronomy.js" "$SERVER:$REMOTE_DIR/integration/scripts/"
scp "$LOCAL_SCRIPT_DIR/setup-chart-astronomy.sh" "$SERVER:$REMOTE_DIR/integration/scripts/"
echo "   ✅ Dateien kopiert"

# 2. Führe Setup auf Server aus
echo ""
echo "2. Führe Setup auf Server aus..."
ssh "$SERVER" "cd $REMOTE_DIR && chmod +x integration/scripts/setup-chart-astronomy.sh && integration/scripts/setup-chart-astronomy.sh"

echo ""
echo "✅ Deployment abgeschlossen!"
echo ""
echo "📋 Teste Chart-Berechnung:"
echo "   ssh $SERVER"
echo "   curl -X POST http://localhost:7000/chart/calculate \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"birthDate\": \"1990-05-15\", \"birthTime\": \"14:30\", \"birthPlace\": \"Berlin, Germany\"}'"

