# 🔍 Agent-Verbindung Diagnose

**Problem:** `/coach/readings/create` ist nicht erreichbar  
**Frage:** Mit was genau ist der MCP verbunden im Frontend?

---

## 🔍 Was zu prüfen ist

### 1. Frontend-Seite existiert?

**Pfad:** `/coach/readings/create`

**Mögliche Standorte:**
- `frontend/pages/coach/readings/create.tsx` (Pages Router)
- `frontend/app/coach/readings/create/page.tsx` (App Router)

**Prüfen auf Server:**
```bash
# Auf CK-App Server (167.235.224.149)
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe Pages Router
ls -la pages/coach/readings/create.tsx

# Oder App Router
ls -la app/coach/readings/create/page.tsx
```

---

### 2. API-Route existiert?

**Pfad:** `/api/readings/generate`

**Mögliche Standorte:**
- `frontend/pages/api/readings/generate.ts` (Pages Router)
- `frontend/app/api/readings/generate/route.ts` (App Router)

**Prüfen auf Server:**
```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe Pages Router
ls -la pages/api/readings/generate.ts

# Oder App Router
ls -la app/api/readings/generate/route.ts
```

---

### 3. Environment Variables gesetzt?

**Erforderliche Variablen:**
- `MCP_SERVER_URL=http://138.199.237.34:7000`
- `READING_AGENT_URL=http://138.199.237.34:4001`

**Prüfen auf Server:**
```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key

# Prüfe .env
grep -E '^(MCP_SERVER_URL|READING_AGENT_URL)=' .env

# Oder .env.local im Frontend
grep -E '^(MCP_SERVER_URL|READING_AGENT_URL)=' frontend/.env.local
```

---

### 4. MCP Server erreichbar?

**URL:** `http://138.199.237.34:7000`

**Prüfen:**
```bash
# Von CK-App Server aus
curl http://138.199.237.34:7000/health

# Oder von lokal
curl http://138.199.237.34:7000/health
```

---

### 5. Reading Agent erreichbar?

**URL:** `http://138.199.237.34:4001`

**Prüfen:**
```bash
# Von CK-App Server aus
curl http://138.199.237.34:4001/health

# Oder von lokal
curl http://138.199.237.34:4001/health
```

---

## 🔗 Kommunikations-Flow

### Erwarteter Flow:

```
Browser
    │
    │ GET /coach/readings/create
    ▼
CK-App Server (167.235.224.149)
    │ Next.js Frontend
    │
    │ POST /api/readings/generate (JavaScript im Browser)
    ▼
CK-App Server - Next.js API Route
    │ pages/api/readings/generate.ts
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

## ❌ Mögliche Probleme

### Problem 1: Frontend-Seite fehlt

**Symptom:** 404 Not Found bei `/coach/readings/create`

**Lösung:** Seite erstellen (siehe unten)

### Problem 2: API-Route fehlt

**Symptom:** 404 Not Found bei `/api/readings/generate`

**Lösung:** API-Route installieren (siehe unten)

### Problem 3: Environment Variables fehlen

**Symptom:** API-Route kann Reading Agent nicht erreichen

**Lösung:** Environment Variables setzen

### Problem 4: Reading Agent nicht erreichbar

**Symptom:** Connection Error, Timeout

**Lösung:** Reading Agent Status prüfen

---

## 🔧 Lösung: Fehlende Dateien erstellen

### Schritt 1: API-Route installieren

**Auf CK-App Server:**

```bash
cd /opt/hd-app/The-Connection-Key

# Für Pages Router
mkdir -p frontend/pages/api/readings
cp integration/api-routes/readings-generate.ts frontend/pages/api/readings/generate.ts

# Oder für App Router
mkdir -p frontend/app/api/readings/generate
# (Anpassung nötig - siehe README_API_ROUTES.md)
```

### Schritt 2: Frontend-Seite erstellen

**Für Pages Router:**

```bash
mkdir -p frontend/pages/coach/readings
cat > frontend/pages/coach/readings/create.tsx << 'EOF'
import { ReadingGenerator } from '@/components/agents/ReadingGenerator';

export default function CreateReadingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Human Design Reading erstellen</h1>
      <ReadingGenerator />
    </div>
  );
}
EOF
```

**Für App Router:**

```bash
mkdir -p frontend/app/coach/readings/create
cat > frontend/app/coach/readings/create/page.tsx << 'EOF'
import { ReadingGenerator } from '@/components/agents/ReadingGenerator';

export default function CreateReadingPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Human Design Reading erstellen</h1>
      <ReadingGenerator />
    </div>
  );
}
EOF
```

### Schritt 3: ReadingGenerator Komponente installieren

```bash
mkdir -p frontend/components/agents
cp integration/frontend/components/ReadingGenerator.tsx frontend/components/agents/
```

### Schritt 4: Environment Variables setzen

```bash
# In .env oder .env.local
echo "READING_AGENT_URL=http://138.199.237.34:4001" >> frontend/.env.local
echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> frontend/.env.local
```

---

## 🧪 Testen

### Test 1: Frontend-Seite

```bash
# Im Browser öffnen
https://www.the-connection-key.de/coach/readings/create
```

### Test 2: API-Route direkt

```bash
# Von Server aus
curl -X POST http://localhost:3000/api/readings/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "detailed"
  }'
```

---

## 📋 Checkliste

- [ ] Frontend-Seite existiert (`/coach/readings/create`)
- [ ] API-Route existiert (`/api/readings/generate`)
- [ ] ReadingGenerator Komponente installiert
- [ ] Environment Variables gesetzt
- [ ] MCP Server erreichbar
- [ ] Reading Agent erreichbar
- [ ] Frontend Container neu gestartet (nach Änderungen)

---

**Status:** 🔍 Diagnose läuft...


