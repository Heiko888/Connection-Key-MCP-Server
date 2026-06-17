# 🎯 n8n - Erste 3 Workflows importieren (Schnellstart)

**Situation:** Keine Workflows in n8n vorhanden

**Ziel:** Die 3 wichtigsten Mattermost Workflows importieren und aktivieren

---

## 🚀 Schritt 1: n8n öffnen

1. Browser öffnen
2. Gehe zu: `https://n8n.werdemeisterdeinergedankenagent.de`
3. Einloggen (falls nötig)

---

## 📥 Schritt 2: Workflow 1 importieren

### "Agent → Mattermost Notification"

1. **Links:** Klicke auf **"Workflows"**
2. **Oben rechts:** Klicke auf **"+"** Button
3. **Dropdown:** Wähle **"Import from File"**
4. **Datei auswählen:** `n8n-workflows/mattermost-agent-notification.json`
5. **"Import"** klicken
6. **Workflow öffnen:** Klicke auf den importierten Workflow
7. **"Active" Toggle** aktivieren (muss GRÜN werden!)
8. **Testen:**
   ```bash
   curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
     -H "Content-Type: application/json" \
     -d '{"agentId":"marketing","message":"Test"}'
   ```

**Erwartung:** ✅ Mattermost Channel `#tech` bekommt Nachricht

---

## 📥 Schritt 3: Workflow 2 importieren

### "Reading Generation → Mattermost"

1. **Workflows** → **"+"** → **"Import from File"**
2. **Datei auswählen:** `n8n-workflows/mattermost-reading-notification.json`
3. **"Import"** klicken
4. **Workflow öffnen**
5. **"Active" Toggle** aktivieren (GRÜN!)
6. **Testen:**
   ```bash
   curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost \
     -H "Content-Type: application/json" \
     -d '{"birthDate":"1990-05-15","birthTime":"14:30","birthPlace":"Berlin"}'
   ```

**Erwartung:** ✅ Mattermost Channel `#readings` bekommt Nachricht

---

## 📥 Schritt 4: Workflow 3 importieren

### "Scheduled Agent Reports → Mattermost"

1. **Workflows** → **"+"** → **"Import from File"**
2. **Datei auswählen:** `n8n-workflows/mattermost-scheduled-reports.json`
3. **"Import"** klicken
4. **Workflow öffnen**
5. **"Active" Toggle** aktivieren (GRÜN!)
6. **Testen:** Workflow manuell ausführen (Button "Execute Workflow")

**Erwartung:** ✅ Mattermost Channel `#marketing` bekommt Nachricht

---

## ✅ Checkliste

**Nach dem Import:**
- [ ] Workflow 1 aktiviert ✅
- [ ] Workflow 2 aktiviert ✅
- [ ] Workflow 3 aktiviert ✅
- [ ] Test 1 erfolgreich ✅
- [ ] Test 2 erfolgreich ✅
- [ ] Test 3 erfolgreich ✅

---

## 🎯 Nächste Schritte

**Nach erfolgreichem Import der ersten 3 Workflows:**

1. **Logger Workflow importieren** (`logger-mattermost.json`)
2. **Multi-Agent Pipeline importieren** (`multi-agent-pipeline.json`)
3. **Weitere Workflows importieren** (siehe `N8N_WORKFLOWS_KOMPLETT_IMPORT.md`)

---

**Status:** 🎯 **Schnellstart-Anleitung erstellt!**
