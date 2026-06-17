# 🚀 n8n Workflows - Nächste Schritte (Strukturiert)

**Status:** Logger Workflow aktiviert ✅

**Nächste Prioritäten:** Core Workflows → Notifications → Automations

---

## 📊 Übersicht: Alle Workflows

### ✅ Bereits aktiviert
- ✅ `logger-mattermost.json` - Logger → Mattermost

### ❌ Noch zu aktivieren (13 Workflows)

---

## 🎯 Phase 1: Core Workflows (30 Min) - JETZT

**Diese 2 Workflows sind essentiell:**

### 1. Multi-Agent Pipeline

**Datei:** `n8n-workflows/multi-agent-pipeline.json`

**Zweck:**
- Router für alle Agenten
- Agent-Chains (Marketing → Social-YouTube → Sales)
- Zentrale Orchestrierung

**Schritte:**
1. n8n öffnen: `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Workflows** → **"+"** → **"Import from File"**
3. Datei: `n8n-workflows/multi-agent-pipeline.json`
4. **Import** klicken
5. **"Active" Toggle** aktivieren (GRÜN)
6. **Webhook prüfen:** `/webhook/content-pipeline` (oder `/webhook/mcp-master`)

**Test:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/content-pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle 5 Posts über Manifestation",
    "userId": "test-user"
  }'
```

---

### 2. Chart Calculation

**Datei:** `n8n-workflows/chart-calculation-workflow-swisseph.json`

**Zweck:**
- Human Design Chart-Berechnung
- Verwendet Swiss Ephemeris für präzise Berechnungen
- Wird vom Chart Development Agent verwendet

**Schritte:**
1. **Workflows** → **"+"** → **"Import from File"**
2. Datei: `n8n-workflows/chart-calculation-workflow-swisseph.json`
3. **Import** klicken
4. **"Active" Toggle** aktivieren (GRÜN)
5. **Webhook prüfen:** `/webhook/chart-calculation`

**Test:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/chart-calculation \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-01-01",
    "birthTime": "12:00",
    "birthPlace": "Berlin, Germany"
  }'
```

---

## 🎯 Phase 2: Mattermost Notifications (20 Min) - DANACH

**Für Observability und Monitoring:**

### 3. Agent → Mattermost

**Datei:** `n8n-workflows/mattermost-agent-notification.json`

**Zweck:**
- Sendet Agent-Antworten an Mattermost
- Channel: `#tech`

**WICHTIG:** Mattermost Webhook URL prüfen!
- Falls `PLATZHALTER_WEBHOOK_ID` vorhanden → durch echte URL ersetzen
- Oder: Gleiche URL wie Logger verwenden: `https://chat.werdemeisterdeinergedanken.de/hooks/jt7w46gsxtr3pkqr75dkor9j3e`

**Schritte:**
1. **Workflows** → **"+"** → **"Import from File"**
2. Datei: `n8n-workflows/mattermost-agent-notification.json`
3. **Import** klicken
4. **"Send to Mattermost" Node öffnen**
5. **URL prüfen:** Falls Platzhalter → echte URL eintragen
6. **"Active" Toggle** aktivieren (GRÜN)

**Webhook:** `/webhook/agent-mattermost`

---

### 4. Reading → Mattermost

**Datei:** `n8n-workflows/mattermost-reading-notification.json`

**Zweck:**
- Sendet Reading-Benachrichtigungen an Mattermost
- Channel: `#readings`

**Schritte:**
1. **Workflows** → **"+"** → **"Import from File"**
2. Datei: `n8n-workflows/mattermost-reading-notification.json`
3. **Import** klicken
4. **"Send to Mattermost" Node öffnen**
5. **URL prüfen:** Falls Platzhalter → echte URL eintragen
6. **"Active" Toggle** aktivieren (GRÜN)

**Webhook:** `/webhook/reading-mattermost`

---

### 5. Scheduled Reports → Mattermost

**Datei:** `n8n-workflows/mattermost-scheduled-reports.json`

**Zweck:**
- Tägliche Marketing-Reports (9:00 Uhr)
- Channel: `#marketing`
- Automatischer Schedule Trigger

**Schritte:**
1. **Workflows** → **"+"** → **"Import from File"**
2. Datei: `n8n-workflows/mattermost-scheduled-reports.json`
3. **Import** klicken
4. **"Send to Mattermost" Node öffnen**
5. **URL prüfen:** Falls Platzhalter → echte URL eintragen
6. **"Active" Toggle** aktivieren (GRÜN)

