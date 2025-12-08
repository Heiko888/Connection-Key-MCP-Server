# 📋 Schritt-für-Schritt Installation

## 🎯 Übersicht

Diese Anleitung führt Sie durch die komplette Installation der Agenten-Integration auf beiden Servern.

---

## 📍 Schritt 1: Auf Hetzner Server (138.199.237.34)

### 1.1 SSH-Verbindung

```bash
ssh root@138.199.237.34
```

### 1.2 Ins Projekt-Verzeichnis wechseln

```bash
cd /opt/mcp-connection-key
```

### 1.3 CORS-Setup ausführen

```bash
# Script ausführbar machen
chmod +x integration/install-hetzner-server.sh

# Script ausführen
./integration/install-hetzner-server.sh
```

**Erwartete Ausgabe:**
- ✅ CORS_ORIGINS in .env gesetzt
- ✅ Firewall-Regeln geprüft
- ✅ Services neu gestartet
- ✅ Health Checks erfolgreich

### 1.4 Prüfen Sie die Services

```bash
# Docker Services
docker-compose ps

# PM2 Services
pm2 status

# MCP Server
systemctl status mcp
```

**Alle sollten "running" oder "online" sein.**

### 1.5 Testen Sie die Agenten direkt

```bash
# MCP Server Agenten
curl http://localhost:7000/agents

# Marketing Agent testen
curl -X POST http://localhost:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'

# Reading Agent testen
curl http://localhost:4001/health
```

---

## 📍 Schritt 2: Auf CK-App Server (167.235.224.149)

### 2.1 SSH-Verbindung

```bash
ssh root@167.235.224.149
# Oder wie auch immer Sie auf den Server zugreifen
```

### 2.2 Ins Next.js Projekt-Verzeichnis wechseln

```bash
# Finden Sie Ihr Next.js Projekt-Verzeichnis
# Normalerweise: /var/www/... oder /home/... oder ähnlich
cd /path/to/your/nextjs-app

# Prüfen Sie, ob es ein Next.js Projekt ist
ls package.json
```

### 2.3 Integration-Dateien kopieren (falls nötig)

**Falls die `integration/` Dateien noch nicht auf dem Server sind:**

```bash
# Von Ihrem lokalen Rechner (Windows)
# Verwenden Sie scp oder Git

# Option 1: Git Pull (wenn Repository auf Server)
git pull origin main

# Option 2: SCP (vom lokalen Rechner)
# scp -r integration/ root@167.235.224.149:/path/to/your/nextjs-app/
```

### 2.4 Installations-Script ausführen

```bash
# Script ausführbar machen
chmod +x integration/install-ck-app-server.sh

# Script ausführen
./integration/install-ck-app-server.sh
```

**Erwartete Ausgabe:**
- ✅ API-Routes kopiert
- ✅ Komponenten kopiert
- ✅ Environment Variables gesetzt
- ✅ CSS-Datei erstellt

### 2.5 CSS importieren

**Für Pages Router (`pages/_app.tsx`):**

```typescript
import '../styles/agents.css';
```

**Für App Router (`app/layout.tsx`):**

```typescript
import '../styles/agents.css';
```

### 2.6 Environment Variables prüfen

```bash
# Prüfen Sie .env.local
cat .env.local

# Sollte enthalten:
# MCP_SERVER_URL=http://138.199.237.34:7000
# READING_AGENT_URL=http://138.199.237.34:4001
```

### 2.7 Development Server starten

```bash
npm run dev
# Oder
yarn dev
```

---

## 📍 Schritt 3: Testen

### 3.1 API-Routes testen

```bash
# Auf CK-App Server
chmod +x integration/test-integration.sh
./integration/test-integration.sh
```

**Oder manuell:**

```bash
# Marketing Agent
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Gib mir 3 Hooks für ein Reel"}'

# Reading Agent
curl -X POST http://localhost:3000/api/readings/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "detailed"
  }'
```

### 3.2 Frontend testen

1. Öffnen Sie im Browser: `http://localhost:3000/agents-dashboard`
2. Testen Sie jeden Agenten
3. Öffnen Sie: `http://localhost:3000/readings/create`
4. Generieren Sie ein Reading

### 3.3 Browser-Console prüfen

Öffnen Sie die Browser-Console (F12) und prüfen Sie auf:
- ✅ Keine CORS-Fehler
- ✅ Keine 404-Fehler
- ✅ API-Aufrufe erfolgreich

---

## 🔧 Troubleshooting

### Problem: CORS-Fehler im Browser

**Lösung:**
```bash
# Auf Hetzner Server
cd /opt/mcp-connection-key
./integration/install-hetzner-server.sh
```

### Problem: API-Route gibt 404

**Lösung:**
```bash
# Prüfen Sie, ob die Dateien existieren
ls pages/api/agents/
ls pages/api/readings/

# Falls nicht, kopieren Sie sie manuell
```

### Problem: Agent antwortet nicht

**Lösung:**
```bash
# Auf Hetzner Server prüfen
curl http://localhost:7000/health
curl http://localhost:4001/health

# Falls nicht erreichbar, Services neu starten
docker-compose restart
pm2 restart reading-agent
systemctl restart mcp
```

### Problem: Environment Variables nicht gesetzt

**Lösung:**
```bash
# Auf CK-App Server
echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local
echo "READING_AGENT_URL=http://138.199.237.34:4001" >> .env.local

# Development Server neu starten
```

---

## ✅ Checkliste

### Hetzner Server (138.199.237.34)
- [ ] CORS-Script ausgeführt
- [ ] Services laufen (docker-compose ps, pm2 status)
- [ ] Ports offen (ufw status)
- [ ] Health Checks erfolgreich

### CK-App Server (167.235.224.149)
- [ ] API-Routes installiert
- [ ] Frontend-Komponenten installiert
- [ ] CSS importiert
- [ ] Environment Variables gesetzt
- [ ] Development Server läuft

### Tests
- [ ] API-Routes funktionieren
- [ ] Frontend lädt ohne Fehler
- [ ] Agenten antworten
- [ ] Keine CORS-Fehler

---

## 🎉 Fertig!

Wenn alle Checklisten abgehakt sind, sollten alle Agenten über das Frontend erreichbar sein!

**Nächste Schritte:**
- Dashboard anpassen
- Styling verbessern
- Weitere Features hinzufügen

