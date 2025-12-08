# ✅ Deployment-Bereit: Finale Checkliste

## 🎉 Was wurde erledigt

### ✅ Lokale Entwicklung (Windows)

1. **Environment Variables gesetzt**
   - ✅ `frontend/.env.local`: `MCP_SERVER_URL` und `READING_AGENT_URL`
   - ✅ Root `.env`: `MCP_SERVER_URL` und `READING_AGENT_URL`

2. **API-Routes erstellt** (4 Agenten + Reading)
   - ✅ `/api/agents/marketing`
   - ✅ `/api/agents/automation`
   - ✅ `/api/agents/sales`
   - ✅ `/api/agents/social-youtube`
   - ✅ `/api/reading/generate`

3. **Git Commit & Push**
   - ✅ Commit: `900a5af2` - "Add Agent API routes and update Reading generation"
   - ✅ 6 Dateien geändert
   - ✅ Push erfolgreich

---

## 🔗 Kommunikations-Flow (funktionsfähig)

```
✅ Frontend (167.235.224.149)
    │
    │ ✅ API-Routes vorhanden
    ▼
✅ /api/agents/* (4 Routes erstellt)
    │
    │ ✅ Verbindung konfiguriert
    ▼
✅ MCP Server (138.199.237.34:7000) - BEREIT

✅ /api/reading/generate
    │
    │ ✅ Verbindung konfiguriert
    ▼
✅ Reading Agent (138.199.237.34:4001) - BEREIT
```

**Status:** ✅ **Alle Verbindungen konfiguriert**

---

## 🚀 Nächste Schritte: Server-Deployment

### Schritt 1: Auf CK-App Server einloggen

```bash
ssh root@167.235.224.149
# Oder wie auch immer Sie auf den Server zugreifen
```

### Schritt 2: Next.js Projekt-Verzeichnis finden

```bash
# Option 1: Suche nach package.json mit "next"
find / -name "package.json" -type f 2>/dev/null | xargs grep -l '"next"' 2>/dev/null | head -5

# Option 2: Typische Verzeichnisse prüfen
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
# Prüfe ob Git-Repository
git status

# Pull durchführen
git pull origin main

# Prüfe ob integration/ vorhanden ist
ls integration/
```

### Schritt 5: Environment Variables setzen

```bash
# Prüfe ob .env.local existiert
ls -la .env.local

# Falls nicht vorhanden, erstellen
touch .env.local

# Environment Variables hinzufügen
cat >> .env.local << 'EOF'
MCP_SERVER_URL=http://138.199.237.34:7000
READING_AGENT_URL=http://138.199.237.34:4001
EOF

# Oder manuell bearbeiten
nano .env.local
```

**Wichtig:** Falls Sie bereits eine `.env.local` haben, fügen Sie die Variablen hinzu oder prüfen Sie, ob sie bereits vorhanden sind.

### Schritt 6: Installation ausführen (falls integration/ vorhanden)

```bash
# Prüfe ob Installations-Script vorhanden
ls integration/install-ck-app-server.sh

# Falls ja, ausführen
chmod +x integration/install-ck-app-server.sh
./integration/install-ck-app-server.sh
```

**Hinweis:** Das Script installiert automatisch:
- API-Routes in `pages/api/agents/` und `pages/api/readings/`
- Frontend-Komponenten in `components/agents/`
- CSS in `styles/agents.css`
- Environment Variables (falls noch nicht gesetzt)

### Schritt 7: CSS importieren (manuell)

Falls das Script die CSS nicht automatisch importiert hat, fügen Sie in `_app.tsx` oder `layout.tsx` hinzu:

```typescript
import '../styles/agents.css'
```

**Für Pages Router (`_app.tsx`):**
```typescript
import type { AppProps } from 'next/app';
import '../styles/agents.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

**Für App Router (`app/layout.tsx`):**
```typescript
import '../styles/agents.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
```

### Schritt 8: Next.js App neu starten

```bash
# Development Server
npm run dev

# Oder Production Build
npm run build
npm start

