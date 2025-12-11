# 🚀 n8n System-Umbau - Phase 1-6 (Geschlossenes System)

**Stand:** 16.12.2025

**Ziel:** Geschlossenes System mit sauberem Protokoll, Router, Observability und Agent-Chain

---

## ✅ Phase 6 - KRITISCHER FIX: JSON.stringify entfernt

**Problem:** `JSON.stringify()` in n8n bei `contentType: "json"` ist falsch!

**Lösung:** Alle 3 Mattermost Workflows korrigiert

### Workflow 1: "Agent → Mattermost Notification"

**Agent Node Body (KORRIGIERT):**
```json
{ "message": "{{$json.message}}", "userId": "{{$json.userId || 'anonymous'}}" }
```

**Mattermost Node Body (KORRIGIERT):**
```json
{
  "text": "## 🤖 Agent-Antwort\n\n**Agent:** {{$node['Webhook Trigger'].json.agentId}}\n**Anfrage:** {{$node['Webhook Trigger'].json.message}}\n\n---\n\n{{$json.response}}",
  "channel": "#tech",
  "username": "{{$node['Webhook Trigger'].json.agentId}} Agent"
}
```

**Status:** ✅ Korrigiert in `mattermost-agent-notification.json`

---

### Workflow 2: "Reading Generation → Mattermost"

**Reading Agent Body (KORRIGIERT):**
```json
{
  "birthDate": "{{$json.birthDate}}",
  "birthTime": "{{$json.birthTime}}",
  "birthPlace": "{{$json.birthPlace}}",
  "readingType": "{{$json.readingType || 'detailed'}}",
  "userId": "{{$json.userId || 'anonymous'}}"
}
```

**Mattermost Body (KORRIGIERT):**
```json
{
  "text": "## 🔮 Neues Reading generiert!\n\n**User:** {{$node['Webhook Trigger'].json.userId || 'Unbekannt'}}\n**Typ:** {{$node['Webhook Trigger'].json.readingType || 'detailed'}}\n**Geburtsdatum:** {{$node['Webhook Trigger'].json.birthDate}}\n\n---\n\n{{$json.reading || $json.reading_text || 'Reading generiert'}}",
  "channel": "#readings",
  "username": "Reading Agent"
}
```

**Status:** ✅ Korrigiert in `mattermost-reading-notification.json`

---

### Workflow 3: "Scheduled Agent Reports → Mattermost"

**Marketing Agent Body (KORRIGIERT):**
```json
{ "message": "Erstelle 5 Social Media Posts für heute mit Themen: Manifestation, Energie, Human Design" }
```

**Mattermost Body (KORRIGIERT):**
```json
{
  "text": "## 📢 Täglicher Marketing-Content generiert!\n\n**Zeit:** {{$now}}\n\n---\n\n{{$json.response || 'Content generiert'}}",
  "channel": "#marketing",
  "username": "Marketing Agent"
}
```

**Status:** ✅ Korrigiert in `mattermost-scheduled-reports.json`

---

## 📋 Phase 1 - Gemeinsames Datenformat (Envelope)

### Standard "Envelope" Format

```json
{
  "meta": {
    "traceId": "",
    "timestamp": "",
    "source": "",
    "version": "1.0"
  },
  "intent": "",
  "payload": {},
  "status": "ok",
  "error": null
}
```

**Vorteile:**
- ✅ Agenten können verkettet werden ohne Feldnamen zu erraten
- ✅ Logging, Debugging, Replay möglich
- ✅ Konsistente Struktur über alle Workflows

**Verwendung:**
- Alle Workflows nutzen dieses Format
- `payload.input` = Input-Daten
- `payload.output` = Output-Daten
- `payload.router` = Router-Entscheidung

---

## 📋 Phase 2 - Observability: Logger-Workflow

### Workflow "LOGGER → Mattermost"

**Datei:** `n8n-workflows/logger-mattermost.json`

**Trigger:** Webhook Trigger
- Path: `/webhook/log`
- Method: POST

**Node:** HTTP Request → Mattermost
- URL: `https://chat.werdemeisterdeinergedanken.de/hooks/tzw3a5godjfpicpu87ixzut39w`
- Specify Body: `JSON`
- JSON Body (Expression):

```json
{
  "channel": "{{$json.channel || '#tech'}}",
  "username": "{{$json.username || 'n8n-logger'}}",
  "text": "### 🧾 Log\n**traceId:** {{$json.traceId || 'n/a'}}\n**source:** {{$json.source || 'n/a'}}\n**status:** {{$json.status || 'n/a'}}\n\n---\n{{$json.message || '—'}}"
}
```

**Status:** ✅ Erstellt

**Test (curl):**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/log \
  -H "Content-Type: application/json" \
  -d '{"traceId":"t-1","source":"test","status":"ok","channel":"#tech","message":"Logger läuft"}'
```

**Erwartung:** Mattermost bekommt "Logger läuft"

---

## 📋 Phase 3 - MCP Master Workflow (Router → Agent → Logger)

### Workflow "MCP MASTER → Orchestrator"

**Struktur:**

```
Webhook Trigger
  ↓
Set Node "ENVELOPE_INIT"
  ↓
HTTP Request "Router Agent" (oder Automation als Router)
  ↓
Function Node "PARSE_JSON" (falls nötig)
  ↓
Set Node "PARSE_ROUTER"
  ↓
Switch "ROUTE_INTENT"
  ↓
[Agent Calls]
  ↓
Set Node "ENVELOPE_AFTER_AGENT"
  ↓
HTTP Request "Call Logger"
  ↓
HTTP Request "Send to Mattermost" (optional)
  ↓
