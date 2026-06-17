# 📋 n8n Workflows - Komplette Übersicht

**Alle verfügbaren Workflow-Dateien**

---

## 📂 Verzeichnis 1: `n8n-workflows/` (4 Dateien)

**Pfad:** `C:\AppProgrammierung\Projekte\MCP_Connection_Key\n8n-workflows\`

### 1. mailchimp-subscriber.json (3.8 KB)
- **Typ:** Einzelner Workflow
- **Funktion:** Mailchimp-Abonnenten automatisch verwalten
- **Status:** ✅ Vorhanden

### 2. mattermost-agent-notification.json (3.4 KB)
- **Typ:** Einzelner Workflow
- **Funktion:** Agent-Antworten → Mattermost senden
- **Status:** ✅ Vorhanden

### 3. mattermost-reading-notification.json (3.9 KB)
- **Typ:** Einzelner Workflow
- **Funktion:** Reading-Generierung → Mattermost benachrichtigen
- **Status:** ✅ Vorhanden

### 4. mattermost-scheduled-reports.json (2.9 KB)
- **Typ:** Einzelner Workflow
- **Funktion:** Tägliche Reports → Mattermost
- **Status:** ✅ Vorhanden

---

## 📂 Verzeichnis 2: `integration/n8n-workflows/` (3 Dateien)

**Pfad:** `C:\AppProgrammierung\Projekte\MCP_Connection_Key\integration\n8n-workflows\`

### 5. chart-calculation-workflow.json (11 KB)
- **Typ:** Einzelner Workflow
- **Funktion:** Human Design Chart-Berechnung
- **Status:** ✅ Vorhanden
- **Empfohlen:** ✅ Ja

### 6. agent-automation-workflows.json (6.1 KB)
- **Typ:** **MEHRERE Workflows** (Array)
- **Funktion:** Multi-Agent-Pipelines, Scheduled Tasks
- **Enthält:**
  - Tägliche Marketing-Content-Generierung
  - Automatische Reading-Generierung
  - Multi-Agent-Pipeline
- **Status:** ✅ Vorhanden
- **Wichtig:** Diese Datei enthält mehrere Workflows!

### 7. chart-calculation-workflow-swisseph.json (12.7 KB)
- **Typ:** Einzelner Workflow
- **Funktion:** Alternative Chart-Berechnung mit Swiss Ephemeris
- **Status:** ✅ Vorhanden
- **Optional:** Ja (Alternative zu #5)

---

## 📊 Zusammenfassung

**Gesamt:** 7 JSON-Dateien

**Einzelne Workflows:** 6 Dateien
- 4x Mattermost Workflows
- 1x Chart Calculation
- 1x Mailchimp

**Multi-Workflow Datei:** 1 Datei
- `agent-automation-workflows.json` enthält mehrere Workflows

**Gesamtanzahl Workflows:** ~8-10 Workflows (je nach Inhalt von agent-automation-workflows.json)

---

## 🚀 Import-Empfehlung

### Priorität 1 (Wichtig):
1. ✅ `integration/n8n-workflows/chart-calculation-workflow.json`
2. ✅ `integration/n8n-workflows/agent-automation-workflows.json` (enthält mehrere!)
3. ✅ `n8n-workflows/mattermost-agent-notification.json`
4. ✅ `n8n-workflows/mattermost-scheduled-reports.json`
5. ✅ `n8n-workflows/mattermost-reading-notification.json`

### Priorität 2 (Optional):
6. ⚠️ `n8n-workflows/mailchimp-subscriber.json`
7. ⚠️ `integration/n8n-workflows/chart-calculation-workflow-swisseph.json` (Alternative)

---

## 💡 Wichtig: agent-automation-workflows.json

**Diese Datei enthält MEHRERE Workflows!**

Beim Import in n8n:
- n8n erkennt automatisch, dass es mehrere Workflows sind
- Alle Workflows werden importiert
- Jeder Workflow erscheint einzeln in der Liste

**Enthaltene Workflows:**
- Tägliche Marketing-Content-Generierung
- Automatische Reading-Generierung
- Multi-Agent-Pipeline

---

## ✅ Alle Dateien vorhanden!

**Status:** ✅ 7 JSON-Dateien lokal vorhanden
**Bereit für Import:** ✅ Ja

