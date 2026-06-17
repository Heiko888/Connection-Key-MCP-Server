#!/bin/bash
# Automatische Installation: Reading Agent Frontend Integration
# Auf CK-App Server (167.235.224.149) ausführen

set -e

echo "🚀 Reading Agent Frontend Integration - Installation"
echo "===================================================="
echo ""

# Farben für Output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Projekt-Pfad
PROJECT_DIR="/opt/hd-app/The-Connection-Key/frontend"
cd "$PROJECT_DIR" || { echo -e "${RED}❌ Projekt-Verzeichnis nicht gefunden: $PROJECT_DIR${NC}"; exit 1; }

echo -e "${GREEN}✅ Projekt-Verzeichnis gefunden${NC}"
echo ""

# Schritt 1: Router-Typ prüfen
echo "1️⃣  Prüfe Router-Typ..."
if [ -d "pages" ]; then
    ROUTER_TYPE="pages"
    echo -e "${GREEN}   ✅ Pages Router erkannt${NC}"
elif [ -d "app" ]; then
    ROUTER_TYPE="app"
    echo -e "${GREEN}   ✅ App Router erkannt${NC}"
else
    echo -e "${RED}   ❌ Weder pages/ noch app/ Verzeichnis gefunden${NC}"
    exit 1
fi
echo ""

# Schritt 2: Git Pull (falls Repository)
echo "2️⃣  Prüfe Git Repository..."
if [ -d ".git" ]; then
    echo "   📥 Führe Git Pull durch..."
    git pull origin main || echo -e "${YELLOW}   ⚠️  Git Pull fehlgeschlagen (überspringe)${NC}"
else
    echo -e "${YELLOW}   ⚠️  Kein Git Repository gefunden${NC}"
fi
echo ""

# Schritt 3: Prüfe ob integration/ vorhanden
echo "3️⃣  Prüfe integration/ Verzeichnis..."
if [ ! -d "integration" ]; then
    echo -e "${RED}   ❌ integration/ Verzeichnis nicht gefunden!${NC}"
    echo "   📋 Bitte Git Pull durchführen oder Dateien manuell kopieren"
    exit 1
fi
echo -e "${GREEN}   ✅ integration/ Verzeichnis vorhanden${NC}"
echo ""

# Schritt 4: API-Route installieren
echo "4️⃣  Prüfe und installiere API-Route..."
if [ "$ROUTER_TYPE" = "pages" ]; then
    # Pages Router
    if [ -f "pages/api/readings/generate.ts" ]; then
        echo -e "${YELLOW}   ⚠️  API-Route bereits vorhanden: pages/api/readings/generate.ts${NC}"
        read -p "   Überschreiben? (j/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Jj]$ ]]; then
            if [ -f "integration/api-routes/readings-generate.ts" ]; then
                cp integration/api-routes/readings-generate.ts pages/api/readings/generate.ts
                echo -e "${GREEN}   ✅ API-Route aktualisiert${NC}"
            else
                echo -e "${RED}   ❌ Quell-Datei nicht gefunden${NC}"
            fi
        else
            echo -e "${GREEN}   ✅ Bestehende Datei beibehalten${NC}"
        fi
    else
        mkdir -p pages/api/readings
        if [ -f "integration/api-routes/readings-generate.ts" ]; then
            cp integration/api-routes/readings-generate.ts pages/api/readings/generate.ts
            echo -e "${GREEN}   ✅ API-Route installiert: pages/api/readings/generate.ts${NC}"
        else
            echo -e "${RED}   ❌ Datei nicht gefunden: integration/api-routes/readings-generate.ts${NC}"
            exit 1
        fi
    fi
