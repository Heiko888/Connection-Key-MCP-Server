# ✅ n8n Workflows - Neu erstellt (Sauber)

**Stand:** 16.12.2025

**Status:** Alle Workflows wurden neu erstellt mit korrekten n8n-Strukturen

---

## 📋 Erstellte Workflows (7)

### Priorität 1: Mattermost Workflows

1. ✅ **Agent → Mattermost Notification**
   - Datei: `mattermost-agent-notification.json`
   - Webhook: `/webhook/agent-mattermost`
   - Channel: `#tech`

2. ✅ **Reading Generation → Mattermost**
   - Datei: `mattermost-reading-notification.json`
   - Webhook: `/webhook/reading-mattermost`
   - Channel: `#readings`

3. ✅ **Scheduled Agent Reports → Mattermost**
   - Datei: `mattermost-scheduled-reports.json`
   - Trigger: Schedule (täglich 9:00 Uhr)
   - Channel: `#marketing`

---

### Priorität 2: Logger & Multi-Agent

4. ✅ **Logger → Mattermost**
   - Datei: `logger-mattermost.json`
   - Webhook: `/webhook/log`
   - Channel: `#tech`

5. ✅ **Multi-Agent Content Pipeline**
   - Datei: `multi-agent-pipeline.json`
   - Webhook: `/webhook/content-pipeline`
   - Sequenz: Marketing → Social-YouTube → Automation

---

### Priorität 3: Reading & User Registration

6. ✅ **User Registration → Reading**
   - Datei: `user-registration-reading.json`
   - Webhook: `/webhook/user-registered`

7. ✅ **Scheduled Reading Generation**
   - Datei: `scheduled-reading-generation.json`
   - Trigger: Schedule (täglich 9:00 Uhr)

8. ✅ **Reading Generation Workflow**
   - Datei: `reading-generation-workflow.json`
   - Webhook: `/webhook/reading`
   - Conditional: Basic vs. Detailed Reading

---

## ✅ Was wurde korrigiert

### 1. Keine veralteten Parameter mehr

**Entfernt:**
- ❌ `httpMethod` (veraltet)
- ❌ `responseMode` (veraltet)
- ❌ `bodyParameters` (veraltet)

**Verwendet:**
- ✅ `path` in Webhook Trigger
- ✅ `body` mit `contentType: "json"` in HTTP Request Nodes

---

### 2. Keine JSON.stringify() mehr

**Vorher (falsch):**
```json
"body": "={{ JSON.stringify({ message: $json.message }) }}"
```

**Jetzt (korrekt):**
```json
"body": "={{ { \"message\": $json.message } }}"
```

**Wichtig:** Wenn `contentType: "json"` gesetzt ist, darf KEIN `JSON.stringify()` verwendet werden!

---

### 3. Saubere Webhook-Trigger-Struktur

**Korrekt:**
```json
{
  "parameters": {
    "path": "agent-mattermost",
    "options": {}
  },
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 1
}
```

---

## 🚨 WICHTIG: Mattermost Webhook URLs eintragen

**Alle Mattermost Workflows enthalten Platzhalter:**

```
https://chat.werdemeisterdeinergedanken.de/hooks/PLATZHALTER_WEBHOOK_ID
```

**Du musst diese ersetzen mit echten Mattermost Webhook URLs!**

---

### Schritt 1: Mattermost Webhooks erstellen

1. **Mattermost öffnen:** `https://chat.werdemeisterdeinergedanken.de`
2. **Integrations** → **Incoming Webhooks**
3. **Für jeden Workflow einen Webhook erstellen:**

#### Webhook 1: Agent Notifications
- **Title:** `n8n Agent Notifications`
- **Channel:** `#tech`
- **Webhook URL kopieren** → Notieren als `MATTERMOST_WEBHOOK_AGENT`

#### Webhook 2: Reading Notifications
- **Title:** `n8n Reading Notifications`
- **Channel:** `#readings`
- **Webhook URL kopieren** → Notieren als `MATTERMOST_WEBHOOK_READING`

#### Webhook 3: Scheduled Reports
- **Title:** `n8n Scheduled Reports`
- **Channel:** `#marketing`
- **Webhook URL kopieren** → Notieren als `MATTERMOST_WEBHOOK_MARKETING`

