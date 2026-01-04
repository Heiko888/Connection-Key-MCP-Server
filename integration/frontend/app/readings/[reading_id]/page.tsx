/**
 * Reading Detail Page
 * Zeigt ein einzelnes Reading mit Chart-Visualisierung
 * 
 * Datenfluss:
 * 1. Lade Reading via reading_id
 * 2. Extrahiere chart_id
 * 3. Rendere ChartLoader mit chart_id
 * 4. Rendere Reading-Content
 * 
 * Regeln:
 * - Chart-Fehler darf Reading nicht verstecken
 * - Beide Bereiche haben eigene Fehlerstates
 */

import { notFound } from 'next/navigation';
import { ReadingDisplay } from '../../../components/ReadingDisplay';
import { ChartLoader } from '../../../components/chart/ChartLoader';
import { getSystemSupabaseClient } from '../../../../lib/supabase-clients';

interface ReadingPageProps {
  params: {
    reading_id: string;
  };
}

interface ReadingData {
  id: string;
  user_id: string | null;
  reading_type: string;
  reading_text: string;
  essence: string | null;
  chart_id: string | null;
  chart_version: string | null;
  created_at: string;
  metadata: any;
}

async function loadReading(readingId: string): Promise<ReadingData | null> {
  try {
    const supabase = getSystemSupabaseClient();
    const { data: reading, error } = await supabase
      .from('readings')
      .select('id, user_id, reading_type, reading_text, essence, chart_id, chart_version, created_at, metadata')
      .eq('id', readingId)
      .single();

    if (error || !reading) {
      return null;
    }

    return reading;
  } catch (error) {
    console.error('Error loading reading:', error);
    return null;
  }
}

export default async function ReadingPage({ params }: ReadingPageProps) {
  const reading = await loadReading(params.reading_id);

  if (!reading) {
    notFound();
  }

  // Transform ReadingData zu ReadingResponse Format (für ReadingDisplay)
  const readingResponse = {
    success: true,
    reading: {
      id: reading.id,
      text: reading.reading_text,
      sections: null, // TODO: Falls sections in DB gespeichert werden
    },
    essence: reading.essence || undefined,
    chartData: null, // Chart wird über ChartLoader geladen, nicht hier
    metadata: reading.metadata || {},
    timestamp: reading.created_at,
  };

  return (
    <div className="reading-page">
      <div className="reading-page-header">
        <h1>Reading Details</h1>
        <p className="reading-id">ID: {reading.id}</p>
        <p className="reading-type">Type: {reading.reading_type}</p>
      </div>

      <div className="reading-page-content">
        {/* Chart Section */}
        <div className="reading-chart-section">
          <h2>Chart</h2>
          {reading.chart_id ? (
            <ChartLoader chartId={reading.chart_id} />
          ) : (
            <div className="chart-missing">
              <p>⚠️ Keine Chart-Referenz vorhanden</p>
              <p className="chart-missing-detail">Dieses Reading hat keine chart_id</p>
            </div>
          )}
        </div>

        {/* Reading Content Section */}
        <div className="reading-content-section">
          <h2>Reading</h2>
          <ReadingDisplay reading={readingResponse} />
        </div>
      </div>

      <style jsx>{`
        .reading-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        .reading-page-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #eee;
        }
        .reading-page-header h1 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }
        .reading-id {
          color: #666;
          font-size: 0.9rem;
          font-family: monospace;
          margin: 0.25rem 0;
        }
        .reading-type {
          color: #666;
          font-size: 0.9rem;
          margin: 0.25rem 0;
        }
        .reading-page-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        @media (max-width: 768px) {
          .reading-page-content {
            grid-template-columns: 1fr;
          }
        }
        .reading-chart-section,
        .reading-content-section {
          min-height: 400px;
        }
        .reading-chart-section h2,
        .reading-content-section h2 {
          margin: 0 0 1rem 0;
          color: #444;
        }
        .chart-missing {
          padding: 2rem;
          background-color: #fff3e0;
          border: 2px solid #ff9800;
          border-radius: 8px;
          text-align: center;
        }
        .chart-missing p {
          margin: 0.5rem 0;
          color: #e65100;
        }
        .chart-missing-detail {
          font-size: 0.9rem;
          color: #666;
        }
      `}</style>
    </div>
  );
}