Respond to Webhook
```

**Status:** ⏳ Wird erstellt (siehe nächste Schritte)

---

## 📋 Phase 4 - Agent Calls (stabil, überall gleich)

### Marketing Agent (Beispiel)

**HTTP Request Node "CALL_MARKETING":**
- URL: `http://138.199.237.34:7000/agent/marketing`
- Specify Body: `JSON`
- JSON Body:

```json
{
  "message": "{{$json.payload.input.message}}",
  "userId": "{{$json.payload.input.userId || 'anonymous'}}"
}
```

**Set Node "ENVELOPE_AFTER_AGENT":**
- `payload.output`: `={{ $json }}`
- `intent`: `={{ $node["ROUTE_INTENT"].json.payload.router.intent }}`

**Status:** ⏳ Wird in MCP Master Workflow integriert

---

## 📋 Phase 5 - Output: Logger + Mattermost (entkoppelt)

### Call Logger Workflow

**HTTP Request Node:**
- URL: `https://n8n.werdemeisterdeinergedankenagent.de/webhook/log`
- Specify Body: `JSON`
- JSON Body:

```json
{
  "traceId": "{{$json.meta.traceId}}",
  "source": "{{$json.meta.source}}",
  "status": "ok",
  "channel": "#tech",
  "username": "mcp-master",
  "message": "intent: {{$json.intent}}\nagent: {{$json.payload.router.nextAgent}}\n\n---\n{{$json.payload.output.response || $json.payload.output.reading || 'no output'}}"
}
```

**Status:** ⏳ Wird in MCP Master Workflow integriert

---

## 📋 Phase 7 - Agent-Chain mit Handoff-Protokoll

### Handoff-Protokoll

**Agent-Antwort Format:**
```json
{
  "status": "handoff",
  "nextAgent": "social-youtube",
  "nextMessage": "Mach daraus 5 Reels + Hooks",
  "output": "..."
}
```

**Prompt-Add-on (für Marketing/Sales/Social):**
> Wenn du erkennst, dass der nächste Agent helfen sollte, gib am Ende ein JSON-Block aus:
> `{ "handoff": true, "nextAgent": "...", "nextMessage": "...", "reason": "..." }`

**Workflow-Logik:**
- Parse Agent-Response auf `handoff: true`
- Route zu `nextAgent` mit `nextMessage`
- Kombiniere Outputs

**Status:** ⏳ Wird implementiert

---

## ✅ Nächste Schritte

### Schritt 1: Workflows in n8n importieren

1. **Logger Workflow importieren:**
   - `n8n-workflows/logger-mattermost.json` in n8n importieren
   - Aktivieren
   - Test mit curl (siehe oben)

2. **Korrigierte Mattermost Workflows importieren:**
   - `mattermost-agent-notification.json` (korrigiert)
   - `mattermost-reading-notification.json` (korrigiert)
   - `mattermost-scheduled-reports.json` (korrigiert)
   - Aktivieren
   - Test mit curl

### Schritt 2: MCP Master Workflow erstellen

**Nach erfolgreichem Logger-Test:**
- MCP Master Workflow in n8n erstellen
- Schritt für Schritt aufbauen
- Nach jedem Schritt testen

### Schritt 3: Agent-Chain implementieren

**Nach erfolgreichem MCP Master:**
- Handoff-Protokoll in Agent-Prompts integrieren
- Workflow-Logik für Handoff implementieren

---

## 🧪 Test-Plan

### Test 1: Logger Workflow

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/log \
  -H "Content-Type: application/json" \
  -d '{"traceId":"t-1","source":"test","status":"ok","channel":"#tech","message":"Logger läuft"}'
```

**Erwartung:** ✅ Mattermost bekommt "Logger läuft"

---

### Test 2: Agent → Mattermost (korrigiert)

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{"agentId":"marketing","message":"Test"}'
```

**Erwartung:** ✅ Mattermost bekommt Agent-Antwort

---

### Test 3: Reading → Mattermost (korrigiert)

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-05-15","birthTime":"14:30","birthPlace":"Berlin","readingType":"basic"}'
```

**Erwartung:** ✅ Mattermost bekommt Reading

---

## 📝 Wichtige Regeln

### Regel 1: JSON.stringify bei "Specify Body: JSON"

❌ **FALSCH:**
```json
"body": "={{ JSON.stringify({ message: $json.message }) }}"
```

✅ **RICHTIG:**
```json
"body": "={{ { \"message\": $json.message } }}"
```

**Warum:** Wenn `contentType: "json"` gesetzt ist, erwartet n8n ein Objekt, nicht einen String!

---

### Regel 2: Envelope-Format überall

✅ **IMMER:**
```json
{
  "meta": { "traceId": "...", "timestamp": "...", "source": "..." },
  "intent": "...",
  "payload": {},
  "status": "ok",
  "error": null
}
```

---

### Regel 3: Logger vor Mattermost

✅ **IMMER:**
1. Logger aufrufen (Observability)
2. Dann Mattermost (optional, für User)

---

## ✅ Status-Übersicht

| Phase | Status | Datei |
|-------|--------|-------|
| Phase 1 (Envelope) | ✅ Dokumentiert | - |
| Phase 2 (Logger) | ✅ Erstellt | `logger-mattermost.json` |
| Phase 3 (MCP Master) | ⏳ Wird erstellt | - |
| Phase 4 (Agent Calls) | ⏳ Wird integriert | - |
| Phase 5 (Output) | ⏳ Wird integriert | - |
| Phase 6 (Fix) | ✅ Korrigiert | Alle 3 Mattermost Workflows |
| Phase 7 (Handoff) | ⏳ Wird implementiert | - |

---

**Status:** 🚀 **Phase 6 abgeschlossen, Phase 1-2 erstellt, Phase 3-7 in Arbeit!**
