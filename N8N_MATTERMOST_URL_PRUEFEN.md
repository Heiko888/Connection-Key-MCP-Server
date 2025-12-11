# 🔍 n8n Mattermost - URL prüfen und korrigieren

**Problem:** Webhooks existieren in Mattermost, aber n8n zeigt "Resource not found"

**Ursache:** URL in n8n ist falsch oder nicht vollständig

---

## ✅ Schritt 1: Mattermost Webhook-URL kopieren

### In Mattermost:

1. **Mattermost öffnen:** `https://chat.werdemeisterdeinergedanke.de`
2. **Integrations** → **Incoming Webhooks**
3. **Webhook finden:** "n8n Scheduled Reports" (oder passender Name)
4. **Webhook öffnen** (klicken)
5. **Webhook URL kopieren** (komplett kopieren!)

**Format sollte sein:**
```
https://chat.werdemeisterdeinergedanke.de/hooks/xxxxx
```

**WICHTIG:** 
- ✅ Komplette URL kopieren (mit `/hooks/` und Webhook-ID)
- ❌ Nicht nur die Domain kopieren
- ❌ Nicht nur die Webhook-ID kopieren

---

## ✅ Schritt 2: URL in n8n prüfen und korrigieren

### In n8n:

1. **Workflow öffnen:** "Scheduled Agent Reports → Mattermost"
2. **"Send to Mattermost" Node** doppelklicken
3. **URL-Feld prüfen:**
   - **Aktuelle URL:** Was steht dort?
   - **Vergleichen:** Stimmt sie mit der kopierten URL überein?

### Häufige Fehler:

**Fehler 1: URL unvollständig**
- ❌ `https://chat.werdemeisterdeinergedanke.de`
- ✅ `https://chat.werdemeisterdeinergedanke.de/hooks/xxxxx`

**Fehler 2: Falsche Webhook-ID**
- ❌ `https://chat.werdemeisterdeinergedanke.de/hooks/abc123` (falsche ID)
- ✅ `https://chat.werdemeisterdeinergedanke.de/hooks/tzw3a5godjfpicpu87ixzut39w` (korrekte ID)

**Fehler 3: Falsche Domain**
- ❌ `https://mattermost.ihre-domain.de/hooks/xxxxx` (falsche Domain)
- ✅ `https://chat.werdemeisterdeinergedanke.de/hooks/xxxxx` (korrekte Domain)

**Fehler 4: HTTP statt HTTPS (oder umgekehrt)**
- ❌ `http://chat.werdemeisterdeinergedanke.de/hooks/xxxxx` (HTTP)
- ✅ `https://chat.werdemeisterdeinergedanke.de/hooks/xxxxx` (HTTPS)

### URL korrigieren:

1. **URL-Feld komplett leeren**
2. **Neue URL eintragen:** Die kopierte URL aus Mattermost
3. **Prüfen:** Stimmt die URL genau überein?
4. **Save** klicken

---

## 🧪 Schritt 3: Webhook direkt testen

### Mit curl testen:

```bash
# Ersetzen Sie xxxxx mit Ihrer Webhook-ID
curl -X POST https://chat.werdemeisterdeinergedanke.de/hooks/xxxxx \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test von curl",
    "channel": "#marketing",
    "username": "Test Bot"
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Nachricht erscheint in Mattermost Channel

**Falls Fehler:**
- Webhook-URL ist falsch → Prüfe URL in Mattermost
- Webhook existiert nicht → Neuen erstellen

**Falls Erfolg:**
- Webhook funktioniert → Problem ist in n8n URL-Konfiguration

---

## ✅ Schritt 4: Alle 3 Workflows prüfen

**3 Mattermost Workflows haben Mattermost Nodes:**

1. **"Agent → Mattermost Notification"**
   - Webhook: Für Agent-Benachrichtigungen
   - Channel: `#general` (oder passend)

2. **"Reading Generation → Mattermost"**
   - Webhook: Für Reading-Benachrichtigungen
   - Channel: `#readings` (oder passend)

3. **"Scheduled Agent Reports → Mattermost"**
   - Webhook: Für Scheduled Reports
   - Channel: `#marketing` (oder passend)

