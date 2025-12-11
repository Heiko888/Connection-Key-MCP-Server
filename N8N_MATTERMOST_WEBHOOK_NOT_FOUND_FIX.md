# 🔧 n8n Mattermost - "Resource not found" Fix

**Fehler:** "The resource you are requesting could not be found"
**Fehler:** "Failed to handle the payload of media type application/json for incoming webhook tzw3a5godjfpicpu87ixzut39w"

**Ursache:** Mattermost Webhook-URL ist falsch oder der Webhook existiert nicht mehr

---

## ✅ Lösung: Mattermost Webhook neu erstellen

### Schritt 1: Mattermost öffnen

1. **Mattermost öffnen**
   - URL: `https://chat.werdemeisterdeinergedanke.de`
   - Oder: `http://138.199.237.34:8065` (falls auf Hetzner Server)

### Schritt 2: Neuen Incoming Webhook erstellen

1. **Integrations** → **Incoming Webhooks**
2. **Add Incoming Webhook** klicken
3. **Title:** `n8n Scheduled Reports` (oder passend)
4. **Channel:** `#marketing` (oder gewünschter Channel)
5. **Description:** `Tägliche Marketing-Reports von n8n`
6. **Save** klicken
7. **Webhook URL kopieren** (Format: `https://chat.werdemeisterdeinergedanke.de/hooks/xxxxx`)

**WICHTIG:** Die Webhook-URL muss vollständig sein:
- ✅ `https://chat.werdemeisterdeinergedanke.de/hooks/abc123xyz`
- ❌ `https://chat.werdemeisterdeinergedanke` (unvollständig)
- ❌ `https://chat.werdemeisterdeinergedanke.de/hooks/` (ohne Webhook-ID)

### Schritt 3: URL in n8n eintragen

1. **Workflow öffnen:** "Scheduled Agent Reports → Mattermost"
2. **"Send to Mattermost" Node** doppelklicken
3. **URL-Feld:**
   - Alte URL löschen
   - Neue Webhook-URL eintragen: `https://chat.werdemeisterdeinergedanke.de/hooks/xxxxx`
4. **Save** klicken

---

## 🔍 Prüfe ob Webhook existiert

### In Mattermost:

1. **Integrations** → **Incoming Webhooks**
2. **Prüfe:** Existiert der Webhook mit der ID aus der Fehlermeldung?
   - Fehlermeldung zeigt: `tzw3a5godjfpicpu87ixzut39w`
   - Falls nicht vorhanden: Webhook wurde gelöscht → Neuen erstellen

### Webhook direkt testen:

```bash
curl -X POST https://chat.werdemeisterdeinergedanke.de/hooks/tzw3a5godjfpicpu87ixzut39w \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test",
    "channel": "#marketing",
    "username": "Test Bot"
  }'
```

**Falls Fehler:** Webhook existiert nicht → Neuen erstellen
**Falls Erfolg:** Webhook existiert → URL in n8n prüfen

---

## ✅ Vollständige Konfiguration prüfen

**"Send to Mattermost" Node sollte so aussehen:**

| Feld | Wert |
|------|------|
| **Method** | `POST` |
| **URL** | `https://chat.werdemeisterdeinergedanke.de/hooks/xxxxx` (vollständige Webhook-URL) |
| **Authentication** | `None` |
| **Send Body** | ✅ **ON** |
| **Body Content Type** | `JSON` |
| **Specify Body** | `JSON` |
| **JSON Body** | `={{ JSON.stringify({ text: '...', channel: '#marketing', username: 'Marketing Agent' }) }}` |

---

## 🧪 Test nach Fix

1. **Workflow speichern**
2. **"Execute Workflow"** klicken
3. **Erwartung:**
   - ✅ Marketing Agent Node wird grün
   - ✅ Send to Mattermost Node wird grün
   - ✅ Kein "Resource not found" Fehler
   - ✅ Nachricht erscheint in Mattermost Channel

