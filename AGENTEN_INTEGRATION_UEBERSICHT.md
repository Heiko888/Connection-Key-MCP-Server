# 🔗 Agenten-Integration & Frontend-Anbindung

## 📍 Server-Übersicht

| Server | IP | Services | Status |
|--------|-----|----------|--------|
| **Hetzner MCP Server** | 138.199.237.34 | MCP Agenten (Port 7000), Reading Agent (Port 4001), Docker Services | ✅ Läuft |
| **CK-App Server** | 167.235.224.149 | Next.js Frontend, API Routes | ❓ Unbekannt |

---

## 🔄 Aktuelle Architektur

```
┌─────────────────────────────────────────────────────────┐
│  CK-App Server (167.235.224.149)                        │
│  - Next.js Frontend (www.the-connection-key.de)         │
│  - API Routes (/api/*)                                  │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTPS
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│  Hetzner Server (138.199.237.34)                        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Connection-Key Server (Port 3000)                │  │
│  │ - Zentrale API                                    │  │
│  │ - Auth & Validation                               │  │
│  └──────────────┬───────────────────────────────────┘  │
│                 │                                       │
│                 ├──► ChatGPT-Agent (Port 4000)          │
│                 │    - Chat-Interface                   │
│                 │    - Session-Management               │
│                 │                                       │
│                 ├──► Reading Agent (Port 4001)          │
│                 │    - Human Design Readings           │
│                 │                                       │
│                 └──► MCP Server (Port 7000)            │
│                      ├──► Marketing Agent              │
│                      ├──► Automation Agent             │
│                      ├──► Sales Agent                   │
│                      └──► Social-YouTube Agent          │
└─────────────────────────────────────────────────────────┘
```

---

## ❓ Aktuelle Situation

### 1. **Arbeiten die Agenten mit 167.235.224.149 zusammen?**

**Aktuell: NEIN** ❌

- Die Agenten laufen auf **138.199.237.34** (Hetzner Server)
- Die CK-App läuft auf **167.235.224.149** (anderer Server)
- **Keine direkte Verbindung konfiguriert**

**Was fehlt:**
- API-Routes auf CK-App Server, die die Agenten aufrufen
- CORS-Konfiguration für Cross-Origin Requests
- API-Keys/Authentifizierung zwischen Servern

---

### 2. **Haben die Agenten schon Arbeit aufgenommen?**

**Aktuell: NEIN** ❌

- Agenten laufen, aber **keine Anfragen erhalten**
- Keine Logs von echten Requests
- Keine Integration mit Frontend

**Status:**
- ✅ Agenten laufen (technisch bereit)
- ❌ Keine aktiven Anfragen
- ❌ Keine Frontend-Integration

---

### 3. **Wo werden die Erkenntnisse angezeigt?**

**Aktuell: NIRGENDWO** ❌

- Keine Frontend-Integration vorhanden
- Keine Dashboard/UI für Agent-Ergebnisse
- Ergebnisse werden nur in API-Responses zurückgegeben

**Mögliche Anzeigeorte:**
1. **Frontend (CK-App)**: Noch nicht implementiert
2. **n8n Dashboard**: Könnte Workflows anzeigen
3. **API Responses**: Nur bei direkten API-Aufrufen

---

### 4. **Wird das Frontend durch die Agenten angesprochen?**

**Aktuell: NEIN** ❌

- Frontend ruft Agenten **nicht** auf
- Keine API-Routes auf CK-App Server für Agenten
- Keine Frontend-Komponenten für Agent-Interaktion

**Aktuelle Architektur:**
```
Frontend (167.235.224.149)
    ↓ (fehlt)
Agenten (138.199.237.34)
```

---

## 🔧 Was muss implementiert werden?

### Schritt 1: API-Routes auf CK-App Server

**Erstelle auf CK-App Server (167.235.224.149):**

```typescript
// pages/api/agents/marketing.ts oder app/api/agents/marketing/route.ts
export default async function handler(req, res) {
  const { message } = req.body;
  
  const response = await fetch('http://138.199.237.34:7000/agent/marketing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  
  const data = await response.json();
  return res.json(data);
}
```

