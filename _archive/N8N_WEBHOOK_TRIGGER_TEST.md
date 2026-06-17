# 🧪 n8n Webhook Trigger - Test Anleitung

**Problem:** Workflow wartet auf Webhook Trigger (das ist normal!)

**Lösung:** Workflow manuell testen

---

## 📋 Aktueller Status

**"Agent → Mattermost Notification" Workflow:**
- ✅ Workflow ist **Active**
- ✅ "Waiting for trigger event" (normal - wartet auf Webhook-Call)
- ✅ Webhook-URL ist bereit

---

## 🧪 Test-Möglichkeiten

### Option 1: Direkt in n8n testen (Einfachste Methode)

1. **Workflow öffnen:** "Agent → Mattermost Notification"
2. **"Execute Workflow"** Button klicken (oben rechts)
3. **Test Data eingeben:**
   - **agentId:** `marketing`
   - **message:** `Test von n8n`
4. **"Execute Workflow"** klicken
5. **Erwartung:**
   - ✅ Webhook Trigger wird grün
   - ✅ Call Agent wird grün
   - ✅ Send to Mattermost wird grün
   - ✅ Nachricht erscheint in Mattermost Channel `#tech`

---

### Option 2: Mit curl testen (Von Terminal/Server)

**Webhook-URL:**
```
https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost
```

**Test-Request:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "marketing",
    "message": "Test von curl"
  }'
```

**Erwartung:**
- ✅ HTTP 200 Response
- ✅ Workflow wird ausgeführt
- ✅ Nachricht erscheint in Mattermost Channel `#tech`

---

### Option 3: Mit Postman/Insomnia testen

**Request:**
- **Method:** `POST`
- **URL:** `https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost`
- **Headers:**
  - `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "agentId": "marketing",
    "message": "Test von Postman"
  }
  ```

---

## ✅ Schritt-für-Schritt: In n8n testen

### 1. Workflow öffnen

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Workflows** öffnen
3. **"Agent → Mattermost Notification"** öffnen

---

### 2. Test Data eingeben

1. **"Webhook Trigger" Node** öffnen
2. **"Test URL"** kopieren (falls angezeigt)
3. **ODER:** "Execute Workflow" Button klicken (oben rechts)
4. **Test Data eingeben:**
   - **agentId:** `marketing`
   - **message:** `Test von n8n`

---

### 3. Workflow ausführen

1. **"Execute Workflow"** klicken
2. **Alle Nodes sollten grün werden:**
   - ✅ Webhook Trigger (grün)
   - ✅ Call Agent (grün)
   - ✅ Send to Mattermost (grün)
   - ✅ Respond to Webhook (grün)

---

### 4. Ergebnis prüfen

1. **"Send to Mattermost" Node** öffnen
2. **Output prüfen:**
   - Sollte HTTP 200 oder ähnlich zeigen
   - Keine Fehler
3. **Mattermost prüfen:**
   - Channel `#tech` öffnen
   - Nachricht sollte erscheinen

---

## 🚨 Falls Probleme

### Problem: "Call Agent" Node fehlgeschlagen

**Mögliche Ursachen:**
- MCP Server nicht erreichbar
- Falsche URL

**Lösung:**
1. MCP Server Status prüfen:
   ```bash
   curl http://138.199.237.34:7000/health
   ```
2. Sollte zurückgeben: `{"status":"ok","port":7000,"service":"mcp-server"}`
3. Falls nicht → MCP Server starten

---

### Problem: "Send to Mattermost" Node fehlgeschlagen

**Mögliche Ursachen:**
- Falsche Mattermost Webhook-URL
- JSON Body nicht korrekt konfiguriert

**Lösung:**
1. Mattermost Webhook-URL prüfen
2. JSON Body prüfen (Expression-Modus aktiviert?)
3. Siehe `N8N_MATTERMOST_JSON_BODIES.md`

---

### Problem: Workflow hängt immer noch

**Lösung:**
1. **"Execute Workflow"** Button verwenden (nicht auf Webhook warten)
2. Test Data manuell eingeben
3. Workflow ausführen

---

## ✅ Zusammenfassung

**Webhook Trigger wartet normalerweise:**
- ✅ Das ist **normal** - Workflow wartet auf POST-Request
- ✅ Zum Testen: "Execute Workflow" Button verwenden
- ✅ Oder: curl/Postman verwenden

**Webhook-URL:**
```
https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost
```

**Test-Request Body:**
```json
{
  "agentId": "marketing",
  "message": "Test"
}
```

---

**Status:** 🧪 **Webhook Trigger Test-Anleitung erstellt!**
