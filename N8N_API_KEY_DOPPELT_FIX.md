# 🔧 N8N_API_KEY doppelt - Fix

**Datum:** 17.12.2025

**Problem:** `N8N_API_KEY` ist zweimal in `.env` definiert

---

## 🔍 Problem identifizieren

**Gefundene Keys:**
```
N8N_API_KEY=b6b3c7f6e333769dba390a8e68a6272fa7d5beefb9047e8a079ad7e9bb0ddce1
N8N_API_KEY=0139efdef24110614ca2489077d2e786fd1d5e1cac1e22538d6adb68e6899d5c
```

**Problem:** Welcher Key wird verwendet? Unklar!

---

## 🔧 Lösung: Einen Key entfernen

### Option 1: Automatisch (empfohlen)

**Auf dem Server:**

```bash
cd /opt/mcp-connection-key

# Zeige alle N8N_API_KEY Zeilen mit Zeilennummern
grep -n "N8N_API_KEY" .env

# Entferne die erste Zeile (oder die kürzere)
# Beispiel: Falls Zeile 10 die erste ist
sed -i '10d' .env

# Prüfe erneut
grep "N8N_API_KEY" .env
```

**Erwartung:** Nur noch EINE Zeile mit `N8N_API_KEY`

---

### Option 2: Manuell (sicherer)

**Auf dem Server:**

```bash
cd /opt/mcp-connection-key
nano .env
```

**Dann:**
1. Suche nach `N8N_API_KEY` (Ctrl+W, dann "N8N_API_KEY")
2. Finde beide Zeilen
3. **Entscheide:** Welcher Key ist der richtige?
   - Der längere: `b6b3c7f6e333769dba390a8e68a6272fa7d5beefb9047e8a079ad7e9bb0ddce10139efdef24110614ca2489077d2e786fd1d5e1cac1e22538d6adb68e6899d5c` (128 Zeichen)
   - Der kürzere: `b6b3c7f6e333769dba390a8e68a6272fa7d5beefb9047e8a079ad7e9bb0ddce1` (64 Zeichen)
4. **Entferne die falsche Zeile** (Strg+K zum Löschen der Zeile)
5. **Speichern:** Ctrl+O, Enter
6. **Beenden:** Ctrl+X

---

### Option 3: Neuen Key generieren (falls unsicher)

**Falls du nicht sicher bist, welcher Key der richtige ist:**

```bash
cd /opt/mcp-connection-key

# Entferne beide alten Keys
sed -i '/^N8N_API_KEY=/d' .env

# Generiere neuen Key
N8N_KEY=$(openssl rand -hex 32)
echo "N8N_API_KEY=$N8N_KEY" >> .env

# Zeige neuen Key
echo "=========================================="
echo "⚠️  WICHTIG: Notieren Sie sich diesen Key!"
echo "=========================================="
echo "N8N_API_KEY=$N8N_KEY"
echo "=========================================="
echo ""

# Dann in n8n Environment Variables eintragen!
echo "Nächste Schritte:"
echo "1. n8n öffnen: https://n8n.werdemeisterdeinergedankenagent.de"
echo "2. Settings → Environment Variables"
echo "3. N8N_API_KEY eintragen: $N8N_KEY"
echo "4. Save"
```

---

## ✅ Prüfen: Fix erfolgreich?

**Nach dem Fix:**

```bash
cd /opt/mcp-connection-key

# Sollte nur EINE Zeile zeigen
grep "N8N_API_KEY" .env

# Sollte "1" ausgeben (nur eine Zeile)
grep -c "N8N_API_KEY" .env
```

**Erwartung:**
```
N8N_API_KEY=b6b3c7f6e333769dba390a8e68a6272fa7d5beefb9047e8a079ad7e9bb0ddce10139efdef24110614ca2489077d2e786fd1d5e1cac1e22538d6adb68e6899d5c
```

**Nur EINE Zeile!**

---

## 🎯 Empfehlung

**Ich empfehle Option 2 (manuell):**
- Sicherer (du siehst, was du änderst)
- Du kannst den richtigen Key identifizieren
- Du kannst beide Keys vergleichen

**Welcher Key ist der richtige?**
- Der längere Key (128 Zeichen) ist wahrscheinlich der neuere
- Der kürzere Key (64 Zeichen) könnte ein alter Key sein

**Falls beide Keys gleich lang sind:** Behalte den, der in n8n Environment Variables eingetragen ist!

---

**🔧 Führe den Fix aus und prüfe dann erneut!** 🚀
