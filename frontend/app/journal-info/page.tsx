"use client";
import React, { useState } from 'react';
import { Container, Typography, Card, CardContent, Box, Button, Paper, Chip, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { Star, Sparkles, ArrowRight, CheckCircle, Eye, Brain, Heart, Lightbulb, Target } from 'lucide-react';
import Link from 'next/link';
import PublicHeader from '@/app/components/PublicHeader';
import Logo from '@/app/components/Logo';

export default function JournalInfoPage() {
  const [activeSection, setActiveSection] = useState(0);

  const awarenessFeatures = [
    {
      icon: <Eye size={32} />,
      title: "Tägliche Wahrnehmung",
      description: "Halte fest, was sich zeigt: Gedanken, Gefühle, Körperimpulse, Erkenntnisse aus deinem Design."
    },
    {
      icon: <Brain size={32} />,
      title: "Energetische Entwicklung beobachten",
      description: "Nicht linear. Nicht messbar. Sondern spürbar – in Rückblicken, Wiederholungen, Veränderungen."
    },
    {
      icon: <Target size={32} />,
      title: "Ausrichtung statt Ziele",
      description: "Du setzt keine Ziele im klassischen Sinn. Du erinnerst dich an das, was sich für dich stimmig anfühlt."
    },
    {
      icon: <Heart size={32} />,
      title: "Tiefe Selbstreflexion",
      description: "Nicht analysierend. Sondern beobachtend – aus der Rolle des inneren Zeugen."
    }
  ];

  const awarenessReasons = [
    "Weil Bewusstsein sich nicht hetzen lässt",
    "Weil Entwicklung nicht im Außen sichtbar beginnt",
    "Weil dein Human Design sich verkörpert, nicht \"abgearbeitet\" wird",
    "Weil Klarheit entsteht, wenn du dich selbst wahrnimmst",
    "Weil echte Veränderung aus Beobachtung, nicht aus Druck entsteht"
  ];

  const awarenessFor = [
    "dich selbst tiefer verstehen willst, ohne dich zu optimieren",
    "dein Design erleben willst, statt es nur zu wissen",
    "Muster erkennen möchtest, ohne sie zu verurteilen",
    "dir selbst zuhören willst – jenseits von Leistung"
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      position: 'relative',
      background: `
        radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
        radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
        radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
        linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
      `,
      backgroundAttachment: 'fixed',
      overflow: 'hidden'
    }}>
      {/* Floating Stars Animation */}
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
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 4 }}>
              <Star size={48} color="#F29F05" />
              <Typography variant="h1" sx={{
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '4rem' },
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(242, 159, 5, 0.3)'
              }}>
                Dein Bewusstseinsfeld
              </Typography>
              <Star size={48} color="#F29F05" />
            </Box>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography variant="h5" sx={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.6,
                mb: 2
              }}>
                Ein Raum für Wahrnehmung, Erinnerung und innere Klarheit
              </Typography>
            </motion.div>
          </Box>
        </motion.div>

        {/* Was ist das Bewusstseinsfeld */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card sx={{
            background: 'rgba(242, 159, 5, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(242, 159, 5, 0.15)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            mb: 6
          }}>
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Sparkles size={48} color="#F29F05" style={{ marginBottom: 16 }} />
                <Typography variant="h4" sx={{ 
                  fontWeight: 600, 
                  mb: 3,
                  color: 'rgba(255,255,255,0.95)',
                  fontStyle: 'italic',
                  fontSize: { xs: '1.1rem', md: '1.3rem' }
                }}>
                  Dies ist kein Journal im klassischen Sinn.<br />
                  Und auch kein Tool, das dich misst oder bewertet.
                </Typography>
                <Typography sx={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: { xs: '1rem', md: '1.15rem' },
                  lineHeight: 1.9,
                  maxWidth: 900,
                  mx: 'auto',
                  mt: 3
                }}>
                  Dein Bewusstseinsfeld ist ein innerer Raum,<br />
                  in dem du festhältst, was du wahrnimmst,<br />
                  nicht was du &quot;erreichst&quot;.
                </Typography>
                <Typography sx={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: { xs: '0.95rem', md: '1.1rem' },
                  lineHeight: 1.8,
                  maxWidth: 900,
                  mx: 'auto',
                  mt: 3,
                  fontStyle: 'italic'
                }}>
                  Hier sammelst du Eindrücke, Aha-Momente, Widerstände, Klarheiten.<br />
                  Nicht, um besser zu werden –<br />
                  sondern um dich selbst bewusster zu erleben.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Was hier geschieht */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h3" sx={{ 
            textAlign: 'center', 
            fontWeight: 700, 
            mb: 6,
            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Was hier geschieht
          </Typography>
          
          <Grid container spacing={4} sx={{ mb: 8 }}>
            {awarenessFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card sx={{
                    background: 'rgba(242, 159, 5, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(242, 159, 5, 0.15)',
                    borderRadius: 3,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      borderColor: 'rgba(242, 159, 5, 0.4)',
                      boxShadow: '0 8px 25px rgba(242, 159, 5, 0.25)'
                    }
                  }}>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.2), rgba(140, 29, 4, 0.2))',
                        border: '1px solid rgba(242, 159, 5, 0.3)',
                        margin: '0 auto 20px',
                        color: '#F29F05'
                      }}>
                        {feature.icon}
                      </Box>
                      <Typography variant="h5" sx={{
                        color: '#fff',
                        fontWeight: 600,
                        mb: 2
                      }}>
                        {feature.title}
                      </Typography>
                      <Typography sx={{
                        color: 'rgba(255,255,255,0.8)',
                        lineHeight: 1.6
                      }}>
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Warum dein Bewusstseinsfeld wichtig ist */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card sx={{
            background: 'rgba(242, 159, 5, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(242, 159, 5, 0.15)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            mb: 6
          }}>
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Typography variant="h3" sx={{ 
                textAlign: 'center', 
                fontWeight: 700, 
                mb: 4,
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Warum dein Bewusstseinsfeld wichtig ist
              </Typography>
              <Grid container spacing={3}>
                {awarenessReasons.map((reason, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                        <CheckCircle size={24} color="#F29F05" style={{ marginTop: 2, flexShrink: 0 }} />
                        <Typography sx={{
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          lineHeight: 1.6
                        }}>
                          {reason}
                        </Typography>
                      </Box>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* Dieser Raum ist für dich */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card sx={{
            background: 'rgba(242, 159, 5, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(242, 159, 5, 0.15)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            mb: 6
          }}>
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Typography variant="h3" sx={{ 
                textAlign: 'center', 
                fontWeight: 700, 
                mb: 4,
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Dieser Raum ist für dich, wenn du…
              </Typography>
              <Grid container spacing={3}>
                {awarenessFor.map((item, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                        <Lightbulb size={24} color="#F29F05" style={{ marginTop: 2, flexShrink: 0 }} />
                        <Typography sx={{
                          color: 'rgba(255,255,255,0.9)',
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          lineHeight: 1.6
                        }}>
                          {item}
                        </Typography>
                      </Box>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Card sx={{
            background: 'rgba(242, 159, 5, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(242, 159, 5, 0.15)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            p: { xs: 4, md: 6 },
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ 
              color: 'rgba(255,255,255,0.95)', 
              fontWeight: 600, 
              mb: 3,
              fontSize: { xs: '1.3rem', md: '1.6rem' },
              fontStyle: 'italic'
            }}>
              Bereit, dich zu erinnern?
            </Typography>
            <Typography variant="h6" sx={{ 
              color: 'rgba(255,255,255,0.85)', 
              mb: 4,
              fontSize: { xs: '1rem', md: '1.15rem' },
              lineHeight: 1.8,
              maxWidth: 700,
              mx: 'auto'
            }}>
              Nicht an das, was du sein solltest.<br />
              Sondern an das, was du bereits bist.
            </Typography>
            <Button
              component={Link}
              href="/journal"
              variant="contained"
              size="large"
              endIcon={<Sparkles size={24} />}
              sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                color: 'white',
                fontWeight: 700,
                px: { xs: 4, md: 6 },
                py: 2.5,
                borderRadius: 3,
                fontSize: { xs: '1rem', md: '1.2rem' },
                boxShadow: '0 4px 20px rgba(242, 159, 5, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 30px rgba(242, 159, 5, 0.5)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              ✨ Öffne dein Bewusstseinsfeld
            </Button>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}
