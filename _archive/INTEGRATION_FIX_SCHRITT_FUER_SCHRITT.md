# 🔧 Integration-Fix - Schritt für Schritt

**Problem:** Script funktioniert nicht + Integration-Dateien fehlen

---

## 🔍 Schritt 1: Prüfe ob Integration-Dateien existieren

**Auf dem Server:**

```bash
cd /opt/hd-app/The-Connection-Key

# Prüfe ob integration/ existiert
ls -la integration/

# Prüfe ob frontend/integration/ existiert
ls -la frontend/integration/
```

**Falls NICHT vorhanden:** Integration-Dateien müssen zuerst kopiert werden!

---

## 📦 Schritt 2: Integration-Dateien auf Server kopieren

**Von deinem Windows-Rechner (PowerShell):**

```powershell
cd c:\AppProgrammierung\Projekte\MCP_Connection_Key

# Integration-Dateien zum Server kopieren
scp -r integration root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/
```

**Warte bis der Kopiervorgang abgeschlossen ist!**

---

## ✅ Schritt 3: Prüfe ob Dateien angekommen sind

**Auf dem Server:**

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob integration/ jetzt existiert
ls -la integration/

# Prüfe ob API-Routes vorhanden sind
ls -la integration/api-routes/

# Prüfe ob Komponenten vorhanden sind
ls -la integration/frontend/components/
```

---

## 🔧 Schritt 4: Dateien ins Frontend kopieren (KORREKT)

**Auf dem Server - KOPIERE DIESE BEFEHLE KOMPLETT:**

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe Router-Typ
if [ -d "pages" ]; then
  echo "Pages Router erkannt"
  ROUTER_TYPE="pages"
elif [ -d "app" ]; then
  echo "App Router erkannt"
  ROUTER_TYPE="app"
else
  echo "❌ Weder pages/ noch app/ gefunden!"
  exit 1
fi

# API-Routes kopieren (Pages Router)
if [ "$ROUTER_TYPE" = "pages" ]; then
  echo "Kopiere API-Routes für Pages Router..."
  mkdir -p pages/api/agents pages/api/reading
  cp integration/api-routes/agents-*.ts pages/api/agents/ 2>/dev/null || echo "⚠️ Keine Agent-Routes gefunden"
  cp integration/api-routes/app-router/reading/generate/route.ts pages/api/reading/generate.ts 2>/dev/null || echo "⚠️ Reading-Route nicht gefunden"
  echo "✅ API-Routes kopiert (Pages Router)"
fi

# API-Routes kopieren (App Router)
if [ "$ROUTER_TYPE" = "app" ]; then
  echo "Kopiere API-Routes für App Router..."
  mkdir -p app/api/reading/generate
  cp integration/api-routes/app-router/reading/generate/route.ts app/api/reading/generate/route.ts 2>/dev/null || echo "⚠️ Reading-Route nicht gefunden"
  echo "✅ API-Routes kopiert (App Router)"
fi

# Komponenten kopieren
echo "Kopiere Komponenten..."
mkdir -p components/agents lib/components
cp integration/frontend/components/*.tsx components/agents/ 2>/dev/null || echo "⚠️ Keine Komponenten gefunden"
cp integration/frontend/components/*.tsx lib/components/ 2>/dev/null || echo "⚠️ Keine Komponenten gefunden"
echo "✅ Komponenten kopiert"
```

---

## 🐳 Schritt 5: Docker Container neu bauen

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

## 🔍 Schritt 6: Prüfe ob es funktioniert

```bash
# Prüfe ob Container läuft
docker ps | grep frontend

# Prüfe ob API-Routes existieren
ls -la /opt/hd-app/The-Connection-Key/frontend/pages/api/agents/ 2>/dev/null || ls -la /opt/hd-app/The-Connection-Key/frontend/app/api/reading/ 2>/dev/null

# Teste API-Route
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message":"Test","userId":"test"}' 2>/dev/null | head -20
```

---

## ❓ Problem: Script "cannot execute"

**Das Problem:** Script hat Windows-Zeilenenden (CRLF statt LF)

**Lösung 1: Script auf Server reparieren**

```bash
cd /opt/hd-app/The-Connection-Key

# Installiere dos2unix (falls nicht vorhanden)
apt-get update && apt-get install -y dos2unix

# Konvertiere Zeilenenden
dos2unix deploy-integration-automatisch.sh

# Jetzt sollte es funktionieren
chmod +x deploy-integration-automatisch.sh
./deploy-integration-automatisch.sh
```

**Lösung 2: Script neu erstellen (einfacher)**

```bash
cd /opt/hd-app/The-Connection-Key

# Lösche altes Script
rm deploy-integration-automatisch.sh

# Erstelle neues Script direkt auf Server
cat > deploy-integration-automatisch.sh << 'SCRIPTEOF'
#!/bin/bash
# (Hier würde der Script-Inhalt rein)
SCRIPTEOF

chmod +x deploy-integration-automatisch.sh
```

**Aber:** Für den Anfang ist es einfacher, die Befehle manuell auszuführen!

---

## 🎯 Zusammenfassung - Was du jetzt machen musst:

1. **Integration-Dateien kopieren** (von Windows):
   ```powershell
   scp -r integration root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/
   ```

2. **Auf Server einloggen und prüfen:**
   ```bash
   ssh root@167.235.224.149
   cd /opt/hd-app/The-Connection-Key/frontend
   ls -la integration/
   ```

3. **Dateien kopieren** (die korrekten Befehle von Schritt 4)

4. **Docker Container neu bauen** (Schritt 5)

---

**Starte mit Schritt 1 - prüfe ob Integration-Dateien vorhanden sind!** 🚀
