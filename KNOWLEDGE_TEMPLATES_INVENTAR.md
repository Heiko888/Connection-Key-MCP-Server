# Knowledge- & Template-Inventar — The Connection Key (.138 Backend-Repo)

**Stand:** 2026-05-29 | **Quelle:** Live-Auslesung des Repos `Connection-Key-MCP-Server`
**Zweck:** Vollständiger Katalog aller Reading-Templates, HD-Knowledge-Dateien, Agent-System-Prompts und Agenten-/Brandbook-Dokumentation — mit Pfad, Umfang und Inhalt-Zusammenfassung.

---

## 0. Überblick & Zahlen

| Bereich | Pfad | Dateien | Umfang (ca.) |
|---------|------|--------:|-------------|
| **Aktive Reading-Templates** | `reading-worker/templates/` | 43 | 18–294 Zeilen je Datei |
| **Aktive HD-Knowledge** | `reading-worker/knowledge/` | ~43 (inkl. `brandbook/`) | ~11.000 Zeilen gesamt |
| **Production-Templates (parallel/älter)** | `production/templates/` | 13 | 38–70 Zeilen je Datei |
| **Production-Knowledge (parallel/älter)** | `production/knowledge/` | 14 (inkl. `brandbook/`) | bis 2.084 Zeilen je Datei |
| **Deaktivierte Knowledge** | `production/knowledge_disabled/` | 2 | `gates-complete.txt` ~110k Zeilen, `channels-complete.txt` ~11,7k |
| **Agent-System-Prompts** | `mcp-gateway.js` → `AGENT_SYSTEM_PROMPTS` | siehe §5 | Inline im Code |
| **Agenten-Doku & Brandbook** | Root `AGENTEN_*.md` + `AGENTEN_BRANDBOOK.md` | 15 | Markdown-Doku |

> **Doppelstruktur beachten:** `reading-worker/` ist der **aktive** Satz (vom Worker geladen).
> `production/` enthält einen **parallelen, teils älteren** Satz mit gleichen Dateinamen
> (z.B. `basic.txt`, `detailed.txt`). Vor Konsolidierung prüfen, welcher Satz produktiv genutzt wird.

---

## 1. Reading-Templates — `reading-worker/templates/` (aktiv, 43)

### 1.1 Core & Foundation
| Datei | Zeilen | Zweck |
|-------|-------:|-------|
| `default.txt` | 18 | Minimaler Fallback für unspezifizierte Reading-Typen. |
| `basic.txt` | 58 | Einzelperson-Basis-Reading (Typ, Strategie, Autorität, Zentren, Kanäle, Profil, Inkarnationskreuz). Erwartet `{{clientName}}`, `{{type}}`, `{{profile}}`, `{{authority}}`, `{{strategy}}` etc. Output 1.500–2.500 Wörter, DE. |
| `detailed.txt` | 244 | Umfassendes Personen-Reading, 7+ Sektionen, vollständige Chart-/Geburtsdaten, persönlicher Ton. |
| `depth-analysis.txt` | 256 | Tiefenpsychologisches Einzel-Reading: offene Zentren als Konditionierungsfelder, Not-Self-Muster, Profil-Wunden, Schattenseiten definierter Zentren, Transformation. Strenges Fact-Checking, 5.500+ Wörter. |
| `single.txt` | 159 | Mittleres Personen-Reading (~3.000 W), 8 Sektionen inkl. persönlicher Integration (Gabe/Herausforderung/Kernsatz). |

### 1.2 Qualitätssicherung (QA)
| Datei | Zeilen | Zweck |
|-------|-------:|-------|
| `correct-reading.txt` | 181 | Korrektur-Prompt: erhält Chart-Daten (Wahrheit) + fehlerhaftes Reading + JSON-Validierungsreport, korrigiert nur markierte Fehler (16 Regeln), behält Länge/Stil. |
| `validate-reading.txt` | 218 | Validierungs-Prompt: 16 Checks (Zentren, Gates, Inkarnationskreuz, Pronomen, Connection-Typen, Planeten-Halluzinationen …), liefert JSON-Fehlerreport mit Severity. |

