# 🔧 Reading Agent - userId Fehler

**Problem:** `ReferenceError: userId is not defined`

**Bedeutung:** Im Code wird `userId` verwendet, aber die Variable ist nicht definiert.

---

## 🔍 Problem-Analyse

**Fehler in Logs:**
```
ReferenceError: userId is not defined
```

**Ursache:** 
- `userId` wird im Code verwendet, aber nicht aus `req.body` extrahiert
- Oder `userId` wird außerhalb des Request-Contexts verwendet

---

## 🔧 Lösung

### Schritt 1: Prüfe Code-Stelle

```bash
cd /opt/mcp-connection-key/production
grep -n "userId" server.js
```

**Was zu prüfen:**
- ✅ Wird `userId` aus `req.body` extrahiert?
- ❌ Wird `userId` außerhalb des Request-Contexts verwendet?

---

### Schritt 2: Code korrigieren

**Aktueller Code (Zeile 194):**
```javascript
const { userId, birthDate, birthTime, birthPlace, readingType = "detailed" } = req.body;
```

**Problem:** `userId` wird möglicherweise später verwendet, aber ist `undefined` wenn nicht im Request-Body.

**Lösung:** Stelle sicher, dass `userId` immer definiert ist (auch wenn `undefined`):

```javascript
const { userId, birthDate, birthTime, birthPlace, readingType = "detailed" } = req.body;
// userId kann undefined sein, das ist OK
```

**Oder:** Prüfe wo `userId` verwendet wird und stelle sicher, dass es optional ist.

---

### Schritt 3: Prüfe wo userId verwendet wird

```bash
cd /opt/mcp-connection-key/production
grep -n "userId" server.js
```

**Was zu prüfen:**
- ✅ Wird `userId` in Logs verwendet? → Optional machen
- ✅ Wird `userId` in readingId verwendet? → Fallback auf "anonymous"
- ❌ Wird `userId` in einem Bereich verwendet, wo es nicht verfügbar ist?

---

### Schritt 4: Code korrigieren (falls nötig)

**Falls `userId` in Logs verwendet wird:**
```javascript
log("error", "Fehler beim Generieren des Readings", {
  error: error.message,
  stack: error.stack,
  userId: userId || "anonymous", // ← Fallback
  birthDate
});
```

**Falls `userId` in readingId verwendet wird:**
```javascript
const readingId = `reading-${Date.now()}-${userId || "anonymous"}`;
```

---

### Schritt 5: Reading Agent neu starten

```bash
pm2 restart reading-agent
pm2 logs reading-agent --lines 50
```

**Erwartet:**
- ✅ Keine `ReferenceError: userId is not defined` Fehler mehr
- ✅ Requests werden verarbeitet

---

## ✅ Nächste Schritte

1. **Prüfe Code-Stelle** (`grep -n "userId" server.js`)
2. **Korrigiere Code** (falls nötig)
3. **Reading Agent neu starten** (`pm2 restart reading-agent`)
4. **Teste erneut** (`curl -X POST http://138.199.237.34:4001/reading/generate ...`)

**Bitte Code prüfen und korrigieren!**

