# ⚠️ n8n Variables Problem - Lösung

**Problem:** Variables sind in Ihrer n8n Version nicht verfügbar (Community Edition)

**Lösung:** Workflows anpassen, um ohne Environment Variables zu funktionieren

---

## 🔧 Lösung: Direkte Werte verwenden

### Option 1: Werte direkt in Workflows eintragen (Einfachste)

**Statt:**
```json
"url": "={{ $env.MATTERMOST_WEBHOOK_URL }}"
```

**Verwenden:**
```json
"url": "https://mattermost.ihre-domain.de/hooks/xxxxx"
```

### Option 2: Set Node verwenden (Flexibler)

**Workflow-Struktur:**
```
Webhook Trigger
    ↓
Set Node (Mattermost URL setzen)
    ↓
HTTP Request (Mattermost)
```

---

## 📋 Anpassungen für Mattermost Workflows

### Schritt 1: Mattermost Webhook-URL notieren

1. Mattermost öffnen
2. **Integrations** → **Incoming Webhooks**
3. Webhook erstellen (falls noch nicht vorhanden)
4. **Webhook-URL kopieren**
   - Format: `https://mattermost.ihre-domain.de/hooks/xxxxx`

### Schritt 2: Workflows anpassen

**Nach dem Import in n8n:**

1. **Mattermost Workflow öffnen**
2. **"Send to Mattermost" Node öffnen** (doppelklicken)
3. **URL-Feld:**
   - Statt: `={{ $env.MATTERMOST_WEBHOOK_URL }}`
   - Eintragen: Ihre Mattermost Webhook-URL direkt
4. **Channel-Feld:**
   - Statt: `={{ $env.MATTERMOST_CHANNEL || '#general' }}`
   - Eintragen: `#general` (oder gewünschter Channel)
5. **Save** klicken

---

## ✅ Vorteile dieser Lösung

- ✅ Funktioniert ohne Variables
- ✅ Einfach zu konfigurieren
- ✅ Keine Upgrade nötig
- ✅ Direkt verwendbar

---

## ⚠️ Nachteile

- ⚠️ URL muss in jedem Workflow einzeln eingetragen werden
- ⚠️ Bei URL-Änderung müssen alle Workflows angepasst werden

---

## 🔄 Alternative: Set Node verwenden

**Für flexiblere Konfiguration:**

1. **Set Node** am Anfang des Workflows hinzufügen
2. **Werte setzen:**
   - `mattermostUrl` = `https://mattermost.ihre-domain.de/hooks/xxxxx`
   - `mattermostChannel` = `#general`
3. **In HTTP Request Node verwenden:**
   - URL: `={{ $json.mattermostUrl }}`
   - Channel: `={{ $json.mattermostChannel }}`

**Vorteil:** URL nur einmal setzen, in allen Nodes verwendbar

---

## 📝 Schritt-für-Schritt: Workflow anpassen

### Mattermost Agent Notification

1. **Workflow importieren**
2. **"Send to Mattermost" Node öffnen**
3. **URL eintragen:** Ihre Mattermost Webhook-URL
4. **Channel eintragen:** `#general` (oder gewünschter Channel)
5. **Save** klicken
6. **Workflow aktivieren**

**Wiederholen für:**
- Mattermost Scheduled Reports
- Mattermost Reading Notification

---

## ✅ Checkliste

- [ ] Mattermost Webhook erstellt
- [ ] Webhook-URL notiert
- [ ] Workflows importiert
- [ ] Jeden Mattermost Workflow angepasst (URL & Channel direkt eintragen)
- [ ] Workflows aktiviert
- [ ] Getestet

---

**Status:** ✅ Lösung verfügbar - Workflows funktionieren ohne Variables!

