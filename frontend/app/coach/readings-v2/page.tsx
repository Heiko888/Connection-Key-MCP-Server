'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CoachAuth from '@/components/CoachAuth';

function ReadingsV2PageContent() {
  const router = useRouter();

  useEffect(() => {
    // Weiterleitung zur Create-Seite
    router.push('/coach/readings-v2/create');
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <p>Weiterleitung...</p>
    </div>
  );
}

export default function ReadingsV2Page() {
  return (
    <CoachAuth>
      <ReadingsV2PageContent />
    </CoachAuth>
  );
}

