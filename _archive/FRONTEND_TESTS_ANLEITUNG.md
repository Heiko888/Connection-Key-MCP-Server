# 🧪 Frontend-Tests Anleitung

**Status:** Backend & n8n Workflows funktionieren ✅

**Nächster Schritt:** Frontend-Seiten testen

---

## 📋 Zu testende Frontend-Seiten

### Agent-Seiten (5 Seiten)

1. **Marketing Agent**
   - URL: `/coach/agents/marketing`
   - Test: Formular ausfüllen, Agent-Antwort prüfen

2. **Sales Agent**
   - URL: `/coach/agents/sales`
   - Test: Formular ausfüllen, Agent-Antwort prüfen

3. **Social-YouTube Agent**
   - URL: `/coach/agents/social-youtube`
   - Test: Formular ausfüllen, Agent-Antwort prüfen

4. **Automation Agent**
   - URL: `/coach/agents/automation`
   - Test: Formular ausfüllen, Agent-Antwort prüfen

5. **Chart Development Agent**
   - URL: `/coach/agents/chart`
   - Test: Geburtsdaten eingeben, Chart-Berechnung prüfen

---

### Reading-Seite

6. **Reading Generator**
   - URL: `/reading/create` (oder ähnlich)
   - Test: Geburtsdaten eingeben, Reading generieren, Ergebnis prüfen

---

## 🚀 Test-Schritte

### Schritt 1: Next.js starten (falls nicht läuft)

```bash
# Auf dem Server oder lokal
cd /opt/mcp-connection-key/integration/frontend
npm run dev
```

**Oder prüfen, ob Next.js bereits läuft:**
- Frontend-URL öffnen (z.B. `https://ck-app.werdemeisterdeinergedanken.de`)

---

### Schritt 2: Agent-Seiten testen

**Für jede Agent-Seite:**

1. **Seite öffnen** (z.B. `/coach/agents/marketing`)
2. **Formular ausfüllen:**
   - Nachricht eingeben (z.B. "Erstelle 5 Social Media Posts über Manifestation")
   - User ID (falls erforderlich)
3. **"Senden" oder "Generieren" klicken**
4. **Prüfen:**
   - ✅ Formular wird gesendet
   - ✅ Loading-Indikator erscheint
   - ✅ Agent-Antwort wird angezeigt
   - ✅ Keine Fehler in der Console

---

### Schritt 3: Chart Development Agent testen

1. **Seite öffnen:** `/coach/agents/chart`
2. **Geburtsdaten eingeben:**
   - Geburtsdatum: `1990-01-01`
   - Geburtszeit: `12:00`
   - Geburtsort: `Berlin, Germany`
3. **"Chart berechnen" klicken**
4. **Prüfen:**
   - ✅ Chart-Daten werden berechnet
   - ✅ Chart wird angezeigt (falls Visualisierung vorhanden)
   - ✅ Keine Fehler

---

### Schritt 4: Reading Generator testen

1. **Seite öffnen:** `/reading/create` (oder ähnlich)
2. **Geburtsdaten eingeben:**
   - Geburtsdatum: `1990-01-01`
   - Geburtszeit: `12:00`
   - Geburtsort: `Berlin, Germany`
   - Reading-Typ: `detailed` (oder anderen Typ wählen)
3. **"Reading generieren" klicken**
4. **Prüfen:**
   - ✅ Reading wird generiert
   - ✅ Reading-Text wird angezeigt
   - ✅ Status-Updates werden angezeigt (falls vorhanden)
   - ✅ Keine Fehler

---

## ✅ Checkliste

### Agent-Seiten
- [ ] Marketing Agent Seite öffnet
- [ ] Marketing Agent Formular funktioniert
- [ ] Marketing Agent Antwort wird angezeigt
- [ ] Sales Agent Seite öffnet
- [ ] Sales Agent Formular funktioniert
- [ ] Sales Agent Antwort wird angezeigt
- [ ] Social-YouTube Agent Seite öffnet
- [ ] Social-YouTube Agent Formular funktioniert
- [ ] Social-YouTube Agent Antwort wird angezeigt
- [ ] Automation Agent Seite öffnet
- [ ] Automation Agent Formular funktioniert
- [ ] Automation Agent Antwort wird angezeigt
- [ ] Chart Development Agent Seite öffnet
- [ ] Chart Development Agent Formular funktioniert
- [ ] Chart Development Agent Antwort wird angezeigt

### Reading-Seite
- [ ] Reading Generator Seite öffnet
- [ ] Reading Generator Formular funktioniert
- [ ] Reading wird generiert
- [ ] Reading wird angezeigt

---

## 🔍 Fehlerbehebung

### Problem: Seite lädt nicht

**Prüfen:**
1. Next.js läuft? (`npm run dev` oder PM2 Status)
2. Port ist erreichbar? (z.B. `http://localhost:3000`)
3. Browser-Console auf Fehler prüfen

---

### Problem: Formular sendet nicht

**Prüfen:**
1. Browser-Console auf JavaScript-Fehler
2. Network-Tab: Wird Request gesendet?
3. API-Route existiert? (z.B. `/api/agents/marketing`)

---

### Problem: Agent-Antwort kommt nicht

**Prüfen:**
1. Backend Agent läuft? (Port 7000)
2. n8n Workflow aktiviert? (falls verwendet)
3. Network-Tab: Response-Status prüfen
4. Browser-Console auf Fehler

---

### Problem: Reading wird nicht generiert

**Prüfen:**
1. Reading Agent läuft? (Port 4001, PM2 Status)
2. API-Route `/api/reading/generate` existiert?
3. Network-Tab: Request/Response prüfen
4. Browser-Console auf Fehler

---

## 📊 Test-Ergebnisse dokumentieren

**Für jede Seite notieren:**
- ✅ Funktioniert
- ❌ Fehler (mit Fehlerbeschreibung)
- ⚠️ Teilweise (mit Details)

---

## 🎯 Nächste Schritte nach Frontend-Tests

**Wenn alle Tests erfolgreich:**
- ✅ System ist vollständig funktionsfähig
- ✅ Dokumentation aktualisieren
- ✅ Production-Deployment prüfen

**Wenn Tests fehlschlagen:**
- ❌ Fehler analysieren
- ❌ API-Routes prüfen
- ❌ Frontend-Komponenten prüfen
- ❌ Backend-Verbindungen prüfen

---

**Viel Erfolg beim Testen!** 🚀
