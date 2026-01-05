'use client';

import React from 'react';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';

interface SidebarGroupProps {
  title: string;
  children: React.ReactNode;
}

export default function SidebarGroup({ title, children }: SidebarGroupProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ px: { xs: 0.5, md: 0 } }}>
      <Typography
        variant="overline"
        sx={{
          color: '#FFB347',
          fontSize: isMobile ? '0.75rem' : '0.7rem',
          letterSpacing: '0.1em',
          mb: isMobile ? 2 : 1.5,
          display: 'block',
          fontWeight: 600,
          px: { xs: 0.5, md: 0 },
        }}
      >
        {title.toUpperCase()}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 0.5 : 0.5 }}>
        {children}
      </Box>
    </Box>
  );
}

