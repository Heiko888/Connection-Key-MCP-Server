# 🚀 Vollständiges Deployment - Anleitung

**Problem:** Frontend-Seiten und Routen sind lokal erstellt, aber nicht auf dem Server

**Lösung:** Alles in der richtigen Reihenfolge deployen

---

## 📋 Deployment-Reihenfolge

### 1. Dashboard-Komponente (wichtigste Basis)
**Script:** `deploy-dashboard-to-server.sh`

**Was wird deployt:**
- ✅ `AgentTasksDashboard.tsx` Komponente
- ✅ `/coach/agents/tasks` Seite

**Auf Server ausführen:**
```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
chmod +x deploy-dashboard-to-server.sh
./deploy-dashboard-to-server.sh
```

---

### 2. Alle Frontend-Seiten
**Script:** `deploy-all-frontend-pages.sh`

**Was wird deployt:**
- ✅ `/coach/agents/marketing` Seite
- ✅ `/coach/agents/automation` Seite
- ✅ `/coach/agents/sales` Seite
- ✅ `/coach/agents/social-youtube` Seite
- ✅ `/coach/agents/chart` Seite

**Auf Server ausführen:**
```bash
chmod +x deploy-all-frontend-pages.sh
./deploy-all-frontend-pages.sh
```

---

### 3. Alle Agent-Routen
**Script:** `deploy-all-agent-routes.sh`

**Was wird deployt:**
- ✅ `/api/agents/marketing` Route
- ✅ `/api/agents/automation` Route
- ✅ `/api/agents/sales` Route
- ✅ `/api/agents/social-youtube` Route
- ✅ `/api/agents/chart-development` Route

**Auf Server ausführen:**
```bash
chmod +x deploy-all-agent-routes.sh
./deploy-all-agent-routes.sh
```

---

## ✅ Alternative: Alles auf einmal

**Script:** `deploy-complete-frontend.sh`

**Deployt:**
- ✅ Dashboard Komponente (falls fehlt)
- ✅ Tasks Seite
- ✅ Alle Agent-Seiten
- ✅ Container neu bauen

**Auf Server ausführen:**
```bash
chmod +x deploy-complete-frontend.sh
./deploy-complete-frontend.sh
```

**Hinweis:** Agent-Routen müssen separat deployt werden (`deploy-all-agent-routes.sh`)

---

## 🔍 Nach Deployment prüfen

### 1. Frontend-Seiten testen

```bash
# Auf Server
curl -I http://localhost:3000/coach/agents/tasks
curl -I http://localhost:3000/coach/agents/marketing
curl -I http://localhost:3000/coach/agents/automation
curl -I http://localhost:3000/coach/agents/sales
curl -I http://localhost:3000/coach/agents/social-youtube
curl -I http://localhost:3000/coach/agents/chart
```

**Erwartet:** HTTP 200

---

### 2. API-Routen testen

```bash
# Auf Server
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

**Erwartet:** JSON Response mit `success: true`

---

### 3. Dashboard öffnen

```
http://167.235.224.149:3000/coach/agents/tasks
```

**Erwartet:** Dashboard mit Statistiken und Tasks-Liste

---

## ⚠️ Wichtig: Port-Unterschied

**Server (Production):**
- Port: **3000**
- URL: `http://167.235.224.149:3000`

**Lokal (Development):**
- Port: **3005** (laut deiner Angabe)
- URL: `http://localhost:3005`

**Das bedeutet:**
- Lokal laufen die Seiten auf Port 3005
- Auf dem Server laufen sie auf Port 3000
- Nach Deployment sind die Seiten auf dem Server verfügbar

---

## 🔧 Falls Seiten lokal nicht funktionieren

**Lokaler Development-Server:**

```bash
# Im lokalen Projekt
cd integration/frontend
npm run dev
# Läuft auf Port 3005 (laut deiner Konfiguration)
```

**Dann öffnen:**
```
http://localhost:3005/coach/agents/tasks
http://localhost:3005/coach/agents/marketing
# etc.
```

---

## 📋 Checkliste

- [ ] Dashboard-Komponente deployt
- [ ] Tasks Seite deployt
- [ ] Alle Agent-Seiten deployt
- [ ] Alle Agent-Routen deployt
- [ ] Container neu gebaut
- [ ] Seiten funktionieren (HTTP 200)
- [ ] Dashboard zeigt Tasks
- [ ] Agent-Seiten können Agenten aufrufen

---

**🚀 Nach erfolgreichem Deployment sind alle Seiten verfügbar!**
