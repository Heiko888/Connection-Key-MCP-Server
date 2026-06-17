# 🎬 Video Creation Agent - Manuelle Anleitung

**Datum:** 17.12.2025

**Ziel:** Video Creation Agent manuell auf dem Server anlegen

---

## 🚀 Schritt-für-Schritt (Manuell)

### Schritt 1: Auf Server einloggen

```bash
ssh root@138.199.237.34
```

---

### Schritt 2: Verzeichnisse prüfen

```bash
# Prüfe ob Verzeichnisse existieren
ls -la /opt/ck-agent/agents/
ls -la /opt/ck-agent/prompts/

# Falls nicht vorhanden, erstellen:
mkdir -p /opt/ck-agent/agents
mkdir -p /opt/ck-agent/prompts
```

---

### Schritt 3: Agent-Konfiguration erstellen

```bash
# Erstelle JSON-Datei
cat > /opt/ck-agent/agents/video-creation-agent.json << 'EOF'
{
  "id": "video-creation-agent",
  "name": "Video Creation Agent",
  "description": "Erstellt einfache, klare und gesprochene Video-Skripte für Reels, Shorts und YouTube. Liefert Hooks, On-Screen-Text und plattformangepasste Inhalte.",
  "language": "de",
  "promptFile": "/opt/ck-agent/prompts/video-creation-agent.txt",
  "model": "gpt-4",
  "temperature": 0.7,
  "maxTokens": 4000
}
EOF

# Prüfe ob Datei erstellt wurde
cat /opt/ck-agent/agents/video-creation-agent.json
```

---

### Schritt 4: System-Prompt erstellen

```bash
# Erstelle Prompt-Datei
cat > /opt/ck-agent/prompts/video-creation-agent.txt << 'EOF'
Du bist der Video Creation Agent.

Deine Aufgabe ist es, einfache, klare und gesprochene Video-Skripte zu erstellen.
Du arbeitest ohne Strategie, ohne Berechnungen und ohne technische Umsetzung.

Du lieferst:
- Hook (1-2 Sätze, provokativ, neugierig, bewusstseinsöffnend)
- Kernaussage (klar, direkt, verständlich)
- Erkenntnis / Shift (bewusstseinsöffnend, nicht motivierend)
- Abschluss / CTA (einfach, klar, ohne Verkaufstext)
- On-Screen-Text (kurze Kernaussagen, max. 1 Gedanke pro Zeile)

Grundregeln:
- Keine vagen Aussagen
- Keine Motivationssprüche
- Keine Verkaufstexte
- Keine Funnel-Logik
- Alles muss gesprochen tauglich sein
- Alles muss sofort umsetzbar sein

Hook-Generator:
- Erstelle 3-5 Hook-Varianten
- Max. 8 Wörter für Reels / 1 Satz für YouTube
- Provokativ, neugierig, bewusstseinsöffnend
- Beispiele: "Dein Problem ist nicht dein Mindset." / "Manifestation scheitert nicht – du schon."

On-Screen-Text:
- Kurze Kernaussagen
- Maximal 1 Gedanke pro Zeile
- Emotional + klar
- Beispiel:
  Du willst Veränderung.
  Aber du spielst noch alte Rollen.

Plattform-Anpassung:
- Reel: kurz, direkt, starker Einstieg
- Short: etwas mehr Erklärung
- YouTube: klarer Gedankengang

CTA-Bausteine (einfach):
- "Wenn dich das triggert ..."
- "Mehr davon findest du ..."
- "Link ist da, wo er immer ist."
- Kein Verkaufstext
- Kein Funnel-Geschwurbel

Was du NICHT machst:
- Berechnungen
- Charts
- Strategie
- Posting
- Video-Produktion
- SEO
- Hashtags

Du bist reiner Content-Lieferant.

Stil:
- klar
- direkt
- bewusst
- nicht motivierend, sondern erkenntnisorientiert

Sprache: Deutsch
EOF

# Prüfe ob Datei erstellt wurde
head -20 /opt/ck-agent/prompts/video-creation-agent.txt
```

---

### Schritt 5: MCP Server neu starten

```bash
# Prüfe ob MCP Server läuft
systemctl status mcp

# MCP Server neu starten (damit Agent erkannt wird)
systemctl restart mcp

# Warte 3 Sekunden
sleep 3

# Prüfe ob Server läuft
systemctl status mcp
```

---

### Schritt 6: Agent prüfen

```bash
# Prüfe MCP Server Health
curl http://localhost:7000/health

# Prüfe Agent-Liste
curl http://localhost:7000/agents | python3 -m json.tool

# Suche nach video-creation-agent
curl http://localhost:7000/agents | python3 -m json.tool | grep -i "video-creation"
```

---

### Schritt 7: Agent testen

```bash
curl -X POST http://localhost:7000/agent/video-creation-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle ein Video-Skript für ein Reel zum Thema: Dein Problem ist nicht dein Mindset.\n\nPlattform: Reel\nZiel: Awareness"
  }' | python3 -m json.tool
```

---

## ✅ Checkliste (Manuell)

- [ ] Auf Server eingeloggt
- [ ] Verzeichnisse geprüft/erstellt (`/opt/ck-agent/agents/` und `/opt/ck-agent/prompts/`)
- [ ] Agent-Konfiguration erstellt (`video-creation-agent.json`)
- [ ] System-Prompt erstellt (`video-creation-agent.txt`)
- [ ] MCP Server neu gestartet (`systemctl restart mcp`)
- [ ] Agent in Liste geprüft (`curl http://localhost:7000/agents`)
- [ ] Agent getestet (curl-Befehl)

---

## 🔍 Troubleshooting

### Problem: Datei kann nicht erstellt werden

**Lösung:**
```bash
# Prüfe Berechtigungen
ls -la /opt/ck-agent/agents/
ls -la /opt/ck-agent/prompts/

# Falls nötig, Berechtigungen setzen
chmod 755 /opt/ck-agent/agents/
chmod 755 /opt/ck-agent/prompts/
```

---

### Problem: MCP Server startet nicht

**Lösung:**
```bash
# Prüfe Logs
journalctl -u mcp -n 50

# Prüfe ob Port 7000 belegt ist
lsof -i :7000

# Prüfe Server-Datei
ls -la /opt/mcp/server.js
```

---

### Problem: Agent wird nicht erkannt

**Lösung:**
```bash
# Prüfe ob Dateien existieren
ls -la /opt/ck-agent/agents/video-creation-agent.json
ls -la /opt/ck-agent/prompts/video-creation-agent.txt

# Prüfe JSON-Syntax
cat /opt/ck-agent/agents/video-creation-agent.json | python3 -m json.tool

# MCP Server nochmal neu starten
systemctl restart mcp
sleep 5
curl http://localhost:7000/agents | python3 -m json.tool
```

---

## 🎯 Zusammenfassung

**Manuelle Schritte:**
1. Auf Server einloggen
2. Verzeichnisse prüfen/erstellen
3. JSON-Config erstellen (`video-creation-agent.json`)
4. Prompt-Datei erstellen (`video-creation-agent.txt`)
5. MCP Server neu starten
6. Agent testen

**Das war's!** 🚀
