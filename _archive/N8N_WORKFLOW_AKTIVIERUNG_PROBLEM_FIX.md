# 🔧 n8n Workflow Aktivierung - Problem beheben

**Fehler:** "Please resolve outstanding issues before you activate it"

**Ursache:** Ungültige URLs, fehlende Credentials oder Konfigurationsfehler

---

## 🔍 Problem identifizieren

### Schritt 1: Workflow öffnen

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Workflow öffnen** (der nicht aktiviert werden kann)
3. **Alle Nodes durchgehen** - n8n zeigt rote Warnungen bei Problemen

### Schritt 2: Häufige Probleme

**n8n zeigt rote Warnungen bei:**
- ❌ Ungültige URLs (Placeholder-URLs)
- ❌ Fehlende Credentials
- ❌ Ungültige Node-Konfigurationen
- ❌ Fehlende Verbindungen zwischen Nodes

---

## 🔧 Problem 1: Mattermost Webhook-URL ist Placeholder oder unvollständig

**Symptom:** 
- Node "Send to Mattermost" zeigt rote Warnung
- URL: `https://mattermost.ihre-domain.de/hooks/xxxxx` (Placeholder)
- Oder: `https://chat.werdemeisterdeinergedanke` (unvollständig, fehlt `/hooks/...`)
- Fehler: "Bad request - please check your parameters"
- Fehler: "Failed to handle the payload"

**Lösung:**

### Schritt 1: Mattermost Webhook erstellen

1. **Mattermost öffnen**
   - URL: Ihre Mattermost-URL (z.B. `https://mattermost.ihre-domain.de`)
   - Oder: `http://138.199.237.34:8065` (falls auf Hetzner Server)

2. **Incoming Webhook erstellen:**
   - **Integrations** → **Incoming Webhooks**
   - **Add Incoming Webhook** klicken
   - **Title:** `n8n Agent Notifications` (oder passend)
   - **Channel:** `#general` (oder gewünschter Channel)
   - **Save** klicken
   - **Webhook URL kopieren** (Format: `https://mattermost.ihre-domain.de/hooks/xxxxx`)

### Schritt 2: URL in n8n eintragen

1. **Workflow öffnen**
2. **"Send to Mattermost" Node** doppelklicken
3. **URL-Feld:**
   - Ersetzen Sie: `https://mattermost.ihre-domain.de/hooks/xxxxx` (Placeholder)
   - Oder: `https://chat.werdemeisterdeinergedanke` (unvollständig)
   - Mit Ihrer echten Webhook-URL: `https://chat.werdemeisterdeinergedanke.de/hooks/abc123xyz`
4. **Body konfigurieren** (WICHTIG!):
   - **Specify Body:** `JSON` wählen
   - **JSON Body:** `{{ JSON.stringify({ text: '...', channel: '#marketing', username: '...' }) }}`
   - Siehe `N8N_MATTERMOST_BODY_FIX.md` für Details
5. **Save** klicken

### Schritt 3: Für alle Mattermost Workflows wiederholen

**3 Workflows haben Mattermost Nodes:**
1. ✅ "Agent → Mattermost Notification"
2. ✅ "Reading Generation → Mattermost"
3. ✅ "Scheduled Agent Reports → Mattermost"

**Für jeden Workflow:**
- Einen eigenen Mattermost Webhook erstellen (oder denselben verwenden)
- URL in n8n eintragen

---

## 🔧 Problem 2: Fehlende Credentials

**Symptom:**
- Node zeigt rote Warnung: "Credential is missing"
- Häufig bei: Supabase, HTTP Auth, API Keys

**Lösung:**

### Supabase Credentials

1. **In n8n:** **Credentials** → **New Credential**
2. **Wähle:** **Supabase API**
3. **Fülle aus:**
   - **Name:** `Supabase Readings` (oder ähnlich)
   - **URL:** `https://njjcywgskzepikyzhihy.supabase.co` (Ihre Supabase URL)
   - **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (Ihr Service Role Key)
4. **Save** klicken

5. **In Workflow:**
   - Supabase Node öffnen
   - **Credential:** Wähle die erstellten Credentials
   - **Save** klicken

### HTTP Auth Credentials

**Falls benötigt:**
1. **Credentials** → **New Credential**
2. **Wähle:** **HTTP Header Auth** (oder passend)
3. **Fülle aus:**
   - **Name:** `API Key` (oder passend)
   - **Header Name:** `Authorization`
   - **Value:** `Bearer your-api-key`
4. **Save** klicken

---

## 🔧 Problem 3: Ungültige URLs

**Symptom:**
- Node zeigt rote Warnung bei URL
- Häufig: Placeholder-URLs, falsche Ports, falsche Pfade

**Lösung:**

### MCP Server URL prüfen

**Korrekte URLs:**
- ✅ `http://138.199.237.34:7000/agent/marketing`
- ✅ `http://138.199.237.34:7000/agent/automation`
- ✅ `http://138.199.237.34:7000/agent/sales`
- ✅ `http://138.199.237.34:7000/agent/social-youtube`

**Falsche URLs:**
- ❌ `http://localhost:7000/agent/marketing` (funktioniert nicht von n8n)
- ❌ `https://138.199.237.34:7000/agent/marketing` (verwenden Sie `http://`)
- ❌ `http://138.199.237.34:7000/agents/marketing` (muss `/agent/` sein, ohne 's')

### Reading Agent URL prüfen

**Korrekte URL:**
- ✅ `http://138.199.237.34:4001/reading/generate`

