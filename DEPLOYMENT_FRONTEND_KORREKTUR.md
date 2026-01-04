# 🔧 Frontend Deployment - Korrektur

**Problem:** 
- Branch `feature/reading-agent-option-a-complete` existiert nicht im Frontend-Repository
- API-Routes wurden noch nicht deployed

**Lösung:** 
- Prüfe welches Repository auf Frontend-Server verwendet wird
- Dateien manuell kopieren oder Repository synchronisieren

---

## 🔍 Schritt 1: Repository prüfen

**Auf Frontend-Server ausführen:**

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe Git-Status
git remote -v

# Prüfe aktuellen Branch
git branch

# Prüfe ob integration/ Verzeichnis vorhanden ist
ls -la integration/
```

**Mögliche Szenarien:**

### **Szenario A: Frontend ist separates Repository**
- Frontend hat eigenes Git-Repository
- Integration-Dateien müssen **manuell kopiert** werden

### **Szenario B: Frontend ist Teil des MCP-Repositories**
- Frontend ist im gleichen Repository wie MCP
- Git Pull sollte funktionieren (aber Branch muss existieren)

---

## 🚀 Lösung: Dateien manuell kopieren

**Falls Frontend separates Repository ist:**

### **Schritt 1: Integration-Dateien vom MCP-Repository holen**

**Option A: Von lokalem Rechner kopieren (SCP)**

```powershell
# Von Windows PowerShell (auf deinem Rechner)
# 1. API-Routes kopieren
scp -r integration/api-routes/app-router/* root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/

# 2. Supabase Clients kopieren
scp integration/lib/supabase-clients.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/lib/

# 3. Prüfe ob Verzeichnis existiert
ssh root@167.235.224.149 "mkdir -p /opt/hd-app/The-Connection-Key/frontend/integration/lib"
```

**Option B: Vom Hetzner Server kopieren (falls dort das MCP-Repository ist)**

```bash
# Auf Hetzner Server (138.199.237.34)
cd /opt/mcp-connection-key

# Prüfe ob Branch vorhanden ist
git branch -a | grep feature/reading-agent-option-a-complete

# Falls ja, checkout
git checkout feature/reading-agent-option-a-complete
git pull origin feature/reading-agent-option-a-complete

# Dateien auf Frontend-Server kopieren
scp -r integration/api-routes/app-router/* root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/
scp integration/lib/supabase-clients.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/lib/
```

---

## 📋 Schritt 2: Verzeichnis-Struktur prüfen

**Auf Frontend-Server:**

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob app/api/ Verzeichnis existiert (App Router)
ls -la app/api/

# Prüfe ob pages/api/ Verzeichnis existiert (Pages Router)
ls -la pages/api/

# Prüfe ob integration/lib/ existiert
ls -la integration/lib/
```

**Wichtig:** 
- Next.js App Router verwendet `app/api/`
- Next.js Pages Router verwendet `pages/api/`
- Prüfe welche Struktur dein Frontend verwendet!

---

## 🔧 Schritt 3: Dateien kopieren (manuell)

**Falls `app/api/` Struktur (App Router):**

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Erstelle Verzeichnisse
mkdir -p app/api/readings/history
mkdir -p app/api/readings/[id]
mkdir -p app/api/readings/[id]/status
mkdir -p app/api/reading/generate
mkdir -p app/api/notifications/reading
mkdir -p app/api/coach/readings
mkdir -p app/api/agents/tasks
mkdir -p app/api/system/agents/tasks
mkdir -p app/api/agents/automation
mkdir -p app/api/agents/chart-development
mkdir -p app/api/agents/marketing
mkdir -p app/api/agents/sales
mkdir -p app/api/agents/social-youtube
mkdir -p app/api/agents/website-ux-agent
mkdir -p app/api/new-subscriber
mkdir -p integration/lib

# Dateien müssen dann manuell kopiert werden (siehe Option A oder B oben)
```

**Falls `pages/api/` Struktur (Pages Router):**

```bash
# Müsste angepasst werden - aber App Router ist wahrscheinlicher
```

---

## ✅ Schritt 4: Container neu bauen

```bash
cd /opt/hd-app/The-Connection-Key

# Container stoppen
docker compose stop frontend

# Container neu bauen
docker compose build --no-cache frontend

# Container starten
docker compose up -d frontend

# Logs prüfen
docker compose logs -f frontend
```

---

## 🔍 Schritt 5: Prüfe ob Dateien vorhanden sind

```bash
# Prüfe API-Routes
ls -la app/api/readings/history/route.ts
ls -la app/api/reading/generate/route.ts

# Prüfe Supabase Clients
ls -la integration/lib/supabase-clients.ts

# Prüfe ob Dateien korrekt sind
head -20 integration/lib/supabase-clients.ts
```

---

## 📝 Zusammenfassung

**Das Problem:**
- Frontend-Server hat separates Repository oder anderen Branch
- Integration-Dateien sind im MCP-Repository (Branch `feature/reading-agent-option-a-complete`)

**Die Lösung:**
1. ✅ Prüfe welches Repository auf Frontend-Server verwendet wird
2. ✅ Kopiere Dateien manuell (SCP oder vom Hetzner Server)
3. ✅ Container neu bauen
4. ✅ Testen

**Wichtig:** 
- API-Routes müssen in `app/api/` (App Router) oder `pages/api/` (Pages Router)
- `integration/lib/supabase-clients.ts` muss vorhanden sein
- Alle geänderten Dateien müssen kopiert werden
