# 🤖 Agenten-Automatisierung - Vollständiger Guide

## 📋 Übersicht

Sie können die Agenten auf verschiedene Weise automatisieren:

1. **n8n Workflows** - Visuelle Automatisierung
2. **API-Integration** - Direkte API-Calls
3. **Multi-Agent-Workflows** - Agenten in Sequenz
4. **Scheduled Tasks** - Zeitgesteuerte Ausführung
5. **Event-basierte Trigger** - Reaktion auf Events

---

## 1. 🎯 n8n Workflows für Agenten

### Workflow 1: Marketing Agent - Automatische Social Media Posts

**Trigger:** Zeitgesteuert (täglich um 9:00 Uhr)

**Workflow:**
```
1. Schedule Trigger (täglich 9:00)
   ↓
2. HTTP Request → Marketing Agent
   POST http://138.199.237.34:7000/agent/marketing
   Body: {"message": "Erstelle 3 Instagram Posts für heute"}
   ↓
3. Split Posts (falls mehrere)
   ↓
4. Instagram API → Post erstellen
   ODER
   Buffer/Social Media Tool → Post planen
```

**n8n Konfiguration:**
- **HTTP Request Node:**
  - Method: `POST`
  - URL: `http://138.199.237.34:7000/agent/marketing`
  - Body: JSON
  ```json
  {
    "message": "Erstelle 3 Instagram Posts für heute zum Thema Human Design"
  }
  ```

### Workflow 2: Reading Agent - Automatische Reading-Generierung

**Trigger:** Webhook (wenn neuer User sich registriert)

**Workflow:**
```
1. Webhook Trigger (von Next.js App)
   Body: {birthDate, birthTime, birthPlace, userId}
   ↓
2. HTTP Request → Reading Agent
   POST http://138.199.237.34:4001/reading/generate
   Body: {birthDate, birthTime, birthPlace, readingType: "basic"}
   ↓
3. Supabase → Reading speichern
   ODER
4. E-Mail → Reading an User senden
```

**n8n Konfiguration:**
- **Webhook Node:**
  - Path: `/webhook/new-user-reading`
  - Method: `POST`
- **HTTP Request Node:**
  - Method: `POST`
  - URL: `http://138.199.237.34:4001/reading/generate`
  - Body: JSON
  ```json
  {
    "birthDate": "{{ $json.birthDate }}",
    "birthTime": "{{ $json.birthTime }}",
    "birthPlace": "{{ $json.birthPlace }}",
    "readingType": "basic",
    "userId": "{{ $json.userId }}"
  }
  ```

### Workflow 3: Multi-Agent-Pipeline - Content-Erstellung

**Trigger:** Manuell oder Zeitgesteuert

**Workflow:**
```
1. Trigger
   ↓
2. Marketing Agent → Erstelle Content-Ideen
   POST /agent/marketing
   {"message": "Erstelle 5 Content-Ideen für diese Woche"}
   ↓
3. Social-YouTube Agent → Erstelle Video-Skripte
   POST /agent/social-youtube
   {"message": "Erstelle YouTube-Skript für: {{ $json.response }}"}
   ↓
4. Automation Agent → Erstelle n8n Workflow
   POST /agent/automation
   {"message": "Erstelle n8n Workflow für automatische Post-Verteilung"}
   ↓
5. Supabase → Speichere alle Ergebnisse
```

### Workflow 4: Chart Development Agent - Automatische Chart-Erstellung

**Trigger:** Webhook (wenn Chart angefordert wird)

**Workflow:**
```
1. Webhook Trigger
   Body: {birthDate, birthTime, birthPlace, chartType}
   ↓
2. Reading Agent → Chart-Daten berechnen
   POST http://138.199.237.34:4001/reading/generate
   ↓
3. Chart Development Agent → Chart entwickeln
   POST http://138.199.237.34:7000/agent/chart-development
   Body: {message, chartData, chartType}
   ↓
4. Supabase → Chart speichern
   ODER
5. E-Mail → Chart an User senden
```

---

## 2. 🔄 API-Integration für Automatisierung

### Direkte API-Calls (curl, Python, etc.)

**Beispiel: Python Script**

```python
import requests
import json

# Marketing Agent
def call_marketing_agent(message):
    url = "http://138.199.237.34:7000/agent/marketing"
    response = requests.post(url, json={"message": message})
    return response.json()

# Reading Agent
def call_reading_agent(birth_date, birth_time, birth_place):
    url = "http://138.199.237.34:4001/reading/generate"
    response = requests.post(url, json={
        "birthDate": birth_date,
        "birthTime": birth_time,
        "birthPlace": birth_place,
        "readingType": "detailed"
    })
    return response.json()

# Multi-Agent-Pipeline
def create_content_pipeline():
    # 1. Marketing Agent
    ideas = call_marketing_agent("Erstelle 5 Content-Ideen")
    
    # 2. Social-YouTube Agent
    for idea in ideas['response'].split('\n'):
        script = call_social_youtube_agent(f"Erstelle Skript für: {idea}")
        print(script)
```

### Scheduled Tasks (Cron)

**Beispiel: Tägliche Content-Erstellung**

