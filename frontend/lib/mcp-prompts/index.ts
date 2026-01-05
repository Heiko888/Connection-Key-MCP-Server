/**
 * Prompt Template Registry
 * 
 * Zentrale Registry für alle Prompt-Templates.
 * Explizit, nicht dynamisch, build-sicher.
 */

import type { PromptTemplate, PromptRegistry } from './types';
import { basicV1 } from './basic.v1';
import { connectionV1 } from './connection.v1';
import { businessV1 } from './business.v1';
import { pentaV1 } from './penta.v1';

/**
 * Registry aller Prompt-Templates
 */
const promptRegistry: PromptRegistry = {
  basic: basicV1,
  connection: connectionV1,
  business: businessV1,
  penta: pentaV1,
  // Weitere Reading-Types können hier hinzugefügt werden
  detailed: basicV1, // Fallback zu basic
  relationship: basicV1, // Fallback zu basic
  single: basicV1, // Fallback zu basic
};

/**
 * Gibt das Prompt-Template für einen Reading-Type zurück
 */
export function getPromptTemplate(readingType: string): PromptTemplate | null {
  return promptRegistry[readingType] || null;
}

/**
 * Gibt alle verfügbaren Prompt-Templates zurück
 */
export function listPromptTemplates(): PromptTemplate[] {
  return Object.values(promptRegistry);
}

/**
 * Gibt die Schema-Version für einen Reading-Type zurück
 */
export function getSchemaVersion(readingType: string): string | null {
  const template = getPromptTemplate(readingType);
  return template?.schemaVersion || null;
}

/**
 * Prüft ob ein Prompt-Template für einen Reading-Type existiert
 */
export function hasPromptTemplate(readingType: string): boolean {
  return readingType in promptRegistry;
}

/**
 * Gibt alle Reading-Types zurück, für die Templates existieren
 */
export function getReadingTypesWithTemplates(): string[] {
  return Object.keys(promptRegistry);
}

export type { PromptTemplate, PromptRegistry };

