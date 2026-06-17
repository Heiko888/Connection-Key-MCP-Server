# 🔧 n8n Marketing Agent - Body-Konfiguration Fix

**Problem:** "Bad request - please check your parameters" / "Message is required"

**Ursache:** Body ist leer oder falsch konfiguriert

**URL ist korrekt:** ✅ `http://138.199.237.34:7000/agent/marketing` (ohne 's')

---

## ✅ Lösung: Body korrekt konfigurieren

### Schritt 1: Marketing Agent Node öffnen

1. **Workflow öffnen:** "Scheduled Agent Reports → Mattermost"
2. **"Marketing Agent" Node** doppelklicken
3. **Parameters Tab** sollte offen sein

### Schritt 2: Body-Konfiguration prüfen

**Aktueller Zustand (falsch):**
- ❌ **Specify Body:** `Using Fields Below`
- ❌ **Body Parameters:** LEER (keine Name/Value Paare)

**Das muss geändert werden!**

### Schritt 3: Body auf JSON umstellen

**Option A: JSON Body (Empfohlen)**

1. **Specify Body:** Wähle `JSON` (aus Dropdown)
2. **JSON Body:** Klicke auf das Feld oder Code-Editor
3. **Eintragen:**
   ```json
   {
     "message": "Erstelle 5 Social Media Posts für heute mit Themen: Manifestation, Energie, Human Design"
   }
   ```

**ODER mit Expression (dynamisch):**

1. **Specify Body:** Wähle `JSON`
2. **JSON Body:** Klicke auf Expression-Modus ({{ }})
3. **Eintragen:**
   ```
   ={{ JSON.stringify({ message: 'Erstelle 5 Social Media Posts für heute mit Themen: Manifestation, Energie, Human Design' }) }}
   ```

### Schritt 4: Alternative - Body Parameters verwenden

**Falls Sie "Using Fields Below" verwenden möchten:**

1. **Specify Body:** `Using Fields Below`
2. **Body Parameters:** Klicke auf "Add Value"
3. **Name:** `message`
4. **Value:** `Erstelle 5 Social Media Posts für heute mit Themen: Manifestation, Energie, Human Design`
5. **Save** klicken

---

## ✅ Vollständige Node-Konfiguration

**Marketing Agent Node sollte so aussehen:**

| Feld | Wert |
|------|------|
| **Method** | `POST` |
| **URL** | `http://138.199.237.34:7000/agent/marketing` |
| **Authentication** | `None` |
| **Send Body** | ✅ **ON** (aktiviert) |
| **Body Content Type** | `JSON` |
| **Specify Body** | `JSON` |
| **JSON Body** | `{"message": "Erstelle 5 Social Media Posts..."}` |

---

## 🧪 Test nach Fix

1. **Workflow speichern**
2. **"Execute Workflow"** klicken (oben rechts)
3. **Erwartung:**
   - ✅ Marketing Agent Node wird grün
   - ✅ Kein "Bad request" Fehler
   - ✅ Antwort wird zurückgegeben
   - ✅ Mattermost Node erhält Daten

---

## 🔍 Häufige Fehler

### Fehler 1: Body Parameters leer

**Problem:**
- "Using Fields Below" gewählt
- Aber keine Name/Value Paare eingetragen

**Lösung:**
- Entweder: Body Parameters ausfüllen (Name: `message`, Value: `...`)
- Oder: Auf JSON umstellen (einfacher)

### Fehler 2: Body Content Type falsch

**Problem:**
- Body Content Type: `Raw` oder `Form-Data`
- Aber MCP Server erwartet JSON

**Lösung:**
- Body Content Type: `JSON` wählen

### Fehler 3: Send Body nicht aktiviert

**Problem:**
- "Send Body" Toggle ist OFF

**Lösung:**
- "Send Body" Toggle auf ON stellen

### Fehler 4: Falsches Body-Format

**Problem:**
- Body als String statt JSON: `"message: Test"`
- Oder: Falsche Syntax

**Lösung:**
- Korrektes JSON: `{"message": "Test"}`
- Oder Expression: `={{ JSON.stringify({ message: "Test" }) }}`

---

## 📋 Checkliste

**Marketing Agent Node:**
- [ ] Method: `POST` ✅
- [ ] URL: `http://138.199.237.34:7000/agent/marketing` ✅ (ohne 's')
- [ ] Authentication: `None` ✅
- [ ] Send Body: **ON** ✅
- [ ] Body Content Type: `JSON` ✅
- [ ] Specify Body: `JSON` oder `Using Fields Below` ✅
- [ ] Body enthält `message` Feld ✅
- [ ] Body ist gültiges JSON ✅

---

## 🚨 Falls weiterhin Fehler

### Prüfe MCP Server direkt:

```bash
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

**Erwartung:**
```json
{
  "success": true,
  "agentId": "marketing",
  "response": "...",
  "tokens": 350,
  "model": "gpt-4"
}
```

**Falls das funktioniert:** Problem ist in n8n Body-Konfiguration
**Falls das nicht funktioniert:** Problem ist im MCP Server

---

## ✅ Zusammenfassung

**URL ist korrekt:** ✅ `/agent/marketing` (ohne 's')

**Problem:** Body fehlt oder ist falsch konfiguriert

**Lösung:**
1. **Specify Body:** `JSON` wählen
2. **JSON Body:** `{"message": "Ihre Nachricht"}` eintragen
3. **Save** klicken
4. **Workflow testen**

---

**Status:** 🔧 **Body-Konfiguration-Fix-Anleitung erstellt!**
