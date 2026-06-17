# 🔗 Mattermost Webhook erstellen - Schritt für Schritt

**Zweck:** Webhook für n8n Workflows, um Nachrichten an Mattermost zu senden

---

## 🚀 Schritt-für-Schritt: Mattermost Webhook erstellen

### Schritt 1: Mattermost öffnen

1. Browser öffnen
2. Gehe zu: `https://chat.werdemeisterdeinergedanken.de`
3. Einloggen

---

### Schritt 2: Channel auswählen

**Wähle den Channel, in den die Nachrichten gesendet werden sollen:**

- `#tech` - Für Logger und Agent-Notifications
- `#readings` - Für Reading-Notifications
- `#marketing` - Für Marketing-Reports

**Oder erstelle einen neuen Channel:**
- Klicke auf "+" neben Channels
- Channel-Name eingeben (z.B. "n8n-logs")
- Channel erstellen

---

### Schritt 3: Integrations öffnen

1. **Klicke auf den Channel-Namen** (z.B. `#tech`)
2. **Oben rechts:** Klicke auf **"..."** (drei Punkte)
3. **Dropdown öffnen:** Wähle **"Integrations"**
4. **Oder:** Gehe zu **"Settings"** → **"Integrations"**

---

### Schritt 4: Incoming Webhook erstellen

1. **Klicke auf "Incoming Webhooks"**
2. **Klicke auf "Add Incoming Webhook"** (oder "Create Webhook")
3. **Konfiguration:**
   - **Title:** z.B. "n8n Logger" oder "n8n Notifications"
   - **Description:** z.B. "Webhook für n8n Workflows"
   - **Channel:** Wähle den Channel (z.B. `#tech`)
   - **Username:** z.B. "n8n-logger" (optional)
   - **Icon URL:** Optional (kann leer bleiben)

4. **"Add"** oder **"Create"** klicken

---

### Schritt 5: Webhook URL kopieren

**Nach Erstellung siehst du:**

1. **Webhook URL** wird angezeigt
   - Format: `https://chat.werdemeisterdeinergedanken.de/hooks/xxxxx`
   - Oder: `https://mattermost.ihre-domain.de/hooks/xxxxx`

2. **URL kopieren:**
   - Klicke auf "Copy" Button
   - Oder markiere und kopiere die URL manuell

**WICHTIG:** Diese URL wird nur einmal angezeigt! Notiere sie sofort!

---

### Schritt 6: Webhook URL in n8n eintragen

**Jetzt in n8n:**

1. **Logger Workflow öffnen** (oder anderen Mattermost-Workflow)
2. **"Send to Mattermost" Node öffnen** (HTTP Request Node)
3. **URL-Feld finden**
4. **Ersetze:** `PLATZHALTER_WEBHOOK_ID` durch die kopierte Webhook URL

**Oder:** Falls die URL direkt eingetragen werden soll:
- Ersetze: `https://chat.werdemeisterdeinergedanken.de/hooks/PLATZHALTER_WEBHOOK_ID`
- Durch: `https://chat.werdemeisterdeinergedanken.de/hooks/xxxxx` (deine echte URL)

5. **"Save"** oder Workflow speichern

---

## 📋 Webhook URLs für verschiedene Channels

**Falls du mehrere Channels nutzen willst:**

### Webhook 1: #tech (für Logger)
- **Channel:** `#tech`
- **Title:** "n8n Logger"
- **URL:** `https://chat.werdemeisterdeinergedanken.de/hooks/xxxxx`
- **Verwendung:** Logger Workflow, Agent Notifications

### Webhook 2: #readings (für Readings)
- **Channel:** `#readings`
- **Title:** "n8n Reading Notifications"
- **URL:** `https://chat.werdemeisterdeinergedanken.de/hooks/yyyyy`
- **Verwendung:** Reading Generation Notifications

### Webhook 3: #marketing (für Reports)
- **Channel:** `#marketing`
- **Title:** "n8n Marketing Reports"
- **URL:** `https://chat.werdemeisterdeinergedanken.de/hooks/zzzzz`
- **Verwendung:** Scheduled Marketing Reports

---

## 🔍 Webhook URL finden (falls bereits erstellt)

**Falls der Webhook bereits existiert:**

1. Mattermost öffnen
2. **Settings** → **Integrations** → **Incoming Webhooks**
3. **Liste der Webhooks** wird angezeigt
4. **Klicke auf den Webhook** (z.B. "n8n Logger")
5. **Webhook URL** wird angezeigt
6. **URL kopieren**

---

## ⚙️ Webhook konfigurieren

### Option 1: Direkt im Workflow eintragen

**In n8n Workflow:**
1. "Send to Mattermost" Node öffnen
2. URL-Feld: Mattermost Webhook URL eintragen
3. Speichern

---

### Option 2: Environment Variable (empfohlen)

**In n8n Settings:**
1. **Settings** → **Environment Variables**
2. **Variable hinzufügen:**
   - **Name:** `MATTERMOST_WEBHOOK_URL`
   - **Value:** `https://chat.werdemeisterdeinergedanken.de/hooks/xxxxx`
3. **Speichern**

**Im Workflow verwenden:**
- URL-Feld: `{{ $env.MATTERMOST_WEBHOOK_URL }}`

**Vorteile:**
- ✅ Sicherer (keine URL im Workflow-Code)
- ✅ Einfacher zu ändern
- ✅ Kann für mehrere Workflows verwendet werden

---

## 🧪 Webhook testen

**Nach Konfiguration testen:**

```bash
curl -X POST https://chat.werdemeisterdeinergedanken.de/hooks/xxxxx \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "#tech",
    "username": "test-bot",
    "text": "Test-Nachricht von n8n"
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Mattermost Channel bekommt Nachricht

---

## 📋 Checkliste

- [ ] Mattermost geöffnet
- [ ] Channel ausgewählt (z.B. `#tech`)
- [ ] Incoming Webhook erstellt
- [ ] Webhook URL kopiert
- [ ] URL in n8n Workflow eingetragen
- [ ] Workflow gespeichert
- [ ] Test erfolgreich

---

## 🎯 Wichtigste Punkte

1. **Webhook URL wird nur einmal angezeigt** → Sofort kopieren!
2. **Jeder Channel braucht eigenen Webhook** (oder einen für alle)
3. **Webhook URL ist geheim** → Nicht öffentlich teilen!

---

## 🚀 Quick Start

**Minimaler Aufwand:**

1. Mattermost öffnen
2. Channel → Integrations → Incoming Webhooks
3. "Add Incoming Webhook" klicken
4. Channel auswählen
5. "Add" klicken
6. **Webhook URL kopieren** ⭐
7. In n8n Workflow eintragen
8. Testen

**Das war's!** 🎉

---

## 📋 Nächste Schritte

**Nach Webhook-Erstellung:**

1. ✅ Webhook URL in Logger Workflow eintragen
2. ✅ Logger Workflow aktivieren
3. ✅ Testen
4. → Weiter mit anderen Workflows
