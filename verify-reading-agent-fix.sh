#!/bin/bash

# Prüfe ob der Fix auf dem Server vorhanden ist

SERVER="138.199.237.34"
REMOTE_FILE="/opt/mcp-connection-key/production/server.js"

echo "🔍 Prüfe server.js auf Hetzner Server ($SERVER)"
echo "====================================================================="
echo ""

echo "📋 Zeile 340-341 auf dem Server:"
ssh root@${SERVER} "sed -n '340,341p' ${REMOTE_FILE}"

echo ""
echo "📋 Sollte sein:"
echo "      userId: userId || \"anonymous\","
echo "      birthDate: birthDate || \"unknown\""

echo ""
echo "====================================================================="

