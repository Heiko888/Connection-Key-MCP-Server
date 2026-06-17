# 📧 Mailchimp API - Nutzung & Integration

**Stand:** 16.12.2025

**Du hast eine Mailchimp API - hier sind die Optionen:**

---

## 🎯 Zwei Möglichkeiten

### Option 1: Mailchimp Webhooks (bereits vorhanden)

**Wie es funktioniert:**
- Mailchimp sendet automatisch Webhooks, wenn jemand subscribed
- n8n empfängt Webhook → sendet an ConnectionKey API
- **Workflow:** `mailchimp-subscriber.json`

**Vorteile:**
- ✅ Echtzeit (sofort wenn jemand subscribed)
- ✅ Keine API-Calls nötig
- ✅ Automatisch

**Nachteile:**
- ❌ Nur bei Events (subscribe, unsubscribe, etc.)
- ❌ Keine Abfrage bestehender Subscriber

---

### Option 2: Mailchimp API (neu erstellt)

**Wie es funktioniert:**
- n8n ruft Mailchimp API auf (z.B. alle 6 Stunden)
- Holt alle subscribed Members
- Sendet an ConnectionKey API
- **Workflow:** `mailchimp-api-sync.json`

**Vorteile:**
- ✅ Kann bestehende Subscriber abfragen
- ✅ Vollständige Synchronisation
- ✅ Backup/Recovery möglich

**Nachteile:**
- ❌ Nicht Echtzeit (nur bei Schedule)
- ❌ Benötigt API Key

---

## 🚀 Option 2 Setup: Mailchimp API nutzen

### Schritt 1: Mailchimp API Key holen

1. **Mailchimp öffnen:** https://mailchimp.com
2. **Account** → **Extras** → **API keys**
3. **Create A Key** klicken
4. **API Key kopieren** (z.B. `abc123xyz-us1`)
5. **Data Center notieren** (z.B. `us1` aus `abc123xyz-us1`)

---

### Schritt 2: Mailchimp List ID finden

1. **Mailchimp** → **Audience** → **All contacts**
2. **Settings** → **Audience name and defaults**
3. **Audience ID** kopieren (z.B. `a1b2c3d4e5`)

---

### Schritt 3: Environment Variables in n8n setzen

**In n8n:**

1. **Settings** → **Environment Variables**
2. **Add Variable:**

   **Variable 1:**
   - **Name:** `MAILCHIMP_API_KEY`
   - **Value:** Dein Mailchimp API Key (z.B. `abc123xyz-us1`)

   **Variable 2:**
   - **Name:** `MAILCHIMP_DC`
   - **Value:** Dein Data Center (z.B. `us1`)

   **Variable 3:**
   - **Name:** `MAILCHIMP_LIST_ID`
   - **Value:** Deine List ID (z.B. `a1b2c3d4e5`)

   **Variable 4:**
   - **Name:** `N8N_API_KEY`
   - **Value:** Dein n8n API Key (für ConnectionKey API)

---

### Schritt 4: Workflow importieren

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Workflows** → **"+"** → **"Import from File"**
3. **Datei auswählen:** `n8n-workflows/mailchimp-api-sync.json`
4. **Import** klicken
5. **Workflow öffnen**
6. **"Active" Toggle** aktivieren

---

### Schritt 5: Schedule anpassen (optional)

**Standard:** Alle 6 Stunden (`0 */6 * * *`)

**Anpassen:**
1. **"Schedule Trigger" Node** öffnen
2. **Cron Expression ändern:**
   - Täglich um 9:00: `0 9 * * *`
   - Alle 12 Stunden: `0 */12 * * *`
   - Stündlich: `0 * * * *`

---

## ✅ Testen

### Test 1: Workflow manuell ausführen

1. **Workflow öffnen**
2. **"Execute Workflow"** klicken
3. **Prüfe:** "Get Mailchimp Members" Node sollte Members zurückgeben
4. **Prüfe:** "Send to ConnectionKey API" sollte erfolgreich sein

---

### Test 2: API direkt testen

```bash
# Ersetze mit deinen Werten:
MAILCHIMP_API_KEY="dein-api-key"
MAILCHIMP_DC="us1"
MAILCHIMP_LIST_ID="deine-list-id"

curl -X GET "https://${MAILCHIMP_DC}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members?status=subscribed&count=10" \
  -H "Authorization: Bearer ${MAILCHIMP_API_KEY}"
```

**Erwartung:**
```json
{
  "members": [
    {
      "email_address": "test@example.com",
      "status": "subscribed",
      "merge_fields": {
        "FNAME": "Test",
        "LNAME": "User"
      }
    }
  ]
}
```

---

## 📊 Vergleich: Webhook vs. API

| Feature | Webhook | API |
|---------|---------|-----|
| **Echtzeit** | ✅ Ja | ❌ Nein (nur bei Schedule) |
| **Bestehende Subscriber** | ❌ Nein | ✅ Ja |
| **Setup** | ✅ Einfach | ⚠️ API Key nötig |
| **Synchronisation** | ❌ Nur neue | ✅ Alle |
| **Backup** | ❌ Nein | ✅ Ja |

---

## 🎯 Empfehlung

**Beide nutzen:**

1. **Webhook Workflow** (`mailchimp-subscriber.json`)
   - Für neue Subscriber (Echtzeit)
   - Aktivieren ✅

2. **API Sync Workflow** (`mailchimp-api-sync.json`)
   - Für initiale Synchronisation
   - Für Backup/Recovery
   - Täglich einmal ausführen

---

## 🔧 Weitere Mailchimp API Workflows (optional)

### Workflow 3: Neuer Subscriber → Mailchimp hinzufügen

**Zweck:** Wenn jemand auf deiner Website subscribed, automatisch zu Mailchimp hinzufügen

**Workflow erstellen:**
1. **Webhook Trigger** → Path: `add-to-mailchimp`
2. **HTTP Request** → POST zu Mailchimp API
   - URL: `https://{{ $env.MAILCHIMP_DC }}.api.mailchimp.com/3.0/lists/{{ $env.MAILCHIMP_LIST_ID }}/members`
   - Body: `{ "email_address": "...", "status": "subscribed" }`

---

### Workflow 4: Mailchimp Segment Sync

**Zweck:** Bestimmte Mailchimp Segmente synchronisieren

**Workflow erstellen:**
1. **Schedule Trigger**
2. **HTTP Request** → GET Mailchimp Segments
3. **Loop** → Für jedes Segment Members holen
4. **Send to ConnectionKey API**

---

## 📋 Checkliste

**Für Mailchimp API Workflow:**

- [ ] Mailchimp API Key geholt ✅
- [ ] Data Center notiert ✅
- [ ] List ID gefunden ✅
- [ ] Environment Variables in n8n gesetzt ✅
- [ ] Workflow importiert ✅
- [ ] Workflow aktiviert ✅
- [ ] Test erfolgreich ✅

---

**Status:** ✅ **Mailchimp API Workflow erstellt!**
