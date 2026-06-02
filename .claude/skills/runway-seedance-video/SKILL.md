---
name: runway-seedance-video
description: Echte Videos über die Runway-API mit dem Modell Seedance 2.0 erzeugen (Text-to-Video, Image-to-Video, Reference-to-Video). Startet die Generierung, pollt bis fertig und lädt das fertige .mp4 lokal herunter. Use when the user wants to generate/create a video, animate an image, or mentions Runway, Seedance, text-to-video or image-to-video.
---

# Runway · Seedance 2.0 Video-Generierung

Dieser Skill erzeugt **echte Videos** über die offizielle Runway-API mit dem Modell
**`seedance2`** (Seedance 2.0). Er ersetzt **nicht** den text-basierten Video-Agenten
(`production/agent-video.js`, der nur Skripte/Storyboards schreibt) — er produziert
fertige Videodateien.

Die Arbeit erledigt das Skript **`generate.mjs`** (Node, ESM, SDK `@runwayml/sdk`):
Request bauen → Generierung starten → auf Fertigstellung pollen → `.mp4` herunterladen.

## Wichtig: Kosten
Jede echte Generierung verbraucht **Runway-Credits**. Vor langen/teuren Clips oder
mehreren Läufen **kurz beim Nutzer rückfragen**. Zum Validieren ohne Kosten gibt es
`--dry-run`.

## Voraussetzungen
1. **API-Key:** Env-Var `RUNWAYML_API_SECRET` muss gesetzt sein (Runway Developer
   Portal). Ist sie nicht gesetzt, den Nutzer danach fragen — **niemals** einen Key
   hardcoden oder committen.
2. **Dependencies:** Beim ersten Lauf, falls `node_modules/` im Skill-Ordner fehlt:
   ```bash
   cd .claude/skills/runway-seedance-video && npm install
   ```

## Ablauf
1. **Inputs vom Nutzer klären:**
   - **Modus:** `text` (nur Prompt), `image` (ein Startbild + Prompt) oder
     `reference` (mehrere Referenzbilder, im Prompt via `@IMG_1`, `@IMG_2`, … adressiert).
   - **Prompt:** möglichst konkret (Motiv, Stimmung, Kamerabewegung).
   - **Bilder:** lokale Pfade *oder* `https://`-URLs (lokale werden automatisch hochgeladen).
   - **Optional:** `--ratio` (Default `1280:720`, hochkant z. B. `720:1280`),
     `--duration` (Sekunden, Default `5`), `--output` (Zielpfad).
2. **Erst Dry-Run** (validiert Request, keine Credits):
   ```bash
   node generate.mjs --mode text --prompt "…" --dry-run
   ```
3. **Nach Bestätigung echt generieren** (verbraucht Credits, dauert einige Minuten):
   ```bash
   node generate.mjs --mode text --prompt "Sonnenaufgang über den Bergen, langsame Kamerafahrt"
   ```
4. **Ergebnis melden:** den ausgegebenen Pfad der gespeicherten `.mp4` weitergeben
   (Default: `.claude/skills/runway-seedance-video/output/seedance-<timestamp>.mp4`).
   Bei Fehler die Runway-Meldung (`failure`/`failureCode`) an den Nutzer weiterreichen.

## Beispiele
```bash
# Text-to-Video
node generate.mjs --mode text --prompt "Neonbeleuchtete Stadt bei Nacht, Regen, Kamerafahrt" --ratio 1280:720 --duration 5

# Image-to-Video (Startbild als erstes Frame)
node generate.mjs --mode image --image ./start.png --prompt "Die Kamera zoomt langsam heraus"

# Reference-to-Video (Charakter-/Produktkonsistenz, @IMG_n im Prompt)
node generate.mjs --mode reference --image person.png --image produkt.png \
  --prompt "@IMG_1 hält @IMG_2 in der Hand, weiches Studiolicht"
```
`node generate.mjs --help` zeigt alle Flags.

## Hinweise
- **Modell-Identifier:** `seedance2`. Per `--model <id>` überschreibbar (z. B. um andere
  Runway-Modelle wie `gen4_turbo` oder `veo3.1` zu testen).
- **Endpoint-Routing:** `text`/`reference` → `text_to_video`, `image` → `image_to_video`.
  Das SDK validiert das Modell nicht clientseitig (Pass-through); bei einem API-Fehler
  zu Modell/Parametern den Request aus der `--dry-run`-Ausgabe prüfen und Parameter
  (z. B. `ratio`, `duration`, Referenz-Form) gemäß `docs.dev.runwayml.com/api/` anpassen.
- **Sicherheit:** `RUNWAYML_API_SECRET` nur über Env/`.env` (in `.gitignore`).
  `node_modules/` und `output/` werden nicht committet.
