# ✅ Finales Deployment - Komplett

## 📍 Server-Informationen

### Hetzner Server (138.199.237.34)
- **Verzeichnis:** `/opt/mcp-connection-key`
- **Services:** MCP Server (7000), Reading Agent (4001)

### CK-App Server (167.235.224.149)
- **Projekt-Pfad:** `/opt/hd-app/The-Connection-Key/frontend`
- **Next.js App:** Frontend der Connection-Key App

---

## 🚀 Deployment-Schritte

### 1. Auf Hetzner Server (138.199.237.34)

```bash
ssh root@138.199.237.34
cd /opt/mcp-connection-key

# Git Pull
git pull origin main

# CORS & Firewall prüfen/konfigurieren
chmod +x integration/VERIFY_CORS_FIREWALL.sh
./integration/VERIFY_CORS_FIREWALL.sh
```

### 2. Auf CK-App Server (167.235.224.149)

```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key/frontend

# Option A: Quick Deployment (empfohlen)
chmod +x integration/QUICK_DEPLOY_CK_APP.sh
./integration/QUICK_DEPLOY_CK_APP.sh

# Option B: Manuell
git pull origin main
echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local
echo "READING_AGENT_URL=http://138.199.237.34:4001" >> .env.local
chmod +x integration/install-ck-app-server.sh
./integration/install-ck-app-server.sh
```

### 3. CSS importieren

**In `pages/_app.tsx` oder `app/layout.tsx`:**

```typescript
import '../styles/agents.css';
```

### 4. App neu starten

```bash
# Development
npm run dev

# Oder Production
npm run build && npm start

# Oder PM2
pm2 restart the-connection-key
```

### 5. Testen

```bash
# API-Route testen
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'

# Browser öffnen
http://localhost:3000/agents-dashboard
```

---

## ✅ Finale Checkliste

### Hetzner Server
- [ ] Git Pull durchgeführt
- [ ] CORS & Firewall geprüft/konfiguriert
- [ ] Services laufen (MCP Server, Reading Agent)

### CK-App Server
- [ ] Git Pull durchgeführt
- [ ] Environment Variables gesetzt
- [ ] API-Routes installiert
- [ ] CSS importiert
- [ ] App neu gestartet
- [ ] Getestet

---

## 📚 Wichtige Dateien

### Für Hetzner Server:
- `integration/VERIFY_CORS_FIREWALL.sh` - CORS & Firewall Prüfung

### Für CK-App Server:
- `integration/QUICK_DEPLOY_CK_APP.sh` - Quick Deployment
- `integration/install-ck-app-server.sh` - Vollständige Installation
- `integration/DEPLOY_CK_APP_SPECIFIC.md` - Spezifische Anleitung

---

## 🎯 Zusammenfassung

**Projekt-Pfad CK-App:** `/opt/hd-app/The-Connection-Key/frontend`

**Alle Dateien sind im Repository und bereit für das Deployment!**

- ✅ Alle 5 Agenten integriert
- ✅ API-Routes erstellt
- ✅ Frontend-Komponenten erstellt
- ✅ Installations-Scripts vorhanden
- ✅ Dokumentation vollständig

**Bereit für das finale Deployment!** 🚀

