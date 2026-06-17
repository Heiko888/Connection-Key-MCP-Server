# 🏠 Mattermost selbst gehostet - Setup für n8n

**Ihre Situation:** Mattermost ist selbst gehostet

**Lösung:** Integration mit n8n funktioniert genauso, nur mit Ihrer eigenen URL!

---

## 🔧 Setup für selbst gehostetes Mattermost

### Schritt 1: Mattermost Webhook erstellen

1. **Mattermost öffnen**
   - Ihre Mattermost-URL (z.B. `https://mattermost.ihre-domain.de`)
   - Oder: `http://192.168.1.100:8065` (falls lokal)

2. **Webhook erstellen**
   - **Integrations** → **Incoming Webhooks**
   - **Add Incoming Webhook** klicken
   - **Display Name:** z.B. "n8n Bot"
   - **Description:** z.B. "n8n Automatisierungen"
   - **Channel:** Channel auswählen (z.B. `#general` oder `#notifications`)
   - **Create** klicken

3. **Webhook-URL kopieren**
   - Format: `https://ihre-domain.de/hooks/xxxxxxxxxxxxx`
   - Oder: `http://IP:PORT/hooks/xxxxxxxxxxxxx`
   - **WICHTIG:** Diese URL sicher aufbewahren!

---

## 🚀 n8n Workflow erstellen

### Option 1: HTTP Request Node (Einfachste Methode)

**Schritt 1: HTTP Request Node hinzufügen**

1. n8n öffnen: `https://n8n.werdemeisterdeinergedankenagent.de`
2. Neuen Workflow erstellen
3. **HTTP Request Node** hinzufügen

**Schritt 2: Konfigurieren**

- **Method:** `POST`
- **URL:** Ihre Mattermost Webhook-URL
  - Beispiel: `https://mattermost.ihre-domain.de/hooks/xxxxx`
- **Body:** JSON
  ```json
  {
    "text": "Test von n8n!",
    "channel": "#general",
    "username": "n8n Bot"
  }
  ```

**Schritt 3: Testen**

- Workflow aktivieren
- **Execute Workflow** klicken
- Prüfen ob Nachricht in Mattermost ankommt

---

### Option 2: Mattermost Node (Offiziell)

**Schritt 1: Mattermost Node hinzufügen**

1. n8n öffnen
2. **Mattermost Node** hinzufügen

**Schritt 2: Konfigurieren**

- **URL:** Ihre Mattermost Server-URL
  - Beispiel: `https://mattermost.ihre-domain.de`
  - Oder: `http://192.168.1.100:8065`
- **Authentication:** API Token
  - Mattermost → Account Settings → Security → Personal Access Tokens
  - Token erstellen (z.B. `mmtoken_xxxxxxxxxxxxx`)
  - Token in n8n eingeben
- **Operation:** `Post Message`
- **Channel ID:** Channel-ID (finden Sie in Mattermost URL)
- **Message:** `{{ $json.response }}`

---

## 📋 Beispiel-Workflows

### Beispiel 1: Agent-Antworten → Mattermost

**Workflow:**
```
Marketing Agent
    ↓
Transform Data
    ↓
HTTP Request → Mattermost
```

**n8n Konfiguration:**

1. **HTTP Request Node (Marketing Agent)**
   - URL: `http://138.199.237.34:7000/agent/marketing`
   - Method: `POST`
   - Body:
     ```json
     {
       "message": "Erstelle 5 Social Media Posts für heute"
     }
     ```

2. **HTTP Request Node (Mattermost)**
   - URL: `https://mattermost.ihre-domain.de/hooks/xxxxx`
   - Method: `POST`
   - Body:
     ```json
     {
       "text": "## 📢 Marketing-Content generiert!\n\n{{ $json.response }}",
       "channel": "#marketing",
       "username": "Marketing Agent",
       "icon_url": "https://example.com/marketing-icon.png"
     }
     ```

---

### Beispiel 2: Reading-Generierung → Mattermost

