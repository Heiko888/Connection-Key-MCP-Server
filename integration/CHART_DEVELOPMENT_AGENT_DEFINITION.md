# 📊 Chart Development Agent - Definition

## ✅ Ja, weitere Agenten können erstellt werden!

Der MCP Server ist so konfiguriert, dass neue Agenten einfach hinzugefügt werden können.

---

## 🤖 Agent 6: Chart Development Agent

### Übersicht

| Eigenschaft | Wert |
|-------------|------|
| **ID** | `chart-development` |
| **Name** | Chart Development Agent |
| **Port** | 7000 (über MCP Server) |
| **Server** | Hetzner (138.199.237.34) |
| **API-Route** | `/api/agents/chart-development` |
| **Zweck** | Entwicklung von Human Design Charts, Penta-Analyse Charts, Connection Key Charts |

---

## 📋 Agent-Definition

### 1. Prompt-Datei

**Pfad:** `/opt/ck-agent/prompts/chart-development.txt`

```txt
Du bist der Chart Development Agent.

Deine Spezialgebiete:

📊 Human Design Charts:
- Bodygraph-Entwicklung (SVG/Canvas)
- Zentren-Darstellung (definiert/undefiniert)
- Channels & Gates Visualisierung
- Typ-Darstellung (Generator, Manifestor, Projector, Reflector)
- Authority-Visualisierung
- Profile-Linien (1/3, 2/4, etc.)
- Incarnation Cross Darstellung
- Color, Tone, Base Visualisierung

🔗 Penta-Analyse Charts:
- Penta-Formation Visualisierung
- 5-Personen-Gruppen-Darstellung
- Penta-Typen (Individual, Tribal, Collective)
- Penta-Channels & Gates
- Penta-Dynamik-Diagramme
- Gruppen-Energie-Fluss

🔑 Connection Key Charts:
- Partner-Vergleichs-Charts
- Kompatibilitäts-Matrizen
- Energie-Fluss-Diagramme zwischen Personen
- Synastrie-Charts
- Composite-Charts
- Transit-Analysen

🧮 CHART-BERECHNUNGEN (WICHTIG!):
Du nutzt IMMER die berechneten Chart-Daten als Basis für deine Visualisierungen!

1. Geburtsdaten → Chart-Berechnung:
   - Geburtsdatum (YYYY-MM-DD)
   - Geburtszeit (HH:MM)
   - Geburtsort (für Koordinaten)
   - Nutze Chart-Berechnungs-APIs oder Bibliotheken (z.B. swisseph, human-design-api)
   - Oder n8n Webhook für Chart-Berechnung: `/webhook/chart-calculation`

2. Berechnete Chart-Daten verwenden:
   - Typ (Generator, Manifestor, Projector, Reflector)
   - Definierte/Undefinierte Zentren (9 Zentren)
   - Aktivierte Gates (1-64)
   - Channels (36 Channels)
   - Profile (z.B. 1/3, 2/4)
   - Authority (Sakral, Emotional, Splenic, etc.)
   - Incarnation Cross
   - Defined Centers Array
   - Undefined Centers Array
   - Active Gates Array
   - Active Channels Array
   - Penta Formation (falls 5 Personen)
   - Connection Key Data (falls Partner-Vergleich)

3. Chart-Berechnungs-Integration:
   - Nutze Reading Agent API für Chart-Daten: `http://138.199.237.34:4001/reading/generate`
   - Oder n8n Webhook: `http://138.199.237.34:5678/webhook/chart-calculation`
   - Chart-Daten werden als JSON-Struktur bereitgestellt
   - Diese Daten sind die Basis für alle Visualisierungen

