#!/bin/bash

# 🔍 Prüfe n8n Verbindung und API

echo "🔍 Prüfe n8n Verbindung und API"
echo "=========================================="
echo ""

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cd /opt/mcp-connection-key

# Prüfe .env
if [ ! -f ".env" ]; then
  echo -e "${RED}❌ .env Datei nicht gefunden!${NC}"
  exit 1
fi

# Lade Environment Variables
source .env 2>/dev/null || true

# n8n URL
N8N_URL="${N8N_WEBHOOK_URL:-https://n8n.werdemeisterdeinergedankenagent.de}"
N8N_BASE_URL="${N8N_BASE_URL:-$N8N_URL}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📡 n8n Verbindung prüfen${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "n8n URL: $N8N_URL"
echo ""

# Test 1: n8n erreichbar?
echo -e "${BLUE}Test 1: n8n erreichbar?${NC}"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$N8N_URL" --max-time 10)

if [[ "$HTTP_CODE" == "200" ]] || [[ "$HTTP_CODE" == "401" ]] || [[ "$HTTP_CODE" == "302" ]]; then
  echo -e "${GREEN}✅ n8n ist erreichbar (HTTP $HTTP_CODE)${NC}"
else
  echo -e "${RED}❌ n8n ist nicht erreichbar (HTTP $HTTP_CODE)${NC}"
  echo "   → Prüfe URL: $N8N_URL"
  exit 1
fi

echo ""

# Test 2: Webhook funktioniert?
echo -e "${BLUE}Test 2: Webhook funktioniert?${NC}"
WEBHOOK_URL="$N8N_URL/webhook/user-registered"

RESPONSE=$(curl -s -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-connection","birthDate":"1990-01-01","birthTime":"12:00","birthPlace":"Berlin"}' \
  --max-time 10)

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-connection","birthDate":"1990-01-01","birthTime":"12:00","birthPlace":"Berlin"}' \
  --max-time 10)

echo "HTTP Status: $HTTP_CODE"
echo "Response: $RESPONSE" | head -c 200
echo ""
echo ""

if [[ "$HTTP_CODE" == "200" ]]; then
  echo -e "${GREEN}✅ Webhook funktioniert!${NC}"
elif [[ "$HTTP_CODE" == "404" ]]; then
  echo -e "${RED}❌ Webhook nicht gefunden (404)${NC}"
  echo "   → Workflow muss aktiviert sein"
else
  echo -e "${YELLOW}⚠️  Unbekannter Status: HTTP $HTTP_CODE${NC}"
fi

echo ""

# Test 3: N8N_API_KEY prüfen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🔑 N8N_API_KEY Status${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if grep -q "^N8N_API_KEY=" .env 2>/dev/null; then
  KEY_COUNT=$(grep -c "^N8N_API_KEY=" .env)
  if [ "$KEY_COUNT" -eq 1 ]; then
    ENV_KEY=$(grep "^N8N_API_KEY=" .env | cut -d= -f2 | sed 's/^"//;s/"$//')
    echo -e "${GREEN}✅ N8N_API_KEY in .env: Gesetzt${NC}"
    echo "   Key: ${ENV_KEY:0:20}...${ENV_KEY: -10}"
    echo ""
    echo -e "${YELLOW}⚠️  Prüfe in n8n Environment Variables:${NC}"
    echo "   1. n8n öffnen: $N8N_URL"
    echo "   2. Settings → Environment Variables"
    echo "   3. Prüfe: Ist 'N8N_API_KEY' eingetragen?"
  elif [ "$KEY_COUNT" -gt 1 ]; then
    echo -e "${RED}❌ N8N_API_KEY ist mehrfach in .env!${NC}"
    echo "   Gefundene Zeilen: $KEY_COUNT"
    echo ""
    echo "   Fix:"
    echo "   grep -n 'N8N_API_KEY' .env"
    echo "   # Dann eine Zeile entfernen"
  fi
else
  echo -e "${RED}❌ N8N_API_KEY nicht in .env gefunden${NC}"
fi

echo ""

# Test 4: Mailchimp Workflow testen (mit N8N_API_KEY)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🧪 Test 3: Mailchimp Workflow (mit N8N_API_KEY)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

read -p "Möchten Sie den Mailchimp Workflow testen? (j/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[JjYy]$ ]]; then
  MAILCHIMP_WEBHOOK="$N8N_URL/webhook/mailchimp-confirmed"
  
  RESPONSE=$(curl -s -X POST "$MAILCHIMP_WEBHOOK" \
    -H "Content-Type: application/json" \
    -d '{
      "type": "subscribe",
      "data": {
        "email": "test-connection@example.com",
        "merge_fields": {
          "FNAME": "Test",
          "LNAME": "Connection"
        }
      }
    }' \
    --max-time 10)
  
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$MAILCHIMP_WEBHOOK" \
    -H "Content-Type: application/json" \
    -d '{
      "type": "subscribe",
      "data": {
        "email": "test-connection@example.com",
        "merge_fields": {
          "FNAME": "Test",
          "LNAME": "Connection"
        }
      }
    }' \
    --max-time 10)
  
  echo "HTTP Status: $HTTP_CODE"
  echo "Response: $RESPONSE" | head -c 200
  echo ""
  echo ""
  
  if [[ "$HTTP_CODE" == "200" ]]; then
    echo -e "${GREEN}✅ Mailchimp Workflow funktioniert!${NC}"
    echo "   → N8N_API_KEY wird wahrscheinlich korrekt verwendet"
  elif [[ "$HTTP_CODE" == "401" ]] || [[ "$HTTP_CODE" == "403" ]]; then
    echo -e "${RED}❌ Authorization-Fehler (401/403)${NC}"
    echo "   → N8N_API_KEY ist möglicherweise nicht in n8n Environment Variables gesetzt"
    echo "   → Oder falscher Key"
  elif [[ "$HTTP_CODE" == "404" ]]; then
    echo -e "${RED}❌ Workflow nicht aktiviert (404)${NC}"
  else
    echo -e "${YELLOW}⚠️  Unbekannter Status: HTTP $HTTP_CODE${NC}"
  fi
fi

echo ""

# Zusammenfassung
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Zusammenfassung${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "n8n Verbindung:"
if [[ "$HTTP_CODE" == "200" ]] || [[ "$HTTP_CODE" == "401" ]] || [[ "$HTTP_CODE" == "302" ]]; then
  echo -e "${GREEN}✅ n8n ist erreichbar${NC}"
else
  echo -e "${RED}❌ n8n ist nicht erreichbar${NC}"
fi

echo ""
echo "Nächste Schritte:"
echo "1. Prüfe n8n Environment Variables (N8N_API_KEY)"
echo "2. Falls Mailchimp Workflow 401/403 → Key in n8n eintragen"
echo "3. Falls Webhook 404 → Workflow aktivieren"
echo ""
