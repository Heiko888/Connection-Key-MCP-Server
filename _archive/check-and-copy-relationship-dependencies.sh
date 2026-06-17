#!/bin/bash

# Script zum Prüfen und Kopieren der Relationship Analysis Dependencies
# Führt automatisch alle notwendigen Schritte aus

set -e

# Farben
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}🔍 Relationship Analysis - Dependencies prüfen & kopieren${NC}"
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

# Prüfe ob Integration-Verzeichnis existiert
if [ ! -d "$INTEGRATION_DIR" ]; then
    echo -e "${RED}❌ Integration-Verzeichnis nicht gefunden: $INTEGRATION_DIR${NC}"
    echo "   Bitte kopiere zuerst das integration/ Verzeichnis auf den Server"
    exit 1
fi

echo -e "${BLUE}📋 Schritt 1: Prüfe vorhandene Dependencies${NC}"
echo "----------------------------------------"

MISSING=0
COPIED=0

# ============================================
# 1. ReadingDisplay.tsx
# ============================================
if [ -f "components/ReadingDisplay.tsx" ]; then
    echo -e "${GREEN}✅ ReadingDisplay.tsx vorhanden${NC}"
else
    echo -e "${YELLOW}⚠️  ReadingDisplay.tsx fehlt${NC}"
    if [ -f "$INTEGRATION_DIR/frontend/components/ReadingDisplay.tsx" ]; then
        echo "   📤 Kopiere ReadingDisplay.tsx..."
        mkdir -p components
        cp "$INTEGRATION_DIR/frontend/components/ReadingDisplay.tsx" components/
        echo -e "   ${GREEN}✅ ReadingDisplay.tsx kopiert${NC}"
        COPIED=$((COPIED + 1))
    else
        echo -e "   ${RED}❌ Quelle nicht gefunden: $INTEGRATION_DIR/frontend/components/ReadingDisplay.tsx${NC}"
        MISSING=$((MISSING + 1))
    fi
fi

# ============================================
# 2. ReadingGenerator.tsx
# ============================================
if [ -f "components/ReadingGenerator.tsx" ]; then
    echo -e "${GREEN}✅ ReadingGenerator.tsx vorhanden${NC}"
else
    echo -e "${YELLOW}⚠️  ReadingGenerator.tsx fehlt${NC}"
    if [ -f "$INTEGRATION_DIR/frontend/components/ReadingGenerator.tsx" ]; then
        echo "   📤 Kopiere ReadingGenerator.tsx..."
        mkdir -p components
        cp "$INTEGRATION_DIR/frontend/components/ReadingGenerator.tsx" components/
        echo -e "   ${GREEN}✅ ReadingGenerator.tsx kopiert${NC}"
        COPIED=$((COPIED + 1))
    else
        echo -e "   ${RED}❌ Quelle nicht gefunden: $INTEGRATION_DIR/frontend/components/ReadingGenerator.tsx${NC}"
        MISSING=$((MISSING + 1))
    fi
fi

# ============================================
# 3. reading-response-types.ts
# ============================================
# Prüfe verschiedene mögliche Pfade
FOUND_TYPES=false
TYPES_PATH=""

if [ -f "api-routes/reading-response-types.ts" ]; then
    FOUND_TYPES=true
    TYPES_PATH="api-routes/reading-response-types.ts"
elif [ -f "app/api-routes/reading-response-types.ts" ]; then
    FOUND_TYPES=true
    TYPES_PATH="app/api-routes/reading-response-types.ts"
elif [ -f "app/api/reading-response-types.ts" ]; then
    FOUND_TYPES=true
    TYPES_PATH="app/api/reading-response-types.ts"
fi

if [ "$FOUND_TYPES" = true ]; then
    echo -e "${GREEN}✅ reading-response-types.ts vorhanden ($TYPES_PATH)${NC}"
else
    echo -e "${YELLOW}⚠️  reading-response-types.ts fehlt${NC}"
    if [ -f "$INTEGRATION_DIR/api-routes/reading-response-types.ts" ]; then
        echo "   📤 Kopiere reading-response-types.ts..."
        
        # Versuche zuerst api-routes/ (passt zu Import-Pfad)
        if [ ! -d "api-routes" ]; then
            mkdir -p api-routes
        fi
        cp "$INTEGRATION_DIR/api-routes/reading-response-types.ts" api-routes/
        echo -e "   ${GREEN}✅ reading-response-types.ts kopiert nach api-routes/${NC}"
        COPIED=$((COPIED + 1))
    else
        echo -e "   ${RED}❌ Quelle nicht gefunden: $INTEGRATION_DIR/api-routes/reading-response-types.ts${NC}"
        MISSING=$((MISSING + 1))
    fi
