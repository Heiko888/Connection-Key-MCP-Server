/**
 * Sichere JSON.parse Funktion mit umfassender Fehlerbehandlung
 * 
 * @deprecated Verwende stattdessen safeJsonParse aus '@/lib/utils/safeJson'
 * Diese Datei bleibt für Backward-Compatibility erhalten.
 */

import { safeJsonParse as safeJsonParseNew, safeLocalStorageParse as safeLocalStorageParseNew, safeLocalStorageSet as safeLocalStorageSetNew, cleanupLocalStorage as cleanupLocalStorageNew } from './safeJson';

/**
 * Parst JSON-String sicher mit Fehlerbehandlung
 * @param jsonString - JSON-String zum Parsen
 * @param fallback - Fallback-Wert bei Fehlern
 * @returns Parsed JSON oder Fallback
 */
export function safeJsonParse<T = any>(
  jsonString: string | null | undefined,
  fallback: T | null = null
): T | null {
  return safeJsonParseNew(jsonString, fallback);
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
  return safeLocalStorageParseNew(key, fallback);
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
  return safeLocalStorageSetNew(key, data);
}

/**
 * Bereinigt localStorage von ungültigen Einträgen
 */
export function cleanupLocalStorage(): void {
  return cleanupLocalStorageNew();
}