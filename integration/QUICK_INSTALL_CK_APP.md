# ⚡ Schnell-Installation auf CK-App Server

## 🎯 Wichtig

**Das Next.js Projekt läuft auf 167.235.224.149, nicht auf dem Hetzner Server!**

---

## 🚀 Schnellstart

### Auf CK-App Server (167.235.224.149):

```bash
# 1. SSH zum CK-App Server
ssh root@167.235.224.149

# 2. Finden Sie das Next.js Projekt
# Typische Pfade:
# - /var/www/the-connection-key
# - /home/user/the-connection-key
# - /opt/the-connection-key

# 3. Ins Projekt-Verzeichnis
cd /path/to/your/nextjs-app

# 4. Git Pull (falls Git-Repository)
git pull origin main

# 5. Installations-Script ausführen
chmod +x integration/install-ck-app-server.sh
./integration/install-ck-app-server.sh

# 6. CSS importieren (in _app.tsx oder layout.tsx)
# import '../styles/agents.css'

# 7. Development Server starten
npm run dev
```

---

## 📋 Falls Git nicht möglich ist

### Option 1: SCP vom lokalen Rechner

```bash
# Von Windows (PowerShell)
cd C:\AppProgrammierung\Projekte\MCP_Connection_Key
scp -r integration/ root@167.235.224.149:/path/to/your/nextjs-app/
```

### Option 2: Dateien manuell erstellen

Die wichtigsten Dateien sind in `integration/api-routes/` und `integration/frontend/components/`

---

## 🧪 Testen

```bash
# API-Route testen
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'

# Im Browser öffnen
# http://localhost:3000/agents-dashboard
```

