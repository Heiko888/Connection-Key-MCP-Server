# ✅ Chart Development Agent - API Test

## Container neu gestartet ✅

## Nächste Schritte

### 1. Prüfe Environment Variables im Container

```bash
docker exec the-connection-key-frontend-1 env | grep -E "(MCP_SERVER_URL|READING_AGENT_URL)"
```

**Erwartete Ausgabe:**
```
MCP_SERVER_URL=http://138.199.237.34:7000
READING_AGENT_URL=http://138.199.237.34:4001
```

### 2. Teste API-Route

```bash
curl -X POST http://localhost:3000/api/agents/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Erstelle eine Bodygraph-Komponente mit React und SVG"}' | python3 -m json.tool
```

**Erwartete Ausgabe:**
```json
{
  "success": true,
  "agent": "chart-development",
  "message": "Erstelle eine Bodygraph-Komponente mit React und SVG",
  "response": "...",
  "tokens": ...,
  "model": "gpt-4",
  "timestamp": "..."
}
```

### 3. Prüfe Container Logs (falls Fehler)

```bash
docker logs the-connection-key-frontend-1 --tail 50
```

## Alles in einem Befehl

```bash
echo "1. Prüfe Environment Variables..." && \
docker exec the-connection-key-frontend-1 env | grep -E "(MCP_SERVER_URL|READING_AGENT_URL)" && \
echo "" && echo "2. Teste API-Route..." && \
curl -X POST http://localhost:3000/api/agents/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Erstelle eine Bodygraph-Komponente"}' | python3 -m json.tool
```

## ⚠️ Falls Environment Variables fehlen

Falls die Environment Variables nicht im Container vorhanden sind:

1. **Prüfe docker-compose.yml:**
```bash
cat docker-compose.yml | grep -A 20 "frontend"
```

2. **Füge Environment Variables in docker-compose.yml hinzu:**
```yaml
services:
  frontend:
    environment:
      - MCP_SERVER_URL=http://138.199.237.34:7000
      - READING_AGENT_URL=http://138.199.237.34:4001
```

3. **Oder mounte .env.local:**
```yaml
services:
  frontend:
    env_file:
      - ./frontend/.env.local
```

4. **Dann Container neu erstellen:**
```bash
docker compose down frontend
docker compose up -d frontend
```

