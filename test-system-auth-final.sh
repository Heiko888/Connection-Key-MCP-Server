#!/bin/bash

# Teste System-Auth nach Token-Setup
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🧪 Teste System-Auth"
echo "===================="
echo ""

# 1. Lade Token aus .env
if [ ! -f ".env" ]; then
    echo "❌ .env Datei nicht gefunden!"
    exit 1
fi

TOKEN=$(grep "AGENT_SYSTEM_TOKEN" .env | cut -d'=' -f2 | tr -d ' ')

if [ -z "$TOKEN" ]; then
    echo "❌ AGENT_SYSTEM_TOKEN nicht in .env gefunden!"
    exit 1
fi

echo "✅ Token aus .env geladen"
echo ""

# 2. Prüfe ob Token im Container verfügbar ist
echo "2. Prüfe Token im Container..."
echo "-------------------------------"

FRONTEND_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i frontend | head -1)

if [ -z "$FRONTEND_CONTAINER" ]; then
    echo "❌ Frontend-Container nicht gefunden!"
    exit 1
fi

echo "   Container: $FRONTEND_CONTAINER"

CONTAINER_TOKEN=$(docker exec $FRONTEND_CONTAINER env | grep AGENT_SYSTEM_TOKEN | cut -d'=' -f2)

if [ -z "$CONTAINER_TOKEN" ]; then
    echo "   ⚠️  Token nicht im Container gefunden!"
    echo "   📝 Container neu starten:"
    echo "      docker compose -f docker-compose.yml restart frontend"
    exit 1
fi

if [ "$CONTAINER_TOKEN" = "$TOKEN" ]; then
    echo "   ✅ Token im Container vorhanden und korrekt"
else
    echo "   ⚠️  Token stimmt nicht überein!"
    echo "   .env: $TOKEN"
    echo "   Container: $CONTAINER_TOKEN"
fi

echo ""

# 3. Teste System-Auth Route
echo "3. Teste System-Auth Route..."
echo "------------------------------"

echo "   Teste: GET /api/system/agents/tasks"
echo ""

# Test ohne Token (sollte 401 geben)
echo "   Test 1: Ohne Token (sollte 401)..."
RESPONSE_NO_TOKEN=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET http://localhost:3000/api/system/agents/tasks 2>/dev/null)
HTTP_STATUS_NO_TOKEN=$(echo "$RESPONSE_NO_TOKEN" | grep "HTTP_STATUS" | cut -d: -f2)
BODY_NO_TOKEN=$(echo "$RESPONSE_NO_TOKEN" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS_NO_TOKEN" = "401" ]; then
    echo "   ✅ Korrekt: 401 ohne Token"
else
    echo "   ❌ Erwartet: 401, Bekommen: $HTTP_STATUS_NO_TOKEN"
    echo "   Response: $BODY_NO_TOKEN"
fi

echo ""

# Test mit Token (sollte 200 geben)
echo "   Test 2: Mit Token (sollte 200)..."
RESPONSE_WITH_TOKEN=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET \
    -H "x-agent-token: $TOKEN" \
    http://localhost:3000/api/system/agents/tasks 2>/dev/null)
HTTP_STATUS_WITH_TOKEN=$(echo "$RESPONSE_WITH_TOKEN" | grep "HTTP_STATUS" | cut -d: -f2)
BODY_WITH_TOKEN=$(echo "$RESPONSE_WITH_TOKEN" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS_WITH_TOKEN" = "200" ]; then
    echo "   ✅ Korrekt: 200 mit Token"
    echo ""
    echo "   Response:"
    echo "$BODY_WITH_TOKEN" | jq . 2>/dev/null || echo "$BODY_WITH_TOKEN"
else
    echo "   ❌ Erwartet: 200, Bekommen: $HTTP_STATUS_WITH_TOKEN"
    echo "   Response: $BODY_WITH_TOKEN"
fi

echo ""

# 4. Teste POST (Statistiken)
echo "4. Teste POST (Statistiken)..."
echo "------------------------------"

RESPONSE_POST=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
    -H "x-agent-token: $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{}' \
    http://localhost:3000/api/system/agents/tasks 2>/dev/null)
HTTP_STATUS_POST=$(echo "$RESPONSE_POST" | grep "HTTP_STATUS" | cut -d: -f2)
BODY_POST=$(echo "$RESPONSE_POST" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS_POST" = "200" ]; then
    echo "   ✅ POST erfolgreich: 200"
    echo ""
    echo "   Response:"
    echo "$BODY_POST" | jq . 2>/dev/null || echo "$BODY_POST"
else
    echo "   ⚠️  POST Status: $HTTP_STATUS_POST"
    echo "   Response: $BODY_POST"
fi

echo ""

# 5. Zusammenfassung
echo "5. Zusammenfassung:"
echo "------------------"
echo ""

if [ "$HTTP_STATUS_NO_TOKEN" = "401" ] && [ "$HTTP_STATUS_WITH_TOKEN" = "200" ]; then
    echo "✅ System-Auth funktioniert korrekt!"
    echo ""
    echo "📋 Token: $TOKEN"
    echo "📁 Container: $FRONTEND_CONTAINER"
    echo ""
    echo "✅ Alle Tests erfolgreich!"
else
    echo "⚠️  Einige Tests fehlgeschlagen"
    echo ""
    echo "📝 Nächste Schritte:"
    echo "   1. Prüfe Container-Logs:"
    echo "      docker logs $FRONTEND_CONTAINER | tail -50"
    echo ""
    echo "   2. Prüfe ob Route existiert:"
    echo "      docker exec $FRONTEND_CONTAINER ls -la /app/app/api/system/agents/tasks/"
    echo ""
    echo "   3. Prüfe system-auth.ts:"
    echo "      docker exec $FRONTEND_CONTAINER cat /app/lib/system-auth.ts | head -20"
fi

echo ""
