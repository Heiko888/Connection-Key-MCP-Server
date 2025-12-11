# 🚀 n8n Workflows - Quick Start

**n8n Server:** `https://n8n.werdemeisterdeinergedankenagent.de`  
**Server IP:** 138.199.237.34  
**Verzeichnis:** `/opt/mcp-connection-key/n8n-workflows`

---

## 📥 Schritt 1: Workflows zum Server kopieren

### Automatisch (PowerShell):

```powershell
.\deploy-n8n-workflows-to-server.ps1
```

### Manuell (SCP):

```bash
scp n8n-workflows/*.json root@138.199.237.34:/opt/mcp-connection-key/n8n-workflows/
```

---

## 🌐 Schritt 2: n8n öffnen

**URL:** `https://n8n.werdemeisterdeinergedankenagent.de`

**Einloggen** mit Ihren Credentials

---

## 📥 Schritt 3: Workflows importieren

1. **Workflows** → **Import** (oben rechts)
2. **Datei auswählen** (lokal oder vom Server)
3. **Import** klicken

**Empfohlene Reihenfolge:**

✅ **Zuerst (ohne Mattermost - sofort aktivierbar):**
- `agent-notification-simple.json`
- `scheduled-reports-simple.json`
- `reading-notification-simple.json`
- `chart-calculation-workflow.json`
- `agent-automation-workflows.json`

⏳ **Später (mit Mattermost):**
- `mattermost-agent-notification.json`
- `mattermost-scheduled-reports.json`
- `mattermost-reading-notification.json`

---

## ✅ Schritt 4: Workflows aktivieren

1. **Workflow öffnen**
2. **"Active" Toggle** aktivieren (oben rechts)
3. ✅ **Workflow wird GRÜN**
4. **Save** klicken

---

## 🧪 Schritt 5: Testen

**Webhook-URL kopieren** (aus n8n Workflow)

**Test:**

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

## ✅ Checkliste

- [ ] Workflows zum Server kopiert
- [ ] n8n geöffnet: `https://n8n.werdemeisterdeinergedankenagent.de`
- [ ] 5 einfache Workflows importiert
- [ ] Alle Workflows aktiviert (grün)
- [ ] Ersten Test durchgeführt

---

**Status:** ✅ Quick Start Anleitung erstellt!

