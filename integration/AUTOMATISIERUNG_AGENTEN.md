# 🤖 Agenten automatisch laden und arbeiten lassen

## 📋 Übersicht - Automatisierungs-Optionen

| Methode | Beschreibung | Use Case |
|---------|--------------|----------|
| **1. Systemd/PM2** | Automatischer Start beim Server-Boot | Server-Restart |
| **2. n8n Workflows** | Automatisierte Workflows mit Triggers | Scheduled Tasks, Events |
| **3. Cron Jobs** | Zeitgesteuerte Ausführung | Tägliche/Wöchentliche Tasks |
| **4. Event-Trigger** | Reagiert auf Events (Webhooks, APIs) | Echtzeit-Automatisierung |
| **5. Multi-Agent Pipelines** | Agenten arbeiten in Sequenz | Komplexe Workflows |

---

## 1. 🚀 Automatischer Start beim Server-Boot

### A) MCP Server (Systemd)

**Status:** ✅ Bereits konfiguriert!

Der MCP Server startet automatisch beim Server-Boot:

```bash
# Prüfe Status
systemctl status mcp

# Prüfe ob Auto-Start aktiviert ist
systemctl is-enabled mcp

# Falls nicht aktiviert:
systemctl enable mcp
```

**Service-Datei:** `/etc/systemd/system/mcp.service`

```ini
[Unit]
Description=MCP Multi-Agent Server
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/node /opt/mcp/server.js
Restart=always
RestartSec=10
User=root
Environment=NODE_ENV=production
WorkingDirectory=/opt/mcp

[Install]
WantedBy=multi-user.target
```

### B) Reading Agent (PM2)

**Status:** ✅ Bereits konfiguriert!

Der Reading Agent startet automatisch mit PM2:

```bash
# Prüfe Status
pm2 status reading-agent

# Prüfe ob Auto-Start aktiviert ist
pm2 startup
pm2 save
```

**Start-Script:** `/opt/mcp-connection-key/production/start.sh`

```bash
# PM2 beim Boot starten
pm2 save
pm2 startup
```

### C) Docker Services (Docker Compose)

**Status:** ✅ Bereits konfiguriert!

Docker Services starten automatisch:

```bash
# Prüfe Status
docker ps

# Auto-Start prüfen
docker-compose ps

# Falls nicht aktiviert, in docker-compose.yml:
# restart: unless-stopped (bereits vorhanden)
```

---

## 2. 🔄 n8n Workflows - Automatisierte Agent-Aufrufe

### Workflow 1: Scheduled Marketing Content

**Zweck:** Täglich Marketing-Content generieren

**n8n Workflow:**
```
Schedule Trigger (täglich 9:00)
    ↓
HTTP Request → Marketing Agent
    POST http://138.199.237.34:7000/agent/marketing
    Body: {"message": "Erstelle 5 Social Media Posts für heute"}
    ↓
Transform Data
    ↓
Supabase (Speichern)
    ↓
Slack Notification (Benachrichtigung)
```

**Setup in n8n:**
1. **Schedule Trigger Node:**
   - Cron: `0 9 * * *` (täglich 9:00)
   - Oder: `0 */6 * * *` (alle 6 Stunden)

2. **HTTP Request Node:**
   - Method: POST
   - URL: `http://138.199.237.34:7000/agent/marketing`
   - Authentication: None
   - Body: JSON
   ```json
   {
     "message": "Erstelle 5 Social Media Posts für heute mit Themen: Manifestation, Energie, Human Design"
   }
   ```

3. **Transform Node:**
   - Extrahiere `response` aus Agent-Antwort
   - Formatiere für Speicherung

4. **Supabase Node:**
   - Operation: Insert
   - Table: `agent_responses`
   - Data: `{agent: "marketing", response: "...", created_at: "..."}`

### Workflow 2: Event-basierter Agent-Aufruf

**Zweck:** Agent wird automatisch bei bestimmten Events aufgerufen

**n8n Workflow:**
```
Webhook Trigger
    ↓
IF Node (Event-Typ prüfen)
    ↓
HTTP Request → Entsprechender Agent
    ↓
Response verarbeiten
```

**Setup:**
1. **Webhook Node:**
   - Path: `/webhook/agent-trigger`
   - Method: POST

2. **IF Node:**
   - Condition: `{{ $json.eventType }}`
   - Routes zu verschiedenen Agenten

3. **HTTP Request Nodes:**
   - Marketing Agent: `http://138.199.237.34:7000/agent/marketing`
   - Sales Agent: `http://138.199.237.34:7000/agent/sales`
   - etc.

