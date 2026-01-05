"use client";
import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import MobileNavigation from './MobileNavigation';

interface MobileLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export default function MobileLayout({ children, currentPath = '/' }: MobileLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
      position: 'relative'
    }}>
      {/* Mobile Navigation */}
      <MobileNavigation currentPath={currentPath} />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 7, md: 0 }, // Top padding for mobile app bar
          minHeight: '100vh',
          position: 'relative',
          zIndex: 1
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
