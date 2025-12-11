# 📋 n8n HTTP Request - Exakte Konfiguration

## ✅ Schritt-für-Schritt (Pixel-genau)

### 1. HTTP Request Node öffnen
- Klicken Sie auf den Node im Workflow

### 2. Method
- **Dropdown:** `POST`
- **NICHT:** GET, PUT, DELETE

### 3. URL
- **Eingabefeld:** `http://138.199.237.34:7000/agent/marketing`
- **Wichtig:**
  - ✅ `http://` (nicht https)
  - ✅ `/agent/marketing` (ohne 's' nach agent)
  - ✅ Kein Slash am Ende

### 4. Authentication
- **Dropdown:** `None`
- **NICHT:** Basic Auth, Header Auth, etc.

### 5. Send Body
- **Checkbox:** ✅ Aktivieren
- **Wichtig:** Muss aktiviert sein!

### 6. Body Content Type
- **Dropdown:** `JSON`
- **NICHT:** Form-Data, Raw, etc.

### 7. JSON Body
**Option A: Code-Editor (Empfohlen)**
- Klicken Sie auf "Code" (oben rechts)
- Fügen Sie ein:
```json
{
  "message": "Erstelle 5 Social Media Posts für heute"
}
```

**Option B: UI-Modus**
- Klicken Sie auf "Add Value"
- **Name:** `message`
- **Value:** `Erstelle 5 Social Media Posts für heute`

### 8. Headers (Optional)
- Klicken Sie auf "Add Header"
- **Name:** `Content-Type`
- **Value:** `application/json`

### 9. Speichern
- Klicken Sie auf "Save" oder schließen Sie den Node

### 10. Testen
- Klicken Sie auf "Execute Node" (unten)
- Prüfen Sie die Response

---

## 🎯 Exakte Werte

```
Method: POST
URL: http://138.199.237.34:7000/agent/marketing
Authentication: None
Send Body: ✅ (aktiviert)
Body Content Type: JSON
JSON Body:
{
  "message": "Erstelle 5 Social Media Posts für heute"
}
```

---

## ❌ Was NICHT funktioniert

```
❌ URL: https://138.199.237.34:7000/agent/marketing
❌ URL: http://138.199.237.34:7000/agents/marketing
❌ Send Body: Nicht aktiviert
❌ Body Content Type: Form-Data
❌ Body Content Type: Raw
❌ JSON Body: "message": "..." (ohne geschweifte Klammern)
```

---

## ✅ Was funktioniert

```
✅ URL: http://138.199.237.34:7000/agent/marketing
✅ Send Body: Aktiviert
✅ Body Content Type: JSON
✅ JSON Body: {"message": "..."}
```

