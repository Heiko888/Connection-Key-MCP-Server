# 🚀 n8n Workflows aktivieren - Agenten Startklar

**Datum:** 16.12.2025

**Status:** Agenten funktionieren ✅ → Jetzt n8n Workflows aktivieren

---

## 📊 Verfügbare Workflows (14 Dateien)

### ✅ Bereits aktiviert
- ✅ `mailchimp-api-sync-with-keys.json` - Mailchimp API Sync (läuft alle 6 Stunden)

### ❌ Noch zu aktivieren (13 Workflows)

---

## 🎯 Priorisierte Aktivierungs-Reihenfolge

### Priorität 1: Core Workflows (30 Min)

**Diese Workflows sind essentiell für das System:**

1. **Logger → Mattermost** ⭐ WICHTIGSTES
   - **Datei:** `n8n-workflows/logger-mattermost.json`
   - **Webhook:** `/webhook/log`
   - **Zweck:** Zentrales Logging für alle Systeme
   - **Aktivieren:** ✅ Sofort

2. **Multi-Agent Pipeline**
   - **Datei:** `n8n-workflows/multi-agent-pipeline.json`
   - **Webhook:** `/webhook/content-pipeline`
   - **Zweck:** Agent-Chains (Marketing → Social-YouTube → Sales)
   - **Aktivieren:** ✅ Sofort

3. **Chart Calculation**
   - **Datei:** `n8n-workflows/chart-calculation-workflow-swisseph.json`
   - **Webhook:** `/webhook/chart-calculation`
   - **Zweck:** Human Design Chart-Berechnung
   - **Aktivieren:** ✅ Sofort

---

### Priorität 2: Mattermost Notifications (20 Min)

**Für Observability und Monitoring:**

4. **Agent → Mattermost**
   - **Datei:** `n8n-workflows/mattermost-agent-notification.json`
   - **Webhook:** `/webhook/agent-mattermost`
   - **Channel:** `#tech`
   - **Aktivieren:** ✅ Nach Priorität 1

5. **Reading → Mattermost**
   - **Datei:** `n8n-workflows/mattermost-reading-notification.json`
   - **Webhook:** `/webhook/reading-mattermost`
   - **Channel:** `#readings`
   - **Aktivieren:** ✅ Nach Priorität 1

6. **Scheduled Reports → Mattermost**
   - **Datei:** `n8n-workflows/mattermost-scheduled-reports.json`
   - **Trigger:** Schedule (täglich 9:00)
   - **Channel:** `#marketing`
   - **Aktivieren:** ✅ Nach Priorität 1

---

### Priorität 3: Reading & User Workflows (15 Min)

**Für automatische Reading-Generierung:**

7. **User Registration → Reading**
   - **Datei:** `n8n-workflows/user-registration-reading.json`
   - **Webhook:** `/webhook/user-registered`
   - **Zweck:** Auto-Reading bei Registrierung
   - **Aktivieren:** ✅ Optional

8. **Scheduled Reading Generation**
   - **Datei:** `n8n-workflows/scheduled-reading-generation.json`
   - **Trigger:** Schedule (täglich 9:00)
   - **Zweck:** Geplante Reading-Generierung
   - **Aktivieren:** ✅ Optional

9. **Reading Generation Workflow**
   - **Datei:** `n8n-workflows/reading-generation-workflow.json`
   - **Webhook:** `/webhook/reading`
   - **Zweck:** Reading-Generierung via Webhook
   - **Aktivieren:** ✅ Optional

---

### Priorität 4: Marketing & Content (10 Min)

**Für automatische Content-Generierung:**

10. **Daily Marketing Content**
    - **Datei:** `n8n-workflows/daily-marketing-content.json`
    - **Trigger:** Schedule (täglich 9:00)
    - **Zweck:** Tägliche Marketing-Content-Generierung
    - **Aktivieren:** ✅ Optional

---

### Priorität 5: Weitere Integrationen (10 Min)

11. **Mailchimp Subscriber**
    - **Datei:** `n8n-workflows/mailchimp-subscriber.json`
    - **Webhook:** `/webhook/mailchimp-confirmed`
    - **Zweck:** Mailchimp Webhook-Verarbeitung
    - **Aktivieren:** ✅ Optional (API Sync läuft bereits)

