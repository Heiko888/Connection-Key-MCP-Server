/**
 * ReadingGenerator Component
 * Komponente für Human Design Reading Generation
 * 
 * Verbesserte Version mit:
 * - Status-Tracking
 * - Verbesserte Error-Handling
 * - ReadingDisplay Integration
 */

'use client';

import { useState } from 'react';
import { ReadingDisplay } from './ReadingDisplay';
import { ReadingResponse } from '../../api-routes/reading-response-types';

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

export function ReadingGenerator({ userId }: ReadingGeneratorProps): JSX.Element {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [readingType, setReadingType] = useState('detailed');
  const [focus, setFocus] = useState('personality');
  const [reading, setReading] = useState<ReadingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [readingId, setReadingId] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !birthDate || !birthTime || !birthPlace || !focus) {
      setError('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    setLoading(true);
    setError(null);
    setReading(null);
    setProgress(0);

    try {
      // Progress: Validierung
      setProgress(10);

      // Prefer V4 queue endpoint; fallback to legacy if not deployed.
      let res = await fetch('/api/reading/generate-v4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          birthDate,
          birthTime,
          birthPlace,
          readingType,
          focus,
          userId: userId || undefined
        }),
      });
      if (res.status === 404) {
        res = await fetch('/api/reading/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            birthDate,
            birthTime,
            birthPlace,
            readingType,
            focus,
            userId: userId || undefined,
          }),
        });
      }

      // Progress: Request gesendet
      setProgress(30);

      // Prüfe Content-Type bevor JSON parsen
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('API returned non-JSON:', {
          status: res.status,
          statusText: res.statusText,
          contentType,
          body: text.substring(0, 200)
        });
        throw new Error(`API-Fehler: Server antwortete nicht mit JSON. Status: ${res.status}. Antwort: ${text.substring(0, 100)}`);
      }

      const data = await res.json();

      // Progress: Response erhalten
      setProgress(70);

      if (!data.success) {
        // Detaillierte Fehlermeldung
        const errorMessage = data.errors && data.errors.length > 0
          ? data.errors.map((e: any) => e.message).join(', ')
          : data.error || 'Fehler beim Generieren des Readings';
        
        throw new Error(errorMessage);
      }

      // Progress: Verarbeitung
      setProgress(90);

      // Case A: API liefert direkt ein fertiges ReadingResponse
      if (data?.reading && data?.metadata && data?.readingId) {
        setReading(data as ReadingResponse);
        setProgress(100);
        setTimeout(() => setProgress(0), 1000);
        return;
      }

      // Case B: Async Job gestartet → Poll Status, dann lade public Reading
      if (data?.readingId) {
        setReadingId(data.readingId);

        const maxPolls = 180; // ~6 Minuten bei 2s
        for (let i = 0; i < maxPolls; i++) {
          // eslint-disable-next-line no-await-in-loop
          const statusRes = await fetch(`/api/readings/${data.readingId}/public/status`);
          if (statusRes.ok) {
            // eslint-disable-next-line no-await-in-loop
            const statusJson = await statusRes.json();
            const status = statusJson?.status?.status;
            if (status === 'completed' || status === 'done') {
              // eslint-disable-next-line no-await-in-loop
              const readingRes = await fetch(`/api/readings/${data.readingId}/public`);
              if (!readingRes.ok) throw new Error('Reading ist noch nicht verfügbar');
              // eslint-disable-next-line no-await-in-loop
              const readingJson = await readingRes.json();
              const readingText = readingJson?.reading?.reading_text || '';

              setReading({
                success: true,
                readingId: data.readingId,
                reading: { text: readingText },
                metadata: {
                  readingType: readingType as any,
                  birthDate,
                  birthTime,
                  birthPlace,
                  tokens: 0,
                  model: 'unknown',
                  timestamp: new Date().toISOString(),
                  userId: userId || undefined,
                },
              });
              setProgress(100);
              setTimeout(() => setProgress(0), 1000);
              return;
            }

            if (status === 'failed' || status === 'timeout') {
              const errMsg = statusJson?.status?.error || 'Reading-Job fehlgeschlagen';
              throw new Error(errMsg);
            }
          }

          // Progress grob hochziehen
          setProgress(Math.min(95, 70 + Math.round((i / maxPolls) * 25)));
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 2000));
        }

        throw new Error('Timeout: Reading wurde nicht rechtzeitig fertig');
      }

      throw new Error('Ungültige Antwort: keine readingId erhalten');

    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten');
      console.error('Reading Generation Error:', err);
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (readingId: string) => {
    try {
      // TODO: Implementiere Sharing-Logik
      // z.B. Link generieren oder Social Media Share
      const shareUrl = `${window.location.origin}/readings/${readingId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'Mein Human Design Reading',
          text: 'Schau dir mein Human Design Reading an!',
          url: shareUrl
        });
      } else {
        // Fallback: Copy to Clipboard
        await navigator.clipboard.writeText(shareUrl);
        alert('Link in Zwischenablage kopiert!');
      }
    } catch (error) {
      console.error('Share Error:', error);
    }
  };

  const handleExport = async (readingId: string, format: 'pdf' | 'text' | 'json') => {
    try {
      // TODO: Implementiere Export-Logik
      // z.B. API-Call zu /api/readings/[id]/export?format=pdf
      console.log(`Export Reading ${readingId} as ${format}`);
      
      // Placeholder
      alert(`Export als ${format.toUpperCase()} wird implementiert...`);
    } catch (error) {
      console.error('Export Error:', error);
    }
  };

  return (
    <div className="reading-generator-container">
      <h2>Human Design Reading Generator</h2>

      {/* Form */}
      <form onSubmit={handleGenerate} className="reading-form">
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Heiko"
            required
            disabled={loading}
          />
        </div>

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

        <div className="form-group">
          <label htmlFor="focus">Fokus *</label>
          <input
            type="text"
            id="focus"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="z.B. personality, business, relationship …"
            required
            disabled={loading}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading || !name || !birthDate || !birthTime || !birthPlace || !focus}
          className="generate-button"
        >
          {loading ? 'Reading wird generiert...' : 'Reading generieren'}
        </button>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Reading wird generiert...</p>
          {progress > 0 && (
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <div className="error-content">
            <strong>Fehler beim Generieren des Readings</strong>
            <p>{error}</p>
            <button 
              onClick={() => setError(null)}
              className="error-dismiss"
            >
              Schließen
            </button>
          </div>
        </div>
      )}

      {/* Success State */}
      {reading && !loading && (
        <div className="reading-result">
          <div className="success-notification">
            <span className="success-icon">✓</span>
            <span>Reading erfolgreich generiert!</span>
          </div>
          <ReadingDisplay
            reading={reading}
            onShare={handleShare}
            onExport={handleExport}
          />
        </div>
      )}

      {readingId && !reading && !loading && (
        <div className="reading-result">
          <div className="success-notification">
            <span className="success-icon">⏳</span>
            <span>Reading wird generiert (ID: {readingId})</span>
          </div>
        </div>
      )}
    </div>
  );
}

