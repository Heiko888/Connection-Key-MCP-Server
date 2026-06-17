#!/bin/bash
# Finalisiert Git-Änderungen nach Stash Pop

set -e

cd /opt/mcp-connection-key

echo "🔧 Finalisiere Git-Änderungen"
echo "=============================="
echo ""

# 1. Seltsame Datei löschen
echo "🗑️  Lösche seltsame Datei..."
rm -f "tash popgit stash pop"* 2>/dev/null || true
rm -f "tash popgit stash pop\002\002\002" 2>/dev/null || true
echo "✅ Seltsame Datei(en) gelöscht"
echo ""

# 2. resolve-git-conflict.sh prüfen
echo "📝 Prüfe resolve-git-conflict.sh Änderungen..."
if git diff resolve-git-conflict.sh | grep -q "^[+-]"; then
    echo "   Änderungen gefunden:"
    git diff resolve-git-conflict.sh | head -20
    echo ""
    echo "   Soll resolve-git-conflict.sh auch committed werden? (j/n)"
    read -r response
    if [[ "$response" =~ ^[Jj]$ ]]; then
        git add resolve-git-conflict.sh
        git commit -m "Fix line endings in resolve-git-conflict.sh"
        echo "✅ resolve-git-conflict.sh committed"
    else
        echo "   resolve-git-conflict.sh wird nicht committed"
    fi
else
    echo "   Keine relevanten Änderungen gefunden"
fi
echo ""

# 3. Status anzeigen
echo "📊 Git Status:"
git status --short
echo ""

# 4. Commit pushen
echo "⬆️  Pushe Commits..."
if git log origin/main..HEAD --oneline | grep -q .; then
    echo "   Commits die gepusht werden:"
    git log origin/main..HEAD --oneline
    echo ""
    git push
    echo "✅ Commits gepusht"
else
    echo "   Keine Commits zum Pushen"
fi
echo ""

# 5. Zusammenfassung
echo "======================================"
echo "✅ Finalisierung abgeschlossen!"
echo ""
echo "📋 Status:"
echo "   - Seltsame Datei gelöscht"
echo "   - resolve-git-conflict.sh geprüft"
echo "   - Commits gepusht"
echo ""
echo "📁 Ungetrackte Dateien (können bleiben):"
echo "   - .env.save"
echo "   - backup-scripts/"
echo "   - docker-compose.yml.backup"
echo "   - get-docker.sh"
echo ""

