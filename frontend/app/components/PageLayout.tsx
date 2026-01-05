"use client";

import React, { useState } from 'react';
import { Box, Container, Button, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon, X, User, Settings, HelpCircle, LogOut, ArrowLeft, Heart, Users, Key, Eye, Lightbulb, Info, Crown, UserPlus, Calendar, BookOpen, Trophy, Grid, Sparkles, Target, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Logo from './Logo';
import SidebarTrigger from './navigation/SidebarTrigger';

interface PageLayoutProps {
  children: React.ReactNode;
  activePage?: 'dashboard' | 'dating' | 'community' | 'profil' | 'settings' | 'support' | 'journal' | 'bodygraph';
  showLogo?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  showLogoInHeader?: boolean;
}

export default function PageLayout({ children, activePage, showLogo = true, maxWidth = 'lg', showLogoInHeader = false }: PageLayoutProps) {
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
    <Container maxWidth={maxWidth} sx={{ pt: { xs: 3, md: 4 }, pb: 4, position: 'relative', zIndex: 2, px: maxWidth === 'xl' ? { xs: 1, sm: 2 } : { xs: 2, sm: 3, md: 4 } }}>
      {/* Header mit Desktop Menu und Mobile Menu - Ausgeblendet auf Dankeseiten */}
      {!isDankeseite && (
      <Box sx={{ 
        mb: { xs: 4, md: 5 }, 
        display: 'flex', 
        justifyContent: { xs: 'space-between', md: 'center' }, 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1,
        width: '100%',
        position: 'relative',
        zIndex: 10,
        minHeight: { xs: '60px', md: 'auto' },
        // Konsistentes Padding rechts wie bei lg Container (xs: 2, sm: 3, md: 4), unabhängig von maxWidth
        pr: maxWidth === 'xl' ? { xs: 2, sm: 3, md: 4 } : 0,
        // Negative Margin links, um das zusätzliche Padding rechts auszugleichen
        ml: maxWidth === 'xl' ? { xs: -1, sm: -2 } : 0
      }}>
        {/* Mobile Header - Logo links, Burger rechts oben */}
        {isMobile && (
          <>
            {/* Mobile Logo - Links */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              flex: 1,
              minWidth: 0
            }}>
              <Logo mb={0} />
            </Box>
            {/* Mobile Burger Menu - Rechts oben im Header */}
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              ml: 'auto'
            }}>
              <SidebarTrigger />
            </Box>
          </>
        )}

        {/* Desktop Buttons - Zentriert */}
        <Box sx={{ 
          display: { xs: 'none', md: 'flex' }, 
          gap: 1, 
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          width: '100%'
        }}>
          {/* Logo im Desktop-Header - nur wenn showLogoInHeader aktiviert */}
          {showLogoInHeader && (
            <Box sx={{ mr: 2 }}>
              <Logo mb={0} height={{ xs: 40, md: 50 }} width={{ xs: 'auto', md: 200 }} maxWidth={200} />
            </Box>
          )}
          {menuItems.map((item) => (
            <Button
              key={item.href}
              component={item.href === '/dashboard' ? Link : Link}
              href={item.href}
              variant="text"
              sx={{
                color: item.active ? '#F29F05' : 'rgba(255, 255, 255, 0.7)',
                minWidth: 'auto',
                px: 2,
                py: 1,
                borderRadius: 2,
                backgroundColor: item.active ? 'rgba(242, 159, 5, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: item.active ? 'rgba(242, 159, 5, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  color: item.active ? '#F29F05' : 'rgba(255, 255, 255, 0.9)'
                },
                transition: 'all 0.3s ease'
              }}
              startIcon={<item.icon size={18} />}
            >
              {item.label}
            </Button>
          ))}

          {/* Burger Menu auch auf Desktop sichtbar */}
          <SidebarTrigger />
        </Box>
      </Box>
      )}


      {/* Logo - Desktop only (Mobile Logo ist im Header) - Ausgeblendet wenn Logo im Header angezeigt wird */}
      {showLogo && !showLogoInHeader && <Box sx={{ display: { xs: 'none', md: 'block' } }}><Logo mb={6} /></Box>}

      {/* Page Content */}
      {children}
    </Container>
  );
}

