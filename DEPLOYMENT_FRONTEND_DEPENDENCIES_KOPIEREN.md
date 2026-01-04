# 📋 Frontend Dependencies kopieren und Container neu bauen

**Problem:** Dependencies fehlen, Build nutzt Cache

---

## ✅ Schritt 1: Dependencies auf Server kopieren

**Von Windows PowerShell:**

```powershell
# Kopiere Dependencies auf Server
scp integration/api-routes/reading-validation.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/
scp integration/api-routes/reading-response-types.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/
```

---

## ✅ Schritt 2: Prüfe Dateien wurden kopiert

**Auf Server 167:**

```bash
# Prüfe Dateien existieren
ls -la /opt/hd-app/The-Connection-Key/frontend/app/reading-validation.ts
ls -la /opt/hd-app/The-Connection-Key/frontend/app/reading-response-types.ts
```

---

## ✅ Schritt 3: Container mit --no-cache neu bauen

**Auf Server 167:**

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Container stoppen und entfernen
docker stop the-connection-key-frontend-1
docker rm the-connection-key-frontend-1

# Container MIT --no-cache neu bauen (wichtig!)
docker build --no-cache -t the-connection-key-frontend -f Dockerfile .

# Container starten
docker run -d \
  --name the-connection-key-frontend-1 \
  -p 3000:3000 \
  --env-file /opt/hd-app/The-Connection-Key/.env \
  the-connection-key-frontend

# Warte 10 Sekunden
sleep 10

# Prüfe Container läuft
docker ps | grep frontend

# Prüfe Dependencies jetzt vorhanden
docker exec the-connection-key-frontend-1 ls -la /app/app/reading-validation.ts
docker exec the-connection-key-frontend-1 ls -la /app/app/reading-response-types.ts
```

---

## ✅ Schritt 4: Route testen

**Auf Server 167:**

```bash
# Teste Route direkt (ohne nginx)
curl -X POST http://localhost:3000/api/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany",
    "readingType": "basic",
    "focus": "Karriere"
  }'
```

**Erwartete Response:**
```json
{
  "success": true,
  "readingId": "...",
  "message": "Reading generation started",
  "status": "processing"
}
```