12. **Mailchimp Get Lists** (Hilfs-Workflow)
    - **Datei:** `n8n-workflows/mailchimp-get-lists.json`
    - **Webhook:** `/webhook/mailchimp-get-lists`
    - **Zweck:** Mailchimp Listen abrufen
    - **Aktivieren:** ⚠️ Nur bei Bedarf

13. **Mailchimp API Sync** (ohne Keys)
    - **Datei:** `n8n-workflows/mailchimp-api-sync.json`
    - **Zweck:** Alternative Version mit Environment Variables
    - **Aktivieren:** ⚠️ Nicht nötig (mit Keys läuft bereits)

---

## 🚀 Schnell-Start: Erste 3 Workflows (15 Min)

### Schritt 1: n8n öffnen

1. Browser öffnen
2. Gehe zu: `https://n8n.werdemeisterdeinergedankenagent.de`
3. Einloggen

---

### Schritt 2: Logger Workflow importieren & aktivieren

**Workflow:** `logger-mattermost.json`

1. **Workflows** → **"+"** → **"Import from File"**
2. **Datei auswählen:** `n8n-workflows/logger-mattermost.json`
3. **"Import"** klicken
4. **Workflow öffnen**
5. **"Active" Toggle** aktivieren (muss GRÜN sein!)
6. **Mattermost Webhook URL prüfen:**
   - Im "HTTP Request" Node → URL prüfen
   - Falls `PLATZHALTER_WEBHOOK_ID` vorhanden → durch echte URL ersetzen

**Test:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/log \
  -H "Content-Type: application/json" \
  -d '{"traceId":"test-1","source":"test","status":"ok","channel":"#tech","message":"Logger Test"}'
```

**Erwartung:** Mattermost Channel `#tech` bekommt Nachricht

---

### Schritt 3: Multi-Agent Pipeline importieren & aktivieren

**Workflow:** `multi-agent-pipeline.json`

1. **Workflows** → **"+"** → **"Import from File"**
2. **Datei auswählen:** `n8n-workflows/multi-agent-pipeline.json`
3. **"Import"** klicken
4. **Workflow öffnen**
5. **"Active" Toggle** aktivieren

**Test:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/content-pipeline \
  -H "Content-Type: application/json" \
  -d '{"message":"Erstelle Content über Manifestation","userId":"test-user"}'
```

---

### Schritt 4: Chart Calculation importieren & aktivieren

**Workflow:** `chart-calculation-workflow-swisseph.json`

1. **Workflows** → **"+"** → **"Import from File"**
2. **Datei auswählen:** `n8n-workflows/chart-calculation-workflow-swisseph.json`
3. **"Import"** klicken
4. **Workflow öffnen**
5. **"Active" Toggle** aktivieren

**Test:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/chart-calculation \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-05-15","birthTime":"14:30","birthPlace":"Berlin"}'
```

---

## 📋 Komplette Import-Checkliste

### Priorität 1: Core (30 Min)
- [ ] `logger-mattermost.json` - Importieren, Aktivieren, Testen
- [ ] `multi-agent-pipeline.json` - Importieren, Aktivieren, Testen
- [ ] `chart-calculation-workflow-swisseph.json` - Importieren, Aktivieren, Testen

### Priorität 2: Mattermost (20 Min)
- [ ] `mattermost-agent-notification.json` - Importieren, Aktivieren, Testen
- [ ] `mattermost-reading-notification.json` - Importieren, Aktivieren, Testen
- [ ] `mattermost-scheduled-reports.json` - Importieren, Aktivieren, Schedule prüfen

### Priorität 3: Reading (15 Min)
- [ ] `user-registration-reading.json` - Importieren, Aktivieren (optional)
- [ ] `scheduled-reading-generation.json` - Importieren, Aktivieren, Schedule prüfen (optional)
- [ ] `reading-generation-workflow.json` - Importieren, Aktivieren (optional)

### Priorität 4: Marketing (10 Min)
- [ ] `daily-marketing-content.json` - Importieren, Aktivieren, Schedule prüfen (optional)

### Priorität 5: Weitere (10 Min)
- [ ] `mailchimp-subscriber.json` - Importieren, Aktivieren (optional)
- [ ] `mailchimp-get-lists.json` - Nur bei Bedarf
- [ ] `mailchimp-api-sync.json` - Nicht nötig (mit Keys läuft bereits)

---

## ⚙️ Konfiguration nach Import

### 1. Mattermost Webhook URLs prüfen

