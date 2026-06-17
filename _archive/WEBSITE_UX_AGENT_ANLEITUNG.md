# 🚀 Website / UX Agent - Komplette Anleitung

**Datum:** 17.12.2025

**Ziel:** Website / UX Agent operativ anlegen und testen

---

## 📋 Übersicht

Der Website / UX Agent analysiert Webseiten, Landingpages und App-Seiten aus UX-, Struktur- und Conversion-Sicht und liefert konkrete, umsetzbare Verbesserungsvorschläge.

**Agent-ID:** `website-ux-agent`  
**Name:** Website / UX Agent  
**Kategorie:** Website • UX • Conversion

---

## 🚀 Schritt 1: Agent auf Server erstellen

**Auf dem Hetzner Server (138.199.237.34) ausführen:**

```bash
# Script auf Server kopieren
scp create-website-ux-agent.sh root@138.199.237.34:/opt/mcp-connection-key/

# Auf Server einloggen
ssh root@138.199.237.34

# Script ausführen
cd /opt/mcp-connection-key
chmod +x create-website-ux-agent.sh
./create-website-ux-agent.sh
```

**Das Script erstellt automatisch:**
- ✅ Agent-Konfiguration: `/opt/ck-agent/agents/website-ux-agent.json`
- ✅ System-Prompt: `/opt/ck-agent/prompts/website-ux-agent.txt`
- ✅ Startet MCP Server neu (damit Agent erkannt wird)

---

## ✅ Schritt 2: Agent testen

**Direkt nach dem Erstellen testen:**

```bash
# Auf Server (138.199.237.34)
curl -X POST http://localhost:7000/agent/website-ux-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Analysiere folgende Seite aus UX- und Conversion-Sicht: https://www.the-connection-key.de/agents\n\nZiel: Orientierung, Vertrauen, Premium-Wirkung\nZielgruppe: Externe Nutzer (keine internen Agenten)"
  }' | python3 -m json.tool
```

**Oder von deinem lokalen Rechner:**

```bash
curl -X POST http://138.199.237.34:7000/agent/website-ux-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Analysiere folgende Seite aus UX- und Conversion-Sicht: https://www.the-connection-key.de/agents\n\nZiel: Orientierung, Vertrauen, Premium-Wirkung\nZielgruppe: Externe Nutzer (keine internen Agenten)"
  }' | python3 -m json.tool
```

**Erwartetes Ergebnis:**
- ✅ Konkrete Seitenstruktur-Empfehlungen
- ✅ Headline- & Textlängen-Vorschläge
- ✅ Bildtypen-Empfehlungen
- ✅ CTA-Logik
- ✅ Trust-Elemente
- ✅ UX-Hürden & Reibungspunkte

---

## 🎨 Schritt 3: Frontend-Integration (Optional)

**Falls du den Agenten im Frontend verwenden willst:**

### 3.1 API-Route kopieren

**Von deinem lokalen Rechner:**

```powershell
cd c:\AppProgrammierung\Projekte\MCP_Connection_Key

# API-Route auf Server kopieren
scp integration/api-routes/agents-website-ux-agent.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/pages/api/agents/website-ux-agent.ts
```

**Oder auf dem Server (falls Pages Router):**

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe Router-Typ
if [ -d "pages" ]; then
  mkdir -p pages/api/agents
  # API-Route kopieren (von integration/)
  cp integration/api-routes/agents-website-ux-agent.ts pages/api/agents/website-ux-agent.ts
  echo "✅ API-Route kopiert"
fi
```

### 3.2 Docker Container neu bauen

```bash
cd /opt/hd-app/The-Connection-Key
docker compose stop frontend
docker compose build frontend
docker compose up -d frontend
```

### 3.3 Frontend-API-Route testen

```bash
curl -X POST http://localhost:3000/api/agents/website-ux-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Analysiere folgende Seite: https://www.the-connection-key.de/agents",
    "userId": "test"
  }' | python3 -m json.tool
