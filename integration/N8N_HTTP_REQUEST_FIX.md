# 🔧 n8n HTTP Request Node - Fehlerbehebung

## ❌ Problem: "Bad request - please check your parameters"

Dieser Fehler tritt auf, wenn die HTTP Request Konfiguration nicht korrekt ist.

---

## ✅ Korrekte Konfiguration

### Schritt 1: HTTP Request Node öffnen

1. Klicken Sie auf den **HTTP Request Node** in Ihrem Workflow
2. Prüfen Sie die Konfiguration

### Schritt 2: Basis-Konfiguration

**Method:**
- ✅ `POST` (aus Dropdown wählen)

**URL:**
- ✅ `http://138.199.237.34:7000/agent/marketing`
- ❌ NICHT: `https://...` (verwenden Sie `http://`)
- ❌ NICHT: `/agents/marketing` (muss `/agent/marketing` sein, ohne 's')

**Authentication:**
- ✅ `None` (aus Dropdown wählen)

### Schritt 3: Body-Konfiguration

**Wichtig:** Der Body muss korrekt konfiguriert sein!

**Option A: JSON Body (Empfohlen)**

1. **Send Body:** ✅ Aktivieren (Checkbox)
2. **Body Content Type:** `JSON` (aus Dropdown)
3. **JSON Body:** Klicken Sie auf "Add Value" oder verwenden Sie den Code-Editor

**JSON Body (Code-Editor):**
```json
{
  "message": "Erstelle 5 Social Media Posts für heute"
}
```

**ODER JSON Body (UI-Modus):**
- Klicken Sie auf "Add Value"
- **Name:** `message`
- **Value:** `Erstelle 5 Social Media Posts für heute`

### Schritt 4: Headers (Optional, aber empfohlen)

**Add Header:**
- **Name:** `Content-Type`
- **Value:** `application/json`

---

## 🔍 Häufige Fehler

### Fehler 1: Body nicht aktiviert

**Problem:**
- ❌ "Send Body" ist nicht aktiviert

**Lösung:**
- ✅ Aktivieren Sie "Send Body" Checkbox

### Fehler 2: Falsche URL

**Problem:**
- ❌ `http://138.199.237.34:7000/agents/marketing` (mit 's')
- ❌ `https://138.199.237.34:7000/agent/marketing` (mit https)

**Lösung:**
- ✅ `http://138.199.237.34:7000/agent/marketing` (ohne 's', mit http)

### Fehler 3: Falsches Body-Format

**Problem:**
- ❌ Body als String statt JSON
- ❌ Body Content Type nicht auf JSON gesetzt

**Lösung:**
- ✅ Body Content Type: `JSON`
- ✅ Body als JSON-Objekt: `{"message": "..."}`

### Fehler 4: Falsche Method

**Problem:**
- ❌ Method: GET statt POST

**Lösung:**
- ✅ Method: POST

---

## 📋 Vollständige Konfiguration (Screenshot-ähnlich)

```
┌─────────────────────────────────────┐
│ HTTP Request                        │
├─────────────────────────────────────┤
│ Method: POST                        │
│ URL: http://138.199.237.34:7000/   │
│      agent/marketing                │
│                                     │
│ Authentication: None                │
│                                     │
│ ☑ Send Body                        │
│ Body Content Type: JSON             │
│                                     │
│ JSON Body:                          │
│ {                                   │
│   "message": "Erstelle 5 Social     │
│   Media Posts für heute"            │
│ }                                   │
│                                     │
│ Headers:                            │
│ Content-Type: application/json      │
└─────────────────────────────────────┘
```

---

## 🧪 Testen

### Schritt 1: Node einzeln testen

1. Klicken Sie auf den **HTTP Request Node**
2. Klicken Sie auf **"Execute Node"** (unten)
3. Prüfen Sie die Response

**Erwartete Response:**
```json
{
  "agent": "marketing",
  "message": "Erstelle 5 Social Media Posts für heute",
  "response": "...",
  "model": "gpt-4",
  "tokens": 123
}
```

### Schritt 2: Vollständigen Workflow testen

1. Klicken Sie auf **"Execute Workflow"** (oben rechts)
2. Prüfen Sie jeden Node
3. Bei Fehlern: Prüfen Sie die Logs

---

## 🔍 Debugging

### Prüfen Sie die Logs

1. Klicken Sie auf den **HTTP Request Node**
2. Scrollen Sie nach unten zu **"Output"**
3. Prüfen Sie:
   - **Request:** Wurde der Request korrekt gesendet?
   - **Response:** Was war die Antwort?
   - **Error:** Gibt es Fehler-Messages?

### Prüfen Sie den MCP Server

**Auf dem Hetzner Server:**
```bash
# Prüfe ob MCP Server läuft
systemctl status mcp

# Teste direkt
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

**Sollte zurückgeben:**
```json
{
  "agent": "marketing",
  "message": "Test",
  "response": "...",
  "model": "gpt-4",
  "tokens": 123
}
```

---

## ✅ Checkliste

Bevor Sie den Workflow aktivieren, prüfen Sie:

- [ ] Method ist `POST`
- [ ] URL ist `http://138.199.237.34:7000/agent/marketing` (ohne 's', mit http)
- [ ] Authentication ist `None`
- [ ] "Send Body" ist aktiviert
- [ ] Body Content Type ist `JSON`
- [ ] JSON Body enthält `{"message": "..."}`
- [ ] MCP Server läuft (prüfen mit curl)
- [ ] Node wurde einzeln getestet ("Execute Node")

---

## 🚀 Alternative: Code-Editor verwenden

Falls die UI-Konfiguration Probleme macht, verwenden Sie den Code-Editor:

1. Klicken Sie auf **"Code"** (oben rechts im HTTP Request Node)
2. Fügen Sie diesen Code ein:

```javascript
{
  "method": "POST",
  "url": "http://138.199.237.34:7000/agent/marketing",
  "authentication": {
    "type": "none"
  },
  "sendBody": true,
  "bodyContentType": "json",
  "jsonBody": "={\n  \"message\": \"Erstelle 5 Social Media Posts für heute\"\n}",
  "options": {
    "response": {
      "response": {
        "responseFormat": "json"
      }
    }
  }
}
```

---

## 📞 Weitere Hilfe

Wenn das Problem weiterhin besteht:

1. **Prüfen Sie n8n Logs:**
   - Klicken Sie auf "Executions" → Wählen Sie die fehlgeschlagene Ausführung
   - Prüfen Sie die Error-Messages

2. **Prüfen Sie MCP Server Logs:**
   ```bash
   journalctl -u mcp -n 50
   ```

3. **Testen Sie direkt mit curl:**
   ```bash
   curl -X POST http://138.199.237.34:7000/agent/marketing \
     -H "Content-Type: application/json" \
     -d '{"message": "Test"}'
   ```

---

## ✅ Zusammenfassung

**Die häufigsten Fehler:**
1. ❌ Body nicht aktiviert → ✅ "Send Body" aktivieren
2. ❌ Falsche URL → ✅ `/agent/marketing` (ohne 's')
3. ❌ Body Content Type falsch → ✅ `JSON` wählen
4. ❌ Body-Format falsch → ✅ `{"message": "..."}` als JSON

**Korrekte Konfiguration:**
- Method: `POST`
- URL: `http://138.199.237.34:7000/agent/marketing`
- Send Body: ✅
- Body Content Type: `JSON`
- JSON Body: `{"message": "Ihre Nachricht"}`

