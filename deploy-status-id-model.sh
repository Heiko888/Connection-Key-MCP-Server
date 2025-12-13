#!/bin/bash
# Deployment-Script: Reading-Status- & ID-Modell
# Führt alle Deployment-Schritte automatisch aus

set -e

FRONTEND_DIR="/opt/hd-app/The-Connection-Key/frontend"
INTEGRATION_DIR="/opt/hd-app/The-Connection-Key/frontend/integration"

echo "🚀 Deployment: Reading-Status- & ID-Modell"
echo "=========================================="
echo ""

# Prüfe ob wir im richtigen Verzeichnis sind
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Frontend-Verzeichnis nicht gefunden: $FRONTEND_DIR"
    echo "   Bitte auf CK-App Server ausführen!"
    exit 1
fi

cd "$FRONTEND_DIR"

echo "📋 Schritt 1: Backup erstellen"
echo "-------------------------------"
if [ -f "app/api/reading/generate/route.ts" ]; then
    cp app/api/reading/generate/route.ts app/api/reading/generate/route.ts.backup
    echo "✅ Backup erstellt: app/api/reading/generate/route.ts.backup"
else
    echo "⚠️  Keine bestehende Route gefunden, kein Backup nötig"
fi

echo ""
echo "📋 Schritt 2: API-Route deployen"
echo "-------------------------------"

# Prüfe ob Integration-Verzeichnis existiert
if [ ! -d "$INTEGRATION_DIR" ]; then
    echo "⚠️  Integration-Verzeichnis nicht gefunden, versuche Git Pull..."
    git pull origin main || git pull origin feature/reading-agent-option-a-complete
fi

# Reading Generate Route
if [ -f "integration/api-routes/app-router/reading/generate/route.ts" ]; then
    mkdir -p app/api/reading/generate
    cp integration/api-routes/app-router/reading/generate/route.ts \
       app/api/reading/generate/route.ts
    echo "✅ Reading Generate Route deployed"
else
    echo "❌ Datei nicht gefunden: integration/api-routes/app-router/reading/generate/route.ts"
    echo "   Bitte Git Pull ausführen oder Datei manuell kopieren"
fi

# Status Route
if [ -f "integration/api-routes/app-router/readings/[id]/status/route.ts" ]; then
    mkdir -p "app/api/readings/[id]/status"
    cp "integration/api-routes/app-router/readings/[id]/status/route.ts" \
       "app/api/readings/[id]/status/route.ts"
    echo "✅ Reading Status Route deployed"
else
    echo "❌ Datei nicht gefunden: integration/api-routes/app-router/readings/[id]/status/route.ts"
    echo "   Bitte Git Pull ausführen oder Datei manuell kopieren"
fi

echo ""
echo "📋 Schritt 3: Frontend Service deployen"
echo "--------------------------------------"

if [ -f "integration/frontend/services/readingService.ts" ]; then
    mkdir -p lib/services
    cp integration/frontend/services/readingService.ts lib/services/
    echo "✅ Reading Service deployed"
else
    echo "❌ Datei nicht gefunden: integration/frontend/services/readingService.ts"
    echo "   Bitte Git Pull ausführen oder Datei manuell kopieren"
fi

echo ""
echo "📋 Schritt 4: Import-Pfade prüfen"
echo "--------------------------------"

# Prüfe Import-Pfade in Reading Generate Route
if grep -q "from '../../../reading-response-types'" app/api/reading/generate/route.ts; then
    echo "✅ Import-Pfade in Reading Generate Route korrekt"
else
    echo "⚠️  Import-Pfade müssen möglicherweise angepasst werden"
    echo "   Aktuell: app/api/reading/generate/route.ts"
    echo "   Erwartet: from '../../../reading-response-types'"
fi

# Prüfe Import-Pfade in Status Route
if grep -q "from '../../../../reading-response-types'" app/api/readings/[id]/status/route.ts; then
    echo "✅ Import-Pfade in Status Route korrekt"
else
    echo "⚠️  Import-Pfade müssen möglicherweise angepasst werden"
    echo "   Aktuell: app/api/readings/[id]/status/route.ts"
    echo "   Erwartet: from '../../../../reading-response-types'"
fi

echo ""
echo "📋 Schritt 5: TypeScript-Kompilierung prüfen"
echo "--------------------------------------------"

if command -v npm &> /dev/null; then
    echo "🔍 Führe TypeScript-Check aus..."
    if npm run build 2>&1 | grep -q "error"; then
        echo "❌ TypeScript-Fehler gefunden!"
        echo "   Bitte Fehler beheben bevor Frontend neu gestartet wird"
        npm run build
        exit 1
    else
        echo "✅ TypeScript-Kompilierung erfolgreich"
    fi
else
    echo "⚠️  npm nicht gefunden, überspringe TypeScript-Check"
fi

echo ""
echo "📋 Schritt 6: Deployment-Zusammenfassung"
echo "---------------------------------------"

echo "✅ Deployment abgeschlossen!"
echo ""
echo "📝 Nächste Schritte:"
echo "1. Supabase Migration ausführen:"
echo "   - Öffne Supabase Dashboard"
echo "   - Gehe zu SQL Editor"
echo "   - Führe aus: integration/supabase/migrations/003_add_processing_status.sql"
echo ""
echo "2. Frontend neu starten:"
echo "   pm2 restart the-connection-key"
echo ""
echo "3. Testen:"
echo "   curl -X POST http://localhost:3000/api/reading/generate \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"birthDate\": \"1990-05-15\", \"birthTime\": \"14:30\", \"birthPlace\": \"Berlin\"}'"
echo ""
echo "✅ Fertig!"

