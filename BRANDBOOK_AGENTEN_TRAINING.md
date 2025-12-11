# 🎨 Master Brand Book - Agenten Training

**Ziel:** Das Master Brand Book als Knowledge-Base für alle Agenten nutzen

---

## 📋 Was wurde erstellt

### 1. Konvertierungs-Script
**Datei:** `convert-brandbook-to-knowledge.ps1`

**Funktion:**
- Konvertiert HTML-Kapitel zu `.txt` Dateien
- Extrahiert Text aus HTML (entfernt Tags)
- Erstellt Knowledge-Dateien für Agenten
- Speichert in `production/knowledge/brandbook/`

### 2. Integrations-Anleitung
**Datei:** `MASTER_BRANDBOOK_INTEGRATION.md`

**Inhalt:**
- Detaillierte Anleitung zur Integration
- Verwendung für Reading Agent
- Verwendung für MCP Agenten
- Workflow-Schritte

---

## 🚀 Schnellstart

### Schritt 1: Konvertierung ausführen

```powershell
# Im Projekt-Verzeichnis
.\convert-brandbook-to-knowledge.ps1
```

**Ergebnis:**
```
production/knowledge/brandbook/
├── brandbook-kapitel-01.txt
├── brandbook-kapitel-02.txt
├── ...
├── brandbook-kapitel-18.txt
├── brandbook-complete.md
└── README.md
```

### Schritt 2: Knowledge für Agenten verfügbar machen

#### Option A: Für Reading Agent (automatisch)

Der Reading Agent lädt automatisch alle `.txt` und `.md` Dateien aus `production/knowledge/`

**Vorgehen:**
1. Dateien sind bereits in `production/knowledge/brandbook/`
2. Reading Agent lädt sie beim Start automatisch
3. Oder Knowledge neu laden ohne Neustart

#### Option B: Für MCP Agenten (Marketing, Sales, etc.)

Die MCP Agenten nutzen System-Prompts. Brand Book kann integriert werden:

**Vorgehen:**
1. Brand Book Knowledge in System-Prompts einbinden
2. Oder separate Brand Book Knowledge-Dateien für jeden Agenten erstellen

---

## 📊 Brand Book Inhalte

Basierend auf dem Master Brand Book:

### Kapitel-Übersicht

| Kapitel | Thema | Knowledge-Datei |
|---------|-------|-----------------|
| 01 | Brand Identity | brandbook-kapitel-01.txt |
| 02 | Visuelle Identität | brandbook-kapitel-02.txt |
| 03 | Human Design Identity System | brandbook-kapitel-03.txt |
| 04 | App Modules | brandbook-kapitel-04.txt |
| 05 | Brand Voice | brandbook-kapitel-05.txt |
| 06 | KI-Agenten (MCP & CK Agent) | brandbook-kapitel-06.txt |
| 07 | UI/UX System | brandbook-kapitel-07.txt |
| 08 | Iconography & Symbolsystem | brandbook-kapitel-08.txt |
| 09 | Technische Architektur | brandbook-kapitel-09.txt |
| 10 | n8n Automation Framework | brandbook-kapitel-10.txt |
| 11 | Canva Template Guidelines | brandbook-kapitel-11.txt |
| 12 | Produkt-Roadmap | brandbook-kapitel-12.txt |
| 13 | Appendix | brandbook-kapitel-13.txt |
| ... | ... | ... |
| 18 | ... | brandbook-kapitel-18.txt |

---

## 🎯 Verwendung in Agenten

### Marketing Agent

**Nutzt Brand Book für:**
- Markenidentität verstehen
- Tone of Voice korrekt anwenden
- Farben & Design konsistent verwenden
- Kommunikationsrichtlinien befolgen
- Brand Voice in Marketing-Content integrieren

**Beispiel:**
```
Marketing Agent erstellt Reel-Skript:
→ Nutzt Brand Book Kapitel 5 (Brand Voice)
→ Nutzt Brand Book Kapitel 2 (Visuelle Identität)
→ Erstellt Content im korrekten Tone of Voice
```

