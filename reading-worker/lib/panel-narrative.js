/**
 * Panel-Narrativ → Eltern-Reading synchronisieren (W10–W13).
 *
 * Die Panel-Readings (Nervensystem, Weibliches Design, Produktivität, Gene Keys)
 * speichern ihr Ergebnis in einer eigenen *_readings-Tabelle; das Eltern-Reading
 * in public.readings trägt bis dahin nur einen Platzhalter in reading_data.text.
 * Alle Text-Konsumenten (PDF-Export, E-Mail-Versand, Klienten-Ansicht unter
 * /readings, Audio-Worker, Embeddings) lesen aber genau dieses Feld — deshalb
 * schreiben die Worker nach Abschluss das Markdown-Narrativ hierher zurück.
 *
 * Best-Effort: Ein Fehler hier darf den Job NIE scheitern lassen (das Panel
 * zeigt das Ergebnis auch ohne diesen Sync).
 */

export async function syncNarrativeToReading(supabase, readingId, narrative, tag = "Panel") {
  if (!readingId || !narrative || !narrative.trim()) return false;
  try {
    const { data, error } = await supabase
      .schema("public").from("readings")
      .select("reading_data")
      .eq("id", readingId).single();
    if (error) throw new Error(error.message);

    const readingData = { ...(data?.reading_data || {}), text: narrative };
    const { error: updErr } = await supabase
      .schema("public").from("readings")
      .update({ reading_data: readingData, updated_at: new Date().toISOString() })
      .eq("id", readingId);
    if (updErr) throw new Error(updErr.message);

    console.log(`   📝 [${tag}] Narrativ in Reading ${readingId} übernommen (reading_data.text)`);
    return true;
  } catch (err) {
    console.warn(`   ⚠️ [${tag}] Narrativ-Sync in Reading ${readingId} fehlgeschlagen: ${err.message}`);
    return false;
  }
}
