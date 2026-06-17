# 🧹 n8n Workflows - Bereinigung und Neustart

**Problem:** Doppelte Workflows verursachen Konflikte

**Lösung:** Alte/doppelte Workflows löschen, saubere Workflows neu importieren

---

## 📋 Aktuelle Situation

**Im Bild sichtbar:**
- "Reading Generation → Mattermost" (2x - 11 Dec und 16 Dec) → **Doppelt!**
- "Scheduled Agent Reports → Mattermost" (2x - beide 16 Dec) → **Doppelt!**
- "Agent → Mattermost Notification" (1x - 11 Dec) → OK
- "Reading Generation (ohne Mattermost)" (1x - 11 Dec) → Anderer Workflow

**Alle sind aktuell:** Inactive

---

## ✅ Offizielle Mattermost Workflows (aus Dateien)

**Diese 3 Workflows sind die offiziellen:**

1. **"Agent → Mattermost Notification"**
   - Datei: `mattermost-agent-notification.json`
   - Webhook: `/webhook/agent-mattermost`
   - Mattermost Webhook: `tzw3a5godjfpicpu87ixzut39w` ✅

2. **"Reading Generation → Mattermost"**
   - Datei: `mattermost-reading-notification.json`
   - Webhook: `/webhook/reading-mattermost`
   - Mattermost Webhook: `wo6d1jb3ftf85kob4eeeyg74th` ✅

3. **"Scheduled Agent Reports → Mattermost"**
   - Datei: `mattermost-scheduled-reports.json`
   - Webhook: Schedule Trigger (kein Webhook)
   - Mattermost Webhook: `3f36p7d7qfbcu8qw5nzcyx9zga` ✅

---

## 🗑️ Workflows die gelöscht werden können

### Doppelte Workflows (löschen):

1. **"Reading Generation → Mattermost"** (ältere Version - 11 Dec)
   - Falls es 2x gibt, die ältere löschen
   - Die neuere (16 Dec) behalten

2. **"Scheduled Agent Reports → Mattermost"** (eine der beiden)
   - Falls es 2x gibt, eine löschen
   - Die neuere behalten

### Andere Workflows (optional):

3. **"Reading Generation (ohne Mattermost)"** (11 Dec)
   - Falls nicht mehr benötigt → Löschen
   - Falls noch benötigt → Behalten

---

## ✅ Schritt-für-Schritt: Bereinigung

### Schritt 1: Doppelte Workflows identifizieren

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Workflows** öffnen
3. **Prüfe:**
   - Welche Workflows haben denselben Namen?
   - Welche sind älter (11 Dec)?
   - Welche sind neuer (16 Dec)?

### Schritt 2: Alte/doppelte Workflows löschen

**Für jeden doppelten Workflow:**

1. **Workflow öffnen** (die ältere Version)
2. **Drei-Punkte-Menü** (oben rechts) → **Archive** oder **Delete**
3. **Bestätigen**

**Empfehlung:**
- Ältere Versionen (11 Dec) löschen
- Neuere Versionen (16 Dec) behalten

### Schritt 3: Alle Mattermost Workflows löschen (sauberer Neustart)

**Falls Sie komplett neu starten möchten:**

1. **Alle Mattermost Workflows löschen:**
   - "Agent → Mattermost Notification"
   - "Reading Generation → Mattermost" (beide)
   - "Scheduled Agent Reports → Mattermost" (beide)

2. **Alle Workflows neu importieren** (siehe Schritt 4)

---

## ✅ Schritt 4: Workflows neu importieren

### Schritt 4.1: Workflow-Dateien prüfen

**Lokale Dateien:**
- `n8n-workflows/mattermost-agent-notification.json`
- `n8n-workflows/mattermost-reading-notification.json`
- `n8n-workflows/mattermost-scheduled-reports.json`

### Schritt 4.2: Workflows importieren

**Für jeden Workflow:**

1. **n8n öffnen**
2. **Workflows** → **"+"** → **"Import from File"**
3. **Datei auswählen:**
   - `mattermost-agent-notification.json`
   - `mattermost-reading-notification.json`
   - `mattermost-scheduled-reports.json`
4. **Import** klicken
5. **Noch NICHT aktivieren!**

### Schritt 4.3: Mattermost Webhook-URLs eintragen

**Für jeden Workflow:**

1. **Workflow öffnen**
2. **"Send to Mattermost" Node** öffnen
3. **URL eintragen:**
   - **"Agent → Mattermost Notification"** → `https://chat.werdemeisterdeinergedanken.de/hooks/tzw3a5godjfpicpu87ixzut39w`
   - **"Reading Generation → Mattermost"** → `https://chat.werdemeisterdeinergedanken.de/hooks/wo6d1jb3ftf85kob4eeeyg74th`
   - **"Scheduled Agent Reports → Mattermost"** → `https://chat.werdemeisterdeinergedanken.de/hooks/3f36p7d7qfbcu8qw5nzcyx9zga`