**Für alle 5 Agenten:**
- `/api/agents/marketing`
- `/api/agents/automation`
- `/api/agents/sales`
- `/api/agents/social-youtube`
- `/api/agents/reading`

---

### Schritt 2: Frontend-Komponenten

**Erstelle React/Next.js Komponenten:**

```typescript
// components/AgentChat.tsx
export function AgentChat({ agentId }: { agentId: string }) {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  
  const handleSubmit = async () => {
    const res = await fetch(`/api/agents/${agentId}`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    setResponse(data.response);
  };
  
  return (
    <div>
      <input value={message} onChange={e => setMessage(e.target.value)} />
      <button onClick={handleSubmit}>Senden</button>
      <div>{response}</div>
    </div>
  );
}
```

---

### Schritt 3: CORS & Sicherheit

**Auf Hetzner Server (138.199.237.34):**

```bash
# CORS für CK-App Server erlauben
# In connection-key/config.js oder .env:
CORS_ORIGINS=https://www.the-connection-key.de,https://the-connection-key.de
```

**API-Keys für Server-zu-Server Kommunikation:**

```bash
# Auf CK-App Server: API-Key setzen
API_KEY=your-secret-key

# Auf Hetzner Server: API-Key validieren
```

---

### Schritt 4: Reading Agent Integration

**Für Reading Agent (Port 4001):**

```typescript
// pages/api/readings/generate.ts
export default async function handler(req, res) {
  const { birthDate, birthTime, birthPlace, readingType } = req.body;
  
  const response = await fetch('http://138.199.237.34:4001/reading/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      birthDate,
      birthTime,
      birthPlace,
      readingType: readingType || 'detailed'
    })
  });
  
  const data = await response.json();
  return res.json(data);
}
```

---

## 📊 Wo werden Ergebnisse angezeigt?

### Option 1: Frontend-Dashboard (Empfohlen)

**Erstelle auf CK-App:**
- `/coach/agents` - Dashboard für alle Agenten
- `/coach/agents/marketing` - Marketing Agent Interface
- `/coach/agents/automation` - Automation Agent Interface
- `/coach/readings/create` - Reading Generator (bereits vorhanden?)

**Features:**
- Chat-Interface für jeden Agenten
- Ergebnis-Anzeige
- History/Session-Management
- Export-Funktionen

---

### Option 2: n8n Dashboard

**Workflows erstellen:**
- Webhook → Agent → Ergebnis speichern
- Ergebnisse in Supabase/DB speichern
- Dashboard in n8n anzeigen

---

### Option 3: API-Only

**Nur API-Endpoints:**
- Frontend ruft API auf
- Ergebnisse werden direkt angezeigt
- Keine persistente Speicherung

---

## 🚀 Nächste Schritte

### Priorität 1: Reading Agent Integration
1. ✅ Reading Agent läuft (Port 4001)
2. ⚠️ API-Route auf CK-App Server erstellen
3. ⚠️ Frontend-Komponente für Reading-Generator
4. ⚠️ CORS konfigurieren

### Priorität 2: MCP Agenten Integration
1. ✅ MCP Agenten laufen (Port 7000)
2. ⚠️ API-Routes auf CK-App Server erstellen
3. ⚠️ Frontend-Komponenten für jeden Agenten
4. ⚠️ Dashboard erstellen

### Priorität 3: ChatGPT-Agent Integration
1. ✅ ChatGPT-Agent läuft (Port 4000)
2. ⚠️ Connection-Key Server nutzt bereits ChatGPT-Agent
3. ⚠️ Frontend muss Connection-Key API nutzen

---

## ✅ Zusammenfassung

| Frage | Antwort | Status |
|-------|---------|--------|
| **Arbeiten mit 167.235.224.149?** | ❌ Nein, keine Integration | ⚠️ Muss implementiert werden |
| **Haben Agenten Arbeit aufgenommen?** | ❌ Nein, keine Anfragen | ⚠️ Warten auf Integration |
| **Wo werden Erkenntnisse angezeigt?** | ❌ Nirgendwo | ⚠️ Dashboard muss erstellt werden |
| **Wird Frontend angesprochen?** | ❌ Nein | ⚠️ API-Routes fehlen |

**Alle Agenten sind technisch bereit, aber noch nicht mit dem Frontend verbunden!**

