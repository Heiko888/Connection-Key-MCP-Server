# 🚀 n8n Mattermost Workflows - Komplett neu (Sauberer Neustart)

**Option B:** Alle Mattermost Workflows löschen und komplett neu importieren

**Vorteil:** Sauber, keine Konflikte, alles korrekt konfiguriert

---

## 📋 Schritt 1: Alle Mattermost Workflows löschen

### In n8n:

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Workflows** öffnen
3. **Für jeden Mattermost Workflow:**

**Zu löschende Workflows:**

**Mattermost Workflows (5 Stück):**
- "Agent → Mattermost Notification"
- "Reading Generation → Mattermost" (beide Versionen - 11 Dec und 16 Dec)
- "Scheduled Agent Reports → Mattermost" (beide Versionen - beide 16 Dec)

**"Ohne Mattermost" Workflows (4 Stück - optional, aber empfohlen):**
- "Agent Notification (ohne Mattermost)"
- "Tägliche Marketing-Content-Generierung"
- "Scheduled Agent Reports (ohne Mattermost)"
- "Reading Generation (ohne Mattermost)"

**Zusätzlich (Webhook-Konflikt beheben):**
- "Chart Calculation - Human Design" (ohne Swiss Ephemeris) → Löschen!
  - **Grund:** Webhook-Konflikt (beide nutzen `/webhook/chart-calculation`)
  - **Behalten:** "Chart Calculation - Human Design (Swiss Ephemeris)" (Active)

**Löschen:**
1. Workflow öffnen
2. **Drei-Punkte-Menü** (oben rechts) → **Archive** oder **Delete**
3. **Bestätigen**

**Wiederholen für alle Workflows!**

**Gesamt:** 10 Workflows löschen (5 Mattermost + 4 "ohne Mattermost" + 1 Chart Calculation)

---

## 📋 Schritt 2: Workflows neu importieren

### Für jeden Workflow:

1. **Workflows** → **"+"** → **"Import from File"**
2. **Datei auswählen:**
   - `n8n-workflows/mattermost-agent-notification.json`
   - `n8n-workflows/mattermost-reading-notification.json`
   - `n8n-workflows/mattermost-scheduled-reports.json`
3. **Import** klicken
4. **Noch NICHT aktivieren!**

**Importieren Sie alle 3 Workflows nacheinander!**

---

## 📋 Schritt 3: Mattermost Webhook-URLs eintragen

### Workflow 1: "Agent → Mattermost Notification"

1. **Workflow öffnen**
2. **"Send to Mattermost" Node** doppelklicken
3. **URL-Feld:**
   - Alte URL löschen (falls vorhanden)
   - Neue URL eintragen: `https://chat.werdemeisterdeinergedanken.de/hooks/tzw3a5godjfpicpu87ixzut39w`
4. **Save** klicken

### Workflow 2: "Reading Generation → Mattermost"

1. **Workflow öffnen**
2. **"Send to Mattermost" Node** doppelklicken
3. **URL-Feld:**
   - Alte URL löschen (falls vorhanden)
   - Neue URL eintragen: `https://chat.werdemeisterdeinergedanken.de/hooks/wo6d1jb3ftf85kob4eeeyg74th`
4. **Save** klicken

### Workflow 3: "Scheduled Agent Reports → Mattermost"

1. **Workflow öffnen**
2. **"Send to Mattermost" Node** doppelklicken
3. **URL-Feld:**
   - Alte URL löschen (falls vorhanden)
   - Neue URL eintragen: `https://chat.werdemeisterdeinergedanken.de/hooks/3f36p7d7qfbcu8qw5nzcyx9zga`
4. **Save** klicken

---

## 📋 Schritt 4: JSON Bodies konfigurieren

### Workflow 1: "Agent → Mattermost Notification"

1. **"Send to Mattermost" Node** öffnen
2. **Specify Body:** `JSON` wählen (aus Dropdown)
3. **JSON Body:** Expression-Modus aktivieren ({{ }} Button)
4. **Expression eintragen:**
   ```
   ={{ JSON.stringify({ 
     text: '## 🤖 Agent-Antwort\n\n**Agent:** ' + $('Webhook Trigger').item.json.agentId + '\n**Anfrage:** ' + $('Webhook Trigger').item.json.message + '\n\n---\n\n' + $json.response, 
     channel: '#general', 
     username: $('Webhook Trigger').item.json.agentId + ' Agent' 
   }) }}
   ```
