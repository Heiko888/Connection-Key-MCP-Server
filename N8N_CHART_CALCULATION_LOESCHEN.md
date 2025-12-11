# 🗑️ Chart Calculation Workflow löschen - Anleitung

**Option A:** "Chart Calculation - Human Design" (ohne Swiss Ephemeris) löschen

**Grund:** 
- Swiss Ephemeris Version ist präziser
- Beide nutzen denselben Webhook-Pfad (`/webhook/chart-calculation`)
- Nur eine Version sollte aktiv sein

---

## 📋 Schritt-für-Schritt: Workflow löschen

### Schritt 1: n8n öffnen

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Einloggen** mit Ihren Credentials

---

### Schritt 2: Workflow finden

1. **Workflows** öffnen (linke Seitenleiste)
2. **Suche:** "Chart Calculation - Human Design"
3. **WICHTIG:** Nicht "Chart Calculation - Human Design (Swiss Ephemeris)" löschen!
4. **Zu löschender Workflow:** "Chart Calculation - Human Design" (ohne "(Swiss Ephemeris)")

**Identifikation:**
- ❌ **Löschen:** "Chart Calculation - Human Design" (11 Dec, vermutlich Inactive)
- ✅ **Behalten:** "Chart Calculation - Human Design (Swiss Ephemeris)" (11 Dec, Active)

---

### Schritt 3: Workflow löschen

1. **Workflow öffnen** (klicken auf "Chart Calculation - Human Design")
2. **Drei-Punkte-Menü** (oben rechts) → **Delete** oder **Archive**
3. **Bestätigen** (falls gefragt)

**ODER:**

1. **Workflow-Liste** öffnen
2. **Hover** über "Chart Calculation - Human Design"
3. **Drei-Punkte-Menü** → **Delete**
4. **Bestätigen**

---

### Schritt 4: Verifizierung

1. **Workflows** Liste prüfen
2. **Erwartung:**
   - ❌ "Chart Calculation - Human Design" → **NICHT mehr vorhanden**
   - ✅ "Chart Calculation - Human Design (Swiss Ephemeris)" → **Noch vorhanden** (Active)

---

## ✅ Checkliste

**Vor dem Löschen:**
- [ ] n8n geöffnet ✅
- [ ] Richtigen Workflow identifiziert ✅
  - [ ] "Chart Calculation - Human Design" (ohne Swiss Ephemeris) ✅
  - [ ] NICHT "Chart Calculation - Human Design (Swiss Ephemeris)" ✅

**Löschen:**
- [ ] Workflow geöffnet ✅
- [ ] Drei-Punkte-Menü → Delete ✅
- [ ] Bestätigt ✅

**Nach dem Löschen:**
- [ ] "Chart Calculation - Human Design" gelöscht ✅
- [ ] "Chart Calculation - Human Design (Swiss Ephemeris)" noch vorhanden ✅
- [ ] Webhook-Konflikt behoben ✅

---

## ⚠️ Wichtige Hinweise

### Nicht löschen!

**Diese Workflows NICHT löschen:**
- ✅ "Chart Calculation - Human Design (Swiss Ephemeris)" (Active)
- ✅ "Multi-Agent Content Pipeline" (Active)
- ✅ "Get New Subscribers" (ist Node, nicht Workflow)

### Webhook-Pfad

**Nach dem Löschen:**
- ✅ Nur noch ein Workflow nutzt `/webhook/chart-calculation`
- ✅ "Chart Calculation - Human Design (Swiss Ephemeris)" (Active)
- ✅ Kein Konflikt mehr!

---

## 🧪 Test: Webhook funktioniert

**Nach dem Löschen testen:**

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/chart-calculation \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin"
  }'
```

**Erwartung:**
- ✅ Workflow wird ausgeführt
- ✅ Chart-Berechnung mit Swiss Ephemeris
- ✅ Response mit Chart-Daten

---

## ✅ Zusammenfassung

**Gelöscht:**
- ❌ "Chart Calculation - Human Design" (ohne Swiss Ephemeris)

**Behalten:**
- ✅ "Chart Calculation - Human Design (Swiss Ephemeris)" (Active)
- ✅ "Multi-Agent Content Pipeline" (Active)
- ✅ "Get New Subscribers" (ist Node, nicht Workflow)

**Ergebnis:**
- ✅ Webhook-Konflikt behoben
- ✅ Nur noch präzise Swiss Ephemeris Version aktiv
- ✅ Sauberer Zustand

---

**Status:** 🗑️ **Lösch-Anleitung erstellt!**
