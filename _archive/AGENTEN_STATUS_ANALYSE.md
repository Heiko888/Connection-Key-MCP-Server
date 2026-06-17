# 🔍 Agenten-Status Analyse

**Datum:** 22.12.2025  
**Ziel:** Vergleich zwischen dokumentierten Agenten und tatsächlich vorhandenen/aktiven Agenten

---

## 📊 Vergleich: Dokumentation vs. Realität

### ✅ **Aktiv und vorhanden:**

| Agent-ID | Dokumentiert | Lokal (`integration/`) | Server (167.235.224.149) | MCP Server (138.199.237.34) |
|----------|--------------|------------------------|--------------------------|----------------------------|
| `automation` | ✅ | ✅ | ✅ | ❓ |
| `chart-development` | ✅ | ✅ | ⚠️ (`chart`) | ❓ |
| `marketing` | ✅ | ✅ | ✅ | ❓ |
| `sales` | ✅ | ✅ | ✅ | ❓ |
| `social-youtube` | ✅ | ✅ | ✅ | ❓ |
| `tasks` | ✅ | ✅ | ✅ | ❓ |
| `website-ux-agent` | ✅ | ✅ | ⚠️ (`ui-ux`) | ❓ |

---

## ❌ **Fehlende Agenten (in Dokumentation, aber nicht aktiv):**

### 1. **`chart-architect-agent`**

**Status:** ❌ Nicht aktiv

**Dokumentiert in:**
- ✅ `SYSTEMCHECK_FINAL.md` (Zeile 75)
- ✅ `SERVER_KONFIGURATION_138.199.237.34_KOMPLETT.md`
- ✅ `CHART_ARCHITECT_AGENT_ANLEITUNG.md`
- ✅ Script vorhanden: `create-chart-architect-agent.sh`

**Fehlt:**
- ❌ Keine API-Route in `integration/api-routes/app-router/agents/chart-architect-agent/`
- ❌ Keine Route auf Server (167.235.224.149)
- ❓ MCP Server Status unklar (muss geprüft werden)

**Verwendung:**
- Wird verwendet in: `integration/api-routes/app-router/workbook/chart-data/route.ts`
- Agent-ID: `chart-architect-agent`

**Aktion erforderlich:**
1. API-Route erstellen: `integration/api-routes/app-router/agents/chart-architect-agent/route.ts`
2. Auf Server deployen
3. MCP Server prüfen, ob Agent existiert

---

### 2. **`relationship-analysis-agent`**

**Status:** ⚠️ Teilweise aktiv

**Dokumentiert in:**
- ✅ `SYSTEMCHECK_FINAL.md` (Zeile 79)
- ✅ `RELATIONSHIP_ANALYSIS_AGENT_ANLEITUNG.md`
- ✅ Script vorhanden: `create-relationship-analysis-agent.sh`

**Vorhanden:**
- ✅ Wird verwendet in: `integration/api-routes/app-router/coach/readings/route.ts`
- ✅ Agent-ID: `relationship-analysis-agent`
- ✅ API-Route existiert: `integration/api-routes/app-router/relationship-analysis/generate/route.ts`

**Fehlt:**
- ❌ Keine direkte API-Route: `/api/agents/relationship-analysis-agent`
- ❓ MCP Server Status unklar (muss geprüft werden)

**Aktion erforderlich:**
1. API-Route erstellen: `integration/api-routes/app-router/agents/relationship-analysis-agent/route.ts`
2. Auf Server deployen
3. MCP Server prüfen, ob Agent existiert

---

### 3. **`video-creation-agent`**

**Status:** ❌ Nicht aktiv

**Dokumentiert in:**
- ✅ `SYSTEMCHECK_FINAL.md` (Zeile 83)
- ✅ `VIDEO_CREATION_AGENT_ANLEITUNG.md`
- ✅ Script vorhanden: `create-video-creation-agent.sh`

**Fehlt:**
- ❌ Keine API-Route in `integration/api-routes/app-router/agents/video-creation-agent/`
- ❌ Keine Route auf Server (167.235.224.149)
- ❓ MCP Server Status unklar (muss geprüft werden)

**Aktion erforderlich:**
1. API-Route erstellen: `integration/api-routes/app-router/agents/video-creation-agent/route.ts`
2. Auf Server deployen
3. MCP Server prüfen, ob Agent existiert

---

### 4. **`reading`**

**Status:** ⚠️ Spezialfall

**Hinweis:** `reading` ist **KEIN MCP Agent**, sondern ein **eigener Service** (Reading Agent).

