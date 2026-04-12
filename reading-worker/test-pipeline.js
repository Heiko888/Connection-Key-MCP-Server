/**
 * test-pipeline.js
 * Schnelltest für die Reading-Validation & Correction Pipeline
 *
 * Ausführen: node test-pipeline.js
 */

import { runReadingPipeline, validateReading } from "./reading-pipeline.js";
import dotenv from "dotenv";
// .env liegt ein Verzeichnis höher (außerhalb des Containers)
dotenv.config({ path: "../.env" });

// Template-Pfad für lokalen Test (außerhalb Container ist /app/templates nicht vorhanden)
if (!process.env.TEMPLATE_PATH) {
  process.env.TEMPLATE_PATH = new URL("./templates", import.meta.url).pathname;
}

// ── Minimales Chart-Objekt mit 6 definierten Zentren ─────────────────────────
const testChart = {
  type: "Generator",
  profile: "2/4",
  authority: "Sakral",
  strategy: "Warten und antworten",
  gender: "weiblich",
  centers: {
    head:           false,   // offen
    ajna:           false,   // offen
    throat:         true,    // definiert
    g:              true,    // definiert
    heart:          false,   // offen
    "solar-plexus": true,    // definiert
    sacral:         true,    // definiert
    spleen:         true,    // definiert
    root:           true,    // definiert
  },
  channels: [
    { name: "Kanal der Reifung", gates: [42, 53] },
    { name: "Kanal des Rhythmus", gates: [5, 15] },
  ],
  gates: [
    { number: 42, name: "Vollendung" },
    { number: 53, name: "Entwicklung" },
    { number: 5,  name: "Fixe Muster" },
    { number: 15, name: "Extreme" },
    { number: 34, name: "Kraft" },
    { number: 20, name: "Das Jetzt" },
  ],
  incarnationCross: { name: "Rechtes Winkelkreuz der Planeten" },
};

// ── Reading-Text mit bewusstem Fehler: "sieben von neun Zentren" (sollte 6 sein) ──
const testReadingWithError = `
# Dein Human Design Reading

## Typ & Strategie

Als Generator bist du ein Schöpfungskraft der Welt. Deine Strategie ist es, auf Impulse
zu warten und mit einem klaren Sakral-Ja zu antworten. Das ist nicht Passivität – es ist
der ehrlichste Weg, mit deiner Lebensenergie umzugehen.

## Deine Zentren: Die Energiearchitektur

Du hast **sieben von neun Zentren** definiert, was dir eine kraftvolle, stabile Energiebasis gibt.

### Definierte Zentren

**Kehle-Zentrum (definiert):** Deine Kommunikation ist konsistent und kraftvoll.
Du bringst Dinge in die Manifestation durch dein Sprechen und Handeln.

**G-Zentrum (definiert):** Deine Identität und Richtung im Leben sind stabil.
Du weißt instinktiv, wer du bist und wohin du gehst.

**Solarplexus (definiert):** Deine emotionale Energie ist eine konstante Welle.
Warte auf emotionale Klarheit bevor du wichtige Entscheidungen triffst.

**Sakral-Zentrum (definiert):** Als Generator ist dies deine Kraftquelle.
Deine lebendige Antwort-Energie ist unerschöpflich wenn du tust, was dich begeistert.

**Milz-Zentrum (definiert):** Dein Immunsystem und deine Intuition sind konstant aktiv.
Du hast einen feinen Sinn für Gesundheit und Sicherheit.

**Wurzel-Zentrum (definiert):** Du hast eine stabile Druckenergie, die dich antreibt.
Dieser Druck ist ein Freund, kein Feind – er hilft dir, Dinge abzuschließen.

### Offene Zentren

**Kopf-Zentrum (offen):** Du nimmst die mentalen Drücke anderer auf. Die Frage
"Muss ich das wirklich wissen?" befreit dich von fremden mentalen Drücken.

**Ajna-Zentrum (offen):** Dein Denken ist flexibel und anpassungsfähig.
Du bist die Weisheit, die darin liegt, keine feste Meinung haben zu müssen.

## Kanäle & Tore

Der **Kanal der Reifung (42-53)** verbindet dein Sakral-Zentrum mit der Wurzel.
Du bringst Prozesse zu ihrer natürlichen Vollendung.

Der **Kanal des Rhythmus (5-15)** verbindet Sakral mit G-Zentrum.
Du lebst im natürlichen Fluss der Zeit und schaffst Stabilität durch Routinen.

## Inkarnationskreuz

Dein Rechtes Winkelkreuz der Planeten zeigt dir deine Lebensaufgabe.
Diese Energie fließt durch dich hindurch, wenn du authentisch lebst.
`;

