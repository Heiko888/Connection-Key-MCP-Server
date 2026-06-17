#!/bin/bash
echo "========== Reading Worker & Knowledge Deep-Dive (Server 138) =========="
date

echo ""
echo "=== 1) Reading Worker – Container-Infos ==="
echo "--- Env-Variablen (sensible Werte geschwärzt) ---"
docker exec reading-worker env 2>/dev/null | grep -iE 'URL|KEY|HOST|PORT|MODEL|SUPABASE|ANTHROPIC|OPENAI|REDIS|DB|DATABASE|BUCKET|TEMPLATE|KNOWLEDGE|AGENT|MCP|WEBHOOK|N8N|QUEUE' | sed 's/\(KEY\|SECRET\|TOKEN\|PASSWORD\|ANON\)=.*/\1=***REDACTED***/' | sort

echo ""
echo "--- Container Prozesse ---"
docker exec reading-worker ps aux 2>/dev/null || docker exec reading-worker top -bn1 2>/dev/null || echo "ps nicht verfügbar"

echo ""
echo "=== 2) Reading Worker – Dateistruktur ==="
echo "--- Root-Verzeichnis ---"
docker exec reading-worker ls -la / 2>/dev/null
echo ""
echo "--- App-Verzeichnis ---"
docker exec reading-worker find /app -maxdepth 2 -type f -name "*.js" -o -name "*.ts" -o -name "*.json" -o -name "*.mjs" -o -name "*.yml" -o -name "*.yaml" 2>/dev/null | head -80
echo ""
echo "--- Src-Verzeichnis (falls vorhanden) ---"
docker exec reading-worker find /app/src -maxdepth 3 -type f 2>/dev/null | head -80

echo ""
echo "=== 3) Knowledge-Verzeichnisse ==="
echo "--- Suche nach knowledge/data/templates Ordnern ---"
docker exec reading-worker find / -maxdepth 5 -type d -iname "*knowledge*" -o -type d -iname "*template*" -o -type d -iname "*brandbook*" -o -type d -iname "*data*" 2>/dev/null | grep -v node_modules | grep -v proc | grep -v sys
echo ""
echo "--- Knowledge Dateien (Inhalt + Größe) ---"
docker exec reading-worker find / -maxdepth 5 -path "*/knowledge/*" -type f 2>/dev/null | grep -v node_modules | while read f; do
  size=$(docker exec reading-worker wc -c < "$f" 2>/dev/null)
  echo "  $f ($size bytes)"
done
echo ""
echo "--- Template Dateien (Inhalt + Größe) ---"
docker exec reading-worker find / -maxdepth 5 -path "*/template*/*" -type f 2>/dev/null | grep -v node_modules | while read f; do
  size=$(docker exec reading-worker wc -c < "$f" 2>/dev/null)
  echo "  $f ($size bytes)"
done
echo ""
echo "--- Brandbook ---"
docker exec reading-worker find / -maxdepth 5 -path "*/brandbook/*" -type f 2>/dev/null | grep -v node_modules

echo ""
echo "=== 4) Reading Worker – package.json ==="
docker exec reading-worker cat /app/package.json 2>/dev/null || echo "Nicht gefunden"

echo ""
echo "=== 5) Reading Worker – Hauptdatei(en) ==="
echo "--- Einstiegspunkt ---"
docker exec reading-worker cat /app/package.json 2>/dev/null | grep -E '"main"|"start"|"scripts"' 
echo ""
echo "--- index/server/app Dateien ---"
for f in index.js index.mjs server.js app.js main.js worker.js; do
  if docker exec reading-worker test -f /app/$f 2>/dev/null; then
    echo "=== /app/$f ==="
    docker exec reading-worker cat /app/$f 2>/dev/null
    echo ""
  fi
  if docker exec reading-worker test -f /app/src/$f 2>/dev/null; then
    echo "=== /app/src/$f ==="
    docker exec reading-worker cat /app/src/$f 2>/dev/null
    echo ""
  fi
