# 📥 n8n Workflows - Komplett-Import Anleitung

**Stand:** 16.12.2025

**Situation:** Keine Workflows in n8n vorhanden - alle müssen importiert werden

---

## 🎯 Import-Prioritäten

### Priorität 1: Mattermost Workflows (wichtigste)

Diese 3 Workflows sind die wichtigsten und sollten zuerst importiert werden:

1. **Agent → Mattermost Notification**
2. **Reading Generation → Mattermost**
3. **Scheduled Agent Reports → Mattermost**

---

### Priorität 2: Logger & Multi-Agent

4. **Logger → Mattermost** (für Observability)
5. **Multi-Agent Content Pipeline** (für Agent-Chains)

---

### Priorität 3: Reading & User Registration

6. **User Registration → Reading**
7. **Scheduled Reading Generation**
8. **Reading Generation Workflow**

---

### Priorität 4: Weitere Workflows

9. **Chart Calculation (Swiss Ephemeris)**
10. **Agent Notification (Simple)**
11. **Reading Notification (Simple)**
12. **Mailchimp Subscriber**

---

## 📋 Schritt-für-Schritt: Workflow 1 importieren

### Schritt 1: n8n öffnen

1. Browser öffnen
2. Gehe zu: `https://n8n.werdemeisterdeinergedankenagent.de`
3. Einloggen (falls nötig)

---

### Schritt 2: Workflow importieren

1. **Links in der Sidebar:** Klicke auf **"Workflows"**
2. **Oben rechts:** Klicke auf **"+"** Button
3. **Dropdown öffnen:** Wähle **"Import from File"**
4. **Datei auswählen:**
   - Navigiere zu: `n8n-workflows/mattermost-agent-notification.json`
   - Oder: Lade die Datei hoch
5. **"Import"** klicken

---

### Schritt 3: Workflow aktivieren

1. **Workflow öffnen:** Klicke auf den importierten Workflow
2. **"Active" Toggle** oben rechts klicken
3. **Status sollte:** `Active` (grün) werden

**WICHTIG:** Webhooks funktionieren nur, wenn der Workflow aktiv ist!

---

### Schritt 4: Testen

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{"agentId":"marketing","message":"Test"}'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Mattermost Channel `#tech` bekommt Nachricht

---

## 📋 Alle Workflows importieren (Checkliste)

### Priorität 1: Mattermost Workflows

- [ ] **1. Agent → Mattermost Notification**
  - Datei: `n8n-workflows/mattermost-agent-notification.json`
  - Webhook: `/webhook/agent-mattermost`
  - Mattermost Channel: `#tech`
  - Aktivieren ✅
  - Testen ✅

- [ ] **2. Reading Generation → Mattermost**
  - Datei: `n8n-workflows/mattermost-reading-notification.json`
  - Webhook: `/webhook/reading-mattermost`
  - Mattermost Channel: `#readings`
  - Aktivieren ✅
  - Testen ✅

- [ ] **3. Scheduled Agent Reports → Mattermost**
  - Datei: `n8n-workflows/mattermost-scheduled-reports.json`
  - Trigger: Schedule (täglich 9:00 Uhr)
  - Mattermost Channel: `#marketing`
  - Aktivieren ✅
  - Testen (manuell ausführen) ✅

---

### Priorität 2: Logger & Multi-Agent

- [ ] **4. Logger → Mattermost**
  - Datei: `n8n-workflows/logger-mattermost.json`
  - Webhook: `/webhook/log`
  - Mattermost Channel: `#tech`
  - Aktivieren ✅
  - Testen ✅

- [ ] **5. Multi-Agent Content Pipeline**
  - Datei: `n8n-workflows/multi-agent-pipeline.json` (korrigiert)
  - Webhook: `/webhook/content-pipeline`
  - Aktivieren ✅
  - Testen ✅

---

### Priorität 3: Reading & User Registration

- [ ] **6. User Registration → Reading**
  - Datei: `n8n-workflows/user-registration-reading.json` (korrigiert)
  - Webhook: `/webhook/user-registered`
  - Aktivieren ✅
  - Testen ✅

- [ ] **7. Scheduled Reading Generation**
  - Datei: `n8n-workflows/scheduled-reading-generation.json` (korrigiert)
  - Trigger: Schedule (täglich 9:00 Uhr)
  - Aktivieren ✅
  - Testen (manuell ausführen) ✅

- [ ] **8. Reading Generation Workflow**
  - Datei: `n8n-workflows/reading-generation-workflow.json` (korrigiert)
  - Webhook: `/webhook/reading`
  - Aktivieren ✅
  - Testen ✅

---

### Priorität 4: Weitere Workflows

- [ ] **9. Chart Calculation (Swiss Ephemeris)**
  - Datei: `n8n-workflows/chart-calculation-workflow-swisseph.json`
  - Webhook: `/webhook/chart-calculation`
  - Aktivieren ✅
  - Testen ✅

- [ ] **10. Agent Notification (Simple)**
  - Datei: `n8n-workflows/agent-notification-simple.json` (korrigiert)
  - Webhook: `/webhook/agent-notification`
  - Aktivieren ✅
  - Testen ✅

- [ ] **11. Reading Notification (Simple)**
  - Datei: `n8n-workflows/reading-notification-simple.json` (korrigiert)
  - Webhook: `/webhook/reading-generation`
  - Aktivieren ✅
  - Testen ✅