fi

echo ""
echo -e "${BLUE}📋 Schritt 2: Zusammenfassung${NC}"
echo "----------------------------------------"

if [ $MISSING -eq 0 ] && [ $COPIED -eq 0 ]; then
    echo -e "${GREEN}✅ Alle Dependencies sind bereits vorhanden!${NC}"
    echo ""
    echo "📋 Vorhandene Dateien:"
    ls -lh components/ReadingDisplay.tsx 2>/dev/null || true
    ls -lh components/ReadingGenerator.tsx 2>/dev/null || true
    find . -name "reading-response-types.ts" -type f 2>/dev/null | head -1 | xargs ls -lh 2>/dev/null || true
elif [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}✅ $COPIED Datei(en) kopiert${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  WICHTIG: Docker Container muss neu gebaut werden!${NC}"
    echo ""
    echo "Führe aus:"
    echo "  docker compose build frontend"
    echo "  docker compose up -d frontend"
else
    echo -e "${RED}❌ $MISSING Datei(en) konnten nicht kopiert werden (Quelle fehlt)${NC}"
    echo ""
    echo "Bitte kopiere die fehlenden Dateien manuell von lokal auf den Server."
    exit 1
fi

echo ""
echo -e "${BLUE}📋 Schritt 3: Prüfe Import-Pfade${NC}"
echo "----------------------------------------"

# Prüfe RelationshipAnalysisGenerator.tsx
if [ -f "components/RelationshipAnalysisGenerator.tsx" ]; then
    echo "Prüfe Import-Pfade in RelationshipAnalysisGenerator.tsx..."
    
    # Prüfe ReadingDisplay Import
    if grep -q "from './ReadingDisplay'" components/RelationshipAnalysisGenerator.tsx; then
        if [ -f "components/ReadingDisplay.tsx" ]; then
            echo -e "${GREEN}✅ ReadingDisplay Import korrekt${NC}"
        else
            echo -e "${RED}❌ ReadingDisplay Import fehlt (Datei nicht gefunden)${NC}"
        fi
    fi
    
    # Prüfe reading-response-types Import
    if grep -q "from '../../api-routes/reading-response-types'" components/RelationshipAnalysisGenerator.tsx; then
        if [ -f "api-routes/reading-response-types.ts" ]; then
            echo -e "${GREEN}✅ reading-response-types Import korrekt (api-routes/)${NC}"
        else
            echo -e "${YELLOW}⚠️  reading-response-types Import-Pfad könnte falsch sein${NC}"
            echo "   Erwartet: api-routes/reading-response-types.ts"
            echo "   Gefunden:"
            find . -name "reading-response-types.ts" -type f 2>/dev/null || echo "   (keine gefunden)"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  RelationshipAnalysisGenerator.tsx nicht gefunden${NC}"
fi

# Prüfe page.tsx
if [ -f "app/coach/readings/create/page.tsx" ]; then
    echo "Prüfe Import-Pfade in page.tsx..."
    
    # Prüfe @/components Import
    if grep -q "@/components" app/coach/readings/create/page.tsx; then
        echo -e "${GREEN}✅ @/components Import gefunden${NC}"
        echo "   (Prüfe tsconfig.json für @-Alias-Konfiguration)"
    fi
else
    echo -e "${YELLOW}⚠️  page.tsx nicht gefunden${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 Finale Zusammenfassung${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $MISSING -eq 0 ]; then
    echo -e "${GREEN}✅ Alle Dependencies sind vorhanden!${NC}"
    echo ""
    if [ $COPIED -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Nächster Schritt: Docker Container neu bauen${NC}"
        echo ""
        echo "Befehle:"
        echo "  cd /opt/hd-app/The-Connection-Key"
        echo "  docker compose build frontend"
        echo "  docker compose up -d frontend"
    else
        echo -e "${GREEN}✅ Keine Änderungen nötig${NC}"
    fi
    echo ""
    echo "🧪 Test im Browser:"
    echo "  http://167.235.224.149:3000/coach/readings/create"
else
    echo -e "${RED}❌ $MISSING Datei(en) fehlen${NC}"
    echo ""
    echo "Bitte kopiere die fehlenden Dateien manuell."
    exit 1
fi

echo ""
