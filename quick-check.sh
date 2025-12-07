#!/bin/bash
# Schnelle Prüfung auf dem Hetzner Server

cd /opt/mcp-connection-key

echo "=== QUICK CHECK ==="
echo ""

# .env prüfen
if [ -f ".env" ]; then
    echo "✅ .env Datei vorhanden"
    echo "   Größe: $(du -h .env | cut -f1)"
else
    echo "❌ .env Datei FEHLT!"
fi

echo ""

# Docker Container
echo "=== Docker Container ==="
docker ps -a | grep -E "(mcp|agent|connection|n8n)" || echo "Keine Container gefunden"

echo ""

# Docker Compose Status
if [ -f "docker-compose.yml" ]; then
    echo "=== Docker Compose Status ==="
    docker-compose ps 2>/dev/null || echo "docker-compose ps fehlgeschlagen"
else
    echo "❌ docker-compose.yml fehlt!"
fi

echo ""

# Ports prüfen
echo "=== Offene Ports ==="
netstat -tuln 2>/dev/null | grep -E "(3000|4000|5678|7777)" || ss -tuln 2>/dev/null | grep -E "(3000|4000|5678|7777)" || echo "Keine relevanten Ports offen"

echo ""

# Health Checks
echo "=== Health Checks ==="
curl -s http://localhost:3000/health && echo " ✅" || echo "Port 3000: ❌"
curl -s http://localhost:4000/health && echo " ✅" || echo "Port 4000: ❌"
curl -s http://localhost:5678/healthz && echo " ✅" || echo "Port 5678: ❌"

