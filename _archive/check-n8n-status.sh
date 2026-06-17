#!/bin/bash
# Prüft n8n Status auf Hetzner Server

cd /opt/mcp-connection-key

echo "🔍 n8n Status prüfen"
echo "===================="
echo ""

# 1. Container Status
echo "📊 Docker Container:"
docker-compose ps | grep n8n || echo "n8n Container nicht gefunden"
echo ""

# 2. n8n erreichbar?
echo "🌐 Erreichbarkeit:"
if curl -f -s http://localhost:5678/healthz > /dev/null 2>&1; then
    echo "✅ n8n läuft auf Port 5678"
    echo "   URL: http://138.199.237.34:5678"
else
    echo "❌ n8n ist NICHT erreichbar"
fi
echo ""

# 3. Logs
echo "📋 Letzte Logs:"
docker-compose logs --tail=10 n8n 2>/dev/null || echo "Keine Logs gefunden"
echo ""

# 4. Environment Variables
echo "🔐 n8n Konfiguration:"
grep -E "N8N_" .env 2>/dev/null | grep -v "PASSWORD\|API_KEY" || echo "Keine n8n ENV Vars gefunden"
echo ""

# 5. Zusammenfassung
echo "===================="
if docker-compose ps | grep -q "n8n.*Up"; then
    echo "✅ n8n läuft!"
    echo ""
    echo "Zugriff:"
    echo "  - HTTP: http://138.199.237.34:5678"
    echo "  - Login: admin / Passwort aus .env (N8N_PASSWORD)"
    echo ""
    echo "Für HTTPS benötigen Sie:"
    echo "  1. DNS-Eintrag: n8n.werdemeisterdeinergedankenagent.de → 138.199.237.34"
    echo "  2. HTTPS Setup (siehe HTTPS_SETUP.md)"
else
    echo "❌ n8n läuft NICHT!"
    echo ""
    echo "Starten Sie n8n:"
    echo "  cd /opt/mcp-connection-key"
    echo "  docker-compose up -d n8n"
fi

