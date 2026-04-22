import assert from 'node:assert';
import { parseSections, extractText } from '../lib/sectionParser.js';

// Test 1: Basic heading parsing
const sample1 = `# Reading für Anna
## 1. Typ
Du bist ein Generator.
## 2. Profil
6/2 Rollenvorbild.
## 3. Autorität
Sakrale Autorität.
## 11. Inkarnationskreuz
Kreuz der Wandlung.`;

const out1 = parseSections(sample1);
assert.strictEqual(out1.length, 4, 'Expected 4 sections, got ' + out1.length);
assert.strictEqual(out1[0].area, 'type');
assert.strictEqual(out1[1].area, 'profile');
assert.strictEqual(out1[2].area, 'authority');
assert.strictEqual(out1[3].area, 'incarnation_cross');
console.log('Test 1 OK:', out1.map(s => s.area));

// Test 2: German headings without numbers
const sample2 = `# Human Design Reading
## Strategie
Warten & Reagieren.
## Zentren
9 Zentren im Detail.
## Kanäle
Deine aktiven Kanäle.
## Zusammenfassung
Dein Fazit.`;

const out2 = parseSections(sample2);
assert.strictEqual(out2.length, 4);
assert.strictEqual(out2[0].area, 'strategy');
assert.strictEqual(out2[1].area, 'centers');
assert.strictEqual(out2[2].area, 'channels');
assert.strictEqual(out2[3].area, 'summary');
console.log('Test 2 OK:', out2.map(s => s.area));

// Test 3: Object text field {text: "..."}
const sample3 = { text: '## Typ\nGenerator.\n## Profil\n6/2.' };
const out3 = parseSections(sample3);
assert.strictEqual(out3.length, 2);
assert.strictEqual(out3[0].area, 'type');
console.log('Test 3 OK (object input):', out3.map(s => s.area));

// Test 4: extractText
assert.strictEqual(extractText('hello'), 'hello');
assert.strictEqual(extractText({ text: 'world' }), 'world');
assert.strictEqual(extractText(null), '');
assert.strictEqual(extractText(42), '');
console.log('Test 4 OK (extractText)');

// Test 5: No headings → fallback 'other'
const out5 = parseSections('Just plain text without any headings at all here.');
assert.strictEqual(out5.length, 1);
assert.strictEqual(out5[0].area, 'other');
console.log('Test 5 OK (fallback)');

// Test 6: Empty/null → empty array
assert.strictEqual(parseSections('').length, 0);
assert.strictEqual(parseSections(null).length, 0);
console.log('Test 6 OK (empty input)');

console.log('\n✅ All sectionParser tests passed');
