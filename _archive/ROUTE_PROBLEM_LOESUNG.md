# 🔍 Route-Problem: Lösung

**Problem:** Routes sind nicht im Container

**Befund:**
- ✅ Container läuft (`the-connection-key-frontend-1`)
- ✅ Next.js hat Typen generiert (`/app/.next/types/app/api/...`)
- ❌ Kein `/app/app/api` Verzeichnis im Container
- ❌ Keine Quellcode-Routes im Container

**Bedeutung:**
- Next.js hat die Routes beim Build erkannt (deshalb die Typen)
- Aber die Quellcode-Routes sind jetzt nicht mehr im Container
- Der Container hat nur `.next` (Build-Output) und `node_modules`

---

## ✅ Lösung: Prüfe wo die Routes sind

**Auf Server prüfen:**

```bash
# 1. Prüfe ob Routes lokal auf Server existieren
find /opt/hd-app/The-Connection-Key -path "*/app/api/*" -name "route.ts" -type f | head -10

# 2. Prüfe docker-compose.yml (möglicherweise andere Datei)
ls -la /opt/hd-app/The-Connection-Key/*.yml

# 3. Prüfe Container-Konfiguration
docker inspect the-connection-key-frontend-1 | grep -A 20 "Mounts"

# 4. Prüfe ob es ein app/ Verzeichnis lokal gibt
ls -la /opt/hd-app/The-Connection-Key/frontend/ | grep app
```

---

## 🔧 Lösung 1: Routes in Container kopieren

**Wenn Routes lokal existieren:**

```bash
# Prüfe ob Routes lokal existieren
ls -la /opt/hd-app/The-Connection-Key/frontend/app/api/

# Kopiere Routes in Container
docker cp /opt/hd-app/The-Connection-Key/frontend/app/api \
  the-connection-key-frontend-1:/app/app/api

# Container neu starten
docker compose restart frontend
```

---

## 🔧 Lösung 2: Container neu bauen

**Wenn Routes beim Build vorhanden waren:**

```bash
cd /opt/hd-app/The-Connection-Key

# Prüfe ob Routes lokal sind
ls -la frontend/app/api/

# Container neu bauen
docker compose build frontend
docker compose restart frontend
```

---

## 🔧 Lösung 3: Volume-Mount hinzufügen

**Wenn Routes lokal sind, aber nicht im Container:**

**Prüfe docker-compose.yml:**

```bash
cat docker-compose.yml | grep -A 30 frontend
```

**Falls kein Volume-Mount existiert, füge hinzu:**

```yaml
frontend:
  volumes:
    - ./frontend/app:/app/app
```

**Dann:**

```bash
docker compose up -d frontend
```

---

## 🚀 Schnellste Lösung: Prüfe zuerst

**Auf Server ausführen:**

```bash
# 1. Prüfe wo Routes sind
echo "=== Suche Routes lokal ==="
find /opt/hd-app/The-Connection-Key -path "*/app/api/*" -name "route.ts" -type f | head -5

echo ""
echo "=== Prüfe Container Volumes ==="
docker inspect the-connection-key-frontend-1 | grep -A 10 "Mounts"

echo ""
echo "=== Prüfe docker-compose.yml ==="
cat /opt/hd-app/The-Connection-Key/docker-compose.yml | grep -A 20 frontend
```

**Dann entscheide, welche Lösung passt!**