### Sales Agent

**Nutzt Brand Book für:**
- Verkaufsargumente markenkonform formulieren
- Werte & Mission korrekt kommunizieren
- Persönlichkeit der Marke widerspiegeln
- Brand Voice in Verkaufstexten integrieren

**Beispiel:**
```
Sales Agent erstellt Salespage:
→ Nutzt Brand Book Kapitel 1 (Brand Identity)
→ Nutzt Brand Book Kapitel 5 (Brand Voice)
→ Erstellt Verkaufstexte im korrekten Stil
```

### Reading Agent

**Nutzt Brand Book für:**
- Markenidentität in Readings integrieren
- Kommunikationsstil konsistent halten
- Werte in Analysen einbeziehen
- Brand Voice in Readings widerspiegeln

**Beispiel:**
```
Reading Agent erstellt Human Design Reading:
→ Nutzt Brand Book Kapitel 3 (Human Design Identity System)
→ Nutzt Brand Book Kapitel 5 (Brand Voice)
→ Erstellt Reading im korrekten Stil der Marke
```

---

## 🔧 Technische Integration

### Reading Agent (automatisch)

```javascript
// production/server.js
function loadKnowledge() {
  const knowledge = {};
  const files = fs.readdirSync(KNOWLEDGE_PATH);
  
  files.forEach(file => {
    if (file.endsWith('.txt') || file.endsWith('.md')) {
      const content = fs.readFileSync(filePath, 'utf8');
      knowledge[filename] = content;
    }
  });
  
  return knowledge;
}

// Knowledge wird automatisch in System-Prompt eingefügt
if (Object.keys(knowledge).length > 0) {
  systemPrompt += "\n\nBrand Book Wissen:\n";
  Object.values(knowledge).forEach(k => {
    systemPrompt += k + "\n";
  });
}
```

### MCP Agenten (manuell)

**Option 1: Brand Book in System-Prompts einbinden**

```javascript
// In MCP Server (server.js)
const brandbookKnowledge = loadBrandbookKnowledge();

const marketingAgentPrompt = `
Du bist der Marketing Agent für The Connection Key.

Brand Book Wissen:
${brandbookKnowledge}

Deine Aufgabe: ...
`;
```

**Option 2: Separate Brand Book Knowledge-Dateien**

Erstellen Sie agent-spezifische Brand Book Knowledge:

```
production/knowledge/
├── brandbook-marketing.txt    # Brand Book für Marketing Agent
├── brandbook-sales.txt        # Brand Book für Sales Agent
└── brandbook-automation.txt   # Brand Book für Automation Agent
```

---

## 📋 Nächste Schritte

1. ✅ **Konvertierung ausführen**
   ```powershell
   .\convert-brandbook-to-knowledge.ps1
   ```

2. ✅ **Dateien prüfen**
   ```powershell
   Get-ChildItem production\knowledge\brandbook\*.txt
   ```

3. ✅ **Auf Server kopieren (falls nötig)**
   ```bash
   scp -r production/knowledge/brandbook root@138.199.237.34:/opt/mcp-connection-key/production/knowledge/
   ```

4. ✅ **Knowledge neu laden**
   - Reading Agent: `curl -X POST http://localhost:4001/admin/reload-knowledge`
   - MCP Agenten: Neustart erforderlich

5. ✅ **Testen**
   - Agenten mit Brand Book Knowledge verwenden
   - Prüfen ob Brand Voice korrekt angewendet wird

---

## ✅ Checkliste

- [ ] Konvertierungs-Script ausführen
- [ ] Konvertierte Dateien prüfen
- [ ] Dateien auf Server kopieren (falls nötig)
- [ ] Reading Agent Knowledge neu laden
- [ ] MCP Agenten System-Prompts erweitern (optional)
- [ ] Testen: Agenten mit Brand Book Knowledge verwenden

---

**Status:** 🚀 Bereit zur Konvertierung und Integration

