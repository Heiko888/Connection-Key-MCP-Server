# 🔧 Frontend 502 Bad Gateway - Fix

**Problem:** nginx kann Container nicht erreichen

---

## ✅ Schritt 1: Route lokal im Container testen

**Auf Server 167:**

```bash
# Teste Route direkt im Container (ohne nginx)
docker exec the-connection-key-frontend-1 curl -X POST http://localhost:3000/api/reading/generate \
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

**Falls curl nicht im Container ist:**

```bash
# Prüfe Container Logs für Fehler
docker logs the-connection-key-frontend-1 --tail 50 | grep -i "error\|reading\|route"
```

---

## ✅ Schritt 2: Dependencies prüfen

**Auf Server 167:**

```bash
# Prüfe ob Dependencies im Container existieren
docker exec the-connection-key-frontend-1 ls -la /app/app/reading-validation.ts
docker exec the-connection-key-frontend-1 ls -la /app/app/reading-response-types.ts

# Prüfe ob Route-Datei korrekt ist
docker exec the-connection-key-frontend-1 grep -n "requiredFields.*name.*focus" /app/app/api/reading/generate/route.ts
```

---

## ✅ Schritt 3: Falls Dependencies fehlen

**Kopiere Dependencies von lokal:**

```powershell
# Von Windows PowerShell
scp integration/api-routes/reading-validation.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/
scp integration/api-routes/reading-response-types.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/
```

**Dann Container neu bauen:**

```bash
cd /opt/hd-app/The-Connection-Key/frontend
docker stop the-connection-key-frontend-1
docker rm the-connection-key-frontend-1
docker build -t the-connection-key-frontend -f Dockerfile .
docker run -d \
  --name the-connection-key-frontend-1 \
  -p 3000:3000 \
  --env-file /opt/hd-app/The-Connection-Key/.env \
  the-connection-key-frontend
```

---

## ✅ Schritt 4: nginx Konfiguration prüfen

**Auf Server 167:**

```bash
# Prüfe nginx Konfiguration
cat /etc/nginx/sites-available/the-connection-key.de | grep -A 10 "location /api"

# Prüfe ob nginx Container läuft (falls in Docker)
docker ps | grep nginx

# Oder prüfe nginx Service
systemctl status nginx
```

**Falls nginx in Docker läuft:**

```bash
# Prüfe nginx Logs
docker logs nginx-container-name --tail 50
```

---

## ✅ Schritt 5: Container Netzwerk prüfen

**Auf Server 167:**

```bash
# Prüfe ob Container auf Port 3000 hört
netstat -tlnp | grep 3000

# Oder
ss -tlnp | grep 3000

# Teste direkt auf Server-IP (ohne Domain)
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
