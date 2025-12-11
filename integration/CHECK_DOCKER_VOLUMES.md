# 🔍 Prüfe Docker Volumes - Frontend

## Prüfe ob frontend als Volume gemountet ist

```bash
cd /opt/hd-app/The-Connection-Key

# Prüfe docker-compose.yml für Volumes
cat docker-compose.yml | grep -A 30 "frontend:" | grep -E "(volumes|\./frontend)"
```

## Falls Volume gemountet ist

Dann ist kein Rebuild nötig - die Dateien sind direkt verfügbar.

## Falls KEIN Volume gemountet ist

Dann muss der Container neu gebaut werden:

```bash
cd /opt/hd-app/The-Connection-Key

# Stoppe Frontend
docker stop the-connection-key-frontend-1
docker rm the-connection-key-frontend-1

# Baue neu (inkludiert neue API-Route)
docker compose build frontend

# Starte neu
docker compose up -d frontend
```

## Prüfe Container Volumes

```bash
# Prüfe welche Volumes gemountet sind
docker inspect the-connection-key-frontend-1 | grep -A 10 "Mounts"
```

