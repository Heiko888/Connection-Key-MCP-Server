# 🔧 Docker Container neu bauen - Frontend

## Problem
- API-Route existiert auf Host ✅
- API-Route existiert NICHT im Container ❌
- Container muss neu gebaut werden

## Lösung: Container neu bauen

```bash
cd /opt/hd-app/The-Connection-Key

# 1. Stoppe Frontend
docker stop the-connection-key-frontend-1
docker rm the-connection-key-frontend-1

# 2. Baue neu (inkludiert neue API-Route)
docker compose build frontend

# 3. Starte neu
docker compose up -d frontend

# 4. Warte bis Container bereit ist
sleep 10

# 5. Prüfe ob API-Route jetzt vorhanden ist
docker exec the-connection-key-frontend-1 ls -la /app/pages/api/agents/chart-development.ts

# 6. Teste API-Route
curl -X POST http://localhost:3000/api/agents/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Erstelle eine Bodygraph-Komponente"}' | python3 -m json.tool
```

## Alles in einem Befehl

```bash
cd /opt/hd-app/The-Connection-Key && \
docker stop the-connection-key-frontend-1 && \
docker rm the-connection-key-frontend-1 && \
docker compose build frontend && \
docker compose up -d frontend && \
echo "✅ Warte 15 Sekunden..." && \
sleep 15 && \
echo "✅ Prüfe API-Route..." && \
docker exec the-connection-key-frontend-1 ls -la /app/pages/api/agents/chart-development.ts
```

## ⚠️ Wichtig

Der Build kann 2-5 Minuten dauern, da Next.js komplett neu gebaut wird.

## Nach dem Build

```bash
# Prüfe Container Status
docker ps | grep frontend

# Prüfe Logs
docker logs the-connection-key-frontend-1 --tail 30

# Teste API-Route
curl -X POST http://localhost:3000/api/agents/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Test"}' -s
```

