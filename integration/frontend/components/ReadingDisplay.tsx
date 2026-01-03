/**
 * ReadingDisplay Component
 * Verbesserte Anzeige für Human Design Readings
 * 
 * Features:
 * - Strukturierte Sections-Anzeige
 * - Chart-Daten Visualisierung
 * - Formatierter Reading-Text
 * - Export-Funktionen
 */

'use client';

import { useState } from 'react';
import { ReadingResponse, DetailedReadingSections, isDetailedReadingSections } from '../../api-routes/reading-response-types';

interface ReadingDisplayProps {
  reading: ReadingResponse;
  onShare?: (readingId: string) => void;
  onExport?: (readingId: string, format: 'pdf' | 'text' | 'json') => void;
}

export function ReadingDisplay({ reading, onShare, onExport }: ReadingDisplayProps) {
  const [activeTab, setActiveTab] = useState<'text' | 'sections' | 'chart'>('text');
  const [copied, setCopied] = useState(false);

  // Copy to Clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reading.reading.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Format Date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render Sections
  const renderSections = () => {
    if (!reading.reading.sections) {
      return (
        <div className="reading-no-sections">
          <p>Keine strukturierten Sections verfügbar.</p>
        </div>
      );
    }

    const sections = reading.reading.sections;
    
    // Type guard helper
    const hasProperty = (obj: any, prop: string): boolean => {
      return obj && typeof obj === 'object' && prop in obj;
    };

    return (
      <div className="reading-sections">
        {/* Overview */}
        {sections.overview && (
          <section className="reading-section">
            <h3>Übersicht</h3>
            <p>{sections.overview}</p>
          </section>
        )}

        {/* Type */}
        {hasProperty(sections, 'type') && sections.type && (
          <section className="reading-section">
            <h3>Typ</h3>
            {typeof sections.type === 'string' ? (
              <p>{sections.type}</p>
            ) : isDetailedReadingSections(sections) && typeof sections.type === 'object' && sections.type ? (
              <div>
                <h4>{sections.type.name}</h4>
                <p>{sections.type.description}</p>
                {sections.type.characteristics && (
                  <ul>
                    {sections.type.characteristics.map((char: string, idx: number) => (
                      <li key={idx}>{char}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </section>
        )}

        {/* Strategy */}
        {hasProperty(sections, 'strategy') && sections.strategy && (
          <section className="reading-section">
            <h3>Strategie</h3>
            {typeof sections.strategy === 'string' ? (
              <p>{sections.strategy}</p>
            ) : isDetailedReadingSections(sections) && typeof sections.strategy === 'object' && sections.strategy ? (
              <div>
                <h4>{sections.strategy.name}</h4>
                <p>{sections.strategy.description}</p>
                {sections.strategy.howTo && (
                  <div className="how-to">
                    <strong>Wie anwenden:</strong>
                    <p>{sections.strategy.howTo}</p>
                  </div>
                )}
              </div>
            ) : null}
          </section>
        )}

        {/* Authority */}
        {hasProperty(sections, 'authority') && sections.authority && (
          <section className="reading-section">
            <h3>Autorität</h3>
            {typeof sections.authority === 'string' ? (
              <p>{sections.authority}</p>
            ) : isDetailedReadingSections(sections) && typeof sections.authority === 'object' && sections.authority ? (
              <div>
                <h4>{sections.authority.name}</h4>
                <p>{sections.authority.description}</p>
                {sections.authority.howTo && (
                  <div className="how-to">
                    <strong>Wie nutzen:</strong>
                    <p>{sections.authority.howTo}</p>
                  </div>
                )}
              </div>
            ) : null}
          </section>
        )}

        {/* Profile */}
        {hasProperty(sections, 'profile') && sections.profile && (
          <section className="reading-section">
            <h3>Profil</h3>
            {typeof sections.profile === 'string' ? (
              <p>{sections.profile}</p>
            ) : isDetailedReadingSections(sections) && typeof sections.profile === 'object' && sections.profile && 'line1' in sections.profile ? (
              <div>
                <h4>Profil {sections.profile.line1}/{sections.profile.line2}</h4>
                <p>{sections.profile.description}</p>
                {sections.profile.characteristics && (
                  <ul>
                    {sections.profile.characteristics.map((char: string, idx: number) => (
                      <li key={idx}>{char}</li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </section>
        )}

        {/* Centers (für Basic/Detailed) */}
        {'centers' in sections && sections.centers && (
          <section className="reading-section">
            <h3>Zentren</h3>
            {Array.isArray(sections.centers.defined) ? (
              <div>
                <h4>Definierte Zentren</h4>
                <ul>
                  {sections.centers.defined.map((center: any, idx: number) => (
                    <li key={idx}>
                      {typeof center === 'string' ? center : center.name}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div>
                <h4>Definierte Zentren</h4>
                <ul>
                  {Array.isArray(sections.centers.defined) && sections.centers.defined.map((center: string, idx: number) => (
                    <li key={idx}>{center}</li>
                  ))}
                </ul>
              </div>
            )}
            {sections.centers.undefined && (
              <div>
                <h4>Undefinierte Zentren</h4>
                <ul>
                  {Array.isArray(sections.centers.undefined) && sections.centers.undefined.map((center: any, idx: number) => (
                    <li key={idx}>
                      {typeof center === 'string' ? center : center.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* Compatibility Reading spezielle Anzeige */}
        {'compatibility' in sections && sections.compatibility && (
          <section className="reading-section">
            <h3>Kompatibilität</h3>
            <div className="compatibility-score">
              <div className="score-circle">
                <span className="score-value">{sections.compatibility.score}</span>
                <span className="score-label">/ 100</span>
              </div>
            </div>
            <div className="compatibility-details">
              <div>
                <h4>Stärken</h4>
                <ul>
                  {sections.compatibility.strengths?.map((strength, idx) => (
                    <li key={idx}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>Herausforderungen</h4>
                <ul>
                  {sections.compatibility.challenges?.map((challenge, idx) => (
                    <li key={idx}>{challenge}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}
      </div>
    );
  };

  // Render Chart Data
  const renderChartData = () => {
    if (!reading.chartData) {
      return (
        <div className="reading-no-chart">
          <p>Keine Chart-Daten verfügbar.</p>
        </div>
      );
    }

    const chart = reading.chartData;

    return (
      <div className="reading-chart-data">
        {chart.type && (
          <div className="chart-info">
            <strong>Typ:</strong> {chart.type}
          </div>
        )}
        {chart.profile && (
          <div className="chart-info">
            <strong>Profil:</strong> {chart.profile}
          </div>
        )}
        {chart.incarnationCross && (
          <div className="chart-info">
            <strong>Inkarnationskreuz:</strong> {chart.incarnationCross}
          </div>
        )}
        {/* Weitere Chart-Daten können hier hinzugefügt werden */}
      </div>
    );
  };

  return (
    <div className="reading-display-container">
      {/* Header */}
      <div className="reading-header">
        <div className="reading-title">
          <h2>Human Design Reading</h2>
          <span className="reading-type-badge">{reading.metadata.readingType}</span>
        </div>
        <div className="reading-meta">
          <div className="meta-item">
            <strong>Geburtsdatum:</strong> {reading.metadata.birthDate}
          </div>
          <div className="meta-item">
            <strong>Geburtszeit:</strong> {reading.metadata.birthTime}
          </div>
          <div className="meta-item">
            <strong>Geburtsort:</strong> {reading.metadata.birthPlace}
          </div>
          {reading.metadata.readingType === 'compatibility' && (
            <>
              <div className="meta-item">
                <strong>Person 2 - Geburtsdatum:</strong> {reading.metadata.birthDate2}
              </div>
              <div className="meta-item">
                <strong>Person 2 - Geburtszeit:</strong> {reading.metadata.birthTime2}
              </div>
              <div className="meta-item">
                <strong>Person 2 - Geburtsort:</strong> {reading.metadata.birthPlace2}
              </div>
            </>
          )}
          <div className="meta-item">
            <strong>Erstellt am:</strong> {formatDate(reading.metadata.timestamp)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="reading-tabs">
        <button
          className={activeTab === 'text' ? 'active' : ''}
          onClick={() => setActiveTab('text')}
        >
          Vollständiger Text
        </button>
        {reading.reading.sections && (
          <button
            className={activeTab === 'sections' ? 'active' : ''}
            onClick={() => setActiveTab('sections')}
          >
            Strukturierte Sections
          </button>
        )}
        {reading.chartData && (
          <button
            className={activeTab === 'chart' ? 'active' : ''}
            onClick={() => setActiveTab('chart')}
          >
            Chart-Daten
          </button>
        )}
      </div>

      {/* Content */}
      <div className="reading-content">
        {activeTab === 'text' && (
          <div className="reading-text">
            {reading.reading.text.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}

        {activeTab === 'sections' && renderSections()}

        {activeTab === 'chart' && renderChartData()}
      </div>

      {/* Actions */}
      <div className="reading-actions">
        <button onClick={handleCopy} className="action-button copy-button">
          {copied ? '✓ Kopiert!' : '📋 Kopieren'}
        </button>
        {onShare && (
          <button
            onClick={() => onShare(reading.readingId)}
            className="action-button share-button"
          >
            🔗 Teilen
          </button>
        )}
        {onExport && (
          <div className="export-buttons">
            <button
              onClick={() => onExport(reading.readingId, 'pdf')}
              className="action-button export-button"
            >
              📄 PDF
            </button>
            <button
              onClick={() => onExport(reading.readingId, 'text')}
              className="action-button export-button"
            >
              📝 Text
            </button>
            <button
              onClick={() => onExport(reading.readingId, 'json')}
              className="action-button export-button"
            >
              📊 JSON
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

