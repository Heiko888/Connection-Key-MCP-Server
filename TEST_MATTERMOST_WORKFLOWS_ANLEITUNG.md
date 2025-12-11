# 🧪 Mattermost Workflows testen

**Status:** Test-Skript erstellt

---

## 🚀 Test auf dem Server ausführen

### Schritt 1: Skript auf Server kopieren (falls nötig)

```bash
# Auf deinem lokalen Rechner (Windows)
# Skript ist bereits im Repository: test-mattermost-workflows.sh
```

---

### Schritt 2: Auf Server wechseln

```bash
# SSH zum Server
ssh root@138.199.237.34
```

---

### Schritt 3: Ins Projekt-Verzeichnis wechseln

```bash
cd /opt/mcp-connection-key
```

---

### Schritt 4: Skript ausführbar machen

```bash
chmod +x test-mattermost-workflows.sh
```

---

### Schritt 5: Test ausführen

```bash
./test-mattermost-workflows.sh
```

---

## 📊 Erwartete Ergebnisse

### ✅ Erfolgreich

**Response sollte enthalten:**
- `"success": true` ODER
- `"Workflow was started"`

**Output:**
```
✅ ERFOLG: Workflow wurde gestartet!
```

---

### ❌ Fehler (404)

**Response:**
```json
{"code":404,"message":"This webhook is not registered for POST requests"}
```

**Bedeutung:**
- Workflow ist nicht aktiviert ODER
- HTTP Method ist GET statt POST

**Lösung:**
1. n8n öffnen: `https://n8n.werdemeisterdeinergedankenagent.de`
2. Workflow öffnen
3. **"Active" Toggle aktivieren** (GRÜN) ⭐
4. **"Webhook Trigger" Node öffnen**
5. **HTTP Method prüfen:** Sollte `POST` sein
6. Speichern
7. Test erneut ausführen

---

## 🔍 Manueller Test (Alternative)

### Test 1: Agent → Mattermost

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "marketing",
    "message": "Test-Nachricht",
    "userId": "test-user"
  }'
```

---

### Test 2: Reading → Mattermost

```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-01-01",
    "birthTime": "12:00",
    "birthPlace": "Berlin, Germany",
    "userId": "test-user"
  }'
```

---

## ✅ Checkliste

- [ ] Skript auf Server kopiert
- [ ] Skript ausführbar gemacht (`chmod +x`)
- [ ] Test ausgeführt
- [ ] Ergebnisse geprüft
- [ ] Falls 404 → Workflows in n8n aktiviert
- [ ] Falls 404 → HTTP Method auf POST geprüft
- [ ] Test erneut ausgeführt

---

## 🎯 Nächste Schritte

**Wenn beide Tests erfolgreich:**
- ✅ Mattermost Workflows sind funktionsfähig
- ✅ Weiter mit Frontend-Tests

**Wenn Tests fehlschlagen:**
- ❌ Workflows in n8n aktivieren (siehe `N8N_MATTERMOST_WORKFLOWS_AKTIVIEREN.md`)
- ❌ HTTP Method auf POST prüfen
- ❌ Test erneut ausführen

---

**Viel Erfolg!** 🚀