### 1.3 Connection / Paar (2 Personen)
| Datei | Zeilen | Zweck |
|-------|-------:|-------|
| `connection-basic.txt` | 32 | Kompakter Paar-Teaser (600–900 W), 4 Sektionen. |
| `connection.txt` | 145 | Vollständiges Connection-Key-Reading, 10 Sektionen (elektromagn. Anziehung, Konditionierung, Kommunikation, gemeinsames Feld …). 3.000+ W, `{{personAName}}`/`{{personBName}}`. |
| `relationship.txt` | 138 | Tiefes Beziehungs-Reading, 10 Sektionen, warm/direkt, 3.000+ W. |
| `phasen-reading.txt` | 111 | 90-Tage-Beziehungsphasen (Tag 1–30 Anziehung, 31–60 Reibung, 61–90 Wahrheit), Composite-Kanäle, `{{currentDay}}`. 5.000+ W. |
| `compatibility.txt` | 41 | Kompatibilitäts-Reading für eine Person ggü. verschiedenen Typen, 6 Sektionen. |

### 1.4 Gruppe (Penta, 3–5 Personen)
| Datei | Zeilen | Zweck |
|-------|-------:|-------|
| `penta-basic.txt` | 27 | Kompakter Gruppenfeld-Teaser (700–1.000 W), 4 Sektionen. |
| `penta.txt` | 120 | Vollständiges Penta-Reading, 9 Sektionen (Gruppenfeld, Rollen, Energiefluss, aktivierte Kanäle, Kommunikation, Anwendungsdomänen Team/Familie/WG). |
| `penta-communication.txt` | — | Kommunikationsdynamik im Penta-Feld. |

### 1.5 Spezial-Readings (Einzelperson, thematisch)
| Datei | Zeilen | Zweck |
|-------|-------:|-------|
| `business.txt` | 89 | Business/Unternehmertum (nicht Anstellung): typ-spezifische Logik, Autoritäts-Entscheidungen, Angebot, Marketing. Verbietet Karriere-/Lebensaufgabe-Sektionen. |
| `career.txt` | 94 | Karriere (Anstellung/Rollen/Pivots): typ-spezifische Strategie, Profil im Job, Kanäle als Kompetenzen. Abgegrenzt von Business & Lebensaufgabe. |
| `life-purpose.txt` | 67 | Lebensaufgabe/Mission (nicht Business/Karriere): Inkarnationskreuz als Lebensaufgabe, 4 Kreuz-Gates, 8 Sektionen, 4.000+ W. |
| `emotions.txt` | 124 | Emotionen/Solarplexus: definierte (emotionale Autorität, Wellen) vs. offene SP, Gate/Kanal-Analyse (6,22,30,36,37,41,49,55). |
| `health.txt` | 86 | Gesundheit/Wellness (KEINE Diagnose): definierte Zentren als Ressourcen, offene als Beobachtungsfelder, doppelte Disclaimer. |
| `trauma.txt` | 88 | Trauma-informiertes Konditionierungs-Reading, 7 Sektionen, ressourcenorientiert, keine Diagnosen/erfundenen Trauma-Narrative. 600–800 W. |
| `spiritual.txt` | 41 | Spirituelles Wachstum, 6 Sektionen, inspirierend-transformativ. |
| `sexuality.txt` | — | Intimität/Sexualität via HD (Gate 59/6, Sinnestypen). |
| `geld-ueberfluss.txt` | 53 | Geld & Überfluss: finanzielle Muster, Wohlstandsbewusstsein. |
| `kinder.txt` | 58 | Kinder/HD-Reading für das Design des Kindes. |
| `parenting.txt` | 41 | Eltern-Reading (eigenes + Kind-Design). |

