/**
 * MCP Output Normalisierung
 * 
 * Zentrale Logik zum Normalisieren von MCP-Responses zu generatedText.
 * Handhabt verschiedene Response-Formate deterministisch.
 * Validiert Output und klassifiziert Fehler.
 */

import { classifyMcpError, McpErrorType, type McpError, getMcpErrorMessage } from './mcpErrorTypes';

export interface NormalizedMcpOutput {
  generatedText: string | null;
  error: string | null;
  errorType: McpErrorType | null;
  errorDetails: McpError | null;
  raw: any;
}

/**
 * Validiert, ob ein String ein gültiger Output ist
 */
function isValidOutput(text: any): text is string {
  return typeof text === 'string' && text.trim().length > 0;
}

/**
 * Normalisiert eine MCP-Response zu generatedText
 * 
 * @param raw - Raw MCP Response
 * @param httpStatus - HTTP Status Code (optional)
 * @returns Normalisierte Ausgabe mit generatedText
 */
export function normalizeMcpOutput(raw: any, httpStatus?: number): NormalizedMcpOutput {
  // HTTP-Fehler behandeln (401/403)
  if (httpStatus === 401 || httpStatus === 403) {
    const error = classifyMcpError(null, httpStatus);
    return {
      generatedText: null,
      error: getMcpErrorMessage(error),
      errorType: error.type,
      errorDetails: error,
      raw,
    };
  }

  // HTTP-Fehler behandeln (5xx)
  if (httpStatus && httpStatus >= 500) {
    const error = classifyMcpError(null, httpStatus);
    return {
      generatedText: null,
      error: getMcpErrorMessage(error),
      errorType: error.type,
      errorDetails: error,
      raw,
    };
  }

  // Prüfe auf success = false
  if (raw?.success === false) {
    const errorMessage = raw?.error || raw?.message || 'Unbekannter MCP-Fehler';
    const error = classifyMcpError({ message: errorMessage }, httpStatus);
    return {
      generatedText: null,
      error: errorMessage,
      errorType: error.type,
      errorDetails: error,
      raw,
    };
  }

  // 1) success true + output string => generatedText
  if (raw?.success === true && isValidOutput(raw?.output)) {
    return {
      generatedText: raw.output.trim(),
      error: null,
      errorType: null,
      errorDetails: null,
      raw,
    };
  }

  // 2) success true + output object => versuche verschiedene Felder
  if (raw?.success === true && typeof raw?.output === 'object' && raw?.output !== null) {
    const output = raw.output;

    // Versuche verschiedene Felder
    if (isValidOutput(output.text)) {
      return {
        generatedText: output.text.trim(),
        error: null,
        errorType: null,
        errorDetails: null,
        raw,
      };
    }

    if (isValidOutput(output.generatedText)) {
      return {
        generatedText: output.generatedText.trim(),
        error: null,
        errorType: null,
        errorDetails: null,
        raw,
      };
    }

    if (isValidOutput(output.result)) {
      return {
        generatedText: output.result.trim(),
        error: null,
        errorType: null,
        errorDetails: null,
        raw,
      };
    }

    if (isValidOutput(output.content)) {
      return {
        generatedText: output.content.trim(),
        error: null,
        errorType: null,
        errorDetails: null,
        raw,
      };
    }
  }

  // 3) Fallback: Direktes output-Feld (auch ohne success)
  if (isValidOutput(raw?.output)) {
    return {
      generatedText: raw.output.trim(),
      error: null,
      errorType: null,
      errorDetails: null,
      raw,
    };
  }

  // 4) Kein Text gefunden - EMPTY_RESPONSE
  const error = classifyMcpError(raw, httpStatus || 200);
  return {
    generatedText: null,
    error: getMcpErrorMessage(error),
    errorType: McpErrorType.EMPTY_RESPONSE,
    errorDetails: error,
    raw,
  };
}

/**
 * Behandelt spezifische MCP-Fehler und gibt klare Fehlermeldungen zurück
 * @deprecated Verwende stattdessen classifyMcpError und getMcpErrorMessage
 */
export function handleMcpError(error: any): string {
  const classified = classifyMcpError(error);
  return getMcpErrorMessage(classified);
}
