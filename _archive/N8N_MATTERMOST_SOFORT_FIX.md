# 🔧 n8n Mattermost Node - Sofort-Fix

**Problem:** 2 kritische Konfigurationsfehler im Screenshot erkannt

---

## 🚨 Problem 1: URL ist unvollständig

**Aktuell (falsch):**
```
https://chat.werdemeisterdeinergedanke
```

**Sollte sein (korrekt):**
```
https://chat.werdemeisterdeinergedanken.de/hooks/tzw3a5godjfpicpu87ixzut39w
```

**Fix:**
1. **URL-Feld** öffnen
2. **Alte URL löschen**
3. **Neue URL eintragen:** `https://chat.werdemeisterdeinergedanken.de/hooks/tzw3a5godjfpicpu87ixzut39w`
4. **Save** klicken

---

## 🚨 Problem 2: "Specify Body" ist falsch

**Aktuell (falsch):**
- **Specify Body:** `Using Fields Below` ❌

**Sollte sein (korrekt):**
- **Specify Body:** `JSON` ✅

**Fix:**
1. **"Specify Body" Dropdown** öffnen
2. **`JSON` wählen** (nicht "Using Fields Below")
3. **Nach dem Wechsel erscheint ein neues Feld "JSON Body"**
4. **JSON Body Expression eintragen** (siehe unten)
5. **Save** klicken

---

## ✅ Schritt-für-Schritt: Komplette Korrektur

### Schritt 1: URL korrigieren

1. **"Send to Mattermost" Node** öffnen
2. **URL-Feld:**
   - Alte URL löschen: `https://chat.werdemeisterdeinergedanke`
   - Neue URL eintragen: `https://chat.werdemeisterdeinergedanken.de/hooks/tzw3a5godjfpicpu87ixzut39w`
3. **Save** klicken

---

### Schritt 2: "Specify Body" auf JSON ändern

1. **"Specify Body" Dropdown** öffnen
2. **`JSON` wählen** (nicht "Using Fields Below")
3. **Nach dem Wechsel:**
   - "Body Parameters" Felder verschwinden
   - Neues Feld "JSON Body" erscheint

---

### Schritt 3: JSON Body Expression eintragen

1. **JSON Body Feld** öffnen
2. **Expression-Modus aktivieren:**
   - **{{ }} Button** klicken (oben rechts im JSON Body Feld)
   - Feld sollte blau werden
3. **Expression eintragen:**
   ```
   ={{ JSON.stringify({ 
     text: '## 🤖 Agent-Antwort\n\n**Agent:** ' + $('Webhook Trigger').item.json.agentId + '\n**Anfrage:** ' + $('Webhook Trigger').item.json.message + '\n\n---\n\n' + $json.response, 
     channel: '#tech', 
     username: $('Webhook Trigger').item.json.agentId + ' Agent' 
   }) }}
   ```
4. **Save** klicken

---

## ✅ Checkliste: Was korrigieren?

**"Send to Mattermost" Node:**
- [ ] URL vollständig: `https://chat.werdemeisterdeinergedanken.de/hooks/tzw3a5godjfpicpu87ixzut39w` ✅
- [ ] Specify Body: `JSON` (nicht "Using Fields Below") ✅
- [ ] JSON Body Expression-Modus aktiviert ({{ }} Button) ✅
- [ ] JSON Body Expression eingetragen ✅
- [ ] Save geklickt ✅

---

## 🧪 Nach der Korrektur testen

1. **Workflow speichern** (oben rechts)
2. **"Execute Workflow"** klicken
3. **Test Data eingeben:**
   - **agentId:** `marketing`
   - **message:** `Test`
4. **Execute** klicken
5. **Erwartung:**
   - ✅ Alle Nodes werden grün
   - ✅ Nachricht erscheint in Mattermost Channel `#tech`

---

## ⚠️ Wichtig

**Nach dem Wechsel von "Using Fields Below" zu "JSON":**
- Die "Body Parameters" Felder verschwinden (das ist normal!)
- Stattdessen erscheint das "JSON Body" Feld
- Dort muss die Expression eingetragen werden

---

**Status:** 🔧 **Sofort-Fix Anleitung erstellt!**
