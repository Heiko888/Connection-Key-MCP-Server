# 🔐 n8n Passwort ändern

Anleitung zum Ändern des n8n Passworts auf dem Hetzner Server.

## 📝 Methode 1: .env Datei bearbeiten

### Schritt 1: .env Datei öffnen

```bash
cd /opt/mcp-connection-key
nano .env
```

### Schritt 2: N8N_PASSWORD ändern

Suchen Sie die Zeile:
```bash
N8N_PASSWORD=altes-passwort-hier
```

Ändern Sie sie zu:
```bash
N8N_PASSWORD=neues-sicheres-passwort
```

### Schritt 3: Speichern und schließen

In `nano`:
- `Ctrl + O` - Speichern
- `Enter` - Bestätigen
- `Ctrl + X` - Schließen

### Schritt 4: n8n Container neu starten

```bash
cd /opt/mcp-connection-key
docker-compose restart n8n
```

Oder alle Services neu starten:
```bash
docker-compose restart
```

## 🔄 Methode 2: Neues Passwort generieren

```bash
cd /opt/mcp-connection-key

# Generiere neues Passwort
NEW_PASSWORD=$(openssl rand -hex 16)
echo "Neues Passwort: $NEW_PASSWORD"

# Ändere .env Datei
sed -i "s/^N8N_PASSWORD=.*/N8N_PASSWORD=$NEW_PASSWORD/" .env

# Prüfe Änderung
grep N8N_PASSWORD .env

# n8n neu starten
docker-compose restart n8n

echo "✅ Passwort geändert!"
echo "Neues Passwort: $NEW_PASSWORD"
echo "⚠️  Notieren Sie sich dieses Passwort!"
```

## 🔍 Methode 3: Aktuelles Passwort anzeigen

Falls Sie das aktuelle Passwort vergessen haben:

```bash
cd /opt/mcp-connection-key
grep N8N_PASSWORD .env
```

## ⚠️ Wichtige Hinweise

1. **Sicheres Passwort verwenden:**
   - Mindestens 16 Zeichen
   - Groß- und Kleinbuchstaben
   - Zahlen und Sonderzeichen

2. **Passwort sicher aufbewahren:**
   - Verwenden Sie einen Passwort-Manager
   - Notieren Sie es an einem sicheren Ort

3. **Nach Änderung:**
   - n8n Container muss neu gestartet werden
   - Alte Sessions werden ungültig
   - Sie müssen sich neu einloggen

## 🔐 Passwort-Generierung

Für ein sicheres Passwort:

```bash
# 32 Zeichen (sehr sicher)
openssl rand -hex 16

# Oder mit mehr Zeichen
openssl rand -base64 24
```

## 🧪 Passwort testen

Nach dem Ändern können Sie das Passwort testen:

```bash
# n8n sollte erreichbar sein
curl -u admin:NEUES_PASSWORT http://localhost:5678/healthz

# Oder im Browser
# http://IHR-SERVER-IP:5678
# Login: admin / NEUES_PASSWORT
```

## 🆘 Passwort vergessen?

Falls Sie das Passwort vergessen haben:

1. **Passwort aus .env anzeigen:**
   ```bash
   cd /opt/mcp-connection-key
   grep N8N_PASSWORD .env
   ```

2. **Oder neues Passwort setzen:**
   ```bash
   cd /opt/mcp-connection-key
   NEW_PASS=$(openssl rand -hex 16)
   sed -i "s/^N8N_PASSWORD=.*/N8N_PASSWORD=$NEW_PASS/" .env
   docker-compose restart n8n
   echo "Neues Passwort: $NEW_PASS"
   ```

## 📋 Schnell-Referenz

```bash
# Passwort ändern
cd /opt/mcp-connection-key
nano .env  # N8N_PASSWORD=neues-passwort
docker-compose restart n8n

# Passwort anzeigen
grep N8N_PASSWORD .env

# Neues Passwort generieren und setzen
NEW_PASS=$(openssl rand -hex 16)
sed -i "s/^N8N_PASSWORD=.*/N8N_PASSWORD=$NEW_PASS/" .env
docker-compose restart n8n
echo "Neues Passwort: $NEW_PASS"
```

