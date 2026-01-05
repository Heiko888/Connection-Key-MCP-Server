'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AppHeader from '@/app/components/AppHeader';
import AppFooter from '@/app/components/AppFooter';

export default function ClientLayoutFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Header überall deaktivieren
  const hideHeader = true; // Header wird nicht mehr benötigt
  // Footer für Reading-Bereich und Dankeseiten deaktivieren
  const isReadingPage = pathname?.startsWith('/coach/readings');
  const isDankeseite = pathname?.startsWith('/buchung/dankeseiten');
  const hideFooter = (pathname === '/impressum' || pathname === '/datenschutz' || isReadingPage || isDankeseite) ?? false;

  return (
    <>
      {!hideHeader && <AppHeader />}
      <div style={{ paddingTop: hideHeader ? 0 : 72, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>{children}</div>
        {!hideFooter && <AppFooter />}
      </div>
    </>
  );
}


