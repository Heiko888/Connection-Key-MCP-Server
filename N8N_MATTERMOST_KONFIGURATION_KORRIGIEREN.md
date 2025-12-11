# 🔧 n8n Mattermost Workflow - Konfiguration korrigieren

**Problem:** Workflow funktioniert nicht, Konfiguration passt nicht

**Lösung:** Konfiguration in n8n manuell prüfen und korrigieren

---

## 📋 Schritt-für-Schritt: Konfiguration prüfen

### 1. "Call Agent" Node prüfen

1. **"Call Agent" Node** öffnen
2. **Prüfe folgende Einstellungen:**

| Feld | Sollte sein |
|------|-------------|
| **Method** | `POST` |
| **URL** | `=http://138.199.237.34:7000/agent/{{ $json.agentId }}` |
| **Authentication** | `None` |
| **Send Body** | ✅ **ON** |
| **Body Content Type** | `JSON` |
| **Specify Body** | `JSON` |
| **JSON Body** | `={{ JSON.stringify({ message: $json.message }) }}` |

**Falls nicht korrekt:**
- Korrigieren
- **Save** klicken

---

### 2. "Send to Mattermost" Node prüfen

1. **"Send to Mattermost" Node** öffnen
2. **Prüfe folgende Einstellungen:**

| Feld | Sollte sein |
|------|-------------|
| **Method** | `POST` |
| **URL** | `https://chat.werdemeisterdeinergedanken.de/hooks/tzw3a5godjfpicpu87ixzut39w` |
| **Authentication** | `None` |
| **Send Body** | ✅ **ON** |
| **Body Content Type** | `JSON` |
| **Specify Body** | `JSON` |
| **JSON Body** | Expression-Modus ({{ }} Button aktiviert) |

---

### 3. JSON Body Expression prüfen

**"Send to Mattermost" Node → JSON Body:**

1. **Expression-Modus aktivieren:**
   - **{{ }} Button** klicken (oben rechts im JSON Body Feld)
   - Feld sollte blau werden (Expression-Modus aktiv)

2. **Expression eintragen:**
   ```
   ={{ JSON.stringify({ 
     text: '## 🤖 Agent-Antwort\n\n**Agent:** ' + $('Webhook Trigger').item.json.agentId + '\n**Anfrage:** ' + $('Webhook Trigger').item.json.message + '\n\n---\n\n' + $json.response, 
     channel: '#tech', 
     username: $('Webhook Trigger').item.json.agentId + ' Agent' 
   }) }}
   ```

3. **Prüfe:**
   - ✅ Expression beginnt mit `={{`
   - ✅ Expression endet mit `}}`
   - ✅ Strings in einfachen Anführungszeichen `'...'`
   - ✅ Keine Syntax-Fehler (keine roten Markierungen)

4. **Save** klicken

---

## ⚠️ Häufige Konfigurationsfehler

### Fehler 1: "Specify Body" nicht auf "JSON" gesetzt

**Symptom:**
- Body wird nicht gesendet
- Mattermost erhält keinen Body

**Lösung:**
1. **Specify Body:** `JSON` wählen (aus Dropdown)
2. **Save** klicken

---

### Fehler 2: Expression-Modus nicht aktiviert

**Symptom:**
- "JSON parameter needs to be valid JSON"
- Expression wird nicht ausgewertet

**Lösung:**
1. **{{ }} Button** klicken
2. Expression-Modus aktivieren
3. Expression erneut eintragen
4. **Save** klicken

---

### Fehler 3: Falsche Node-Referenz

**Symptom:**
- `$json.response` ist undefined
- Fehler: "Cannot read property 'response' of undefined"

**Lösung:**
- Prüfe, ob "Call Agent" Node korrekt konfiguriert ist
- Prüfe, ob die Verbindung zwischen Nodes korrekt ist
- Verwende `$('Call Agent').item.json.response` statt `$json.response`

---

### Fehler 4: URL-Expression falsch

**Symptom:**
- "Call Agent" Node fehlgeschlagen
- URL nicht korrekt aufgelöst

