# ✅ n8n Mattermost Workflow - Konfiguration prüfen

**Workflow:** "Agent → Mattermost Notification" (bereits Active ✅)

---

## 📋 Aktueller Status

**Aus dem Screenshot:**
- ✅ Workflow ist **Active** (grün)
- ✅ "Send to Mattermost" Node zeigt: `POST: https://chat.werdemei...`
- ⚠️ URL ist teilweise sichtbar (muss vollständig sein!)

---

## ✅ Konfiguration prüfen

### 1. Mattermost Webhook-URL prüfen

1. **"Send to Mattermost" Node** doppelklicken
2. **URL-Feld prüfen:**
   - Sollte sein: `https://chat.werdemeisterdeinergedanken.de/hooks/tzw3a5godjfpicpu87ixzut39w`
   - Falls unvollständig oder falsch → Korrigieren
3. **Save** klicken

---

### 2. JSON Body prüfen

1. **"Send to Mattermost" Node** öffnen
2. **Specify Body:** Sollte `JSON` sein ✅
3. **JSON Body:** Sollte Expression-Modus sein ({{ }} Button aktiv)
4. **Expression prüfen:**
   ```
   ={{ JSON.stringify({ 
     text: '## 🤖 Agent-Antwort\n\n**Agent:** ' + $('Webhook Trigger').item.json.agentId + '\n**Anfrage:** ' + $('Webhook Trigger').item.json.message + '\n\n---\n\n' + $json.response, 
     channel: '#tech', 
     username: $('Webhook Trigger').item.json.agentId + ' Agent' 
   }) }}
   ```

**Falls nicht konfiguriert:**
- Expression-Modus aktivieren ({{ }} Button)
- Expression eintragen (siehe oben)
- **Save** klicken

---

### 3. "Call Agent" Node prüfen

1. **"Call Agent" Node** öffnen
2. **Prüfe:**
   - **Method:** `POST` ✅
   - **URL:** `http://138.199.237.34:7000/agent/{{ $json.agentId }}` ✅
   - **Send Body:** ✅ **ON**
   - **Body:** Sollte `message` Parameter enthalten

---

## 🧪 Test: Workflow funktioniert

**Webhook-URL:**
```
https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost
```

**Test-Request:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "marketing",
    "message": "Test von curl"
  }'
```

**Erwartung:**
- ✅ Workflow wird ausgeführt
- ✅ "Call Agent" Node wird grün
- ✅ "Send to Mattermost" Node wird grün
- ✅ Nachricht erscheint in Mattermost Channel `#tech`

---

## ✅ Checkliste für diesen Workflow

- [ ] Mattermost URL vollständig und korrekt (`tzw3a5godjfpicpu87ixzut39w`) ✅
- [ ] JSON Body konfiguriert (Expression-Modus) ✅
- [ ] "Call Agent" Node korrekt konfiguriert ✅
- [ ] Workflow gespeichert ✅
- [ ] Workflow aktiviert ✅
- [ ] Getestet ✅

---

## 📋 Nächste Schritte

**Nach diesem Workflow:**

1. **Workflow 2:** "Reading Generation → Mattermost" konfigurieren
2. **Workflow 3:** "Scheduled Agent Reports → Mattermost" konfigurieren

**Siehe:** `N8N_MATTERMOST_AKTIVIERUNG_SCHRITT_FUER_SCHRITT.md`

---

**Status:** ✅ **Konfigurations-Prüfung erstellt!**
