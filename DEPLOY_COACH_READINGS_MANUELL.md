# 🚀 Coach Readings Route - Manuelles Deployment

**Datum:** 18.12.2025

---

## 📋 Schritt-für-Schritt Anleitung

### Schritt 1: Datei auf Server kopieren

**Von Windows PowerShell:**

```powershell
# Ins Projekt-Verzeichnis wechseln
cd c:\AppProgrammierung\Projekte\MCP_Connection_Key

# Datei auf Server kopieren
scp integration/api-routes/app-router/coach/readings/route.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/app/api/coach/readings/route.ts
```

**ODER auf dem Server direkt erstellen:**

```bash
# Auf CK-App Server einloggen
ssh root@167.235.224.149

# Verzeichnis erstellen
mkdir -p /opt/hd-app/The-Connection-Key/frontend/app/api/coach/readings

# Datei mit nano/vi erstellen (Inhalt aus integration/api-routes/app-router/coach/readings/route.ts kopieren)
nano /opt/hd-app/The-Connection-Key/frontend/app/api/coach/readings/route.ts
```

### Schritt 2: Container neu bauen

```bash
# Auf CK-App Server
cd /opt/hd-app/The-Connection-Key

# Container neu bauen (ohne Cache)
docker compose build --no-cache frontend
```

**⏱️ Das kann 5-10 Minuten dauern!**

### Schritt 3: Container neu starten

```bash
# Container neu starten
docker compose up -d frontend

# Warte 5 Sekunden
sleep 5

# Prüfe Status
docker compose ps frontend
```

### Schritt 4: Testen

```bash
# GET: API Info
curl -X GET http://localhost:3000/api/coach/readings

# POST: Connection Reading (Test)
curl -X POST http://localhost:3000/api/coach/readings \
  -H "Content-Type: application/json" \
  -d '{
    "reading_type": "connection",
    "client_name": "Test",
    "reading_data": {
      "personA": {
        "name": "Heiko",
        "geburtsdatum": "1980-12-08",
        "geburtszeit": "22:10",
        "geburtsort": "Miltenberg, Germany"
      },
      "personB": {
        "name": "Jani",
        "geburtsdatum": "1977-06-03",
        "geburtszeit": "19:49",
        "geburtsort": "Wolfenbüttel, Germany"
      }
    }
  }' | jq .
```

---

## ✅ Nach dem Deployment

Die bestehende `page.tsx` funktioniert jetzt mit der Relationship Analysis API:

1. ✅ User wählt Mode `'connection'` im Wizard
2. ✅ Füllt Person A und Person B Daten aus
3. ✅ Klickt auf "Reading erstellen"
4. ✅ Route `/api/coach/readings` wird aufgerufen
5. ✅ Route erkennt `reading_type === 'connection'`
6. ✅ Ruft automatisch Relationship Analysis Agent auf
7. ✅ Speichert Ergebnis in Supabase
8. ✅ Zeigt Reading an

---

**🎯 Alles bereit für das Deployment!** 🚀



