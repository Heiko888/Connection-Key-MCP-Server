# 📋 Gesamt-Checkliste - MCP Connection Key System

## 🔴 PRIORITÄT 1: HTTPS für n8n (DRINGEND - läuft noch nicht)

### ✅ DNS-Eintrag erstellt
- [x] A-Record in All-Inkl: `n8n` → `138.199.237.34`
- [ ] DNS-Propagierung prüfen (5-15 Min warten)
- [ ] DNS-Verifizierung: `dig +short n8n.werdemeisterdeinergedankenagent.de`

### 🔒 SSL-Zertifikat einrichten
- [ ] Nginx für ACME-Challenge konfigurieren
- [ ] Certbot ausführen: `certbot --nginx -d n8n.werdemeisterdeinergedankenagent.de`
- [ ] SSL-Zertifikat erfolgreich erstellt
- [ ] Auto-Renewal testen

### ⚙️ n8n Environment anpassen
- [ ] `.env` Datei anpassen:
  - `N8N_HOST=n8n.werdemeisterdeinergedankenagent.de`
  - `N8N_PROTOCOL=https`
  - `WEBHOOK_URL=https://n8n.werdemeisterdeinergedankenagent.de/`
  - `N8N_SECURE_COOKIE=true`
- [ ] n8n Container neu starten: `docker-compose restart n8n`
- [ ] HTTPS-Zugriff testen: `https://n8n.werdemeisterdeinergedankenagent.de`

### ✅ Ergebnis
- [ ] n8n läuft über HTTPS
- [ ] Keine "secure cookie" Fehler mehr
- [ ] Webhook-URL aktualisiert

---

## 🟡 PRIORITÄT 2: Social Media & YouTube Agent

### 🤖 Agent-Definition erstellen
- [ ] Agent-Name festlegen (z.B. "Presence to Platform Agent" oder "SocialFlow Agent")
- [ ] Prompt-Datei erstellen: `/opt/ck-agent/prompts/social-youtube.txt`
- [ ] Agent-Config erstellen: `/opt/ck-agent/agents/social-youtube.json`

### 📁 Ordnerstruktur auf Server
- [ ] `/opt/ck-agent/agents/` prüfen/erstellen
- [ ] `/opt/ck-agent/prompts/` prüfen/erstellen
- [ ] Dateien hochladen/kopieren

### 🔧 MCP Integration
- [ ] MCP-Konfiguration erweitern: `/opt/mcp/mcp.config.json`
- [ ] Social/YouTube-Agent in Agent-Liste aufnehmen
- [ ] MCP neu starten: `systemctl restart mcp`

### 🧪 Agent testen
- [ ] Test-Request: `curl -X POST http://138.199.237.34:7000/agent/social-youtube ...`
- [ ] Antwort prüfen
- [ ] Verschiedene Anfragen testen (Reels, YouTube-Skripte, Posts)

### ✅ Ergebnis
- [ ] Agent läuft im MCP
- [ ] Kann Social Media Content generieren
- [ ] Kann YouTube-Skripte erstellen

---

## 🟢 PRIORITÄT 3: MCP Server Setup (falls noch nicht vorhanden)

### 📦 Installation
- [ ] Node.js installieren: `apt install -y nodejs npm`
- [ ] MCP-Verzeichnis erstellen: `mkdir -p /opt/mcp`
- [ ] MCP installieren: `npm install @modelcontextprotocol/server`

### 📝 Konfiguration
- [ ] `mcp.config.json` erstellen
- [ ] `server.js` erstellen
- [ ] Alle Agenten registrieren (Marketing, Automation, Sales, Social-YouTube)

### 🔄 Systemdienst
- [ ] Systemd-Service erstellen: `/etc/systemd/system/mcp.service`
- [ ] Service aktivieren: `systemctl enable mcp`
- [ ] Service starten: `systemctl start mcp`
- [ ] Status prüfen: `systemctl status mcp`

### ✅ Ergebnis
- [ ] MCP läuft auf Port 7000
- [ ] Alle Agenten erreichbar
- [ ] Service startet automatisch

---

## 🔵 PRIORITÄT 4: Mailchimp Integration (falls noch nicht fertig)

### 📊 Supabase
- [ ] `subscribers` Tabelle prüfen
- [ ] Indizes prüfen

### 🔗 Next.js API
- [ ] `/api/new-subscriber` Route prüfen
- [ ] Environment Variables prüfen (`N8N_API_KEY`, Supabase Keys)
- [ ] API testen

### 🔄 n8n Workflow
- [ ] Mailchimp-Workflow importieren
- [ ] Webhook-URL auf HTTPS aktualisieren
- [ ] API-Key konfigurieren
- [ ] Workflow aktivieren
- [ ] Test durchführen

### ✅ Ergebnis
- [ ] Double Opt-In funktioniert
- [ ] Subscriber werden in Supabase gespeichert
- [ ] n8n → Next.js → Supabase Pipeline läuft

---

## 🟣 PRIORITÄT 5: Domain & Branding (optional)

### 🌐 Domain für Social/YouTube Agent
- [ ] Domain-Name festlegen
- [ ] Domain verfügbar prüfen
- [ ] Domain registrieren (falls gewünscht)
- [ ] DNS konfigurieren (falls Subdomain)

### 🎨 Branding
- [ ] Logo-Wording definieren
- [ ] Farben & CI festlegen
- [ ] Brand-Story entwickeln

---

## 📊 Status-Übersicht

### ✅ Erledigt
- [x] Hetzner Server Setup
- [x] Docker & Docker Compose
- [x] n8n Installation
- [x] DNS-Eintrag für n8n erstellt
- [x] docker-compose.yml bereinigt (mcp-server entfernt)

### 🔄 In Arbeit
- [ ] HTTPS für n8n
- [ ] Social/YouTube Agent

### ⏳ Ausstehend
- [ ] MCP Server Setup (falls noch nicht vorhanden)
- [ ] Mailchimp Integration finalisieren
- [ ] Domain & Branding

---

## 🚀 Nächste Schritte (Reihenfolge)

1. **JETZT:** HTTPS für n8n abschließen
2. **DANN:** Social/YouTube Agent erstellen
3. **DANACH:** MCP Server Setup (falls nötig)
4. **SPÄTER:** Mailchimp Integration finalisieren
5. **OPTIONAL:** Domain & Branding

---

## 📝 Notizen

- Server-IP: `138.199.237.34`
- Domain: `werdemeisterdeinergedankenagent.de`
- n8n Subdomain: `n8n.werdemeisterdeinergedankenagent.de`
- MCP Port: `7000` (falls eingerichtet)

