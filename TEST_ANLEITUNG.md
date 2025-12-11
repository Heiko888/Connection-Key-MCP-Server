# 🧪 Test-Anleitung für lokale Konfiguration

## ✅ Was wurde eingerichtet:

1. **`.env` Datei** - Enthält den OpenAI API Key
2. **`mcp.json`** - Enthält den Key in der `env` Sektion für Cursor IDE
3. **Test-Scripts** - `test-simple.js` und `test-local-config.js`

## 🧪 So testen Sie die Konfiguration:

### Option 1: Über Cursor IDE (Empfohlen)

1. **Cursor IDE neu starten** (damit `mcp.json` geladen wird)
2. **MCP Server testen:**
   - Öffnen Sie die MCP-Konsole in Cursor
   - Versuchen Sie ein Tool zu verwenden, z.B. `ping` oder `echo`
   - Wenn Tools funktionieren, ist die Konfiguration korrekt

### Option 2: Über Node.js Test-Script

```powershell
# Prüfe ob .env existiert
Get-Content .env

# Führe Test aus
node test-simple.js
```

**Erwartete Ausgabe:**
```
🔍 Teste lokale Konfiguration...

✅ OPENAI_API_KEY: Gesetzt (sk-svcacct-i3kKwec6VL...UA)
📡 Teste OpenAI Client...
✅ OpenAI Client initialisiert
📤 Sende Test-Request...
✅ API-Verbindung erfolgreich!
   Antwort: "OK"
   Tokens: 15

🎉 Konfiguration funktioniert perfekt!
```

### Option 3: Manueller Test

```powershell
# 1. Prüfe .env Datei
Get-Content .env | Select-String "OPENAI_API_KEY"

# 2. Prüfe mcp.json
Get-Content mcp.json | Select-String "OPENAI_API_KEY"

# 3. Teste ob Node.js funktioniert
node --version

# 4. Teste ob Packages installiert sind
npm list openai dotenv
```

## 🔧 Falls der Test fehlschlägt:

### Problem: `.env` Datei fehlt
```powershell
# Erstelle .env manuell
@"
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
"@ | Out-File -FilePath .env -Encoding utf8
```

### Problem: Node.js nicht installiert
- Installieren Sie Node.js von https://nodejs.org/
- Oder verwenden Sie Cursor IDE direkt (hat eingebauten Node.js Support)

### Problem: Packages fehlen
```powershell
npm install openai dotenv
```

## ✅ Erfolgreiche Konfiguration bedeutet:

1. ✅ `.env` Datei existiert mit `OPENAI_API_KEY`
2. ✅ `mcp.json` enthält den Key in `env`
3. ✅ Node.js kann die Packages laden
4. ✅ OpenAI API antwortet auf Test-Requests

## 🎯 Nächste Schritte:

Nach erfolgreichem Test können Sie:
- Den MCP Server in Cursor IDE verwenden
- Die Tools (ping, echo, generateReading, etc.) nutzen
- Den Server auf dem Hetzner Server deployen

