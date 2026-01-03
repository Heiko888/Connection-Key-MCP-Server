/**
 * Supabase Client Helper Functions
 * 
 * Zentrale Verwaltung für Supabase-Clients mit korrekter RLS-Trennung
 * 
 * Grundregel:
 * - User-Daten → getUserSupabaseClient(userJwt) - RLS aktiv
 * - System / Automation / Admin → getSystemSupabaseClient() - RLS umgangen (bewusst!)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
}

if (!SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY is not set - System-Operationen werden fehlschlagen');
}

/**
 * User Supabase Client (RLS aktiv)
 * 
 * Verwendung für:
 * - User-bezogene Queries (Readings, Tasks, Profile)
 * - RLS Policies werden angewendet
 * - User kann nur eigene Daten sehen
 * 
 * @param userJwt - JWT Token vom User (aus Authorization Header)
 * @returns Supabase Client mit RLS
 */
export function getUserSupabaseClient(userJwt: string): SupabaseClient {
  if (!userJwt) {
    throw new Error('User JWT token is required for getUserSupabaseClient');
  }

  return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        Authorization: `Bearer ${userJwt}`
      }
    }
  });
}

/**
 * System Supabase Client (RLS umgangen - bewusst!)
 * 
 * Verwendung für:
 * - System-Operationen (reading_jobs INSERT, n8n Webhooks)
 * - Admin-Operationen
 * - Background-Jobs
 * - Automation (Agenten, Workflows)
 * 
 * ⚠️ WARNUNG: Service Role Key umgeht RLS komplett!
 * Nur verwenden wenn wirklich notwendig (System-Operationen).
 * 
 * @returns Supabase Client ohne RLS (Service Role Key)
 */
export function getSystemSupabaseClient(): SupabaseClient {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set - cannot create system client');
  }

  return createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
}

/**
 * Extract User JWT from Request
 * 
 * Extrahiert JWT Token aus Authorization Header
 * 
 * @param request - Next.js Request
 * @returns JWT Token oder null
 */
export function extractUserJwt(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.replace('Bearer ', '').trim();
}

/**
 * Require User Authentication
 * 
 * Prüft ob User JWT vorhanden ist, wirft Error wenn nicht
 * 
 * @param request - Next.js Request
 * @returns JWT Token
 * @throws Error wenn kein Token vorhanden
 */
export function requireUserAuth(request: Request): string {
  const userJwt = extractUserJwt(request);
  
  if (!userJwt) {
    throw new Error('Unauthorized - Missing or invalid Authorization header');
  }

  return userJwt;
}
