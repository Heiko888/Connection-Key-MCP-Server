"use client";

import React from 'react';
import {
  Box,
  Container,
  Button,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  ArrowLeft,
  Heart,
  Users,
  Key,
  Eye,
  User
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Logo from './Logo';
import SidebarTrigger from './navigation/SidebarTrigger';

interface PageLayoutProps {
  children: React.ReactNode;
  activePage?:
    | 'dashboard'
    | 'dating'
    | 'community'
    | 'profil'
    | 'settings'
    | 'support'
    | 'journal'
    | 'bodygraph'
    | 'knowledge';
  showLogo?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  showLogoInHeader?: boolean;
}

export default function PageLayout({
  children,
  activePage,
  showLogo = true,
  maxWidth = 'lg',
  showLogoInHeader = false,
}: PageLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isDankeseite = pathname?.startsWith('/buchung/dankeseiten');
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      router.push('/');
    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
    }
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: ArrowLeft, active: activePage === 'dashboard' },
    { href: '/dating', label: 'Dating', icon: Heart, active: activePage === 'dating' },
    { href: '/community', label: 'Community', icon: Users, active: activePage === 'community' },
    { href: '/human-design-chart/connection-key', label: 'Resonanzanalyse', icon: Key, active: false },
    { href: '/human-design-chart', label: 'Human Design', icon: Eye, active: activePage === 'bodygraph' },
    { href: '/profil', label: 'Profil', icon: User, active: activePage === 'profil' },
  ];

  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        pt: { xs: 3, md: 4 },
        pb: 4,
        position: 'relative',
        zIndex: 2,
        px: maxWidth === 'xl'
          ? { xs: 1, sm: 2 }
          : { xs: 2, sm: 3, md: 4 }
      }}
    >
      {/* Header */}
      {!isDankeseite && (
        <Box
          sx={{
            mb: { xs: 4, md: 5 },
            display: 'flex',
            justifyContent: { xs: 'space-between', md: 'center' },
            alignItems: 'center',
            gap: 1,
            width: '100%',
            minHeight: { xs: '60px', md: 'auto' },
          }}
        >
          {isMobile ? (
            <>
              <Logo mb={0} />
              <SidebarTrigger />
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {showLogoInHeader && <Logo mb={0} maxWidth={200} />}
              {menuItems.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  startIcon={<item.icon size={18} />}
                  sx={{
                    color: item.active ? '#F29F05' : 'rgba(255,255,255,0.7)',
                    '&:hover': { color: '#F29F05' }
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <SidebarTrigger />
            </Box>
          )}
        </Box>
      )}

      {showLogo && !showLogoInHeader && (
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Logo mb={6} />
        </Box>
      )}

      {children}
    </Container>
  );
}
