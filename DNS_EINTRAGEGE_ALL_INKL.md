# 🌐 DNS-Einträge für All-Inkl

Domain: **werdemeisterdeinergedankenagent.de**
Server-IP: **138.199.237.34**

## 📋 Benötigte DNS-Einträge

### Für n8n (HTTPS Setup)
```
n8n.werdemeisterdeinergedankenagent.de  →  138.199.237.34
```

### Optional: Weitere Services
```
api.werdemeisterdeinergedankenagent.de     →  138.199.237.34  (Connection-Key)
agent.werdemeisterdeinergedankenagent.de    →  138.199.237.34  (ChatGPT-Agent)
```

## 🔧 In All-Inkl einrichten

### Schritt 1: All-Inkl Kundencenter öffnen

1. Gehen Sie zu [All-Inkl Kundencenter](https://kis.all-inkl.com/)
2. Login mit Ihren Zugangsdaten
3. Wählen Sie Ihre Domain: **werdemeisterdeinergedankenagent.de**

### Schritt 2: DNS-Verwaltung öffnen

1. Klicken Sie auf **"DNS-Verwaltung"** oder **"DNS-Einstellungen"**
2. Wählen Sie **"Subdomain hinzufügen"** oder **"A-Record hinzufügen"**

### Schritt 3: A-Records erstellen

#### Für n8n (WICHTIG für HTTPS):

**Subdomain:** `n8n`
**Typ:** `A`
**Wert:** `138.199.237.34`
**TTL:** `3600` (oder Standard)

**Oder als vollständiger Eintrag:**
```
n8n.werdemeisterdeinergedankenagent.de  A  138.199.237.34
```

#### Optional: Für Connection-Key API:

**Subdomain:** `api`
**Typ:** `A`
**Wert:** `138.199.237.34`
**TTL:** `3600`

#### Optional: Für ChatGPT-Agent:

**Subdomain:** `agent`
**Typ:** `A`
**Wert:** `138.199.237.34`
**TTL:** `3600`

## 📝 Beispiel-Konfiguration in All-Inkl

In der All-Inkl DNS-Verwaltung sollten Sie folgende Einträge haben:

| Name | Typ | Wert | TTL |
|------|-----|------|-----|
| n8n | A | 138.199.237.34 | 3600 |
| api | A | 138.199.237.34 | 3600 (optional) |
| agent | A | 138.199.237.34 | 3600 (optional) |

## ✅ DNS prüfen

Nach dem Erstellen der Einträge (kann 5-15 Minuten dauern):

```bash
# Von lokal aus prüfen
nslookup n8n.werdemeisterdeinergedankenagent.de

# Oder
dig n8n.werdemeisterdeinergedankenagent.de

# Sollte zeigen: 138.199.237.34
```

## 🚀 Nach DNS-Setup: HTTPS einrichten

Sobald DNS propagiert ist, können Sie HTTPS einrichten:

```bash
ssh root@138.199.237.34
cd /opt/mcp-connection-key

# Script ausführen (wenn vorhanden)
./setup-https.sh

# Oder manuell (siehe HTTPS_SETUP.md)
```

## 📋 URLs nach Setup

Nach erfolgreichem HTTPS-Setup:

- **n8n:** `https://n8n.werdemeisterdeinergedankenagent.de`
- **Webhook:** `https://n8n.werdemeisterdeinergedankenagent.de/webhook/mailchimp-confirmed`
- **API (optional):** `https://api.werdemeisterdeinergedankenagent.de`
- **Agent (optional):** `https://agent.werdemeisterdeinergedankenagent.de`

## 🔍 All-Inkl spezifische Hinweise

### Falls Sie Probleme haben:

1. **DNS-Cache leeren:**
   - Warten Sie 15-30 Minuten nach Erstellung
   - Oder verwenden Sie einen anderen DNS-Server zum Testen

2. **TTL-Wert:**
   - All-Inkl Standard: 3600 Sekunden (1 Stunde)
   - Für schnelleres Update: 300 Sekunden (5 Minuten)

3. **Wildcard-Subdomain (optional):**
   - Falls Sie viele Subdomains brauchen: `*.werdemeisterdeinergedankenagent.de → 138.199.237.34`
   - Aber: Einzelne A-Records sind klarer

## ✅ Checkliste

- [ ] DNS-Eintrag erstellt: `n8n.werdemeisterdeinergedankenagent.de → 138.199.237.34`
- [ ] DNS propagiert (prüfen mit `nslookup`)
- [ ] HTTPS Setup durchgeführt
- [ ] n8n über HTTPS erreichbar

## 🎯 Nächste Schritte

1. **DNS-Einträge in All-Inkl erstellen**
2. **Warten bis DNS propagiert (5-15 Min)**
3. **DNS prüfen:** `nslookup n8n.werdemeisterdeinergedankenagent.de`
4. **HTTPS Setup durchführen** (siehe `HTTPS_SETUP.md`)

