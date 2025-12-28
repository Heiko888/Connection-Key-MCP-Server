/**
 * Reading Request Validation
 * Vollständige Input-Validierung für Reading-Generierung
 */

// Erlaubte Reading-Typen
export const ALLOWED_READING_TYPES = [
  'basic',
  'detailed',
  'business',
  'relationship',
  'career',
  'health',
  'parenting',
  'spiritual',
  'compatibility',
  'life-purpose'
] as const;

export type ReadingType = typeof ALLOWED_READING_TYPES[number];

// Fehlercodes
export enum ValidationErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_READING_TYPE = 'INVALID_READING_TYPE',
  INVALID_BIRTH_DATE = 'INVALID_BIRTH_DATE',
  INVALID_BIRTH_TIME = 'INVALID_BIRTH_TIME',
  INVALID_BIRTH_PLACE = 'INVALID_BIRTH_PLACE',
  MISSING_COMPATIBILITY_DATA = 'MISSING_COMPATIBILITY_DATA',
  INVALID_USER_ID = 'INVALID_USER_ID',
  FUTURE_DATE = 'FUTURE_DATE',
  MISSING_NAME = 'MISSING_NAME',
  MISSING_FOCUS = 'MISSING_FOCUS'
}

// Validierungs-Fehler
export interface ValidationError {
  code: ValidationErrorCode;
  field: string;
  message: string;
  details?: any;
}

// Reading Request Interface
export interface ReadingRequest {
  name: string; // PFLICHTFELD
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  readingType: string;
  focus: string; // PFLICHTFELD
  userId?: string;
  // Für Compatibility Reading
  birthDate2?: string;
  birthTime2?: string;
  birthPlace2?: string;
}

// Validierungs-Ergebnis
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  data?: ReadingRequest;
}

/**
 * Validiert Geburtsdatum
 */
function validateBirthDate(date: string): ValidationError | null {
  if (!date || typeof date !== 'string') {
    return {
      code: ValidationErrorCode.INVALID_BIRTH_DATE,
      field: 'birthDate',
      message: 'Geburtsdatum ist erforderlich'
    };
  }

  // Format prüfen: YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return {
      code: ValidationErrorCode.INVALID_BIRTH_DATE,
      field: 'birthDate',
      message: 'Geburtsdatum muss im Format YYYY-MM-DD sein (z.B. 1990-05-15)'
    };
  }

  // Datum parsen
  const parsedDate = new Date(date + 'T00:00:00');
  if (isNaN(parsedDate.getTime())) {
    return {
      code: ValidationErrorCode.INVALID_BIRTH_DATE,
      field: 'birthDate',
      message: 'Ungültiges Geburtsdatum'
    };
  }

  // Prüfen ob Datum in der Vergangenheit ist
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (parsedDate > now) {
    return {
      code: ValidationErrorCode.FUTURE_DATE,
      field: 'birthDate',
      message: 'Geburtsdatum kann nicht in der Zukunft liegen'
    };
  }

  // Prüfen ob Datum nicht zu weit in der Vergangenheit ist (z.B. vor 1900)
  const minDate = new Date('1900-01-01');
  if (parsedDate < minDate) {
    return {
      code: ValidationErrorCode.INVALID_BIRTH_DATE,
      field: 'birthDate',
      message: 'Geburtsdatum muss nach 1900 sein'
    };
  }

  return null;
}

/**
 * Validiert Geburtszeit
 */
function validateBirthTime(time: string): ValidationError | null {
  if (!time || typeof time !== 'string') {
    return {
      code: ValidationErrorCode.INVALID_BIRTH_TIME,
      field: 'birthTime',
      message: 'Geburtszeit ist erforderlich'
    };
  }

  // Format prüfen: HH:MM (24h)
  const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return {
      code: ValidationErrorCode.INVALID_BIRTH_TIME,
      field: 'birthTime',
      message: 'Geburtszeit muss im Format HH:MM sein (24h, z.B. 14:30)'
    };
  }

  return null;
}

/**
 * Validiert Geburtsort
 */
