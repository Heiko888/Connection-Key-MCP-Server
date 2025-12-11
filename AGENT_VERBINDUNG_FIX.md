# 🔧 Agent-Verbindung reparieren

**Problem:** `/coach/readings/create` ist nicht erreichbar  
**Lösung:** Fehlende Dateien installieren

---

## 🚀 Schnell-Fix (auf Server ausführen)

### Schritt 1: Skripte auf Server kopieren

```bash
# Von lokal (PowerShell)
scp check-agent-connection-server.sh root@167.235.224.149:/tmp/
scp fix-agent-connection.sh root@167.235.224.149:/tmp/
```

### Schritt 2: Diagnose ausführen

```bash
# Auf Server
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
chmod +x /tmp/check-agent-connection-server.sh
/tmp/check-agent-connection-server.sh
```

### Schritt 3: Fix ausführen

```bash
# Auf Server
chmod +x /tmp/fix-agent-connection.sh
/tmp/fix-agent-connection.sh
```

---

## 📋 Was wird installiert?

### 1. API-Route
- **Datei:** `frontend/pages/api/readings/generate.ts`
- **Quelle:** `integration/api-routes/readings-generate.ts`
- **Route:** `/api/readings/generate`

### 2. Frontend-Seite
- **Datei:** `frontend/pages/coach/readings/create.tsx`
- **Route:** `/coach/readings/create`

### 3. ReadingGenerator Komponente
- **Datei:** `frontend/components/agents/ReadingGenerator.tsx`
- **Quelle:** `integration/frontend/components/ReadingGenerator.tsx`

### 4. Environment Variables
- **MCP_SERVER_URL:** `http://138.199.237.34:7000`
- **READING_AGENT_URL:** `http://138.199.237.34:4001`
- **Gesetzt in:** `.env` und `frontend/.env.local`

---

## 🔍 Manuelle Prüfung

### Prüfe Frontend-Seite

```bash
# Auf Server
ls -la /opt/hd-app/The-Connection-Key/frontend/pages/coach/readings/create.tsx
```

### Prüfe API-Route

```bash
# Auf Server
ls -la /opt/hd-app/The-Connection-Key/frontend/pages/api/readings/generate.ts
```

### Prüfe Environment Variables

```bash
# Auf Server
grep -E '^(MCP_SERVER_URL|READING_AGENT_URL)=' /opt/hd-app/The-Connection-Key/.env
grep -E '^(MCP_SERVER_URL|READING_AGENT_URL)=' /opt/hd-app/The-Connection-Key/frontend/.env.local
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

## ❌ Falls Integration-Dateien fehlen

Wenn die Integration-Dateien nicht auf dem Server sind:

### Option 1: Von lokal kopieren

```bash
# Von lokal (PowerShell)
scp -r integration root@167.235.224.149:/opt/hd-app/The-Connection-Key/
```

### Option 2: Manuell erstellen

Siehe `AGENT_VERBINDUNG_DIAGNOSE.md` für detaillierte Anweisungen.

---

**Status:** 🔧 Bereit zum Ausführen