### 1.6 Timing & Transit
| Datei | Zeilen | Zweck |
|-------|-------:|-------|
| `jahres-reading.txt` | 134 | Jahres-Reading, 7 Sektionen (Jahresthema, 4 Quartale, Empfehlungen, Motto), Jahres-Transite. `{{currentYear}}`, `{{yearTransitsList}}`. |
| `transit.txt` | 92 | Tages-/Wochen-Transit, 5 Sektionen, welche Transit-Gates Chart-Gates aktivieren. `{{personalitySun}}` etc. |
| `tagesimpuls.txt` | 78 | Täglicher Impuls für `{{clientName}}`, 4 Sektionen, 5 Personalisierungsebenen. Formate: Standard / Instagram / WhatsApp / Newsletter. |
| `tagesimpuls-reel.txt` | 54 | Reel-/Kurzform-Tagesimpuls (Instagram-Reel). |
| `variable-phs.txt` | 64 | Variable/PHS (Primary Health System) — phasen-/variablenspezifisch. |

### 1.7 Kanal- & Profil-Analyse
| Datei | Zeilen | Zweck |
|-------|-------:|-------|
| `channel-analysis.txt` | 153 | Coach-Tool Kanal-Tiefenanalyse, 5 Sektionen (Kanal-Landschaft, Einzel-Kanal, halb-aktive Gates, Circuit-Balance, Split). |
| `reflection.txt` | 117 | Reflexionsfragen, 5–7 offene Fragen je Sektion, chart-spezifisch, keine Ja/Nein-Fragen, Du-Form. |
| `reflection-profiles.txt` | 294 | Profil-spezifischer Reflexions-Katalog: 12 Profile (1/3–6/3), je 4 Fragekategorien (Wachstum/Schatten/Potenzial/Integration). |
| `shadow-work.txt` | 152 | Konditionierungs-/Schattenarbeit, 6 Sektionen, trauma-sensibel, 600–800 W. |

### 1.8 Channel-Serie (Telegram/Social Posts)
| Datei | Zeilen | Zweck |
|-------|-------:|-------|
| `channel-marketing.txt` | 37 | Telegram-Marketing-Post (80–130 W, max 850 Zeichen), value-first, kein Hype, 1 Hashtag. |
| `channel-connection-key.txt` | 47 | Community-Post zu Connection-Key-Themen (max 200 W, Mentor-Ton, 4–6 Hashtags). |
| `channel-tagesimpuls.txt` | 37 | Tagesimpuls-Channel-Post. |
| `channel-hd-wissen.txt` | 46 | HD-Wissen/Education-Post. |
| `channel-inkarnationskreuze.txt` | 43 | Inkarnationskreuze-Post. |
| `channel-gelebtes-design.txt` | 44 | „Gelebtes Design"-Post. |
| `channel-beziehungs-geschichten.txt` | 30 | Beziehungs-Geschichten-Post. |
| `channel-abend-reflexion.txt` | 37 | Abend-Reflexions-Post. |

---

## 2. HD-Knowledge — `reading-worker/knowledge/` (aktiv, ~43 Dateien, ~11.000 Zeilen)

### 2.1 Grundlagen & Regeln
| Datei | Typ | Inhalt |
|-------|-----|--------|
| `human-design-basics.txt` | Referenz | Systemüberblick: 5 Typen, 9 Zentren, 12 Profile, 6 Autoritäten, Circuits, Transite, Definitionen, Not-Self-Emotionen. |
| `bodygraph-statistics.md` | Statistik | Typ-Verteilung (37% Generator, 33% MG, 20% Projektor, 8% Manifestor, 1% Reflektor), Zentren-/Profil-Häufigkeiten. |
| `hd-regeln-strikt.txt` | Strikte Regeln | Konditionierungs-Hierarchie (nur Zentrum→Zentrum), Kanal-Definitionen (beide Gates nötig), Composite-Anforderungen, Verbositäts-Limits. |

