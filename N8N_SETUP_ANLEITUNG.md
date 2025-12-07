# 🔧 n8n Setup-Anleitung

n8n zeigt die Setup-Seite unter `http://138.199.237.34:5678/setup`

## 📋 Option 1: Setup durchführen (wenn Basic Auth nicht aktiviert ist)

### Schritt 1: Setup-Seite öffnen
- Browser: `http://138.199.237.34:5678/setup`

### Schritt 2: Admin-User erstellen
1. **E-Mail:** Ihre E-Mail-Adresse
2. **Vorname:** Ihr Vorname
3. **Nachname:** Ihr Nachname
4. **Passwort:** Starkes Passwort (notieren Sie es!)
5. **Klicken Sie "Create account"**

### Schritt 3: Fertig
Nach dem Setup können Sie sich mit diesen Daten einloggen.

## 🔐 Option 2: Basic Auth aktivieren (empfohlen)

Falls Sie Basic Auth verwenden möchten (wie in docker-compose.yml konfiguriert):

### Prüfen ob Basic Auth aktiviert ist:

```bash
cd /opt/mcp-connection-key

# Prüfe .env
grep N8N_PASSWORD .env

# Prüfe docker-compose.yml
grep N8N_BASIC_AUTH .env
```

### Basic Auth sollte aktiviert sein, wenn:
- `N8N_BASIC_AUTH_ACTIVE=true` in docker-compose.yml
- `N8N_PASSWORD` in .env gesetzt ist

### Falls Basic Auth nicht funktioniert:

```bash
cd /opt/mcp-connection-key

# Prüfe ob .env korrekt ist
cat .env | grep N8N

# n8n neu starten
docker-compose restart n8n

# Logs prüfen
docker-compose logs n8n | tail -20
```

## ✅ Empfohlener Ablauf

### 1. Setup durchführen (einfachste Methode)

1. Öffnen Sie: `http://138.199.237.34:5678/setup`
2. Erstellen Sie einen Admin-User
3. Notieren Sie sich E-Mail und Passwort
4. Nach dem Setup können Sie sich einloggen

### 2. Optional: Basic Auth später aktivieren

Nach dem ersten Login können Sie Basic Auth in n8n aktivieren:
- Settings → Security → Basic Auth

## 🔄 Falls Setup-Seite nicht verschwindet

```bash
# Auf Hetzner Server
cd /opt/mcp-connection-key

# n8n Container neu starten
docker-compose restart n8n

# Warten
sleep 10

# Prüfen
curl http://localhost:5678/healthz
```

## 📝 Wichtige Informationen

**Nach dem Setup:**
- Login-URL: `http://138.199.237.34:5678`
- Verwenden Sie die erstellten Zugangsdaten

**Für HTTPS später:**
- Nach HTTPS-Setup: `https://n8n.werdemeisterdeinergedankenagent.de`
- Gleiche Zugangsdaten

## 🎯 Nächste Schritte nach Setup

1. ✅ n8n Setup abschließen
2. ✅ n8n Workflow importieren (Mailchimp Integration)
3. ✅ DNS-Eintrag erstellen (All-Inkl)
4. ✅ HTTPS einrichten

