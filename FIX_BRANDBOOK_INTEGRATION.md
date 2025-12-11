# 🔧 Brand Book Integration Fix

**Problem:** Brand Book Knowledge wird geladen, aber nicht im Reading verwendet

**Lösung:** System-Prompt erweitert, um Brand Book Wissen explizit zu verwenden

---

## ✅ Was wurde geändert

### 1. System-Prompt erweitert

**Vorher:**
```javascript
let systemPrompt = `Du bist ein Experte für Human Design Readings.
...
Sprache: Deutsch
Stil: Authentisch, klar, wertvoll, persönlich`;

// Knowledge einfach hinzufügen
if (Object.keys(knowledge).length > 0) {
  systemPrompt += "\n\nZusätzliches Wissen:\n";
  Object.values(knowledge).forEach(k => {
    systemPrompt += k + "\n";
  });
}
```

**Nachher:**
```javascript
let systemPrompt = `Du bist ein Experte für Human Design Readings für "The Connection Key".
...
WICHTIG: Nutze das Brand Book Wissen, um:
- Den korrekten Tone of Voice von "The Connection Key" zu verwenden
- Die Markenidentität und Werte in deinen Readings zu reflektieren
- Die Kommunikationsrichtlinien einzuhalten
- Den Brand Voice konsistent anzuwenden`;

// Brand Book Knowledge extrahieren und priorisiert hinzufügen
const brandbookKnowledge = [];
const otherKnowledge = [];

Object.entries(knowledge).forEach(([key, content]) => {
  if (key.startsWith('brandbook-') || key.includes('brandbook')) {
    brandbookKnowledge.push(content);
  } else {
    otherKnowledge.push(content);
  }
});

// Brand Book Knowledge zuerst (höhere Priorität)
if (brandbookKnowledge.length > 0) {
  systemPrompt += "\n\n=== BRAND BOOK WISSEN (WICHTIG - IMMER VERWENDEN) ===\n";
  systemPrompt += "Das folgende Brand Book Wissen MUSS in deinen Readings verwendet werden:\n";
  brandbookKnowledge.forEach(k => {
    systemPrompt += k + "\n\n";
  });
}

// Andere Knowledge
if (otherKnowledge.length > 0) {
  systemPrompt += "\n\n=== ZUSÄTZLICHES HUMAN DESIGN WISSEN ===\n";
  otherKnowledge.forEach(k => {
    systemPrompt += k + "\n";
  });
}
```

### 2. Knowledge-Loading erweitert

**Vorher:**
```javascript
// Lade nur Dateien direkt aus Knowledge-Pfad
const files = fs.readdirSync(KNOWLEDGE_PATH);
files.forEach(file => {
  if (file.endsWith('.txt') || file.endsWith('.md')) {
    // ...
  }
});
```

**Nachher:**
```javascript
// Lade Dateien direkt aus Knowledge-Pfad
const files = fs.readdirSync(KNOWLEDGE_PATH);
files.forEach(file => {
  const filePath = path.join(KNOWLEDGE_PATH, file);
  const stat = fs.statSync(filePath);
  
  if (stat.isFile() && (file.endsWith('.txt') || file.endsWith('.md'))) {
    // Datei laden
  } else if (stat.isDirectory()) {
    // Lade auch Dateien aus Unterordnern (z.B. brandbook/)
    const subFiles = fs.readdirSync(filePath);
    subFiles.forEach(subFile => {
      if (subFile.endsWith('.txt') || subFile.endsWith('.md')) {
        // Unterordner-Datei laden
      }
    });
  }
});
```

---

## 🎯 Verbesserungen

### 1. Explizite Anweisung zur Brand Book Verwendung

Der System-Prompt weist jetzt explizit an:
- Brand Book Wissen zu verwenden
- Tone of Voice korrekt anzuwenden
- Markenidentität zu reflektieren
- Kommunikationsrichtlinien einzuhalten

### 2. Priorisierung von Brand Book Knowledge

- Brand Book Knowledge wird **zuerst** hinzugefügt (höhere Priorität)
- Klare Markierung als "WICHTIG - IMMER VERWENDEN"
- Separate Sektion für Brand Book vs. andere Knowledge

### 3. Unterstützung für Unterordner

- Lädt jetzt auch Dateien aus `knowledge/brandbook/`
- Automatische Erkennung von Brand Book Dateien (beginnt mit "brandbook-")

---

## 🚀 Nächste Schritte

### 1. Code auf Server aktualisieren

```bash
# Auf Hetzner Server
cd /opt/mcp-connection-key/production
# Aktualisiere server.js mit den Änderungen
```

### 2. Reading Agent neu starten

```bash
# PM2 neu starten
pm2 restart reading-agent

# Oder Knowledge neu laden (falls reload-endpoint vorhanden)
curl -X POST http://localhost:4001/admin/reload-knowledge \
  -H "Content-Type: application/json" \
  -d '{"secret": "IHR_AGENT_SECRET"}'
```

### 3. Testen

```bash
# Test-Reading generieren
curl -X POST http://localhost:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "detailed"
  }'
```

**Prüfen Sie:**
- Wird Brand Voice verwendet?
- Wird Markenidentität reflektiert?
- Wird Tone of Voice korrekt angewendet?

---

## 📋 Checkliste

- [x] System-Prompt erweitert
- [x] Brand Book Knowledge priorisiert
- [x] Unterordner-Support hinzugefügt
- [ ] Code auf Server aktualisiert
- [ ] Reading Agent neu gestartet
- [ ] Test-Reading generiert und geprüft

---

**Status:** ✅ Code-Änderungen fertig, bereit für Deployment

