#!/bin/bash

# Script zum Korrigieren der CK_AGENT_URL auf dem CK-App Server
# Setzt CK_AGENT_URL auf den MCP Server (138.199.237.34:4001)

echo "🔧 Korrigiere CK_AGENT_URL auf CK-App Server..."
echo ""

# CK-App Server
CK_APP_SERVER="root@167.235.224.149"
FRONTEND_DIR="/opt/hd-app/The-Connection-Key/frontend"
ENV_FILE=".env.local"

echo "📋 Prüfe Umgebungsvariablen auf CK-App Server..."

# Prüfe und setze CK_AGENT_URL
ssh "$CK_APP_SERVER" << 'EOF'
cd /opt/hd-app/The-Connection-Key/frontend

ENV_FILE=".env.local"

# Erstelle .env.local falls nicht vorhanden
if [ ! -f "$ENV_FILE" ]; then
    echo "   📝 Erstelle $ENV_FILE..."
    touch "$ENV_FILE"
fi

# Entferne alte CK_AGENT_URL Einträge (falls vorhanden)
if grep -q "CK_AGENT_URL" "$ENV_FILE"; then
    echo "   🔄 Entferne alte CK_AGENT_URL..."
    sed -i '/^CK_AGENT_URL=/d' "$ENV_FILE"
fi

# Entferne alte agent.the-connection-key.de Einträge
if grep -q "agent.the-connection-key.de" "$ENV_FILE"; then
    echo "   🔄 Entferne alte agent.the-connection-key.de Einträge..."
    sed -i '/agent.the-connection-key.de/d' "$ENV_FILE"
fi

# Füge korrekte CK_AGENT_URL hinzu
echo "   ➕ Füge CK_AGENT_URL hinzu..."
echo "CK_AGENT_URL=http://138.199.237.34:4001" >> "$ENV_FILE"

# Prüfe auch READING_AGENT_URL
if ! grep -q "^READING_AGENT_URL=" "$ENV_FILE"; then
    echo "   ➕ Füge READING_AGENT_URL hinzu..."
    echo "READING_AGENT_URL=http://138.199.237.34:4001" >> "$ENV_FILE"
else
    echo "   ✅ READING_AGENT_URL bereits vorhanden"
    # Aktualisiere READING_AGENT_URL falls auf falsche URL
    sed -i 's|^READING_AGENT_URL=.*|READING_AGENT_URL=http://138.199.237.34:4001|' "$ENV_FILE"
fi

echo ""
echo "   ✅ Umgebungsvariablen aktualisiert:"
echo ""
grep -E "^(CK_AGENT_URL|READING_AGENT_URL)=" "$ENV_FILE"
EOF

echo ""
echo "✅ CK_AGENT_URL korrigiert!"
echo ""
echo "📋 Nächste Schritte:"
echo "   1. Next.js App neu starten:"
echo "      ssh $CK_APP_SERVER 'cd $FRONTEND_DIR && pm2 restart next-app'"
echo ""
echo "   2. Oder manuell:"
echo "      ssh $CK_APP_SERVER 'cd $FRONTEND_DIR && npm run build && pm2 restart all'"
echo ""

