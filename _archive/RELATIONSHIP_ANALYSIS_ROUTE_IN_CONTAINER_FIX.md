# 🔧 Relationship Analysis Route - Container Fix

**Problem:** Route existiert auf Host, aber nicht im Container

---

## ✅ Schnell-Fix: Route in Container kopieren

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# Route-Datei in Container kopieren
docker cp app/api/relationship-analysis/generate/route.ts \
  the-connection-key-frontend-1:/app/app/api/relationship-analysis/generate/route.ts

# Container neu starten (damit Next.js die Route erkennt)
docker compose restart frontend
```

---

## ✅ Dauerhafter Fix: Container neu bauen

```bash
cd /opt/hd-app/The-Connection-Key

# Container mit --no-cache neu bauen
docker compose build --no-cache frontend
docker compose up -d frontend
```

---

## 🧪 Test nach Fix

```bash
# Warte 5 Sekunden
sleep 5

# Test GET
curl -X GET http://localhost:3000/api/relationship-analysis/generate

# Test POST
curl -X POST http://localhost:3000/api/relationship-analysis/generate \
  -H "Content-Type: application/json" \
  -d '{
    "person1": {
      "birthDate": "1980-12-08",
      "birthTime": "22:10",
      "birthPlace": "Miltenberg"
    },
    "person2": {
      "birthDate": "1977-06-03",
      "birthTime": "19:49",
      "birthPlace": "Wolfenbüttel"
    }
  }'
```

---

**🎯 Führe zuerst den Schnell-Fix aus, dann den dauerhaften Fix!** 🚀



