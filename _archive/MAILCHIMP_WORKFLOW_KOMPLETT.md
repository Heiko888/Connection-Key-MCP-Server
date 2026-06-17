# ✅ Mailchimp Workflow - Komplett fertig!

**Stand:** 16.12.2025

**Alle Keys eingebaut:**
- ✅ Mailchimp API Key: `YOUR_MAILCHIMP_API_KEY`
- ✅ Data Center: `us21`
- ✅ List ID: `24f162b4c6`
- ✅ N8N_API_KEY: `YOUR_N8N_API_KEY`

---

## 📥 Workflow importieren

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Workflows** → **"+"** → **"Import from File"**
3. **Datei auswählen:** `n8n-workflows/mailchimp-api-sync-with-keys.json`
4. **Import** klicken
5. **Workflow öffnen**
6. **"Active" Toggle** aktivieren (muss GRÜN sein!)

---

## ✅ Testen

### Test 1: Workflow manuell ausführen

1. **Workflow öffnen**
2. **"Execute Workflow"** klicken
3. **Prüfe:** "Get Mailchimp Members" sollte Members zurückgeben
4. **Prüfe:** "Send to ConnectionKey API" sollte erfolgreich sein

---

### Test 2: API direkt testen

```bash
curl -X GET "https://us21.api.mailchimp.com/3.0/lists/24f162b4c6/members?status=subscribed&count=10" \
  -H "Authorization: Bearer YOUR_MAILCHIMP_API_KEY"
```

**Erwartung:**
```json
{
  "members": [
    {
      "email_address": "test@example.com",
      "status": "subscribed"
    }
  ]
}
```

---

## ⚙️ Workflow-Konfiguration

**Schedule:** Alle 6 Stunden (`0 */6 * * *`)

**Anpassen:**
- Täglich um 9:00: `0 9 * * *`
- Alle 12 Stunden: `0 */12 * * *`
- Stündlich: `0 * * * *`

**In n8n:**
1. "Schedule Trigger" Node öffnen
2. Cron Expression anpassen

---

## 📊 Was der Workflow macht

1. **Alle 6 Stunden:**
   - Ruft Mailchimp API auf
   - Holt alle subscribed Members aus Liste `24f162b4c6`
   - Transformiert Daten zu ConnectionKey Format
   - Sendet jeden Subscriber an `/api/new-subscriber`

---

## ⚠️ Wichtig: N8N_API_KEY auch in Next.js setzen

**Der N8N_API_KEY muss auch in Next.js `.env.local` gesetzt sein!**

**Auf Next.js Server (167.235.224.149):**
```bash
cd /opt/hd-app/The-Connection-Key/frontend

# In .env.local eintragen:
echo "N8N_API_KEY=YOUR_N8N_API_KEY" >> .env.local
```

**Oder manuell in `.env.local`:**
```bash
N8N_API_KEY=YOUR_N8N_API_KEY
```

**Dann Next.js neu starten:**
```bash
# Falls Docker:
docker-compose restart frontend

# Falls PM2:
pm2 restart frontend
```

---

## 🔒 Sicherheit: Später auf Environment Variables umstellen

**Aktuell:** Alle Keys sind direkt im Workflow (funktioniert sofort)

**Später (empfohlen):** Environment Variables nutzen

**Schritte:**
1. **n8n** → **Settings** → **Environment Variables**
2. **Add Variables:**
   - `MAILCHIMP_API_KEY` = `YOUR_MAILCHIMP_API_KEY`
   - `MAILCHIMP_DC` = `us21`
   - `MAILCHIMP_LIST_ID` = `24f162b4c6`
   - `N8N_API_KEY` = `YOUR_N8N_API_KEY`
3. **Workflow anpassen:** Nutze `{{ $env.MAILCHIMP_API_KEY }}` statt direktem Key
4. **Workflow:** `mailchimp-api-sync.json` (ohne Keys) verwenden

---

## 📊 Zusammenfassung

**Eingebaut:**
- ✅ Mailchimp API Key: `YOUR_MAILCHIMP_API_KEY`
- ✅ Data Center: `us21`
- ✅ List ID: `24f162b4c6`
- ✅ N8N_API_KEY: `YOUR_N8N_API_KEY`

**Nächste Schritte:**
- ✅ Workflow importieren
- ✅ Workflow aktivieren
- ⚠️ N8N_API_KEY in Next.js `.env.local` setzen
- ✅ Testen

---

**Status:** ✅ **Workflow komplett fertig - Alle Keys eingebaut!**
