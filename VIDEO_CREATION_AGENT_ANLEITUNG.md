# 🎬 Video Creation Agent - Komplette Anleitung

**Datum:** 17.12.2025

**Ziel:** Video Creation Agent operativ anlegen und testen

---

## 📋 Übersicht

Der Video Creation Agent erstellt einfache, klare und gesprochene Video-Skripte für Reels, Shorts und YouTube. Er liefert Hooks, On-Screen-Text und plattformangepasste Inhalte.

**Agent-ID:** `video-creation-agent`  
**Name:** Video Creation Agent  
**Kategorie:** Video • Content • Skripte

---

## 🎯 Grundfunktionen (v1.0)

### 1. Video-Skript erstellen (Core-Funktion)

**Input:**
- Thema
- Plattform (Reel / Short / YouTube)
- Ziel (Awareness, Vertrauen, Conversion)

**Output (fixe Struktur):**
1. **Hook** (1–2 Sätze)
2. **Kernaussage**
3. **Erkenntnis / Shift**
4. **Abschluss / CTA**

### 2. Hook-Generator

- 3–5 Hook-Varianten
- Provokativ, neugierig, bewusstseinsöffnend
- Max. 8 Wörter (Reels) / 1 Satz (YouTube)

### 3. On-Screen-Text

- Kurze Kernaussagen
- Maximal 1 Gedanke pro Zeile
- Emotional + klar

### 4. Plattform-Anpassung

| Plattform | Anpassung                      |
| --------- | ------------------------------ |
| Reel      | kurz, direkt, starker Einstieg |
| Short     | etwas mehr Erklärung           |
| YouTube   | klarer Gedankengang            |

### 5. CTA-Bausteine

- "Wenn dich das triggert ..."
- "Mehr davon findest du ..."
- "Link ist da, wo er immer ist."

### 6. Klar definierte Grenzen

Der Agent:
- ❌ berechnet nichts
- ❌ kennt keine Charts
- ❌ macht keine Strategie
- ❌ postet nichts
- ❌ produziert keine Videos

**Er ist reiner Content-Lieferant.**

---

## 🚀 Schritt 1: Agent auf Server erstellen

**Auf dem Hetzner Server (138.199.237.34) ausführen:**

```bash
# Script auf Server kopieren
scp create-video-creation-agent.sh root@138.199.237.34:/opt/mcp-connection-key/

# Auf Server einloggen
ssh root@138.199.237.34

# Script ausführen
cd /opt/mcp-connection-key
chmod +x create-video-creation-agent.sh
./create-video-creation-agent.sh
```

**Das Script erstellt automatisch:**
- ✅ Agent-Konfiguration: `/opt/ck-agent/agents/video-creation-agent.json`
- ✅ System-Prompt: `/opt/ck-agent/prompts/video-creation-agent.txt`
- ✅ Startet MCP Server neu (damit Agent erkannt wird)

---

## ✅ Schritt 2: Agent testen

### Test 1: Video-Skript für Reel

```bash
curl -X POST http://localhost:7000/agent/video-creation-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle ein Video-Skript für ein Reel zum Thema: Dein Problem ist nicht dein Mindset.\n\nPlattform: Reel\nZiel: Awareness"
  }' | python3 -m json.tool
```

### Test 2: Hook-Generator

```bash
curl -X POST http://localhost:7000/agent/video-creation-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle 5 Hook-Varianten für ein Video zum Thema: Manifestation scheitert nicht – du schon.\n\nPlattform: Reel\nMax. 8 Wörter pro Hook"
  }' | python3 -m json.tool
```

### Test 3: On-Screen-Text

```bash
curl -X POST http://localhost:7000/agent/video-creation-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle On-Screen-Text für folgende Kernaussage: Du willst Veränderung, aber du spielst noch alte Rollen.\n\nMax. 1 Gedanke pro Zeile"
  }' | python3 -m json.tool
```

### Test 4: Plattform-Anpassung

```bash
curl -X POST http://localhost:7000/agent/video-creation-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle dasselbe Video-Skript für alle drei Plattformen:\n\nThema: Dein Problem ist nicht dein Mindset\n\nPlattformen: Reel, Short, YouTube"
  }' | python3 -m json.tool
```

