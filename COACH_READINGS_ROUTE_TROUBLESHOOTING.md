# 🔍 Coach Readings Route - Troubleshooting

**Problem:** `curl: (56) Recv failure: Connection reset by peer`

---

## 🔍 Diagnose

### Schritt 1: Container-Status prüfen

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key

# Container-Status
docker compose ps frontend

# Container-Logs (letzte 50 Zeilen)
docker logs the-connection-key-frontend-1 --tail 50
```

### Schritt 2: Warte auf Container-Start

```bash
# Warte 10-15 Sekunden (Next.js braucht Zeit zum Kompilieren)
sleep 15

# Nochmal testen
curl -X GET http://localhost:3000/api/coach/readings
```

### Schritt 3: Prüfe ob Route existiert

```bash
# Prüfe ob Datei im Container existiert
docker exec the-connection-key-frontend-1 ls -la /app/app/api/coach/readings/route.ts

# Prüfe Datei-Inhalt (erste 20 Zeilen)
docker exec the-connection-key-frontend-1 head -20 /app/app/api/coach/readings/route.ts
```

### Schritt 4: Prüfe Next.js Build-Logs

```bash
# Logs in Echtzeit anzeigen
docker logs the-connection-key-frontend-1 -f

# In neuem Terminal dann testen:
curl -X GET http://localhost:3000/api/coach/readings
```

---

## 🔧 Mögliche Lösungen

### Lösung 1: Container nochmal neu starten

```bash
cd /opt/hd-app/The-Connection-Key
docker compose restart frontend
sleep 10
curl -X GET http://localhost:3000/api/coach/readings
```

### Lösung 2: Prüfe Next.js Kompilierung

```bash
# Logs prüfen auf Fehler
docker logs the-connection-key-frontend-1 2>&1 | grep -i error

# Prüfe ob Next.js läuft
docker exec the-connection-key-frontend-1 ps aux | grep next
```

### Lösung 3: Route direkt im Container prüfen

```bash
# In Container einloggen
docker exec -it the-connection-key-frontend-1 sh

# Prüfe Route
cat /app/app/api/coach/readings/route.ts

# Prüfe ob Next.js die Route erkennt
ls -la /app/app/api/coach/readings/
```

---

## ✅ Erwartetes Verhalten

Nach erfolgreichem Start sollte `curl -X GET http://localhost:3000/api/coach/readings` zurückgeben:

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

**🎯 Führe die Diagnose-Schritte aus, um das Problem zu identifizieren!** 🚀



