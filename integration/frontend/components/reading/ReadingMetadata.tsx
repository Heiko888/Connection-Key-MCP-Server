/**
 * ReadingMetadata Component
 * Zeigt technische Metadaten (einklappbar)
 * 
 * Metadaten:
 * - chart_id
 * - chart_version
 * - agent_id
 * - agent_version
 * - reading_id
 * 
 * Ziel: Reproduzierbarkeit & Debugging
 */

'use client';

import { useState } from 'react';

interface ReadingMetadataProps {
  readingId: string;
  chartId: string | null;
  chartVersion: string | null;
  agentId: string | null;
  agentVersion: string | null;
}

export function ReadingMetadata({
  readingId,
  chartId,
  chartVersion,
  agentId,
  agentVersion,
}: ReadingMetadataProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="reading-metadata">
      <button
        className="metadata-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span>{isExpanded ? '▼' : '▶'}</span>
        <span>Technische Metadaten</span>
      </button>

      {isExpanded && (
        <div className="metadata-content">
          <div className="metadata-item">
            <span className="metadata-label">Reading ID:</span>
            <span className="metadata-value">{readingId}</span>
          </div>
          {chartId && (
            <div className="metadata-item">
              <span className="metadata-label">Chart ID:</span>
              <span className="metadata-value">{chartId}</span>
            </div>
          )}
          {chartVersion && (
            <div className="metadata-item">
              <span className="metadata-label">Chart Version:</span>
              <span className="metadata-value">{chartVersion}</span>
            </div>
          )}
          {agentId && (
            <div className="metadata-item">
              <span className="metadata-label">Agent ID:</span>
              <span className="metadata-value">{agentId}</span>
            </div>
          )}
          {agentVersion && (
            <div className="metadata-item">
              <span className="metadata-label">Agent Version:</span>
              <span className="metadata-value">{agentVersion}</span>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .reading-metadata {
          margin-top: 2rem;
          padding: 1rem;
          background-color: #f9f9f9;
          border-radius: 8px;
          border: 1px solid #ddd;
        }
        .metadata-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }
        .metadata-toggle:hover {
          color: #333;
        }
        .metadata-content {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #ddd;
        }
        .metadata-item {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.75rem;
          font-size: 0.85rem;
        }
        .metadata-item:last-child {
          margin-bottom: 0;
        }
        .metadata-label {
          color: #666;
          font-weight: 500;
          min-width: 120px;
        }
        .metadata-value {
          color: #333;
          font-family: monospace;
          word-break: break-all;
        }
      `}</style>
    </div>
  );
}