### Workflow 3: Multi-Agent Pipeline

**Zweck:** Mehrere Agenten arbeiten in Sequenz

**n8n Workflow:**
```
Webhook Trigger
    ↓
Marketing Agent (Strategie)
    ↓
Social-YouTube Agent (Content basierend auf Strategie)
    ↓
Automation Agent (Workflow für Content-Vertrieb)
    ↓
Supabase (Speichern)
```

**Setup:**
1. **HTTP Request → Marketing Agent:**
   ```json
   {
     "message": "Erstelle Marketing-Strategie für neue Kampagne"
   }
   ```

2. **HTTP Request → Social-YouTube Agent:**
   ```json
   {
     "message": "Erstelle Content basierend auf dieser Strategie: {{ $json.response }}"
   }
   ```

3. **HTTP Request → Automation Agent:**
   ```json
   {
     "message": "Erstelle n8n Workflow für automatische Content-Verteilung"
   }
   ```

---

## 3. ⏰ Cron Jobs - Zeitgesteuerte Ausführung

### Tägliche Marketing-Content-Generierung

```bash
# Crontab bearbeiten
crontab -e

# Täglich um 9:00 Marketing-Content generieren
0 9 * * * curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle 5 Social Media Posts für heute"}' \
  > /var/log/marketing-agent-$(date +\%Y-\%m-\%d).log 2>&1
```

### Wöchentliche Sales-Analyse

```bash
# Jeden Montag um 8:00
0 8 * * 1 curl -X POST http://138.199.237.34:7000/agent/sales \
  -H "Content-Type: application/json" \
  -d '{"message": "Analysiere Verkaufszahlen der letzten Woche und erstelle Optimierungsvorschläge"}' \
  > /var/log/sales-agent-$(date +\%Y-\%m-\%d).log 2>&1
```

### Stündliche Content-Updates

```bash
# Alle 6 Stunden
0 */6 * * * curl -X POST http://138.199.237.34:7000/agent/social-youtube \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle 3 neue Reel-Ideen"}' \
  > /var/log/social-agent-$(date +\%Y-\%m-\%d-\%H).log 2>&1
```

---

## 4. 🎯 Event-basierte Trigger

### A) Webhook-Trigger

**Erstelle API-Endpoint für automatische Agent-Aufrufe:**

