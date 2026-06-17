# 🔑 N8N_API_KEY setzen - Schritt für Schritt

**Datum:** 17.12.2025

**Zweck:** `N8N_API_KEY` für Mailchimp Workflow und andere n8n API-Calls

---

## 📋 Übersicht

Der `N8N_API_KEY` wird benötigt für:
- ✅ Mailchimp Workflow → ConnectionKey API Authorization
- ✅ Andere n8n Workflows, die externe APIs aufrufen

**Wo wird er verwendet:**
- In n8n Environment Variables (für Workflows)
- In `.env` Datei (für Konsistenz)
- Optional: In Next.js `.env.local` (falls Frontend API-Calls macht)

---

## 🚀 Schnellstart: Automatisch setzen

**Auf Server ausführen:**

```bash
cd /opt/mcp-connection-key
chmod +x set-n8n-api-key.sh
./set-n8n-api-key.sh
```

**Das Skript:**
1. ✅ Prüft ob Key bereits existiert
2. ✅ Generiert neuen Key (falls nötig)
3. ✅ Trägt Key in `.env` ein
4. ✅ Zeigt Key an (WICHTIG: Notieren!)

---

## 📝 Manuell setzen

### Schritt 1: Key generieren

**Auf Server:**
```bash
cd /opt/mcp-connection-key
openssl rand -hex 32
```

**Beispiel-Output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**⚠️ WICHTIG:** Notiere dir diesen Key!

---

### Schritt 2: In .env eintragen

**Auf Server:**
```bash
cd /opt/mcp-connection-key
echo "" >> .env
echo "# n8n API Key für externe API-Calls" >> .env
echo "N8N_API_KEY=DEIN_GENERIERTER_KEY" >> .env
```

**Oder manuell in `.env` Datei:**
```env
# n8n API Key für externe API-Calls
N8N_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

### Schritt 3: In n8n Environment Variables eintragen

**Das ist der wichtigste Schritt!**

1. **n8n öffnen:**
   ```
   https://n8n.werdemeisterdeinergedankenagent.de
   ```

2. **Settings öffnen:**
   - Oben rechts: **"Settings"** (Zahnrad-Icon)
   - Oder: **"⚙️ Settings"** im Menü

3. **Environment Variables öffnen:**
   - Links im Menü: **"Environment Variables"**
   - Oder direkt: `https://n8n.werdemeisterdeinergedankenagent.de/settings/environment-variables`

4. **Variable hinzufügen:**
   - **"Add Variable"** oder **"+"** Button klicken
   - **Name:** `N8N_API_KEY`
   - **Value:** Den generierten Key eintragen (z.B. `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2`)
   - **"Save"** klicken

**✅ Environment Variable ist jetzt gesetzt!**

---

### Schritt 4: Optional - In Next.js .env.local eintragen

**Falls Frontend API-Calls mit N8N_API_KEY macht:**

```bash
cd /opt/mcp-connection-key/integration/frontend
echo "N8N_API_KEY=DEIN_GENERIERTER_KEY" >> .env.local
```

**Oder manuell in `.env.local`:**
```env
N8N_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

## ✅ Prüfen: Ist N8N_API_KEY gesetzt?

### In .env prüfen:

```bash
cd /opt/mcp-connection-key
grep N8N_API_KEY .env
```

**Erwartung:**
```
N8N_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

### In n8n prüfen:

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Settings** → **Environment Variables**
3. **Prüfe:** `N8N_API_KEY` ist in der Liste?

**✅ Falls ja:** Key ist gesetzt!

---

### Mit Skript prüfen:

```bash
cd /opt/mcp-connection-key
chmod +x check-env-variables.sh
./check-env-variables.sh .env
```

**Erwartung:**
```
✅ N8N_API_KEY = a1b2c3d4e5f6g7h8i9...
```

---

## 🧪 Test: Funktioniert der Key?

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

## ⚠️ Wichtige Hinweise

### 1. Key sicher aufbewahren

- ✅ Notiere dir den Key an einem sicheren Ort
- ✅ Verwende denselben Key in `.env` und n8n Environment Variables
- ✅ Teile den Key nicht öffentlich

### 2. Key in n8n ist wichtig

**Der Key muss in n8n Environment Variables gesetzt sein!**

- ❌ Nur in `.env` reicht NICHT
- ✅ Muss in n8n Environment Variables sein
- ✅ Workflows verwenden `{{ $env.N8N_API_KEY }}`

### 3. Key neu generieren

**Falls Key kompromittiert wurde:**

1. Neuen Key generieren
2. In `.env` ersetzen
3. In n8n Environment Variables ersetzen
4. Alle betroffenen Workflows prüfen

---

## 📋 Checkliste

- [ ] Key generiert (mit Skript oder manuell)
- [ ] Key in `.env` eingetragen
- [ ] Key in n8n Environment Variables eingetragen
- [ ] Key notiert (an sicherem Ort)
- [ ] Optional: Key in Next.js `.env.local` eingetragen
- [ ] Test erfolgreich

---

## 🎯 Zusammenfassung

**Was wurde gemacht:**
1. ✅ `N8N_API_KEY` generiert
2. ✅ In `.env` eingetragen
3. ✅ In n8n Environment Variables eingetragen

**Nächste Schritte:**
- ✅ Mailchimp Workflow sollte jetzt funktionieren
- ✅ Rotes Warndreieck in n8n sollte verschwinden
- ✅ ConnectionKey API wird mit korrektem Authorization Header aufgerufen

---

**🎉 N8N_API_KEY ist jetzt gesetzt!** 🚀
