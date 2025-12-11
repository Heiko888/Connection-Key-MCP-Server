#!/bin/bash

# 🔧 Erstelle Frontend .env.local

echo "🔧 Erstelle Frontend .env.local"
echo "=========================================="
echo ""

cd /opt/mcp-connection-key

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Prüfe Server .env
if [ ! -f ".env" ]; then
  echo -e "${RED}❌ Server .env nicht gefunden!${NC}"
  exit 1
fi

echo -e "${BLUE}📄 Lade Environment Variables aus Server .env${NC}"
echo ""

# Lade Variablen aus Server .env
source .env 2>/dev/null || true

# Frontend .env.local Pfad
FRONTEND_ENV="integration/frontend/.env.local"

# Erstelle Frontend .env.local
echo -e "${BLUE}📝 Erstelle Frontend .env.local${NC}"
echo ""

cat > "$FRONTEND_ENV" << EOF
# MCP Server (für Agent API Routes)
MCP_SERVER_URL=${MCP_SERVER_URL:-http://138.199.237.34:7000}

# Reading Agent (für Reading API Route)
READING_AGENT_URL=${READING_AGENT_URL:-http://138.199.237.34:4001}

# Supabase (für API Routes)
NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL:-https://njjcywgskzepikyzhihy.supabase.co}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}

# N8N API Key (für /api/new-subscriber)
N8N_API_KEY=${N8N_API_KEY}

# Optional: Supabase Anon Key (für Supabase Client im Frontend)
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EOF

echo -e "${GREEN}✅ Frontend .env.local erstellt${NC}"
echo ""

# Prüfe ob alle wichtigen Variablen gesetzt sind
echo -e "${BLUE}🔍 Prüfe Environment Variables${NC}"
echo ""

MISSING=0

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

if grep -q "^SUPABASE_SERVICE_ROLE_KEY=" "$FRONTEND_ENV" 2>/dev/null; then
  SERVICE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" "$FRONTEND_ENV" | cut -d= -f2 | sed 's/^"//;s/"$//')
  if [ ! -z "$SERVICE_KEY" ] && [ "$SERVICE_KEY" != "" ]; then
    echo -e "${GREEN}✅ SUPABASE_SERVICE_ROLE_KEY: Gesetzt${NC}"
  else
    echo -e "${RED}❌ SUPABASE_SERVICE_ROLE_KEY ist leer${NC}"
    ((MISSING++))
  fi
else
  echo -e "${RED}❌ SUPABASE_SERVICE_ROLE_KEY fehlt${NC}"
  ((MISSING++))
fi

if grep -q "^N8N_API_KEY=" "$FRONTEND_ENV" 2>/dev/null; then
  N8N_KEY=$(grep "^N8N_API_KEY=" "$FRONTEND_ENV" | cut -d= -f2 | sed 's/^"//;s/"$//')
  if [ ! -z "$N8N_KEY" ] && [ "$N8N_KEY" != "" ]; then
    echo -e "${GREEN}✅ N8N_API_KEY: Gesetzt${NC}"
  else
    echo -e "${YELLOW}⚠️  N8N_API_KEY ist leer (optional für /api/new-subscriber)${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  N8N_API_KEY fehlt (optional für /api/new-subscriber)${NC}"
fi

echo ""

if [ $MISSING -eq 0 ]; then
  echo -e "${GREEN}🎉 Frontend .env.local ist vollständig!${NC}"
  echo ""
  echo "Nächste Schritte:"
  echo "1. Next.js neu starten (falls es läuft):"
  echo "   pm2 restart nextjs-frontend"
  echo "   ODER"
  echo "   cd integration/frontend && npm run dev"
  echo ""
  echo "2. API Routes testen:"
  echo "   ./check-frontend-integration.sh"
else
  echo -e "${RED}❌ Es fehlen noch $MISSING wichtige Environment Variables${NC}"
  echo ""
  echo "Bitte manuell in $FRONTEND_ENV eintragen"
fi

echo ""
