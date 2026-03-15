/**
 * V4 Job Processor
 * Verarbeitet Jobs aus v4.reading_jobs, sync mit public.readings
 */

import { supabaseV4 as defaultSupabase } from './supabase.js';

export async function processV4Job(job, supabaseClient) {
  const supabaseV4 = supabaseClient || defaultSupabase;
  const {
    id: jobId,
    reading_type,
    payload,
    attempts = 0,
    max_attempts = 3,
  } = job;

  if (attempts >= max_attempts) {
    await supabaseV4.from('reading_jobs').update({
      status: 'failed',
      finished_at: new Date().toISOString(),
      error: 'Max attempts exceeded',
    }).eq('id', jobId);
    await syncPublicReading(supabaseV4, jobId, payload, reading_type, {
      status: 'failed',
      error: 'Max attempts exceeded',
    });
    return;
  }

  await supabaseV4.from('reading_jobs').update({
    status: 'processing',
    attempts: attempts + 1,
    started_at: new Date().toISOString(),
  }).eq('id', jobId);

  await syncPublicReading(supabaseV4, jobId, payload, reading_type, {
    status: 'processing',
    progress: 50,
  });

  try {
    const templateKey =
      payload?.readingType || payload?.reading_type || reading_type || 'basic';
    const { generateReading } = await import('./engine/generateReading.js');
    const resultText = await generateReading({ template: templateKey, userData: payload });

    await supabaseV4.from('reading_results').insert({
      job_id: jobId,
      result: resultText,
      tokens_input: null,
      tokens_output: null,
      cost: null,
    });

    await supabaseV4.from('reading_jobs').update({
      status: 'completed',
      finished_at: new Date().toISOString(),
      error: null,
    }).eq('id', jobId);

    await syncPublicReading(supabaseV4, jobId, payload, reading_type, {
      status: 'completed',
      progress: 100,
      reading_data: { text: resultText },
    });
  } catch (err) {
    const errorMessage = err?.message || 'Unknown error';
    const nextAttempts = attempts + 1;
    console.error(`❌ Job ${jobId} failed (${nextAttempts}/${max_attempts}):`, errorMessage);

    const nonRetriable = /PROMPT_TOO_LARGE|Request too large|maximum context length|TPM|\b429\b/i.test(errorMessage);
    if (nonRetriable || nextAttempts >= max_attempts) {
      await supabaseV4.from('reading_jobs').update({
        status: 'failed',
        finished_at: new Date().toISOString(),
        error: errorMessage,
      }).eq('id', jobId);
      await syncPublicReading(supabaseV4, jobId, payload, reading_type, {
        status: 'failed',
        error: errorMessage,
      });
      return;
    }

    await supabaseV4.from('reading_jobs').update({
      status: 'pending',
      error: errorMessage,
      finished_at: null,
    }).eq('id', jobId);
    await syncPublicReading(supabaseV4, jobId, payload, reading_type, {
      status: 'pending',
      error: errorMessage,
    });
    throw err;
  }
}

async function syncPublicReading(supabaseV4, jobId, payload, readingType, updates) {
  // public.readings – explizit public-Schema (readings liegt nicht in v4)
  const publicReadings = () => supabaseV4.schema('public').from('readings');

  try {
    const readingId = payload?.reading_id;
    if (readingId) {
      await publicReadings().update({
        ...updates,
        updated_at: new Date().toISOString(),
      }).eq('id', readingId);
      return;
    }
    const clientName = payload?.name || payload?.client_name;
    if (!clientName) return;
    for (const statusFilter of ['pending', 'processing']) {
      const { data: readings } = await publicReadings()
        .select('id')
        .eq('client_name', clientName)
        .eq('reading_type', readingType)
        .eq('status', statusFilter)
        .order('created_at', { ascending: false })
        .limit(1);
      if (readings?.[0]) {
        await publicReadings().update({
          ...updates,
          updated_at: new Date().toISOString(),
        }).eq('id', readings[0].id);
        return;
      }
    }
    const { data: anyReading } = await publicReadings()
      .select('id')
      .eq('client_name', clientName)
      .eq('reading_type', readingType)
      .order('created_at', { ascending: false })
      .limit(1);
    if (anyReading?.[0]) {
      await publicReadings().update({
        ...updates,
        updated_at: new Date().toISOString(),
      }).eq('id', anyReading[0].id);
    }
  } catch (err) {
    console.error(`⚠️ Sync failed for job ${jobId}:`, err.message);
  }
}