**Lösung:**
- URL sollte sein: `=http://138.199.237.34:7000/agent/{{ $json.agentId }}`
- Oder: `http://138.199.237.34:7000/agent/{{ $json.agentId }}` (ohne `=` am Anfang)

---

## ✅ Korrekte Konfiguration: "Send to Mattermost" Node

**Vollständige Konfiguration:**

1. **Method:** `POST`
2. **URL:** `https://chat.werdemeisterdeinergedanken.de/hooks/tzw3a5godjfpicpu87ixzut39w`
3. **Authentication:** `None`
4. **Send Body:** ✅ **ON**
5. **Body Content Type:** `JSON`
6. **Specify Body:** `JSON` (aus Dropdown wählen!)
7. **JSON Body:** Expression-Modus aktivieren ({{ }} Button)
8. **JSON Body Expression:**
   ```
   ={{ JSON.stringify({ 
     text: '## 🤖 Agent-Antwort\n\n**Agent:** ' + $('Webhook Trigger').item.json.agentId + '\n**Anfrage:** ' + $('Webhook Trigger').item.json.message + '\n\n---\n\n' + $json.response, 
     channel: '#tech', 
     username: $('Webhook Trigger').item.json.agentId + ' Agent' 
   }) }}
   ```

---

## 🧪 Test: Minimale Expression

**Falls die Expression nicht funktioniert, testen Sie mit minimaler Expression:**

1. **JSON Body Feld leeren**
2. **Expression-Modus aktivieren** ({{ }} Button)
3. **Minimale Expression eintragen:**
   ```
   ={{ JSON.stringify({ text: 'Test', channel: '#tech', username: 'Test Bot' }) }}
   ```
4. **Save** klicken
5. **Workflow testen** (Execute Workflow)
6. **Falls erfolgreich:** Expression schrittweise erweitern

---

## ✅ Checkliste: Vollständige Konfiguration

**"Call Agent" Node:**
- [ ] Method: `POST` ✅
- [ ] URL: `=http://138.199.237.34:7000/agent/{{ $json.agentId }}` ✅
- [ ] Send Body: **ON** ✅
- [ ] Body Content Type: `JSON` ✅
- [ ] Specify Body: `JSON` ✅
- [ ] JSON Body: `={{ JSON.stringify({ message: $json.message }) }}` ✅

**"Send to Mattermost" Node:**
- [ ] Method: `POST` ✅
- [ ] URL: `https://chat.werdemeisterdeinergedanken.de/hooks/tzw3a5godjfpicpu87ixzut39w` ✅
- [ ] Send Body: **ON** ✅
- [ ] Body Content Type: `JSON` ✅
- [ ] Specify Body: `JSON` ✅ (WICHTIG!)
- [ ] Expression-Modus aktiviert ({{ }} Button) ✅
- [ ] JSON Body Expression korrekt ✅

**Workflow:**
- [ ] Alle Nodes gespeichert ✅
- [ ] Workflow gespeichert ✅
- [ ] Workflow aktiviert ✅

---

## 🚨 Falls weiterhin Probleme

### Debug: Node Output prüfen

1. **Workflow ausführen** (Execute Workflow)
2. **"Call Agent" Node** öffnen
3. **Output prüfen:**
   - Sollte `response` Feld enthalten
   - Falls nicht → MCP Server prüfen

4. **"Send to Mattermost" Node** öffnen
5. **Output prüfen:**
   - Sollte HTTP 200 zeigen
   - Falls Fehler → Mattermost Webhook prüfen

---

## ✅ Zusammenfassung

**Wichtigste Punkte:**
1. ✅ **Specify Body:** `JSON` wählen (nicht "Using Fields Below")
2. ✅ **Expression-Modus aktivieren** ({{ }} Button)
3. ✅ **Expression korrekt eintragen** (beginnt mit `={{`, endet mit `}}`)
4. ✅ **Alle Nodes speichern**
5. ✅ **Workflow speichern**

---

**Status:** 🔧 **Konfigurations-Korrektur-Anleitung erstellt!**
