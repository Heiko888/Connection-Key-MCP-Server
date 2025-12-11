# 🤖 Agenten: Aktivierung & Konfiguration

**Status:** System funktioniert ✅ → Jetzt Automatisierung konfigurieren

---

## 🎯 Wann nimmt der Agent seine Aufgabe auf?

### 1. **Manuell (sofort aktiv)**

**Trigger:** User-Aktion im Frontend

**Beispiel:**
- User öffnet `/coach/agents/marketing`
- User gibt Nachricht ein: "Erstelle 5 Social Media Posts"
- User klickt "Senden"
- **→ Agent wird sofort aufgerufen**

**Flow:**
```
Frontend → /api/agents/marketing → MCP Server (Port 7000) → Marketing Agent
```

**Status:** ✅ **Bereits funktionsfähig!**

---

### 2. **Automatisch via n8n Webhook (Event-basiert)**

**Trigger:** Externe Events (z.B. Mailchimp, User-Registrierung)

**Beispiel:**
- Neuer Mailchimp-Abonnent
- **→ Mailchimp sendet Webhook an n8n**
- **→ n8n Workflow startet**
- **→ Agent wird aufgerufen**

**Flow:**
```
Mailchimp → n8n Webhook → n8n Workflow → Agent → Mattermost
```

**Status:** ⚠️ **Workflow erstellt, muss aktiviert werden**

**Aktivierung:**
1. n8n öffnen: `https://n8n.werdemeisterdeinergedankenagent.de`
2. Workflow `mailchimp-subscriber.json` importieren
3. Workflow aktivieren (Active = GRÜN)

---

### 3. **Automatisch via n8n Schedule (zeitgesteuert)**

**Trigger:** Zeitplan (z.B. täglich 9:00)

**Beispiel:**
- Täglich um 9:00 Uhr
- **→ n8n Schedule-Trigger startet**
- **→ Marketing Agent wird aufgerufen**
- **→ Content wird generiert**

**Flow:**
```
n8n Schedule (9:00) → Marketing Agent → Social-YouTube Agent → Mattermost
```

**Status:** ⚠️ **Workflow erstellt, muss aktiviert werden**

**Aktivierung:**
1. n8n öffnen
2. Workflow `mattermost-scheduled-reports.json` importieren
3. Schedule-Trigger konfigurieren (z.B. `0 9 * * *` = täglich 9:00)
4. Workflow aktivieren

---

### 4. **Automatisch via Supabase Trigger (Event-basiert)**

**Trigger:** Datenbank-Event (z.B. User-Registrierung)

**Beispiel:**
- Neuer User registriert sich
- **→ Supabase Trigger feuert**
- **→ n8n Webhook wird aufgerufen**
- **→ Reading Agent generiert Welcome Reading**

**Flow:**
```
Supabase Trigger → n8n Webhook → Reading Agent → Supabase (speichern)
```

**Status:** ⚠️ **Migration erstellt, muss ausgeführt werden**

**Aktivierung:**
1. Supabase Migration ausführen: `008_user_registration_trigger.sql`
2. n8n Workflow `user-registration-reading.json` aktivieren

---

## 📋 Was noch zu konfigurieren ist

### ✅ Bereits konfiguriert

1. **Backend Agenten**
   - ✅ MCP Server läuft (Port 7000)
   - ✅ Reading Agent läuft (Port 4001)
   - ✅ Alle 6 Agenten funktionieren

2. **Frontend API Routes**
   - ✅ Alle 6 API Routes funktionieren
   - ✅ Frontend kann Agenten aufrufen

3. **n8n Workflows (Basis)**
   - ✅ 8 Workflows aktiviert
   - ✅ Webhooks funktionieren

---

### ⚠️ Noch zu konfigurieren

#### 1. Scheduled Automatisierungen (Zeitgesteuert)

**Was:** Agenten sollen automatisch zu bestimmten Zeiten arbeiten

**Beispiele:**
- Täglich 9:00: Marketing-Content generieren
- Wöchentlich Montag: Newsletter erstellen
- Täglich 18:00: Tageszusammenfassung

**Konfiguration:**
1. n8n öffnen
2. Workflow `mattermost-scheduled-reports.json` öffnen
3. Schedule-Trigger konfigurieren:
   - **Cron:** `0 9 * * *` (täglich 9:00)
   - **Timezone:** Europe/Berlin
4. Workflow aktivieren

**Status:** ⚠️ **Workflow erstellt, muss aktiviert werden**

---

#### 2. Event-basierte Automatisierung (Event-Trigger)

**Was:** Agenten sollen auf Events reagieren

**Beispiele:**
- User-Registrierung → Welcome Reading generieren
- Neuer Mailchimp-Abonnent → Willkommens-E-Mail
- Chart-Berechnung → n8n Webhook → Agent

**Konfiguration:**

**A) User-Registrierung → Reading:**
1. Supabase Migration ausführen: `integration/supabase/migrations/008_user_registration_trigger.sql`
2. n8n Workflow `user-registration-reading.json` aktivieren

**B) Mailchimp → Agent:**
1. n8n Workflow `mailchimp-subscriber.json` aktivieren
2. Mailchimp Webhook in Mailchimp konfigurieren

