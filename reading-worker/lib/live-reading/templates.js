/**
 * Live Reading Agent — Step-Template-Definitionen
 */

const STEP_CATALOG = {
  type_strategy:    { id: 'type_strategy',    label: 'Typ & Strategie',              estimatedMinutes: 10 },
  authority:        { id: 'authority',         label: 'Autorität',                    estimatedMinutes: 10 },
  profile:          { id: 'profile',           label: 'Profil',                       estimatedMinutes: 8  },
  defined_centers:  { id: 'defined_centers',   label: 'Definierte Zentren',           estimatedMinutes: 12 },
  open_centers:     { id: 'open_centers',      label: 'Offene Zentren',               estimatedMinutes: 10 },
  channels:         { id: 'channels',          label: 'Channels & Gates',             estimatedMinutes: 12 },
  composite:        { id: 'composite',         label: 'Composite Chart',              estimatedMinutes: 10 },
  electromagnetic:  { id: 'electromagnetic',   label: 'Elektromagnetische Channels',  estimatedMinutes: 8  },
  compromise:       { id: 'compromise',        label: 'Kompromiss-Channels',          estimatedMinutes: 8  },
};

const TEMPLATE_SEQUENCES = {
  single: {
    full:  ['type_strategy', 'authority', 'profile', 'defined_centers', 'open_centers', 'channels'],
    short: ['type_strategy', 'authority', 'profile'],
  },
  connection: {
    full:  ['type_strategy', 'authority', 'profile', 'defined_centers', 'open_centers', 'channels', 'composite', 'electromagnetic', 'compromise'],
    short: ['type_strategy', 'authority', 'composite'],
  },
};

export function getSteps(mode, template) {
  const sequence = TEMPLATE_SEQUENCES[mode]?.[template];
  if (!sequence) throw new Error(`Unbekannte Kombination: mode=${mode}, template=${template}`);
  return sequence.map((id, index) => ({
    ...STEP_CATALOG[id],
    order: index + 1,
  }));
}

export function isValidStep(stepId, steps) {
  return steps.some((s) => s.id === stepId);
}
