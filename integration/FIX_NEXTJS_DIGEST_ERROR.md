# 🔧 Fix Next.js Digest Error

## Problem
```
TypeError: Cannot read properties of null (reading 'digest')
```

## Ursache
Dieser Fehler tritt oft auf, wenn:
1. API-Route nicht korrekt erstellt wurde
2. Next.js Build veraltet ist
3. Datei-Struktur nicht korrekt ist

## Lösung

### 1. Prüfe ob API-Route existiert

```bash
# Prüfe ob Datei existiert
ls -la /opt/hd-app/The-Connection-Key/frontend/pages/api/agents/chart-development.ts

# Prüfe Inhalt
head -20 /opt/hd-app/The-Connection-Key/frontend/pages/api/agents/chart-development.ts
```

### 2. Prüfe Next.js Build

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob .next Verzeichnis existiert
ls -la .next

# Prüfe Build-Status
cat .next/BUILD_ID 2>/dev/null || echo "Build nicht gefunden"
```

### 3. Next.js neu bauen

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Stoppe Container
docker stop the-connection-key-frontend-1

# Baue neu (im Container oder lokal)
docker exec -it the-connection-key-frontend-1 npm run build

# Oder lokal bauen und dann Container neu starten
npm run build
docker start the-connection-key-frontend-1
```

### 4. Container komplett neu erstellen

```bash
cd /opt/hd-app/The-Connection-Key

# Stoppe Frontend
docker stop the-connection-key-frontend-1
docker rm the-connection-key-frontend-1

# Baue neu
docker compose build frontend

# Starte neu
docker compose up -d frontend
```

### 5. Prüfe API-Route Syntax

```bash
# Prüfe TypeScript Syntax
cd /opt/hd-app/The-Connection-Key/frontend
npx tsc --noEmit pages/api/agents/chart-development.ts
```

## Schnell-Fix

```bash
cd /opt/hd-app/The-Connection-Key/frontend && \
echo "1. Prüfe API-Route..." && \
ls -la pages/api/agents/chart-development.ts && \
echo "" && echo "2. Prüfe Build..." && \
ls -la .next 2>/dev/null || echo "Build nicht gefunden" && \
echo "" && echo "3. Container Logs..." && \
docker logs the-connection-key-frontend-1 --tail 30
```

