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
import Image from 'next/image';
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
  Pentagon,
  Shield,
  Key,
  LogIn,
  UserPlus,
} from 'lucide-react';

function ConnectionKeyContent() {
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

      {/* Pulsierende Resonanz-Linien */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`resonance-${i}`}
          style={{
            position: 'absolute',
            width: '3px',
            height: '400px',
            background: `linear-gradient(180deg, transparent, rgba(242, 159, 5, ${0.4 - i * 0.1}), transparent)`,
            left: `${30 + i * 20}%`,
            top: `${20 + i * 10}%`,
            pointerEvents: 'none',
            transform: 'rotate(45deg)',
            zIndex: 1,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
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
              Deine energetische Signatur
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
                zwischen zwei Menschen
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
              <strong>The Connection Key</strong> zeigt dir, was wirklich zwischen euch passiert – unsichtbar, aber spürbar.
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
              Resonanz, Anziehung, Trigger, Wachstum – alles hat eine energetische Signatur.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.75)',
                mb: 3,
                maxWidth: { xs: '100%', md: 900 },
                mx: 'auto',
                px: { xs: 2, md: 0 },
                lineHeight: 1.8,
                fontSize: { xs: '0.9rem', md: '1.1rem' },
              }}
            >
              Statt zu raten, warum ihr euch so stark anzieht oder warum es immer wieder an denselben Punkten kracht, macht der Connection Key die <strong>energetische Verbindung zwischen zwei Menschen sichtbar</strong> – basierend auf dem Human Design System und der Resonanzanalyse.
            </Typography>
          </motion.div>

          {/* Visuelle Verbindungslinie - zwei Silhouetten mit pulsierender Linie */}
          <Box sx={{ 
            position: 'relative', 
            height: { xs: 150, md: 200 }, 
            maxWidth: 600, 
            mx: 'auto', 
            mb: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 4,
          }}>
            {/* Linke Silhouette */}
            <Box
              sx={{
                width: { xs: 60, md: 80 },
                height: { xs: 60, md: 80 },
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.3))',
                border: '2px solid rgba(242, 159, 5, 0.5)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '70%',
                  height: '70%',
                  borderRadius: '50%',
                  background: 'rgba(242, 159, 5, 0.2)',
                  animation: 'pulse 2s infinite',
                },
              }}
            />

            {/* Pulsierende Verbindungslinie */}
            <motion.div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60%',
                height: '3px',
                background: 'linear-gradient(90deg, rgba(242, 159, 5, 0.3), rgba(242, 159, 5, 0.8), rgba(242, 159, 5, 0.3))',
                borderRadius: '2px',
                boxShadow: '0 0 20px rgba(242, 159, 5, 0.5)',
              }}
              animate={{
                opacity: [0.5, 1, 0.5],
                scaleX: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />

            {/* Rechte Silhouette */}
            <Box
              sx={{
                width: { xs: 60, md: 80 },
                height: { xs: 60, md: 80 },
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.3))',
                border: '2px solid rgba(242, 159, 5, 0.5)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '70%',
                  height: '70%',
                  borderRadius: '50%',
                  background: 'rgba(242, 159, 5, 0.2)',
                  animation: 'pulse 2s infinite',
                },
              }}
            />
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 3 }} justifyContent="center" sx={{ px: { xs: 2, sm: 0 } }}>
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
            <Button
              component={Link}
              href="/connection-key/beispiele-readings"
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
              Beispiele & Readings ansehen
            </Button>
          </Stack>
        </Box>

        {/* Vier-Säulen-Sektion */}
        <Box sx={{ mb: 12 }}>
          {/* ✨ PREMIUM: Section-Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 3,
            mb: { xs: 6, md: 8 },
            position: 'relative'
          }}>
            <Box sx={{
              flex: 1,
              height: 2,
              background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5))',
              borderRadius: 1
            }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Eye size={28} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.8rem', md: '2.8rem' },
                  textAlign: 'center',
                }}
              >
                Was der Connection Key für dich sichtbar macht
              </Typography>
              <Eye size={28} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
            </Box>
            <Box sx={{
              flex: 1,
              height: 2,
              background: 'linear-gradient(90deg, rgba(242, 159, 5, 0.5), transparent)',
              borderRadius: 1
            }} />
          </Box>

          <Grid container spacing={{ xs: 3, md: 4 }}>
            {[
              {
                icon: <Heart size={40} />,
                title: 'Resonanz',
                subtitle: 'Entdecke die energetische Verbindung zwischen zwei Menschen.',
                description: 'Warum fühlt sich diese Person so vertraut an – oder so herausfordernd? Hier siehst du, welche Frequenzen sich gegenseitig verstärken.',
              },
              {
                icon: <Sparkles size={40} />,
                title: 'Goldadern',
                subtitle: 'Sieh die unsichtbaren Linien der Verbindung.',
                description: 'Goldadern zeigen dir, wo ihr euch auf Seelenebene ergänzt – dort liegt euer größtes Wachstumspotenzial.',
              },
              {
                icon: <Eye size={40} />,
                title: 'Bewusstsein',
                subtitle: 'Verstehe, was zwischen euch wirklich passiert.',
                description: 'Du erkennst blinde Flecken, Triggerpunkte und Dynamiken, die ihr sonst nur im Streit oder Drama erlebt.',
              },
              {
                icon: <Zap size={40} />,
                title: 'Transformation',
                subtitle: 'Erkenne die energetische Sprache, die euch verbindet.',
                description: 'Wenn du verstehst, wie eure Energie zusammenwirkt, kannst du bewusster entscheiden: Wo will ich heilen, wachsen, loslassen?',
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
                      minHeight: '100%',
                      height: '100%',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        borderColor: '#F29F05',
                        boxShadow: '0 8px 25px rgba(242, 159, 5, 0.25)',
                        background: 'rgba(242, 159, 5, 0.08)',
                      },
                    }}
                  >
                    {/* ✨ PREMIUM: Glow-Circle für Icon */}
                    <Box sx={{ mb: { xs: 3, md: 4 }, display: 'flex', justifyContent: 'center' }}>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box sx={{
                          width: { xs: 90, md: 110 },
                          height: { xs: 90, md: 110 },
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.4), rgba(140, 29, 4, 0.3))',
                          border: '4px solid rgba(242, 159, 5, 0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 40px rgba(242, 159, 5, 0.5), 0 8px 30px rgba(242, 159, 5, 0.4)',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            inset: -8,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.2))',
                            filter: 'blur(12px)',
                            zIndex: -1,
                            animation: 'pulse 2s ease-in-out infinite',
                            '@keyframes pulse': {
                              '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
                              '50%': { opacity: 1, transform: 'scale(1.1)' }
                            }
                          }
                        }}>
                          <Box sx={{ color: '#F29F05', transform: { xs: 'scale(1)', md: 'scale(1.15)' } }}>
                            {feature.icon}
                          </Box>
                        </Box>
                      </motion.div>
                    </Box>
                    <Typography variant="h5" sx={{ color: '#fff', mb: 2.5, fontWeight: 700 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2, fontWeight: 600, maxWidth: '90%', mx: 'auto' }}>
                      {feature.subtitle}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.7, maxWidth: '90%', mx: 'auto' }}>
                      {feature.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Story-Block "Was ist The Connection Key?" */}
        <Box sx={{ mb: 12 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* ✨ PREMIUM: Section-Header */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 3,
              mb: { xs: 6, md: 8 },
              position: 'relative'
            }}>
              <Box sx={{
                flex: 1,
                height: 2,
                background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5))',
                borderRadius: 1
              }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Key size={28} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '1.8rem', md: '2.8rem' },
                  }}
                >
                  Was ist The Connection Key?
                </Typography>
                <Key size={28} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
              </Box>
              <Box sx={{
                flex: 1,
                height: 2,
                background: 'linear-gradient(90deg, rgba(242, 159, 5, 0.5), transparent)',
                borderRadius: 1
              }} />
            </Box>

            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.12) 0%, rgba(140, 29, 4, 0.08) 100%)',
                backdropFilter: 'blur(25px)',
                border: '2px solid rgba(242, 159, 5, 0.4)',
                borderRadius: 4,
                p: { xs: 3, sm: 4, md: 6 },
                position: 'relative',
                overflow: 'hidden',
                maxWidth: { xs: '100%', md: 760 },
                mx: 'auto',
                px: { xs: 3, md: 6 },
                boxShadow: '0 12px 40px rgba(242, 159, 5, 0.25)',
              }}
            >
              {/* Visuelle Elemente im Hintergrund */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(242, 159, 5, 0.1), transparent)',
                  filter: 'blur(40px)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -50,
                  left: -50,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(140, 29, 4, 0.1), transparent)',
                  filter: 'blur(40px)',
                }}
              />

              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.98)',
                    mb: 3,
                    lineHeight: 1.6,
                    fontSize: { xs: '1rem', md: '1.15rem' },
                    fontStyle: 'italic',
                  }}
                >
                  Stell dir vor, zwischen zwei Menschen gibt es eine Art <strong>energetische Landkarte</strong>.
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.95)',
                    mb: 3,
                    lineHeight: 1.6,
                    fontSize: { xs: '1rem', md: '1.1rem' },
                  }}
                >
                  Manche Wege sind leicht und fließend – andere führen durch alte Wunden, Muster und Trigger.
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.98)',
                    mb: 4,
                    lineHeight: 1.6,
                    fontSize: { xs: '1rem', md: '1.15rem' },
                    fontWeight: 600,
                  }}
                >
                  Der <strong style={{ color: '#F29F05' }}>Connection Key</strong> macht genau diese Landkarte sichtbar.
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.95)',
                    mb: 3,
                    lineHeight: 1.6,
                    fontSize: { xs: '1rem', md: '1.1rem' },
                  }}
                >
                  Er zeigt dir die Resonanz zwischen zwei Menschen – auf Basis des Human Design Systems. Du siehst,
                </Typography>

                <Box component="ul" sx={{ pl: 4, mb: 3, color: 'rgba(255, 255, 255, 0.9)' }}>
                  <li style={{ marginBottom: '0.5rem', lineHeight: 1.8 }}>
                    wo ihr euch gegenseitig stärkt,
                  </li>
                  <li style={{ marginBottom: '0.5rem', lineHeight: 1.8 }}>
                    wo ihr euch triggert,
                  </li>
                  <li style={{ marginBottom: '0.5rem', lineHeight: 1.8 }}>
                    und wo eure gemeinsame Entwicklung liegt.
                  </li>
                </Box>

                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.95)',
                    mb: 3,
                    lineHeight: 1.9,
                    fontSize: { xs: '1rem', md: '1.15rem' },
                    fontWeight: 600,
                  }}
                >
                  Es geht <strong>nicht darum, ob ihr „perfekt zueinander passt"</strong>.
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.95)',
                    mb: 3,
                    lineHeight: 1.9,
                    fontSize: { xs: '1rem', md: '1.15rem' },
                    fontWeight: 600,
                  }}
                >
                  Sondern darum zu verstehen, <strong>was entsteht, wenn ihr euch begegnet.</strong>
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    lineHeight: 1.9,
                    fontSize: { xs: '1rem', md: '1.15rem' },
                    fontStyle: 'italic',
                  }}
                >
                  Ein Raum öffnet sich. Ein Tor beginnt zu pulsieren.
                  <br />
                  Das ist Resonanz – der Moment, in dem Begegnung dich innerlich verändert.
                </Typography>
              </Box>
            </Card>
          </motion.div>
        </Box>

        {/* Prozess-Section "So funktioniert's" */}
        <Box sx={{ mb: 12 }}>
          {/* ✨ PREMIUM: Section-Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 3,
            mb: { xs: 6, md: 8 },
            position: 'relative'
          }}>
            <Box sx={{
              flex: 1,
              height: 2,
              background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5))',
              borderRadius: 1
            }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Target size={28} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.8rem', md: '2.8rem' },
                }}
              >
                So funktioniert's
              </Typography>
              <Target size={28} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
            </Box>
            <Box sx={{
              flex: 1,
              height: 2,
              background: 'linear-gradient(90deg, rgba(242, 159, 5, 0.5), transparent)',
              borderRadius: 1
            }} />
          </Box>

          <Grid container spacing={{ xs: 3, md: 4 }} sx={{ overflow: 'visible', position: 'relative' }}>
            {[
              {
                step: 1,
                icon: <Calendar size={40} />,
                title: 'Daten eingeben',
                description: 'Du gibst die Geburtsdaten von dir und der anderen Person ein. Das ist die Basis für eure energetische Analyse.',
              },
              {
                step: 2,
                icon: <CheckCircle size={40} />,
                title: 'Session buchen',
                description: 'Wähle dein Paket und buche deine Connection Key Session mit einem unserer zertifizierten Coaches.',
              },
              {
                step: 3,
                icon: <Video size={40} />,
                title: 'Live-Analyse',
                description: 'In einer 60–90-minütigen Session geht dein Coach eure Resonanz im Detail durch – verständlich, nahbar, auf dich angewendet.',
              },
              {
                step: 4,
                icon: <FileText size={40} />,
                title: 'Ergebnis erhalten',
                description: 'Du erhältst eine ausführliche PDF-Analyse mit allen Goldadern, Toren und Resonanzpunkten – zum Nachlesen und Vertiefen.',
              },
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index} sx={{ overflow: 'visible' }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  style={{ overflow: 'visible' }}
                >
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.12) 0%, rgba(140, 29, 4, 0.08) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: '2px solid rgba(242, 159, 5, 0.3)',
                      borderRadius: 3,
                      p: 4,
                      minHeight: '100%',
                      height: '100%',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'visible',
                      boxShadow: '0 6px 24px rgba(242, 159, 5, 0.2)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        borderColor: 'rgba(242, 159, 5, 0.5)',
                        boxShadow: '0 12px 35px rgba(242, 159, 5, 0.35)',
                      },
                    }}
                  >
                    {/* ✨ PREMIUM: Größerer Step-Circle mit Glow */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -30,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 900,
                        fontSize: '1.8rem',
                        boxShadow: '0 0 30px rgba(242, 159, 5, 0.7), 0 8px 25px rgba(242, 159, 5, 0.5)',
                        border: '4px solid rgba(11, 10, 15, 0.9)',
                        zIndex: 10,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          inset: -6,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.4), rgba(140, 29, 4, 0.3))',
                          filter: 'blur(10px)',
                          zIndex: -1,
                        }
                      }}
                    >
                      {item.step}
                    </Box>
                    {/* ✨ PREMIUM: Glow-Circle für Icon */}
                    <Box sx={{ mb: 3, mt: 4, display: 'flex', justifyContent: 'center' }}>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.4), rgba(140, 29, 4, 0.3))',
                          border: '3px solid rgba(242, 159, 5, 0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 0 30px rgba(242, 159, 5, 0.4)',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            inset: -6,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.2))',
                            filter: 'blur(8px)',
                            zIndex: -1,
                          }
                        }}>
                          <Box sx={{ color: '#F29F05' }}>
                            {item.icon}
                          </Box>
                        </Box>
                      </motion.div>
                    </Box>
                    <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 700 }}>
                      {item.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.7)', 
                        lineHeight: 1.7,
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Storytelling-Block "Was Menschen beim Connection Key erleben" */}
        <Box sx={{ mb: 12 }}>
          {/* ✨ PREMIUM: Section-Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 3,
            mb: { xs: 4, md: 6 },
            position: 'relative'
          }}>
            <Box sx={{
              flex: 1,
              height: 2,
              background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5))',
              borderRadius: 1
            }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Quote size={28} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.8rem', md: '2.8rem' },
                }}
              >
                Was Menschen beim Connection Key erleben
              </Typography>
              <Quote size={28} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
            </Box>
            <Box sx={{
              flex: 1,
              height: 2,
              background: 'linear-gradient(90deg, rgba(242, 159, 5, 0.5), transparent)',
              borderRadius: 1
            }} />
          </Box>

          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
              mb: 6,
              maxWidth: 700,
              mx: 'auto',
              fontSize: '1.1rem',
            }}
          >
            Hinter jeder Analyse steckt eine echte Geschichte.
            <br />
            Hier ein paar typische Erfahrungen, die Menschen nach ihrer Session teilen:
          </Typography>

          <Grid container spacing={{ xs: 3, md: 4 }}>
            {[
              {
                quote: 'Plötzlich ergab alles Sinn.',
                text: 'Wir haben verstanden, warum wir uns so stark anziehen – und warum es immer wieder an denselben Stellen knallt. Das Reading hat unsere Konflikte nicht „weggezaubert", aber uns eine völlig neue Perspektive gegeben.',
              },
              {
                quote: 'Es war wie eine energetische Landkarte unserer Beziehung.',
                text: 'Ich habe zum ersten Mal klar gesehen, wo meine Themen sind und wo seine. Seitdem kann ich viel bewusster reagieren, statt in alte Muster zu rutschen.',
              },
              {
                quote: 'Ich konnte Frieden schließen.',
                text: 'Das Connection Key Reading mit einer Person aus meiner Vergangenheit hat mir geholfen, loszulassen. Ich verstand, warum diese Verbindung so intensiv war – und wofür sie in meinem Leben stand.',
              },
              {
                quote: 'Wir nutzen den Connection Key jetzt als Wachstumskompass.',
                text: 'Statt Schuld zu suchen, schauen wir: Was will hier gerade heilen? Das hat unsere Beziehung komplett verändert.',
              },
            ].map((testimonial, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.12) 0%, rgba(140, 29, 4, 0.08) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: '2px solid rgba(242, 159, 5, 0.3)',
                      borderRadius: 4,
                      p: { xs: 3, sm: 4, md: 5 },
                      height: '100%',
                      minHeight: '100%',
                      position: 'relative',
                      boxShadow: '0 6px 24px rgba(242, 159, 5, 0.2)',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        borderColor: 'rgba(242, 159, 5, 0.5)',
                        boxShadow: '0 12px 35px rgba(242, 159, 5, 0.3)',
                      },
                      transition: 'all 0.3s ease',
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
                        lineHeight: 1.8,
                        pl: 6,
                      }}
                    >
                      {testimonial.text}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Penta-Sektion */}
        <Box sx={{ mb: 12 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* ✨ PREMIUM: Section-Header */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 3,
              mb: { xs: 6, md: 8 },
              position: 'relative'
            }}>
              <Box sx={{
                flex: 1,
                height: 2,
                background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5))',
                borderRadius: 1
              }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Pentagon size={28} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '1.8rem', md: '2.8rem' },
                  }}
                >
                  Connection Key für Familien & Teams
                </Typography>
                <Pentagon size={28} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
              </Box>
              <Box sx={{
                flex: 1,
                height: 2,
                background: 'linear-gradient(90deg, rgba(242, 159, 5, 0.5), transparent)',
                borderRadius: 1
              }} />
            </Box>

            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
                backdropFilter: 'blur(25px)',
                border: '2px solid rgba(242, 159, 5, 0.4)',
                borderRadius: 4,
                p: { xs: 4, md: 6 },
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center',
                boxShadow: '0 12px 40px rgba(242, 159, 5, 0.25)',
              }}
            >
              <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
                <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      mb: 3,
                      lineHeight: 1.9,
                      fontSize: { xs: '1rem', md: '1.15rem' },
                    }}
                  >
                    Manche Verbindungen sind komplexer als „nur" zwei Menschen.
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.95)',
                      mb: 3,
                      lineHeight: 1.9,
                      fontSize: { xs: '1rem', md: '1.15rem' },
                      fontWeight: 600,
                    }}
                  >
                    Mit der <strong style={{ color: '#F29F05' }}>Penta-Analyse</strong> machen wir die Resonanz in <strong>Familien, Teams und Gruppen</strong> sichtbar.
                  </Typography>

                  <Box component="ul" sx={{ pl: 4, mb: 3, color: 'rgba(255, 255, 255, 0.9)' }}>
                    <li style={{ marginBottom: '0.5rem', lineHeight: 1.8 }}>
                      Wer bringt welche Energie mit?
                    </li>
                    <li style={{ marginBottom: '0.5rem', lineHeight: 1.8 }}>
                      Wo entstehen Spannungen?
                    </li>
                    <li style={{ marginBottom: '0.5rem', lineHeight: 1.8 }}>
                      Wer übernimmt naturally welche Rolle im Feld?
                    </li>
                  </Box>

                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      mb: 4,
                      lineHeight: 1.9,
                      fontSize: { xs: '1rem', md: '1.15rem' },
                    }}
                  >
                    Ob Patchwork-Familie, Business-Team oder Seelen-Clique –
                    die Penta-Analyse zeigt dir, <strong>wie ihr als Feld funktioniert</strong>.
                  </Typography>

                  <Button
                    component={Link}
                    href="/connection-key/penta"
                    variant="outlined"
                    size="large"
                    endIcon={<ArrowRight size={20} />}
                    sx={{
                      borderColor: 'rgba(242, 159, 5, 0.5)',
                      color: '#F29F05',
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      fontSize: '1rem',
                      borderRadius: 3,
                      borderWidth: 2,
                      '&:hover': {
                        borderColor: '#F29F05',
                        background: 'rgba(242, 159, 5, 0.1)',
                        borderWidth: 2,
                      },
                    }}
                  >
                    Mehr über Penta & Gruppen-Readings erfahren
                  </Button>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative',
                      height: { xs: 300, md: 400 },
                    }}
                  >
                    {/* Penta-Visualisierung */}
                    <Box
                      sx={{
                        position: 'relative',
                        width: { xs: 250, md: 350 },
                        height: { xs: 250, md: 350 },
                      }}
                    >
                      {/* Fünfeck */}
                      <Box
                        component="svg"
                        viewBox="0 0 200 200"
                        sx={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          top: 0,
                          left: 0,
                        }}
                      >
                        <polygon
                          points="100,20 180,70 180,130 100,180 20,130 20,70"
                          fill="none"
                          stroke="rgba(242, 159, 5, 0.1)"
                          strokeWidth="2"
                        />
                        {/* Verbindungslinien zu den Punkten */}
                        <line x1="100" y1="100" x2="100" y2="20" stroke="rgba(242, 159, 5, 0.1)" strokeWidth="1" />
                        <line x1="100" y1="100" x2="180" y2="70" stroke="rgba(242, 159, 5, 0.1)" strokeWidth="1" />
                        <line x1="100" y1="100" x2="180" y2="130" stroke="rgba(242, 159, 5, 0.1)" strokeWidth="1" />
                        <line x1="100" y1="100" x2="100" y2="180" stroke="rgba(242, 159, 5, 0.1)" strokeWidth="1" />
                        <line x1="100" y1="100" x2="20" y2="130" stroke="rgba(242, 159, 5, 0.1)" strokeWidth="1" />
                        <line x1="100" y1="100" x2="20" y2="70" stroke="rgba(242, 159, 5, 0.1)" strokeWidth="1" />
                        {/* Punkte */}
                        {[
                          { x: 100, y: 20 },
                          { x: 180, y: 70 },
                          { x: 180, y: 130 },
                          { x: 100, y: 180 },
                          { x: 20, y: 130 },
                          { x: 20, y: 70 },
                        ].map((point, i) => (
                          <circle
                            key={i}
                            cx={point.x}
                            cy={point.y}
                            r="8"
                            fill="#F29F05"
                            opacity="0.3"
                          />
                        ))}
                        {/* Zentrum */}
                        <circle cx="100" cy="100" r="12" fill="#F29F05" opacity="0.4" />
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </motion.div>
        </Box>

        {/* Coaches-Sektion */}
        <Box sx={{ mb: 12 }}>
          {/* ✨ PREMIUM: Section-Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 3,
            mb: { xs: 4, md: 6 },
            position: 'relative'
          }}>
            <Box sx={{
              flex: 1,
              height: 2,
              background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5))',
              borderRadius: 1
            }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Users size={28} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '1.8rem', md: '2.8rem' },
                }}
              >
                Unsere Connection Key Coaches
              </Typography>
              <Users size={28} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
            </Box>
            <Box sx={{
              flex: 1,
              height: 2,
              background: 'linear-gradient(90deg, rgba(242, 159, 5, 0.5), transparent)',
              borderRadius: 1
            }} />
          </Box>

          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              textAlign: 'center',
              mb: 6,
              maxWidth: 700,
              mx: 'auto',
              fontSize: '1.1rem',
            }}
          >
            Unsere zertifizierten Experten führen dich durch deine Connection Key Analyse und helfen dir, die energetische Verbindung zwischen euch zu verstehen – klar, bodenständig und mit Herz.
          </Typography>

          <Grid container spacing={{ xs: 3, md: 4 }}>
            {[
              {
                name: 'Heiko',
                title: 'Human Design Experte & Life Coach',
                avatar: '/images/heiko.jpg',
                story: 'Heiko begleitet seit über 8 Jahren Menschen dabei, ihre energetischen Muster zu verstehen und im Alltag zu leben.',
                specializations: [
                  'Beziehung & Partnerschaft',
                  'Bewusste Trennung & Loslassen',
                  'Business-Resonanz (Co-Founder, Teams)',
                ],
              },
              {
                name: 'Janine',
                title: 'Human Design Beraterin & Therapeutin',
                avatar: '/images/Jani.jpg',
                story: 'Janine ist eine erfahrene Human Design Beraterin mit psychologischem Hintergrund. Sie spezialisiert sich auf Beziehungs- und Resonanzdynamiken.',
                specializations: [
                  'Beziehung & Partnerschaft',
                  'Familien-Dynamiken',
                  'Heilung & Transformation',
                ],
              },
              {
                name: 'Elisabeth',
                title: 'Human Design Master & Business Coach',
                avatar: '/images/elisabeth.jpg',
                story: 'Elisabeth hilft dir dabei, eure Resonanz zu verstehen und diese im beruflichen und privaten Kontext zu nutzen.',
                specializations: [
                  'Business-Resonanz',
                  'Team-Dynamik',
                  'Leadership & Führung',
                ],
              },
            ].map((coach, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card
                    sx={{
                      background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.12) 0%, rgba(140, 29, 4, 0.08) 100%)',
                      backdropFilter: 'blur(20px)',
                      border: '2px solid rgba(242, 159, 5, 0.3)',
                      borderRadius: 4,
                      p: 4,
                      minHeight: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      boxShadow: '0 6px 24px rgba(242, 159, 5, 0.2)',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        borderColor: 'rgba(242, 159, 5, 0.5)',
                        boxShadow: '0 12px 35px rgba(242, 159, 5, 0.35)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      {/* ✨ PREMIUM: Glow-Circle für Avatar */}
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box
                          sx={{
                            width: 90,
                            height: 90,
                            borderRadius: '50%',
                            background: coach.avatar 
                              ? 'transparent'
                              : 'linear-gradient(135deg, #F29F05, #8C1D04)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.2rem',
                            fontWeight: 700,
                            color: 'white',
                            mr: 2,
                            flexShrink: 0,
                            boxShadow: '0 0 30px rgba(242, 159, 5, 0.6), 0 8px 25px rgba(242, 159, 5, 0.4)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              inset: -6,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.4), rgba(140, 29, 4, 0.3))',
                              filter: 'blur(10px)',
                              zIndex: -1,
                            }
                          }}
                        >
                          {coach.avatar ? (
                            <Image
                              src={coach.avatar}
                              alt={coach.name}
                              width={90}
                              height={90}
                              style={{
                                objectFit: 'cover',
                                borderRadius: '50%',
                              }}
                            />
                          ) : (
                            coach.name.charAt(0)
                          )}
                        </Box>
                      </motion.div>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                          {coach.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {coach.title}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3, lineHeight: 1.7 }}>
                      {coach.story}
                    </Typography>

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
                      Spezialisiert auf:
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                      {coach.specializations.map((spec, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            background: 'rgba(242, 159, 5, 0.1)',
                            border: '1px solid rgba(242, 159, 5, 0.2)',
                          }}
                        >
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.9rem' }}>
                            • {spec}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Box sx={{ mt: 'auto' }}>
                      <Button
                        component={Link}
                        href="/connection-key/booking"
                        variant="contained"
                        fullWidth
                        sx={{
                          background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                          color: 'white',
                          fontWeight: 700,
                          py: 2,
                          borderRadius: 2,
                          boxShadow: '0 4px 15px rgba(242, 159, 5, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(242, 159, 5, 0.4)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        Session buchen
                      </Button>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Finaler CTA */}
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
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              Bereit zu sehen, was wirklich zwischen euch schwingt?
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
              Egal, ob ihr am Anfang einer Verbindung steht, mitten in einer Krise steckt oder eine vergangene Beziehung verstehen möchtest – der Connection Key zeigt dir, was deine Seele längst spürt.
            </Typography>

            <Button
              component={Link}
              href="/connection-key/booking"
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
              <Key size={20} style={{ marginRight: 8 }} />
              Finde eure Resonanz – jetzt starten
            </Button>

            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <Shield size={16} />
              Deine Daten sind sicher. Wir arbeiten vertraulich und wertschätzend mit jeder Verbindung.
            </Typography>
          </motion.div>
        </Box>

        {/* Community Verweis */}
        <Box sx={{ mt: { xs: 8, md: 12 }, mb: 6 }}>
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
                textAlign: 'center',
              }}
            >
              <Box sx={{ mb: 3 }}>
                <Users size={48} color="#F29F05" style={{ marginBottom: 16 }} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: 'white',
                  fontSize: { xs: '1.5rem', md: '2rem' },
                }}
              >
                Kennst du schon unsere Community?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 4,
                  maxWidth: 600,
                  mx: 'auto',
                  lineHeight: 1.8,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                }}
              >
                Tausche dich mit anderen aus, teile deine Erfahrungen und entdecke neue Perspektiven auf Resonanz und Verbindung.
              </Typography>
              <Button
                component={Link}
                href="/features"
                variant="contained"
                size="large"
                endIcon={<ArrowRight size={20} />}
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
                Jetzt mehr erfahren
              </Button>
            </Card>
          </motion.div>
        </Box>
      </Box>
      </Container>
    </Box>
  );
}

// Hauptkomponente - öffentlich zugänglich
export default function ConnectionKeyPage() {
  return <ConnectionKeyContent />;
}
