# 📋 Offene Aufgaben - Übersicht

**Stand:** Nach erfolgreichem Deployment der Agent-Routen  
**Datum:** Aktuell

---

## ✅ Bereits erledigt

### Agent-Routen (API)
- ✅ `/api/agents/marketing` - Deployt und funktioniert
- ✅ `/api/agents/automation` - Deployt und funktioniert
- ✅ `/api/agents/sales` - Deployt und funktioniert
- ✅ `/api/agents/social-youtube` - Deployt und funktioniert
- ✅ `/api/agents/chart-development` - Deployt und funktioniert
- ✅ `/api/agents/tasks` - Deployt und funktioniert
- ✅ `/api/agents/website-ux-agent` - Bereits vorhanden

### Frontend-Komponenten (lokal erstellt)
- ✅ `AgentTasksDashboard.tsx` - Erstellt
- ✅ `AgentChat.tsx` - Erstellt
- ✅ `/coach/agents/tasks` - Seite erstellt
- ✅ `/coach/agents/marketing` - Seite erstellt
- ✅ `/coach/agents/automation` - Seite erstellt
- ✅ `/coach/agents/sales` - Seite erstellt
- ✅ `/coach/agents/social-youtube` - Seite erstellt
- ✅ `/coach/agents/chart` - Seite erstellt

---

## ⏳ Noch offen

### 1. Frontend-Seiten auf Server deployen (PRIORITÄT 1)

**Status:** ⚠️ Lokal erstellt, aber Build schlägt fehl wegen fehlender `AgentChat` Komponente

**Was zu tun:**
- ✅ `AgentChat` Komponente wurde in `deploy-all-frontend-complete.sh` hinzugefügt
- ⏳ Script auf Server ausführen: `./deploy-all-frontend-complete.sh`

**Nach Deployment:**
- Alle Seiten sollten funktionieren:
  - `http://167.235.224.149:3000/coach/agents/tasks`
  - `http://167.235.224.149:3000/coach/agents/marketing`
  - `http://167.235.224.149:3000/coach/agents/automation`
  - `http://167.235.224.149:3000/coach/agents/sales`
  - `http://167.235.224.149:3000/coach/agents/social-youtube`
  - `http://167.235.224.149:3000/coach/agents/chart`

**Geschätzter Aufwand:** 15-30 Minuten (Script ausführen)

---

### 2. Navigation-Links hinzufügen (PRIORITÄT 2)

**Status:** ❌ Fehlt noch

**Was zu tun:**
- Navigation-Komponente finden (`Navigation.tsx`, `Header.tsx`, `Menu.tsx`, etc.)
- Links zu neuen Seiten hinzufügen:
  - `/coach/agents/tasks` - "Agent Tasks Dashboard"
  - `/coach/agents/marketing` - "Marketing Agent"
  - `/coach/agents/automation` - "Automation Agent"
  - `/coach/agents/sales` - "Sales Agent"
  - `/coach/agents/social-youtube` - "Social-YouTube Agent"
  - `/coach/agents/chart` - "Chart Development Agent"

**Dateien zu prüfen:**
- `integration/frontend/components/Navigation.tsx`
- `integration/frontend/components/Header.tsx`
- `integration/frontend/app/layout.tsx`
- `integration/frontend/app/coach/layout.tsx`

**Geschätzter Aufwand:** 30-60 Minuten

---

### 3. Weitere Agent-Routen migrieren (PRIORITÄT 3)

**Status:** ⏳ Noch nicht migriert

#### 3.1 Chart Architect Agent
- **Aktuell:** `integration/api-routes/agents-chart-architect-agent.ts` (Pages Router)
- **Ziel:** `integration/api-routes/app-router/agents/chart-architect/route.ts`
- **MCP Endpoint:** `http://138.199.237.34:7000/agent/chart-architect-agent`
- **Frontend-Seite:** `/coach/agents/chart-architect` (optional)

