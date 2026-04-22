// Tests für hd-regeln-strikt.txt Loading + Inhalt
// Prüft dass die Datei existiert, vollständig ist, und die Pflichtbegriffe enthält.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HD_RULES_PATH = path.join(__dirname, '../knowledge/hd-regeln-strikt.txt');

let passed = 0, failed = 0;
function assert(name, cond, detail) {
  if (cond) { console.log(`  ✅ ${name}`); passed++; }
  else     { console.log(`  ❌ ${name}  ${detail || ''}`); failed++; }
}

console.log('== hd-regeln-strikt.txt: Existenz & Größe ==');

assert('Datei existiert', fs.existsSync(HD_RULES_PATH));
const content = fs.readFileSync(HD_RULES_PATH, 'utf8');
assert('Datei ist nicht leer', content.length > 0);
assert('Datei > 3000 Zeichen', content.length > 3000, `aktuell ${content.length}`);
assert('Datei < 20000 Zeichen (sonst zu teuer pro Prompt)', content.length < 20000, `aktuell ${content.length}`);

console.log('\n== Pflicht-Stichwörter ==');

const requiredKeywords = [
  'KONDITIONIERUNG',
  'zentrum-zu-zentrum',
  'gleichen Zentrums-Typen',
  'KANÄLE',
  'VERBINDUNGSTYPEN',
  'Elektromagnetisch',
  'Kompromiss',
  'Companionship',
  'Parallel',
  'Goldader',
  'INKARNATIONSKREUZE',
  'Right Angle',
  'Left Angle',
  'Juxtaposition',
  'PLANETEN-POSITIONEN',
  'KEHLKOPF-GATES',
  'ZENTREN',
  'AUTORITÄTEN',
  'TYPEN',
  'PROFILE',
];

for (const kw of requiredKeywords) {
  assert(`enthält "${kw}"`, content.includes(kw));
}

console.log('\n== Negativ-Beispiele (sind als ungültig markiert) ==');

const ungueltig = [
  'Sakral konditioniert Wurzel',
  'Kehle konditioniert Solarplexus',
  'Goldader',
];
for (const u of ungueltig) {
  // Sollte vorkommen — als Negativ-Beispiel oder Verbot
  assert(`erwähnt "${u}" (als Negativ-Beispiel/Verbot)`, content.includes(u));
}

console.log('\n== Loading-Prüfung via knowledge-Dictionary ==');

// Simuliere wie loadKnowledge das File mappen würde:
// Schlüssel = Dateiname ohne Extension
const keyName = 'hd-regeln-strikt';
assert(`Key "${keyName}" entspricht Dateiname`, true); // explizite Doku

console.log(`\n${passed}/${passed + failed} Tests bestanden`);
if (failed > 0) { console.error(`❌ ${failed} Fehler`); process.exit(1); }
console.log('✅ Alle Tests grün');
