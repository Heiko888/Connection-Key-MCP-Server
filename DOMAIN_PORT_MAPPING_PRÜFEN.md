# 🔍 Domain → Port Mapping prüfen

**Datum:** 17.12.2025

**Frage:** Welches Frontend wird aufgerufen, wenn ich die Domain aufrufe?

---

## 🔍 Prüfung: Welche Domain zeigt auf welchen Port?

**Auf dem Server prüfen:**

```bash
# 1. Prüfe Nginx-Konfigurationen
ls -la /etc/nginx/sites-enabled/
ls -la /etc/nginx/sites-available/

# 2. Prüfe welche Domains konfiguriert sind
grep -r "server_name" /etc/nginx/sites-enabled/ 2>/dev/null
grep -r "proxy_pass" /etc/nginx/sites-enabled/ 2>/dev/null

# 3. Prüfe speziell für the-connection-key.de
grep -r "the-connection-key" /etc/nginx/sites-enabled/ 2>/dev/null
grep -r "the-connection-key" /etc/nginx/sites-available/ 2>/dev/null
```

---

## 📊 Bekannte Domains

**Aus den Konfigurationen:**

| Domain | Service | Port | Status |
|--------|---------|------|--------|
| `www.the-connection-key.de` | Frontend? | ? | ⚠️ Unbekannt |
| `the-connection-key.de` | Frontend? | ? | ⚠️ Unbekannt |
| `agent.the-connection-key.de` | Reading Agent | 4001 | ✅ Bekannt |
| `n8n.werdemeisterdeinergedankenagent.de` | n8n | 5678 | ✅ Bekannt |

---

## ❓ Welche Domain ist die Haupt-Domain?

**Mögliche Haupt-Domains:**
- `www.the-connection-key.de`
- `the-connection-key.de`

**Frage:** Welche Domain verwendest du normalerweise?

---

## 🔧 Nginx-Konfiguration prüfen

**Auf dem Server (wo das Frontend läuft):**

```bash
# Prüfe alle Nginx-Konfigurationen
cat /etc/nginx/sites-enabled/* | grep -A 10 "server_name"

# ODER spezifisch für the-connection-key.de
grep -r "the-connection-key" /etc/nginx/sites-enabled/ -A 10
```

**Das zeigt:**
- Welche Domain auf welchen Port zeigt
- Ob es `proxy_pass http://localhost:3000` oder `proxy_pass http://localhost:3005` ist

---

## 🎯 Erwartete Konfiguration

**Falls `www.the-connection-key.de` auf Port 3000 zeigt:**
- ❌ **Falsch!** → Zeigt auf `connection-key` Docker Container (alter Service)
- ✅ **Sollte zeigen auf:** Port 3005 (Next.js Frontend)

**Falls `www.the-connection-key.de` auf Port 3005 zeigt:**
- ✅ **Korrekt!** → Zeigt auf Next.js Frontend

---

## 🔧 Lösung: Nginx auf Port 3005 umstellen

**Falls Domain auf Port 3000 zeigt (falsch):**

```bash
# Nginx-Konfiguration finden
grep -r "the-connection-key" /etc/nginx/sites-enabled/ -l

# Konfiguration bearbeiten
nano /etc/nginx/sites-enabled/the-connection-key.conf
# ODER
nano /etc/nginx/sites-enabled/default
```

**Ändere:**
```nginx
# ALT (falsch)
proxy_pass http://localhost:3000;

# NEU (korrekt)
proxy_pass http://localhost:3005;
```

**Dann:**
```bash
# Nginx testen
nginx -t

# Nginx neu laden
systemctl reload nginx
```

---

## ✅ Prüfung nach Änderung

**Nach Nginx-Reload:**

```bash
# Teste Domain
curl -I https://www.the-connection-key.de

# Prüfe ob Port 3005 verwendet wird
# (sollte Next.js Response sein, nicht connection-key)
```

---

## 🎯 Zusammenfassung

**Aktuell:**
- ⚠️ Unbekannt: Welche Domain zeigt auf welchen Port?

**Zu prüfen:**
1. Welche Domain ist die Haupt-Domain? (`www.the-connection-key.de`?)
2. Zeigt die Domain auf Port 3000 oder Port 3005?
3. Falls Port 3000 → Nginx auf Port 3005 umstellen

---

**🔍 Prüfe zuerst: Welche Domain verwendest du und auf welchen Port zeigt sie?** 🚀
