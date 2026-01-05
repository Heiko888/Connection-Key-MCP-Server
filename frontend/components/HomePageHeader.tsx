"use client";
import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Container,
  Skeleton
} from '@mui/material';
import Image from 'next/image';
import { useAuth } from '@/lib/hooks/useAuth';
import {
  Home,
  Heart,
  Calendar,
  Users,
  LogOut,
  LogIn,
  UserPlus,
  FileText
} from 'lucide-react';

// Ausgewählte Seiten für die Startseite
const homePageMenuItems = [
  { label: 'Startseite', path: '/', icon: <Home size={20} /> },
  { label: 'Dating', path: '/dating', icon: <Heart size={20} /> },
  { label: 'Mondkalender', path: '/mondkalender', icon: <Calendar size={20} /> },
  { label: 'Friends', path: '/friends', icon: <Users size={20} /> },
  { label: 'Seitenanzeige', path: '/seitenanzeige', icon: <FileText size={20} /> },
];

// Auth-Menü basierend auf Login-Status
const getAuthMenuItems = (isLoggedIn: boolean) => {
  if (isLoggedIn) {
    return [
      { label: 'Abmelden', path: '/logout', icon: <LogOut size={20} /> },
    ];
  } else {
    return [
      { label: 'Anmelden', path: '/login', icon: <LogIn size={20} /> },
      { label: 'Registrieren', path: '/register', icon: <UserPlus size={20} /> },
    ];
  }
};

export default function HomePageHeader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { user, loading, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ WICHTIG: Warte auf loading, bevor wir rendern
  if (!mounted || loading) {
    return (
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: 1201,
          background: 'rgba(26, 26, 46, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: 'space-between', px: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Skeleton variant="rectangular" width={120} height={36} sx={{ bgcolor: 'rgba(242, 159, 5, 0.1)' }} />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rectangular" width={100} height={36} sx={{ bgcolor: 'rgba(242, 159, 5, 0.1)' }} />
              <Skeleton variant="rectangular" width={100} height={36} sx={{ bgcolor: 'rgba(242, 159, 5, 0.1)' }} />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    );
  }

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: 1201,
        background: 'rgba(26, 26, 46, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', px: 0 }}>
          {/* Logo/Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ position: 'relative', width: { xs: 120, sm: 160 }, height: { xs: 36, sm: 48 } }}>
              <Image
                src="/images/connection-key-logo.png"
                alt="Connection Key"
                fill
                style={{ objectFit: 'contain' }}
                priority
                sizes="(max-width: 600px) 120px, 160px"
              />
            </Box>
          </Box>

          {/* Hauptnavigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {homePageMenuItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                href={item.path}
                startIcon={item.icon}
                sx={{
                  color: pathname === item.path ? '#F29F05' : 'rgba(255, 255, 255, 0.8)',
                  fontWeight: pathname === item.path ? 700 : 500,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  background: pathname === item.path ? 'rgba(242, 159, 5, 0.10)' : 'transparent',
                  border: pathname === item.path ? '1px solid rgba(242, 159, 5, 0.30)' : '1px solid transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.10)',
                    border: '1px solid rgba(242, 159, 5, 0.30)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 12px rgba(242, 159, 5, 0.20)'
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Auth-Buttons */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
            {getAuthMenuItems(isAuthenticated).map((item) => (
              <Button
                key={item.path}
                component={Link}
                href={item.path}
                startIcon={item.icon}
                variant={item.path === '/register' ? 'contained' : 'outlined'}
                sx={{
                  color: item.path === '/register' ? '#02000D' : 'rgba(255, 255, 255, 0.8)',
                  fontWeight: 600,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  background: item.path === '/register' 
                    ? 'linear-gradient(45deg, #F29F05, #8C1D04)' 
                    : 'transparent',
                  border: item.path === '/register' 
                    ? 'none' 
                    : '1px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: item.path === '/register' ? '#02000D' : '#F29F05',
                    background: item.path === '/register' 
                      ? 'linear-gradient(45deg, #8C1D04, #F29F05)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    border: item.path === '/register' 
                      ? 'none' 
                      : '1px solid rgba(242, 159, 5, 0.50)',
                    transform: 'translateY(-1px)',
                    boxShadow: item.path === '/register' 
                      ? '0 4px 12px rgba(255, 215, 0, 0.4)' 
                      : '0 4px 12px rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          {/* Mobile Menu Button (für kleinere Bildschirme) */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            <Button
              component={Link}
              href="/dating"
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #F29F05, #8C1D04)',
                color: '#02000D',
                fontWeight: 700,
                px: 2,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '0.9rem',
                '&:hover': {
                  background: 'linear-gradient(45deg, #8C1D04, #F29F05)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(242, 159, 5, 0.40)'
                }
              }}
            >
              Starten
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
