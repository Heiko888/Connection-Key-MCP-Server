# 🔍 Domain → Frontend Mapping prüfen

**Datum:** 17.12.2025

**Frage:** Welches Frontend wird aufgerufen, wenn ich die Domain aufrufe?

---

## 🔍 Prüfung: Welche Domain zeigt auf welchen Port?

**Auf dem Server ausführen:**

```bash
cd /opt/mcp-connection-key
chmod +x check-domain-nginx-mapping.sh
./check-domain-nginx-mapping.sh
```

**Das Skript prüft:**
- ✅ Welche Nginx-Konfigurationen existieren
- ✅ Welche Domains konfiguriert sind
- ✅ Auf welchen Port jede Domain zeigt
- ✅ Ob `the-connection-key.de` auf Port 3000 oder 3005 zeigt

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

## 🎯 Erwartete Konfiguration

**Falls `www.the-connection-key.de` auf Port 3000 zeigt:**
- ❌ **Falsch!** → Zeigt auf `connection-key` Docker Container (älterer Service)
- ✅ **Sollte zeigen auf:** Port 3005 (Next.js Frontend)

**Falls `www.the-connection-key.de` auf Port 3005 zeigt:**
- ✅ **Korrekt!** → Zeigt auf Next.js Frontend

---

## 🔧 Lösung: Nginx auf Port 3005 umstellen

**Falls Domain auf Port 3000 zeigt (falsch):**

```bash
# 1. Finde Nginx-Konfiguration
grep -r "the-connection-key" /etc/nginx/sites-enabled/ -l

# 2. Bearbeite Konfiguration
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

# Prüfe ob Next.js Response kommt
# (sollte Next.js HTML sein, nicht connection-key)
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

**🔍 Führe das Prüfskript aus, um zu sehen, welche Domain auf welchen Port zeigt!** 🚀