```typescript
// pages/api/agents/auto-trigger.ts
export default async function handler(req, res) {
  const { eventType, data } = req.body;
  
  // Bestimme Agent basierend auf Event
  let agentId = 'marketing';
  let message = '';
  
  switch (eventType) {
    case 'new_user':
      agentId = 'marketing';
      message = `Erstelle Willkommens-Content für neuen User: ${data.email}`;
      break;
    case 'purchase':
      agentId = 'sales';
      message = `Analysiere Kauf: ${data.product} für ${data.amount}€`;
      break;
    case 'content_request':
      agentId = 'social-youtube';
      message = `Erstelle Content für: ${data.topic}`;
      break;
  }
  
  // Rufe Agent auf
  const response = await fetch(`http://138.199.237.34:7000/agent/${agentId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  
  const result = await response.json();
  
  // Speichere Ergebnis
  // ... Supabase, etc.
  
  return res.json({ success: true, result });
}
```

### B) Database-Trigger

**Supabase Trigger → n8n Webhook → Agent:**

```sql
-- Supabase Function
CREATE OR REPLACE FUNCTION trigger_agent()
RETURNS TRIGGER AS $$
BEGIN
  -- Rufe n8n Webhook auf
  PERFORM net.http_post(
    url := 'https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-trigger',
    body := jsonb_build_object(
      'eventType', 'new_reading',
      'data', row_to_json(NEW)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger erstellen
CREATE TRIGGER new_reading_trigger
AFTER INSERT ON readings
FOR EACH ROW
EXECUTE FUNCTION trigger_agent();
```

---

## 5. 🔗 Multi-Agent Pipeline - Automatisiert

### Pipeline-Script

```bash
#!/bin/bash
# Multi-Agent Pipeline
# Führt mehrere Agenten in Sequenz aus

set -e

MCP_SERVER="http://138.199.237.34:7000"
TOPIC="$1"

echo "🚀 Starte Multi-Agent Pipeline für: $TOPIC"
echo ""

# 1. Marketing Agent - Strategie
echo "1️⃣ Marketing Agent: Erstelle Strategie..."
MARKETING_RESPONSE=$(curl -s -X POST "$MCP_SERVER/agent/marketing" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Erstelle Marketing-Strategie für: $TOPIC\"}")

MARKETING_STRATEGY=$(echo $MARKETING_RESPONSE | jq -r '.response')
echo "✅ Strategie erstellt"
echo ""

# 2. Social-YouTube Agent - Content
echo "2️⃣ Social-YouTube Agent: Erstelle Content..."
SOCIAL_RESPONSE=$(curl -s -X POST "$MCP_SERVER/agent/social-youtube" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Erstelle Social Media Content basierend auf dieser Strategie: $MARKETING_STRATEGY\"}")

SOCIAL_CONTENT=$(echo $SOCIAL_RESPONSE | jq -r '.response')
echo "✅ Content erstellt"
echo ""

# 3. Automation Agent - Workflow
echo "3️⃣ Automation Agent: Erstelle Automatisierung..."
AUTOMATION_RESPONSE=$(curl -s -X POST "$MCP_SERVER/agent/automation" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Erstelle n8n Workflow für automatische Content-Verteilung\"}")

echo "✅ Pipeline abgeschlossen!"
echo ""
echo "📊 Ergebnisse:"
echo "   Strategie: ${#MARKETING_STRATEGY} Zeichen"
echo "   Content: ${#SOCIAL_CONTENT} Zeichen"
echo ""
```

**Verwendung:**
```bash
chmod +x agent-pipeline.sh
./agent-pipeline.sh "Neue Kampagne: Human Design"
```

---

## 6. 📊 Monitoring & Logging

### Agent-Status prüfen

```bash
#!/bin/bash
# agent-status.sh - Prüft Status aller Agenten

echo "🤖 Agent-Status Check"
echo "===================="
echo ""

# MCP Server
echo "📡 MCP Server (Port 7000):"
if curl -s http://138.199.237.34:7000/health > /dev/null; then
    echo "   ✅ Online"
    AGENTS=$(curl -s http://138.199.237.34:7000/agents | jq -r '.agents[].id')
    echo "   Agenten: $AGENTS"
else
    echo "   ❌ Offline"
fi
echo ""

# Reading Agent
echo "📚 Reading Agent (Port 4001):"
if curl -s http://138.199.237.34:4001/health > /dev/null; then
    echo "   ✅ Online"
    HEALTH=$(curl -s http://138.199.237.34:4001/health | jq -r '.status')
    echo "   Status: $HEALTH"
else
    echo "   ❌ Offline"
fi
echo ""

# Systemd Services
echo "⚙️  Systemd Services:"
systemctl is-active mcp > /dev/null && echo "   ✅ MCP Service aktiv" || echo "   ❌ MCP Service inaktiv"
echo ""

# PM2 Processes
echo "🔄 PM2 Processes:"
pm2 list | grep reading-agent && echo "   ✅ Reading Agent läuft" || echo "   ❌ Reading Agent läuft nicht"
echo ""
```

---

## 7. 🎯 Praktische Beispiele

### Beispiel 1: Tägliche Content-Generierung

**n8n Workflow:**
- Trigger: Schedule (täglich 8:00)
- Agent: Marketing → Social-YouTube
- Speichern: Supabase
- Benachrichtigung: E-Mail/Slack

### Beispiel 2: User-Onboarding

**Flow:**
- Neuer User registriert sich
- Webhook → Marketing Agent
- Agent erstellt personalisierten Willkommens-Content
- Content wird per E-Mail gesendet

### Beispiel 3: Sales-Optimierung

**Flow:**
- Wöchentlicher Cron Job
- Sales Agent analysiert Daten
- Erstellt Optimierungsvorschläge
- Speichert in Supabase
- Benachrichtigt Team

---

## ✅ Zusammenfassung

**Automatisierung aktivieren:**

1. ✅ **Server-Boot:** Bereits konfiguriert (Systemd, PM2, Docker)
2. 🔄 **n8n Workflows:** Erstellen Sie Workflows mit Schedule/Webhook Triggers
3. ⏰ **Cron Jobs:** Fügen Sie zeitgesteuerte Tasks hinzu
4. 🎯 **Event-Trigger:** Nutzen Sie Webhooks für Echtzeit-Automatisierung
5. 🔗 **Multi-Agent Pipelines:** Kombinieren Sie Agenten für komplexe Workflows

**Nächste Schritte:**
1. Erstellen Sie n8n Workflows für Ihre Use Cases
2. Richten Sie Cron Jobs für regelmäßige Tasks ein
3. Nutzen Sie Webhooks für Event-basierte Automatisierung

