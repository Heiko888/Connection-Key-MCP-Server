#!/bin/bash

# Generiere sicheren System-Token
# Führt lokal oder auf Server aus

echo "🔐 Generiere System-Token"
echo "========================"
echo ""

# Option 1: Mit OpenSSL (empfohlen)
if command -v openssl &> /dev/null; then
    echo "✅ Verwende OpenSSL"
    TOKEN=$(openssl rand -hex 32)
    echo ""
    echo "📋 Token (64 Zeichen):"
    echo "$TOKEN"
    echo ""
    echo "📝 Füge zu docker-compose.yml hinzu:"
    echo "   AGENT_SYSTEM_TOKEN=$TOKEN"
    echo ""
    
# Option 2: Mit /dev/urandom
elif [ -c /dev/urandom ]; then
    echo "✅ Verwende /dev/urandom"
    TOKEN=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)
    echo ""
    echo "📋 Token (64 Zeichen):"
    echo "$TOKEN"
    echo ""
    echo "📝 Füge zu docker-compose.yml hinzu:"
    echo "   AGENT_SYSTEM_TOKEN=$TOKEN"
    echo ""
    
# Option 3: Mit Node.js
elif command -v node &> /dev/null; then
    echo "✅ Verwende Node.js"
    TOKEN=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    echo ""
    echo "📋 Token (64 Zeichen):"
    echo "$TOKEN"
    echo ""
    echo "📝 Füge zu docker-compose.yml hinzu:"
    echo "   AGENT_SYSTEM_TOKEN=$TOKEN"
    echo ""
    
# Option 4: Mit Python
elif command -v python3 &> /dev/null; then
    echo "✅ Verwende Python"
    TOKEN=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    echo ""
    echo "📋 Token (64 Zeichen):"
    echo "$TOKEN"
    echo ""
    echo "📝 Füge zu docker-compose.yml hinzu:"
    echo "   AGENT_SYSTEM_TOKEN=$TOKEN"
    echo ""
    
else
    echo "❌ Keine passende Methode gefunden"
    echo ""
    echo "🔧 Installiere eine der folgenden:"
    echo "   - OpenSSL: apt-get install openssl"
    echo "   - Node.js: apt-get install nodejs"
    echo "   - Python: apt-get install python3"
    echo ""
    exit 1
fi

# Optional: Speichere Token in Datei (nur lokal, nicht committen!)
read -p "💾 Token in .env.local speichern? (j/n): " SAVE
if [ "$SAVE" = "j" ] || [ "$SAVE" = "J" ] || [ "$SAVE" = "y" ] || [ "$SAVE" = "Y" ]; then
    if [ -f ".env.local" ]; then
        # Prüfe ob Token bereits existiert
        if grep -q "AGENT_SYSTEM_TOKEN" .env.local; then
            echo "⚠️  AGENT_SYSTEM_TOKEN existiert bereits in .env.local"
            read -p "   Überschreiben? (j/n): " OVERWRITE
            if [ "$OVERWRITE" = "j" ] || [ "$OVERWRITE" = "J" ] || [ "$OVERWRITE" = "y" ] || [ "$OVERWRITE" = "Y" ]; then
                sed -i "s/AGENT_SYSTEM_TOKEN=.*/AGENT_SYSTEM_TOKEN=$TOKEN/" .env.local
                echo "   ✅ Token aktualisiert"
            fi
        else
            echo "AGENT_SYSTEM_TOKEN=$TOKEN" >> .env.local
            echo "   ✅ Token hinzugefügt"
        fi
    else
        echo "AGENT_SYSTEM_TOKEN=$TOKEN" > .env.local
        echo "   ✅ .env.local erstellt"
    fi
    echo ""
    echo "⚠️  WICHTIG: .env.local ist in .gitignore - nicht committen!"
fi

echo ""
echo "✅ Token generiert!"
echo ""
echo "🔒 Sicherheitshinweise:"
echo "   1. Token niemals in Git committen"
echo "   2. Token nur in docker-compose.yml oder .env Dateien"
echo "   3. Token regelmäßig rotieren (alle 90 Tage)"
echo "   4. Token niemals in Logs ausgeben"
echo ""
