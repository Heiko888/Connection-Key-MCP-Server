#!/bin/bash
# Multi-Agent Pipeline Script
# Führt mehrere Agenten in Sequenz aus

set -e

MCP_SERVER="http://138.199.237.34:7000"
TOPIC="${1:-Standard-Topic}"

echo "🚀 Multi-Agent Pipeline"
echo "======================="
echo "Thema: $TOPIC"
echo ""

# 1. Marketing Agent - Strategie
echo "1️⃣ Marketing Agent: Erstelle Strategie..."
MARKETING_RESPONSE=$(curl -s -X POST "$MCP_SERVER/agent/marketing" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Erstelle Marketing-Strategie für: $TOPIC\"}")

if [ $? -ne 0 ]; then
    echo "❌ Marketing Agent Fehler"
    exit 1
fi

MARKETING_STRATEGY=$(echo $MARKETING_RESPONSE | jq -r '.response // .message // "Keine Antwort"')
echo "✅ Strategie erstellt (${#MARKETING_STRATEGY} Zeichen)"
echo ""

# 2. Social-YouTube Agent - Content
echo "2️⃣ Social-YouTube Agent: Erstelle Content..."
SOCIAL_RESPONSE=$(curl -s -X POST "$MCP_SERVER/agent/social-youtube" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Erstelle Social Media Content basierend auf dieser Strategie: $MARKETING_STRATEGY\"}")

if [ $? -ne 0 ]; then
    echo "❌ Social-YouTube Agent Fehler"
    exit 1
fi

SOCIAL_CONTENT=$(echo $SOCIAL_RESPONSE | jq -r '.response // .message // "Keine Antwort"')
echo "✅ Content erstellt (${#SOCIAL_CONTENT} Zeichen)"
echo ""

# 3. Automation Agent - Workflow
echo "3️⃣ Automation Agent: Erstelle Automatisierung..."
AUTOMATION_RESPONSE=$(curl -s -X POST "$MCP_SERVER/agent/automation" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Erstelle n8n Workflow für automatische Content-Verteilung\"}")

if [ $? -ne 0 ]; then
    echo "❌ Automation Agent Fehler"
    exit 1
fi

AUTOMATION_WORKFLOW=$(echo $AUTOMATION_RESPONSE | jq -r '.response // .message // "Keine Antwort"')
echo "✅ Automatisierung erstellt (${#AUTOMATION_WORKFLOW} Zeichen)"
echo ""

# Zusammenfassung
echo "========================================="
echo "✅ Pipeline abgeschlossen!"
echo "========================================="
echo ""
echo "📊 Ergebnisse:"
echo "   Marketing-Strategie: ${#MARKETING_STRATEGY} Zeichen"
echo "   Social-Content: ${#SOCIAL_CONTENT} Zeichen"
echo "   Automation-Workflow: ${#AUTOMATION_WORKFLOW} Zeichen"
echo ""
echo "💾 Speichere Ergebnisse..."
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
mkdir -p /var/log/agent-pipelines
echo "$MARKETING_RESPONSE" > "/var/log/agent-pipelines/marketing-$TIMESTAMP.json"
echo "$SOCIAL_RESPONSE" > "/var/log/agent-pipelines/social-$TIMESTAMP.json"
echo "$AUTOMATION_RESPONSE" > "/var/log/agent-pipelines/automation-$TIMESTAMP.json"
echo "✅ Ergebnisse gespeichert in /var/log/agent-pipelines/"
echo ""