function validateBirthPlace(place: string): ValidationError | null {
  if (!place || typeof place !== 'string') {
    return {
      code: ValidationErrorCode.INVALID_BIRTH_PLACE,
      field: 'birthPlace',
      message: 'Geburtsort ist erforderlich'
    };
  }

  // Mindestlänge prüfen
  const trimmed = place.trim();
  if (trimmed.length < 2) {
    return {
      code: ValidationErrorCode.INVALID_BIRTH_PLACE,
      field: 'birthPlace',
      message: 'Geburtsort muss mindestens 2 Zeichen lang sein'
    };
  }

  // Maximallänge prüfen
  if (trimmed.length > 255) {
    return {
      code: ValidationErrorCode.INVALID_BIRTH_PLACE,
      field: 'birthPlace',
      message: 'Geburtsort darf maximal 255 Zeichen lang sein'
    };
  }

  return null;
}

/**
 * Validiert Reading-Typ
 */
function validateReadingType(type: string): ValidationError | null {
  if (!type || typeof type !== 'string') {
    return {
      code: ValidationErrorCode.INVALID_READING_TYPE,
      field: 'readingType',
      message: 'Reading-Typ ist erforderlich'
    };
  }

  if (!ALLOWED_READING_TYPES.includes(type as ReadingType)) {
    return {
      code: ValidationErrorCode.INVALID_READING_TYPE,
      field: 'readingType',
      message: `Ungültiger Reading-Typ. Erlaubte Typen: ${ALLOWED_READING_TYPES.join(', ')}`
    };
  }

  return null;
}

/**
 * Validiert User-ID (optional)
 */
function validateUserId(userId?: string): ValidationError | null {
  if (!userId) {
    return null; // User-ID ist optional
  }

  // UUID Format prüfen (vereinfacht)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return {
      code: ValidationErrorCode.INVALID_USER_ID,
      field: 'userId',
      message: 'User-ID muss ein gültiges UUID-Format haben'
    };
  }

  return null;
}

/**
 * Validiert Compatibility Reading (benötigt 2 Personen)
 */
function validateCompatibilityReading(
  readingType: string,
  data: ReadingRequest
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (readingType !== 'compatibility') {
    return errors; // Keine spezielle Validierung für andere Typen
  }

  // Prüfe ob alle Daten für Person 2 vorhanden sind
  if (!data.birthDate2) {
    errors.push({
      code: ValidationErrorCode.MISSING_COMPATIBILITY_DATA,
      field: 'birthDate2',
      message: 'Für Compatibility Reading ist das Geburtsdatum der zweiten Person erforderlich'
    });
  } else {
    const dateError = validateBirthDate(data.birthDate2);
    if (dateError) {
      errors.push({
        ...dateError,
        field: 'birthDate2'
      });
    }
  }

  if (!data.birthTime2) {
    errors.push({
      code: ValidationErrorCode.MISSING_COMPATIBILITY_DATA,
      field: 'birthTime2',
      message: 'Für Compatibility Reading ist die Geburtszeit der zweiten Person erforderlich'
    });
  } else {
    const timeError = validateBirthTime(data.birthTime2);
    if (timeError) {
      errors.push({
        ...timeError,
        field: 'birthTime2'
      });
    }
  }

  if (!data.birthPlace2) {
    errors.push({
      code: ValidationErrorCode.MISSING_COMPATIBILITY_DATA,
      field: 'birthPlace2',
      message: 'Für Compatibility Reading ist der Geburtsort der zweiten Person erforderlich'
    });
  } else {
    const placeError = validateBirthPlace(data.birthPlace2);
    if (placeError) {
      errors.push({
        ...placeError,
        field: 'birthPlace2'
      });
    }
  }

  return errors;
}

/**
 * Validiert Name (PFLICHTFELD)
 */
function validateName(name: any): ValidationError | null {
  if (!name || typeof name !== 'string') {
    return {
      code: ValidationErrorCode.MISSING_NAME,
      field: 'name',
      message: 'name ist ein Pflichtfeld (string)'
    };
  }

  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return {
      code: ValidationErrorCode.MISSING_NAME,
      field: 'name',
      message: 'name darf nicht leer sein'
    };
  }

  if (trimmed.length > 255) {
    return {
      code: ValidationErrorCode.MISSING_NAME,
      field: 'name',
      message: 'name darf maximal 255 Zeichen lang sein'
    };
  }

  return null;
}

