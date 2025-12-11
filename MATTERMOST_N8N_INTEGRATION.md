# 💬 Mattermost + n8n Integration (Selbst gehostet)

**Frage:** Ist selbst gehostetes Mattermost mit n8n möglich?

**Antwort:** ✅ **JA, absolut möglich!**

**Status:** Selbst gehostetes Mattermost funktioniert genauso wie Cloud-Version!

---

## ✅ Mattermost + n8n Integration (Selbst gehostet)

### Besonderheiten bei selbst gehostetem Mattermost:

1. **Eigene URL verwenden**
   - Statt `mattermost.example.com` → Ihre eigene Domain/IP
   - Beispiel: `https://mattermost.ihre-domain.de` oder `http://192.168.1.100:8065`

2. **API-Token selbst erstellen**
   - Account Settings → Security → Personal Access Tokens
   - Token erstellen und in n8n verwenden

3. **Webhooks funktionieren gleich**
   - Incoming Webhooks funktionieren identisch
   - URL ist nur anders (Ihre Domain)

4. **HTTPS/HTTP Konfiguration**
   - Falls selbst gehostet ohne HTTPS: HTTP verwenden
   - Falls mit Reverse Proxy: HTTPS verwenden

### Verfügbare Möglichkeiten:

1. **Mattermost Node in n8n**
   - ✅ Offizieller Mattermost Node verfügbar
   - ✅ Einfache Konfiguration
   - ✅ Direkte Integration

2. **Webhook-Integration**
   - ✅ Mattermost Incoming Webhooks
   - ✅ n8n HTTP Request Node
   - ✅ Flexibel und erweiterbar

3. **Mattermost Bot**
   - ✅ Mattermost Bot API
   - ✅ Slash Commands
   - ✅ Bot Messages

---

## 🚀 Schnellstart: Mattermost in n8n

### Option 1: Mattermost Node (Empfohlen)

**Schritt 1: Mattermost Node hinzufügen**

1. Öffnen Sie n8n: `https://n8n.werdemeisterdeinergedankenagent.de`
2. Neuen Workflow erstellen
3. **"Mattermost" Node** hinzufügen
4. Konfigurieren:
   - **URL:** Ihre selbst gehostete Mattermost URL
     - Beispiel: `https://mattermost.ihre-domain.de`
     - Oder: `http://192.168.1.100:8065` (falls lokal)
     - Oder: `http://138.199.237.34:8065` (falls auf Hetzner Server)
   - **Authentication:** API Token (empfohlen für selbst gehostet)
   - **Operation:** `Post Message` oder `Create Post`

**Schritt 2: Konfiguration**

```json
{
  "resource": "message",
  "operation": "post",
  "channelId": "your-channel-id",
  "message": "{{ $json.response }}"
}
```

---

### Option 2: Mattermost Webhook (Einfachste Methode)

**Schritt 1: Mattermost Incoming Webhook erstellen**

1. Selbst gehostetes Mattermost öffnen
   - URL: Ihre Mattermost-URL (z.B. `https://mattermost.ihre-domain.de`)
2. **Integrations → Incoming Webhooks**
3. **Add Incoming Webhook** klicken
4. Channel auswählen
5. Webhook-URL kopieren
   - Format: `https://mattermost.ihre-domain.de/hooks/xxxxx`
   - Oder: `http://192.168.1.100:8065/hooks/xxxxx` (falls lokal)

**Schritt 2: n8n HTTP Request Node**

1. **HTTP Request Node** in n8n hinzufügen
2. Konfigurieren:
   - **Method:** `POST`
   - **URL:** Mattermost Webhook-URL
   - **Body:** JSON
   ```json
   {
     "text": "{{ $json.response }}",
     "channel": "#general",
     "username": "n8n Bot"
   }
   ```

---

## 📋 Workflow-Beispiele

### Beispiel 1: Agent-Antworten an Mattermost senden

**Workflow:**
```
Agent (Marketing/Sales/etc.)
    ↓
Transform Data
    ↓
Mattermost Node → Channel posten
```

**n8n Konfiguration:**

1. **HTTP Request Node** (Agent aufrufen)
   - URL: `http://138.199.237.34:7000/agent/marketing`
   - Method: `POST`
   - Body: `{"message": "Erstelle Marketing-Content"}`

2. **Mattermost Node** (Nachricht senden)
   - Operation: `Post Message`
   - Channel: `#marketing`
   - Message: `{{ $json.response }}`

---

