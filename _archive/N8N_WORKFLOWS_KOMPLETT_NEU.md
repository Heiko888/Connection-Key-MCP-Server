# ✅ n8n Workflows - Komplett neu erstellt (Alle Automatisierungen)

**Stand:** 16.12.2025

**Status:** Alle Workflows wurden neu erstellt mit korrekten n8n-Strukturen

---

## 📋 Alle erstellten Workflows (11)

### Priorität 1: Mattermost Workflows (3)

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

### Priorität 2: Logger & Multi-Agent (2)

4. ✅ **Logger → Mattermost**
   - Datei: `logger-mattermost.json`
   - Webhook: `/webhook/log`
   - Channel: `#tech`

5. ✅ **Multi-Agent Content Pipeline**
   - Datei: `multi-agent-pipeline.json`
   - Webhook: `/webhook/content-pipeline`
   - Sequenz: Marketing → Social-YouTube → Automation

---

### Priorität 3: Reading & User Registration (3)

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

### Priorität 4: Weitere Automatisierungen (3)

9. ✅ **Mailchimp Subscriber → ConnectionKey**
   - Datei: `mailchimp-subscriber.json`
   - Webhook: `/webhook/mailchimp-confirmed`
   - Sendet an: `https://www.the-connection-key.de/api/new-subscriber`

10. ✅ **Chart Calculation - Human Design (Swiss Ephemeris)**
    - Datei: `chart-calculation-workflow-swisseph.json`
    - Webhook: `/webhook/chart-calculation`
    - Berechnet Human Design Chart-Daten

11. ✅ **Daily Marketing Content Generation**
    - Datei: `daily-marketing-content.json`
    - Trigger: Schedule (täglich 9:00 Uhr)
    - Generiert Marketing-Content (ohne Mattermost)

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

## 🚨 WICHTIG: Konfiguration nach Import

### 1. Mattermost Webhook URLs eintragen

**Alle Mattermost Workflows enthalten Platzhalter:**
```
https://chat.werdemeisterdeinergedanken.de/hooks/PLATZHALTER_WEBHOOK_ID
```

**Du musst diese ersetzen mit echten Mattermost Webhook URLs!**

**Workflows die Mattermost URLs benötigen:**
- `mattermost-agent-notification.json`
- `mattermost-reading-notification.json`
- `mattermost-scheduled-reports.json`
- `logger-mattermost.json`

---

### 2. N8N_API_KEY für Mailchimp Workflow

**Der Mailchimp Workflow benötigt:**
- Environment Variable: `N8N_API_KEY` in n8n
- Dieser Key muss auch in Next.js `.env.local` gesetzt sein

**Workflow:** `mailchimp-subscriber.json`

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
5. **Konfiguration prüfen** (Mattermost URLs, API Keys)
6. **"Active" Toggle** aktivieren (muss GRÜN sein!)

---

### Import-Reihenfolge (empfohlen)

**Priorität 1: Mattermost Workflows**
1. ✅ `mattermost-agent-notification.json`
2. ✅ `mattermost-reading-notification.json`
3. ✅ `mattermost-scheduled-reports.json`
4. ✅ `logger-mattermost.json`

**Priorität 2: Core Automatisierungen**
5. ✅ `multi-agent-pipeline.json`
6. ✅ `user-registration-reading.json`
7. ✅ `scheduled-reading-generation.json`
8. ✅ `reading-generation-workflow.json`

**Priorität 3: Integration Workflows**
9. ✅ `mailchimp-subscriber.json`
10. ✅ `chart-calculation-workflow-swisseph.json`
11. ✅ `daily-marketing-content.json`

---

## ✅ Testen

### Test 1: Agent → Mattermost

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{"agentId":"marketing","message":"Test"}'
```

---

### Test 2: Reading → Mattermost

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-05-15","birthTime":"14:30","birthPlace":"Berlin"}'
```

---

### Test 3: Logger

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/log \
  -H "Content-Type: application/json" \
  -d '{"traceId":"t-1","source":"test","status":"ok","channel":"#tech","message":"Logger Test"}'
```

---

### Test 4: Multi-Agent Pipeline

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/content-pipeline \
  -H "Content-Type: application/json" \
  -d '{"topic":"Manifestation","userId":"test-user"}'
```

---

### Test 5: Chart Calculation

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/chart-calculation \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-05-15","birthTime":"14:30","birthPlace":"Berlin"}'
```

---

### Test 6: Mailchimp Subscriber (Simulation)

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed \
  -H "Content-Type: application/json" \
  -d '{"type":"subscribe","data":{"email":"test@example.com","merge_fields":{"FNAME":"Test","LNAME":"User"}}}'
```

---

## 📊 Workflow-Übersicht

| # | Workflow | Webhook-Pfad | Trigger | Mattermost URL | API Key |
|---|----------|--------------|---------|----------------|---------|
| 1 | Agent → Mattermost | `agent-mattermost` | Webhook | ⚠️ Eintragen | - |
| 2 | Reading → Mattermost | `reading-mattermost` | Webhook | ⚠️ Eintragen | - |
| 3 | Scheduled Reports | - | Schedule | ⚠️ Eintragen | - |
| 4 | Logger → Mattermost | `log` | Webhook | ⚠️ Eintragen | - |
| 5 | Multi-Agent Pipeline | `content-pipeline` | Webhook | - | - |
| 6 | User Registration | `user-registered` | Webhook | - | - |
| 7 | Scheduled Reading | - | Schedule | - | - |
| 8 | Reading Workflow | `reading` | Webhook | - | - |
| 9 | Mailchimp Subscriber | `mailchimp-confirmed` | Webhook | - | ⚠️ N8N_API_KEY |
| 10 | Chart Calculation | `chart-calculation` | Webhook | - | - |
| 11 | Daily Marketing | - | Schedule | - | - |

---

## 🎯 Nächste Schritte

1. ✅ **Mattermost Webhooks erstellen** (4 Webhooks)
2. ✅ **N8N_API_KEY setzen** (für Mailchimp Workflow)
3. ✅ **Workflows importieren** (11 Workflows)
4. ✅ **Mattermost URLs eintragen** (4 Workflows)
5. ✅ **Workflows aktivieren** (alle 11)
6. ✅ **Tests durchführen** (alle 6 Tests)

---

**Status:** ✅ **Alle 11 Workflows neu erstellt - sauber und korrekt!**
