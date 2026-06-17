# 🔐 OpenAI API Key auf Server setzen

## Auf dem Server ausführen:

```bash
cd /opt/mcp-connection-key

# OpenAI API Key zur .env hinzufügen
echo "OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE" >> .env

# Oder falls .env bereits existiert, Key aktualisieren
sed -i 's|^OPENAI_API_KEY=.*|OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE|' .env

# Prüfen
grep OPENAI_API_KEY .env
```

## Dann für Production Reading Agent:

```bash
# Automatisch kopieren
./setup-production-env.sh
```

