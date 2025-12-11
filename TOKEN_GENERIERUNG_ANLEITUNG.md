# 🔐 System-Token Generierung - Anleitung

**Zweck:** Sicheren `AGENT_SYSTEM_TOKEN` für System-Auth generieren

---

## 🚀 Schnellste Methode

### Option 1: OpenSSL (empfohlen)
```bash
openssl rand -hex 32
```

**Ergebnis:** 64 Zeichen Hex-String
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

### Option 2: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### Option 3: Python
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

### Option 4: /dev/urandom (Linux)
```bash
cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1
```

---

## 📋 Automatisches Script

**Script:** `generate-system-token.sh`

**Ausführen:**
```bash
chmod +x generate-system-token.sh
./generate-system-token.sh
```

**Das Script:**
- ✅ Prüft verfügbare Methoden
- ✅ Generiert 64-Zeichen Token
- ✅ Zeigt Token an
- ✅ Optional: Speichert in `.env.local`

---

## ⚙️ Token in docker-compose.yml einfügen

### Option 1: Automatisch (empfohlen)

**Script:** `add-system-token-to-docker-compose.sh`

```bash
chmod +x add-system-token-to-docker-compose.sh
./add-system-token-to-docker-compose.sh
```

**Das Script:**
- ✅ Generiert sicheren Token
- ✅ Fügt automatisch zu `docker-compose-redis-fixed.yml` hinzu
- ✅ Optional: Speichert in `.env`
- ✅ Prüft ob Token bereits existiert

---

### Option 2: Manuell

**1. Token generieren:**
```bash
TOKEN=$(openssl rand -hex 32)
echo $TOKEN
```

**2. In docker-compose-redis-fixed.yml einfügen:**
```yaml
services:
  frontend:
    environment:
      # ... andere Variablen ...
      MCP_SERVER_URL: ${MCP_SERVER_URL:-http://138.199.237.34:7000}
      AGENT_SYSTEM_TOKEN: ${AGENT_SYSTEM_TOKEN:-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2}
```

**Oder in .env Datei:**
```bash
# .env (nicht committen!)
AGENT_SYSTEM_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Dann in docker-compose.yml referenzieren:**
```yaml
services:
  frontend:
    env_file:
      - .env
```

---

## 🔒 Sicherheitshinweise

### ✅ DO:
- ✅ Token mindestens 32 Bytes (64 Hex-Zeichen)
- ✅ Token in `.env` oder `docker-compose.yml` speichern
- ✅ Token regelmäßig rotieren (alle 90 Tage)
- ✅ `.env` in `.gitignore` aufnehmen

### ❌ DON'T:
- ❌ Token in Git committen
- ❌ Token in Logs ausgeben
- ❌ Token in Frontend-Code verwenden
- ❌ Token mit `NEXT_PUBLIC_` Prefix (wird an Client gesendet!)

---

## 🧪 Token testen

**Nach dem Setzen in docker-compose.yml:**
```bash
# Container neu starten
docker compose -f docker-compose.yml up -d frontend

# Token aus Container holen
docker exec $(docker ps -q -f name=frontend) env | grep AGENT_SYSTEM_TOKEN

# Route testen
curl -X GET http://localhost:3000/api/system/agents/tasks \
  -H "x-agent-token: YOUR_TOKEN"
```

---

## 📝 Beispiel: Kompletter Workflow

```bash
# 1. Token generieren
TOKEN=$(openssl rand -hex 32)
echo "Token: $TOKEN"

# 2. In docker-compose.yml einfügen (manuell)
# AGENT_SYSTEM_TOKEN=$TOKEN

# 3. Container neu starten
docker compose -f docker-compose.yml up -d frontend

# 4. Testen
curl -X GET http://localhost:3000/api/system/agents/tasks \
  -H "x-agent-token: $TOKEN"
```

---

**🎯 Empfehlung: Verwende `generate-system-token.sh` für automatische Generierung!**
