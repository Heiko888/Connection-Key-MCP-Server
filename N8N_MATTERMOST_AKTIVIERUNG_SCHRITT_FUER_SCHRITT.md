# 🚀 n8n Mattermost Workflows - Aktivierung Schritt für Schritt

**Ziel:** 3 Mattermost Workflows konfigurieren und aktivieren

**Geschätzter Aufwand:** 15-20 Minuten

---

## 📋 Voraussetzungen

**Bereits erledigt:**
- ✅ Workflows gelöscht
- ✅ Workflows neu importiert
- ✅ Mattermost Webhooks vorhanden

**Jetzt:**
- 🔧 Workflows konfigurieren
- ✅ Workflows aktivieren
- 🧪 Workflows testen

---

## 📋 Schritt 1: Workflow 1 - "Agent → Mattermost Notification"

### 1.1: Workflow öffnen

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Workflows** öffnen
3. **"Agent → Mattermost Notification"** öffnen

---

### 1.2: Mattermost Webhook-URL eintragen

1. **"Send to Mattermost" Node** doppelklicken
2. **Method:** `POST` ✅ (sollte bereits gesetzt sein)
3. **URL-Feld:**
   - Alte URL löschen (falls vorhanden)
   - Neue URL eintragen: `https://chat.werdemeisterdeinergedanken.de/hooks/tzw3a5godjfpicpu87ixzut39w`
4. **Save** klicken

---

### 1.3: JSON Body konfigurieren

1. **"Send to Mattermost" Node** nochmal öffnen
2. **Specify Body:** `JSON` wählen (aus Dropdown)
3. **JSON Body:** Expression-Modus aktivieren ({{ }} Button klicken)
4. **Expression eintragen:**
   ```
   ={{ JSON.stringify({ 
     text: '## 🤖 Agent-Antwort\n\n**Agent:** ' + $('Webhook Trigger').item.json.agentId + '\n**Anfrage:** ' + $('Webhook Trigger').item.json.message + '\n\n---\n\n' + $json.response, 
     channel: '#tech', 
     username: $('Webhook Trigger').item.json.agentId + ' Agent' 
   }) }}
   ```
5. **Save** klicken

**WICHTIG:**
- ✅ Expression beginnt mit `={{`
- ✅ Expression endet mit `}}`
- ✅ Strings in einfachen Anführungszeichen `'...'`

---

### 1.4: Workflow speichern

1. **Save** klicken (oben rechts)
2. **Prüfen:** Keine roten Warnungen in Nodes

---

### 1.5: Workflow aktivieren

1. **"Active" Toggle** aktivieren (oben rechts)
2. **Status sollte:** `Active` (grün) werden
3. **Falls Fehler:** "Please resolve outstanding issues"
   - Alle roten Warnungen beheben
   - Erneut aktivieren versuchen

---

## 📋 Schritt 2: Workflow 2 - "Reading Generation → Mattermost"

### 2.1: Workflow öffnen

1. **Workflows** öffnen
2. **"Reading Generation → Mattermost"** öffnen

---

### 2.2: Mattermost Webhook-URL eintragen

1. **"Send to Mattermost" Node** doppelklicken
2. **URL-Feld:**
   - Alte URL löschen (falls vorhanden)
   - Neue URL eintragen: `https://chat.werdemeisterdeinergedanken.de/hooks/wo6d1jb3ftf85kob4eeeyg74th`
3. **Save** klicken

---

### 2.3: JSON Body konfigurieren

1. **"Send to Mattermost" Node** nochmal öffnen
2. **Specify Body:** `JSON` wählen
3. **JSON Body:** Expression-Modus aktivieren ({{ }} Button)
4. **Expression eintragen:**
   ```
   ={{ JSON.stringify({ 
     text: '## 🔮 Neues Reading generiert!\n\n**User:** ' + ($('Webhook Trigger').item.json.userId || 'Unbekannt') + '\n**Typ:** ' + ($('Webhook Trigger').item.json.readingType || 'detailed') + '\n**Geburtsdatum:** ' + $('Webhook Trigger').item.json.birthDate + '\n\n---\n\n' + ($json.reading || $json.reading_text || 'Reading generiert'), 
     channel: '#readings', 
     username: 'Reading Agent' 
   }) }}
   ```
5. **Save** klicken

---

### 2.4: Workflow speichern & aktivieren

1. **Save** klicken (oben rechts)
2. **"Active" Toggle** aktivieren
3. **Status sollte:** `Active` (grün) werden

---

## 📋 Schritt 3: Workflow 3 - "Scheduled Agent Reports → Mattermost"

### 3.1: Workflow öffnen

