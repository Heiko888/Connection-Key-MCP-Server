#!/bin/bash
# Findet das Next.js Projekt-Verzeichnis auf dem CK-App Server

echo "🔍 Suche Next.js Projekt-Verzeichnis..."
echo "========================================"
echo ""

# Suche nach package.json mit Next.js
echo "1. Suche nach package.json mit Next.js..."
find / -name "package.json" -type f 2>/dev/null | while read file; do
    if grep -q "next" "$file" 2>/dev/null; then
        dir=$(dirname "$file")
        echo "   ✅ Gefunden: $dir"
        echo "      Prüfe Verzeichnis..."
        if [ -d "$dir/pages" ] || [ -d "$dir/app" ]; then
            echo "      ✅ Next.js Projekt bestätigt!"
            echo "      📁 Pfad: $dir"
            echo ""
        fi
    fi
done

echo ""

# Suche nach next.config
echo "2. Suche nach next.config..."
find / -name "next.config.*" -type f 2>/dev/null | while read file; do
    dir=$(dirname "$file")
    echo "   ✅ Gefunden: $dir"
done

echo ""

# Prüfe typische Verzeichnisse
echo "3. Prüfe typische Verzeichnisse..."
for dir in /var/www /home /opt /root; do
    if [ -d "$dir" ]; then
        echo "   Prüfe $dir..."
        find "$dir" -maxdepth 3 -name "package.json" -type f 2>/dev/null | while read file; do
            if grep -q "next" "$file" 2>/dev/null; then
                echo "      ✅ $file"
            fi
        done
    fi
done

echo ""
echo "========================================"
echo "✅ Suche abgeschlossen"
echo ""
echo "💡 Tipp: Verwenden Sie den gefundenen Pfad für die Installation"
echo ""