**Dokumentiert in:**
- ✅ `SYSTEMCHECK_FINAL.md` (Zeile 78) - **FALSCH als MCP Agent aufgelistet!**

**Korrekt:**
- ✅ Reading Agent soll auf Port 7000 laufen (über MCP Server als Agent `reading`)
- ✅ **Agent-Konfiguration existiert:** `/opt/ck-agent/agents/reading.json`
- ⚠️ **Aktueller Status:** Agent läuft zusätzlich auf Port 4001 (PM2, separater Service) - **SOLLTE nur über MCP Server (Port 7000) laufen**
- ⚠️ **Port 4000:** Wird von `chatgpt-agent` (Docker Container) verwendet
- ⚠️ **Port 7000:** MCP Server - Reading Agent sollte als `/agent/reading` Endpoint verfügbar sein
- ✅ API-Route existiert: `integration/api-routes/app-router/reading/generate/route.ts`
- ✅ Endpoint: `/api/reading/generate` (nicht `/api/agents/reading`)

**Aktion erforderlich:**
- ⚠️ Dokumentation korrigieren: `reading` aus MCP Agent-Liste entfernen

---

## 🔍 Namens-Inkonsistenzen

### Problem 1: `chart-development` vs. `chart`

**Lokal:** `chart-development`  
**Server:** `chart`

**Aktion:** Prüfen, ob beide existieren oder ob eine Umbenennung stattgefunden hat.

---

### Problem 2: `website-ux-agent` vs. `ui-ux`

**Lokal:** `website-ux-agent`  
**Server:** `ui-ux`

**Aktion:** Prüfen, ob beide existieren oder ob eine Umbenennung stattgefunden hat.

---

## 📋 Zusammenfassung

### ✅ **Vollständig aktiv (7 Agenten):**
1. `automation`
2. `chart-development` (oder `chart`)
3. `marketing`
4. `sales`
5. `social-youtube`
6. `tasks`
7. `website-ux-agent` (oder `ui-ux`)

### ❌ **Fehlend (3 Agenten):**
1. `chart-architect-agent` - **Muss erstellt werden**
2. `relationship-analysis-agent` - **Muss API-Route erhalten**
3. `video-creation-agent` - **Muss erstellt werden**

### ⚠️ **Spezialfall:**
- `reading` - **Ist kein MCP Agent, sondern eigener Service**

---

## 🎯 Nächste Schritte

### Priorität 1: MCP Server prüfen

```bash
# Auf Hetzner Server (138.199.237.34)
ssh root@138.199.237.34

# Prüfe, welche Agenten tatsächlich existieren
ls -la /opt/ck-agent/agents/*.json

# Prüfe MCP Server Endpoints
curl -X POST http://localhost:7000/agent/chart-architect-agent -H 'Content-Type: application/json' -d '{"message":"test"}'
curl -X POST http://localhost:7000/agent/relationship-analysis-agent -H 'Content-Type: application/json' -d '{"message":"test"}'
curl -X POST http://localhost:7000/agent/video-creation-agent -H 'Content-Type: application/json' -d '{"message":"test"}'
```

### Priorität 2: Fehlende API-Routen erstellen

1. **`chart-architect-agent`**
   - Erstelle: `integration/api-routes/app-router/agents/chart-architect-agent/route.ts`
   - Kopiere Template von `chart-development/route.ts`

2. **`relationship-analysis-agent`**
   - Erstelle: `integration/api-routes/app-router/agents/relationship-analysis-agent/route.ts`
   - Kopiere Template von `marketing/route.ts`

3. **`video-creation-agent`**
   - Erstelle: `integration/api-routes/app-router/agents/video-creation-agent/route.ts`
   - Kopiere Template von `marketing/route.ts`

### Priorität 3: Dokumentation korrigieren

- `SYSTEMCHECK_FINAL.md`: `reading` aus MCP Agent-Liste entfernen
- Namens-Inkonsistenzen klären (`chart` vs. `chart-development`, `ui-ux` vs. `website-ux-agent`)

---

## 📝 Checkliste

- [ ] MCP Server Agenten-Status prüfen
- [ ] `chart-architect-agent` API-Route erstellen
- [ ] `relationship-analysis-agent` API-Route erstellen
- [ ] `video-creation-agent` API-Route erstellen
- [ ] Alle neuen Routen auf Server deployen
- [ ] Dokumentation aktualisieren
- [ ] Namens-Inkonsistenzen klären
