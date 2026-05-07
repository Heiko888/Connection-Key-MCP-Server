// E2E-Smoke-Test phasen-reading: simuliert exakt was app/api/v4/readings/route.ts macht.
// Run: docker exec -it reading-worker node /app/scripts/smoke-phasen-reading.js
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const V4_SCHEMA = process.env.SUPABASE_V4_SCHEMA || 'v4';
const TEST_USER_ID = process.env.TEST_USER_ID || '00000000-0000-0000-0000-000000000001';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('SUPABASE_URL / SERVICE_KEY fehlt'); process.exit(1);
}

const supabasePublic = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
const supabaseV4 = createClient(SUPABASE_URL, SERVICE_KEY, { db: { schema: V4_SCHEMA }, auth: { persistSession: false } });

const birth_data  = { date: '1985-03-15', time: '14:30', location: 'Berlin' };
const birth_data2 = { date: '1990-08-22', time: '09:00', location: 'München' };
const relationship_start_date = '2026-02-20';

(async () => {
  const t0 = Date.now();

  // 1. public.readings anlegen — analog v4/readings/route.ts:325
  const { data: reading, error: rErr } = await supabasePublic
    .from('readings')
    .insert({
      user_id: TEST_USER_ID,
      created_by: TEST_USER_ID,
      reading_type: 'phasen-reading',
      client_name: 'Anna',
      reading_data: { ai_model: 'claude-sonnet', relationship_start_date },
      birth_data,
      birth_data2,
      status: 'pending',
      progress: 0,
    })
    .select()
    .single();
  if (rErr) { console.error('readings insert:', rErr.message); process.exit(1); }
  console.log(`✅ reading erstellt: ${reading.id}`);

  // 2. v4.reading_jobs anlegen — analog route.ts:383
  const payload = {
    name: 'Anna', name2: 'Ben',
    reading_id: reading.id,
    birthdate: birth_data.date, birthtime: birth_data.time, birthplace: birth_data.location,
    birthdate2: birth_data2.date, birthtime2: birth_data2.time, birthplace2: birth_data2.location,
    relationshipStartDate: relationship_start_date,
    reading_type: 'phasen-reading', readingType: 'phasen-reading',
    ai_model: 'claude-sonnet',
  };
  const { data: job, error: jErr } = await supabaseV4
    .from('reading_jobs')
    .insert({ reading_type: 'phasen-reading', payload, status: 'pending', attempts: 0, max_attempts: 3 })
    .select()
    .single();
  if (jErr) { console.error('job insert:', jErr.message); process.exit(1); }
  console.log(`✅ job erstellt: ${job.id}`);

  // 3. Polling — bis status final
  let final = null;
  for (let i = 0; i < 90; i++) { // bis zu 7.5 Min
    await new Promise(r => setTimeout(r, 5000));
    const { data: jr } = await supabaseV4.from('reading_jobs').select('status, error').eq('id', job.id).single();
    const { data: rr } = await supabasePublic.from('readings').select('status, progress').eq('id', reading.id).single();
    process.stdout.write(`\r⏱  ${(((Date.now()-t0)/1000)|0)}s  job=${jr?.status}  reading=${rr?.status} (${rr?.progress||0}%)         `);
    if (jr?.status === 'completed' || jr?.status === 'failed') { final = { jr, rr }; break; }
  }
  console.log('');

  if (!final) { console.error('❌ Timeout'); process.exit(1); }
  if (final.jr.status === 'failed') { console.error(`❌ Job failed: ${final.jr.error}`); process.exit(1); }

  // 4. Reading-Inhalt verifizieren
  const { data: full } = await supabasePublic.from('readings').select('reading_data, status, progress').eq('id', reading.id).single();
  const rd = full.reading_data || {};
  const text = rd.text || '';
  const phase = rd.phase_info || {};
  const refl = rd.reflexionsfragen || [];

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`reading.status:        ${full.status} (${full.progress}%)`);
  console.log(`text-length:           ${text.length} chars (~${Math.round(text.split(/\s+/).length)} words)`);
  console.log(`phase_info.currentDay: ${phase.currentDay}`);
  console.log(`phase_info.phaseLabel: ${phase.phaseLabel}`);
  console.log(`reflexionsfragen:      ${Array.isArray(refl) ? refl.length : '?'} Stück`);
  console.log(`chart_data.type:       ${rd.chart_data?.type || '?'}`);
  console.log(`chart_data2.type:      ${rd.chart_data2?.type || '?'}`);
  console.log(`pipeline.validated:    ${rd._pipeline?.validated}, corrected: ${rd._pipeline?.corrected}, errors: ${rd._pipeline?.errorCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEXT-PREVIEW (erste 600 Zeichen):');
  console.log(text.slice(0, 600));
  console.log('...');
  console.log('TEXT-ENDE (letzte 400 Zeichen):');
  console.log(text.slice(-400));
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (Array.isArray(refl) && refl.length) {
    console.log('REFLEXIONSFRAGEN:');
    refl.forEach((q, i) => console.log(`  ${i + 1}. ${typeof q === 'string' ? q : JSON.stringify(q)}`));
  }

  console.log(`\nreading_id für Detail-View-Test: ${reading.id}`);
  console.log(`URL: https://coach.the-connection-key.de/readings-v4/${reading.id}`);
})().catch(e => { console.error(e); process.exit(1); });
