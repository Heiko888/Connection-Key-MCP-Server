# 🔍 API-Routes Konfiguration - Prüfung

**Status:** Prüfung durchgeführt

---

## ✅ Gefundene API-Routes

### App Router Struktur (korrekt!)

**In `/opt/hd-app/The-Connection-Key/frontend/app/api/agents/`:**
- ✅ `marketing/route.ts`
- ✅ `automation/route.ts`
- ✅ `sales/route.ts`
- ✅ `social-youtube/route.ts`
- ✅ `chart/route.ts`

**In `/opt/hd-app/The-Connection-Key/frontend/app/api/reading/`:**
- ✅ `generate/route.ts`

---

## 🔧 Erforderliche Konfiguration

### Environment Variables

**Sollten in `.env.local` sein:**
```bash
# MCP Server (für Agenten 1-4)
MCP_SERVER_URL=http://138.199.237.34:7000

# Reading Agent (für Agent 5)
READING_AGENT_URL=http://138.199.237.34:4001
```

### API-Route Konfiguration

**Jede Route sollte verwenden:**
- `process.env.MCP_SERVER_URL` (für Agenten 1-4)
- `process.env.READING_AGENT_URL` (für Reading Agent)
- Fallback: `http://138.199.237.34:7000` oder `http://138.199.237.34:4001`

---

## 📋 Prüf-Checkliste

### API-Routes prüfen

- [ ] Marketing Route verwendet `MCP_SERVER_URL`
- [ ] Automation Route verwendet `MCP_SERVER_URL`
- [ ] Sales Route verwendet `MCP_SERVER_URL`
- [ ] Social-YouTube Route verwendet `MCP_SERVER_URL`
- [ ] Reading Route verwendet `READING_AGENT_URL`

### Environment Variables prüfen

- [ ] `.env.local` existiert
- [ ] `MCP_SERVER_URL` ist gesetzt
- [ ] `READING_AGENT_URL` ist gesetzt
- [ ] URLs sind korrekt (`http://138.199.237.34:7000` und `:4001`)

---

## 🚀 Nächste Schritte

### Falls Environment Variables fehlen:

**Auf CK-App Server:**
```bash
cd /opt/hd-app/The-Connection-Key/frontend
nano .env.local
```

**Hinzufügen:**
```bash
MCP_SERVER_URL=http://138.199.237.34:7000
READING_AGENT_URL=http://138.199.237.34:4001
```

**Dann Frontend neu starten:**
```bash
pm2 restart the-connection-key
# Oder
npm run build
```

---

## 🧪 Testen

**Marketing Agent:**
```bash
curl -X POST https://www.the-connection-key.de/api/agents/marketing \
  -H "Content-Type: application/json" \
  -d '{"message": "Test"}'
```

**Reading Agent:**
```bash
curl -X POST https://www.the-connection-key.de/api/reading/generate \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin"
  }'
```

---

**Status:** ⏳ Prüfung läuft - Details folgen

