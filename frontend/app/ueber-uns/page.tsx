'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Heart,
  Sparkles,
  Users,
  Target,
  Award,
  Lightbulb,
  Globe,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import PageLayout from '../components/PageLayout';

const teamMembers = [
  {
    name: 'Heiko',
    title: 'Human Design Experte & Life Coach',
    avatar: '/images/heiko.jpg',
    experience: '8+ Jahre',
    specializations: ['Human Design', 'Life Coaching', 'Beziehungen'],
    description: 'Heiko ist ein zertifizierter Human Design Experte mit über 8 Jahren Erfahrung. Er hilft Menschen dabei, ihre wahre Natur zu entdecken und authentisch zu leben.',
    rating: 4.9,
    reviews: 127,
  },
  {
    name: 'Janine',
    title: 'Human Design Beraterin & Therapeutin',
    avatar: '/images/janine.jpg',
    experience: '6+ Jahre',
    specializations: ['Human Design', 'Psychologie', 'Beziehungen'],
    description: 'Janine ist eine erfahrene Human Design Beraterin mit psychologischem Hintergrund. Sie spezialisiert sich auf Beziehungs- und Resonanzdynamiken.',
    rating: 4.8,
    reviews: 89,
  },
  {
    name: 'Elisabeth',
    title: 'Human Design Master & Business Coach',
    avatar: '/images/elisabeth.jpg',
    experience: '7+ Jahre',
    specializations: ['Human Design', 'Business', 'Team-Dynamik'],
    description: 'Elisabeth hilft Menschen dabei, ihre Resonanz zu verstehen und diese im beruflichen und privaten Kontext zu nutzen.',
    rating: 4.7,
    reviews: 98,
  },
];

const values = [
  {
    icon: <Heart size={32} />,
    title: 'Authentizität',
    description: 'Wir glauben daran, dass jeder Mensch einzigartig ist und sein wahres Selbst leben sollte.',
  },
  {
    icon: <Sparkles size={32} />,
    title: 'Resonanz',
    description: 'Wir helfen Menschen dabei, die energetischen Verbindungen zu verstehen, die sie mit anderen teilen.',
  },
  {
    icon: <Users size={32} />,
    title: 'Gemeinschaft',
    description: 'Wir schaffen einen sicheren Raum, in dem Menschen sich selbst und andere besser verstehen können.',
  },
  {
    icon: <Target size={32} />,
    title: 'Wachstum',
    description: 'Wir unterstützen Menschen dabei, ihr volles Potenzial zu entfalten und authentisch zu leben.',
  },
];

