# CONTENT-THEMEN-DATENBANK — Dokumentation

**Stand:** 2026-04-20
**Version:** 1.0.0
**Status:** Ready for deployment
**Verantwortlich für Änderungen:** Jede Änderung MUSS hier dokumentiert werden (userPreferences-Regel).

---

## 1. Zweck & Scope

Diese Datenbank ist die zentrale **Content-Themen-Quelle für den automatisierten Social-Media-Output** des Connection Key. Sie wird vom `social-youtube` Agent (MCP Gateway, Port 7000) und n8n-Workflows genutzt, um automatisch Instagram-Posts, Reels, TikToks, YouTube-Shorts, LinkedIn-Artikel und Newsletter-Inhalte zu generieren.

**Abgrenzung:** Diese Datenbank ist **NICHT** dasselbe wie die Reading-Worker Knowledge-Base (`/opt/mcp-connection-key/reading-worker/knowledge/`). Readings werden separat generiert. Diese Datei liefert ausschließlich **Social-Content-Themen** mit Hooks und Formatempfehlungen.

---

## 2. Dateien & Speicherorte

| Datei | Zweck | Zielpfad auf Server |
|---|---|---|
| `content-topics.json` | Strukturierte Themen-Datenbank (maschinenlesbar) | `/opt/mcp-connection-key/content-topics/content-topics.json` |
| `CONTENT_TOPICS_DOKUMENTATION.md` | Diese Dokumentation | `/opt/mcp-connection-key/content-topics/README.md` |

**Empfohlener Container-Mount:** `/app/content-topics` (readonly für den Agent).

---

## 3. Statistik

- **25 Kategorien**
- **182 einzelne Content-Themen**
- **Reichweite:** Bei 6 Posts/Woche (5x Instagram + 1x TikTok/YT) → 30 Wochen ≈ **7 Monate ohne Wiederholung**
- **Alle Themen enthalten:** ID, Titel, Hook im Brand-Voice, empfohlene Formate, Content-Pillar (awareness/education/conversion), optional CTA und Reading-Verlinkung

---

## 4. Die 25 Kategorien im Überblick

### Priorität 1 — Kern-Content (Hauptfokus)

| ID | Kategorie | Themen | Zielgruppe |
|---|---|---|---|
| cat_01 | Dating & Anziehung | 12 | Primary |
| cat_02 | Beziehungen & Partnerschaft | 12 | Primary |
| cat_03 | Selbsterkenntnis & Identität | 12 | Primary |
| cat_04 | Business & Karriere | 12 | Secondary |
| cat_09 | Intimität & Sexualität | 6 | Primary |
| cat_17 | Provokant & Viral (dein Stil) | 8 | Primary |
| cat_24 | Aha-Momente & Hook-Library | 10 | Primary |

### Priorität 2 — Regelmäßiger Content

| ID | Kategorie | Themen | Zielgruppe |
|---|---|---|---|
| cat_05 | Emotionen & Klarheit | 8 | Primary |
| cat_06 | Gesundheit & Vitalität | 8 | Primary |
| cat_07 | Lebenssinn & Purpose | 6 | Primary |
| cat_10 | Familie & Herkunft | 6 | Primary |
| cat_11 | Freundschaften | 4 | Primary |
| cat_13 | Spiritualität & Tiefe | 6 | Primary |
| cat_14 | Trauma & Schattenarbeit | 6 | Primary |
| cat_15 | Geld & Überfluss | 5 | Secondary |
| cat_16 | Persönlichkeitsentwicklung | 6 | Primary |
| cat_18 | HD-Mythen & Missverständnisse | 6 | Primary |
| cat_19 | Coaches & Berater (B2B) | 5 | Secondary |

### Priorität 3 — Ergänzender Content

| ID | Kategorie | Themen | Zielgruppe |
|---|---|---|---|
| cat_08 | Teams & Gruppen | 6 | Secondary |
| cat_12 | Alltag & Lifestyle | 7 | Primary |
| cat_20 | Transits & Timing | 5 | Primary |
| cat_21 | Kanäle & Gates Deep Dive | 6 | Primary |
| cat_22 | Community & Testimonials | 4 | Primary |
| cat_25 | App & Produkt-Features | 8 | Primary |