4. Entwicklungs-Workflow:
   a) Chart-Daten abrufen (via API/Webhook)
   b) Daten-Struktur analysieren
   c) Visualisierungskonzept entwickeln
   d) Code für Chart-Komponente generieren
   e) Chart-Daten in Komponente integrieren
   f) Interaktive Elemente hinzufügen
   g) Styling & Farbcodierung
   h) Export-Funktionen implementieren
   - Authority (z.B. Emotional, Sacral, Splenic)
   - Incarnation Cross
   - Color, Tone, Base
   - Penta-Formation (bei 5 Personen)
   - Connection Key (bei Partner-Vergleich)

3. Penta-Berechnungen:
   - Analysiere 5 Chart-Daten
   - Berechne gemeinsame definierte Zentren
   - Identifiziere Penta-Channels
   - Bestimme Penta-Typ (Individual, Tribal, Collective)
   - Visualisiere Gruppen-Energie-Fluss

4. Connection Key Berechnungen:
   - Vergleiche 2 Chart-Daten
   - Berechne Kompatibilität
   - Identifiziere gemeinsame Channels
   - Analysiere Energie-Fluss zwischen Personen
   - Erstelle Synastrie-Matrix

🎨 Technische Anforderungen:
- SVG/Canvas-basierte Visualisierungen
- Responsive Design
- Interaktive Elemente
- Farbcodierung nach Human Design System
- Export-Funktionen (PNG, SVG, PDF)
- Mobile-optimiert
- Nutze berechnete Chart-Daten (nicht nur Visualisierung!)

💻 Entwicklungs-Fokus:
- React/Next.js Komponenten
- D3.js oder Chart.js Integration
- TypeScript-Typen für Chart-Daten
- API-Strukturen für Chart-Generierung
- Chart-Berechnungs-Integration
- Performance-Optimierung
- Accessibility (WCAG)

🔧 Chart-Berechnungs-Integration:
- Nutze Chart-Berechnungs-APIs (z.B. über n8n Webhooks)
- Oder integriere Chart-Berechnungs-Bibliotheken
- Verwende berechnete Daten für Visualisierung
- Entwickle Komponenten die Chart-Daten als Props erhalten

🎯 Deine Arbeitsweise:
1. BERECHNUNG: Nutze Geburtsdaten → Chart-Berechnung (oder erhalte berechnete Daten)
2. ANALYSE: Verstehe berechnete Chart-Daten (Typ, Zentren, Channels, etc.)
3. DESIGN: Erstelle visuelles Konzept basierend auf berechneten Daten
4. ENTWICKLUNG: Generiere Code für Chart-Komponente mit berechneten Daten
5. OPTIMIERUNG: Performance, Responsive, Accessibility
6. DOKUMENTATION: Code-Kommentare, Props, Usage, Datenstruktur

📐 Chart-Typen die du entwickelst:
- Bodygraph Charts (Hauptchart) - basierend auf berechneten Chart-Daten
- Penta Formation Charts - basierend auf 5 berechneten Charts
- Connection Key Compatibility Charts - basierend auf 2 berechneten Charts
- Transit Charts - basierend auf berechneten Transit-Daten
- Composite Charts - basierend auf berechneten Composite-Daten
- Synastrie Charts - basierend auf berechneten Synastrie-Daten
- Timeline Charts - basierend auf berechneten Transit-Daten
- Energy Flow Diagrams - basierend auf berechneten Channel-Daten

📥 Input-Format:
Du erhältst entweder:
- Geburtsdaten (birthDate, birthTime, birthPlace) → du nutzt Chart-Berechnung
- Oder bereits berechnete Chart-Daten (chartData) → du entwickelst Visualisierung

📤 Output-Format:
- React/TypeScript Komponente
- Chart-Konfiguration (JSON)
- Props-Interface (TypeScript)
- Usage-Beispiele
- Erklärung der Datenstruktur

