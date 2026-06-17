# 🗑️ n8n Workflows - Was löschen, was behalten?

**Problem:** Doppelte Workflows verursachen Konflikte

---

## ✅ Workflows BEHALTEN (offizielle, funktionsfähige)

### Mattermost Workflows (3 Stück):

1. **"Agent → Mattermost Notification"** ✅
   - Datei: `mattermost-agent-notification.json`
   - Erstellt: 11 Dec
   - Status: Inactive
   - **Aktion:** Behalten, aber neu konfigurieren

2. **"Reading Generation → Mattermost"** ✅
   - Datei: `mattermost-reading-notification.json`
   - Erstellt: 16 Dec (neuere Version)
   - Status: Inactive
   - **Aktion:** Behalten (neuere Version), ältere löschen

3. **"Scheduled Agent Reports → Mattermost"** ✅
   - Datei: `mattermost-scheduled-reports.json`
   - Erstellt: 16 Dec
   - Status: Inactive
   - **Aktion:** Behalten (neuere Version), ältere löschen

### Andere Workflows (falls vorhanden):

4. **"Reading Generation (ohne Mattermost)"** ⚠️
   - Status: Inactive
   - **Aktion:** Prüfen ob noch benötigt
   - Falls nicht benötigt → Löschen
   - Falls benötigt → Behalten

---

## 🗑️ Workflows LÖSCHEN (doppelte/alte)

### Doppelte Mattermost Workflows:

1. **"Reading Generation → Mattermost"** (ältere Version - 11 Dec) ❌
   - **Löschen!** (neuere Version behalten)

2. **"Scheduled Agent Reports → Mattermost"** (ältere Version, falls vorhanden) ❌
   - **Löschen!** (neuere Version behalten)

---

## 🚀 Empfehlung: Sauberer Neustart

### Option 1: Nur Doppelte löschen (schneller)

**Schritte:**
1. Ältere "Reading Generation → Mattermost" (11 Dec) löschen
2. Ältere "Scheduled Agent Reports → Mattermost" (falls vorhanden) löschen
3. Verbleibende Workflows konfigurieren:
   - Mattermost Webhook-URLs eintragen
   - JSON Bodies konfigurieren
4. Aktivieren

**Vorteil:** Schneller
**Nachteil:** Möglicherweise noch Konfigurationsprobleme

---

### Option 2: Komplett neu (sauberer) ⭐ EMPFOHLEN

**Schritte:**
1. **Alle Mattermost Workflows löschen:**
   - "Agent → Mattermost Notification"
   - "Reading Generation → Mattermost" (beide)
   - "Scheduled Agent Reports → Mattermost" (beide)

2. **Alle 3 Workflows neu importieren:**
   - `mattermost-agent-notification.json`
   - `mattermost-reading-notification.json`
   - `mattermost-scheduled-reports.json`

3. **Alle konfigurieren:**
   - Mattermost Webhook-URLs eintragen
   - JSON Bodies konfigurieren

4. **Aktivieren**

**Vorteil:** Sauber, keine Konflikte, alles korrekt konfiguriert
**Nachteil:** Etwas mehr Aufwand

---

## 📋 Schritt-für-Schritt: Komplett neu (Option 2)

### Schritt 1: Alle Mattermost Workflows löschen

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Workflows** öffnen
3. **Für jeden Mattermost Workflow:**
   - Workflow öffnen
   - **Drei-Punkte-Menü** (oben rechts) → **Archive** oder **Delete**
   - **Bestätigen**

**Zu löschende Workflows:**
- "Agent → Mattermost Notification"
- "Reading Generation → Mattermost" (beide Versionen)
- "Scheduled Agent Reports → Mattermost" (beide Versionen)

### Schritt 2: Workflows neu importieren

**Für jeden Workflow:**

1. **Workflows** → **"+"** → **"Import from File"**
2. **Datei auswählen:**
   - `n8n-workflows/mattermost-agent-notification.json`
   - `n8n-workflows/mattermost-reading-notification.json`
   - `n8n-workflows/mattermost-scheduled-reports.json`
3. **Import** klicken
4. **Noch NICHT aktivieren!**

### Schritt 3: Mattermost Webhook-URLs eintragen

**Workflow 1: "Agent → Mattermost Notification"**

1. Workflow öffnen
2. "Send to Mattermost" Node öffnen
3. URL: `https://chat.werdemeisterdeinergedanken.de/hooks/tzw3a5godjfpicpu87ixzut39w`
4. Save

**Workflow 2: "Reading Generation → Mattermost"**

1. Workflow öffnen
2. "Send to Mattermost" Node öffnen
3. URL: `https://chat.werdemeisterdeinergedanken.de/hooks/wo6d1jb3ftf85kob4eeeyg74th`
4. Save

**Workflow 3: "Scheduled Agent Reports → Mattermost"**

1. Workflow öffnen
2. "Send to Mattermost" Node öffnen
3. URL: `https://chat.werdemeisterdeinergedanken.de/hooks/3f36p7d7qfbcu8qw5nzcyx9zga`
4. Save

### Schritt 4: JSON Bodies konfigurieren

**Siehe:** `N8N_WORKFLOWS_BEREINIGUNG.md` Schritt 4.4

### Schritt 5: Aktivieren

1. Jeden Workflow öffnen
2. "Active" Toggle aktivieren
3. Status sollte: `Active` (grün) werden

---

## ✅ Checkliste

**Bereinigung:**
- [ ] Alle doppelten/alten Mattermost Workflows gelöscht ✅

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

## ✅ Zusammenfassung

**Löschen:**
- ❌ "Reading Generation → Mattermost" (ältere Version - 11 Dec)
- ❌ "Scheduled Agent Reports → Mattermost" (ältere Version, falls vorhanden)
- ❌ Alle Mattermost Workflows (falls komplett neu)

**Behalten/Neu importieren:**
- ✅ "Agent → Mattermost Notification" → `mattermost-agent-notification.json`
- ✅ "Reading Generation → Mattermost" → `mattermost-reading-notification.json`
- ✅ "Scheduled Agent Reports → Mattermost" → `mattermost-scheduled-reports.json`

**Mattermost Webhooks (bereits vorhanden):**
- Agent: `tzw3a5godjfpicpu87ixzut39w` ✅
- Reading: `wo6d1jb3ftf85kob4eeeyg74th` ✅
- Scheduled: `3f36p7d7qfbcu8qw5nzcyx9zga` ✅

---

**Status:** 🗑️ **Workflow-Lösch-Anleitung erstellt!**
