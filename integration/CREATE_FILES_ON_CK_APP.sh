#!/bin/bash
# Erstellt Chart Development Agent Dateien direkt auf CK-App Server
# Führen Sie dieses Script auf dem CK-App Server aus

set -e

FRONTEND_DIR="/opt/hd-app/The-Connection-Key/frontend"

echo "📊 Chart Development Agent - Dateien erstellen auf CK-App Server"
echo "================================================================"
echo ""

cd "$FRONTEND_DIR"

# 1. API-Route erstellen
echo "1. Erstelle API-Route..."
mkdir -p pages/api/agents
cat > pages/api/agents/chart-development.ts << 'EOF'
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
EOF
echo "   ✅ API-Route erstellt: pages/api/agents/chart-development.ts"
echo ""

# 2. Frontend-Komponente erstellen
echo "2. Erstelle Frontend-Komponente..."
mkdir -p components/agents
cat > components/agents/ChartDevelopment.tsx << 'EOF'
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
EOF
echo "   ✅ Frontend-Komponente erstellt: components/agents/ChartDevelopment.tsx"
echo ""

# 3. Environment Variables prüfen
echo "3. Prüfe Environment Variables..."
if [ -f ".env.local" ]; then
    if ! grep -q "MCP_SERVER_URL" .env.local; then
        echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local
        echo "   ✅ MCP_SERVER_URL hinzugefügt"
    else
        echo "   ✅ MCP_SERVER_URL bereits vorhanden"
    fi
    
    if ! grep -q "READING_AGENT_URL" .env.local; then
        echo "READING_AGENT_URL=http://138.199.237.34:4001" >> .env.local
        echo "   ✅ READING_AGENT_URL hinzugefügt"
    else
        echo "   ✅ READING_AGENT_URL bereits vorhanden"
    fi
else
    echo "   ⚠️  .env.local nicht gefunden. Erstelle..."
    echo "MCP_SERVER_URL=http://138.199.237.34:7000" > .env.local
    echo "READING_AGENT_URL=http://138.199.237.34:4001" >> .env.local
    echo "   ✅ .env.local erstellt"
fi
echo ""

echo "================================================================"
echo "✅ Chart Development Agent Dateien erstellt!"
echo "================================================================"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Next.js App neu starten: npm run dev (oder pm2 restart)"
echo "2. Teste API-Route: curl -X POST http://localhost:3000/api/agents/chart-development \\"
echo "   -H 'Content-Type: application/json' \\"
echo "   -d '{\"message\":\"Test\"}'"
echo "3. Füge ChartDevelopment Komponente zu Dashboard hinzu (optional)"
echo ""

