#!/usr/bin/env bash
# Chart-Engine Prüfung auf Server 138
#
# Ausführen (Bash/Linux/Mac):
#   ssh root@138.199.237.34 "bash -s" < scripts/verify-chart-engine-138.sh
#
# Ausführen (PowerShell/Windows):
#   Get-Content scripts\verify-chart-engine-138.sh -Raw | ssh root@138.199.237.34 "bash -s"
#
# Oder direkt auf 138: bash verify-chart-engine-138.sh

echo "=== 1. Nginx: Wohin geht /api/chart/? ==="
grep -A 12 "api/chart" /etc/nginx/sites-enabled/mcp.the-connection-key.de 2>/dev/null || \
grep -A 12 "api/chart" /etc/nginx/sites-available/mcp.the-connection-key.de 2>/dev/null || \
echo "Nginx-Config nicht gefunden"

echo ""
echo "=== 2. Laufende Container ==="
docker ps --format "table {{.Names}}\t{{.Ports}}\t{{.Image}}"

echo ""
echo "=== 3. Port 3000 (connection-key) - Chart-API? ==="
curl -s -m 5 -X POST http://127.0.0.1:3000/api/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-01-15","birthTime":"14:30","birthPlace":"Berlin"}' 2>/dev/null | head -3 || echo "Keine Antwort / Fehler"

echo ""
echo "=== 4. Port 4000 (reading-worker) - Chart-API? ==="
curl -s -m 5 -X POST http://127.0.0.1:4000/api/chart/calculate \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-01-15","birthTime":"14:30","birthPlace":"Berlin"}' 2>/dev/null | head -3 || echo "Keine Antwort / Fehler"

CK=$(docker ps --format '{{.Names}}' | grep -E 'connection-key|connection_key' | head -1)
RW=$(docker ps --format '{{.Names}}' | grep -E 'reading-worker|reading_worker' | head -1)

echo ""
echo "=== 5. connection-key ($CK): Chart/astronomy im Code? ==="
if [ -n "$CK" ]; then
  docker exec "$CK" grep -r "chart\|astronomy" /app 2>/dev/null | head -10 || echo "Nichts gefunden"
else
  echo "Container nicht gefunden"
fi

echo ""
echo "=== 6. reading-worker ($RW): Proxy oder eigene Berechnung? ==="
if [ -n "$RW" ]; then
  docker exec "$RW" env 2>/dev/null | grep -E "COACH|CHART|URL" || echo "Keine passenden Env-Vars"
  echo "--- Code (falls zugreifbar): ---"
  grep -n "fetch\|COACH_CHART\|astronomy" /opt/mcp-connection-key/reading-worker/server.js 2>/dev/null | head -15 || echo "Datei nicht lesbar"
else
  echo "Container nicht gefunden"
fi

echo ""
echo "=== 7) Chart-Truth-Service & chartTruthService.ts ==="
if [ -n "$CK" ]; then
  echo "--- chartTruthService / calculateChartSwiss ---"
  docker exec "$CK" find /app -name "*.ts" -o -name "*.js" 2>/dev/null | head -50
  docker exec "$CK" grep -rl "chartTruthService\|calculateChartSwiss\|Chart-Truth" /app 2>/dev/null | head -10
  docker exec "$CK" grep -A 3 "calculateChartSwiss\|chartTruthService" /app 2>/dev/null | head -20
else
  echo "connection-key Container nicht gefunden"
fi
echo "--- Host-Pfade /opt/chart-truth, /opt/bodygraph-engine ---"
ls -la /opt/chart-truth 2>/dev/null || echo "/opt/chart-truth nicht gefunden"
ls -la /opt/bodygraph-engine 2>/dev/null || echo "/opt/bodygraph-engine nicht gefunden"

echo ""
echo "=== 8) chartCalculation.ts / chartCalculationV2.ts / ephemeris ==="
for base in /opt/mcp-connection-key /opt/The-Connection-Key /opt/connection-key /opt/hd-app; do
  for f in chartCalculation.ts chartCalculationV2.ts ephemeris.ts; do
    p=$(find "$base" -name "$f" 2>/dev/null | head -1)
    [ -n "$p" ] && echo "Gefunden: $p" || true
  done
done
[ -z "$(find /opt -name 'chartCalculation*.ts' 2>/dev/null)" ] && echo "Keine chartCalculation*.ts unter /opt gefunden"

echo ""
echo "=== 9) n8n: chart-calculation Workflow & Swiss Ephemeris ==="
N8N=$(docker ps --format '{{.Names}}' | grep -E 'n8n' | head -1)
if [ -n "$N8N" ]; then
  echo "n8n Container: $N8N"
  echo "--- chart-calculation Workflow ---"
  docker exec "$N8N" find / -name "*chart*calculation*" -o -name "*swisseph*" 2>/dev/null | head -15
  docker exec "$N8N" ls -la /home/node/.n8n/ 2>/dev/null | head -10
  echo "--- swisseph in n8n installiert? ---"
  docker exec "$N8N" npm list swisseph 2>/dev/null || docker exec "$N8N" npm list swiss-ephemeris 2>/dev/null || echo "swisseph nicht gefunden"
else
  echo "n8n Container nicht gefunden"
fi
echo "--- Webhook chart-calculation ---"
curl -s -m 3 -X POST http://127.0.0.1:5678/webhook/chart-calculation \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-01-15","birthTime":"14:30","birthPlace":"Berlin"}' 2>/dev/null | head -5 || echo "Webhook nicht erreichbar oder Fehler"

echo ""
echo "=== 10) connection-key: chartRouter / /chart Route ==="
if [ -n "$CK" ]; then
  docker exec "$CK" grep -n "chart\|/chart" /app/connection-key/server.js 2>/dev/null | head -15 || true
  docker exec "$CK" grep -n "chart\|/chart" /app/server.js 2>/dev/null | head -15 || true
  docker exec "$CK" ls -la /app/connection-key/routes/ 2>/dev/null || true
fi

echo ""
echo "=== Ende Prüfung ==="
