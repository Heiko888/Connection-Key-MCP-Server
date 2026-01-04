/**
 * ReadingLayout Component
 * Layout für Desktop und Mobile
 * 
 * Desktop: | Chart (links) | Reading (rechts) |
 * Mobile:  | Chart | Reading |
 * 
 * Regeln:
 * - Chart visuell stabil
 * - Reading scrollt unabhängig
 * - Kein Re-Render des Charts beim Scrollen
 */

'use client';

import { ReactNode } from 'react';

interface ReadingLayoutProps {
  chart: ReactNode;
  reading: ReactNode;
}

export function ReadingLayout({ chart, reading }: ReadingLayoutProps) {
  return (
    <div className="reading-layout">
      <div className="reading-layout-chart">
        {chart}
      </div>
      <div className="reading-layout-content">
        {reading}
      </div>

      <style jsx>{`
        .reading-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }
        .reading-layout-chart {
          position: sticky;
          top: 2rem;
          height: fit-content;
          max-height: calc(100vh - 4rem);
          overflow-y: auto;
        }
        .reading-layout-content {
          overflow-y: visible;
        }
        @media (max-width: 1024px) {
          .reading-layout {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .reading-layout-chart {
            position: relative;
            top: 0;
            max-height: none;
          }
        }
      `}</style>
    </div>
  );
}
