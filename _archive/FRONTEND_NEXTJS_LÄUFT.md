# ✅ Next.js läuft - API Routes testen

**Datum:** 17.12.2025

**Status:** ✅ Next.js läuft auf Port 3005!

---

## ✅ Next.js Status

**Next.js läuft:**
- ✅ Port: `3005` (statt 3000)
- ✅ Local: `http://localhost:3005`
- ✅ Environment: `.env.local` geladen

**Warnung:** `NEXT_PUBLIC_SUPABASE_ANON_KEY: UNDEFINED`
- ⚠️ **Optional** - Nur benötigt, falls Frontend-Komponenten direkt mit Supabase kommunizieren
- ✅ **Nicht kritisch** - API Routes verwenden `SUPABASE_SERVICE_ROLE_KEY` (ist gesetzt)

---

## 🧪 API Routes testen

**Jetzt sollten die HTTP 401 Fehler behoben sein!**

**Auf dem Server testen:**

```bash
# Test Agent API
curl -X POST http://localhost:3005/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message":"Test","userId":"test-frontend"}'

# Test Reading API
curl -X POST http://localhost:3005/api/reading/generate \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-01-01","birthTime":"12:00","birthPlace":"Berlin","readingType":"basic","userId":"test-frontend"}'
```

**Erwartung:**
- ✅ HTTP 200 OK (statt 401)
- ✅ JSON Response

---

## 🔍 Vollständige Prüfung

**Mit dem Prüfskript (Port 3005 anpassen):**

```bash
cd /opt/mcp-connection-key

# Prüfe Frontend Integration
# (Skript muss evtl. angepasst werden für Port 3005)
./check-frontend-integration.sh
```

**Falls Skript Port 3000 erwartet, manuell testen:**

```bash
# Prüfe ob Next.js läuft
curl -I http://localhost:3005

# Test Agent API
curl -X POST http://localhost:3005/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message":"Test","userId":"test-frontend"}' \
  -v
```

---

## ⚠️ Optional: NEXT_PUBLIC_SUPABASE_ANON_KEY hinzufügen

**Falls Frontend-Komponenten direkt mit Supabase kommunizieren:**

```bash
cd /opt/mcp-connection-key/integration/frontend

# Füge ANON_KEY hinzu (aus Supabase Dashboard)
nano .env.local
```

**Eintragen:**
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qamN5d2dza3plcGlreXpoaWh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMjYxNTYsImV4cCI6MjA3MTkwMjE1Nn0.xyz...
```

**Dann Next.js neu starten:**
```bash
# Prozess beenden (Ctrl+C) und neu starten
npm run dev
```

**Wichtig:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` ist **nicht** der `SUPABASE_SERVICE_ROLE_KEY`!
- `ANON_KEY` = Öffentlicher Key für Frontend (begrenzte Rechte)
- `SERVICE_ROLE_KEY` = Admin-Key für Backend (volle Rechte)

---

## ✅ Checkliste

- [x] Next.js läuft? ✅ (Port 3005)
- [x] `.env.local` geladen? ✅
- [x] `SUPABASE_SERVICE_ROLE_KEY` gesetzt? ✅
- [ ] API Routes funktionieren? (HTTP 200 statt 401) → **Jetzt testen!**
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` gesetzt? (optional)

---

## 🎯 Nächste Schritte

1. **API Routes testen** (siehe oben)
2. **Falls HTTP 200 → Frontend Integration funktioniert!** 🎉
3. **Optional:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` hinzufügen (falls Frontend Supabase direkt nutzt)

---

**🧪 Teste jetzt die API Routes - die HTTP 401 Fehler sollten behoben sein!** 🚀
