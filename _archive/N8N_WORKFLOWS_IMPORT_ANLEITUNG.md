# 📥 N8N WORKFLOWS - IMPORT ANLEITUNG

**Datum:** 8. Januar 2026  
**Status:** ✅ Workflows fertig konfiguriert, Import über UI  
**Zeit:** 10-15 Minuten

---

## ✅ **VORBEREITUNGEN ABGESCHLOSSEN**

Alle 4 Mattermost-Workflows sind **fertig konfiguriert**:

| Workflow | Mattermost Webhook | Status |
|----------|-------------------|--------|
| Agent → Mattermost | `tzw3a5godjfpicpu87ixzut39w` | ✅ Konfiguriert |
| Reading → Mattermost | `wo6d1jb3ftf85kob4eeeyg74th` | ✅ Konfiguriert |
| Logger → Mattermost | `tzw3a5godjfpicpu87ixzut39w` | ✅ Konfiguriert |
| Scheduled Reports | `wo6d1jb3ftf85kob4eeeyg74th` | ✅ Konfiguriert |

**Alle Webhook-URLs sind aktualisiert und funktionstüchtig!** ✅

---

## 📋 **MANUELLER IMPORT (15 Min)**

### **Schritt 1: N8N öffnen**

```bash
# URL öffnen
https://n8n.werdemeisterdeinergedankenagent.de
```

**Login:**
- Username: `admin`
- Password: `e5cc6fddb15d4c67bcdf9494a500315d` (aus `.env`)

---

### **Schritt 2: Workflows importieren**

Für jeden der 4 Workflows:

#### **2.1: Workflow-JSON kopieren**

```bash
# Auf dem Server
ssh root@138.199.237.34

# Workflow 1: Agent Notification
cat /opt/mcp-connection-key/n8n-workflows/mattermost-agent-notification.json

# Workflow 2: Reading Notification
cat /opt/mcp-connection-key/n8n-workflows/mattermost-reading-notification.json

# Workflow 3: Logger
cat /opt/mcp-connection-key/n8n-workflows/logger-mattermost.json

# Workflow 4: Scheduled Reports
cat /opt/mcp-connection-key/n8n-workflows/mattermost-scheduled-reports.json
```

#### **2.2: In N8N UI importieren**

1. **Klicke auf "+" (Neuer Workflow)**
2. **Klicke oben rechts auf "..." (Menü)**
3. **Wähle "Import from File" oder "Import from URL"**
4. **Füge das JSON ein**
5. **Klicke "Save"**
6. **Workflow aktivieren** (Toggle oben rechts)

**Wiederhole für alle 4 Workflows!**

---

## 🧪 **SCHRITT 3: WORKFLOWS TESTEN**

### **Test 1: Agent Notification**

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "marketing",
    "message": "Erstelle 3 Social Media Posts"
  }'
```

**Erwartetes Ergebnis:**
- ✅ Agent antwortet
- ✅ Mattermost bekommt Nachricht

### **Test 2: Reading Notification**

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-01-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "detailed"
  }'
```

**Erwartetes Ergebnis:**
- ✅ Reading Agent antwortet
- ✅ Mattermost bekommt Nachricht

### **Test 3: Logger**

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/log \
  -H "Content-Type: application/json" \
  -d '{
    "traceId": "test-123",
    "source": "manual-test",
    "status": "success",
    "message": "Test Log Message from N8N Workflow"
  }'
```

**Erwartetes Ergebnis:**
- ✅ Log wird verarbeitet
- ✅ Mattermost bekommt Log-Nachricht

### **Test 4: Scheduled Reports**

⚠️ Dieser Workflow läuft **automatisch täglich um 9:00 Uhr**!

**Manueller Test:**
- In N8N UI: Workflow öffnen
- Klicke auf "Execute Workflow" (Play-Button)
- Prüfe Mattermost für Nachricht

---

## 🔧 **ALTERNATIVE: AUTOMATISCHER IMPORT (ÜBER DOCKER VOLUME)**

Falls manueller Import zu aufwändig:

### **Option A: Workflows in N8N Volume kopieren**

```bash
# 1. Workflows in N8N Volume kopieren
ssh root@138.199.237.34 "docker cp /opt/mcp-connection-key/n8n-workflows/. n8n:/home/node/.n8n/workflows/"

# 2. N8N Container neustarten
ssh root@138.199.237.34 "docker-compose -f /opt/mcp-connection-key/docker-compose.yml restart n8n"

# 3. Warten (30 Sek)
sleep 30

# 4. Prüfen
curl https://n8n.werdemeisterdeinergedankenagent.de
```

**Hinweis:** N8N importiert JSON-Dateien **automatisch** beim Start!

### **Option B: N8N CLI (falls verfügbar)**

```bash
# Im N8N Container
docker exec -it n8n sh

# N8N CLI nutzen
n8n import:workflow --input=/home/node/.n8n/workflows/mattermost-agent-notification.json
```

---

## ✅ **ERFOLGSKRITERIEN**

Nach dem Import sollten in N8N sichtbar sein:

1. **Agent → Mattermost Notification** (aktiv)
2. **Reading Generation → Mattermost** (aktiv)
3. **LOGGER → Mattermost** (aktiv)
4. **Scheduled Agent Reports → Mattermost** (aktiv, läuft täglich 9:00)

**Webhook-Endpoints:**
- `/webhook/agent-mattermost`
- `/webhook/reading-mattermost`
- `/webhook/log`

---

## 📊 **STATUS NACH IMPORT**

| Check | Status |
|-------|--------|
| Workflows konfiguriert | ✅ Fertig |
| Mattermost URLs | ✅ Aktualisiert |
| Workflows in N8N | ⏳ Manueller Import |
| Workflows aktiv | ⏳ Nach Import |
| Tests erfolgreich | ⏳ Nach Aktivierung |

---

## 🎯 **NÄCHSTE SCHRITTE**

**JETZT:**
1. ⏳ N8N UI öffnen
2. ⏳ 4 Workflows importieren (15 Min)
3. ⏳ Workflows aktivieren
4. ⏳ Tests durchführen

**SPÄTER (Optional):**
5. 🔄 Chart Calculation Workflow importieren
6. 🔄 Reading Generation Workflow importieren
7. 🔄 Agent Automation Workflows importieren

---

## 📝 **WORKFLOW-DATEIEN**

Alle konfigurierten Workflows auf dem Server:

```
/opt/mcp-connection-key/n8n-workflows/
├── mattermost-agent-notification.json        ✅ Konfiguriert
├── mattermost-reading-notification.json      ✅ Konfiguriert
├── logger-mattermost.json                    ✅ Konfiguriert
├── mattermost-scheduled-reports.json         ✅ Konfiguriert
├── chart-calculation-workflow.json           (Optional)
├── reading-generation-workflow.json          (Optional)
└── agent-automation-workflows.json           (Optional)
```

---

## 🚀 **QUICK START**

```bash
# SSH to server
ssh root@138.199.237.34

# Show workflows
ls -la /opt/mcp-connection-key/n8n-workflows/mattermost*.json

# Copy one workflow
cat /opt/mcp-connection-key/n8n-workflows/mattermost-agent-notification.json

# Paste in N8N UI → Import → Save → Activate
```

**Fertig!** 🎉

---

**Status:** ✅ Workflows fertig, Import über UI möglich  
**Empfehlung:** Manueller Import (15 Min) am einfachsten  
**Alternative:** Docker Volume Copy (automatisch)
