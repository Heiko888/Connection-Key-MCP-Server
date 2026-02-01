'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Coach Dashboard - Redirect to Readings List
 * Das Dashboard zeigt die Readings-Verwaltung
 */
export default function CoachDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Sofort zur Readings-Liste weiterleiten
    router.replace('/coach/readings-v4/list');
  }, [router]);

  return null;
}
