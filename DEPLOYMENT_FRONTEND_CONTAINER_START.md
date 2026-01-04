# 🚀 Frontend Container Starten (nach Build)

**Status:** Container erfolgreich neu gebaut ✅

**Problem:** Alter Container blockiert den Namen

---

## ✅ Schritt 1: Alter Container entfernen

**Auf Server 167:**

```bash
# Container stoppen
docker stop the-connection-key-frontend-1

# Container entfernen
docker rm the-connection-key-frontend-1

# Prüfe Container ist weg
docker ps -a | grep frontend
```

---

## ✅ Schritt 2: Neuen Container starten

**Auf Server 167:**

```bash
# Container starten mit Environment Variables
docker run -d \
  --name the-connection-key-frontend-1 \
  -p 3000:3000 \
  --env-file /opt/hd-app/The-Connection-Key/.env \
  the-connection-key-frontend

# Warte 10 Sekunden
sleep 10

# Prüfe Container läuft
docker ps | grep frontend

# Prüfe Logs (sollte "Ready" zeigen)
docker logs the-connection-key-frontend-1 --tail 30
```

---

## ✅ Schritt 3: Route testen

**Auf Server 167:**

```bash
curl -X POST https://www.the-connection-key.de/api/reading/generate \
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

---

## 🔍 Falls Container nicht startet

**Prüfe Logs:**

```bash
docker logs the-connection-key-frontend-1 --tail 50
```

**Prüfe Environment Variables:**

```bash
docker exec the-connection-key-frontend-1 env | grep -E "SUPABASE|MCP"
```
