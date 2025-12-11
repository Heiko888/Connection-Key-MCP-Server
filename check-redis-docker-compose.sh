#!/bin/bash

# ============================================
# Redis Docker-Compose Analyse
# ============================================
# Prüft die docker-compose.yml auf dem Server
# NUR LESEN - KEINE ÄNDERUNGEN!
# ============================================

SERVER_PATH="/opt/hd-app/The-Connection-Key"
COMPOSE_FILE="$SERVER_PATH/docker-compose.yml"

echo "========================================"
echo "Redis Docker-Compose Analyse"
echo "========================================"
echo ""
echo "Server-Pfad: $SERVER_PATH"
echo ""

# Prüfe ob Datei existiert
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ docker-compose.yml nicht gefunden in: $COMPOSE_FILE"
    echo ""
    echo "Suche nach docker-compose Dateien..."
    find "$SERVER_PATH" -name "*docker-compose*.yml" -o -name "*docker-compose*.yaml" 2>/dev/null
    exit 1
fi

echo "✅ docker-compose.yml gefunden!"
echo ""

# Zeige Redis-Service (falls vorhanden)
echo "========================================"
echo "Redis Service Konfiguration"
echo "========================================"
echo ""

if grep -q "redis:" "$COMPOSE_FILE" || grep -q "chart-redis:" "$COMPOSE_FILE"; then
    echo "✅ Redis Service gefunden!"
    echo ""
    
    # Zeige Redis-Service Block
    echo "Redis Service Konfiguration:"
    echo "----------------------------"
    
    # Versuche Redis-Service Block zu extrahieren
    awk '/redis:|chart-redis:/,/^[[:space:]]*[a-zA-Z-]+:/ {if (!/^[[:space:]]*[a-zA-Z-]+:/ || /redis:|chart-redis:/) print}' "$COMPOSE_FILE" | head -50
    
else
    echo "⚠️  Kein Redis Service in docker-compose.yml gefunden"
    echo ""
    echo "Suche nach 'redis' oder 'chart' in der Datei..."
    grep -i "redis\|chart" "$COMPOSE_FILE" | head -20
fi

echo ""
echo "========================================"
echo "Vollständige docker-compose.yml"
echo "========================================"
echo ""

# Zeige vollständige Datei
cat "$COMPOSE_FILE"

echo ""
echo "========================================"
echo "Container-Informationen"
echo "========================================"
echo ""

# Prüfe laufende Container
echo "Laufende Container:"
docker ps --filter "name=redis" --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"

echo ""
echo "========================================"
echo "Analyse abgeschlossen!"
echo "========================================"

