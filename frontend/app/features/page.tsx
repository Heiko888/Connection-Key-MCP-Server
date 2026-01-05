'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Logo from '@/app/components/Logo';
import PublicHeader from '@/app/components/PublicHeader';
import { 
  Heart, 
  ArrowRight, 
  Star, 
  Users,
  Zap,
  Target,
  CheckCircle,
  Calendar,
  Video,
  FileText,
  User,
  Eye,
  Sparkles,
  Quote,
  Shield,
  Key,
  BookOpen,
  Moon,
  MessageCircle,
  Crown,
  Lightbulb,
  LogIn,
  UserPlus,
  Check,
} from 'lucide-react';

function FeaturesContent() {
  return (
    <Box
      sx={{
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
        pt: { xs: 4, md: 6 },
        pb: 8,
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
            radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
            radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
            linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
          `,
          backgroundAttachment: 'fixed',
          zIndex: -1,
        },
      }}
    >
      {/* Animierte Sterne im Hintergrund */}
      {Array.from({ length: 50 }).map((_, i) => (
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
            zIndex: 1,
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
        {/* Logo - Mobile: zentriert und größer, Desktop: wie bisher */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 4, md: 6 } }}>
          <Logo mb={0} height={{ xs: 160, md: 180 }} width={{ xs: '90%', md: 600 }} maxWidth={600} />
        </Box>
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 12, mt: { xs: -3, md: -5 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                mb: 3,
                fontSize: { xs: '2rem', md: '3.5rem' },
                color: 'white',
                lineHeight: 1.2,
              }}
            >
              Dein Raum für
              <br />
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Community, Dating & mehr
              </Box>
            </Typography>

            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mb: 2,
                maxWidth: { xs: '100%', md: 900 },
                mx: 'auto',
                px: { xs: 2, md: 0 },
                lineHeight: 1.6,
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.4rem' },
                fontWeight: 600,
              }}
            >
              <strong>The Connection Key</strong> ist mehr als Analysen – es ist dein Raum für echte Verbindungen, authentisches Dating und eine wachsende Community.
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                mb: 4,
                maxWidth: { xs: '100%', md: 800 },
                mx: 'auto',
                px: { xs: 2, md: 0 },
                lineHeight: 1.7,
                fontSize: { xs: '0.95rem', md: '1.2rem' },
                fontWeight: 400,
              }}
            >
              Entdecke Menschen, die wirklich zu dir passen. Tausche dich aus. Wachse gemeinsam.
            </Typography>
          </motion.div>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 3 }} justifyContent="center" sx={{ px: { xs: 2, sm: 0 } }}>
            <Button
              component={Link}
              href="/community"
              variant="contained"
              size="large"
              endIcon={<ArrowRight size={24} />}
              sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                color: 'white',
                fontWeight: 700,
                px: { xs: 4, sm: 6 },
                py: { xs: 2, sm: 2.5 },
                fontSize: { xs: '1rem', sm: '1.1rem' },
                borderRadius: 4,
                boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 35px rgba(242, 159, 5, 0.5)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Community entdecken
            </Button>
            <Button
              component={Link}
              href="/dating"
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'rgba(242, 159, 5, 0.7)',
                color: '#F29F05',
                fontWeight: 700,
                px: { xs: 4, sm: 6 },
                py: { xs: 2, sm: 2.5 },
                fontSize: { xs: '1rem', sm: '1.1rem' },
                borderRadius: 4,
                borderWidth: 2,
                background: 'rgba(242, 159, 5, 0.05)',
                '&:hover': {
                  borderColor: '#F29F05',
                  background: 'rgba(242, 159, 5, 0.15)',
                  borderWidth: 2,
                },
              }}
            >
              Dating starten
            </Button>
          </Stack>
        </Box>

        {/* Vier-Säulen-Sektion */}
        <Box sx={{ mb: 12 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 6,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.8rem', md: '2.8rem' },
              }}
            >
              Was dich erwartet
            </Typography>

            <Grid container spacing={4}>
              {[
                {
                  icon: <Users size={40} />,
                  title: 'Community',
                  description: 'Tausche dich mit über 2.500+ Menschen aus, die ihre Human Design Journey teilen. Finde Gleichgesinnte, lerne voneinander und wachse gemeinsam.',
                  link: '/community',
                  linkText: 'Zur Community',
                },
                {
                  icon: <Heart size={40} />,
                  title: 'Dating',
                  description: 'Finde Menschen, deren Energie wirklich zu dir passt. Basierend auf Human Design und energetischer Resonanz – nicht auf Algorithmen.',
                  link: '/dating',
                  linkText: 'Dating starten',
                },
                {
                  icon: <BookOpen size={40} />,
                  title: 'Dein Bewusstseinsfeld',
                  description: 'Dokumentiere deine Reise, verfolge deine Entwicklung und vertiefe dein Verständnis durch bewusste Selbstreflexion.',
                  link: '/journal',
                  linkText: 'Journal öffnen',
                },
                {
                  icon: <Moon size={40} />,
                  title: 'Mondkalender',
                  description: 'Entdecke, wie die Mondphasen deine Energiezyklen beeinflussen und wie du sie optimal für dich nutzen kannst.',
                  link: '/mondkalender',
                  linkText: 'Mondkalender öffnen',
                },
              ].map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Card
                      sx={{
                        background: 'rgba(242, 159, 5, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(242, 159, 5, 0.15)',
                        borderRadius: 3,
                        p: 4,
                        height: '100%',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          borderColor: '#F29F05',
                          boxShadow: '0 8px 25px rgba(242, 159, 5, 0.25)',
                          background: 'rgba(242, 159, 5, 0.08)',
                        },
                      }}
                    >
                      <Box sx={{ color: '#F29F05', mb: 3, display: 'flex', justifyContent: 'center' }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 700 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.7, mb: 3 }}>
                        {feature.description}
                      </Typography>
                      <Button
                        component={Link}
                        href={feature.link}
                        variant="outlined"
                        size="small"
                        endIcon={<ArrowRight size={16} />}
                        sx={{
                          borderColor: 'rgba(242, 159, 5, 0.5)',
                          color: '#F29F05',
                          fontWeight: 600,
                          '&:hover': {
                            borderColor: '#F29F05',
                            background: 'rgba(242, 159, 5, 0.1)',
                          },
                        }}
                      >
                        {feature.linkText}
                      </Button>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Box>

        {/* Community Section */}
        <Box sx={{ mb: 12 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card
              sx={{
                background: 'rgba(242, 159, 5, 0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(242, 159, 5, 0.2)',
                borderRadius: 4,
                p: { xs: 4, md: 6 },
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Users size={48} color="#F29F05" style={{ marginBottom: 16 }} />
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '2rem', md: '2.5rem' },
                  }}
                >
                  Warum Community?
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 3,
                    maxWidth: 800,
                    mx: 'auto',
                    lineHeight: 1.8,
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    fontWeight: 400,
                  }}
                >
                  Werde Teil unserer wachsenden Community von über 2.500+ Menschen auf ihrer Human Design Journey. 
                  Teile deine Erfahrungen, entdecke energetische Verbindungen und wachse gemeinsam mit Gleichgesinnten.
                </Typography>

                <Grid container spacing={2} sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
                  {[
                    { icon: '👥', text: 'Austausch mit >2.500 Menschen' },
                    { icon: '💬', text: 'Monatliche Community-Calls' },
                    { icon: '💫', text: 'Energetische Partner-Matches' },
                    { icon: '📚', text: 'Exklusives Wissen & Insights' },
                  ].map((benefit, idx) => (
                    <Grid item xs={6} sm={3} key={idx}>
                      <Box sx={{
                        textAlign: 'center',
                        p: 2,
                        background: 'rgba(242, 159, 5, 0.1)',
                        borderRadius: 2,
                        border: '1px solid rgba(242, 159, 5, 0.2)',
                      }}>
                        <Typography sx={{ fontSize: '2rem', mb: 1 }}>{benefit.icon}</Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: { xs: '0.8rem', md: '0.9rem' } }}>
                          {benefit.text}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {/* Paketauswahl - exakt wie Memberships */}
                <Box sx={{ mb: 4, mt: 4 }}>
                  <Grid container spacing={4} sx={{ maxWidth: 1200, mx: 'auto' }}>
                    {[
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
                      },
                    ].map((pkg, index) => {
                      const getColor = (id: string) => {
                        if (id === 'basic') return '#F29F05';
                        if (id === 'premium') return '#8C1D04';
                        return '#590A03';
                      };
                      const getPrice = () => {
                        return `${pkg.priceMonthly.toFixed(2)}€/Monat`;
                      };
                      
                      return (
                        <Grid item xs={12} md={4} key={pkg.id}>
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            <Paper
                              elevation={pkg.popular ? 12 : 6}
                              component="div"
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
                                  <Crown size={32} color={getColor(pkg.id)} />
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
                                    color: getColor(pkg.id),
                                    fontWeight: 800,
                                    mb: 0.5,
                                    fontSize: { xs: '2rem', md: '2.5rem' }
                                  }}>
                                    {getPrice()}
                                  </Typography>
                                </Box>
                              </Box>

                              <Box sx={{ mb: 4 }}>
                                {pkg.features.map((feature: string, featureIndex: number) => (
                                  <motion.div
                                    key={featureIndex}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
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
                                        color: getColor(pkg.id),
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
                                  background: `linear-gradient(135deg, ${getColor(pkg.id)}, ${getColor(pkg.id)}dd)`,
                                  '&:hover': {
                                    background: `linear-gradient(135deg, ${getColor(pkg.id)}dd, ${getColor(pkg.id)})`,
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 8px 25px ${getColor(pkg.id)}40`
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
                      );
                    })}
                  </Grid>
                </Box>
              </Box>
            </Card>
          </motion.div>
        </Box>

        {/* Dating Section */}
        <Box sx={{ mb: 12 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card
              sx={{
                background: 'rgba(242, 159, 5, 0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(242, 159, 5, 0.2)',
                borderRadius: 4,
                p: { xs: 4, md: 6 },
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Heart size={48} color="#F29F05" style={{ marginBottom: 16 }} />
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '2rem', md: '2.5rem' },
                  }}
                >
                  Dating mit Human Design
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 3,
                    maxWidth: 800,
                    mx: 'auto',
                    lineHeight: 1.8,
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    fontWeight: 400,
                  }}
                >
                  Finde Menschen, deren Energie wirklich zu dir passt. Basierend auf Human Design und energetischer Resonanz – nicht auf oberflächlichen Algorithmen.
                </Typography>

                <Grid container spacing={3} sx={{ mb: 4, maxWidth: 900, mx: 'auto' }}>
                  {[
                    { icon: <Target size={32} />, title: 'Energetische Resonanz', text: 'Finde Menschen, die wirklich zu dir passen' },
                    { icon: <Sparkles size={32} />, title: 'Human Design Matching', text: 'Basierend auf deinem energetischen Design' },
                    { icon: <Lightbulb size={32} />, title: 'Dating Ideen', text: 'Personalisierte Tipps für dein Date' },
                  ].map((feature, idx) => (
                    <Grid item xs={12} sm={4} key={idx}>
                      <Box sx={{
                        textAlign: 'center',
                        p: 3,
                        background: 'rgba(242, 159, 5, 0.1)',
                        borderRadius: 2,
                        border: '1px solid rgba(242, 159, 5, 0.2)',
                        height: '100%',
                      }}>
                        <Box sx={{ color: '#F29F05', mb: 2, display: 'flex', justifyContent: 'center' }}>
                          {feature.icon}
                        </Box>
                        <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontWeight: 700, fontSize: '1.1rem' }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          {feature.text}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Button
                  component={Link}
                  href="/dating"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowRight size={24} />}
                  sx={{
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    color: 'white',
                    fontWeight: 700,
                    px: { xs: 4, sm: 6 },
                    py: { xs: 2, sm: 2.5 },
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    borderRadius: 4,
                    boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 35px rgba(242, 159, 5, 0.5)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Dating starten
                </Button>
              </Box>
            </Card>
          </motion.div>
        </Box>

        {/* Weitere Features */}
        <Box sx={{ mb: 12 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 6,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.8rem', md: '2.8rem' },
              }}
            >
              Weitere Features
            </Typography>

            <Grid container spacing={4}>
              {[
                {
                  icon: <BookOpen size={32} />,
                  title: 'Dein Bewusstseinsfeld',
                  description: 'Dokumentiere deine Reise, verfolge deine Entwicklung und vertiefe dein Verständnis durch bewusste Selbstreflexion.',
                  link: '/journal',
                },
                {
                  icon: <Moon size={32} />,
                  title: 'Mondkalender',
                  description: 'Entdecke, wie die Mondphasen deine Energiezyklen beeinflussen und wie du sie optimal für dich nutzen kannst.',
                  link: '/mondkalender',
                },
                {
                  icon: <Eye size={32} />,
                  title: 'Human Design Chart',
                  description: 'Erkenne dein wahres Design und verstehe, wie deine Energie wirklich funktioniert.',
                  link: '/human-design-chart',
                },
                {
                  icon: <FileText size={32} />,
                  title: 'Blogartikel',
                  description: 'Tiefe Einblicke in Human Design, Resonanz, Dating und persönliches Wachstum.',
                  link: '/blogartikel',
                },
              ].map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <Card
                      sx={{
                        background: 'rgba(242, 159, 5, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(242, 159, 5, 0.15)',
                        borderRadius: 3,
                        p: 4,
                        height: '100%',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          borderColor: '#F29F05',
                          boxShadow: '0 8px 25px rgba(242, 159, 5, 0.25)',
                          background: 'rgba(242, 159, 5, 0.08)',
                        },
                      }}
                    >
                      <Box sx={{ color: '#F29F05', mb: 3, display: 'flex', justifyContent: 'center' }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 700 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.7, mb: 3 }}>
                        {feature.description}
                      </Typography>
                      <Button
                        component={Link}
                        href={feature.link}
                        variant="outlined"
                        size="small"
                        endIcon={<ArrowRight size={16} />}
                        sx={{
                          borderColor: 'rgba(242, 159, 5, 0.5)',
                          color: '#F29F05',
                          fontWeight: 600,
                          '&:hover': {
                            borderColor: '#F29F05',
                            background: 'rgba(242, 159, 5, 0.1)',
                          },
                        }}
                      >
                        Mehr erfahren
                      </Button>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Box>

        {/* CTA */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 3,
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '1.8rem', md: '2.8rem' },
              }}
            >
              Bereit, deine Reise zu beginnen?
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                mb: 5,
                maxWidth: { xs: '100%', md: 650 },
                mx: 'auto',
                px: { xs: 2, md: 0 },
                lineHeight: 1.8,
                fontSize: { xs: '0.95rem', md: '1.2rem' },
              }}
            >
              Entdecke Community, Dating und alle Features, die dir helfen, authentische Verbindungen zu finden und zu wachsen.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
              <Button
                component={Link}
                href="/register"
                variant="contained"
                size="large"
                endIcon={<ArrowRight size={24} />}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white',
                  fontWeight: 700,
                  px: { xs: 4, sm: 6 },
                  py: { xs: 2, sm: 2.5 },
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                  borderRadius: 4,
                  boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)',
                  mb: 3,
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 35px rgba(242, 159, 5, 0.5)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Jetzt registrieren
              </Button>
              <Button
                component={Link}
                href="/"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  fontWeight: 700,
                  px: { xs: 4, sm: 6 },
                  py: { xs: 2, sm: 2.5 },
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                  borderRadius: 4,
                  borderWidth: 2,
                  background: 'rgba(242, 159, 5, 0.05)',
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    borderColor: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.15)',
                    borderWidth: 2,
                  },
                }}
              >
                Zur Startseite
              </Button>
            </Stack>

            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                mt: 3,
              }}
            >
              <Shield size={16} />
              Deine Daten sind sicher. Wir arbeiten vertraulich und wertschätzend.
            </Typography>
          </motion.div>
        </Box>
      </Box>
      </Container>
    </Box>
  );
}

export default function FeaturesPage() {
  return <FeaturesContent />;
}

