import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// Server-side Stripe instance - lazy initialization um Build-Fehler zu vermeiden
let stripeInstance: Stripe | null = null;

export function getStripeServerClient(): Stripe | null {
  if (stripeInstance) {
    return stripeInstance;
  }
  
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    // Beim Build ist das okay, wird zur Runtime verfügbar sein
    return null;
  }
  
  stripeInstance = new Stripe(stripeKey, {
    apiVersion: '2025-08-27.basil',
  });
  
  return stripeInstance;
}

// ⚠️ HINWEIS: Der direkte `stripe` Export wurde entfernt, um Build-Fehler zu vermeiden.
// Verwende stattdessen `getStripeServerClient()` in deinen API-Routen.
// Diese Funktion initialisiert Stripe nur zur Runtime, nicht beim Build.

// Client-side Stripe instance
export const getStripe = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ist nicht gesetzt');
  }
  return loadStripe(publishableKey);
};

// Stripe Product IDs für verschiedene Pakete
export const STRIPE_PRODUCTS = {
  BASIC: process.env.STRIPE_BASIC_PRICE_ID || 'prod_TLRONZGIhwK56i',
  PREMIUM: process.env.STRIPE_PREMIUM_PRICE_ID || 'prod_TLRQokF99nZbLL',
  VIP: process.env.STRIPE_VIP_PRICE_ID || 'prod_TLRRRto9OeulkD',
} as const;

// Stripe Product IDs für Buchungen
export const STRIPE_BOOKING_PRODUCTS = {
  // Connection Key Buchungen
  CONNECTION_KEY_SINGLE: 'prod_TLn3wyU9StKNXc', // Connection Key Einzelsession
  CONNECTION_KEY_TRIPLE: 'prod_TLRYaPzOBn1t8j', // Connection Key 3er Paket
  CONNECTION_KEY_FIVE: 'prod_TLRbWZCHxeJoGG', // Connection Key 5er Paket
  
  // Penta Buchungen
  PENTA_SINGLE: 'prod_TU4AJXQPxlrxC1', // Penta Einzelanalyse
  PENTA_EXTENDED: 'prod_TU4BTgjTIQwPvg', // Erweiterte Penta-Analyse
  PENTA_PREMIUM: 'prod_TU4C5SzbjDojsm', // Premium-Penta
  
  // Human Design Readings
  HUMAN_DESIGN_BASIC: process.env.STRIPE_HUMAN_DESIGN_BASIC_PRICE_ID || 'prod_HD_BASIC', // Basis Analyse Human Design (99€)
  HUMAN_DESIGN_EXTENDED: process.env.STRIPE_HUMAN_DESIGN_EXTENDED_PRICE_ID || 'prod_HD_EXTENDED', // Erweiterte Analyse Human Design (149€)
  HUMAN_DESIGN_PREMIUM: process.env.STRIPE_HUMAN_DESIGN_PREMIUM_PRICE_ID || 'prod_HD_PREMIUM', // Premium Analyse Human Design (199€)
  HUMAN_DESIGN_PLANETS: process.env.STRIPE_HUMAN_DESIGN_PLANETS_PRICE_ID || 'prod_HD_PLANETS', // Planeten Reading (129€)
} as const;

// Subscription-Pakete Mapping
export const SUBSCRIPTION_PACKAGES = {
  basic: {
    name: 'Basic',
    price: 9.99,
    features: ['Grundlegende Features', 'Chat-System', 'Mobile App'],
    stripePriceId: STRIPE_PRODUCTS.BASIC,
  },
  premium: {
    name: 'Premium',
    price: 19.99,
    features: ['Alle Basic Features', 'Erweiterte Analytics', 'Priority Support'],
    stripePriceId: STRIPE_PRODUCTS.PREMIUM,
  },
  vip: {
    name: 'VIP',
    price: 49.99,
    features: ['Alle Premium Features', '1:1 Coaching', 'Exklusive Community'],
    stripePriceId: STRIPE_PRODUCTS.VIP,
  },
} as const;

export type SubscriptionPackage = keyof typeof SUBSCRIPTION_PACKAGES;
