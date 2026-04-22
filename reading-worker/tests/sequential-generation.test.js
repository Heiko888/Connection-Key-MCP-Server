// Tests für Baustein 7 — sequenzielle 2-Pass-Generierung.
// Testet nur injectPart1Context als pure Funktion (nicht die Claude-Calls selbst).

// Da server.js keine Exports hat, kopieren wir die Funktion hier (1:1 vom Original).
// Wenn das Original sich ändert, müssen wir hier nachziehen.
function injectPart1Context(part2Prompt, part1Text) {
  const contextBlock = `

=== TEIL 1 BEREITS GESCHRIEBEN (nicht widersprechen, nur vertiefen) ===
${part1Text}
=== ENDE TEIL 1 ===

ANWEISUNG FÜR TEIL 2:
- Widerspreche KEINER Aussage aus Teil 1 oben.
- Vertiefe und ergänze die Themen, die in Teil 1 angerissen wurden.
- Keine Wiederholungen — nur Erweiterung.
- Wenn ein Kanal, ein Gate oder eine Dynamik in Teil 1 bereits beschrieben wurde,
  baue darauf auf statt neu zu interpretieren.
- Wenn eine Verbindungstyp-Kategorie (elektromagnetisch / Kompromiss / Companionship /
  parallel) in Teil 1 für einen bestimmten Kanal gesetzt wurde, bleibt diese Kategorie
  in Teil 2 unverändert.

`;
  const sepIdx = part2Prompt.indexOf('\n---\n');
  if (sepIdx >= 0) {
    return part2Prompt.slice(0, sepIdx) + contextBlock + part2Prompt.slice(sepIdx);
  }
  return contextBlock + part2Prompt;
}

let passed = 0, failed = 0;
function assert(name, cond, detail) {
  if (cond) { console.log(`  ✅ ${name}`); passed++; }
  else     { console.log(`  ❌ ${name}  ${detail ? '— ' + detail : ''}`); failed++; }
}

console.log('== injectPart1Context ==');

// Testfall 1: Prompt mit --- Trenner
{
  const p2 = `System-Intro
Chart-Info

---

## Abschnitt 5
Detailtext`;
  const part1 = 'Teil-1-Reading-Text mit vielen Aussagen.';
  const result = injectPart1Context(p2, part1);

  assert('Kontext wird vor --- eingefügt', result.includes('System-Intro') && result.includes('=== TEIL 1') && result.indexOf('=== TEIL 1') < result.indexOf('\n---\n'));
  assert('Part-1-Text ist drin', result.includes(part1));
  assert('Anti-Widerspruch-Instruktion vorhanden', result.includes('Widerspreche KEINER Aussage'));
  assert('Kategorie-Konstanz-Instruktion vorhanden', result.includes('Verbindungstyp-Kategorie'));
  assert('Abschnitt 5 bleibt erhalten', result.includes('## Abschnitt 5'));
}

// Testfall 2: Prompt ohne --- Trenner
{
  const p2 = 'Kurzes Prompt ohne Trenner.';
  const part1 = 'Part1-Text.';
  const result = injectPart1Context(p2, part1);

  assert('Kontext wird am Anfang eingefügt', result.indexOf('=== TEIL 1') < result.indexOf('Kurzes Prompt'));
  assert('Part1-Text ist drin', result.includes(part1));
}

// Testfall 3: Part1 darf lang sein
{
  const p2 = 'Prompt';
  const long = 'A'.repeat(50000);
  const result = injectPart1Context(p2, long);
  assert('Langer Part1 (50k) → result ist ≥ 50k', result.length >= 50000);
}

// Testfall 4: Part1 leer
{
  const p2 = 'Prompt\n---\nMore';
  const result = injectPart1Context(p2, '');
  assert('Leeres Part1 → Header + leere Section bleibt', result.includes('=== TEIL 1 BEREITS GESCHRIEBEN') && result.includes('=== ENDE TEIL 1'));
}

// Testfall 5: Kein Widerspruch-Wort im Part2-Body nach Injection
{
  const p2 = `# Abschnitt 5
Inhalt ohne Widerspruch.

---

# Abschnitt 6
Noch mehr.`;
  const part1 = 'Teil 1.';
  const result = injectPart1Context(p2, part1);
  // Das erste --- ist der Trenner; Kontext wird davor eingefügt
  const firstSep = result.indexOf('\n---\n');
  const contextEnd = result.indexOf('=== ENDE TEIL 1');
  assert('Kontext komplett vor erstem --- Trenner', contextEnd > 0 && contextEnd < firstSep);
}

console.log(`\n${passed}/${passed + failed} Tests bestanden`);
if (failed > 0) { console.error(`❌ ${failed} Fehler`); process.exit(1); }
console.log('✅ Alle Tests grün');
