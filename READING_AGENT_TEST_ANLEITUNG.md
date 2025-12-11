# 🧪 Reading Agent Test - Anleitung

**Status:** Request wurde empfangen ✅

---

## 📋 Aktueller Status

- ✅ Reading Agent läuft (PM2 Status: online)
- ✅ Request wurde empfangen (`POST /reading/generate`)
- ⚠️ Response muss noch geprüft werden

---

## 🔍 Diagnose-Schritte

### 1. Error-Logs prüfen

```bash
ssh root@138.199.237.34 "pm2 logs reading-agent --err --lines 10 --nostream"
```

**Erwartung:** Keine `userId is not defined` Fehler mehr

### 2. Vollständige Logs prüfen

```bash
ssh root@138.199.237.34 "pm2 logs reading-agent --lines 30 --nostream"
```

**Erwartung:** 
- Request-Log
- Erfolgreiche Response oder Fehler-Details

### 3. Reading Agent direkt testen

```bash
curl -X POST http://138.199.237.34:4001/reading/generate \
  -H "Content-Type: application/json" \
  -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin", "readingType": "detailed"}' \
  --max-time 60 \
  -v
```

**Erwartung:**
- HTTP 200 Status
- JSON Response mit `success: true`
- `reading` Feld mit Reading-Text
- `essence` Feld (optional)

---

## ✅ Erfolgskriterien

- [ ] Keine `userId is not defined` Fehler in Logs
- [ ] HTTP 200 Response
- [ ] JSON Response mit `success: true`
- [ ] `reading` Feld vorhanden
- [ ] Request dauert < 60 Sekunden

---

## 🔧 Wenn es noch hängt

### Problem: Request hängt (keine Response)

**Mögliche Ursachen:**
1. OpenAI API Key ungültig oder Quota erreicht
2. OpenAI API antwortet nicht
3. Essence-Generierung hängt

**Lösung:**
```bash
# Prüfe OpenAI API Key
ssh root@138.199.237.34 "grep OPENAI_API_KEY /opt/mcp-connection-key/production/.env"

# Prüfe OpenAI API direkt
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Problem: Fehler in Logs

**Lösung:**
- Logs genau prüfen
- Fehler-Meldung analysieren
- Ggf. OpenAI API Key prüfen

---

## 📊 Nächste Schritte nach erfolgreichem Test

1. **Frontend API testen:**
   ```bash
   curl -X POST http://localhost:3000/api/reading/generate \
     -H "Content-Type: application/json" \
     -d '{"birthDate": "1990-05-15", "birthTime": "14:30", "birthPlace": "Berlin"}' \
     --max-time 60
   ```

2. **JSON Parse Fix testen:**
   - Frontend-Seite öffnen
   - Reading generieren
   - Prüfen ob JSON Parse Fehler behoben ist

3. **n8n Workflows aktivieren:**
   - 12 Workflows importieren
   - Workflows aktivieren
   - Scheduled Tasks einrichten

---

**Bitte Error-Logs prüfen und Reading Agent nochmal testen!**

