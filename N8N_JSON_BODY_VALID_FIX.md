# 🔧 n8n JSON Body - "JSON parameter needs to be valid JSON" Fix

**Fehler:** "JSON parameter needs to be valid JSON"

**Ursache:** Die `JSON.stringify()` Expression ist nicht korrekt formatiert oder n8n kann sie nicht als gültiges JSON erkennen

---

## ✅ Lösung: JSON Body korrekt formatieren

### Problem identifizieren

**Häufige Ursachen:**
1. Expression beginnt nicht mit `={{`
2. Expression endet nicht mit `}}`
3. JSON-Objekt ist nicht korrekt geschlossen
4. Anführungszeichen sind falsch (einfache vs. doppelte)
5. Expression ist zu lang und wird abgeschnitten

---

## 🔧 Lösung 1: Expression korrekt formatieren

### Schritt 1: JSON Body Feld leeren

1. **"Send to Mattermost" Node** öffnen
2. **JSON Body** Feld komplett leeren
3. **Expression-Modus aktivieren** ({{ }} Button klicken)

### Schritt 2: Korrekte Expression eintragen

**WICHTIG:** Die Expression muss mit `={{` beginnen und mit `}}` enden!

**Korrekte Formatierung:**

```
={{ JSON.stringify({ 
  text: '## 📢 Täglicher Marketing-Content generiert!\n\n**Zeit:** ' + $now + '\n\n---\n\n' + ($json.response || 'Content generiert'), 
  channel: '#marketing', 
  username: 'Marketing Agent' 
}) }}
```

**WICHTIGE PUNKTE:**
- ✅ Beginnt mit `={{` (Gleichheitszeichen + doppelte geschweifte Klammern)
- ✅ Endet mit `}}` (doppelte geschweifte Klammern)
- ✅ Alle Strings in einfachen Anführungszeichen `'...'`
- ✅ JSON-Objekt korrekt geschlossen `{ ... }`
- ✅ Kommas zwischen Objekt-Eigenschaften

---

## 🔧 Lösung 2: Vereinfachte Expression (falls zu komplex)

**Falls die Expression zu komplex ist, vereinfachen:**

### Option A: Ohne $now

```
={{ JSON.stringify({ 
  text: '## 📢 Täglicher Marketing-Content generiert!\n\n' + ($json.response || 'Content generiert'), 
  channel: '#marketing', 
  username: 'Marketing Agent' 
}) }}
```

### Option B: Nur Text aus Marketing Agent

```
={{ JSON.stringify({ 
  text: $json.response || 'Content generiert', 
  channel: '#marketing', 
  username: 'Marketing Agent' 
}) }}
```

### Option C: Statischer Text (zum Testen)

```
={{ JSON.stringify({ 
  text: 'Test-Nachricht von n8n', 
  channel: '#marketing', 
  username: 'Marketing Agent' 
}) }}
```

---

## 🔧 Lösung 3: Body Parameters verwenden (Alternative)

**Falls Expression nicht funktioniert, Body Parameters verwenden:**

1. **Specify Body:** `Using Fields Below` wählen
2. **Body Parameters:** "Add Value" klicken
3. **Name:** `text`
4. **Value:** `={{ '## 📢 Täglicher Marketing-Content generiert!\n\n' + ($json.response || 'Content generiert') }}`
5. **Add Value** erneut klicken
6. **Name:** `channel`
7. **Value:** `#marketing` (ohne Expression, direkt)
8. **Add Value** erneut klicken
9. **Name:** `username`
10. **Value:** `Marketing Agent` (ohne Expression, direkt)
11. **Save** klicken

---

## 🔍 Häufige Fehler

### Fehler 1: Expression beginnt falsch

**Falsch:**
```
{{ JSON.stringify({ ... }) }}
```

**Korrekt:**
```
={{ JSON.stringify({ ... }) }}
```

**Wichtig:** Das `=` am Anfang ist entscheidend!

### Fehler 2: Expression endet falsch

**Falsch:**
```
={{ JSON.stringify({ ... }) }
```

