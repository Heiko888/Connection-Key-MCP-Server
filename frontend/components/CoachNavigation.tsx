'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, Container } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import {
  Dashboard as DashboardIcon,
  Book as BookIcon,
  Add as AddIcon,
  Home as HomeIcon,
  SmartToy as SmartToyIcon,
} from '@mui/icons-material';

export default function CoachNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    {
      label: 'Coach Home',
      icon: <HomeIcon />,
      path: '/coach',
    },
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/coach/dashboard',
    },
    {
      label: 'Readings',
      icon: <BookIcon />,
      path: '/coach/readings-v2',
    },
    {
      label: 'Neues Reading',
      icon: <AddIcon />,
      path: '/coach/readings-v2/create',
    },
    {
      label: 'Agents',
      icon: <SmartToyIcon />,
      path: '/coach/agents',
    },
  ];

  return (
    <Box
      sx={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(232, 184, 109, 0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        mb: 2,
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            py: 1.5,
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(232, 184, 109, 0.3)',
              borderRadius: '3px',
            },
          }}
        >
          {!mounted ? (
            // Placeholder während des initialen Server-Renderings
            navItems.map((item) => (
              <Button
                key={item.path}
                startIcon={item.icon}
                disabled
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderBottom: '2px solid transparent',
                  borderRadius: 0,
                  px: 3,
                  py: 1.5,
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                }}
              >
                {item.label}
              </Button>
            ))
          ) : (
            navItems.map((item) => {
              // Für Agents und Readings-v2 auch Unterseiten als aktiv markieren
              const isActive = item.path === '/coach/agents' 
                ? pathname?.startsWith('/coach/agents')
                : item.path === '/coach/readings-v2'
                ? pathname?.startsWith('/coach/readings-v2')
                : pathname === item.path;
              return (
                <Button
                  key={item.path}
                  startIcon={item.icon}
                  onClick={() => router.push(item.path)}
                  sx={{
                    color: isActive ? '#e8b86d' : 'rgba(255, 255, 255, 0.7)',
                    borderBottom: isActive ? '2px solid #e8b86d' : '2px solid transparent',
                    borderRadius: 0,
                    px: 3,
                    py: 1.5,
                    fontWeight: isActive ? 700 : 500,
                    whiteSpace: 'nowrap',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: '#e8b86d',
                      background: 'rgba(232, 184, 109, 0.1)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })
          )}
        </Box>
      </Container>
    </Box>
  );
}

