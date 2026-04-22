#!/usr/bin/env node
// scripts/backfillSections.dryrun.js
// Dry-Run: Zählt Readings und parsbare Sections, schreibt NICHTS in die DB.

import { createClient } from '@supabase/supabase-js';
import { parseSections, extractText } from '../lib/sectionParser.js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) { console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_KEY'); process.exit(1); }

const sb = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

(async () => {
  const pageSize = 100;
  let from = 0;
  let total = 0;
  let withSections = 0;
  let withoutSections = 0;
  let noText = 0;
  const areaCounts = {};
  const typeCounts = {};

  console.log('=== DRY RUN — Backfill Sections ===\n');

  for (;;) {
    const { data, error } = await sb
      .from('readings')
      .select('id, client_name, reading_type, reading_data')
      .eq('status', 'completed')
      .order('created_at', { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) { console.error('DB Error:', error.message); break; }
    if (!data || data.length === 0) break;

    for (const r of data) {
      total++;
      const text = extractText(r.reading_data?.text);
      const rType = r.reading_type || 'unknown';
      typeCounts[rType] = (typeCounts[rType] || 0) + 1;

      if (!text || text.length < 50) {
        noText++;
        console.log(`  [${total}] ${r.id.substring(0, 8)} (${rType}) — KEIN TEXT (len=${text?.length || 0})`);
        continue;
      }

      const sections = parseSections(r.reading_data?.text);
      if (sections.length > 0 && sections[0].area !== 'other') {
        withSections++;
        for (const s of sections) {
          areaCounts[s.area] = (areaCounts[s.area] || 0) + 1;
        }
        console.log(`  [${total}] ${r.id.substring(0, 8)} (${rType}) — ${sections.length} sections: ${sections.map(s => s.area).join(', ')}`);
      } else {
        withoutSections++;
        console.log(`  [${total}] ${r.id.substring(0, 8)} (${rType}) — keine erkennbare Struktur (fallback: other)`);
      }
    }
    from += data.length;
    if (data.length < pageSize) break;
  }

  console.log('\n=== ERGEBNIS ===');
  console.log(`Total Readings:          ${total}`);
  console.log(`Mit parsbaren Sections:  ${withSections}`);
  console.log(`Ohne Struktur (other):   ${withoutSections}`);
  console.log(`Ohne Text:               ${noText}`);
  console.log(`\nReading-Typen:`);
  for (const [t, c] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${t}: ${c}`);
  }
  console.log(`\nSection-Bereiche (Gesamtzahl):`);
  for (const [a, c] of Object.entries(areaCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${a}: ${c}`);
  }
  console.log('\n=== DRY RUN ABGESCHLOSSEN — Es wurde NICHTS geschrieben ===');
})();