```bash
# Crontab-Eintrag
0 9 * * * curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle 3 Social Media Posts für heute"}' \
  | jq -r '.response' > /var/www/content/$(date +\%Y-\%m-\%d).txt
```

---

## 3. 🔗 Automatisierungsmöglichkeiten

### A) n8n Workflows

**Verfügbare Trigger:**
- **Schedule** - Zeitgesteuert (täglich, wöchentlich, etc.)
- **Webhook** - HTTP-Requests von anderen Apps
- **Email** - E-Mail-Trigger
- **Database** - Supabase/PostgreSQL Trigger
- **Manual** - Manuelle Auslösung

**Verfügbare Actions:**
- **HTTP Request** - Agenten aufrufen
- **Supabase** - Daten speichern
- **Email** - E-Mails senden
- **Slack/Discord** - Notifications
- **Google Sheets** - Daten exportieren
- **Social Media APIs** - Posts erstellen

### B) Next.js API Routes

**Beispiel: Automatische Reading-Generierung bei Registrierung**

```typescript
// pages/api/users/register.ts
export default async function handler(req, res) {
  // User registrieren
  const user = await createUser(req.body);
  
  // Reading automatisch generieren
  const reading = await fetch('http://138.199.237.34:4001/reading/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      birthPlace: user.birthPlace,
      readingType: 'basic',
      userId: user.id
    })
  });
  
  // Reading speichern
  await saveReading(user.id, await reading.json());
  
  return res.json({ success: true, user, reading });
}
```

### C) Supabase Functions/Triggers

**Beispiel: Automatische Reading-Generierung bei User-Erstellung**

```sql
-- Supabase Function
CREATE OR REPLACE FUNCTION generate_reading_on_user_create()
RETURNS TRIGGER AS $$
BEGIN
  -- HTTP Request zu Reading Agent
  PERFORM net.http_post(
    url := 'http://138.199.237.34:4001/reading/generate',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := json_build_object(
      'birthDate', NEW.birth_date,
      'birthTime', NEW.birth_time,
      'birthPlace', NEW.birth_place,
      'readingType', 'basic',
      'userId', NEW.id
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER user_reading_trigger
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION generate_reading_on_user_create();
```

---

## 4. 📊 Multi-Agent-Workflows

### Workflow: Content-Erstellung Pipeline

```
1. Marketing Agent
   → Erstellt Content-Ideen
   ↓
2. Social-YouTube Agent
   → Erstellt Video-Skripte
   ↓
3. Sales Agent
   → Erstellt Sales-Copy
   ↓
4. Automation Agent
   → Erstellt n8n Workflow für Verteilung
   ↓
5. Supabase
   → Speichert alle Ergebnisse
```

**n8n Workflow:**
- **Node 1:** HTTP Request → Marketing Agent
- **Node 2:** HTTP Request → Social-YouTube Agent (nutzt Output von Node 1)
- **Node 3:** HTTP Request → Sales Agent
- **Node 4:** HTTP Request → Automation Agent
- **Node 5:** Supabase → Speichern

---

## 5. ⏰ Scheduled Tasks

### Tägliche Automatisierungen

**Beispiel: Tägliche Content-Erstellung**

```bash
# Crontab
0 9 * * * /opt/scripts/daily-content.sh
```

**Script: `/opt/scripts/daily-content.sh`**
```bash
#!/bin/bash

# Marketing Agent - Content-Ideen
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle 5 Content-Ideen für heute"}' \
  > /var/www/content/ideas-$(date +%Y-%m-%d).json

# Social-YouTube Agent - Video-Skripte
curl -X POST http://138.199.237.34:7000/agent/social-youtube \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle YouTube-Skript für Human Design"}' \
  > /var/www/content/scripts-$(date +%Y-%m-%d).json
```

---

## 6. 🎯 Best Practices

### 1. Error Handling

```javascript
try {
  const response = await fetch('http://138.199.237.34:7000/agent/marketing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  
  if (!response.ok) {
    throw new Error(`Agent request failed: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Agent Error:', error);
  // Fallback oder Retry-Logik
}
```

### 2. Rate Limiting

- **MCP Server:** Max. 10 Requests/Sekunde
- **Reading Agent:** Max. 5 Requests/Sekunde
- **n8n:** Nutzen Sie Delay-Nodes zwischen Requests

### 3. Caching

- **Speichern Sie Agent-Responses** in Supabase
- **Nutzen Sie Cache** für wiederkehrende Anfragen
- **Vermeiden Sie doppelte Requests**

---

## 📋 Zusammenfassung

**Verfügbare Automatisierungen:**
1. ✅ n8n Workflows (visuell, einfach)
2. ✅ API-Integration (flexibel, programmierbar)
3. ✅ Scheduled Tasks (zeitgesteuert)
4. ✅ Event-basierte Trigger (reaktiv)
5. ✅ Multi-Agent-Workflows (komplexe Pipelines)

**Nächste Schritte:**
- Erstellen Sie n8n Workflows für Ihre Use Cases
- Nutzen Sie API-Integration für Custom-Lösungen
- Implementieren Sie Scheduled Tasks für wiederkehrende Aufgaben

