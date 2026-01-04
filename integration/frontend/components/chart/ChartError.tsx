/**
 * ChartError Component
 * Zeigt Fehler beim Laden des Charts
 * 
 * Props:
 * - error: ChartError
 * - chartId: string
 * - statusCode: number | null
 */

'use client';

import { ChartError as ChartErrorType } from '../../lib/hooks/useChart';

interface ChartErrorProps {
  error: ChartErrorType;
  chartId: string;
  statusCode: number | null;
}

export function ChartError({ error, chartId, statusCode }: ChartErrorProps) {
  const getErrorMessage = () => {
    switch (error.error) {
      case 'chart_id_missing':
        return 'Chart ID fehlt';
      case 'CHART_NOT_FOUND':
        return `Chart mit ID ${chartId} nicht gefunden`;
      case 'UNSUPPORTED_VERSION':
        return `Chart-Version ${error.chart_version} wird nicht unterstützt`;
      case 'ACCESS_DENIED':
        return `Zugriff auf Chart ${chartId} verweigert`;
      case 'INTERNAL_ERROR':
        return 'Interner Fehler beim Laden des Charts';
      default:
        return error.message || 'Unbekannter Fehler';
    }
  };

  const getErrorDetails = () => {
    if (error.error === 'UNSUPPORTED_VERSION' && error.supported_versions) {
      return (
        <div className="error-details">
          <p><strong>Unterstützte Versionen:</strong> {error.supported_versions.join(', ')}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-error">
      <div className="error-icon">⚠️</div>
      <h3>Chart-Fehler</h3>
      <p className="error-message">{getErrorMessage()}</p>
      {getErrorDetails()}
      {statusCode && (
        <p className="error-status-code">HTTP Status: {statusCode}</p>
      )}
      <p className="error-chart-id">Chart ID: {chartId || 'N/A'}</p>
      <style jsx>{`
        .chart-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          min-height: 200px;
          background-color: #fee;
          border: 2px solid #fcc;
          border-radius: 8px;
          margin: 1rem 0;
        }
        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        h3 {
          color: #c33;
          margin: 0 0 0.5rem 0;
        }
        .error-message {
          color: #333;
          font-weight: 500;
          margin: 0.5rem 0;
        }
        .error-details {
          margin: 1rem 0;
          padding: 0.5rem;
          background-color: #fff;
          border-radius: 4px;
        }
        .error-status-code {
          color: #666;
          font-size: 0.9rem;
          margin: 0.5rem 0;
        }
        .error-chart-id {
          color: #999;
          font-size: 0.8rem;
          font-family: monospace;
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
}
