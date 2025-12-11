#!/bin/bash

# 🔍 Prüfe Frontend .env.local vollständig

echo "🔍 Prüfe Frontend .env.local"
echo "=========================================="
echo ""

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

cd /opt/mcp-connection-key/integration/frontend

FRONTEND_ENV=".env.local"

if [ ! -f "$FRONTEND_ENV" ]; then
  echo -e "${RED}❌ Frontend .env.local nicht gefunden!${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Frontend .env.local gefunden${NC}"
echo ""

# Prüfe alle Variablen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📄 Environment Variables${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

MISSING=0
INCOMPLETE=0

# MCP_SERVER_URL
if grep -q "^MCP_SERVER_URL=" "$FRONTEND_ENV" 2>/dev/null; then
  MCP_URL=$(grep "^MCP_SERVER_URL=" "$FRONTEND_ENV" | cut -d= -f2 | sed 's/^"//;s/"$//')
  if [ ! -z "$MCP_URL" ] && [ "$MCP_URL" != "" ]; then
    echo -e "${GREEN}✅ MCP_SERVER_URL: $MCP_URL${NC}"
  else
    echo -e "${RED}❌ MCP_SERVER_URL ist leer${NC}"
    ((MISSING++))
  fi
else
  echo -e "${RED}❌ MCP_SERVER_URL fehlt${NC}"
  ((MISSING++))
fi

# READING_AGENT_URL
if grep -q "^READING_AGENT_URL=" "$FRONTEND_ENV" 2>/dev/null; then
  READING_URL=$(grep "^READING_AGENT_URL=" "$FRONTEND_ENV" | cut -d= -f2 | sed 's/^"//;s/"$//')
  if [ ! -z "$READING_URL" ] && [ "$READING_URL" != "" ]; then
    echo -e "${GREEN}✅ READING_AGENT_URL: $READING_URL${NC}"
  else
    echo -e "${RED}❌ READING_AGENT_URL ist leer${NC}"
    ((MISSING++))
  fi
else
  echo -e "${RED}❌ READING_AGENT_URL fehlt${NC}"
  ((MISSING++))
fi

# NEXT_PUBLIC_SUPABASE_URL
if grep -q "^NEXT_PUBLIC_SUPABASE_URL=" "$FRONTEND_ENV" 2>/dev/null; then
  SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" "$FRONTEND_ENV" | cut -d= -f2 | sed 's/^"//;s/"$//')
  if [ ! -z "$SUPABASE_URL" ] && [ "$SUPABASE_URL" != "" ]; then
    echo -e "${GREEN}✅ NEXT_PUBLIC_SUPABASE_URL: $SUPABASE_URL${NC}"
  else
    echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL ist leer${NC}"
    ((MISSING++))
  fi
else
  echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL fehlt${NC}"
  ((MISSING++))
fi

# SUPABASE_SERVICE_ROLE_KEY
if grep -q "^SUPABASE_SERVICE_ROLE_KEY=" "$FRONTEND_ENV" 2>/dev/null; then
  SERVICE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" "$FRONTEND_ENV" | cut -d= -f2 | sed 's/^"//;s/"$//')
  KEY_LENGTH=${#SERVICE_KEY}
  
  if [ ! -z "$SERVICE_KEY" ] && [ "$SERVICE_KEY" != "" ]; then
    # JWT Tokens sind normalerweise > 200 Zeichen
    if [ $KEY_LENGTH -lt 200 ]; then
      echo -e "${YELLOW}⚠️  SUPABASE_SERVICE_ROLE_KEY scheint unvollständig (nur $KEY_LENGTH Zeichen)${NC}"
      echo "   Key beginnt mit: ${SERVICE_KEY:0:50}..."
      echo "   → Prüfe ob Key vollständig ist!"
      ((INCOMPLETE++))
    else
      echo -e "${GREEN}✅ SUPABASE_SERVICE_ROLE_KEY: Gesetzt ($KEY_LENGTH Zeichen)${NC}"
    fi
  else
    echo -e "${RED}❌ SUPABASE_SERVICE_ROLE_KEY ist leer${NC}"
    ((MISSING++))
  fi
else
  echo -e "${RED}❌ SUPABASE_SERVICE_ROLE_KEY fehlt${NC}"
  ((MISSING++))
fi

# N8N_API_KEY
if grep -q "^N8N_API_KEY=" "$FRONTEND_ENV" 2>/dev/null; then
  N8N_KEY=$(grep "^N8N_API_KEY=" "$FRONTEND_ENV" | cut -d= -f2 | sed 's/^"//;s/"$//')
  if [ ! -z "$N8N_KEY" ] && [ "$N8N_KEY" != "" ]; then
    echo -e "${GREEN}✅ N8N_API_KEY: Gesetzt${NC}"
  else
    echo -e "${YELLOW}⚠️  N8N_API_KEY ist leer (optional)${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  N8N_API_KEY fehlt (optional)${NC}"
fi

echo ""

# Prüfe ob Next.js läuft
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📡 Next.js Status${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --max-time 2 | grep -q "200\|301\|302"; then
  echo -e "${GREEN}✅ Next.js läuft auf Port 3000${NC}"
  echo ""
  echo -e "${YELLOW}⚠️  WICHTIG: Falls .env.local geändert wurde, Next.js neu starten!${NC}"
  echo "   → Next.js lädt Environment Variables nur beim Start"
  echo ""
  echo "   Neustart:"
  echo "   pm2 restart nextjs-frontend"
  echo "   ODER"
  echo "   Prozess beenden (Ctrl+C) und neu starten: npm run dev"
else
  echo -e "${RED}❌ Next.js läuft nicht auf Port 3000${NC}"
  echo ""
  echo "Starte Next.js:"
  echo "cd /opt/mcp-connection-key/integration/frontend"
  echo "npm run dev"
fi

echo ""

# Zusammenfassung
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Zusammenfassung${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $MISSING -eq 0 ] && [ $INCOMPLETE -eq 0 ]; then
  echo -e "${GREEN}🎉 Alle Environment Variables sind gesetzt!${NC}"
  echo ""
  echo "Nächste Schritte:"
  echo "1. Falls .env.local geändert wurde → Next.js neu starten"
  echo "2. API Routes testen:"
  echo "   cd /opt/mcp-connection-key"
  echo "   ./check-frontend-integration.sh"
elif [ $INCOMPLETE -gt 0 ]; then
  echo -e "${YELLOW}⚠️  SUPABASE_SERVICE_ROLE_KEY scheint unvollständig${NC}"
  echo ""
  echo "Prüfe in .env.local ob der Key vollständig ist!"
  echo "JWT Tokens sind normalerweise > 200 Zeichen lang."
else
  echo -e "${RED}❌ Es fehlen noch $MISSING Environment Variables${NC}"
fi

echo ""
