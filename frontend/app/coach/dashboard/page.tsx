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
    // Fallback: route muss im Frontend existieren.
    // Die V4-Readings-List-Route liegt im Coach-Frontend (integration/frontend).
    router.replace('/coach');
  }, [router]);

  return null;
}
