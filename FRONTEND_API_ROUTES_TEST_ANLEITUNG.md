# 🧪 Frontend API Routes Test

**Status:** Test-Skript erstellt

**Zweck:** Testet alle API-Routes, die vom Frontend verwendet werden

---

## 🚀 Test auf dem Server ausführen

### Schritt 1: Frontend-URL prüfen

**Falls Next.js lokal läuft:**
```bash
export FRONTEND_URL="http://localhost:3000"
```

**Falls Next.js auf Server läuft:**
```bash
export FRONTEND_URL="https://ck-app.werdemeisterdeinergedanken.de"
# ODER
export FRONTEND_URL="http://138.199.237.34:3000"
```

---

### Schritt 2: Skript ausführbar machen

```bash
chmod +x test-frontend-api-routes.sh
```

---

### Schritt 3: Test ausführen

```bash
./test-frontend-api-routes.sh
```

**Oder mit expliziter URL:**
```bash
FRONTEND_URL="https://ck-app.werdemeisterdeinergedanken.de" ./test-frontend-api-routes.sh
```

---

## 📋 Getestete API Routes

### Agent APIs (5 Routes)

1. **Marketing Agent**
   - Route: `/api/agents/marketing`
   - Method: POST
   - Body: `{"message": "...", "userId": "..."}`

2. **Sales Agent**
   - Route: `/api/agents/sales`
   - Method: POST
   - Body: `{"message": "...", "userId": "..."}`

3. **Social-YouTube Agent**
   - Route: `/api/agents/social-youtube`
   - Method: POST
   - Body: `{"message": "...", "userId": "..."}`

4. **Automation Agent**
   - Route: `/api/agents/automation`
   - Method: POST
   - Body: `{"message": "...", "userId": "..."}`

5. **Chart Development Agent**
   - Route: `/api/agents/chart-development`
   - Method: POST
   - Body: `{"birthDate": "...", "birthTime": "...", "birthPlace": "...", "userId": "..."}`

---

### Reading API (1 Route)

6. **Reading Generation**
   - Route: `/api/reading/generate`
   - Method: POST
   - Body: `{"birthDate": "...", "birthTime": "...", "birthPlace": "...", "readingType": "...", "userId": "..."}`

---

## 📊 Erwartete Ergebnisse

### ✅ Erfolgreich

**HTTP Status:** `200`
**Response sollte enthalten:**
- `"success": true` ODER
- `"response": "..."` (für Agent APIs) ODER
- `"reading": "..."` oder `"readingId": "..."` (für Reading API)

---

### ❌ Fehler

**Mögliche HTTP Status Codes:**
- `404` - Route nicht gefunden
- `405` - Method nicht erlaubt
- `500` - Server-Fehler
- `400` - Bad Request (Validierungsfehler)

**Bedeutung:**
- `404` → API-Route existiert nicht oder falscher Pfad
- `405` → Falsche HTTP-Methode
- `500` → Backend-Agent nicht erreichbar oder Fehler im Backend
- `400` → Request-Body fehlt oder ist ungültig

---

## 🔍 Fehlerbehebung

### Problem: 404 - Route nicht gefunden

**Prüfen:**
1. Next.js läuft? (`npm run dev` oder PM2 Status)
2. API-Route existiert? (Datei in `integration/api-routes/` oder `integration/api-routes/app-router/`)
3. Route-Pfad korrekt? (z.B. `/api/agents/marketing`)

---

### Problem: 500 - Server-Fehler

**Prüfen:**
1. Backend Agent läuft? (Port 7000, siehe `test-all-agents.sh`)
2. Reading Agent läuft? (Port 4001, PM2 Status)
3. MCP_SERVER_URL korrekt? (in API-Route Dateien)
4. Browser-Console oder Server-Logs prüfen

---

### Problem: 405 - Method nicht erlaubt

**Prüfen:**
1. API-Route unterstützt POST? (in Route-Datei prüfen)
2. Request verwendet POST? (Skript verwendet bereits POST)

---

## ✅ Checkliste

- [ ] Frontend-URL gesetzt (FRONTEND_URL)
- [ ] Skript ausführbar gemacht (`chmod +x`)
- [ ] Test ausgeführt
- [ ] Ergebnisse geprüft
- [ ] Falls Fehler → Backend-Agenten prüfen
- [ ] Falls Fehler → API-Route-Dateien prüfen
- [ ] Falls Fehler → Next.js Logs prüfen

---

## 🎯 Nächste Schritte

**Wenn alle Tests erfolgreich:**
- ✅ Frontend API Routes funktionieren
- ✅ Frontend kann mit Backend kommunizieren
- ✅ Weiter mit Browser-Tests (Frontend-Seiten öffnen)

**Wenn Tests fehlschlagen:**
- ❌ API-Routes prüfen (existieren sie?)
- ❌ Backend-Agenten prüfen (laufen sie?)
- ❌ Next.js Konfiguration prüfen
- ❌ Logs analysieren

---

**Viel Erfolg beim Testen!** 🚀
