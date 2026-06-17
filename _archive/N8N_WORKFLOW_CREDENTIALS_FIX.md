# 🔧 n8n Workflow Credentials konfigurieren

**Problem:** "Please resolve outstanding issues before you activate it"

**Ursache:** Fehlende Credentials für Supabase und HTTP Header Auth

---

## ✅ Schritt 1: Supabase Credentials erstellen

**Benötigt für:**
- ✅ Save Reading Node
- ✅ Update Reading Job Node  
- ✅ Update Job Failed Node

### 1.1 Credential erstellen

1. **In n8n:** Klicke auf **"Credentials"** (linke Sidebar)
2. Klicke **"+ New Credential"** (oben rechts)
3. Suche nach: **"Supabase"**
4. Wähle: **"Supabase API"**

### 1.2 Credential konfigurieren

**Fülle aus:**

- **Name:** `Supabase API` (oder `Supabase Readings`)
- **Host:** `njjcywgskzepikyzhihy.supabase.co` (deine Supabase URL ohne https://)
- **Service Role Secret:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (dein Service Role Key)

**Wichtig:**
- ✅ Host: **OHNE** `https://` (nur Domain)
- ✅ Service Role Secret: **Vollständiger Key** (beginnt mit `eyJ...`)

### 1.3 Credential speichern

1. Klicke **"Save"**
2. Credential sollte jetzt in der Liste erscheinen

---

## ✅ Schritt 2: HTTP Header Auth Credential erstellen (Optional)

**Benötigt für:**
- ✅ Notify Frontend Node

**Hinweis:** Falls das Frontend keine Authentifizierung benötigt, kann dieser Node auch ohne Auth konfiguriert werden.

### 2.1 Credential erstellen (falls benötigt)

1. **In n8n:** Klicke auf **"Credentials"**
2. Klicke **"+ New Credential"**
3. Suche nach: **"HTTP Header Auth"**
4. Wähle: **"HTTP Header Auth"**

### 2.2 Credential konfigurieren

**Fülle aus:**

- **Name:** `Frontend API Key` (oder passend)
- **Header Name:** `Authorization` (oder `X-API-Key`)
- **Header Value:** `Bearer your-api-key` (oder nur `your-api-key`)

### 2.3 Alternative: Auth deaktivieren

**Falls Frontend keine Auth benötigt:**

1. Öffne **"Notify Frontend"** Node im Workflow
2. Ändere **"Authentication"** von `genericCredentialType` zu `none`
3. Klicke **"Save"**

---

## ✅ Schritt 3: Credentials im Workflow zuweisen

### 3.1 Supabase Nodes konfigurieren

**Für jeden Supabase Node:**

1. Öffne den Workflow **"Reading Generation Workflow"**
2. Klicke auf **"Save Reading"** Node
3. Im Node-Panel:
   - **Credential:** Wähle `Supabase API` (das gerade erstellte Credential)
4. Klicke **"Save"** (Node)

**Wiederhole für:**
- ✅ **"Update Reading Job"** Node
- ✅ **"Update Job Failed"** Node

### 3.2 Notify Frontend Node konfigurieren

**Option A: Mit Auth (falls Credential erstellt):**

1. Öffne **"Notify Frontend"** Node
2. **Authentication:** `genericCredentialType`
3. **Credential:** Wähle `Frontend API Key`
4. Klicke **"Save"**

**Option B: Ohne Auth:**

1. Öffne **"Notify Frontend"** Node
2. **Authentication:** `none`
3. Klicke **"Save"**

---

## ✅ Schritt 4: Workflow aktivieren

### 4.1 Prüfe alle Nodes

**Gehe durch alle Nodes und prüfe:**

- ✅ **Reading Webhook:** Keine Warnung
- ✅ **Validate Payload:** Keine Warnung
- ✅ **Log Start:** Keine Warnung
- ✅ **Call Reading Agent:** Keine Warnung
- ✅ **Prepare Result:** Keine Warnung
- ✅ **Save Reading:** ✅ Credential zugewiesen
- ✅ **Validate Save:** Keine Warnung
- ✅ **Update Reading Job:** ✅ Credential zugewiesen
- ✅ **Log After Update:** Keine Warnung
- ✅ **Notify Frontend:** ✅ Credential zugewiesen ODER Auth = none
- ✅ **Webhook Response:** Keine Warnung
- ✅ **Error Handler:** Keine Warnung
- ✅ **Update Job Failed:** ✅ Credential zugewiesen
- ✅ **Error Response:** Keine Warnung

### 4.2 Workflow speichern

1. Klicke **"Save"** (oben rechts)
2. Warte bis "Saved" angezeigt wird

### 4.3 Workflow aktivieren

1. Klicke **"Activate"** Toggle (oben rechts)
2. Status sollte **"Active"** werden (grün)
3. ✅ **Fertig!**

---

## 🔍 Troubleshooting

### Problem: "Credential is missing"

**Lösung:**
1. Prüfe ob Credential erstellt wurde (Credentials → Liste)
2. Prüfe ob Credential im Node zugewiesen ist
3. Prüfe ob Credential-Name korrekt ist

### Problem: "Invalid Supabase credentials"

**Lösung:**
1. Prüfe Host: **OHNE** `https://`
2. Prüfe Service Role Key: **Vollständig** (beginnt mit `eyJ...`)
3. Prüfe ob Key nicht abgelaufen ist

### Problem: "Cannot connect to Supabase"

**Lösung:**
1. Prüfe Supabase URL ist korrekt
2. Prüfe Service Role Key hat richtige Berechtigungen
3. Prüfe Firewall/Netzwerk-Verbindung

### Problem: "Notify Frontend fails"

**Lösung:**
1. Prüfe Frontend URL ist korrekt
2. Prüfe Auth ist korrekt konfiguriert (oder deaktiviert)
3. Prüfe Endpoint existiert: `/api/notifications/reading`

---

## 📋 Checkliste

**Vor Aktivierung prüfen:**

- [ ] Supabase Credential erstellt
- [ ] Supabase Credential in allen 3 Nodes zugewiesen
- [ ] Notify Frontend Node konfiguriert (mit oder ohne Auth)
- [ ] Alle Nodes zeigen keine roten Warnungen
- [ ] Workflow gespeichert
- [ ] Workflow aktiviert

---

## 🎯 Nächste Schritte

Nach erfolgreicher Aktivierung:

1. **Webhook-URL notieren:**
   - `https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading`

2. **Test durchführen:**
   - Manuell mit "Execute workflow"
   - Oder vom Frontend aus einen Reading-Job erstellen

3. **Logs prüfen:**
   - In n8n → Workflow → Executions
   - Prüfe ob Execution erfolgreich war

---

**Falls Probleme bestehen bleiben, teile mir die genaue Fehlermeldung mit!**
