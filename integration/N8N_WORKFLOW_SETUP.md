# 🔄 n8n Workflow Setup - Agenten automatisch aufrufen

## 🎯 Ziel

Erstellen Sie einen n8n Workflow, der automatisch Agenten aufruft (z.B. täglich um 9:00 Marketing-Content generieren).

---

## 📋 Schritt-für-Schritt Anleitung

### Schritt 1: n8n öffnen

1. Öffnen Sie: `https://n8n.werdemeisterdeinergedankenagent.de`
2. Loggen Sie sich ein (falls nötig)

### Schritt 2: Neuen Workflow erstellen

1. Klicken Sie auf **"New Workflow"** (oben rechts)
2. Geben Sie dem Workflow einen Namen: **"Tägliche Marketing-Content-Generierung"**

### Schritt 3: Schedule Trigger hinzufügen

1. Klicken Sie auf **"+"** (Add Node)
2. Suchen Sie nach **"Schedule Trigger"**
3. Ziehen Sie den Node in den Workflow
4. Klicken Sie auf den Node, um ihn zu konfigurieren

**Konfiguration:**
- **Trigger Times:** Wählen Sie "Every Day"
- **Hour:** `9`
- **Minute:** `0`
- **Oder Cron Expression:** `0 9 * * *` (täglich um 9:00)

**Speichern:** Klicken Sie auf "Execute Node" um zu testen

### Schritt 4: HTTP Request Node hinzufügen

1. Klicken Sie auf **"+"** neben dem Schedule Trigger
2. Suchen Sie nach **"HTTP Request"**
3. Ziehen Sie den Node in den Workflow
4. Verbinden Sie Schedule Trigger → HTTP Request

**Konfiguration:**
- **Method:** `POST`
- **URL:** `http://138.199.237.34:7000/agent/marketing`
- **Authentication:** `None`
- **Send Body:** ✅ Aktivieren
- **Body Content Type:** `JSON`
- **JSON Body:**
  ```json
  {
    "message": "Erstelle 5 Social Media Posts für heute mit Themen: Manifestation, Energie, Human Design"
  }
  ```

**Speichern:** Klicken Sie auf "Execute Node" um zu testen

### Schritt 5: Response verarbeiten (Optional)

1. Fügen Sie einen **"Set" Node** hinzu
2. Konfigurieren Sie:
   - **Keep Only Set Fields:** ✅
   - **Values:**
     - `agent`: `marketing`
     - `response`: `={{ $json.response }}`
     - `created_at`: `={{ $now }}`

### Schritt 6: In Supabase speichern (Optional)

1. Fügen Sie einen **"Supabase" Node** hinzu
2. Konfigurieren Sie:
   - **Operation:** `Insert`
   - **Table:** `agent_responses`
   - **Columns:**
     - `agent`: `={{ $json.agent }}`
     - `response`: `={{ $json.response }}`
     - `created_at`: `={{ $json.created_at }}`

### Schritt 7: Benachrichtigung (Optional)

1. Fügen Sie einen **"Slack"** oder **"Email"** Node hinzu
2. Konfigurieren Sie die Benachrichtigung

### Schritt 8: Workflow aktivieren

1. Klicken Sie auf **"Active"** (oben rechts) um den Workflow zu aktivieren
2. Der Workflow wird jetzt täglich um 9:00 automatisch ausgeführt

---

## 🎨 Workflow-Beispiele

### Beispiel 1: Einfacher Marketing-Agent Workflow

```
Schedule Trigger (täglich 9:00)
    ↓
HTTP Request → Marketing Agent
    POST http://138.199.237.34:7000/agent/marketing
    Body: {"message": "Erstelle 5 Social Media Posts"}
    ↓
Set (Transform)
    ↓
Supabase (Speichern)
```

### Beispiel 2: Multi-Agent Pipeline

```
Webhook Trigger
    ↓
HTTP Request → Marketing Agent
    ↓
HTTP Request → Social-YouTube Agent
    (nutzt Response vom Marketing Agent)
    ↓
HTTP Request → Automation Agent
    ↓
Supabase (Speichern)
```

**Konfiguration Social-YouTube Agent:**
- **URL:** `http://138.199.237.34:7000/agent/social-youtube`
- **Body:**
  ```json
  {
    "message": "Erstelle Social Media Content basierend auf: {{ $json.response }}"
  }
  ```

