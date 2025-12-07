#!/bin/bash
# Deaktiviert den MCP Server in docker-compose.yml

cd /opt/mcp-connection-key

echo "🛑 Deaktiviere MCP Server..."
echo ""

# 1. Container stoppen und entfernen
echo "1. Stoppe MCP Server Container..."
docker-compose stop mcp-server 2>/dev/null || true
docker-compose rm -f mcp-server 2>/dev/null || true
echo "✅ Container gestoppt"
echo ""

# 2. Backup erstellen
echo "2. Erstelle Backup von docker-compose.yml..."
cp docker-compose.yml docker-compose.yml.backup
echo "✅ Backup erstellt: docker-compose.yml.backup"
echo ""

# 3. docker-compose.yml anpassen
echo "3. Passe docker-compose.yml an..."

# Erstelle neue docker-compose.yml ohne mcp-server
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  # n8n - Workflow Engine
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD:-change-me}
      - N8N_HOST=${N8N_HOST:-localhost}
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
    volumes:
      - n8n_data:/home/node/.n8n
    restart: unless-stopped
    networks:
      - app-network

  # ChatGPT-Agent - KI-Gehirn
  chatgpt-agent:
    build:
      context: .
      dockerfile: Dockerfile.agent
    container_name: chatgpt-agent
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - N8N_BASE_URL=http://n8n:5678
      - PORT=4000
    depends_on:
      - n8n
    restart: unless-stopped
    networks:
      - app-network

  # Connection-Key Server - Zentrale API
  connection-key:
    build:
      context: .
      dockerfile: Dockerfile.connection-key
    container_name: connection-key
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - CHATGPT_AGENT_URL=http://chatgpt-agent:4000
      - N8N_BASE_URL=http://n8n:5678
      - AUTH_ENABLED=${AUTH_ENABLED:-true}
      - API_KEY=${API_KEY:-}
      - CORS_ORIGINS=${CORS_ORIGINS:-*}
    depends_on:
      - chatgpt-agent
      - n8n
    restart: unless-stopped
    networks:
      - app-network

volumes:
  n8n_data:

networks:
  app-network:
    driver: bridge
EOF

echo "✅ docker-compose.yml angepasst"
echo ""

# 4. Services neu starten
echo "4. Starte Services neu..."
docker-compose up -d
echo ""

# 5. Status prüfen
echo "5. Prüfe Status..."
sleep 5
docker-compose ps
echo ""

echo "✅ MCP Server wurde deaktiviert!"
echo ""
echo "Hinweis:"
echo "  - MCP Server wird lokal mit Cursor IDE verwendet"
echo "  - Auf Hetzner laufen jetzt nur: n8n, chatgpt-agent, connection-key"
echo ""
echo "Falls Sie die Änderung rückgängig machen möchten:"
echo "  cp docker-compose.yml.backup docker-compose.yml"
echo "  docker-compose up -d"

