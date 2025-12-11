# 🏗️ Human Design Chart Architect Agent - Komplette Anleitung

**Datum:** 17.12.2025

**Ziel:** Human Design Chart Architect Agent operativ anlegen und testen

---

## 📋 Übersicht

Der Human Design Chart Architect ist ein hochspezialisierter Entwicklungs-Agent für Human Design Bodygraphen. Er berechnet, strukturiert und visualisiert Single-, Dual- und Multi-Bodygraphen und liefert Datenstrukturen und SVG-Grafiken für Workbook und Chart-Analysen.

**Agent-ID:** `chart-architect-agent`  
**Name:** Human Design Chart Architect  
**Kategorie:** Technik • Visualisierung • Datenstruktur

---

## 🎯 Kernaufgaben

### 1. Single-Bodygraph (Basis)

- Klassischer Human Design Bodygraph
- Zentren (definiert / undefiniert)
- Kanäle (aktiv / inaktiv)
- Tore (aktiviert nach Planetendaten)
- Farblogik (Typ, Definition, Authority optional)

### 2. Dual-Bodygraph (Connection Key)

**Darstellungsarten:**
- Nebeneinander (Vergleich)
- Überlagerung (Composite / Verbindung)
- Linien zwischen Toren (Verbindung sichtbar!)

**Verbindungslogik:**
- Elektromagnetisch
- Dominant
- Kompromiss
- Freundschaft
- Kanal-Vervollständigung

### 3. Multi-Bodygraph (Penta / Gruppe)

- 3–5 Personen
- Gemeinsame Penta-Energie
- Hervorgehobene:
  - gemeinsame Kanäle
  - geteilte Zentren
  - fehlende Energien
- Dynamische Ein- & Ausblendung einzelner Personen

### 4. SVG-Generierung

- Layer-basierte SVG-Struktur
- Zustandsfähig (aktiv/inaktiv, gemeinsam/individuell)
- PDF- & Web-fähig
- Skalierbar und editierbar

---

## 🚀 Schritt 1: Agent auf Server erstellen

**Auf dem Hetzner Server (138.199.237.34) ausführen:**

```bash
# Script auf Server kopieren
scp create-chart-architect-agent.sh root@138.199.237.34:/opt/mcp-connection-key/

# Auf Server einloggen
ssh root@138.199.237.34

# Script ausführen
cd /opt/mcp-connection-key
chmod +x create-chart-architect-agent.sh
./create-chart-architect-agent.sh
```

**Das Script erstellt automatisch:**
- ✅ Agent-Konfiguration: `/opt/ck-agent/agents/chart-architect-agent.json`
- ✅ System-Prompt: `/opt/ck-agent/prompts/chart-architect-agent.txt`
- ✅ Startet MCP Server neu (damit Agent erkannt wird)

---

## ✅ Schritt 2: Agent testen

### Test 1: Single-Bodygraph

```bash
curl -X POST http://localhost:7000/agent/chart-architect-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle ein Single-Bodygraph für:\n\nGeburtsdatum: 1978-05-12\nGeburtszeit: 14:32\nGeburtsort: Berlin, Germany\n\nLiefer die Datenstruktur im Standard-Format (JSON)."
  }' | python3 -m json.tool
```

### Test 2: Dual-Bodygraph (Connection Key)

```bash
curl -X POST http://localhost:7000/agent/chart-architect-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle ein Dual-Bodygraph (Connection Key) für:\n\nPerson A: 1978-05-12, 14:32, Berlin\nPerson B: 1985-03-20, 10:15, München\n\nBerechne Verbindungen (elektromagnetisch, dominant, etc.) und liefer die Datenstruktur."
  }' | python3 -m json.tool
```

### Test 3: SVG-Generierung

```bash
curl -X POST http://localhost:7000/agent/chart-architect-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle ein SVG für ein Single-Bodygraph:\n\nGeburtsdatum: 1978-05-12, 14:32, Berlin\n\nSVG-Struktur: Layer-basiert, zustandsfähig, für Workbook geeignet."
  }' | python3 -m json.tool
```

### Test 4: Penta / Gruppen-Chart

```bash
curl -X POST http://localhost:7000/agent/chart-architect-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle ein Penta-Chart für 3 Personen:\n\nPerson A: 1978-05-12, 14:32, Berlin\nPerson B: 1985-03-20, 10:15, München\nPerson C: 1990-07-08, 16:45, Hamburg\n\nBerechne gemeinsame Zentren, Kanäle und fehlende Energien."
  }' | python3 -m json.tool
```

**Erwartetes Ergebnis:**
- ✅ Strukturierte Datenstruktur (JSON)
- ✅ Zentren, Kanäle, Tore korrekt berechnet
- ✅ Verbindungen bei Dual-Charts
- ✅ SVG-Struktur (optional)
- ✅ Keine Interpretationen, nur Daten

---

## 🔗 Zusammenarbeit mit anderen Systemen

### Chart-Agent (Analyse)

