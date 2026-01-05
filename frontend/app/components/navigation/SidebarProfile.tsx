'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, useMediaQuery, useTheme } from '@mui/material';
import { useAuth } from '@/lib/hooks/useAuth';

export default function SidebarProfile() {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Lade Profilbild aus localStorage
  useEffect(() => {
    // Versuche zuerst aus profileImage
    const savedImage = typeof window !== 'undefined' ? localStorage.getItem('profileImage') : null;
    if (savedImage) {
      setProfileImage(savedImage);
      return;
    }

    // Versuche aus userData
    const userData = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        if (parsedData.profileImage) {
          setProfileImage(parsedData.profileImage);
        }
      } catch (e) {
        console.error('Fehler beim Laden der Profildaten:', e);
      }
    }
  }, []);

  // Fallback für Avatar
  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 2.5 : 2,
        pb: isMobile ? 3.5 : 3,
        borderBottom: '1px solid rgba(255, 180, 70, 0.18)',
      }}
    >
      <Avatar
        src={profileImage || undefined}
        sx={{
          width: isMobile ? 64 : 56,
          height: isMobile ? 64 : 56,
          bgcolor: '#FFB347',
          color: '#0C0909',
          fontWeight: 700,
        }}
      >
        {!profileImage && getInitials(user?.email || 'User')}
      </Avatar>
      <Box>
        <Typography
          variant="h6"
          sx={{
            color: '#ffffff',
            fontSize: isMobile ? '1.1rem' : '1rem',
            fontWeight: 600,
            mb: 0.5,
          }}
        >
          {user?.email?.split('@')[0] || 'Benutzer'}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: isMobile ? '0.85rem' : '0.75rem',
          }}
        >
          {user?.package ? user.package.charAt(0).toUpperCase() + user.package.slice(1) : 'Basic'} Paket
        </Typography>
      </Box>
    </Box>
  );
}

