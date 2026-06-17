# ✅ Mailchimp API Key eingebaut

**Stand:** 16.12.2025

**API Key eingebaut:**
- ✅ Mailchimp API Key: `YOUR_MAILCHIMP_API_KEY`
- ✅ Data Center: `us21`

---

## ⚠️ Noch fehlend

**Du musst noch eintragen:**

1. **List ID** → Ersetze `PLATZHALTER_LIST_ID` im Workflow
2. **N8N_API_KEY** → Ersetze `PLATZHALTER_N8N_API_KEY` im Workflow

---

## 📋 Schritt 1: List ID finden

1. **Mailchimp öffnen:** https://mailchimp.com
2. **Audience** → **All contacts**
3. **Settings** → **Audience name and defaults**
4. **Audience ID** kopieren (z.B. `a1b2c3d4e5`)

---

## 📋 Schritt 2: N8N_API_KEY setzen

### Option A: Neuen Key generieren

**Auf Server:**
```bash
ssh root@138.199.237.34
cd /opt/mcp-connection-key

# Key generieren
N8N_KEY=$(openssl rand -hex 32)
echo "N8N_API_KEY=$N8N_KEY" >> .env

# Key anzeigen
echo "N8N_API_KEY=$N8N_KEY"
```

**⚠️ WICHTIG:** Notiere dir den Key!

---

### Option B: Bestehenden Key verwenden

**Falls du bereits einen N8N_API_KEY hast:**
- Verwende diesen

---

## 📋 Schritt 3: Workflow anpassen

**Datei:** `n8n-workflows/mailchimp-api-sync-with-keys.json`

**Ersetze:**
1. `PLATZHALTER_LIST_ID` → Deine List ID
2. `PLATZHALTER_N8N_API_KEY` → Dein N8N_API_KEY

**Oder:** Öffne den Workflow in n8n und passe die Werte direkt an.

---

## 📥 Workflow importieren

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Workflows** → **"+"** → **"Import from File"**
3. **Datei auswählen:** `n8n-workflows/mailchimp-api-sync-with-keys.json`
4. **Import** klicken
5. **Workflow öffnen**
6. **"Get Mailchimp Members" Node** öffnen
7. **URL anpassen:** Ersetze `PLATZHALTER_LIST_ID` mit deiner List ID
8. **"Send to ConnectionKey API" Node** öffnen
9. **Authorization Header anpassen:** Ersetze `PLATZHALTER_N8N_API_KEY` mit deinem N8N_API_KEY
10. **"Active" Toggle** aktivieren

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
curl -X GET "https://us21.api.mailchimp.com/3.0/lists/DEINE_LIST_ID/members?status=subscribed&count=10" \
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

## 🔒 Sicherheit: Später auf Environment Variables umstellen

**Aktuell:** API Key ist direkt im Workflow (funktioniert sofort)

**Später (empfohlen):** Environment Variables nutzen

**Schritte:**
1. **n8n** → **Settings** → **Environment Variables**
2. **Add Variable:**
   - `MAILCHIMP_API_KEY` = `YOUR_MAILCHIMP_API_KEY`
   - `MAILCHIMP_DC` = `us21`
   - `MAILCHIMP_LIST_ID` = Deine List ID
   - `N8N_API_KEY` = Dein N8N_API_KEY
3. **Workflow anpassen:** Nutze `{{ $env.MAILCHIMP_API_KEY }}` statt direktem Key
4. **Workflow:** `mailchimp-api-sync.json` (ohne Keys) verwenden

---

## 📊 Zusammenfassung

**Eingebaut:**
- ✅ Mailchimp API Key: `YOUR_MAILCHIMP_API_KEY`
- ✅ Data Center: `us21`

**Noch zu tun:**
- ⏳ List ID eintragen
- ⏳ N8N_API_KEY eintragen
- ⏳ Workflow importieren
- ⏳ Testen

---

**Status:** ✅ **API Key eingebaut - List ID und N8N_API_KEY noch eintragen!**
