'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '@/lib/hooks/useAuth';

type PackageId = 'basic' | 'premium' | 'vip' | 'admin';

const roleHierarchy: Record<PackageId, number> = {
  basic: 1,
  premium: 2,
  vip: 3,
  admin: 4,
};

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: PackageId; // mindest-Level (basic, premium, vip, admin)
}

export default function ProtectedRoute({
  children,
  requiredRole = 'basic',
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '/';

  useEffect(() => {
    if (loading) return;

    // Nicht eingeloggt → Login
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Paket-Level prüfen
    const userLevel = roleHierarchy[user.package || 'basic'];
    const requiredLevel = roleHierarchy[requiredRole];

    if (userLevel < requiredLevel) {
      // kein Zugriff auf diese Seite → Pricing
      router.replace('/pricing');
    }
  }, [loading, user, requiredRole, router, pathname]);

  // Während Auth lädt → Spinner
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: '#F29F05' }} />
      </Box>
    );
  }

  // Nicht eingeloggt → wir haben schon redirect ausgelöst
  if (!user) return null;

  // Paket-Level noch mal synchron prüfen
  const userLevel = roleHierarchy[user.package || 'basic'];
  const requiredLevel = roleHierarchy[requiredRole];

  if (userLevel < requiredLevel) {
    // Redirect läuft bereits, nichts anzeigen
    return null;
  }

  return <>{children}</>;
}
