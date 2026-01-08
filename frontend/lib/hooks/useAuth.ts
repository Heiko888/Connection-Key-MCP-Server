// lib/hooks/useAuth.ts
'use client';

export type AuthUser = null;

export function useAuth() {
  return {
    user: null as AuthUser,
    loading: false,
    isAuthenticated: false,

    // ⬇️ WICHTIG: alle erwarteten Funktionen stubben
    signOut: async () => {
      console.warn('[Auth] signOut() stubbed');
    },

    signIn: async () => {
      console.warn('[Auth] signIn() stubbed');
    },

    signUp: async () => {
      console.warn('[Auth] signUp() stubbed');
    }
  };
}
