# Inkarnationskreuze — Build Report v3.1 (Iteration 2)

_Erzeugt: 2026-05-20T17:48:37Z_

## Aenderungen v3.0 → v3.1

- **8 Permutationen pro Thema** (statt 4): zusaetzlich P-D-Swap. Damit faellt das P/D-Achsen-Reihenfolge-Problem weg: ein Theme wird unabhaengig davon gefunden, ob Q3 die HD-Standard-Konvention exakt einhaelt oder umgekehrt. **Keine** Themen wurden manuell umgedreht; der 8-Perms-Lookup deckt beide Konventionen ab.
- **Q2-Fallback-Themen ergaenzt**: 24 zusaetzliche Themen aus FULL-Q2-Eintraegen, die kein Q3-Pendant haben (bzw. einen mit anderer Gate-Konstellation).
- **P/D-Achse gegen Q2 validiert**: 6 Themen bestaetigt durch einen FULL-Q2-Eintrag mit gleichem Namen, 42 Themen unvalidiert (kein FULL-Q2-Eintrag mit passendem Namen — die Achse wurde wie bei v3.0 belassen, ist aber dank 8-Perms egal fuer den Lookup).
- Disambiguierung von Mehrfachtreffern via Profil erfolgt im Konsumenten (siehe `scripts/verify_live_charts.py`).

## Coverage

- Q3-Master-Themen: **112** (erwartet 112) → 100.0 %
  - RAX: 16
  - LAX: 32
  - JUX: 64
- Q2-Fallback-Themen: **24**
- Themen gesamt: **136**
- Lookup-Keys gesamt: **520**
- Lookup-Mappings (Key→Theme, inkl. Kollisionen): **1088**
- Q2-Keys insgesamt: 157 (FULL: 62)
- Q2-Keys ohne Master-Treffer nach Fallback-Ingest: 11
- Q1-Keys (Diagnose): 111

## P/D-Achse gegen Q2 validiert

- **Validiert (Q2 bestaetigt P-Pair)**: 6
- **Nicht durch Q2 validiert** (kein voller Q2-Eintrag mit gleichem Namen): 42

### Validierte Themen

- `rax_sphinx` — P-Pair [1, 2]
- `rax_vessel_of_love` — P-Pair [10, 15]
- `rax_rulership` — P-Pair [21, 48]
- `rax_tension` — P-Pair [27, 28]
- `lax_alpha` — P-Pair [7, 13]
- `lax_rulership` — P-Pair [21, 48]

## Q2-Fallback-Themen

24 Themen aus Q2 ergaenzt (FULL-Eintraege ohne Q3-Pendant):

| Theme-ID | Q2-Key | Name | Lebensthema |
|---|---|---|---|
| `q2_four_lights` | `3-50-61-62` | Four Lights | Innere Wahrheit und Mutation |
| `q2_explanation_4_8_14_49` | `4-49-8-14` | Explanation | Formeln, Antworten und Beitrag |
| `q2_consciousness_5_35_63_64` | `5-35-63-64` | Consciousness | Fragen, Zweifel und Erfahrung |
| `q2_planning` | `9-16-37-40` | Planning | Gemeinschaft, Fokus und Planung |
| `q2_sleeping_phoenix_9_16_55_59` | `9-16-55-59` | Sleeping Phoenix | Geist, Überfluss und neues Bewusstsein |
| `q2_clarion` | `10-15-20-34` | Clarion | Gegenwärtigkeit, Kraft und Empowerment |
| `q2_healing_10_15_25_46` | `10-15-25-46` | Healing | Unschuld, Heilung und Selbstliebe |
| `q2_eden_6_11_12_36` | `11-12-36-6` | Eden | Erfahrungssuche, Krise und kreative Expression |
| `q2_industriousness` | `14-8-29-30` | Industriousness | Sacral-Kraft, Hingabe und Beitrag |
| `q2_four_ways` | `17-18-47-22` | Four Ways | Logik, Korrektur und Verbesserung |
| `q2_service_17_18_52_58` | `17-18-58-52` | Service | Dienst durch freudige Verbesserung |
| `q2_duality_19_24_33_44` | `19-33-44-24` | Duality | Rückzug, Erinnerung und Bedürfnisse |
| `q2_revolution_4_19_33_49` | `19-33-49-4` | Revolution | Prinzipien, Sensibilität und Rückzug |
| `q2_separation_20_29_30_34` | `20-34-29-30` | Separation | Hingabe, Präsenz und Kraft |
| `q2_dominion` | `24-44-31-41` | Dominion | Führung durch Einfluss und neue Anfänge |
| `q2_maya_27_28_56_60` | `27-28-56-60` | Maya | Überzeugung, Grenzen und Fürsorge |
| `q2_laws` | `32-42-51-57` | Laws | Kontinuität, Vollendung und Initiation |
| `q2_migration_5_35_56_60` | `35-5-56-60` | Migration | Wanderung, Erfahrung und Stimulation |
| `q2_obscuration_6_36_37_40` | `36-6-37-40` | Obscuration | Krise, Gemeinschaft und Befreiung |
| `q2_moods_38_39_55_59` | `39-38-55-59` | Moods | Geist, Intimität und sinnvoller Kampf |
| `q2_aloofness` | `40-37-63-64` | Aloofness | Einsamkeit, Gemeinschaft und mentale Auflösung |
| `q2_plane` | `42-32-53-54` | Plane | Zyklen, Beginn und Vollendung |
| `q2_penetrating_sword` | `43-23-49-4` | Penetrating Sword | Durchbruch, Einsicht und Transformation |
| `q2_unexpected` | `51-57-61-62` | Unexpected | Initiation, Schock und innere Wahrheit |

