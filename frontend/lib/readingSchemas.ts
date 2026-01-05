/**
 * Reading Schemas - Formular-Definitionen
 * 
 * Single Source of Truth für alle Reading-Input-Felder.
 * Jedes Schema definiert exakt, welche Felder ein Reading-Typ benötigt.
 */

export type ReadingField = {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'date';
  required?: boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
};

export type ReadingSchema = {
  schemaVersion: string;
  fields: ReadingField[];
};

export const readingSchemas: Record<string, ReadingSchema> = {
  basic: {
    schemaVersion: '1.0',
    fields: [
      {
        key: 'clientName',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'Name des Klienten',
      },
      {
        key: 'birthDate',
        label: 'Geburtsdatum',
        type: 'date',
        required: true,
      },
      {
        key: 'birthTime',
        label: 'Geburtszeit',
        type: 'text',
        required: false,
        placeholder: 'HH:MM',
      },
      {
        key: 'focusArea',
        label: 'Fokus des Readings',
        type: 'select',
        required: true,
        options: [
          { label: 'Business', value: 'business' },
          { label: 'Beziehung', value: 'relationship' },
          { label: 'Persönlich', value: 'personal' },
        ],
      },
    ],
  },

  connection: {
    schemaVersion: '1.0',
    fields: [
      {
        key: 'personA',
        label: 'Name Person A',
        type: 'text',
        required: true,
        placeholder: 'Vollständiger Name',
      },
      {
        key: 'personB',
        label: 'Name Person B',
        type: 'text',
        required: true,
        placeholder: 'Vollständiger Name',
      },
      {
        key: 'connectionQuestion',
        label: 'Fragestellung',
        type: 'textarea',
        required: false,
        placeholder: 'Spezifische Frage zur Verbindung (optional)',
      },
    ],
  },

  detailed: {
    schemaVersion: '1.0',
    fields: [
      {
        key: 'clientName',
        label: 'Name',
        type: 'text',
        required: true,
      },
      {
        key: 'focusArea',
        label: 'Fokus des Readings',
        type: 'select',
        required: true,
        options: [
          { label: 'Persönlich', value: 'personal' },
          { label: 'Business', value: 'business' },
          { label: 'Beziehung', value: 'relationship' },
        ],
      },
      {
        key: 'additionalContext',
        label: 'Zusätzlicher Kontext',
        type: 'textarea',
        required: false,
        placeholder: 'Weitere Informationen (optional)',
      },
    ],
  },

  business: {
    schemaVersion: '1.0',
    fields: [
      {
        key: 'clientName',
        label: 'Name',
        type: 'text',
        required: true,
      },
      {
        key: 'businessContext',
        label: 'Business-Kontext',
        type: 'textarea',
        required: false,
        placeholder: 'Beschreibung des Business-Kontexts',
      },
    ],
  },

  relationship: {
    schemaVersion: '1.0',
    fields: [
      {
        key: 'clientName',
        label: 'Name',
        type: 'text',
        required: true,
      },
      {
        key: 'relationshipContext',
        label: 'Beziehungskontext',
        type: 'textarea',
        required: false,
        placeholder: 'Beschreibung des Beziehungskontexts',
      },
    ],
  },

  single: {
    schemaVersion: '1.0',
    fields: [
      {
        key: 'clientName',
        label: 'Name',
        type: 'text',
        required: true,
      },
    ],
  },

  penta: {
    schemaVersion: '1.0',
    fields: [
      {
        key: 'groupName',
        label: 'Gruppenname',
        type: 'text',
        required: true,
        placeholder: 'Name der Gruppe',
      },
      {
        key: 'memberCount',
        label: 'Anzahl Mitglieder',
        type: 'number',
        required: true,
      },
      {
        key: 'groupContext',
        label: 'Gruppenkontext',
        type: 'textarea',
        required: false,
        placeholder: 'Beschreibung des Gruppenkontexts',
      },
    ],
  },
};

/**
 * Gibt das Schema für einen Reading-Type zurück
 */
export function getReadingSchema(schemaKey: string): ReadingSchema | null {
  if (!schemaKey) {
    console.warn('[getReadingSchema] schemaKey ist leer oder undefined');
    return null;
  }
  
  const schema = readingSchemas[schemaKey];
  if (!schema) {
    console.warn('[getReadingSchema] Schema nicht gefunden für key:', schemaKey, 'Verfügbare Keys:', Object.keys(readingSchemas));
  }
  
  return schema || null;
}

/**
 * Prüft ob ein Schema-Key existiert
 */
export function isValidSchemaKey(schemaKey: string): boolean {
  return schemaKey in readingSchemas;
}

/**
 * Validiert Input-Daten gegen ein Schema
 */
export function validateSchemaInput(schema: ReadingSchema, input: Record<string, any>): { valid: boolean; error?: string } {
  for (const field of schema.fields) {
    // Required-Felder prüfen
    if (field.required) {
      const value = input[field.key];
      if (value === undefined || value === null || value === '' || value === false) {
        return {
          valid: false,
          error: `Feld '${field.label}' ist erforderlich`,
        };
      }
    }

    // Select-Validierung: Wert muss in options sein
    if (field.type === 'select' && field.options) {
      const value = input[field.key];
      if (value && !field.options.some((opt) => opt.value === value)) {
        return {
          valid: false,
          error: `Ungültiger Wert für '${field.label}'`,
        };
      }
    }

    // Number-Validierung
    if (field.type === 'number' && input[field.key] !== undefined && input[field.key] !== null) {
      const numValue = Number(input[field.key]);
      if (isNaN(numValue)) {
        return {
          valid: false,
          error: `'${field.label}' muss eine Zahl sein`,
        };
      }
    }

    // Date-Validierung
    if (field.type === 'date' && input[field.key]) {
      const dateValue = input[field.key];
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
          return {
            valid: false,
            error: `Ungültiges Datumsformat für '${field.label}'`,
          };
        }
      }
    }
  }

  return { valid: true };
}

