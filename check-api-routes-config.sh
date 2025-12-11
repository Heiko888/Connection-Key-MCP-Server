#!/bin/bash

# Prüfe API-Routes Konfiguration auf CK-App Server

echo "========================================"
echo "API-Routes Konfiguration prüfen"
echo "========================================"
echo ""

SERVER="root@167.235.224.149"
FRONTEND_PATH="/opt/hd-app/The-Connection-Key/frontend"

echo "Prüfe API-Routes auf Server..."
echo ""

# Prüfe Marketing Agent Route
echo "1. Marketing Agent Route:"
ssh $SERVER "grep -E 'MCP_SERVER_URL|138.199.237.34:7000' $FRONTEND_PATH/app/api/agents/marketing/route.ts 2>/dev/null | head -3 || echo '  Datei nicht lesbar oder nicht gefunden'"
echo ""

# Prüfe Automation Agent Route
echo "2. Automation Agent Route:"
ssh $SERVER "grep -E 'MCP_SERVER_URL|138.199.237.34:7000' $FRONTEND_PATH/app/api/agents/automation/route.ts 2>/dev/null | head -3 || echo '  Datei nicht lesbar oder nicht gefunden'"
echo ""

# Prüfe Reading Agent Route
echo "3. Reading Agent Route:"
ssh $SERVER "grep -E 'READING_AGENT_URL|138.199.237.34:4001' $FRONTEND_PATH/app/api/reading/generate/route.ts 2>/dev/null | head -3 || echo '  Datei nicht lesbar oder nicht gefunden'"
echo ""

# Prüfe Environment Variables
echo "4. Environment Variables:"
ssh $SERVER "test -f $FRONTEND_PATH/.env.local && grep -E 'MCP_SERVER_URL|READING_AGENT_URL' $FRONTEND_PATH/.env.local 2>/dev/null || echo '  .env.local nicht gefunden oder keine Variablen'"
echo ""

# Prüfe .env Dateien
echo "5. Alle .env Dateien:"
ssh $SERVER "ls -la $FRONTEND_PATH/.env* 2>/dev/null || echo '  Keine .env Dateien gefunden'"
echo ""

echo "========================================"
echo "Prüfung abgeschlossen"
echo "========================================"

