#!/bin/bash
# Korrigiert IP-Adresse von 138.199.237.34 zu 136.199.237.34
# Führen Sie im Repository-Root aus

set -e

OLD_IP="138.199.237.34"
NEW_IP="136.199.237.34"

echo "🔧 Korrigiere IP-Adresse"
echo "========================"
echo ""
echo "Alte IP: $OLD_IP"
echo "Neue IP: $NEW_IP"
echo ""

# Zähle Vorkommen
COUNT=$(grep -r "$OLD_IP" . --include="*.md" --include="*.sh" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" 2>/dev/null | wc -l)
echo "📊 Gefundene Vorkommen: $COUNT"
echo ""

# Bestätigung
read -p "Möchten Sie alle Vorkommen ersetzen? (j/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[JjYy]$ ]]; then
    echo "❌ Abgebrochen"
    exit 1
fi

# Ersetze in allen Dateien
echo "🔄 Ersetze IP-Adresse in allen Dateien..."
find . -type f \( -name "*.md" -o -name "*.sh" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.json" \) \
  -not -path "./node_modules/*" \
  -not -path "./.git/*" \
  -exec sed -i "s/$OLD_IP/$NEW_IP/g" {} \;

echo "✅ IP-Adresse ersetzt"
echo ""

# Zeige geänderte Dateien
echo "📄 Geänderte Dateien (erste 20):"
grep -r "$NEW_IP" . --include="*.md" --include="*.sh" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" 2>/dev/null | head -20 | cut -d: -f1 | sort -u

echo ""
echo "✅ IP-Adresse korrigiert!"
echo ""