else
    # App Router - prüfe verschiedene mögliche Pfade
    ROUTE_FOUND=false
    if [ -f "app/api/reading/generate/route.ts" ]; then
        echo -e "${GREEN}   ✅ API-Route bereits vorhanden: app/api/reading/generate/route.ts${NC}"
        ROUTE_FOUND=true
    elif [ -f "app/api/readings/generate/route.ts" ]; then
        echo -e "${GREEN}   ✅ API-Route bereits vorhanden: app/api/readings/generate/route.ts${NC}"
        ROUTE_FOUND=true
    fi
    
    if [ "$ROUTE_FOUND" = false ]; then
        echo -e "${YELLOW}   ⚠️  App Router erkannt - API-Route nicht gefunden${NC}"
        echo "   📋 Mögliche Pfade:"
        echo "      - app/api/reading/generate/route.ts"
        echo "      - app/api/readings/generate/route.ts"
        echo "   📋 Siehe README_API_ROUTES.md für App Router Anleitung"
    else
        # Prüfe ob Route korrekt konfiguriert ist
        if grep -q "READING_AGENT_URL" "app/api/reading/generate/route.ts" 2>/dev/null || \
           grep -q "READING_AGENT_URL" "app/api/readings/generate/route.ts" 2>/dev/null; then
            echo -e "${GREEN}   ✅ Route verwendet READING_AGENT_URL${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Route verwendet möglicherweise nicht READING_AGENT_URL${NC}"
        fi
    fi
fi
echo ""

# Schritt 5: Environment Variable setzen
echo "5️⃣  Setze Environment Variable..."
ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
    touch "$ENV_FILE"
    echo "   📝 .env.local erstellt"
fi

if grep -q "^READING_AGENT_URL=" "$ENV_FILE"; then
    echo -e "${YELLOW}   ⚠️  READING_AGENT_URL bereits vorhanden${NC}"
    grep "^READING_AGENT_URL=" "$ENV_FILE"
    read -p "   Überschreiben? (j/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Jj]$ ]]; then
        sed -i 's|^READING_AGENT_URL=.*|READING_AGENT_URL=http://138.199.237.34:4001|' "$ENV_FILE"
        echo -e "${GREEN}   ✅ READING_AGENT_URL aktualisiert${NC}"
    fi
else
    echo "READING_AGENT_URL=http://138.199.237.34:4001" >> "$ENV_FILE"
    echo -e "${GREEN}   ✅ READING_AGENT_URL hinzugefügt${NC}"
fi
echo ""

# Schritt 6: Frontend-Komponente installieren
echo "6️⃣  Prüfe und installiere Frontend-Komponente..."
if [ "$ROUTER_TYPE" = "pages" ]; then
    if [ -f "components/agents/ReadingGenerator.tsx" ]; then
        echo -e "${YELLOW}   ⚠️  Komponente bereits vorhanden: components/agents/ReadingGenerator.tsx${NC}"
        read -p "   Überschreiben? (j/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Jj]$ ]]; then
            if [ -f "integration/frontend/components/ReadingGenerator.tsx" ]; then
                cp integration/frontend/components/ReadingGenerator.tsx components/agents/
                echo -e "${GREEN}   ✅ Komponente aktualisiert${NC}"
            else
                echo -e "${RED}   ❌ Quell-Datei nicht gefunden${NC}"
            fi
        else
            echo -e "${GREEN}   ✅ Bestehende Komponente beibehalten${NC}"
        fi
    else
        mkdir -p components/agents
        if [ -f "integration/frontend/components/ReadingGenerator.tsx" ]; then
            cp integration/frontend/components/ReadingGenerator.tsx components/agents/
            echo -e "${GREEN}   ✅ Komponente installiert: components/agents/ReadingGenerator.tsx${NC}"
        else
            echo -e "${RED}   ❌ Datei nicht gefunden: integration/frontend/components/ReadingGenerator.tsx${NC}"
            exit 1
        fi
    fi
else
    # App Router
    if [ -f "app/components/agents/ReadingGenerator.tsx" ]; then
        echo -e "${GREEN}   ✅ Komponente bereits vorhanden: app/components/agents/ReadingGenerator.tsx${NC}"
    elif [ -f "components/agents/ReadingGenerator.tsx" ]; then
        echo -e "${GREEN}   ✅ Komponente bereits vorhanden: components/agents/ReadingGenerator.tsx${NC}"
    else
        mkdir -p app/components/agents
        if [ -f "integration/frontend/components/ReadingGenerator.tsx" ]; then
            cp integration/frontend/components/ReadingGenerator.tsx app/components/agents/
            echo -e "${GREEN}   ✅ Komponente installiert: app/components/agents/ReadingGenerator.tsx${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Quell-Datei nicht gefunden${NC}"
        fi
    fi