**Falsche URLs:**
- ❌ `http://localhost:4001/reading/generate`
- ❌ `https://138.199.237.34:4001/reading/generate`

---

## 🔧 Problem 4: Fehlende Environment Variables

**Symptom:**
- Node verwendet `{{ $env.VARIABLE_NAME }}`, aber Variable ist nicht gesetzt

**Lösung:**

1. **In n8n:** **Settings** → **Environment Variables**
2. **Prüfe ob gesetzt:**
   - `READING_AGENT_URL=http://138.199.237.34:4001`
   - `FRONTEND_URL=https://agent.the-connection-key.de`
   - `N8N_API_KEY=your-api-key` (optional)

3. **Falls nicht gesetzt:**
   - **Add Variable** klicken
   - **Name:** `READING_AGENT_URL`
   - **Value:** `http://138.199.237.34:4001`
   - **Save** klicken

---

## 🔧 Problem 5: Node-Konfiguration fehlt

**Symptom:**
- Node zeigt rote Warnung: "Parameter is missing"
- Fehler: "Bad request - please check your parameters"
- Fehler: "Message is required"

**Lösung:**

### HTTP Request Node (Marketing Agent)

**WICHTIG:** Der Body muss korrekt konfiguriert sein!

**Prüfe:**
- ✅ **Method:** `POST` (aus Dropdown)
- ✅ **URL:** `http://138.199.237.34:7000/agent/marketing` (ohne 's', nicht `/agents/`)
- ✅ **Authentication:** `None` (falls keine Auth benötigt)
- ✅ **Send Body:** Aktiviert (Checkbox) - **WICHTIG!**
- ✅ **Body Content Type:** `JSON`
- ✅ **Specify Body:** `JSON` (nicht "Using Fields Below" mit leeren Feldern!)
- ✅ **JSON Body:** Korrektes JSON mit `message` Feld

**Beispiel Body (JSON):**
```json
{
  "message": "Erstelle 5 Social Media Posts für heute"
}
```

**ODER mit Expression:**
```
={{ JSON.stringify({ message: 'Erstelle 5 Social Media Posts für heute' }) }}
```

**Häufiger Fehler:**
- ❌ "Using Fields Below" gewählt, aber Body Parameters leer
- ❌ Body Content Type nicht auf JSON gesetzt
- ❌ Send Body nicht aktiviert

**Detaillierte Anleitung:** Siehe `N8N_MARKETING_AGENT_BODY_FIX.md`

### Webhook Node

**Prüfe:**
- ✅ **Path:** Korrekt (z.B. `agent-mattermost`)
- ✅ **HTTP Method:** `POST`
- ✅ **Response Mode:** `Last Node` (oder `Respond to Webhook`)

### Schedule Trigger Node

**Prüfe:**
- ✅ **Trigger Times:** Cron-Expression (z.B. `0 9 * * *` = täglich 9:00)
- ✅ **Timezone:** Korrekt

---

## ✅ Schritt-für-Schritt: Workflow aktivieren

### Schritt 1: Alle Probleme beheben

1. **Workflow öffnen**
2. **Alle Nodes durchgehen:**
   - Rote Warnungen beheben
   - Placeholder-URLs ersetzen
   - Fehlende Credentials hinzufügen
   - Node-Konfigurationen prüfen

### Schritt 2: Workflow speichern

1. **Save** klicken (oben rechts)
2. **Prüfe:** Keine roten Warnungen mehr

### Schritt 3: Workflow aktivieren

1. **"Active" Toggle** aktivieren (oben rechts)
2. **Status sollte:** `Active` (grün) werden
3. **Fertig!** ✅

---

## 🧪 Nach der Aktivierung testen

### Agent → Mattermost Workflow

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "marketing",
    "message": "Test"
  }'
```

**Erwartung:**
- ✅ Workflow wird ausgeführt
- ✅ Marketing Agent wird aufgerufen
- ✅ Antwort wird an Mattermost gesendet

---

## 🚨 Falls weiterhin Probleme

### n8n zeigt keine spezifische Fehlermeldung

**Lösung:**
1. **Workflow öffnen**
2. **Jeden Node einzeln prüfen:**
   - Node doppelklicken
   - Prüfe alle Felder
   - Speichern und schließen
3. **Workflow speichern**
4. **Erneut aktivieren versuchen**

### Workflow aktiviert, aber funktioniert nicht

**Lösung:**
1. **Workflow ausführen** (manuell)
2. **Execution Log prüfen:**
   - Welcher Node schlägt fehl?
   - Welche Fehlermeldung?
3. **Node-Konfiguration anpassen**
4. **Erneut testen**

---

## ✅ Checkliste

**Vor der Aktivierung:**
- [ ] Alle Mattermost Webhook-URLs eingetragen (keine Placeholder)
- [ ] Alle MCP Server URLs korrekt (`http://138.199.237.34:7000/agent/...`)
- [ ] Alle Reading Agent URLs korrekt (`http://138.199.237.34:4001/reading/generate`)
- [ ] Alle Credentials konfiguriert (Supabase, etc.)
- [ ] Alle Environment Variables gesetzt
- [ ] Alle Node-Konfigurationen vollständig
- [ ] Keine roten Warnungen im Workflow
- [ ] Workflow gespeichert

**Nach der Aktivierung:**
- [ ] Workflow Status: `Active` (grün)
- [ ] Webhook-URLs werden angezeigt
- [ ] Test-Request erfolgreich
- [ ] Mattermost-Nachrichten kommen an

---

**Status:** 🔧 **Aktivierungsproblem-Fix-Anleitung erstellt!**
