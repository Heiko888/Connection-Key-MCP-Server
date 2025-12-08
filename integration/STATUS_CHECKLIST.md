# ✅ Status-Checkliste: Server-Kommunikation

## 📍 Aktueller Stand

### ✅ Hetzner Server (138.199.237.34) - ERLEDIGT

- [x] **CORS konfiguriert** - `CORS_ORIGINS` in `.env` gesetzt
- [x] **Connection-Key Server läuft** - Port 3000, Health OK
- [x] **MCP Server läuft** - Port 7000, OpenAI konfiguriert
- [x] **Reading Agent läuft** - Port 4001, 5 Knowledge, 11 Templates
- [x] **Firewall offen** - Ports 4001 und 7000 erlaubt
- [x] **Alle 5 Agenten aktiv** - Marketing, Automation, Sales, Social-YouTube, Reading

**Status:** ✅ **Bereit für Anfragen vom CK-App Server**

---

### ❌ CK-App Server (167.235.224.149) - NOCH ZU TUN

- [ ] **Next.js Projekt-Verzeichnis gefunden** - Noch nicht lokalisiert
- [ ] **Git Pull durchgeführt** - `integration/` Dateien noch nicht auf Server
- [ ] **API-Routes installiert** - `/api/agents/*` und `/api/readings/*` fehlen
- [ ] **Frontend-Komponenten installiert** - `AgentChat.tsx`, `ReadingGenerator.tsx` fehlen
- [ ] **Environment Variables gesetzt** - `MCP_SERVER_URL` und `READING_AGENT_URL` fehlen
- [ ] **CSS importiert** - `agents.css` noch nicht in App eingebunden
- [ ] **Dashboard-Seite erstellt** - `/agents-dashboard` fehlt

**Status:** ❌ **Noch nicht vorbereitet**

---

## 🔗 Was fehlt für die Kommunikation?

### 1. API-Routes auf CK-App Server (KRITISCH)

**Fehlt:**
- `pages/api/agents/marketing.ts`
- `pages/api/agents/automation.ts`
- `pages/api/agents/sales.ts`
- `pages/api/agents/social-youtube.ts`
- `pages/api/readings/generate.ts`

**Diese Dateien rufen die Agenten auf dem Hetzner Server auf.**

---

### 2. Environment Variables auf CK-App Server (KRITISCH)

**Fehlt in `.env.local`:**
```bash
MCP_SERVER_URL=http://138.199.237.34:7000
READING_AGENT_URL=http://138.199.237.34:4001
```

**Ohne diese Variablen wissen die API-Routes nicht, wo die Agenten sind.**

---

### 3. Frontend-Komponenten (WICHTIG)

**Fehlt:**
- `components/agents/AgentChat.tsx`
- `components/agents/ReadingGenerator.tsx`
- `pages/agents-dashboard.tsx` (oder `app/agents/dashboard/page.tsx`)

**Ohne diese Komponenten kann das Frontend die Agenten nicht nutzen.**

---

### 4. CSS (OPTIONAL, aber empfohlen)

**Fehlt:**
- `styles/agents.css`
- Import in `_app.tsx` oder `layout.tsx`

---

## 📊 Kommunikations-Flow (aktuell)

```
❌ Frontend (167.235.224.149)
    │
    │ ❌ API-Route fehlt
    ▼
❌ /api/agents/marketing (existiert nicht)
    │
    │ ❌ Kann nicht aufrufen
    ▼
✅ MCP Server (138.199.237.34:7000) - BEREIT
```

**Problem:** Die Verbindungskette ist unterbrochen, weil die API-Routes fehlen.

---

## ✅ Was funktioniert bereits?

### Direkte Tests vom Hetzner Server:

```bash
# Diese funktionieren bereits:
curl http://localhost:7000/health          # ✅
curl http://localhost:4001/health          # ✅
curl -X POST http://localhost:7000/agent/marketing -d '{"message":"Test"}'  # ✅
```

### Vom CK-App Server zu Hetzner Server:

```bash
# Diese sollten funktionieren (CORS ist konfiguriert):
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

**Wenn dieser Test funktioniert, ist die Server-zu-Server-Verbindung OK.**

---

## 🎯 Nächste Schritte (Priorität)

### Priorität 1: API-Routes erstellen (KRITISCH)

**Auf CK-App Server (167.235.224.149):**

1. Finden Sie das Next.js Projekt
2. Erstellen Sie die API-Routes manuell oder per Git Pull
3. Setzen Sie Environment Variables

### Priorität 2: Frontend-Komponenten (WICHTIG)

1. Komponenten installieren
2. Dashboard-Seite erstellen
3. CSS hinzufügen

---

## 🧪 Test: Funktioniert die Server-zu-Server-Verbindung?

**Testen Sie vom CK-App Server aus:**

```bash
# Auf CK-App Server (167.235.224.149)
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

**Wenn das funktioniert:**
- ✅ Server-zu-Server-Verbindung OK
- ✅ CORS funktioniert
- ✅ Firewall OK
- ❌ Nur API-Routes auf CK-App Server fehlen noch

**Wenn das nicht funktioniert:**
- ❌ CORS-Problem
- ❌ Firewall-Problem
- ❌ Netzwerk-Problem

---

## 📋 Zusammenfassung

| Komponente | Hetzner Server | CK-App Server | Status |
|------------|----------------|---------------|--------|
| **Services laufen** | ✅ | ❓ | Hetzner: OK |
| **CORS konfiguriert** | ✅ | - | Hetzner: OK |
| **API-Routes** | - | ❌ | **FEHLT** |
| **Frontend** | - | ❌ | **FEHLT** |
| **Environment Variables** | ✅ | ❌ | **FEHLT** |
| **Server-zu-Server Verbindung** | ✅ | ❓ | **MUSS GETESTET WERDEN** |

---

## 🚀 Was muss noch gemacht werden?

1. **Auf CK-App Server wechseln**
2. **Next.js Projekt finden**
3. **API-Routes installieren** (kritisch!)
4. **Environment Variables setzen** (kritisch!)
5. **Frontend-Komponenten installieren**
6. **Testen**

**Die Hetzner-Seite ist komplett fertig!** ✅

