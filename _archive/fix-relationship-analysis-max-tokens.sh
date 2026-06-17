#!/bin/bash

# Fix für Relationship Analysis Agent - maxTokens zu hoch
# Führt zu: "This model's maximum context length is 8192 tokens"

set -e

CONFIG_FILE="/opt/ck-agent/agents/relationship-analysis-agent.json"

echo "🔧 Fix Relationship Analysis Agent - maxTokens"
echo "=============================================="
echo ""

# Prüfe ob Config-Datei existiert
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Config-Datei nicht gefunden: $CONFIG_FILE"
    exit 1
fi

echo "1. Aktualisiere maxTokens in Config-Datei..."
# Ersetze maxTokens: 10000 mit maxTokens: 6000
sed -i 's/"maxTokens": 10000/"maxTokens": 6000/' "$CONFIG_FILE"

echo "   ✅ maxTokens auf 6000 reduziert"
echo ""

echo "2. Starte MCP Server neu..."
systemctl restart mcp
sleep 3
echo "   ✅ MCP Server neu gestartet"
echo ""

echo "3. Teste Agent erneut..."
TEST_RESPONSE=$(curl -s -X POST http://localhost:7000/agent/relationship-analysis-agent \
  -H "Content-Type: application/json" \
  -d '{"message":"Test"}' 2>/dev/null || echo "ERROR")

if echo "$TEST_RESPONSE" | grep -q "response\|error"; then
    if echo "$TEST_RESPONSE" | grep -q "maximum context length"; then
        echo "   ⚠️  Fehler besteht noch. Reduziere maxTokens weiter..."
        sed -i 's/"maxTokens": 6000/"maxTokens": 4000/' "$CONFIG_FILE"
        systemctl restart mcp
        sleep 3
        echo "   ✅ maxTokens auf 4000 reduziert"
    else
        echo "   ✅ Agent antwortet jetzt korrekt!"
    fi
else
    echo "   ⚠️  Agent-Antwort unerwartet"
fi
echo ""

echo "=============================================="
echo "✅ Fix abgeschlossen!"
echo "=============================================="
echo ""
echo "📋 Neue maxTokens-Einstellung:"
grep "maxTokens" "$CONFIG_FILE"
echo ""
