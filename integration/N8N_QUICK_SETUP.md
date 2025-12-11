# ⚡ n8n Quick Setup - In 5 Minuten

## 🎯 Ziel

Tägliche Marketing-Content-Generierung um 9:00 Uhr

---

## 📋 Schnell-Anleitung

### 1. n8n öffnen
```
https://n8n.werdemeisterdeinergedankenagent.de
```

### 2. Neuer Workflow
- Klicke auf **"New Workflow"**
- Name: **"Marketing Daily"**

### 3. Schedule Trigger
- Ziehe **"Schedule Trigger"** in den Workflow
- Konfiguration:
  - **Cron Expression:** `0 9 * * *`
  - Oder: **Every Day** → **9:00**

### 4. HTTP Request
- Ziehe **"HTTP Request"** in den Workflow
- Verbinde: Schedule → HTTP Request
- Konfiguration:
  ```
  Method: POST
  URL: http://138.199.237.34:7000/agent/marketing
  Body (JSON):
  {
    "message": "Erstelle 5 Social Media Posts für heute"
  }
  ```

### 5. Aktivieren
- Klicke auf **"Active"** (oben rechts)
- ✅ Fertig!

---

## 🧪 Testen

1. Klicke auf **"Execute Workflow"**
2. Prüfe die Response im HTTP Request Node
3. Sollte eine Marketing-Antwort enthalten

---

## 🔄 Weitere Agenten hinzufügen

**Social-YouTube Agent:**
- URL: `http://138.199.237.34:7000/agent/social-youtube`
- Body: `{"message": "Erstelle 3 Reel-Ideen"}`

**Sales Agent:**
- URL: `http://138.199.237.34:7000/agent/sales`
- Body: `{"message": "Erstelle Verkaufstext für Human Design Reading"}`

---

## ✅ Fertig!

Der Workflow wird jetzt täglich um 9:00 automatisch ausgeführt.

