#!/bin/bash

# ============================================
# Redis Finale Verifikation
# ============================================

REDIS_PASSWORD="IJnAscu6TbR7mtarXKoFE3NGd2Q1xBi5"

echo "========================================"
echo "Redis Finale Verifikation"
echo "========================================"
echo ""

# Test 1: Ohne Passwort (sollte fehlschlagen)
echo "[*] Test 1: Verbindung ohne Passwort..."
RESULT1=$(docker compose exec -T redis redis-cli PING 2>&1)
if echo "$RESULT1" | grep -q "NOAUTH"; then
    echo "✅ PASS: Passwort-Schutz ist aktiv"
else
    echo "❌ FAIL: Passwort-Schutz nicht aktiv"
    echo "   Ergebnis: $RESULT1"
fi
echo ""

# Test 2: Mit Passwort (sollte funktionieren)
echo "[*] Test 2: Verbindung mit Passwort..."
RESULT2=$(docker compose exec -T redis redis-cli -a "$REDIS_PASSWORD" PING 2>&1)
if echo "$RESULT2" | grep -q "PONG"; then
    echo "✅ PASS: Verbindung mit Passwort funktioniert"
else
    echo "❌ FAIL: Verbindung mit Passwort funktioniert nicht"
    echo "   Ergebnis: $RESULT2"
fi
echo ""

# Test 3: FLUSHALL deaktiviert
echo "[*] Test 3: FLUSHALL deaktiviert..."
RESULT3=$(docker compose exec -T redis redis-cli -a "$REDIS_PASSWORD" FLUSHALL 2>&1)
if echo "$RESULT3" | grep -q "unknown command"; then
    echo "✅ PASS: FLUSHALL ist deaktiviert"
else
    echo "⚠️  WARN: FLUSHALL ist noch aktiv"
    echo "   Ergebnis: $RESULT3"
fi
echo ""

# Test 4: FLUSHDB deaktiviert
echo "[*] Test 4: FLUSHDB deaktiviert..."
RESULT4=$(docker compose exec -T redis redis-cli -a "$REDIS_PASSWORD" FLUSHDB 2>&1)
if echo "$RESULT4" | grep -q "unknown command"; then
    echo "✅ PASS: FLUSHDB ist deaktiviert"
else
    echo "⚠️  WARN: FLUSHDB ist noch aktiv"
    echo "   Ergebnis: $RESULT4"
fi
echo ""

# Test 5: Protected Mode
echo "[*] Test 5: Protected Mode..."
PROTECTED_MODE=$(docker compose exec -T redis redis-cli -a "$REDIS_PASSWORD" CONFIG GET protected-mode 2>/dev/null | grep -v "protected-mode" | tr -d '\r\n ')
if [ "$PROTECTED_MODE" = "yes" ]; then
    echo "✅ PASS: Protected Mode ist aktiv"
else
    echo "⚠️  WARN: Protected Mode: $PROTECTED_MODE"
fi
echo ""

# Test 6: Max Memory
echo "[*] Test 6: Max Memory..."
MAX_MEMORY=$(docker compose exec -T redis redis-cli -a "$REDIS_PASSWORD" CONFIG GET maxmemory 2>/dev/null | grep -v "maxmemory" | tr -d '\r\n ')
if [ "$MAX_MEMORY" = "536870912" ]; then
    echo "✅ PASS: Max Memory ist auf 512MB gesetzt"
else
    echo "⚠️  INFO: Max Memory: $MAX_MEMORY"
fi
echo ""

# Test 7: Container-Status
echo "[*] Test 7: Container-Status..."
CONTAINER_STATUS=$(docker compose ps redis --format "{{.Status}}")
if echo "$CONTAINER_STATUS" | grep -q "Up"; then
    echo "✅ PASS: Container läuft"
    echo "   Status: $CONTAINER_STATUS"
else
    echo "❌ FAIL: Container läuft nicht"
    echo "   Status: $CONTAINER_STATUS"
fi
echo ""

# Test 8: Port nicht öffentlich
echo "[*] Test 8: Port-Binding..."
PORT_BINDING=$(docker compose ps redis --format "{{.Ports}}")
if echo "$PORT_BINDING" | grep -q "6379/tcp" && ! echo "$PORT_BINDING" | grep -q "0.0.0.0:6379"; then
    echo "✅ PASS: Port ist nicht öffentlich exponiert"
    echo "   Ports: $PORT_BINDING"
else
    echo "⚠️  WARN: Port-Binding: $PORT_BINDING"
fi
echo ""

echo "========================================"
echo "Verifikation abgeschlossen!"
echo "========================================"


