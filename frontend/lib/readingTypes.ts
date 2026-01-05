/**
 * Reading Types - Single Source of Truth
 * 
 * Vollständig strukturierte Reading-Definitionen, die steuern:
 * - Formular
 * - Validierung
 * - MCP-Input
 * - Speicherung
 */

export type ReadingInputField = {
  key: string;
  label: string;
  type: 'text' | 'date' | 'select' | 'number' | 'boolean' | 'group' | 'repeatable';
  required?: boolean;
  options?: { label: string; value: string }[];
  fields?: ReadingInputField[]; // bei group / repeatable
  minItems?: number; // bei repeatable
  maxItems?: number; // bei repeatable
};

export type ReadingTypeConfig = {
  key: string;
  label: string;
  description?: string;
  mcpAgent: string;
  mcpType: string;
  inputFields: ReadingInputField[]; // Legacy - wird durch schemaKey ersetzt
  schemaKey?: string; // Referenz auf readingSchemas.ts
  // MCP-Payload-Builder Metadaten
  agent?: string; // optional, default: mcpAgent
  schemaVersion?: string; // wichtig für Versionierung, default: "1.0.0"
  promptProfile?: 'coach' | 'short'; // optional, default: "coach"
  usePrompts?: boolean; // optional, default: true
};

export const readingTypes: Record<string, ReadingTypeConfig> = {
  basic: {
    key: 'basic',
    label: 'Human Design Basic Reading',
    description: 'Grundlegendes Human Design Reading',
    mcpAgent: 'reading',
    mcpType: 'basic',
    agent: 'reading',
    schemaVersion: '1.0.0',
    promptProfile: 'coach',
    schemaKey: 'basic',
    inputFields: [
      {
        key: 'clientName',
        label: 'Name',
        type: 'text',
        required: true,
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
      },
    ],
  },
  connection: {
    key: 'connection',
    label: 'Verbindungs-Reading',
    description: 'Connection Key Reading für zwei Personen',
    mcpAgent: 'reading',
    mcpType: 'connection',
    agent: 'reading',
    schemaVersion: '1.0.0',
    promptProfile: 'coach',
    schemaKey: 'connection',
    inputFields: [
      {
        key: 'personA',
        label: 'Person A',
        type: 'group',
        required: true,
        fields: [
          {
            key: 'name',
            label: 'Name',
            type: 'text',
            required: true,
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
          },
        ],
      },
      {
        key: 'personB',
        label: 'Person B',
        type: 'group',
        required: true,
        fields: [
          {
            key: 'name',
            label: 'Name',
            type: 'text',
            required: true,
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
          },
        ],
      },
    ],
  },
  detailed: {
    key: 'detailed',
    label: 'Detailliertes Reading',
    description: 'Umfassendes Human Design Reading',
    mcpAgent: 'reading',
    mcpType: 'detailed',
    agent: 'reading',
    schemaVersion: '1.0.0',
    promptProfile: 'coach',
    schemaKey: 'detailed',
    inputFields: [
      {
        key: 'clientName',
        label: 'Name',
        type: 'text',
        required: true,
      },
      {
        key: 'focus',
        label: 'Fokus des Readings',
        type: 'select',
        required: true,
        options: [
          { label: 'Persönlich', value: 'personal' },
          { label: 'Business', value: 'business' },
          { label: 'Beziehung', value: 'relationship' },
        ],
      },
    ],
  },
  business: {
    key: 'business',
    label: 'Business Reading',
    description: 'Human Design Reading mit Business-Fokus',
    mcpAgent: 'reading',
    mcpType: 'business',
    agent: 'reading',
    schemaVersion: '1.0.0',
    promptProfile: 'coach',
    schemaKey: 'business',
    inputFields: [
      {
        key: 'clientName',
        label: 'Name',
        type: 'text',
        required: true,
      },
      {
        key: 'businessContext',
        label: 'Business-Kontext',
        type: 'text',
        required: false,
      },
    ],
  },
  relationship: {
    key: 'relationship',
    label: 'Relationship Reading',
    description: 'Human Design Reading mit Beziehungs-Fokus',
    mcpAgent: 'reading',
    mcpType: 'relationship',
    agent: 'reading',
    schemaVersion: '1.0.0',
    promptProfile: 'coach',
    schemaKey: 'relationship',
    inputFields: [
      {
        key: 'clientName',
        label: 'Name',
        type: 'text',
        required: true,
      },
      {
        key: 'relationshipContext',
        label: 'Beziehungskontext',
        type: 'text',
        required: false,
      },
    ],
  },
  single: {
    key: 'single',
    label: 'Single Reading',
    description: 'Einzelperson Human Design Reading',
    mcpAgent: 'reading',
    mcpType: 'single',
    agent: 'reading',
    schemaVersion: '1.0.0',
    promptProfile: 'coach',
    schemaKey: 'single',
    inputFields: [
      {
        key: 'clientName',
        label: 'Name',
        type: 'text',
        required: true,
      },
    ],
  },
  penta: {
    key: 'penta',
    label: 'Penta Reading',
    description: 'Penta/Gruppenresonanz Reading',
    mcpAgent: 'reading',
    mcpType: 'penta',
    agent: 'reading',
    schemaVersion: '1.0.0',
    promptProfile: 'coach',
    schemaKey: 'penta',
    inputFields: [
      {
        key: 'groupName',
        label: 'Gruppenname',
        type: 'text',
        required: true,
      },
      {
        key: 'members',
        label: 'Mitglieder',
        type: 'repeatable',
        required: true,
        minItems: 2,
        maxItems: 10,
        fields: [
          {
            key: 'name',
            label: 'Name',
            type: 'text',
            required: true,
          },
          {
            key: 'birthDate',
            label: 'Geburtsdatum',
            type: 'date',
            required: true,
          },
        ],
      },
    ],
  },
};

