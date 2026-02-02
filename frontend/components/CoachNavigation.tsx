'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  useTheme,
  useMediaQuery,
  Typography,
  Divider
} from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import {
  Dashboard as DashboardIcon,
  Book as BookIcon,
  Add as AddIcon,
  Home as HomeIcon,
  SmartToy as SmartToyIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

export default function CoachNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      path: '/coach/readings',
    },
    {
      label: 'Agents',
      icon: <SmartToyIcon />,
      path: '/coach/agents',
    },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (path: string) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Mobile Drawer Content
  const drawerContent = (
    <Box
      sx={{
        width: 280,
        height: '100%',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 100%)
        `,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(242, 159, 5, 0.3)',
        }}
      >
        <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700 }}>
          🎯 Coach Menu
        </Typography>
        <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Navigation Items */}
      <List sx={{ flex: 1, py: 2 }}>
        {navItems.map((item) => {
          const isActive =
            item.path === '/coach/agents'
              ? pathname?.startsWith('/coach/agents')
              : item.path === '/coach/readings'
              ? pathname?.startsWith('/coach/readings')
              : pathname === item.path;

          return (
            <ListItem
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              sx={{
                cursor: 'pointer',
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                backgroundColor: isActive ? 'rgba(242, 159, 5, 0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(242, 159, 5, 0.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? '#F29F05' : 'rgba(255, 255, 255, 0.7)',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: isActive ? '#F29F05' : 'white',
                    fontWeight: isActive ? 700 : 500,
                  },
                }}
              />
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(242, 159, 5, 0.3)',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            display: 'block',
            textAlign: 'center',
          }}
        >
          Coach Dashboard
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          background: 'rgba(11, 10, 15, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(242, 159, 5, 0.2)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
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
              alignItems: 'center',
              gap: 2,
              py: 2,
              px: { xs: 0, md: 2 },
            }}
          >

            {/* Mobile: Title */}
            {isMobile && (
              <Typography
                variant="h6"
                sx={{
                  color: '#F29F05',
                  fontWeight: 700,
                  flex: 1,
                }}
              >
                Coach
              </Typography>
            )}

            {/* Desktop: Horizontal Navigation */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                justifyContent: 'center',
                alignItems: 'center',
                gap: 3,
                flex: 1,
                overflowX: 'auto',
                px: 2,
                '&::-webkit-scrollbar': {
                  height: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'transparent',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(242, 159, 5, 0.3)',
                  borderRadius: '2px',
                  '&:hover': {
                    background: 'rgba(242, 159, 5, 0.5)',
                  },
                },
              }}
            >
              {!mounted
                ? navItems.map((item) => (
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
                : navItems.map((item) => {
                    const isActive =
                      item.path === '/coach/agents'
                        ? pathname?.startsWith('/coach/agents')
                        : item.path === '/coach/readings'
                        ? pathname?.startsWith('/coach/readings')
                        : pathname === item.path;
                    return (
                      <Button
                        key={item.path}
                        startIcon={item.icon}
                        onClick={() => router.push(item.path)}
                        sx={{
                          position: 'relative',
                          color: isActive ? '#F29F05' : 'rgba(255, 255, 255, 0.85)',
                          background: isActive 
                            ? 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(242, 159, 5, 0.05) 100%)'
                            : 'transparent',
                          backdropFilter: isActive ? 'blur(10px)' : 'none',
                          border: isActive ? '1px solid rgba(242, 159, 5, 0.3)' : '1px solid transparent',
                          borderRadius: '8px',
                          px: 3,
                          py: 1.5,
                          fontWeight: isActive ? 700 : 500,
                          fontSize: '0.95rem',
                          letterSpacing: '0.5px',
                          whiteSpace: 'nowrap',
                          textTransform: 'none',
                          boxShadow: isActive ? '0 4px 12px rgba(242, 159, 5, 0.15)' : 'none',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&::before': isActive ? {
                            content: '""',
                            position: 'absolute',
                            bottom: -2,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '40%',
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent, #F29F05, transparent)',
                            borderRadius: '2px',
                          } : {},
                          '&:hover': {
                            color: '#F29F05',
                            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.2) 0%, rgba(242, 159, 5, 0.08) 100%)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(242, 159, 5, 0.4)',
                            boxShadow: '0 6px 20px rgba(242, 159, 5, 0.25)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        {item.label}
                      </Button>
                    );
                  })}
            </Box>

            {/* Mobile: Hamburger Menu (rechts) */}
            {isMobile && (
              <IconButton
                onClick={handleDrawerToggle}
                sx={{
                  color: '#F29F05',
                  '&:hover': {
                    background: 'rgba(242, 159, 5, 0.1)',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Container>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 280,
            border: 'none',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

