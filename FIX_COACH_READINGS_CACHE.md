# 🔧 Coach Readings Route - Cache-Fix

**Problem:** `Error: Failed to find Server Action "x"` - Next.js Cache-Problem

---

## 🔍 Lösung: Next.js Cache löschen

### Schritt 1: Prüfe ob Route existiert

```bash
# Prüfe ob Datei im Container existiert
docker exec the-connection-key-frontend-1 ls -la /app/app/api/coach/readings/route.ts
```

### Schritt 2: Next.js Cache löschen

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key

# Container stoppen
docker compose stop frontend

# Next.js Cache im Container löschen
docker exec the-connection-key-frontend-1 rm -rf /app/.next

# Container neu starten
docker compose up -d frontend

# Warte 15 Sekunden
sleep 15

# Teste
curl -X GET http://localhost:3000/api/coach/readings
```

### Schritt 3: Falls das nicht hilft - Komplett neu bauen

```bash
# Container stoppen
docker compose stop frontend

# Container entfernen
docker compose rm -f frontend

# Neu bauen (ohne Cache)
docker compose build --no-cache frontend

# Starten
docker compose up -d frontend

# Warte 20 Sekunden
sleep 20

# Teste
curl -X GET http://localhost:3000/api/coach/readings
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

**🎯 Führe Schritt 2 aus, um den Cache zu löschen!** 🚀