5. **Save** klicken

### Workflow 2: "Reading Generation → Mattermost"

1. **"Send to Mattermost" Node** öffnen
2. **Specify Body:** `JSON` wählen
3. **JSON Body:** Expression-Modus aktivieren
4. **Expression eintragen:**
   ```
   ={{ JSON.stringify({ 
     text: '## 🔮 Neues Reading generiert!\n\n**User:** ' + ($('Webhook Trigger').item.json.userId || 'Unbekannt') + '\n**Typ:** ' + ($('Webhook Trigger').item.json.readingType || 'detailed') + '\n**Geburtsdatum:** ' + $('Webhook Trigger').item.json.birthDate + '\n\n---\n\n' + ($json.reading || $json.reading_text || 'Reading generiert'), 
     channel: '#readings', 
     username: 'Reading Agent' 
   }) }}
   ```
5. **Save** klicken

### Workflow 3: "Scheduled Agent Reports → Mattermost"

1. **"Send to Mattermost" Node** öffnen
2. **Specify Body:** `JSON` wählen
3. **JSON Body:** Expression-Modus aktivieren
4. **Expression eintragen:**
   ```
   ={{ JSON.stringify({ 
     text: '## 📢 Täglicher Marketing-Content generiert!\n\n**Zeit:** ' + $now + '\n\n---\n\n' + ($json.response || 'Content generiert'), 
     channel: '#marketing', 
     username: 'Marketing Agent' 
   }) }}
   ```
5. **Save** klicken

**WICHTIG:**
- ✅ Expression beginnt mit `={{`
- ✅ Expression endet mit `}}`
- ✅ Strings in einfachen Anführungszeichen `'...'`

---

## 📋 Schritt 5: Marketing Agent Node prüfen

### Für "Scheduled Agent Reports → Mattermost":

1. **"Marketing Agent" Node** öffnen
2. **Prüfe:**
   - **Method:** `POST` ✅
   - **URL:** `http://138.199.237.34:7000/agent/marketing` ✅ (ohne 's')
   - **Send Body:** ✅ **ON**
   - **Body Content Type:** `JSON` ✅
   - **Specify Body:** `JSON` ✅
   - **JSON Body:** `={{ JSON.stringify({ message: 'Erstelle 5 Social Media Posts für heute mit Themen: Manifestation, Energie, Human Design' }) }}`
3. **Save** klicken

---

## 📋 Schritt 6: Alle Workflows speichern

**Für jeden Workflow:**

1. **Workflow öffnen**
2. **Alle Nodes prüfen** (keine roten Warnungen)
3. **Save** klicken (oben rechts)

---

## 📋 Schritt 7: Workflows aktivieren

**Für jeden Workflow:**

1. **Workflow öffnen**
2. **"Active" Toggle** aktivieren (oben rechts)
3. **Status sollte:** `Active` (grün) werden
4. **Falls Fehler:** "Please resolve outstanding issues"
   - Alle roten Warnungen beheben
   - Erneut aktivieren versuchen

---

## 🧪 Schritt 8: Workflows testen

### Test 1: "Scheduled Agent Reports → Mattermost"

1. **Workflow öffnen**
2. **"Execute Workflow"** klicken (oben rechts)
3. **Erwartung:**
   - ✅ Schedule Trigger wird grün
   - ✅ Marketing Agent wird grün
   - ✅ Send to Mattermost wird grün
   - ✅ Nachricht erscheint in Mattermost Channel `#marketing`

### Test 2: "Agent → Mattermost Notification"

**Webhook-URL:**
```
https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost
```

**Test-Request:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "marketing",
    "message": "Test von curl"
  }'
```

**Erwartung:**
- ✅ Workflow wird ausgeführt
- ✅ Marketing Agent wird aufgerufen
- ✅ Antwort wird an Mattermost gesendet
- ✅ Nachricht erscheint in Mattermost Channel `#general`

### Test 3: "Reading Generation → Mattermost"

**Webhook-URL:**
```
https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost
```

**Test-Request:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "basic"
  }'
```

**Erwartung:**
- ✅ Workflow wird ausgeführt
- ✅ Reading wird generiert
- ✅ Benachrichtigung wird an Mattermost gesendet
- ✅ Nachricht erscheint in Mattermost Channel `#readings`

---

## ✅ Checkliste

