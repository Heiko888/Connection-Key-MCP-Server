#!/bin/bash

# 🔍 Prüfe Frontend Integration

echo "🔍 Prüfe Frontend Integration"
echo "=========================================="
echo ""

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cd /opt/mcp-connection-key

SUCCESS_COUNT=0
FAIL_COUNT=0

# Prüfe Next.js läuft
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📡 Next.js Status${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Prüfe PM2
if command -v pm2 &> /dev/null; then
  PM2_NEXT=$(pm2 list | grep -i "next" || echo "")
  if [ ! -z "$PM2_NEXT" ]; then
    echo -e "${GREEN}✅ Next.js läuft (PM2)${NC}"
    pm2 list | grep -i "next"
    ((SUCCESS_COUNT++))
  else
    echo -e "${YELLOW}⚠️  Next.js nicht in PM2 gefunden${NC}"
  fi
fi

# Prüfe Port 3000
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --max-time 2 | grep -q "200\|301\|302"; then
  echo -e "${GREEN}✅ Next.js läuft auf Port 3000${NC}"
  ((SUCCESS_COUNT++))
else
  echo -e "${RED}❌ Next.js nicht auf Port 3000 erreichbar${NC}"
  ((FAIL_COUNT++))
fi

echo ""

# Prüfe Frontend .env.local
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📄 Frontend Environment Variables${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

FRONTEND_ENV="integration/frontend/.env.local"

if [ -f "$FRONTEND_ENV" ]; then
  echo -e "${GREEN}✅ Frontend .env.local gefunden${NC}"
  echo ""
  
  # MCP_SERVER_URL
  if grep -q "^MCP_SERVER_URL=" "$FRONTEND_ENV" 2>/dev/null; then
    MCP_URL=$(grep "^MCP_SERVER_URL=" "$FRONTEND_ENV" | cut -d= -f2 | sed 's/^"//;s/"$//')
    echo -e "${GREEN}✅ MCP_SERVER_URL: $MCP_URL${NC}"
    ((SUCCESS_COUNT++))
  else
    echo -e "${YELLOW}⚠️  MCP_SERVER_URL nicht in Frontend .env.local${NC}"
    echo "   → API Routes benötigen MCP_SERVER_URL"
    ((FAIL_COUNT++))
  fi
  
  # NEXT_PUBLIC_SUPABASE_URL
  if grep -q "^NEXT_PUBLIC_SUPABASE_URL=" "$FRONTEND_ENV" 2>/dev/null; then
    SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" "$FRONTEND_ENV" | cut -d= -f2 | sed 's/^"//;s/"$//')
    echo -e "${GREEN}✅ NEXT_PUBLIC_SUPABASE_URL: $SUPABASE_URL${NC}"
    ((SUCCESS_COUNT++))
  else
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_SUPABASE_URL nicht in Frontend .env.local${NC}"
    echo "   → Optional, aber empfohlen für Supabase Client"
  fi
  
  # NEXT_PUBLIC_SUPABASE_ANON_KEY
  if grep -q "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" "$FRONTEND_ENV" 2>/dev/null; then
    echo -e "${GREEN}✅ NEXT_PUBLIC_SUPABASE_ANON_KEY gesetzt${NC}"
    ((SUCCESS_COUNT++))
  else
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY nicht in Frontend .env.local${NC}"
    echo "   → Optional, aber empfohlen für Supabase Client"
  fi
else
  echo -e "${RED}❌ Frontend .env.local nicht gefunden${NC}"
  echo "   → Erstelle .env.local mit MCP_SERVER_URL"
  ((FAIL_COUNT++))
fi

echo ""

# Prüfe API Routes (wenn Next.js läuft)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🧪 API Routes Test${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --max-time 2 | grep -q "200\|301\|302"; then
  echo "Next.js läuft, teste API Routes..."
  echo ""
  
  # Test Agent API
  HTTP_CODE_AGENT=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/agents/marketing \
    -H "Content-Type: application/json" \
    -d '{"message":"Test","userId":"test-frontend"}' \
    --max-time 5)
  
  if [[ "$HTTP_CODE_AGENT" == "200" ]]; then
    echo -e "${GREEN}✅ Agent API funktioniert (HTTP $HTTP_CODE_AGENT)${NC}"
    ((SUCCESS_COUNT++))
  else
    echo -e "${YELLOW}⚠️  Agent API: HTTP $HTTP_CODE_AGENT${NC}"
  fi
  
  # Test Reading API
  HTTP_CODE_READING=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/reading/generate \
    -H "Content-Type: application/json" \
    -d '{"birthDate":"1990-01-01","birthTime":"12:00","birthPlace":"Berlin","readingType":"basic","userId":"test-frontend"}' \
    --max-time 10)
  
  if [[ "$HTTP_CODE_READING" == "200" ]]; then
    echo -e "${GREEN}✅ Reading API funktioniert (HTTP $HTTP_CODE_READING)${NC}"
    ((SUCCESS_COUNT++))
  else
    echo -e "${YELLOW}⚠️  Reading API: HTTP $HTTP_CODE_READING${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Next.js läuft nicht → API Routes können nicht getestet werden${NC}"
  echo "   → Starte Next.js: cd integration/frontend && npm run dev"
fi

echo ""

# Zusammenfassung
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Zusammenfassung${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${GREEN}✅ OK: $SUCCESS_COUNT${NC}"
echo -e "${RED}❌ Fehlend/Problem: $FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}🎉 Frontend Integration ist vollständig!${NC}"
else
  echo -e "${YELLOW}⚠️  Frontend Integration benötigt noch Konfiguration${NC}"
  echo ""
  echo "Nächste Schritte:"
  if [ ! -f "$FRONTEND_ENV" ]; then
    echo "1. Frontend .env.local erstellen"
  fi
  if ! grep -q "^MCP_SERVER_URL=" "$FRONTEND_ENV" 2>/dev/null; then
    echo "2. MCP_SERVER_URL in Frontend .env.local eintragen"
  fi
  if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --max-time 2 | grep -q "200\|301\|302"; then
    echo "3. Next.js starten: cd integration/frontend && npm run dev"
  fi
fi

echo ""
