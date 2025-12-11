# ⚡ Mailchimp List ID holen (ohne jq)

**Problem:** `jq` nicht installiert

**Lösung:** Einfacher Befehl ohne jq

---

## 🚀 Einfacher Befehl (ohne jq)

**Führe diesen Befehl aus:**

```bash
curl -X GET "https://us21.api.mailchimp.com/3.0/lists" \
  -H "Authorization: Bearer YOUR_MAILCHIMP_API_KEY"
```

**Die Response zeigt alle Listen. Suche nach `"id":` in der Ausgabe!**

---

## 📋 Beispiel-Response

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

## 🔍 List ID finden

**In der Response suche nach:**
- `"id":` - Das ist deine List ID (z.B. `"a1b2c3d4e5"`)

**Oder nutze grep:**

```bash
curl -X GET "https://us21.api.mailchimp.com/3.0/lists" \
  -H "Authorization: Bearer YOUR_MAILCHIMP_API_KEY" | grep -o '"id":"[^"]*"'
```

**Das zeigt nur die IDs:**

```
"id":"a1b2c3d4e5"
```

---

## ✅ Sobald du die List ID hast

**Sende mir:**
- List ID (z.B. `a1b2c3d4e5`)
- N8N_API_KEY (falls vorhanden, sonst "neu generieren")

**Dann baue ich alles ein!**

---

**Status:** ⚡ **Führe den einfachen curl-Befehl aus und suche nach "id" in der Response!**
