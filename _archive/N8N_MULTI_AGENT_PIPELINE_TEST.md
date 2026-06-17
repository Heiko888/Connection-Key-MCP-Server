# 🧪 Multi-Agent Pipeline Workflow testen

**Status:** Workflow aktiviert ✅

**Nächster Schritt:** Testen!

---

## 🧪 Test-Befehl

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/content-pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle 5 Posts über Manifestation",
    "userId": "test-user"
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response: JSON mit `success: true` und Pipeline-Ergebnissen
- ✅ Alle 3 Agenten werden nacheinander aufgerufen:
  - Marketing Agent
  - Social-YouTube Agent
  - Automation Agent

---

## 📋 Was der Workflow macht

1. **Webhook Trigger** empfängt POST Request
2. **Call Marketing Agent** → Ruft Marketing Agent auf
3. **Call Social-YouTube Agent** → Ruft Social-YouTube Agent auf (mit Marketing Response)
4. **Call Automation Agent** → Ruft Automation Agent auf (mit Social Response)
5. **Respond to Webhook** → Gibt alle Ergebnisse zurück

---

## ✅ Erfolgreiche Response

**Erwartetes JSON:**
```json
{
  "success": true,
  "pipeline": "completed",
  "marketing": {
    "response": "..."
  },
  "social": {
    "response": "..."
  },
  "automation": {
    "response": "..."
  }
}
```

---

## ❌ Mögliche Fehler

### Fehler 1: 404 - Webhook nicht registriert
**Ursache:** Workflow nicht aktiviert oder HTTP Method ist GET
**Lösung:** 
- Prüfe: "Active" Toggle ist GRÜN
- Prüfe: HTTP Method = POST

### Fehler 2: Agent nicht erreichbar
**Ursache:** Agent-Server läuft nicht oder falsche URL
**Lösung:**
- Prüfe: Agent-Server läuft auf Port 7000
- Prüfe: URLs in Workflow sind korrekt

### Fehler 3: Timeout
**Ursache:** Agenten brauchen zu lange
**Lösung:**
- Prüfe: Agent-Logs
- Prüfe: Agent-Performance

---

## 📊 Nächste Schritte

**Nach erfolgreichem Test:**

1. ✅ Multi-Agent Pipeline funktioniert
2. → Weiter mit **Chart Calculation Workflow**
3. → Dann **Mattermost Notifications**

---

**🎯 Teste jetzt den Workflow!**
