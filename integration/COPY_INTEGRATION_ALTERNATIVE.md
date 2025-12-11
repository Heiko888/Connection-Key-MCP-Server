# 📤 Alternative: Integration-Dateien kopieren

## Problem mit SCP

SCP hat Probleme mit Verzeichnissen. Verwenden Sie eine Alternative.

## Lösung 1: Mit tar (empfohlen)

### Schritt 1: Archiv erstellen (Windows)

**Von Windows (PowerShell):**

```powershell
cd C:\AppProgrammierung\Projekte\MCP_Connection_Key

# Erstelle ZIP-Archiv (Windows hat zip)
Compress-Archive -Path integration -DestinationPath integration.zip

# Kopiere ZIP
scp integration.zip root@167.235.224.149:/tmp/
```

### Schritt 2: Auf Server entpacken

**Auf CK-App Server (167.235.224.149):**

```bash
cd /opt/hd-app/The-Connection-Key/frontend
unzip /tmp/integration.zip
rm /tmp/integration.zip
ls integration/
```

---

## Lösung 2: Vom Hetzner Server kopieren

**Auf Hetzner Server (138.199.237.34):**

```bash
cd /opt/mcp-connection-key
tar -czf integration.tar.gz integration/
scp integration.tar.gz root@167.235.224.149:/tmp/
```

**Auf CK-App Server (167.235.224.149):**

```bash
cd /opt/hd-app/The-Connection-Key/frontend
tar -xzf /tmp/integration.tar.gz
rm /tmp/integration.tar.gz
ls integration/
```

---

## Lösung 3: rsync (falls verfügbar)

**Von Windows (mit WSL oder Git Bash):**

```bash
rsync -avz integration/ root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/
```

---

## Lösung 4: Manuell wichtige Dateien kopieren

Falls nichts funktioniert, kopieren Sie nur die wichtigsten Dateien:

**Von Windows (PowerShell):**

```powershell
cd C:\AppProgrammierung\Projekte\MCP_Connection_Key

# API-Routes
scp integration/api-routes/agents-marketing.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/api-routes/
scp integration/api-routes/agents-automation.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/api-routes/
scp integration/api-routes/agents-sales.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/api-routes/
scp integration/api-routes/agents-social-youtube.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/api-routes/
scp integration/api-routes/readings-generate.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/api-routes/

# Frontend-Komponenten
scp integration/frontend/components/AgentChat.tsx root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/frontend/components/
scp integration/frontend/components/ReadingGenerator.tsx root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/frontend/components/

# Scripts
scp integration/install-ck-app-server.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/
scp integration/QUICK_DEPLOY_CK_APP.sh root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/integration/
```

**Aber zuerst Verzeichnisse erstellen:**

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend
mkdir -p integration/api-routes
mkdir -p integration/frontend/components
```

---

## Empfehlung: Lösung 2 (vom Hetzner Server)

Das ist am einfachsten, da beide Server bereits verbunden sind.

