#!/bin/bash
# Script zum Erstellen der Dateien direkt auf dem Server
# Führe dieses Script lokal aus (nicht auf dem Server!)

SERVER="167.235.224.149"
FRONTEND_DIR="/opt/hd-app/The-Connection-Key/frontend"

echo "🚀 Erstelle Dateien direkt auf Server..."
echo ""

# 1. reading-response-types.ts
echo "📤 Erstelle reading-response-types.ts..."
ssh root@${SERVER} "cat > ${FRONTEND_DIR}/app/api/reading-response-types.ts" < integration/api-routes/reading-response-types.ts

if [ $? -eq 0 ]; then
    echo "✅ reading-response-types.ts erstellt"
else
    echo "❌ Fehler beim Erstellen von reading-response-types.ts!"
    exit 1
fi

# 2. reading-validation.ts
echo "📤 Erstelle reading-validation.ts..."
ssh root@${SERVER} "cat > ${FRONTEND_DIR}/app/api/reading-validation.ts" < integration/api-routes/reading-validation.ts

if [ $? -eq 0 ]; then
    echo "✅ reading-validation.ts erstellt"
else
    echo "❌ Fehler beim Erstellen von reading-validation.ts!"
    exit 1
fi

echo ""
echo "✅ Alle Dateien erfolgreich auf Server erstellt!"
echo ""
echo "📝 Nächste Schritte auf dem Server:"
echo "1. Prüfe ob Dateien vorhanden sind:"
echo "   ls -la ${FRONTEND_DIR}/app/api/reading-response-types.ts"
echo "   ls -la ${FRONTEND_DIR}/app/api/reading-validation.ts"
echo ""
echo "2. Build erneut versuchen:"
echo "   cd ${FRONTEND_DIR}"
echo "   npm run build"
echo ""

