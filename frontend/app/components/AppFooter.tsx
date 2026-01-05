'use client';

import React from 'react';
import { Box, Typography, Grid, Button, Divider, Stack } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';

export default function AppFooter() {
  return (
    <Box
      component="footer"
      sx={{
        mt: { xs: 6, md: 10 },
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(15, 15, 35, 0.6) 100%)',
        borderTop: '2px solid rgba(242, 159, 5, 0.3)',
        overflow: 'hidden',
        zIndex: 1,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.8), rgba(242, 159, 5, 0.6), rgba(242, 159, 5, 0.8), transparent)',
          boxShadow: '0 0 20px rgba(242, 159, 5, 0.4)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse 80% 40% at 20% 0%, rgba(242, 159, 5, 0.08) 0%, transparent 70%),
            radial-gradient(ellipse 60% 30% at 80% 100%, rgba(140, 29, 4, 0.06) 0%, transparent 70%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 3, md: 6 }, py: { xs: 5, md: 7 }, position: 'relative', zIndex: 1 }}>
        {/* Hauptbereich */}
        <Grid container spacing={{ xs: 4, md: 6 }}>
          {/* Brand & Mission - Mobile: vierte, Desktop: erste Spalte (links) */}
          <Grid item xs={12} md={4} sx={{ order: { xs: 4, md: 1 } }}>
            <Box sx={{ mb: { xs: 3, md: 0 }, textAlign: { xs: 'center', md: 'left' } }}>
              {/* Logo */}
              <Box sx={{ 
                position: 'relative', 
                width: { xs: 140, md: 160 }, 
                height: { xs: 50, md: 60 }, 
                mb: 3,
                mx: { xs: 'auto', md: 0 },
                opacity: 0.9,
                transition: 'all 0.3s ease',
                '&:hover': {
                  opacity: 1,
                  transform: 'translateY(-2px)',
                }
              }}>
                <Link href="/" style={{ display: 'block', width: '100%', height: '100%' }}>
                  <Image
                    src="/images/connection-key-optimized.png"
                    alt="The Connection Key"
                    fill
                    style={{ objectFit: 'contain' }}
                    priority
                    sizes="(max-width: 768px) 140px, 160px"
                  />
                </Link>
              </Box>

              {/* Mission Statement */}
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.85)', 
                  mb: 3,
                  lineHeight: 1.7,
                  fontSize: { xs: '0.95rem', md: '1rem' },
                  maxWidth: { xs: '100%', md: 320 },
                  mx: { xs: 'auto', md: 0 },
                  textAlign: { xs: 'center', md: 'left' },
                }}
              >
                Entdecke die energetische Resonanz zwischen Menschen – aus Human Design, Frequenzen und Bewusstsein kombiniert. 
                <Box component="span" sx={{ color: '#F29F05', fontWeight: 600 }}> Klar. Präzise. Alltagsnah.</Box>
              </Typography>

              {/* Social Media */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Box
                  component="a"
                  href="https://www.youtube.com/@TheConnectionKey"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(242, 159, 5, 0.2)',
                    '&:hover': {
                      background: 'rgba(255, 0, 0, 0.15)',
                      color: '#FF0000',
                      borderColor: '#FF0000',
                      transform: 'translateY(-3px) scale(1.05)',
                      boxShadow: '0 6px 24px rgba(255, 0, 0, 0.4)'
                    },
                  }}
                >
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </Box>
                <Box
                  component="a"
                  href="https://www.instagram.com/theconnectionkey/"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(242, 159, 5, 0.2)',
                    '&:hover': {
                      background: 'rgba(228, 64, 95, 0.15)',
                      color: '#E4405F',
                      borderColor: '#E4405F',
                      transform: 'translateY(-3px) scale(1.05)',
                      boxShadow: '0 6px 24px rgba(228, 64, 95, 0.4)'
                    },
                  }}
                >
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </Box>
                <Box
                  component="a"
                  href="https://t.me/The_Connection_Key"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(242, 159, 5, 0.2)',
                    '&:hover': {
                      background: 'rgba(37, 150, 190, 0.15)',
                      color: '#2596BE',
                      borderColor: '#2596BE',
                      transform: 'translateY(-3px) scale(1.05)',
                      boxShadow: '0 6px 24px rgba(37, 150, 190, 0.4)'
                    },
                  }}
                >
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z"/>
                  </svg>
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Navigation Links - Mobile: zweite, Desktop: zweite Spalte */}
          <Grid item xs={12} sm={6} md={2} sx={{ order: { xs: 2, md: 2 } }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#F29F05', 
                fontWeight: 700,
                fontSize: { xs: '0.95rem', md: '1rem' },
                mb: 2.5,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Navigation
            </Typography>
            <Stack spacing={1.5}>
              <Box
                component={Link}
                href="/"
                sx={{
                  textDecoration: 'none',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  display: 'block',
                  '&:hover': {
                    color: '#F29F05',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                Startseite
              </Box>
              <Box
                component={Link}
                href="/blogartikel"
                sx={{
                  textDecoration: 'none',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  display: 'block',
                  '&:hover': {
                    color: '#F29F05',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                Blog
              </Box>
              <Box
                component={Link}
                href="/community-info"
                sx={{
                  textDecoration: 'none',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  display: 'block',
                  '&:hover': {
                    color: '#F29F05',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                Community Infos
              </Box>
              <Box
                component={Link}
                href="/support"
                sx={{
                  textDecoration: 'none',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  display: 'block',
                  '&:hover': {
                    color: '#F29F05',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                Support
              </Box>
            </Stack>
          </Grid>

          {/* Rechtliches - Mobile: dritte, Desktop: dritte Spalte */}
          <Grid item xs={12} sm={6} md={2} sx={{ order: { xs: 3, md: 3 } }}>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#F29F05', 
                fontWeight: 700,
                fontSize: { xs: '0.95rem', md: '1rem' },
                mb: 2.5,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Rechtliches
            </Typography>
            <Stack spacing={1.5}>
              <Box
                component={Link}
                href="/ueber-uns"
                sx={{
                  textDecoration: 'none',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  display: 'block',
                  '&:hover': {
                    color: '#F29F05',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                Über uns
              </Box>
              <Box
                component={Link}
                href="/impressum"
                sx={{
                  textDecoration: 'none',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  display: 'block',
                  '&:hover': {
                    color: '#F29F05',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                Impressum
              </Box>
              <Box
                component={Link}
                href="/datenschutz"
                sx={{
                  textDecoration: 'none',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                  display: 'block',
                  '&:hover': {
                    color: '#F29F05',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                Datenschutz
              </Box>
            </Stack>
          </Grid>

          {/* CTA Bereich - Mobile: erste, Desktop: vierte Spalte (rechts) */}
          <Grid item xs={12} md={4} sx={{ order: { xs: 1, md: 4 } }}>
            <Box sx={{
              background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.1), rgba(140, 29, 4, 0.1))',
              border: '1px solid rgba(242, 159, 5, 0.3)',
              borderRadius: 3,
              p: { xs: 3, md: 4 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Sparkles size={20} color="#F29F05" />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#F29F05', 
                      fontWeight: 700,
                      fontSize: { xs: '1rem', md: '1.1rem' },
                    }}
                  >
                    Starte jetzt
                  </Typography>
                </Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.85)', 
                    mb: 3,
                    lineHeight: 1.6,
                    fontSize: { xs: '0.9rem', md: '0.95rem' },
                  }}
                >
                  Erstelle deinen kostenlosen Connection Key und entdecke die energetische Resonanz zwischen euch.
                </Typography>
              </Box>
              <Button
                component={Link}
                href="/resonanzanalyse/sofort"
                variant="contained"
                size="large"
                endIcon={<ArrowRight size={20} />}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white',
                  fontWeight: 700,
                  px: 3,
                  py: 1.5,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 4px 20px rgba(242, 159, 5, 0.3)',
                  width: '100%',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    boxShadow: '0 6px 30px rgba(242, 159, 5, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Resonanzanalyse starten
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider sx={{ my: { xs: 4, md: 5 }, borderColor: 'rgba(242, 159, 5, 0.2)' }} />

        {/* Copyright */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.6)', 
              fontSize: { xs: '0.85rem', md: '0.9rem' },
            }}
          >
            © {new Date().getFullYear()} The Connection Key. Alle Rechte vorbehalten.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontSize: { xs: '0.85rem', md: '0.9rem' },
              }}
            >
              Made with
            </Typography>
            <Heart size={14} color="#F29F05" fill="#F29F05" />
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontSize: { xs: '0.85rem', md: '0.9rem' },
              }}
            >
              in Deutschland
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