### Priorität 4 — Saisonal

| ID | Kategorie | Themen | Zielgruppe |
|---|---|---|---|
| cat_23 | Saisonal & Zeitbezogen | 8 | Primary |

---

## 5. JSON-Struktur pro Topic

Jedes der 182 Themen hat diese Felder:

```json
{
  "id": "t_001",
  "title": "Warum du immer denselben Typ Mensch anziehst",
  "hook": "Es ist nicht 'dein Beuteschema'. Es sind deine offenen Zentren...",
  "format": ["reel_30s", "carousel_6slides"],
  "pillar": "awareness",
  "cta": "Hol dir dein Connection Reading."
}
```

**Felder:**
- `id` — eindeutige Topic-ID (t_001 bis t_182)
- `title` — interner Arbeitstitel
- `hook` — der tatsächliche Opener im Brand-Voice (wird vom Agent genutzt)
- `format` — Array von empfohlenen Formaten aus der Format-Liste (s.u.)
- `pillar` — optional: `awareness` / `education` / `conversion`
- `cta` — optional: Call-to-Action, wird an Post-Ende gehängt

---

## 6. Formate

| Format-Key | Beschreibung | Kanal |
|---|---|---|
| `reel_15s` | Kurzes Reel, 1 Hook | Instagram, TikTok |
| `reel_30s` | Standard-Reel | Instagram, TikTok |
| `carousel_6slides` | 6-Slide-Karussell | Instagram |
| `carousel_10slides` | 10-Slide-Deep-Dive | Instagram |
| `quote_post` | Einzelbild, Zitat | Instagram, LinkedIn |
| `story_sequence` | Mehrteilige Story | Instagram |
| `tiktok_hook` | TikTok-spezifischer Hook | TikTok |
| `youtube_short` | YouTube Short (<60s) | YouTube |
| `youtube_longform` | Long Video (10–20 min) | YouTube |
| `linkedin_article` | LinkedIn Artikel/Post | LinkedIn |
| `newsletter` | Newsletter-Thema | Email |

---

## 7. Rotation-Strategie

### Wochen-Rhythmus (fester Plan)

| Tag | Content-Typ | Quelle |
|---|---|---|
| Montag | Awareness (Reel + Quote) | Priorität-1-Kategorien |
| Dienstag | Education (Carousel) | Priorität-1/2-Kategorien |
| Mittwoch | Story Sequence + TikTok Hook | provokant_viral, aha_momente |
| Donnerstag | Quote Post + Community | aha_momente, testimonials |
| Freitag | Conversion (CTA + Newsletter) | app_features, coaches |
| Samstag | Community Repost | testimonials, community |
| Sonntag | Reflection / Poll | persoenlichkeitsentwicklung |

### Kategorien-Rotation (26 Wochen = ca. 6 Monate)

Der Agent nutzt die `category_priority_order`-Liste im JSON als Rotations-Reihenfolge. Nach Durchlauf aller 25 Kategorien beginnt der Zyklus von vorne — aber mit den nicht benutzten Topics der Priorität-1-Kategorien.

---

## 8. Brand-Voice-Regeln (hart verdrahtet)

**Jeder generierte Post muss:**
- Klar, direkt, tief sein
- Mindestens eine konkrete Handlung oder Erkenntnis liefern
- Einem der 3 Schreibmuster folgen: Klarheit→Tiefe→Handlung / Erkenntnis-Satz / Energetische Spiegelung

**VERBOTEN** (im JSON unter `meta.forbidden_phrases`):
- „Liebe & Licht"
- „Universum liefert"
- „Manifestiere dir"
- „Hohe Schwingungen"
- „Du bist ein Lichtwesen"
- „Einfach positiv denken"

---

## 9. Integration in den social-youtube Agent

### n8n-Workflow (Empfehlung)

```
[Cron Trigger: täglich 07:00]
  ↓
[Load content-topics.json]
  ↓
[Wochenplan-Node] — entscheidet Tag-spezifisches Format
  ↓
[Category Selection] — nach rotation_strategy
  ↓
[Topic Selection] — weighted random aus Kategorie
  ↓
[MCP Agent Call] — POST /agent/social-youtube
  Payload: {
    "topic": topic_object,
    "brand_voice": meta.brand_voice,
    "forbidden": meta.forbidden_phrases,
    "format": selected_format
  }
  ↓
[Canva API] — Template befüllen
  ↓
[Instagram/TikTok/LinkedIn API] — Publish
  ↓
[Supabase Log] — Topic als "used" markieren (damit nicht wiederholt)
```

