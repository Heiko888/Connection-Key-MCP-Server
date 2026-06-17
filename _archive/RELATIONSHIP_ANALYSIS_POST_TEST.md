# 🧪 Relationship Analysis POST Test

**Status:** POST-Request ausgeführt, keine Ausgabe

---

## 🔍 Problem-Diagnose

### Mögliche Ursachen:
1. **Anfrage läuft noch** (kann bei langen Analysen 30-60 Sekunden dauern)
2. **Fehler aufgetreten** (nicht angezeigt)
3. **Timeout** (Anfrage zu langsam)

---

## ✅ Lösung: Test mit Timeout & Logs

### Schritt 1: Test mit Timeout

```bash
# Test mit 60 Sekunden Timeout
curl -X POST http://localhost:3000/api/relationship-analysis/generate \
  -H "Content-Type: application/json" \
  -d '{
    "person1": {
      "name": "Heiko",
      "birthDate": "1980-12-08",
      "birthTime": "22:10",
      "birthPlace": "Miltenberg, Germany"
    },
    "person2": {
      "name": "Jani",
      "birthDate": "1977-06-03",
      "birthTime": "19:49",
      "birthPlace": "Wolfenbüttel, Germany"
    },
    "options": {
      "includeEscalation": true,
      "includePartnerProfile": true
    }
  }' \
  --max-time 120 \
  -v
```

---

### Schritt 2: Container-Logs prüfen

```bash
# Frontend-Logs in Echtzeit
docker logs the-connection-key-frontend-1 --tail 50 -f
```

**Dann in neuem Terminal den POST-Request nochmal ausführen.**

---

### Schritt 3: Prüfe ob MCP Server erreichbar ist

```bash
# Test MCP Server direkt
curl -X POST http://138.199.237.34:7000/agent/relationship-analysis-agent \
  -H "Content-Type: application/json" \
  -d '{"message":"Test"}' \
  --max-time 30
```

---

## 🔍 Debugging

### Prüfe Environment Variable

```bash
# Im Container
docker exec the-connection-key-frontend-1 env | grep MCP_SERVER_URL
```

---

### Prüfe API Route Logs

```bash
# Container-Logs mit Filter
docker logs the-connection-key-frontend-1 2>&1 | grep -i "relationship\|error" | tail -20
```

---

**🎯 Führe zuerst den Test mit Timeout aus, dann prüfe die Logs!** 🚀



