#!/bin/bash

# Script: Kopiere fehlende Dependencies für Relationship Analysis
# Führt automatisch Prüfung und Kopieren durch

set -e

# Farben
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📦 Relationship Analysis - Dependencies kopieren${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verzeichnisse
FRONTEND_DIR="/opt/hd-app/The-Connection-Key/frontend"
INTEGRATION_DIR="$FRONTEND_DIR/integration"

# Prüfe ob Frontend-Verzeichnis existiert
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Frontend-Verzeichnis nicht gefunden: $FRONTEND_DIR${NC}"
    exit 1
fi

cd "$FRONTEND_DIR"

echo -e "${BLUE}📍 Verzeichnis: $FRONTEND_DIR${NC}"
echo ""

# ============================================
# PRÜFUNG
# ============================================
echo -e "${BLUE}📋 Prüfe Dependencies...${NC}"
echo "----------------------------------------"

MISSING=0

# ReadingDisplay
if [ ! -f "components/ReadingDisplay.tsx" ]; then
    echo -e "${YELLOW}⚠️  ReadingDisplay.tsx fehlt${NC}"
    MISSING=$((MISSING + 1))
else
    echo -e "${GREEN}✅ ReadingDisplay.tsx vorhanden${NC}"
fi

# ReadingGenerator
if [ ! -f "components/ReadingGenerator.tsx" ]; then
    echo -e "${YELLOW}⚠️  ReadingGenerator.tsx fehlt${NC}"
    MISSING=$((MISSING + 1))
else
    echo -e "${GREEN}✅ ReadingGenerator.tsx vorhanden${NC}"
fi

# reading-response-types
if [ ! -f "api-routes/reading-response-types.ts" ] && [ ! -f "app/api-routes/reading-response-types.ts" ]; then
    echo -e "${YELLOW}⚠️  reading-response-types.ts fehlt${NC}"
    MISSING=$((MISSING + 1))
else
    echo -e "${GREEN}✅ reading-response-types.ts vorhanden${NC}"
    if [ -f "app/api-routes/reading-response-types.ts" ]; then
        echo "   📍 Gefunden in: app/api-routes/"
    elif [ -f "api-routes/reading-response-types.ts" ]; then
        echo "   📍 Gefunden in: api-routes/"
    fi
fi

echo ""

# ============================================
# KOPIEREN
# ============================================
if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}✅ Alle Dependencies vorhanden!${NC}"
    echo ""
    exit 0
fi

echo -e "${BLUE}📤 Kopiere fehlende Dependencies...${NC}"
echo "----------------------------------------"

# ReadingDisplay
if [ ! -f "components/ReadingDisplay.tsx" ]; then
    if [ -f "$INTEGRATION_DIR/frontend/components/ReadingDisplay.tsx" ]; then
        echo "📤 Kopiere ReadingDisplay.tsx..."
        mkdir -p components
        cp "$INTEGRATION_DIR/frontend/components/ReadingDisplay.tsx" components/
        echo -e "${GREEN}✅ ReadingDisplay.tsx kopiert${NC}"
    else
        echo -e "${RED}❌ Quelle nicht gefunden: $INTEGRATION_DIR/frontend/components/ReadingDisplay.tsx${NC}"
    fi
fi

# ReadingGenerator
if [ ! -f "components/ReadingGenerator.tsx" ]; then
    if [ -f "$INTEGRATION_DIR/frontend/components/ReadingGenerator.tsx" ]; then
        echo "📤 Kopiere ReadingGenerator.tsx..."
        mkdir -p components
        cp "$INTEGRATION_DIR/frontend/components/ReadingGenerator.tsx" components/
        echo -e "${GREEN}✅ ReadingGenerator.tsx kopiert${NC}"
    else
        echo -e "${RED}❌ Quelle nicht gefunden: $INTEGRATION_DIR/frontend/components/ReadingGenerator.tsx${NC}"
    fi
fi

# reading-response-types
if [ ! -f "api-routes/reading-response-types.ts" ] && [ ! -f "app/api-routes/reading-response-types.ts" ]; then
    if [ -f "$INTEGRATION_DIR/api-routes/reading-response-types.ts" ]; then
        echo "📤 Kopiere reading-response-types.ts..."
        
        # Prüfe Import-Pfad in RelationshipAnalysisGenerator
        if grep -q "../../api-routes/reading-response-types" components/RelationshipAnalysisGenerator.tsx 2>/dev/null; then
            # Import erwartet api-routes/ im Root
            mkdir -p api-routes
            cp "$INTEGRATION_DIR/api-routes/reading-response-types.ts" api-routes/
            echo -e "${GREEN}✅ reading-response-types.ts kopiert nach api-routes/${NC}"
        else
            # Fallback: app/api-routes
            mkdir -p app/api-routes
            cp "$INTEGRATION_DIR/api-routes/reading-response-types.ts" app/api-routes/
            echo -e "${GREEN}✅ reading-response-types.ts kopiert nach app/api-routes/${NC}"
            echo -e "${YELLOW}⚠️  Import-Pfad in RelationshipAnalysisGenerator.tsx muss angepasst werden!${NC}"
        fi
    else
        echo -e "${RED}❌ Quelle nicht gefunden: $INTEGRATION_DIR/api-routes/reading-response-types.ts${NC}"
    fi
fi

echo ""

# ============================================
# PRÜFUNG NACH KOPIEREN
# ============================================
echo -e "${BLUE}📋 Prüfe nach Kopieren...${NC}"
echo "----------------------------------------"

ALL_OK=true

if [ ! -f "components/ReadingDisplay.tsx" ]; then
    echo -e "${RED}❌ ReadingDisplay.tsx fehlt immer noch${NC}"
    ALL_OK=false
else
    echo -e "${GREEN}✅ ReadingDisplay.tsx vorhanden${NC}"
fi

if [ ! -f "components/ReadingGenerator.tsx" ]; then
    echo -e "${RED}❌ ReadingGenerator.tsx fehlt immer noch${NC}"
    ALL_OK=false
else
    echo -e "${GREEN}✅ ReadingGenerator.tsx vorhanden${NC}"
fi

if [ ! -f "api-routes/reading-response-types.ts" ] && [ ! -f "app/api-routes/reading-response-types.ts" ]; then
    echo -e "${RED}❌ reading-response-types.ts fehlt immer noch${NC}"
    ALL_OK=false
else
    echo -e "${GREEN}✅ reading-response-types.ts vorhanden${NC}"
    if [ -f "app/api-routes/reading-response-types.ts" ]; then
        echo "   📍 In: app/api-routes/"
    elif [ -f "api-routes/reading-response-types.ts" ]; then
        echo "   📍 In: api-routes/"
    fi
fi

echo ""

# ============================================
# ZUSAMMENFASSUNG
# ============================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Zusammenfassung${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$ALL_OK" = true ]; then
    echo -e "${GREEN}✅ Alle Dependencies vorhanden!${NC}"
    echo ""
    echo "📋 Nächste Schritte:"
    echo "   1. Frontend neu starten: docker compose restart frontend"
    echo "   2. Build testen: npm run build"
    echo "   3. API testen: curl -X GET http://localhost:3000/api/relationship-analysis/generate"
else
    echo -e "${RED}❌ Einige Dependencies fehlen noch${NC}"
    echo ""
    echo "💡 Bitte kopiere fehlende Dateien manuell oder von lokal (via scp)"
    exit 1
fi

echo ""
