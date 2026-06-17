#!/bin/bash

# Testet alle wichtigen API Routes
# Führt auf Server aus

echo "🧪 Teste alle API Routes"
echo "========================"
echo ""

BASE_URL="http://localhost:3000"

# Liste der Routes zum Testen
ROUTES=(
    "/api/agents/website-ux-agent"
    "/api/agents/tasks"
    "/api/reading/generate"
    "/api/readings/history"
    "/api/coach/readings"
    "/api/relationship-analysis/generate"
    "/api/workbook/chart-data"
    "/api/agents/marketing"
    "/api/agents/automation"
    "/api/agents/sales"
    "/api/agents/social-youtube"
    "/api/agents/chart-development"
)

for route in "${ROUTES[@]}"; do
    echo "Testing: $route"
    response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL$route" 2>/dev/null)
    http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
    body=$(echo "$response" | sed '/HTTP_CODE/d' | head -3)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "405" ]; then
        echo "   ✅ $http_code - Route antwortet"
        echo "$body" | head -1
    elif [ "$http_code" = "404" ]; then
        echo "   ❌ $http_code - Route nicht gefunden"
    else
        echo "   ⚠️  $http_code - Unbekannter Status"
    fi
    echo ""
done

echo "✅ Tests abgeschlossen!"
