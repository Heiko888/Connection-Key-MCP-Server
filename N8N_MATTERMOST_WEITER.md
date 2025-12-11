# 🚀 n8n Mattermost Workflows - Weiter mit den anderen Workflows

**Status:** Workflow 1 ("Agent → Mattermost Notification") korrigiert ✅

**Nächste Schritte:** Workflow 2 und 3 konfigurieren

---

## 📋 Workflow 2: "Reading Generation → Mattermost"

### Schritt 1: Workflow öffnen

1. **Workflows** öffnen
2. **"Reading Generation → Mattermost"** öffnen

---

### Schritt 2: Mattermost Webhook-URL eintragen

1. **"Send to Mattermost" Node** doppelklicken
2. **URL-Feld:**
   - Alte URL löschen (falls vorhanden)
   - Neue URL eintragen: `https://chat.werdemeisterdeinergedanken.de/hooks/wo6d1jb3ftf85kob4eeeyg74th`
3. **Save** klicken

---

### Schritt 3: "Specify Body" auf JSON ändern

1. **"Specify Body" Dropdown** öffnen
2. **`JSON` wählen** (nicht "Using Fields Below")
3. **Nach dem Wechsel:** "JSON Body" Feld erscheint

---

### Schritt 4: JSON Body Expression eintragen

1. **JSON Body Feld** öffnen
2. **Expression-Modus aktivieren** ({{ }} Button)
3. **Expression eintragen:**
   ```
   ={{ JSON.stringify({ 
     text: '## 🔮 Neues Reading generiert!\n\n**User:** ' + ($('Webhook Trigger').item.json.userId || 'Unbekannt') + '\n**Typ:** ' + ($('Webhook Trigger').item.json.readingType || 'detailed') + '\n**Geburtsdatum:** ' + $('Webhook Trigger').item.json.birthDate + '\n\n---\n\n' + ($json.reading || $json.reading_text || 'Reading generiert'), 
     channel: '#readings', 
     username: 'Reading Agent' 
   }) }}
   ```
4. **Save** klicken

---

### Schritt 5: Workflow speichern & aktivieren

1. **Save** klicken (oben rechts)
2. **"Active" Toggle** aktivieren
3. **Status sollte:** `Active` (grün) werden

---

## 📋 Workflow 3: "Scheduled Agent Reports → Mattermost"

### Schritt 1: Workflow öffnen

1. **Workflows** öffnen
2. **"Scheduled Agent Reports → Mattermost"** öffnen

---

### Schritt 2: Mattermost Webhook-URL eintragen

1. **"Send to Mattermost" Node** doppelklicken
2. **URL-Feld:**
   - Alte URL löschen (falls vorhanden)
   - Neue URL eintragen: `https://chat.werdemeisterdeinergedanken.de/hooks/3f36p7d7qfbcu8qw5nzcyx9zga`
3. **Save** klicken

---

### Schritt 3: "Specify Body" auf JSON ändern

1. **"Specify Body" Dropdown** öffnen
2. **`JSON` wählen** (nicht "Using Fields Below")
3. **Nach dem Wechsel:** "JSON Body" Feld erscheint

---

### Schritt 4: JSON Body Expression eintragen

1. **JSON Body Feld** öffnen
2. **Expression-Modus aktivieren** ({{ }} Button)
3. **Expression eintragen:**
   ```
   ={{ JSON.stringify({ 
     text: '## 📢 Täglicher Marketing-Content generiert!\n\n**Zeit:** ' + $now + '\n\n---\n\n' + ($json.response || 'Content generiert'), 
     channel: '#marketing', 
     username: 'Marketing Agent' 
   }) }}
   ```
4. **Save** klicken

---

### Schritt 5: Marketing Agent Node prüfen

1. **"Marketing Agent" Node** öffnen
2. **Prüfe:**
   - **Method:** `POST` ✅
   - **URL:** `http://138.199.237.34:7000/agent/marketing` ✅
   - **Send Body:** ✅ **ON**
   - **Body Content Type:** `JSON` ✅
   - **Specify Body:** `JSON` ✅
   - **JSON Body:** `={{ JSON.stringify({ message: 'Erstelle 5 Social Media Posts für heute mit Themen: Manifestation, Energie, Human Design' }) }}`
3. **Save** klicken

---

### Schritt 6: Workflow speichern & aktivieren

1. **Save** klicken (oben rechts)
2. **"Active" Toggle** aktivieren
3. **Status sollte:** `Active` (grün) werden

---

## ✅ Checkliste: Alle 3 Workflows

**Workflow 1: "Agent → Mattermost Notification"**
- [ ] URL korrekt ✅
- [ ] Specify Body: `JSON` ✅
- [ ] JSON Body Expression eingetragen ✅
- [ ] Aktiviert ✅

**Workflow 2: "Reading Generation → Mattermost"**
- [ ] URL eingetragen (`wo6d1jb3ftf85kob4eeeyg74th`) ✅
- [ ] Specify Body: `JSON` ✅
- [ ] JSON Body Expression eingetragen ✅
- [ ] Aktiviert ✅

**Workflow 3: "Scheduled Agent Reports → Mattermost"**
- [ ] URL eingetragen (`3f36p7d7qfbcu8qw5nzcyx9zga`) ✅
- [ ] Specify Body: `JSON` ✅
- [ ] JSON Body Expression eingetragen ✅
- [ ] Marketing Agent Node Body konfiguriert ✅
- [ ] Aktiviert ✅

---

## 🧪 Alle Workflows testen

### Test 1: "Agent → Mattermost Notification"

**In n8n:**
1. Workflow öffnen
2. **"Execute Workflow"** klicken
3. **Test Data:**
   - **agentId:** `marketing`
   - **message:** `Test`
4. **Execute** klicken
5. **Erwartung:** Nachricht in Mattermost Channel `#tech`

---

### Test 2: "Reading Generation → Mattermost"

**In n8n:**
1. Workflow öffnen
2. **"Execute Workflow"** klicken
3. **Test Data:**
   - **birthDate:** `1990-05-15`
   - **birthTime:** `14:30`
   - **birthPlace:** `Berlin`
   - **readingType:** `basic`
4. **Execute** klicken
5. **Erwartung:** Nachricht in Mattermost Channel `#readings`

---

### Test 3: "Scheduled Agent Reports → Mattermost"

**In n8n:**
1. Workflow öffnen
2. **"Execute Workflow"** klicken
3. **Erwartung:**
   - Schedule Trigger wird grün
   - Marketing Agent wird grün
   - Send to Mattermost wird grün
   - Nachricht in Mattermost Channel `#marketing`

---

## ✅ Zusammenfassung

**Alle 3 Workflows konfigurieren:**
1. ✅ Workflow 1: "Agent → Mattermost Notification" (bereits korrigiert)
2. 🔧 Workflow 2: "Reading Generation → Mattermost" (jetzt konfigurieren)
3. 🔧 Workflow 3: "Scheduled Agent Reports → Mattermost" (danach konfigurieren)

**Für jeden Workflow:**
- URL eintragen
- Specify Body: `JSON` wählen
- JSON Body Expression eintragen
- Aktivieren

---

**Status:** 🚀 **Nächste Schritte dokumentiert!**
