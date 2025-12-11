# 📁 Lokale n8n Workflow-Dateien - Übersicht

**✅ Alle Dateien sind lokal vorhanden!**

---

## 📂 Verzeichnis 1: `n8n-workflows/`

**Pfad:** `C:\AppProgrammierung\Projekte\MCP_Connection_Key\n8n-workflows\`

### Verfügbare Workflows:

1. **mailchimp-subscriber.json** (3.8 KB)
   - Mailchimp-Abonnenten automatisch verwalten

2. **mattermost-agent-notification.json** (3.4 KB)
   - Agent-Antworten → Mattermost senden

3. **mattermost-reading-notification.json** (3.9 KB)
   - Reading-Generierung → Mattermost benachrichtigen

4. **mattermost-scheduled-reports.json** (2.9 KB)
   - Tägliche Reports → Mattermost

---

## 📂 Verzeichnis 2: `integration/n8n-workflows/`

**Pfad:** `C:\AppProgrammierung\Projekte\MCP_Connection_Key\integration\n8n-workflows\`

### Verfügbare Workflows:

5. **chart-calculation-workflow.json** (11 KB)
   - Human Design Chart-Berechnung
   - **Empfohlen für Import**

6. **agent-automation-workflows.json** (6.1 KB)
   - Multi-Agent-Pipelines
   - Scheduled Tasks

7. **chart-calculation-workflow-swisseph.json** (12.7 KB)
   - Alternative mit Swiss Ephemeris
   - **Optional**

---

## 🚀 Import in n8n

### Schritt 1: n8n öffnen
- URL: `https://n8n.werdemeisterdeinergedankenagent.de`

### Schritt 2: Workflows importieren

**Für jeden Workflow:**

1. **Workflows** → **Import**
2. **Datei auswählen** (aus den obigen Verzeichnissen)
3. **Import** klicken

### Empfohlene Reihenfolge:

1. ✅ `integration/n8n-workflows/chart-calculation-workflow.json`
2. ✅ `integration/n8n-workflows/agent-automation-workflows.json`
3. ✅ `n8n-workflows/mattermost-agent-notification.json`
4. ✅ `n8n-workflows/mattermost-scheduled-reports.json`
5. ✅ `n8n-workflows/mattermost-reading-notification.json`
6. ⚠️ `n8n-workflows/mailchimp-subscriber.json` (optional)

---

## 📋 Quick Import Checkliste

- [ ] n8n geöffnet
- [ ] Workflow 1 importiert: `chart-calculation-workflow.json`
- [ ] Workflow 2 importiert: `agent-automation-workflows.json`
- [ ] Workflow 3 importiert: `mattermost-agent-notification.json`
- [ ] Workflow 4 importiert: `mattermost-scheduled-reports.json`
- [ ] Workflow 5 importiert: `mattermost-reading-notification.json`
- [ ] Alle Workflows aktiviert

---

## 💡 Tipp

**Dateien direkt per Drag & Drop importieren:**
1. n8n öffnen
2. **Workflows** → **Import**
3. Dateien aus Windows Explorer in n8n ziehen
4. Fertig!

---

**Status:** ✅ Alle Dateien sind lokal vorhanden und bereit für Import!