### Beispiel 2: Automatische Benachrichtigungen

**Workflow:**
```
Schedule Trigger (täglich 9:00)
    ↓
Marketing Agent → Content generieren
    ↓
Mattermost → Team benachrichtigen
```

**n8n Konfiguration:**

1. **Schedule Trigger**
   - Cron: `0 9 * * *` (täglich 9:00)

2. **HTTP Request Node** (Marketing Agent)
   - URL: `http://138.199.237.34:7000/agent/marketing`
   - Body: `{"message": "Erstelle 5 Social Media Posts für heute"}`

3. **Mattermost Node**
   - Channel: `#content-team`
   - Message: 
     ```
     📢 Täglicher Marketing-Content generiert!
     
     {{ $json.response }}
     ```

---

### Beispiel 3: Reading-Generierung → Mattermost

**Workflow:**
```
Webhook Trigger (User registriert sich)
    ↓
Reading Agent → Reading generieren
    ↓
Mattermost → Team benachrichtigen
```

**n8n Konfiguration:**

1. **Webhook Trigger**
   - Path: `/webhook/new-reading`
   - Method: `POST`

2. **HTTP Request Node** (Reading Agent)
   - URL: `http://138.199.237.34:4001/reading/generate`
   - Body: `{{ $json }}`

3. **Mattermost Node**
   - Channel: `#readings`
   - Message:
     ```
     🔮 Neues Reading generiert!
     
     User: {{ $json.userId }}
     Typ: {{ $json.readingType }}
     
     {{ $json.reading }}
     ```

---

## 🔧 Mattermost Node Konfiguration

### Authentifizierung (Selbst gehostet)

**Option 1: API Token (Empfohlen für selbst gehostet)**
- Mattermost öffnen (Ihre selbst gehostete URL)
- Account Settings → Security → Personal Access Tokens
- Token erstellen (z.B. `mmtoken_xxxxxxxxxxxxx`)
- In n8n Mattermost Node eingeben
- **Vorteil:** Funktioniert auch ohne HTTPS

**Option 2: OAuth (Erweitert)**
- Mattermost OAuth App erstellen
- Client ID & Secret in n8n konfigurieren
- **Hinweis:** Erfordert HTTPS für Production

**Option 3: Webhook (Einfachste - Empfohlen)**
- Incoming Webhook erstellen
- Webhook-URL in HTTP Request Node verwenden
- **Vorteil:** Keine Authentifizierung nötig, funktioniert immer

---

## 📊 Verfügbare Mattermost Operationen

### Mattermost Node unterstützt:

1. **Post Message**
   - Nachricht in Channel posten
   - Formatierte Nachrichten (Markdown)
   - Attachments

2. **Create Post**
   - Neuen Post erstellen
   - Thread-Antworten
   - Reactions

3. **Get Channel**
   - Channel-Informationen abrufen
   - Channel-Liste

4. **Get User**
   - Benutzer-Informationen
   - Benutzer-Liste

---

## 🎨 Formatierte Nachrichten

### Markdown-Unterstützung

```json
{
  "text": "## Marketing-Content generiert!",
  "attachments": [
    {
      "title": "Content-Ideen",
      "text": "{{ $json.response }}",
      "color": "#FF6B6B"
    }
  ]
}
```

### Emojis & Formatierung

```
🔮 Neues Reading generiert!
📊 Marketing-Content erstellt
✅ Automatisierung abgeschlossen
⚠️ Fehler aufgetreten
```

---

## 🔗 Integration mit Agenten

### Marketing Agent → Mattermost

```javascript
// n8n Workflow
{
  "nodes": [
    {
      "type": "n8n-nodes-base.httpRequest",
      "name": "Marketing Agent",
      "parameters": {
        "url": "http://138.199.237.34:7000/agent/marketing",
        "method": "POST",
        "body": {
          "message": "Erstelle Marketing-Content"
        }
      }
    },
    {
      "type": "n8n-nodes-base.mattermost",
      "name": "Mattermost",
      "parameters": {
        "operation": "post",
        "channelId": "marketing-channel",
        "message": "{{ $json.response }}"
      }
    }
  ]
}
```

---

## 📋 Mattermost Webhook Format

### Standard Webhook Payload

```json
{
  "text": "Nachricht",
  "channel": "#general",
  "username": "n8n Bot",
  "icon_url": "https://example.com/icon.png",
  "attachments": [
    {
      "title": "Titel",
      "text": "Text",
      "color": "#FF6B6B"
    }
  ]
}
```

