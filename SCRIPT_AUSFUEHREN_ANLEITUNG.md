# 📝 Script ausführen - Schritt für Schritt

**Problem:** Script funktioniert nicht - wo führe ich es aus?

---

## 🔍 Wo ist das Script?

**Lokal auf deinem Windows-Rechner:**
```
c:\AppProgrammierung\Projekte\MCP_Connection_Key\deploy-integration-automatisch.sh
```

**Auf dem Server (nach dem Kopieren):**
```
/opt/hd-app/The-Connection-Key/deploy-integration-automatisch.sh
```

---

## 🚀 Option 1: Script auf Server kopieren und ausführen

### Schritt 1: Script auf Server kopieren

**Auf deinem Windows-Rechner (PowerShell):**

```powershell
# Wechsle ins Projekt-Verzeichnis
cd c:\AppProgrammierung\Projekte\MCP_Connection_Key

# Kopiere Script auf Server
scp deploy-integration-automatisch.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/
```

**Oder mit vollständigem Pfad:**

```powershell
scp c:\AppProgrammierung\Projekte\MCP_Connection_Key\deploy-integration-automatisch.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/
```

---

### Schritt 2: Auf Server einloggen

```powershell
ssh root@167.235.224.149
```

---

### Schritt 3: Script ausführbar machen und ausführen

**Auf dem Server (nach SSH-Login):**

```bash
# Ins Verzeichnis wechseln
cd /opt/hd-app/The-Connection-Key

# Prüfe ob Script existiert
ls -la deploy-integration-automatisch.sh

# Script ausführbar machen
chmod +x deploy-integration-automatisch.sh

# Script ausführen
./deploy-integration-automatisch.sh
```

---

## 🔧 Option 2: Manuell ohne Script (einfacher)

**Falls das Script Probleme macht, mache es manuell:**

### Schritt 1: Integration-Dateien auf Server kopieren

**Auf deinem Windows-Rechner (PowerShell):**

```powershell
cd c:\AppProgrammierung\Projekte\MCP_Connection_Key

# Integration-Dateien kopieren
scp -r integration root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/
```

---

### Schritt 2: Auf Server einloggen und Dateien kopieren

**Auf dem Server (nach SSH-Login):**

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob integration/ existiert
ls -la integration/

# Prüfe Router-Typ
if [ -d "pages" ]; then
  echo "Pages Router"
  ROUTER_TYPE="pages"
elif [ -d "app" ]; then
  echo "App Router"
  ROUTER_TYPE="app"
fi

# API-Routes kopieren (Pages Router)
if [ "$ROUTER_TYPE" = "pages" ]; then
  mkdir -p pages/api/agents pages/api/reading
  cp integration/api-routes/agents-*.ts pages/api/agents/ 2>/dev/null || true
  cp integration/api-routes/app-router/reading/generate/route.ts pages/api/reading/generate.ts 2>/dev/null || true
  echo "✅ API-Routes kopiert (Pages Router)"
fi

# API-Routes kopieren (App Router)
if [ "$ROUTER_TYPE" = "app" ]; then
  mkdir -p app/api/reading/generate
  cp integration/api-routes/app-router/reading/generate/route.ts app/api/reading/generate/route.ts 2>/dev/null || true
  echo "✅ API-Routes kopiert (App Router)"
fi

# Komponenten kopieren
mkdir -p components/agents lib/components
cp integration/frontend/components/*.tsx components/agents/ 2>/dev/null || true
cp integration/frontend/components/*.tsx lib/components/ 2>/dev/null || true
echo "✅ Komponenten kopiert"
```

---

### Schritt 3: Docker Container neu bauen

```bash
cd /opt/hd-app/The-Connection-Key

# Container stoppen
docker compose stop frontend

# Container neu bauen
docker compose build frontend

# Container neu starten
docker compose up -d frontend

# Warte 10 Sekunden
sleep 10

# Prüfe Logs
docker logs the-connection-keyfrontend-1 --tail 30
```

---

## ❓ Häufige Probleme

### Problem 1: "Permission denied"

**Lösung:**
```bash
chmod +x deploy-integration-automatisch.sh
```

---

### Problem 2: "Script nicht gefunden"

**Lösung:**
```bash
# Prüfe ob Script existiert
ls -la /opt/hd-app/The-Connection-Key/deploy-integration-automatisch.sh

# Falls nicht, kopiere es nochmal
# (von deinem Windows-Rechner)
```

---

### Problem 3: "Integration-Verzeichnis nicht gefunden"

**Lösung:**
```bash
# Prüfe ob integration/ existiert
ls -la /opt/hd-app/The-Connection-Key/frontend/integration/

# Falls nicht, kopiere es:
# (von deinem Windows-Rechner)
scp -r integration root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/
```

---

### Problem 4: "Docker Compose nicht gefunden"

**Lösung:**
```bash
# Prüfe ob docker compose funktioniert
docker compose version

# Falls nicht, verwende:
docker-compose build frontend
docker-compose up -d frontend
```

---

## ✅ Empfehlung

**Für den Anfang: Option 2 (manuell) verwenden!**

**Warum?**
- ✅ Einfacher zu verstehen
- ✅ Du siehst jeden Schritt
- ✅ Weniger Fehlerquellen
- ✅ Du lernst, wie es funktioniert

**Später kannst du dann das Script verwenden, wenn alles funktioniert.**

---

## 🎯 Zusammenfassung

**Wo Script ausführen?**
- ✅ **NICHT** auf Windows (PowerShell)
- ✅ **AUF DEM SERVER** (nach SSH-Login)

**Schritte:**
1. Script auf Server kopieren (von Windows)
2. SSH zum Server
3. Script ausführbar machen (`chmod +x`)
4. Script ausführen (`./deploy-integration-automatisch.sh`)

**Oder:** Mache es manuell (Option 2) - ist einfacher! 🚀
