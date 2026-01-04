/**
 * RelationshipAnalysisGenerator Component
 * Komponente für das Erstellen von Beziehungsanalysen
 */

'use client';

import { useState } from 'react';
import { ReadingDisplay } from './ReadingDisplay';
import { ReadingResponse } from '../../api-routes/reading-response-types';

export function RelationshipAnalysisGenerator() {
  const [birthDate1, setBirthDate1] = useState('');
  const [birthTime1, setBirthTime1] = useState('');
  const [birthPlace1, setBirthPlace1] = useState('');
  const [birthDate2, setBirthDate2] = useState('');
  const [birthTime2, setBirthTime2] = useState('');
  const [birthPlace2, setBirthPlace2] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState<ReadingResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/relationship-analysis/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthDate1,
          birthTime1,
          birthPlace1,
          birthDate2,
          birthTime2,
          birthPlace2,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Fehler beim Erstellen der Analyse');
      }

      setReading(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relationship-analysis-generator">
      <h2 className="text-2xl font-bold mb-4">Beziehungsanalyse erstellen</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Person 1</h3>
            <div className="space-y-2">
              <input
                type="date"
                value={birthDate1}
                onChange={(e) => setBirthDate1(e.target.value)}
                required
                className="w-full p-2 border rounded"
                placeholder="Geburtsdatum"
              />
              <input
                type="time"
                value={birthTime1}
                onChange={(e) => setBirthTime1(e.target.value)}
                required
                className="w-full p-2 border rounded"
                placeholder="Geburtszeit"
              />
              <input
                type="text"
                value={birthPlace1}
                onChange={(e) => setBirthPlace1(e.target.value)}
                required
                className="w-full p-2 border rounded"
                placeholder="Geburtsort"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Person 2</h3>
            <div className="space-y-2">
              <input
                type="date"
                value={birthDate2}
                onChange={(e) => setBirthDate2(e.target.value)}
                required
                className="w-full p-2 border rounded"
                placeholder="Geburtsdatum"
              />
              <input
                type="time"
                value={birthTime2}
                onChange={(e) => setBirthTime2(e.target.value)}
                required
                className="w-full p-2 border rounded"
                placeholder="Geburtszeit"
              />
              <input
                type="text"
                value={birthPlace2}
                onChange={(e) => setBirthPlace2(e.target.value)}
                required
                className="w-full p-2 border rounded"
                placeholder="Geburtsort"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Analysiere...' : 'Analyse erstellen'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {reading && (
        <div className="mt-6">
          <ReadingDisplay reading={reading} />
        </div>
      )}
    </div>
  );
}

