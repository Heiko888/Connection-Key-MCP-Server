"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MeineBuchungenPage() {
  const router = useRouter();

  useEffect(() => {
    // Leite zur Resonanzanalyse-Seite mit Tab 2 (Buchungen) um
    router.replace('/resonanzanalyse?tab=2');
  }, [router]);

  return null;
}
