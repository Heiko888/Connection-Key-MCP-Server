# ⚡ Mailchimp List ID direkt holen (ohne n8n)

**Problem:** Workflow noch nicht aktiv

**Lösung:** Direkt über Mailchimp API

---

## 🚀 Direkter API-Aufruf

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
      "id": "a1b2c3d4e5",  ← Das ist deine List ID!
      "name": "Deine Audience",
      "stats": {
        "member_count": 123
      }
    }
  ]
}
```

---

## 📋 Schöner formatiert (mit jq)

**Falls `jq` installiert ist:**

```bash
curl -X GET "https://us21.api.mailchimp.com/3.0/lists" \
  -H "Authorization: Bearer YOUR_MAILCHIMP_API_KEY" | \
  jq '.lists[] | {id: .id, name: .name, members: .stats.member_count}'
```

**Output:**
```json
{
  "id": "a1b2c3d4e5",
  "name": "Deine Audience",
  "members": 123
}
```

---

## ✅ Sobald du die List ID hast

**Sende mir:**
- List ID (z.B. `a1b2c3d4e5`)
- N8N_API_KEY (falls vorhanden, sonst "neu generieren")

**Dann baue ich alles in den Workflow ein!**

---

**Status:** ⚡ **Führe den curl-Befehl aus und sende mir die List ID!**
