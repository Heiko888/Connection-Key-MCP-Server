# ⚡ Mailchimp List ID schnell holen

**Problem:** Account angehalten, Audience ID nicht gefunden

**Lösung:** Über API automatisch holen

---

## 🚀 Option 1: Direkt mit curl testen

**Führe diesen Befehl aus:**

```bash
curl -X GET "https://us21.api.mailchimp.com/3.0/lists" \
  -H "Authorization: Bearer YOUR_MAILCHIMP_API_KEY"
```

**Response zeigt alle Listen:**
```json
{
  "lists": [
    {
      "id": "a1b2c3d4e5",
      "name": "Deine Audience",
      "stats": {
        "member_count": 123
      }
    }
  ]
}
```

**Die `id` ist deine List ID!**

---

## 🚀 Option 2: n8n Workflow nutzen

**Ich habe einen Workflow erstellt:** `mailchimp-get-lists.json`

**So nutzt du ihn:**

1. **Workflow importieren:**
   - n8n → Workflows → Import from File
   - Datei: `mailchimp-get-lists.json`
   - Import

2. **Workflow aktivieren**

3. **Webhook aufrufen:**
   ```bash
   curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-get-lists
   ```

4. **Response zeigt alle Listen mit IDs:**
   ```json
   {
     "total_lists": 1,
     "lists": [
       {
         "id": "a1b2c3d4e5",
         "name": "Deine Audience",
         "member_count": 123
       }
     ],
     "message": "Verwende die \"id\" als MAILCHIMP_LIST_ID"
   }
   ```

---

## 📋 Schnelltest (empfohlen)

**Führe einfach diesen Befehl aus:**

```bash
curl -X GET "https://us21.api.mailchimp.com/3.0/lists" \
  -H "Authorization: Bearer YOUR_MAILCHIMP_API_KEY" | jq '.lists[] | {id: .id, name: .name}'
```

**Falls `jq` nicht installiert ist:**

```bash
curl -X GET "https://us21.api.mailchimp.com/3.0/lists" \
  -H "Authorization: Bearer YOUR_MAILCHIMP_API_KEY"
```

**Dann schaue nach `"id":` in der Response!**

---

## ✅ Sobald du die List ID hast

**Sende mir:**
- List ID (z.B. `a1b2c3d4e5`)
- N8N_API_KEY (falls vorhanden, sonst "neu generieren")

**Dann baue ich alles ein!**

---

**Status:** ⚡ **Teste den curl-Befehl und sende mir die List ID!**
