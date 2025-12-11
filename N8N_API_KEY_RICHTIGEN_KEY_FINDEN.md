# 🔍 N8N_API_KEY: Welcher ist der richtige?

**Datum:** 17.12.2025

**Problem:** Zwei N8N_API_KEY in `.env` → Welcher ist der richtige?

---

## 🔍 Gefundene Keys

**Key 1:**
```
N8N_API_KEY=b6b3c7f6e333769dba390a8e68a6272fa7d5beefb9047e8a079ad7e9bb0ddce1
```
**Länge:** 64 Zeichen (hex)

**Key 2:**
```
N8N_API_KEY=0139efdef24110614ca2489077d2e786fd1d5e1cac1e22538d6adb68e6899d5c
```
**Länge:** 64 Zeichen (hex)

---

## ✅ Lösung: In n8n Environment Variables prüfen

**Der richtige Key ist der, der in n8n Environment Variables eingetragen ist!**

### Schritt 1: n8n öffnen

```
https://n8n.werdemeisterdeinergedankenagent.de
```

### Schritt 2: Environment Variables öffnen

1. **Settings** → **Environment Variables**
2. **Suche:** `N8N_API_KEY`
3. **Vergleiche:** Welcher Key ist eingetragen?

---

## 🎯 Entscheidung

**Falls Key 1 in n8n ist:**
- ✅ Behalte: `N8N_API_KEY=b6b3c7f6e333769dba390a8e68a6272fa7d5beefb9047e8a079ad7e9bb0ddce1`
- ❌ Entferne: `N8N_API_KEY=0139efdef24110614ca2489077d2e786fd1d5e1cac1e22538d6adb68e6899d5c`

**Falls Key 2 in n8n ist:**
- ✅ Behalte: `N8N_API_KEY=0139efdef24110614ca2489077d2e786fd1d5e1cac1e22538d6adb68e6899d5c`
- ❌ Entferne: `N8N_API_KEY=b6b3c7f6e333769dba390a8e68a6272fa7d5beefb9047e8a079ad7e9bb0ddce1`

**Falls KEINER in n8n ist:**
- ⚠️ Dann muss einer in n8n eingetragen werden!
- Empfehlung: Den längeren/neueren Key verwenden

---

## 🔧 Fix: Doppelten Key entfernen

**Nachdem du den richtigen Key identifiziert hast:**

### Option 1: Automatisch (spezifischen Key entfernen)

**Falls Key 1 der richtige ist (in n8n eingetragen):**
```bash
cd /opt/mcp-connection-key
sed -i '/^N8N_API_KEY=0139efdef24110614ca2489077d2e786fd1d5e1cac1e22538d6adb68e6899d5c$/d' .env
```

**Falls Key 2 der richtige ist (in n8n eingetragen):**
```bash
cd /opt/mcp-connection-key
sed -i '/^N8N_API_KEY=b6b3c7f6e333769dba390a8e68a6272fa7d5beefb9047e8a079ad7e9bb0ddce1$/d' .env
```

### Option 2: Manuell (sicherer)

```bash
cd /opt/mcp-connection-key
nano .env
```

**Dann:**
1. Suche nach `N8N_API_KEY` (Ctrl+W)
2. Finde beide Zeilen
3. **Entferne die Zeile, die NICHT in n8n Environment Variables ist**
4. **Speichern:** Ctrl+O, Enter
5. **Beenden:** Ctrl+X

---

## ✅ Prüfen: Fix erfolgreich?

**Nach dem Fix:**

```bash
cd /opt/mcp-connection-key

# Sollte nur EINE Zeile zeigen
grep "N8N_API_KEY" .env

# Sollte "1" ausgeben
grep -c "N8N_API_KEY" .env
```

**Erwartung:** Nur noch EINE Zeile mit `N8N_API_KEY`

---

## 🧪 Test: Funktioniert der Key?

**Nach dem Fix, teste den Mailchimp Workflow:**

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed \
  -H "Content-Type: application/json" \
  -d '{"type":"subscribe","data":{"email":"test@example.com","merge_fields":{"FNAME":"Test"}}}'
```

**Erwartung:**
- ✅ HTTP 200 OK
- ✅ Response: `{"message":"Workflow was started"}`
- ✅ Keine Authorization-Fehler

**Falls 401/403:** Der falsche Key ist in n8n Environment Variables → Korrigieren!

---

## 🎯 Zusammenfassung

**Wichtig:** Der richtige Key ist der, der in n8n Environment Variables eingetragen ist!

**Schritte:**
1. ✅ n8n öffnen → Settings → Environment Variables
2. ✅ Prüfe: Welcher Key ist eingetragen?
3. ✅ Behalte diesen Key in `.env`
4. ✅ Entferne den anderen Key aus `.env`
5. ✅ Teste Mailchimp Workflow

---

**🔍 Prüfe jetzt in n8n: Welcher Key ist eingetragen?** 🚀
