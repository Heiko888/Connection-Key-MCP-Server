# 🔧 Relationship Analysis API 404 Fix

**Problem:** API gibt 404 statt JSON-Response

---

## 🔍 Problem-Analyse

Die Route existiert lokal, wird aber im Container nicht gefunden.

---

## ✅ Lösung: Route im Container prüfen

### Schritt 1: Prüfe ob Route im Container existiert

```bash
# Auf CK-App Server
docker exec the-connection-key-frontend-1 ls -la /app/app/api/relationship-analysis/generate/route.ts
```

**Falls nicht vorhanden:**
```bash
# Route-Datei in Container kopieren
docker cp /opt/hd-app/The-Connection-Key/frontend/app/api/relationship-analysis/generate/route.ts \
  the-connection-key-frontend-1:/app/app/api/relationship-analysis/generate/route.ts
```

---

### Schritt 2: Container neu bauen (mit --no-cache)

```bash
cd /opt/hd-app/The-Connection-Key

# Container mit --no-cache neu bauen
docker compose build --no-cache frontend
docker compose up -d frontend
```

---

### Schritt 3: Prüfe ob Route auf Host existiert

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob Route existiert
ls -la app/api/relationship-analysis/generate/route.ts

# Prüfe Inhalt (sollte GET und POST exportieren)
head -30 app/api/relationship-analysis/generate/route.ts
```

---

### Schritt 4: Prüfe Docker Volume-Mount

```bash
# Prüfe docker-compose.yml
cat docker-compose.yml | grep -A 20 "frontend" | grep -E "volumes|build"

# Prüfe ob Volume gemountet ist
docker inspect the-connection-key-frontend-1 | grep -A 10 "Mounts"
```

---

## 🧪 Test nach Fix

```bash
# Warte 5 Sekunden
sleep 5

# Test GET (sollte JSON-Info zurückgeben)
curl -X GET http://localhost:3000/api/relationship-analysis/generate

# Test POST (sollte Analyse erstellen)
curl -X POST http://localhost:3000/api/relationship-analysis/generate \
  -H "Content-Type: application/json" \
  -d '{
    "person1": {
      "birthDate": "1980-12-08",
      "birthTime": "22:10",
      "birthPlace": "Miltenberg"
    },
    "person2": {
      "birthDate": "1977-06-03",
      "birthTime": "19:49",
      "birthPlace": "Wolfenbüttel"
    }
  }'
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



