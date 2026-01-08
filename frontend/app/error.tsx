'use client';

import { useEffect } from 'react';

export const dynamic = 'force-static';
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body
        style={{
          background: '#0b0a0f',
          color: 'white',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
        }}
      >
        <div style={{ maxWidth: 600, textAlign: 'center' }}>
          <h1>Seite wird gerade vorbereitet</h1>
          <p style={{ opacity: 0.8, marginTop: 16 }}>
            Dieser Bereich ist aktuell im Umbau.
            Die Hauptseite funktioniert weiterhin.
          </p>
        </div>
      </body>
    </html>
  );
}