// ── Test-Funktion ─────────────────────────────────────────────────────────────
async function runTest() {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Reading Pipeline Test");
  console.log("═══════════════════════════════════════════════════════════\n");

  console.log("Chart: 6 definierte Zentren (throat, g, solar-plexus, sacral, spleen, root)");
  console.log("Fehler im Reading: 'sieben von neun Zentren' (korrekt wäre 'sechs')\n");
  console.log("───────────────────────────────────────────────────────────\n");

  // 1. Erst nur Validierung testen
  console.log("TEST 1: Nur Validierung\n");
  try {
    const validation = await validateReading(testReadingWithError, testChart);
    console.log("Validierungsergebnis:");
    console.log(JSON.stringify(validation, null, 2));
  } catch (err) {
    console.error("Validierung fehlgeschlagen:", err.message);
  }

  console.log("\n───────────────────────────────────────────────────────────\n");

  // 2. Vollständige Pipeline testen
  console.log("TEST 2: Vollständige Pipeline (Validierung + Korrektur)\n");
  try {
    const result = await runReadingPipeline(testReadingWithError, testChart);

    console.log("Pipeline-Ergebnis:");
    console.log(`  validated:  ${result.validated}`);
    console.log(`  corrected:  ${result.corrected}`);
    console.log(`  errorCount: ${result.errorCount}`);
    if (result.errors?.length > 0) {
      console.log("  errors:");
      result.errors.forEach((e, i) =>
        console.log(`    [${i + 1}] ${e.check}: ${e.description}`)
      );
    }

    if (result.corrected) {
      // Prüfen ob "sieben" durch "sechs" ersetzt wurde
      const hadSeven = testReadingWithError.includes("sieben von neun Zentren");
      const hasSix   = result.text.includes("sechs von neun Zentren");
      const stillHasSeven = result.text.includes("sieben von neun Zentren");

      console.log(`\n  Ursprünglich 'sieben von neun Zentren': ${hadSeven}`);
      console.log(`  Korrigiert zu 'sechs von neun Zentren':  ${hasSix}`);
      console.log(`  Noch 'sieben' im Text:                   ${stillHasSeven}`);

      if (hasSix && !stillHasSeven) {
        console.log("\n  ✅ ERFOLG: Fehler wurde korrekt erkannt und behoben!");
      } else {
        console.log("\n  ⚠️  Korrektur hat den Zahlenfehler möglicherweise nicht behoben.");
        // Zeige die relevante Zeile
        const match = result.text.match(/.{0,50}(von neun Zentren).{0,50}/);
        if (match) console.log(`  Relevante Stelle: "...${match[0]}..."`);
      }
    } else if (result.validated && !result.corrected) {
      console.log("\n  ⚠️  Pipeline hat validiert aber nicht korrigiert (oder keinen Fehler gefunden).");
    }

  } catch (err) {
    console.error("Pipeline-Fehler:", err.message);
    process.exit(1);
  }

  // 3. Edge Case: valides Reading (kein Fehler erwartet)
  console.log("\n───────────────────────────────────────────────────────────\n");
  console.log("TEST 3: Reading ohne Fehler (kein zweiter API-Call erwartet)\n");

  const validReading = testReadingWithError.replace(
    "sieben von neun Zentren",
    "sechs von neun Zentren"
  );
  try {
    const result = await runReadingPipeline(validReading, testChart);
    console.log(`  validated:  ${result.validated}`);
    console.log(`  corrected:  ${result.corrected}`);
    console.log(`  errorCount: ${result.errorCount}`);
    if (!result.corrected && result.validated) {
      console.log("  ✅ ERFOLG: Kein unnötiger Korrektur-Call für valides Reading.");
    }
  } catch (err) {
    console.error("Pipeline-Fehler (Test 3):", err.message);
  }

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  Test abgeschlossen");
  console.log("═══════════════════════════════════════════════════════════\n");
}

runTest();