1. **Workflows** öffnen
2. **"Scheduled Agent Reports → Mattermost"** öffnen

---

### 3.2: Mattermost Webhook-URL eintragen

1. **"Send to Mattermost" Node** doppelklicken
2. **URL-Feld:**
   - Alte URL löschen (falls vorhanden)
   - Neue URL eintragen: `https://chat.werdemeisterdeinergedanken.de/hooks/3f36p7d7qfbcu8qw5nzcyx9zga`
3. **Save** klicken

---

### 3.3: JSON Body konfigurieren

1. **"Send to Mattermost" Node** nochmal öffnen
2. **Specify Body:** `JSON` wählen
3. **JSON Body:** Expression-Modus aktivieren ({{ }} Button)
4. **Expression eintragen:**
   ```
   ={{ JSON.stringify({ 
     text: '## 📢 Täglicher Marketing-Content generiert!\n\n**Zeit:** ' + $now + '\n\n---\n\n' + ($json.response || 'Content generiert'), 
     channel: '#marketing', 
     username: 'Marketing Agent' 
   }) }}
   ```
5. **Save** klicken

---

### 3.4: Marketing Agent Node prüfen

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

### 3.5: Workflow speichern & aktivieren

1. **Save** klicken (oben rechts)
2. **"Active" Toggle** aktivieren
3. **Status sollte:** `Active` (grün) werden

---

## 🧪 Schritt 4: Workflows testen

### Test 1: "Scheduled Agent Reports → Mattermost"

1. **Workflow öffnen**
2. **"Execute Workflow"** klicken (oben rechts)
3. **Erwartung:**
   - ✅ Schedule Trigger wird grün
   - ✅ Marketing Agent wird grün
   - ✅ Send to Mattermost wird grün
   - ✅ Nachricht erscheint in Mattermost Channel `#marketing`

---

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
- ✅ Nachricht erscheint in Mattermost Channel `#tech`

---

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

**Workflow 1: "Agent → Mattermost Notification"**
- [ ] Mattermost URL eingetragen (`tzw3a5godjfpicpu87ixzut39w`) ✅
- [ ] JSON Body konfiguriert ✅
- [ ] Workflow gespeichert ✅
- [ ] Workflow aktiviert ✅
- [ ] Getestet ✅

**Workflow 2: "Reading Generation → Mattermost"**
- [ ] Mattermost URL eingetragen (`wo6d1jb3ftf85kob4eeeyg74th`) ✅
- [ ] JSON Body konfiguriert ✅
- [ ] Workflow gespeichert ✅
- [ ] Workflow aktiviert ✅
- [ ] Getestet ✅

**Workflow 3: "Scheduled Agent Reports → Mattermost"**
- [ ] Mattermost URL eingetragen (`3f36p7d7qfbcu8qw5nzcyx9zga`) ✅
- [ ] JSON Body konfiguriert ✅
- [ ] Marketing Agent Node Body konfiguriert ✅
- [ ] Workflow gespeichert ✅
- [ ] Workflow aktiviert ✅
- [ ] Getestet ✅

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

---

### Problem: JSON Body Expression Fehler

**Lösung:**
- Expression muss mit `={{` beginnen
- Expression muss mit `}}` enden
- Strings in einfachen Anführungszeichen `'...'`
- Siehe `N8N_JSON_BODY_VALID_FIX.md`

---

### Problem: Marketing Agent "Bad request"

**Lösung:**
- Marketing Agent Node Body prüfen
- Siehe `N8N_MARKETING_AGENT_BODY_FIX.md`

---

### Problem: Mattermost Webhook 404

**Lösung:**
- Mattermost Webhook-URL prüfen
- Siehe `N8N_MATTERMOST_WEBHOOK_404_FIX.md`

---

## ✅ Zusammenfassung

**Konfiguriert:**
- ✅ Alle 3 Mattermost Webhook-URLs eingetragen
- ✅ Alle JSON Bodies konfiguriert
- ✅ Marketing Agent Node Body konfiguriert

**Aktiviert:**
- ✅ "Agent → Mattermost Notification" (Active)
- ✅ "Reading Generation → Mattermost" (Active)
- ✅ "Scheduled Agent Reports → Mattermost" (Active)

**Mattermost Webhooks:**
- Agent: `tzw3a5godjfpicpu87ixzut39w` ✅
- Reading: `wo6d1jb3ftf85kob4eeeyg74th` ✅
- Scheduled: `3f36p7d7qfbcu8qw5nzcyx9zga` ✅

---

**Status:** 🚀 **Mattermost-Aktivierung Schritt-für-Schritt Anleitung erstellt!**
