/**
 * Live Reading Agent — Session CRUD (Supabase)
 */

const TABLE = 'live_reading_sessions';

export function createSessionStore(supabase) {

  async function create({ mode, template, language, chartData, steps, readingType }) {
    const { data, error } = await supabase
      .schema('public')
      .from(TABLE)
      .insert({
        mode,
        template,
        language,
        chart_data: chartData,
        steps,
        completed_steps: {},
        status: 'active',
        ...(readingType ? { reading_type: readingType } : {}),
      })
      .select()
      .single();

    if (error) throw new Error(`Session erstellen fehlgeschlagen: ${error.message}`);
    return data;
  }

  async function get(sessionId) {
    const { data, error } = await supabase
      .schema('public')
      .from(TABLE)
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Session laden fehlgeschlagen: ${error.message}`);
    }
    return data;
  }

  async function saveStep(sessionId, stepId, stepData) {
    const { data: current, error: fetchError } = await supabase
      .schema('public')
      .from(TABLE)
      .select('completed_steps')
      .eq('id', sessionId)
      .single();

    if (fetchError) throw new Error(`Session nicht gefunden: ${fetchError.message}`);

    const updated = { ...(current.completed_steps || {}), [stepId]: stepData };

    const { data, error } = await supabase
      .schema('public')
      .from(TABLE)
      .update({ completed_steps: updated })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw new Error(`Step speichern fehlgeschlagen: ${error.message}`);
    return data;
  }

  async function saveNotes(sessionId, stepId, notes, timeSpent) {
    const { data: current, error: fetchError } = await supabase
      .schema('public')
      .from(TABLE)
      .select('completed_steps')
      .eq('id', sessionId)
      .single();

    if (fetchError) throw new Error(`Session nicht gefunden: ${fetchError.message}`);

    const existing = (current.completed_steps || {})[stepId] || {};
    const updated = {
      ...(current.completed_steps || {}),
      [stepId]: {
        ...existing,
        coachNotes: notes,
        ...(timeSpent !== undefined ? { timeSpent } : {}),
      },
    };

    const { data, error } = await supabase
      .schema('public')
      .from(TABLE)
      .update({ completed_steps: updated })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw new Error(`Notizen speichern fehlgeschlagen: ${error.message}`);
    return data;
  }

  async function complete(sessionId) {
    const { data, error } = await supabase
      .schema('public')
      .from(TABLE)
      .update({ status: 'completed' })
      .eq('id', sessionId)
      .select()
      .single();

    if (error) throw new Error(`Session abschließen fehlgeschlagen: ${error.message}`);
    return data;
  }

  return { create, get, saveStep, saveNotes, complete };
}
