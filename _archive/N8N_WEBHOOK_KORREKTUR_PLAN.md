# 🔧 n8n Webhook-Korrektur Plan

**Stand:** 16.12.2025

**Ziel:** Alle Webhook-Konfigurationen korrigieren und konsistent machen

---

## 🚨 Kritische Probleme (Sofort beheben)

### Problem 1: Webhook-Pfad-Konflikt

**Chart Calculation Workflows:**
- ❌ `chart-calculation-workflow.json` → Pfad: `chart-calculation`
- ✅ `chart-calculation-workflow-swisseph.json` → Pfad: `chart-calculation`

**Konflikt:** Beide nutzen denselben Webhook-Pfad!

**Lösung:**
- ❌ `chart-calculation-workflow.json` **LÖSCHEN** (nicht Swiss Ephemeris Version)
- ✅ Nur `chart-calculation-workflow-swisseph.json` behalten

---

## ⚠️ Veraltete Konfigurationen (Korrigieren)

### Kategorie 1: Veraltete Webhook-Trigger

**Betroffene Workflows:**
1. `multi-agent-pipeline.json`
2. `user-registration-reading.json`
3. `agent-notification-simple.json`
4. `reading-notification-simple.json`
5. `mailchimp-subscriber.json`
6. `reading-generation-workflow.json` (hat `settings.httpMethod` - falsch!)

**Problem:**
```json
{
  "parameters": {
    "httpMethod": "POST",  // ❌ Veraltet
    "path": "...",
    "responseMode": "..."  // ❌ Veraltet
  }
}
```

**Korrektur:**
```json
{
  "parameters": {
    "path": "...",
    "options": {}
  }
}
```

---

### Kategorie 2: Veraltete Body-Konfiguration

**Betroffene Workflows:**
1. `multi-agent-pipeline.json`
2. `user-registration-reading.json`
3. `scheduled-reading-generation.json`
4. `reading-notification-simple.json`
5. `reading-generation-workflow.json`
6. `agent-notification-simple.json`
7. `mailchimp-subscriber.json`

**Problem:**
```json
{
  "bodyParameters": {
    "parameters": [
      {
        "name": "message",
        "value": "..."
      }
    ]
  }
}
```

**Korrektur:**
```json
{
  "sendBody": true,
  "contentType": "json",
  "body": "={{ { \"message\": $json.message } }}",
  "options": {}
}
```

---

## 📋 Korrektur-Plan

### Phase 1: Kritische Konflikte lösen

**Schritt 1.1: Chart Calculation Konflikt**
- [ ] `chart-calculation-workflow.json` löschen
- [ ] Nur `chart-calculation-workflow-swisseph.json` behalten

---

### Phase 2: Webhook-Trigger korrigieren

**Schritt 2.1: Multi-Agent Content Pipeline**
- [ ] `httpMethod: "POST"` entfernen
- [ ] `responseMode: "onReceived"` entfernen
- [ ] `options: {}` hinzufügen

**Schritt 2.2: User Registration → Reading**
- [ ] `httpMethod: "POST"` entfernen
- [ ] `responseMode: "responseNode"` entfernen
- [ ] `options: {}` hinzufügen

**Schritt 2.3: Agent Notification (Simple)**
- [ ] `httpMethod: "POST"` entfernen
- [ ] `responseMode: "onReceived"` entfernen
- [ ] `options: {}` hinzufügen

**Schritt 2.4: Reading Notification (Simple)**
- [ ] `httpMethod: "POST"` entfernen
- [ ] `responseMode: "onReceived"` entfernen
- [ ] `options: {}` hinzufügen

**Schritt 2.5: Mailchimp Subscriber**
- [ ] `httpMethod: "POST"` entfernen
- [ ] `responseMode: "onReceived"` entfernen
- [ ] `options: {}` hinzufügen

**Schritt 2.6: Reading Generation Workflow**
- [ ] `settings.httpMethod` entfernen (falsche Stelle!)
- [ ] `settings.path` in `parameters.path` verschieben
- [ ] `settings.responseMode` entfernen
- [ ] `parameters.options: {}` hinzufügen

---

### Phase 3: Body-Konfiguration korrigieren

**Schritt 3.1: Multi-Agent Content Pipeline**
- [ ] `bodyParameters` entfernen
- [ ] `contentType: "json"` hinzufügen
- [ ] `body: "={{ { \"message\": ... } }}"` hinzufügen

