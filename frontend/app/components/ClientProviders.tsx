"use client";
import React from 'react';
import ClientErrorBoundary from '@/app/components/ClientErrorBoundary'
import { NotificationProvider } from '@/components/NotificationService'
import ThemeRegistry from '@/components/ThemeRegistry'

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ClientErrorBoundary>
      <ThemeRegistry>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </ThemeRegistry>
    </ClientErrorBoundary>
  );
}
