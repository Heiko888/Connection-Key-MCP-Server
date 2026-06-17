# 🚀 Website-UX-Agent - Schnellaktivierung

**Problem:** Route 404, keine Mattermost-Benachrichtigungen  
**Lösung:** Route deployen + n8n-Workflow aktivieren

---

## ⚡ Schnell-Lösung (5 Minuten)

### **1. Route deployen** (2 Min)

```bash
# Auf Server (167.235.224.149)
ssh root@167.235.224.149

# Verzeichnis erstellen
mkdir -p /opt/hd-app/The-Connection-Key/frontend/app/api/agents/website-ux-agent

# Datei kopieren (von lokal, Windows PowerShell)
scp integration/api-routes/app-router/agents/website-ux-agent/route.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/agents/website-ux-agent/route.ts

# Container neu bauen & starten
cd /opt/hd-app/The-Connection-Key
docker compose build --no-cache frontend
docker compose up -d frontend
sleep 15

# Testen
curl -X POST http://localhost:3000/api/agents/website-ux-agent \
  -H "Content-Type: application/json" \
  -d '{"message": "Test", "userId": "test"}'
```

**Erwartet:** JSON-Response (kein 404!)

---

### **2. n8n-Workflow aktivieren** (2 Min)

**n8n öffnen:**
```
https://n8n.werdemeisterdeinergedankenagent.de
```

**Workflow öffnen:**
- **Workflows** → **"Agent → Mattermost Notification"**

**Prüfen:**
1. **"Send to Mattermost" Node** öffnen
2. **URL prüfen:** `https://chat.werdemeisterdeinergedanken.de/hooks/jt7w46gsxtr3pkqr75dkor9j3e`
3. **"Active" Toggle** aktivieren (GRÜN!)

**Webhook-URL:**
```
https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost
```

---

### **3. Testen** (1 Min)

**Test 1: Route direkt**
```bash
curl -X POST http://localhost:3000/api/agents/website-ux-agent \
  -H "Content-Type: application/json" \
  -d '{"message": "Analysiere https://www.example.com", "userId": "test"}'
```

**Test 2: Über n8n (für Mattermost)**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "website-ux-agent",
    "message": "Analysiere https://www.example.com",
    "userId": "test"
  }'
```

**Erwartet:** Mattermost-Benachrichtigung in `#tech` Channel!

---

## 📊 Warum keine Mattermost-Benachrichtigungen?

**Aktuell:**
- ❌ Route fehlt → 404
- ❌ Keine Aufrufe → n8n-Workflow wird nicht getriggert
- ❌ Keine Mattermost-Benachrichtigungen

**Nach Fix:**
- ✅ Route funktioniert
- ✅ Agent wird aufgerufen
- ✅ n8n-Workflow kann getriggert werden
- ✅ Mattermost-Benachrichtigungen funktionieren

---

## 🎯 Option: API Route erweitern (für automatische Mattermost-Benachrichtigungen)

**Aktuell:** API Route ruft nur Agent auf (keine Mattermost-Benachrichtigung)

**Erweitert:** API Route ruft Agent auf + sendet an n8n-Webhook

**In `route.ts` nach erfolgreicher Agent-Antwort hinzufügen:**

```typescript
// Nach erfolgreicher Agent-Antwort
if (responseText) {
  // Optional: n8n-Webhook aufrufen für Mattermost-Benachrichtigung
  try {
    await fetch('https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: AGENT_ID,
        message: message,
        response: responseText,
        userId: userId || 'anonymous'
      })
    });
  } catch (error) {
    // Fehler ignorieren (Mattermost ist optional)
    console.error('Mattermost notification failed:', error);
  }
}
```

**Vorteil:** Jeder Agent-Aufruf sendet automatisch an Mattermost!

---

## ✅ Checkliste

- [ ] Route deployed (kein 404 mehr)
- [ ] n8n-Workflow aktiviert
- [ ] Route direkt testen → Erfolg
- [ ] n8n-Webhook testen → Mattermost-Benachrichtigung
- [ ] Optional: API Route erweitern für automatische Mattermost-Benachrichtigungen

---

**🚀 Starte mit Schritt 1: Route deployen!**