Sprache: Deutsch
Format: Code + Erklärungen + Datenstruktur-Dokumentation
```

---

### 2. Agent-Konfiguration (JSON)

**Pfad:** `/opt/ck-agent/agents/chart-development.json`

```json
{
  "id": "chart-development",
  "name": "Chart Development Agent",
  "description": "Entwickelt Human Design Charts, Penta-Analyse Charts und Connection Key Charts für graphische Darstellung. Spezialisiert auf SVG/Canvas-Visualisierungen, React-Komponenten und interaktive Chart-Entwicklung.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/chart-development.txt",
  "model": "gpt-4",
  "temperature": 0.3,
  "maxTokens": 8000,
  "capabilities": [
    "bodygraph-development",
    "penta-analysis-charts",
    "connection-key-charts",
    "svg-canvas-visualization",
    "react-components",
    "d3-integration",
    "interactive-charts",
    "chart-export"
  ]
}
```

---

### 3. API-Route (für Frontend)

**Pfad:** `integration/api-routes/agents-chart-development.ts`

```typescript
/**
 * API Route für Chart Development Agent
 * Route: /api/agents/chart-development
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const AGENT_ID = 'chart-development';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { message, chartType, chartData, birthDate, birthTime, birthPlace, context } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'message is required and must be a string'
      });
    }

    // Chart-Daten berechnen (falls Geburtsdaten vorhanden)
    let calculatedChartData = chartData || {};
    if (birthDate && birthTime && birthPlace) {
      try {
        // Nutze Reading Agent für Chart-Berechnung
        const readingAgentUrl = process.env.READING_AGENT_URL || 'http://138.199.237.34:4001';
        const chartResponse = await fetch(`${readingAgentUrl}/reading/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            birthDate,
            birthTime,
            birthPlace,
            readingType: 'detailed'
          }),
        });

        if (chartResponse.ok) {
          const chartResult = await chartResponse.json();
          calculatedChartData = chartResult.chartData || calculatedChartData;
        }
      } catch (error) {
        console.warn('Chart-Berechnung fehlgeschlagen, verwende bereitgestellte Daten:', error);
      }
    }

    // Chart Development Agent aufrufen
    const response = await fetch(`${MCP_SERVER_URL}/agent/${AGENT_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message,
        chartType: chartType || 'bodygraph',
        chartData: calculatedChartData,
        birthDate,
        birthTime,
        birthPlace,
        context: context || {}
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Chart Development Agent request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      agent: AGENT_ID,
      message,
      response: data.response,
      chartCode: data.chartCode,
      chartConfig: data.chartConfig,
      chartData: calculatedChartData, // Berechnete Chart-Daten mit zurückgeben
      tokens: data.tokens,
      model: data.model || 'gpt-4',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Chart Development Agent API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
```

---

### 4. Frontend-Komponente (optional)

**Pfad:** `integration/frontend/components/ChartDevelopment.tsx`

```typescript
/**
 * ChartDevelopment Component
 * Komponente für Chart-Entwicklung mit dem Chart Development Agent
 */

'use client';

import { useState } from 'react';

interface ChartDevelopmentProps {
  userId?: string;
}

