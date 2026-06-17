# 🔧 Mailchimp Workflow: URL & Authentication prüfen

**Datum:** 17.12.2025

**Status:** Workflow-Konfiguration prüfen

---

## ✅ Workflow-Datei ist korrekt

Die Workflow-Datei `mailchimp-subscriber.json` ist korrekt konfiguriert:

- ✅ **URL:** `https://www.the-connection-key.de/api/new-subscriber`
- ✅ **Authorization:** `Bearer {{ $env.N8N_API_KEY }}`
- ✅ **Content-Type:** `application/json`

---

## ⚠️ Was im n8n-Editor zu prüfen ist

### 1. URL vollständig eintragen

**Im "Send to ConnectionKey API" Knoten:**

**URL-Feld sollte sein:**
```
https://www.the-connection-key.de/api/new-subscriber
```

**NICHT nur:**
```
https://www.the-connection-key.de/api/
```

**Falls die URL unvollständig ist:**
1. Knoten "Send to ConnectionKey API" öffnen
2. **URL-Feld:** Vollständige URL eintragen: `https://www.the-connection-key.de/api/new-subscriber`
3. **Speichern**

---

### 2. Rotes Warndreieck bei Authentication

**Das rote Warndreieck bedeutet wahrscheinlich:**

**Option A: Environment Variable fehlt**
- `N8N_API_KEY` ist nicht in n8n Environment Variables gesetzt
- **Lösung:** Siehe unten "Environment Variable setzen"

**Option B: n8n warnt vor Header-Auth**
- n8n zeigt eine Warnung, dass Header-Auth verwendet wird
- **Lösung:** Das ist normal, wenn `Bearer {{ $env.N8N_API_KEY }}` verwendet wird

---

## 🔑 Environment Variable setzen

### Schritt 1: N8N_API_KEY generieren (falls noch nicht vorhanden)

**Auf Server:**
```bash
cd /opt/mcp-connection-key
openssl rand -hex 32
```

**Oder in PowerShell:**
```powershell
# Generiere zufälligen Key
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[System.Convert]::ToHexString($bytes)
```

**Beispiel-Output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

### Schritt 2: In n8n eintragen

1. **n8n öffnen:** `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Settings** → **Environment Variables**
3. **"Add Variable"** klicken
4. **Name:** `N8N_API_KEY`
5. **Value:** Den generierten Key eintragen
6. **"Save"** klicken

**✅ Environment Variable ist jetzt gesetzt!**

---

### Schritt 3: In .env eintragen (optional, für Konsistenz)

**Auf Server:**
```bash
cd /opt/mcp-connection-key
echo "N8N_API_KEY=DEIN_GENERIERTER_KEY" >> .env
```

**Oder manuell in `.env` Datei:**
```env
N8N_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

## ✅ Checkliste: Mailchimp Workflow korrekt konfiguriert

- [ ] **URL vollständig:** `https://www.the-connection-key.de/api/new-subscriber`
- [ ] **Authorization Header:** `Bearer {{ $env.N8N_API_KEY }}`
- [ ] **Content-Type Header:** `application/json`
- [ ] **N8N_API_KEY in n8n Environment Variables gesetzt**
- [ ] **Workflow aktiviert** (Active = GRÜN)
- [ ] **Rotes Warndreieck verschwunden** (oder ignoriert, falls es nur eine Info-Warnung ist)

---

## 🧪 Test nach Korrektur

**Nachdem URL und Environment Variable gesetzt sind:**

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
- ✅ Response: `{"success": true, "message": "Subscriber processed", "email": "test@example.com"}`
- ✅ ConnectionKey API wird aufgerufen

---

## 🎯 Zusammenfassung

**Was zu prüfen/korrigieren ist:**
1. ✅ URL vollständig: `/api/new-subscriber` am Ende
2. ✅ `N8N_API_KEY` in n8n Environment Variables setzen
3. ✅ Workflow aktivieren

**Nach diesen Schritten sollte das rote Warndreieck verschwinden (oder es ist nur eine Info-Warnung).**

---

**🎉 Workflow sollte dann funktionieren!** 🚀
