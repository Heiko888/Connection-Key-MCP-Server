#!/bin/bash

# 🔍 Prüfe Status: Punkt 2 - Event-basierte Automatisierung

echo "🔍 Prüfe Status: Punkt 2 - Event-basierte Automatisierung"
echo ""

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SUCCESS_COUNT=0
FAIL_COUNT=0
WARNING_COUNT=0

# Test 1: User-Registrierung → Reading Webhook
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📤 Test 1: User-Registrierung → Reading Webhook${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

RESPONSE1=$(curl -s -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-status-check",
    "birthDate": "1990-01-01",
    "birthTime": "12:00",
    "birthPlace": "Berlin, Germany"
  }')

HTTP_CODE1=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-status-check",
    "birthDate": "1990-01-01",
    "birthTime": "12:00",
    "birthPlace": "Berlin, Germany"
  }')

echo "HTTP Status: $HTTP_CODE1"
echo "Response: $RESPONSE1" | head -c 200
echo ""
echo ""

if [[ "$HTTP_CODE1" == "200" ]] && ([[ "$RESPONSE1" == *"success"* ]] || [[ "$RESPONSE1" == *"Workflow was started"* ]] || [[ "$RESPONSE1" == *"Welcome reading"* ]]); then
  echo -e "${GREEN}✅ ERFOLG: User-Registrierung → Reading Webhook funktioniert!${NC}"
  ((SUCCESS_COUNT++))
elif [[ "$HTTP_CODE1" == "404" ]]; then
  echo -e "${RED}❌ FEHLER: Workflow nicht aktiviert${NC}"
  echo "   → n8n Workflow 'User Registration → Reading' muss aktiviert werden"
  ((FAIL_COUNT++))
else
  echo -e "${YELLOW}⚠️  UNBEKANNT: HTTP $HTTP_CODE1${NC}"
  echo "   Response: $RESPONSE1"
  ((WARNING_COUNT++))
fi

echo ""
echo ""

# Test 2: Mailchimp → Agent Webhook
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📤 Test 2: Mailchimp → Agent Webhook${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

RESPONSE2=$(curl -s -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed \
  -H "Content-Type: application/json" \
  -d '{
    "type": "subscribe",
    "data": {
      "email": "test-status@example.com",
      "merge_fields": {
        "FNAME": "Test",
        "LNAME": "Status"
      }
    }
  }')

HTTP_CODE2=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed \
  -H "Content-Type: application/json" \
  -d '{
    "type": "subscribe",
    "data": {
      "email": "test-status@example.com",
      "merge_fields": {
        "FNAME": "Test",
        "LNAME": "Status"
      }
    }
  }')

echo "HTTP Status: $HTTP_CODE2"
echo "Response: $RESPONSE2" | head -c 200
echo ""
echo ""

if [[ "$HTTP_CODE2" == "200" ]] && ([[ "$RESPONSE2" == *"success"* ]] || [[ "$RESPONSE2" == *"Workflow was started"* ]] || [[ "$RESPONSE2" == *"Subscriber processed"* ]]); then
  echo -e "${GREEN}✅ ERFOLG: Mailchimp → Agent Webhook funktioniert!${NC}"
  ((SUCCESS_COUNT++))
elif [[ "$HTTP_CODE2" == "404" ]]; then
  echo -e "${RED}❌ FEHLER: Workflow nicht aktiviert${NC}"
  echo "   → n8n Workflow 'Mailchimp Subscriber → ConnectionKey' muss aktiviert werden"
  ((FAIL_COUNT++))
else
  echo -e "${YELLOW}⚠️  UNBEKANNT: HTTP $HTTP_CODE2${NC}"
  echo "   Response: $RESPONSE2"
  ((WARNING_COUNT++))
fi

echo ""
echo ""

# Zusammenfassung
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Status-Zusammenfassung${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${GREEN}✅ Funktioniert: $SUCCESS_COUNT von 2${NC}"
echo -e "${RED}❌ Fehlt/Aktivierung nötig: $FAIL_COUNT von 2${NC}"
if [ $WARNING_COUNT -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Unbekannt: $WARNING_COUNT von 2${NC}"
fi
echo ""

# Detaillierte Status-Übersicht
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📋 Detaillierte Status-Übersicht${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# A) User-Registrierung → Reading
if [[ "$HTTP_CODE1" == "200" ]]; then
  echo -e "${GREEN}✅ A) User-Registrierung → Reading:${NC}"
  echo "   - n8n Workflow: Aktiviert"
  echo "   - Webhook: Funktioniert"
  echo "   - Supabase Migration: (muss manuell geprüft werden)"
  echo ""
else
  echo -e "${RED}❌ A) User-Registrierung → Reading:${NC}"
  echo "   - n8n Workflow: Muss aktiviert werden"
  echo "   - Webhook: Nicht erreichbar (404)"
  echo "   - Supabase Migration: (muss ausgeführt werden)"
  echo ""
fi

# B) Mailchimp → Agent
if [[ "$HTTP_CODE2" == "200" ]]; then
  echo -e "${GREEN}✅ B) Mailchimp → Agent:${NC}"
  echo "   - n8n Workflow: Aktiviert"
  echo "   - Webhook: Funktioniert"
  echo "   - Mailchimp Webhook: (muss in Mailchimp geprüft werden)"
  echo ""
else
  echo -e "${RED}❌ B) Mailchimp → Agent:${NC}"
  echo "   - n8n Workflow: Muss aktiviert werden"
  echo "   - Webhook: Nicht erreichbar (404)"
  echo "   - Mailchimp Webhook: (muss in Mailchimp konfiguriert werden)"
  echo ""
fi

# Was noch zu tun ist
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📋 Was noch zu tun ist${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ "$HTTP_CODE1" != "200" ]]; then
  echo -e "${RED}❌ User-Registrierung → Reading:${NC}"
  echo "   1. n8n öffnen: https://n8n.werdemeisterdeinergedankenagent.de"
  echo "   2. Workflow 'User Registration → Reading' aktivieren (Active = GRÜN)"
  echo "   3. Supabase Migration ausführen: 008_user_registration_trigger.sql"
  echo ""
fi

if [[ "$HTTP_CODE2" != "200" ]]; then
  echo -e "${RED}❌ Mailchimp → Agent:${NC}"
  echo "   1. n8n öffnen: https://n8n.werdemeisterdeinergedankenagent.de"
  echo "   2. Workflow 'Mailchimp Subscriber → ConnectionKey' aktivieren (Active = GRÜN)"
  echo "   3. Mailchimp Webhook konfigurieren (in Mailchimp Dashboard)"
  echo ""
fi

if [[ "$HTTP_CODE1" == "200" ]] && [[ "$HTTP_CODE2" == "200" ]]; then
  echo -e "${GREEN}🎉 Beide Workflows funktionieren!${NC}"
  echo ""
  echo "Optional zu prüfen:"
  echo "   - Supabase Migration ausgeführt? (008_user_registration_trigger.sql)"
  echo "   - Mailchimp Webhook konfiguriert? (in Mailchimp Dashboard)"
fi

echo ""