#### 3.2 Video Creation Agent
- **Aktuell:** `integration/api-routes/agents-video-creation-agent.ts` (Pages Router)
- **Ziel:** `integration/api-routes/app-router/agents/video-creation/route.ts`
- **MCP Endpoint:** `http://138.199.237.34:7000/agent/video-creation-agent`
- **Frontend-Seite:** `/coach/agents/video-creation` (optional)

**Geschätzter Aufwand:** 2-4 Stunden (je nach Komplexität)

---

### 4. n8n-Workflows anpassen (PRIORITÄT 4)

**Status:** ⏳ Noch nicht angepasst

**Was zu tun:**
- Workflows finden, die Agenten direkt aufrufen (`http://138.199.237.34:7000/agent/...`)
- Umstellen auf Frontend-API (`http://167.235.224.149:3000/api/agents/...`)
- Vorteil: Tasks werden automatisch gespeichert

**Zu prüfende Workflows:**
- "Agent → Mattermost Notification"
- "Scheduled Agent Reports → Mattermost"
- "Multi-Agent Content Pipeline"
- "Agent Automation Workflows"

**Geschätzter Aufwand:** 3-5 Stunden

---

### 5. Route Status Matrix aktualisieren (PRIORITÄT 5)

**Status:** ⏳ Veraltet

**Was zu tun:**
- `ROUTE_STATUS_MATRIX.md` aktualisieren:
  - Marketing, Automation, Sales, Social-YouTube, Chart-Development auf "✅ Funktioniert" setzen
  - Frontend-Seiten hinzufügen
  - Deployment-Status aktualisieren

**Geschätzter Aufwand:** 15 Minuten

---

### 6. Testing & Dokumentation (PRIORITÄT 6)

**Status:** ⏳ Teilweise

**Was zu tun:**
- Alle neuen Routen testen
- Frontend-Seiten testen
- Dashboard testen
- Dokumentation aktualisieren

**Geschätzter Aufwand:** 1-2 Stunden

---

## 📊 Priorisierung

### 🔴 PRIORITÄT 1: Frontend-Seiten deployen
**Warum:** Ohne Deployment sind die Seiten nicht nutzbar  
**Aufwand:** 15-30 Minuten  
**Script:** `./deploy-all-frontend-complete.sh`

---

### 🟡 PRIORITÄT 2: Navigation-Links
**Warum:** User müssen die Seiten finden können  
**Aufwand:** 30-60 Minuten

---

### 🟢 PRIORITÄT 3: Weitere Agent-Routen
**Warum:** Vollständigkeit, aber nicht kritisch  
**Aufwand:** 2-4 Stunden

---

### 🔵 PRIORITÄT 4: n8n-Workflows
**Warum:** Verbessert Datenqualität, aber nicht kritisch  
**Aufwand:** 3-5 Stunden

---

## 🚀 Quick Start (Nächste Schritte)

### Schritt 1: Frontend deployen
```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
chmod +x deploy-all-frontend-complete.sh
./deploy-all-frontend-complete.sh
```

### Schritt 2: Navigation prüfen
```bash
# Navigation-Komponente finden
find integration/frontend -name "*Navigation*" -o -name "*Header*" -o -name "*Menu*"
```

### Schritt 3: Navigation-Links hinzufügen
- Navigation-Komponente öffnen
- Links zu neuen Seiten hinzufügen
- Testen

---

## ✅ Checkliste

- [ ] Frontend-Seiten auf Server deployt (`deploy-all-frontend-complete.sh`)
- [ ] Alle Seiten funktionieren (HTTP 200)
- [ ] Navigation-Links hinzugefügt
- [ ] Chart Architect Agent Route migriert (optional)
- [ ] Video Creation Agent Route migriert (optional)
- [ ] n8n-Workflows angepasst (optional)
- [ ] Route Status Matrix aktualisiert
- [ ] Testing durchgeführt
- [ ] Dokumentation aktualisiert

---

**🎯 Nächster Schritt: Frontend-Seiten deployen!**
