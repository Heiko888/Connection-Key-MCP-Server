#!/bin/bash
# 🔍 CORS Status Prüfung
# Führen Sie dieses Script auf dem Hetzner Server aus

echo "🔍 CORS Status Prüfung"
echo "======================"
echo ""

# 1. MCP Server CORS
echo "1. MCP Server CORS (Port 7000)..."
if grep -q "app.use(cors" /opt/mcp/server.js 2>/dev/null; then
    echo "   ✅ CORS aktiviert"
    echo ""
    echo "   CORS-Konfiguration:"
    grep -A 10 "app.use(cors" /opt/mcp/server.js | head -12
else
    echo "   ❌ CORS nicht gefunden"
    echo "   💡 Bitte fügen Sie CORS hinzu (siehe integration/MANUAL_ADD_CORS.md)"
fi
echo ""

# 2. Reading Agent CORS
echo "2. Reading Agent CORS (Port 4001)..."
if grep -q "app.use(cors())" /opt/mcp-connection-key/production/server.js 2>/dev/null; then
    echo "   ✅ CORS aktiviert"
else
    echo "   ❌ CORS nicht gefunden"
fi
echo ""

# 3. Connection-Key Server CORS
echo "3. Connection-Key Server CORS (Port 3000)..."
if grep -q "CORS_ORIGINS" /opt/mcp-connection-key/.env 2>/dev/null; then
    echo "   ✅ CORS_ORIGINS konfiguriert"
    grep "CORS_ORIGINS" /opt/mcp-connection-key/.env
else
    echo "   ❌ CORS_ORIGINS nicht gefunden"
fi
echo ""

# 4. Services Status
echo "4. Services Status..."
echo "   Connection-Key Server:"
curl -s http://localhost:3000/health | head -1 || echo "   ❌ Nicht erreichbar"
echo ""
echo "   MCP Server:"
curl -s http://localhost:7000/health | head -1 || echo "   ❌ Nicht erreichbar"
echo ""
echo "   Reading Agent:"
curl -s http://localhost:4001/health | head -1 || echo "   ❌ Nicht erreichbar"
echo ""

# 5. CORS Test mit Origin-Header
echo "5. CORS Test (mit Origin-Header)..."
RESPONSE=$(curl -s -X POST http://localhost:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -H "Origin: https://www.the-connection-key.de" \
  -d '{"message": "Test"}' 2>&1)

if echo "$RESPONSE" | grep -q "agent\|response\|error"; then
    echo "   ✅ MCP Server antwortet"
    echo "   Antwort: $(echo "$RESPONSE" | head -1)"
else
    echo "   ⚠️  MCP Server antwortet nicht wie erwartet"
    echo "   Antwort: $RESPONSE"
fi
echo ""

# 6. Zusammenfassung
echo "======================"
echo "📋 Zusammenfassung:"
echo ""
echo "   MCP Server CORS: $(grep -q "app.use(cors" /opt/mcp/server.js 2>/dev/null && echo "✅ Aktiviert" || echo "❌ Fehlt")"
echo "   Reading Agent CORS: $(grep -q "app.use(cors())" /opt/mcp-connection-key/production/server.js 2>/dev/null && echo "✅ Aktiviert" || echo "❌ Fehlt")"
echo "   Connection-Key CORS: $(grep -q "CORS_ORIGINS" /opt/mcp-connection-key/.env 2>/dev/null && echo "✅ Konfiguriert" || echo "❌ Fehlt")"
echo ""
echo "======================"
echo ""

