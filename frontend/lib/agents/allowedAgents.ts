/**
 * Whitelist der erlaubten Agenten
 * Nur Agenten in dieser Liste können über die API ausgeführt werden
 */
export const ALLOWED_AGENTS = [
  'marketing',
  'automation',
  'sales',
  'social-youtube',
  'chart',
  'ui-ux',
] as const;

export type AllowedAgent = typeof ALLOWED_AGENTS[number];

/**
 * Prüft ob ein Agent in der Whitelist ist
 */
export function isAllowedAgent(agentId: string): agentId is AllowedAgent {
  return ALLOWED_AGENTS.includes(agentId as AllowedAgent);
}
