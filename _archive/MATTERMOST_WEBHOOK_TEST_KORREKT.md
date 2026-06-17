# 🧪 Mattermost Webhook korrekt testen

**Problem:** `"Failed to handle the payload of media type application/json for incoming webhook xxxxx"`

**Ursache:** `xxxxx` ist nur ein Platzhalter - du musst die **echte Webhook URL** verwenden!

---

## ✅ Schritt 1: Echte Mattermost Webhook URL finden

### Option A: Webhook bereits erstellt

1. **Mattermost öffnen:** `https://chat.werdemeisterdeinergedanken.de`
2. **Settings** → **Integrations** → **Incoming Webhooks**
3. **Liste der Webhooks** wird angezeigt
4. **Klicke auf den Webhook** (z.B. "n8n Logger" oder ähnlich)
5. **Webhook URL wird angezeigt:**
   - Format: `https://chat.werdemeisterdeinergedanken.de/hooks/abc123xyz`
   - **Die ID nach `/hooks/` ist deine echte Webhook ID!**
6. **URL komplett kopieren**

---

### Option B: Webhook noch nicht erstellt

**Dann erstelle ihn zuerst:**

1. Mattermost öffnen
2. Channel öffnen (z.B. `#tech`)
3. **"..."** (drei Punkte) → **"Integrations"**
4. **"Incoming Webhooks"** → **"Add Incoming Webhook"**
5. **Konfiguration:**
   - Title: "n8n Logger"
   - Channel: `#tech`
6. **"Add"** klicken
7. **Webhook URL wird angezeigt** → Sofort kopieren!

**WICHTIG:** Die URL wird nur einmal angezeigt! Notiere sie sofort!

---

## ✅ Schritt 2: Korrekter Test-Befehl

**Ersetze `xxxxx` durch deine echte Webhook ID:**

```bash
curl -X POST https://chat.werdemeisterdeinergedanken.de/hooks/DEINE_ECHTE_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test-Nachricht von n8n",
    "channel": "#tech",
    "username": "n8n-test"
  }'
```

**Beispiel (wenn deine Webhook ID `abc123xyz` ist):**

```bash
curl -X POST https://chat.werdemeisterdeinergedanken.de/hooks/abc123xyz \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test-Nachricht von n8n",
    "channel": "#tech",
    "username": "n8n-test"
  }'
```

---

## 📋 Mattermost Webhook JSON Format

**Korrektes Format:**

```json
{
  "text": "Nachricht",
  "channel": "#tech",
  "username": "n8n-logger"
}
```

**Felder:**
- `text` (erforderlich) - Die Nachricht
- `channel` (optional) - Channel-Name (z.B. `#tech`)
- `username` (optional) - Absender-Name

**WICHTIG:**
- ✅ `text` ist **erforderlich** - ohne `text` funktioniert es nicht!
- ✅ `channel` ist optional - wird ignoriert, wenn Webhook bereits einem Channel zugeordnet ist
- ✅ `username` ist optional

---

## 🧪 Minimaler Test (nur Text)

**Wenn der Webhook bereits einem Channel zugeordnet ist:**

```bash
curl -X POST https://chat.werdemeisterdeinergedanken.de/hooks/DEINE_ECHTE_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{"text": "Test"}'
```

**Das sollte funktionieren!**

---

## ❌ Häufige Fehler

### Fehler 1: Platzhalter verwendet

**Falsch:**
```bash
curl -X POST https://chat.werdemeisterdeinergedanken.de/hooks/xxxxx
```

**Richtig:**
```bash
curl -X POST https://chat.werdemeisterdeinergedanken.de/hooks/abc123xyz
```

---

### Fehler 2: URL unvollständig

**Falsch:**
```bash
curl -X POST https://chat.werdemeisterdeinergedanken.de/hooks/
```

**Richtig:**
```bash
curl -X POST https://chat.werdemeisterdeinergedanken.de/hooks/abc123xyz
```

---

### Fehler 3: Kein `text` Feld

**Falsch:**
```json
{"channel": "#tech"}
```

**Richtig:**
```json
{"text": "Test-Nachricht", "channel": "#tech"}
```

---

## ✅ Erfolgreiche Response

**Wenn alles funktioniert, bekommst du:**

```json
{"status": "ok"}
```

**Oder HTTP 200 OK ohne Body.**

**In Mattermost:**
- ✅ Nachricht erscheint im Channel
- ✅ Username wird angezeigt (falls gesetzt)

---

## 📋 Checkliste

- [ ] Mattermost geöffnet
- [ ] Webhook erstellt (oder vorhandener gefunden)
- [ ] **Echte Webhook URL kopiert** (nicht `xxxxx`!)
- [ ] Webhook ID notiert (Teil nach `/hooks/`)
- [ ] Test-Befehl mit echter URL ausgeführt
- [ ] `text` Feld im JSON vorhanden
- [ ] Response: HTTP 200 OK
- [ ] Nachricht erscheint in Mattermost

---

## 🚀 Quick Test

**Minimaler Test-Befehl (nachdem du die echte URL hast):**

```bash
# Ersetze DEINE_ECHTE_WEBHOOK_ID durch deine echte ID
curl -X POST https://chat.werdemeisterdeinergedanken.de/hooks/DEINE_ECHTE_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{"text": "Test"}'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Mattermost Channel bekommt Nachricht

---

## 📋 Nächste Schritte

**Nach erfolgreichem Test:**

1. ✅ Webhook URL in n8n Logger Workflow eintragen
2. ✅ Logger Workflow aktivieren
3. ✅ n8n Logger Workflow testen
