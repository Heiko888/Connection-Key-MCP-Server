# 🚀 Frontend-Seiten Deployment

**Problem:** Frontend-Seiten sind lokal erstellt, aber nicht auf dem Server verfügbar

**Lösung:** Alle Frontend-Seiten auf Server deployen

---

## 📁 Fehlende Seiten

Die folgenden Seiten sind lokal erstellt, aber noch nicht auf dem Server:

- ✅ `/coach/agents/tasks` - Tasks Dashboard
- ✅ `/coach/agents/marketing` - Marketing Agent
- ✅ `/coach/agents/automation` - Automation Agent
- ✅ `/coach/agents/sales` - Sales Agent
- ✅ `/coach/agents/social-youtube` - Social-YouTube Agent
- ✅ `/coach/agents/chart` - Chart Development Agent

---

## ✅ Lösung: Script auf Server ausführen

### Schritt 1: Script auf Server kopieren

**Von deinem lokalen Rechner:**
```powershell
# Script auf Server kopieren
scp deploy-all-frontend-pages.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/
```

**Falls `scp` nicht funktioniert:** Script-Inhalt manuell auf Server erstellen

---

### Schritt 2: Auf Server einloggen

```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
```

---

### Schritt 3: Script ausführbar machen

```bash
chmod +x deploy-all-frontend-pages.sh
```

---

### Schritt 4: Script ausführen

```bash
./deploy-all-frontend-pages.sh
```

**Das Script macht:**
1. ✅ Erstellt alle Verzeichnisse
2. ✅ Erstellt alle Frontend-Seiten
3. ✅ Baut Container neu (ohne Cache)
4. ✅ Startet Container
5. ✅ Testet alle Seiten

---

## ⚠️ Wichtig: Dashboard-Komponente muss zuerst deployt sein

**Falls die Dashboard-Komponente fehlt:**

```bash
# Zuerst Dashboard deployen
./deploy-dashboard-to-server.sh

# Dann alle Seiten deployen
./deploy-all-frontend-pages.sh
```

---

## 🔍 Nach Deployment prüfen

### 1. Seiten öffnen

```
http://167.235.224.149:3000/coach/agents/tasks
http://167.235.224.149:3000/coach/agents/marketing
http://167.235.224.149:3000/coach/agents/automation
http://167.235.224.149:3000/coach/agents/sales
http://167.235.224.149:3000/coach/agents/social-youtube
http://167.235.224.149:3000/coach/agents/chart
```

---

### 2. Container-Logs prüfen

```bash
docker compose logs frontend | tail -50
```

---

## 📋 Reihenfolge für vollständiges Deployment

1. **Dashboard-Komponente deployen:**
   ```bash
   ./deploy-dashboard-to-server.sh
   ```

2. **Alle Frontend-Seiten deployen:**
   ```bash
   ./deploy-all-frontend-pages.sh
   ```

3. **Alle Agent-Routen deployen:**
   ```bash
   ./deploy-all-agent-routes.sh
   ```

---

## ✅ Nach erfolgreichem Deployment

**Alle Seiten sollten funktionieren:**
- ✅ Tasks Dashboard zeigt alle Tasks
- ✅ Agent-Seiten können Agenten aufrufen
- ✅ Tasks werden im Dashboard angezeigt
- ✅ Filter funktionieren

---

**🚀 Viel Erfolg beim Deployment!**
