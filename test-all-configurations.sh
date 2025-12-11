#!/bin/bash

# 🧪 Test: Alle 4 Konfigurationen
# Testet Scheduled, Event-basierte Automatisierung, Environment Variables, Supabase

echo "🧪 Teste alle Konfigurationen..."
echo ""

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SUCCESS_COUNT=0
FAIL_COUNT=0

# Test 1: Scheduled Workflow (nur prüfen ob aktiviert)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📤 Test 1: Scheduled Workflow (manuell prüfen)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  Manuell in n8n prüfen:"
echo "   1. Workflow 'Scheduled Agent Reports → Mattermost' öffnen"
echo "   2. Prüfe: Active = GRÜN"
echo "   3. Prüfe: Schedule Trigger = '0 9 * * *' (täglich 9:00)"
echo ""
echo -e "${YELLOW}⚠️  Manueller Test erforderlich${NC}"
echo ""

# Test 2: User-Registrierung Webhook
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📤 Test 2: User-Registrierung → Reading Webhook${NC}"
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
echo "Response: $RESPONSE1" | head -c 200
echo ""
echo ""

if [[ "$HTTP_CODE1" == "200" ]] && [[ "$RESPONSE1" == *"success"* ]] || [[ "$RESPONSE1" == *"Workflow was started"* ]]; then
  echo -e "${GREEN}✅ ERFOLG: User-Registrierung Webhook funktioniert!${NC}"
  ((SUCCESS_COUNT++))
else
  echo -e "${RED}❌ FEHLER: User-Registrierung Webhook${NC}"
  echo "   → Prüfe: Workflow aktiviert? HTTP Method = POST?"
  ((FAIL_COUNT++))
fi

echo ""
echo ""

# Test 3: Mailchimp Webhook
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📤 Test 3: Mailchimp → Agent Webhook${NC}"
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
echo "Response: $RESPONSE2" | head -c 200
echo ""
echo ""

if [[ "$HTTP_CODE2" == "200" ]] && [[ "$RESPONSE2" == *"success"* ]] || [[ "$RESPONSE2" == *"Workflow was started"* ]]; then
  echo -e "${GREEN}✅ ERFOLG: Mailchimp Webhook funktioniert!${NC}"
  ((SUCCESS_COUNT++))
else
  echo -e "${RED}❌ FEHLER: Mailchimp Webhook${NC}"
  echo "   → Prüfe: Workflow aktiviert? HTTP Method = POST?"
  ((FAIL_COUNT++))
fi

echo ""
echo ""

# Test 4: Environment Variables
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📤 Test 4: Environment Variables${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "check-env-variables.sh" ]; then
  chmod +x check-env-variables.sh
  if ./check-env-variables.sh .env 2>/dev/null; then
    echo -e "${GREEN}✅ ERFOLG: Environment Variables OK!${NC}"
    ((SUCCESS_COUNT++))
  else
    echo -e "${RED}❌ FEHLER: Environment Variables fehlen${NC}"
    ((FAIL_COUNT++))
  fi
else
  echo -e "${YELLOW}⚠️  check-env-variables.sh nicht gefunden${NC}"
  echo "   → Manuell prüfen: ./check-env-variables.sh .env"
fi

echo ""
echo ""

# Test 5: Supabase (nur prüfen ob URL gesetzt)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📤 Test 5: Supabase Konfiguration${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f ".env" ]; then
  if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env && grep -q "SUPABASE_SERVICE_ROLE_KEY" .env; then
    SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env | cut -d'=' -f2 | sed 's/^"//;s/"$//')
    if [ -n "$SUPABASE_URL" ] && [ "$SUPABASE_URL" != "" ]; then
      echo -e "${GREEN}✅ ERFOLG: Supabase Environment Variables gesetzt${NC}"
      echo "   URL: ${SUPABASE_URL:0:30}..."
      ((SUCCESS_COUNT++))
    else
      echo -e "${RED}❌ FEHLER: Supabase URL ist leer${NC}"
      ((FAIL_COUNT++))
    fi
  else
    echo -e "${YELLOW}⚠️  Supabase Environment Variables nicht gefunden${NC}"
    echo "   → Optional, aber empfohlen für Reading-Speicherung"
  fi
else
  echo -e "${RED}❌ .env Datei nicht gefunden${NC}"
  ((FAIL_COUNT++))
fi

echo ""
echo ""

# Zusammenfassung
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Zusammenfassung${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${GREEN}✅ Erfolgreich: $SUCCESS_COUNT von 5${NC}"
echo -e "${RED}❌ Fehlgeschlagen: $FAIL_COUNT von 5${NC}"
echo ""

if [ $SUCCESS_COUNT -eq 5 ]; then
  echo -e "${GREEN}🎉 Alle Konfigurationen funktionieren!${NC}"
elif [ $SUCCESS_COUNT -ge 3 ]; then
  echo -e "${YELLOW}⚠️  Die meisten Konfigurationen funktionieren${NC}"
else
  echo -e "${RED}❌ Mehrere Konfigurationen haben Probleme${NC}"
fi

echo ""
