#!/bin/bash
# Prüft den Status des Reading Agents

echo "🔍 Prüfe Reading Agent Status..."
echo "================================"
echo ""

# 1. Prüfe PM2 Status
echo "1. PM2 Status:"
if command -v pm2 &> /dev/null; then
    pm2 status reading-agent
    echo ""
    
    # Prüfe ob Agent läuft
    if pm2 list | grep -q "reading-agent.*online"; then
        echo "✅ Reading Agent läuft!"
    else
        echo "⚠️  Reading Agent läuft nicht"
    fi
else
    echo "❌ PM2 nicht installiert"
fi
echo ""

# 2. Prüfe Health Endpoint
echo "2. Health Check:"
HEALTH_RESPONSE=$(curl -s http://localhost:4000/health 2>/dev/null)
if [ $? -eq 0 ] && [ ! -z "$HEALTH_RESPONSE" ]; then
    echo "✅ Health Endpoint erreichbar:"
    echo "$HEALTH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$HEALTH_RESPONSE"
else
    echo "❌ Health Endpoint nicht erreichbar (Port 4000)"
fi
echo ""

# 3. Prüfe .env Datei
echo "3. Production .env Konfiguration:"
if [ -f "/opt/mcp-connection-key/production/.env" ]; then
    echo "✅ production/.env existiert"
    if grep -q "OPENAI_API_KEY=" /opt/mcp-connection-key/production/.env; then
        KEY_PREVIEW=$(grep "OPENAI_API_KEY=" /opt/mcp-connection-key/production/.env | cut -d= -f2 | cut -c1-20)
        echo "✅ OPENAI_API_KEY gesetzt: ${KEY_PREVIEW}..."
    else
        echo "❌ OPENAI_API_KEY nicht gesetzt"
    fi
    if grep -q "AGENT_SECRET=" /opt/mcp-connection-key/production/.env; then
        echo "✅ AGENT_SECRET gesetzt"
    else
        echo "⚠️  AGENT_SECRET nicht gesetzt (optional)"
    fi
else
    echo "❌ production/.env nicht gefunden"
fi
echo ""

# 4. Prüfe Logs
echo "4. Letzte Logs:"
if pm2 list | grep -q "reading-agent"; then
    echo "📋 Letzte 20 Zeilen:"
    pm2 logs reading-agent --lines 20 --nostream 2>/dev/null || echo "⚠️  Keine Logs verfügbar"
else
    echo "⚠️  Agent läuft nicht, keine Logs verfügbar"
fi
echo ""

# 5. Prüfe Port
echo "5. Port 4000:"
if netstat -tuln 2>/dev/null | grep -q ":4000" || ss -tuln 2>/dev/null | grep -q ":4000"; then
    echo "✅ Port 4000 ist in Verwendung"
else
    echo "⚠️  Port 4000 ist nicht in Verwendung"
fi
echo ""

echo "================================"
echo "✅ Prüfung abgeschlossen"
echo ""