- [ ] **12. Mailchimp Subscriber**
  - Datei: `n8n-workflows/mailchimp-subscriber.json` (korrigiert)
  - Webhook: `/webhook/mailchimp-confirmed`
  - Aktivieren ✅
  - Testen ✅

---

## 🚀 Schnell-Import (alle auf einmal)

**Falls du alle Workflows schnell importieren willst:**

1. **n8n öffnen**
2. **Workflows** → **"+"** → **"Import from File"**
3. **Importiere nacheinander:**
   - `mattermost-agent-notification.json`
   - `mattermost-reading-notification.json`
   - `mattermost-scheduled-reports.json`
   - `logger-mattermost.json`
   - `multi-agent-pipeline.json`
   - `user-registration-reading.json`
   - `scheduled-reading-generation.json`
   - `reading-generation-workflow.json`
   - `chart-calculation-workflow-swisseph.json`
   - `agent-notification-simple.json`
   - `reading-notification-simple.json`
   - `mailchimp-subscriber.json`

4. **Nach jedem Import:**
   - Workflow öffnen
   - "Active" Toggle aktivieren
   - Webhook-Pfad prüfen

---

## ✅ Nach dem Import: Aktivieren & Testen

### Schritt 1: Alle Workflows aktivieren

1. **Workflows** öffnen
2. **Für jeden Workflow:**
   - Workflow öffnen
   - **"Active" Toggle** aktivieren
   - Status sollte **"Active"** (grün) sein

---

### Schritt 2: Webhook-Pfade prüfen

**Für jeden Webhook-Workflow:**
1. **"Webhook Trigger" Node** öffnen
2. **"Path" Feld** prüfen
3. **"Webhook URL" kopieren** (falls angezeigt)

---

### Schritt 3: Tests durchführen

**Test 1: Agent → Mattermost**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{"agentId":"marketing","message":"Test"}'
```

**Test 2: Reading → Mattermost**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-05-15","birthTime":"14:30","birthPlace":"Berlin"}'
```

**Test 3: Logger**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/log \
  -H "Content-Type: application/json" \
  -d '{"traceId":"t-1","source":"test","status":"ok","channel":"#tech","message":"Logger Test"}'
```

**Test 4: Multi-Agent Pipeline**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/content-pipeline \
  -H "Content-Type: application/json" \
  -d '{"topic":"Manifestation"}'
```

---

## 📊 Workflow-Übersicht (nach Import)

| # | Workflow | Webhook-Pfad | Trigger | Status |
|---|----------|--------------|---------|--------|
| 1 | Agent → Mattermost | `agent-mattermost` | Webhook | ⏳ Importieren |
| 2 | Reading → Mattermost | `reading-mattermost` | Webhook | ⏳ Importieren |
| 3 | Scheduled Reports | - | Schedule | ⏳ Importieren |
| 4 | Logger → Mattermost | `log` | Webhook | ⏳ Importieren |
| 5 | Multi-Agent Pipeline | `content-pipeline` | Webhook | ⏳ Importieren |
| 6 | User Registration | `user-registered` | Webhook | ⏳ Importieren |
| 7 | Scheduled Reading | - | Schedule | ⏳ Importieren |
| 8 | Reading Workflow | `reading` | Webhook | ⏳ Importieren |
| 9 | Chart Calculation | `chart-calculation` | Webhook | ⏳ Importieren |
| 10 | Agent (Simple) | `agent-notification` | Webhook | ⏳ Importieren |
| 11 | Reading (Simple) | `reading-generation` | Webhook | ⏳ Importieren |
| 12 | Mailchimp | `mailchimp-confirmed` | Webhook | ⏳ Importieren |

---

## 🚨 Wichtige Hinweise

### Hinweis 1: Workflow-Aktivierung

**WICHTIG:** Webhooks funktionieren nur, wenn der Workflow aktiv ist!

- ✅ **"Active" Toggle** muss **GRÜN** sein
- ❌ **"Inactive"** = Webhook funktioniert NICHT

---

### Hinweis 2: Webhook-Pfade

**Alle Webhook-Pfade sind eindeutig:**
- Keine Konflikte mehr
- Jeder Workflow hat eigenen Pfad

---

### Hinweis 3: Korrigierte Workflows

**Alle Workflows sind korrigiert:**
- ✅ Keine `httpMethod` mehr
- ✅ Keine `responseMode` mehr
- ✅ Keine `bodyParameters` mehr
- ✅ Alle nutzen `body` mit `contentType: "json"`

---

## ✅ Erfolgs-Kriterien

**Alle Workflows erfolgreich importiert, wenn:**
- ✅ Alle 12 Workflows in n8n vorhanden
- ✅ Alle Workflows aktiviert (grüner Toggle)
- ✅ Alle Webhook-Pfade korrekt
- ✅ Tests erfolgreich (HTTP 200 OK)

---

## 📝 Import-Reihenfolge (empfohlen)

**1. Mattermost Workflows (wichtigste):**
1. Agent → Mattermost Notification
2. Reading Generation → Mattermost
3. Scheduled Agent Reports → Mattermost

**2. Logger & Multi-Agent:**
4. Logger → Mattermost
5. Multi-Agent Content Pipeline

**3. Reading & User Registration:**
6. User Registration → Reading
7. Scheduled Reading Generation
8. Reading Generation Workflow

**4. Weitere:**
9. Chart Calculation (Swiss Ephemeris)
10. Agent Notification (Simple)
11. Reading Notification (Simple)
12. Mailchimp Subscriber

---

**Status:** 📥 **Komplett-Import Anleitung erstellt!**
