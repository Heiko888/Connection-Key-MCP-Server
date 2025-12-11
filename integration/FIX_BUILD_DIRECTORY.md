# 🔧 Fix Build Directory - Next.js Build

## Problem
```
Error: > Couldn't find any `pages` or `app` directory. Please create one under the project root
```

## Ursache
Der Build wird im falschen Verzeichnis ausgeführt. Der Container arbeitet wahrscheinlich in `/app`, aber die Dateien sind in `/opt/hd-app/The-Connection-Key/frontend`.

## Lösung

### 1. Prüfe Working Directory im Container

```bash
# Prüfe wo der Container arbeitet
docker exec the-connection-key-frontend-1 pwd

# Prüfe ob pages Verzeichnis existiert
docker exec the-connection-key-frontend-1 ls -la pages 2>/dev/null || echo "pages nicht gefunden"

# Prüfe Container Working Directory
docker inspect the-connection-key-frontend-1 | grep -A 5 "WorkingDir"
```

### 2. Baue im richtigen Verzeichnis

```bash
# Baue im Container im richtigen Verzeichnis
docker exec -w /app the-connection-key-frontend-1 npm run build

# Oder falls Working Directory anders ist
docker exec -w /opt/hd-app/The-Connection-Key/frontend the-connection-key-frontend-1 npm run build
```

### 3. Prüfe docker-compose.yml

```bash
cd /opt/hd-app/The-Connection-Key
cat docker-compose.yml | grep -A 20 "frontend"
```

### 4. Alternative: Container komplett neu erstellen

```bash
cd /opt/hd-app/The-Connection-Key

# Stoppe Frontend
docker stop the-connection-key-frontend-1
docker rm the-connection-key-frontend-1

# Baue neu (baut automatisch im richtigen Verzeichnis)
docker compose build frontend
docker compose up -d frontend
```

## Schnell-Check

```bash
echo "=== Working Directory ===" && \
docker exec the-connection-key-frontend-1 pwd && \
echo "" && echo "=== Prüfe pages Verzeichnis ===" && \
docker exec the-connection-key-frontend-1 ls -la pages 2>/dev/null || \
docker exec the-connection-key-frontend-1 find / -name "pages" -type d 2>/dev/null | head -5
```

