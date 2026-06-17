# 🔧 Coach Readings Route - Datei fehlt im Container

**Problem:** Route existiert nicht im Container: `/app/app/api/coach/readings/route.ts`

---

## 🔍 Lösung: Datei in Container kopieren

### Schritt 1: Prüfe ob Datei auf Host existiert

```bash
# Auf CK-App Server
ls -la /opt/hd-app/The-Connection-Key/frontend/app/api/coach/readings/route.ts
```

### Schritt 2: Datei in Container kopieren (Quick-Fix)

```bash
# Container stoppen
cd /opt/hd-app/The-Connection-Key
docker compose stop frontend

# Datei in Container kopieren
docker cp /opt/hd-app/The-Connection-Key/frontend/app/api/coach/readings/route.ts the-connection-key-frontend-1:/app/app/api/coach/readings/route.ts

# Container starten
docker compose up -d frontend

# Warte 15 Sekunden
sleep 15

# Teste
curl -X GET http://localhost:3000/api/coach/readings
```

### Schritt 3: Falls Datei auf Host nicht existiert - Erstelle sie

```bash
# Verzeichnis erstellen
mkdir -p /opt/hd-app/The-Connection-Key/frontend/app/api/coach/readings

# Datei erstellen (Inhalt aus integration/api-routes/app-router/coach/readings/route.ts kopieren)
nano /opt/hd-app/The-Connection-Key/frontend/app/api/coach/readings/route.ts

# Dann Container neu bauen
docker compose build --no-cache frontend
docker compose up -d frontend
```

---

## ✅ Erwartetes Ergebnis

Nach dem Fix sollte `curl -X GET http://localhost:3000/api/coach/readings` zurückgeben:

```json
{
  "success": true,
  "message": "Coach Readings API",
  "endpoint": "/api/coach/readings",
  "method": "POST",
  "description": "Erstellt Readings für Coaches (single, connection, penta)",
  "supportedTypes": {
    "connection": "Verwendet Relationship Analysis Agent",
    "single": "Wird noch implementiert",
    "penta": "Wird noch implementiert"
  }
}
```

---

**🎯 Führe Schritt 1 aus, um zu prüfen, ob die Datei auf dem Host existiert!** 🚀



