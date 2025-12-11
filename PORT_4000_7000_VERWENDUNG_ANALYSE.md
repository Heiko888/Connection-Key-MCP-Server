# 🔍 Port 4000 & 7000: Detaillierte Verwendungs-Analyse

**Datum:** 24.12.2025  
**Ziel:** Klärung, wie Port 4000 und 7000 genau verwendet werden sollen

---

## 📊 ENDPOINT-ÜBERSICHT

### Port 4000: CK-Agent (chatgpt-agent)

**Status:** ✅ Läuft (Docker Container)

**Endpoints:**
- `GET /health` - Health Check
- `POST /chat` - Chat-Nachricht verarbeiten
- `POST /reading/generate` - **Reading direkt generieren** ✅
- `POST /matching` - Partner-Matching
- `GET /session/:userId` - Session-Info
- `DELETE /session/:userId` - Session löschen

**Reading-Generierung:**
```typescript
POST /reading/generate
Headers: {
  'Content-Type': 'application/json',
  'x-agent-key': '<secret>'  // Auth erforderlich
}
Body: {
  userId: string,
  birthDate: string,      // Format: "YYYY-MM-DD"
  birthTime: string,     // Format: "HH:MM"
  birthPlace: string,    // Format: "Stadt, Land"
  readingType?: string   // Optional: "detailed", "basic", etc.
}
```

**Response:**
```typescript
{
  success: boolean,
  reading: string,      // Generierter Reading-Text
  readingId?: string,
  tokens?: number,
  timestamp: string
}
```

**Authentifizierung:**
- Header: `x-agent-key`
- Variable: `CK_AGENT_SECRET` oder `AGENT_SECRET`

---

### Port 7000: MCP-Server (mcp-server.service)

**Status:** ✅ Läuft (systemd Service)

**Endpoints:**
- `GET /agents/reading` - Health Check (ohne Auth)
- `POST /agents/reading` - **Reading generieren** (mit Auth)
- `POST /agents/run` - Multi-Agent Orchestrator (mit Auth)
- `GET /agents/jobs/:id` - Job-Status (mit Auth)
- `POST /agent/:agentId` - **Andere Agenten** (marketing, sales, etc.)

**Reading-Generierung:**
```typescript
POST /agents/reading
Headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <token>'  // Auth erforderlich
}
Body: {
  chart: {
    type: string,           // "Generator", "Manifestor", etc.
    profile: string,       // "1/3", "2/4", etc.
    authority: string,      // "Sacral", "Emotional", etc.
    strategy: string,       // "Wait to respond", etc.
    planets: object,       // Planetenpositionen
    gates: {
      defined: number[],    // [1, 8, 12, ...]
      undefined: number[]
    },
    channels: object,       // Channels-Informationen
    centers: object,       // Zentren-Informationen
    // ... vollständiges Chart-Objekt
  },
  readingType: string      // "default" | "detailed" | "business" | "relationship"
}
```

**Response:**
```typescript
{
  success: boolean,
  reading: string,         // Generierter Reading-Text
  chart?: object,          // Chart-Daten (optional)
  tokens?: number,
  timestamp: string
}
```

**Andere Agenten:**
```typescript
POST /agent/{agentId}      // z.B. /agent/marketing, /agent/sales
Headers: {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <token>'  // Auth erforderlich
}
Body: {
  message: string,
  userId?: string
}
```

**Authentifizierung:**
- Header: `Authorization: Bearer <token>`
- Erforderlich für POST-Requests

---

## 🔍 UNTERSCHIEDE

| Aspekt | Port 4000 (CK-Agent) | Port 7000 (MCP-Server) |
|--------|---------------------|------------------------|
| **Endpoint** | `/reading/generate` | `/agents/reading` |
| **Request Format** | `{ birthDate, birthTime, birthPlace, readingType }` | `{ chart, readingType }` |
| **Chart-Berechnung** | ✅ Intern (Agent berechnet Chart) | ❌ Muss vorher berechnet werden |
| **Auth** | `x-agent-key` | `Authorization: Bearer <token>` |
| **Verwendung** | Direkte Reading-Generierung | Reading mit Chart-Objekt |

---

## 🎯 VERWENDUNGS-EMPFEHLUNG

### Port 4000 (CK-Agent) - Für Standard-Readings

**Verwendung:**
- Wenn nur Geburtsdaten vorhanden sind
- Chart-Berechnung erfolgt intern im Agent
- Einfacher Aufruf ohne Chart-Berechnung

