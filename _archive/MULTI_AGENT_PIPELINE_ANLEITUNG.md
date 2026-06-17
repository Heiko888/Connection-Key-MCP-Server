# 🤖 Multi-Agent Content Pipeline - Komplette Anleitung

**Workflow:** Marketing → Social-YouTube → Automation

**Datei:** `n8n-workflows/multi-agent-pipeline.json`

---

## 📋 Workflow-Übersicht

Der Multi-Agent Pipeline Workflow verbindet drei Agenten in einer Sequenz:

1. **Marketing Agent** - Erstellt Marketing-Strategie
2. **Social-YouTube Agent** - Erstellt Social Media Content basierend auf der Strategie
3. **Automation Agent** - Erstellt n8n Workflow für automatische Content-Verteilung

---

## 🚀 Workflow aktivieren

### Schritt 1: Workflow in n8n öffnen

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Workflow finden:** "Multi-Agent Content Pipeline"
3. **Workflow öffnen** (klicken)

---

### Schritt 2: URLs korrigieren (falls nötig)

**Für jeden HTTP Request Node:**

1. **Node öffnen** (doppelklicken)
2. **URL prüfen und korrigieren:**

   **Marketing Agent:**
   ```
   http://138.199.237.34:7000/agent/marketing
   ```

   **Social-YouTube Agent:**
   ```
   http://138.199.237.34:7000/agent/social-youtube
   ```

   **Automation Agent:**
   ```
   http://138.199.237.34:7000/agent/automation
   ```

3. **Body Parameters prüfen:**

   **Marketing Agent:**
   - Name: `message`
   - Value: `={{ $json.body.topic ? 'Erstelle Marketing-Strategie für: ' + $json.body.topic : 'Erstelle Marketing-Strategie' }}`

   **Social-YouTube Agent:**
   - Name: `message`
   - Value: `={{ 'Erstelle Social Media Content basierend auf dieser Strategie: ' + $json.response }}`

   **Automation Agent:**
   - Name: `message`
   - Value: `Erstelle n8n Workflow für automatische Content-Verteilung`

4. **Save** klicken

---

### Schritt 3: Workflow aktivieren

1. **Workflow speichern** (Ctrl+S oder Save Button)
2. **"Active" Toggle** aktivieren (oben rechts)
3. ✅ **Workflow wird GRÜN**
4. **Prüfen:** Keine roten Markierungen

---

## 🧪 Workflow testen

### Schritt 1: Webhook-URL kopieren

1. **Webhook Trigger Node** öffnen
2. **"Test URL"** kopieren
   - Format: `https://n8n.werdemeisterdeinergedankenagent.de/webhook/content-pipeline`

---

### Schritt 2: Test-Request senden

**Mit curl:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/content-pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Human Design Manifestation"
  }'
```

**Oder ohne Topic:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/content-pipeline \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

### Schritt 3: Ergebnis prüfen

**In n8n:**
1. **Workflow öffnen**
2. **"Executions" Tab** (unten)
3. **Ausführung öffnen**
4. **Jeden Node prüfen:**
   - Marketing Agent: Sollte Marketing-Strategie zurückgeben
   - Social-YouTube Agent: Sollte Social Media Content zurückgeben
   - Automation Agent: Sollte n8n Workflow zurückgeben
   - Respond to Webhook: Sollte alle Ergebnisse zusammenfassen

---

## 📊 Workflow-Ablauf

```
1. Webhook Trigger
   ↓ (POST Request empfangen)
2. Marketing Agent
   ↓ (Marketing-Strategie generiert)
3. Social-YouTube Agent
   ↓ (Social Media Content generiert)
4. Automation Agent
   ↓ (n8n Workflow generiert)
5. Respond to Webhook
   ↓ (Alle Ergebnisse zurückgeben)
```

---

## 🔧 Troubleshooting

### Problem: Workflow bleibt inaktiv

**Lösung:**
1. Alle Nodes prüfen (rote Markierungen?)
2. URLs korrigieren
3. Expressions korrigieren
4. Save klicken
5. Erneut aktivieren

---

### Problem: "URL is required"

**Lösung:**
1. HTTP Request Node öffnen
2. URL-Feld prüfen
3. Korrekte URL eintragen
4. Save klicken

---

### Problem: Expression-Fehler

**Lösung:**
1. Node öffnen
2. Expression prüfen
3. Korrekte Syntax verwenden: `={{ ... }}`
4. Save klicken

---

### Problem: Agent antwortet nicht

**Lösung:**
1. Prüfe ob MCP Server läuft: `http://138.199.237.34:7000`
2. Prüfe ob Agent verfügbar ist
3. Teste Agent direkt:
   ```bash
   curl -X POST http://138.199.237.34:7000/agent/marketing \
     -H "Content-Type: application/json" \
     -d '{"message": "Test"}'
   ```

---

## ✅ Checkliste

- [ ] Workflow in n8n importiert
- [ ] Alle URLs korrekt eingetragen
- [ ] Alle Expressions korrekt
- [ ] Workflow gespeichert
- [ ] Workflow aktiviert (grün)
- [ ] Webhook-URL kopiert
- [ ] Test-Request gesendet
- [ ] Ergebnis geprüft

---

## 🎯 Verwendung

**Der Workflow kann aufgerufen werden von:**

1. **Frontend (Next.js):**
   ```typescript
   const response = await fetch('https://n8n.werdemeisterdeinergedankenagent.de/webhook/content-pipeline', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ topic: 'Human Design' })
   });
   ```

2. **Andere n8n Workflows:**
   - HTTP Request Node → Webhook-URL aufrufen

3. **Externe Systeme:**
   - Jede HTTP-Client kann den Webhook aufrufen

---

**Status:** ✅ Multi-Agent Pipeline Workflow bereit!

