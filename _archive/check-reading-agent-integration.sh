#!/bin/bash
# Prüf-Script: Reading Agent Frontend Integration
# Auf CK-App Server (167.235.224.149) ausführen

set -e

echo "🔍 Reading Agent Frontend Integration - Prüfung"
echo "==============================================="
echo ""

# Farben
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="/opt/hd-app/The-Connection-Key/frontend"
cd "$PROJECT_DIR" || { echo -e "${RED}❌ Projekt-Verzeichnis nicht gefunden${NC}"; exit 1; }

ERRORS=0
WARNINGS=0

# 1. Prüfe API-Route
echo "1️⃣  Prüfe API-Route..."
ROUTE_FOUND=false
ROUTE_PATH=""

if [ -f "pages/api/readings/generate.ts" ]; then
    echo -e "${GREEN}   ✅ Pages Router: pages/api/readings/generate.ts${NC}"
    ROUTE_FOUND=true
    ROUTE_PATH="pages/api/readings/generate.ts"
elif [ -f "app/api/reading/generate/route.ts" ]; then
    echo -e "${GREEN}   ✅ App Router: app/api/reading/generate/route.ts${NC}"
    ROUTE_FOUND=true
    ROUTE_PATH="app/api/reading/generate/route.ts"
elif [ -f "app/api/readings/generate/route.ts" ]; then
    echo -e "${GREEN}   ✅ App Router: app/api/readings/generate/route.ts${NC}"
    ROUTE_FOUND=true
    ROUTE_PATH="app/api/readings/generate/route.ts"
fi

if [ "$ROUTE_FOUND" = true ]; then
    # Prüfe ob Route READING_AGENT_URL verwendet
    if grep -q "READING_AGENT_URL" "$ROUTE_PATH"; then
        echo -e "${GREEN}   ✅ Route verwendet READING_AGENT_URL${NC}"
        # Prüfe ob URL korrekt ist
        if grep -q "138.199.237.34:4001" "$ROUTE_PATH"; then
            echo -e "${GREEN}   ✅ URL korrekt (138.199.237.34:4001)${NC}"
        else
            echo -e "${YELLOW}   ⚠️  URL könnte falsch sein - prüfe manuell${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${RED}   ❌ Route verwendet nicht READING_AGENT_URL!${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}   ❌ API-Route nicht gefunden!${NC}"
    echo "   📋 Mögliche Pfade:"
    echo "      - pages/api/readings/generate.ts (Pages Router)"
    echo "      - app/api/reading/generate/route.ts (App Router)"
    echo "      - app/api/readings/generate/route.ts (App Router)"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. Prüfe Environment Variable
echo "2️⃣  Prüfe Environment Variable..."
if grep -q "^READING_AGENT_URL=" .env.local 2>/dev/null || grep -q "^READING_AGENT_URL=" .env 2>/dev/null; then
    echo -e "${GREEN}   ✅ READING_AGENT_URL gesetzt${NC}"
    grep "^READING_AGENT_URL=" .env.local .env 2>/dev/null | head -1
    if ! grep -q "138.199.237.34:4001" .env.local .env 2>/dev/null; then
        echo -e "${YELLOW}   ⚠️  URL scheint nicht korrekt zu sein${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${RED}   ❌ READING_AGENT_URL nicht gefunden!${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 3. Prüfe Frontend-Komponente
echo "3️⃣  Prüfe Frontend-Komponente..."
if [ -f "components/agents/ReadingGenerator.tsx" ]; then
    echo -e "${GREEN}   ✅ Komponente vorhanden: components/agents/ReadingGenerator.tsx${NC}"
elif [ -f "app/components/agents/ReadingGenerator.tsx" ]; then
    echo -e "${GREEN}   ✅ Komponente vorhanden: app/components/agents/ReadingGenerator.tsx${NC}"
else
    echo -e "${RED}   ❌ ReadingGenerator.tsx nicht gefunden!${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 4. Prüfe Frontend-Seite
