# 🔐 "Notify Frontend" Node - Credentials für geschützten Coach-Bereich

**Problem:** Frontend API benötigt Authentifizierung (geschützter Coach-Bereich)

**Lösung:** HTTP Header Auth Credential mit N8N_API_KEY erstellen

---

## ✅ Schritt 1: N8N_API_KEY finden

**Der Key wird benötigt für:** `/api/notifications/reading`

**Wo findest du den Key?**

### Option A: Auf CK-App Server (Frontend)

```bash
# Auf Server 167 (CK-App)
cd /opt/hd-app/The-Connection-Key/frontend
grep N8N_API_KEY .env.local
```

**Sollte zeigen:**
```
N8N_API_KEY=dein-api-key-hier
```

### Option B: In n8n Environment Variables

1. In n8n: **Settings** → **Environment Variables**
2. Suche nach: `N8N_API_KEY`
3. Kopiere den Wert

---

## ✅ Schritt 2: HTTP Header Auth Credential erstellen

### 2.1 Credential erstellen

1. **In n8n:** Klicke auf **"Credentials"** (linke Sidebar)
2. Klicke **"+ New Credential"** (oben rechts)
3. Suche nach: **"HTTP Header Auth"**
4. Wähle: **"HTTP Header Auth"**

### 2.2 Credential konfigurieren

**Fülle aus:**

- **Name:** `Frontend API Key` (oder `N8N API Key`)
- **Header Name:** `Authorization`
- **Header Value:** `Bearer DEIN_N8N_API_KEY_HIER`

**Wichtig:**
- ✅ Header Name: `Authorization` (genau so)
- ✅ Header Value: `Bearer ` + Leerzeichen + dein N8N_API_KEY
- ✅ Beispiel: `Bearer b6b3c7f6e333769dba39...`

### 2.3 Credential speichern

1. Klicke **"Save"**
2. Credential sollte jetzt in der Liste erscheinen

---

## ✅ Schritt 3: Credential im "Notify Frontend" Node zuweisen

### 3.1 Node öffnen

1. Öffne den Workflow **"Reading Generation Workflow"**
2. Klicke auf **"Notify Frontend"** Node

### 3.2 Credential zuweisen

1. **Authentication:** Sollte bereits `Generic Credential Type` sein
2. **Generic Auth Type:** Sollte bereits `Header Auth` sein
3. **Header Auth:** Wähle `Frontend API Key` (das gerade erstellte Credential)
4. ✅ Rotes Warnsymbol sollte verschwinden

### 3.3 Node speichern

1. Klicke **"Save"** im Node-Panel
2. ✅ Rote Warnung sollte verschwinden

---

## ✅ Schritt 4: HTTP Method prüfen

**Wichtig:** Der Node sollte `POST` verwenden (nicht `GET`), da Body-Parameter gesendet werden.

### 4.1 Method ändern (falls nötig)

1. Im "Notify Frontend" Node:
2. **Method:** Ändere von `GET` zu `POST`
3. **Save**

---

## ✅ Schritt 5: Body Parameters prüfen

**Sollten bereits vorhanden sein:**
- `readingId` = `={{ $json.readingId }}`
- `userId` = `={{ $json.body.userId }}`
- `readingType` = `={{ $json.readingType || $json.body.readingType }}`
- `status` = `completed`
- `timestamp` = `={{ $now }}`

**Falls fehlend:** Füge sie hinzu

---

## 🔍 Troubleshooting

### Problem: "Invalid API Key" vom Frontend

**Lösung:**
1. Prüfe N8N_API_KEY ist korrekt (auf Frontend Server)
2. Prüfe Header Value: `Bearer ` + Leerzeichen + Key
3. Prüfe Header Name: `Authorization` (nicht `X-API-Key`)

### Problem: "401 Unauthorized"

**Lösung:**
1. Prüfe Credential ist zugewiesen
2. Prüfe Header Value Format: `Bearer YOUR_KEY`
3. Prüfe N8N_API_KEY ist auf Frontend Server gesetzt

### Problem: "Method not allowed"

**Lösung:**
1. Ändere Method von `GET` zu `POST`
2. Prüfe Frontend Route akzeptiert POST

---

## 📋 Checkliste

**Vor Aktivierung prüfen:**

- [ ] N8N_API_KEY gefunden (auf Frontend Server)
- [ ] HTTP Header Auth Credential erstellt
- [ ] Credential im "Notify Frontend" Node zugewiesen
- [ ] Method ist `POST` (nicht GET)
- [ ] Body Parameters sind vorhanden
- [ ] Keine roten Warnungen mehr
- [ ] Node gespeichert

---

## 🎯 Nächste Schritte

Nach erfolgreicher Konfiguration:

1. **Workflow speichern:** Klicke "Save" (oben rechts)
2. **Workflow aktivieren:** Toggle auf "Active"
3. **Test durchführen:** Manuell mit "Execute workflow"

---

**Nach dieser Konfiguration sollte der "Notify Frontend" Node funktionieren!** ✅
