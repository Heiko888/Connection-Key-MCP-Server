# 💬 Mattermost + n8n Aktivierung - Schritt für Schritt

**Ziel:** Mattermost mit n8n verbinden und Workflows aktivieren

**Aufwand:** 15-20 Minuten

---

## 📋 Übersicht

Es gibt **3 Mattermost-Workflows**, die aktiviert werden können:

1. **Agent → Mattermost** (`mattermost-agent-notification.json`)
   - Sendet Agent-Antworten an Mattermost
   - Webhook: `/webhook/agent-mattermost`

2. **Reading → Mattermost** (`mattermost-reading-notification.json`)
   - Sendet Reading-Benachrichtigungen an Mattermost
   - Webhook: `/webhook/reading-mattermost`

3. **Scheduled Reports → Mattermost** (`mattermost-scheduled-reports.json`)
   - Tägliche Marketing-Reports (9:00 Uhr)
   - Automatischer Trigger

---

## 🚀 Schritt 1: Mattermost Webhooks erstellen

### 1.1 Mattermost öffnen

1. Öffnen Sie Ihre Mattermost-Instanz
   - URL: Ihre Mattermost-URL (z.B. `https://mattermost.ihre-domain.de`)
   - Oder: `http://138.199.237.34:8065` (falls auf Hetzner Server)

### 1.2 Incoming Webhooks erstellen

**Für jeden Workflow einen Webhook erstellen:**

#### Webhook 1: Agent-Benachrichtigungen

1. **Integrations** → **Incoming Webhooks**
2. **Add Incoming Webhook** klicken
3. **Title:** `n8n Agent Notifications`
4. **Channel:** `#general` (oder gewünschter Channel)
5. **Description:** `Agent-Antworten von n8n`
6. **Save** klicken
7. **Webhook URL kopieren** (Format: `https://mattermost.ihre-domain.de/hooks/xxxxx`)
8. **Notieren:** `MATTERMOST_WEBHOOK_AGENT`

#### Webhook 2: Reading-Benachrichtigungen

1. **Add Incoming Webhook** klicken
2. **Title:** `n8n Reading Notifications`
3. **Channel:** `#readings` (oder gewünschter Channel)
4. **Description:** `Reading-Benachrichtigungen von n8n`
5. **Save** klicken
6. **Webhook URL kopieren**
7. **Notieren:** `MATTERMOST_WEBHOOK_READING`

#### Webhook 3: Scheduled Reports

1. **Add Incoming Webhook** klicken
2. **Title:** `n8n Scheduled Reports`
3. **Channel:** `#marketing` (oder gewünschter Channel)
4. **Description:** `Tägliche Marketing-Reports`
5. **Save** klicken
6. **Webhook URL kopieren**
7. **Notieren:** `MATTERMOST_WEBHOOK_REPORTS`

---

## 🚀 Schritt 2: Workflows in n8n importieren

### 2.1 n8n öffnen

1. Öffnen Sie n8n: `https://n8n.werdemeisterdeinergedankenagent.de`
2. **Workflows** → **"+"** → **"Import from File"**

### 2.2 Workflows importieren

**Importieren Sie diese 3 Dateien:**

1. `n8n-workflows/mattermost-agent-notification.json`
2. `n8n-workflows/mattermost-reading-notification.json`
3. `n8n-workflows/mattermost-scheduled-reports.json`

**Für jede Datei:**
- **Import** klicken
- Workflow wird erstellt
- **Noch NICHT aktivieren!**

---

## 🚀 Schritt 3: Webhook-URLs in Workflows eintragen

### 3.1 Workflow 1: Agent → Mattermost

1. **Workflow öffnen:** "Agent → Mattermost Notification"
2. **"Send to Mattermost" Node** doppelklicken
3. **URL-Feld:**
   - Ersetzen Sie: `https://mattermost.ihre-domain.de/hooks/xxxxx`
   - Mit Ihrer echten Webhook-URL: `MATTERMOST_WEBHOOK_AGENT`
4. **Channel prüfen:**
   - Sollte `#general` sein
   - Anpassen falls nötig
5. **Save** klicken

### 3.2 Workflow 2: Reading → Mattermost

