# ⚠️ Frontend Port Problem: Warum Port 3005?

**Datum:** 17.12.2025

**Problem:** Next.js läuft auf Port 3005 statt Port 3000

---

## 🔍 Problem-Analyse

**Du hast Next.js gestartet in:**
```
/opt/hd-app/The-Connection-Key/frontend
```

**Aber das Projekt liegt in:**
```
/opt/mcp-connection-key/integration/frontend
```

**Das sind zwei verschiedene Verzeichnisse!**

---

## ❓ Fragen

1. **Ist `/opt/hd-app/The-Connection-Key/frontend` das richtige Frontend?**
   - Oder ist das ein anderes Projekt?
   - Oder ein alter/duplizierter Ordner?

2. **Warum Port 3005?**
   - Wurde das absichtlich so konfiguriert?
   - Oder läuft bereits etwas auf Port 3000?

---

## 🔍 Prüfung

**Auf dem Server prüfen:**

```bash
# 1. Prüfe welches Frontend-Verzeichnis existiert
ls -la /opt/hd-app/The-Connection-Key/frontend
ls -la /opt/mcp-connection-key/integration/frontend

# 2. Prüfe ob Port 3000 belegt ist
netstat -tuln | grep 3000
# ODER
lsof -i :3000

# 3. Prüfe package.json in beiden Verzeichnissen
cat /opt/hd-app/The-Connection-Key/frontend/package.json | grep -A 5 "scripts"
cat /opt/mcp-connection-key/integration/frontend/package.json | grep -A 5 "scripts" 2>/dev/null || echo "Datei nicht gefunden"
```

---

## 🔧 Lösung: Port auf 3000 ändern

**Falls Port 3005 nicht gewollt ist:**

### Option 1: package.json ändern

```bash
cd /opt/hd-app/The-Connection-Key/frontend
nano package.json
```

**Suche nach:**
```json
"scripts": {
  "dev": "next dev -p 3005"
}
```

**Ändere zu:**
```json
"scripts": {
  "dev": "next dev"
}
```

**Oder falls Port 3000 belegt ist:**
```json
"scripts": {
  "dev": "next dev -p 3000"
}
```

### Option 2: Environment Variable

```bash
cd /opt/hd-app/The-Connection-Key/frontend
export PORT=3000
npm run dev
```

### Option 3: .env.local

```bash
cd /opt/hd-app/The-Connection-Key/frontend
echo "PORT=3000" >> .env.local
```

---

## ✅ Richtiges Frontend verwenden

**Falls `/opt/mcp-connection-key/integration/frontend` das richtige Frontend ist:**

```bash
# Stoppe aktuelles Next.js (Ctrl+C)

# Wechsle zum richtigen Verzeichnis
cd /opt/mcp-connection-key/integration/frontend

# Starte Next.js (läuft dann auf Port 3000)
npm run dev
```

---

## 🎯 Nächste Schritte

1. **Prüfe:** Welches Frontend-Verzeichnis ist das richtige?
2. **Prüfe:** Warum Port 3005? (Port 3000 belegt?)
3. **Ändere:** Port auf 3000 (falls gewünscht)
4. **Aktualisiere:** Prüfskripte für Port 3005 (falls Port 3005 beibehalten wird)

---

**🔍 Prüfe zuerst: Welches Frontend-Verzeichnis ist das richtige und warum Port 3005?** 🚀
