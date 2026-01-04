/**
 * BodygraphRenderer Component (MVP)
 * Rendert Chart-Daten als strukturierte Liste
 * 
 * Regeln:
 * - Rein darstellend, KEINE Berechnung
 * - Zeigt: chart_version, centers (9), channels, gates
 * - Später austauschbar gegen SVG/Canvas Bodygraph
 * 
 * Props:
 * - chart: ChartData
 * - chartVersion: string
 */

'use client';

interface ChartData {
  core: {
    type: string;
    authority: string;
    strategy: string;
    profile: string;
    definition: string;
  };
  centers: {
    head: 'defined' | 'undefined';
    ajna: 'defined' | 'undefined';
    throat: 'defined' | 'undefined';
    g: 'defined' | 'undefined';
    heart: 'defined' | 'undefined';
    spleen: 'defined' | 'undefined';
    solar_plexus: 'defined' | 'undefined';
    sacral: 'defined' | 'undefined';
    root: 'defined' | 'undefined';
  };
  channels: Array<{
    number: number;
    gate1: number;
    gate2: number;
    name: string;
    defined: boolean;
  }>;
  gates: {
    [gateNumber: string]: {
      line: number;
      planet: string;
    };
  };
}

interface BodygraphRendererProps {
  chart: ChartData;
  chartVersion: string;
}

export function BodygraphRenderer({ chart, chartVersion }: BodygraphRendererProps) {
  const centerNames: { [key: string]: string } = {
    head: 'Head (Kopf)',
    ajna: 'Ajna (Stirn)',
    throat: 'Throat (Kehle)',
    g: 'G (G-Punkt)',
    heart: 'Heart (Herz)',
    spleen: 'Spleen (Milz)',
    solar_plexus: 'Solar Plexus',
    sacral: 'Sacral (Sakral)',
    root: 'Root (Wurzel)',
  };

  return (
    <div className="bodygraph-renderer">
      <div className="chart-header">
        <h2>Human Design Chart</h2>
        <p className="chart-version">Version: {chartVersion}</p>
      </div>

      {/* Core Information */}
      <div className="chart-section">
        <h3>Core Information</h3>
        <div className="core-info">
          <div className="info-item">
            <strong>Type:</strong> {chart.core.type || 'N/A'}
          </div>
          <div className="info-item">
            <strong>Authority:</strong> {chart.core.authority || 'N/A'}
          </div>
          <div className="info-item">
            <strong>Strategy:</strong> {chart.core.strategy || 'N/A'}
          </div>
          <div className="info-item">
            <strong>Profile:</strong> {chart.core.profile || 'N/A'}
          </div>
          <div className="info-item">
            <strong>Definition:</strong> {chart.core.definition || 'N/A'}
          </div>
        </div>
      </div>

      {/* Centers */}
      <div className="chart-section">
        <h3>Centers (9)</h3>
        <div className="centers-list">
          {Object.entries(chart.centers).map(([centerId, state]) => (
            <div key={centerId} className={`center-item ${state}`}>
              <span className="center-name">{centerNames[centerId] || centerId}</span>
              <span className={`center-state ${state}`}>
                {state === 'defined' ? '✓ Aktiv' : '○ Inaktiv'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Channels */}
      <div className="chart-section">
        <h3>Channels ({chart.channels.length})</h3>
        <div className="channels-list">
          {chart.channels.map((channel) => (
            <div key={channel.number} className={`channel-item ${channel.defined ? 'defined' : 'undefined'}`}>
              <div className="channel-header">
                <span className="channel-number">Channel {channel.number}</span>
                <span className={`channel-state ${channel.defined ? 'defined' : 'undefined'}`}>
                  {channel.defined ? '✓ Aktiv' : '○ Inaktiv'}
                </span>
              </div>
              <div className="channel-details">
                <span>Gate {channel.gate1} → Gate {channel.gate2}</span>
                <span className="channel-name">{channel.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gates */}
      <div className="chart-section">
        <h3>Gates ({Object.keys(chart.gates).length})</h3>
        <div className="gates-list">
          {Object.entries(chart.gates)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([gateNumber, gateData]) => (
              <div key={gateNumber} className="gate-item">
                <span className="gate-number">Gate {gateNumber}</span>
                <span className="gate-line">Line {gateData.line}</span>
                <span className="gate-planet">{gateData.planet}</span>
              </div>
            ))}
        </div>
      </div>

      <style jsx>{`
        .bodygraph-renderer {
          padding: 1.5rem;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .chart-header {
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #eee;
        }
        .chart-header h2 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }
        .chart-version {
          color: #666;
          font-size: 0.9rem;
          margin: 0;
        }
        .chart-section {
          margin-bottom: 2rem;
        }
        .chart-section h3 {
          margin: 0 0 1rem 0;
          color: #444;
          font-size: 1.2rem;
        }
        .core-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .info-item {
          padding: 0.75rem;
          background-color: #f9f9f9;
          border-radius: 4px;
        }
        .info-item strong {
          display: block;
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }
        .centers-list {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
        }
        .center-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border-radius: 4px;
          border: 2px solid #ddd;
        }
        .center-item.defined {
          background-color: #e8f5e9;
          border-color: #4caf50;
        }
        .center-item.undefined {
          background-color: #fff3e0;
          border-color: #ff9800;
        }
        .center-name {
          font-weight: 500;
        }
        .center-state.defined {
          color: #2e7d32;
          font-weight: 600;
        }
        .center-state.undefined {
          color: #e65100;
          font-weight: 600;
        }
        .channels-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .channel-item {
          padding: 1rem;
          border-radius: 4px;
          border: 2px solid #ddd;
        }
        .channel-item.defined {
          background-color: #e3f2fd;
          border-color: #2196f3;
        }
        .channel-item.undefined {
          background-color: #fafafa;
          border-color: #ccc;
        }
        .channel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .channel-number {
          font-weight: 600;
          color: #333;
        }
        .channel-state.defined {
          color: #1976d2;
          font-weight: 600;
        }
        .channel-state.undefined {
          color: #666;
        }
        .channel-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.9rem;
          color: #666;
        }
        .channel-name {
          font-style: italic;
        }
        .gates-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 0.75rem;
        }
        .gate-item {
          display: flex;
          flex-direction: column;
          padding: 0.75rem;
          background-color: #f9f9f9;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        .gate-number {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.25rem;
        }
        .gate-line {
          font-size: 0.9rem;
          color: #666;
        }
        .gate-planet {
          font-size: 0.85rem;
          color: #999;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
