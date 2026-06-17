# ✅ Reading Agent - Frontend Integration Check

## 🔍 Prüfung: Funktioniert der Reading Agent mit dem Frontend?

### Kommunikations-Flow

```
Browser (User)
    │
    │ POST /api/readings/generate
    ▼
CK-App Server (167.235.224.149)
    │ Next.js Frontend
    │
    │ POST http://138.199.237.34:4001/reading/generate
    ▼
Hetzner Server (138.199.237.34)
    │ Reading Agent (Port 4001)
    │
    │ /reading/generate
    ▼
OpenAI API
```

---

## ✅ Checkliste: Was muss vorhanden sein?

### 1. API-Route auf CK-App Server

**Pfad:** `/opt/hd-app/The-Connection-Key/frontend/`

**Für Pages Router:**
- ✅ `pages/api/readings/generate.ts` (oder `.js`)

**Für App Router:**
- ✅ `app/api/reading/generate/route.ts` (oder `app/api/readings/generate/route.ts`)

**Quelle:** `integration/api-routes/readings-generate.ts`

**Prüfen:**
```bash
# Auf CK-App Server
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key/frontend

# Pages Router
ls -la pages/api/readings/generate.ts

# Oder App Router
ls -la app/api/reading/generate/route.ts
ls -la app/api/readings/generate/route.ts
```

---

### 2. Environment Variables

**Erforderlich in `.env.local` oder `.env`:**

```bash
READING_AGENT_URL=http://138.199.237.34:4001
```

**Prüfen:**
```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend
grep "READING_AGENT_URL" .env.local
# Oder
grep "READING_AGENT_URL" .env
```

**Sollte zeigen:**
```
READING_AGENT_URL=http://138.199.237.34:4001
```

---

### 3. Reading Agent läuft auf Hetzner Server

**Prüfen:**
```bash
# Auf Hetzner Server
ssh root@138.199.237.34
pm2 status reading-agent

# Sollte zeigen:
# reading-agent | online | Port 4001
```

**Test direkt:**
```bash
curl -X POST http://138.199.237.34:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "detailed"
  }'
```

**Sollte zurückgeben:**
```json
{
  "success": true,
  "readingId": "...",
  "reading": "...",
  "tokens": 1234
}
```

---

### 4. Frontend-Seite vorhanden

**Pfad:** `/coach/readings/create` oder ähnlich

**Prüfen:**
```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# Pages Router
ls -la pages/coach/readings/create.tsx

# Oder App Router
ls -la app/coach/readings/create/page.tsx
```

---

### 5. CORS konfiguriert

**Auf Hetzner Server (Reading Agent):**

```bash
# Prüfe CORS-Konfiguration
grep -i cors /opt/mcp-connection-key/production/server.js
# Oder
grep -i cors /opt/mcp-connection-key/production/.env
```

**Sollte erlauben:**
- `https://www.the-connection-key.de`
- `https://the-connection-key.de`
- `http://167.235.224.149` (für Tests)

---

## 🧪 Test-Plan

### Test 1: API-Route direkt testen

```bash
# Auf CK-App Server
curl -X POST http://localhost:3000/api/readings/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "detailed"
  }'
```

**Erwartetes Ergebnis:**
- ✅ Status 200
- ✅ JSON Response mit `reading`, `readingId`, `tokens`

**Mögliche Fehler:**
- ❌ 404: API-Route fehlt
- ❌ 500: Reading Agent nicht erreichbar oder Environment Variable fehlt
- ❌ Connection Error: Reading Agent läuft nicht oder CORS-Problem

---

### Test 2: Frontend-Seite aufrufen

**Im Browser:**
```
https://www.the-connection-key.de/coach/readings/create
```

**Erwartetes Ergebnis:**
- ✅ Seite lädt
- ✅ Formular für Geburtsdaten vorhanden
- ✅ Submit funktioniert
- ✅ Reading wird angezeigt

---

## 🔧 Häufige Probleme & Lösungen

### Problem 1: API-Route fehlt

**Symptom:** 404 Not Found bei `/api/readings/generate`

**Lösung:**
```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# Für Pages Router
mkdir -p pages/api/readings
cp /path/to/integration/api-routes/readings-generate.ts pages/api/readings/generate.ts

# Frontend neu starten
pm2 restart the-connection-key
```

---

### Problem 2: Environment Variable fehlt

**Symptom:** 500 Error, "Reading Agent request failed"

**Lösung:**
```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend
echo "READING_AGENT_URL=http://138.199.237.34:4001" >> .env.local

# Frontend neu starten
pm2 restart the-connection-key
```

---

### Problem 3: Reading Agent nicht erreichbar

**Symptom:** Connection Error, Timeout

**Lösung:**
```bash
# Auf Hetzner Server
pm2 status reading-agent
pm2 restart reading-agent

# Prüfe Firewall
ufw status | grep 4001
# Falls Port nicht offen:
ufw allow 4001/tcp
```

---

### Problem 4: CORS-Problem

**Symptom:** CORS Error im Browser

**Lösung:**
```bash
# Auf Hetzner Server
# In production/server.js oder .env:
CORS_ORIGINS=https://www.the-connection-key.de,https://the-connection-key.de

pm2 restart reading-agent
```

---

## 📋 Schnell-Check Script

**Auf CK-App Server ausführen:**

```bash
#!/bin/bash
echo "🔍 Reading Agent Frontend Integration Check"
echo "=========================================="
echo ""

# 1. Prüfe API-Route
echo "1. Prüfe API-Route..."
if [ -f "pages/api/readings/generate.ts" ] || [ -f "app/api/reading/generate/route.ts" ] || [ -f "app/api/readings/generate/route.ts" ]; then
    echo "   ✅ API-Route vorhanden"
else
    echo "   ❌ API-Route fehlt!"
fi

# 2. Prüfe Environment Variable
echo "2. Prüfe Environment Variable..."
if grep -q "READING_AGENT_URL" .env.local 2>/dev/null || grep -q "READING_AGENT_URL" .env 2>/dev/null; then
    echo "   ✅ READING_AGENT_URL gesetzt"
    grep "READING_AGENT_URL" .env.local .env 2>/dev/null | head -1
else
    echo "   ❌ READING_AGENT_URL fehlt!"
fi

# 3. Teste Reading Agent
echo "3. Teste Reading Agent..."
RESPONSE=$(curl -s -X POST http://138.199.237.34:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{"birthDate":"1990-05-15","birthTime":"14:30","birthPlace":"Berlin","readingType":"detailed"}' \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ Reading Agent erreichbar"
else
    echo "   ❌ Reading Agent nicht erreichbar (HTTP $HTTP_CODE)"
fi

echo ""
echo "✅ Check abgeschlossen"
```

---

## 🎯 Zusammenfassung

**Für funktionierende Integration benötigt:**

1. ✅ API-Route auf CK-App Server installiert
2. ✅ `READING_AGENT_URL` Environment Variable gesetzt
3. ✅ Reading Agent läuft auf Hetzner Server (Port 4001)
4. ✅ CORS konfiguriert
5. ✅ Frontend-Seite vorhanden (optional, für UI)

**Nächste Schritte:**
- Prüfe ob alle Punkte erfüllt sind
- Teste die API-Route direkt
- Teste im Browser