done

echo ""
echo "=== 6) Reading Worker – Routen/Endpoints ==="
echo "--- Suche nach Express/Fastify Routen ---"
docker exec reading-worker grep -rn "app\.\(get\|post\|put\|delete\|use\|route\)\|router\.\(get\|post\|put\|delete\|use\)" /app/src/ /app/*.js 2>/dev/null | grep -v node_modules | head -60
echo ""
echo "--- Health Endpoint Test ---"
curl -s http://localhost:4000/health 2>/dev/null | head -20
echo ""
echo "--- Root Endpoint ---"
curl -s http://localhost:4000/ 2>/dev/null | head -20

echo ""
echo "=== 7) Reading Worker – Externe Verbindungen ==="
echo "--- Suche nach fetch/axios/http Calls ---"
docker exec reading-worker grep -rn "fetch\|axios\|http\.\|https\.\|supabase\|anthropic\|openai\|redis\|createClient" /app/src/ /app/*.js 2>/dev/null | grep -v node_modules | grep -v "\.map:" | head -60

echo ""
echo "=== 8) Alle anderen Worker/Services ==="
echo "--- sync-reading-service Env ---"
docker exec sync-reading-service env 2>/dev/null | grep -iE 'URL|KEY|HOST|PORT|MODEL|SUPABASE|ANTHROPIC|REDIS|MCP|QUEUE' | sed 's/\(KEY\|SECRET\|TOKEN\|PASSWORD\|ANON\)=.*/\1=***REDACTED***/' | sort
echo ""
echo "--- sync-reading-service package.json ---"
docker exec sync-reading-service cat /app/package.json 2>/dev/null || echo "Nicht gefunden"
echo ""
echo "--- sync-reading-service Routen ---"
docker exec sync-reading-service grep -rn "app\.\(get\|post\|put\|delete\|use\)\|router\.\(get\|post\|put\|delete\)" /app/src/ /app/*.js 2>/dev/null | grep -v node_modules | head -40
echo ""
echo "--- sync-reading-service Health ---"
curl -s http://localhost:7001/health 2>/dev/null | head -20

echo ""
echo "=== 9) connection-key Backend Routen ==="
echo "--- Routen-Dateien ---"
docker exec connection-key find /app -maxdepth 4 -type f -name "*route*" -o -name "*router*" -o -name "*controller*" -o -name "*handler*" 2>/dev/null | grep -v node_modules | head -40
echo ""
echo "--- API Endpoints ---"
docker exec connection-key grep -rn "app\.\(get\|post\|put\|delete\|use\)\|router\.\(get\|post\|put\|delete\)" /app/src/ /app/routes/ 2>/dev/null | grep -v node_modules | head -60
echo ""
echo "--- connection-key Env ---"
docker exec connection-key env 2>/dev/null | grep -iE 'URL|KEY|HOST|PORT|SUPABASE|ANTHROPIC|REDIS|MCP|CHART|GEOCOD' | sed 's/\(KEY\|SECRET\|TOKEN\|PASSWORD\|ANON\)=.*/\1=***REDACTED***/' | sort

echo ""
echo "=== 10) MCP Gateway – Vollständige Agent-Config ==="
docker exec mcp-gateway cat /app/mcp-gateway.js 2>/dev/null || docker exec mcp-gateway cat /app/src/mcp-gateway.js 2>/dev/null || echo "Nicht gefunden"

echo ""
echo "=== 11) Docker-Compose (aktuelle) ==="
cat /opt/mcp-connection-key/docker-compose.yml 2>/dev/null | head -200

echo ""
echo "=== 12) Disk Usage ==="
echo "--- Docker Images ---"
docker system df 2>/dev/null
echo ""
echo "--- Größte Container Volumes ---"
docker system df -v 2>/dev/null | head -30

echo ""
echo "========== Ende =========="
