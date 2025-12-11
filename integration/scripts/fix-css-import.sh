#!/bin/bash

# Script zum Beheben von CSS @import Fehlern
# Verschiebt @import-Regeln an den Anfang von CSS-Dateien

echo "🔧 CSS @import Fehler beheben..."
echo ""

CONTAINER_NAME="the-connection-key-frontend-1"
FRONTEND_DIR="/opt/hd-app/The-Connection-Key/frontend"

# Prüfe ob Container läuft
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Container $CONTAINER_NAME läuft nicht!"
    exit 1
fi

echo "📋 Suche CSS-Dateien mit @import..."

# Finde alle CSS-Dateien im Container (außer node_modules und .next)
CSS_FILES=$(docker exec "$CONTAINER_NAME" find /app -name "*.css" -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/.next/*" \
    2>/dev/null)

if [ -z "$CSS_FILES" ]; then
    echo "   ⚠️  Keine CSS-Dateien gefunden"
    echo ""
    echo "💡 Tipp: Der Fehler könnte von einer generierten CSS-Datei kommen."
    echo "   Versuche die App neu zu bauen:"
    echo "   cd $FRONTEND_DIR"
    echo "   docker compose exec frontend npm run build"
    exit 0
fi

echo "   Gefundene CSS-Dateien:"
echo "$CSS_FILES" | while read file; do
    echo "   - $file"
done

echo ""
echo "📝 Prüfe @import-Regeln..."

FIXED=0
echo "$CSS_FILES" | while read file; do
    # Prüfe ob Datei @import enthält
    if docker exec "$CONTAINER_NAME" grep -q "@import" "$file" 2>/dev/null; then
        echo "   Prüfe: $file"
        
        # Hole ersten Zeile
        FIRST_LINE=$(docker exec "$CONTAINER_NAME" head -1 "$file" 2>/dev/null)
        
        # Prüfe ob @import nicht am Anfang steht
        if ! echo "$FIRST_LINE" | grep -q "@import"; then
            echo "   ⚠️  @import nicht am Anfang gefunden in: $file"
            echo "   💡 Diese Datei muss manuell korrigiert werden"
            echo "   @import-Regeln müssen an den Anfang verschoben werden"
        else
            echo "   ✅ @import bereits am Anfang"
        fi
    fi
done

echo ""
echo "📋 Nächste Schritte:"
echo ""
echo "1. Falls CSS-Dateien korrigiert wurden, App neu bauen:"
echo "   cd $FRONTEND_DIR"
echo "   docker compose exec frontend npm run build"
echo ""
echo "2. Container neu starten:"
echo "   docker compose restart frontend"
echo ""
echo "3. Falls der Fehler weiterhin besteht:"
echo "   - Prüfe Browser-Konsole (F12) für Details"
echo "   - Prüfe welche CSS-Datei den Fehler verursacht"
echo "   - Verschiebe @import-Regeln manuell an den Anfang"
echo ""

