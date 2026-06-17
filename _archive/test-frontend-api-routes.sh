#!/bin/bash

# 🧪 Test: Frontend API Routes
# Testet alle API-Routes, die vom Frontend verwendet werden

echo "🧪 Teste Frontend API Routes..."
echo ""

# Farben für Output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL (anpassen falls nötig)
BASE_URL="${FRONTEND_URL:-http://localhost:3000}"

echo "Base URL: $BASE_URL"
echo ""

SUCCESS_COUNT=0
FAIL_COUNT=0

# Test 1: Marketing Agent
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📤 Test 1: Marketing Agent API${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

RESPONSE1=$(curl -s -X POST "$BASE_URL/api/agents/marketing" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle 5 Social Media Posts über Manifestation",
    "userId": "test-user"
  }')

HTTP_CODE1=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/agents/marketing" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle 5 Social Media Posts über Manifestation",
    "userId": "test-user"
  }')

echo "HTTP Status: $HTTP_CODE1"
echo "Response: $RESPONSE1" | head -c 200
echo ""
echo ""

if [[ "$HTTP_CODE1" == "200" ]] && [[ "$RESPONSE1" == *"success"* ]] || [[ "$RESPONSE1" == *"response"* ]]; then
  echo -e "${GREEN}✅ ERFOLG: Marketing Agent API funktioniert!${NC}"
  ((SUCCESS_COUNT++))
else
  echo -e "${RED}❌ FEHLER: Marketing Agent API${NC}"
  ((FAIL_COUNT++))
fi

echo ""
echo ""

# Test 2: Sales Agent
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📤 Test 2: Sales Agent API${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

RESPONSE2=$(curl -s -X POST "$BASE_URL/api/agents/sales" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle einen Sales-Pitch für Human Design Coaching",
    "userId": "test-user"
  }')

HTTP_CODE2=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/agents/sales" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle einen Sales-Pitch für Human Design Coaching",
    "userId": "test-user"
  }')

echo "HTTP Status: $HTTP_CODE2"
echo "Response: $RESPONSE2" | head -c 200
echo ""
echo ""

if [[ "$HTTP_CODE2" == "200" ]] && [[ "$RESPONSE2" == *"success"* ]] || [[ "$RESPONSE2" == *"response"* ]]; then
  echo -e "${GREEN}✅ ERFOLG: Sales Agent API funktioniert!${NC}"
  ((SUCCESS_COUNT++))
else
  echo -e "${RED}❌ FEHLER: Sales Agent API${NC}"
  ((FAIL_COUNT++))
fi

echo ""
echo ""

# Test 3: Social-YouTube Agent
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📤 Test 3: Social-YouTube Agent API${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

RESPONSE3=$(curl -s -X POST "$BASE_URL/api/agents/social-youtube" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle 3 YouTube-Video-Ideen über Human Design",
    "userId": "test-user"
  }')

HTTP_CODE3=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/agents/social-youtube" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle 3 YouTube-Video-Ideen über Human Design",
    "userId": "test-user"
  }')

echo "HTTP Status: $HTTP_CODE3"
echo "Response: $RESPONSE3" | head -c 200
echo ""
echo ""

if [[ "$HTTP_CODE3" == "200" ]] && [[ "$RESPONSE3" == *"success"* ]] || [[ "$RESPONSE3" == *"response"* ]]; then
  echo -e "${GREEN}✅ ERFOLG: Social-YouTube Agent API funktioniert!${NC}"
  ((SUCCESS_COUNT++))
else
  echo -e "${RED}❌ FEHLER: Social-YouTube Agent API${NC}"
  ((FAIL_COUNT++))
fi

echo ""
echo ""

# Test 4: Automation Agent
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📤 Test 4: Automation Agent API${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

RESPONSE4=$(curl -s -X POST "$BASE_URL/api/agents/automation" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle einen Automatisierungsplan für Newsletter-Versand",
    "userId": "test-user"
  }')

HTTP_CODE4=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/agents/automation" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle einen Automatisierungsplan für Newsletter-Versand",
    "userId": "test-user"
  }')

