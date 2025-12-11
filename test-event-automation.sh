#!/bin/bash

# 🧪 Test: Event-basierte Automatisierung
# Testet User-Registrierung → Reading und Mailchimp → Agent

echo "🧪 Teste Event-basierte Automatisierung..."
echo ""

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SUCCESS_COUNT=0
FAIL_COUNT=0

# Test 1: User-Registrierung → Reading
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📤 Test 1: User-Registrierung → Reading${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

RESPONSE1=$(curl -s -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "birthDate": "1990-01-01",
    "birthTime": "12:00",
    "birthPlace": "Berlin, Germany"
  }')

HTTP_CODE1=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "birthDate": "1990-01-01",
    "birthTime": "12:00",
    "birthPlace": "Berlin, Germany"
  }')

echo "HTTP Status: $HTTP_CODE1"
echo "Response: $RESPONSE1" | head -c 300
echo ""
echo ""

if [[ "$HTTP_CODE1" == "200" ]] && ([[ "$RESPONSE1" == *"success"* ]] || [[ "$RESPONSE1" == *"Workflow was started"* ]] || [[ "$RESPONSE1" == *"Welcome reading"* ]]); then
  echo -e "${GREEN}✅ ERFOLG: User-Registrierung → Reading funktioniert!${NC}"
  ((SUCCESS_COUNT++))
elif [[ "$HTTP_CODE1" == "404" ]]; then
  echo -e "${RED}❌ FEHLER: Workflow nicht aktiviert oder HTTP Method = GET${NC}"
  echo "   → Prüfe in n8n: 'Active' Toggle = GRÜN, HTTP Method = POST"
  ((FAIL_COUNT++))
else
  echo -e "${YELLOW}⚠️  UNBEKANNT: HTTP $HTTP_CODE1${NC}"
  echo "   Response: $RESPONSE1"
  ((FAIL_COUNT++))
fi

echo ""
echo ""

# Test 2: Mailchimp → Agent
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📤 Test 2: Mailchimp → Agent${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

RESPONSE2=$(curl -s -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed \
  -H "Content-Type: application/json" \
  -d '{
    "type": "subscribe",
    "data": {
      "email": "test@example.com",
      "merge_fields": {
        "FNAME": "Test",
        "LNAME": "User"
      }
    }
  }')

HTTP_CODE2=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed \
  -H "Content-Type: application/json" \
  -d '{
    "type": "subscribe",
    "data": {
      "email": "test@example.com",
      "merge_fields": {
        "FNAME": "Test",
        "LNAME": "User"
      }
    }
  }')

echo "HTTP Status: $HTTP_CODE2"
echo "Response: $RESPONSE2" | head -c 300
echo ""
echo ""

if [[ "$HTTP_CODE2" == "200" ]] && ([[ "$RESPONSE2" == *"success"* ]] || [[ "$RESPONSE2" == *"Workflow was started"* ]] || [[ "$RESPONSE2" == *"Subscriber processed"* ]]); then
  echo -e "${GREEN}✅ ERFOLG: Mailchimp → Agent funktioniert!${NC}"
  ((SUCCESS_COUNT++))
elif [[ "$HTTP_CODE2" == "404" ]]; then
  echo -e "${RED}❌ FEHLER: Workflow nicht aktiviert oder HTTP Method = GET${NC}"
  echo "   → Prüfe in n8n: 'Active' Toggle = GRÜN, HTTP Method = POST"
  ((FAIL_COUNT++))
else
  echo -e "${YELLOW}⚠️  UNBEKANNT: HTTP $HTTP_CODE2${NC}"
  echo "   Response: $RESPONSE2"
  ((FAIL_COUNT++))
fi

echo ""
echo ""

# Zusammenfassung
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Zusammenfassung${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${GREEN}✅ Erfolgreich: $SUCCESS_COUNT von 2${NC}"
echo -e "${RED}❌ Fehlgeschlagen: $FAIL_COUNT von 2${NC}"
echo ""

if [ $SUCCESS_COUNT -eq 2 ]; then
  echo -e "${GREEN}🎉 Beide Event-Automatisierungen funktionieren!${NC}"
elif [ $SUCCESS_COUNT -eq 1 ]; then
  echo -e "${YELLOW}⚠️  Eine Automatisierung funktioniert noch nicht${NC}"
else
  echo -e "${RED}❌ Beide Automatisierungen müssen noch aktiviert werden${NC}"
fi

echo ""
