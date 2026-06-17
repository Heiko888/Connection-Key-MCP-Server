#!/bin/bash

# Prüfe welche docker-compose Dateien vorhanden sind
# Führt auf Server aus (167.235.224.149)

cd /opt/hd-app/The-Connection-Key

echo "🔍 Prüfe Docker Compose Dateien"
echo "================================"
echo ""

# 1. Prüfe alle docker-compose Dateien
echo "1. Verfügbare docker-compose Dateien:"
echo "------------------------------------"
find . -maxdepth 1 -name "docker-compose*.yml" -o -name "docker-compose*.yaml" 2>/dev/null | sort

echo ""

# 2. Prüfe welche Frontend enthält
echo "2. Welche Datei enthält Frontend-Service?"
echo "----------------------------------------"

for file in docker-compose*.yml docker-compose*.yaml; do
    if [ -f "$file" ]; then
        if grep -q "frontend:" "$file"; then
            echo "   ✅ $file - enthält Frontend"
        else
            echo "   ❌ $file - enthält KEIN Frontend"
        fi
    fi
done

echo ""

# 3. Prüfe welche aktuell verwendet wird
echo "3. Welche Datei wird aktuell verwendet?"
echo "---------------------------------------"

# Prüfe laufende Container
FRONTEND_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i frontend | head -1)

if [ -n "$FRONTEND_CONTAINER" ]; then
    echo "   ✅ Frontend Container läuft: $FRONTEND_CONTAINER"
    
    # Prüfe Build Context
    echo ""
    echo "   Build Context aus Container:"
    docker inspect $FRONTEND_CONTAINER 2>/dev/null | grep -i "build\|context" | head -5
else
    echo "   ⚠️  Kein Frontend Container läuft"
fi

echo ""

# 4. Empfehlung
echo "4. Empfehlung:"
echo "-------------"

if [ -f "docker-compose.yml" ] && grep -q "frontend:" "docker-compose.yml"; then
    echo "   ✅ Verwende: docker-compose.yml"
    echo ""
    echo "   Befehle:"
    echo "   docker compose -f docker-compose.yml up -d frontend"
elif [ -f "docker-compose-redis-fixed.yml" ]; then
    echo "   ✅ Verwende: docker-compose-redis-fixed.yml"
    echo ""
    echo "   Befehle:"
    echo "   docker compose -f docker-compose-redis-fixed.yml up -d frontend"
else
    echo "   ⚠️  Keine docker-compose Datei mit Frontend gefunden!"
    echo ""
    echo "   Verfügbare Dateien:"
    ls -la docker-compose* 2>/dev/null || echo "   Keine gefunden"
fi

echo ""