### Erweiterte Formatierung

```json
{
  "text": "## Überschrift\n\n**Fett** und *kursiv*",
  "channel": "#marketing",
  "username": "Marketing Agent",
  "props": {
    "attachments": [
      {
        "title": "Content-Ideen",
        "text": "Liste der Ideen...",
        "color": "#FF6B6B",
        "fields": [
          {
            "title": "Status",
            "value": "✅ Fertig",
            "short": true
          }
        ]
      }
    ]
  }
}
```

---

## 🚀 Quick-Start Workflow (Selbst gehostet)

### Einfacher Test-Workflow

1. **Webhook Trigger** hinzufügen
2. **HTTP Request Node** hinzufügen (für Mattermost Webhook)
3. Konfigurieren:
   - **Method:** `POST`
   - **URL:** Ihre Mattermost Webhook-URL
     - Beispiel: `https://mattermost.ihre-domain.de/hooks/xxxxx`
     - Oder: `http://192.168.1.100:8065/hooks/xxxxx`
   - **Body:** JSON
     ```json
     {
       "text": "Test von n8n!",
       "channel": "#general",
       "username": "n8n Bot"
     }
     ```
4. Workflow aktivieren
5. Webhook testen

**Test-Command:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/test \
  -H "Content-Type: application/json" \
  -d '{"test": "message"}'
```

### Mattermost Webhook-URL finden

**In selbst gehostetem Mattermost:**
1. Mattermost öffnen
2. **Integrations → Incoming Webhooks**
3. Webhook erstellen oder vorhandenen öffnen
4. **Webhook URL** kopieren
   - Format: `https://ihre-domain.de/hooks/xxxxxxxxxxxxx`
   - Oder: `http://IP:PORT/hooks/xxxxxxxxxxxxx`

---

## ✅ Zusammenfassung

**Mattermost + n8n Integration:**

✅ **Möglich:** Ja, absolut möglich!
✅ **Methoden:**
   - Mattermost Node (offiziell)
   - Webhook-Integration (einfach)
   - Bot API (erweitert)

✅ **Use Cases:**
   - Agent-Antworten an Team senden
   - Automatische Benachrichtigungen
   - Reading-Generierung → Mattermost
   - Scheduled Reports

✅ **Vorteile:**
   - Team-Kommunikation automatisiert
   - Agent-Ergebnisse direkt im Chat
   - Einfache Integration
   - Formatierte Nachrichten

---

## 📝 Nächste Schritte (Selbst gehostet)

1. **Mattermost Webhook erstellen**
   - Selbst gehostetes Mattermost öffnen
   - **Integrations → Incoming Webhooks**
   - **Add Incoming Webhook** klicken
   - Channel auswählen (z.B. `#general`)
   - **Webhook URL** kopieren
     - Format: `https://ihre-domain.de/hooks/xxxxx`
     - Oder: `http://IP:PORT/hooks/xxxxx`

2. **n8n Workflow erstellen**
   - **HTTP Request Node** hinzufügen
   - **Method:** `POST`
   - **URL:** Mattermost Webhook-URL (aus Schritt 1)
   - **Body:** JSON
     ```json
     {
       "text": "{{ $json.response }}",
       "channel": "#general",
       "username": "n8n Bot"
     }
     ```

3. **Testen**
   - Workflow aktivieren
   - Test-Nachricht senden
   - Prüfen ob Nachricht in Mattermost ankommt

4. **Mit Agenten verbinden**
   - Agent-Antworten → Mattermost senden
   - Automatische Benachrichtigungen einrichten

### Beispiel: Agent → Mattermost (Selbst gehostet)

**Workflow:**
```
Marketing Agent
    ↓
Transform Data
    ↓
HTTP Request → Mattermost Webhook
```

**n8n Konfiguration:**
- **HTTP Request Node (Marketing Agent)**
  - URL: `http://138.199.237.34:7000/agent/marketing`
  - Method: `POST`
  - Body: `{"message": "Erstelle Marketing-Content"}`

- **HTTP Request Node (Mattermost)**
  - URL: `https://mattermost.ihre-domain.de/hooks/xxxxx`
  - Method: `POST`
  - Body:
    ```json
    {
      "text": "## Marketing-Content generiert!\n\n{{ $json.response }}",
      "channel": "#marketing",
      "username": "Marketing Agent"
    }
    ```

---

**Status:** ✅ Mattermost + n8n Integration ist möglich und einfach umzusetzen!

