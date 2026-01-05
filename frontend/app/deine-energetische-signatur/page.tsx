'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeineEnergetischeSignaturRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/connection-key');
  }, [router]);

  return null;
}

