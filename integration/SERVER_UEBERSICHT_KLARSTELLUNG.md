# 🖥️ Server-Übersicht - Klarstellung

## 📍 Die beiden Server

### Server 1: Hetzner Server (138.199.237.34)
**Funktionen:**
- ✅ MCP Server (Port 7000) - Agenten-Server
- ✅ Reading Agent (Port 4001) - PM2
- ✅ n8n (Port 5678) - Docker
- ✅ chatgpt-agent (Port 4000) - Docker
- ✅ connection-key (Port 3000) - Docker

**Endpoints:**
- `http://138.199.237.34:7000/agent/marketing` (POST) - Agent ausführen
- `http://138.199.237.34:4001/reading/generate` (POST) - Reading generieren

### Server 2: CK-App Server (167.235.224.149)
**Funktionen:**
- ✅ Next.js Frontend (Port 3000) - Docker
- ✅ Frontend-Seiten: `https://www.the-connection-key.de`

**Endpoints:**
- `https://www.the-connection-key.de/agents/marketing` - Frontend-Seite
- `http://localhost:3000/api/agents/marketing` (POST) - Next.js API-Route

---

## 🔗 Kommunikations-Flow

```
Browser
    │
    │ GET https://www.the-connection-key.de/agents/marketing
    ▼
CK-App Server (167.235.224.149)
    │ Next.js Frontend
    │
    │ POST /api/agents/marketing (JavaScript im Browser)
    ▼
CK-App Server - Next.js API Route
    │ pages/api/agents/marketing.ts
    │
    │ POST http://138.199.237.34:7000/agent/marketing
    ▼
Hetzner Server (138.199.237.34)
    │ MCP Server (Port 7000)
    │
    │ POST /agent/marketing
    ▼
OpenAI API
```

---

## ❓ Wo tritt der Fehler auf?

### Fehler: "Cannot GET /agent/marketing"

**Mögliche Ursachen:**

1. **Direkter Browser-Aufruf auf Hetzner Server:**
   ```
   Browser → http://138.199.237.34:7000/agent/marketing
   ```
   - Browser macht automatisch GET-Request
   - MCP Server akzeptiert nur POST
   - ❌ Funktioniert nicht

2. **n8n Workflow mit GET:**
   ```
   n8n → GET http://138.199.237.34:7000/agent/marketing
   ```
   - HTTP Request Node auf GET eingestellt
   - ❌ Funktioniert nicht

3. **Frontend ruft falsch auf:**
   ```
   Frontend → GET /api/agents/marketing
   ```
   - Frontend macht GET statt POST
   - ❌ Funktioniert nicht

---

## ✅ Was funktioniert

### 1. Frontend-Seite öffnen (Browser)
```
https://www.the-connection-key.de/agents/marketing
```
- ✅ Funktioniert (zeigt Frontend-Seite)

### 2. Frontend sendet POST-Request
```
Frontend → POST /api/agents/marketing
```
- ✅ Funktioniert (wenn API-Route existiert)

### 3. Next.js API ruft MCP Server auf
```
Next.js API → POST http://138.199.237.34:7000/agent/marketing
```
- ✅ Funktioniert (wie Sie getestet haben)

---

## 🔍 Prüfen Sie:

### Wo tritt der Fehler auf?

**Option A: Im Browser auf Frontend-Seite?**
```
https://www.the-connection-key.de/agents/marketing
```
- Dann prüfen Sie die Frontend-Komponente (AgentChat.tsx)
- Muss POST verwenden, nicht GET

**Option B: Direkt auf Hetzner Server?**
```
http://138.199.237.34:7000/agent/marketing
```
- Browser macht GET → funktioniert nicht
- Verwenden Sie curl mit POST

**Option C: In n8n Workflow?**
- Prüfen Sie HTTP Request Node
- Method muss POST sein

---

## 🛠️ Quick Check

### Prüfen Sie Frontend-Komponente:

```bash
# Auf CK-App Server
grep -A 5 "fetch.*agents" /opt/hd-app/The-Connection-Key/frontend/components/**/AgentChat.tsx

# Sollte zeigen:
# method: 'POST' ✅
```

### Prüfen Sie n8n Workflow:

1. Öffnen Sie n8n: `https://n8n.werdemeisterdeinergedankenagent.de`
2. Öffnen Sie den HTTP Request Node
3. Prüfen Sie **Method:** Muss `POST` sein!

---

## 📋 Zusammenfassung

**Zwei Server:**
- **Hetzner (138.199.237.34):** MCP Server, Agenten
- **CK-App (167.235.224.149):** Next.js Frontend, API-Routes

**Korrekte Verwendung:**
- Frontend → Next.js API (POST) → MCP Server (POST)
- NICHT: Direkt MCP Server im Browser (GET funktioniert nicht)

**Wo haben Sie das Script ausgeführt?**
- `INSTALL_ALL_API_ROUTES.sh` → Auf CK-App Server (167.235.224.149)
- `ADD_GET_SUPPORT_MCP.sh` → Auf Hetzner Server (138.199.237.34)

