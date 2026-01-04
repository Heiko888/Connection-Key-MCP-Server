#!/bin/bash
# Prueft lokale Aenderungen an reading-generation-workflow.json auf dem Hetzner-Server

echo "========================================"
echo "Pruefe lokale Aenderungen auf Server"
echo "========================================"
echo ""

cd /opt/mcp-connection-key || exit 1

echo "[INFO] Aktueller Branch:"
git branch --show-current
echo ""

echo "[INFO] Status der Datei:"
git status n8n-workflows/reading-generation-workflow.json
echo ""

echo "[INFO] Lokale Aenderungen (diff):"
git diff n8n-workflows/reading-generation-workflow.json
echo ""

echo "[INFO] Remote-Version (was kommt vom Pull):"
git diff HEAD origin/feature/reading-agent-option-a-complete -- n8n-workflows/reading-generation-workflow.json
echo ""

echo "[INFO] Zusammenfassung:"
echo "  - Lokale Aenderungen: $(git diff --stat n8n-workflows/reading-generation-workflow.json | tail -1)"
echo "  - Remote Aenderungen: $(git diff --stat HEAD origin/feature/reading-agent-option-a-complete -- n8n-workflows/reading-generation-workflow.json | tail -1)"
echo ""

echo "========================================"
echo "Optionen:"
echo "========================================"
echo "1. Lokale Aenderungen behalten (stash):"
echo "   git stash"
echo "   git pull origin feature/reading-agent-option-a-complete"
echo "   git stash pop"
echo ""
echo "2. Lokale Aenderungen verwerfen (Remote-Version verwenden):"
echo "   git checkout -- n8n-workflows/reading-generation-workflow.json"
echo "   git pull origin feature/reading-agent-option-a-complete"
echo ""
echo "3. Lokale Aenderungen committen (dann merge):"
echo "   git add n8n-workflows/reading-generation-workflow.json"
echo "   git commit -m 'Local changes to workflow'"
echo "   git pull origin feature/reading-agent-option-a-complete"
echo ""

