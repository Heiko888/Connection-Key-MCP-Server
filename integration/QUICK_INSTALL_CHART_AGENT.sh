#!/bin/bash
# Quick Installation Script für Chart Development Agent auf Hetzner Server
# Führen Sie dieses Script auf dem Hetzner Server aus

set -e

echo "📊 Chart Development Agent - Quick Installation"
echo "================================================"
echo ""

# 1. Repository aktualisieren
echo "1. Aktualisiere Repository..."
cd /opt/mcp-connection-key
git pull origin main
echo "   ✅ Repository aktualisiert"
echo ""

# 2. Installations-Script ausführen
echo "2. Führe Installations-Script aus..."
if [ -f "integration/install-chart-agent.sh" ]; then
    chmod +x integration/install-chart-agent.sh
    ./integration/install-chart-agent.sh
else
    echo "   ❌ integration/install-chart-agent.sh nicht gefunden!"
    echo "   Bitte führen Sie die manuelle Installation durch (siehe INSTALL_CHART_AGENT_HETZNER.md)"
    exit 1
fi

echo ""
echo "================================================"
echo "✅ Installation abgeschlossen!"
echo "================================================"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Prüfe Agent: curl http://localhost:7000/agents | grep chart-development"
echo "2. Teste Agent: curl -X POST http://localhost:7000/agent/chart-development \\"
echo "   -H 'Content-Type: application/json' \\"
echo "   -d '{\"message\":\"Test\"}'"
echo ""