**Code:**
```typescript
const READING_AGENT_URL = process.env.READING_AGENT_URL || 'http://138.199.237.34:4000';

response = await fetch(`${READING_AGENT_URL}/reading/generate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-agent-key': process.env.CK_AGENT_SECRET || process.env.AGENT_SECRET || ''
  },
  body: JSON.stringify({
    userId: data?.userId || 'anonymous',
    birthDate: data?.birthDate,
    birthTime: data?.birthTime,
    birthPlace: data?.birthPlace,
    readingType: readingType
  })
});
```

---

### Port 7000 (MCP-Server) - Für Erweiterte Readings

**Verwendung:**
- Wenn Chart bereits berechnet ist
- Für erweiterte Reading-Typen (business, relationship)
- Einheitliche Konfiguration über MCP

**Code:**
```typescript
const READING_AGENT_URL = process.env.READING_AGENT_URL || 'http://138.199.237.34:7000';
const N8N_BASE_URL = process.env.N8N_BASE_URL || 'https://n8n.werdemeisterdeinergedankenagent.de';

// 1. Chart aus Geburtsdaten berechnen (über n8n)
const chartResponse = await fetch(`${N8N_BASE_URL}/webhook/chart-calculation`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    birthDate: data?.birthDate,
    birthTime: data?.birthTime,
    birthPlace: data?.birthPlace
  })
});
const chartData = await chartResponse.json();

// 2. Reading mit Chart generieren
response = await fetch(`${READING_AGENT_URL}/agents/reading`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.READING_AGENT_TOKEN || ''}`
  },
  body: JSON.stringify({
    chart: chartData,
    readingType: readingType
  })
});
```

---

## 📋 EMPFOHLENE LÖSUNG

### Option 1: Port 4000 als Standard (Einfach)

**Vorteile:**
- Einfacher Aufruf (nur Geburtsdaten)
- Chart-Berechnung erfolgt intern
- Keine zusätzliche Chart-Berechnung nötig

**Nachteile:**
- Auth-Header (`x-agent-key`) erforderlich
- Endpoint: `/reading/generate` (passt zum Code)

**Aktion:**
1. Code auf Port 4000 ändern ✅ (bereits erledigt)
2. Endpoint bleibt `/reading/generate` ✅
3. Auth-Header hinzufügen
4. Request-Format bleibt gleich ✅

---

### Option 2: Port 7000 als Standard (Erweitert)

**Vorteile:**
- Einheitliche Konfiguration über MCP
- Erweiterte Reading-Typen möglich
- Chart-Daten können wiederverwendet werden

**Nachteile:**
- Chart muss vorher berechnet werden (n8n Webhook)
- Endpoint ändern: `/reading/generate` → `/agents/reading`
- Request-Format ändern: Geburtsdaten → Chart-Objekt
- Auth-Header (`Authorization`) erforderlich

**Aktion:**
1. Code auf Port 7000 ändern ✅ (bereits erledigt)
2. Endpoint ändern: `/agents/reading`
3. Chart-Berechnung implementieren (n8n Webhook)
4. Request-Format anpassen
5. Auth-Header hinzufügen

---

### Option 3: Beide parallel (Flexibel)

**Verwendung:**
- Port 4000: Standard-Readings (einfach, schnell)
- Port 7000: Erweiterte Readings (mit Chart, komplexer)

**Code:**
```typescript
// Fallback-Logik
const USE_MCP = process.env.USE_MCP_READING === 'true';

if (USE_MCP) {
  // Port 7000: Chart berechnen + Reading generieren
  // ... (siehe Option 2)
} else {
  // Port 4000: Direkte Reading-Generierung
  // ... (siehe Option 1)
}
```

---

## 🎯 EMPFEHLUNG

**Basierend auf Code-Analyse:**

**Port 4000 (CK-Agent) sollte verwendet werden für:**
- Standard-Readings
- Einfache Reading-Generierung
- Wenn Chart-Berechnung nicht benötigt wird

**Port 7000 (MCP-Server) sollte verwendet werden für:**
- Erweiterte Readings (business, relationship)
- Wenn Chart bereits berechnet ist
- Einheitliche Agent-Konfiguration

**Aktueller Code zeigt auf Port 7000** (bereits geändert), aber:
- Endpoint muss angepasst werden: `/reading/generate` → `/agents/reading`
- Request-Format muss angepasst werden: Chart-Berechnung hinzufügen
- Auth-Header muss hinzugefügt werden

---

## 📝 NÄCHSTE SCHRITTE

1. **Entscheidung:** Port 4000 oder 7000 als Standard?
2. **Code anpassen:** Endpoint, Format, Auth
3. **Frontend API-Route deployen**
4. **Tests durchführen**
