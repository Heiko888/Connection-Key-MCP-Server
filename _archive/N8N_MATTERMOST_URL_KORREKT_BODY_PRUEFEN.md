# 🔍 n8n Mattermost - URL korrekt, aber Fehler bleibt

**Situation:** URL ist korrekt eingetragen, aber "Resource not found" Fehler tritt weiterhin auf

**URL:** `https://chat.werdemeisterdeinergedanken.de/hooks/641nxt1nnigjuyg5z44czf6rje` ✅

**Ursache:** Wahrscheinlich Problem mit JSON Body oder Expression

---

## ✅ Schritt 1: Webhook direkt testen

### Mit curl testen:

```bash
curl -X POST https://chat.werdemeisterdeinergedanken.de/hooks/641nxt1nnigjuyg5z44czf6rje \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test von curl",
    "channel": "#marketing",
    "username": "Test Bot"
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Nachricht erscheint in Mattermost

**Falls das funktioniert:** Problem ist in n8n JSON Body-Konfiguration
**Falls das nicht funktioniert:** Problem ist mit Mattermost Webhook selbst

---

## ✅ Schritt 2: JSON Body Expression prüfen

### In n8n "Send to Mattermost" Node:

1. **Node öffnen**
2. **JSON Body Feld prüfen**

**Korrekte Expression sollte sein:**

```
={{ JSON.stringify({ 
  text: '## 📢 Täglicher Marketing-Content generiert!\n\n**Zeit:** ' + $now + '\n\n---\n\n' + ($json.response || 'Content generiert'), 
  channel: '#marketing', 
  username: 'Marketing Agent' 
}) }}
```

**WICHTIG:**
- ✅ Beginnt mit `={{` (Gleichheitszeichen + doppelte geschweifte Klammern)
- ✅ Endet mit `}}` (doppelte geschweifte Klammern)
- ✅ Strings in einfachen Anführungszeichen `'...'` (nicht `"..."`)
- ✅ JSON-Objekt korrekt geschlossen

---

## 🔧 Schritt 3: Expression vereinfachen (zum Testen)

**Falls die Expression zu komplex ist, vereinfachen:**

### Option A: Minimale Test-Expression

```
={{ JSON.stringify({ 
  text: 'Test-Nachricht von n8n', 
  channel: '#marketing', 
  username: 'Marketing Agent' 
}) }}
```

**Testen Sie diese minimale Expression zuerst!**

### Option B: Ohne $now

```
={{ JSON.stringify({ 
  text: '## 📢 Täglicher Marketing-Content generiert!\n\n' + ($json.response || 'Content generiert'), 
  channel: '#marketing', 
  username: 'Marketing Agent' 
}) }}
```

### Option C: Nur Response aus Marketing Agent

```
={{ JSON.stringify({ 
  text: $json.response || 'Content generiert', 
  channel: '#marketing', 
  username: 'Marketing Agent' 
}) }}
```

---

## 🔧 Schritt 4: Body Parameters verwenden (Alternative)

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

## 🔍 Schritt 5: Häufige Probleme prüfen

### Problem 1: Expression beginnt nicht mit `={{`

**Falsch:**
```
{{ JSON.stringify({ ... }) }}
```

**Korrekt:**
```
={{ JSON.stringify({ ... }) }}
```

**Wichtig:** Das `=` am Anfang ist entscheidend!

### Problem 2: Expression endet nicht mit `}}`

**Falsch:**
```
={{ JSON.stringify({ ... }) }
```

**Korrekt:**
```
={{ JSON.stringify({ ... }) }}
```

### Problem 3: Falsche Anführungszeichen

**Falsch:**
```
={{ JSON.stringify({ text: "..." }) }}
```

**Korrekt:**
```
={{ JSON.stringify({ text: '...' }) }}
```

**Wichtig:** Einfache Anführungszeichen `'...'` für Strings!

### Problem 4: $json.response ist undefined

**Problem:**
- Marketing Agent Node gibt `response` zurück
- Aber Expression verwendet `$json.response` und es ist undefined

**Lösung:**
- Prüfe Output vom Marketing Agent Node
- Welches Feld enthält die Antwort?
- Möglicherweise: `$json.response` oder `$json.message` oder `$json.data`

**Prüfe im Marketing Agent Node Output:**
- Welche Felder gibt es?
- `success`, `agentId`, `response`, `tokens`, `model`?

**Falls `response` existiert:**
- Expression sollte funktionieren: `$json.response`

**Falls `response` nicht existiert:**
- Verwende das korrekte Feld: `$json.message` oder `$json.data`

---

## 🧪 Schritt 6: Schritt-für-Schritt testen

### Test 1: Minimale Expression

1. **JSON Body Feld leeren**
2. **Minimale Expression eintragen:**
   ```
   ={{ JSON.stringify({ text: 'Test', channel: '#marketing', username: 'Test Bot' }) }}
   ```
3. **Save** klicken
4. **Workflow testen** (Execute Workflow)

**Falls erfolgreich:** Expression funktioniert → Schrittweise erweitern
**Falls Fehler:** Problem ist mit Expression-Syntax → Prüfe Anführungszeichen, Klammern

### Test 2: Mit Marketing Agent Response

1. **Expression erweitern:**
   ```
   ={{ JSON.stringify({ 
     text: $json.response || 'Content generiert', 
     channel: '#marketing', 
     username: 'Marketing Agent' 
   }) }}
   ```
2. **Save** klicken
3. **Workflow testen**

**Falls erfolgreich:** Response wird verwendet
**Falls Fehler:** `$json.response` ist undefined → Prüfe Marketing Agent Output

### Test 3: Vollständige Expression

1. **Vollständige Expression eintragen:**
   ```
   ={{ JSON.stringify({ 
     text: '## 📢 Täglicher Marketing-Content generiert!\n\n**Zeit:** ' + $now + '\n\n---\n\n' + ($json.response || 'Content generiert'), 
     channel: '#marketing', 
     username: 'Marketing Agent' 
   }) }}
   ```
2. **Save** klicken
3. **Workflow testen**

---

## 📋 Checkliste

**URL:**
- [x] URL ist korrekt: `https://chat.werdemeisterdeinergedanken.de/hooks/641nxt1nnigjuyg5z44czf6rje` ✅

**JSON Body:**
- [ ] Expression beginnt mit `={{` ✅
- [ ] Expression endet mit `}}` ✅
- [ ] Strings in einfachen Anführungszeichen `'...'` ✅
- [ ] JSON-Objekt korrekt geschlossen ✅
- [ ] `$json.response` existiert (prüfe Marketing Agent Output) ✅

**Test:**
- [ ] Webhook mit curl getestet ✅
- [ ] Minimale Expression getestet ✅
- [ ] Vollständige Expression getestet ✅

---

## 🚨 Falls weiterhin Fehler

### Prüfe Marketing Agent Output:

1. **Workflow ausführen**
2. **Marketing Agent Node öffnen**
3. **Output prüfen:**
   - Welche Felder gibt es?
   - `success`, `agentId`, `response`, `tokens`, `model`?
4. **Falls `response` nicht existiert:**
   - Verwende das korrekte Feld in der Expression

### Alternative: Body Parameters verwenden

**Falls Expression weiterhin nicht funktioniert:**
- Verwenden Sie "Using Fields Below" (Body Parameters)
- Siehe Schritt 4 oben

---

## ✅ Zusammenfassung

**URL ist korrekt:** ✅ `https://chat.werdemeisterdeinergedanken.de/hooks/641nxt1nnigjuyg5z44czf6rje`

**Problem:** Wahrscheinlich JSON Body Expression

**Lösung:**
1. Webhook mit curl testen (bestätigt, dass Webhook funktioniert)
2. Minimale Expression testen: `={{ JSON.stringify({ text: 'Test', channel: '#marketing', username: 'Test Bot' }) }}`
3. Schrittweise erweitern
4. Falls Expression nicht funktioniert: Body Parameters verwenden

**Wichtig:** 
- Expression muss mit `={{` beginnen und mit `}}` enden
- Strings in einfachen Anführungszeichen `'...'`
- Prüfe ob `$json.response` existiert im Marketing Agent Output

---

**Status:** 🔍 **URL-korrekt-Body-Prüfungs-Anleitung erstellt!**
