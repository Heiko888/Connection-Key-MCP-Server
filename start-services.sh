#!/bin/bash

# ============================================
# Services starten - Einfache Version
# ============================================
# Führt alle notwendigen Schritte aus, um Services zu starten
# ============================================

set -e

cd /opt/mcp-connection-key

echo "🚀 Starte Services..."
echo ""

# 1. Prüfe ob .env existiert
if [ ! -f .env ]; then
    echo "⚠️  .env Datei fehlt!"
    
    if [ -f .env.example ]; then
        echo "📋 Erstelle .env von .env.example..."
        cp .env.example .env
        chmod 600 .env
        echo "✅ .env erstellt"
        echo ""
        echo "⚠️  WICHTIG: Sie müssen jetzt .env bearbeiten!"
        echo "   Mindestens diese Werte setzen:"
        echo "   - OPENAI_API_KEY"
        echo "   - N8N_PASSWORD"
        echo "   - API_KEY"
        echo ""
        read -p "Drücken Sie Enter nachdem Sie .env bearbeitet haben (nano .env)..." 
    else
        echo "❌ .env.example nicht gefunden!"
        echo "Erstelle minimale .env..."
        
        read -p "OpenAI API Key: " openai_key
        if [ -z "$openai_key" ]; then
            echo "❌ OpenAI API Key ist erforderlich!"
            exit 1
        fi
        
        n8n_pass=$(openssl rand -hex 16)
        api_key=$(openssl rand -hex 32)
        jwt_secret=$(openssl rand -hex 32)
        
        cat > .env << EOF
# ERFORDERLICH
OPENAI_API_KEY=$openai_key
N8N_PASSWORD=$n8n_pass
API_KEY=$api_key

# URLs (Docker interne Namen)
N8N_BASE_URL=http://n8n:5678
MCP_SERVER_URL=http://mcp-server:7777
CHATGPT_AGENT_URL=http://chatgpt-agent:4000
CONNECTION_KEY_URL=http://connection-key:3000

# Server Ports
PORT=3000

# Authentication
AUTH_ENABLED=true
JWT_SECRET=$jwt_secret
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGINS=*

# Environment
NODE_ENV=production
LOG_LEVEL=info
LOG_FORMAT=json

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
EOF
        
        chmod 600 .env
        echo "✅ .env erstellt"
        echo "n8n Passwort: $n8n_pass"
        echo "API Key: $api_key"
    fi
else
    echo "✅ .env Datei vorhanden"
fi

echo ""

# 2. Prüfe Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker ist nicht installiert!"
    exit 1
fi

if ! systemctl is-active --quiet docker; then
    echo "🔄 Starte Docker..."
    systemctl start docker
fi

echo "✅ Docker läuft"
echo ""

# 3. Stoppe alte Container
echo "🧹 Stoppe alte Container..."
docker-compose down 2>/dev/null || true
echo ""

# 4. Baue Images
echo "🔨 Baue Docker Images..."
docker-compose build
echo ""

# 5. Starte Services
echo "🚀 Starte Services..."
docker-compose up -d
echo ""

# 6. Warte bis Services hochgefahren sind
echo "⏳ Warte 15 Sekunden bis Services hochgefahren sind..."
sleep 15
echo ""

# 7. Zeige Status
echo "📊 Container Status:"
docker-compose ps
echo ""

# 8. Health Checks
echo "🏥 Health Checks:"
echo -n "Connection-Key (3000): "
curl -f -s http://localhost:3000/health > /dev/null 2>&1 && echo "✅ OK" || echo "❌ Nicht erreichbar"

echo -n "ChatGPT-Agent (4000): "
curl -f -s http://localhost:4000/health > /dev/null 2>&1 && echo "✅ OK" || echo "❌ Nicht erreichbar"

echo -n "n8n (5678): "
curl -f -s http://localhost:5678/healthz > /dev/null 2>&1 && echo "✅ OK" || echo "❌ Nicht erreichbar"

echo ""
echo "✅ Fertig!"
echo ""
echo "Nützliche Befehle:"
echo "  - Logs:    docker-compose logs -f"
echo "  - Status:  docker-compose ps"
echo "  - Stop:    docker-compose down"
echo "  - Restart: docker-compose restart"

