# 🔐 Token Setup - Einfach erklärt

**Wichtig:** Es wird KEINE neue docker-compose Datei erstellt!

---

## ✅ Was bereits gemacht wurde

**`docker-compose-redis-fixed.yml` wurde aktualisiert:**
- ✅ `AGENT_SYSTEM_TOKEN: ${AGENT_SYSTEM_TOKEN}` wurde hinzugefügt
- ✅ Verwendet Variable aus `.env` Datei

**Du musst nur noch:**
1. Token generieren
2. In `.env` Datei speichern

---

## 🚀 Schnellste Methode

**Auf Server:**
```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key

# 1. Token generieren
TOKEN=$(openssl rand -hex 32)
echo "AGENT_SYSTEM_TOKEN=$TOKEN" >> .env

# 2. Container neu starten
docker compose -f docker-compose-redis-fixed.yml up -d frontend
```

**Fertig!** ✅

---

## 📋 Was passiert?

1. **Token wird generiert** (64 Zeichen)
2. **Token wird in `.env` gespeichert**
3. **docker-compose-redis-fixed.yml liest Token aus `.env`**
4. **Container bekommt Token als Environment Variable**

---

## 🧪 Testen

```bash
# Token aus Container holen
TOKEN=$(docker exec $(docker ps -q -f name=frontend) env | grep AGENT_SYSTEM_TOKEN | cut -d'=' -f2)

# Route testen
curl -X GET http://localhost:3000/api/system/agents/tasks \
  -H "x-agent-token: $TOKEN"
```

---

**🎯 Keine neue Datei - nur Token in `.env` speichern!**
