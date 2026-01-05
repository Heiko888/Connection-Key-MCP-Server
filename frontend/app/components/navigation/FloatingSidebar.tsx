'use client';

import React from 'react';
import { Box, IconButton, Typography, useMediaQuery, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Users, Key, Eye, BookOpen, Calendar, Trophy, Settings, HelpCircle, LogOut, UserPlus, Crown, Lightbulb, Info, Target, Sparkles, Grid, Zap, LayoutDashboard, User, Package } from 'lucide-react';
import SidebarGroup from './SidebarGroup';
import SidebarItem from './SidebarItem';
import SidebarProfile from './SidebarProfile';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

interface FloatingSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function FloatingSidebar({ open, onClose }: FloatingSidebarProps) {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Hintergrund Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(8px)',
              zIndex: 40,
            }}
          />

          {/* Floating Sidebar Panel */}
          <Box
            component={motion.div}
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            sx={{
              position: 'fixed',
              top: isMobile ? 0 : 12,
              bottom: isMobile ? 0 : 24,
              right: isMobile ? 0 : 24,
              left: isMobile ? 0 : 'auto',
              zIndex: 50,
              width: isMobile ? '100%' : '380px',
              maxWidth: isMobile ? '100%' : '380px',
              borderRadius: isMobile ? '28px 28px 0 0' : '30px',
              backgroundColor: '#0C0909',
              border: isMobile ? 'none' : '1px solid rgba(255, 180, 70, 0.18)',
              borderTop: isMobile ? '1px solid rgba(255, 180, 70, 0.18)' : 'none',
              boxShadow: 'inset 0 0 55px rgba(255, 165, 70, 0.045)',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              paddingTop: isMobile ? 'env(safe-area-inset-top, 0px)' : 0,
              paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 0px)' : 0,
              overflow: 'hidden',
            }}
          >
            {/* Mobile Header mit Back-Button */}
            {isMobile && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                px: 3,
                py: 2,
                borderBottom: '1px solid rgba(255, 180, 70, 0.18)',
              }}>
                <Typography variant="h6" sx={{ color: '#FFB347', fontWeight: 600, fontSize: '1.1rem' }}>
                  Menü
                </Typography>
                <IconButton
                  onClick={onClose}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 165, 70, 0.1)',
                      color: '#FFB347',
                    },
                  }}
                >
                  <X size={24} />
                </IconButton>
              </Box>
            )}

            {/* Desktop Close Button */}
            {!isMobile && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, pb: 0 }}>
                <IconButton
                  onClick={onClose}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 165, 70, 0.1)',
                      color: '#FFB347',
                    },
                  }}
                >
                  <X size={20} />
                </IconButton>
              </Box>
            )}

            {/* Profile */}
            <Box sx={{ px: isMobile ? 3 : 3, pt: isMobile ? 2 : 2 }}>
              <SidebarProfile />
            </Box>

            {/* Menu Items */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                px: isMobile ? 3 : 3,
                pb: isMobile ? 2 : 0,
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(255, 180, 70, 0.3)',
                  borderRadius: '10px',
                  '&:hover': {
                    background: 'rgba(255, 180, 70, 0.5)',
                  },
                },
                // Safe Area für iPhone Notch
                paddingBottom: isMobile ? 'max(16px, env(safe-area-inset-bottom))' : 0,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 3 : 4 }}>
                {/* Dashboard Link - Oben */}
                <SidebarItem 
                  label="Dashboard" 
                  href="/dashboard" 
                  icon={<LayoutDashboard size={isMobile ? 18 : 16} />}
                  onClick={() => isMobile && onClose()}
                />
                
                <SidebarGroup title="Dating">
                  <SidebarItem label="Dein Resonanzraum" href="/dating" icon={<Heart size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                  <SidebarItem label="Resonanz finden" href="/swipe" icon={<Heart size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                  <SidebarItem label="Dating Ideen" href="/dating/match-tips" icon={<Lightbulb size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                </SidebarGroup>

                <SidebarGroup title="Community">
                  <SidebarItem label="Übersicht" href="/community" icon={<Users size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                  <SidebarItem label="Freunde" href="/community/friends" icon={<UserPlus size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                  <SidebarItem label="VIP Community" href="/vip-community" icon={<Crown size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                </SidebarGroup>

                <SidebarGroup title="Connection Key">
                  <SidebarItem label="Im Chart" href="/human-design-chart/connection-key" icon={<Key size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                  <SidebarItem label="Bereiche" href="/resonanzanalyse/bereiche" icon={<Grid size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                </SidebarGroup>

                <SidebarGroup title="Human Design">
                  <SidebarItem label="Entdecke dein Design" href="/human-design-chart" icon={<Target size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                  <SidebarItem label="Bodygraph" href="/bodygraph" icon={<Eye size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                  <SidebarItem label="Planeten" href="/planets" icon={<Sparkles size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                  <SidebarItem label="Zentren" href="/centers" icon={<Grid size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                  <SidebarItem label="Tore" href="/gates" icon={<Key size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                  <SidebarItem label="Kanäle" href="/channels" icon={<Zap size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                  <SidebarItem label="Linien" href="/lines" icon={<Grid size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                  <SidebarItem label="Autorität" href="/authority" icon={<Target size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                </SidebarGroup>

                <SidebarGroup title="Profil & Einstellungen">
                  <SidebarItem label="Profil" href="/profil" icon={<User size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                  <SidebarItem label="Pakete" href="/pricing" icon={<Package size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                  <SidebarItem label="Einstellungen" href="/settings" icon={<Settings size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                </SidebarGroup>

                <SidebarGroup title="Weitere Funktionen">
                  <SidebarItem label="Dein Bewusstseinsfeld" href="/journal" icon={<BookOpen size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                  <SidebarItem label="Mondkalender" href="/mondkalender" icon={<Calendar size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                  <SidebarItem label="Gamification" href="/gamification" icon={<Trophy size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                  <SidebarItem label="Support" href="/support" icon={<HelpCircle size={isMobile ? 18 : 16} />} onClick={() => isMobile && onClose()} />
                </SidebarGroup>

                {/* Logout */}
                <Box
                  onClick={handleLogout}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: isMobile ? 2.5 : 2,
                    py: isMobile ? 2 : 1.5,
                    borderRadius: 2,
                    fontSize: isMobile ? '0.95rem' : '0.875rem',
                    color: 'rgba(239, 68, 68, 0.8)',
                    transition: 'all 0.2s ease',
                    borderLeft: '2px solid transparent',
                    cursor: 'pointer',
                    minHeight: isMobile ? 48 : 'auto',
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: '#ef4444',
                      pl: isMobile ? 3.5 : 3,
                      borderLeftColor: '#ef4444',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1.5 : 1 }}>
                    <LogOut size={isMobile ? 18 : 16} />
                    <span>Abmelden</span>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </>
      )}
    </AnimatePresence>
  );
}