fi
echo ""

# Schritt 7: Frontend-Seite prüfen/erstellen
echo "7️⃣  Prüfe Frontend-Seite..."
PAGE_FOUND=false
if [ "$ROUTER_TYPE" = "pages" ]; then
    if [ -f "pages/coach/readings/create.tsx" ]; then
        echo -e "${GREEN}   ✅ Seite bereits vorhanden: pages/coach/readings/create.tsx${NC}"
        PAGE_FOUND=true
        # Prüfe ob ReadingGenerator importiert ist
        if grep -q "ReadingGenerator" "pages/coach/readings/create.tsx"; then
            echo -e "${GREEN}   ✅ Seite verwendet ReadingGenerator${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Seite verwendet möglicherweise nicht ReadingGenerator${NC}"
        fi
    elif [ -f "pages/readings/create.tsx" ]; then
        echo -e "${GREEN}   ✅ Seite vorhanden: pages/readings/create.tsx${NC}"
        PAGE_FOUND=true
    fi
    
    if [ "$PAGE_FOUND" = false ]; then
        read -p "   Seite erstellen? (j/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Jj]$ ]]; then
            mkdir -p pages/coach/readings
            cat > pages/coach/readings/create.tsx << 'EOF'
import { ReadingGenerator } from '@/components/agents/ReadingGenerator';

export default function CreateReadingPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Human Design Reading erstellen</h1>
      <ReadingGenerator />
    </div>
  );
}
EOF
            echo -e "${GREEN}   ✅ Seite erstellt: pages/coach/readings/create.tsx${NC}"
        else
            echo -e "${YELLOW}   ⚠️  Seite wird nicht erstellt${NC}"
        fi
    fi
else
    # App Router
    if [ -f "app/coach/readings/create/page.tsx" ]; then
        echo -e "${GREEN}   ✅ Seite bereits vorhanden: app/coach/readings/create/page.tsx${NC}"
        PAGE_FOUND=true
    elif [ -f "app/readings/create/page.tsx" ]; then
        echo -e "${GREEN}   ✅ Seite vorhanden: app/readings/create/page.tsx${NC}"
        PAGE_FOUND=true
    fi
    
    if [ "$PAGE_FOUND" = false ]; then
        echo -e "${YELLOW}   ⚠️  App Router - Seite nicht gefunden${NC}"
        echo "   📋 Mögliche Pfade:"
        echo "      - app/coach/readings/create/page.tsx"
        echo "      - app/readings/create/page.tsx"
        echo "   📋 Seite muss manuell erstellt werden"
    fi
fi
echo ""

# Schritt 8: Test Reading Agent erreichbar
echo "8️⃣  Teste Reading Agent..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://138.199.237.34:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-05-15","birthTime":"14:30","birthPlace":"Berlin","readingType":"detailed"}' \
  -o /tmp/reading-test.json 2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}   ✅ Reading Agent erreichbar (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}   ❌ Reading Agent nicht erreichbar (HTTP $HTTP_CODE)${NC}"
    echo -e "${YELLOW}   ⚠️  Bitte prüfe ob Reading Agent auf Hetzner Server läuft${NC}"
fi
echo ""

# Schritt 9: Zusammenfassung
echo "===================================================="
echo -e "${GREEN}✅ Installation abgeschlossen!${NC}"
echo ""
echo "📋 Nächste Schritte:"
echo ""
echo "1. App neu starten:"
echo "   pm2 restart the-connection-key"
echo "   # oder"
echo "   npm run build && pm2 restart the-connection-key"
echo ""
echo "2. Teste API-Route:"
echo "   curl -X POST http://localhost:3000/api/readings/generate \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"birthDate\":\"1990-05-15\",\"birthTime\":\"14:30\",\"birthPlace\":\"Berlin\"}'"
echo ""
echo "3. Teste Frontend-Seite:"
echo "   https://www.the-connection-key.de/coach/readings/create"
echo ""
echo "===================================================="

