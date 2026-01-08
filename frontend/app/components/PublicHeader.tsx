'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Link from 'next/link';
import { LogIn, UserPlus, Menu, X } from 'lucide-react';
import Logo from './Logo';

export default function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setMounted(true);
    setIsMobile(matches);
  }, [matches]);

  const menuItems = [
    { href: '/', label: 'Startseite' },
    { href: '/connection-key', label: 'Connection Key' },
    { href: '/features', label: 'Verbindungen' },
    { href: '/blogartikel', label: 'Blog' },
  ];

  const handleMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMenuClose = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* ✅ NEUER OUTER WRAPPER – sorgt für konsistenten Abstand */}
      <Box
        sx={{
          pt: { xs: 2, md: 4 },   // 👈 Abstand nach oben
          px: { xs: 0, md: 0 },   // bewusst neutral
        }}
      >
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
              {menuItems.map((item) => (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
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
                      color: '#F29F05',
                      background: 'rgba(242, 159, 5, 0.1)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Login / Register – Desktop */}
          {mounted && !isMobile && (
            <Box sx={{
              display: 'flex',
              gap: { xs: 1, md: 1.5 },
              justifyContent: 'flex-end',
              order: { xs: 1, md: 2 }
            }}>
              <Button
                component={Link}
                href="/login"
                variant="text"
                size="small"
                startIcon={<LogIn size={16} />}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  px: { xs: 1.5, md: 2 },
                  py: { xs: 0.75, md: 1 },
                  fontSize: { xs: '0.85rem', md: '0.9rem' },
                  '&:hover': {
                    color: 'white',
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Anmelden
              </Button>

              <Button
                component={Link}
                href="/register"
                variant="outlined"
                size="small"
                startIcon={<UserPlus size={16} />}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  px: { xs: 1.5, md: 2 },
                  py: { xs: 0.75, md: 1 },
                  fontSize: { xs: '0.85rem', md: '0.9rem' },
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Registrieren
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Mobile Drawer bleibt unverändert */}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Logo mb={0} height={{ xs: 40, md: 50 }} width={{ xs: 120, md: 200 }} maxWidth={200} />
            <IconButton onClick={handleMenuClose}>
              <X size={24} />
            </IconButton>
          </Box>

          <List>
            {menuItems.map((item) => (
              <ListItem key={item.href} disablePadding>
                <ListItemButton component={Link} href={item.href} onClick={handleMenuClose}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
