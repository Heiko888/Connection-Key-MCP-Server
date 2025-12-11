# 🔍 n8n Verbindung prüfen

**Datum:** 17.12.2025

**Status:** Prüfung der n8n API-Verbindung

---

## 🚀 Schnellprüfung auf dem Server

**Auf dem Server ausführen:**

```bash
cd /opt/mcp-connection-key
chmod +x test-n8n-connection.sh
./test-n8n-connection.sh
```

**Das Skript prüft:**
- ✅ Ist n8n erreichbar?
- ✅ Funktioniert ein Webhook?
- ✅ Ist N8N_API_KEY in .env gesetzt?
- ✅ Funktioniert Mailchimp Workflow (mit N8N_API_KEY)?

---

## 📋 Manuelle Prüfung

### 1. n8n erreichbar?

```bash
curl -I https://n8n.werdemeisterdeinergedankenagent.de
```

**Erwartung:**
- ✅ HTTP 200, 401, oder 302 (n8n ist erreichbar)

---

### 2. Webhook funktioniert?

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/user-registered \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","birthDate":"1990-01-01","birthTime":"12:00","birthPlace":"Berlin"}'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response: `{"message":"Workflow was started"}`

**Falls 404:**
- ❌ Workflow nicht aktiviert → In n8n aktivieren

---

### 3. N8N_API_KEY prüfen

```bash
cd /opt/mcp-connection-key
grep "N8N_API_KEY" .env
```

**Erwartung:**
- ✅ Nur EINE Zeile mit `N8N_API_KEY=...`

**Falls mehrfach:**
- ❌ Doppelten Key entfernen (siehe `N8N_API_KEY_DOPPELT_FIX.md`)

---

### 4. Mailchimp Workflow testen (mit N8N_API_KEY)

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
- ✅ Response: `{"message":"Workflow was started"}`

**Falls 401/403:**
- ❌ N8N_API_KEY ist nicht in n8n Environment Variables gesetzt
- ❌ Oder falscher Key

**Falls 404:**
- ❌ Workflow nicht aktiviert → In n8n aktivieren

---

## 🔧 Häufige Probleme

### Problem 1: n8n nicht erreichbar

**Symptom:** HTTP Timeout oder Connection Refused

**Lösung:**
- Prüfe ob n8n Container läuft: `docker ps | grep n8n`
- Prüfe n8n Logs: `docker logs n8n`
- Prüfe Firewall/Ports

---

### Problem 2: Webhook 404

**Symptom:** `{"code":404,"message":"This webhook is not registered..."}`

**Lösung:**
1. n8n öffnen: `https://n8n.werdemeisterdeinergedankenagent.de`
2. Workflow öffnen
3. "Active" Toggle = GRÜN
4. Webhook Trigger prüfen (HTTP Method = POST)

---

### Problem 3: Mailchimp Workflow 401/403

**Symptom:** Authorization-Fehler

**Lösung:**
1. n8n öffnen: `https://n8n.werdemeisterdeinergedankenagent.de`
2. Settings → Environment Variables
3. Prüfe: Ist `N8N_API_KEY` eingetragen?
4. Falls nicht → Key aus `.env` kopieren und eintragen
5. Save

---

## ✅ Checkliste

- [ ] n8n ist erreichbar
- [ ] Webhook funktioniert (HTTP 200)
- [ ] N8N_API_KEY in .env (nur EINE Zeile)
- [ ] N8N_API_KEY in n8n Environment Variables
- [ ] Mailchimp Workflow funktioniert (HTTP 200)

---

**🔍 Führe das Prüfskript aus!** 🚀