**Schritt 3.2: User Registration → Reading**
- [ ] `bodyParameters` entfernen
- [ ] `contentType: "json"` hinzufügen
- [ ] `body: "={{ { ... } }}"` hinzufügen

**Schritt 3.3: Scheduled Reading Generation**
- [ ] `bodyParameters` entfernen
- [ ] `contentType: "json"` hinzufügen
- [ ] `body: "={{ { ... } }}"` hinzufügen

**Schritt 3.4: Reading Notification (Simple)**
- [ ] `bodyParameters` entfernen
- [ ] `contentType: "json"` hinzufügen
- [ ] `body: "={{ { ... } }}"` hinzufügen

**Schritt 3.5: Reading Generation Workflow**
- [ ] `bodyParameters` entfernen
- [ ] `contentType: "json"` hinzufügen
- [ ] `body: "={{ { ... } }}"` hinzufügen

**Schritt 3.6: Agent Notification (Simple)**
- [ ] `bodyParameters` entfernen
- [ ] `contentType: "json"` hinzufügen
- [ ] `body: "={{ { \"message\": $json.message } }}"` hinzufügen

**Schritt 3.7: Mailchimp Subscriber**
- [ ] `bodyParameters` entfernen
- [ ] `contentType: "json"` hinzufügen
- [ ] `body: "={{ { ... } }}"` hinzufügen

---

## ✅ Korrektur-Templates

### Webhook-Trigger (korrekt):

```json
{
  "parameters": {
    "path": "webhook-path",
    "options": {}
  },
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 1
}
```

**NICHT:**
```json
{
  "parameters": {
    "httpMethod": "POST",  // ❌ Veraltet
    "path": "...",
    "responseMode": "..."  // ❌ Veraltet
  }
}
```

---

### HTTP Request Body (korrekt):

```json
{
  "parameters": {
    "method": "POST",
    "url": "...",
    "authentication": "none",
    "sendBody": true,
    "contentType": "json",
    "body": "={{ { \"message\": $json.message } }}",
    "options": {}
  }
}
```

**NICHT:**
```json
{
  "bodyParameters": {  // ❌ Veraltet
    "parameters": [
      {
        "name": "message",
        "value": "..."
      }
    ]
  }
}
```

---

## 📊 Status-Übersicht

| Workflow | Webhook-Trigger | Body-Config | Status |
|----------|----------------|-------------|--------|
| Agent → Mattermost | ✅ OK | ✅ OK | ✅ Fertig |
| Reading → Mattermost | ✅ OK | ✅ OK | ✅ Fertig |
| Scheduled Reports | - (Schedule) | ✅ OK | ✅ Fertig |
| Logger → Mattermost | ✅ OK | ✅ OK | ✅ Fertig |
| Multi-Agent Pipeline | ❌ Veraltet | ❌ Veraltet | ⚠️ Korrigieren |
| User Registration | ❌ Veraltet | ❌ Veraltet | ⚠️ Korrigieren |
| Chart (Swiss Ephemeris) | ✅ OK | ✅ OK | ✅ OK |
| Chart (ohne Swiss) | ✅ OK | ✅ OK | ❌ Löschen |
| Scheduled Reading | - (Schedule) | ❌ Veraltet | ⚠️ Korrigieren |
| Reading (Simple) | ❌ Veraltet | ❌ Veraltet | ⚠️ Korrigieren |
| Reading (Workflow) | ❌ Veraltet | ❌ Veraltet | ⚠️ Korrigieren |
| Agent (Simple) | ❌ Veraltet | ❌ Veraltet | ⚠️ Korrigieren |
| Mailchimp | ❌ Veraltet | ❌ Veraltet | ⚠️ Korrigieren |

---

## 🎯 Prioritäten

### Priorität 1 (Sofort):
1. ❌ `chart-calculation-workflow.json` löschen (Konflikt)

### Priorität 2 (Kurzfristig):
1. ⚠️ Multi-Agent Pipeline korrigieren
2. ⚠️ User Registration korrigieren

### Priorität 3 (Mittelfristig):
1. ⚠️ Alle anderen veralteten Workflows korrigieren

---

**Status:** 🔧 **Korrektur-Plan erstellt!**
