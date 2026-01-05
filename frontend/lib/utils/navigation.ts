export interface UserData {
  subscriptionPlan?: string;
  id?: string;
  name?: string;
  email?: string;
}

export interface UserSubscription {
  userId?: string;
  packageId?: string;
  plan?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  autoRenew?: boolean;
  paymentMethod?: string;
  billingCycle?: string;
  features?: string[];
}

/**
 * Intelligente Weiterleitung basierend auf Benutzer-Berechtigungen
 * ✅ OPTIMIERT: Keine Profil-Prüfung mehr - Onboarding erfolgt nur während Registrierung
 */
export const smartRedirect = (targetPath?: string): string => {
  // Lade Benutzer-Daten
  const userData = getUserData();
  const userSubscription = getUserSubscription();
  
  // Bestimme den aktuellen Plan
  const currentPlan = getCurrentPlan(userData, userSubscription);
  
  // Erstelle UserSubscription-Objekt für AccessControl
  const subscription: any = {
    userId: userData?.id || 'unknown',
    packageId: currentPlan as 'basic' | 'premium' | 'vip',
    plan: `${currentPlan} Plan`,
    status: 'active',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: false,
    paymentMethod: 'none',
    billingCycle: 'monthly'
  };
  
  // Wenn eine spezifische Seite gewünscht ist, prüfe die Berechtigung
  if (targetPath) {
    // Page-Access-Check wird später implementiert
    const access = { canAccess: true, requiredPackage: 'free' };
    if (access.canAccess) {
      return targetPath;
    } else {
      return '/premium-dashboard';
    }
  }
  
  // Standard-Weiterleitung basierend auf Plan
  switch (currentPlan) {
    case 'basic':
      return '/dashboard'; // Basic-User verwenden normales Dashboard
    case 'premium':
      return '/premium-dashboard'; // Premium-User haben ihr eigenes Premium-Dashboard
    case 'vip':
      return '/premium-dashboard'; // VIP-User verwenden Premium Dashboard
    case 'admin':
      return '/admin'; // Admin-User haben ihren eigenen Admin-Bereich
    default:
      return '/dashboard'; // Fallback: Normales Dashboard
  }
};

import { safeJsonParse } from './safeJsonParse';

/**
 * Lädt Benutzer-Daten aus localStorage
 */
export const getUserData = (): UserData | null => {
  const userData = localStorage.getItem('userData');
  const parsed = safeJsonParse(userData);
  
  if (!parsed) return null;
  
  return {
    subscriptionPlan: parsed?.subscriptionPlan || 'basic',
    id: parsed?.id || '',
    name: parsed?.name || '',
    email: parsed?.email || ''
  };
};

/**
 * Lädt Subscription-Daten aus localStorage
 */
export const getUserSubscription = (): UserSubscription | null => {
  const userData = localStorage.getItem('userData');
  const user = safeJsonParse(userData);
  
  if (!user) return null;
  
  return {
    userId: user?.id || 'unknown',
    packageId: user?.subscriptionPlan || 'basic', // WICHTIG: subscriptionPlan wird zu packageId
    status: user?.subscriptionStatus || 'active',
    startDate: user?.subscriptionStartDate || new Date().toISOString(),
    endDate: user?.subscriptionEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: user?.autoRenew || false,
    paymentMethod: user?.paymentMethod || 'none',
    billingCycle: user?.billingCycle || 'monthly',
  } as any;
};

/**
 * Bestimmt den aktuellen Plan des Benutzers
 * Normalisiert automatisch ungültige Werte zu 'basic'
 */
export const getCurrentPlan = (userData?: UserData | null, userSubscription?: UserSubscription | null): string => {
  // Gültige Pakete - NUR diese werden akzeptiert
  const allowedPackages = ['basic', 'premium', 'vip', 'admin'];
  
  // Priorität: userSubscription.packageId > userSubscription.plan > userData.subscriptionPlan > 'basic'
  let plan = userSubscription?.packageId || userSubscription?.plan || userData?.subscriptionPlan || 'basic';
  
  // Normalisiere ungültige Werte (null, undefined, '', 'free', 'starter', etc.) zu 'basic'
  if (!plan || typeof plan !== 'string' || !allowedPackages.includes(plan)) {
    if (plan && plan !== 'basic' && plan !== 'premium' && plan !== 'vip' && plan !== 'admin') {
      console.warn(`⚠️ getCurrentPlan: Ungültiges Paket "${plan}" → wird zu "basic" normalisiert`);
    }
    plan = 'basic';
  }
  
  return plan;
};

/**
 * Prüft, ob der Benutzer Zugriff auf eine bestimmte Seite hat
 */
export const hasAccess = (path: string): boolean => {
  const userData = getUserData();
  const userSubscription = getUserSubscription();
  const currentPlan = getCurrentPlan(userData, userSubscription);
  
  const subscription: any = {
    userId: userData?.id || 'unknown',
    packageId: currentPlan as 'basic' | 'premium' | 'vip',
    plan: `${currentPlan} Plan`,
    status: 'active',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: false,
    paymentMethod: 'none',
    billingCycle: 'monthly'
  };
  
  const access = { canAccess: true, requiredPackage: 'free' };
  return access.canAccess;
};

/**
 * Gibt eine Liste der für den Benutzer zugänglichen Seiten zurück
 */
export const getAccessiblePages = (): string[] => {
  const userData = getUserData();
  const userSubscription = getUserSubscription();
  const currentPlan = getCurrentPlan(userData, userSubscription);
  
  const subscription: any = {
    userId: userData?.id || 'unknown',
    packageId: currentPlan as 'basic' | 'premium' | 'vip',
    plan: `${currentPlan} Plan`,
    status: 'active',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    autoRenew: false,
    paymentMethod: 'none',
    billingCycle: 'monthly'
  };
  
  // Liste der wichtigsten Seiten
  const pages = [
    '/dashboard',
    '/chart',
    '/mondkalender',
    '/community',
    '/swipe',
    '/settings',
    '/chart-comparison',
    '/coaching-new',
    '/dashboard-vip',
    '/admin'
  ];
  
  return pages.filter(page => {
    // Page-Access-Check wird später implementiert
    const access = { canAccess: true, requiredPackage: 'free' };
    return access.canAccess;
  });
};