**Workflow:**
```
Webhook Trigger
    ↓
Reading Agent
    ↓
Mattermost
```

**n8n Konfiguration:**

1. **Webhook Trigger**
   - Path: `/webhook/new-reading`
   - Method: `POST`

2. **HTTP Request Node (Reading Agent)**
   - URL: `http://138.199.237.34:4001/reading/generate`
   - Method: `POST`
   - Body: `{{ $json }}`

3. **HTTP Request Node (Mattermost)**
   - URL: `https://mattermost.ihre-domain.de/hooks/xxxxx`
   - Method: `POST`
   - Body:
     ```json
     {
       "text": "## 🔮 Neues Reading generiert!\n\n**User:** {{ $json.userId }}\n**Typ:** {{ $json.readingType }}\n\n{{ $json.reading }}",
       "channel": "#readings",
       "username": "Reading Agent"
     }
     ```

---

## 🔐 Sicherheit (Selbst gehostet)

### HTTPS vs HTTP

**HTTPS (Empfohlen):**
- Wenn Mattermost über HTTPS erreichbar ist
- Webhook-URL: `https://mattermost.ihre-domain.de/hooks/xxxxx`
- **Vorteil:** Verschlüsselte Kommunikation

**HTTP (Lokal/Intern):**
- Wenn Mattermost nur lokal erreichbar ist
- Webhook-URL: `http://192.168.1.100:8065/hooks/xxxxx`
- **Hinweis:** Nur für interne Netzwerke verwenden

### API Token vs Webhook

**Webhook (Einfacher):**
- ✅ Keine Authentifizierung nötig
- ✅ Funktioniert sofort
- ✅ Einfach zu konfigurieren
- ⚠️ URL muss geheim bleiben

**API Token (Sicherer):**
- ✅ Mehr Kontrolle
- ✅ Kann gelöscht/neu erstellt werden
- ⚠️ Erfordert Token-Management

---

## 🎨 Formatierte Nachrichten

### Markdown-Unterstützung

```json
{
  "text": "## Überschrift\n\n**Fett** und *kursiv*\n\n- Liste\n- Punkte",
  "channel": "#general",
  "username": "n8n Bot"
}
```

### Attachments

```json
{
  "text": "Marketing-Content generiert!",
  "channel": "#marketing",
  "attachments": [
    {
      "title": "Content-Ideen",
      "text": "{{ $json.response }}",
      "color": "#FF6B6B",
      "fields": [
        {
          "title": "Status",
          "value": "✅ Fertig",
          "short": true
        },
        {
          "title": "Anzahl",
          "value": "5 Posts",
          "short": true
        }
      ]
    }
  ]
}
```

---

## ✅ Checkliste

- [ ] Mattermost Webhook erstellt
- [ ] Webhook-URL kopiert
- [ ] n8n Workflow erstellt
- [ ] HTTP Request Node konfiguriert
- [ ] Workflow getestet
- [ ] Nachricht in Mattermost angekommen
- [ ] Mit Agenten verbunden (optional)

---

## 🆘 Troubleshooting

### Problem: Webhook funktioniert nicht

**Lösung:**
1. Prüfen Sie die Webhook-URL (korrekt kopiert?)
2. Prüfen Sie ob Mattermost erreichbar ist
3. Prüfen Sie Firewall-Regeln
4. Prüfen Sie n8n Logs

### Problem: Nachricht kommt nicht an

**Lösung:**
1. Prüfen Sie Channel-Name (korrekt geschrieben?)
2. Prüfen Sie ob Bot Zugriff auf Channel hat
3. Prüfen Sie JSON-Format (korrekt formatiert?)
4. Prüfen Sie Mattermost Logs

### Problem: HTTPS/HTTP Fehler

**Lösung:**
1. Prüfen Sie ob Mattermost HTTPS oder HTTP verwendet
2. Passen Sie Webhook-URL entsprechend an
3. Prüfen Sie SSL-Zertifikat (falls HTTPS)

---

**Status:** ✅ Selbst gehostetes Mattermost funktioniert perfekt mit n8n!

