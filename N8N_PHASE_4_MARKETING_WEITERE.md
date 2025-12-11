# 🚀 Phase 4: Marketing & Weitere Workflows aktivieren

**Status:** Phase 1, 2 & 3 abgeschlossen ✅

**Ziel:** 2 weitere Workflows aktivieren

**Zeit:** 10 Minuten

---

## 📊 Phase 4: Marketing & Weitere

### 1. Daily Marketing Content

**Datei:** `n8n-workflows/daily-marketing-content.json`

**Zweck:**
- Tägliche Marketing-Content-Generierung
- Automatischer Schedule Trigger (täglich 9:00)
- Ruft Marketing Agent auf

**Schritte:**
1. n8n öffnen: `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Workflows** → **"+"** → **"Import from File"**
3. Datei: `n8n-workflows/daily-marketing-content.json`
4. **Import** klicken
5. **"Active" Toggle aktivieren** (GRÜN)

**Trigger:** Schedule (täglich 9:00) - automatisch!

**Hinweis:** Kein Webhook Trigger → kein HTTP Method nötig

**Manuell testen:**
- In n8n: Workflow öffnen → **"Execute Workflow"** Button klicken

---

### 2. Mailchimp Subscriber

**Datei:** `n8n-workflows/mailchimp-subscriber.json`

**Zweck:**
- Verarbeitet Mailchimp Webhooks für neue Subscriber
- Prüft ob `type: "subscribe"`
- Sendet an ConnectionKey API

**WICHTIG:** N8N_API_KEY prüfen!
- Workflow verwendet: `{{ $env.N8N_API_KEY }}`
- Falls Environment Variable nicht gesetzt → direkt eintragen: `0139efdef24110614ca2489077d2e786fd1d5e1cac1e22538d6adb68e6899d5c`

**Schritte:**
1. **Workflows** → **"+"** → **"Import from File"**
2. Datei: `n8n-workflows/mailchimp-subscriber.json`
3. **Import** klicken
4. **"Webhook Trigger" Node öffnen**
5. **HTTP Method auf POST prüfen/ändern** ⭐
6. **"Send to ConnectionKey API" Node öffnen**
7. **Authorization Header prüfen:**
   - Aktuell: `Bearer {{ $env.N8N_API_KEY }}`
   - Falls Environment Variable nicht funktioniert → direkt eintragen: `Bearer 0139efdef24110614ca2489077d2e786fd1d5e1cac1e22538d6adb68e6899d5c`
8. **"Active" Toggle aktivieren** (GRÜN)

**Webhook:** `/webhook/mailchimp-confirmed`

**Hinweis:** Mailchimp API Sync läuft bereits (`mailchimp-api-sync-with-keys.json`)

---

## 📋 Checkliste: Phase 4

- [ ] Daily Marketing Content importieren & aktivieren
- [ ] Mailchimp Subscriber importieren
- [ ] Mailchimp Subscriber: HTTP Method = POST
- [ ] Mailchimp Subscriber: N8N_API_KEY prüfen
- [ ] Mailchimp Subscriber aktivieren
- [ ] Beide Workflows testen

---

## 🧪 Tests

### 1. Daily Marketing Content

**Automatisch:** Läuft täglich um 9:00 Uhr

**Manuell testen:**
- In n8n: Workflow öffnen → **"Execute Workflow"** Button klicken

**Erwartung:**
- ✅ Marketing Agent wird aufgerufen
- ✅ Marketing Content wird generiert

---

### 2. Mailchimp Subscriber

**Test (simuliert Mailchimp Webhook):**

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed \
  -H "Content-Type: application/json" \
  -d '{
    "type": "subscribe",
    "data": {
      "email": "test@example.com",
      "merge_fields": {
        "FNAME": "Test",
        "LNAME": "User"
      }
    }
  }'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response: `{"success":true,"message":"Subscriber processed",...}`
- ✅ ConnectionKey API bekommt Subscriber-Daten

---

## 📊 Fortschritt

**Nach Phase 4:**
- ✅ 11 von 14 Workflows aktiviert (79%)
  - Phase 1 (Core): ✅ Abgeschlossen
  - Phase 2 (Mattermost): ✅ Abgeschlossen
  - Phase 3 (Reading): ✅ Abgeschlossen
  - Phase 4 (Marketing & Weitere): ✅ Abgeschlossen

**Noch aktiv:**
- ✅ Mailchimp API Sync (läuft bereits)

---

## ✅ Was wurde aktualisiert

**Phase 4 Workflows wurden aktualisiert:**
- `mailchimp-subscriber.json` → `httpMethod: "POST"` hinzugefügt
- `daily-marketing-content.json` → Kein Webhook Trigger (Schedule Trigger)

---

## ⚙️ Wichtige Hinweise

### N8N_API_KEY

**Mailchimp Subscriber Workflow verwendet:**
- `{{ $env.N8N_API_KEY }}` (Environment Variable)

**Falls Environment Variable nicht funktioniert:**
- Direkt eintragen: `Bearer 0139efdef24110614ca2489077d2e786fd1d5e1cac1e22538d6adb68e6899d5c`
- In "Send to ConnectionKey API" Node → Authorization Header

**N8N_API_KEY:**
```
0139efdef24110614ca2489077d2e786fd1d5e1cac1e22538d6adb68e6899d5c
```

---

## 🎯 Zusammenfassung

**Phase 4 Workflows:**
1. ✅ Daily Marketing Content (Schedule: täglich 9:00)
2. ✅ Mailchimp Subscriber (Webhook: `/webhook/mailchimp-confirmed`)

**Alle vorbereitet:**
- ✅ HTTP Methods auf POST gesetzt (bei Webhook Triggers)
- ✅ Workflows bereit zum Import

---

## 🚀 Quick Start

**Empfehlung: Starte mit Daily Marketing Content**

1. n8n öffnen
2. **Workflows** → **"+"** → **"Import from File"**
3. Datei: `n8n-workflows/daily-marketing-content.json`
4. **Import** klicken
5. **"Active" Toggle aktivieren** (GRÜN)
6. Fertig!

**Zeit:** 2 Minuten

---

**🎯 Starte jetzt mit Phase 4!**