### Beispiel 3: Event-basierter Workflow

```
Webhook Trigger
    ↓
IF Node (Event-Typ prüfen)
    ├─→ Marketing Agent (wenn eventType = "marketing")
    ├─→ Sales Agent (wenn eventType = "sales")
    └─→ Social-YouTube Agent (wenn eventType = "content")
    ↓
Response verarbeiten
```

---

## 🔧 Verfügbare Agent-Endpoints

| Agent | Endpoint | Use Case |
|-------|----------|----------|
| Marketing | `http://138.199.237.34:7000/agent/marketing` | Marketing-Strategien, Posts |
| Automation | `http://138.199.237.34:7000/agent/automation` | n8n Workflows, APIs |
| Sales | `http://138.199.237.34:7000/agent/sales` | Verkaufstexte, Funnels |
| Social-YouTube | `http://138.199.237.34:7000/agent/social-youtube` | Video-Skripte, Reels |
| Chart Development | `http://138.199.237.34:7000/agent/chart-development` | Chart-Entwicklung |

---

## 📝 Beispiel-Messages für Agenten

### Marketing Agent
```json
{
  "message": "Erstelle 5 Social Media Posts für heute mit Themen: Manifestation, Energie, Human Design"
}
```

### Automation Agent
```json
{
  "message": "Erstelle einen n8n Workflow für automatische Mailchimp-Integration"
}
```

### Sales Agent
```json
{
  "message": "Erstelle einen Verkaufstext für ein Human Design Reading (Preis: 99€)"
}
```

### Social-YouTube Agent
```json
{
  "message": "Erstelle ein YouTube-Video-Skript über Manifestationsblockaden (5-7 Minuten)"
}
```

---

## ✅ Testen des Workflows

### Manuell testen

1. Klicken Sie auf **"Execute Workflow"** (oben rechts)
2. Prüfen Sie die Ausgabe jedes Nodes
3. Bei Fehlern: Prüfen Sie die Logs

### Automatisch testen

1. Aktivieren Sie den Workflow
2. Warten Sie bis zum nächsten Trigger-Zeitpunkt
3. Prüfen Sie die Ausführung in der n8n History

---

## 🔍 Troubleshooting

### Problem: HTTP Request schlägt fehl

**Lösung:**
- Prüfen Sie ob MCP Server läuft: `curl http://138.199.237.34:7000/health`
- Prüfen Sie die URL (muss `/agent/marketing` sein, nicht `/agents/marketing`)
- Prüfen Sie ob CORS aktiviert ist

### Problem: Response ist leer

**Lösung:**
- Prüfen Sie die Body-Struktur (muss `{"message": "..."}` sein)
- Prüfen Sie die Logs im HTTP Request Node
- Prüfen Sie ob OpenAI API Key gesetzt ist

### Problem: Workflow wird nicht ausgeführt

**Lösung:**
- Prüfen Sie ob Workflow aktiviert ist (Active Toggle)
- Prüfen Sie die Schedule-Konfiguration
- Prüfen Sie die n8n Logs

---

## 📊 Workflow-Monitoring

### n8n Execution History

1. Klicken Sie auf **"Executions"** (oben)
2. Sehen Sie alle Workflow-Ausführungen
3. Klicken Sie auf eine Ausführung für Details

### Logs prüfen

1. Klicken Sie auf einen Node
2. Sehen Sie die Input/Output Daten
3. Prüfen Sie Fehler-Messages

---

## 🚀 Nächste Schritte

1. ✅ Erstellen Sie den ersten Workflow (Marketing Agent)
2. 🔄 Erweitern Sie um weitere Agenten
3. 💾 Speichern Sie Ergebnisse in Supabase
4. 📧 Fügen Sie Benachrichtigungen hinzu
5. 🔗 Erstellen Sie Multi-Agent Pipelines

---

## 📚 Weitere Ressourcen

- **n8n Dokumentation:** https://docs.n8n.io
- **Workflow-Beispiele:** `integration/n8n-workflows/agent-automation-workflows.json`
- **Vollständige Anleitung:** `integration/AUTOMATISIERUNG_AGENTEN.md`