**Status:** ⚠️ **Workflows erstellt, müssen aktiviert werden**

---

#### 3. Environment Variables (falls noch nicht gesetzt)

**Was:** Wichtige Konfigurationswerte

**Prüfen:**
```bash
# Auf dem Server
cd /opt/mcp-connection-key
cat .env | grep -E "(OPENAI_API_KEY|MCP_SERVER_URL|N8N_API_KEY|SUPABASE)"
```

**Falls fehlend:**
```bash
# MCP_SERVER_URL (für Frontend API Routes)
echo "MCP_SERVER_URL=http://138.199.237.34:7000" >> .env

# OPENAI_API_KEY (für Agenten)
echo "OPENAI_API_KEY=sk-..." >> .env

# N8N_API_KEY (für n8n Integration)
echo "N8N_API_KEY=..." >> .env

# Supabase (für Reading-Speicherung)
echo "NEXT_PUBLIC_SUPABASE_URL=..." >> .env
echo "SUPABASE_SERVICE_ROLE_KEY=..." >> .env
```

**Status:** ⚠️ **Prüfen und ggf. setzen**

---

#### 4. Supabase Konfiguration (für Reading-Speicherung)

**Was:** Supabase für Reading-Persistenz

**Konfiguration:**
1. Supabase Migrationen ausführen:
   ```bash
   cd integration/supabase/migrations
   # Migrationen in Supabase Dashboard ausführen
   ```

2. Environment Variables setzen:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=xxx
   ```

**Status:** ⚠️ **Prüfen und ggf. konfigurieren**

---

## 🚀 Schnellstart: Agenten automatisch arbeiten lassen

### Option 1: Tägliche Content-Generierung (5 Min)

**Ziel:** Marketing Agent generiert täglich um 9:00 Content

**Schritte:**
1. n8n öffnen: `https://n8n.werdemeisterdeinergedankenagent.de`
2. Workflow `mattermost-scheduled-reports.json` importieren
3. Schedule-Trigger öffnen
4. Cron setzen: `0 9 * * *` (täglich 9:00)
5. Workflow aktivieren (Active = GRÜN)

**Fertig!** Agent arbeitet täglich automatisch.

---

### Option 2: User-Registrierung → Reading (10 Min)

**Ziel:** Bei User-Registrierung automatisch Welcome Reading generieren

**Schritte:**
1. Supabase Migration ausführen:
   ```sql
   -- integration/supabase/migrations/008_user_registration_trigger.sql
   ```

2. n8n Workflow `user-registration-reading.json` aktivieren

**Fertig!** Reading wird automatisch bei Registrierung generiert.

---

### Option 3: Mailchimp → Agent (5 Min)

**Ziel:** Bei neuem Mailchimp-Abonnent Agent benachrichtigen

**Schritte:**
1. n8n Workflow `mailchimp-subscriber.json` aktivieren
2. Mailchimp Webhook konfigurieren (in Mailchimp Dashboard)

**Fertig!** Agent wird bei neuem Abonnent benachrichtigt.

---

## 📊 Übersicht: Agent-Aktivierung

| Aktivierung | Status | Trigger | Beispiel |
|-------------|--------|---------|----------|
| **Manuell** | ✅ Aktiv | User-Aktion | Frontend-Formular |
| **n8n Webhook** | ⚠️ Erstellt | Externe Events | Mailchimp, User-Reg |
| **n8n Schedule** | ⚠️ Erstellt | Zeitplan | Täglich 9:00 |
| **Supabase Trigger** | ⚠️ Erstellt | DB-Event | User-Registrierung |

---

## ✅ Checkliste: Was noch zu tun ist

### Sofort (5-10 Min)

- [ ] **Scheduled Reports aktivieren**
  - Workflow: `mattermost-scheduled-reports.json`
  - Schedule: Täglich 9:00
  - Status: Aktivieren

- [ ] **Environment Variables prüfen**
  - `MCP_SERVER_URL` gesetzt?
  - `OPENAI_API_KEY` gesetzt?
  - `N8N_API_KEY` gesetzt?

---

### Diese Woche (15-30 Min)

- [ ] **User-Registrierung → Reading**
  - Supabase Migration ausführen
  - n8n Workflow aktivieren

- [ ] **Mailchimp → Agent**
  - n8n Workflow aktivieren
  - Mailchimp Webhook konfigurieren

- [ ] **Supabase Konfiguration**
  - Migrationen ausführen
  - Environment Variables setzen

---

## 🎯 Zusammenfassung

**Was funktioniert:**
- ✅ Agenten laufen und antworten
- ✅ Frontend kann Agenten aufrufen
- ✅ n8n Workflows funktionieren

**Was noch zu konfigurieren ist:**
- ⚠️ Scheduled Automatisierungen aktivieren
- ⚠️ Event-basierte Automatisierung aktivieren
- ⚠️ Environment Variables prüfen
- ⚠️ Supabase Konfiguration prüfen

**Wann Agenten aktiv werden:**
1. **Jetzt:** Manuell via Frontend ✅
2. **Nach Konfiguration:** Automatisch via n8n Schedule ⚠️
3. **Nach Konfiguration:** Automatisch via Events ⚠️

---

**🎯 Nächster Schritt: Scheduled Automatisierung aktivieren!** 🚀
