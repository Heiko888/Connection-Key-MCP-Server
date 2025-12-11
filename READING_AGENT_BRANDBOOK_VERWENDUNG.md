# 🔮 Reading Agent - Brand Book Verwendung

**Frage:** Was macht der Reading Agent mit dem Brand Book?

---

## 📋 Übersicht

Der Reading Agent verwendet das Brand Book, um:
1. **Tone of Voice** korrekt anzuwenden
2. **Markenidentität** in Readings zu reflektieren
3. **Kommunikationsrichtlinien** einzuhalten
4. **Brand Voice** konsistent zu verwenden

---

## 🔧 Technische Integration

### 1. Knowledge-Loading

**Code:** `production/server.js` (Zeilen 98-122)

```javascript
function loadKnowledge() {
  const knowledge = {};
  
  // Lädt alle .txt und .md Dateien aus knowledge/
  // UND aus Unterordnern (z.B. knowledge/brandbook/)
  
  files.forEach(file => {
    if (stat.isFile() && (file.endsWith('.txt') || file.endsWith('.md'))) {
      // Datei laden
      knowledge[key] = content;
    } else if (stat.isDirectory()) {
      // Lade auch Dateien aus Unterordnern (z.B. brandbook/)
      const subFiles = fs.readdirSync(filePath);
      subFiles.forEach(subFile => {
        if (subFile.endsWith('.txt') || subFile.endsWith('.md')) {
          knowledge[subKey] = subContent;
        }
      });
    }
  });
  
  return knowledge;
}
```

**Was passiert:**
- ✅ Lädt alle `.txt` und `.md` Dateien aus `production/knowledge/`
- ✅ Lädt auch Dateien aus Unterordnern (z.B. `knowledge/brandbook/`)
- ✅ Speichert alle Knowledge-Dateien in einem Objekt

---

### 2. System-Prompt Integration

**Code:** `production/server.js` (Zeilen 186-230)

```javascript
// System-Prompt mit Brand Book Integration
let systemPrompt = `Du bist ein Experte für Human Design Readings für "The Connection Key".

Du erstellst detaillierte, präzise und wertvolle Human Design Readings basierend auf Geburtsdaten.

WICHTIG: Nutze das Brand Book Wissen, um:
- Den korrekten Tone of Voice von "The Connection Key" zu verwenden
- Die Markenidentität und Werte in deinen Readings zu reflektieren
- Die Kommunikationsrichtlinien einzuhalten
- Den Brand Voice konsistent anzuwenden`;

// Brand Book Knowledge extrahieren
const brandbookKnowledge = [];
const otherKnowledge = [];

Object.entries(knowledge).forEach(([key, content]) => {
  if (key.startsWith('brandbook-') || key.includes('brandbook')) {
    brandbookKnowledge.push(content);
  } else {
    otherKnowledge.push(content);
  }
});

// Brand Book Knowledge zuerst hinzufügen (höhere Priorität)
if (brandbookKnowledge.length > 0) {
  systemPrompt += "\n\n=== BRAND BOOK WISSEN (WICHTIG - IMMER VERWENDEN) ===\n";
  systemPrompt += "Das folgende Brand Book Wissen MUSS in deinen Readings verwendet werden:\n";
  systemPrompt += "- Markenidentität, Tone of Voice, Kommunikationsrichtlinien\n";
  systemPrompt += "- Brand Voice, Werte, Mission\n";
  systemPrompt += "- Verwende diese Informationen aktiv in deinen Readings!\n\n";
  brandbookKnowledge.forEach(k => {
    systemPrompt += k + "\n\n";
  });
}

// Andere Knowledge hinzufügen
if (otherKnowledge.length > 0) {
  systemPrompt += "\n\n=== ZUSÄTZLICHES HUMAN DESIGN WISSEN ===\n";
  otherKnowledge.forEach(k => {
    systemPrompt += k + "\n";
  });
}
```

**Was passiert:**
1. ✅ System-Prompt wird erstellt mit expliziter Anweisung zur Brand Book Verwendung
2. ✅ Knowledge wird in zwei Gruppen geteilt:
   - **Brand Book Knowledge** (beginnt mit "brandbook-" oder enthält "brandbook")
   - **Andere Knowledge** (Human Design Wissen)
3. ✅ Brand Book Knowledge wird **zuerst** hinzugefügt (höhere Priorität)
4. ✅ Klare Markierung als "WICHTIG - IMMER VERWENDEN"
5. ✅ Alle Brand Book Dateien werden in den System-Prompt eingefügt

---

## 🎯 Was der Reading Agent damit macht

### 1. Tone of Voice anwenden

**Beispiel:**
- ❌ **Ohne Brand Book:** "Du bist ein Generator. Du musst warten."
- ✅ **Mit Brand Book:** "Als Generator ist deine Strategie, auf deine innere Antwort zu warten. Das ist keine Passivität, sondern Präzision – genau wie The Connection Key echte Daten statt esoterisches Raten nutzt."