**Für jeden Workflow:**
1. Mattermost Webhook finden
2. Webhook-URL kopieren
3. In n8n "Send to Mattermost" Node öffnen
4. URL prüfen und korrigieren
5. Save

---

## 🔍 Schritt 5: Expression im JSON Body prüfen

**Falls URL korrekt ist, aber Fehler weiterhin auftritt:**

### Prüfe JSON Body Expression:

Die Expression sollte so aussehen:

```
={{ JSON.stringify({ 
  text: '## 📢 Täglicher Marketing-Content generiert!\n\n**Zeit:** ' + $now + '\n\n---\n\n' + ($json.response || 'Content generiert'), 
  channel: '#marketing', 
  username: 'Marketing Agent' 
}) }}
```

**WICHTIG:**
- ✅ Beginnt mit `={{`
- ✅ Endet mit `}}`
- ✅ Strings in einfachen Anführungszeichen `'...'`
- ✅ JSON-Objekt korrekt geschlossen

**Falls Expression falsch:**
- Siehe `N8N_JSON_BODY_VALID_FIX.md`

---

## 📋 Checkliste: URL prüfen

**Mattermost:**
- [ ] Webhook existiert in Mattermost ✅
- [ ] Webhook-URL komplett kopiert ✅
- [ ] URL beginnt mit `https://chat.werdemeisterdeinergedanke.de/hooks/` ✅
- [ ] URL endet mit Webhook-ID ✅

**n8n:**
- [ ] "Send to Mattermost" Node geöffnet ✅
- [ ] URL-Feld komplett geleert ✅
- [ ] Neue URL aus Mattermost eingetragen ✅
- [ ] URL stimmt genau überein ✅
- [ ] Save geklickt ✅

**Test:**
- [ ] Webhook mit curl getestet ✅
- [ ] Workflow in n8n ausgeführt ✅
- [ ] Kein "Resource not found" Fehler ✅

---

## 🚨 Häufige Probleme

### Problem 1: URL nicht vollständig kopiert

**Symptom:**
- URL endet mit `/hooks/` aber ohne Webhook-ID
- Oder: URL zeigt nur Domain

**Lösung:**
- In Mattermost: Webhook öffnen
- Komplette URL kopieren (mit Webhook-ID)
- In n8n komplett neu eintragen

### Problem 2: Falscher Webhook verwendet

**Symptom:**
- URL zeigt auf anderen Webhook (z.B. für anderen Channel)

**Lösung:**
- Richtigen Webhook in Mattermost finden
- Korrekte URL kopieren
- In n8n eintragen

### Problem 3: URL hat Leerzeichen oder Sonderzeichen

**Symptom:**
- URL sieht korrekt aus, aber funktioniert nicht

**Lösung:**
- URL komplett neu kopieren
- Prüfe auf Leerzeichen am Anfang/Ende
- In n8n komplett neu eintragen

### Problem 4: Expression im JSON Body falsch

**Symptom:**
- URL ist korrekt, aber Fehler tritt weiterhin auf

**Lösung:**
- JSON Body Expression prüfen
- Siehe `N8N_JSON_BODY_VALID_FIX.md`

---

## ✅ Schnell-Fix

**Wenn Webhooks existieren, aber n8n zeigt Fehler:**

1. **Mattermost öffnen**
2. **Integrations** → **Incoming Webhooks**
3. **Webhook finden** (für "Scheduled Reports")
4. **Webhook öffnen** → **URL kopieren** (komplett!)
5. **In n8n:** "Send to Mattermost" Node öffnen
6. **URL-Feld:** Alte URL löschen, neue eintragen
7. **Save** klicken
8. **Workflow testen**

---

## ✅ Zusammenfassung

**Problem:** Webhooks existieren, aber "Resource not found" Fehler

**Ursache:** URL in n8n ist falsch oder nicht vollständig

**Lösung:**
1. Mattermost Webhook-URL komplett kopieren
2. In n8n URL-Feld komplett leeren
3. Neue URL eintragen (genau wie in Mattermost)
4. Save & Testen

**Wichtig:** Die URL muss **genau** übereinstimmen mit der URL in Mattermost!

---

**Status:** 🔍 **Mattermost URL-Prüfungs-Anleitung erstellt!**
