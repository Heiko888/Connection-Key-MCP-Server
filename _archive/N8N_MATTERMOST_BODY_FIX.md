# 🔧 n8n Mattermost Node - Body-Konfiguration Fix

**Problem:** "Bad request - please check your parameters" / "Failed to handle the payload"

**Ursache:** 
1. Mattermost Webhook-URL ist unvollständig oder falsch
2. Body ist leer - Mattermost erwartet JSON mit `text`, `channel`, etc.

---

## ✅ Lösung: Mattermost Node korrekt konfigurieren

### Schritt 1: Mattermost Webhook erstellen

1. **Mattermost öffnen**
   - URL: Ihre Mattermost-URL (z.B. `https://chat.werdemeisterdeinergedanke.de`)
   - Oder: `http://138.199.237.34:8065` (falls auf Hetzner Server)

2. **Incoming Webhook erstellen:**
   - **Integrations** → **Incoming Webhooks**
   - **Add Incoming Webhook** klicken
   - **Title:** `n8n Scheduled Reports` (oder passend)
   - **Channel:** `#marketing` (oder gewünschter Channel)
   - **Description:** `Tägliche Marketing-Reports von n8n`
   - **Save** klicken
   - **Webhook URL kopieren** (Format: `https://chat.werdemeisterdeinergedanke.de/hooks/xxxxx`)

### Schritt 2: URL in n8n eintragen

1. **Workflow öffnen:** "Scheduled Agent Reports → Mattermost"
2. **"Send to Mattermost" Node** doppelklicken
3. **URL-Feld:**
   - Ersetzen Sie: `https://chat.werdemeisterdeinergedanke` (unvollständig)
   - Mit Ihrer echten Webhook-URL: `https://chat.werdemeisterdeinergedanke.de/hooks/abc123xyz`
4. **Save** klicken

### Schritt 3: Body konfigurieren

**WICHTIG:** Mattermost erwartet ein JSON-Body mit `text`, `channel`, `username`!

**Option A: JSON Body (Empfohlen)**

1. **Specify Body:** Wähle `JSON` (aus Dropdown)
2. **JSON Body:** Klicke auf Expression-Modus ({{ }})
3. **Eintragen:**
   ```
   ={{ JSON.stringify({ 
     text: '## 📢 Täglicher Marketing-Content generiert!\n\n**Zeit:** ' + $now + '\n\n---\n\n' + ($json.response || 'Content generiert'), 
     channel: '#marketing', 
     username: 'Marketing Agent' 
   }) }}
   ```

**Option B: Body Parameters (Using Fields Below)**

1. **Specify Body:** `Using Fields Below`
2. **Body Parameters:** Klicke auf "Add Value"
3. **Name:** `text`
4. **Value:** `={{ '## 📢 Täglicher Marketing-Content generiert!\n\n**Zeit:** ' + $now + '\n\n---\n\n' + ($json.response || 'Content generiert') }}`
5. **Add Value** erneut klicken
6. **Name:** `channel`
7. **Value:** `#marketing`
8. **Add Value** erneut klicken
9. **Name:** `username`
10. **Value:** `Marketing Agent`
11. **Save** klicken

---

## ✅ Vollständige Node-Konfiguration

**"Send to Mattermost" Node sollte so aussehen:**

| Feld | Wert |
|------|------|
| **Method** | `POST` |
| **URL** | `https://chat.werdemeisterdeinergedanke.de/hooks/xxxxx` (vollständige Webhook-URL) |
| **Authentication** | `None` |
| **Send Body** | ✅ **ON** (aktiviert) |
| **Body Content Type** | `JSON` |
| **Specify Body** | `JSON` |
| **JSON Body** | `{{ JSON.stringify({ text: '...', channel: '#marketing', username: 'Marketing Agent' }) }}` |

---

## 📋 Mattermost Webhook Body-Format

**Mattermost erwartet folgendes JSON-Format:**

```json
{
  "text": "Ihre Nachricht hier",
  "channel": "#marketing",
  "username": "Marketing Agent"
}
```

**Optional (erweiterte Felder):**
```json
{
  "text": "Ihre Nachricht",
  "channel": "#marketing",
  "username": "Marketing Agent",
  "icon_url": "https://...",
  "attachments": [...]
}
```

---

## 🧪 Test nach Fix