### Supabase-Tabelle für Used-Tracking

Vorschlag neue Tabelle `public.content_topic_usage`:

| Spalte | Typ | Zweck |
|---|---|---|
| `id` | uuid | PK |
| `topic_id` | text | z.B. "t_001" |
| `used_at` | timestamptz | wann gepostet |
| `channel` | text | instagram/tiktok/youtube/linkedin |
| `post_url` | text | Link zum Post |
| `performance_score` | int | Engagement-Tracking |

So kann der Agent erkennen, welche Topics zuletzt lange nicht mehr liefen, und diese bevorzugen.

---

## 10. Deployment-Anleitung

### Upload auf Server (138.199.237.34)

```bash
# SSH zum Server
ssh user@138.199.237.34

# Zielordner anlegen
sudo mkdir -p /opt/mcp-connection-key/content-topics

# Dateien hochladen (scp oder rsync)
scp content-topics.json user@138.199.237.34:/opt/mcp-connection-key/content-topics/
scp CONTENT_TOPICS_DOKUMENTATION.md user@138.199.237.34:/opt/mcp-connection-key/content-topics/README.md

# Berechtigungen setzen
sudo chown -R mcp-user:mcp-user /opt/mcp-connection-key/content-topics
sudo chmod 644 /opt/mcp-connection-key/content-topics/*
```

### In den social-youtube Agent einbinden

Der Agent-Code (im `mcp-gateway.js` registriert) muss die Datei beim Start laden:

```javascript
// In social-youtube agent handler
import contentTopics from '/app/content-topics/content-topics.json';
// oder per fs.readFileSync beim Worker-Start
```

### n8n-Workflow importieren

Noch offen — der n8n-Workflow muss einmalig gebaut werden. Empfehlung: als neuer Workflow „Daily Social Content" in der n8n-Instanz auf `n8n.werdemeisterdeinergedankenagent.de`.

---

## 11. Änderungs-Log

| Datum | Version | Änderung | Wer |
|---|---|---|---|
| 2026-04-20 | 1.0.0 | Initiale Erstellung mit 25 Kategorien / 182 Themen | Claude + User |

**Regel:** Jede zukünftige Änderung (neue Kategorie, neue Themen, geänderte Hooks, geänderte Rotation) wird hier UND im JSON-Header `meta.version` + `meta.created` dokumentiert.

---

## 12. Erweiterungs-Ideen (nicht implementiert, für später)

- **Performance-Learning:** Der Agent lernt, welche Hooks die beste Engagement-Rate haben, und bevorzugt diese Struktur für neue Posts
- **Dynamische Topic-Erzeugung:** Bei Bedarf kann der Agent selbst neue Topics vorschlagen, basierend auf aktuellen HD-Trends und Community-Fragen
- **A/B-Testing:** Derselbe Topic mit zwei verschiedenen Hooks posten und Performance vergleichen
- **Seasonal Auto-Boost:** cat_23 automatisch hochpriorisieren in entsprechenden Monaten (z.B. Februar = Valentinstag, Dezember = Weihnachten)
- **Multi-Language:** Topics ins Englische übersetzen für internationale Skalierung
- **Coach-eigene Topics:** Secondary Audience (Coaches) können eigene Themen einreichen, die nach Freigabe in cat_19 integriert werden

---

## 13. Verknüpfte System-Dokumente

Wenn diese Content-Datenbank live geht, müssen folgende bestehende Docs aktualisiert werden:

- `READING_SYSTEM_DOKUMENTATION_1.md` — Abschnitt über MCP-Agents erweitern um `content-topics-integration`
- `connection-key-dokumentation_1.html` — Service-Übersicht erweitern
- `TCK_Marketing_Playbook.md` — Verweis auf diese Datenbank einfügen in Abschnitt 14 „Content-Kalender & Rhythmus"

---

*Ende der Dokumentation — Stand 2026-04-20*
