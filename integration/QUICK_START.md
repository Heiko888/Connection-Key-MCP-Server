# 🚀 Quick Start - Agenten-Integration

## 📋 Schnellstart-Anleitung

### Schritt 1: Auf CK-App Server (167.235.224.149)

```bash
# 1. Ins Next.js Projekt-Verzeichnis wechseln
cd /path/to/your/nextjs-app

# 2. Installations-Script ausführen
chmod +x integration/install-ck-app-server.sh
./integration/install-ck-app-server.sh

# 3. CSS importieren (in _app.tsx oder layout.tsx)
# Fügen Sie hinzu: import '../styles/agents.css'

# 4. Development Server starten
npm run dev
```

### Schritt 2: Auf Hetzner Server (138.199.237.34)

```bash
# 1. Ins Projekt-Verzeichnis wechseln
cd /opt/mcp-connection-key

# 2. CORS-Setup ausführen
chmod +x integration/install-hetzner-server.sh
./integration/install-hetzner-server.sh
```

### Schritt 3: Testen

```bash
# Auf CK-App Server
chmod +x integration/test-integration.sh
./integration/test-integration.sh
```

### Schritt 4: Im Browser öffnen

```
http://localhost:3000/agents-dashboard
http://localhost:3000/readings/create
```

---

## ✅ Fertig!

Alle Agenten sollten jetzt über das Frontend erreichbar sein! 🎉