### 2.2 Typen & Strategie
| Datei | Inhalt |
|-------|--------|
| `types-detailed.txt` | Alle 5 Typen ausführlich (Strategie, Signatur, Not-Self, Praxis). |
| `type-specific-impulse-rules.md` | Tages-Transit-Regeln je Typ (Framing für Tagesimpuls-Messages). |
| `strategy-authority.txt` | Konsolidierte Strategie-Autoritäts-Mechanik, Quick-Reference. |

### 2.3 Autoritäten & Entscheidung
| Datei | Inhalt |
|-------|--------|
| `authority-detailed.txt` | Alle 7 Autoritäten (Sakral, Emotional/SP, Milz, Ego, Selbst-projiziert, Mental/Außen, Mond): wie entscheiden, was blockiert. |
| `authority-ego-praxis.md` | Praxis Ego-Autorität (echter Wille vs. konditioniertes „sollte"). |
| `authority-emotional-praxis.md` | Praxis emotionale Autorität (Wellen-Navigation, Timing, „drüber schlafen"). |
| `authority-specific-impulse-rules.md` | Wie jede Autorität auf Tages-Transite reagiert. |

### 2.4 Zentren, Kanäle & Gates
| Datei | Inhalt |
|-------|--------|
| `centers-detailed.txt` | Alle 9 Zentren (definiert/offen), Konditionierungsmuster, Weisheit offener Zentren (~515 Z.). |
| `channels-gates.txt` | Alle 36 Kanäle + 64 Gates, Circuits (Individual/Collective/Tribal/Integration), Gate-Themen. |
| `gates-detailed.txt` | Umfassender Gate-Katalog mit Zentrum-Zuordnung, Keynotes, Ausdrucksformen (~410 Z.). |
| `reading-types.txt` | 32 Reading-Templates beschrieben (Routing-Logik, Personas, Content-Outline je Typ). |

### 2.5 Profile & Lebensaufgabe
| Datei | Inhalt |
|-------|--------|
| `profiles-detailed.txt` | Alle 12 Profile (Karma-Typen, Lebensthemen, Stärken/Herausforderungen). |
| `incarnation-cross.txt` | 112 Inkarnationskreuze über 3 Typen (RAX/LAX/Juxtaposition), Lebensthemen/Aufgaben. |
| `life-purpose-knowledge.txt` | Lebensaufgabe via Inkarnationskreuz, Talente, Erfüllungs-Marker. |

### 2.6 Definition & Splits
| Datei | Inhalt |
|-------|--------|
| `splits-detailed.txt` | Definitionstypen (Single ~41%, Split ~50%, Triple/Quad selten, keine Def. ~1%), energetische Implikationen. |

### 2.7 Beziehung & Gruppe
| Datei | Inhalt |
|-------|--------|
| `penta-knowledge.txt` | Penta-Gruppenfeld (3–5), 5 funktionale Positionen, Gruppenintelligenz. |
| `penta-communication-dynamics.md` | Gate-spezifische Kommunikationsrollen im Penta (Gate 1/2/7/8/12/13/16/17 …). |
| `penta-strategy-impulses.md` | Penta-Reaktion auf Transite als Gruppenentität. |

### 2.8 Variablen & Arrows
| Datei | Inhalt |
|-------|--------|
| `arrows-detailed.txt` | 4 Arrows / PHS (Verdauung, Perspektive, Umgebung, Motivation), aktiv/passiv. |
| `variable-arrows.md` | Variablen-System mit Praxis (links/rechts, passiv/aktiv, embodied vs. bewusst). |

### 2.9 Thematische Vertiefungen
| Datei | Inhalt |
|-------|--------|
| `business-knowledge.txt` | Business-Energie: typbasierte Führung, Finanzmuster, Team-Dynamik. |
| `career-knowledge.txt` | Karriere-Talente je Typ/Zentren, ideales Arbeitsumfeld, Teamrollen. |
| `connection-knowledge.txt` | Beziehungs-Grundlagen: Typ-Kompatibilität, Konditionierung, Anziehung. |
| `emotions-knowledge.txt` | Emotionswelt: emotionale Autorität, SP-Dynamik, Wellen-Navigation. |
| `health-knowledge.txt` | Gesundheit via HD: PHS, Schlaf/Regeneration, Stressantwort. |
| `kinder-knowledge.txt` | Kind-Design: elterliche Unterstützung, Lernstil, typbasierte Förderung. |
| `parenting-knowledge.txt` | Eltern-Design: Erziehungsstil via Typ/Profil, Familien-Dynamik. |
| `trauma-knowledge.txt` | Trauma & Design: typ-spezifische Muster, offene Zentren als Vulnerabilität, Heilung via Autorität/Strategie. |
| `sexuality-knowledge.txt` | Intimitäts-Design: Gate 59/6, Sinnestypen, Anziehungsdynamik. |
| `spiritual-knowledge.txt` | Spirituelle Entwicklung via HD: Meditation je Typ, Bewusstseinspfad. |
| `shadow-work-knowledge.txt` | Not-Self-Arbeit: Schattenmuster je Typ, Konditionierungsfelder offener Zentren. |
| `reflection-knowledge.txt` | Inquiry-basiertes Lernen: generative Fragen je Design-Ebene. |
| `geld-ueberfluss-knowledge.txt` | Geld & Überfluss: finanzielle Muster je Typ/Gate, Wohlstandsbewusstsein. |
| `transit-impulse-instructions.txt` | Anleitung für Tages-Transit-Readings (Synthese aktueller Positionen + Design-Aktivierung). |

### 2.10 Krise, Brand & Format
| Datei | Inhalt |
|-------|--------|
| `crisis-resources.md` | Notfall-Hotlines (DACH): mentale Gesundheit, Trauma, häusliche Gewalt, Kinderschutz, Schulden. Wann ins Reading aufnehmen. |
| `brandbook/README.md` | Index der Brandbook-Kapitel 1–18 + Komplett-Markdown. |
| `brandbook/brandbook-complete.md` | Vollständige Brand-Guidelines: Voice, Visual Identity, Messaging, Reading-Stil-Constraints. |
| `brandbook/brandbook-signature-bodygraph.md` | Brand-Bodygraph-Template mit Signature-Styling. |
| `reel-script-instructions.md` | Social-Format-Regeln: 30–60s Reels, Hook-Core-CTA, plattformspezifisch. |

---

## 3. Production-Satz — `production/` (parallel/älter)

> Gleiche Dateinamen wie `reading-worker/`, aber durchweg **kompakter** (38–70 Zeilen)
> und ruhiger im Ton. Vermutlich ältere/Standalone-Version (vgl. CLAUDE.md: `production/` inaktiv).

### 3.1 `production/templates/` (13)
| Datei | Zeilen | Zweck |
|-------|-------:|-------|
| `basic.txt` | 58 | Basis-Reading, ruhiger Mentor-Ton, ohne Esoterik-Klischees. |
| `business.txt` | 56 | Business-Strategie: HD auf Karriere/Business angewandt. |
| `career.txt` | 56 | Karriere/Berufung: Stärken aktivieren, Fehlausrichtung erkennen. |
| `compatibility.txt` | 57 | Kompatibilität zweier Personen (Potenzial + Herausforderungen). |
| `composite.txt` | 52 | Composite-Gruppenanalyse: emergente kollektive Energie. |
| `default.txt` | 38 | Default/minimal. |
| `detailed.txt` | 70 | Tiefenanalyse, reflektiv-präziser Mentor-Ton. |
| `health.txt` | 56 | Gesundheit/Wellness + PHS, ohne med. Diagnose. |
| `life-purpose.txt` | 51 | Lebensaufgabe/Seelenmission, ermächtigend. |
| `parenting.txt` | 59 | Eltern-Analyse (eigenes + Kind-Design). |
| `relationship.txt` | 54 | Beziehungsdynamik, ehrlich/wertungsfrei. |
| `sexuality.txt` | 54 | Intimität/Sexualität, respektvoll, nicht explizit. |
| `spiritual.txt` | 53 | Spirituelle Entwicklung, geerdet. |

### 3.2 `production/knowledge/` (14)
| Datei | Zeilen | Inhalt |
|-------|-------:|--------|
| `human-design-basics.txt` | 56 | Grundlagen der 4 Typen + Strategien. |
| `strategy-authority.txt` | 58 | Entscheidungsstrategie je Typ + Autoritätssysteme. |
| `types-detailed.txt` | 994 | Umfassender Typ-Breakdown (aus PDF importiert). |
| `centers-detailed.txt` | 2.084 | Ausführliche Zentren-Referenz (definiert/offen, aus PDF). |
| `profiles-detailed.txt` | 682 | 6-Linien-Profilsystem, archetypische Rollen. |
| `authority-detailed.txt` | 1.157 | Tiefe Autoritäts-Doku (alle Entscheidungs-Autoritäten). |
| `channels-gates.txt` | 48 | Quick-Reference Kanäle + Gates (z.B. 1-8 Führung). |
| `arrows-detailed.txt` | 120 | Direktionale Arrows (Lebensaufgabe-Indikatoren) + Praxis. |
| `splits-detailed.txt` | 162 | Split-Definitionen verkörpern. |
| `reading-types.txt` | 83 | 5 Reading-Kategorien (Basic, Detailed, Composite, Compatibility, Business). |
| `incarnation-cross.txt` | 45 | Lebensaufgabe-Framework, 4 Quadranten. |
| `brandbook/README.md` | 44 | Index der konvertierten Master-Brand-Book-Dateien. |
| `brandbook/brandbook-complete.md` | 65 | HTML-Brandbook-Struktur für PDF-Export. |
| `brandbook/brandbook-signature-bodygraph.md` | 222 | Operative Erweiterung: Signature-Bodygraph-System. |

### 3.3 `production/knowledge_disabled/` (2 — deaktiviert)
| Datei | Zeilen | Inhalt |
|-------|-------:|--------|
| `channels-complete.txt` | 11.773 | Alle 36 Kanäle umfassend. Deaktiviert (Größe/Performance). |
| `gates-complete.txt` | 110.354 | Alle 64 Gates erschöpfend. Deaktiviert (sehr groß, redundant). |

---

## 4. Weitere Knowledge-Verzeichnisse (Referenz)
| Pfad | Bemerkung |
|------|-----------|
| `knowledge/` (Root) | Nur `.gitkeep` (Platzhalter/Upload-Ziel). |
| `frontend/app/knowledge`, `frontend/app/knowledge-ai`, `frontend/lib/knowledge` | Frontend-Knowledge-UI (gehört lt. Goldener Regel auf .167). |
| `integration/api-routes/admin-upload-knowledge` | Admin-Upload-Route für Knowledge-Ordner. |
| `integration/scripts/*knowledge*` | Import-/Check-/Bulk-Upload-Skripte für Knowledge-Ordner. |
| `convert-brandbook-to-knowledge.ps1` | Konvertiert Brandbook → Knowledge-Dateien. |

---

## 5. Agent-System-Prompts — `mcp-gateway.js` (`AGENT_SYSTEM_PROMPTS`)

Im `AGENT_SYSTEM_PROMPTS`-Objekt definierte Personas (Auszug der ausgelesenen Keys):

| Agent-Key | Rolle/Persona |
|-----------|---------------|
| `marketing` | Marketing-Stratege für HD-Coaches; authentische Strategien je nach 5 Typen & Kommunikationsstil. |
| `automation` | Prozess-/Automatisierungs-Helfer für wiederkehrende Aufgaben & effiziente Coaching-Workflows. |
| `sales` | Sales-Support: Angebote authentisch kommunizieren, Verkaufsgespräche im Einklang mit dem eigenen Design. |
| `social-youtube` | Social-Media-/YouTube-Begleiter: Content-Strategien, Video-Ideen, Posts. |
| `chart` | HD-Chart-Analyst: Tiefenanalyse von Zentren, Kanälen, Gates, Profilen, Inkarnationskreuzen. |
| `ui-ux` | Design-Begleiter: visuelle Gestaltung von Websites & Coaching-Materialien. |

> **Hinweis:** Die `mcp-gateway.js` registriert zusätzlich dedizierte `/agent/*`-HTTP-Routen
> (u.a. `reading`, `reflection`, `shadow-work`, `relationship`, `transit`, `business-hd`,
> `emotions`, `health`, `abundance`, `chart-architect`, `video`/`video-creation`).
> Für `chart`, `yearly`, `automation`, `depth-analysis`, `tasks` existiert **keine** dedizierte
> Route → laufen über `/agents/run` (MCP-Core) bzw. erzeugen 404
> (siehe `AGENTEN_404_FEHLER_ANALYSE.md` und CLAUDE.md §9).

---

## 6. Agenten-Doku & Brandbook — Root `*.md`

| Datei | Inhalt |
|-------|--------|
| **`AGENTEN_BRANDBOOK.md`** | Marken-Identität: Visual-System (6-Farb-Palette, Typografie, Emoji-Marker), Tone-of-Voice je Agent, Agent-Persönlichkeiten, UI/UX-Komponenten (Cards, Chat, Buttons, Status), Design-Do's/Don'ts. |
| **`AGENTEN_KOMPLETT.md`** | Funktionsüberblick aller Agenten (Marketing, Automation, Sales, Social-YouTube, Reading): Kernaufgaben, Methodik (analyze → strategize → create → optimize), Beispiel-Queries, Antwortformate. |
| **`AGENTEN_KONFIGURATIONEN_KOMPLETT.md`** | Infrastruktur-Doku: IPs, Ports, Agent-JSON-Configs, Prompt-Dateien, API-Endpunkte (MCP 7000, Reading Agent 4001, n8n 5678). |
| **`AGENTEN_STARTKLAR_PLAN.md`** | Implementierungs-Checkliste (Fertig/Offen: n8n-Workflows, Integrationstests, Mattermost-Notifications). |
| `AGENTEN_FUNKTIONEN.md` | Kurz-Feature-Zusammenfassung je Agent. |
| `AGENTEN_AKTIVIERUNG_UND_KONFIGURATION.md` | Setup- & Aktivierungs-Prozeduren. |
| `AGENTEN_INTEGRATION_UEBERSICHT.md` | Integrations-Architektur-Überblick. |
| `AGENTEN_FAEHIGKEITEN_MIT_BRANDBOOK.md` | Fähigkeiten ausgerichtet an Brand-Guidelines. |
| `AGENTEN_STATUS_KOMPLETT.md` | Vollständiger Betriebsstatus-Report. |
| `AGENTEN_STATUS_OFFEN.md` | Offene Punkte & Blocker. |
| `AGENTEN_STATUS_ANALYSE.md` | Analyse des aktuellen Betriebsstatus. |
| `AGENTEN_404_FEHLER_ANALYSE.md` | HTTP-Fehler-Logging & Troubleshooting (404er der Agenten). |
| `AGENTEN_NEXT_STEPS.md` | Roadmap nächste Entwicklungsphase. |
| `AGENTEN_EVOLUTION_ABGESCHLOSSEN.md` | Historischer Meilenstein (abgeschlossene Evolutionsstufe). |
| `AGENTEN_VERWENDUNG.md` | Anwender-Guide zur Agent-Interaktion. |

---

*Erstellt 2026-05-29 durch Live-Auslesung des Repos. Bei Konsolidierung zuerst klären, welcher
Satz (`reading-worker/` vs. `production/`) produktiv geladen wird — der reading-worker ist der aktive.*
