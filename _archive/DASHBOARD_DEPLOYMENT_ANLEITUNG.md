# 🚀 Dashboard auf Server bringen - Anleitung

**Ziel:** Agent Tasks Dashboard auf Server deployen

---

## ✅ Option 1: Script auf Server ausführen (Empfohlen)

### Schritt 1: Script auf Server kopieren

**Von deinem lokalen Rechner:**
```powershell
# Script auf Server kopieren
scp deploy-dashboard-to-server.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/
```

**Falls `scp` nicht funktioniert:** Script-Inhalt manuell auf Server erstellen (siehe Option 2)

---

### Schritt 2: Auf Server einloggen

```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
```

---

### Schritt 3: Script ausführbar machen

```bash
chmod +x deploy-dashboard-to-server.sh
```

---

### Schritt 4: Script ausführen

```bash
./deploy-dashboard-to-server.sh
```

**Das Script macht automatisch:**
1. ✅ Erstellt Verzeichnisse
2. ✅ Erstellt AgentTasksDashboard Komponente
3. ✅ Erstellt Tasks Seite
4. ✅ Baut Container neu (ohne Cache)
5. ✅ Startet Container
6. ✅ Testet Routes

---

## ✅ Option 2: Manuell deployen

**Falls Script nicht funktioniert:**

### Schritt 1: Auf Server einloggen

```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
```

---

### Schritt 2: Verzeichnisse erstellen

```bash
mkdir -p frontend/components
mkdir -p frontend/app/coach/agents/tasks
```

---

### Schritt 3: Komponente erstellen

```bash
# Datei erstellen
nano frontend/components/AgentTasksDashboard.tsx
```

**Inhalt einfügen:** Kopiere den Inhalt von `integration/frontend/components/AgentTasksDashboard.tsx` aus deinem lokalen Projekt.

**Oder direkt mit cat (wenn du den Inhalt hast):**
```bash
cat > frontend/components/AgentTasksDashboard.tsx << 'EOF'
[Inhalt hier einfügen]
EOF
```

---

### Schritt 4: Seite erstellen

```bash
# Datei erstellen
nano frontend/app/coach/agents/tasks/page.tsx
```

**Inhalt:**
```typescript
/**
 * Agent Tasks Dashboard Page
 * Seite für das Agent Tasks Dashboard
 */

import { AgentTasksDashboard } from '../../../../components/AgentTasksDashboard';

export default function AgentTasksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AgentTasksDashboard />
    </div>
  );
}
```

---

### Schritt 5: Container neu bauen

```bash
docker compose stop frontend
docker compose rm -f frontend
docker compose build --no-cache frontend
docker compose up -d frontend
```

---

### Schritt 6: Warten und testen

```bash
# Warte 20 Sekunden
sleep 20

# Teste Dashboard Route
curl -I http://localhost:3000/coach/agents/tasks

# Teste API
curl -X GET http://localhost:3000/api/agents/tasks
```

---

## ✅ Option 3: Dateien direkt kopieren (wenn Git vorhanden)

**Falls das Projekt ein Git-Repository ist:**

```bash
# Auf Server
cd /opt/hd-app/The-Connection-Key

# Git Pull (falls Dateien bereits committed)
git pull origin main

# Prüfe ob Dateien vorhanden sind
ls -la frontend/components/AgentTasksDashboard.tsx
ls -la frontend/app/coach/agents/tasks/page.tsx

# Falls vorhanden, Container neu bauen
docker compose build --no-cache frontend
docker compose up -d frontend
```

---

## 🔍 Nach Deployment prüfen

### 1. Dashboard öffnen

```
http://167.235.224.149:3000/coach/agents/tasks
```

**Oder lokal (wenn Port-Forwarding):**
```
http://localhost:3000/coach/agents/tasks
```

---

### 2. API testen

```bash
# Tasks abrufen
curl -X GET http://localhost:3000/api/agents/tasks

# Statistiken abrufen
curl -X POST http://localhost:3000/api/agents/tasks \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

### 3. Container-Logs prüfen

```bash
docker compose logs frontend | tail -50
```

---

## ⚠️ Troubleshooting

### Problem: 404 Error beim Öffnen des Dashboards

**Lösung:**
```bash
# Prüfe ob Dateien existieren
ls -la frontend/components/AgentTasksDashboard.tsx
ls -la frontend/app/coach/agents/tasks/page.tsx

# Falls nicht vorhanden, erstelle sie (siehe Option 2)
# Dann Container neu bauen
docker compose build --no-cache frontend
docker compose up -d frontend
```

---

### Problem: Build-Fehler

**Lösung:**
```bash
# Prüfe Logs
docker compose logs frontend | grep -i error

# Prüfe ob TypeScript-Fehler vorhanden
docker exec the-connection-key-frontend-1 npm run build 2>&1 | grep -i error
```

---

### Problem: API gibt 404 zurück

**Lösung:**
```bash
# Prüfe ob Tasks-Route existiert
docker exec the-connection-key-frontend-1 find /app/.next -path "*/api/agents/tasks/*" -name "route.js"

# Falls nicht, Tasks-Route deployen (siehe TASKS_ROUTE_PRODUCTION_FIX.md)
```

---

## ✅ Erfolgreich deployt?

**Wenn alles funktioniert, solltest du sehen:**
- ✅ Dashboard-Seite lädt (`/coach/agents/tasks`)
- ✅ Statistiken werden angezeigt
- ✅ Tasks-Liste wird angezeigt (auch wenn leer)
- ✅ Filter funktionieren
- ✅ API gibt Daten zurück

---

**🚀 Viel Erfolg beim Deployment!**
