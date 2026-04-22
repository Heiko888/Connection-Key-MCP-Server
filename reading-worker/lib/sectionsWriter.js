// lib/sectionsWriter.js
import { parseSections, extractText } from './sectionParser.js';

/**
 * Schreibt Sections aus einem fertigen Reading.
 * @param {object} supabasePublic  Supabase-Client mit public-Schema (Service-Role-Key)
 * @param {string} readingId       public.readings.id
 * @returns {Promise<{created: number, clientId: string|null}>}
 */
export async function writeSectionsForReading(supabasePublic, readingId) {
  // 1) Reading laden
  const { data: reading, error: rErr } = await supabasePublic
    .from('readings')
    .select('id, user_id, created_by, client_name, birth_data, reading_data')
    .eq('id', readingId)
    .maybeSingle();
  if (rErr || !reading) {
    console.warn('[sectionsWriter] Reading nicht gefunden:', readingId, rErr?.message);
    return { created: 0, clientId: null };
  }

  const text = extractText(reading?.reading_data?.text);
  if (!text || text.length < 50) {
    console.warn('[sectionsWriter] Kein/kurzer Text im reading_data.text:', readingId, '(len=' + (text?.length || 0) + ')');
    return { created: 0, clientId: null };
  }

  // 2) Client-Profil finden oder anlegen
  const coachId = reading.created_by || reading.user_id || null;
  const clientName = reading.client_name || 'Unbenannt';

  if (!coachId) {
    console.warn('[sectionsWriter] Kein coach/user_id für Reading:', readingId);
    return { created: 0, clientId: null };
  }

  let clientId = null;

  const { data: existing } = await supabasePublic
    .from('client_profiles')
    .select('id')
    .eq('coach_id', coachId)
    .eq('client_name', clientName)
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    clientId = existing.id;
  } else {
    const { data: created, error: cErr } = await supabasePublic
      .from('client_profiles')
      .insert({
        coach_id: coachId,
        client_name: clientName,
        birth_data: reading.birth_data || null,
        source_reading_id: readingId
      })
      .select('id')
      .single();
    if (cErr) {
      console.error('[sectionsWriter] client_profiles insert failed:', cErr.message);
      return { created: 0, clientId: null };
    }
    clientId = created.id;
  }

  // 3) Sections parsen
  const parsed = parseSections(reading.reading_data?.text);
  if (parsed.length === 0) {
    console.warn('[sectionsWriter] Keine Sections geparst für:', readingId);
    return { created: 0, clientId };
  }

  // 4) Versionierung + Insert
  const rows = [];
  for (const sec of parsed) {
    const { data: prev } = await supabasePublic
      .from('reading_sections')
      .select('id, version')
      .eq('client_id', clientId)
      .eq('area', sec.area)
      .is('superseded_by', null)
      .order('version', { ascending: false })
      .limit(1);

    const nextVersion = (prev && prev[0]?.version) ? prev[0].version + 1 : 1;

    const { data: inserted, error: iErr } = await supabasePublic
      .from('reading_sections')
      .insert({
        reading_id: readingId,
        client_id: clientId,
        area: sec.area,
        content: sec.content,
        version: nextVersion,
        is_released: false
      })
      .select('id')
      .single();

    if (iErr) {
      if (!/duplicate key/i.test(iErr.message)) {
        console.error('[sectionsWriter] insert failed:', sec.area, iErr.message);
      }
      continue;
    }

    // Vorgänger als superseded markieren
    if (prev && prev[0]?.id) {
      await supabasePublic
        .from('reading_sections')
        .update({ superseded_by: inserted.id })
        .eq('id', prev[0].id);
    }
    rows.push(inserted.id);
  }

  console.log(`[sectionsWriter] Reading ${readingId}: ${rows.length}/${parsed.length} sections created for client ${clientId}`);
  return { created: rows.length, clientId };
}
