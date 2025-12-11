# ✅ Mailchimp Workflow - Fast fertig!

**Stand:** 16.12.2025

**Eingebaut:**
- ✅ Mailchimp API Key: `YOUR_MAILCHIMP_API_KEY`
- ✅ Data Center: `us21`
- ✅ List ID: `24f162b4c6` (erste Liste)

**Gefundene Listen:**
1. `24f162b4c6` ← **Verwendet**
2. `7e931f6156`
3. `a28d7bfa03`
4. `ec2b0481d7`

**Falls du eine andere Liste nutzen willst:** Sag mir Bescheid!

---

## ⚠️ Noch fehlend: N8N_API_KEY

**Der Workflow benötigt noch den N8N_API_KEY für die ConnectionKey API.**

---

## 📋 N8N_API_KEY generieren

**Auf Server ausführen:**

```bash
cd /opt/mcp-connection-key

# Key generieren
N8N_KEY=$(openssl rand -hex 32)
echo "" >> .env
echo "# n8n API Key für externe API-Calls" >> .env
echo "N8N_API_KEY=$N8N_KEY" >> .env

# Key anzeigen (WICHTIG: Notieren!)
echo "=========================================="
echo "⚠️  WICHTIG: Notieren Sie sich diesen Key!"
echo "=========================================="
echo "N8N_API_KEY=$N8N_KEY"
echo "=========================================="
```

**⚠️ WICHTIG:** 
- Notiere dir den Key!
- Dieser Key muss auch in Next.js `.env.local` gesetzt sein!

---

## 📋 N8N_API_KEY in Workflow eintragen

**Option A: Ich baue ihn ein**
- Sende mir den N8N_API_KEY
- Ich baue ihn direkt in den Workflow ein

**Option B: Du trägst ihn in n8n ein**
1. Workflow importieren
2. "Send to ConnectionKey API" Node öffnen
3. Authorization Header: Ersetze `PLATZHALTER_N8N_API_KEY` mit deinem Key

---

## 📥 Workflow importieren

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Workflows** → **"+"** → **"Import from File"**
3. **Datei auswählen:** `n8n-workflows/mailchimp-api-sync-with-keys.json`
4. **Import** klicken
5. **Workflow öffnen**
6. **"Send to ConnectionKey API" Node** öffnen
7. **Authorization Header anpassen:** Ersetze `PLATZHALTER_N8N_API_KEY` mit deinem N8N_API_KEY
8. **"Active" Toggle** aktivieren

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

## 📊 Zusammenfassung

**Eingebaut:**
- ✅ Mailchimp API Key: `YOUR_MAILCHIMP_API_KEY`
- ✅ Data Center: `us21`
- ✅ List ID: `24f162b4c6`

**Noch zu tun:**
- ⏳ N8N_API_KEY generieren
- ⏳ N8N_API_KEY in Workflow eintragen
- ⏳ Workflow importieren
- ⏳ Testen

---

**Status:** ✅ **List ID eingebaut - N8N_API_KEY noch generieren und eintragen!**
