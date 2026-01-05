/**
 * Sichere JSON-Parsing Utilities für Next.js (Server & Client)
 * 
 * Verhindert Production-Crashes durch ungültige JSON-Strings
 * und unsichere API-Response-Parsing.
 */

/**
 * Parst JSON-String sicher mit umfassender Fehlerbehandlung
 * @param jsonString - JSON-String zum Parsen
 * @param fallback - Fallback-Wert bei Fehlern
 * @returns Parsed JSON oder Fallback
 */
export function safeJsonParse<T = any>(
  jsonString: string | null | undefined,
  fallback: T | null = null
): T | null {
  if (!jsonString || jsonString.trim() === '') {
    return fallback;
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('[safeJsonParse] JSON.parse Fehler:', {
      error: error instanceof Error ? error.message : String(error),
      jsonPreview: jsonString.substring(0, 200),
      jsonLength: jsonString.length,
    });
    return fallback;
  }
}

/**
 * Parst localStorage-Item sicher
 * @param key - localStorage-Schlüssel
 * @param fallback - Fallback-Wert
 * @returns Parsed JSON oder Fallback
 */
export function safeLocalStorageParse<T = any>(
  key: string,
  fallback: T | null = null
): T | null {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const item = localStorage.getItem(key);
    return safeJsonParse(item, fallback);
  } catch (error) {
    console.warn(`[safeLocalStorageParse] Fehler beim Laden von ${key}:`, error);
    return fallback;
  }
}

/**
 * Parst eine Response sicher (prüft Content-Type und verwendet response.json() oder response.text())
 * @param response - Fetch Response
 * @param fallback - Fallback-Wert bei Fehlern
 * @returns Parsed JSON oder Fallback mit error-Property
 */
export async function safeResponseParse<T = any>(
  response: Response,
  fallback: T | null = null
): Promise<T | { error: string }> {
  try {
    const contentType = response.headers.get('content-type');
    
    // Prüfe ob Response JSON ist
    if (contentType && contentType.includes('application/json')) {
      try {
        const data = await response.json();
        return data as T;
      } catch (jsonError) {
        // Fallback: Versuche als Text zu lesen
        const text = await response.text().catch(() => 'Unknown error');
        console.error('[safeResponseParse] JSON-Parse Fehler:', {
          error: jsonError instanceof Error ? jsonError.message : String(jsonError),
          contentType,
          textPreview: text.substring(0, 200),
        });
        return { error: text } as any;
      }
    } else {
      // Nicht-JSON Response: Lese als Text
      const text = await response.text().catch(() => 'Unknown error');
      return { error: text } as any;
    }
  } catch (error) {
    console.error('[safeResponseParse] Unerwarteter Fehler:', {
      error: error instanceof Error ? error.message : String(error),
      status: response.status,
      statusText: response.statusText,
    });
    return { error: error instanceof Error ? error.message : 'Unknown error' } as any;
  }
}

/**
 * Parst response.text() sicher (für Fehler-Responses)
 * @param response - Fetch Response
 * @param fallback - Fallback-Text
 * @returns Text oder Fallback
 */
export async function safeResponseText(
  response: Response,
  fallback: string = 'Unknown error'
): Promise<string> {
  try {
    const text = await response.text();
    return text || fallback;
  } catch (error) {
    console.error('[safeResponseText] Fehler beim Lesen der Response:', {
      error: error instanceof Error ? error.message : String(error),
      status: response.status,
    });
    return fallback;
  }
}

/**
 * Parst einen Text-String als JSON (für errorText von response.text())
 * @param text - Text-String (kann JSON oder Plain-Text sein)
 * @param fallback - Fallback-Wert
 * @returns Parsed JSON oder Fallback mit error-Property
 */
export function safeTextParse<T = any>(
  text: string | null | undefined,
  fallback: T | null = null
): T | { error: string } {
  if (!text || text.trim() === '') {
    return fallback as T;
  }

  try {
    // Versuche als JSON zu parsen
    return JSON.parse(text) as T;
  } catch (error) {
    // Nicht-JSON: Gib als error-Property zurück
    return { error: text } as any;
  }
}

/**
 * Speichert Daten sicher in localStorage
 * @param key - localStorage-Schlüssel
 * @param data - Zu speichernde Daten
 * @returns Erfolg der Speicherung
 */
export function safeLocalStorageSet(
  key: string,
  data: any
): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const jsonString = JSON.stringify(data);
    localStorage.setItem(key, jsonString);
    return true;
  } catch (error) {
    console.error(`[safeLocalStorageSet] Fehler beim Speichern von ${key}:`, error);
    return false;
  }
}

/**
 * Bereinigt localStorage von ungültigen Einträgen
 */
export function cleanupLocalStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const keysToCheck = [
    'userData',
    'userSubscription',
    'userId',
    'userEmail',
    'userPackage',
    'userReadings',
    'userBookings',
    'userChart',
    'journalEntries',
    'community-posts',
  ];
  
  keysToCheck.forEach(key => {
    try {
      const item = localStorage.getItem(key);
      if (item && item.trim() !== '') {
        // Versuche zu parsen - wenn Fehler, entferne Eintrag
        JSON.parse(item);
      }
    } catch (error) {
      console.warn(`[cleanupLocalStorage] Bereinige ungültigen localStorage-Eintrag: ${key}`);
      localStorage.removeItem(key);
    }
  });
}

