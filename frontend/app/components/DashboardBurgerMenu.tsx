'use client';

import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface DashboardBurgerMenuProps {
  onLogout?: () => void;
}

export default function DashboardBurgerMenu({ onLogout }: DashboardBurgerMenuProps) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      setMobileMenuOpen(false);
      await supabase.auth.signOut();
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userData');
      // ✅ DEAKTIVIERT: profileSetupCompleted wird nicht mehr verwendet
      localStorage.removeItem('user-subscription');
      localStorage.removeItem('userChart');
      localStorage.removeItem('readings');
      localStorage.removeItem('userBookings');
      localStorage.removeItem('authToken');
      localStorage.removeItem('profileData');
      localStorage.removeItem('chartData');
      localStorage.removeItem('moonTrackingEntries');
      localStorage.removeItem('journalEntries');
      localStorage.removeItem('resonanzanalyse-onboarding-completed');
      localStorage.removeItem('human-design-chart-onboarding-completed');
      
      if (onLogout) {
        onLogout();
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    }
  };

  if (!isMobile) {
    return null; // Nur auf Mobile anzeigen
  }

  return (
    <>
      {/* Mobile Burger Menu Button */}
      <IconButton
        onClick={toggleMobileMenu}
        sx={{
          color: 'rgba(255, 255, 255, 0.7)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'rgba(255, 255, 255, 0.9)'
          },
          transition: 'all 0.3s ease'
        }}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </IconButton>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={closeMobileMenu}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            background: 'linear-gradient(180deg, #0b0a0f 0%, #1a1625 100%)',
            borderLeft: '1px solid rgba(242, 159, 5, 0.2)',
            boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
              Menü
            </Typography>
            <IconButton
              onClick={closeMobileMenu}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }
              }}
            >
              <X size={20} />
            </IconButton>
          </Box>
          <Divider sx={{ borderColor: 'rgba(242, 159, 5, 0.2)', mb: 2 }} />
          <List>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/profil"
                onClick={closeMobileMenu}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  <User size={20} />
                </ListItemIcon>
                <ListItemText primary="Profil" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href="/settings"
                onClick={closeMobileMenu}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  <Settings size={20} />
                </ListItemIcon>
                <ListItemText primary="Einstellungen" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  closeMobileMenu();
                  router.push('/support');
                }}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: 2,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  <HelpCircle size={20} />
                </ListItemIcon>
                <ListItemText primary="Support" />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ borderColor: 'rgba(242, 159, 5, 0.2)', my: 2 }} />
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  closeMobileMenu();
                  handleLogout();
                }}
                sx={{
                  color: 'rgba(255, 100, 100, 0.8)',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 100, 100, 0.1)',
                    color: 'rgba(255, 100, 100, 1)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                  <LogOut size={20} />
                </ListItemIcon>
                <ListItemText primary="Abmelden" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}

