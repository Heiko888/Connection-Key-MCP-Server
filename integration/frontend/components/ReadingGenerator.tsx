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

export function ReadingGenerator({ userId }: ReadingGeneratorProps) {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [readingType, setReadingType] = useState('detailed');
  const [reading, setReading] = useState<ReadingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!birthDate || !birthTime || !birthPlace) {
      setError('Bitte füllen Sie alle Felder aus');
      return;
    }

    setLoading(true);
    setError(null);
    setReading(null);
    setProgress(0);

    try {
      // Progress: Validierung
      setProgress(10);

      const res = await fetch('/api/reading/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthDate,
          birthTime,
          birthPlace,
          readingType,
          userId: userId || undefined
        }),
      });

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

      // Standardisierte ReadingResponse
      setReading(data as ReadingResponse);

      // Progress: Fertig
      setProgress(100);

      // Progress nach kurzer Zeit zurücksetzen
      setTimeout(() => setProgress(0), 1000);

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
    </div>
  );
}

