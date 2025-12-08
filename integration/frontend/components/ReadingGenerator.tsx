/**
 * ReadingGenerator Component
 * Komponente für Human Design Reading Generation
 */

'use client';

import { useState } from 'react';

const READING_TYPES = [
  { value: 'basic', label: 'Basic Reading' },
  { value: 'detailed', label: 'Detailed Reading' },
  { value: 'business', label: 'Business Reading' },
  { value: 'relationship', label: 'Relationship Reading' },
  { value: 'career', label: 'Career Reading' },
  { value: 'health', label: 'Health & Wellness Reading' },
  { value: 'parenting', label: 'Parenting & Family Reading' },
  { value: 'spiritual', label: 'Spiritual Growth Reading' },
  { value: 'compatibility', label: 'Compatibility Reading' },
  { value: 'life-purpose', label: 'Life Purpose Reading' },
];

interface ReadingGeneratorProps {
  userId?: string;
}

export function ReadingGenerator({ userId }: ReadingGeneratorProps) {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [readingType, setReadingType] = useState('detailed');
  const [reading, setReading] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [readingId, setReadingId] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!birthDate || !birthTime || !birthPlace) {
      setError('Bitte füllen Sie alle Felder aus');
      return;
    }

    setLoading(true);
    setError(null);
    setReading('');

    try {
      const res = await fetch('/api/readings/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthDate,
          birthTime,
          birthPlace,
          readingType,
          userId: userId || 'anonymous'
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Fehler beim Generieren des Readings');
      }

      setReading(data.reading);
      setReadingId(data.readingId);

    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
      console.error('Reading Generation Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reading-generator-container">
      <h2>Human Design Reading Generator</h2>

      {/* Form */}
      <form onSubmit={handleGenerate} className="reading-form">
        <div className="form-group">
          <label htmlFor="birthDate">Geburtsdatum *</label>
          <input
            type="date"
            id="birthDate"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="birthTime">Geburtszeit *</label>
          <input
            type="time"
            id="birthTime"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="birthPlace">Geburtsort *</label>
          <input
            type="text"
            id="birthPlace"
            value={birthPlace}
            onChange={(e) => setBirthPlace(e.target.value)}
            placeholder="z.B. Berlin, Deutschland"
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="readingType">Reading-Typ</label>
          <select
            id="readingType"
            value={readingType}
            onChange={(e) => setReadingType(e.target.value)}
            disabled={loading}
          >
            {READING_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          disabled={loading || !birthDate || !birthTime || !birthPlace}
          className="generate-button"
        >
          {loading ? 'Reading wird generiert...' : 'Reading generieren'}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div className="error-message">
          <strong>Fehler:</strong> {error}
        </div>
      )}

      {/* Reading Result */}
      {reading && (
        <div className="reading-result">
          <div className="reading-header">
            <h3>Ihr Human Design Reading</h3>
            {readingId && <span className="reading-id">ID: {readingId}</span>}
          </div>
          <div className="reading-content">
            {reading.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(reading);
              alert('Reading in Zwischenablage kopiert!');
            }}
            className="copy-button"
          >
            Reading kopieren
          </button>
        </div>
      )}
    </div>
  );
}

