# 🐛 Debug API Response

## Problem
JSON-Parsing-Fehler: "Expecting value: line 1 column 1 (char 0)"

## Lösung: Rohe Response prüfen

### 1. Rohe Response anzeigen (ohne JSON-Parsing)

```bash
curl -X POST http://localhost:3000/api/agents/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Erstelle eine Bodygraph-Komponente"}' -v
```

### 2. Nur Response Body (ohne Headers)

```bash
curl -X POST http://localhost:3000/api/agents/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Erstelle eine Bodygraph-Komponente"}' -s
```

### 3. Mit Status Code

```bash
curl -X POST http://localhost:3000/api/agents/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Erstelle eine Bodygraph-Komponente"}' \
  -w "\nHTTP Status: %{http_code}\n" -s
```

### 4. Prüfe Container Logs

```bash
docker logs the-connection-key-frontend-1 --tail 50
```

## Mögliche Ursachen

1. **HTML-Fehler-Seite** - Next.js gibt HTML statt JSON zurück
2. **500 Internal Server Error** - Server-Fehler
3. **CORS-Fehler** - Aber sollte bei localhost nicht auftreten
4. **Timeout** - Request dauert zu lange

## Debug-Befehl (Alles in einem)

```bash
echo "=== Rohe Response ===" && \
curl -X POST http://localhost:3000/api/agents/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Test"}' -s && \
echo "" && echo "" && echo "=== Container Logs ===" && \
docker logs the-connection-key-frontend-1 --tail 20
```

