# 🔄 Docker Container neu starten

## Problem
`docker-compose` nicht gefunden, aber Docker läuft.

## Lösung

### Option 1: Docker Compose (mit Leerzeichen - neuere Version)

```bash
cd /opt/hd-app/The-Connection-Key
docker compose restart frontend
```

### Option 2: Docker direkt (einfachste Lösung)

```bash
docker restart the-connection-key-frontend-1
```

### Option 3: Komplett neu starten (falls Environment Variables nicht geladen werden)

```bash
cd /opt/hd-app/The-Connection-Key
docker compose stop frontend
docker compose up -d frontend
```

## ✅ Empfohlene Lösung

```bash
# Container direkt neu starten
docker restart the-connection-key-frontend-1

# Warte 5 Sekunden
sleep 5

# Teste API-Route
curl -X POST http://localhost:3000/api/agents/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Erstelle eine Bodygraph-Komponente"}' | python3 -m json.tool
```

## 📋 Prüfe Environment Variables im Container

```bash
# Prüfe ob Environment Variables im Container vorhanden sind
docker exec the-connection-key-frontend-1 env | grep -E "(MCP_SERVER_URL|READING_AGENT_URL)"
```

## ⚠️ Wichtig: Environment Variables in Docker

Falls die Environment Variables nicht im Container vorhanden sind, müssen Sie:

1. **docker-compose.yml prüfen** - ob `.env.local` als Volume gemountet ist
2. **Oder Environment Variables direkt in docker-compose.yml setzen**

```bash
# Prüfe docker-compose.yml
cat docker-compose.yml | grep -A 10 "frontend"
```

