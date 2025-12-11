# ⚠️ n8n: GET vs POST - Wichtig!

## ❌ Fehler: "Cannot GET /agent/marketing"

Dieser Fehler tritt auf, wenn der HTTP Request Node in n8n auf **GET** statt **POST** eingestellt ist.

---

## ✅ Korrekte n8n Konfiguration

### HTTP Request Node:

**Method:**
- ✅ `POST` (aus Dropdown wählen)
- ❌ NICHT: `GET`

**URL:**
- ✅ `http://138.199.237.34:7000/agent/marketing`

**Send Body:**
- ✅ Aktiviert (Checkbox)

**Body Content Type:**
- ✅ `JSON`

**JSON Body:**
```json
{
  "message": "Erstelle 5 Social Media Posts für heute"
}
```

---

## 🔍 Prüfen Sie Ihre n8n Konfiguration

1. Öffnen Sie den **HTTP Request Node**
2. Prüfen Sie **Method:** Muss `POST` sein!
3. Prüfen Sie **Send Body:** Muss aktiviert sein!
4. Prüfen Sie **Body Content Type:** Muss `JSON` sein!

---

## 📋 Vollständige n8n Konfiguration

```
┌─────────────────────────────────────┐
│ HTTP Request                        │
├─────────────────────────────────────┤
│ Method: POST ✅                     │
│ URL: http://138.199.237.34:7000/   │
│      agent/marketing                 │
│                                     │
│ Authentication: None                │
│                                     │
│ ☑ Send Body ✅                     │
│ Body Content Type: JSON ✅         │
│                                     │
│ JSON Body:                          │
│ {                                   │
│   "message": "..."                  │
│ }                                   │
└─────────────────────────────────────┘
```

---

## ✅ Zusammenfassung

**Problem:** GET-Request wird gesendet  
**Lösung:** Method auf `POST` ändern in n8n HTTP Request Node

**MCP Server akzeptiert:**
- ✅ `POST /agent/:agentId` - Agent ausführen
- ❌ `GET /agent/:agentId` - Funktioniert NICHT (nur POST)

