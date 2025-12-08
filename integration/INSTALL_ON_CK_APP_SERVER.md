# 🚀 Installation auf CK-App Server (167.235.224.149)

## ⚠️ Wichtig

Das Next.js Projekt läuft auf **167.235.224.149**, nicht auf dem Hetzner Server!

---

## 📋 Schritt-für-Schritt

### Schritt 1: SSH zum CK-App Server

```bash
ssh root@167.235.224.149
# Oder wie auch immer Sie auf den Server zugreifen
```

### Schritt 2: Finden Sie das Next.js Projekt

```bash
# Option 1: Suche nach package.json mit "next" dependency
find / -name "package.json" -type f 2>/dev/null | xargs grep -l "next" 2>/dev/null | head -5

# Option 2: Suche nach next.config
find / -name "next.config.*" -type f 2>/dev/null

# Option 3: Prüfe typische Verzeichnisse
ls /var/www/
ls /home/
ls /opt/
ls /root/
```

### Schritt 3: Ins Projekt-Verzeichnis wechseln

```bash
cd /path/to/your/nextjs-app
# Beispiel: /var/www/the-connection-key oder ähnlich
```

### Schritt 4: Git Pull

```bash
# Prüfe ob es ein Git-Repository ist
git status

# Falls ja, pullen
git pull origin main

# Falls nicht, müssen Sie die Dateien manuell kopieren
```

### Schritt 5: Installations-Script ausführen

```bash
# Prüfe ob integration/ existiert
ls integration/

# Falls ja:
chmod +x integration/install-ck-app-server.sh
./integration/install-ck-app-server.sh

# Falls nicht, siehe manuelle Installation unten
```

---

## 🔧 Manuelle Installation (falls Git nicht möglich)

### 1. API-Routes erstellen

```bash
cd /path/to/your/nextjs-app

# Erstelle Verzeichnisse
mkdir -p pages/api/agents
mkdir -p pages/api/readings

# Erstelle die Dateien manuell (siehe integration/api-routes/*.ts)
# Oder kopieren Sie sie von Ihrem lokalen Rechner
```

### 2. Environment Variables

```bash
# Erstelle oder bearbeite .env.local
nano .env.local

# Füge hinzu:
MCP_SERVER_URL=http://138.199.237.34:7000
READING_AGENT_URL=http://138.199.237.34:4001
```

### 3. Frontend-Komponenten

```bash
# Erstelle Verzeichnis
mkdir -p components/agents

# Kopiere Komponenten (von lokal oder erstelle sie manuell)
# Siehe integration/frontend/components/*.tsx
```

---

## 📤 Dateien vom lokalen Rechner kopieren

Falls Git nicht möglich ist, kopieren Sie die Dateien per SCP:

```bash
# Von Ihrem Windows-Rechner (PowerShell)
cd C:\AppProgrammierung\Projekte\MCP_Connection_Key

# Kopiere integration/ Verzeichnis
scp -r integration/ root@167.235.224.149:/path/to/your/nextjs-app/
```

---

## ✅ Nach der Installation

```bash
# Development Server starten
npm run dev

# Testen
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

