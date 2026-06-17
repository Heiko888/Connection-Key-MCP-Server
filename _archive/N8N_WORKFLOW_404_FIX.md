# 🔧 n8n Workflow 404 Fehler beheben

**Fehler:** `{"code":404,"message":"This webhook is not registered for POST requests"}`

**Ursache:** Workflow ist nicht aktiviert oder nicht importiert

---

## ✅ Schnell-Fix (3 Schritte)

### Schritt 1: n8n öffnen

```
https://n8n.werdemeisterdeinergedankenagent.de
```

---

### Schritt 2: Workflow importieren (falls noch nicht geschehen)

1. **Workflows** → **"+"** → **"Import from File"**
2. **Datei:** `n8n-workflows/logger-mattermost.json`
3. **Import** klicken

---

### Schritt 3: Workflow aktivieren ⭐ WICHTIG!

1. **Workflow öffnen** (klicke auf "LOGGER → Mattermost")
2. **"Active" Toggle** oben rechts aktivieren
3. **Status muss GRÜN sein!**

**Das ist der häufigste Fehler:** Workflow ist importiert, aber nicht aktiviert!

---

## 🧪 Testen

**Nach Aktivierung:**

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/log \
  -H "Content-Type: application/json" \
  -d '{"traceId":"test","source":"test","status":"ok","channel":"#tech","message":"Test"}'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response: `{"success":true,"logged":true,"traceId":"test"}`

---

## ❌ Wenn es immer noch nicht funktioniert

### Prüfe 1: Workflow existiert?

1. In n8n → Workflows
2. Suche nach "LOGGER → Mattermost"
3. Falls nicht vorhanden → Importieren

---

### Prüfe 2: Workflow ist aktiviert?

1. Workflow öffnen
2. Prüfe "Active" Toggle oben rechts
3. Muss GRÜN sein!

---

### Prüfe 3: Webhook-Pfad korrekt?

1. Workflow öffnen
2. "Webhook Trigger" Node öffnen
3. Prüfe "Path" → sollte "log" sein
4. Prüfe Webhook-URL unten im Node

---

### Prüfe 4: n8n läuft?

```bash
curl https://n8n.werdemeisterdeinergedankenagent.de
```

Sollte eine Antwort geben (nicht 404).

---

## 📋 Checkliste

- [ ] n8n ist erreichbar
- [ ] Workflow ist importiert
- [ ] Workflow ist geöffnet
- [ ] **"Active" Toggle ist GRÜN** ⭐
- [ ] Webhook-Pfad ist "log"
- [ ] Test erfolgreich

---

**Meistens ist es Schritt 3: "Active" Toggle aktivieren!** ✅
