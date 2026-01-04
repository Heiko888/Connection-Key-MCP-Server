# 🔍 System-Health- & Routing-Check

**Datum:** 2025-01-03  
**Rolle:** Senior Platform Auditor  
**Zweck:** Verifizieren, dass alle Pfade auf `production/server.js` zeigen

---

## ❌ ERGEBNIS: NICHT BESTÄTIGT

### 1️⃣ Läuft production/server.js stabil als Reading-Agent auf Port 4000?

**Status:** ⚠️ **UNKLAR**

**Fakten:**
- ✅ Code: `production/server.js` konfiguriert für Port 4000
- ✅ Dokumentation: Sollte über PM2 laufen
- ❌ **docker-compose.yml:** `chatgpt-agent` Service beansprucht Port 4000
- ❌ **Port-Konflikt:** Beide Services wollen Port 4000

**Aktion erforderlich:**
- Prüfen, welcher Service tatsächlich auf Port 4000 läuft
- `chatgpt-agent` Container stoppen ODER
- `production/server.js` auf anderen Port (z.B. 4001) verschieben

---

### 2️⃣ Gibt es KEINEN parallelen Docker- oder Neben-Agenten auf Port 4000?

**Status:** ❌ **NICHT BESTÄTIGT**

**Fakten:**
- ❌ **docker-compose.yml:** `chatgpt-agent` Service definiert auf Port 4000
- ❌ **Container-Name:** `chatgpt-agent` (kann parallel laufen)
- ❌ **Port-Mapping:** `"4000:4000"` in docker-compose.yml

**Gefundene parallele Services:**
1. `chatgpt-agent` (Docker) - Port 4000
2. `production/server.js` (PM2) - Port 4000 (sollte laufen)

**Aktion erforderlich:**
- `chatgpt-agent` Container stoppen: `docker-compose stop chatgpt-agent`
- ODER `chatgpt-agent` aus docker-compose.yml entfernen

---

### 3️⃣ Zeigen alle Consumer auf denselben Agent?

**Status:** ⚠️ **TEILWEISE BESTÄTIGT**

#### ✅ Frontend (READING_AGENT_URL)
- ✅ `integration/api-routes/app-router/coach/readings-v2/generate/route.ts`
  - `READING_AGENT_URL || 'http://localhost:4000'`
  - **KORREKT**

#### ✅ n8n HTTP Nodes
- ✅ `n8n-workflows/reading-generation-workflow.json`
  - `READING_AGENT_URL || 'http://localhost:4000'`
  - **KORREKT**

#### ✅ Regressionstests
- ✅ `production/tests/b3-regression-tests.ts`
  - `READING_AGENT_URL || 'http://localhost:4000'`
  - **KORREKT**

#### ❌ Legacy-Routen
- ❌ `integration/api-routes/readings-generate.ts`
  - `READING_AGENT_URL || 'http://138.199.237.34:4001'` (ALTER PORT!)
  - **ABWEICHUNG:** Verwendet Port 4001 statt 4000

#### ❌ Legacy-Connection-Key
- ❌ `connection-key/routes/reading.js`
  - `CHATGPT_AGENT_URL` (Legacy-Variable)
  - **ABWEICHUNG:** Verwendet `CHATGPT_AGENT_URL` statt `READING_AGENT_URL`

---

### 4️⃣ Gibt es versteckte Pfade (Legacy URLs, alte ENV, Docker DNS)?

**Status:** ❌ **NICHT BESTÄTIGT - MEHRERE VERSTECKTE PFADE GEFUNDEN**

#### ❌ Docker DNS-Namen
1. `http://ck-agent:4000` (Docker Network)
   - Gefunden in: `READING_AGENT_ARCHITEKTUR.md`, `READING_SYSTEM_STATUS.md`
   - **Status:** Legacy-Dokumentation

2. `http://chatgpt-agent:4000` (Docker Network)
   - Gefunden in: `docker-compose.yml`, `connection-key/config.js`, `start-services.sh`
   - **Status:** Aktiv in docker-compose.yml

#### ❌ Legacy-Environment-Variablen
1. `CHATGPT_AGENT_URL` (statt `READING_AGENT_URL`)
   - Gefunden in: `docker-compose.yml`, `connection-key/config.js`, `start-services.sh`
   - **Status:** Aktiv verwendet

2. `CK_AGENT_URL` (Legacy)
   - Gefunden in: `DEPLOYMENT_CHECKLIST_READING_JOBS_FIX.md`, `KEYS_INFRASTRUKTUR_UEBERSICHT.md`
   - **Status:** Legacy-Dokumentation

#### ❌ Server-IP-Hardcodierung
1. `http://138.199.237.34:4000` (Hardcodiert)
   - Gefunden in: `integration/api-routes/readings-generate.ts` (Port 4001!), `SERVERUEBERGREIFENDE_ANALYSE.md`
   - **Status:** Abweichende Konfiguration

#### ❌ Alte Ports
1. Port 4001 (Legacy)
   - Gefunden in: `integration/api-routes/readings-generate.ts`
   - **Status:** Abweichende Konfiguration

---

## 📋 ZUSAMMENFASSUNG DER ABWEICHUNGEN

### Kritische Abweichungen:

1. **Port-Konflikt:**
   - `chatgpt-agent` (Docker) beansprucht Port 4000
   - `production/server.js` (PM2) benötigt Port 4000
   - **Lösung:** Einen Service stoppen oder Port trennen

2. **Legacy-Route:**
   - `integration/api-routes/readings-generate.ts` verwendet Port 4001
   - **Lösung:** Port auf 4000 ändern oder Route entfernen

3. **Legacy-Connection-Key:**
   - `connection-key/routes/reading.js` verwendet `CHATGPT_AGENT_URL`
   - **Lösung:** Auf `READING_AGENT_URL` umstellen oder Route entfernen

4. **Docker-Compose:**
   - `chatgpt-agent` Service aktiv definiert
   - **Lösung:** Service entfernen oder stoppen

### Empfohlene Aktionen:

1. ✅ `chatgpt-agent` Container stoppen: `docker-compose stop chatgpt-agent`
2. ✅ `chatgpt-agent` aus docker-compose.yml entfernen (oder kommentieren)
3. ✅ `production/server.js` über PM2 starten: `pm2 start production/server.js --name reading-agent`
4. ✅ `integration/api-routes/readings-generate.ts` Port auf 4000 ändern
5. ✅ `connection-key/routes/reading.js` auf `READING_AGENT_URL` umstellen
6. ✅ Legacy-Dokumentation bereinigen (optional)

---

## 🎯 FAZIT

**Status:** ❌ **NICHT BESTÄTIGT**

**Hauptprobleme:**
1. Port-Konflikt zwischen `chatgpt-agent` (Docker) und `production/server.js` (PM2)
2. Legacy-Routen verwenden abweichende Ports/URLs
3. Docker-Compose definiert noch `chatgpt-agent` Service
4. Legacy-Environment-Variablen (`CHATGPT_AGENT_URL`) noch aktiv

**Empfehlung:**
- `chatgpt-agent` Container stoppen/entfernen
- Alle Consumer auf `READING_AGENT_URL=http://localhost:4000` standardisieren
- Legacy-Routen bereinigen oder aktualisieren
