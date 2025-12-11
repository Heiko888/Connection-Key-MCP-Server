# 📋 Alle TODOs - Vollständige Übersicht

**Stand:** Alle noch offenen Aufgaben

---

## 🔴 Priorität 1 (Kritisch - Muss gemacht werden)

### 1. Brand Book Deployment

- [ ] **Reading Agent Deployment**
  - [ ] `production/server.js` auf Hetzner Server kopieren
  - [ ] Brand Book Knowledge auf Server kopieren (`production/knowledge/brandbook/`)
  - [ ] Reading Agent neu starten (`pm2 restart reading-agent`)
  - [ ] Testen ob Brand Book Knowledge geladen wird

- [ ] **MCP Agenten Brand Book Integration**
  - [ ] `update-all-agents-brandbook.sh` auf Hetzner Server ausführen
  - [ ] MCP Server neu starten (`systemctl restart mcp`)
  - [ ] Prüfen ob alle 4 Agenten Brand Book haben (Marketing, Automation, Sales, Social-YouTube)

**Geschätzter Aufwand:** 30 Minuten

---

### 2. Frontend-Integration (Kritisch!)

- [ ] **API-Routes auf CK-App Server erstellen**
  - [ ] `/api/agents/marketing.ts` erstellen
  - [ ] `/api/agents/automation.ts` erstellen
  - [ ] `/api/agents/sales.ts` erstellen
  - [ ] `/api/agents/social-youtube.ts` erstellen
  - [ ] `/api/readings/generate.ts` erstellen

- [ ] **Frontend-Komponenten erstellen**
  - [ ] `components/AgentChat.tsx` erstellen
  - [ ] `components/AgentCard.tsx` erstellen
  - [ ] `pages/coach/agents/index.tsx` (Dashboard) erstellen
  - [ ] `pages/coach/agents/[agentId].tsx` (Einzelner Agent) erstellen
  - [ ] `pages/coach/readings/create.tsx` (Reading Generator) erstellen/erweitern

- [ ] **CORS & Sicherheit konfigurieren**
  - [ ] CORS für CK-App Server auf Hetzner Server erlauben
  - [ ] API-Keys für Server-zu-Server Kommunikation setzen
  - [ ] Firewall-Regeln prüfen

- [ ] **Environment Variables setzen**
  - [ ] `MCP_SERVER_URL` in `.env.local` auf CK-App Server
  - [ ] `READING_AGENT_URL` in `.env.local` auf CK-App Server
  - [ ] `NEXT_PUBLIC_MCP_SERVER_URL` setzen
  - [ ] `NEXT_PUBLIC_READING_AGENT_URL` setzen

**Geschätzter Aufwand:** 4-6 Stunden

---

## 🟡 Priorität 2 (Wichtig - Sollte gemacht werden)

### 3. n8n Workflows aktivieren

- [ ] **Workflows importieren**
  - [ ] `mailchimp-subscriber.json` in n8n importieren
  - [ ] `chart-calculation-workflow.json` in n8n importieren
  - [ ] `agent-automation-workflows.json` in n8n importieren
  - [ ] `mattermost-agent-notification.json` in n8n importieren
  - [ ] `mattermost-scheduled-reports.json` in n8n importieren
  - [ ] `mattermost-reading-notification.json` in n8n importieren

- [ ] **Workflows aktivieren**
  - [ ] Alle Workflows aktivieren (Active Toggle)
  - [ ] Webhook-URLs notieren
  - [ ] Environment Variables in n8n setzen (MATTERMOST_WEBHOOK_URL, etc.)

- [ ] **Workflows testen**
  - [ ] Mailchimp Workflow testen
  - [ ] Chart Calculation Workflow testen
  - [ ] Agent Automation Workflows testen
  - [ ] Mattermost Workflows testen

**Geschätzter Aufwand:** 30 Minuten

---

### 4. Mattermost Integration umsetzen

- [ ] **Mattermost Webhook erstellen**
  - [ ] Mattermost öffnen
  - [ ] Integrations → Incoming Webhooks
  - [ ] Webhook erstellen
  - [ ] Webhook-URL kopieren

- [ ] **n8n Environment Variables setzen**
  - [ ] `MATTERMOST_WEBHOOK_URL` setzen
  - [ ] `MATTERMOST_CHANNEL` setzen

- [ ] **Workflows testen**
  - [ ] Agent → Mattermost testen
  - [ ] Reading → Mattermost testen
  - [ ] Scheduled Reports testen

**Geschätzter Aufwand:** 15 Minuten

---

### 5. Automatisierung einrichten

- [ ] **Scheduled Tasks**
  - [ ] Tägliche Marketing-Content-Generierung einrichten
  - [ ] Wöchentliche Newsletter-Erstellung einrichten
  - [ ] Automatische Reading-Generierung bei User-Registrierung

- [ ] **Event-Trigger**
  - [ ] User-Registrierung → Reading generieren
  - [ ] Neuer Abonnent → Mailchimp
  - [ ] Chart-Berechnung → n8n Webhook

- [ ] **Multi-Agent-Pipelines**
  - [ ] Marketing → Social-YouTube → Mattermost
  - [ ] Reading → Chart Development → Mattermost

**Geschätzter Aufwand:** 2-3 Stunden

---

