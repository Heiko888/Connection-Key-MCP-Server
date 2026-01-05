import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export function createClient() {
  const cookieStore = cookies();
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Verwende Publishable Key (neues Supabase-Key-Modell)
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Y-pGGWYrMl_Uhl52hTAxCw_bVU0EFTb';
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('[createClient] FEHLER: Environment-Variablen fehlen:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey,
    });
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set (server-side).');
  }

  // DEBUG: Nur in Development-Modus oder wenn explizit aktiviert
  const isDebugMode = process.env.NODE_ENV === 'development' && process.env.SUPABASE_DEBUG === 'true';
  
  if (isDebugMode) {
    const authCookies = cookieStore.getAll().filter(c => c.name.includes('auth') || c.name.includes('supabase'));
    console.log('[createClient] Supabase-Client wird initialisiert:', {
      hasCookieStore: !!cookieStore,
      authCookieCount: authCookies.length,
      authCookieNames: authCookies.map(c => c.name),
      supabaseUrl: supabaseUrl ? 'gesetzt' : 'FEHLT',
      supabaseKey: supabaseKey ? 'gesetzt' : 'FEHLT',
    });
  }

  const client = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          const value = cookieStore.get(name)?.value;
          // Nur in Debug-Modus loggen
          if (isDebugMode && (name.includes('auth') || name.includes('supabase'))) {
            console.log(`[createClient] Cookie gelesen: ${name} = ${value ? 'vorhanden (' + value.substring(0, 20) + '...)' : 'FEHLT'}`);
          }
          return value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
  
  if (isDebugMode) {
    console.log('[createClient] Supabase-Client erfolgreich erstellt');
  }
  
  return client;
}