**Korrekt:**
```
={{ JSON.stringify({ ... }) }}
```

**Wichtig:** Zwei geschweifte Klammern am Ende!

### Fehler 3: Falsche Anführungszeichen

**Falsch:**
```
={{ JSON.stringify({ text: "..." }) }}
```

**Korrekt:**
```
={{ JSON.stringify({ text: '...' }) }}
```

**Wichtig:** Einfache Anführungszeichen `'...'` für Strings in Expressions!

### Fehler 4: JSON-Objekt nicht geschlossen

**Falsch:**
```
={{ JSON.stringify({ 
  text: '...',
  channel: '#marketing'
  // Fehlende schließende Klammer
}) }}
```

**Korrekt:**
```
={{ JSON.stringify({ 
  text: '...',
  channel: '#marketing'
}) }}
```

### Fehler 5: Expression zu lang

**Problem:** Expression wird abgeschnitten (zeigt `...`)

**Lösung:**
- Expression vereinfachen
- Oder: Body Parameters verwenden (siehe Lösung 3)

---

## ✅ Vollständige korrekte Konfiguration

**"Send to Mattermost" Node:**

| Feld | Wert |
|------|------|
| **Method** | `POST` |
| **URL** | `https://chat.werdemeisterdeinergedanke.de/hooks/xxxxx` |
| **Authentication** | `None` |
| **Send Body** | ✅ **ON** |
| **Body Content Type** | `JSON` |
| **Specify Body** | `JSON` |
| **JSON Body** | `={{ JSON.stringify({ text: '...', channel: '#marketing', username: 'Marketing Agent' }) }}` |

---

## 🧪 Test-Expression (minimal)

**Zum Testen, verwenden Sie diese minimale Expression:**

```
={{ JSON.stringify({ text: 'Test', channel: '#marketing', username: 'Test Bot' }) }}
```

**Falls das funktioniert:** Dann können Sie die Expression schrittweise erweitern.

---

## 📋 Schritt-für-Schritt: Expression korrigieren

1. **JSON Body Feld komplett leeren**
2. **Expression-Modus aktivieren** ({{ }} Button)
3. **Minimale Expression eintragen:**
   ```
   ={{ JSON.stringify({ text: 'Test', channel: '#marketing', username: 'Test Bot' }) }}
   ```
4. **Save** klicken
5. **Workflow testen** (Execute Workflow)
6. **Falls erfolgreich:** Expression schrittweise erweitern

---

## 🚨 Falls weiterhin Fehler

### Prüfe Expression-Syntax:

1. **Expression kopieren** aus n8n
2. **In Text-Editor einfügen**
3. **Prüfe:**
   - Beginnt mit `={{`?
   - Endet mit `}}`?
   - Alle Anführungszeichen korrekt?
   - JSON-Objekt korrekt geschlossen?

### Alternative: Body Parameters verwenden

**Falls Expression weiterhin nicht funktioniert:**
- Verwenden Sie "Using Fields Below" (Body Parameters)
- Siehe Lösung 3 oben

---

## ✅ Checkliste

**JSON Body Expression:**
- [ ] Beginnt mit `={{` ✅
- [ ] Endet mit `}}` ✅
- [ ] Strings in einfachen Anführungszeichen `'...'` ✅
- [ ] JSON-Objekt korrekt geschlossen `{ ... }` ✅
- [ ] Kommas zwischen Objekt-Eigenschaften ✅
- [ ] Keine abgeschnittene Expression (kein `...`) ✅

---

## ✅ Zusammenfassung

**Problem:** "JSON parameter needs to be valid JSON"

**Ursache:** Expression nicht korrekt formatiert

**Lösung:**
1. Expression mit `={{` beginnen
2. Expression mit `}}` enden
3. Strings in einfachen Anführungszeichen
4. JSON-Objekt korrekt schließen

**Minimale Test-Expression:**
```
={{ JSON.stringify({ text: 'Test', channel: '#marketing', username: 'Test Bot' }) }}
```

---

**Status:** 🔧 **JSON Body Valid-Fix-Anleitung erstellt!**
