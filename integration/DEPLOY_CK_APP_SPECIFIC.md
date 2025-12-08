# 🚀 Deployment auf CK-App Server - Spezifischer Pfad

## 📍 Projekt-Pfad

**Next.js Projekt:** `/opt/hd-app/The-Connection-Key/frontend`

---

## 🔧 Schritt-für-Schritt Installation

### Schritt 1: SSH zum CK-App Server

```bash
ssh root@167.235.224.149
```

### Schritt 2: Ins Projekt-Verzeichnis wechseln

```bash
cd /opt/hd-app/The-Connection-Key/frontend
```

### Schritt 3: Git Pull

```bash
# Prüfe ob Git-Repository
git status

# Pull durchführen
git pull origin main

# Prüfe ob integration/ vorhanden ist
ls integration/
```

### Schritt 4: Environment Variables setzen

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

### Schritt 5: Installation ausführen

```bash
# Prüfe ob Installations-Script vorhanden
ls integration/install-ck-app-server.sh

# Falls ja, ausführen
chmod +x integration/install-ck-app-server.sh
./integration/install-ck-app-server.sh

# Falls nicht, siehe manuelle Installation unten
```

### Schritt 6: CSS importieren

**Für Pages Router (`pages/_app.tsx`):**

```typescript
import type { AppProps } from 'next/app';
import '../styles/agents.css'; // ← Hinzufügen

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
```

**Für App Router (`app/layout.tsx`):**

```typescript
import '../styles/agents.css'; // ← Hinzufügen

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

### Schritt 7: App neu starten

```bash
# Development Server
npm run dev

# Oder Production Build
npm run build
npm start

# Oder PM2 (falls verwendet)
pm2 restart the-connection-key
# Oder
pm2 reload the-connection-key
```

---

## 🔧 Manuelle Installation (falls Script nicht funktioniert)

### API-Routes installieren

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe ob Pages Router oder App Router
ls pages/ 2>/dev/null && echo "Pages Router" || echo "App Router"

# Für Pages Router:
mkdir -p pages/api/agents
mkdir -p pages/api/readings

cp integration/api-routes/agents-marketing.ts pages/api/agents/marketing.ts
cp integration/api-routes/agents-automation.ts pages/api/agents/automation.ts
cp integration/api-routes/agents-sales.ts pages/api/agents/sales.ts
cp integration/api-routes/agents-social-youtube.ts pages/api/agents/social-youtube.ts
cp integration/api-routes/readings-generate.ts pages/api/readings/generate.ts
```

### Frontend-Komponenten installieren

```bash
mkdir -p components/agents

cp integration/frontend/components/AgentChat.tsx components/agents/
cp integration/frontend/components/ReadingGenerator.tsx components/agents/

# Dashboard-Seite (nur für Pages Router)
cp integration/frontend/pages/agents-dashboard.tsx pages/agents-dashboard.tsx
```

---

## 🧪 Testen

### API-Routes testen

```bash
# Test Marketing Agent
curl -X POST http://localhost:3000/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test", "userId": "test"}'

# Test Reading Agent
curl -X POST http://localhost:3000/api/readings/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin, Germany",
    "readingType": "detailed"
  }'
```

### Server-zu-Server Verbindung testen

```bash
# Test MCP Server
curl -X POST http://138.199.237.34:7000/agent/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'

# Test Reading Agent
curl http://138.199.237.34:4001/health
```

### Im Browser testen

```
http://localhost:3000/agents-dashboard
# Oder
https://www.the-connection-key.de/agents-dashboard
```

---

## 📋 Komplett-Befehl (alles in einem)

```bash
# Auf CK-App Server (167.235.224.149)
cd /opt/hd-app/The-Connection-Key/frontend && \
git pull origin main && \
echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local && \
echo "READING_AGENT_URL=http://138.199.237.34:4001" >> .env.local && \
chmod +x integration/install-ck-app-server.sh && \
./integration/install-ck-app-server.sh && \
echo "✅ Installation abgeschlossen! Bitte CSS importieren und App neu starten."
```

---

## ✅ Checkliste

- [ ] SSH zum CK-App Server
- [ ] Ins Projekt-Verzeichnis gewechselt (`/opt/hd-app/The-Connection-Key/frontend`)
- [ ] Git Pull durchgeführt
- [ ] Environment Variables gesetzt (`.env.local`)
- [ ] Installation ausgeführt (`integration/install-ck-app-server.sh`)
- [ ] CSS importiert (in `_app.tsx` oder `layout.tsx`)
- [ ] App neu gestartet
- [ ] API-Routes getestet
- [ ] Server-zu-Server Verbindung getestet
- [ ] Browser-Test durchgeführt

---

## 🆘 Troubleshooting

### Problem: "integration/ nicht gefunden"

**Lösung:**
```bash
# Git Pull durchführen
git pull origin main

# Oder Dateien per SCP kopieren (von lokal)
scp -r integration/ root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/
```

### Problem: "MCP_SERVER_URL is not defined"

**Lösung:**
```bash
# Prüfe .env.local
cat .env.local

# Füge Variablen hinzu
echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env.local
echo "READING_AGENT_URL=http://138.199.237.34:4001" >> .env.local

# App neu starten (Environment Variables werden beim Start geladen)
```

### Problem: CORS-Fehler

**Lösung:**
- Prüfen Sie CORS auf Hetzner Server (siehe `integration/VERIFY_CORS_FIREWALL.sh`)
- Prüfen Sie Firewall-Regeln
- Prüfen Sie IP-Adressen

---

## 🎯 Zusammenfassung

**Projekt-Pfad:** `/opt/hd-app/The-Connection-Key/frontend`

**Nächste Schritte:**
1. Git Pull
2. Environment Variables setzen
3. Installation ausführen
4. CSS importieren
5. App neu starten
6. Testen

**Alles bereit für das Deployment!** 🚀

