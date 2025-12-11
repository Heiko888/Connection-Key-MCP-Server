# 📘 Workbook-Schnittstelle - Implementierung

**Datum:** 17.12.2025

**Ziel:** Praktische Implementierung der Workbook-Schnittstelle

---

## 🚀 Schritt 1: API-Route erstellen

### Frontend-API-Route (Next.js)

**Datei:** `integration/api-routes/workbook/chart-data/route.ts`

```typescript
/**
 * API Route für Workbook Chart-Daten
 * Route: /api/workbook/chart-data
 */

import type { NextRequest, NextResponse } from 'next/server';

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://138.199.237.34:7000';
const CHART_ARCHITECT_AGENT_ID = 'chart-architect-agent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chartType, birthData, options } = body;

    // Validierung
    if (!chartType || !birthData) {
      return NextResponse.json({
        success: false,
        error: 'chartType and birthData are required'
      }, { status: 400 });
    }

    // Erstelle Message für Chart Architect Agent
    let message = '';
    
    if (chartType === 'single') {
      message = `Erstelle ein Single-Bodygraph für:\n\nGeburtsdatum: ${birthData.person_A.date}\nGeburtszeit: ${birthData.person_A.time}\nGeburtsort: ${birthData.person_A.location}\n\nLiefer die Datenstruktur im Standard-Format (JSON)`;
      
      if (options?.includeSVG) {
        message += '\n\nErstelle auch ein SVG (Layer-basiert, zustandsfähig, für Workbook geeignet).';
      }
    } else if (chartType === 'dual') {
      message = `Erstelle ein Dual-Bodygraph (Connection Key) für:\n\nPerson A: ${birthData.person_A.date}, ${birthData.person_A.time}, ${birthData.person_A.location}\nPerson B: ${birthData.person_B.date}, ${birthData.person_B.time}, ${birthData.person_B.location}\n\nBerechne Verbindungen (elektromagnetisch, dominant, etc.) und liefer die Datenstruktur.`;
      
      if (options?.includeSVG) {
        message += '\n\nErstelle auch ein SVG im Dual-Overlay-Modus.';
      }
    } else if (chartType === 'penta') {
      message = `Erstelle ein Penta-Chart für ${Object.keys(birthData).length} Personen:\n\n`;
      Object.entries(birthData).forEach(([personId, data]: [string, any]) => {
        message += `${personId}: ${data.date}, ${data.time}, ${data.location}\n`;
      });
      message += '\nBerechne gemeinsame Zentren, Kanäle und fehlende Energien.';
      
      if (options?.includeSVG) {
        message += '\n\nErstelle auch ein SVG im Penta-Modus.';
      }
    }

    // Chart Architect Agent aufrufen
    const response = await fetch(`${MCP_SERVER_URL}/agent/${CHART_ARCHITECT_AGENT_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        userId: body.userId || 'workbook'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Chart Architect request failed: ${response.status} ${errorText}`);
    }

    const agentResponse = await response.json();
    
    // Parse Response (kann JSON-String oder Objekt sein)
    let chartData;
    try {
      chartData = typeof agentResponse.response === 'string' 
        ? JSON.parse(agentResponse.response)
        : agentResponse.response;
    } catch (e) {
      // Falls kein JSON, verwende Response direkt
      chartData = agentResponse.response;
    }

    // Response für Workbook formatieren
    const workbookResponse = {
      success: true,
      chart_id: chartData.chart_id || `chart_${Date.now()}`,
      data: chartData,
      svg: chartData.svg || null,
      svg_layers: chartData.svg_layers || null,
      metadata: {
        version: "1.0",
        generated_at: new Date().toISOString(),
        svg_standard: "layer-based-v1",
        chart_type: chartType
      }
    };

    return NextResponse.json(workbookResponse);

  } catch (error: any) {
    console.error('Workbook Chart Data API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
```

---

## 🔧 Schritt 2: Workbook-Service (Optional)

### Workbook-Service-Klasse

**Datei:** `integration/services/workbook-service.ts`

```typescript
/**
 * Workbook-Service
 * Konsumiert Chart-Daten vom Chart Architect Agent
 */

interface ChartDataRequest {
  chartType: 'single' | 'dual' | 'penta';
  birthData: {
    person_A: {
      date: string;
      time: string;
      location: string;
    };
    person_B?: {
      date: string;
      time: string;
      location: string;
    };
  };
  options?: {
    includeSVG?: boolean;
    includeLayers?: boolean;
    includeData?: boolean;
    mode?: string;
  };
}

export class WorkbookService {
  private apiUrl: string;

  constructor(apiUrl: string = '/api/workbook/chart-data') {
    this.apiUrl = apiUrl;
  }

  async getChartData(request: ChartDataRequest) {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Workbook API error: ${response.status}`);
    }

    return await response.json();
  }

  async getSVGOnly(chartId: string) {
    // Holt nur SVG für bestehenden Chart
    const response = await fetch(`${this.apiUrl}?chartId=${chartId}&svgOnly=true`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Workbook API error: ${response.status}`);
    }

    return await response.json();
  }

  async getLayers(chartId: string, layers: string[]) {
    // Holt nur bestimmte Layer
    const response = await fetch(`${this.apiUrl}?chartId=${chartId}&layers=${layers.join(',')}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Workbook API error: ${response.status}`);
    }

    return await response.json();
  }
}
```

---

## 📝 Schritt 3: Verwendung im Workbook

### Beispiel: PDF-Generierung

```typescript
import { WorkbookService } from '@/services/workbook-service';

const workbookService = new WorkbookService();

// Chart-Daten abrufen
const chartData = await workbookService.getChartData({
  chartType: 'single',
  birthData: {
    person_A: {
      date: '1978-05-12',
      time: '14:32',
      location: 'Berlin, Germany'
    }
  },
  options: {
    includeSVG: true,
    includeData: true
  }
});

// SVG in PDF einbetten
const pdf = generatePDF({
  title: 'Human Design Chart',
  bodygraph: chartData.svg.full,
  text: generateTextFromData(chartData.data)
});
```

---

### Beispiel: Web-Workbook

```typescript
// React-Komponente
function WorkbookChart({ chartId }: { chartId: string }) {
  const [chartData, setChartData] = useState(null);
  const [visibleLayers, setVisibleLayers] = useState(['centers', 'channels', 'gates']);

  useEffect(() => {
    workbookService.getChartData({...}).then(setChartData);
  }, [chartId]);

  return (
    <div>
      {/* SVG mit Layer-Kontrolle */}
      <svg>
        {visibleLayers.map(layer => (
          <g key={layer} dangerouslySetInnerHTML={{ __html: chartData.svg_layers[layer] }} />
        ))}
      </svg>
      
      {/* Layer-Kontrolle */}
      <LayerControl 
        layers={chartData.svg_layers}
        visible={visibleLayers}
        onChange={setVisibleLayers}
      />
    </div>
  );
}
```

---

## ✅ Checkliste

- [ ] API-Route erstellt (`/api/workbook/chart-data`)
- [ ] Chart Architect Agent getestet
- [ ] Datenformat validiert
- [ ] SVG-Format validiert
- [ ] Workbook-Service erstellt (optional)
- [ ] PDF-Generierung getestet (optional)
- [ ] Web-Workbook getestet (optional)

---

## 🎯 Nächste Schritte

1. **API-Route implementieren** (siehe Schritt 1)
2. **Chart Architect Agent testen** (mit Workbook-Request)
3. **Datenformat validieren** (JSON-Struktur prüfen)
4. **SVG-Format validieren** (Layer-Struktur prüfen)
5. **Workbook-Integration testen** (PDF/Web)

---

**🎉 Die Workbook-Schnittstelle ist jetzt definiert!** 🚀
