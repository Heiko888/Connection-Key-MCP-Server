#!/bin/bash

# 🔍 Prüfe Environment Variables
# Prüft alle wichtigen Environment Variables

echo "🔍 Prüfe Environment Variables..."
echo ""

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Prüfe .env Datei
ENV_FILE="${1:-.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}❌ .env Datei nicht gefunden: $ENV_FILE${NC}"
  exit 1
fi

echo "📄 Prüfe: $ENV_FILE"
echo ""

MISSING=0
FOUND=0

# Funktion: Prüfe Variable
check_var() {
  local var_name=$1
  local required=${2:-false}
  
  if grep -q "^${var_name}=" "$ENV_FILE" 2>/dev/null; then
    local value=$(grep "^${var_name}=" "$ENV_FILE" | cut -d'=' -f2- | sed 's/^"//;s/"$//')
    if [ -n "$value" ] && [ "$value" != "" ]; then
      echo -e "${GREEN}✅ $var_name${NC} = ${value:0:20}..."
      ((FOUND++))
      return 0
    else
      echo -e "${YELLOW}⚠️  $var_name${NC} = (leer)"
      if [ "$required" = "true" ]; then
        ((MISSING++))
      fi
      return 1
    fi
  else
    echo -e "${RED}❌ $var_name${NC} = (nicht gefunden)"
    if [ "$required" = "true" ]; then
      ((MISSING++))
    fi
    return 1
  fi
}

# ERFORDERLICH
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 ERFORDERLICH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_var "OPENAI_API_KEY" true
check_var "N8N_PASSWORD" true
check_var "API_KEY" true

echo ""

# WICHTIG
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 WICHTIG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_var "MCP_SERVER_URL" false
check_var "N8N_API_KEY" false

echo ""

# SUPABASE (Optional)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SUPABASE (Optional)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

check_var "NEXT_PUBLIC_SUPABASE_URL" false
check_var "SUPABASE_SERVICE_ROLE_KEY" false

echo ""

# Zusammenfassung
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Zusammenfassung"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo -e "${GREEN}✅ Gefunden: $FOUND${NC}"
echo -e "${RED}❌ Fehlend: $MISSING${NC}"
echo ""

if [ $MISSING -eq 0 ]; then
  echo -e "${GREEN}🎉 Alle erforderlichen Variablen sind gesetzt!${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  $MISSING erforderliche Variablen fehlen${NC}"
  echo ""
  echo "Füge fehlende Variablen hinzu:"
  echo "  nano $ENV_FILE"
  exit 1
fi
