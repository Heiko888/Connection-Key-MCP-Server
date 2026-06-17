#!/bin/bash

# ============================================
# Brand Book Integration Fix - Deployment (Bash)
# ============================================
# Für direkte Ausführung auf dem Server
# ============================================

set -e

SERVER_PATH="/opt/mcp-connection-key/production"
BACKUP_DIR="$SERVER_PATH/backups"

echo "========================================"
echo "Brand Book Integration Fix - Deployment"
echo "========================================"
echo ""

# Prüfe ob server.js existiert
if [ ! -f "$SERVER_PATH/server.js" ]; then
    echo "❌ server.js nicht gefunden: $SERVER_PATH/server.js"
    exit 1
fi

echo "[*] Schritt 1: Backup erstellen..."
echo ""

# Erstelle Backup-Verzeichnis
mkdir -p "$BACKUP_DIR"

# Erstelle Backup
BACKUP_FILE="$BACKUP_DIR/server.js.backup-$(date +%Y%m%d-%H%M%S)"
cp "$SERVER_PATH/server.js" "$BACKUP_FILE"
echo "  ✅ Backup erstellt: $BACKUP_FILE"
echo ""

echo "[*] Schritt 2: Prüfe Reading Agent Status..."
echo ""

# Prüfe PM2 Status
if pm2 list | grep -q "reading-agent"; then
    echo "  ✅ Reading Agent läuft"
    pm2 list | grep reading-agent
else
    echo "  ⚠️  Reading Agent läuft nicht"
    echo "  Versuche Agent zu starten..."
    
    cd "$SERVER_PATH"
    pm2 start server.js --name reading-agent || {
        echo "  ❌ Fehler beim Starten"
        exit 1
    }
    echo "  ✅ Reading Agent gestartet"
fi

echo ""

echo "[*] Schritt 3: Reading Agent neu starten..."
echo ""

pm2 restart reading-agent || {
    echo "  ❌ Fehler beim Neustart"
    exit 1
}

echo "  ✅ Reading Agent neu gestartet"
echo ""

echo "[*] Schritt 4: Warte kurz und prüfe Status..."
echo ""

sleep 3

pm2 status reading-agent
echo ""

echo "[*] Schritt 5: Health Check..."
echo ""

HEALTH=$(curl -s http://localhost:4001/health 2>&1)
if echo "$HEALTH" | grep -q "ok"; then
    echo "  ✅ Health Check erfolgreich"
    echo "  Response: $HEALTH"
else
    echo "  ⚠️  Health Check: $HEALTH"
fi

echo ""

echo "[*] Schritt 6: Knowledge neu laden (optional)..."
echo ""

read -p "  Möchten Sie Knowledge neu laden? (j/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[JjYy]$ ]]; then
    # Versuche AGENT_SECRET aus .env zu lesen
    if [ -f "$SERVER_PATH/.env" ]; then
        AGENT_SECRET=$(grep "^AGENT_SECRET=" "$SERVER_PATH/.env" 2>/dev/null | cut -d= -f2)
        
        if [ -n "$AGENT_SECRET" ]; then
            echo "  Lade Knowledge neu..."
            RELOAD_RESULT=$(curl -s -X POST http://localhost:4001/admin/reload-knowledge \
                -H "Content-Type: application/json" \
                -d "{\"secret\": \"$AGENT_SECRET\"}")
            
            if echo "$RELOAD_RESULT" | grep -q "success"; then
                echo "  ✅ Knowledge erfolgreich neu geladen"
            else
                echo "  ⚠️  Knowledge-Reload: $RELOAD_RESULT"
            fi
        else
            echo "  ⚠️  AGENT_SECRET nicht gefunden in .env"
        fi
    else
        echo "  ⚠️  .env Datei nicht gefunden"
    fi
else
    echo "  ⏭️  Knowledge-Reload übersprungen"
fi

echo ""

echo "========================================"
echo "Deployment abgeschlossen!"
echo "========================================"
echo ""
echo "Nächste Schritte:"
echo "  1. Testen Sie ein Reading:"
echo "     curl -X POST http://localhost:4001/reading/generate \\"
echo "       -H 'Content-Type: application/json' \\"
echo "       -d '{\"birthDate\": \"1990-05-15\", \"birthTime\": \"14:30\", \"birthPlace\": \"Berlin\"}'"
echo ""
echo "  2. Prüfen Sie ob Brand Voice verwendet wird"
echo "  3. Prüfen Sie ob Markenidentität reflektiert wird"
echo ""