## Konflikte Q2 vs Q3 (Q3 hat Vorrang)

Insgesamt **35** Konflikte gefunden. Top-Liste:

| Key | Q2-Name | Q3-Master |
|---|---|---|
| `10-15-25-46` | Healing | RAX des Liebesgefäßes |
| `10-15-46-25` | Gefaess der Liebe | RAX des Liebesgefäßes |
| `25-46-10-15` | Healing | RAX des Liebesgefäßes |
| `7-13-23-43` | Die vier Wege | RAX der Vier Wege |
| `7-13-43-23` | Die vier Wege | RAX der Vier Wege |
| `42-32-53-54` | Plane | RAX der Zyklen |
| `53-54-42-32` | Plane | RAX der Zyklen |
| `9-16-52-58` | Wanderung | RAX der Migration |
| `9-16-58-52` | Wanderung | RAX der Migration |
| `40-37-63-64` | Aloofness | RAX der Gemeinschaft |
| `63-64-40-37` | Aloofness | RAX der Gemeinschaft |
| `49-4-43-23` | Penetrating Sword | LAX der Revolution |
| `43-23-49-4` | Penetrating Sword | LAX der Revolution |
| `7-13-22-47` | Verhuellung | LAX der Verschleierung |
| `24-44-31-41` | Dominion | LAX der Verfeinerung |
| `31-41-24-44` | Dominion | LAX der Verfeinerung |
| `17-18-38-39` | Praevention | LAX der Vorbeugung |
| `17-18-39-38` | Praevention | LAX der Vorbeugung |
| `32-42-53-54` | Zyklen | LAX des Ehrgeizes |
| `32-42-54-53` | Zyklen | LAX des Ehrgeizes |
| `9-16-37-40` | Planning | LAX der Erziehung |
| `9-16-40-37` | Planning | LAX der Erziehung |
| `37-40-9-16` | Planning | LAX der Erziehung |
| `10-15-51-57` | Erwachung | LAX der Erweckung |
| `10-15-57-51` | Erwachung | LAX der Erweckung |
| `19-33-44-24` | Duality | LAX der Übertragung |
| `44-24-19-33` | Duality | LAX der Übertragung |
| `22-47-55-59` | Gnade | LAX der Anmut |
| `22-47-59-55` | Gnade | LAX der Anmut |
| `17-18-58-52` | Service | LAX des Urteils |
| `58-52-17-18` | Service | LAX des Urteils |
| `22-47-63-64` | Ungewissheit | LAX der Abstraktion |
| `22-47-64-63` | Ungewissheit | LAX der Abstraktion |

## Konflikte Q1 vs Master (Diagnose)

Insgesamt **11** Q1-Eintraege weichen vom Master ab.

| Key | Q1-Name | Master |
|---|---|---|
| `10-15-20-34` | Living Now | Now (jux_now) |
| `10-15-34-20` | Living Now | Now (jux_now) |
| `53-54-32-42` | Incarnation | Cycles (rax_cycles) |
| `21-48-51-57` | Depth (LAX) | Depth (lax_depth) |
| `21-48-57-51` | Depth (LAX) | Depth (lax_depth) |
| `11-12-26-45` | Dominion | Ideas (jux_ideas) |
| `11-12-45-26` | Dominion | Ideas (jux_ideas) |
| `29-30-55-59` | Fates (LAX) | Fates (lax_fates) |
| `29-30-59-55` | Fates (LAX) | Fates (lax_fates) |
| `17-18-19-33` | Thinking | Opinions (jux_opinions) |
| `19-33-17-18` | Thinking | Opinions (jux_opinions) |