export function ChartDevelopment({ userId }: ChartDevelopmentProps) {
  const [request, setRequest] = useState('');
  const [chartType, setChartType] = useState('bodygraph');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [response, setResponse] = useState('');
  const [chartCode, setChartCode] = useState('');
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chartTypes = [
    { value: 'bodygraph', label: 'Bodygraph Chart' },
    { value: 'penta', label: 'Penta-Analyse Chart' },
    { value: 'connection-key', label: 'Connection Key Chart' },
    { value: 'composite', label: 'Composite Chart' },
    { value: 'synastrie', label: 'Synastrie Chart' },
    { value: 'transit', label: 'Transit Chart' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request.trim()) return;

    setLoading(true);
    setError(null);
    setResponse('');
    setChartCode('');
    setChartData(null);

    try {
      const res = await fetch('/api/agents/chart-development', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: request,
          chartType,
          birthDate,
          birthTime,
          birthPlace,
          userId: userId || 'anonymous',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Request failed');
      }

      const data = await res.json();
      setResponse(data.response || '');
      setChartCode(data.chartCode || '');
      setChartData(data.chartData || null);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chart-development-container">
      <h2>📊 Chart Development Agent</h2>
      <p>Entwickelt Human Design Charts, Penta-Analyse Charts und Connection Key Charts</p>

      <form onSubmit={handleSubmit} className="chart-development-form">
        <div className="form-group">
          <label htmlFor="chartType">Chart-Typ:</label>
          <select
            id="chartType"
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            disabled={loading}
          >
            {chartTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="birthDate">Geburtsdatum (optional, für Chart-Berechnung):</label>
          <input
            type="date"
            id="birthDate"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="birthTime">Geburtszeit (optional):</label>
          <input
            type="time"
            id="birthTime"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="birthPlace">Geburtsort (optional):</label>
          <input
            type="text"
            id="birthPlace"
            value={birthPlace}
            onChange={(e) => setBirthPlace(e.target.value)}
            placeholder="z.B. Berlin, Germany"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="request">Anfrage:</label>
          <textarea
            id="request"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="z.B. 'Erstelle eine Bodygraph-Komponente mit React und D3.js basierend auf den berechneten Chart-Daten'"
            rows={4}
            disabled={loading}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Entwickelt...' : 'Chart entwickeln'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <h4>Fehler:</h4>
          <p>{error}</p>
        </div>
      )}

      {response && (
        <div className="response-section">
          <h4>Antwort:</h4>
          <pre className="response-content">{response}</pre>
        </div>
      )}

      {chartCode && (
        <div className="chart-code-section">
          <h4>Chart-Code:</h4>
          <pre className="code-content">{chartCode}</pre>
        </div>
      )}

      {chartData && (
        <div className="chart-data-section">
          <h4>Berechnete Chart-Daten:</h4>
          <pre className="data-content">{JSON.stringify(chartData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

---

## 📁 Dateien die erstellt werden müssen

### Auf Hetzner Server:

1. **Prompt-Datei:**
   - `/opt/ck-agent/prompts/chart-development.txt`

2. **Agent-Konfiguration:**
   - `/opt/ck-agent/agents/chart-development.json`

3. **MCP Server erweitern:**
   - Agent zu `/opt/mcp/server.js` hinzufügen (wird automatisch erkannt, wenn JSON-Datei vorhanden ist)

### Im Repository (für Frontend):

4. **API-Route:**
   - `integration/api-routes/agents-chart-development.ts`

5. **Frontend-Komponente (optional):**
   - `integration/frontend/components/ChartDevelopment.tsx`

---

## 🔧 Installation (später)

### Schritt 1: Auf Hetzner Server

```bash
# 1. Prompt-Datei erstellen
cat > /opt/ck-agent/prompts/chart-development.txt << 'PROMPT_END'
[Inhalt der Prompt-Datei siehe oben]
PROMPT_END

# 2. Agent-Konfiguration erstellen
cat > /opt/ck-agent/agents/chart-development.json << 'JSON_END'
[Inhalt der JSON-Datei siehe oben]
JSON_END

# 3. MCP Server neu starten (erkennt neuen Agent automatisch)
systemctl restart mcp

# 4. Prüfen
curl http://localhost:7000/agents | grep chart-development
```

### Schritt 2: Im Repository

```bash
# API-Route hinzufügen
cp integration/api-routes/agents-chart-development.ts pages/api/agents/chart-development.ts

# Frontend-Komponente hinzufügen (optional)
cp integration/frontend/components/ChartDevelopment.tsx components/agents/ChartDevelopment.tsx
```

---

## ✅ Zusammenfassung

**Ja, weitere Agenten können erstellt werden!**

**Chart Development Agent:**
- ✅ Definition erstellt
- ✅ Spezialisiert auf Chart-Entwicklung
- ✅ Unterstützt Bodygraph, Penta, Connection Key Charts
- ✅ Entwickelt React-Komponenten, SVG/Canvas-Visualisierungen
- ⏳ Noch nicht installiert (nur Definition)

**Nächster Schritt:** Wenn Sie möchten, kann ich die Installation durchführen.