### 2. Markenidentität reflektieren

**Beispiel:**
- ❌ **Ohne Brand Book:** Generisches Human Design Reading
- ✅ **Mit Brand Book:** Reading im Stil von "The Connection Key" mit:
  - Markenstatement: "Entdecke die Frequenz zwischen euch – klar, präzise, alltagsnah."
  - Markenwerte: Präzision, Verbindung, Transformation
  - Brand Voice: Authentisch, klar, wertvoll, persönlich

### 3. Kommunikationsrichtlinien einhalten

**Beispiel:**
- ✅ Sprache: Deutsch
- ✅ Stil: Authentisch, klar, wertvoll, persönlich
- ✅ Keine übermäßig formelle Sprache
- ✅ Freundlich und unterstützend
- ✅ Technisch präzise, aber verständlich

### 4. Brand Voice konsistent verwenden

**Beispiel:**
- ✅ Alle Readings haben den gleichen Tone of Voice
- ✅ Konsistente Markenidentität in allen Readings
- ✅ Einheitliche Kommunikationsrichtlinien

---

## 📊 Priorisierung

### Brand Book Knowledge (Höchste Priorität)

```
=== BRAND BOOK WISSEN (WICHTIG - IMMER VERWENDEN) ===
- Wird ZUERST in System-Prompt eingefügt
- Klare Markierung als "WICHTIG"
- Explizite Anweisung zur Verwendung
```

### Human Design Knowledge (Normale Priorität)

```
=== ZUSÄTZLICHES HUMAN DESIGN WISSEN ===
- Wird NACH Brand Book hinzugefügt
- Unterstützt Brand Book, überschreibt es nicht
```

---

## 🔄 Workflow

### 1. Reading-Anfrage kommt an

```
POST /reading/generate
{
  "birthDate": "1990-05-15",
  "birthTime": "14:30",
  "birthPlace": "Berlin",
  "readingType": "detailed"
}
```

### 2. System-Prompt wird erstellt

```
1. Basis-System-Prompt (Human Design Experte)
2. Brand Book Knowledge wird hinzugefügt (PRIORITÄT)
3. Human Design Knowledge wird hinzugefügt
4. Template wird geladen (falls vorhanden)
```

### 3. OpenAI API wird aufgerufen

```
System-Prompt (mit Brand Book) → OpenAI GPT-4
User-Prompt (mit Geburtsdaten) → OpenAI GPT-4
```

### 4. Reading wird generiert

```
✅ Mit Brand Book:
- Tone of Voice korrekt
- Markenidentität reflektiert
- Brand Voice konsistent
- Kommunikationsrichtlinien eingehalten
```

---

## 📁 Brand Book Dateien

### Struktur

```
production/knowledge/
├── brandbook/
│   ├── brandbook-kapitel-01.txt    # Brand Identity
│   ├── brandbook-kapitel-02.txt    # Visuelle Identität
│   ├── brandbook-kapitel-03.txt    # Human Design Identity System
│   ├── brandbook-kapitel-05.txt    # Brand Voice
│   ├── brandbook-kapitel-06.txt    # KI-Agenten
│   └── brandbook-complete.md       # Vollständiges Brand Book
├── human-design-basics.txt
├── reading-types.txt
└── ...
```

### Welche Dateien werden verwendet?

**Alle Brand Book Dateien:**
- ✅ `brandbook-kapitel-*.txt` (alle 18 Kapitel)
- ✅ `brandbook-complete.md`
- ✅ Alle Dateien die "brandbook" im Namen haben

**Automatisch erkannt:**
```javascript
if (key.startsWith('brandbook-') || key.includes('brandbook')) {
  brandbookKnowledge.push(content);
}
```

---

## ✅ Zusammenfassung

**Der Reading Agent verwendet das Brand Book, um:**

1. ✅ **Tone of Voice** korrekt anzuwenden
2. ✅ **Markenidentität** in Readings zu reflektieren
3. ✅ **Kommunikationsrichtlinien** einzuhalten
4. ✅ **Brand Voice** konsistent zu verwenden
5. ✅ **Markenwerte** (Präzision, Verbindung, Transformation) zu integrieren
6. ✅ **Markenstatement** zu verwenden: "Entdecke die Frequenz zwischen euch – klar, präzise, alltagsnah."

**Technisch:**
- ✅ Brand Book Knowledge wird automatisch geladen
- ✅ Wird in System-Prompt mit höchster Priorität eingefügt
- ✅ Explizite Anweisung zur Verwendung
- ✅ Unterstützt durch Human Design Knowledge

---

**Status:** ✅ Brand Book wird aktiv im Reading Agent verwendet!

