# 🔧 CK_AGENT_URL korrigieren - Manuelle Anleitung

## Problem
Die Next.js App verwendet `CK_AGENT_URL=https://agent.the-connection-key.de`, sollte aber auf den MCP Server zeigen: `http://138.199.237.34:4001`

## Lösung - Manuelle Schritte

### Schritt 1: SSH zum CK-App Server

```bash
ssh root@167.235.224.149
```

### Schritt 2: Wechsle ins Frontend-Verzeichnis

```bash
cd /opt/hd-app/The-Connection-Key/frontend
```

### Schritt 3: Prüfe aktuelle Umgebungsvariablen

```bash
cat .env.local | grep -E 'CK_AGENT_URL|READING_AGENT_URL'
```

### Schritt 4: Korrigiere CK_AGENT_URL

```bash
# Erstelle .env.local falls nicht vorhanden
if [ ! -f .env.local ]; then
    touch .env.local
fi

# Entferne alte CK_AGENT_URL Einträge
sed -i '/^CK_AGENT_URL=/d' .env.local
sed -i '/agent.the-connection-key.de/d' .env.local

# Füge korrekte CK_AGENT_URL hinzu
echo "CK_AGENT_URL=http://138.199.237.34:4001" >> .env.local
```

### Schritt 5: Korrigiere READING_AGENT_URL

```bash
# Entferne alte READING_AGENT_URL Einträge
sed -i '/^READING_AGENT_URL=/d' .env.local

# Füge korrekte READING_AGENT_URL hinzu
echo "READING_AGENT_URL=http://138.199.237.34:4001" >> .env.local
```

### Schritt 6: Prüfe Ergebnis

```bash
cat .env.local | grep -E 'CK_AGENT_URL|READING_AGENT_URL'
```

**Erwartete Ausgabe:**
```
CK_AGENT_URL=http://138.199.237.34:4001
READING_AGENT_URL=http://138.199.237.34:4001
```

### Schritt 7: Next.js App neu starten

```bash
# Prüfe PM2 Status
pm2 list

# Restart Next.js App
pm2 restart next-app

# Oder restart all
pm2 restart all

# Prüfe Logs
pm2 logs next-app --lines 20
```

## Alternative: Einzelbefehl (alles in einem)

```bash
cd /opt/hd-app/The-Connection-Key/frontend && \
[ ! -f .env.local ] && touch .env.local && \
sed -i '/^CK_AGENT_URL=/d; /^READING_AGENT_URL=/d; /agent.the-connection-key.de/d' .env.local && \
echo "CK_AGENT_URL=http://138.199.237.34:4001" >> .env.local && \
echo "READING_AGENT_URL=http://138.199.237.34:4001" >> .env.local && \
cat .env.local | grep -E 'CK_AGENT_URL|READING_AGENT_URL' && \
pm2 restart next-app
```

## Prüfung nach Neustart

1. **Website testen:**
   - Gehe zu: https://the-connection-key.de/coach/readings/dd1db8ff-f979-4667-9f0d-0649c0bed50c
   - Oder erstelle ein neues Reading
   - Prüfe, ob der Fehler verschwunden ist

2. **Logs prüfen:**
   ```bash
   pm2 logs next-app --lines 50
   ```

3. **API direkt testen:**
   ```bash
   curl -X POST http://localhost:3000/api/readings/generate \
     -H "Content-Type: application/json" \
     -d '{"birthDate":"1990-05-15","birthTime":"14:30","birthPlace":"Berlin"}'
   ```

## Troubleshooting

### Falls PM2 nicht läuft:
```bash
cd /opt/hd-app/The-Connection-Key/frontend
npm run build
npm start
```

### Falls Docker verwendet wird:
```bash
docker exec -it the-connection-key-frontend-1 sh
# Dann die Schritte 2-6 ausführen
docker restart the-connection-key-frontend-1
```

### Falls die Variable nicht übernommen wird:
```bash
# Prüfe ob Next.js die Variable liest
cd /opt/hd-app/The-Connection-Key/frontend
node -e "require('dotenv').config({path: '.env.local'}); console.log(process.env.CK_AGENT_URL)"
```

