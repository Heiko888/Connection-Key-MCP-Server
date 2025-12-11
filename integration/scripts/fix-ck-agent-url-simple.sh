#!/bin/bash

# Einfaches Script - Kopiere diese Befehle und führe sie direkt auf dem Server aus

echo "=========================================="
echo "CK_AGENT_URL Korrektur - Befehle zum Kopieren"
echo "=========================================="
echo ""
echo "Führe diese Befehle direkt auf dem CK-App Server aus:"
echo ""
echo "ssh root@167.235.224.149"
echo ""
echo "Dann:"
echo ""
cat << 'COMMANDS'
cd /opt/hd-app/The-Connection-Key/frontend

# Erstelle .env.local falls nicht vorhanden
[ ! -f .env.local ] && touch .env.local

# Entferne alte Einträge
sed -i '/^CK_AGENT_URL=/d' .env.local
sed -i '/^READING_AGENT_URL=/d' .env.local
sed -i '/agent.the-connection-key.de/d' .env.local

# Füge korrekte Werte hinzu
echo "CK_AGENT_URL=http://138.199.237.34:4001" >> .env.local
echo "READING_AGENT_URL=http://138.199.237.34:4001" >> .env.local

# Prüfe Ergebnis
echo "=== Aktualisierte Umgebungsvariablen ==="
grep -E '^(CK_AGENT_URL|READING_AGENT_URL)=' .env.local

# Restart Next.js App
pm2 restart next-app || pm2 restart all

# Prüfe Logs
pm2 logs next-app --lines 10
COMMANDS

echo ""
echo "=========================================="

