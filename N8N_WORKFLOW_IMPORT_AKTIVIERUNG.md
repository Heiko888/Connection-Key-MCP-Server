# 📥 n8n Workflow importieren und aktivieren - Komplett

**Situation:** Webhook existiert noch nicht → Workflow muss importiert werden

---

## 🚀 Schritt-für-Schritt: Logger Workflow

### Schritt 1: n8n öffnen

1. Browser öffnen
2. Gehe zu: `https://n8n.werdemeisterdeinergedankenagent.de`
3. Einloggen

---

### Schritt 2: Workflow importieren

1. **Links in der Sidebar:** Klicke auf **"Workflows"**
2. **Oben rechts:** Klicke auf **"+"** Button
3. **Dropdown öffnen:** Wähle **"Import from File"**
4. **Datei auswählen:**
   - Navigiere zu: `n8n-workflows/logger-mattermost.json`
   - Oder: Lade die Datei hoch
5. **"Import"** klicken

**Erwartung:**
- ✅ Workflow erscheint in der Liste
- ✅ Name: "LOGGER → Mattermost"

---

### Schritt 3: Workflow öffnen

1. **Klicke auf den Workflow:** "LOGGER → Mattermost"
2. Workflow öffnet sich im Editor

**Du siehst jetzt:**
- Webhook Trigger Node (links)
- Send to Mattermost Node (Mitte)
- Respond to Webhook Node (rechts)

---

### Schritt 4: Webhook-URL notieren

**Nach Import wird die Webhook-URL automatisch generiert:**

1. **Klicke auf "Webhook Trigger" Node** (links)
2. **Unten im Node** siehst du die Webhook-URL:
   - `https://n8n.werdemeisterdeinergedankenagent.de/webhook/log`
   - Oder: `http://138.199.237.34:5678/webhook/log`
3. **Kopiere diese URL** (wird später zum Testen benötigt)

---

### Schritt 5: Mattermost Webhook URL konfigurieren (optional)

**WICHTIG:** Der Workflow hat einen Platzhalter für die Mattermost URL!

1. **Klicke auf "Send to Mattermost" Node** (Mitte)
2. **Prüfe die URL:**
   - Aktuell: `https://chat.werdemeisterdeinergedanken.de/hooks/PLATZHALTER_WEBHOOK_ID`
3. **Ersetze `PLATZHALTER_WEBHOOK_ID`** durch deine echte Mattermost Webhook URL

**Mattermost Webhook URL finden:**
1. Mattermost öffnen
2. Channel → Integrations → Incoming Webhooks
3. Webhook erstellen oder vorhandenen kopieren
4. URL kopieren (Format: `https://chat.werdemeisterdeinergedanken.de/hooks/xxxxx`)

**Oder:** Falls du die URL nicht hast, kannst du sie später setzen. Der Workflow funktioniert auch ohne Mattermost (nur der HTTP Request schlägt dann fehl, aber der Webhook funktioniert).

---

### Schritt 6: Workflow aktivieren ⭐ KRITISCH!

**WICHTIG:** Webhooks funktionieren NUR wenn der Workflow aktiviert ist!

1. **Oben rechts im Workflow-Editor:** Finde den **"Active" Toggle**
   - Oft ein Schalter oder Button mit "Active" / "Inactive"
2. **Klicke auf "Active"** (oder den Toggle-Switch)
3. **Status sollte:** `Active` (grün) werden

**Prüfen:**
- ✅ Toggle ist GRÜN
- ✅ Status zeigt "Active"
- ✅ Workflow-Liste zeigt "Active" Badge

**WICHTIG:** Ohne Aktivierung funktioniert der Webhook nicht!

---

### Schritt 7: Testen

**Nach Aktivierung testen:**

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/log \
  -H "Content-Type: application/json" \
  -d '{
    "traceId": "test-1",
    "source": "test",
    "status": "ok",
    "channel": "#tech",
    "message": "Logger Test - Agenten startklar!"
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response: `{"success":true,"logged":true,"traceId":"test-1"}`
- ✅ Mattermost Channel `#tech` bekommt Nachricht (falls Webhook URL konfiguriert)

---

## 📋 Checkliste

- [ ] n8n geöffnet
- [ ] Workflow importiert (`logger-mattermost.json`)
- [ ] Workflow geöffnet
- [ ] Webhook-URL notiert
- [ ] Mattermost Webhook URL konfiguriert (optional)
- [ ] **"Active" Toggle aktiviert (GRÜN)** ⭐
- [ ] Test erfolgreich

---

## 🎯 Wichtigste Punkte

1. **Workflow muss importiert sein** ✅
2. **Workflow muss aktiviert sein** ⭐ (Active = GRÜN)
3. **Webhook-Pfad ist "log"** ✅ (automatisch)

**Ohne Aktivierung = 404 Fehler!**

---

## 🚀 Quick Start

**Minimaler Aufwand:**

1. n8n öffnen
2. Workflows → "+" → Import from File
3. `logger-mattermost.json` auswählen
4. Import klicken
5. Workflow öffnen
6. **"Active" Toggle aktivieren** ⭐
7. Testen

**Das war's!** 🎉

---

## 📋 Nächste Workflows

**Nach Logger Workflow:**

1. Multi-Agent Pipeline
2. Chart Calculation
3. Mattermost Notifications

**Alle nach demselben Schema:**
- Importieren
- Aktivieren
- Testen
