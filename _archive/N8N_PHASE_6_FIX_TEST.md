# ✅ Phase 6 Fix - Sofort-Test (Grüner Proof)

**Ziel:** Beweis, dass die JSON.stringify-Fixes funktionieren

---

## 🚨 WICHTIG: Vor dem Test

### 1. Workflows in n8n importieren

**Option A: Workflows neu importieren (empfohlen)**

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Workflows** → **Import from File**
3. Importiere diese 3 Dateien (in dieser Reihenfolge):
   - `n8n-workflows/mattermost-agent-notification.json` (korrigiert)
   - `n8n-workflows/mattermost-reading-notification.json` (korrigiert)
   - `n8n-workflows/mattermost-scheduled-reports.json` (korrigiert)

**Option B: Workflows manuell korrigieren**

Falls du die Workflows nicht neu importieren willst:

1. **Workflow öffnen:** "Agent → Mattermost Notification"
2. **"Call Agent" Node** öffnen
3. **Body-Feld:** Entferne `JSON.stringify()`, ersetze durch:
   ```
   ={{ { "message": $json.message } }}
   ```
4. **"Send to Mattermost" Node** öffnen
5. **Body-Feld:** Entferne `JSON.stringify()`, ersetze durch:
   ```
   ={{ { "text": '## 🤖 Agent-Antwort\n\n**Agent:** ' + $('Webhook Trigger').item.json.agentId + '\n**Anfrage:** ' + $('Webhook Trigger').item.json.message + '\n\n---\n\n' + $json.response, "channel": '#tech', "username": $('Webhook Trigger').item.json.agentId + ' Agent' } }}
   ```
6. **Save** klicken
7. Wiederhole für die anderen 2 Workflows

---

## ✅ Test 1: Agent → Mattermost (korrigiert)

### Schritt 1: Workflow aktivieren

1. **Workflow öffnen:** "Agent → Mattermost Notification"
2. **"Active" Toggle** aktivieren
3. **Status sollte:** `Active` (grün)

---

### Schritt 2: Test mit curl

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "marketing",
    "message": "Erstelle 3 Hooks für ein Reel über Manifestation"
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response: `{"success": true, "message": "Agent response sent to Mattermost"}`
- ✅ Mattermost Channel `#tech` bekommt Nachricht

---

### Schritt 3: In n8n prüfen

1. **Workflow öffnen**
2. **"Executions"** Tab
3. **Letzte Execution** öffnen
4. **Prüfe:**
   - ✅ "Call Agent" Node: **Grün** (Status 200)
   - ✅ "Send to Mattermost" Node: **Grün** (Status 200)
   - ✅ "Respond to Webhook" Node: **Grün**

**Falls ein Node rot ist:**
- Node öffnen
- **"Response"** Tab prüfen
- **Error Message** lesen

---

### Schritt 4: Mattermost prüfen

1. **Mattermost öffnen:** `https://chat.werdemeisterdeinergedanken.de`
2. **Channel:** `#tech`
3. **Prüfe:** Nachricht sollte erscheinen:

```
## 🤖 Agent-Antwort

**Agent:** marketing
**Anfrage:** Erstelle 3 Hooks für ein Reel über Manifestation

---

[Agent-Antwort hier]
```

---

## ✅ Test 2: Reading → Mattermost (korrigiert)

### Schritt 1: Workflow aktivieren

1. **Workflow öffnen:** "Reading Generation → Mattermost"
2. **"Active" Toggle** aktivieren
3. **Status sollte:** `Active` (grün)

---

### Schritt 2: Test mit curl

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "basic",
    "userId": "test-user-123"
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response: `{"success": true, "readingId": "..."}`
- ✅ Mattermost Channel `#readings` bekommt Nachricht

---

### Schritt 3: In n8n prüfen

1. **Workflow öffnen**
2. **"Executions"** Tab
3. **Letzte Execution** öffnen
4. **Prüfe:**
   - ✅ "Reading Agent" Node: **Grün** (Status 200)
   - ✅ "Send to Mattermost" Node: **Grün** (Status 200)
   - ✅ "Respond to Webhook" Node: **Grün**

---

### Schritt 4: Mattermost prüfen

1. **Mattermost öffnen**
2. **Channel:** `#readings`
3. **Prüfe:** Nachricht sollte erscheinen:

