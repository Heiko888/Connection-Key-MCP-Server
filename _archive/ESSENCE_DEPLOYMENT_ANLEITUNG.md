# 🚀 Essence-Integration - Deployment-Anleitung

**Datum:** 2025-01-03

---

## 📋 Deployment-Schritte

### **1. Datenbank-Migration ausführen**

**In Supabase Dashboard:**
1. Öffne Supabase Dashboard
2. Gehe zu **SQL Editor**
3. Kopiere Inhalt von `integration/supabase/migrations/016_add_essence_to_readings.sql`
4. Führe die Migration aus

**ODER via Supabase CLI:**
```bash
supabase db push
```

---

### **2. Hetzner Server (138.199.237.34)**

**n8n Workflow aktualisieren:**
```bash
ssh root@138.199.237.34
cd /opt/mcp-connection-key
git pull origin feature/reading-agent-option-a-complete

# n8n Workflow in n8n importieren/aktualisieren
# (Workflow-Datei: n8n-workflows/reading-generation-workflow.json)
```

**Reading Agent läuft bereits** ✅ (kein Neustart nötig)

---

### **3. Frontend Server (167.235.224.149)**

**Frontend-Komponenten deployen:**
```bash
ssh root@167.235.224.149
cd /opt/hd-app/The-Connection-Key

# Git Pull (falls Git-Repository vorhanden)
# ODER: Dateien manuell kopieren:
# - integration/frontend/components/ReadingDisplay.tsx → frontend/components/ReadingDisplay.tsx
# - integration/api-routes/reading-response-types.ts → frontend/api-routes/reading-response-types.ts
# - integration/api-routes/app-router/readings/[id]/route.ts → frontend/app/api/readings/[id]/route.ts

# Docker Container neu bauen
cd frontend
docker-compose build
docker-compose up -d
```

---

## ✅ Verifikation

### **1. Datenbank prüfen:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'readings' AND column_name = 'essence';
-- Sollte: essence | text zurückgeben
```

### **2. API testen:**
```bash
# Reading mit Essence abrufen
curl -X GET "https://[your-domain]/api/readings/[reading-id]" \
  -H "Authorization: Bearer [user-jwt]"
# Sollte: { "essence": "...", ... } enthalten
```

### **3. Frontend testen:**
- Reading öffnen
- "Essence" Tab sollte sichtbar sein (wenn Essence vorhanden)
- Essence-Text sollte angezeigt werden

---

**Status:** ⏳ **BEREIT FÜR DEPLOYMENT**
