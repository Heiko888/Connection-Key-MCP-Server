# ✅ Port 4001 Entfernung: Abgeschlossen

**Datum:** 24.12.2025  
**Status:** Port 4001 komplett entfernt, Code auf Port 7000 umgestellt

---

## ✅ ERLEDIGT

### 1. Port 4001 gestoppt
- [x] PM2 Service `reading-agent` gestoppt ✅
- [x] PM2 Service `reading-agent` gelöscht ✅
- [x] Port 4001 ist frei ✅

### 2. Code auf Port 7000 geändert
- [x] `integration/api-routes/app-router/reading/generate/route.ts` ✅
  - Zeile 15: `4001` → `7000`
- [x] `integration/api-routes/app-router/coach/readings/route.ts` ✅
  - Zeile 15: `4001` → `7000`
- [x] `docker-compose-redis-fixed.yml` ✅
  - Zeile 57-58: `4001` → `7000`

---

## ⚠️ NOCH ZU LÖSEN

### 1. Endpoint anpassen
**Aktuell:**
```typescript
response = await fetch(`${READING_AGENT_URL}/reading/generate`, {
```

**Sollte sein:**
```typescript
response = await fetch(`${READING_AGENT_URL}/agents/reading`, {
```

### 2. Request-Format anpassen
**Aktuell:**
```typescript
body: JSON.stringify({
  birthDate, birthTime, birthPlace, readingType
})
```

**Sollte sein:**
```typescript
// 1. Chart aus Geburtsdaten berechnen (über n8n)
const chartResponse = await fetch(`${N8N_BASE_URL}/webhook/chart-calculation`, {
  method: 'POST',
  body: JSON.stringify({ birthDate, birthTime, birthPlace })
});
const chartData = await chartResponse.json();

// 2. Dann an Port 7000 senden
body: JSON.stringify({
  chart: chartData,
  readingType
})
```

### 3. Auth-Header hinzufügen
```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${process.env.READING_AGENT_TOKEN || ''}`
}
```

### 4. Frontend API-Route deployen
```bash
scp integration/api-routes/app-router/reading/generate/route.ts root@167.235.224.149:/tmp/
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key/frontend
mkdir -p app/api/reading/generate
cp /tmp/route.ts app/api/reading/generate/route.ts
docker compose -f docker-compose-redis-fixed.yml build frontend
docker compose -f docker-compose-redis-fixed.yml restart frontend
```

---

## 📊 ZUSAMMENFASSUNG

**Erledigt:**
- Port 4001 komplett entfernt ✅
- Code auf Port 7000 geändert ✅
- Docker Compose auf Port 7000 geändert ✅

**Offen:**
- Endpoint anpassen (`/agents/reading`)
- Chart-Berechnung implementieren
- Auth-Header hinzufügen
- Frontend API-Route deployen

**Status:** Port 4001 ist weg! ✅ Code zeigt jetzt auf Port 7000. ⚠️ Endpoint & Format müssen noch angepasst werden.