```
## 🔮 Neues Reading generiert!

**User:** test-user-123
**Typ:** basic
**Geburtsdatum:** 1990-05-15

---

[Reading-Text hier]
```

---

## ✅ Test 3: Scheduled Reports → Mattermost (korrigiert)

### Schritt 1: Workflow aktivieren

1. **Workflow öffnen:** "Scheduled Agent Reports → Mattermost"
2. **"Active" Toggle** aktivieren
3. **Status sollte:** `Active` (grün)

---

### Schritt 2: Manuell ausführen (Test)

1. **Workflow öffnen**
2. **"Execute Workflow"** Button klicken
3. **Execute** klicken

**Erwartung:**
- ✅ "Marketing Agent" Node: **Grün** (Status 200)
- ✅ "Send to Mattermost" Node: **Grün** (Status 200)
- ✅ Mattermost Channel `#marketing` bekommt Nachricht

---

### Schritt 3: Mattermost prüfen

1. **Mattermost öffnen**
2. **Channel:** `#marketing`
3. **Prüfe:** Nachricht sollte erscheinen:

```
## 📢 Täglicher Marketing-Content generiert!

**Zeit:** [Aktuelle Zeit]

---

[Marketing-Content hier]
```

---

## 🚨 Troubleshooting

### Problem 1: "Call Agent" Node ist rot

**Mögliche Ursachen:**
- MCP Server nicht erreichbar
- Falsche URL
- Body-Format falsch

**Lösung:**
1. **Node öffnen**
2. **"Response"** Tab prüfen
3. **Error Message** lesen
4. **MCP Server prüfen:**
   ```bash
   curl http://138.199.237.34:7000/health
   ```

---

### Problem 2: "Send to Mattermost" Node ist rot

**Mögliche Ursachen:**
- Mattermost Webhook URL falsch
- Body-Format falsch (JSON.stringify noch vorhanden?)
- Mattermost Webhook existiert nicht

**Lösung:**
1. **Node öffnen**
2. **"Response"** Tab prüfen
3. **Error Message** lesen
4. **Body-Feld prüfen:** Sollte KEIN `JSON.stringify()` enthalten!
5. **Mattermost Webhook prüfen:**
   - Mattermost öffnen
   - Integrations → Incoming Webhooks
   - Webhook existiert?

---

### Problem 3: Mattermost bekommt keine Nachricht

**Mögliche Ursachen:**
- Webhook URL falsch
- Channel existiert nicht
- Body-Format falsch

**Lösung:**
1. **"Send to Mattermost" Node** öffnen
2. **"Response"** Tab prüfen
3. **Status Code:** Sollte 200 sein
4. **Response Body:** Sollte leer sein (Mattermost antwortet mit leerem Body bei Erfolg)
5. **Mattermost Webhook testen:**
   ```bash
   curl -X POST https://chat.werdemeisterdeinergedanken.de/hooks/tzw3a5godjfpicpu87ixzut39w \
     -H "Content-Type: application/json" \
     -d '{"text":"Test","channel":"#tech","username":"Test Bot"}'
   ```

---

### Problem 4: JSON.stringify noch vorhanden

**Symptom:**
- Node ist rot
- Error: "JSON parameter needs to be valid JSON"

**Lösung:**
1. **Node öffnen**
2. **Body-Feld** prüfen
3. **Entferne `JSON.stringify()`**
4. **Ersetze durch direktes Objekt:**
   ```
   ={{ { "message": $json.message } }}
   ```
5. **Save** klicken

---

## ✅ Erfolgs-Kriterien

**Alle 3 Tests erfolgreich, wenn:**
- ✅ Alle Nodes in n8n sind **grün**
- ✅ Mattermost bekommt Nachrichten
- ✅ Keine `JSON.stringify()` in Body-Feldern
- ✅ `contentType: "json"` ist gesetzt
- ✅ Response Status Codes sind 200

---

## 🎯 Nächster Schritt

**Nach erfolgreichem Test:**
- ✅ Phase 6 ist abgeschlossen
- ✅ Weiter mit Phase 2 (Logger Workflow testen)
- ✅ Dann Phase 3 (MCP Master Workflow erstellen)

---

**Status:** ✅ **Test-Anleitung erstellt!**
