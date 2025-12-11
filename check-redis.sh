#!/bin/bash

# ============================================
# Redis Server Status prüfen
# ============================================

echo "🔍 Prüfe Redis Server..."
echo ""

# Prüfe ob Redis lokal installiert ist
if command -v redis-cli &> /dev/null; then
    echo "✅ redis-cli gefunden"
    
    # Prüfe Redis-Verbindung
    echo ""
    echo "📡 Prüfe Redis-Verbindung..."
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis Server läuft!"
        echo ""
        
        # Zeige Redis-Info
        echo "📊 Redis-Informationen:"
        echo "===================="
        redis-cli info server | grep -E "redis_version|os|process_id|uptime_in_seconds"
        echo ""
        
        # Zeige Redis-Stats
        echo "📈 Redis-Statistiken:"
        echo "===================="
        redis-cli info stats | grep -E "total_connections_received|total_commands_processed|keyspace"
        echo ""
        
        # Prüfe Keys
        echo "🔑 Anzahl gespeicherter Keys:"
        redis-cli dbsize
        echo ""
        
        # Prüfe Memory
        echo "💾 Memory-Verbrauch:"
        redis-cli info memory | grep -E "used_memory_human|used_memory_peak_human|maxmemory_human"
        echo ""
        
    else
        echo "❌ Redis Server läuft NICHT oder ist nicht erreichbar"
        echo ""
        echo "Versuche Redis zu starten..."
        if command -v redis-server &> /dev/null; then
            echo "⚠️  redis-server gefunden, aber nicht gestartet"
            echo "   Starte Redis mit: redis-server"
        else
            echo "❌ redis-server nicht gefunden"
        fi
    fi
else
    echo "❌ redis-cli nicht gefunden"
    echo ""
    echo "Redis ist nicht installiert."
    echo ""
    echo "Installation:"
    echo "  Ubuntu/Debian: sudo apt-get install redis-server"
    echo "  macOS: brew install redis"
    echo "  Windows: Download von https://redis.io/download"
fi

# Prüfe Docker Redis Container
echo ""
echo "🐳 Prüfe Docker Redis Container..."
if docker ps -a | grep -q redis; then
    echo "✅ Redis Container gefunden:"
    docker ps -a | grep redis
    echo ""
    
    # Prüfe ob Container läuft
    if docker ps | grep -q redis; then
        echo "✅ Redis Container läuft!"
        
        # Zeige Redis-Info aus Container
        REDIS_CONTAINER=$(docker ps | grep redis | awk '{print $1}')
        echo ""
        echo "📊 Redis-Informationen (Container):"
        docker exec $REDIS_CONTAINER redis-cli info server | grep -E "redis_version|os"
        echo ""
        echo "🔑 Anzahl Keys:"
        docker exec $REDIS_CONTAINER redis-cli dbsize
    else
        echo "⚠️  Redis Container ist gestoppt"
        echo "   Starte mit: docker start <container-name>"
    fi
else
    echo "ℹ️  Kein Redis Container gefunden"
fi

# Prüfe docker-compose.yml für Redis
echo ""
echo "📋 Prüfe docker-compose.yml für Redis..."
if [ -f docker-compose.yml ]; then
    if grep -q "redis" docker-compose.yml; then
        echo "✅ Redis in docker-compose.yml gefunden"
        echo ""
        echo "Redis Service:"
        grep -A 10 "redis:" docker-compose.yml | head -15
    else
        echo "ℹ️  Redis nicht in docker-compose.yml konfiguriert"
        echo ""
        echo "💡 Tipp: Redis kann für Caching und Session-Management hinzugefügt werden"
    fi
else
    echo "⚠️  docker-compose.yml nicht gefunden"
fi

echo ""
echo "✅ Prüfung abgeschlossen!"

