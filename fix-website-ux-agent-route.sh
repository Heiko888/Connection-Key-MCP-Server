#!/bin/bash

# Fix Website/UX Agent Route - createTask Fehler
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔧 Fix Website/UX Agent Route"
echo "============================="
echo ""

# 1. Prüfe aktuelle Route
echo "1. Prüfe aktuelle Route..."
echo "-------------------------"
if [ -f "frontend/app/api/agents/website-ux-agent/route.ts" ]; then
    echo "   ✅ Route vorhanden"
    
    # Prüfe auf createTask (alt, falsch)
    if grep -q "createTask" "frontend/app/api/agents/website-ux-agent/route.ts"; then
        echo "   ❌ ALTE VERSION gefunden (createTask vorhanden) - muss aktualisiert werden!"
        OLD_VERSION=true
    else
        echo "   ✅ Route sieht korrekt aus (kein createTask)"
        OLD_VERSION=false
    fi
    
    # Prüfe auf korrekte Supabase-Insert-Methode
    if grep -q "\.from('agent_tasks')" "frontend/app/api/agents/website-ux-agent/route.ts" && \
       grep -q "\.insert(\[" "frontend/app/api/agents/website-ux-agent/route.ts"; then
        echo "   ✅ Korrekte Supabase-Insert-Methode vorhanden"
    else
        echo "   ⚠️  Supabase-Insert-Methode könnte fehlen"
    fi
else
    echo "   ❌ Route fehlt komplett!"
    exit 1
fi
echo ""

# 2. Prüfe ob neue Version in integration/ vorhanden ist
echo "2. Prüfe neue Version..."
echo "----------------------"
if [ -f "integration/api-routes/app-router/agents/website-ux-agent/route.ts" ]; then
    echo "   ✅ Neue Version in integration/ vorhanden"
    
    # Prüfe ob neue Version korrekt ist
    if grep -q "createTask" "integration/api-routes/app-router/agents/website-ux-agent/route.ts"; then
        echo "   ⚠️  Auch neue Version hat createTask - das ist falsch!"
    else
        echo "   ✅ Neue Version ist korrekt (kein createTask)"
        NEEDS_UPDATE=true
    fi
else
    echo "   ⚠️  Neue Version nicht in integration/ gefunden"
    NEEDS_UPDATE=false
fi
echo ""

# 3. Aktualisiere Route (falls nötig)
if [ "$OLD_VERSION" = true ] || [ "$NEEDS_UPDATE" = true ]; then
    echo "3. Aktualisiere Route..."
    echo "----------------------"
    
    # Erstelle Backup
    if [ -f "frontend/app/api/agents/website-ux-agent/route.ts" ]; then
        cp "frontend/app/api/agents/website-ux-agent/route.ts" \
           "frontend/app/api/agents/website-ux-agent/route.ts.backup"
        echo "   ✅ Backup erstellt"
    fi
    
    # Kopiere neue Version (falls vorhanden)
    if [ -f "integration/api-routes/app-router/agents/website-ux-agent/route.ts" ]; then
        cp "integration/api-routes/app-router/agents/website-ux-agent/route.ts" \
           "frontend/app/api/agents/website-ux-agent/route.ts"
        echo "   ✅ Route aktualisiert"
    else
        echo "   ⚠️  Neue Version nicht gefunden - Route muss manuell korrigiert werden"
        echo ""
        echo "   Die Route sollte so aussehen:"
        echo "   - supabase.from('agent_tasks').insert([{...}])"
        echo "   - NICHT: createTask(...)"
        exit 1
    fi
else
    echo "3. Route ist bereits aktuell"
    echo "---------------------------"
fi
echo ""

# 4. Prüfe Route nach Update
echo "4. Prüfe Route nach Update..."
echo "----------------------------"
if [ -f "frontend/app/api/agents/website-ux-agent/route.ts" ]; then
    if grep -q "createTask" "frontend/app/api/agents/website-ux-agent/route.ts"; then
        echo "   ❌ Route hat immer noch createTask - Fehler!"
        echo "   Prüfe Route manuell:"
        echo "   cat frontend/app/api/agents/website-ux-agent/route.ts | grep -A 5 -B 5 createTask"
        exit 1
    else
        echo "   ✅ Route ist korrekt (kein createTask)"
    fi
fi
echo ""

# 5. Container neu bauen
echo "5. Baue Container neu..."
echo "----------------------"
docker compose -f docker-compose.yml stop frontend 2>/dev/null || echo "   Container läuft nicht"
docker compose -f docker-compose.yml rm -f frontend 2>/dev/null || echo "   Container existiert nicht"
docker compose -f docker-compose.yml build --no-cache frontend
echo ""

# 6. Container starten
echo "6. Starte Container..."
echo "-------------------"
docker compose -f docker-compose.yml up -d frontend
echo ""

# 7. Warte auf Start
echo "7. Warte 30 Sekunden auf Container-Start..."
sleep 30
echo ""

# 8. Teste Route
echo "8. Teste Website/UX Agent Route..."
echo "----------------------------------"
HTTP_CODE=$(curl -s -o /tmp/website-ux-response.json -w "%{http_code}" \
    -X POST "http://localhost:3000/api/agents/website-ux-agent" \
    -H "Content-Type: application/json" \
    -d '{"message": "Test"}' 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Route funktioniert! (HTTP $HTTP_CODE)"
    echo "   Response:"
    cat /tmp/website-ux-response.json | head -10
elif [ "$HTTP_CODE" = "500" ]; then
    echo "   ❌ Route gibt immer noch HTTP 500"
    echo "   Response:"
    cat /tmp/website-ux-response.json | head -20
    echo ""
    echo "   Prüfe Logs:"
    echo "   docker compose -f docker-compose.yml logs frontend | tail -50"
else
    echo "   ⚠️  Route antwortet mit HTTP $HTTP_CODE"
    cat /tmp/website-ux-response.json | head -10
fi
echo ""

# 9. Zusammenfassung
echo "9. Zusammenfassung:"
echo "-------------------"
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Website/UX Agent Route funktioniert jetzt!"
else
    echo "⚠️  Route hat noch Probleme"
    echo ""
    echo "🔍 Weitere Debugging-Schritte:"
    echo "   1. Prüfe vollständige Logs:"
    echo "      docker compose -f docker-compose.yml logs frontend | tail -100"
    echo ""
    echo "   2. Prüfe Route-Datei:"
    echo "      cat frontend/app/api/agents/website-ux-agent/route.ts | head -60"
    echo ""
    echo "   3. Prüfe ob createTask noch vorhanden ist:"
    echo "      grep -n createTask frontend/app/api/agents/website-ux-agent/route.ts"
fi
echo ""