**Rollen-Trennung:**
- **Chart Architect:** Berechnet, strukturiert, visualisiert
- **Chart Agent:** Interpretiert, erklärt, formuliert Texte

**Ablauf:**
1. Geburtsdaten → Chart Architect
2. Chart Architect → Datenstruktur + SVG
3. Chart Agent → liest Daten → erzeugt Analyse
4. Workbook → kombiniert Grafik + Text

### Workbook-System

**Was das Workbook bekommt:**
- Datenebene (JSON / API): definierte Zentren, aktive Kanäle, Tore, Verbindungstypen
- Grafikebene: SVG Bodygraph (Single, Dual, Multi), optionale Einzel-SVGs

**Workbook kann:**
- Layer ein/ausblenden
- Farben ändern
- Fokus setzen
- Statische PDFs oder interaktive Web-Workbooks erstellen

---

## 📝 Agent-Details

### Konfiguration

**Datei:** `/opt/ck-agent/agents/chart-architect-agent.json`

```json
{
  "id": "chart-architect-agent",
  "name": "Human Design Chart Architect",
  "description": "Hochspezialisierter Entwicklungs-Agent für Human Design Bodygraphen. Berechnet, strukturiert und visualisiert Single-, Dual- und Multi-Bodygraphen.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/chart-architect-agent.txt",
  "model": "gpt-4",
  "temperature": 0.3,
  "maxTokens": 8000
}
```

**Temperature:** 0.3 (präzise, technisch)  
**Max Tokens:** 8000 (für komplexe Datenstrukturen und SVG)

---

### System-Prompt

**Datei:** `/opt/ck-agent/prompts/chart-architect-agent.txt`

Der Prompt enthält:
- ✅ Datenmodell (Single, Dual, Penta)
- ✅ SVG-Struktur (Layer-basiert)
- ✅ Verbindungslogik (electromagnetic, dominant, etc.)
- ✅ Zusammenarbeit mit Chart-Agent und Workbook
- ✅ Klare Grenzen: Keine Interpretationen, nur Struktur

---

## 🎯 Verwendung

### Beispiel 1: Single-Bodygraph mit Datenstruktur

```bash
curl -X POST http://138.199.237.34:7000/agent/chart-architect-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle ein Single-Bodygraph für: 1978-05-12, 14:32, Berlin. Liefer die komplette Datenstruktur im Standard-Format."
  }'
```

### Beispiel 2: Connection Key Analyse

```bash
curl -X POST http://138.199.237.34:7000/agent/chart-architect-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle ein Dual-Bodygraph für zwei Personen:\n\nPerson A: 1978-05-12, 14:32, Berlin\nPerson B: 1985-03-20, 10:15, München\n\nBerechne alle Verbindungen (elektromagnetisch, dominant, Kompromiss, Freundschaft) und gemeinsame Kanäle."
  }'
```

### Beispiel 3: SVG für Workbook

```bash
curl -X POST http://138.199.237.34:7000/agent/chart-architect-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle ein SVG für ein Single-Bodygraph: 1978-05-12, 14:32, Berlin.\n\nSVG-Struktur: Layer-basiert, zustandsfähig, für Workbook-PDF geeignet."
  }'
```

---

## ✅ Checkliste

- [ ] Script auf Server kopiert
- [ ] Script ausgeführt (`./create-chart-architect-agent.sh`)
- [ ] MCP Server neu gestartet
- [ ] Agent getestet (Single-Bodygraph)
- [ ] Dual-Bodygraph getestet
- [ ] SVG-Generierung getestet
- [ ] Penta-Chart getestet
- [ ] Datenstruktur validiert (JSON-Format)
- [ ] Optional: Frontend-API-Route erstellt
- [ ] Optional: Verbindung mit Workbook-System getestet

---

## 🎯 Nächste Schritte (nach erfolgreichem Test)

1. **Datenmodell validieren** (Single, Dual, Penta)
2. **SVG-Layer-Standard festlegen**
3. **Schnittstelle Workbook ↔ Chart Architect definieren**
4. **Mit Chart-Agent verzahnen** (Datenfluss testen)
5. **Workbook-Integration** (PDF / Web)

---

## 🔍 Troubleshooting

### Problem: Agent wird nicht erkannt

**Lösung:**
```bash
# MCP Server neu starten
systemctl restart mcp

# Prüfe Agent-Liste
curl http://localhost:7000/agents | python3 -m json.tool
```

### Problem: Datenstruktur unvollständig

**Lösung:**
```bash
# Prüfe Prompt-Datei
cat /opt/ck-agent/prompts/chart-architect-agent.txt | grep -A 10 "Datenmodell"

# Teste mit expliziter Anforderung
curl -X POST http://localhost:7000/agent/chart-architect-agent \
  -H "Content-Type: application/json" \
  -d '{"message": "Erstelle ein Single-Bodygraph mit KOMPLETTER Datenstruktur (centers, channels, gates) für: 1978-05-12, 14:32, Berlin"}'
```

---

**🎉 Der Human Design Chart Architect Agent ist jetzt einsatzbereit!** 🚀