## 🟢 Priorität 3 (Nice-to-Have - Kann gemacht werden)

### 6. Design-Konsistenz finalisieren

- [ ] **Design-Richtlinien Deployment**
  - [ ] Design-Richtlinien sind bereits in `update-all-agents-brandbook.sh`
  - [ ] Script ausführen (wird mit Brand Book Deployment erledigt)
  - [ ] Prüfen ob Design-Richtlinien in Prompts vorhanden sind

**Geschätzter Aufwand:** Inkludiert in Brand Book Deployment

---

### 7. Redis Security finalisieren

- [ ] **Redis Container mit redis.conf neu starten**
  - [ ] Prüfen ob `redis.conf` auf Server vorhanden ist
  - [ ] Container mit `redis.conf` neu starten
  - [ ] Prüfen ob Redis mit Security läuft

**Geschätzter Aufwand:** 10 Minuten

---

### 8. Monitoring & Logging

- [ ] **Health Checks für alle Services**
  - [ ] MCP Server Health Check
  - [ ] Reading Agent Health Check
  - [ ] n8n Health Check
  - [ ] Mattermost Health Check

- [ ] **Logging-Konfiguration**
  - [ ] Logging für alle Agenten
  - [ ] Error-Tracking einrichten
  - [ ] Log-Aggregation

**Geschätzter Aufwand:** 2-3 Stunden

---

### 9. Dokumentation vervollständigen

- [ ] **API-Dokumentation**
  - [ ] Alle API-Endpoints dokumentieren
  - [ ] Request/Response-Beispiele
  - [ ] Error-Handling dokumentieren

- [ ] **Deployment-Anleitungen aktualisieren**
  - [ ] Schritt-für-Schritt Anleitungen
  - [ ] Troubleshooting-Guide
  - [ ] Best Practices

**Geschätzter Aufwand:** 2-3 Stunden

---

## 📊 TODO-Übersicht nach Kategorie

### Brand Book & Design
- [ ] Reading Agent Deployment (Brand Book)
- [ ] MCP Agenten Brand Book Integration
- [ ] Design-Konsistenz finalisieren

### Frontend-Integration
- [ ] API-Routes erstellen (5 Routes)
- [ ] Frontend-Komponenten erstellen
- [ ] CORS & Sicherheit konfigurieren
- [ ] Environment Variables setzen

### n8n & Automatisierung
- [ ] n8n Workflows importieren (6 Workflows)
- [ ] n8n Workflows aktivieren
- [ ] Scheduled Tasks einrichten
- [ ] Event-Trigger einrichten
- [ ] Multi-Agent-Pipelines

### Mattermost Integration
- [ ] Mattermost Webhook erstellen
- [ ] Environment Variables setzen
- [ ] Workflows testen

### Infrastructure
- [ ] Redis Security finalisieren
- [ ] Monitoring & Logging
- [ ] Dokumentation vervollständigen

---

## ⏱️ Geschätzter Gesamtaufwand

| Priorität | Aufgaben | Aufwand |
|-----------|----------|---------|
| **Priorität 1** | Brand Book + Frontend | ~5-7 Stunden |
| **Priorität 2** | n8n + Mattermost + Automatisierung | ~3-4 Stunden |
| **Priorität 3** | Monitoring + Dokumentation | ~4-6 Stunden |
| **Gesamt** | **Alle TODOs** | **~12-17 Stunden** |

---

## 🎯 Quick-Win Checkliste (Kann schnell erledigt werden)

### < 30 Minuten:
- [ ] Brand Book Deployment (30 Min)
- [ ] n8n Workflows importieren (15 Min)
- [ ] Mattermost Webhook erstellen (10 Min)
- [ ] Redis Security finalisieren (10 Min)

### < 1 Stunde:
- [ ] n8n Workflows aktivieren (30 Min)
- [ ] Mattermost Integration testen (30 Min)

### > 1 Stunde:
- [ ] Frontend-Integration (4-6 Stunden)
- [ ] Automatisierung einrichten (2-3 Stunden)
- [ ] Monitoring & Logging (2-3 Stunden)

---

## 📋 Nächste Schritte (Empfohlene Reihenfolge)

### Diese Woche:
1. ✅ Brand Book Deployment (30 Min)
2. ✅ Mattermost Integration (15 Min)
3. ✅ n8n Workflows aktivieren (30 Min)

### Diese Woche/Nächste Woche:
4. ✅ Frontend-Integration (4-6 Stunden)
5. ✅ Automatisierung einrichten (2-3 Stunden)

### Später:
6. ✅ Monitoring & Logging (2-3 Stunden)
7. ✅ Dokumentation vervollständigen (2-3 Stunden)

---

## ✅ Zusammenfassung

**Offene TODOs:**
- 🔴 **Priorität 1:** 2 große Aufgaben (Brand Book + Frontend)
- 🟡 **Priorität 2:** 3 Aufgaben (n8n + Mattermost + Automatisierung)
- 🟢 **Priorität 3:** 3 Aufgaben (Monitoring + Dokumentation)

**Gesamt:** ~12-17 Stunden Arbeit

**Quick Wins:** Brand Book Deployment, Mattermost Integration, n8n Workflows (zusammen ~1 Stunde)

---

**Status:** 📋 8 Hauptkategorien mit insgesamt ~25 konkreten Aufgaben

