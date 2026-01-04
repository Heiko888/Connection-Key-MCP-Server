/**
 * ReadingHeader Component
 * Zeigt Metadaten des Readings: Kontext, Agent, Zeit
 * 
 * Regeln:
 * - Keine Logik, nur Anzeige
 * - Alle Daten kommen aus Reading-API
 * - Fehlende Metadaten → sichtbarer Fallback ("unknown")
 */

'use client';

interface ReadingHeaderProps {
  context: string | null; // business | relationship | crisis | personality
  agentId: string | null;
  agentVersion: string | null;
  createdAt: string;
}

const contextColors: { [key: string]: { bg: string; text: string; label: string } } = {
  business: { bg: '#e3f2fd', text: '#1976d2', label: 'Business' },
  relationship: { bg: '#fce4ec', text: '#c2185b', label: 'Relationship' },
  crisis: { bg: '#fff3e0', text: '#e65100', label: 'Crisis' },
  personality: { bg: '#f3e5f5', text: '#7b1fa2', label: 'Personality' },
};

export function ReadingHeader({ context, agentId, agentVersion, createdAt }: ReadingHeaderProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Unbekannt';
    }
  };

  const contextInfo = context ? contextColors[context] : null;
  const displayContext = contextInfo ? contextInfo.label : (context || 'unknown');
  const displayAgentId = agentId || 'unknown';
  const displayAgentVersion = agentVersion || 'unknown';

  return (
    <div className="reading-header">
      <div className="reading-header-main">
        {/* Kontext Badge */}
        <div className="reading-context">
          {contextInfo ? (
            <span
              className="context-badge"
              style={{
                backgroundColor: contextInfo.bg,
                color: contextInfo.text,
              }}
            >
              {contextInfo.label}
            </span>
          ) : (
            <span className="context-badge context-badge-unknown">
              {displayContext}
            </span>
          )}
        </div>

        {/* Agent Info */}
        <div className="reading-agent">
          <span className="agent-label">Agent:</span>
          <span className="agent-id">{displayAgentId}</span>
          {agentVersion && (
            <span className="agent-version">v{displayAgentVersion}</span>
          )}
        </div>

        {/* Zeit */}
        <div className="reading-time">
          <span className="time-label">Erstellt:</span>
          <span className="time-value">{formatDate(createdAt)}</span>
        </div>
      </div>

      <style jsx>{`
        .reading-header {
          padding: 1.5rem;
          background-color: #fff;
          border-bottom: 2px solid #eee;
          margin-bottom: 2rem;
        }
        .reading-header-main {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          align-items: center;
        }
        .reading-context {
          display: flex;
          align-items: center;
        }
        .context-badge {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: capitalize;
        }
        .context-badge-unknown {
          background-color: #f5f5f5;
          color: #666;
        }
        .reading-agent {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }
        .agent-label {
          color: #666;
        }
        .agent-id {
          color: #333;
          font-weight: 500;
          text-transform: capitalize;
        }
        .agent-version {
          color: #999;
          font-size: 0.85rem;
        }
        .reading-time {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }
        .time-label {
          color: #666;
        }
        .time-value {
          color: #333;
        }
        @media (max-width: 768px) {
          .reading-header-main {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
