# 🔧 n8n Nodes Konfiguration - Detailliert

**Ziel:** "Get New Subscribers" und "Notify Frontend" Nodes korrekt konfigurieren

---

## 📋 Node 1: "Get New Subscribers" (Supabase)

### Aktueller Status
- ✅ Credentials sind gesetzt: "Supabase account"
- ❌ **Fehlt:** Table, Columns, Filter, etc.

### Schritt 1: Node öffnen

1. **Im Workflow:** Doppelklick auf **"Get New Subscribers"** Node
2. **ODER:** Rechtsklick → **"Edit"**
3. **Node-Dialog öffnet sich**

### Schritt 2: Credentials prüfen

**Im Dialog oben:**
- **Credentials:** Sollte **"Supabase account"** zeigen
- **Falls nicht:** Wähle "Supabase account" aus dem Dropdown

### Schritt 3: Operation prüfen

**Operation:** `Select` ✅ (sollte bereits so sein)

### Schritt 4: Table auswählen

**WICHTIG:** Diese Einstellung fehlt aktuell!

1. **Suche nach:** **"Table"** Feld
2. **Dropdown öffnen**
3. **Wähle eine Tabelle:**
   - **Option 1:** `subscribers` (falls diese Tabelle existiert)
   - **Option 2:** `users` (falls keine `subscribers` Tabelle existiert)
   - **Option 3:** `profiles` (falls vorhanden)

**Wie prüfen welche Tabelle existiert?**
- Öffne Supabase Dashboard
- Gehe zu **Table Editor**
- Schaue welche Tabellen vorhanden sind

**Empfehlung:** Verwende `users` wenn `subscribers` nicht existiert

### Schritt 5: Columns konfigurieren

**Nachdem Table ausgewählt ist:**

1. **Suche nach:** **"Columns"** oder **"Select Columns"** Feld
2. **Optionen:**
   - **"All"** - Alle Spalten (empfohlen für den Anfang)
   - **"Select specific columns"** - Nur bestimmte Spalten

**Für "Select specific columns":**
- Klicke **"Add Column"** für jede Spalte die du brauchst:
  - `id` (wichtig!)
  - `birth_date` (falls vorhanden)
  - `birth_time` (falls vorhanden)
  - `birth_place` (falls vorhanden)
  - `created_at` (wichtig für Filter!)

### Schritt 6: Filter hinzufügen (Optional, aber empfohlen)

**Um nur neue Subscriber zu holen:**

1. **Suche nach:** **"Filter"** oder **"Where"** Sektion
2. **Klicke:** **"Add Filter"** oder **"Add Condition"**
3. **Konfiguriere:**
   - **Column:** `created_at` (oder `createdAt`)
   - **Operator:** `>` (größer als)
   - **Value:** `={{ $now.minus({ days: 1 }) }}` (letzte 24 Stunden)
   - **ODER:** `={{ $now.minus({ hours: 1 }) }}` (letzte Stunde)

**ODER für "noch kein Reading generiert":**
- Prüfe ob User bereits ein Reading hat
- Nur User ohne Reading holen

### Schritt 7: Limit setzen

1. **Suche nach:** **"Limit"** Feld
2. **Trage ein:** `10` (oder wie viele du willst)
3. **Verhindert:** Zu viele Readings auf einmal

### Schritt 8: Order By (Optional)

1. **Suche nach:** **"Order By"** oder **"Sort"** Feld
2. **Column:** `created_at`
3. **Direction:** `DESC` (neueste zuerst)

### Schritt 9: Speichern

1. **Klicke:** **"Save"** (unten rechts)
2. **Prüfe:** Warnsymbol sollte verschwinden

---

## 📋 Node 2: "Notify Frontend" (HTTP Request)

### Aktueller Status
- ✅ URL ist gesetzt
- ✅ Body Parameters sind konfiguriert
- ❌ **Fehlt:** Method (sollte POST sein!)
- ❌ **Fehlt:** Body Content Type

### Schritt 1: Node öffnen

1. **Im Workflow:** Doppelklick auf **"Notify Frontend"** Node
2. **ODER:** Rechtsklick → **"Edit"**
3. **Node-Dialog öffnet sich**

### Schritt 2: Method ändern

**WICHTIG:** Aktuell fehlt die Method-Einstellung!

1. **Suche nach:** **"Method"** Dropdown
2. **Wähle:** **"POST"** (nicht GET!)
3. **GET ist falsch** für Notifications!

### Schritt 3: URL prüfen

**Aktuelle URL:**
```
={{ $env.FRONTEND_URL || 'https://www.the-connection-key.de' }}/api/notifications/reading
```

**Prüfe:**
- ✅ URL sieht korrekt aus
- ⚠️ **Falls `FRONTEND_URL` nicht gesetzt ist:** Wird `https://www.the-connection-key.de` verwendet
- **Besser:** `https://agent.the-connection-key.de` (falls das deine Frontend-URL ist)

**Falls URL ändern:**
1. **URL Feld:** Klicke hinein
2. **Ändere zu:** `https://agent.the-connection-key.de/api/notifications/reading`
3. **ODER:** Setze Environment Variable `FRONTEND_URL`

### Schritt 4: Body Content Type setzen

**WICHTIG:** Aktuell fehlt diese Einstellung!

1. **Suche nach:** **"Body Content Type"** oder **"Content Type"** Dropdown
2. **Wähle:** **"JSON"**
3. **ODER:** **"Form-Data"** (falls API das erwartet)

