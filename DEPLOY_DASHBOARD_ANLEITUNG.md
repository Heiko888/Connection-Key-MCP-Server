# 🚀 Dashboard Deployment Anleitung

**Problem:** `scp` funktioniert nicht von Windows PowerShell aus

**Lösung:** Script direkt auf Server ausführen

---

## ✅ Lösung: Script auf Server ausführen

### Schritt 1: Script auf Server kopieren

**Von deinem lokalen Rechner (PowerShell):**
```powershell
# Script auf Server kopieren
scp deploy-dashboard-to-server.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/
```

**Falls `scp` nicht funktioniert, Script-Inhalt manuell auf Server erstellen:**

### Schritt 2: Auf Server einloggen

```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
```

### Schritt 3: Script erstellen (falls nicht kopiert)

**Option A: Script von lokal kopieren (wenn möglich)**
```bash
# Script sollte bereits vorhanden sein, wenn du es kopiert hast
ls -la deploy-dashboard-to-server.sh
```

**Option B: Script manuell erstellen**
```bash
# Script erstellen
nano deploy-dashboard-to-server.sh
# Inhalt von deploy-dashboard-to-server.sh einfügen
# Speichern: Ctrl+O, Enter, Ctrl+X
```

### Schritt 4: Script ausführbar machen

```bash
chmod +x deploy-dashboard-to-server.sh
```

### Schritt 5: Script ausführen

```bash
./deploy-dashboard-to-server.sh
```

**Das Script macht:**
1. ✅ Erstellt Verzeichnisse
2. ✅ Erstellt AgentTasksDashboard Komponente
3. ✅ Erstellt Tasks Seite
4. ✅ Baut Container neu (ohne Cache)
5. ✅ Startet Container
6. ✅ Testet Routes

---

## 🔍 Alternative: Manuell deployen

**Falls Script nicht funktioniert:**

### 1. Verzeichnisse erstellen

```bash
cd /opt/hd-app/The-Connection-Key
mkdir -p frontend/components
mkdir -p frontend/app/coach/agents/tasks
```

### 2. Komponente erstellen

```bash
# Komponente-Datei erstellen
nano frontend/components/AgentTasksDashboard.tsx
# Inhalt von integration/frontend/components/AgentTasksDashboard.tsx einfügen
```

### 3. Seite erstellen

```bash
# Seite-Datei erstellen
nano frontend/app/coach/agents/tasks/page.tsx
# Inhalt von integration/frontend/app/coach/agents/tasks/page.tsx einfügen
```

### 4. Container neu bauen

```bash
docker compose stop frontend
docker compose rm -f frontend
docker compose build --no-cache frontend
docker compose up -d frontend
```

### 5. Testen

```bash
# Warte 20 Sekunden
sleep 20

# Teste Dashboard
curl -I http://localhost:3000/coach/agents/tasks

# Teste API
curl -X GET http://localhost:3000/api/agents/tasks
```

---

## ✅ Nach erfolgreichem Deployment

**Dashboard öffnen:**
```
http://167.235.224.149:3000/coach/agents/tasks
```

**Oder lokal (wenn Port-Forwarding):**
```
http://localhost:3000/coach/agents/tasks
```

---

## 🔧 Troubleshooting

### Problem: 404 Error
**Lösung:** Container neu bauen
```bash
docker compose build --no-cache frontend
docker compose up -d frontend
```

### Problem: Dateien fehlen
**Lösung:** Prüfe ob Dateien existieren
```bash
ls -la frontend/components/AgentTasksDashboard.tsx
ls -la frontend/app/coach/agents/tasks/page.tsx
```

### Problem: Build-Fehler
**Lösung:** Prüfe Logs
```bash
docker compose logs frontend | tail -50
```

---

**✅ Dashboard sollte jetzt funktionieren!**
