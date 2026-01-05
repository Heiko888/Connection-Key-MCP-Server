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
} from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Logo from '@/app/components/Logo';
import { 
  ArrowRight, 
  FileText,
  Users,
  Heart,
  Key,
  Quote,
  Eye,
} from 'lucide-react';

export default function BeispieleReadingsPage() {
  return (
    <Box
        sx={{
          width: '100%',
          background: `
            radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
            radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
            radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
            linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
          `,
          backgroundAttachment: 'fixed',
          position: 'relative',
          pt: { xs: 4, md: 6 },
          pb: 8,
          overflow: 'hidden',
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

        <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 }, pb: 4, position: 'relative', zIndex: 2, px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Logo - Desktop only */}
          <Box sx={{ display: { xs: 'none', md: 'block' }, mb: 6 }}>
            <Logo mb={6} />
          </Box>
          {/* Hero Section */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
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
                Beispiele & Readings
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
                  Connection Key Analysen
                </Box>
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: 4,
                  maxWidth: { xs: '100%', md: 800 },
                  mx: 'auto',
                  px: { xs: 2, md: 0 },
                  lineHeight: 1.6,
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.3rem' },
                  fontWeight: 400,
                }}
              >
                Entdecke, wie Connection Key Analysen aussehen und welche Insights sie liefern.
              </Typography>
            </motion.div>
          </Box>

          {/* Beispiel-Readings */}
          <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: 8 }}>
            {[
              {
                title: 'Beziehungs-Analyse',
                type: 'Connection Key',
                description: 'Eine detaillierte Analyse der energetischen Verbindung zwischen zwei Partnern. Zeigt Resonanz, Trigger-Punkte und Wachstumspotenzial.',
                features: [
                  'Electromagnetic Connection',
                  'Compromise & Dominance Keys',
                  'Sexuality/Chemistry Analyse',
                  'Praktische Beziehungs-Insights',
                ],
                icon: <Heart size={32} />,
              },
              {
                title: 'Penta-Analyse',
                type: 'Gruppen-Reading',
                description: 'Eine umfassende Analyse der Gruppenenergie für 3-5 Personen. Identifiziert Rollen, Dynamiken und kollektive Muster.',
                features: [
                  'Rollen-Verteilung',
                  'Kollektive Zentren',
                  'Fehlende Energien',
                  'Gruppen-Wachstumspotenzial',
                ],
                icon: <Users size={32} />,
              },
              {
                title: 'Business-Resonanz',
                type: 'Connection Key',
                description: 'Eine Analyse der energetischen Verbindung zwischen Geschäftspartnern oder Team-Mitgliedern. Optimiert Zusammenarbeit und Kommunikation.',
                features: [
                  'Business-Kompatibilität',
                  'Team-Dynamiken',
                  'Kommunikations-Muster',
                  'Erfolgs-Potenzial',
                ],
                icon: <Key size={32} />,
              },
            ].map((example, index) => (
              <Grid item xs={12} md={4} key={index}>
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
                      borderRadius: 4,
                      p: 4,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        borderColor: '#F29F05',
                        boxShadow: '0 8px 25px rgba(242, 159, 5, 0.25)',
                        background: 'rgba(242, 159, 5, 0.08)',
                      },
                    }}
                  >
                    <Box sx={{ color: '#F29F05', mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                      {example.icon}
                      <Chip
                        label={example.type}
                        size="small"
                        sx={{
                          background: 'rgba(242, 159, 5, 0.15)',
                          color: '#F29F05',
                          border: '1px solid rgba(242, 159, 5, 0.3)',
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    <Typography variant="h5" sx={{ color: '#fff', mb: 2, fontWeight: 700 }}>
                      {example.title}
                    </Typography>

                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        mb: 3,
                        lineHeight: 1.7,
                        flex: 1,
                      }}
                    >
                      {example.description}
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#F29F05',
                          fontWeight: 700,
                          mb: 2,
                          fontSize: '0.9rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Enthält:
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, m: 0, color: 'rgba(255, 255, 255, 0.8)' }}>
                        {example.features.map((feature, idx) => (
                          <li key={idx} style={{ marginBottom: '0.5rem', lineHeight: 1.6 }}>
                            {feature}
                          </li>
                        ))}
                      </Box>
                    </Box>

                    <Button
                      component={Link}
                      href="/resonanzanalyse/sofort"
                      variant="outlined"
                      fullWidth
                      endIcon={<ArrowRight size={18} />}
                      sx={{
                        borderColor: 'rgba(242, 159, 5, 0.5)',
                        color: '#F29F05',
                        fontWeight: 700,
                        py: 1.5,
                        borderRadius: 2,
                        borderWidth: 2,
                        mt: 'auto',
                        '&:hover': {
                          borderColor: '#F29F05',
                          background: 'rgba(242, 159, 5, 0.1)',
                          borderWidth: 2,
                        },
                      }}
                    >
                      Eigene Analyse starten
                    </Button>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Testimonials */}
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
              Was Menschen sagen
            </Typography>

            <Grid container spacing={{ xs: 3, md: 4 }}>
              {[
                {
                  quote: 'Das Reading hat unsere Beziehung komplett verändert.',
                  text: 'Wir haben endlich verstanden, warum wir uns so stark anziehen – und warum es immer wieder an denselben Stellen knallt. Die Analyse hat uns eine völlig neue Perspektive gegeben.',
                  author: 'Sarah & Michael',
                },
                {
                  quote: 'Wie eine energetische Landkarte unserer Verbindung.',
                  text: 'Ich habe zum ersten Mal klar gesehen, wo meine Themen sind und wo seine. Seitdem kann ich viel bewusster reagieren, statt in alte Muster zu rutschen.',
                  author: 'Lisa',
                },
                {
                  quote: 'Unser Team funktioniert jetzt viel besser.',
                  text: 'Die Penta-Analyse hat gezeigt, wer welche Rolle im Team übernimmt und wo Spannungen entstehen. Seitdem kommunizieren wir viel klarer.',
                  author: 'Business-Team',
                },
              ].map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
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
                        borderRadius: 4,
                        p: 4,
                        height: '100%',
                        position: 'relative',
                        '&:hover': {
                          borderColor: 'rgba(242, 159, 5, 0.4)',
                          boxShadow: '0 8px 25px rgba(242, 159, 5, 0.2)',
                        },
                      }}
                    >
                      <Quote
                        size={40}
                        style={{
                          color: '#F29F05',
                          opacity: 0.3,
                          position: 'absolute',
                          top: 20,
                          left: 20,
                        }}
                      />
                      <Typography
                        variant="h6"
                        sx={{
                          color: '#F29F05',
                          mb: 2,
                          fontWeight: 700,
                          fontStyle: 'italic',
                          pl: 6,
                        }}
                      >
                        „{testimonial.quote}"
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.9)',
                          mb: 3,
                          lineHeight: 1.8,
                          pl: 6,
                        }}
                      >
                        {testimonial.text}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          pl: 6,
                          fontStyle: 'italic',
                        }}
                      >
                        — {testimonial.author}
                      </Typography>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* CTA */}
          <Box sx={{ textAlign: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.8rem', md: '2.5rem' },
                }}
              >
                Bereit für deine eigene Analyse?
              </Typography>

              <Button
                component={Link}
                href="/resonanzanalyse/sofort"
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
                Connection Key starten
              </Button>
            </motion.div>
          </Box>
        </Container>
      </Box>
  );
}