4. **JSON Body prüfen** (siehe Schritt 4.4)
5. **Save** klicken

### Schritt 4.4: JSON Body konfigurieren

**Für "Scheduled Agent Reports → Mattermost":**

1. **"Send to Mattermost" Node** öffnen
2. **Specify Body:** `JSON` wählen
3. **JSON Body** (Expression-Modus):
   ```
   ={{ JSON.stringify({ 
     text: '## 📢 Täglicher Marketing-Content generiert!\n\n**Zeit:** ' + $now + '\n\n---\n\n' + ($json.response || 'Content generiert'), 
     channel: '#marketing', 
     username: 'Marketing Agent' 
   }) }}
   ```
4. **Save** klicken

**Für "Agent → Mattermost Notification":**

1. **"Send to Mattermost" Node** öffnen
2. **Specify Body:** `JSON` wählen
3. **JSON Body** (Expression-Modus):
   ```
   ={{ JSON.stringify({ 
     text: '## 🤖 Agent-Antwort\n\n**Agent:** ' + $('Webhook Trigger').item.json.agentId + '\n**Anfrage:** ' + $('Webhook Trigger').item.json.message + '\n\n---\n\n' + $json.response, 
     channel: '#general', 
     username: $('Webhook Trigger').item.json.agentId + ' Agent' 
   }) }}
   ```
4. **Save** klicken

**Für "Reading Generation → Mattermost":**

1. **"Send to Mattermost" Node** öffnen
2. **Specify Body:** `JSON` wählen
3. **JSON Body** (Expression-Modus):
   ```
   ={{ JSON.stringify({ 
     text: '## 🔮 Neues Reading generiert!\n\n**User:** ' + ($('Webhook Trigger').item.json.userId || 'Unbekannt') + '\n**Typ:** ' + ($('Webhook Trigger').item.json.readingType || 'detailed') + '\n**Geburtsdatum:** ' + $('Webhook Trigger').item.json.birthDate + '\n\n---\n\n' + ($json.reading || $json.reading_text || 'Reading generiert'), 
     channel: '#readings', 
     username: 'Reading Agent' 
   }) }}
   ```
4. **Save** klicken

---

## ✅ Schritt 5: Workflows aktivieren

**Für jeden Workflow:**

1. **Workflow öffnen**
2. **Alle Nodes prüfen** (keine roten Warnungen)
3. **"Active" Toggle** aktivieren
4. **Status sollte:** `Active` (grün) werden

---

## 📋 Checkliste: Bereinigung

**Vor der Bereinigung:**
- [ ] Doppelte Workflows identifiziert ✅
- [ ] Welche sollen gelöscht werden? ✅

**Bereinigung:**
- [ ] Alte/doppelte Workflows gelöscht ✅
- [ ] Alle Mattermost Workflows gelöscht (falls komplett neu) ✅

**Neu importieren:**
- [ ] `mattermost-agent-notification.json` importiert ✅
- [ ] `mattermost-reading-notification.json` importiert ✅
- [ ] `mattermost-scheduled-reports.json` importiert ✅

**Konfiguration:**
- [ ] Alle Mattermost Webhook-URLs eingetragen ✅
- [ ] Alle JSON Bodies konfiguriert ✅
- [ ] Alle Workflows gespeichert ✅

**Aktivierung:**
- [ ] Alle Workflows aktiviert ✅
- [ ] Keine roten Warnungen ✅
- [ ] Workflows getestet ✅

---

## 🎯 Empfehlung: Sauberer Neustart

**Option A: Nur Doppelte löschen (schneller)**

1. Ältere Versionen (11 Dec) löschen
2. Neuere Versionen (16 Dec) behalten
3. URLs und Bodies prüfen/korrigieren
4. Aktivieren

**Option B: Komplett neu (sauberer)**

1. **Alle Mattermost Workflows löschen**
2. **Alle 3 Workflows neu importieren** (aus Dateien)
3. **Alle URLs eintragen** (aus Mattermost)
4. **Alle Bodies konfigurieren**
5. **Aktivieren**

**Empfehlung:** Option B (sauberer Neustart)

---

## ✅ Zusammenfassung

**Doppelte Workflows:**
- "Reading Generation → Mattermost" (2x) → Eine löschen
- "Scheduled Agent Reports → Mattermost" (2x) → Eine löschen

**Offizielle Workflows (behalten/neu importieren):**
1. "Agent → Mattermost Notification" → `mattermost-agent-notification.json`
2. "Reading Generation → Mattermost" → `mattermost-reading-notification.json`
3. "Scheduled Agent Reports → Mattermost" → `mattermost-scheduled-reports.json`

**Mattermost Webhooks (bereits vorhanden):**
- Agent: `tzw3a5godjfpicpu87ixzut39w` ✅
- Reading: `wo6d1jb3ftf85kob4eeeyg74th` ✅
- Scheduled: `3f36p7d7qfbcu8qw5nzcyx9zga` ✅

---

**Status:** 🧹 **Workflow-Bereinigungs-Anleitung erstellt!**
