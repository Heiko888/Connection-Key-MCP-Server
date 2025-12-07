# 🔍 Server-IP herausfinden

Wie Sie die IP-Adresse Ihres Hetzner Servers herausfinden.

## 🖥️ Methode 1: Auf dem Server selbst

Wenn Sie bereits per SSH verbunden sind:

```bash
# Einfachste Methode
hostname -I

# Oder
ip addr show | grep "inet " | grep -v 127.0.0.1

# Oder nur die erste IP
ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v 127.0.0.1 | head -1

# Oder mit ifconfig (falls installiert)
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Beispiel-Ausgabe:**
```
123.45.67.89
```

## 🌐 Methode 2: Hetzner Cloud Console

1. Gehen Sie zu [Hetzner Cloud Console](https://console.hetzner.cloud/)
2. Klicken Sie auf Ihren Server
3. Die IP-Adresse steht unter **"IPv4"** oder **"Public IP"**

## 📧 Methode 3: Aus E-Mail

Falls Sie eine E-Mail von Hetzner erhalten haben, steht die IP-Adresse dort.

## 🔗 Methode 4: Über SSH-Verbindung

Wenn Sie bereits per SSH verbunden sind, sehen Sie die IP in der SSH-Verbindungszeile:

```bash
ssh root@123.45.67.89  # ← Das ist Ihre IP
```

## ✅ Schnellste Methode (wenn bereits verbunden)

```bash
# Auf dem Hetzner Server ausführen
echo "Server IP: $(hostname -I | awk '{print $1}')"
```

## 📋 Für die Mailchimp Integration

Sie brauchen die IP für:

1. **n8n Webhook URL:**
   ```
   http://IHR-SERVER-IP:5678/webhook/mailchimp-confirmed
   ```

2. **n8n Interface:**
   ```
   http://IHR-SERVER-IP:5678
   ```

3. **API-Endpoints:**
   ```
   http://IHR-SERVER-IP:3000  (Connection-Key)
   http://IHR-SERVER-IP:4000  (ChatGPT-Agent)
   ```

## 🔐 Alternative: Domain verwenden

Falls Sie eine Domain haben, können Sie stattdessen verwenden:

- `https://n8n.yourdomain.com/webhook/mailchimp-confirmed`
- `https://api.yourdomain.com`

Dann müssen Sie:
1. DNS-Einträge erstellen
2. Nginx konfigurieren
3. SSL-Zertifikate installieren

## 💡 Tipp

Falls Sie die IP nicht finden, können Sie auch einfach auf dem Server prüfen:

```bash
# Auf Hetzner Server
curl ifconfig.me
```

Das zeigt Ihre öffentliche IP-Adresse.

