# 📚 Reading Agent - Wissensdatenbank

## ✅ Eigene Wissensdatenbank

Der Reading Agent hat eine **eigene, unabhängige Wissensdatenbank**, die beim Start geladen wird.

---

## 📁 Struktur

### Knowledge-Verzeichnis

```
production/knowledge/
├── human-design-basics.txt      # Grundlagen (Typen, Zentren, Profile)
├── reading-types.txt             # Alle 10 Reading-Typen
├── channels-gates.txt            # Channels & Gates (aktuell: 4/36 Channels, 4/64 Gates)
├── strategy-authority.txt         # Strategien & Autoritäten
└── incarnation-cross.txt         # Inkarnationskreuz
```

**Pfad:**
- **Lokal:** `production/knowledge/`
- **Server:** `/opt/mcp-connection-key/production/knowledge/`

---

## 🔧 Funktionsweise

### 1. Automatisches Laden beim Start

```javascript
// server.js lädt alle Knowledge-Dateien beim Start
function loadKnowledge() {
  const knowledge = {};
  
  // Liest alle .txt und .md Dateien aus knowledge/
  const files = fs.readdirSync(KNOWLEDGE_PATH);
  files.forEach(file => {
    if (file.endsWith('.txt') || file.endsWith('.md')) {
      const content = fs.readFileSync(filePath, 'utf8');
      knowledge[filename] = content; // Speichert als: knowledge['human-design-basics'] = content
    }
  });
  
  return knowledge;
}
```

**Status:** ✅ Funktioniert automatisch

---

### 2. Integration in System-Prompt

```javascript
// Knowledge wird automatisch in den System-Prompt eingefügt
if (Object.keys(knowledge).length > 0) {
  systemPrompt += "\n\nZusätzliches Wissen:\n";
  Object.values(knowledge).forEach(k => {
    systemPrompt += k + "\n"; // Alle Knowledge-Dateien werden hinzugefügt
  });
}
```

**Status:** ✅ Wird automatisch verwendet

---

### 3. Dynamisches Neuladen (ohne Neustart)

```bash
# Knowledge neu laden (ohne Agent-Neustart)
curl -X POST http://localhost:4001/admin/reload-knowledge \
  -H "Content-Type: application/json" \
  -d '{"secret": "IHR_AGENT_SECRET"}'
```

**Status:** ✅ Endpoint vorhanden (`POST /admin/reload-knowledge`)

---

## 📊 Aktuelle Knowledge-Dateien

| Datei | Inhalt | Vollständigkeit | Status |
|-------|--------|-----------------|--------|
| `human-design-basics.txt` | 4 Typen, 9 Zentren, Profile | ⚠️ Basis | ✅ Geladen |
| `reading-types.txt` | 10 Reading-Typen | ✅ Vollständig | ✅ Geladen |
| `channels-gates.txt` | Channels & Gates | ❌ **11%** (4/36, 4/64) | ⚠️ Unvollständig |
| `strategy-authority.txt` | Strategien & Autoritäten | ✅ Vollständig | ✅ Geladen |
| `incarnation-cross.txt` | Inkarnationskreuz | ⚠️ Basis | ✅ Geladen |

**Gesamt:** 5 Knowledge-Dateien geladen

---

## 🚀 Erweiterung der Wissensdatenbank

### Neue Knowledge-Dateien hinzufügen

**Einfach:** Neue `.txt` oder `.md` Dateien in `production/knowledge/` ablegen!

```bash
# Beispiel: Neue Knowledge-Datei erstellen
cd production/knowledge
cat > gates-complete.txt << 'EOF'
# Alle 64 Gates - Vollständige Beschreibung

## Gate 1 - Kreativität
...

## Gate 2 - ...
...
EOF
```

**Der Agent lädt sie automatisch beim nächsten Start!**

---

### Empfohlene Erweiterungen

#### Priorität 1: Channels & Gates vervollständigen

**Erstellen Sie:**
- `channels-complete.txt` - Alle 36 Channels
- `gates-complete.txt` - Alle 64 Gates

**Oder erweitern Sie:**
- `channels-gates.txt` - Fügen Sie alle fehlenden Channels und Gates hinzu

---

#### Priorität 2: Zentren & Profile detaillieren

**Erstellen Sie:**
- `centers-detailed.txt` - Alle 9 Zentren detailliert
- `profiles-detailed.txt` - Alle 12 Profile detailliert

---

#### Priorität 3: Weitere Themen

**Erstellen Sie:**
- `type-generator.txt` - Generator-Typ detailliert
- `type-manifestor.txt` - Manifestor-Typ detailliert
- `type-projector.txt` - Projector-Typ detailliert
- `type-reflector.txt` - Reflector-Typ detailliert
- `authority-detailed.txt` - Alle Authority-Typen detailliert
- `penta-formation.txt` - Penta-Formation
- `connection-key.txt` - Connection Key

---

## 📋 Vorteile der eigenen Wissensdatenbank

### ✅ Unabhängigkeit

- **Eigene Knowledge-Base:** Nicht abhängig von externen APIs
- **Lokale Kontrolle:** Alle Daten lokal verfügbar
- **Schnell:** Keine API-Calls für Knowledge

### ✅ Flexibilität

- **Beliebig erweiterbar:** Bis zu 100+ Knowledge-Dateien möglich
- **Dynamisches Neuladen:** Ohne Agent-Neustart
- **Eigene Struktur:** Sie bestimmen die Organisation

### ✅ Performance

- **Schnelles Laden:** Beim Start geladen, dann im Speicher
- **Keine Latenz:** Keine API-Calls während der Reading-Generierung
- **Effizient:** Nur relevante Knowledge wird geladen

---

## 🔍 Health Check

```bash
# Prüfen, welche Knowledge-Dateien geladen sind
curl http://localhost:4001/health
```

**Response:**
```json
{
  "status": "ok",
  "knowledge": 5,  // Anzahl geladener Knowledge-Dateien
  "templates": 11,
  "timestamp": "2025-12-07T..."
}
```

---

## 📝 Zusammenfassung

**Der Reading Agent hat eine eigene Wissensdatenbank:**

✅ **Funktioniert:** Automatisches Laden beim Start  
✅ **Erweiterbar:** Beliebige `.txt`/`.md` Dateien hinzufügen  
✅ **Dynamisch:** Neuladen ohne Neustart möglich  
✅ **Unabhängig:** Keine externen APIs für Knowledge nötig  

**Aktuell:** 5 Knowledge-Dateien geladen  
**Empfehlung:** Channels & Gates vervollständigen (höchste Priorität!)

---

## 🚀 Nächste Schritte

1. **Channels & Gates vervollständigen** (36 Channels, 64 Gates)
2. **Zentren & Profile detaillieren** (9 Zentren, 12 Profile)
3. **Weitere Knowledge-Dateien hinzufügen** (Typen, Authority, etc.)

**Siehe auch:**
- `integration/KNOWLEDGE_UEBERSICHT.md` - Übersicht aller Knowledge-Dateien
- `integration/KNOWLEDGE_DETAILS.md` - Detaillierte Analyse
- `integration/READING_AGENT_KNOWLEDGE_ERWEITERN.md` - Anleitung zum Erweitern

