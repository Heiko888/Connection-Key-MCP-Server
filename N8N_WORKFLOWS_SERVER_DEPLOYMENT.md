# 🚀 n8n Workflows auf gehosteten Server deployen

**Server:** 138.199.237.34  
**n8n URL:** `https://n8n.werdemeisterdeinergedankenagent.de`  
**n8n Verzeichnis:** `/opt/mcp-connection-key`

---

## 📋 Schritt 1: Workflows zum Server kopieren

### Option A: Automatisch (PowerShell Script)

**Auf Windows (PowerShell):**

```powershell
.\deploy-n8n-workflows-to-server.ps1
```

**Das Script:**
- Kopiert alle JSON-Dateien aus `n8n-workflows/` zum Server
- Erstellt Remote-Verzeichnis `/opt/mcp-connection-key/n8n-workflows`
- Zeigt Status für jede Datei

---

### Option B: Manuell (SCP)

**Von lokal (PowerShell oder Bash):**

```bash
# Alle Workflow-Dateien kopieren
scp n8n-workflows/*.json root@138.199.237.34:/opt/mcp-connection-key/n8n-workflows/
```

**Oder einzelne Dateien:**

```bash
scp n8n-workflows/agent-notification-simple.json root@138.199.237.34:/opt/mcp-connection-key/n8n-workflows/
scp n8n-workflows/scheduled-reports-simple.json root@138.199.237.34:/opt/mcp-connection-key/n8n-workflows/
scp n8n-workflows/reading-notification-simple.json root@138.199.237.34:/opt/mcp-connection-key/n8n-workflows/
scp n8n-workflows/chart-calculation-workflow.json root@138.199.237.34:/opt/mcp-connection-key/n8n-workflows/
scp n8n-workflows/agent-automation-workflows.json root@138.199.237.34:/opt/mcp-connection-key/n8n-workflows/
```

---

### Option C: Via SSH (Dateien direkt erstellen)

**SSH zum Server:**

```bash
ssh root@138.199.237.34
cd /opt/mcp-connection-key
mkdir -p n8n-workflows
```

**Dann Dateien manuell erstellen oder von lokal kopieren**

---

## ✅ Schritt 2: Dateien auf Server prüfen

**SSH zum Server:**

```bash
ssh root@138.199.237.34
cd /opt/mcp-connection-key/n8n-workflows
ls -la
```

**Sollte zeigen:**
```
agent-notification-simple.json
scheduled-reports-simple.json
reading-notification-simple.json
chart-calculation-workflow.json
agent-automation-workflows.json
mattermost-agent-notification.json
mattermost-scheduled-reports.json
mattermost-reading-notification.json
mailchimp-subscriber.json
```

---

## 📥 Schritt 3: Workflows in n8n importieren

### 3.1 n8n öffnen

**Im Browser:**
- URL: `https://n8n.werdemeisterdeinergedankenagent.de`

**Einloggen** mit Ihren Credentials

---

### 3.2 Workflows importieren

**Für jeden Workflow:**

1. **Workflows** → **Import** (oben rechts)
2. **Datei auswählen:**
   - **Option A:** Datei vom Server hochladen
     - SSH zum Server
     - Datei lokal kopieren (z.B. via SCP)
     - In n8n hochladen
   
   - **Option B:** Datei direkt in n8n erstellen
     - **Workflows** → **New Workflow**
     - **Menu** (3 Punkte) → **Import from File**
     - Datei auswählen

3. **Import** klicken
4. ✅ Workflow erscheint in der Liste

---

### 3.3 Empfohlene Reihenfolge

**Zuerst (ohne Mattermost - sofort aktivierbar):**

1. ✅ `agent-notification-simple.json`
2. ✅ `scheduled-reports-simple.json`
3. ✅ `reading-notification-simple.json`
4. ✅ `chart-calculation-workflow.json`
5. ✅ `agent-automation-workflows.json`

**Später (mit Mattermost - benötigt Mattermost URL):**

6. ⏳ `mattermost-agent-notification.json` (nach Mattermost Setup)
7. ⏳ `mattermost-scheduled-reports.json` (nach Mattermost Setup)
8. ⏳ `mattermost-reading-notification.json` (nach Mattermost Setup)

---

## ✅ Schritt 4: Workflows aktivieren

**Für jeden Workflow:**

1. **Workflow öffnen**
2. **"Active" Toggle** (oben rechts) aktivieren
3. ✅ **Workflow wird GRÜN**
4. **Save** klicken

**Die einfachen Workflows (ohne Mattermost) sollten sofort aktivierbar sein!**

---

## 🧪 Schritt 5: Testen

### Test: Agent Notification

**Webhook-URL kopieren** (aus n8n Workflow)

**Testen:**

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-notification \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "marketing",
    "message": "Erstelle einen Social Media Post"
  }'
```

**In n8n prüfen:**
- Workflow öffnen
- **"Executions" Tab** (unten)
- Sollte eine Ausführung zeigen

---

## 📋 Checkliste

- [ ] Workflow-Dateien zum Server kopiert
- [ ] Dateien auf Server geprüft (`ls -la`)
- [ ] n8n geöffnet
- [ ] 5 einfache Workflows importiert
- [ ] Alle Workflows aktiviert (grün)
- [ ] Ersten Test durchgeführt
- [ ] Webhook-URLs notiert

---

## 🆘 Troubleshooting

### Problem: Dateien nicht auf Server

**Lösung:**
```bash
# Prüfe ob Verzeichnis existiert
ssh root@138.199.237.34 "ls -la /opt/mcp-connection-key/n8n-workflows"

# Falls nicht: Erstelle es
ssh root@138.199.237.34 "mkdir -p /opt/mcp-connection-key/n8n-workflows"
```

### Problem: n8n nicht erreichbar

**Lösung:**
```bash
# Prüfe ob n8n läuft
ssh root@138.199.237.34 "docker ps | grep n8n"

# Falls nicht: Starte n8n
ssh root@138.199.237.34 "cd /opt/mcp-connection-key && docker compose up -d n8n"
```

### Problem: Workflow kann nicht importiert werden

**Lösung:**
- Prüfe ob JSON-Datei gültig ist
- Prüfe ob Datei vollständig kopiert wurde
- Versuche Datei lokal zu öffnen und zu prüfen

---

## 🎉 Fertig!

**Workflows sind jetzt auf dem Server und können in n8n importiert werden!**

**Nächster Schritt:** Workflows in n8n importieren und aktivieren

---

**Status:** ✅ Deployment-Anleitung erstellt!