/**
 * Validiert Focus (PFLICHTFELD)
 */
function validateFocus(focus: any): ValidationError | null {
  if (!focus || typeof focus !== 'string') {
    return {
      code: ValidationErrorCode.MISSING_FOCUS,
      field: 'focus',
      message: 'focus ist ein Pflichtfeld (string)'
    };
  }

  const trimmed = focus.trim();
  if (trimmed.length === 0) {
    return {
      code: ValidationErrorCode.MISSING_FOCUS,
      field: 'focus',
      message: 'focus darf nicht leer sein'
    };
  }

  if (trimmed.length > 500) {
    return {
      code: ValidationErrorCode.MISSING_FOCUS,
      field: 'focus',
      message: 'focus darf maximal 500 Zeichen lang sein'
    };
  }

  return null;
}

/**
 * Haupt-Validierungs-Funktion
 */
export function validateReadingRequest(body: any): ValidationResult {
  const errors: ValidationError[] = [];

  // Basis-Validierung
  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      errors: [{
        code: ValidationErrorCode.INVALID_INPUT,
        field: 'body',
        message: 'Request Body ist erforderlich'
      }]
    };
  }

  // PFLICHTFELDER validieren (hart abbrechen bei Fehlern)
  
  // Name validieren (PFLICHTFELD)
  const nameError = validateName(body.name);
  if (nameError) {
    errors.push(nameError);
  }

  // Geburtsdatum validieren (PFLICHTFELD)
  const birthDateError = validateBirthDate(body.birthDate);
  if (birthDateError) {
    errors.push(birthDateError);
  }

  // Geburtszeit validieren (PFLICHTFELD)
  const birthTimeError = validateBirthTime(body.birthTime);
  if (birthTimeError) {
    errors.push(birthTimeError);
  }

  // Geburtsort validieren (PFLICHTFELD)
  const birthPlaceError = validateBirthPlace(body.birthPlace);
  if (birthPlaceError) {
    errors.push(birthPlaceError);
  }

  // Reading-Typ validieren (PFLICHTFELD)
  if (!body.readingType) {
    errors.push({
      code: ValidationErrorCode.INVALID_READING_TYPE,
      field: 'readingType',
      message: 'readingType ist ein Pflichtfeld'
    });
  } else {
    const readingTypeError = validateReadingType(body.readingType);
    if (readingTypeError) {
      errors.push(readingTypeError);
    }
  }

  // Focus validieren (PFLICHTFELD)
  const focusError = validateFocus(body.focus);
  if (focusError) {
    errors.push(focusError);
  }

  // User-ID validieren (optional)
  const userIdError = validateUserId(body.userId);
  if (userIdError) {
    errors.push(userIdError);
  }

  // Compatibility Reading spezielle Validierung
  if (body.readingType === 'compatibility') {
    const compatibilityErrors = validateCompatibilityReading(body.readingType, body);
    errors.push(...compatibilityErrors);
  }

  // Wenn Fehler vorhanden, zurückgeben (HART ABBRECHEN)
  if (errors.length > 0) {
    return {
      valid: false,
      errors
    };
  }

  // Validierte Daten zurückgeben
  return {
    valid: true,
    errors: [],
    data: {
      name: body.name.trim(),
      birthDate: body.birthDate.trim(),
      birthTime: body.birthTime.trim(),
      birthPlace: body.birthPlace.trim(),
      readingType: body.readingType,
      focus: body.focus.trim(),
      userId: body.userId?.trim() || undefined,
      // Für Compatibility Reading
      birthDate2: body.birthDate2?.trim() || undefined,
      birthTime2: body.birthTime2?.trim() || undefined,
      birthPlace2: body.birthPlace2?.trim() || undefined
    }
  };
}

/**
 * Formatiert Validierungs-Fehler für API-Response
 */
export function formatValidationErrors(errors: ValidationError[]): {
  success: false;
  error: string;
  errors: ValidationError[];
  code: string;
} {
  const mainError = errors.length === 1
    ? errors[0].message
    : `${errors.length} Validierungsfehler gefunden`;

  return {
    success: false,
    error: mainError,
    errors,
    code: errors[0]?.code || ValidationErrorCode.INVALID_INPUT
  };
}