export default function UeberUnsPage() {

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
        radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
        radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
        linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
      `,
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <PageLayout activePage="dashboard" showLogo={true} maxWidth="lg">
        <Box sx={{ position: 'relative', zIndex: 2, py: { xs: 2, md: 4 } }}>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
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
              Über uns
            </Typography>
            <Typography variant="h5" sx={{
              color: 'rgba(255,255,255,0.85)',
              fontStyle: 'italic',
              fontWeight: 400,
              fontSize: { xs: '1.1rem', md: '1.5rem' },
              maxWidth: '800px',
              mx: 'auto',
              mb: 4,
            }}>
              Die energetische Verbindung zwischen Menschen verstehen
            </Typography>
            <Typography variant="body1" sx={{
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '900px',
              mx: 'auto',
              lineHeight: 1.8,
              fontSize: { xs: '1rem', md: '1.1rem' },
            }}>
              The Connection Key ist eine Plattform, die Menschen dabei hilft, die tiefen energetischen Verbindungen 
              zu verstehen, die sie mit anderen teilen. Durch Human Design und Resonanzanalyse ermöglichen wir 
              authentische Beziehungen und persönliches Wachstum.
            </Typography>
          </Box>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card sx={{
            background: 'rgba(242, 159, 5, 0.06)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(242, 159, 5, 0.3)',
            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
            p: { xs: 3, md: 5 },
            mb: 8,
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Target size={40} color="#F29F05" style={{ marginRight: 16 }} />
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '1.75rem', md: '2.5rem' },
                  }}
                >
                  Unsere Mission
                </Typography>
              </Box>
              <Typography variant="body1" sx={{
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.8,
                fontSize: { xs: '1rem', md: '1.1rem' },
                mb: 3,
              }}>
                Wir glauben daran, dass jeder Mensch einzigartig ist und ein Recht darauf hat, authentisch zu leben. 
                Durch Human Design und die Connection Key Resonanzanalyse helfen wir Menschen dabei:
              </Typography>
              <Grid container spacing={2}>
                {[
                  'Ihre wahre Natur zu entdecken und zu akzeptieren',
                  'Die energetischen Verbindungen zu anderen zu verstehen',
                  'Authentische Beziehungen aufzubauen',
                  'Ihr volles Potenzial zu entfalten',
                  'In Resonanz mit sich selbst und anderen zu leben',
                ].map((item, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'start' }}>
                      <ArrowRight size={20} color="#F29F05" style={{ marginRight: 12, marginTop: 4, flexShrink: 0 }} />
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        {item}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Box sx={{ mb: 8 }}>
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
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              Unsere Werte
            </Typography>
            <Grid container spacing={3}>
              {values.map((value, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{
                    background: 'rgba(242, 159, 5, 0.06)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    border: '1px solid rgba(242, 159, 5, 0.3)',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 32px rgba(242, 159, 5, 0.3)',
                    },
                  }}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 2,
                        color: '#F29F05',
                      }}>
                        {value.icon}
                      </Box>
                      <Typography variant="h6" sx={{
                        color: '#F29F05',
                        fontWeight: 700,
                        mb: 1.5,
                      }}>
                        {value.title}
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: 'rgba(255,255,255,0.8)',
                        lineHeight: 1.6,
                      }}>
                        {value.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                mb: 2,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              Unser Team
            </Typography>
            <Typography variant="body1" sx={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.7)',
              mb: 6,
              maxWidth: '700px',
              mx: 'auto',
            }}>
              Erfahrene Human Design Experten, die dich auf deinem Weg begleiten
            </Typography>
            <Grid container spacing={4}>
              {teamMembers.map((member, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card sx={{
                    background: 'rgba(242, 159, 5, 0.06)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    border: '1px solid rgba(242, 159, 5, 0.3)',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 32px rgba(242, 159, 5, 0.3)',
                    },
                  }}>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                      <Box sx={{ position: 'relative', mb: 3, display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{
                          position: 'relative',
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          overflow: 'hidden',
                          border: '3px solid rgba(242, 159, 5, 0.5)',
                        }}>
                          <Image
                            src={member.avatar}
                            alt={member.name}
                            fill
                            style={{ objectFit: 'cover' }}
                            sizes="120px"
                          />
                        </Box>
                        <Box sx={{
                          position: 'absolute',
                          bottom: 0,
                          right: 'calc(50% - 60px)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          background: 'rgba(242, 159, 5, 0.9)',
                          borderRadius: 2,
                          px: 1,
                          py: 0.5,
                        }}>
                          <Award size={16} color="white" />
                          <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                            {member.rating}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography variant="h5" sx={{
                        color: '#F29F05',
                        fontWeight: 700,
                        mb: 1,
                      }}>
                        {member.name}
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: 'rgba(255,255,255,0.7)',
                        mb: 2,
                      }}>
                        {member.title}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        {member.specializations.map((spec, idx) => (
                          <Chip
                            key={idx}
                            label={spec}
                            size="small"
                            sx={{
                              background: 'rgba(242, 159, 5, 0.2)',
                              color: '#F29F05',
                              border: '1px solid rgba(242, 159, 5, 0.5)',
                            }}
                          />
                        ))}
                      </Box>
                      <Typography variant="body2" sx={{
                        color: 'rgba(255,255,255,0.8)',
                        lineHeight: 1.6,
                        mb: 2,
                      }}>
                        {member.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          {member.experience} Erfahrung
                        </Typography>
                        <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          {member.reviews} Bewertungen
                        </Typography>
                      </Box>
                      <Link href="/connection-key/booking" style={{ textDecoration: 'none' }}>
                        <Box
                          component="button"
                          sx={{
                            mt: 3,
                            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(242, 159, 5, 0.4)',
                            },
                          }}
                        >
                          Session buchen
                        </Box>
                      </Link>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </motion.div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card sx={{
            background: 'rgba(242, 159, 5, 0.06)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(242, 159, 5, 0.3)',
            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
            p: { xs: 3, md: 5 },
            mb: 8,
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Lightbulb size={40} color="#F29F05" style={{ marginRight: 16 }} />
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '1.75rem', md: '2.5rem' },
                  }}
                >
                  Unsere Geschichte
                </Typography>
              </Box>
              <Typography variant="body1" sx={{
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.8,
                fontSize: { xs: '1rem', md: '1.1rem' },
                mb: 3,
              }}>
                The Connection Key entstand aus der tiefen Überzeugung, dass echte Verbindungen zwischen Menschen 
                mehr sind als nur oberflächliche Interaktionen. Wir haben erkannt, dass Human Design ein 
                kraftvolles Werkzeug ist, um die energetischen Dynamiken zu verstehen, die zwischen Menschen 
                existieren.
              </Typography>
              <Typography variant="body1" sx={{
                color: 'rgba(255,255,255,0.9)',
                lineHeight: 1.8,
                fontSize: { xs: '1rem', md: '1.1rem' },
                mb: 3,
              }}>
                Unsere Mission ist es, Menschen dabei zu helfen, diese Verbindungen zu erkennen, zu verstehen 
                und zu nutzen – für tiefere Beziehungen, bessere Kommunikation und ein authentischeres Leben.
              </Typography>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mt: 4,
                p: 3,
                background: 'rgba(242, 159, 5, 0.1)',
                borderRadius: 2,
                border: '1px solid rgba(242, 159, 5, 0.3)',
              }}>
                <Globe size={32} color="#F29F05" />
                <Box>
                  <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700, mb: 0.5 }}>
                    Weltweite Community
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Wir verbinden Menschen auf der ganzen Welt durch Human Design und Resonanzanalyse
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <Card sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.2), rgba(140, 29, 4, 0.2))',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '2px solid rgba(242, 159, 5, 0.5)',
            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.3)',
            p: { xs: 4, md: 6 },
            textAlign: 'center',
          }}>
            <CardContent>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                }}
              >
                Bereit für deine Resonanzanalyse?
              </Typography>
              <Typography variant="body1" sx={{
                color: 'rgba(255,255,255,0.9)',
                mb: 4,
                maxWidth: '600px',
                mx: 'auto',
              }}>
                Entdecke die energetische Verbindung zwischen dir und einer anderen Person. 
                Verstehe Goldadern, komplementäre Tore und die Resonanz, die euch verbindet.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/human-design-chart/connection-key" style={{ textDecoration: 'none' }}>
                  <Box
                    component="button"
                    sx={{
                      background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontSize: '1rem',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)',
                      },
                    }}
                  >
                    Resonanzanalyse starten
                  </Box>
                </Link>
                <Link href="/connection-key/booking" style={{ textDecoration: 'none' }}>
                  <Box
                    component="button"
                    sx={{
                      background: 'transparent',
                      color: '#F29F05',
                      border: '2px solid rgba(242, 159, 5, 0.5)',
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      fontSize: '1rem',
                      '&:hover': {
                        background: 'rgba(242, 159, 5, 0.1)',
                        borderColor: '#F29F05',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Session buchen
                  </Box>
                </Link>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
        </Box>
      </PageLayout>
    </Box>
  );
}

