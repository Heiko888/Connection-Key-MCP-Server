// TEMPORARY STUB: Dummy Supabase Client für Build-Fix
// TODO: Später durch echten Supabase Client ersetzen

'use client';

// Dummy Supabase Client Interface
const createDummyClient = () => ({
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: () => ({ data: { subscription: null }, error: null }),
  },
  from: (_table: string) => ({
    select: (_columns?: string) => ({ 
      eq: (_column: string, _value: any) => ({ 
        maybeSingle: async () => ({ data: null, error: null }),
        single: async () => ({ data: null, error: null }),
      }),
      maybeSingle: async () => ({ data: null, error: null }),
      single: async () => ({ data: null, error: null }),
    }),
    insert: (_data: any) => ({ select: async (_columns?: string) => ({ data: null, error: null }) }),
    update: (_data: any) => ({ eq: (_column: string, _value: any) => ({ select: async (_columns?: string) => ({ data: null, error: null }) }) }),
    delete: () => ({ eq: (_column: string, _value: any) => async () => ({ data: null, error: null }) }),
  }),
});

export function createClient() {
  return createDummyClient();
}

// Factory-Funktion für Singleton Client
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient();
  }
  return supabaseInstance;
}

// Export für backwards compatibility
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof ReturnType<typeof createClient>];
  }
});

// Helper-Funktionen
export function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
}

export function setStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
}

export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(key);
}
