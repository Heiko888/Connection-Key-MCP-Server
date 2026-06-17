#!/bin/bash
# Prüft ob alle Services korrekt laufen

cd /opt/mcp-connection-key

echo "🔍 Prüfe Services..."
echo ""

# 1. Container Status
echo "📊 Container Status:"
docker-compose ps
echo ""

# 2. Prüfe ob alle Container laufen
echo "✅ Laufende Container:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(NAMES|mcp|agent|connection|n8n)"
echo ""

# 3. Health Checks
echo "🏥 Health Checks:"
echo ""

# Connection-Key Server
echo -n "Connection-Key (3000): "
if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ OK"
    RESPONSE=$(curl -s http://localhost:3000/health 2>/dev/null)
    echo "   Antwort: $RESPONSE" | head -c 100
    echo ""
else
    echo "❌ Nicht erreichbar"
    echo "   Prüfe Logs: docker-compose logs connection-key"
fi

echo ""

# ChatGPT-Agent
echo -n "ChatGPT-Agent (4000): "
if curl -f -s http://localhost:4000/health > /dev/null 2>&1; then
    echo "✅ OK"
    RESPONSE=$(curl -s http://localhost:4000/health 2>/dev/null)
    echo "   Antwort: $RESPONSE" | head -c 100
    echo ""
else
    echo "❌ Nicht erreichbar"
    echo "   Prüfe Logs: docker-compose logs chatgpt-agent"
fi

echo ""

# n8n
echo -n "n8n (5678): "
if curl -f -s http://localhost:5678/healthz > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "⚠️  Nicht erreichbar (kann beim ersten Start normal sein)"
    echo "   Prüfe Logs: docker-compose logs n8n"
fi

echo ""

# 4. Logs (letzte 10 Zeilen pro Service)
echo "📋 Letzte Logs:"
echo ""
echo "--- Connection-Key ---"
docker-compose logs --tail=5 connection-key 2>/dev/null | tail -3
echo ""
echo "--- ChatGPT-Agent ---"
docker-compose logs --tail=5 chatgpt-agent 2>/dev/null | tail -3
echo ""
echo "--- n8n ---"
docker-compose logs --tail=5 n8n 2>/dev/null | tail -3
echo ""

# 5. Ports prüfen
echo "🔌 Offene Ports:"
netstat -tuln 2>/dev/null | grep -E "(3000|4000|5678|7777)" || ss -tuln 2>/dev/null | grep -E "(3000|4000|5678|7777)" || echo "Keine Ports gefunden"
echo ""

# 6. Zusammenfassung
echo "=========================================="
echo "Zusammenfassung:"
echo "=========================================="
echo ""
echo "Services sollten erreichbar sein unter:"
echo "  - Connection-Key: http://$(hostname -I | awk '{print $1}'):3000"
echo "  - ChatGPT-Agent:  http://$(hostname -I | awk '{print $1}'):4000"
echo "  - n8n:            http://$(hostname -I | awk '{print $1}'):5678"
echo ""
echo "Nützliche Befehle:"
echo "  - Alle Logs:      docker-compose logs -f"
echo "  - Einzelner:      docker-compose logs -f connection-key"
echo "  - Status:         docker-compose ps"
echo "  - Neustart:       docker-compose restart"
echo ""

