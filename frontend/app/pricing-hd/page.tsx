"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Paper, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import PageLayout from '../components/PageLayout';

export default function PricingHDPage() {
  const { user, loading: authLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Human Design Analysen
  const humanDesignReadings = [
    {
      id: 'basic',
      name: 'Basis Analyse Human Design',
      price: 99,
      description: 'Einstieg, leicht verständlich',
      features: [
        'Persönliches Human Design Chart',
        'Typ, Strategie, Autorität, Profil',
        'Grundlegende Zentren-Analyse',
        'Schriftliches Reading (PDF)'
      ],
      popular: false,
      href: '/custom-readings?type=basic'
    },
    {
      id: 'extended',
      name: 'Erweiterte Analyse Human Design',
      price: 149,
      description: 'Deep Dive, inkl. Zentren, Profil, Strategien',
      features: [
        'Alles aus Basis Analyse',
        'Detaillierte Zentren-Analyse',
        'Kanäle & Tore Interpretation',
        'Persönliche Handlungsempfehlungen',
        'Schriftliches Reading (PDF)'
      ],
      popular: true,
      href: '/custom-readings?type=extended'
    },
    {
      id: 'premium',
      name: 'Premium Analyse Human Design',
      price: 199,
      description: 'inkl. persönlicher Session',
      features: [
        'Alles aus Erweiterte Analyse',
        '1:1 Zoom-Session (60 Min)',
        'Vollständige Auswertung',
        'Persönliche Fragen beantwortet',
        'Schriftliches Reading (PDF)',
        'Follow-up Support'
      ],
      popular: false,
      href: '/custom-readings?type=premium'
    },
    {
      id: 'planets',
      name: 'Planeten Reading',
      price: 129,
      description: 'Astrologisch + HD kombiniert',
      features: [
        'Alle Planeten im Human Design',
        'Astrologische Interpretation',
        'Planeten-Signaturen',
        'Schriftliches Reading (PDF)'
      ],
      popular: false,
      href: '/custom-readings?type=planets'
    }
  ];

  const getPrice = (pkg: any) => {
    return `${pkg.price.toFixed(2)}€`;
  };

  const getColor = (product: any) => {
    if (product.id === 'basic') return '#F29F05';
    if (product.id === 'premium') return '#8C1D04';
    return '#590A03';
  };

  if (authLoading || !mounted) {
    return (
      <Box sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Typography variant="h4" sx={{
          color: 'white',
          background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold'
        }}>
          💎 Lade Angebote...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      width: '100%',
      background: `
        radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
        radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
        radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
        linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
      `,
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden',
      pt: 4,
      pb: 8,
    }}>
      {/* Animierte Sterne */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            background: '#F29F05',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            pointerEvents: 'none',
            opacity: Math.random() * 0.8 + 0.2,
            zIndex: 0,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 2,
          }}
        />
      ))}

      <PageLayout activePage={undefined} showLogo={true} maxWidth="xl">
        <Box sx={{ position: 'relative', zIndex: 2, py: { xs: 4, md: 8 } }}>
          {/* Header */}
          <Box textAlign="center" mb={6}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                mb: 3,
                color: 'white',
                fontSize: { xs: '2rem', md: '3.5rem' },
                lineHeight: 1.2,
              }}
            >
              💎 Human Design Analysen
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 600,
                maxWidth: { xs: '100%', md: 900 },
                mx: 'auto',
                mb: 2,
                lineHeight: 1.6,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.4rem' },
              }}
            >
              Wähle das perfekte Human Design Reading für deine Journey
            </Typography>
          </Box>

          {/* Human Design Cards */}
          <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
            {humanDesignReadings.map((product, index) => (
              <Grid item xs={12} md={4} key={product.id} sx={{ display: 'flex' }}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{ width: '100%', height: '100%', display: 'flex' }}
                >
                  <Paper
                    elevation={product.popular ? 12 : 6}
                    sx={{
                      background: product.popular
                        ? 'linear-gradient(135deg, rgba(242, 159, 5, 0.10) 0%, rgba(140, 29, 4, 0.10) 100%)'
                        : 'rgba(242, 159, 5, 0.06)',
                      backdropFilter: 'blur(20px)',
                      border: product.popular
                        ? '2px solid rgba(242, 159, 5, 0.30)'
                        : '1px solid rgba(242, 159, 5, 0.15)',
                      borderRadius: 4,
                      p: 4,
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {product.popular && (
                      <Box sx={{
                        position: 'absolute',
                        top: -1,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        color: 'white',
                        px: 3,
                        py: 1,
                        borderRadius: '0 0 12px 12px',
                        fontSize: '0.9rem',
                        fontWeight: 700
                      }}>
                        🔥 Beliebt
                      </Box>
                    )}

                    <Box sx={{ textAlign: 'center', mb: 4, pt: product.popular ? 2 : 0 }}>
                      <Typography variant="h5" sx={{
                        color: 'white',
                        fontWeight: 700,
                        mb: 1,
                        fontSize: '1.3rem'
                      }}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: 'rgba(255,255,255,0.7)',
                        mb: 3,
                        fontSize: '0.95rem'
                      }}>
                        {product.description}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h3" sx={{
                          color: getColor(product),
                          fontWeight: 800,
                          mb: 0.5,
                          fontSize: { xs: '2rem', md: '2.5rem' }
                        }}>
                          {getPrice(product)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ flexGrow: 1, mb: 3 }}>
                      {product.features.map((feature: string, featureIndex: number) => (
                        <motion.div
                          key={featureIndex}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: featureIndex * 0.05 }}
                        >
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            mb: 2,
                            py: 0.5,
                            px: 1,
                            borderRadius: 2,
                            '&:hover': {
                              background: 'rgba(242, 159, 5, 0.05)'
                            },
                            transition: 'all 0.2s ease'
                          }}>
                            <Box sx={{
                              mt: 0.5,
                              mr: 1.5,
                              color: getColor(product),
                              flexShrink: 0
                            }}>
                              <Check size={18} />
                            </Box>
                            <Typography variant="body2" sx={{
                              color: 'rgba(255,255,255,0.9)',
                              fontSize: { xs: '1rem', md: '1.15rem' },
                              lineHeight: 1.6,
                              fontWeight: 600,
                            }}>
                              {feature}
                            </Typography>
                          </Box>
                        </motion.div>
                      ))}
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      component={Link}
                      href={product.href || `/subscription?package=${product.id}`}
                      startIcon={<ArrowRight size={20} />}
                      sx={{
                        background: `linear-gradient(135deg, ${getColor(product)}, ${getColor(product)}dd)`,
                        mt: 'auto',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${getColor(product)}dd, ${getColor(product)})`,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${getColor(product)}40`
                        },
                        borderRadius: 3,
                        fontWeight: 700,
                        py: 2,
                        fontSize: '1rem',
                        textTransform: 'none',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Jetzt bestellen
                    </Button>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </PageLayout>
    </Box>
  );
}
