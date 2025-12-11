# 🔧 Next.js neu bauen - Fix Digest Error

## Problem
- API-Route existiert ✅
- Next.js Build ist veraltet ❌
- Neue API-Route wird nicht erkannt

## Lösung: Next.js neu bauen

### Option 1: Im Container neu bauen (empfohlen)

```bash
# Baue Next.js im Container neu
docker exec -it the-connection-key-frontend-1 npm run build

# Container neu starten
docker restart the-connection-key-frontend-1
```

### Option 2: Container komplett neu erstellen

```bash
cd /opt/hd-app/The-Connection-Key

# Stoppe Frontend
docker stop the-connection-key-frontend-1
docker rm the-connection-key-frontend-1

# Baue neu (falls Dockerfile vorhanden)
docker compose build frontend

# Oder starte einfach neu (baut automatisch)
docker compose up -d frontend
```

### Option 3: Lokal bauen und dann Container neu starten

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Baue lokal
npm run build

# Container neu starten
docker restart the-connection-key-frontend-1
```

## Schnell-Fix (empfohlen)

```bash
# Baue im Container neu
docker exec -it the-connection-key-frontend-1 npm run build

# Warte bis Build fertig ist, dann:
docker restart the-connection-key-frontend-1

# Warte 5 Sekunden
sleep 5

# Teste API-Route
curl -X POST http://localhost:3000/api/agents/chart-development \
  -H "Content-Type: application/json" \
  -d '{"message":"Test"}' -s | head -20
```

## Prüfe Build nach Neustart

```bash
# Prüfe ob Build erfolgreich war
docker logs the-connection-key-frontend-1 --tail 30 | grep -E "(Build|Error|Ready)"
```

