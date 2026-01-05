/**
 * Helper-Funktion zum Refactoren des verbotenen Patterns:
 * 
 * ❌ VERBOTEN:
 * const errorText = await response.text();
 * let errorMessage = 'Default';
 * try {
 *   const errorData = JSON.parse(errorText);
 *   errorMessage = errorData.error || errorData.message || errorMessage;
 * } catch {
 *   errorMessage = `HTTP ${response.status}: ${errorText || errorMessage}`;
 * }
 * 
 * ✅ KORREKT:
 * const { safeResponseText, safeTextParse } = await import('@/lib/utils/safeJson');
 * const errorText = await safeResponseText(response, 'Unknown error');
 * const errorData = safeTextParse<{ error?: string; message?: string }>(errorText, null);
 * const errorMessage = (errorData && !('error' in errorData) && (errorData.error || errorData.message)) 
 *   || `HTTP ${response.status}: ${errorText || 'Default'}`;
 */

export async function parseErrorResponse(
  response: Response,
  defaultMessage: string
): Promise<string> {
  const { safeResponseText, safeTextParse } = await import('./safeJson');
  const errorText = await safeResponseText(response, 'Unknown error');
  const errorData = safeTextParse<{ error?: string; message?: string }>(errorText, null);
  
  if (errorData && !('error' in errorData)) {
    return errorData.error || errorData.message || defaultMessage;
  }
  
  return `HTTP ${response.status}: ${errorText || defaultMessage}`;
}

