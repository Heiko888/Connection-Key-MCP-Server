# 📢 MATTERMOST INTEGRATION - CONNECTION-KEY SYSTEM

**Datum:** 8. Januar 2026  
**Server:** 135.181.26.222  
**Status:** ⚠️ Integration vorhanden, Server-Status unklar

---

## 🎯 ÜBERSICHT

Mattermost ist **integriert** in das Connection-Key System und wird für:
- ✅ Agent-Notifications
- ✅ Reading-Notifications
- ✅ Logging
- ✅ Scheduled Reports
- ✅ Marketing-Konzepte

verwendet.

---

## 🏗️ ARCHITEKTUR

```
┌─────────────────────────────────────────────────────────────┐
│  MCP SERVER (138.199.237.34)                                 │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │  N8N WORKFLOWS (Port 5678)                         │     │
│  │                                                     │     │
│  │  Webhook: /webhook/agent-mattermost               │     │
│  │  Webhook: /webhook/reading-mattermost             │     │
│  └────────────────┬───────────────────────────────────┘     │
│                   │                                           │
└───────────────────┼───────────────────────────────────────────┘
                    │
                    │ Mattermost Webhooks
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  MATTERMOST SERVER (135.181.26.222)                          │
│                                                               │
│  - Team-Kommunikation                                        │
│  - Agent-Ergebnisse                                          │
│  - Reading-Status                                            │
│  - System-Logs                                               │
│  - Scheduled Reports                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 N8N WORKFLOWS MIT MATTERMOST

### **GEFUNDEN: 6+ Workflows**

**1. logger-mattermost.json**
- Workflow-ID: `mattermost-logger`
- Zweck: System-Logging an Mattermost
- Status: ⚠️ Vorhanden, unklar ob aktiv

**2. mattermost-reading-notification.json**
- Webhook-Path: `reading-mattermost`
- Zweck: Reading-Status-Benachrichtigungen
- Node: `mattermost` (Incoming Webhook)
- Status: ⚠️ Vorhanden, unklar ob aktiv

**3. mattermost-agent-notification.json**
- Webhook-Path: `agent-mattermost`
- Zweck: Agent-Ergebnis-Benachrichtigungen
- Node: `mattermost-webhook`
- Status: ⚠️ Vorhanden, unklar ob aktiv

**4. mattermost-scheduled-reports.json**
- Zweck: Geplante Reports an Mattermost
- Node: `mattermost` (Incoming Webhook)
- Status: ⚠️ Vorhanden, unklar ob aktiv

**5. marketing-concepts-generation.json**
- Node: `send-mattermost`
- Zweck: Marketing-Konzepte an Mattermost
- Status: ⚠️ Vorhanden, unklar ob aktiv

**6. LOGGER → Mattermost** (Aktiv!)
- Zweck: System-Logs
- Status: ✅ Im N8N aktiv (laut Workflows)

---

## 🔗 AGENT-INTEGRATION

### **6 Development-Agents nutzen Mattermost:**

**Gefunden in `/opt/mcp-connection-key/integration/api-routes/`:**

1. **chart-development/route.ts**
   ```typescript
   const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 
     'https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost';
   ```

2. **social-youtube/route.ts**
   - Webhook: `agent-mattermost`

3. **website-ux-agent/route.ts**
   - Webhook: `agent-mattermost`

4. **marketing/route.ts**
   - Webhook: `agent-mattermost`

5. **sales/route.ts**
   - Webhook: `agent-mattermost`

6. **automation/route.ts**
   - Webhook: `agent-mattermost`

---

## ⚠️ PROBLEME / UNGEKLÄRT

### **1. SERVER-STATUS UNKLAR**

**Problem:**
- ❌ Server 135.181.26.222 antwortet nicht (Timeout)
- ⚠️ Unklar ob Mattermost läuft
- ⚠️ Unklar ob erreichbar

**Zu prüfen:**
```bash
# Mattermost Server Status
ssh root@135.181.26.222 "docker ps"
ssh root@135.181.26.222 "curl -s http://localhost:8065/api/v4/system/ping"
```

---

### **2. WEBHOOK-URLS NICHT KONFIGURIERT**

**Gefunden in Workflows:**
```json
"url": "https://mattermost.ihre-domain.de/hooks/xxxxx"
```

**Problem:**
- ❌ Placeholder-URL
- ❌ Keine echten Webhook-URLs konfiguriert
- ❌ Keine ENV-Variablen für Mattermost

**Zu konfigurieren:**
```bash
# In /opt/mcp-connection-key/.env
MATTERMOST_WEBHOOK_URL=https://135.181.26.222:8065/hooks/YOUR_WEBHOOK_ID
MATTERMOST_READING_WEBHOOK=https://135.181.26.222:8065/hooks/READING_WEBHOOK
MATTERMOST_AGENT_WEBHOOK=https://135.181.26.222:8065/hooks/AGENT_WEBHOOK
```

---

### **3. WORKFLOWS NICHT AKTIV**

**Status:**
- ✅ 5 Workflows aktiv in N8N
- ❌ Mattermost-Workflows **NICHT** in der aktiven Liste

**Aktive Workflows (laut Status):**
1. Mailchimp - Get All Lists
2. Mailchimp API Sync → ConnectionKey
3. LOGGER → Mattermost ✅ (dieser läuft!)
4. Daily Marketing Content Generation
5. Mailchimp Subscriber → ConnectionKey

**Mattermost-Workflows (vorhanden, aber nicht aktiv):**
- ❌ mattermost-reading-notification.json
- ❌ mattermost-agent-notification.json
- ❌ mattermost-scheduled-reports.json

---

## 🎯 WAS ZU TUN IST

### **PHASE 1: MATTERMOST-SERVER PRÜFEN** (30 Min)

1. **Server-Zugriff prüfen:**
   ```bash
   ssh root@135.181.26.222
   ```

2. **Mattermost-Status:**
   ```bash
   docker ps | grep mattermost
   curl http://localhost:8065/api/v4/system/ping
   ```

3. **Webhook-URLs erstellen:**
   - In Mattermost: Integrations → Incoming Webhooks
   - URLs kopieren

---

### **PHASE 2: N8N-WORKFLOWS AKTIVIEREN** (1 Std)

1. **Webhook-URLs in N8N konfigurieren:**
   - N8N Editor öffnen: https://n8n.werdemeisterdeinergedankenagent.de:5678
   - Workflows bearbeiten
   - Mattermost-URLs eintragen

2. **Workflows aktivieren:**
   - mattermost-reading-notification
   - mattermost-agent-notification
   - mattermost-scheduled-reports

---

### **PHASE 3: ENV-VARIABLEN SETZEN** (15 Min)

```bash
# /opt/mcp-connection-key/.env
MATTERMOST_URL=https://135.181.26.222:8065
MATTERMOST_WEBHOOK_READING=https://135.181.26.222:8065/hooks/xxxxx
MATTERMOST_WEBHOOK_AGENT=https://135.181.26.222:8065/hooks/xxxxx
MATTERMOST_WEBHOOK_LOGGER=https://135.181.26.222:8065/hooks/xxxxx
```

---

## 📊 VERWENDUNGSZWECK

### **1. AGENT-NOTIFICATIONS** 🤖

**Workflow:** `agent-mattermost`

**Was wird gesendet:**
- Agent-Ergebnisse (Development-Agents)
- Code-Generierung
- Marketing-Konzepte
- UX-Optimierungen

**Ziel:** Team-Benachrichtigung über Agent-Aktivitäten

---

### **2. READING-NOTIFICATIONS** 📖

**Workflow:** `reading-mattermost`

**Was wird gesendet:**
- Reading-Status (queued, processing, completed, failed)
- Reading-ID
- User-Info

**Ziel:** Team-Überwachung der Reading-Generierung

---

### **3. SYSTEM-LOGGING** 📝

**Workflow:** `logger-mattermost` ✅ AKTIV!

**Was wird gesendet:**
- System-Logs
- Fehler
- Warnungen
- Status-Updates

**Ziel:** Zentrales Logging & Monitoring

---

### **4. SCHEDULED REPORTS** 📊

**Workflow:** `mattermost-scheduled-reports`

**Was wird gesendet:**
- Tägliche/Wöchentliche Reports
- Statistiken
- System-Health

**Ziel:** Regelmäßige Team-Updates

---

## 🎯 EMPFEHLUNG

### **PRIORITÄT: NIEDRIG** 🟢

**Warum?**
- ⚠️ Mattermost ist **Nice-to-Have**, nicht kritisch
- ⚠️ System funktioniert ohne Mattermost
- ⚠️ Nur 1 Workflow aktiv (LOGGER)

**Wann aktivieren?**
- ✅ Nach Chart-Truth-Service
- ✅ Nach Reading-Agents
- ✅ Wenn Team-Kommunikation gewünscht

**Zeitaufwand:**
- Mattermost prüfen: 30 Min
- Workflows konfigurieren: 1 Std
- ENV-Variablen: 15 Min
- **GESAMT: ~2 Stunden**

---

## 📝 ZUSAMMENFASSUNG

**STATUS:**
- ✅ Integration vorhanden (N8N-Workflows)
- ✅ 6 Agent-Routes referenzieren Mattermost
- ✅ 1 Workflow aktiv (LOGGER → Mattermost)
- ⚠️ Server-Status unklar (Timeout)
- ❌ Webhook-URLs nicht konfiguriert
- ❌ Meiste Workflows inaktiv

**NÄCHSTE SCHRITTE:**
1. ⏳ Mattermost-Server-Status prüfen (135.181.26.222)
2. ⏳ Webhook-URLs erstellen
3. ⏳ N8N-Workflows konfigurieren
4. ⏳ Workflows aktivieren

**WICHTIGKEIT:**
- 🟢 Nice-to-Have (nicht kritisch)
- 🟡 Gut für Team-Kommunikation
- 🔵 Hilfreich für Monitoring

---

**LETZTE AKTUALISIERUNG:** 8. Januar 2026, 08:00 Uhr
