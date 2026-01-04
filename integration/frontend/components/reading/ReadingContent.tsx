/**
 * ReadingContent Component
 * Zeigt Reading-Text mit sauberer Typografie
 * 
 * Regeln:
 * - Kein Wissen über Chart
 * - Kein Wissen über Agent
 * - Nur Darstellung
 */

'use client';

interface ReadingContentProps {
  text: string;
  essence?: string | null;
}

export function ReadingContent({ text, essence }: ReadingContentProps) {
  // Teile Text in Absätze
  const paragraphs = text.split('\n').filter((p) => p.trim().length > 0);

  return (
    <div className="reading-content">
      {/* Reading Text */}
      <div className="reading-text">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="reading-paragraph">
            {paragraph.trim()}
          </p>
        ))}
      </div>

      {/* Essence (optional) */}
      {essence && (
        <div className="reading-essence">
          <h3 className="essence-title">Essence</h3>
          <div className="essence-content">
            {essence.split('\n').map((paragraph, index) => (
              <p key={index} className="essence-paragraph">
                {paragraph.trim()}
              </p>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .reading-content {
          padding: 2rem;
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .reading-text {
          line-height: 1.8;
          color: #333;
        }
        .reading-paragraph {
          margin: 0 0 1.5rem 0;
          font-size: 1.05rem;
        }
        .reading-paragraph:last-child {
          margin-bottom: 0;
        }
        .reading-essence {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 2px solid #eee;
        }
        .essence-title {
          margin: 0 0 1rem 0;
          color: #444;
          font-size: 1.3rem;
        }
        .essence-content {
          line-height: 1.8;
          color: #555;
          font-style: italic;
        }
        .essence-paragraph {
          margin: 0 0 1.5rem 0;
          font-size: 1rem;
        }
        .essence-paragraph:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
}
