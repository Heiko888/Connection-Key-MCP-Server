"use client";

import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Paper, Chip, Container } from '@mui/material';
import { motion } from 'framer-motion';
import { Check, Crown, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import PublicHeader from '../components/PublicHeader';
import Logo from '../components/Logo';

export default function MembershipsPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const membershipPackages = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Perfekt für den Einstieg',
      priceMonthly: 9.99,
      priceYearly: 99.99,
      features: [
        'Human Design Chart',
        'Grundlegende Analysen',
        'Mondkalender',
        'Community-Zugang',
        'Mobile App'
      ],
      popular: false,
      href: '/subscription?package=basic'
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Connection Key + tiefe Verbindungsauswertungen',
      priceMonthly: 19.99,
      priceYearly: 199.99,
      features: [
        'Alle Basic Features',
        'Erweiterte Chart-Analysen',
        'Dating-System',
        'Persönliche Insights',
        'Priority Support',
        'Exklusive Inhalte'
      ],
      popular: true,
      href: '/subscription?package=premium'
    },
    {
      id: 'vip',
      name: 'VIP',
      description: 'Komplettes Human Design + Connection Key + persönliches Wachstumstool',
      priceMonthly: 49.99,
      priceYearly: 499.99,
      features: [
        'Alle Premium Features',
        '1:1 Coaching Sessions',
        'VIP Community',
        'Persönlicher Coach',
        'Exklusive Events',
        'Lifetime Updates',
        'White Glove Service'
      ],
      popular: false,
      href: '/subscription?package=vip'
    }
  ];

  const getPrice = (pkg: typeof membershipPackages[0]) => {
    const price = billingCycle === 'yearly' ? pkg.priceYearly : pkg.priceMonthly;
    const cycle = billingCycle === 'yearly' ? '/Jahr' : '/Monat';
    return `${price.toFixed(2)}€${cycle}`;
  };

  const getSavings = (pkg: typeof membershipPackages[0]) => {
    if (billingCycle === 'monthly') return null;
    const monthlyTotal = pkg.priceMonthly * 12;
    const savings = monthlyTotal - pkg.priceYearly;
    return `Sie sparen ${savings.toFixed(2)}€ pro Jahr`;
  };

  const getColor = (pkg: typeof membershipPackages[0]) => {
    if (pkg.id === 'basic') return '#F29F05';
    if (pkg.id === 'premium') return '#8C1D04';
    return '#590A03';
  };

  if (!mounted) {
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
          💎 Lade Memberships...
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

      <Container maxWidth="lg" sx={{ pt: { xs: 1, md: 1.5 }, pb: 4, position: 'relative', zIndex: 2, px: { xs: 2, sm: 3, md: 4 } }}>
        <PublicHeader />
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 4, md: 6 } }}>
          <Logo mb={0} height={{ xs: 160, md: 180 }} width={{ xs: '90%', md: 600 }} maxWidth={600} />
        </Box>
        {/* Header */}
        <Box textAlign="center" mb={6}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              👑 Memberships
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 400,
                maxWidth: '700px',
                mx: 'auto',
                lineHeight: 1.7,
                fontSize: { xs: '1rem', md: '1.1rem' }
              }}
            >
              Wähle das perfekte Membership für deine Human Design Journey
            </Typography>
          </Box>

          {/* Billing Cycle Toggle */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 6,
            background: 'rgba(242, 159, 5, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.2)',
            borderRadius: 4,
            p: 1.5,
            maxWidth: 450,
            mx: 'auto',
            gap: 1
          }}>
            <Button
              variant={billingCycle === 'monthly' ? 'contained' : 'text'}
              onClick={() => setBillingCycle('monthly')}
              sx={{
                background: billingCycle === 'monthly' ? 'linear-gradient(135deg, #F29F05, #8C1D04)' : 'transparent',
                color: billingCycle === 'monthly' ? 'white' : 'rgba(255,255,255,0.7)',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                flex: 1,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  background: billingCycle === 'monthly' ? 'linear-gradient(135deg, #8C1D04, #F29F05)' : 'rgba(242,159,5,0.15)'
                },
              }}
            >
              Monatlich
            </Button>
            <Button
              variant={billingCycle === 'yearly' ? 'contained' : 'text'}
              onClick={() => setBillingCycle('yearly')}
              sx={{
                background: billingCycle === 'yearly' ? 'linear-gradient(135deg, #F29F05, #8C1D04)' : 'transparent',
                color: billingCycle === 'yearly' ? 'white' : 'rgba(255,255,255,0.7)',
                borderRadius: 3,
                px: 4,
                py: 1.5,
                flex: 1,
                fontWeight: 600,
                textTransform: 'none',
                position: 'relative',
                '&:hover': {
                  background: billingCycle === 'yearly' ? 'linear-gradient(135deg, #8C1D04, #F29F05)' : 'rgba(242,159,5,0.15)'
                },
              }}
            >
              Jährlich
              <Chip
                label="20% sparen"
                size="small"
                sx={{
                  ml: 1,
                  background: billingCycle === 'yearly' ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.65rem',
                  height: 20,
                }}
              />
            </Button>
          </Box>

          {/* Membership Cards */}
          <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
            {membershipPackages.map((pkg, index) => (
              <Grid item xs={12} md={4} key={pkg.id} sx={{ display: 'flex' }}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  style={{ width: '100%', height: '100%', display: 'flex' }}
                >
                  <Paper
                    elevation={pkg.popular ? 12 : 6}
                    sx={{
                      background: pkg.popular
                        ? 'linear-gradient(135deg, rgba(242, 159, 5, 0.10) 0%, rgba(140, 29, 4, 0.10) 100%)'
                        : 'rgba(242, 159, 5, 0.06)',
                      backdropFilter: 'blur(20px)',
                      border: pkg.popular
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
                    {pkg.popular && (
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

                    <Box sx={{ textAlign: 'center', mb: 4, pt: pkg.popular ? 2 : 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Crown size={32} color={getColor(pkg)} />
                      </Box>
                      <Typography variant="h5" sx={{
                        color: 'white',
                        fontWeight: 700,
                        mb: 1,
                        fontSize: '1.3rem'
                      }}>
                        {pkg.name}
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: 'rgba(255,255,255,0.7)',
                        mb: 3,
                        fontSize: '0.95rem'
                      }}>
                        {pkg.description}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h3" sx={{
                          color: getColor(pkg),
                          fontWeight: 800,
                          mb: 0.5,
                          fontSize: { xs: '2rem', md: '2.5rem' }
                        }}>
                          {getPrice(pkg)}
                        </Typography>
                        {getSavings(pkg) && (
                          <Chip
                            icon={<Sparkles size={14} />}
                            label={getSavings(pkg)}
                            size="small"
                            sx={{
                              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                              color: 'white',
                              fontWeight: 600,
                              mt: 1,
                              fontSize: '0.75rem'
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ flexGrow: 1, mb: 3 }}>
                      {pkg.features.map((feature: string, featureIndex: number) => (
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
                              color: getColor(pkg),
                              flexShrink: 0
                            }}>
                              <Check size={18} />
                            </Box>
                            <Typography variant="body2" sx={{
                              color: 'rgba(255,255,255,0.85)',
                              fontSize: '0.9rem',
                              lineHeight: 1.6
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
                      href={pkg.href}
                      startIcon={<ArrowRight size={20} />}
                      sx={{
                        background: `linear-gradient(135deg, ${getColor(pkg)}, ${getColor(pkg)}dd)`,
                        mt: 'auto',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${getColor(pkg)}dd, ${getColor(pkg)})`,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${getColor(pkg)}40`
                        },
                        borderRadius: 3,
                        fontWeight: 700,
                        py: 2,
                        fontSize: '1rem',
                        textTransform: 'none',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Jetzt buchen
                    </Button>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

