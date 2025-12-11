# ⚡ n8n Workflows - Quick Import Guide

**Für:** Schnelle Aktivierung der wichtigsten Workflows

**Zeit:** 30-45 Minuten

---

## 🎯 Priorität 1: Diese 3 Workflows ZUERST

### 1. Logger → Mattermost ⭐ WICHTIGSTES

**Datei:** `n8n-workflows/logger-mattermost.json`

**Import:**
1. n8n öffnen: `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Workflows** → **"+"** → **"Import from File"**
3. Datei: `n8n-workflows/logger-mattermost.json`
4. **Import** klicken
5. **"Active" Toggle** aktivieren (GRÜN!)

**Webhook:** `/webhook/log`

**Test:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/log \
  -H "Content-Type: application/json" \
  -d '{"traceId":"test","source":"test","status":"ok","channel":"#tech","message":"Test"}'
```

---

### 2. Multi-Agent Pipeline

**Datei:** `n8n-workflows/multi-agent-pipeline.json`

**Import:**
1. **Workflows** → **"+"** → **"Import from File"**
2. Datei: `n8n-workflows/multi-agent-pipeline.json`
3. **Import** klicken
4. **"Active" Toggle** aktivieren

**Webhook:** `/webhook/content-pipeline`

---

### 3. Chart Calculation

**Datei:** `n8n-workflows/chart-calculation-workflow-swisseph.json`

**Import:**
1. **Workflows** → **"+"** → **"Import from File"**
2. Datei: `n8n-workflows/chart-calculation-workflow-swisseph.json`
3. **Import** klicken
4. **"Active" Toggle** aktivieren

**Webhook:** `/webhook/chart-calculation`

---

## 📋 Alle Workflows (Checkliste)

### Priorität 1: Core (30 Min)
- [ ] `logger-mattermost.json`
- [ ] `multi-agent-pipeline.json`
- [ ] `chart-calculation-workflow-swisseph.json`

### Priorität 2: Mattermost (20 Min)
- [ ] `mattermost-agent-notification.json`
- [ ] `mattermost-reading-notification.json`
- [ ] `mattermost-scheduled-reports.json`

### Priorität 3: Reading (15 Min)
- [ ] `user-registration-reading.json`
- [ ] `scheduled-reading-generation.json`
- [ ] `reading-generation-workflow.json`

### Priorität 4: Marketing (10 Min)
- [ ] `daily-marketing-content.json`

### Priorität 5: Weitere (10 Min)
- [ ] `mailchimp-subscriber.json`

---

## ⚙️ Wichtig: Mattermost Webhook URL

**In jedem Mattermost-Workflow prüfen:**
- Falls `PLATZHALTER_WEBHOOK_ID` vorhanden → durch echte URL ersetzen
- Mattermost Webhook URL: `https://mattermost.ihre-domain.de/hooks/xxxxx`

---

**Bereit? Starte mit Logger Workflow!** 🚀
