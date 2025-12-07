#!/bin/bash
# Erstellt .env Datei mit automatisch generierten Passwörtern

cd /opt/mcp-connection-key

echo "📝 Erstelle .env Datei mit automatisch generierten Passwörtern..."
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

# Automatisch sichere Passwörter generieren
echo ""
echo "🔐 Generiere sichere Passwörter..."
N8N_PASS=$(openssl rand -hex 16)
API_KEY=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)

echo "✅ Passwörter generiert!"
echo ""

# .env Datei erstellen
cat > .env << EOF
# ============================================
# ERFORDERLICH
# ============================================
OPENAI_API_KEY=$openai_key
N8N_PASSWORD=$N8N_PASS
API_KEY=$API_KEY

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
JWT_SECRET=$JWT_SECRET
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

echo "✅ .env Datei erstellt!"
echo ""
echo "=========================================="
echo "⚠️  WICHTIG: Notieren Sie sich diese Werte!"
echo "=========================================="
echo ""
echo "n8n Passwort: $N8N_PASS"
echo "API Key:      $API_KEY"
echo "JWT Secret:   $JWT_SECRET"
echo ""
echo "=========================================="
echo ""
echo "💡 Tipp: Speichern Sie diese Werte sicher!"
echo "   Sie benötigen das n8n Passwort für den Login."
echo ""

