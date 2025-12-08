# 📊 Chart Development Agent - Implementierungsstatus

## ✅ Implementiert (Lokal im Repository)

### 1. API-Route
- **Datei:** `integration/api-routes/agents-chart-development.ts`
- **Status:** ✅ Erstellt
- **Route:** `/api/agents/chart-development`
- **Features:**
  - Chart-Berechnung über Reading Agent (falls Geburtsdaten vorhanden)
  - Proxying zum MCP Server
  - Rückgabe von Chart-Code, Chart-Config und berechneten Chart-Daten

### 2. Frontend-Komponente
- **Datei:** `integration/frontend/components/ChartDevelopment.tsx`
- **Status:** ✅ Erstellt
- **Features:**
  - Chart-Typ Auswahl (Bodygraph, Penta, Connection Key, etc.)
  - Geburtsdaten-Eingabe (optional, für Chart-Berechnung)
  - Anfrage-Textarea
  - Anzeige von Response, Chart-Code und berechneten Chart-Daten

### 3. Installations-Script
- **Datei:** `integration/install-chart-agent.sh`
- **Status:** ✅ Erstellt
- **Zweck:** Installation auf Hetzner Server
- **Funktionen:**
  - Erstellt Prompt-Datei (`/opt/ck-agent/prompts/chart-development.txt`)
  - Erstellt Config-Datei (`/opt/ck-agent/agents/chart-development.json`)
  - Startet MCP Server neu
  - Prüft Agent-Registrierung
  - Führt Test-Request durch

### 4. Dokumentation
- **Datei:** `integration/CHART_DEVELOPMENT_AGENT_DEFINITION.md`
- **Status:** ✅ Vollständig
- **Inhalt:** Vollständige Agent-Definition, Prompt, Config, API-Route, Frontend-Komponente

---

## ⏳ Noch zu installieren

### Auf Hetzner Server (138.199.237.34)

1. **Installations-Script ausführen:**
   ```bash
   cd /opt/mcp-connection-key
   chmod +x integration/install-chart-agent.sh
   ./integration/install-chart-agent.sh
   ```

2. **Agent-Verfügbarkeit prüfen:**
   ```bash
   curl http://localhost:7000/agents | grep chart-development
   ```

3. **Test-Request:**
   ```bash
   curl -X POST http://localhost:7000/agent/chart-development \
     -H "Content-Type: application/json" \
     -d '{"message":"Erstelle eine Bodygraph-Komponente"}'
   ```

### Auf CK-App Server (167.235.224.149)

1. **API-Route installieren:**
   ```bash
   cd /opt/hd-app/The-Connection-Key/frontend
   cp integration/api-routes/agents-chart-development.ts pages/api/agents/chart-development.ts
   ```

2. **Frontend-Komponente installieren:**
   ```bash
   mkdir -p components/agents
   cp integration/frontend/components/ChartDevelopment.tsx components/agents/ChartDevelopment.tsx
   ```

3. **Dashboard aktualisieren:**
   - `ChartDevelopment` Komponente zu `pages/agents-dashboard.tsx` hinzufügen

4. **Next.js App neu starten:**
   ```bash
   npm run dev  # oder pm2 restart next-app
   ```

---

## 📋 Dateien-Übersicht

### Repository (Lokal)
```
integration/
├── api-routes/
│   └── agents-chart-development.ts          ✅ Erstellt
├── frontend/
│   └── components/
│       └── ChartDevelopment.tsx            ✅ Erstellt
├── install-chart-agent.sh                  ✅ Erstellt
├── CHART_DEVELOPMENT_AGENT_DEFINITION.md   ✅ Vollständig
├── CHART_AGENT_ERWEITERT.md                ✅ Vollständig
└── CHART_AGENT_BODYGRAPH.md                ✅ Vollständig
```

### Hetzner Server (nach Installation)
```
/opt/ck-agent/
├── prompts/
│   └── chart-development.txt               ⏳ Wird erstellt
└── agents/
    └── chart-development.json              ⏳ Wird erstellt

/opt/mcp/
└── server.js                               ⏳ Erkennt Agent automatisch
```

### CK-App Server (nach Installation)
```
/opt/hd-app/The-Connection-Key/frontend/
├── pages/
│   └── api/
│       └── agents/
│           └── chart-development.ts        ⏳ Wird installiert
└── components/
    └── agents/
        └── ChartDevelopment.tsx            ⏳ Wird installiert
```

---

## ✅ Zusammenfassung

**Lokal (Repository):**
- ✅ API-Route erstellt
- ✅ Frontend-Komponente erstellt
- ✅ Installations-Script erstellt
- ✅ Dokumentation vollständig

**Auf Servern:**
- ⏳ Hetzner Server: Installation noch ausstehend
- ⏳ CK-App Server: Installation noch ausstehend

**Nächster Schritt:**
1. Git Commit & Push der neuen Dateien
2. Installation auf Hetzner Server ausführen
3. Installation auf CK-App Server ausführen
4. Testen

---

## 🚀 Installation starten

**Option 1: Automatisch (empfohlen)**
```bash
# Auf Hetzner Server
cd /opt/mcp-connection-key
git pull
chmod +x integration/install-chart-agent.sh
./integration/install-chart-agent.sh
```

**Option 2: Manuell**
Siehe `integration/CHART_DEVELOPMENT_AGENT_DEFINITION.md` für manuelle Schritte.