# Oder PM2 (falls verwendet)
pm2 restart nextjs-app
# Oder
pm2 reload nextjs-app
```

### Schritt 9: API-Routes testen

```bash
# Test Marketing Agent
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test", "userId": "test-user"}'

# Test Reading Agent
curl -X POST http://localhost:3000/api/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany",
    "readingType": "detailed"
  }'
```

### Schritt 10: Im Browser testen

```
http://localhost:3000/agents-dashboard
# Oder
https://www.the-connection-key.de/agents-dashboard
```

---

## 🧪 Server-zu-Server Verbindung testen

**Vom CK-App Server aus:**

```bash
# Test MCP Server Verbindung
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'

# Test Reading Agent Verbindung
curl http://138.199.237.34:4001/health
```

**Wenn diese Tests funktionieren:**
- ✅ Netzwerk-Verbindung OK
- ✅ CORS funktioniert
- ✅ Firewall OK
- ✅ Hetzner Server bereit

---

## 📋 Deployment-Checkliste

### Vor dem Deployment

- [ ] Auf CK-App Server eingeloggt
- [ ] Next.js Projekt-Verzeichnis gefunden
- [ ] Git Pull durchgeführt
- [ ] `integration/` Verzeichnis vorhanden

### Während des Deployments

- [ ] Environment Variables gesetzt (`.env.local`)
- [ ] API-Routes installiert
- [ ] Frontend-Komponenten installiert
- [ ] CSS erstellt und importiert
- [ ] Next.js App neu gestartet

### Nach dem Deployment

- [ ] API-Routes getestet
- [ ] Server-zu-Server Verbindung getestet
- [ ] Frontend im Browser getestet
- [ ] Alle Agenten funktionieren

---

## 🎯 Erwartetes Ergebnis

Nach erfolgreichem Deployment sollten Sie:

1. ✅ **API-Routes funktionieren**
   - `/api/agents/marketing` → MCP Server
   - `/api/agents/automation` → MCP Server
   - `/api/agents/sales` → MCP Server
   - `/api/agents/social-youtube` → MCP Server
   - `/api/reading/generate` → Reading Agent

2. ✅ **Frontend funktioniert**
   - Dashboard-Seite erreichbar
   - Agent-Chat funktioniert
   - Reading-Generator funktioniert

3. ✅ **Server-Kommunikation funktioniert**
   - CK-App Server → Hetzner Server (MCP)
   - CK-App Server → Hetzner Server (Reading Agent)

---

## 🆘 Troubleshooting

### Problem: API-Route gibt 404

**Lösung:**
- Prüfen Sie, ob die Dateien in `pages/api/agents/` vorhanden sind
- Prüfen Sie, ob Next.js App neu gestartet wurde
- Prüfen Sie die Route-Pfade (Pages Router vs. App Router)

### Problem: "MCP_SERVER_URL is not defined"

**Lösung:**
- Prüfen Sie `.env.local` auf dem Server
- Stellen Sie sicher, dass die Variablen gesetzt sind
- Starten Sie Next.js App neu (Environment Variables werden beim Start geladen)

### Problem: CORS-Fehler

**Lösung:**
- Prüfen Sie `CORS_ORIGINS` auf Hetzner Server
- Stellen Sie sicher, dass die CK-App Domain in `CORS_ORIGINS` enthalten ist
- Prüfen Sie die Firewall-Regeln

### Problem: Connection refused

**Lösung:**
- Prüfen Sie, ob Hetzner Server erreichbar ist
- Prüfen Sie die Firewall auf beiden Servern
- Prüfen Sie die IP-Adressen und Ports

---

## ✅ Zusammenfassung

**Lokal:** ✅ Komplett fertig  
**Hetzner Server:** ✅ Komplett konfiguriert  
**CK-App Server:** ⏳ Deployment steht noch aus

**Alle kritischen Komponenten sind implementiert und bereit für Deployment!**

Die Kommunikation zwischen dem CK-App Server und dem Hetzner Server sollte nach dem Deployment funktionieren.

