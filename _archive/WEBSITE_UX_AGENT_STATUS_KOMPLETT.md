# 🔍 Website-UX-Agent - Kompletter Status & Aktivierung

**Datum:** 18.12.2025  
**Problem:** Route gibt 404, keine Mattermost-Benachrichtigungen

---

## ❌ Aktueller Status

### 1. **MCP Server** ✅
- **Agent läuft:** `http://138.199.237.34:7000/agent/website-ux-agent`
- **Status:** ✅ Aktiv

### 2. **Frontend API Route** ❌
- **Route:** `/api/agents/website-ux-agent`
- **Status:** ❌ **404 - Route fehlt im Container**
- **Problem:** Datei nicht im Container vorhanden

### 3. **Mattermost Integration** ❌
- **Workflow:** "Agent → Mattermost Notification"
- **Status:** ⚠️ Workflow existiert, aber Agent wird nicht aufgerufen
- **Grund:** Frontend API Route fehlt → Keine Aufrufe → Keine Mattermost-Benachrichtigungen

---

## 🚀 Lösung: 3 Schritte zur Aktivierung

### **SCHRITT 1: Route auf Server deployen** (PRIORITÄT 1)

**Option A: Mit Deployment-Script (empfohlen)**

```bash
# Auf Windows (PowerShell)
.\deploy-website-ux-agent-route.ps1

# Auf Linux/Mac
bash deploy-website-ux-agent-route.sh
```

**Option B: Manuell**

```bash
# 1. SSH zum Server
ssh root@167.235.224.149

# 2. Verzeichnis erstellen
mkdir -p /opt/hd-app/The-Connection-Key/frontend/app/api/agents/website-ux-agent

# 3. Datei kopieren (von lokal, Windows PowerShell)
scp integration/api-routes/app-router/agents/website-ux-agent/route.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/agents/website-ux-agent/route.ts

# 4. Container neu bauen
cd /opt/hd-app/The-Connection-Key
docker compose build --no-cache frontend

# 5. Container neu starten
docker compose up -d frontend

# 6. Warte 15 Sekunden
sleep 15
```

**Prüfen:**
```bash
# Teste Route
curl -X POST http://localhost:3000/api/agents/website-ux-agent \
  -H "Content-Type: application/json" \
  -d '{"message": "Test", "userId": "test"}'
```

**Erwartete Response:**
```json
{
  "success": true,
  "response": "...",
  "agentId": "website-ux-agent",
  "taskId": "uuid",
  "duration_ms": 3500
}
```

---

### **SCHRITT 2: n8n Mattermost-Workflow aktivieren** (PRIORITÄT 2)

**Workflow:** "Agent → Mattermost Notification"

**1. n8n öffnen:**
```
https://n8n.werdemeisterdeinergedankenagent.de
```

**2. Workflow öffnen:**
- **Workflows** → **"Agent → Mattermost Notification"**

**3. Mattermost Webhook-URL prüfen:**
- **"Send to Mattermost" Node** öffnen
- **URL:** `https://chat.werdemeisterdeinergedanken.de/hooks/tzw3a5godjfpicpu87ixzut39w`
- Falls leer → Eintragen

**4. JSON Body prüfen:**
- **Specify Body:** `JSON` (aus Dropdown)
- **JSON Body:** Expression-Modus ({{ }} Button)
- **Expression:**
  ```
  ={{ JSON.stringify({ 
    text: '## 🤖 Agent-Antwort\n\n**Agent:** ' + $('Webhook Trigger').item.json.agentId + '\n**Anfrage:** ' + $('Webhook Trigger').item.json.message + '\n\n---\n\n' + $json.response, 
    channel: '#tech', 
    username: ($('Webhook Trigger').item.json.agentId || 'Agent') + ' Agent' 
  }) }}
  ```

**5. Workflow aktivieren:**
- **"Active" Toggle** aktivieren (GRÜN!)
- **Save** klicken

**6. Webhook-URL notieren:**
```
https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost
```

---

### **SCHRITT 3: API Route mit n8n verbinden** (Optional)

**Option A: Direkt über Frontend API** (empfohlen)
- Frontend ruft `/api/agents/website-ux-agent` auf
- API Route speichert Task in Supabase
- **Keine n8n-Verbindung nötig** (Task-Management läuft direkt)

**Option B: Über n8n Webhook** (für Automatisierung)
- Frontend ruft n8n Webhook auf: `/webhook/agent-mattermost`
- n8n ruft Agent auf
- n8n sendet an Mattermost

**Für Mattermost-Benachrichtigungen:**
- **Option A:** API Route kann direkt Mattermost aufrufen (später)
- **Option B:** n8n-Workflow nutzen (aktuell empfohlen)

---

## 🧪 Testen

### Test 1: Route direkt testen

```bash
curl -X POST http://localhost:3000/api/agents/website-ux-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Analysiere https://www.the-connection-key.de/agents",
    "userId": "test"
  }'
```

**Erwartet:** JSON-Response mit `success: true`

---

### Test 2: Über n8n Webhook testen

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "website-ux-agent",
    "message": "Analysiere https://www.the-connection-key.de/agents",
    "userId": "test"
  }'
```

**Erwartet:**
- ✅ n8n-Workflow läuft
- ✅ Agent wird aufgerufen
- ✅ Mattermost-Benachrichtigung erscheint in `#tech`

---

## 📋 Checkliste

### Deployment
- [ ] Route-Datei existiert lokal: `integration/api-routes/app-router/agents/website-ux-agent/route.ts`
- [ ] Route-Datei auf Server kopiert
- [ ] Container neu gebaut
- [ ] Container neu gestartet
- [ ] Route funktioniert (kein 404)

### n8n Workflow
- [ ] Workflow "Agent → Mattermost Notification" importiert
- [ ] Mattermost Webhook-URL eingetragen
- [ ] JSON Body Expression korrekt
- [ ] Workflow aktiviert (GRÜN)

### Test
- [ ] Route direkt testen → Erfolg
- [ ] n8n Webhook testen → Mattermost-Benachrichtigung

---

## 🎯 Warum keine Mattermost-Benachrichtigungen?

**Aktuell:**
1. ❌ Frontend API Route fehlt (404)
2. ❌ Keine Aufrufe an Agent
3. ❌ n8n-Workflow wird nicht getriggert
4. ❌ Keine Mattermost-Benachrichtigungen

**Nach Fix:**
1. ✅ Frontend API Route funktioniert
2. ✅ Agent wird aufgerufen
3. ✅ n8n-Workflow kann getriggert werden (optional)
4. ✅ Mattermost-Benachrichtigungen funktionieren

---

## 📊 Nächste Schritte

1. **Route deployen** → `deploy-website-ux-agent-route.sh` ausführen
2. **n8n-Workflow aktivieren** → Mattermost Webhook konfigurieren
3. **Testen** → Route und Mattermost-Benachrichtigungen prüfen

---

**🚀 Starte mit Schritt 1: Route deployen!**