/**
 * Gibt die Reading-Type-Konfiguration für einen gegebenen Key zurück
 * @param key - Der Reading-Type Key
 * @returns ReadingTypeConfig oder null wenn nicht gefunden
 */
export function getReadingType(key: string): ReadingTypeConfig | null {
  return readingTypes[key] || null;
}

/**
 * @deprecated Verwende getReadingType() stattdessen
 * Gibt die Reading-Type-Konfiguration für einen gegebenen Key zurück
 */
export function getReadingTypeByKey(key: string): ReadingTypeConfig | null {
  return getReadingType(key);
}

/**
 * Prüft ob ein Reading-Type Key gültig ist
 * @param key - Der Reading-Type Key
 * @returns true wenn gültig, sonst false
 */
export function isValidReadingType(key: string): boolean {
  return key in readingTypes;
}

/**
 * Gibt alle verfügbaren Reading-Type Keys zurück
 * @returns Array von Reading-Type Keys
 */
export function getAllReadingTypeKeys(): string[] {
  return Object.keys(readingTypes);
}

/**
 * Gibt alle Reading-Typen zurück
 * @returns Array von ReadingTypeConfig
 */
export function getAllReadingTypes(): ReadingTypeConfig[] {
  return Object.values(readingTypes);
}

/**
 * Validiert Input-Daten für einen Reading-Type (rekursiv)
 * @param readingTypeKey - Der Reading-Type Key
 * @param input - Die Input-Daten
 * @param path - Interner Pfad für Fehlermeldungen (rekursiv)
 * @returns { valid: boolean, error?: string }
 */
export function validateReadingInput(
  readingTypeKey: string,
  input: Record<string, any>,
  path: string = ''
): { valid: boolean; error?: string } {
  const readingType = getReadingType(readingTypeKey);

  if (!readingType) {
    return {
      valid: false,
      error: `Unbekannter readingType: ${readingTypeKey}`,
    };
  }

  // Rekursive Validierung der Input-Felder
  return validateFields(readingType.inputFields, input, path);
}

/**
 * Rekursive Validierung von Feldern
 */
function validateFields(
  fields: ReadingInputField[],
  input: Record<string, any>,
  path: string = ''
): { valid: boolean; error?: string } {
  for (const field of fields) {
    const fieldPath = path ? `${path}.${field.key}` : field.key;
    const value = input[field.key];

    // Required-Felder prüfen
    if (field.required) {
      if (value === undefined || value === null || value === '' || value === false) {
        return {
          valid: false,
          error: `${fieldPath} fehlt`,
        };
      }
    }

    // Typ-spezifische Validierung
    switch (field.type) {
      case 'select':
        if (field.options && value) {
          if (!field.options.some((opt) => opt.value === value)) {
            return {
              valid: false,
              error: `Ungültiger Wert für ${fieldPath}`,
            };
          }
        }
        break;

      case 'date':
        if (value && typeof value === 'string') {
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return {
              valid: false,
              error: `Ungültiges Datumsformat für ${fieldPath}`,
            };
          }
        }
        break;

      case 'number':
        if (value !== undefined && value !== null) {
          const numValue = Number(value);
          if (isNaN(numValue)) {
            return {
              valid: false,
              error: `${fieldPath} muss eine Zahl sein`,
            };
          }
        }
        break;

      case 'group':
        if (field.fields && value && typeof value === 'object') {
          const groupValidation = validateFields(field.fields, value, fieldPath);
          if (!groupValidation.valid) {
            return groupValidation;
          }
        } else if (field.required && (!value || typeof value !== 'object')) {
          return {
            valid: false,
            error: `${fieldPath} fehlt`,
          };
        }
        break;

      case 'repeatable':
        if (field.fields) {
          if (field.required && (!Array.isArray(value) || value.length === 0)) {
            return {
              valid: false,
              error: `${fieldPath} fehlt`,
            };
          }

          if (Array.isArray(value)) {
            // minItems prüfen
            if (field.minItems !== undefined && value.length < field.minItems) {
              return {
                valid: false,
                error: `${fieldPath} benötigt mindestens ${field.minItems} Einträge`,
              };
            }

            // maxItems prüfen
            if (field.maxItems !== undefined && value.length > field.maxItems) {
              return {
                valid: false,
                error: `${fieldPath} darf maximal ${field.maxItems} Einträge haben`,
              };
            }

            // Jeden Eintrag validieren
            for (let i = 0; i < value.length; i++) {
              const itemPath = `${fieldPath}[${i}]`;
              const itemValidation = validateFields(field.fields, value[i], itemPath);
              if (!itemValidation.valid) {
                return itemValidation;
              }
            }
          }
        }
        break;
    }
  }

  return { valid: true };
}
