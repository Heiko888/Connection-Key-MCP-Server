# 🔧 Mattermost Webhook - 404 Fehler beheben

**Fehler:** "Failed to handle the payload of media type application/json for incoming webhook 641nxt1nnigjuyg5z44czf6rje"
**Status Code:** 404

**Ursache:** Webhook existiert nicht mehr, wurde gelöscht, ist deaktiviert oder die Webhook-ID ist falsch

---

## ✅ Schritt 1: Webhook in Mattermost prüfen

### In Mattermost:

1. **Mattermost öffnen:** `https://chat.werdemeisterdeinergedanken.de`
2. **Integrations** → **Incoming Webhooks**
3. **Webhook suchen:**
   - Suchen Sie nach Webhook mit ID: `641nxt1nnigjuyg5z44czf6rje`
   - Oder: Suchen Sie nach "n8n Scheduled Reports" (oder passender Name)

**Falls Webhook nicht gefunden:**
- Webhook wurde gelöscht → Neuen erstellen (siehe Schritt 2)

**Falls Webhook gefunden:**
- Webhook öffnen
- Prüfe ob aktiviert ist
- Prüfe ob URL korrekt ist

---

## ✅ Schritt 2: Neuen Webhook erstellen

### Falls Webhook nicht existiert:

1. **Mattermost öffnen:** `https://chat.werdemeisterdeinergedanken.de`
2. **Integrations** → **Incoming Webhooks**
3. **Add Incoming Webhook** klicken
4. **Title:** `n8n Scheduled Reports` (oder passend)
5. **Channel:** `#marketing` (oder gewünschter Channel)
6. **Description:** `Tägliche Marketing-Reports von n8n`
7. **Save** klicken
8. **Webhook URL kopieren** (komplett kopieren!)

**WICHTIG:** Die neue Webhook-ID wird anders sein!

**Format:**
```
https://chat.werdemeisterdeinergedanken.de/hooks/NEUE_WEBHOOK_ID
```

---

## ✅ Schritt 3: Neue URL in n8n eintragen

1. **Workflow öffnen:** "Scheduled Agent Reports → Mattermost"
2. **"Send to Mattermost" Node** doppelklicken
3. **URL-Feld:**
   - Alte URL löschen: `https://chat.werdemeisterdeinergedanken.de/hooks/641nxt1nnigjuyg5z44czf6rje`
   - Neue URL eintragen: `https://chat.werdemeisterdeinergedanken.de/hooks/NEUE_WEBHOOK_ID`
4. **Save** klicken

---

## 🧪 Schritt 4: Neuen Webhook testen

### Mit curl testen:

```bash
# Ersetzen Sie NEUE_WEBHOOK_ID mit der neuen Webhook-ID
curl -X POST https://chat.werdemeisterdeinergedanken.de/hooks/NEUE_WEBHOOK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test von curl",
    "channel": "#marketing",
    "username": "Test Bot"
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK (kein 404!)
- ✅ Nachricht erscheint in Mattermost Channel

**Falls weiterhin 404:**
- Webhook-URL nochmal prüfen
- Webhook in Mattermost prüfen (existiert er wirklich?)

---

## 🔍 Schritt 5: Alle Webhooks prüfen

### In Mattermost:

1. **Integrations** → **Incoming Webhooks**
2. **Alle Webhooks auflisten**
3. **Prüfe:**
   - Welche Webhooks existieren?
   - Welche sind aktiv?
   - Welche IDs haben sie?

**Für jeden n8n Workflow:**
- Finde den passenden Webhook
- Kopiere die komplette URL
- Trage sie in n8n ein

---

## 🚨 Häufige Probleme

### Problem 1: Webhook wurde gelöscht

**Symptom:**
- curl zeigt 404
- Webhook existiert nicht in Mattermost

**Lösung:**
- Neuen Webhook erstellen
- Neue URL in n8n eintragen

### Problem 2: Webhook ist deaktiviert

**Symptom:**
- Webhook existiert, aber curl zeigt 404

**Lösung:**
- In Mattermost: Webhook öffnen
- Prüfe ob aktiviert ist
- Falls nicht: Aktivieren oder neu erstellen

### Problem 3: Falsche Webhook-ID

**Symptom:**
- URL sieht korrekt aus, aber 404

**Lösung:**
- In Mattermost: Webhook öffnen
- Komplette URL neu kopieren
- In n8n komplett neu eintragen

### Problem 4: Mattermost-Konfiguration

**Symptom:**
- Webhook existiert, ist aktiv, aber 404

**Lösung:**
- Mattermost Admin prüfen
- Incoming Webhooks sind aktiviert?
- Firewall/Proxy blockiert?

---

## ✅ Schnell-Fix

**Wenn Webhook 404 zeigt:**

1. **Mattermost öffnen**
2. **Integrations** → **Incoming Webhooks**
3. **Webhook prüfen:**
   - Existiert er? → Falls nicht: Neuen erstellen
   - Ist er aktiv? → Falls nicht: Aktivieren oder neu erstellen
4. **Neuen Webhook erstellen** (falls nötig)
5. **Neue URL kopieren** (komplett!)
6. **In n8n:** URL-Feld leeren, neue URL eintragen
7. **Mit curl testen:** Sollte jetzt 200 OK zeigen
8. **Workflow in n8n testen**

---

## 📋 Checkliste

**Mattermost:**
- [ ] Webhook existiert in Mattermost ✅
- [ ] Webhook ist aktiviert ✅
- [ ] Webhook-URL komplett kopiert ✅
- [ ] URL beginnt mit `https://chat.werdemeisterdeinergedanken.de/hooks/` ✅
- [ ] URL endet mit Webhook-ID ✅

**n8n:**
- [ ] URL in "Send to Mattermost" Node eingetragen ✅
- [ ] URL ist vollständig (mit `/hooks/...`) ✅
- [ ] JSON Body ist korrekt konfiguriert ✅
- [ ] Workflow gespeichert ✅

**Test:**
- [ ] Webhook mit curl getestet → **200 OK** (nicht 404!) ✅
- [ ] Workflow in n8n ausgeführt ✅
- [ ] Kein "Resource not found" Fehler ✅
- [ ] Nachricht erscheint in Mattermost ✅

---

## ✅ Zusammenfassung

**Problem:** curl zeigt 404 → Webhook existiert nicht oder ist deaktiviert

**Lösung:**
1. Mattermost öffnen → Integrations → Incoming Webhooks
2. Webhook prüfen (existiert er? ist er aktiv?)
3. Falls nicht: Neuen Webhook erstellen
4. Neue Webhook-URL kopieren
5. In n8n URL-Feld leeren, neue URL eintragen
6. Mit curl testen → Sollte 200 OK zeigen
7. Workflow in n8n testen

**Wichtig:** Der curl-Test muss **200 OK** zeigen, nicht 404!

---

**Status:** 🔧 **Mattermost Webhook 404-Fix-Anleitung erstellt!**