#### Webhook 4: Logger
- **Title:** `n8n Logger`
- **Channel:** `#tech`
- **Webhook URL kopieren** → Notieren als `MATTERMOST_WEBHOOK_LOGGER`

---

### Schritt 2: URLs in Workflows eintragen

**Nach dem Import in n8n:**

1. **Workflow öffnen:** "Agent → Mattermost Notification"
2. **"Send to Mattermost" Node** doppelklicken
3. **URL-Feld:**
   - Ersetze: `PLATZHALTER_WEBHOOK_ID`
   - Mit: Deiner echten Webhook URL (z.B. `tzw3a5godjfpicpu87ixzut39w`)
4. **Save** klicken

**Wiederhole für:**
- `mattermost-reading-notification.json` → `MATTERMOST_WEBHOOK_READING`
- `mattermost-scheduled-reports.json` → `MATTERMOST_WEBHOOK_MARKETING`
- `logger-mattermost.json` → `MATTERMOST_WEBHOOK_LOGGER`

---

## 📥 Workflows importieren

### Schritt 1: n8n öffnen

```
https://n8n.werdemeisterdeinergedankenagent.de
```

---

### Schritt 2: Workflows importieren

**Für jeden Workflow:**

1. **Workflows** → **"+"** → **"Import from File"**
2. **Datei auswählen** (siehe Liste unten)
3. **"Import"** klicken
4. **Workflow öffnen**
5. **Mattermost Webhook URL eintragen** (falls Mattermost Workflow)
6. **"Active" Toggle** aktivieren (muss GRÜN sein!)

---

### Import-Reihenfolge (empfohlen)

1. ✅ `mattermost-agent-notification.json`
2. ✅ `mattermost-reading-notification.json`
3. ✅ `mattermost-scheduled-reports.json`
4. ✅ `logger-mattermost.json`
5. ✅ `multi-agent-pipeline.json`
6. ✅ `user-registration-reading.json`
7. ✅ `scheduled-reading-generation.json`
8. ✅ `reading-generation-workflow.json`

---

## ✅ Testen

### Test 1: Agent → Mattermost

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{"agentId":"marketing","message":"Test"}'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Mattermost Channel `#tech` bekommt Nachricht

---

### Test 2: Reading → Mattermost

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-05-15","birthTime":"14:30","birthPlace":"Berlin"}'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Mattermost Channel `#readings` bekommt Nachricht

---

### Test 3: Logger

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/log \
  -H "Content-Type: application/json" \
  -d '{"traceId":"t-1","source":"test","status":"ok","channel":"#tech","message":"Logger Test"}'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Mattermost Channel `#tech` bekommt Log-Nachricht

---

### Test 4: Multi-Agent Pipeline

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/content-pipeline \
  -H "Content-Type: application/json" \
  -d '{"topic":"Manifestation","userId":"test-user"}'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response enthält Marketing, Social, Automation Ergebnisse

---

## 📊 Workflow-Übersicht

| # | Workflow | Webhook-Pfad | Trigger | Mattermost URL |
|---|----------|--------------|---------|----------------|
| 1 | Agent → Mattermost | `agent-mattermost` | Webhook | ⚠️ Eintragen |
| 2 | Reading → Mattermost | `reading-mattermost` | Webhook | ⚠️ Eintragen |
| 3 | Scheduled Reports | - | Schedule | ⚠️ Eintragen |
| 4 | Logger → Mattermost | `log` | Webhook | ⚠️ Eintragen |
| 5 | Multi-Agent Pipeline | `content-pipeline` | Webhook | - |
| 6 | User Registration | `user-registered` | Webhook | - |
| 7 | Scheduled Reading | - | Schedule | - |
| 8 | Reading Workflow | `reading` | Webhook | - |

---

## 🎯 Nächste Schritte

1. ✅ **Mattermost Webhooks erstellen** (4 Webhooks)
2. ✅ **Workflows importieren** (8 Workflows)
3. ✅ **Mattermost URLs eintragen** (4 Workflows)
4. ✅ **Workflows aktivieren** (alle 8)
5. ✅ **Tests durchführen** (alle 4 Tests)

---

**Status:** ✅ **Alle Workflows neu erstellt - sauber und korrekt!**