**Bereinigung:**
- [ ] "Agent → Mattermost Notification" gelöscht ✅
- [ ] "Reading Generation → Mattermost" (beide) gelöscht ✅
- [ ] "Scheduled Agent Reports → Mattermost" (beide) gelöscht ✅
- [ ] "Agent Notification (ohne Mattermost)" gelöscht ✅
- [ ] "Tägliche Marketing-Content-Generierung" gelöscht ✅
- [ ] "Scheduled Agent Reports (ohne Mattermost)" gelöscht ✅
- [ ] "Reading Generation (ohne Mattermost)" gelöscht ✅
- [ ] "Chart Calculation - Human Design" (ohne Swiss Ephemeris) gelöscht ✅

**Neu importieren:**
- [ ] `mattermost-agent-notification.json` importiert ✅
- [ ] `mattermost-reading-notification.json` importiert ✅
- [ ] `mattermost-scheduled-reports.json` importiert ✅

**Konfiguration:**
- [ ] Agent → Mattermost: URL eingetragen (`tzw3a5godjfpicpu87ixzut39w`) ✅
- [ ] Reading → Mattermost: URL eingetragen (`wo6d1jb3ftf85kob4eeeyg74th`) ✅
- [ ] Scheduled → Mattermost: URL eingetragen (`3f36p7d7qfbcu8qw5nzcyx9zga`) ✅
- [ ] Alle JSON Bodies konfiguriert ✅
- [ ] Marketing Agent Node Body konfiguriert ✅
- [ ] Alle Workflows gespeichert ✅

**Aktivierung:**
- [ ] "Agent → Mattermost Notification" aktiviert ✅
- [ ] "Reading Generation → Mattermost" aktiviert ✅
- [ ] "Scheduled Agent Reports → Mattermost" aktiviert ✅
- [ ] Keine roten Warnungen ✅

**Test:**
- [ ] "Scheduled Agent Reports → Mattermost" getestet ✅
- [ ] "Agent → Mattermost Notification" getestet ✅
- [ ] "Reading Generation → Mattermost" getestet ✅
- [ ] Nachrichten erscheinen in Mattermost ✅

---

## 🚨 Falls Probleme

### Problem: "Please resolve outstanding issues"

**Lösung:**
1. Workflow öffnen
2. Alle Nodes durchgehen
3. Rote Warnungen beheben:
   - Placeholder-URLs ersetzen
   - JSON Bodies konfigurieren
   - Fehlende Credentials hinzufügen
4. Save & Erneut aktivieren

### Problem: JSON Body Expression Fehler

**Lösung:**
- Expression muss mit `={{` beginnen
- Expression muss mit `}}` enden
- Strings in einfachen Anführungszeichen `'...'`
- Siehe `N8N_JSON_BODY_VALID_FIX.md`

### Problem: Marketing Agent "Bad request"

**Lösung:**
- Marketing Agent Node Body prüfen
- Siehe `N8N_MARKETING_AGENT_BODY_FIX.md`

---

## ✅ Zusammenfassung

**Gelöscht:**
- ❌ Alle alten Mattermost Workflows (5 Stück)
- ❌ Alle "ohne Mattermost" Workflows (4 Stück)
- ❌ "Chart Calculation - Human Design" (ohne Swiss Ephemeris) - Webhook-Konflikt behoben

**Neu importiert:**
- ✅ `mattermost-agent-notification.json`
- ✅ `mattermost-reading-notification.json`
- ✅ `mattermost-scheduled-reports.json`

**Konfiguriert:**
- ✅ Alle Mattermost Webhook-URLs eingetragen
- ✅ Alle JSON Bodies konfiguriert
- ✅ Marketing Agent Node Body konfiguriert

**Aktiviert:**
- ✅ Alle 3 Workflows aktiviert

**Mattermost Webhooks (bereits vorhanden):**
- Agent: `tzw3a5godjfpicpu87ixzut39w` ✅
- Reading: `wo6d1jb3ftf85kob4eeeyg74th` ✅
- Scheduled: `3f36p7d7qfbcu8qw5nzcyx9zga` ✅

**Behalten (Active Workflows):**
- ✅ "Chart Calculation - Human Design (Swiss Ephemeris)" (Active)
- ✅ "Multi-Agent Content Pipeline" (Active)
- ✅ "Get New Subscribers" (ist Node, nicht Workflow)

---

**Status:** 🚀 **Komplett-Neu-Anleitung aktualisiert!**
