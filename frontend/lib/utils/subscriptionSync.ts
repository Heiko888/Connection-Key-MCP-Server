/**
 * Utility functions for synchronizing subscription data between localStorage and cookies
 */

import { UserSubscription as BaseUserSubscription } from '../subscription/types';

export type UserSubscription = BaseUserSubscription;

/**
 * Sync subscription data from localStorage to cookies
 * This ensures the middleware can access subscription data
 */
export function syncSubscriptionToCookies(subscription: UserSubscription | null) {
  if (typeof window === 'undefined') return;
  
  if (subscription) {
    document.cookie = `user-subscription=${JSON.stringify(subscription)}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
  } else {
    // Clear subscription cookie
    document.cookie = 'user-subscription=; path=/; max-age=0';
  }
}

/**
 * Get subscription data from cookies (for middleware access)
 */
export function getSubscriptionFromCookies(): UserSubscription | null {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const subscriptionCookie = cookies.find(cookie => 
    cookie.trim().startsWith('user-subscription=')
  );
  
  if (subscriptionCookie) {
    try {
      const subscriptionData = subscriptionCookie.split('=')[1];
      return JSON.parse(decodeURIComponent(subscriptionData));
    } catch (error) {
      console.warn('Failed to parse subscription cookie:', error);
    }
  }
  
  return null;
}

/**
 * Sync subscription data on login/logout
 */
export function handleSubscriptionSync() {
  if (typeof window === 'undefined') return;
  
  // Check if user is logged in
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  if (token && userId) {
    // User is logged in, sync subscription data
    const userSubscription = localStorage.getItem('userSubscription');
    if (userSubscription) {
      try {
        const subscription = JSON.parse(userSubscription);
        syncSubscriptionToCookies(subscription);
      } catch (error) {
        console.warn('Failed to sync subscription data:', error);
      }
    }
  } else {
    // User is logged out, clear subscription data
    syncSubscriptionToCookies(null);
  }
}

/**
 * Initialize subscription sync on page load
 */
export function initializeSubscriptionSync() {
  if (typeof window === 'undefined') return;
  
  // Sync on page load
  handleSubscriptionSync();
  
  // Listen for storage changes (e.g., when user logs in/out in another tab)
  window.addEventListener('storage', (event) => {
    if (event.key === 'token' || event.key === 'userSubscription') {
      handleSubscriptionSync();
    }
  });
  
  // Listen for custom events (e.g., when subscription changes)
  window.addEventListener('subscription-updated', () => {
    handleSubscriptionSync();
  });
}
