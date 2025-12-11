# 🔧 CSS @import Fehler beheben

## Problem
```
Define @import rules at the top of the stylesheet
An @import rule was ignored because it wasn't defined at the top of the stylesheet.
```

## Lösung

### Schritt 1: CSS-Datei finden

Die Fehlermeldung bezieht sich auf eine generierte CSS-Datei. Prüfe, welche CSS-Dateien importiert werden:

```bash
# Im Container
docker exec the-connection-key-frontend-1 grep -r 'import.*\.css' /app --include='*.ts' --include='*.tsx'
```

### Schritt 2: CSS-Datei prüfen

Falls `styles/agents.css` oder ähnliche Dateien existieren:

```bash
# Prüfe ob @import nicht am Anfang steht
docker exec the-connection-key-frontend-1 cat /app/styles/agents.css | head -20
```

### Schritt 3: CSS-Datei korrigieren

**@import-Regeln MÜSSEN am Anfang stehen, vor allen anderen CSS-Regeln:**

```css
/* ✅ RICHTIG */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

.agent-chat-container {
  /* ... */
}

/* ❌ FALSCH */
.agent-chat-container {
  /* ... */
}

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
```

### Schritt 4: App neu bauen

```bash
cd /opt/hd-app/The-Connection-Key
docker compose exec frontend npm run build
docker compose restart frontend
```

## Alternative: CSS ohne @import verwenden

Falls @import nicht nötig ist, entfernen und stattdessen:

1. **Fonts über `<link>` in `_app.tsx` oder `layout.tsx`:**
```tsx
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
```

2. **Oder CSS-Variablen verwenden statt @import**

## Schnell-Fix

Falls die CSS-Datei im Container ist:

```bash
# 1. CSS-Datei finden und prüfen
docker exec the-connection-key-frontend-1 find /app -name '*.css' -type f

# 2. @import-Regeln an den Anfang verschieben
# (Manuell bearbeiten oder sed verwenden)

# 3. App neu bauen
docker compose restart frontend
```