**Trigger:** Schedule (täglich 9:00) - automatisch!

---

## 🎯 Phase 3: Reading Workflows (15 Min)

### 6. User Registration → Reading

**Datei:** `n8n-workflows/user-registration-reading.json`

**Zweck:**
- Generiert automatisch ein Reading bei User-Registrierung
- Wird vom Frontend aufgerufen

**Webhook:** `/webhook/user-registration-reading`

---

### 7. Scheduled Reading Generation

**Datei:** `n8n-workflows/scheduled-reading-generation.json`

**Zweck:**
- Generiert Readings nach Zeitplan
- Automatischer Schedule Trigger

**Trigger:** Schedule (konfigurierbar)

---

### 8. Reading Generation Workflow

**Datei:** `n8n-workflows/reading-generation-workflow.json`

**Zweck:**
- Bedingte Reading-Generierung
- Wird von anderen Workflows aufgerufen

**Webhook:** `/webhook/reading-generation`

---

## 🎯 Phase 4: Marketing & Weitere (10 Min)

### 9. Daily Marketing Content

**Datei:** `n8n-workflows/daily-marketing-content.json`

**Zweck:**
- Tägliche Marketing-Content-Generierung
- Automatischer Schedule Trigger

**Trigger:** Schedule (täglich)

---

### 10. Mailchimp Subscriber

**Datei:** `n8n-workflows/mailchimp-subscriber.json`

**Zweck:**
- Verarbeitet Mailchimp Webhooks für neue Subscriber
- Sendet an ConnectionKey API

**Webhook:** `/webhook/mailchimp-subscriber`

**Hinweis:** Mailchimp API Sync läuft bereits (`mailchimp-api-sync-with-keys.json`)

---

## 📋 Checkliste: Schritt für Schritt

### Phase 1: Core (JETZT)
- [ ] Multi-Agent Pipeline importieren & aktivieren
- [ ] Chart Calculation importieren & aktivieren
- [ ] Beide Workflows testen

### Phase 2: Mattermost (DANACH)
- [ ] Agent → Mattermost importieren & aktivieren
- [ ] Reading → Mattermost importieren & aktivieren
- [ ] Scheduled Reports → Mattermost importieren & aktivieren
- [ ] Alle Mattermost URLs prüfen

### Phase 3: Reading (SPÄTER)
- [ ] User Registration → Reading importieren & aktivieren
- [ ] Scheduled Reading Generation importieren & aktivieren
- [ ] Reading Generation Workflow importieren & aktivieren

### Phase 4: Weitere (OPTIONAL)
- [ ] Daily Marketing Content importieren & aktivieren
- [ ] Mailchimp Subscriber importieren & aktivieren

---

## 🚀 Quick Start: Nächster Schritt

**Empfehlung: Starte mit Multi-Agent Pipeline**

1. n8n öffnen
2. **Workflows** → **"+"** → **"Import from File"**
3. Datei: `n8n-workflows/multi-agent-pipeline.json`
4. **Import** klicken
5. **"Active" Toggle** aktivieren (GRÜN)
6. Testen

**Zeit:** 5 Minuten

---

## ⚙️ Wichtige Hinweise

### Mattermost Webhook URLs

**Falls Platzhalter vorhanden:**
- Ersetze `PLATZHALTER_WEBHOOK_ID` durch: `jt7w46gsxtr3pkqr75dkor9j3e`
- Oder: Erstelle separate Webhooks für verschiedene Channels

**Bereits vorhandene URL:**
```
https://chat.werdemeisterdeinergedanken.de/hooks/jt7w46gsxtr3pkqr75dkor9j3e
```

### HTTP Method prüfen

**Bei jedem Webhook Trigger:**
- Prüfe: HTTP Method = `POST` (nicht GET!)
- Falls GET: Auf POST ändern

### Workflow aktivieren

**WICHTIG:** Jeder Workflow muss aktiviert sein!
- "Active" Toggle muss GRÜN sein
- Ohne Aktivierung = 404 Fehler

---

## 📊 Fortschritt

**Aktuell:**
- ✅ 1 von 14 Workflows aktiviert (7%)

**Nach Phase 1:**
- ✅ 3 von 14 Workflows aktiviert (21%)

**Nach Phase 2:**
- ✅ 6 von 14 Workflows aktiviert (43%)

**Nach Phase 3:**
- ✅ 9 von 14 Workflows aktiviert (64%)

**Nach Phase 4:**
- ✅ 11 von 14 Workflows aktiviert (79%)

---

**🎯 Starte jetzt mit Multi-Agent Pipeline!**
