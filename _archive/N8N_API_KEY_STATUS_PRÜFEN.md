# 🔍 N8N_API_KEY Status prüfen

**Datum:** 17.12.2025

**Status:** Key ist bereits gesetzt → Prüfung

---

## ✅ Schnellprüfung

**Auf dem Server ausführen:**

```bash
cd /opt/mcp-connection-key
chmod +x check-n8n-api-key.sh
./check-n8n-api-key.sh
```

**Das Skript prüft:**
- ✅ Ist `N8N_API_KEY` in `.env`?
- ✅ Ist Key nicht leer?
- ✅ Optional: Testet Mailchimp Workflow

---

## 📋 Manuelle Prüfung

### 1. In .env prüfen

```bash
cd /opt/mcp-connection-key
grep N8N_API_KEY .env
```

**Erwartung:**
```
N8N_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

### 2. In n8n Environment Variables prüfen

**Das ist der wichtigste Schritt!**

1. **n8n öffnen:**
   ```
   https://n8n.werdemeisterdeinergedankenagent.de
   ```

2. **Settings** → **Environment Variables**

3. **Prüfe:** Ist `N8N_API_KEY` in der Liste?

**✅ Falls ja:** Alles gut!

**❌ Falls nein:** Key eintragen (siehe unten)

---

## 🔧 Falls Key in n8n fehlt

**Auch wenn Key in `.env` ist, muss er in n8n Environment Variables sein!**

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Settings** → **Environment Variables**
3. **"Add Variable"** klicken
4. **Name:** `N8N_API_KEY`
5. **Value:** Key aus `.env` kopieren
   ```bash
   # Key aus .env holen
   grep N8N_API_KEY .env | cut -d= -f2
   ```
6. **"Save"** klicken

---

## 🧪 Test: Funktioniert der Key?

**Nachdem Key in n8n gesetzt ist:**

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
- ✅ Response: `{"success": true, "message": "Subscriber processed", ...}`
- ✅ Keine Authorization-Fehler (401/403)

**Falls 401/403:**
- ❌ Key ist nicht in n8n Environment Variables gesetzt
- ❌ Key ist falsch

---

## ✅ Checkliste

- [ ] `N8N_API_KEY` in `.env` vorhanden?
- [ ] `N8N_API_KEY` in n8n Environment Variables vorhanden?
- [ ] Mailchimp Workflow funktioniert? (Test)

---

## 🎯 Zusammenfassung

**Wichtig:** Der Key muss in BEIDEN Orten sein:
1. ✅ In `.env` (für Konsistenz)
2. ✅ In n8n Environment Variables (für Workflows)

**Workflows verwenden:** `{{ $env.N8N_API_KEY }}` → Das kommt aus n8n Environment Variables!

---

**🔍 Prüfe jetzt: Ist der Key auch in n8n Environment Variables?** 🚀
