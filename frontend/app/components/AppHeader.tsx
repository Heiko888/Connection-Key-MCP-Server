'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Skeleton
} from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Menu, X } from 'lucide-react';

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, loading, isAuthenticated, signOut } = useAuth();
  const [logoSrc, setLogoSrc] = useState('/images/connection-key-optimized.png');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Prüfe ob wir im Coach-Bereich sind
  const isCoachPage = pathname?.startsWith('/coach') ?? false;
  const homeHref = isCoachPage ? '/coach' : '/';

  // ✅ WICHTIG: Warte auf loading, bevor wir rendern
  if (loading) {
    return (
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        bgcolor: '#000000',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(242, 159, 5, 0.15)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <Container maxWidth="lg" disableGutters sx={{ px: { xs: 1.5, sm: 2 } }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: { xs: 0.5, md: 1 }
          }}>
            <Skeleton variant="rectangular" width={140} height={40} sx={{ bgcolor: 'rgba(242, 159, 5, 0.1)' }} />
            <Skeleton variant="rectangular" width={120} height={36} sx={{ bgcolor: 'rgba(242, 159, 5, 0.1)' }} />
          </Box>
        </Container>
      </Box>
    );
  }

  const handleLogout = async () => {
    await signOut();
    setMobileMenuOpen(false);
    router.push('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const menuItems = [
    { label: isCoachPage ? 'Coach Home' : 'Home', href: homeHref, show: true },
    { label: 'Registrieren', href: '/register', show: !isAuthenticated },
    { label: 'Abmelden', href: '#', show: isAuthenticated, action: handleLogout }
  ];

  return (
    <>
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        bgcolor: '#000000',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(242, 159, 5, 0.15)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
      }}>
        <Container maxWidth="lg" disableGutters sx={{ px: { xs: 1.5, sm: 2 } }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: { xs: 0.5, md: 1 }
          }}>
            <Link href={homeHref} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <Box sx={{
                position: 'relative',
                height: { xs: 40, md: 70 },
                width: { xs: 140, md: 280 },
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                '&:hover': { transform: 'scale(1.05)' }
              }}>
                <Image
                  src={logoSrc}
                  alt="App Logo"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                  sizes="(max-width: 600px) 140px, 280px"
                  onError={() => {
                    // Fallback-Kette: optimiertes PNG -> Original PNG -> Legacy
                    if (logoSrc.includes('optimized')) {
                      setLogoSrc('/images/connection-key-logo.png');
                    } else {
                      setLogoSrc('/images/Design%20ohne%20Titel(15).png');
                    }
                  }}
                />
              </Box>
            </Link>

            {/* Desktop Menu */}
            <Box sx={{
              display: { xs: 'none', md: 'flex' },
              gap: 2,
              alignItems: 'center'
            }}>
              <Button
                component={Link}
                href={homeHref}
                variant="outlined"
                size="small"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  minWidth: 120,
                  px: 2.5,
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  '&:hover': {
                    borderColor: '#F29F05',
                    backgroundColor: 'rgba(242, 159, 5, 0.1)'
                  }
                }}
              >
                {isCoachPage ? 'Coach Home' : 'Home'}
              </Button>
              {isAuthenticated ? (
                <Button
                  onClick={handleLogout}
                  variant="outlined"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    minWidth: 120,
                    px: 2.5,
                    borderColor: 'rgba(242, 159, 5, 0.5)',
                    color: '#F29F05',
                    '&:hover': {
                      borderColor: '#F29F05',
                      backgroundColor: 'rgba(242, 159, 5, 0.1)'
                    }
                  }}
                >
                  Abmelden
                </Button>
              ) : (
                <Button
                  component={Link}
                  href="/register"
                  variant="outlined"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    minWidth: 120,
                    px: 2.5,
                    borderColor: 'rgba(242, 159, 5, 0.5)',
                    color: '#F29F05',
                    '&:hover': {
                      borderColor: '#F29F05',
                      backgroundColor: 'rgba(242, 159, 5, 0.1)'
                    }
                  }}
                >
                  Registrieren
                </Button>
              )}
            </Box>

            {/* Mobile Burger Menu Button */}
            <IconButton
              onClick={toggleMobileMenu}
              sx={{
                display: { xs: 'flex', md: 'none' },
                color: '#F29F05',
                '&:hover': {
                  backgroundColor: 'rgba(242, 159, 5, 0.1)'
                }
              }}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </IconButton>
          </Box>
        </Container>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={closeMobileMenu}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            background: 'linear-gradient(180deg, #0b0a0f 0%, #1a1625 100%)',
            borderLeft: '1px solid rgba(242, 159, 5, 0.2)',
            boxShadow: '-4px 0 30px rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <Box sx={{ pt: 8, px: 2 }}>
          <List>
            {menuItems.filter(item => item.show).map((item, index) => (
              <React.Fragment key={item.label}>
                <ListItem disablePadding>
                  {item.action ? (
                    <ListItemButton
                      onClick={() => {
                        item.action?.();
                        closeMobileMenu();
                      }}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(242, 159, 5, 0.1)'
                        }
                      }}
                    >
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          color: '#FFFFFF',
                          fontWeight: 600,
                          fontSize: '1rem'
                        }}
                      />
                    </ListItemButton>
                  ) : (
                    <ListItemButton
                      component={Link}
                      href={item.href}
                      onClick={closeMobileMenu}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(242, 159, 5, 0.1)'
                        }
                      }}
                    >
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          color: '#FFFFFF',
                          fontWeight: 600,
                          fontSize: '1rem'
                        }}
                      />
                    </ListItemButton>
                  )}
                </ListItem>
                {index < menuItems.filter(item => item.show).length - 1 && (
                  <Divider sx={{ borderColor: 'rgba(242, 159, 5, 0.1)', my: 1 }} />
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}


