# 🔧 Relationship Analysis API 404 Fix

**Datum:** 18.12.2025

**Problem:** API-Route gibt 404 statt JSON-Response

---

## 🔍 Problem-Analyse

### 1. API gibt 404 (HTML statt JSON)

**Symptom:**
```bash
curl -X GET http://localhost:3000/api/relationship-analysis/generate
# Gibt HTML (404-Seite) statt JSON
```

**Ursache:**
- Route existiert, aber Next.js findet sie nicht
- Möglicherweise: Datei nicht im Container
- ODER: Route-Pfad stimmt nicht

---

### 2. Build-Fehler: "Couldn't find any `pages` or `app` directory"

**Symptom:**
```bash
docker exec the-connection-key-frontend-1 npm run build
# Error: Couldn't find any `pages` or `app` directory
```

**Ursache:**
- Build läuft im Container im Working Directory `/app`
- Dateien sind auf Host in `/opt/hd-app/The-Connection-Key/frontend`
- Container sieht Dateien nicht (Volume-Mount-Problem?)

---

## ✅ Lösung

### Schritt 1: Prüfe ob Route im Container existiert

```bash
# Prüfe ob Route-Datei im Container existiert
docker exec the-connection-key-frontend-1 ls -la /app/app/api/relationship-analysis/generate/route.ts

# ODER prüfe Working Directory
docker exec the-connection-key-frontend-1 pwd

# Prüfe ob app/ Verzeichnis existiert
docker exec the-connection-key-frontend-1 ls -la /app/app/
```

---

### Schritt 2: Prüfe Docker Volume-Mount

```bash
# Prüfe docker-compose.yml
cd /opt/hd-app/The-Connection-Key
cat docker-compose.yml | grep -A 20 "frontend"

# Prüfe ob Volume gemountet ist
docker inspect the-connection-key-frontend-1 | grep -A 10 "Mounts"
```

---

### Schritt 3: Route direkt testen (POST statt GET)

**Die Route unterstützt GET (Info) und POST (Generate):**

```bash
# GET sollte Info zurückgeben
curl -X GET http://localhost:3000/api/relationship-analysis/generate

# POST sollte Analyse erstellen
curl -X POST http://localhost:3000/api/relationship-analysis/generate \
  -H "Content-Type: application/json" \
  -d '{
    "person1": {
      "birthDate": "1980-12-08",
      "birthTime": "22:10",
      "birthPlace": "Berlin, Germany"
    },
    "person2": {
      "birthDate": "1977-06-03",
      "birthTime": "19:49",
      "birthPlace": "München, Germany"
    }
  }'
```

---

### Schritt 4: Prüfe ob Route-Datei korrekt liegt

```bash
# Auf Host
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob Route existiert
ls -la app/api/relationship-analysis/generate/route.ts

# Prüfe Inhalt (sollte GET und POST exportieren)
head -20 app/api/relationship-analysis/generate/route.ts
```

---

## 🔧 Mögliche Fixes

### Fix 1: Container neu bauen (falls Volume-Problem)

```bash
cd /opt/hd-app/The-Connection-Key

# Container stoppen
docker compose stop frontend

# Container neu bauen (inkludiert neue Dateien)
docker compose build frontend

# Container neu starten
docker compose up -d frontend
```

---

### Fix 2: Route-Datei direkt in Container kopieren

```bash
# Route-Datei in Container kopieren
docker cp /opt/hd-app/The-Connection-Key/frontend/app/api/relationship-analysis/generate/route.ts \
  the-connection-key-frontend-1:/app/app/api/relationship-analysis/generate/route.ts

# Container neu starten
docker compose restart frontend
```

---

### Fix 3: Prüfe Next.js Routing

**Next.js App Router erwartet:**
```
app/
└── api/
    └── relationship-analysis/
        └── generate/
            └── route.ts
```

**Route sollte exportieren:**
- `export async function GET()` - für Info
- `export async function POST()` - für Generate

---

## 🧪 Test nach Fix

```bash
# Warte 5 Sekunden
sleep 5

# Test GET (sollte JSON-Info zurückgeben)
curl -X GET http://localhost:3000/api/relationship-analysis/generate | jq .

# Test POST (sollte Analyse erstellen)
curl -X POST http://localhost:3000/api/relationship-analysis/generate \
  -H "Content-Type: application/json" \
  -d '{
    "person1": {
      "birthDate": "1980-12-08",
      "birthTime": "22:10",
      "birthPlace": "Berlin"
    },
    "person2": {
      "birthDate": "1977-06-03",
      "birthTime": "19:49",
      "birthPlace": "München"
    }
  }' | jq .
```

---

## 🔍 Debugging

### Prüfe Container-Logs

```bash
# Frontend-Logs
docker logs the-connection-key-frontend-1 --tail 50

# Prüfe auf Fehler
docker logs the-connection-key-frontend-1 2>&1 | grep -i error
```

---

### Prüfe Next.js Route-Registry

```bash
# Im Container
docker exec the-connection-key-frontend-1 ls -la /app/.next/server/app/api/relationship-analysis/generate/
```

---

**🎯 Wichtig:** Die Route muss im Container sichtbar sein! 🚀
