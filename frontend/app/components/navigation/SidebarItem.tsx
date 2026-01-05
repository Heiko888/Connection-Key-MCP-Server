'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ChevronRight } from 'lucide-react';

interface SidebarItemProps {
  label: string;
  href: string;
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function SidebarItem({ label, href, icon, className = '', onClick }: SidebarItemProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Link
      href={href}
      style={{ textDecoration: 'none' }}
      onClick={onClick}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: isMobile ? 2.5 : 2,
          py: isMobile ? 2 : 1.5,
          borderRadius: 2,
          fontSize: isMobile ? '0.95rem' : '0.875rem',
          color: 'rgba(255, 255, 255, 0.8)',
          transition: 'all 0.2s ease',
          borderLeft: '2px solid transparent',
          cursor: 'pointer',
          minHeight: isMobile ? 48 : 'auto', // Bessere Touch-Targets auf Mobile
          '&:hover': {
            backgroundColor: 'rgba(255, 165, 70, 0.07)',
            color: '#FFB347',
            pl: isMobile ? 3.5 : 3,
            borderLeftColor: '#FFB347',
          },
        }}
        className={className}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1.5 : 1 }}>
          {icon && <Box sx={{ display: 'flex', alignItems: 'center' }}>{icon}</Box>}
          <Typography variant="body2" sx={{ fontSize: isMobile ? '0.95rem' : '0.875rem', fontWeight: 400 }}>
            {label}
          </Typography>
        </Box>
        <ChevronRight size={isMobile ? 18 : 16} style={{ opacity: 0.5 }} />
      </Box>
    </Link>
  );
}