echo "4️⃣  Prüfe Frontend-Seite..."
PAGE_FOUND=false
PAGE_PATH=""

if [ -f "pages/coach/readings/create.tsx" ]; then
    echo -e "${GREEN}   ✅ Seite vorhanden: pages/coach/readings/create.tsx${NC}"
    PAGE_FOUND=true
    PAGE_PATH="pages/coach/readings/create.tsx"
elif [ -f "pages/readings/create.tsx" ]; then
    echo -e "${GREEN}   ✅ Seite vorhanden: pages/readings/create.tsx${NC}"
    PAGE_FOUND=true
    PAGE_PATH="pages/readings/create.tsx"
elif [ -f "app/coach/readings/create/page.tsx" ]; then
    echo -e "${GREEN}   ✅ Seite vorhanden: app/coach/readings/create/page.tsx${NC}"
    PAGE_FOUND=true
    PAGE_PATH="app/coach/readings/create/page.tsx"
elif [ -f "app/readings/create/page.tsx" ]; then
    echo -e "${GREEN}   ✅ Seite vorhanden: app/readings/create/page.tsx${NC}"
    PAGE_FOUND=true
    PAGE_PATH="app/readings/create/page.tsx"
fi

if [ "$PAGE_FOUND" = true ]; then
    # Prüfe ob ReadingGenerator verwendet wird
    if grep -q "ReadingGenerator" "$PAGE_PATH"; then
        echo -e "${GREEN}   ✅ Seite verwendet ReadingGenerator${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Seite verwendet möglicherweise nicht ReadingGenerator${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "${YELLOW}   ⚠️  Frontend-Seite nicht gefunden (optional)${NC}"
    echo "   📋 Mögliche Pfade:"
    echo "      - pages/coach/readings/create.tsx"
    echo "      - pages/readings/create.tsx"
    echo "      - app/coach/readings/create/page.tsx"
    echo "      - app/readings/create/page.tsx"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# 5. Teste Reading Agent
echo "5️⃣  Teste Reading Agent..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://138.199.237.34:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-05-15","birthTime":"14:30","birthPlace":"Berlin","readingType":"detailed"}' \
  -o /tmp/reading-test.json 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}   ✅ Reading Agent erreichbar (HTTP $HTTP_CODE)${NC}"
    if [ -f /tmp/reading-test.json ]; then
        if grep -q "reading" /tmp/reading-test.json; then
            echo -e "${GREEN}   ✅ Response enthält 'reading'${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Response scheint kein 'reading' zu enthalten${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
else
    echo -e "${RED}   ❌ Reading Agent nicht erreichbar (HTTP $HTTP_CODE)${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 6. Teste API-Route lokal (falls App läuft)
echo "6️⃣  Teste API-Route lokal..."
if curl -s http://localhost:3000/api/readings/generate -X POST \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-05-15","birthTime":"14:30","birthPlace":"Berlin"}' \
  > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ API-Route erreichbar${NC}"
else
    echo -e "${YELLOW}   ⚠️  API-Route nicht erreichbar (App läuft möglicherweise nicht)${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Zusammenfassung
echo "==============================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Alles OK! Integration funktioniert.${NC}"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS Warnung(en) - Integration sollte funktionieren${NC}"
else
    echo -e "${RED}❌ $ERRORS Fehler gefunden - Integration funktioniert nicht!${NC}"
    echo -e "${YELLOW}⚠️  $WARNINGS Warnung(en)${NC}"
fi
echo ""
echo "📋 Nächste Schritte:"
if [ $ERRORS -gt 0 ]; then
    echo "   1. Führe install-reading-agent-frontend.sh aus"
    echo "   2. Oder behebe die Fehler manuell"
fi
if [ $WARNINGS -gt 0 ]; then
    echo "   - Prüfe Warnungen oben"
fi
echo "==============================================="

exit $ERRORS