**Erwartetes Ergebnis:**
- ✅ Klare Struktur (Hook, Kernaussage, Erkenntnis, CTA)
- ✅ Gesprochen tauglich
- ✅ Plattformangepasst
- ✅ Keine Verkaufstexte
- ✅ Keine Motivationssprüche

---

## 🎨 Schritt 3: Frontend-Integration (Optional)

**Falls du den Agenten im Frontend verwenden willst:**

### 3.1 API-Route kopieren

**Von deinem lokalen Rechner:**

```powershell
cd c:\AppProgrammierung\Projekte\MCP_Connection_Key

# API-Route auf Server kopieren
scp integration/api-routes/agents-video-creation-agent.ts root@167.235.224.149:/opt/hd-app/The-Connection-Key/frontend/pages/api/agents/video-creation-agent.ts
```

**Oder auf dem Server (falls Pages Router):**

```bash
cd /opt/hd-app/The-Connection-Key/frontend

# Prüfe Router-Typ
if [ -d "pages" ]; then
  mkdir -p pages/api/agents
  # API-Route kopieren (von integration/)
  cp integration/api-routes/agents-video-creation-agent.ts pages/api/agents/video-creation-agent.ts
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
curl -X POST http://localhost:3000/api/agents/video-creation-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle ein Video-Skript für ein Reel zum Thema: Dein Problem ist nicht dein Mindset.",
    "userId": "test"
  }' | python3 -m json.tool
```

---

## 📝 Agent-Details

### Konfiguration

**Datei:** `/opt/ck-agent/agents/video-creation-agent.json`

```json
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
```

**Temperature:** 0.7 (kreativ, aber strukturiert)  
**Max Tokens:** 4000 (ausreichend für Skripte)

---

### System-Prompt

**Datei:** `/opt/ck-agent/prompts/video-creation-agent.txt`

Der Prompt enthält:
- ✅ Core-Funktion: Video-Skript erstellen
- ✅ Hook-Generator: 3-5 Varianten
- ✅ On-Screen-Text: Kurze Kernaussagen
- ✅ Plattform-Anpassung: Reel/Short/YouTube
- ✅ CTA-Bausteine: Einfach, klar
- ✅ Klare Grenzen: Was er NICHT macht

---

## 🎯 Verwendung

### Beispiel 1: Komplettes Video-Skript

```bash
curl -X POST http://138.199.237.34:7000/agent/video-creation-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle ein komplettes Video-Skript:\n\nThema: Dein Problem ist nicht dein Mindset\nPlattform: Reel\nZiel: Awareness"
  }'
```

### Beispiel 2: Nur Hooks

```bash
curl -X POST http://138.199.237.34:7000/agent/video-creation-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle 5 Hook-Varianten für: Manifestation scheitert nicht – du schon.\n\nPlattform: Reel"
  }'
```

### Beispiel 3: Multi-Plattform

```bash
curl -X POST http://138.199.237.34:7000/agent/video-creation-agent \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Erstelle dasselbe Video-Skript für Reel, Short und YouTube:\n\nThema: Du willst Veränderung, aber du spielst noch alte Rollen"
  }'
```

---

## ✅ Checkliste

- [ ] Script auf Server kopiert
- [ ] Script ausgeführt (`./create-video-creation-agent.sh`)
- [ ] MCP Server neu gestartet
- [ ] Agent getestet (Video-Skript)
- [ ] Hook-Generator getestet
- [ ] On-Screen-Text getestet
- [ ] Plattform-Anpassung getestet
- [ ] Optional: Frontend-API-Route erstellt
- [ ] Optional: Docker Container neu gebaut
- [ ] Optional: Frontend-API-Route getestet

---

## 🎯 Nächste Schritte (nach erfolgreichem Test)

1. **Agent feinschärfen** (z. B. mehr Erkenntnis, weniger Motivation)
2. **Brand Book Integration** (falls gewünscht)
3. **Frontend-Komponente erstellen** (für direkte Nutzung im Frontend)
4. **Mit Marketing & Social-YouTube verzahnen** (für vollständige Content-Pipeline)

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
ls -la /opt/ck-agent/agents/video-creation-agent.json

# Prüfe ob Prompt existiert
ls -la /opt/ck-agent/prompts/video-creation-agent.txt

# Prüfe MCP Server Logs
journalctl -u mcp -n 50
```

---

**🎉 Der Video Creation Agent ist jetzt einsatzbereit!** 🚀
