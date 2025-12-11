#!/bin/bash

# ============================================
# Redis Docker-Compose Fixes anwenden
# ============================================
# Server: root@ubuntu-8gb-fsn1-1
# Pfad: /opt/hd-app/The-Connection-Key/
# ============================================

set -e

SERVER_PATH="/opt/hd-app/The-Connection-Key"
REDIS_PASSWORD="IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5"

echo "========================================"
echo "Redis Docker-Compose Fixes anwenden"
echo "========================================"
echo ""

# Prüfe ob wir auf dem Server sind
if [ ! -d "$SERVER_PATH" ]; then
    echo "❌ Server-Pfad nicht gefunden: $SERVER_PATH"
    echo "   Bitte auf dem Server ausführen oder per SSH verbinden"
    exit 1
fi

cd "$SERVER_PATH"

echo "[*] Erstelle Backup..."
cp docker-compose.yml docker-compose.yml.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup erstellt"
echo ""

echo "[*] Prüfe redis.conf..."
if [ ! -f "redis.conf" ]; then
    echo "⚠️  redis.conf nicht gefunden!"
    echo "   Bitte redis.conf auf Server kopieren"
    echo "   scp redis.conf root@ubuntu-8gb-fsn1-1:/opt/hd-app/The-Connection-Key/"
    exit 1
fi
echo "✅ redis.conf gefunden"
echo ""

echo "[*] Prüfe REDIS_PASSWORD in .env..."
if ! grep -q "^REDIS_PASSWORD=" .env 2>/dev/null; then
    echo "⚠️  REDIS_PASSWORD nicht in .env gefunden"
    echo "[*] Füge REDIS_PASSWORD hinzu..."
    echo "REDIS_PASSWORD=$REDIS_PASSWORD" >> .env
    echo "✅ REDIS_PASSWORD hinzugefügt"
else
    echo "✅ REDIS_PASSWORD bereits in .env vorhanden"
    # Aktualisiere Passwort falls anders
    sed -i "s/^REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASSWORD/" .env
    echo "✅ REDIS_PASSWORD aktualisiert"
fi
echo ""

echo "[*] Prüfe docker-compose.yml Syntax..."
# Versuche docker compose (neu) oder docker-compose (alt)
if docker compose config > /dev/null 2>&1; then
    echo "✅ docker-compose.yml Syntax OK (docker compose)"
    DOCKER_COMPOSE_CMD="docker compose"
elif docker-compose config > /dev/null 2>&1; then
    echo "✅ docker-compose.yml Syntax OK (docker-compose)"
    DOCKER_COMPOSE_CMD="docker-compose"
else
    echo "❌ docker-compose.yml Syntax-Fehler!"
    echo "   Bitte manuell prüfen"
    exit 1
fi
echo ""

echo "[*] Stoppe Redis Container..."
$DOCKER_COMPOSE_CMD stop redis redis-exporter 2>/dev/null || true
echo "✅ Container gestoppt"
echo ""

echo "[*] Starte Redis Container neu..."
$DOCKER_COMPOSE_CMD up -d redis redis-exporter
echo "✅ Container gestartet"
echo ""

echo "[*] Warte auf Container-Start..."
sleep 5

echo "[*] Prüfe Container-Status..."
if docker ps | grep -q "redis"; then
    echo "✅ Redis Container läuft"
else
    echo "❌ Redis Container läuft NICHT!"
    echo "   Logs:"
    docker-compose logs redis | tail -20
    exit 1
fi
echo ""

echo "[*] Verifiziere Redis-Konfiguration..."
echo ""

# Test ohne Passwort (sollte fehlschlagen)
echo "  Test 1: Verbindung ohne Passwort..."
if $DOCKER_COMPOSE_CMD exec -T redis redis-cli PING 2>&1 | grep -q "NOAUTH"; then
    echo "  ✅ Passwort-Schutz aktiv"
else
    echo "  ⚠️  Passwort-Schutz möglicherweise nicht aktiv"
fi

# Test mit Passwort (sollte funktionieren)
echo "  Test 2: Verbindung mit Passwort..."
if $DOCKER_COMPOSE_CMD exec -T redis redis-cli -a "$REDIS_PASSWORD" PING 2>&1 | grep -q "PONG"; then
    echo "  ✅ Verbindung mit Passwort funktioniert"
else
    echo "  ❌ Verbindung mit Passwort funktioniert NICHT!"
fi

# Test FLUSHALL (sollte deaktiviert sein)
echo "  Test 3: FLUSHALL deaktiviert..."
if $DOCKER_COMPOSE_CMD exec -T redis redis-cli -a "$REDIS_PASSWORD" FLUSHALL 2>&1 | grep -q "unknown command"; then
    echo "  ✅ FLUSHALL ist deaktiviert"
else
    echo "  ⚠️  FLUSHALL ist noch aktiv (redis.conf muss geladen werden)"
fi

# Test Protected Mode
echo "  Test 4: Protected Mode..."
PROTECTED_MODE=$($DOCKER_COMPOSE_CMD exec -T redis redis-cli -a "$REDIS_PASSWORD" CONFIG GET protected-mode 2>/dev/null | grep -v "protected-mode" | tr -d '\r\n ')
if [ "$PROTECTED_MODE" = "yes" ]; then
    echo "  ✅ Protected Mode ist aktiv"
else
    echo "  ⚠️  Protected Mode: $PROTECTED_MODE"
fi

echo ""
echo "========================================"
echo "✅ Fixes angewendet!"
echo "========================================"
echo ""
echo "Nächste Schritte:"
echo "1. Container-Logs prüfen: $DOCKER_COMPOSE_CMD logs redis"
echo "2. Redis-Status prüfen: $DOCKER_COMPOSE_CMD ps redis"
echo "3. redis.conf prüfen: cat redis.conf | grep -E 'requirepass|protected-mode|rename-command'"
echo ""

