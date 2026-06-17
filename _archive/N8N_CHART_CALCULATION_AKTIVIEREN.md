# 🚀 Chart Calculation Workflow aktivieren

**Problem:** `"This webhook is not registered for POST requests"`

**Ursache:** Workflow ist nicht importiert ODER nicht aktiviert ODER HTTP Method ist GET!

---

## ✅ Lösung in 3 Schritten

### Schritt 1: Workflow importieren

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Links:** Klicke auf **"Workflows"**
3. **Oben rechts:** Klicke auf **"+"** Button
4. **Dropdown:** Wähle **"Import from File"**
5. **Datei auswählen:** `n8n-workflows/chart-calculation-workflow-swisseph.json`
6. **"Import"** klicken

**Erwartung:**
- ✅ Workflow erscheint in der Liste
- ✅ Name: "Chart Calculation - Human Design (Swiss Ephemeris)"

---

### Schritt 2: HTTP Method auf POST prüfen/ändern ⭐

**WICHTIG:** Der Webhook Trigger muss POST akzeptieren!

1. **Workflow öffnen:** "Chart Calculation - Human Design (Swiss Ephemeris)"
2. **"Webhook Trigger" Node öffnen** (doppelklicken)
3. **"HTTP Method" Feld prüfen:**
   - Aktuell: `GET` (oder nicht gesetzt = Standard = GET)
   - **Ändern zu:** `POST` (aus Dropdown wählen)
4. **"Save"** klicken
5. **Workflow speichern**

**Erwartung:**
- ✅ Webhook Trigger zeigt jetzt "-POST-" statt "-GET-"
- ✅ POST Requests funktionieren jetzt!

---

### Schritt 3: Workflow aktivieren ⭐ KRITISCH!

**WICHTIG:** Ohne Aktivierung funktioniert der Webhook nicht!

1. **Oben rechts im Workflow-Editor:** Finde den **"Active" Toggle"
2. **Klicke auf "Active"** (oder den Toggle-Switch)
3. **Status sollte:** `Active` (GRÜN) werden

**Prüfen:**
- ✅ Toggle ist GRÜN
- ✅ Status zeigt "Active"
- ✅ Workflow-Liste zeigt "Active" Badge

**WICHTIG:** Ohne Aktivierung = 404 Fehler!

---

## 🧪 Testen

**Nach Aktivierung testen:**

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/chart-calculation \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-01-01",
    "birthTime": "12:00",
    "birthPlace": "Berlin, Germany"
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response: JSON mit Chart-Daten (Gates, Lines, Planets, etc.)
- ✅ Human Design Chart-Berechnung erfolgreich

---

## 📋 Was der Workflow macht

1. **Webhook Trigger** empfängt POST Request mit Geburtsdaten
2. **Calculate Chart (Swiss Ephemeris)** → Berechnet Human Design Chart
   - Verwendet vereinfachte Berechnung (Fallback)
   - Berechnet Gates, Lines, Planets
   - Erstellt Chart-Daten-Struktur
3. **Respond to Webhook** → Gibt Chart-Daten zurück

---

## ✅ Erfolgreiche Response

**Erwartetes JSON:**
```json
{
  "type": "Generator",
  "profile": "1/3",
  "authority": "Sacral",
  "strategy": "Wait to respond",
  "planets": {
    "sun": { "gate": 1, "line": 1, "longitude": 123.45 },
    "moon": { "gate": 2, "line": 2, "longitude": 234.56 },
    ...
  },
  "gates": {
    "defined": [1, 2, 3, ...],
    "undefined": [4, 5, 6, ...]
  },
  "birthDate": "1990-01-01",
  "birthTime": "12:00",
  "birthPlace": "Berlin, Germany",
  "calculatedAt": "2025-12-16T..."
}
```

---

## 📋 Checkliste

- [ ] n8n geöffnet
- [ ] Workflow importiert (`chart-calculation-workflow-swisseph.json`)
- [ ] Workflow geöffnet
- [ ] **HTTP Method auf POST geändert** ⭐
- [ ] **"Active" Toggle aktiviert (GRÜN)** ⭐
- [ ] Test erfolgreich

---

## 🎯 Wichtigste Punkte

1. **Workflow muss importiert sein** ✅
2. **HTTP Method muss POST sein** ⭐
3. **Workflow muss aktiviert sein** ⭐ (Active = GRÜN)
4. **Webhook-Pfad ist "chart-calculation"** ✅

**Ohne POST oder Aktivierung = 404 Fehler!**

---

## 🚀 Quick Fix

**Minimaler Aufwand:**

1. n8n öffnen
2. Workflows → "+" → Import from File
3. `chart-calculation-workflow-swisseph.json` auswählen
4. Import klicken
5. Workflow öffnen
6. **"Webhook Trigger" Node öffnen**
7. **HTTP Method: POST** wählen ⭐
8. **"Active" Toggle aktivieren** ⭐
9. Testen

**Das war's!** 🎉

---

## ✅ Workflow wurde bereits aktualisiert

**Datei:** `n8n-workflows/chart-calculation-workflow-swisseph.json`

**Änderung:**
- `"httpMethod": "POST"` wurde hinzugefügt

**Nächste Schritte:**
1. Workflow in n8n importieren
2. HTTP Method prüfen (sollte bereits POST sein)
3. Workflow aktivieren
4. Testen