1. **Workflow speichern**
2. **"Execute Workflow"** klicken (oben rechts)
3. **Erwartung:**
   - ✅ Marketing Agent Node wird grün
   - ✅ Send to Mattermost Node wird grün
   - ✅ Kein "Bad request" Fehler
   - ✅ Nachricht erscheint in Mattermost Channel

---

## 🔍 Häufige Fehler

### Fehler 1: URL unvollständig

**Problem:**
- URL: `https://chat.werdemeisterdeinergedanke` (ohne `/hooks/...`)

**Lösung:**
- Vollständige Webhook-URL verwenden: `https://chat.werdemeisterdeinergedanke.de/hooks/xxxxx`

### Fehler 2: Body leer

**Problem:**
- "Using Fields Below" gewählt
- Aber keine Body Parameters eingetragen

**Lösung:**
- Entweder: Body Parameters ausfüllen (text, channel, username)
- Oder: Auf JSON umstellen (einfacher)

### Fehler 3: Body Content Type falsch

**Problem:**
- Body Content Type: `Raw` oder `Form-Data`
- Aber Mattermost erwartet JSON

**Lösung:**
- Body Content Type: `JSON` wählen

### Fehler 4: Falsches Body-Format

**Problem:**
- Body als String statt JSON
- Oder: Fehlende Felder (`text`, `channel`)
- Oder: "JSON parameter needs to be valid JSON"

**Lösung:**
- Expression muss mit `={{` beginnen und mit `}}` enden!
- Korrektes JSON: `{"text": "...", "channel": "#marketing", "username": "..."}`
- Oder Expression: `={{ JSON.stringify({ text: '...', channel: '#marketing', username: '...' }) }}`
- **WICHTIG:** Einfache Anführungszeichen `'...'` in Expressions verwenden!

**Detaillierte Anleitung:** Siehe `N8N_JSON_BODY_VALID_FIX.md`

---

## 📋 Beispiel: Body mit Marketing Agent Response

**Für "Scheduled Agent Reports → Mattermost" Workflow:**

```javascript
={{ JSON.stringify({ 
  text: '## 📢 Täglicher Marketing-Content generiert!\n\n**Zeit:** ' + $now + '\n\n---\n\n' + ($('Marketing Agent').item.json.response || 'Content generiert'), 
  channel: '#marketing', 
  username: 'Marketing Agent' 
}) }}
```

**Erklärung:**
- `$('Marketing Agent').item.json.response` → Holt die Antwort vom Marketing Agent Node
- `$now` → Aktuelles Datum/Zeit
- `channel: '#marketing'` → Mattermost Channel
- `username: 'Marketing Agent'` → Absender-Name

---

## ✅ Checkliste

**"Send to Mattermost" Node:**
- [ ] URL: Vollständige Mattermost Webhook-URL ✅
- [ ] Method: `POST` ✅
- [ ] Authentication: `None` ✅
- [ ] Send Body: **ON** ✅
- [ ] Body Content Type: `JSON` ✅
- [ ] Specify Body: `JSON` oder `Using Fields Below` ✅
- [ ] Body enthält `text` Feld ✅
- [ ] Body enthält `channel` Feld ✅
- [ ] Body enthält `username` Feld (optional) ✅
- [ ] Body ist gültiges JSON ✅

---

## 🚨 Falls weiterhin Fehler

### Prüfe Mattermost Webhook direkt:

```bash
curl -X POST https://chat.werdemeisterdeinergedanke.de/hooks/xxxxx \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test",
    "channel": "#marketing",
    "username": "Test Bot"
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Nachricht erscheint in Mattermost

**Falls das funktioniert:** Problem ist in n8n Body-Konfiguration
**Falls das nicht funktioniert:** Problem ist mit Mattermost Webhook-URL

---

## ✅ Zusammenfassung

**Problem 1:** URL unvollständig → Vollständige Webhook-URL eintragen
**Problem 2:** Body leer → JSON Body mit `text`, `channel`, `username` konfigurieren

**Lösung:**
1. Mattermost Webhook erstellen und URL kopieren
2. URL in n8n eintragen
3. JSON Body konfigurieren: `{{ JSON.stringify({ text: '...', channel: '#marketing', username: '...' }) }}`
4. Save & Workflow testen

---

**Status:** 🔧 **Mattermost Body-Konfiguration-Fix-Anleitung erstellt!**