---

## 🔍 Häufige Probleme

### Problem 1: Webhook wurde gelöscht

**Symptom:**
- Fehler: "Resource not found"
- Webhook-ID existiert nicht mehr in Mattermost

**Lösung:**
- Neuen Webhook erstellen
- Neue URL in n8n eintragen

### Problem 2: URL unvollständig

**Symptom:**
- URL: `https://chat.werdemeisterdeinergedanke.de` (ohne `/hooks/...`)

**Lösung:**
- Vollständige Webhook-URL verwenden: `https://chat.werdemeisterdeinergedanke.de/hooks/xxxxx`

### Problem 3: Falsche Domain

**Symptom:**
- URL zeigt auf falsche Domain
- Oder: HTTP statt HTTPS (oder umgekehrt)

**Lösung:**
- Korrekte Mattermost-URL verwenden
- Prüfe ob HTTPS oder HTTP benötigt wird

### Problem 4: Webhook-ID falsch kopiert

**Symptom:**
- URL sieht korrekt aus, aber Webhook funktioniert nicht

**Lösung:**
- Webhook-URL komplett neu kopieren aus Mattermost
- In n8n komplett neu eintragen (altes löschen)

---

## 📋 Schritt-für-Schritt: Webhook neu erstellen

1. **Mattermost öffnen:** `https://chat.werdemeisterdeinergedanke.de`
2. **Integrations** → **Incoming Webhooks**
3. **Add Incoming Webhook** klicken
4. **Title:** `n8n Scheduled Reports`
5. **Channel:** `#marketing`
6. **Save** klicken
7. **Webhook URL kopieren** (komplett!)
8. **In n8n:** "Send to Mattermost" Node öffnen
9. **URL-Feld:** Alte URL löschen, neue eintragen
10. **Save** klicken
11. **Workflow testen**

---

## ✅ Checkliste

**Mattermost Webhook:**
- [ ] Neuer Webhook erstellt ✅
- [ ] Webhook-URL vollständig kopiert ✅
- [ ] URL beginnt mit `https://chat.werdemeisterdeinergedanke.de/hooks/` ✅
- [ ] URL endet mit Webhook-ID ✅

**n8n Konfiguration:**
- [ ] URL in "Send to Mattermost" Node eingetragen ✅
- [ ] URL ist vollständig (mit `/hooks/...`) ✅
- [ ] JSON Body ist korrekt konfiguriert ✅
- [ ] Workflow gespeichert ✅

**Test:**
- [ ] Workflow ausgeführt ✅
- [ ] Kein "Resource not found" Fehler ✅
- [ ] Nachricht erscheint in Mattermost ✅

---

## 🚨 Falls weiterhin Fehler

### Prüfe Mattermost Webhook direkt:

```bash
# Mit neuer Webhook-URL
curl -X POST https://chat.werdemeisterdeinergedanke.de/hooks/NEUE_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test",
    "channel": "#marketing",
    "username": "Test Bot"
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Nachricht erscheint in Mattermost

**Falls das funktioniert:** Problem ist in n8n URL-Konfiguration
**Falls das nicht funktioniert:** Problem ist mit Mattermost Webhook

---

## ✅ Zusammenfassung

**Problem:** "The resource you are requesting could not be found"

**Ursache:** Mattermost Webhook-URL ist falsch oder Webhook existiert nicht mehr

**Lösung:**
1. Neuen Mattermost Webhook erstellen
2. Vollständige Webhook-URL kopieren
3. URL in n8n eintragen (alte löschen, neue eintragen)
4. Workflow testen

**Wichtig:** Die Webhook-URL muss vollständig sein:
- ✅ `https://chat.werdemeisterdeinergedanke.de/hooks/abc123xyz`
- ❌ `https://chat.werdemeisterdeinergedanke.de` (unvollständig)

---

**Status:** 🔧 **Mattermost Webhook "Not Found" Fix-Anleitung erstellt!**
