# 🚀 Deployment auf CK-App Server (167.235.224.149)

## 📋 Vorbereitung

Die Integration-Dateien sind lokal erstellt. Sie müssen auf den CK-App Server übertragen werden.

---

## 🔧 Option 1: Git Push & Pull (Empfohlen)

### Schritt 1: Lokal committen und pushen

```bash
# Auf Ihrem lokalen Rechner (Windows)
cd C:\AppProgrammierung\Projekte\MCP_Connection_Key

# Alle Änderungen committen
git add integration/
git commit -m "Add agent integration files"
git push origin main
```

### Schritt 2: Auf CK-App Server pullen

```bash
# Auf CK-App Server (167.235.224.149)
cd /path/to/your/nextjs-app

# Falls es ein Git-Repository ist
git pull origin main

# Dann Installations-Script ausführen
chmod +x integration/install-ck-app-server.sh
./integration/install-ck-app-server.sh
```

---

## 🔧 Option 2: SCP (Dateien kopieren)

### Schritt 1: Integration-Verzeichnis kopieren

```bash
# Von Ihrem Windows-Rechner (PowerShell)
# Stellen Sie sicher, dass Sie im richtigen Verzeichnis sind
cd C:\AppProgrammierung\Projekte\MCP_Connection_Key

# Kopieren Sie das integration/ Verzeichnis
scp -r integration/ root@167.235.224.149:/path/to/your/nextjs-app/
```

**Wichtig:** Ersetzen Sie `/path/to/your/nextjs-app/` mit dem tatsächlichen Pfad zu Ihrem Next.js Projekt.

---

## 🔧 Option 3: Manuelle Installation (Schritt-für-Schritt)

Falls Git/SCP nicht möglich ist, erstellen Sie die Dateien direkt auf dem Server:

### Schritt 1: API-Routes erstellen

```bash
# Auf CK-App Server
cd /path/to/your/nextjs-app

# Erstelle Verzeichnisse
mkdir -p pages/api/agents
mkdir -p pages/api/readings
```

Dann erstellen Sie die Dateien manuell (siehe nächste Dateien).

### Schritt 2: Environment Variables

```bash
# In .env.local
echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local
echo "READING_AGENT_URL=http://138.199.237.34:4001" >> .env.local
```

---

## 📝 Welche Dateien müssen übertragen werden?

### API-Routes (5 Dateien):
- `integration/api-routes/agents-marketing.ts`
- `integration/api-routes/agents-automation.ts`
- `integration/api-routes/agents-sales.ts`
- `integration/api-routes/agents-social-youtube.ts`
- `integration/api-routes/readings-generate.ts`

### Frontend-Komponenten (3 Dateien):
- `integration/frontend/components/AgentChat.tsx`
- `integration/frontend/components/ReadingGenerator.tsx`
- `integration/frontend/pages/agents-dashboard.tsx`

### Installations-Script:
- `integration/install-ck-app-server.sh`

---

## 🧪 Nach der Installation testen

```bash
# Auf CK-App Server
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

---

## ❓ Wie finden Sie das Next.js Projekt-Verzeichnis?

```bash
# Auf CK-App Server
# Option 1: Suche nach package.json
find / -name "package.json" -type f 2>/dev/null | grep -i next

# Option 2: Suche nach next.config
find / -name "next.config.*" -type f 2>/dev/null

# Option 3: Prüfe typische Verzeichnisse
ls /var/www/
ls /home/
ls /opt/
```

