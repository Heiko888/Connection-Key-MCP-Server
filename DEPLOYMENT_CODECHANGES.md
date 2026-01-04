# 🚀 Deployment: Code-Änderungen (Schritt 2)

**Datum:** 28.12.2024  
**Zweck:** Refactoring-Änderungen deployen (Service Role Key, RPCs, Views)

---

## 📍 Server-Informationen

**Frontend-Server:** CK-App Server (167.235.224.149)  
**Projekt-Pfad:** `/opt/hd-app/The-Connection-Key/frontend`  
**Branch:** `feature/reading-agent-option-a-complete`

---

## 🔧 Deployment-Schritte

### **Schritt 1: SSH zum CK-App Server**

```bash
ssh root@167.235.224.149
```

---

### **Schritt 2: Ins Projekt-Verzeichnis wechseln**

```bash
cd /opt/hd-app/The-Connection-Key/frontend
```

---

### **Schritt 3: Git Pull (neue Code-Änderungen)**

```bash
# Aktuellen Branch prüfen
git branch

# Pull durchführen
git pull origin feature/reading-agent-option-a-complete

# Prüfe ob neue Dateien vorhanden sind
ls -la integration/lib/
```

**Wichtig:** Die neue Datei `integration/lib/supabase-clients.ts` muss vorhanden sein!

---

### **Schritt 4: Prüfe Docker-Status**

```bash
# Zurück ins Root-Verzeichnis
cd /opt/hd-app/The-Connection-Key

# Docker-Status prüfen
docker compose ps

# Oder direkt Frontend-Container prüfen
docker ps | grep frontend
```

---

### **Schritt 5: Frontend-Container neu bauen und starten**

**Option A: Docker Compose (empfohlen)**

```bash
cd /opt/hd-app/The-Connection-Key

# Container stoppen
docker compose stop frontend

# Container neu bauen (ohne Cache, um sicherzustellen dass neue Dateien geladen werden)
docker compose build --no-cache frontend

# Container starten
docker compose up -d frontend

# Logs prüfen
docker compose logs -f frontend
```

**Option B: Docker direkt**

```bash
cd /opt/hd-app/The-Connection-Key

# Container stoppen und entfernen
docker stop the-connection-key-frontend-1
docker rm the-connection-key-frontend-1

# Neu bauen
docker compose build --no-cache frontend

# Starten
docker compose up -d frontend

# Logs prüfen
docker logs the-connection-key-frontend-1 --tail 50 -f
```

---

### **Schritt 6: Prüfe ob Container läuft**

```bash
# Container-Status
docker ps | grep frontend

# Oder
docker compose ps frontend

# Port prüfen
lsof -i :3000
# Oder
netstat -tulpn | grep 3000
```

---

### **Schritt 7: Logs prüfen (auf Fehler)**

```bash
# Docker Compose Logs
docker compose logs frontend --tail 100

# Oder direkt
docker logs the-connection-key-frontend-1 --tail 100
```

**Wichtige Fehler zu prüfen:**
- ❌ `Cannot find module 'integration/lib/supabase-clients'` → Datei fehlt
- ❌ `NEXT_PUBLIC_SUPABASE_URL is not set` → Environment Variable fehlt
- ❌ `SUPABASE_SERVICE_ROLE_KEY is not set` → Environment Variable fehlt

---

### **Schritt 8: Testen**

**API-Route testen (User-Route mit RLS):**

```bash
# Test: Reading History (benötigt JWT)
curl -X GET "http://localhost:3000/api/readings/history?limit=10" \
  -H "Authorization: Bearer YOUR_USER_JWT_HERE" \
  -H "Content-Type: application/json"
```

**API-Route testen (System-Route):**

```bash
# Test: Reading Generate (System-Route)
curl -X POST "http://localhost:3000/api/reading/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "readingType": "basic",
    "birthDate": "1990-01-01",
    "birthTime": "12:00",
    "birthPlace": "Berlin"
  }'
```

---

## ✅ Checkliste

- [ ] Git Pull erfolgreich
- [ ] `integration/lib/supabase-clients.ts` vorhanden
- [ ] Container neu gebaut (ohne Cache)
- [ ] Container läuft
- [ ] Keine Fehler in Logs
- [ ] API-Routen testen

---

## 🔍 Troubleshooting

### **Problem: Container startet nicht**

```bash
# Logs prüfen
docker compose logs frontend

# Container-Status prüfen
docker compose ps -a

# Falls Container im "Exited" Status:
docker compose up -d frontend
```

### **Problem: Module nicht gefunden**

```bash
# Prüfe ob Dateien vorhanden sind
ls -la integration/lib/supabase-clients.ts
ls -la integration/api-routes/app-router/readings/history/route.ts

# Falls fehlt: Git Pull nochmal
git pull origin feature/reading-agent-option-a-complete
```

### **Problem: Environment Variables fehlen**

```bash
# Prüfe .env.local
cat .env.local | grep SUPABASE

# Falls fehlt, hinzufügen:
echo "NEXT_PUBLIC_SUPABASE_URL=..." >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=..." >> .env.local
echo "SUPABASE_SERVICE_ROLE_KEY=..." >> .env.local

# Container neu starten
docker compose restart frontend
```

---

## 📝 Nächste Schritte

Nach erfolgreichem Deployment:

1. ✅ **SQL-Migrationen ausführen** (Schritt 1 - falls noch nicht gemacht)
   - `011_create_reading_rpcs.sql`
   - `012_create_views_api_layer.sql`

2. ✅ **Tests durchführen**
   - User-Routen (mit JWT)
   - System-Routen
   - RPC-Aufrufe
   - Views-Zugriffe

3. ✅ **Monitoring**
   - Logs beobachten
   - Fehler prüfen
   - Performance prüfen
