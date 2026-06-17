# 🎨 Master Brand Book Integration für Agenten

**Ziel:** Das Master Brand Book als Knowledge-Base für alle Agenten nutzen

---

## 📋 Übersicht

Das Master Brand Book aus `C:\AppProgrammierung\Projekte\Masterbrandbook` enthält:
- **18 HTML-Kapitel** (kapitel-01.html bis kapitel-18.html)
- **PDF-Dateien** (brandbook-complete.pdf, etc.)
- **Markdown-Datei** (Masterbrand -book.md)

Diese sollen als Knowledge-Dateien für alle Agenten verfügbar gemacht werden.

---

## 🔧 Konvertierungs-Strategie

### Schritt 1: HTML zu Text konvertieren

**Problem:** Agenten können nur `.txt` und `.md` Dateien laden

**Lösung:** HTML-Dateien zu `.txt` konvertieren

```powershell
# Führen Sie das Konvertierungs-Script aus
.\convert-brandbook-to-knowledge.ps1
```

**Ergebnis:**
```
production/knowledge/brandbook/
├── brandbook-kapitel-01.txt
├── brandbook-kapitel-02.txt
├── ...
├── brandbook-kapitel-18.txt
└── brandbook-complete.md
```

---

### Schritt 2: Knowledge-Dateien für Agenten verfügbar machen

#### Option A: Für Reading Agent (automatisch)

Der Reading Agent lädt automatisch alle `.txt` und `.md` Dateien aus:
- **Lokal:** `production/knowledge/`
- **Server:** `/opt/mcp-connection-key/production/knowledge/`

**Vorgehen:**
1. Konvertierte Dateien nach `production/knowledge/brandbook/` kopieren
2. Oder direkt nach `production/knowledge/` kopieren
3. Reading Agent neu starten oder Knowledge neu laden

#### Option B: Für MCP Agenten (Marketing, Sales, etc.)

Die MCP Agenten nutzen System-Prompts. Das Brand Book kann integriert werden:

**Vorgehen:**
1. Brand Book Knowledge in System-Prompts einbinden
2. Oder separate Brand Book Knowledge-Dateien für MCP Agenten erstellen

---

## 📁 Datei-Struktur

### Nach Konvertierung

```
production/knowledge/
├── brandbook/
│   ├── brandbook-kapitel-01.txt
│   ├── brandbook-kapitel-02.txt
│   ├── ...
│   ├── brandbook-kapitel-18.txt
│   ├── brandbook-complete.md
│   └── README.md
├── human-design-basics.txt
├── reading-types.txt
└── ... (andere Knowledge-Dateien)
```

---

## 🚀 Integration in Agenten

### 1. Reading Agent

**Automatisch:** Lädt alle `.txt` und `.md` Dateien beim Start

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
```

**Knowledge wird automatisch in System-Prompt eingefügt:**
```javascript
if (Object.keys(knowledge).length > 0) {
  systemPrompt += "\n\nZusätzliches Wissen:\n";
  Object.values(knowledge).forEach(k => {
    systemPrompt += k + "\n";
  });
}
```

### 2. MCP Agenten (Marketing, Sales, etc.)

**Option 1: Brand Book in System-Prompts einbinden**

Erweitern Sie die System-Prompts der MCP Agenten:

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

## 🔄 Workflow

### Schritt 1: Konvertierung

```powershell
# Führen Sie das Konvertierungs-Script aus
.\convert-brandbook-to-knowledge.ps1
```

### Schritt 2: Prüfung

```powershell
# Prüfen Sie die konvertierten Dateien
Get-ChildItem production\knowledge\brandbook\*.txt
```

### Schritt 3: Auf Server kopieren (falls nötig)

```bash
# Auf Server
scp -r production/knowledge/brandbook root@138.199.237.34:/opt/mcp-connection-key/production/knowledge/
```

### Schritt 4: Knowledge neu laden

**Reading Agent:**
```bash
# Auf Hetzner Server
curl -X POST http://localhost:4001/admin/reload-knowledge \
  -H "Content-Type: application/json" \
  -d '{"secret": "IHR_AGENT_SECRET"}'
```

**MCP Agenten:**
```bash
# MCP Server neu starten
pm2 restart mcp-server
```

---

## 📊 Kapitel-Übersicht

Basierend auf den gefundenen Dateien:

| Kapitel | Datei | Status |
|---------|-------|--------|
| 1 | kapitel-01.html | ✅ Wird konvertiert |
| 2 | kapitel-02.html | ✅ Wird konvertiert |
| ... | ... | ... |
| 18 | kapitel-18.html | ✅ Wird konvertiert |
| Complete | Masterbrand -book.md | ✅ Wird kopiert |

---

## 🎯 Verwendung in Agenten

### Marketing Agent

Das Brand Book hilft dem Marketing Agent:
- **Markenidentität** verstehen
- **Tone of Voice** korrekt anwenden
- **Farben & Design** konsistent verwenden
- **Kommunikationsrichtlinien** befolgen

### Sales Agent

Das Brand Book hilft dem Sales Agent:
- **Verkaufsargumente** markenkonform formulieren
- **Werte & Mission** korrekt kommunizieren
- **Persönlichkeit** der Marke widerspiegeln

### Reading Agent

Das Brand Book hilft dem Reading Agent:
- **Markenidentität** in Readings integrieren
- **Kommunikationsstil** konsistent halten
- **Werte** in Analysen einbeziehen

---

## ✅ Checkliste

- [ ] Konvertierungs-Script ausführen
- [ ] Konvertierte Dateien prüfen
- [ ] Dateien auf Server kopieren (falls nötig)
- [ ] Reading Agent Knowledge neu laden
- [ ] MCP Agenten System-Prompts erweitern (optional)
- [ ] Testen: Agenten mit Brand Book Knowledge verwenden

---

**Status:** 🔧 Bereit zur Konvertierung

