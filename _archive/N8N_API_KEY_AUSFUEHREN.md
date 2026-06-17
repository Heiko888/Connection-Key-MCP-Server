# 🔑 N8N_API_KEY setzen - Ausführung

**Datum:** 17.12.2025

**Status:** Bereit zur Ausführung auf dem Server

---

## 🚀 Auf dem Server ausführen

### Schritt 1: Auf Server verbinden

```bash
ssh root@138.199.237.34
# Oder deine SSH-Verbindung
```

---

### Schritt 2: Ins Projektverzeichnis wechseln

```bash
cd /opt/mcp-connection-key
```

---

### Schritt 3: Skript ausführbar machen (falls noch nicht)

```bash
chmod +x set-n8n-api-key.sh
```

---

### Schritt 4: Skript ausführen

```bash
./set-n8n-api-key.sh
```

**Das Skript:**
- ✅ Prüft ob `N8N_API_KEY` bereits existiert
- ✅ Generiert neuen Key (falls nötig)
- ✅ Trägt Key in `.env` ein
- ✅ Zeigt Key an (⚠️ WICHTIG: Notieren!)

---

### Schritt 5: Key in n8n Environment Variables eintragen

**Nachdem das Skript gelaufen ist:**

1. **n8n öffnen:**
   ```
   https://n8n.werdemeisterdeinergedankenagent.de
   ```

2. **Settings** → **Environment Variables**

3. **"Add Variable"** klicken

4. **Name:** `N8N_API_KEY`

5. **Value:** Den Key eintragen, den das Skript angezeigt hat

6. **"Save"** klicken

**✅ Fertig!**

---

## 📋 Alternative: Manuell (ohne Skript)

**Falls du das Skript nicht ausführen möchtest:**

### 1. Key generieren

```bash
cd /opt/mcp-connection-key
openssl rand -hex 32
```

**⚠️ WICHTIG:** Notiere dir den generierten Key!

---

### 2. In .env eintragen

```bash
echo "" >> .env
echo "# n8n API Key für externe API-Calls" >> .env
echo "N8N_API_KEY=DEIN_GENERIERTER_KEY" >> .env
```

**Ersetze `DEIN_GENERIERTER_KEY` mit dem Key aus Schritt 1!**

---

### 3. In n8n Environment Variables eintragen

1. n8n öffnen: `https://n8n.werdemeisterdeinergedankenagent.de`
2. Settings → Environment Variables
3. "Add Variable" → Name: `N8N_API_KEY`, Value: Dein Key
4. Save

---

## ✅ Prüfen: Funktioniert es?

**Nachdem Key gesetzt ist:**

```bash
# In .env prüfen
grep N8N_API_KEY .env

# Mit check-env-variables.sh prüfen
./check-env-variables.sh .env
```

**Erwartung:**
```
✅ N8N_API_KEY = a1b2c3d4e5f6g7h8i9...
```

---

## 🧪 Test: Mailchimp Workflow

**Nachdem Key gesetzt ist, teste den Mailchimp Workflow:**

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
- ✅ Keine Authorization-Fehler

---

**🎉 Viel Erfolg!** 🚀
