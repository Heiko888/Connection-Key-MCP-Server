#!/bin/bash
# Git Pull Konflikt lösen - Option 1 (Änderungen behalten)

set -e

cd /opt/mcp-connection-key

echo "🔧 Git Pull Konflikt lösen - Option 1"
echo "======================================"
echo ""

# 1. Lokale Änderungen an docker-compose.yml stashen
echo "📦 Stashe lokale Änderungen an docker-compose.yml..."
if git diff --quiet docker-compose.yml; then
    echo "   Keine Änderungen an docker-compose.yml"
else
    git stash push -m "Lokale docker-compose.yml Änderungen vor Pull $(date +%Y-%m-%d)"
    echo "✅ Änderungen gestasht"
fi
echo ""

# 2. Backup-Verzeichnis erstellen
echo "📁 Erstelle Backup-Verzeichnis..."
mkdir -p backup-scripts
echo "✅ Backup-Verzeichnis erstellt"
echo ""

# 3. Ungetrackte Dateien verschieben
echo "📦 Verschiebe ungetrackte Dateien..."
files_moved=0

for file in fix-docker-compose-and-https.sh https-setup-final.sh setup-https-now.sh setup-mailchimp-final.sh setup-mcp-simple.sh setup-openai-integration.sh start-services.sh; do
    if [ -f "$file" ]; then
        mv "$file" backup-scripts/
        echo "   ✅ $file → backup-scripts/"
        files_moved=$((files_moved + 1))
    fi
done

if [ $files_moved -eq 0 ]; then
    echo "   Keine Dateien zu verschieben"
else
    echo "✅ $files_moved Datei(en) verschoben"
fi
echo ""

# 4. Git pull
echo "⬇️  Führe git pull aus..."
git pull
echo "✅ Git pull erfolgreich"
echo ""

# 5. Lokale Änderungen wieder anwenden (falls gewünscht)
echo "🔄 Prüfe gestashte Änderungen..."
if git stash list | grep -q "docker-compose.yml"; then
    echo "   Gestashte Änderungen gefunden"
    echo ""
    echo "⚠️  Möchten Sie die gestashten Änderungen wieder anwenden?"
    echo "   Führen Sie aus: git stash pop"
    echo "   Oder prüfen Sie zuerst: git stash show"
else
    echo "   Keine gestashten Änderungen"
fi
echo ""

# 6. Zusammenfassung
echo "======================================"
echo "✅ Konflikt gelöst!"
echo ""
echo "📋 Was wurde gemacht:"
echo "   - Lokale Änderungen gestasht"
echo "   - Ungetrackte Dateien nach backup-scripts/ verschoben"
echo "   - Git pull erfolgreich ausgeführt"
echo ""
echo "📁 Backup-Scripts finden Sie in:"
echo "   /opt/mcp-connection-key/backup-scripts/"
echo ""
echo "🔄 Um gestashte Änderungen wieder anzuwenden:"
echo "   git stash pop"
echo ""

