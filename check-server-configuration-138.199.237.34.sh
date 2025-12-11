#!/bin/bash

# Kompletter Server-Konfigurations-Check für 138.199.237.34
# Führt auf Server aus (138.199.237.34)

echo "🔍 Server-Konfiguration Check: 138.199.237.34"
echo "=============================================="
echo ""

# 1. System-Info
echo "1. System-Informationen:"
echo "----------------------"
echo "   Hostname: $(hostname)"
echo "   IP-Adresse: $(hostname -I | awk '{print $1}')"
echo "   OS: $(lsb_release -d | cut -f2)"
echo "   Uptime: $(uptime -p)"
echo ""

# 2. MCP Server
echo "2. MCP Server (Port 7000):"
echo "--------------------------"
if systemctl is-active --quiet mcp; then
    echo "   ✅ Status: Läuft"
    echo "   Service: $(systemctl is-enabled mcp)"
    echo "   Verzeichnis: /opt/mcp"
    
    # Health Check
    if curl -s http://localhost:7000/health > /dev/null; then
        echo "   ✅ Health Check: OK"
        HEALTH=$(curl -s http://localhost:7000/health)
        echo "   Response: $HEALTH"
    else
        echo "   ❌ Health Check: FEHLER"
    fi
    
    # Agenten-Liste
    echo ""
    echo "   Verfügbare Agenten:"
    AGENTS=$(curl -s http://localhost:7000/agents 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo "$AGENTS" | jq -r '.agents[] | "      - \(.id): \(.name)"' 2>/dev/null || echo "      (JSON-Parse-Fehler)"
    else
        echo "      ❌ Konnte Agenten nicht abrufen"
    fi
else
    echo "   ❌ Status: Läuft NICHT"
    echo "   📝 Start: systemctl start mcp"
fi
echo ""

# 3. Reading Agent
echo "3. Reading Agent (Port 4001):"
echo "-----------------------------"
if pm2 list | grep -q "reading-agent.*online"; then
    echo "   ✅ Status: Läuft (PM2)"
    PM2_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="reading-agent") | "      - Status: \(.pm2_env.status)\n      - Restarts: \(.pm2_env.restart_time)\n      - Uptime: \(.pm2_env.pm_uptime)"' 2>/dev/null)
    echo "$PM2_STATUS"
    
    # Health Check
    if curl -s http://localhost:4001/health > /dev/null; then
        echo "   ✅ Health Check: OK"
        HEALTH=$(curl -s http://localhost:4001/health)
        echo "   Response: $HEALTH"
    else
        echo "   ❌ Health Check: FEHLER"
    fi
    
    # Verzeichnisse prüfen
    echo ""
    echo "   Verzeichnisse:"
    if [ -d "/opt/mcp-connection-key/production/knowledge" ]; then
        KNOWLEDGE_COUNT=$(find /opt/mcp-connection-key/production/knowledge -type f | wc -l)
        echo "      ✅ Knowledge: $KNOWLEDGE_COUNT Dateien"
    else
        echo "      ❌ Knowledge-Verzeichnis fehlt"
    fi
    
    if [ -d "/opt/mcp-connection-key/production/templates" ]; then
        TEMPLATE_COUNT=$(find /opt/mcp-connection-key/production/templates -type f | wc -l)
        echo "      ✅ Templates: $TEMPLATE_COUNT Dateien"
    else
        echo "      ❌ Templates-Verzeichnis fehlt"
    fi
else
    echo "   ❌ Status: Läuft NICHT"
    echo "   📝 Start: pm2 start reading-agent"
fi
echo ""

# 4. Docker Services
echo "4. Docker Services:"
echo "------------------"
cd /opt/mcp-connection-key 2>/dev/null || echo "   ⚠️  Verzeichnis /opt/mcp-connection-key nicht gefunden"

if [ -f "docker-compose.yml" ]; then
    echo "   ✅ docker-compose.yml vorhanden"
    echo ""
    echo "   Container-Status:"
    docker compose ps 2>/dev/null || docker-compose ps 2>/dev/null
    
    echo ""
    echo "   Services:"
    if docker ps | grep -q n8n; then
        echo "      ✅ n8n: Läuft"
    else
        echo "      ❌ n8n: Läuft NICHT"
    fi
    
    if docker ps | grep -q chatgpt-agent; then
        echo "      ✅ chatgpt-agent: Läuft"
    else
        echo "      ❌ chatgpt-agent: Läuft NICHT"
    fi
    
    if docker ps | grep -q connection-key; then
        echo "      ✅ connection-key: Läuft"
    else
        echo "      ❌ connection-key: Läuft NICHT"
    fi
else
    echo "   ❌ docker-compose.yml nicht gefunden"
fi
echo ""

# 5. Agent-Konfigurationen
echo "5. Agent-Konfigurationen:"
echo "------------------------"
AGENT_DIR="/opt/ck-agent/agents"
PROMPT_DIR="/opt/ck-agent/prompts"

if [ -d "$AGENT_DIR" ]; then
    AGENT_COUNT=$(find $AGENT_DIR -name "*.json" | wc -l)
    echo "   ✅ Agent-Configs: $AGENT_COUNT Dateien"
    echo ""
    echo "   Verfügbare Agenten:"
    for agent_file in $AGENT_DIR/*.json; do
        if [ -f "$agent_file" ]; then
            AGENT_ID=$(jq -r '.id' "$agent_file" 2>/dev/null)
            AGENT_NAME=$(jq -r '.name' "$agent_file" 2>/dev/null)
            echo "      - $AGENT_ID: $AGENT_NAME"
        fi
    done
else
    echo "   ❌ Agent-Verzeichnis nicht gefunden: $AGENT_DIR"
fi

echo ""
if [ -d "$PROMPT_DIR" ]; then
    PROMPT_COUNT=$(find $PROMPT_DIR -name "*.txt" | wc -l)
    echo "   ✅ Prompts: $PROMPT_COUNT Dateien"
else
    echo "   ❌ Prompt-Verzeichnis nicht gefunden: $PROMPT_DIR"
fi
echo ""

# 6. Environment Variables
echo "6. Environment Variables:"
echo "------------------------"
ENV_FILE="/opt/mcp-connection-key/.env"
if [ -f "$ENV_FILE" ]; then
    echo "   ✅ .env vorhanden"
    echo ""
    echo "   Wichtige Variablen:"
    if grep -q "OPENAI_API_KEY" "$ENV_FILE"; then
        echo "      ✅ OPENAI_API_KEY: Gesetzt"
    else
        echo "      ❌ OPENAI_API_KEY: FEHLT"
    fi
    
    if grep -q "N8N_PASSWORD" "$ENV_FILE"; then
        echo "      ✅ N8N_PASSWORD: Gesetzt"
    else
        echo "      ❌ N8N_PASSWORD: FEHLT"
    fi
    
    if grep -q "AGENT_SYSTEM_TOKEN" "$ENV_FILE"; then
        echo "      ✅ AGENT_SYSTEM_TOKEN: Gesetzt"
    else
        echo "      ⚠️  AGENT_SYSTEM_TOKEN: Nicht gesetzt (optional)"
    fi
else
    echo "   ❌ .env Datei nicht gefunden: $ENV_FILE"
fi
echo ""

# 7. Netzwerk & Ports
echo "7. Netzwerk & Ports:"
echo "-------------------"
echo "   Offene Ports:"
for port in 7000 4001 5678 4000 3000; do
    if netstat -tuln 2>/dev/null | grep -q ":$port " || ss -tuln 2>/dev/null | grep -q ":$port "; then
        echo "      ✅ Port $port: Offen"
    else
        echo "      ❌ Port $port: Geschlossen oder nicht erreichbar"
    fi
done
echo ""

# 8. Disk Space
echo "8. Disk Space:"
echo "-------------"
df -h | grep -E "/opt|/var" | awk '{print "   " $1 ": " $3 " / " $2 " (" $5 " belegt)"}'
echo ""

# 9. Memory
echo "9. Memory:"
echo "----------"
free -h | awk 'NR==2{print "   RAM: " $3 " / " $2 " (" int($3/$2*100) "% belegt)"}'
echo ""

# 10. Logs (letzte Fehler)
echo "10. Letzte Fehler (Logs):"
echo "-------------------------"
echo "   MCP Server (letzte 5 Zeilen):"
journalctl -u mcp -n 5 --no-pager 2>/dev/null | tail -5 | sed 's/^/      /' || echo "      (Keine Logs)"
echo ""

echo "   Reading Agent (letzte 5 Zeilen):"
pm2 logs reading-agent --lines 5 --nostream 2>/dev/null | tail -5 | sed 's/^/      /' || echo "      (Keine Logs)"
echo ""

# 11. Zusammenfassung
echo "11. Zusammenfassung:"
echo "-------------------"
echo ""

# Zähle laufende Services
RUNNING_SERVICES=0
TOTAL_SERVICES=5

if systemctl is-active --quiet mcp; then
    RUNNING_SERVICES=$((RUNNING_SERVICES + 1))
fi

if pm2 list | grep -q "reading-agent.*online"; then
    RUNNING_SERVICES=$((RUNNING_SERVICES + 1))
fi

if docker ps | grep -q n8n; then
    RUNNING_SERVICES=$((RUNNING_SERVICES + 1))
fi

if docker ps | grep -q chatgpt-agent; then
    RUNNING_SERVICES=$((RUNNING_SERVICES + 1))
fi

if docker ps | grep -q connection-key; then
    RUNNING_SERVICES=$((RUNNING_SERVICES + 1))
fi

echo "   Services: $RUNNING_SERVICES / $TOTAL_SERVICES laufen"
echo ""

if [ $RUNNING_SERVICES -eq $TOTAL_SERVICES ]; then
    echo "   ✅ Alle Services laufen!"
else
    echo "   ⚠️  Einige Services laufen nicht"
    echo ""
    echo "   📝 Nächste Schritte:"
    echo "      1. Prüfe fehlende Services oben"
    echo "      2. Starte fehlende Services:"
    echo "         - MCP: systemctl start mcp"
    echo "         - Reading Agent: pm2 start reading-agent"
    echo "         - Docker: docker compose up -d"
fi

echo ""
echo "✅ Status-Check abgeschlossen!"
