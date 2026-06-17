#!/bin/bash
# Erstellt .env Datei direkt auf dem Hetzner Server

cd /opt/mcp-connection-key

echo "📝 Erstelle .env Datei..."
echo ""

# Prüfe ob .env bereits existiert
if [ -f .env ]; then
    echo "⚠️  .env existiert bereits!"
    read -p "Möchten Sie sie überschreiben? (j/N): " overwrite
    if [[ ! "$overwrite" =~ ^[Jj]$ ]]; then
        echo "Abgebrochen."
        exit 0
    fi
fi

# OpenAI API Key abfragen
echo "Bitte geben Sie Ihre Konfiguration ein:"
echo ""
read -p "OpenAI API Key (ERFORDERLICH): " openai_key
if [ -z "$openai_key" ]; then
    echo "❌ OpenAI API Key ist erforderlich!"
    exit 1
fi

# n8n Passwort
read -p "n8n Passwort (leer = automatisch generieren): " n8n_pass
if [ -z "$n8n_pass" ]; then
    n8n_pass=$(openssl rand -hex 16)
    echo "✅ n8n Passwort generiert: $n8n_pass"
fi

# API Key
read -p "API Key (leer = automatisch generieren): " api_key
if [ -z "$api_key" ]; then
    api_key=$(openssl rand -hex 32)
    echo "✅ API Key generiert: $api_key"
fi

# JWT Secret generieren
jwt_secret=$(openssl rand -hex 32)

# .env Datei erstellen
cat > .env << EOF
# ============================================
# ERFORDERLICH
# ============================================
OPENAI_API_KEY=$openai_key
N8N_PASSWORD=$n8n_pass
API_KEY=$api_key

# ============================================
# URLs (Docker interne Namen)
# ============================================
N8N_BASE_URL=http://n8n:5678
MCP_SERVER_URL=http://mcp-server:7777
CHATGPT_AGENT_URL=http://chatgpt-agent:4000
CONNECTION_KEY_URL=http://connection-key:3000

# ============================================
# Server Ports
# ============================================
PORT=3000

# ============================================
# Authentication
# ============================================
AUTH_ENABLED=true
JWT_SECRET=$jwt_secret
JWT_EXPIRES_IN=24h

# ============================================
# CORS
# ============================================
CORS_ORIGINS=*

# ============================================
# Environment
# ============================================
NODE_ENV=production
LOG_LEVEL=info
LOG_FORMAT=json

# ============================================
# Rate Limiting
# ============================================
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
EOF

# Berechtigungen setzen
chmod 600 .env

echo ""
echo "✅ .env Datei erstellt!"
echo ""
echo "Wichtige Werte:"
echo "  - n8n Passwort: $n8n_pass"
echo "  - API Key: $api_key"
echo ""
echo "⚠️  Bitte notieren Sie sich diese Werte!"
echo ""

