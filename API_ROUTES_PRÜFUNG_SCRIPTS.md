# 🔍 API-Routes Prüfung - Scripts erstellt

**Status:** Scripts erstellt und bereit zur Verwendung

---

## 📋 Erstellte Scripts

### 1. `check-api-routes.ps1` (PowerShell - Hauptscript)
- Kopiert `check-api-routes-server.sh` zum Server
- Führt das Bash-Script auf dem Server aus
- Zeigt Ergebnisse an

### 2. `check-api-routes-server.sh` (Bash - Server-Script)
- Prüft Environment Variables (`.env.local`)
- Prüft alle API-Routes
- Erstellt `.env.local` falls nicht vorhanden
- Zeigt detaillierte Ergebnisse

### 3. `check-api-routes-simple.ps1` (PowerShell - Einfache Version)
- Einfache Prüfung ohne Server-Script
- Zeigt Status der API-Routes

---

## 🚀 Verwendung

### Option 1: PowerShell Script (empfohlen)

```powershell
.\check-api-routes.ps1
```

**Das Script:**
1. Kopiert `check-api-routes-server.sh` zum Server
2. Führt Prüfung auf dem Server aus
3. Zeigt Ergebnisse an

---

### Option 2: Direkt auf dem Server

**SSH zum Server:**
```bash
ssh root@167.235.224.149
```

**Script kopieren (von lokal):**
```bash
# Von Windows (PowerShell)
scp check-api-routes-server.sh root@167.235.224.149:/tmp/
```

**Script ausführen:**
```bash
chmod +x /tmp/check-api-routes-server.sh
/tmp/check-api-routes-server.sh
```

---

### Option 3: Manuelle Prüfung

**SSH zum Server:**
```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key/frontend
```

**1. Environment Variables prüfen:**
```bash
cat .env.local | grep -E "MCP_SERVER_URL|READING_AGENT_URL"
```

**2. API-Routes prüfen:**
```bash
ls -la app/api/agents/*/route.ts
ls -la app/api/reading/generate/route.ts
```

**3. URLs in Routes prüfen:**
```bash
grep -E "MCP_SERVER_URL|138.199.237.34" app/api/agents/marketing/route.ts
grep -E "READING_AGENT_URL|138.199.237.34" app/api/reading/generate/route.ts
```

---

## 🔧 Was das Script prüft

### 1. Environment Variables
- ✅ `.env.local` existiert?
- ✅ `MCP_SERVER_URL` gesetzt?
- ✅ `READING_AGENT_URL` gesetzt?
- ✅ URLs korrekt (`http://138.199.237.34:7000` und `:4001`)?

### 2. API-Routes
- ✅ Alle 5 Agent-Routes vorhanden?
- ✅ Reading-Route vorhanden?
- ✅ Routes verwenden korrekte URLs?

---

## ✅ Automatische Korrektur

**Das Script erstellt automatisch `.env.local` falls nicht vorhanden:**

```bash
# MCP Server (für Agenten 1-4)
MCP_SERVER_URL=http://138.199.237.34:7000
NEXT_PUBLIC_MCP_SERVER_URL=http://138.199.237.34:7000

# Reading Agent (für Agent 5)
READING_AGENT_URL=http://138.199.237.34:4001
NEXT_PUBLIC_READING_AGENT_URL=http://138.199.237.34:4001
```

---

## 📋 Nach der Prüfung

### Falls Environment Variables hinzugefügt wurden:

**Frontend neu starten:**
```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key/frontend
pm2 restart the-connection-key
```

### Testen:

**Marketing Agent:**
```bash
curl -X POST https://www.the-connection-key.de/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle einen Social Media Post"}'
```

**Reading Agent:**
```bash
curl -X POST https://www.the-connection-key.de/api/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin"
  }'
```

---

## ✅ Checkliste

- [ ] Script ausgeführt
- [ ] Environment Variables geprüft/korrigiert
- [ ] API-Routes geprüft
- [ ] Frontend neu gestartet (falls nötig)
- [ ] API-Routes getestet

---

**Status:** ✅ Scripts erstellt und bereit zur Verwendung!

