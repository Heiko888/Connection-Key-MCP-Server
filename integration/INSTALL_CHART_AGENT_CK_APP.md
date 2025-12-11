# 📊 Chart Development Agent - Installation auf CK-App Server

## Problem
```
cp: cannot stat 'integration/api-routes/agents-chart-development.ts': No such file or directory
```

## Lösung

### Option 1: Git Pull (wenn Repository vorhanden)

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob Git Repository vorhanden
if [ -d ".git" ]; then
    git pull origin main
else
    echo "⚠️  Kein Git Repository gefunden. Verwende Option 2 oder 3."
fi

# Dann installieren
mkdir -p pages/api/agents
cp integration/api-routes/agents-chart-development.ts pages/api/agents/chart-development.ts
```

### Option 2: Dateien vom Hetzner Server kopieren

```bash
# Auf Hetzner Server (138.199.237.34)
cd /opt/mcp-connection-key
scp integration/api-routes/agents-chart-development.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/pages/api/agents/chart-development.ts
scp integration/frontend/components/ChartDevelopment.tsx root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/components/agents/ChartDevelopment.tsx
```

### Option 3: Dateien manuell erstellen

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# 1. Erstelle API-Route
mkdir -p pages/api/agents
cat > pages/api/agents/chart-development.ts << 'EOF'
[Inhalt der Datei siehe unten]
EOF

# 2. Erstelle Frontend-Komponente
mkdir -p components/agents
cat > components/agents/ChartDevelopment.tsx << 'EOF'
[Inhalt der Datei siehe unten]
EOF
```

### Option 4: Repository klonen/aktualisieren

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob integration/ Verzeichnis existiert
if [ ! -d "integration" ]; then
    # Repository klonen oder aktualisieren
    cd /opt
    git clone https://github.com/Heiko888/Connection-Key-MCP-Server.git temp-repo
    cp -r temp-repo/integration /opt/hd-app/The-Connection-Key/frontend/
    rm -rf temp-repo
fi

# Dann installieren
mkdir -p pages/api/agents
cp integration/api-routes/agents-chart-development.ts pages/api/agents/chart-development.ts
```

## Empfohlene Lösung

**Option 2** (vom Hetzner Server kopieren) ist am einfachsten, wenn Sie SSH-Zugriff haben.

## Vollständige Installation

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key/frontend

# 1. API-Route installieren (nachdem Datei vorhanden ist)
mkdir -p pages/api/agents
cp integration/api-routes/agents-chart-development.ts pages/api/agents/chart-development.ts

# 2. Frontend-Komponente installieren
mkdir -p components/agents
cp integration/frontend/components/ChartDevelopment.tsx components/agents/ChartDevelopment.tsx

# 3. Environment Variables prüfen
# Stelle sicher, dass in .env.local vorhanden:
# MCP_SERVER_URL=http://138.199.237.34:7000
# READING_AGENT_URL=http://138.199.237.34:4001

# 4. Next.js App neu starten
npm run dev  # oder pm2 restart next-app
```

