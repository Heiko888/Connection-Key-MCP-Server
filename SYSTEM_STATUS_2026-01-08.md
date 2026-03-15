da wüste ich jetzt gerne was # 📋 SYSTEM STATUS & KONFIGURATION

**Stand:** 8. Januar 2026  
**Dokumentiert von:** Cursor AI Assistant  
**Zweck:** Zentrale Dokumentation der aktuellen Server-Konfiguration und Deployment-Status

---

## 🎯 ÜBERSICHT

Das System besteht aus **2 Servern** mit klarer Aufgabentrennung:

| Server | IP | Hauptfunktion | Domain |
|--------|-----|---------------|---------|
| **Hetzner MCP** | 138.199.237.34 | MCP Server, n8n, Stripe | `mcp.the-connection-key.de` |
| **CK-App** | 167.235.224.149 | Next.js Frontend, Supabase | `the-connection-key.de` |

---

## 🖥️ SERVER 1: HETZNER MCP (138.199.237.34)

### Services & Ports

```
✅ MCP Server (connection-key) - Port 3000
✅ n8n Workflow Engine - Port 5678
✅ Reading Agent (PM2) - Port 4000
✅ Stripe Payment Processing
```

### Verzeichnisstruktur

```
/opt/mcp-connection-key/
├── connection-key/
│   ├── server.js (Express.js)
│   ├── routes/
│   │   ├── stripe.js ✅
│   │   ├── reading.js
│   │   ├── chat.js
│   │   └── ...
│   └── middleware/
├── production/
│   └── server.js (Reading Agent - PM2)
├── .env (Stripe Keys, OpenAI, etc.)
└── docker-compose.yml
```

### Environment Variables (.env)

```bash
# STRIPE CONFIGURATION (✅ Seit 8.1.2026 bereinigt - keine Duplikate mehr)
STRIPE_SECRET_KEY=sk_live_xxxxx... (konfiguriert)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx... (konfiguriert)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx... (konfiguriert)

# Stripe Price IDs (13 Produkte)
STRIPE_BASIC_PRICE_ID=price_1SOkVrJj1GR6pGhBBQ16JirB
STRIPE_PREMIUM_PRICE_ID=price_1SOkXvJj1GR6pGhBzdJbGu1J
STRIPE_VIP_PRICE_ID=price_1SOkYfJj1GR6pGhBizhGTbe3
STRIPE_CONNECTION_KEY_DREI=price_1SOkf4Jj1GR6pGhBiOtJM1T2
STRIPE_CONNECTION_KEY_FUENF=price_1SOkhyJj1GR6pGhBNtHUlCfc
STRIPE_CONNECTION_KEY_EINZEL=price_1SP5SxJj1GR6pGhBp8WskdE1
STRIPE_PENTA_EINZEL=price_1SX62EJj1GR6pGhBxAdlXXnx
STRIPE_PENTA_ERWEITERT=price_1SX63IJj1GR6pGhBd6Vq1sc5
STRIPE_PENTA_PREMIUM=price_1SX63vJj1GR6pGhBTrwo7CIS
STRIPE_HD_BASIS=price_1SZFgDJj1GR6pGhB2L4hDpKo
STRIPE_HD_ERWEITERT=price_1SZFkCJj1GR6pGhBvgTXCnui
STRIPE_HD_PREMIUM=price_1SZG2RJj1GR6pGhB7QsxZUte
STRIPE_HD_PLANETEN=price_1SZG3gJj1GR6pGhBSxGHRpTP
```

### Stripe Webhook (Stripe Dashboard)

```
URL: https://mcp.the-connection-key.de/api/stripe/webhook
Status: ✅ Aktiv
Events: checkout.session.completed, customer.subscription.*, invoice.payment_*
```

### API-Routen (MCP Server)

```
POST /api/stripe/webhook - Stripe Webhook (public, kein Auth)
POST /api/stripe/create-checkout-session - Checkout-Session erstellen
POST /agent/{agentId} - Agent-Anfragen
POST /reading/generate - Reading generieren
GET  /health - Health Check
```

---

## 🖥️ SERVER 2: CK-APP (167.235.224.149)

### Services & Ports

```
✅ Next.js Frontend - Port 3000 (Docker)
✅ Nginx Reverse Proxy - Ports 80/443
✅ Grafana, Prometheus, Redis
```

### Verzeichnisstruktur

