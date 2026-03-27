#!/usr/bin/env bash
#
# Prüfskript – AUF Server 138 ausführen
# Prüft: Docker, PM2, Chart-Truth, Reading Agent, V4 Worker, n8n
#
# Auf Server: scp pruef-server-138-auf-server.sh root@138.199.237.34:/opt/mcp-connection-key/
#            ssh root@138.199.237.34 'cd /opt/mcp-connection-key && chmod +x pruef-server-138-auf-server.sh && ./pruef-server-138-auf-server.sh'
#

set -e
echo "========== Server 138 – Lokale Bestandsprüfung =========="
date
echo ""

# ---- 1) Docker Container ----
echo "=== 1) Docker Container ==="
docker ps -a --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null || echo "Docker nicht verfügbar"
echo ""

# ---- 2) MCP Gateway ----
echo "=== 2) MCP Gateway (Port 7000) ==="
if docker ps --format '{{.Names}}' | grep -q mcp-gateway; then
  echo "Container: mcp-gateway läuft"
  curl -s -o /dev/null -w "Health: %{http_code}\n" http://localhost:7000/health 2>/dev/null || echo "Health: nicht erreichbar"
  echo "Agent-Routen in mcp-gateway.js:"
  grep -oE "agentRoutes = \[.*\]" /opt/mcp-connection-key/mcp-gateway.js 2>/dev/null || grep "agent/" /opt/mcp-connection-key/mcp-gateway.js | head -5
else
  echo "mcp-gateway Container nicht gefunden"
fi
echo ""

# ---- 3) Reading Agent (PM2) ----
echo "=== 3) Reading Agent (PM2, Port 4001) ==="
if command -v pm2 >/dev/null 2>&1; then
  pm2 list 2>/dev/null | grep -E "reading|agent" || pm2 list 2>/dev/null
  curl -s -o /dev/null -w "Health: %{http_code}\n" http://localhost:4001/health 2>/dev/null || echo "Port 4001: nicht erreichbar"
else
  echo "PM2 nicht installiert"
fi
echo ""

# ---- 4) V4 Reading Worker ----
echo "=== 4) V4 Reading Worker ==="
V4_CONTAINER=$(docker ps --format '{{.Names}}' | grep -iE 'v4|reading-worker' | head -1 || true)
if [ -n "$V4_CONTAINER" ]; then
  echo "Container: $V4_CONTAINER"
  docker logs "$V4_CONTAINER" --tail 5 2>/dev/null || true
  echo "Templates:"
  docker exec "$V4_CONTAINER" ls -la /app/templates 2>/dev/null || echo "(nicht gefunden)"
  echo "Knowledge:"
  docker exec "$V4_CONTAINER" ls -la /app/knowledge 2>/dev/null | head -10 || echo "(nicht gefunden)"
else
  echo "Kein V4-Container gefunden"
  docker ps -a | grep -i reading || true
fi
echo ""

# ---- 5) n8n ----
echo "=== 5) n8n (Port 5678) ==="
if docker ps --format '{{.Names}}' | grep -q n8n; then
  echo "n8n Container läuft"
  curl -s -o /dev/null -w "n8n UI: %{http_code}\n" http://localhost:5678/ 2>/dev/null || echo "nicht erreichbar"
  echo "BACKEND_URL in n8n:"
  docker exec n8n printenv BACKEND_URL 2>/dev/null || echo "(nicht gesetzt)"
  echo "READING_AGENT_URL in n8n:"
  docker exec n8n printenv READING_AGENT_URL 2>/dev/null || echo "(nicht gesetzt)"
else
  echo "n8n Container nicht gefunden"
fi
echo ""

# ---- 6) connection-key (Chart-Truth) ----
echo "=== 6) connection-key / Chart-Truth ==="
if docker ps --format '{{.Names}}' | grep -q connection-key; then
  echo "connection-key Container läuft"
  # Chart-Truth von außen: connection-key exponiert 3000 intern, nginx proxy?
  curl -s -o /dev/null -w "localhost:3000: %{http_code}\n" http://localhost:3000/ 2>/dev/null || echo "localhost:3000: nicht erreichbar (evtl. nur intern)"
else
  echo "connection-key Container nicht gefunden"
fi
echo ""

# ---- 7) Chart-Berechnung testen ----
echo "=== 7) Chart-Berechnung (Chart-Truth) ==="
CHART_JSON='{"birth_date":"1990-05-15","birth_time":"14:30","latitude":52.52,"longitude":13.405,"timezone":"Europe/Berlin"}'
# Versuche connection-key (intern)
for url in "http://connection-key:3000/api/chart/truth" "http://localhost:3000/api/chart/truth"; do
  HTTP=$(curl -s -o /tmp/chart-response.json -w "%{http_code}" -X POST "$url" -H "Content-Type: application/json" -d "$CHART_JSON" 2>/dev/null || echo "000")
  if [ "$HTTP" = "200" ]; then
    echo "Chart-Truth OK ($url): HTTP $HTTP"
    if [ -f /tmp/chart-response.json ]; then
      echo "  type: $(jq -r '.core.type // "?"' /tmp/chart-response.json 2>/dev/null)"
      echo "  profile: $(jq -r '.core.profile // "?"' /tmp/chart-response.json 2>/dev/null)"
      echo "  chart_id: $(jq -r '.chart_id // "?"' /tmp/chart-response.json 2>/dev/null)"
    fi
    break
  else
    echo "Chart-Truth $url: HTTP $HTTP"
  fi
done
echo ""

# ---- 8) Nginx / Domains ----
echo "=== 8) Nginx / Domains ==="
if [ -d /etc/nginx/sites-enabled ]; then
  echo "Nginx server_name:"
  grep -rh "server_name" /etc/nginx/sites-enabled/ 2>/dev/null | grep -v "^\s*#" | sort -u
else
  echo "Nginx sites-enabled nicht gefunden"
fi
echo ""

echo "========== Ende =========="
