# 🔐 Quick Token Setup - Schnellste Methode

**Zweck:** `AGENT_SYSTEM_TOKEN` schnell generieren und hinzufügen

---

## ⚡ Schnellste Methode (1 Befehl)

**Auf Server ausführen:**
```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key

# Token generieren und anzeigen
openssl rand -hex 32
```

**Ergebnis:** 64-Zeichen Token, z.B.:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**Dann manuell in `docker-compose-redis-fixed.yml` einfügen:**
```yaml
environment:
  # ... andere Variablen ...
  AGENT_SYSTEM_TOKEN: ${AGENT_SYSTEM_TOKEN:-DEIN_TOKEN_HIER}
```

**Oder in `.env` Datei:**
```bash
AGENT_SYSTEM_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

---

## 🤖 Automatisch (empfohlen)

**Script:** `add-system-token-to-docker-compose.sh`

```bash
chmod +x add-system-token-to-docker-compose.sh
./add-system-token-to-docker-compose.sh
```

**Das Script:**
- ✅ Generiert Token automatisch
- ✅ Fügt zu `docker-compose-redis-fixed.yml` hinzu
- ✅ Optional: Speichert in `.env`
- ✅ Prüft ob Token bereits existiert

---

## 📋 Wo genau in docker-compose-redis-fixed.yml?

**Füge nach `NEXT_PUBLIC_READING_AGENT_URL` hinzu:**
```yaml
environment:
  # ... andere Variablen ...
  READING_AGENT_URL: ${READING_AGENT_URL:-http://138.199.237.34:4001}
  NEXT_PUBLIC_READING_AGENT_URL: ${NEXT_PUBLIC_READING_AGENT_URL:-http://138.199.237.34:4001}
  
  # System Auth Token (für /api/system/** Routen)
  AGENT_SYSTEM_TOKEN: ${AGENT_SYSTEM_TOKEN:-DEIN_TOKEN_HIER}
  
  # Stripe
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
```

---

## ✅ Nach dem Hinzufügen

**1. Container neu starten:**
```bash
docker compose -f docker-compose-redis-fixed.yml up -d frontend
```

**2. Token testen:**
```bash
# Token aus Container holen
TOKEN=$(docker exec $(docker ps -q -f name=frontend) env | grep AGENT_SYSTEM_TOKEN | cut -d'=' -f2)

# Route testen
curl -X GET http://localhost:3000/api/system/agents/tasks \
  -H "x-agent-token: $TOKEN"
```

---

**🎯 Empfehlung: Verwende `add-system-token-to-docker-compose.sh` für automatische Einrichtung!**
