#!/bin/bash

# 🧪 Test: Mattermost Workflows
# Testet beide Mattermost-Workflows nach Aktivierung in n8n

echo "🧪 Teste Mattermost Workflows..."
echo ""

# Farben für Output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Agent → Mattermost
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 Test 1: Agent → Mattermost"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

RESPONSE1=$(curl -s -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "marketing",
    "message": "Test-Nachricht",
    "userId": "test-user"
  }')

echo "Response: $RESPONSE1"
echo ""

if [[ "$RESPONSE1" == *"404"* ]] || [[ "$RESPONSE1" == *"not registered"* ]]; then
  echo -e "${RED}❌ FEHLER: Workflow nicht aktiviert oder HTTP Method = GET${NC}"
  echo "   → Prüfe in n8n: 'Active' Toggle = GRÜN, HTTP Method = POST"
elif [[ "$RESPONSE1" == *"success"* ]] || [[ "$RESPONSE1" == *"Workflow was started"* ]]; then
  echo -e "${GREEN}✅ ERFOLG: Workflow wurde gestartet!${NC}"
else
  echo -e "${YELLOW}⚠️  UNBEKANNT: Unerwartete Response${NC}"
fi

echo ""
echo ""

# Test 2: Reading → Mattermost
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 Test 2: Notification → Mattermost"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

RESPONSE2=$(curl -s -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost \
  -H "Content-Type: application/json" \
  -d '{"text": "Test-Benachrichtigung von n8n", "channel": "#tech"}')

echo "Response: $RESPONSE2"
echo ""

if [[ "$RESPONSE2" == *"404"* ]] || [[ "$RESPONSE2" == *"not registered"* ]]; then
  echo -e "${RED}❌ FEHLER: Workflow nicht aktiviert oder HTTP Method = GET${NC}"
  echo "   → Prüfe in n8n: 'Active' Toggle = GRÜN, HTTP Method = POST"
elif [[ "$RESPONSE2" == *"success"* ]] || [[ "$RESPONSE2" == *"Workflow was started"* ]]; then
  echo -e "${GREEN}✅ ERFOLG: Workflow wurde gestartet!${NC}"
else
  echo -e "${YELLOW}⚠️  UNBEKANNT: Unerwartete Response${NC}"
fi

echo ""
echo ""

# Zusammenfassung
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Zusammenfassung"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

SUCCESS_COUNT=0

if [[ "$RESPONSE1" == *"success"* ]] || [[ "$RESPONSE1" == *"Workflow was started"* ]]; then
  echo -e "${GREEN}✅ Agent → Mattermost: FUNKTIONIERT${NC}"
  ((SUCCESS_COUNT++))
else
  echo -e "${RED}❌ Agent → Mattermost: FEHLER${NC}"
fi

if [[ "$RESPONSE2" == *"success"* ]] || [[ "$RESPONSE2" == *"Workflow was started"* ]]; then
  echo -e "${GREEN}✅ Notification → Mattermost: FUNKTIONIERT${NC}"
  ((SUCCESS_COUNT++))
else
  echo -e "${RED}❌ Notification → Mattermost: FEHLER${NC}"
fi

echo ""
echo "Erfolgreich: $SUCCESS_COUNT von 2"
echo ""
echo "Optional - Logger testen:"
echo "  curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/log \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"message\": \"Test-Log\", \"source\": \"test\", \"status\": \"info\"}'"
echo ""

if [ $SUCCESS_COUNT -eq 2 ]; then
  echo -e "${GREEN}🎉 Alle Mattermost Workflows funktionieren!${NC}"
elif [ $SUCCESS_COUNT -eq 1 ]; then
  echo -e "${YELLOW}⚠️  Ein Workflow funktioniert noch nicht${NC}"
else
  echo -e "${RED}❌ Beide Workflows müssen noch aktiviert werden${NC}"
fi

echo ""
