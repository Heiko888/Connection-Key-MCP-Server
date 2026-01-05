/**
 * Model Pricing
 * 
 * Preisliste für verschiedene AI-Modelle.
 * Basis für Kostenberechnung.
 */

export interface ModelPricing {
  input: number; // Preis pro Input-Token (USD)
  output: number; // Preis pro Output-Token (USD)
}

export interface ModelPricingList {
  [model: string]: ModelPricing;
}

/**
 * Preisliste für verschiedene Modelle
 * 
 * Preise in USD pro Token
 * Quelle: OpenAI Pricing (Stand: 2025)
 */
export const modelPricing: ModelPricingList = {
  'gpt-4.1': {
    input: 0.00001, // $0.01 pro 1k Input-Tokens
    output: 0.00003, // $0.03 pro 1k Output-Tokens
  },
  'gpt-4o-mini': {
    input: 0.000003, // $0.003 pro 1k Input-Tokens
    output: 0.000006, // $0.006 pro 1k Output-Tokens
  },
  'gpt-4': {
    input: 0.00003, // $0.03 pro 1k Input-Tokens
    output: 0.00006, // $0.06 pro 1k Output-Tokens
  },
  'gpt-3.5-turbo': {
    input: 0.0000005, // $0.0005 pro 1k Input-Tokens
    output: 0.0000015, // $0.0015 pro 1k Output-Tokens
  },
  // Default-Fallback
  'default': {
    input: 0.00001,
    output: 0.00003,
  },
};

/**
 * Berechnet die geschätzten Kosten für einen MCP-Call
 * 
 * @param model - Modell-Name (z.B. "gpt-4.1")
 * @param inputTokens - Anzahl Input-Tokens
 * @param outputTokens - Anzahl Output-Tokens
 * @returns Geschätzte Kosten in USD
 */
export function calculateCost(
  model: string | null | undefined,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = modelPricing[model || 'default'] || modelPricing['default'];
  
  const inputCost = inputTokens * pricing.input;
  const outputCost = outputTokens * pricing.output;
  
  return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000; // Auf 6 Dezimalstellen gerundet
}

/**
 * Gibt die Pricing-Informationen für ein Modell zurück
 */
export function getModelPricing(model: string | null | undefined): ModelPricing {
  return modelPricing[model || 'default'] || modelPricing['default'];
}

