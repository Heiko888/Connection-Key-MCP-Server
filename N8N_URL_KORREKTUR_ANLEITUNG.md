# 🔧 n8n URLs korrigieren - Schnelle Anleitung

**Problem:** URLs werden falsch angezeigt oder formatiert in n8n

**Lösung:** URLs manuell in jedem HTTP Request Node korrigieren

---

## 🎯 Schritt-für-Schritt: URLs korrigieren

### Für jeden HTTP Request Node im Workflow:

1. **Node öffnen** (doppelklicken auf den Node)
2. **URL-Feld prüfen:**
   - ❌ Falsch: `http://138.199.237:34:7...`
   - ✅ Richtig: `http://138.199.237.34:7000/agent/marketing`
3. **URL korrigieren:**
   - Alte URL löschen
   - Neue URL eintragen (siehe Liste unten)
4. **Save** klicken

---

## 📋 Korrekte URLs für jeden Agent

### Marketing Agent
```
http://138.199.237.34:7000/agent/marketing
```

### Social-YouTube Agent
```
http://138.199.237.34:7000/agent/social-youtube
```

### Automation Agent
```
http://138.199.237.34:7000/agent/automation
```

### Reading Agent
```
http://138.199.237.34:4001/reading/generate
```

---

## 🔧 Multi-Agent Pipeline - Alle Nodes korrigieren

### 1. Marketing Agent Node
- **URL:** `http://138.199.237.34:7000/agent/marketing`
- **Method:** POST
- **Body Parameter:**
  - Name: `message`
  - Value: `={{ $json.body.topic ? 'Erstelle Marketing-Strategie für: ' + $json.body.topic : 'Erstelle Marketing-Strategie' }}`

### 2. Social-YouTube Agent Node
- **URL:** `http://138.199.237.34:7000/agent/social-youtube`
- **Method:** POST
- **Body Parameter:**
  - Name: `message`
  - Value: `={{ 'Erstelle Social Media Content basierend auf dieser Strategie: ' + $json.response }}`

### 3. Automation Agent Node
- **URL:** `http://138.199.237.34:7000/agent/automation`
- **Method:** POST
- **Body Parameter:**
  - Name: `message`
  - Value: `Erstelle n8n Workflow für automatische Content-Verteilung`

---

## ✅ Nach der Korrektur

1. **Workflow speichern** (Ctrl+S oder Save Button)
2. **"Active" Toggle** aktivieren (falls noch nicht aktiv)
3. **Prüfen:** Keine roten Markierungen mehr
4. **Testen:** Webhook-URL kopieren und testen

---

## 🧪 Testen

**Webhook-URL kopieren** (aus Webhook Trigger Node)

**Test:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/content-pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Human Design Manifestation"
  }'
```

**In n8n prüfen:**
- Workflow öffnen
- **"Executions" Tab** (unten)
- Sollte eine Ausführung zeigen

---

## ⚠️ Wichtig

**URL-Format:**
- ✅ `http://138.199.237.34:7000/agent/marketing`
- ❌ `http://138.199.237:34:7000/agent/marketing` (falsch - Doppelpunkt statt Punkt)
- ❌ `http://138.199.237.34:7...` (falsch - abgeschnitten)

**Expression-Format:**
- ✅ `={{ 'Text ' + $json.response }}`
- ❌ `=Text {{ $json.response }}` (falsch - keine Expression-Syntax)

---

**Status:** ✅ Korrektur-Anleitung erstellt!

