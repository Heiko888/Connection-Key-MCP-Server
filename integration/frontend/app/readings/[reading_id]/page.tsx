/**
 * Reading Detail Page (D2)
 * Zeigt ein einzelnes Reading mit Chart-Visualisierung
 * 
 * Datenfluss:
 * 1. Lade Reading via reading_id (öffentlich, read-only)
 * 2. Extrahiere chart_id, agent_id, etc.
 * 3. Rendere ReadingHeader mit Metadaten
 * 4. Rendere ReadingLayout (Chart + Reading)
 * 5. Rendere ReadingMetadata (einklappbar)
 * 
 * Regeln:
 * - Chart-Fehler darf Reading nicht verstecken
 * - Beide Bereiche haben eigene Fehlerstates
 * - Kein Login erforderlich (read-only)
 */

import { notFound } from 'next/navigation';
import { ChartLoader } from '../../../components/chart/ChartLoader';
import { ReadingHeader } from '../../../components/reading/ReadingHeader';
import { ReadingContent } from '../../../components/reading/ReadingContent';
import { ReadingLayout } from '../../../components/reading/ReadingLayout';
import { ReadingMetadata } from '../../../components/reading/ReadingMetadata';
import { getSystemSupabaseClient } from '../../../../lib/supabase-clients';

interface ReadingPageProps {
  params: {
    reading_id: string;
  };
}

interface ReadingData {
  id: string;
  reading_type: string;
  reading_text: string;
  essence: string | null;
  chart_id: string | null;
  chart_version: string | null;
  agent_id: string | null;
  agent_version: string | null;
  created_at: string;
  status: string;
}

async function loadReading(readingId: string): Promise<ReadingData | null> {
  try {
    const supabase = getSystemSupabaseClient();
    const { data: reading, error } = await supabase
      .from('readings')
      .select('id, reading_type, reading_text, essence, chart_id, chart_version, agent_id, agent_version, created_at, status')
      .eq('id', readingId)
      .eq('status', 'completed') // Nur completed Readings
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

  // Kontext aus reading_type oder agent_id ableiten
  const context = reading.agent_id || reading.reading_type || null;

  return (
    <div className="reading-page">
      {/* Reading Header */}
      <ReadingHeader
        context={context}
        agentId={reading.agent_id}
        agentVersion={reading.agent_version}
        createdAt={reading.created_at}
      />

      {/* Reading Layout: Chart + Content */}
      <ReadingLayout
        chart={
          reading.chart_id ? (
            <ChartLoader chartId={reading.chart_id} />
          ) : (
            <div className="chart-missing">
              <p>⚠️ Keine Chart-Referenz vorhanden</p>
              <p className="chart-missing-detail">Dieses Reading hat keine chart_id</p>
            </div>
          )
        }
        reading={
          <ReadingContent
            text={reading.reading_text}
            essence={reading.essence}
          />
        }
      />

      {/* Technische Metadaten */}
      <ReadingMetadata
        readingId={reading.id}
        chartId={reading.chart_id}
        chartVersion={reading.chart_version}
        agentId={reading.agent_id}
        agentVersion={reading.agent_version}
      />

      <style jsx>{`
        .reading-page {
          min-height: 100vh;
          background-color: #f5f5f5;
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