```
/opt/hd-app/The-Connection-Key/
├── frontend/ (Next.js)
│   ├── app/api/coach/
│   │   ├── readings-v2/create/route.ts ✅
│   │   └── agents/ ✅
│   ├── lib/agents/registry.ts ✅
│   └── ...
├── .env
└── docker-compose.yml
```

### Environment Variables (.env)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://njjcywgskzepikyzhihy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=(konfiguriert)
SUPABASE_SERVICE_ROLE_KEY=(konfiguriert)

# Stripe (❌ NUR PUBLIC KEY - Rest auf Hetzner!)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SCU0yJj1GR6pGhBC0BMsHgvnJ9WhmgWzKelYPhto57c5jiDi3pam0SbTWqCDenA2Rnc20XramXkJ5oPQ5omFija00PlmW4JKr

# MCP Server URL
MCP_SERVER_URL=http://138.199.237.34:7000
```

---

## 🔄 ÄNDERUNGEN AM 8. JANUAR 2026

### ✅ Abgeschlossen

1. **Stripe-Migration auf Hetzner MCP**
   - Alle Stripe-Keys von Server 167 nach Server 138 verschoben
   - Stripe-Routen auf Hetzner MCP implementiert (`/api/stripe/*`)
   - Webhook-URL im Stripe Dashboard aktualisiert
   - Doppelte .env-Einträge auf Hetzner bereinigt

2. **Server 167 (CK-App) bereinigt**
   - Stripe Secret Keys entfernt (nur Public Key behalten)
   - Frontend kommuniziert über MCP_SERVER_URL

3. **Dokumentations-Bereinigung**
   - Über 150 alte Dokumentationen gelöscht
   - DIESE DATEI ist die EINZIGE aktuelle Dokumentation

---

## 🔍 LOCAL vs. SERVER

### Lokales Projekt

```
C:\AppProgrammierung\Projekte\MCP_Connection_Key\
```

**Status:**
- ✅ Git Repository
- ✅ docker-compose.yml aktuell
- ✅ Dokumentation bereinigt (nur noch diese Datei)

### Deployment-Workflow

```bash
# 1. Lokal entwickeln
cd C:\AppProgrammierung\Projekte\MCP_Connection_Key\

# 2. Git commit & push
git add .
git commit -m "Beschreibung"
git push

# 3. Auf Server pullen
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key
git pull origin main
docker-compose restart frontend
```

---

## 🚨 WICHTIGE REGELN

### ⚠️ Stripe nur auf Hetzner!

```
❌ NICHT auf Server 167 (CK-App)
✅ NUR auf Server 138 (Hetzner MCP)
```

### ⚠️ Frontend kommuniziert über MCP_SERVER_URL

```javascript
fetch(`${process.env.NEXT_PUBLIC_MCP_SERVER_URL}/api/stripe/create-checkout-session`, {
  method: 'POST',
  body: JSON.stringify({ packageId: 'basic' })
})
```

---

## 📝 NÄCHSTE SCHRITTE

### Bei Bedarf

1. Stripe-Zahlungen testen
2. Frontend-Seiten testen
3. Diese Dokumentation aktuell halten

---

## 🔗 WICHTIGE LINKS

### Domains
- **Frontend:** https://the-connection-key.de
- **MCP Server:** https://mcp.the-connection-key.de

### Server-Zugriff
```bash
ssh root@138.199.237.34  # Hetzner MCP
ssh root@167.235.224.149 # CK-App
```

---

## 📞 SUPPORT & DEBUGGING

### Logs anzeigen

```bash
# Hetzner MCP
ssh root@138.199.237.34
docker logs connection-key --tail 100

# CK-App Frontend
ssh root@167.235.224.149
docker logs the-connection-key-frontend-1 --tail 100
```

---

## ✅ DEPLOYMENT-CHECKLISTE

- [x] Stripe auf Hetzner MCP konfiguriert
- [x] Stripe-Webhook im Dashboard aktualisiert  
- [x] Server 167 von Stripe-Keys bereinigt
- [x] Doppelte .env-Einträge entfernt
- [x] Dokumentation erstellt und bereinigt
- [ ] Stripe-Zahlung getestet

---

**Letzte Aktualisierung:** 8. Januar 2026, 02:45 Uhr  
**Status:** ✅ AKTUELL - EINZIGE WAHRHEITSQUELLE
