# 🔍 Mailchimp Audience ID finden

**Problem:** Account angehalten, aber Audience ID sollte trotzdem sichtbar sein

---

## 📋 Methode 1: In Mailchimp Dashboard

**Auch bei angehaltenem Account sollte das funktionieren:**

1. **Mailchimp öffnen:** https://mailchimp.com
2. **Login** (auch bei angehaltenem Account möglich)
3. **Audience** → **All contacts** (links in der Sidebar)
4. **Settings** (oben rechts) → **Audience name and defaults**
5. **Scroll runter** → **Audience ID** steht dort (z.B. `a1b2c3d4e5`)

**Falls nicht sichtbar:**
- Versuche: **Audience** → **Settings** → **Audience settings and privacy**
- Oder: **Audience** → Klicke auf den Audience-Namen → **Settings**

---

## 📋 Methode 2: Über Mailchimp API (ohne Dashboard)

**Du kannst die List ID direkt über die API holen:**

```bash
# Ersetze mit deinem API Key
MAILCHIMP_API_KEY="YOUR_MAILCHIMP_API_KEY"

# Hole alle Listen
curl -X GET "https://us21.api.mailchimp.com/3.0/lists" \
  -H "Authorization: Bearer ${MAILCHIMP_API_KEY}"
```

**Response:**
```json
{
  "lists": [
    {
      "id": "a1b2c3d4e5",
      "name": "Deine Audience",
      "stats": { ... }
    }
  ]
}
```

**Die `id` ist deine List ID!**

---

## 📋 Methode 3: In der URL finden

**Falls du bereits in Mailchimp warst:**

1. **Audience öffnen** (auch bei angehaltenem Account)
2. **URL in der Adressleiste prüfen:**
   ```
   https://us21.admin.mailchimp.com/lists/members/?id=a1b2c3d4e5
   ```
3. **Die `id=` Parameter ist deine List ID!**

---

## 🚀 Schnelltest: API direkt nutzen

**Ich kann dir auch einen Workflow erstellen, der automatisch alle Listen holt:**

**Workflow: "Get Mailchimp Lists"**
- Ruft Mailchimp API auf
- Zeigt alle verfügbaren Listen mit IDs
- Du wählst die richtige aus

**Soll ich das erstellen?**

---

## ⚠️ Account angehalten

**Dein Account wurde am 06.11.25 angehalten.**

**Das bedeutet:**
- ❌ Keine neuen Kampagnen senden
- ❌ Keine neuen Veröffentlichungen
- ✅ API-Zugriff sollte noch funktionieren
- ✅ Audience ID sollte noch sichtbar sein

**Für unseren Workflow:**
- ✅ API Sync sollte funktionieren (nur lesen)
- ✅ Webhook sollte funktionieren (nur empfangen)

---

## 📋 Nächste Schritte

**Option A: Audience ID manuell finden**
1. Versuche Methode 1-3 oben
2. Sende mir die Audience ID
3. Ich baue sie ein

**Option B: API nutzen (automatisch)**
1. Sage mir Bescheid
2. Ich erstelle einen "Get Lists" Workflow
3. Der zeigt dir alle Listen mit IDs

---

**Status:** ⏳ **Warte auf Audience ID oder Bestätigung für "Get Lists" Workflow**
