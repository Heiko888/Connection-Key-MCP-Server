/**
 * ChartLoader Component
 * Lädt Chart via useChart Hook und rendert BodygraphRenderer
 * 
 * Props:
 * - chartId: string | null
 * 
 * Rendert:
 * - Loading state
 * - Error state (sichtbar, mit statusCode)
 * - Success → BodygraphRenderer
 */

'use client';

import { useChart, ChartResponse } from '../../lib/hooks/useChart';
import { BodygraphRenderer } from './BodygraphRenderer';
import { ChartLoadingSkeleton } from './ChartLoadingSkeleton';
import { ChartError } from './ChartError';

interface ChartLoaderProps {
  chartId: string | null;
}

export function ChartLoader({ chartId }: ChartLoaderProps) {
  const { chart, isLoading, error, statusCode } = useChart(chartId);

  // Loading State
  if (isLoading) {
    return <ChartLoadingSkeleton />;
  }

  // Error State
  if (error) {
    return <ChartError error={error} chartId={chartId || ''} statusCode={statusCode} />;
  }

  // Success State
  if (chart) {
    return <BodygraphRenderer chart={chart.chart_data} chartVersion={chart.chart_version} />;
  }

  // Fallback (sollte nicht erreicht werden)
  return (
    <div className="chart-loader-fallback">
      <p>Keine Chart-Daten verfügbar</p>
    </div>
  );
}
