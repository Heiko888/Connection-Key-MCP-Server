/**
 * ChartLoadingSkeleton Component
 * Zeigt Loading-Animation während Chart geladen wird
 */

'use client';

export function ChartLoadingSkeleton() {
  return (
    <div className="chart-loading-skeleton">
      <div className="chart-loading-spinner">
        <div className="spinner"></div>
      </div>
      <p>Chart wird geladen...</p>
      <style jsx>{`
        .chart-loading-skeleton {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          min-height: 200px;
        }
        .chart-loading-spinner {
          margin-bottom: 1rem;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        p {
          color: #666;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
