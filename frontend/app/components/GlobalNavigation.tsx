'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, Drawer, IconButton, List, ListItem, ListItemButton, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

export interface MenuItem {
  href: string;
  label: string;
}

interface GlobalNavigationProps {
  menuItems: MenuItem[];
  showAuthButtons?: boolean;
  showLogo?: boolean;
}

export default function GlobalNavigation({ 
  menuItems, 
  showAuthButtons = false,
  showLogo = true 
}: GlobalNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setMounted(true);
    setIsMobile(matches);
  }, [matches]);

  const handleMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: { xs: 2, md: 3 },
        flexWrap: 'wrap',
        gap: { xs: 1, md: 1 }
      }}>
        {/* Mobile: Burger Menu - Rechts */}
        {mounted && isMobile && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'flex-end',
            flex: '1 1 auto',
            order: 2
          }}>
            <IconButton
              onClick={handleMenuToggle}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                '&:hover': {
                  color: '#F29F05',
                  background: 'rgba(242, 159, 5, 0.1)',
                },
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </IconButton>
          </Box>
        )}

        {/* Desktop: Menüpunkte - Links */}
        {mounted && !isMobile && (
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 0.5, md: 1 },
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            flex: { xs: '1 1 100%', md: '0 0 auto' },
            order: { xs: 2, md: 1 }
          }}>
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  variant="text"
                  size="small"
                  sx={{
                    color: isActive ? '#F29F05' : 'rgba(255, 255, 255, 0.7)',
                    fontWeight: isActive ? 600 : 500,
                    px: { xs: 1.5, md: 2 },
                    py: { xs: 0.75, md: 1 },
                    fontSize: { xs: '0.85rem', md: '0.9rem' },
                    minWidth: 'auto',
                    whiteSpace: 'nowrap',
                    backgroundColor: isActive ? 'rgba(242, 159, 5, 0.1)' : 'transparent',
                    '&:hover': {
                      color: '#F29F05',
                      background: isActive ? 'rgba(242, 159, 5, 0.2)' : 'rgba(242, 159, 5, 0.1)',
                    },
                    '&:focus': {
                      outline: '2px solid #F29F05',
                      outlineOffset: '2px',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>
        )}

        {/* Auth Buttons - Rechts (nur wenn showAuthButtons true) */}
        {mounted && !isMobile && showAuthButtons && (
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, md: 1.5 },
            flexWrap: 'wrap',
            justifyContent: { xs: 'flex-end', md: 'flex-end' },
            flex: { xs: '0 0 auto', md: '0 0 auto' },
            order: { xs: 1, md: 2 }
          }}>
            <Button
              component={Link}
              href="/login"
              variant="text"
              size="small"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 500,
                px: { xs: 1.5, md: 2 },
                py: { xs: 0.75, md: 1 },
                fontSize: { xs: '0.85rem', md: '0.9rem' },
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                '&:hover': {
                  color: 'white',
                  background: 'rgba(255, 255, 255, 0.1)',
                },
                '&:focus': {
                  outline: '2px solid #F29F05',
                  outlineOffset: '2px',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Anmelden
            </Button>
            <Button
              component={Link}
              href="/register"
              variant="outlined"
              size="small"
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontWeight: 500,
                px: { xs: 1.5, md: 2 },
                py: { xs: 0.75, md: 1 },
                fontSize: { xs: '0.85rem', md: '0.9rem' },
                minWidth: 'auto',
                whiteSpace: 'nowrap',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.6)',
                  background: 'rgba(255, 255, 255, 0.1)',
                },
                '&:focus': {
                  outline: '2px solid #F29F05',
                  outlineOffset: '2px',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Registrieren
            </Button>
          </Box>
        )}
      </Box>

      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMenuClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            background: 'linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 100%)',
            borderLeft: '1px solid rgba(242, 159, 5, 0.2)',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          {showLogo && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Logo mb={0} height={{ xs: 40, md: 50 }} width={{ xs: 120, md: 200 }} maxWidth={200} />
              <IconButton
                onClick={handleMenuClose}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    color: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)',
                  },
                }}
              >
                <X size={24} />
              </IconButton>
            </Box>
          )}
          
          <List>
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <ListItem key={item.href} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    onClick={handleMenuClose}
                    sx={{
                      borderRadius: 2,
                      color: isActive ? '#F29F05' : 'rgba(255, 255, 255, 0.7)',
                      backgroundColor: isActive ? 'rgba(242, 159, 5, 0.1)' : 'transparent',
                      fontWeight: isActive ? 600 : 500,
                      '&:hover': {
                        color: '#F29F05',
                        background: isActive ? 'rgba(242, 159, 5, 0.2)' : 'rgba(242, 159, 5, 0.1)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <ListItemText 
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 500,
                        fontSize: '1rem',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>

          {showAuthButtons && (
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                component={Link}
                href="/login"
                variant="text"
                fullWidth
                onClick={handleMenuClose}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 500,
                  py: 1.5,
                  borderRadius: 2,
                  '&:hover': {
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Anmelden
              </Button>
              <Button
                component={Link}
                href="/register"
                variant="outlined"
                fullWidth
                onClick={handleMenuClose}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  fontWeight: 500,
                  py: 1.5,
                  borderRadius: 2,
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Registrieren
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
}

