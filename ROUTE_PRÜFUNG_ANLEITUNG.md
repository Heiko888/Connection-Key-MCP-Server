# 🔍 Route-Prüfung - Detaillierte Anleitung

**Problem:** Script findet keine Routes im Container

**Mögliche Ursachen:**
1. Routes sind nicht im Container
2. Pfad ist falsch
3. Routes sind an anderer Stelle

---

## ✅ Lösung: Detaillierte Prüfung

**Auf Server ausführen:**

```bash
cat > /opt/hd-app/The-Connection-Key/check-routes-detailed.sh << 'EOF'
#!/bin/bash

CONTAINER_NAME="the-connection-key-frontend-1"

echo "🔍 Detaillierte Route-Prüfung"
echo "============================="
echo ""

if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Container läuft nicht!"
    exit 1
fi

echo "✅ Container läuft"
echo ""

# Prüfe Verzeichnisstruktur
echo "📁 Verzeichnisstruktur:"
docker exec $CONTAINER_NAME ls -la /app/ | head -20
echo ""

# Suche nach route.ts Dateien
echo "📁 Suche nach route.ts Dateien:"
docker exec $CONTAINER_NAME find /app -name "route.ts" -type f 2>/dev/null
echo ""

# Suche nach .ts Dateien in api Verzeichnissen
echo "📁 Suche nach .ts Dateien in api Verzeichnissen:"
docker exec $CONTAINER_NAME find /app -path "*/api/*" -name "*.ts" -type f 2>/dev/null
echo ""

# Prüfe spezifische Pfade
echo "📁 Prüfe spezifische Pfade:"
for path in "/app/app/api" "/app/pages/api" "/app/src/app/api" "/app/src/pages/api" "/app/api"; do
    if docker exec $CONTAINER_NAME test -d "$path" 2>/dev/null; then
        echo "   ✅ $path existiert"
        docker exec $CONTAINER_NAME find "$path" -name "*.ts" 2>/dev/null | head -5
    fi
done

echo ""
echo "✅ Prüfung abgeschlossen!"
EOF

chmod +x /opt/hd-app/The-Connection-Key/check-routes-detailed.sh
./check-routes-detailed.sh
```

---

## 🔍 Alternative: Manuelle Prüfung

**Direkt im Container prüfen:**

```bash
# Container-Shell öffnen
docker exec -it the-connection-key-frontend-1 /bin/bash

# Dann im Container:
ls -la /app/
find /app -name "route.ts" -type f
find /app -path "*/api/*" -name "*.ts" -type f
```

---

## 📋 Mögliche Lösungen

### **1. Routes sind nicht im Container**

**Lösung:** Routes müssen in den Container kopiert werden

```bash
# Prüfe ob Routes lokal existieren
ls -la integration/api-routes/app-router/

# Kopiere Routes in Container
docker cp integration/api-routes/app-router/agents/website-ux-agent/route.ts \
  the-connection-key-frontend-1:/app/app/api/agents/website-ux-agent/route.ts
```

### **2. Routes sind an anderer Stelle**

**Lösung:** Prüfe Dockerfile oder docker-compose.yml

```bash
# Prüfe Dockerfile
cat docker-compose.yml | grep -A 10 frontend

# Prüfe Volume-Mounts
docker inspect the-connection-key-frontend-1 | grep -A 10 Mounts
```

### **3. Container muss neu gebaut werden**

**Lösung:** Routes müssen beim Build eingebunden werden

```bash
# Container neu bauen
cd /opt/hd-app/The-Connection-Key
docker compose build frontend
docker compose restart frontend
```

---

**🚀 Führe zuerst die detaillierte Prüfung aus, um zu sehen, wo die Routes sind!**