1. **Workflow öffnen:** "Reading Generation → Mattermost"
2. **"Send to Mattermost" Node** doppelklicken
3. **URL-Feld:**
   - Ersetzen Sie: `https://mattermost.ihre-domain.de/hooks/xxxxx`
   - Mit Ihrer echten Webhook-URL: `MATTERMOST_WEBHOOK_READING`
4. **Channel prüfen:**
   - Sollte `#readings` sein
   - Anpassen falls nötig
5. **Save** klicken

### 3.3 Workflow 3: Scheduled Reports

1. **Workflow öffnen:** "Scheduled Agent Reports → Mattermost"
2. **"Send to Mattermost" Node** doppelklicken
3. **URL-Feld:**
   - Ersetzen Sie: `https://mattermost.ihre-domain.de/hooks/xxxxx`
   - Mit Ihrer echten Webhook-URL: `MATTERMOST_WEBHOOK_REPORTS`
4. **Channel prüfen:**
   - Sollte `#marketing` sein
   - Anpassen falls nötig
5. **Schedule prüfen:**
   - Cron: `0 9 * * *` (täglich 9:00 Uhr)
   - Anpassen falls nötig
6. **Save** klicken

---

## 🚀 Schritt 4: Workflows aktivieren

### 4.1 Prüfe ob alle Konfigurationen korrekt sind

**WICHTIG:** Bevor Sie aktivieren, prüfen Sie:

1. **Alle Mattermost Webhook-URLs eingetragen?**
   - ❌ Placeholder-URL: `https://mattermost.ihre-domain.de/hooks/xxxxx`
   - ✅ Echte URL: `https://mattermost.ihre-domain.de/hooks/abc123xyz`

2. **Alle Nodes zeigen keine roten Warnungen?**
   - Rote Warnungen = Problem, muss behoben werden

3. **Alle Credentials konfiguriert?**
   - Supabase, HTTP Auth, etc.

**Falls Fehler:** Siehe `N8N_WORKFLOW_AKTIVIERUNG_PROBLEM_FIX.md`

### 4.2 Alle Workflows aktivieren

**Für jeden Workflow:**

1. **Workflow öffnen**
2. **Alle Nodes prüfen** (keine roten Warnungen)
3. **"Active" Toggle** aktivieren (oben rechts)
4. **Falls Fehler:** "Please resolve outstanding issues before you activate it"
   - → Alle roten Warnungen beheben
   - → Placeholder-URLs ersetzen
   - → Erneut aktivieren versuchen
5. Workflow wird grün
6. **Fertig!**

---

## 🧪 Schritt 5: Testen

### 5.1 Agent → Mattermost testen

**Webhook-URL notieren:**
- `https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost`

**Test-Request:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/agent-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "marketing",
    "message": "Erstelle einen Marketing-Text für The Connection Key"
  }'
```

**Erwartung:**
- ✅ Agent wird aufgerufen
- ✅ Antwort wird an Mattermost gesendet
- ✅ Nachricht erscheint im `#general` Channel

---

### 5.2 Reading → Mattermost testen

**Webhook-URL notieren:**
- `https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost`

**Test-Request:**
```bash
curl -X POST https://n8n.werdemeisterdeinergedankenagent.de/webhook/reading-mattermost \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-05-15",
    "birthTime": "14:30",
    "birthPlace": "Berlin",
    "readingType": "basic"
  }'
```

**Erwartung:**
- ✅ Reading wird generiert
- ✅ Benachrichtigung wird an Mattermost gesendet
- ✅ Nachricht erscheint im `#readings` Channel

---

### 5.3 Scheduled Reports testen

**Manueller Test:**

1. **Workflow öffnen**
2. **"Execute Workflow"** klicken (oben rechts)
3. **Erwartung:**
   - ✅ Marketing Agent wird aufgerufen
   - ✅ Report wird an Mattermost gesendet
   - ✅ Nachricht erscheint im `#marketing` Channel

**Automatischer Test:**
- Workflow läuft täglich um 9:00 Uhr
- Prüfen Sie am nächsten Tag, ob Report ankommt

---

## ✅ Checkliste

