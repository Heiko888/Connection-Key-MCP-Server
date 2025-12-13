/**
 * ReadingHistory Component
 * Zeigt Reading-History eines Users an
 * 
 * Features:
 * - Liste aller Readings
 * - Filter nach Reading-Typ
 * - Suchfunktion
 * - Pagination
 * - Einzelnes Reading öffnen
 */

'use client';

import { useState, useEffect } from 'react';
import { ReadingDisplay } from './ReadingDisplay';
import { ReadingResponse } from '../../api-routes/reading-response-types';

interface ReadingHistoryProps {
  userId: string;
  onReadingSelect?: (readingId: string) => void;
}

interface ReadingItem {
  id: string;
  reading_type: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  reading_text: string;
  reading_sections?: any;
  chart_data?: any;
  metadata?: any;
  status: string;
  created_at: string;
  updated_at: string;
}

interface HistoryResponse {
  success: boolean;
  readings: ReadingItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const READING_TYPES = [
  { value: '', label: 'Alle Typen' },
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

export function ReadingHistory({ userId, onReadingSelect }: ReadingHistoryProps) {
  const [readings, setReadings] = useState<ReadingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReading, setSelectedReading] = useState<ReadingResponse | null>(null);
  const [filterType, setFilterType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  });

  // Load Readings
  const loadReadings = async (offset = 0, type = filterType) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        userId,
        limit: pagination.limit.toString(),
        offset: offset.toString()
      });

      if (type) {
        params.append('readingType', type);
      }

      const res = await fetch(`/api/readings/history?${params.toString()}`);
      const data: HistoryResponse = await res.json();

      if (!data.success) {
        throw new Error(data.readings ? 'Fehler beim Laden' : 'Keine Readings gefunden');
      }

      setReadings(data.readings);
      setPagination(data.pagination);

    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Readings');
      console.error('Reading History Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load Reading by ID
  const loadReading = async (readingId: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/readings/${readingId}?userId=${userId}`);
      const data: ReadingResponse = await res.json();

      if (!data.success) {
        throw new Error('Reading nicht gefunden');
      }

      setSelectedReading(data);

      if (onReadingSelect) {
        onReadingSelect(readingId);
      }

    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden des Readings');
      console.error('Load Reading Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    if (userId) {
      loadReadings();
    }
  }, [userId]);

  // Filter Change
  useEffect(() => {
    if (userId) {
      loadReadings(0, filterType);
    }
  }, [filterType]);

  // Format Date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter Readings by Search Query
  const filteredReadings = readings.filter(reading => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      reading.reading_text.toLowerCase().includes(query) ||
      reading.reading_type.toLowerCase().includes(query) ||
      reading.birth_place.toLowerCase().includes(query)
    );
  });

  // Convert ReadingItem to ReadingResponse
  const convertToReadingResponse = (item: ReadingItem): ReadingResponse => {
    return {
      success: true,
      readingId: item.id,
      reading: {
        text: item.reading_text,
        sections: item.reading_sections || undefined
      },
      metadata: {
        readingType: item.reading_type as any,
        birthDate: item.birth_date,
        birthTime: item.birth_time,
        birthPlace: item.birth_place,
        tokens: item.metadata?.tokens || 0,
        model: item.metadata?.model || 'gpt-4',
        timestamp: item.created_at,
        userId: userId
      },
      chartData: item.chart_data || undefined
    };
  };

  return (
    <div className="reading-history-container">
      <div className="history-header">
        <h2>Meine Readings</h2>
        <div className="history-stats">
          <span>{pagination.total} Readings insgesamt</span>
        </div>
      </div>

      {/* Filters */}
      <div className="history-filters">
        <div className="filter-group">
          <label htmlFor="filterType">Reading-Typ:</label>
          <select
            id="filterType"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {READING_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="searchQuery">Suche:</label>
          <input
            type="text"
            id="searchQuery"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Suche in Readings..."
          />
        </div>

        <button
          onClick={() => loadReadings(0, filterType)}
          className="refresh-button"
          disabled={loading}
        >
          🔄 Aktualisieren
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Readings werden geladen...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-message">
          <strong>Fehler:</strong> {error}
        </div>
      )}

      {/* Selected Reading */}
      {selectedReading && (
        <div className="selected-reading">
          <button
            onClick={() => setSelectedReading(null)}
            className="close-button"
          >
            ✕ Schließen
          </button>
          <ReadingDisplay reading={selectedReading} />
        </div>
      )}

      {/* Readings List */}
      {!selectedReading && (
        <div className="readings-list">
          {filteredReadings.length === 0 ? (
            <div className="no-readings">
              <p>Keine Readings gefunden.</p>
              {!loading && (
                <button
                  onClick={() => loadReadings(0, filterType)}
                  className="load-button"
                >
                  Readings laden
                </button>
              )}
            </div>
          ) : (
            <>
              {filteredReadings.map((reading) => (
                <div key={reading.id} className="reading-item">
                  <div className="reading-item-header">
                    <div className="reading-item-info">
                      <h3>{reading.reading_type}</h3>
                      <span className="reading-date">
                        {formatDate(reading.created_at)}
                      </span>
                    </div>
                    <span className={`reading-status ${reading.status}`}>
                      {reading.status}
                    </span>
                  </div>
                  <div className="reading-item-content">
                    <div className="reading-item-meta">
                      <span>📅 {reading.birth_date}</span>
                      <span>🕐 {reading.birth_time}</span>
                      <span>📍 {reading.birth_place}</span>
                    </div>
                    <div className="reading-item-preview">
                      {reading.reading_text.substring(0, 200)}...
                    </div>
                  </div>
                  <div className="reading-item-actions">
                    <button
                      onClick={() => loadReading(reading.id)}
                      className="view-button"
                    >
                      📖 Ansehen
                    </button>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination.hasMore && (
                <div className="pagination">
                  <button
                    onClick={() => loadReadings(pagination.offset + pagination.limit, filterType)}
                    disabled={loading}
                    className="load-more-button"
                  >
                    Mehr laden ({pagination.total - pagination.offset - pagination.limit} verbleibend)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

