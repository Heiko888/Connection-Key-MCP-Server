# 📋 n8n Mattermost Workflows - JSON Bodies

**Kopierfertige JSON Body Expressions für alle 3 Mattermost Workflows**

---

## 📋 Workflow 1: "Agent → Mattermost Notification"

**Node:** "Send to Mattermost"

**Specify Body:** `JSON` wählen

**JSON Body (Expression-Modus):**
```
={{ JSON.stringify({ 
  text: '## 🤖 Agent-Antwort\n\n**Agent:** ' + $('Webhook Trigger').item.json.agentId + '\n**Anfrage:** ' + $('Webhook Trigger').item.json.message + '\n\n---\n\n' + $json.response, 
  channel: '#tech', 
  username: $('Webhook Trigger').item.json.agentId + ' Agent' 
}) }}
```

**WICHTIG:**
- ✅ Expression-Modus aktivieren ({{ }} Button)
- ✅ Expression beginnt mit `={{`
- ✅ Expression endet mit `}}`
- ✅ Strings in einfachen Anführungszeichen `'...'`

---

## 📋 Workflow 2: "Reading Generation → Mattermost"

**Node:** "Send to Mattermost"

**Specify Body:** `JSON` wählen

**JSON Body (Expression-Modus):**
```
={{ JSON.stringify({ 
  text: '## 🔮 Neues Reading generiert!\n\n**User:** ' + ($('Webhook Trigger').item.json.userId || 'Unbekannt') + '\n**Typ:** ' + ($('Webhook Trigger').item.json.readingType || 'detailed') + '\n**Geburtsdatum:** ' + $('Webhook Trigger').item.json.birthDate + '\n\n---\n\n' + ($json.reading || $json.reading_text || 'Reading generiert'), 
  channel: '#readings', 
  username: 'Reading Agent' 
}) }}
```

**WICHTIG:**
- ✅ Expression-Modus aktivieren ({{ }} Button)
- ✅ Expression beginnt mit `={{`
- ✅ Expression endet mit `}}`
- ✅ Strings in einfachen Anführungszeichen `'...'`

---

## 📋 Workflow 3: "Scheduled Agent Reports → Mattermost"

**Node:** "Send to Mattermost"

**Specify Body:** `JSON` wählen

**JSON Body (Expression-Modus):**
```
={{ JSON.stringify({ 
  text: '## 📢 Täglicher Marketing-Content generiert!\n\n**Zeit:** ' + $now + '\n\n---\n\n' + ($json.response || 'Content generiert'), 
  channel: '#marketing', 
  username: 'Marketing Agent' 
}) }}
```

**WICHTIG:**
- ✅ Expression-Modus aktivieren ({{ }} Button)
- ✅ Expression beginnt mit `={{`
- ✅ Expression endet mit `}}`
- ✅ Strings in einfachen Anführungszeichen `'...'`

---

## 📋 Zusätzlich: Marketing Agent Node Body

**Workflow 3:** "Scheduled Agent Reports → Mattermost"

**Node:** "Marketing Agent"

**Specify Body:** `JSON` wählen

**JSON Body (Expression-Modus):**
```
={{ JSON.stringify({ message: 'Erstelle 5 Social Media Posts für heute mit Themen: Manifestation, Energie, Human Design' }) }}
```

**WICHTIG:**
- ✅ Expression-Modus aktivieren ({{ }} Button)
- ✅ Expression beginnt mit `={{`
- ✅ Expression endet mit `}}`
- ✅ Strings in einfachen Anführungszeichen `'...'`

---

## ✅ Schritt-für-Schritt: JSON Body eintragen

### In n8n:

1. **Node öffnen** (z.B. "Send to Mattermost")
2. **Specify Body:** `JSON` wählen (aus Dropdown)
3. **JSON Body:** Expression-Modus aktivieren
   - **{{ }} Button** klicken (oben rechts im JSON Body Feld)
4. **Expression eintragen:**
   - Eine der obigen Expressions kopieren
   - In das JSON Body Feld einfügen
5. **Save** klicken

---

## ⚠️ Häufige Fehler

### Fehler 1: Expression-Modus nicht aktiviert

**Symptom:** "JSON parameter needs to be valid JSON"

**Lösung:**
- {{ }} Button klicken
- Expression-Modus aktivieren

---

### Fehler 2: Falsche Anführungszeichen

**Symptom:** Syntax-Fehler

**Lösung:**
- ✅ Einfache Anführungszeichen `'...'` verwenden
- ❌ Keine doppelten Anführungszeichen `"..."` innerhalb der Expression

---

### Fehler 3: Expression beginnt nicht mit `={{`

**Symptom:** Expression wird nicht ausgewertet

**Lösung:**
- Expression muss mit `={{` beginnen
- Expression muss mit `}}` enden

---

## ✅ Zusammenfassung

**Alle 3 JSON Bodies:**
- ✅ Workflow 1: Agent → Mattermost (Channel: `#tech`)
- ✅ Workflow 2: Reading → Mattermost (Channel: `#readings`)
- ✅ Workflow 3: Scheduled → Mattermost (Channel: `#marketing`)

**Zusätzlich:**
- ✅ Marketing Agent Node Body (Workflow 3)

**Alle sind kopierfertig und können direkt in n8n eingefügt werden!**

---

**Status:** 📋 **JSON Bodies dokumentiert!**
