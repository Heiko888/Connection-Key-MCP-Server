# ✅ Frontend .env.local - Prüfung

**Datum:** 17.12.2025

**Status:** `.env.local` existiert bereits!

---

## ✅ Was bereits vorhanden ist

**Deine `.env.local` enthält:**
- ✅ `MCP_SERVER_URL=http://138.199.237.34:7000`
- ✅ `READING_AGENT_URL=http://138.199.237.34:4001`
- ✅ `NEXT_PUBLIC_SUPABASE_URL=https://njjcywgskzepikyzhihy.supabase.co`
- ✅ `N8N_API_KEY=b6b3c7f6e333769dba390a8e68a6272fa7d5be`
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qamN5d2dza3plcGlreXpo...` (scheint abgeschnitten!)

---

## ⚠️ Wichtig: SUPABASE_SERVICE_ROLE_KEY prüfen

**Dein Key scheint abgeschnitten zu sein!**

**JWT Tokens sind normalerweise > 200 Zeichen lang und haben 3 Teile:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qamN5d2dza3plcGlreXpoaWh5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY5OTk5OTk5OSwiZXhwIjoyMDAwMDAwMDB9.xyz1234567890abcdef...
```

**Prüfe ob der Key vollständig ist:**

```bash
cd /opt/mcp-connection-key/integration/frontend

# Prüfe Key-Länge
grep "^SUPABASE_SERVICE_ROLE_KEY=" .env.local | cut -d= -f2 | wc -c
```

**Erwartung:** > 200 Zeichen

**Falls zu kurz:** Key aus Server `.env` vollständig kopieren!

---

## 🔍 Vollständige Prüfung

**Auf dem Server ausführen:**

```bash
cd /opt/mcp-connection-key
chmod +x check-frontend-env-complete.sh
./check-frontend-env-complete.sh
```

**Das Skript prüft:**
- ✅ Alle Environment Variables vorhanden?
- ✅ SUPABASE_SERVICE_ROLE_KEY vollständig? (> 200 Zeichen)
- ✅ Next.js läuft?
- ⚠️ Muss Next.js neu gestartet werden?

---

## 🚀 Next.js neu starten (WICHTIG!)

**Falls `.env.local` geändert wurde, Next.js neu starten:**

```bash
# Falls Next.js mit PM2 läuft
pm2 restart nextjs-frontend

# ODER falls Next.js direkt läuft
# Prozess beenden (Ctrl+C) und neu starten:
cd /opt/mcp-connection-key/integration/frontend
npm run dev
```

**Warum?** Next.js lädt Environment Variables nur beim Start!

---

## 🧪 API Routes testen

**Nach dem Neustart:**

```bash
cd /opt/mcp-connection-key
./check-frontend-integration.sh
```

**Erwartung:**
- ✅ Frontend .env.local gefunden
- ✅ Alle Environment Variables gesetzt
- ✅ Agent API funktioniert (HTTP 200 statt 401)
- ✅ Reading API funktioniert (HTTP 200 statt 401)

---

## 🔧 Falls SUPABASE_SERVICE_ROLE_KEY unvollständig

**Key aus Server `.env` vollständig kopieren:**

```bash
cd /opt/mcp-connection-key

# Zeige vollständigen Key
grep "^SUPABASE_SERVICE_ROLE_KEY=" .env

# Kopiere den vollständigen Key in Frontend .env.local
# (manuell mit nano oder editor)
cd integration/frontend
nano .env.local
```

**Dann Next.js neu starten!**

---

## ✅ Checkliste

- [ ] `.env.local` existiert? ✅
- [ ] `SUPABASE_SERVICE_ROLE_KEY` vollständig? (> 200 Zeichen) ⚠️ Prüfen!
- [ ] Next.js neu gestartet? (nach Änderungen)
- [ ] API Routes funktionieren? (HTTP 200 statt 401)

---

**🔍 Prüfe zuerst ob SUPABASE_SERVICE_ROLE_KEY vollständig ist, dann Next.js neu starten!** 🚀
