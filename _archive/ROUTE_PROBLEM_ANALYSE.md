# 🔍 Route-Problem Analyse

**Problem:** Routes sind nicht im Container

**Befund:**
- ✅ Container läuft
- ✅ Next.js hat Typen generiert (`/app/.next/types/app/api/...`)
- ❌ Kein `/app/app/api` Verzeichnis im Container
- ❌ Keine Quellcode-Routes im Container

**Bedeutung:**
- Next.js hat die Routes beim Build erkannt (deshalb die Typen)
- Aber die Quellcode-Routes sind jetzt nicht mehr im Container
- Der Container hat nur `.next` (Build-Output) und `node_modules`

---

## ✅ Lösung: Prüfe Container-Konfiguration

**Auf Server prüfen:**

```bash
# 1. Prüfe docker-compose.yml
cat docker-compose.yml | grep -A 20 frontend

# 2. Prüfe Volume-Mounts
docker inspect the-connection-key-frontend-1 | grep -A 20 Mounts

# 3. Prüfe wo die Quellcode-Routes sind (lokal auf Server)
find /opt/hd-app/The-Connection-Key -path "*/app/api/*" -name "route.ts" -type f | head -10

# 4. Prüfe ob es ein app/ Verzeichnis gibt
ls -la /opt/hd-app/The-Connection-Key/frontend/ | grep app
```

---

## 🔧 Mögliche Lösungen

### **1. Routes sind lokal, aber nicht im Container**

**Lösung:** Routes in Container kopieren oder Volume-Mount hinzufügen

```bash
# Prüfe ob Routes lokal existieren
ls -la /opt/hd-app/The-Connection-Key/frontend/app/api/

# Kopiere Routes in Container
docker cp /opt/hd-app/The-Connection-Key/frontend/app/api \
  the-connection-key-frontend-1:/app/app/api
```

### **2. Container muss neu gebaut werden**

**Lösung:** Container mit Routes neu bauen

```bash
cd /opt/hd-app/The-Connection-Key
docker compose build frontend
docker compose restart frontend
```

### **3. Volume-Mount fehlt**

**Lösung:** docker-compose.yml anpassen

```yaml
frontend:
  volumes:
    - ./frontend/app:/app/app
```

---

**🚀 Führe zuerst die Prüfungen aus, um zu sehen, wo die Routes sind!**
