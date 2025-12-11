#!/bin/bash

# 🔍 Prüfe N8N_API_KEY Status

echo "🔍 Prüfe N8N_API_KEY Status"
echo "=========================================="
echo ""

cd /opt/mcp-connection-key

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Prüfe .env
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📄 Prüfe .env Datei${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ ! -f ".env" ]; then
  echo -e "${RED}❌ .env Datei nicht gefunden!${NC}"
  exit 1
fi

if grep -q "^N8N_API_KEY=" .env 2>/dev/null; then
  ENV_KEY=$(grep "^N8N_API_KEY=" .env | cut -d= -f2 | sed 's/^"//;s/"$//')
  if [ ! -z "$ENV_KEY" ] && [ "$ENV_KEY" != "" ]; then
    echo -e "${GREEN}✅ N8N_API_KEY in .env gefunden${NC}"
    echo "   Key: ${ENV_KEY:0:20}...${ENV_KEY: -10}"
    echo ""
  else
    echo -e "${RED}❌ N8N_API_KEY in .env ist leer${NC}"
    exit 1
  fi
else
  echo -e "${RED}❌ N8N_API_KEY nicht in .env gefunden${NC}"
  exit 1
fi

# Prüfe n8n Environment Variables (via API oder manuell)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🔧 n8n Environment Variables${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}⚠️  Manuelle Prüfung erforderlich:${NC}"
echo ""
echo "1. n8n öffnen: https://n8n.werdemeisterdeinergedankenagent.de"
echo "2. Settings → Environment Variables"
echo "3. Prüfe: Ist 'N8N_API_KEY' in der Liste?"
echo ""
echo -e "${BLUE}📋 Falls nicht gesetzt:${NC}"
echo "   - Name: N8N_API_KEY"
echo "   - Value: $ENV_KEY"
echo "   - Save"
echo ""

# Test: Mailchimp Workflow
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🧪 Test: Mailchimp Workflow${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Möchten Sie den Mailchimp Workflow testen? (j/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[JjYy]$ ]]; then
  echo "Teste Mailchimp Webhook..."
  echo ""
  
  RESPONSE=$(curl -s -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed \
    -H "Content-Type: application/json" \
    -d '{
      "type": "subscribe",
      "data": {
        "email": "test-check@example.com",
        "merge_fields": {
          "FNAME": "Test",
          "LNAME": "Check"
        }
      }
    }')
  
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed \
    -H "Content-Type: application/json" \
    -d '{
      "type": "subscribe",
      "data": {
        "email": "test-check@example.com",
        "merge_fields": {
          "FNAME": "Test",
          "LNAME": "Check"
        }
      }
    }')
  
  echo "HTTP Status: $HTTP_CODE"
  echo "Response: $RESPONSE"
  echo ""
  
  if [[ "$HTTP_CODE" == "200" ]]; then
    echo -e "${GREEN}✅ Mailchimp Workflow funktioniert!${NC}"
  elif [[ "$HTTP_CODE" == "404" ]]; then
    echo -e "${RED}❌ Workflow nicht aktiviert (404)${NC}"
    echo "   → n8n Workflow 'Mailchimp Subscriber → ConnectionKey' muss aktiviert werden"
  elif [[ "$HTTP_CODE" == "401" ]] || [[ "$HTTP_CODE" == "403" ]]; then
    echo -e "${RED}❌ Authorization-Fehler (401/403)${NC}"
    echo "   → N8N_API_KEY ist möglicherweise nicht in n8n Environment Variables gesetzt"
  else
    echo -e "${YELLOW}⚠️  Unbekannter Status: HTTP $HTTP_CODE${NC}"
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📋 Zusammenfassung${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}✅ N8N_API_KEY in .env: Gesetzt${NC}"
echo -e "${YELLOW}⚠️  N8N_API_KEY in n8n: Manuell prüfen${NC}"
echo ""
echo "Nächste Schritte:"
echo "1. Prüfe n8n Environment Variables (siehe oben)"
echo "2. Falls nicht gesetzt → Key eintragen"
echo "3. Mailchimp Workflow testen"
echo ""