## Q2-Keys ohne Master-Thema (nach Fallback-Ingest)

**11** Q2-Keys haben kein passendes Master-Thema (i.d.R. Stubs ohne description/theme):

| Q2-Key | Q2-Name |
|---|---|
| `1-2-8-14` | Individualitaet |
| `1-2-14-8` | Individualitaet |
| `1-2-19-33` | Verfeinerung |
| `1-2-33-19` | Verfeinerung |
| `3-50-56-60` | Maya |
| `4-49-29-30` | Revolution |
| `4-49-30-29` | Revolution |
| `38-39-51-57` | Das Unerwartete |
| `38-39-57-51` | Das Unerwartete |
| `56-60-61-62` | Klarion |
| `56-60-62-61` | Klarion |

## Gaps — Themen ohne Design-Polen

_Alle Themen haben Personality- und Design-Polen._

## Key-Kollisionen (mehrere Themen am selben Key)

280 Keys verweisen auf mehrere Themen. Das ist legitim, wenn RAX/LAX/JUX dieselben 4 Gates teilen (Disambiguierung im Konsumenten via Profil).

| Key | Themen-IDs |
|---|---|
| `1-2-7-13` | rax_sphinx, jux_listener |
| `1-2-13-7` | rax_sphinx, jux_listener |
| `2-1-7-13` | rax_sphinx, jux_listener |
| `2-1-13-7` | rax_sphinx, jux_listener |
| `7-13-1-2` | rax_sphinx, jux_listener |
| `7-13-2-1` | rax_sphinx, jux_listener |
| `13-7-1-2` | rax_sphinx, jux_listener |
| `13-7-2-1` | rax_sphinx, jux_listener |
| `10-15-25-46` | rax_vessel_of_love, jux_extremes, jux_innocence, jux_serendipity, q2_healing_10_15_25_46 |
| `10-15-46-25` | rax_vessel_of_love, jux_extremes, jux_innocence, jux_serendipity, q2_healing_10_15_25_46 |
| `15-10-25-46` | rax_vessel_of_love, jux_extremes, jux_innocence, jux_serendipity, q2_healing_10_15_25_46 |
| `15-10-46-25` | rax_vessel_of_love, jux_extremes, jux_innocence, jux_serendipity, q2_healing_10_15_25_46 |
| `25-46-10-15` | rax_vessel_of_love, jux_extremes, jux_innocence, jux_serendipity, q2_healing_10_15_25_46 |
| `25-46-15-10` | rax_vessel_of_love, jux_extremes, jux_innocence, jux_serendipity, q2_healing_10_15_25_46 |
| `46-25-10-15` | rax_vessel_of_love, jux_extremes, jux_innocence, jux_serendipity, q2_healing_10_15_25_46 |
| `46-25-15-10` | rax_vessel_of_love, jux_extremes, jux_innocence, jux_serendipity, q2_healing_10_15_25_46 |
| `5-35-6-36` | rax_eden, jux_fixed_patterns |
| `5-35-36-6` | rax_eden, jux_fixed_patterns |
| `35-5-6-36` | rax_eden, jux_fixed_patterns |
| `35-5-36-6` | rax_eden, jux_fixed_patterns |
| `6-36-5-35` | rax_eden, jux_fixed_patterns |
| `6-36-35-5` | rax_eden, jux_fixed_patterns |
| `36-6-5-35` | rax_eden, jux_fixed_patterns |
| `36-6-35-5` | rax_eden, jux_fixed_patterns |
| `3-50-11-12` | rax_maya, jux_mutation, jux_values |
| `3-50-12-11` | rax_maya, jux_mutation, jux_values |
| `50-3-11-12` | rax_maya, jux_mutation, jux_values |
| `50-3-12-11` | rax_maya, jux_mutation, jux_values |
| `11-12-3-50` | rax_maya, jux_mutation, jux_values |
| `11-12-50-3` | rax_maya, jux_mutation, jux_values |
| `12-11-3-50` | rax_maya, jux_mutation, jux_values |
| `12-11-50-3` | rax_maya, jux_mutation, jux_values |
| `21-48-26-45` | rax_rulership, lax_rulership, jux_control, jux_trickster, jux_ownership, jux_depth |
| `21-48-45-26` | rax_rulership, lax_rulership, jux_control, jux_trickster, jux_ownership, jux_depth |
| `48-21-26-45` | rax_rulership, lax_rulership, jux_control, jux_trickster, jux_ownership, jux_depth |
| `48-21-45-26` | rax_rulership, lax_rulership, jux_control, jux_trickster, jux_ownership, jux_depth |
| `26-45-21-48` | rax_rulership, lax_rulership, jux_control, jux_trickster, jux_ownership, jux_depth |
| `26-45-48-21` | rax_rulership, lax_rulership, jux_control, jux_trickster, jux_ownership, jux_depth |
| `45-26-21-48` | rax_rulership, lax_rulership, jux_control, jux_trickster, jux_ownership, jux_depth |
| `45-26-48-21` | rax_rulership, lax_rulership, jux_control, jux_trickster, jux_ownership, jux_depth |
| `27-28-38-39` | rax_tension, jux_caring, jux_struggle, jux_opposition |
| `27-28-39-38` | rax_tension, jux_caring, jux_struggle, jux_opposition |
| `28-27-38-39` | rax_tension, jux_caring, jux_struggle, jux_opposition |
| `28-27-39-38` | rax_tension, jux_caring, jux_struggle, jux_opposition |
| `38-39-27-28` | rax_tension, jux_caring, jux_struggle, jux_opposition |
| `38-39-28-27` | rax_tension, jux_caring, jux_struggle, jux_opposition |
| `39-38-27-28` | rax_tension, jux_caring, jux_struggle, jux_opposition |
| `39-38-28-27` | rax_tension, jux_caring, jux_struggle, jux_opposition |
| `32-42-53-54` | rax_cycles, lax_ambition, jux_growth, jux_beginnings, jux_drive, q2_plane |
| `32-42-54-53` | rax_cycles, lax_ambition, jux_growth, jux_beginnings, jux_drive, q2_plane |
| `42-32-53-54` | rax_cycles, lax_ambition, jux_growth, jux_beginnings, jux_drive, q2_plane |
| `42-32-54-53` | rax_cycles, lax_ambition, jux_growth, jux_beginnings, jux_drive, q2_plane |
| `53-54-32-42` | rax_cycles, lax_ambition, jux_growth, jux_beginnings, jux_drive, q2_plane |
| `53-54-42-32` | rax_cycles, lax_ambition, jux_growth, jux_beginnings, jux_drive, q2_plane |
| `54-53-32-42` | rax_cycles, lax_ambition, jux_growth, jux_beginnings, jux_drive, q2_plane |
| `54-53-42-32` | rax_cycles, lax_ambition, jux_growth, jux_beginnings, jux_drive, q2_plane |
| `37-40-63-64` | rax_community, jux_denial, q2_aloofness |
| `37-40-64-63` | rax_community, jux_denial, q2_aloofness |
| `40-37-63-64` | rax_community, jux_denial, q2_aloofness |
| `40-37-64-63` | rax_community, jux_denial, q2_aloofness |
| `63-64-37-40` | rax_community, jux_denial, q2_aloofness |
| `63-64-40-37` | rax_community, jux_denial, q2_aloofness |
| `64-63-37-40` | rax_community, jux_denial, q2_aloofness |
| `64-63-40-37` | rax_community, jux_denial, q2_aloofness |
| `7-13-31-41` | lax_alpha, jux_influence, jux_fantasy |
| `7-13-41-31` | lax_alpha, jux_influence, jux_fantasy |
| `13-7-31-41` | lax_alpha, jux_influence, jux_fantasy |
| `13-7-41-31` | lax_alpha, jux_influence, jux_fantasy |
| `31-41-7-13` | lax_alpha, jux_influence, jux_fantasy |
| `31-41-13-7` | lax_alpha, jux_influence, jux_fantasy |
| `41-31-7-13` | lax_alpha, jux_influence, jux_fantasy |
| `41-31-13-7` | lax_alpha, jux_influence, jux_fantasy |
| `4-49-23-43` | lax_revolution, jux_insight, q2_penetrating_sword |
| `4-49-43-23` | lax_revolution, jux_insight, q2_penetrating_sword |
| `49-4-23-43` | lax_revolution, jux_insight, q2_penetrating_sword |
| `49-4-43-23` | lax_revolution, jux_insight, q2_penetrating_sword |
| `23-43-4-49` | lax_revolution, jux_insight, q2_penetrating_sword |
| `23-43-49-4` | lax_revolution, jux_insight, q2_penetrating_sword |
| `43-23-4-49` | lax_revolution, jux_insight, q2_penetrating_sword |
| `43-23-49-4` | lax_revolution, jux_insight, q2_penetrating_sword |
| … | (+200 weitere) |

## Validierung

_Alle Validierungen bestanden._

> **Live-Test-Ergebnisse**: siehe Sektion am Ende dieses Berichts 
> (befuellt von `scripts/verify_live_charts.py --update-report`).

