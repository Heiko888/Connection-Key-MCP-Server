#!/bin/bash

# 🔍 Prüfe Supabase Konfiguration

echo "🔍 Prüfe Supabase Konfiguration"
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

SUCCESS_COUNT=0
FAIL_COUNT=0

# Prüfe Environment Variables
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📄 Environment Variables${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# NEXT_PUBLIC_SUPABASE_URL
if grep -q "^NEXT_PUBLIC_SUPABASE_URL=" .env 2>/dev/null; then
  SUPABASE_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" .env | cut -d= -f2 | sed 's/^"//;s/"$//')
  if [ ! -z "$SUPABASE_URL" ] && [ "$SUPABASE_URL" != "" ]; then
    echo -e "${GREEN}✅ NEXT_PUBLIC_SUPABASE_URL: $SUPABASE_URL${NC}"
    ((SUCCESS_COUNT++))
  else
    echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL ist leer${NC}"
    ((FAIL_COUNT++))
  fi
else
  echo -e "${RED}❌ NEXT_PUBLIC_SUPABASE_URL nicht gefunden${NC}"
  ((FAIL_COUNT++))
fi

# SUPABASE_SERVICE_ROLE_KEY
if grep -q "^SUPABASE_SERVICE_ROLE_KEY=" .env 2>/dev/null; then
  SUPABASE_KEY=$(grep "^SUPABASE_SERVICE_ROLE_KEY=" .env | cut -d= -f2 | sed 's/^"//;s/"$//')
  if [ ! -z "$SUPABASE_KEY" ] && [ "$SUPABASE_KEY" != "" ]; then
    echo -e "${GREEN}✅ SUPABASE_SERVICE_ROLE_KEY: ${SUPABASE_KEY:0:20}...${SUPABASE_KEY: -10}${NC}"
    ((SUCCESS_COUNT++))
  else
    echo -e "${RED}❌ SUPABASE_SERVICE_ROLE_KEY ist leer${NC}"
    ((FAIL_COUNT++))
  fi
else
  echo -e "${RED}❌ SUPABASE_SERVICE_ROLE_KEY nicht gefunden${NC}"
  ((FAIL_COUNT++))
fi

echo ""

# Prüfe Migration-Datei
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📄 Migration-Datei${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

MIGRATION_FILE="integration/supabase/migrations/008_user_registration_trigger.sql"

if [ -f "$MIGRATION_FILE" ]; then
  echo -e "${GREEN}✅ Migration-Datei gefunden: $MIGRATION_FILE${NC}"
  echo ""
  echo "Migration muss in Supabase SQL Editor ausgeführt werden:"
  echo "1. Supabase Dashboard öffnen"
  echo "2. SQL Editor öffnen"
  echo "3. Datei öffnen: $MIGRATION_FILE"
  echo "4. SQL kopieren und ausführen"
  echo ""
else
  echo -e "${RED}❌ Migration-Datei nicht gefunden: $MIGRATION_FILE${NC}"
  ((FAIL_COUNT++))
fi

# Prüfe Frontend .env.local
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📄 Frontend .env.local${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

FRONTEND_ENV="integration/frontend/.env.local"

if [ -f "$FRONTEND_ENV" ]; then
  echo -e "${GREEN}✅ Frontend .env.local gefunden${NC}"
  
  if grep -q "^NEXT_PUBLIC_SUPABASE_URL=" "$FRONTEND_ENV" 2>/dev/null; then
    FRONTEND_URL=$(grep "^NEXT_PUBLIC_SUPABASE_URL=" "$FRONTEND_ENV" | cut -d= -f2 | sed 's/^"//;s/"$//')
    echo -e "${GREEN}✅ NEXT_PUBLIC_SUPABASE_URL in Frontend: $FRONTEND_URL${NC}"
  else
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_SUPABASE_URL nicht in Frontend .env.local${NC}"
  fi
  
  if grep -q "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" "$FRONTEND_ENV" 2>/dev/null; then
    echo -e "${GREEN}✅ NEXT_PUBLIC_SUPABASE_ANON_KEY in Frontend gesetzt${NC}"
  else
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY nicht in Frontend .env.local${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Frontend .env.local nicht gefunden${NC}"
  echo "   → Optional: Erstelle .env.local mit Supabase Variablen"
fi

echo ""

# Zusammenfassung
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Zusammenfassung${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${GREEN}✅ Gesetzt: $SUCCESS_COUNT von 2${NC}"
echo -e "${RED}❌ Fehlend: $FAIL_COUNT von 2${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}🎉 Alle Supabase Environment Variables sind gesetzt!${NC}"
  echo ""
  echo "Nächste Schritte:"
  echo "1. Migration in Supabase SQL Editor ausführen"
  echo "2. Optional: Frontend .env.local prüfen"
else
  echo -e "${YELLOW}⚠️  $FAIL_COUNT Variablen fehlen${NC}"
  echo ""
  echo "Füge fehlende Variablen hinzu:"
  echo "1. Supabase Dashboard → Settings → API"
  echo "2. Project URL kopieren → NEXT_PUBLIC_SUPABASE_URL"
  echo "3. service_role key kopieren → SUPABASE_SERVICE_ROLE_KEY"
  echo "4. In .env eintragen"
fi

echo ""
