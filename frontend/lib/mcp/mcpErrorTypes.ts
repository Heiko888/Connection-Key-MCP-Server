/**
 * MCP Error Types
 * 
 * Klare Fehlerklassifikation für MCP-Server-Aufrufe.
 * Jeder Fehlertyp wird unterschiedlich behandelt.
 */

export enum McpErrorType {
  TIMEOUT = 'MCP_TIMEOUT',
  UNAUTHORIZED = 'MCP_UNAUTHORIZED',
  EMPTY_RESPONSE = 'MCP_EMPTY_RESPONSE',
  RUNTIME_ERROR = 'MCP_RUNTIME_ERROR',
  NETWORK_ERROR = 'MCP_NETWORK_ERROR',
  UNKNOWN = 'MCP_UNKNOWN',
}

export interface McpError {
  type: McpErrorType;
  message: string;
  httpStatus?: number;
  originalError?: any;
  timestamp: string;
}

/**
 * Klassifiziert einen Fehler basierend auf dem Fehlertyp
 */
export function classifyMcpError(error: any, httpStatus?: number): McpError {
  const timestamp = new Date().toISOString();

  // Timeout (AbortController)
  if (error?.name === 'AbortError' || error?.code === 'ECONNABORTED') {
    return {
      type: McpErrorType.TIMEOUT,
      message: 'MCP-Server hat nicht innerhalb von 120 Sekunden geantwortet.',
      httpStatus: 504,
      originalError: error,
      timestamp,
    };
  }

  // Unauthorized (401/403)
  if (httpStatus === 401 || httpStatus === 403) {
    return {
      type: McpErrorType.UNAUTHORIZED,
      message: 'MCP-Server hat die Anfrage abgelehnt. Bitte API-Key prüfen.',
      httpStatus,
      originalError: error,
      timestamp,
    };
  }

  // Network Error (keine Verbindung)
  if (error?.message?.includes('fetch') || error?.code === 'ENOTFOUND' || error?.code === 'ECONNREFUSED') {
    return {
      type: McpErrorType.NETWORK_ERROR,
      message: 'MCP-Server ist nicht erreichbar. Bitte Verbindung prüfen.',
      httpStatus: 503,
      originalError: error,
      timestamp,
    };
  }

  // Runtime Error (5xx)
  if (httpStatus && httpStatus >= 500) {
    return {
      type: McpErrorType.RUNTIME_ERROR,
      message: `MCP-Server Fehler (${httpStatus}). Bitte später erneut versuchen.`,
      httpStatus,
      originalError: error,
      timestamp,
    };
  }

  // Empty Response (wird in normalizeMcpOutput behandelt)
  if (httpStatus === 200 && (!error || error.success === true)) {
    return {
      type: McpErrorType.EMPTY_RESPONSE,
      message: 'MCP-Server hat keinen verwertbaren Text geliefert.',
      httpStatus: 200,
      originalError: error,
      timestamp,
    };
  }

  // Unknown
  return {
    type: McpErrorType.UNKNOWN,
    message: error?.message || 'Unbekannter Fehler beim MCP-Server-Aufruf.',
    httpStatus,
    originalError: error,
    timestamp,
  };
}

/**
 * Gibt eine benutzerfreundliche Fehlermeldung zurück
 */
export function getMcpErrorMessage(error: McpError): string {
  switch (error.type) {
    case McpErrorType.TIMEOUT:
      return 'Der MCP-Server hat zu lange gebraucht. Bitte versuchen Sie es erneut.';
    case McpErrorType.UNAUTHORIZED:
      return 'Authentifizierung fehlgeschlagen. Bitte Administrator kontaktieren.';
    case McpErrorType.NETWORK_ERROR:
      return 'Der MCP-Server ist nicht erreichbar. Bitte Verbindung prüfen.';
    case McpErrorType.EMPTY_RESPONSE:
      return 'Der MCP-Server hat keinen Text generiert. Bitte versuchen Sie es erneut.';
    case McpErrorType.RUNTIME_ERROR:
      return 'Der MCP-Server hat einen Fehler gemeldet. Bitte später erneut versuchen.';
    default:
      return error.message;
  }
}