**In jedem Mattermost-Workflow:**
1. Workflow öffnen
2. "HTTP Request" Node finden
3. URL prüfen:
   - Falls `PLATZHALTER_WEBHOOK_ID` → durch echte Mattermost Webhook URL ersetzen
   - Format: `https://mattermost.ihre-domain.de/hooks/xxxxx`

**Mattermost Webhook URL finden:**
1. Mattermost öffnen
2. Channel → Integrations → Incoming Webhooks
3. Webhook erstellen oder vorhandenen kopieren

---

### 2. Environment Variables prüfen

**In n8n Settings → Environment Variables:**

**Prüfen ob gesetzt:**
- `MATTERMOST_WEBHOOK_URL` - Mattermost Webhook URL
- `N8N_API_KEY` - API Key für ConnectionKey API
- `MAILCHIMP_API_KEY` - Mailchimp API Key (falls verwendet)
- `MAILCHIMP_DC` - Mailchimp Data Center (falls verwendet)
- `MAILCHIMP_LIST_ID` - Mailchimp List ID (falls verwendet)

**Falls nicht gesetzt:**
- In n8n Settings → Environment Variables hinzufügen
- Oder direkt in Workflow-Nodes eintragen (weniger sicher)

---

### 3. Schedules prüfen

**Für Scheduled Workflows:**

1. **Daily Marketing Content**
   - Schedule: Täglich 9:00 Uhr
   - Prüfen: Schedule Trigger Node → Cron Expression

2. **Scheduled Reports**
   - Schedule: Täglich 9:00 Uhr (oder wöchentlich)
   - Prüfen: Schedule Trigger Node → Cron Expression

3. **Scheduled Reading Generation**
   - Schedule: Nach Bedarf
   - Prüfen: Schedule Trigger Node → Cron Expression

---

## 🧪 Testen nach Aktivierung

### Test 1: Logger Workflow

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/log \
  -H "Content-Type: application/json" \
  -d '{
    "traceId": "test-1",
    "source": "test",
    "status": "ok",
    "channel": "#tech",
    "message": "Logger Test - Agenten startklar!"
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Mattermost Channel `#tech` bekommt Nachricht

---

### Test 2: Multi-Agent Pipeline

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/content-pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle Content über Manifestation",
    "userId": "test-user"
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Pipeline läuft durch (Marketing → Social-YouTube → Sales)

---

### Test 3: Chart Calculation

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/chart-calculation \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin"
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Chart-Daten werden berechnet und zurückgegeben

---

### Test 4: Agent → Mattermost

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "marketing",
    "message": "Test-Nachricht",
    "response": "Das ist eine Test-Antwort vom Marketing Agent"
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Mattermost Channel `#tech` bekommt Nachricht

---

## ✅ Erfolgskriterien

**Workflows sind startklar, wenn:**
- ✅ Priorität 1 Workflows aktiviert und getestet
- ✅ Mattermost Webhook URLs konfiguriert
- ✅ Environment Variables gesetzt (falls nötig)
- ✅ Alle Tests erfolgreich
- ✅ Keine Fehler in n8n

---

## 📊 Zeitaufwand

**Gesamt:** ~1-1.5 Stunden

- Priorität 1 (Core): 30 Min
- Priorität 2 (Mattermost): 20 Min
- Priorität 3 (Reading): 15 Min
- Priorität 4 (Marketing): 10 Min
- Priorität 5 (Weitere): 10 Min
- **Total:** ~85 Minuten

**Schnell-Start (nur Priorität 1):** ~30 Minuten

---

## 🎯 Empfohlene Reihenfolge

### Option A: Schnell-Start (30 Min)
1. Logger Workflow ✅
2. Multi-Agent Pipeline ✅
3. Chart Calculation ✅

**→ System ist grundlegend funktionsfähig**

---

### Option B: Vollständig (1.5 Std)
1. Priorität 1 (Core) ✅
2. Priorität 2 (Mattermost) ✅
3. Priorität 3 (Reading) ✅
4. Priorität 4 (Marketing) ✅
5. Priorität 5 (Weitere) ✅

**→ System ist vollständig automatisiert**

---

## 🚀 Los geht's!

**Nächster Schritt:**
1. n8n öffnen: `https://n8n.werdemeisterdeinergedankenagent.de`
2. Logger Workflow importieren und aktivieren
3. Testen
4. Weitere Workflows nach Priorität aktivieren

**Viel Erfolg!** 🎉
