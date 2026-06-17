# 📦 Workbook-Schnittstelle - Deployment auf Server

**Datum:** 17.12.2025

**Ziel:** Welche Dateien müssen auf den Server?

---

## ✅ Was MUSS auf den Server

### 1. API-Route (Pflicht)

**Datei:** `integration/api-routes/app-router/workbook/chart-data/route.ts`

**Ziel-Pfad auf Server:**
```
/opt/hd-app/The-Connection-Key/frontend/app/api/workbook/chart-data/route.ts
```

**Warum:** Das ist die API-Route, die vom Frontend aufgerufen wird.

---

### 2. Workbook-Service (Optional, aber empfohlen)

**Datei:** `integration/services/workbook-service.ts`

**Ziel-Pfad auf Server:**
```
/opt/hd-app/The-Connection-Key/frontend/lib/services/workbook-service.ts
```

**Warum:** Service-Klasse für einfache Verwendung im Frontend.

---

## ❌ Was NICHT auf den Server muss

### Test-Scripts (nur lokal)
- `test-workbook-api.sh` ❌
- `test-workbook-api.ps1` ❌
- `WORKBOOK_API_TEST_ANLEITUNG.md` ❌

**Warum:** Diese sind nur zum lokalen Testen gedacht.

---

## 📋 Deployment-Schritte

### Schritt 1: Dateien auf Server kopieren

```bash
# Auf Server: Frontend-Verzeichnis
cd /opt/hd-app/The-Connection-Key/frontend

# API-Route-Verzeichnis erstellen
mkdir -p app/api/workbook/chart-data

# API-Route kopieren (von lokal via scp)
# ODER direkt auf Server:
# Wenn du die Dateien bereits im integration/ Verzeichnis hast:
cp integration/api-routes/app-router/workbook/chart-data/route.ts app/api/workbook/chart-data/

# Service-Verzeichnis erstellen (optional)
mkdir -p lib/services

# Service kopieren (optional)
cp integration/services/workbook-service.ts lib/services/
```

---

### Schritt 2: Environment Variables prüfen

**Datei:** `.env.local` (im Frontend-Verzeichnis)

**Muss enthalten:**
```env
MCP_SERVER_URL=http://138.199.237.34:7000
```

**Prüfen:**
```bash
cd /opt/hd-app/The-Connection-Key/frontend
grep MCP_SERVER_URL .env.local
```

**Falls nicht vorhanden:**
```bash
echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local
```

---

### Schritt 3: Frontend neu starten

**Wenn Docker:**
```bash
cd /opt/hd-app/The-Connection-Key
docker-compose restart frontend
# ODER
docker-compose up -d --build frontend
```

**Wenn direkt (npm run dev):**
```bash
cd /opt/hd-app/The-Connection-Key/frontend
# Prozess stoppen (falls läuft)
pm2 stop frontend  # ODER: pkill -f "next dev"
# Neu starten
npm run dev -p 3005
# ODER mit PM2:
pm2 start npm --name "frontend" -- run dev -- -p 3005
```

---

## 🔍 Verifikation

### Test 1: API-Route existiert

```bash
# Auf Server
ls -la /opt/hd-app/The-Connection-Key/frontend/app/api/workbook/chart-data/route.ts
```

**Erwartet:** Datei existiert

---

### Test 2: API-Endpoint erreichbar

```bash
# Vom Server aus
curl -X GET http://localhost:3005/api/workbook/chart-data
```

**Erwartet:** JSON-Response mit API-Info

---

### Test 3: Von außen erreichbar

```bash
# Von lokalem Rechner
curl -X GET http://167.235.224.149:3005/api/workbook/chart-data
```

**Erwartet:** JSON-Response mit API-Info

---

## 📊 Zusammenfassung

### Muss auf Server:
1. ✅ `app/api/workbook/chart-data/route.ts` (API-Route)
2. ✅ `.env.local` mit `MCP_SERVER_URL` (Environment Variable)
3. ⚠️ `lib/services/workbook-service.ts` (Optional, aber empfohlen)

### Muss NICHT auf Server:
1. ❌ Test-Scripts (`test-workbook-api.sh`, `test-workbook-api.ps1`)
2. ❌ Dokumentation (`*.md` Dateien)
3. ❌ Lokale Test-Dateien

---

## 🚀 Quick-Deployment (Ein Befehl)

**Wenn du die Dateien bereits im `integration/` Verzeichnis auf dem Server hast:**

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# API-Route kopieren
mkdir -p app/api/workbook/chart-data
cp integration/api-routes/app-router/workbook/chart-data/route.ts app/api/workbook/chart-data/

# Service kopieren (optional)
mkdir -p lib/services
cp integration/services/workbook-service.ts lib/services/

# Environment Variable prüfen/setzen
if ! grep -q "MCP_SERVER_URL" .env.local; then
  echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local
fi

# Frontend neu starten (Docker)
docker-compose restart frontend
# ODER (direkt)
# pm2 restart frontend
```

---

## 🎯 Checkliste

- [ ] API-Route kopiert (`app/api/workbook/chart-data/route.ts`)
- [ ] Service kopiert (optional: `lib/services/workbook-service.ts`)
- [ ] Environment Variable gesetzt (`MCP_SERVER_URL`)
- [ ] Frontend neu gestartet
- [ ] API-Endpoint getestet (GET `/api/workbook/chart-data`)
- [ ] API-Endpoint funktioniert (POST mit Test-Daten)

---

**🎉 Fertig! Die Workbook-Schnittstelle ist jetzt auf dem Server!** 🚀
