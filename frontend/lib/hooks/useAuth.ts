'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

type PackageId = 'basic' | 'premium' | 'vip' | 'admin';

const allowedPackages: PackageId[] = ['basic', 'premium', 'vip', 'admin'];

const roleHierarchy: Record<PackageId, number> = {
  basic: 1,
  premium: 2,
  vip: 3,
  admin: 4,
};

export interface AppUser {
  id: string;
  email: string | null;
  package: PackageId;
  rawUser: any;
}

interface UseAuthResult {
  user: AppUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  checkAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  roleHierarchy: typeof roleHierarchy;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      // ⚡ Timeout für Mobile: Maximal 5 Sekunden warten
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 5000)
      );
      
      // 1. Supabase User holen mit Timeout
      const getUserPromise = supabase.auth.getUser();
      const { data, error } = await Promise.race([getUserPromise, timeoutPromise]) as any;

      if (error || !data?.user) {
        setUser(null);
        setLoading(false);
        return;
      }

      const authUser = data.user;

      // 2. Paket aus subscriptions-Tabelle holen (DIE WAHRHEIT)
      let userPackage: PackageId = 'basic';

      // ⚡ Timeout für Subscription-Abfrage (3 Sekunden)
      try {
        const subscriptionTimeout = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Subscription timeout')), 3000)
        );
        
        const subscriptionPromise = supabase
          .from('subscriptions')
          .select('package_id')
          .eq('user_id', authUser.id)
          .maybeSingle();
        
        const { data: subscription, error: subError } = await Promise.race([
          subscriptionPromise,
          subscriptionTimeout
        ]) as any;

        if (!subError && subscription?.package_id && allowedPackages.includes(subscription.package_id as PackageId)) {
          userPackage = subscription.package_id as PackageId;
        } else if (
          typeof authUser.user_metadata?.package === 'string' &&
          allowedPackages.includes(authUser.user_metadata.package as PackageId)
        ) {
          // Fallback: altes Feld im user_metadata
          userPackage = authUser.user_metadata.package as PackageId;
        }
      } catch (subTimeoutError) {
        // ⚡ Subscription-Abfrage hat gehangen - verwende Fallback
        console.warn('⚠️ Subscription-Abfrage timeout, verwende Fallback');
        if (
          typeof authUser.user_metadata?.package === 'string' &&
          allowedPackages.includes(authUser.user_metadata.package as PackageId)
        ) {
          userPackage = authUser.user_metadata.package as PackageId;
        }
      }

      setUser({
        id: authUser.id,
        email: authUser.email || null,
        package: userPackage,
        rawUser: authUser,
      });
    } catch (e) {
      console.error('❌ useAuth: Fehler beim Laden des Users:', e);
      setUser(null);
      // ⚡ Wichtig: Auch bei Fehler/Timeout loading auf false setzen
      // Sonst bleibt die Seite für immer im Loading-Zustand
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Login-Funktion hinzufügen
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.session || !data.user) {
        return { success: false, error: "Keine Session erhalten" };
      }

      // Session-Token in localStorage speichern (für Kompatibilität)
      if (typeof window !== "undefined") {
        localStorage.setItem("token", data.session.access_token);
        localStorage.setItem("userId", data.user.id);
        localStorage.setItem("userEmail", data.user.email || "");
        // ⚡ Setze Package sofort als Fallback (wird später überschrieben)
        const fallbackPackage = data.user.user_metadata?.package || 'basic';
        localStorage.setItem("userPackage", fallbackPackage);
      }

      // ⚡ Setze User-State sofort (ohne auf loadUser zu warten)
      // Das verhindert, dass ProtectedRoute den User als nicht authentifiziert sieht
      setUser({
        id: data.user.id,
        email: data.user.email || null,
        package: (data.user.user_metadata?.package as PackageId) || 'basic',
        rawUser: data.user,
      });
      setLoading(false);

      // ⚡ User-Daten asynchron im Hintergrund laden (nicht blockierend)
      // Wird automatisch durch onAuthStateChange getriggert, aber wir starten es auch manuell
      loadUser().catch((err) => {
        console.warn('⚠️ loadUser nach Login fehlgeschlagen (nicht kritisch):', err);
        // User ist bereits gesetzt, also kein Problem
      });

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login fehlgeschlagen";
      return { success: false, error: errorMessage };
    }
  }, [loadUser]);

  // ✅ checkAuth - Alias für loadUser
  const checkAuth = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  useEffect(() => {
    // Initial laden
    loadUser();

    // Listener für Auth-Änderungen (Login/Logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, _session) => {
      loadUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [loadUser]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("userPackage");
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
    }
  }, []);

  // ✅ isAuthenticated - computed property
  const isAuthenticated = user !== null && !loading;

  return {
    user,
    loading,
    isAuthenticated,
    login,
    checkAuth,
    signOut,
    roleHierarchy,
  };
}