### Mattermost Webhooks
- [ ] Webhook 1 erstellt (Agent Notifications)
- [ ] Webhook 2 erstellt (Reading Notifications)
- [ ] Webhook 3 erstellt (Scheduled Reports)
- [ ] Alle Webhook-URLs notiert

### n8n Workflows
- [ ] Workflow 1 importiert (Agent → Mattermost)
- [ ] Workflow 2 importiert (Reading → Mattermost)
- [ ] Workflow 3 importiert (Scheduled Reports)
- [ ] Alle Webhook-URLs in Workflows eingetragen
- [ ] Alle Channels geprüft/anangepasst
- [ ] Alle Workflows aktiviert

### Tests
- [ ] Agent → Mattermost getestet
- [ ] Reading → Mattermost getestet
- [ ] Scheduled Reports getestet (manuell)
- [ ] Nachrichten erscheinen in Mattermost

---

## 📊 Workflow-Übersicht

| Workflow | Webhook-Pfad | Mattermost Channel | Trigger |
|----------|--------------|-------------------|---------|
| Agent → Mattermost | `/webhook/agent-mattermost` | `#general` | Webhook |
| Reading → Mattermost | `/webhook/reading-mattermost` | `#readings` | Webhook |
| Scheduled Reports | - | `#marketing` | Schedule (9:00) |

---

## 🎯 Nächste Schritte

### Option 1: Mit anderen Workflows verbinden

**Beispiel: User Registration → Reading → Mattermost**

1. **User Registration Workflow** öffnen
2. **"Send to Mattermost" Node** hinzufügen
3. **URL:** Mattermost Webhook-URL
4. **Body:** Reading-Daten
5. **Verbinden:** Nach Reading-Generierung

### Option 2: Weitere Channels erstellen

- `#automation` - Automation Agent Benachrichtigungen
- `#sales` - Sales Agent Benachrichtigungen
- `#social-youtube` - Social-YouTube Agent Benachrichtigungen

### Option 3: Erweiterte Benachrichtigungen

- Formatierte Nachrichten mit Markdown
- Attachments für Dateien
- Buttons für Interaktionen
- Threads für Diskussionen

---

## 🔧 Troubleshooting

### Problem: "The service refused the connection" beim Marketing Agent Node

**Ursache:** n8n kann den MCP Server nicht erreichen

**Lösung:**
1. **MCP Server Status prüfen:**
   ```bash
   ssh root@138.199.237.34
   systemctl status mcp
   ```
   
2. **Falls nicht aktiv, starten:**
   ```bash
   systemctl start mcp
   ```

3. **Health Check testen:**
   ```bash
   curl http://138.199.237.34:7000/health
   ```

4. **Firewall prüfen:**
   ```bash
   ufw allow 7000/tcp
   ```

5. **Workflow URL prüfen:**
   - ✅ Korrekt: `http://138.199.237.34:7000/agent/marketing`
   - ❌ Falsch: `http://localhost:7000/agent/marketing` (funktioniert nicht von n8n)

**Detaillierte Anleitung:** Siehe `N8N_MCP_VERBINDUNG_QUICK_FIX.md`

---

### Problem: Nachrichten kommen nicht an

**Lösung:**
1. Webhook-URL prüfen (korrekt kopiert?)
2. Mattermost Channel prüfen (existiert der Channel?)
3. n8n Workflow Execution Log prüfen
4. Mattermost Webhook Log prüfen

### Problem: Falscher Channel

**Lösung:**
1. Workflow öffnen
2. "Send to Mattermost" Node öffnen
3. Channel-Feld anpassen
4. Save & Workflow aktivieren

### Problem: Webhook funktioniert nicht

**Lösung:**
1. Mattermost Webhook neu erstellen
2. Neue URL in n8n eintragen
3. Testen

---

## ✅ Fertig!

**Mattermost ist jetzt mit n8n verbunden!**

- ✅ 3 Workflows aktiviert
- ✅ Webhooks konfiguriert
- ✅ Tests erfolgreich

**Nächste Schritte:**
- Weitere Workflows mit Mattermost verbinden
- Automatisierungen erweitern
- Team-Benachrichtigungen einrichten

---

**Status:** 🎉 **Mattermost + n8n Integration aktiviert!**
