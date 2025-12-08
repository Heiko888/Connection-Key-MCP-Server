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