echo "HTTP Status: $HTTP_CODE4"
echo "Response: $RESPONSE4" | head -c 200
echo ""
echo ""

if [[ "$HTTP_CODE4" == "200" ]] && [[ "$RESPONSE4" == *"success"* ]] || [[ "$RESPONSE4" == *"response"* ]]; then
  echo -e "${GREEN}✅ ERFOLG: Automation Agent API funktioniert!${NC}"
  ((SUCCESS_COUNT++))
else
  echo -e "${RED}❌ FEHLER: Automation Agent API${NC}"
  ((FAIL_COUNT++))
fi

echo ""
echo ""

# Test 5: Chart Development Agent
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📤 Test 5: Chart Development Agent API${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

RESPONSE5=$(curl -s -X POST "$BASE_URL/api/agents/chart-development" \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-01-01",
    "birthTime": "12:00",
    "birthPlace": "Berlin, Germany",
    "userId": "test-user"
  }')

HTTP_CODE5=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/agents/chart-development" \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-01-01",
    "birthTime": "12:00",
    "birthPlace": "Berlin, Germany",
    "userId": "test-user"
  }')

echo "HTTP Status: $HTTP_CODE5"
echo "Response: $RESPONSE5" | head -c 200
echo ""
echo ""

if [[ "$HTTP_CODE5" == "200" ]] && [[ "$RESPONSE5" == *"success"* ]] || [[ "$RESPONSE5" == *"chart"* ]] || [[ "$RESPONSE5" == *"response"* ]]; then
  echo -e "${GREEN}✅ ERFOLG: Chart Development Agent API funktioniert!${NC}"
  ((SUCCESS_COUNT++))
else
  echo -e "${RED}❌ FEHLER: Chart Development Agent API${NC}"
  ((FAIL_COUNT++))
fi

echo ""
echo ""

# Test 6: Reading Generation API
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📤 Test 6: Reading Generation API${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

RESPONSE6=$(curl -s -X POST "$BASE_URL/api/reading/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-01-01",
    "birthTime": "12:00",
    "birthPlace": "Berlin, Germany",
    "readingType": "detailed",
    "userId": "test-user"
  }')

HTTP_CODE6=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/reading/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-01-01",
    "birthTime": "12:00",
    "birthPlace": "Berlin, Germany",
    "readingType": "detailed",
    "userId": "test-user"
  }')

echo "HTTP Status: $HTTP_CODE6"
echo "Response: $RESPONSE6" | head -c 200
echo ""
echo ""

if [[ "$HTTP_CODE6" == "200" ]] && [[ "$RESPONSE6" == *"success"* ]] || [[ "$RESPONSE6" == *"reading"* ]] || [[ "$RESPONSE6" == *"readingId"* ]]; then
  echo -e "${GREEN}✅ ERFOLG: Reading Generation API funktioniert!${NC}"
  ((SUCCESS_COUNT++))
else
  echo -e "${RED}❌ FEHLER: Reading Generation API${NC}"
  ((FAIL_COUNT++))
fi

echo ""
echo ""

# Zusammenfassung
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Zusammenfassung${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${GREEN}✅ Erfolgreich: $SUCCESS_COUNT von 6${NC}"
echo -e "${RED}❌ Fehlgeschlagen: $FAIL_COUNT von 6${NC}"
echo ""

if [ $SUCCESS_COUNT -eq 6 ]; then
  echo -e "${GREEN}🎉 Alle Frontend API Routes funktionieren!${NC}"
elif [ $SUCCESS_COUNT -ge 4 ]; then
  echo -e "${YELLOW}⚠️  Die meisten API Routes funktionieren${NC}"
else
  echo -e "${RED}❌ Mehrere API Routes haben Probleme${NC}"
fi

echo ""
