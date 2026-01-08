# 📊 SUPABASE DATENBANK SETUP

**Datum:** 8. Januar 2026  
**Projekt:** Connection-Key MCP Server  
**Supabase URL:** https://njjcywgskzepikyzhihy.supabase.co

---

## 🎯 ÜBERSICHT

Dieses Verzeichnis enthält SQL-Skripte zum Erstellen der Datenbank-Tabellen für den Connection-Key Server.

---

## 📋 TABELLEN

### **Existieren bereits:**
- ✅ `coach_readings` - Human Design Readings
- ✅ `reading_versions` - Reading Versionen

### **Müssen erstellt werden:**
- ❌ `partner_matchings` - Partner-Matching Ergebnisse
- ❌ `user_subscriptions` - Stripe Subscriptions
- ❌ `payment_history` - Payment Historie
- ❌ `user_profiles` - User Profile (optional)

---

## 🚀 INSTALLATION

### **Schritt 1: Supabase SQL Editor öffnen**

1. Gehe zu: https://app.supabase.com/project/njjcywgskzepikyzhihy
2. Klicke auf **SQL Editor** im linken Menü
3. Klicke auf **New Query**

### **Schritt 2: SQL-Skript ausführen**

1. Öffne die Datei `create_tables.sql`
2. Kopiere den **GESAMTEN** Inhalt
3. Füge ihn in den SQL Editor ein
4. Klicke auf **Run** (oder drücke `Ctrl+Enter`)

### **Schritt 3: Ergebnis prüfen**

Du solltest folgende Meldungen sehen:

```
NOTICE: Tabellenerstellung abgeschlossen!
NOTICE: ✅ partner_matchings
NOTICE: ✅ user_subscriptions
NOTICE: ✅ payment_history
NOTICE: ✅ user_profiles
```

### **Schritt 4: Tabellen verifizieren**

1. Gehe zu **Table Editor** im linken Menü
2. Du solltest sehen:
   - ✅ partner_matchings
   - ✅ user_subscriptions
   - ✅ payment_history
   - ✅ user_profiles

---

## 🔐 ROW LEVEL SECURITY (RLS)

Alle Tabellen haben **Row Level Security** aktiviert:

### **partner_matchings:**
- ✅ User können ihre eigenen Matchings sehen
- ✅ Service Role hat vollen Zugriff

### **user_subscriptions:**
- ✅ User können ihre eigenen Subscriptions sehen
- ✅ Service Role hat vollen Zugriff

### **payment_history:**
- ⚠️ Nur Service Role hat Zugriff (sensible Daten)

### **user_profiles:**
- ✅ User können ihr eigenes Profil sehen/bearbeiten
- ✅ Service Role hat vollen Zugriff

---

## 📊 TABELLEN-SCHEMA

### **1. partner_matchings**

```sql
id                UUID PRIMARY KEY
user_id_1         UUID (FK auth.users)
user_id_2         UUID (FK auth.users)
matching_type     TEXT
result            JSONB
status            TEXT
metadata          JSONB
created_at        TIMESTAMPTZ
updated_at        TIMESTAMPTZ
```

**Indexes:** user_id_1, user_id_2, created_at

---

### **2. user_subscriptions**

```sql
id                      UUID PRIMARY KEY
user_id                 UUID (FK auth.users)
package_id              TEXT
stripe_session_id       TEXT UNIQUE
stripe_customer_id      TEXT
stripe_subscription_id  TEXT
status                  TEXT
payment_status          TEXT
amount_total            INTEGER
currency                TEXT
metadata                JSONB
activated_at            TIMESTAMPTZ
current_period_start    TIMESTAMPTZ
current_period_end      TIMESTAMPTZ
cancel_at_period_end    BOOLEAN
canceled_at             TIMESTAMPTZ
created_at              TIMESTAMPTZ
updated_at              TIMESTAMPTZ
```

**Indexes:** user_id, stripe_session_id, stripe_customer_id, stripe_subscription_id, status, created_at

---

### **3. payment_history**

```sql
id                      UUID PRIMARY KEY
stripe_invoice_id       TEXT UNIQUE
stripe_customer_id      TEXT
stripe_subscription_id  TEXT
amount                  INTEGER
currency                TEXT
status                  TEXT
payment_intent          TEXT
paid_at                 TIMESTAMPTZ
failed_at               TIMESTAMPTZ
created_at              TIMESTAMPTZ
```

**Indexes:** stripe_invoice_id, stripe_customer_id, stripe_subscription_id, status, created_at

---

### **4. user_profiles** *(optional)*

```sql
id                UUID PRIMARY KEY
user_id           UUID UNIQUE (FK auth.users)
display_name      TEXT
avatar_url        TEXT
birth_date        DATE
birth_time        TIME
birth_place       TEXT
birth_latitude    NUMERIC
birth_longitude   NUMERIC
timezone          TEXT
preferences       JSONB
created_at        TIMESTAMPTZ
updated_at        TIMESTAMPTZ
```

**Indexes:** user_id

---

## ✅ NACH DER INSTALLATION

### **Testen:**

1. **Stripe Webhook Test:**
   ```bash
   # Checkout Session simulieren
   curl -X POST https://mcp.the-connection-key.de/api/stripe/create-checkout-session \
     -H "Content-Type: application/json" \
     -d '{"packageId":"basic"}'
   ```

2. **Daten in Supabase prüfen:**
   - Gehe zu **Table Editor**
   - Wähle `user_subscriptions`
   - Prüfe ob Daten eingetragen wurden

3. **Reading Test:**
   ```bash
   # Reading abrufen (falls ID bekannt)
   curl https://mcp.the-connection-key.de/api/reading/YOUR_READING_ID
   ```

---

## 🔧 TROUBLESHOOTING

### **Problem: Tabellen existieren bereits**
```sql
-- Tabellen löschen und neu erstellen
DROP TABLE IF EXISTS public.partner_matchings CASCADE;
DROP TABLE IF EXISTS public.user_subscriptions CASCADE;
DROP TABLE IF EXISTS public.payment_history CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Dann create_tables.sql erneut ausführen
```

### **Problem: Permission Denied**
- Stelle sicher, dass du als **Admin** eingeloggt bist
- Service Role Key muss korrekt in `.env` sein

### **Problem: Foreign Key Constraint**
- Die Tabelle `auth.users` muss existieren (Supabase Standard)
- Falls nicht, prüfe ob Supabase Auth aktiviert ist

---

## 📝 WARTUNG

### **Indexes prüfen:**
```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### **RLS Policies prüfen:**
```sql
SELECT tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### **Tabellengröße prüfen:**
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🎉 FERTIG!

Nach erfolgreicher Installation sind alle Tabellen bereit und der Connection-Key Server kann vollständig mit Supabase kommunizieren.

**Nächste Schritte:**
1. ✅ Tabellen erstellt
2. 🧪 Stripe Webhook testen
3. 🧪 Reading-Erstellung testen
4. 📊 Monitoring einrichten