**Für JSON (Empfohlen):**
- Body Content Type: `JSON`
- Body wird als JSON gesendet

### Schritt 5: Body konfigurieren

**Aktuell verwendest du "Body Parameters" - das ist OK, aber prüfe:**

**Option A: Body Parameters (aktuell)**
- ✅ `readingId`: `={{ $json.readingId }}`
- ✅ `userId`: `={{ $json.userId }}`
- ✅ `readingType`: `basic`
- ✅ `status`: `completed`

**Prüfe:**
- Alle Parameter sind vorhanden
- Werte sind korrekt

**Option B: JSON Body (Alternative)**

**Falls "Body Parameters" nicht funktioniert:**

1. **Body Content Type:** `JSON`
2. **Suche nach:** **"JSON"** Tab oder **"Body"** Feld
3. **Füge ein:**
```json
{
  "readingId": "{{ $json.readingId }}",
  "userId": "{{ $json.userId }}",
  "readingType": "basic",
  "status": "completed",
  "timestamp": "{{ $now }}"
}
```

### Schritt 6: Authentication (Optional)

**Falls deine API einen API-Key braucht:**

1. **Authentication:** Dropdown öffnen
2. **Wähle:** **"Generic Credential Type"** → **"Header Auth"**
3. **Name:** `Authorization`
4. **Value:** `Bearer YOUR_API_KEY`

**ODER:**

1. **Authentication:** **"Generic Credential Type"** → **"Query Auth"**
2. **Name:** `apiKey`
3. **Value:** `YOUR_API_KEY`

**Falls nicht benötigt:** Lasse auf **"None"**

### Schritt 7: Options prüfen

**Suche nach:** **"Options"** Sektion

**Timeout:**
- **Timeout:** `10000` (10 Sekunden) - empfohlen
- Verhindert, dass Request zu lange hängt

**Follow Redirect:**
- ✅ Aktiviert (empfohlen)

**Ignore SSL Issues:**
- ❌ Deaktiviert (nur für Testing)

### Schritt 8: Speichern

1. **Klicke:** **"Save"** (unten rechts)
2. **Prüfe:** Warnsymbol sollte verschwinden

---

## ✅ Checkliste: Nodes konfigurieren

### "Get New Subscribers" Node
- [ ] Credentials: "Supabase account" ausgewählt
- [ ] Operation: `Select`
- [ ] **Table:** `users` oder `subscribers` (WICHTIG - fehlt aktuell!)
- [ ] **Columns:** `All` oder spezifische Spalten
- [ ] **Filter:** Optional, aber empfohlen (z.B. `created_at > letzte 24h`)
- [ ] **Limit:** `10` (oder gewünschte Anzahl)
- [ ] **Order By:** `created_at DESC` (optional)
- [ ] Node gespeichert
- [ ] Warnsymbol verschwunden

### "Notify Frontend" Node
- [ ] **Method:** `POST` (WICHTIG - fehlt aktuell!)
- [ ] URL: Korrekt (`https://agent.the-connection-key.de/api/notifications/reading`)
- [ ] **Body Content Type:** `JSON` (WICHTIG - fehlt aktuell!)
- [ ] Body Parameters: Alle vorhanden (`readingId`, `userId`, `readingType`, `status`)
- [ ] **ODER:** JSON Body korrekt formatiert
- [ ] Authentication: Konfiguriert (falls benötigt)
- [ ] Timeout: `10000` (optional)
- [ ] Node gespeichert
- [ ] Warnsymbol verschwunden

---

## 🧪 Testen

### "Get New Subscribers" Node testen

1. **Node öffnen**
2. **Klicke:** **"Test step"** oder **"Execute Node"** (falls vorhanden)
3. **ODER:** Workflow ausführen und Logs prüfen
4. **Prüfe:** Werden Subscriber gefunden?

### "Notify Frontend" Node testen

1. **Node öffnen**
2. **Klicke:** **"Test step"** (falls vorhanden)
3. **ODER:** Workflow ausführen und Logs prüfen
4. **Prüfe:** Wird Request erfolgreich gesendet?
5. **Prüfe Frontend:** Wird Notification empfangen?

---

## ⚠️ Häufige Probleme

### Problem: "Table not found" bei "Get New Subscribers"

**Ursache:** Table nicht ausgewählt oder falsche Tabelle

**Lösung:**
- Prüfe welche Tabellen in Supabase existieren
- Wähle korrekte Tabelle aus
- Falls `subscribers` nicht existiert: Verwende `users`

### Problem: "Method not allowed" bei "Notify Frontend"

**Ursache:** Method ist GET statt POST

**Lösung:**
- Ändere Method zu `POST`
- Prüfe ob API-Route POST unterstützt

### Problem: "Invalid JSON" bei "Notify Frontend"

**Ursache:** Body Content Type nicht gesetzt oder falsch

**Lösung:**
- Setze Body Content Type zu `JSON`
- Prüfe ob Body korrekt formatiert ist

### Problem: "Connection refused" bei "Notify Frontend"

**Ursache:** URL falsch oder Frontend nicht erreichbar

**Lösung:**
- Prüfe ob Frontend läuft
- Prüfe ob `/api/notifications/reading` Route existiert
- Prüfe URL (mit/ohne `www`)

---

## 🆘 Wenn es nicht funktioniert

**Gib mir Bescheid:**
1. Welcher Node hat Probleme?
2. Welche Fehlermeldung erscheint?
3. Welche Einstellungen hast du vorgenommen?

**Ich helfe dir dann weiter!**

---

**Viel Erfolg! 🚀**