```

---

## 📝 Agent-Details

### Konfiguration

**Datei:** `/opt/ck-agent/agents/website-ux-agent.json`

```json
{
  "id": "website-ux-agent",
  "name": "Website / UX Agent",
  "description": "Analysiert Webseiten, Landingpages und App-Seiten aus UX-, Struktur- und Conversion-Sicht. Liefert konkrete, umsetzbare Verbesserungsvorschläge.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/website-ux-agent.txt",
  "model": "gpt-4",
  "temperature": 0.6,
  "maxTokens": 6000
}
```

**Temperature:** 0.6 (ausgewogen zwischen kreativ und präzise)  
**Max Tokens:** 6000 (detaillierte Analysen)

---

### System-Prompt

**Datei:** `/opt/ck-agent/prompts/website-ux-agent.txt`

Der Prompt enthält:
- ✅ Spezialisierung: Website-, UX- und Conversion-Analyse
- ✅ Fokus: Nutzerführung, Emotion, Klarheit, Premium, Conversion
- ✅ Grundregeln: Konkrete Lösungen, keine vagen Aussagen
- ✅ Arbeitsweise: Seitenabschnitte, Layout-Logik, Scroll-Verhalten
- ✅ Output: Umsetzbare Vorschläge für Entwickler

---

## 🎯 Verwendung

### Beispiel 1: URL-Analyse

```bash
curl -X POST http://138.199.237.34:7000/agent/website-ux-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Analysiere folgende Seite: https://www.example.com\n\nZiel: Conversion (Newsletter-Anmeldung)\nZielgruppe: B2B Entscheider"
  }'
```

### Beispiel 2: Screenshot-Beschreibung

```bash
curl -X POST http://138.199.237.34:7000/agent/website-ux-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Analysiere folgende Landingpage:\n\nHero: Headline 'Willkommen', CTA 'Jetzt starten'\nContent: 3 Spalten mit Features\nFooter: Links, Copyright\n\nZiel: Premium-Wirkung, Vertrauen\nZielgruppe: High-End Kunden"
  }'
```

### Beispiel 3: Struktur-Optimierung

```bash
curl -X POST http://138.199.237.34:7000/agent/website-ux-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Wie sollte eine Landingpage für ein Premium-Produkt strukturiert sein?\n\nAktuelle Struktur: Hero → Features → Pricing → Footer\n\nZiel: Emotionale Verbindung, Premium-Wahrnehmung"
  }'
```

---

## ✅ Checkliste

- [ ] Script auf Server kopiert
- [ ] Script ausgeführt (`./create-website-ux-agent.sh`)
- [ ] MCP Server neu gestartet
- [ ] Agent getestet (curl-Befehl)
- [ ] Agent liefert konkrete Vorschläge
- [ ] Optional: Frontend-API-Route erstellt
- [ ] Optional: Docker Container neu gebaut
- [ ] Optional: Frontend-API-Route getestet

---

## 🎯 Nächste Schritte (nach erfolgreichem Test)

1. **Agent feinschärfen** (z. B. mehr Premium, mehr Emotion)
2. **Brand Book Integration** (falls gewünscht)
3. **Frontend-Komponente erstellen** (für direkte Nutzung im Frontend)
4. **Mit Marketing & Sales verzahnen** (für vollständige Strategie)

---

## 🔍 Troubleshooting

### Problem: Agent wird nicht erkannt

**Lösung:**
```bash
# MCP Server neu starten
systemctl restart mcp

# Prüfe Agent-Liste
curl http://localhost:7000/agents | python3 -m json.tool
```

### Problem: "Agent not found"

**Lösung:**
```bash
# Prüfe ob Config existiert
ls -la /opt/ck-agent/agents/website-ux-agent.json

# Prüfe ob Prompt existiert
ls -la /opt/ck-agent/prompts/website-ux-agent.txt

# Prüfe MCP Server Logs
journalctl -u mcp -n 50
```

---

**🎉 Der Website / UX Agent ist jetzt einsatzbereit!** 🚀
