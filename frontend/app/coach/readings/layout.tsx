'use client';

import React from 'react';

export default function ReadingLayout({ children }: { children: React.ReactNode }) {
  // Layout entfernt - Hintergrund wird direkt in der page.tsx gesetzt
  return <>{children}</>;
}

