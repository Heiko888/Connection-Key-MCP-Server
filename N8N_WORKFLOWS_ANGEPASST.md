# ✅ n8n Workflows angepasst - Ohne Variables

**Workflows wurden angepasst, um ohne Environment Variables zu funktionieren!**

---

## 🔧 Was wurde geändert

### Mattermost Workflows (3x)

**Vorher:**
```json
"url": "={{ $env.MATTERMOST_WEBHOOK_URL }}"
"channel": "={{ $env.MATTERMOST_CHANNEL || '#general' }}"
```

**Nachher:**
```json
"url": "https://mattermost.ihre-domain.de/hooks/xxxxx"
"channel": "#general"
```

---

## 📋 Anpassungen pro Workflow

### 1. mattermost-agent-notification.json
- ✅ URL: Direkte Mattermost Webhook-URL (Platzhalter)
- ✅ Channel: `#general`

### 2. mattermost-scheduled-reports.json
- ✅ URL: Direkte Mattermost Webhook-URL (Platzhalter)
- ✅ Channel: `#marketing`

### 3. mattermost-reading-notification.json
- ✅ URL: Direkte Mattermost Webhook-URL (Platzhalter)
- ✅ Channel: `#readings`

---

## 🚀 Nächste Schritte

### Schritt 1: Mattermost Webhook erstellen

1. Mattermost öffnen
2. **Integrations** → **Incoming Webhooks**
3. **Add Incoming Webhook** klicken
4. Channel auswählen
5. **Webhook-URL kopieren**
   - Format: `https://mattermost.ihre-domain.de/hooks/xxxxx`

### Schritt 2: Workflows importieren

1. n8n öffnen
2. **Workflows** → **Import**
3. Alle 3 Mattermost Workflows importieren:
   - `mattermost-agent-notification.json`
   - `mattermost-scheduled-reports.json`
   - `mattermost-reading-notification.json`

### Schritt 3: Mattermost URL eintragen

**Für jeden Mattermost Workflow:**

1. **Workflow öffnen**
2. **"Send to Mattermost" Node öffnen** (doppelklicken)
3. **URL-Feld:**
   - Ersetzen Sie: `https://mattermost.ihre-domain.de/hooks/xxxxx`
   - Mit Ihrer echten Mattermost Webhook-URL
4. **Channel-Feld prüfen:**
   - Sollte bereits korrekt sein (`#general`, `#marketing`, `#readings`)
   - Anpassen falls nötig
5. **Save** klicken

### Schritt 4: Workflows aktivieren

1. **Active Toggle** aktivieren (oben rechts)
2. Workflow wird grün
3. Fertig!

---

## ✅ Vorteile

- ✅ Funktioniert ohne Variables
- ✅ Keine Upgrade nötig
- ✅ Einfach zu konfigurieren
- ✅ Direkt verwendbar

---

## ⚠️ Wichtig

**Nach dem Import müssen Sie die Mattermost Webhook-URL in jedem Workflow eintragen!**

Die Workflows enthalten Platzhalter:
- `https://mattermost.ihre-domain.de/hooks/xxxxx`

**Ersetzen Sie diese mit Ihrer echten Mattermost Webhook-URL!**

---

**Status:** ✅ Workflows angepasst - Bereit für Import ohne Variables!

