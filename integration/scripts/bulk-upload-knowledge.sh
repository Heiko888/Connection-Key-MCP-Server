#!/bin/bash
# Bulk-Upload von Knowledge-Dateien für Reading Agent
# Usage: ./bulk-upload-knowledge.sh /path/to/knowledge/files

set -e

KNOWLEDGE_DIR="/opt/mcp-connection-key/production/knowledge"
SOURCE_DIR="${1:-}"

echo "📚 Bulk-Upload von Knowledge-Dateien"
echo "====================================="
echo ""

# Prüfe ob Source-Verzeichnis angegeben wurde
if [ -z "$SOURCE_DIR" ]; then
    echo "❌ Source-Verzeichnis nicht angegeben!"
    echo ""
    echo "📋 Usage:"
    echo "   $0 /path/to/knowledge/files"
    echo ""
    echo "📋 Beispiel:"
    echo "   $0 ~/knowledge-files"
    echo "   $0 /tmp/my-knowledge"
    exit 1
fi

# Prüfe ob Source-Verzeichnis existiert
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Source-Verzeichnis nicht gefunden: $SOURCE_DIR"
    exit 1
fi

# Prüfe ob Knowledge-Verzeichnis existiert
if [ ! -d "$KNOWLEDGE_DIR" ]; then
    echo "⚠️  Knowledge-Verzeichnis nicht gefunden: $KNOWLEDGE_DIR"
    echo "📋 Erstelle Verzeichnis..."
    mkdir -p "$KNOWLEDGE_DIR"
fi

# Zähle vorhandene Dateien
EXISTING_COUNT=$(ls -1 "$KNOWLEDGE_DIR"/*.txt 2>/dev/null | wc -l)
echo "📊 Vorhandene Knowledge-Dateien: $EXISTING_COUNT"
echo ""

# Kopiere alle .txt Dateien
echo "📋 Kopiere Knowledge-Dateien..."
COUNT=0
SKIPPED=0

find "$SOURCE_DIR" -name "*.txt" -type f | while read file; do
    filename=$(basename "$file")
    dest="$KNOWLEDGE_DIR/$filename"
    
    if [ -f "$dest" ]; then
        # Datei existiert bereits - überschreiben?
        echo "   ⚠️  [$((COUNT + 1))] $filename (überschreibe vorhandene Datei)"
        cp "$file" "$dest"
    else
        echo "   ✅ [$((COUNT + 1))] $filename"
        cp "$file" "$dest"
    fi
    
    COUNT=$((COUNT + 1))
done

# Zeige Gesamtanzahl
TOTAL=$(ls -1 "$KNOWLEDGE_DIR"/*.txt 2>/dev/null | wc -l)
echo ""
echo "✅ $COUNT neue Dateien kopiert"
echo "📊 Gesamt: $TOTAL Knowledge-Dateien"
echo ""

# Liste alle Dateien (erste 20)
echo "📄 Erste 20 Dateien:"
ls -1 "$KNOWLEDGE_DIR"/*.txt 2>/dev/null | head -20 | nl
if [ "$TOTAL" -gt 20 ]; then
    echo "   ... und $((TOTAL - 20)) weitere"
fi
echo ""

# Knowledge neu laden
echo "🔄 Lade Knowledge neu..."
ENV_FILE="/opt/mcp-connection-key/production/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  .env Datei nicht gefunden: $ENV_FILE"
    echo "📋 Bitte manuell neu laden:"
    echo "   curl -X POST http://localhost:4001/admin/reload-knowledge \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"secret\": \"YOUR_SECRET\"}'"
else
    AGENT_SECRET=$(grep "^AGENT_SECRET=" "$ENV_FILE" 2>/dev/null | cut -d= -f2 | tr -d '"' | tr -d "'")
    
    if [ -z "$AGENT_SECRET" ]; then
        echo "⚠️  AGENT_SECRET nicht gefunden in .env"
        echo "📋 Bitte manuell neu laden:"
        echo "   curl -X POST http://localhost:4001/admin/reload-knowledge \\"
        echo "     -H 'Content-Type: application/json' \\"
        echo "     -d '{\"secret\": \"YOUR_SECRET\"}'"
    else
        echo "   📤 Sende Reload-Request..."
        RESPONSE=$(curl -s -X POST http://localhost:4001/admin/reload-knowledge \
          -H "Content-Type: application/json" \
          -d "{\"secret\": \"$AGENT_SECRET\"}")
        
        if echo "$RESPONSE" | grep -q "success\|ok"; then
            echo "   ✅ Knowledge erfolgreich neu geladen"
        else
            echo "   ⚠️  Fehler beim Neuladen: $RESPONSE"
            echo "   📋 Bitte manuell prüfen:"
            echo "      curl http://localhost:4001/health"
        fi
    fi
fi

echo ""
echo "✅ Bulk-Upload abgeschlossen!"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Prüfe Health-Endpoint:"
echo "   curl http://localhost:4001/health | jq '.knowledge'"
echo ""
echo "2. Teste Reading:"
echo "   curl -X POST http://localhost:4001/reading/generate \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"birthDate\": \"1990-05-15\", \"birthTime\": \"14:30\", \"birthPlace\": \"Berlin, Germany\"}'"
echo ""

