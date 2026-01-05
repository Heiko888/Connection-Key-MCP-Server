'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Card, CardContent, Grid, Button, Chip, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import PageLayout from '../components/PageLayout';
import { UsersRound, Sparkles, CheckCircle, ArrowRight, Target, AlertCircle, TrendingUp, Heart } from 'lucide-react';

export default function PentaBookingPage() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        backgroundAttachment: 'fixed',
        position: 'relative',
        overflow: 'hidden',
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

      <PageLayout activePage="dashboard" showLogo={true} maxWidth="lg">
        <Box sx={{ position: 'relative', zIndex: 2, py: { xs: 2, md: 4 } }}>
          {/* Hero Section */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mb: 3,
                color: '#F29F05'
              }}>
                <UsersRound size={64} />
              </Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  color: '#FFFFFF',
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                ✨ Penta Resonanzanalyse
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 600,
                  mb: 3,
                  fontSize: { xs: '1.25rem', md: '1.5rem' }
                }}
              >
                Entdecke die energetische Wahrheit eurer Gruppe
              </Typography>
            </motion.div>
          </Box>

          {/* Main Content Card */}
          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: 4,
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(242, 159, 5, 0.3)',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
              p: { xs: 3, md: 5 },
              mb: 4
            }}
          >
            {/* Einführung */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 1.8,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  mb: 4
                }}
              >
                Eine Gruppe ist mehr als mehrere Menschen – sie bildet ein eigenes energetisches Feld.
                <strong style={{ color: '#F29F05' }}> Dieses Feld nennt man Penta.</strong>
              </Typography>

              <Box sx={{
                p: 3,
                background: 'rgba(242, 159, 5, 0.1)',
                borderRadius: 3,
                border: '1px solid rgba(242, 159, 5, 0.3)',
                mb: 4
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#F29F05',
                    fontWeight: 700,
                    mb: 2,
                    fontSize: { xs: '1.1rem', md: '1.3rem' }
                  }}
                >
                  Hier entsteht ein drittes, unsichtbares System, das beeinflusst:
                </Typography>
                <List sx={{ pl: 0 }}>
                  {[
                    'wie ihr miteinander kommuniziert',
                    'warum bestimmte Konflikte immer wieder auftauchen',
                    'wer welche Rolle unbewusst übernimmt',
                    'warum manche Gruppen harmonisch funktionieren – und andere nie'
                  ].map((item, index) => (
                    <ListItem key={index} sx={{ pl: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckCircle size={20} color="#F29F05" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={
                          <Typography sx={{ 
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: { xs: '0.95rem', md: '1rem' }
                          }}>
                            {item}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 1.8,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  textAlign: 'center',
                  fontStyle: 'italic',
                  mb: 4
                }}
              >
                Die Penta-Analyse zeigt dir dieses Feld <strong style={{ color: '#F29F05' }}>sichtbar, präzise und direkt anwendbar.</strong>
              </Typography>
            </motion.div>
          </Paper>

          {/* Was die Analyse dir zeigt */}
          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: 4,
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(242, 159, 5, 0.3)',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
              p: { xs: 3, md: 5 },
              mb: 4
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#FFFFFF',
                  fontWeight: 700,
                  mb: 4,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  textAlign: 'center'
                }}
              >
                🔍 Was die Analyse dir zeigt
              </Typography>

              <Grid container spacing={3}>
                {[
                  {
                    number: '1️⃣',
                    title: 'Rollen & natürliche Positionen',
                    items: [
                      'Wer bringt welche Energie in die Gruppe?',
                      'Wer führt? Wer stabilisiert? Wer blockiert?'
                    ],
                    icon: Target,
                    color: '#F29F05'
                  },
                  {
                    number: '2️⃣',
                    title: 'Verdeckte Spannungen & Konfliktfelder',
                    items: [
                      'Welche Energien fehlen?',
                      'Wo entsteht Druck oder Frust?',
                      'Warum wiederholen sich bestimmte Muster?'
                    ],
                    icon: AlertCircle,
                    color: '#8C1D04'
                  },
                  {
                    number: '3️⃣',
                    title: 'Gruppendynamik & Flow-Punkte',
                    items: [
                      'Wie funktioniert ihr als Einheit?',
                      'Welche Potenziale sind noch ungenutzt?'
                    ],
                    icon: TrendingUp,
                    color: '#F29F05'
                  },
                  {
                    number: '4️⃣',
                    title: 'Handlungsempfehlungen',
                    items: [
                      'Klar. Direkt. Umsetzbar.',
                      'Damit ihr als Team, Familie oder Freundeskreis wieder in Harmonie kommt.'
                    ],
                    icon: Heart,
                    color: '#F29F05'
                  }
                ].map((section, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card sx={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: `2px solid ${section.color}40`,
                      borderRadius: 3,
                      height: '100%',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: `${section.color}80`,
                        boxShadow: `0 8px 24px ${section.color}30`
                      }
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box sx={{ fontSize: '2rem' }}>{section.number}</Box>
                          <Box sx={{ color: section.color }}>
                            <section.icon size={24} />
                          </Box>
                        </Box>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: '#FFFFFF',
                            fontWeight: 700,
                            mb: 2,
                            fontSize: { xs: '1.1rem', md: '1.2rem' }
                          }}
                        >
                          {section.title}
                        </Typography>
                        <List sx={{ pl: 0 }}>
                          {section.items.map((item, itemIndex) => (
                            <ListItem key={itemIndex} sx={{ pl: 0, py: 0.5 }}>
                              <ListItemText 
                                primary={
                                  <Typography sx={{ 
                                    color: 'rgba(255, 255, 255, 0.85)',
                                    fontSize: { xs: '0.9rem', md: '0.95rem' },
                                    lineHeight: 1.6
                                  }}>
                                    {item}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Paper>

          {/* Für welche Gruppen */}
          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: 4,
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(242, 159, 5, 0.3)',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
              p: { xs: 3, md: 5 },
              mb: 4
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#FFFFFF',
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  textAlign: 'center'
                }}
              >
                👥 Für welche Gruppen ist die Penta-Analyse gedacht?
              </Typography>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  'Familiengruppen',
                  'Teams & Arbeitsgruppen',
                  'Freundeskreise',
                  'Business-Partnerschaften ab 3 Personen',
                  'Projektgruppen',
                  'Spirituelle Kreise / Mentoring-Gruppen'
                ].map((group, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Chip
                      label={group}
                      sx={{
                        background: 'rgba(242, 159, 5, 0.15)',
                        color: '#F29F05',
                        border: '1px solid rgba(242, 159, 5, 0.3)',
                        fontWeight: 600,
                        width: '100%',
                        py: 2,
                        fontSize: { xs: '0.85rem', md: '0.9rem' }
                      }}
                    />
                  </Grid>
                ))}
              </Grid>

              <Box sx={{
                p: 3,
                background: 'rgba(242, 159, 5, 0.1)',
                borderRadius: 3,
                border: '1px solid rgba(242, 159, 5, 0.3)',
                textAlign: 'center'
              }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 600,
                    fontSize: { xs: '0.95rem', md: '1rem' }
                  }}
                >
                  <strong style={{ color: '#F29F05' }}>Wichtig:</strong> Eine Penta entsteht ab 3 bis maximal 5 Personen.
                  <br />
                  Für größere Gruppen erstellen wir zusätzliche Felder (funktioniert in deiner App).
                </Typography>
              </Box>
            </motion.div>
          </Paper>

          {/* Was du bekommst */}
          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: 4,
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(242, 159, 5, 0.3)',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
              p: { xs: 3, md: 5 },
              mb: 4
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#FFFFFF',
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  textAlign: 'center'
                }}
              >
                🚀 Was du bekommst
              </Typography>

              <Grid container spacing={2}>
                {[
                  'Vollständige energetische Penta-Auswertung',
                  'Analyse aller beteiligten Charts',
                  'Klare grafische Darstellung der Gruppenenergie',
                  'Konkrete Schritte, wie ihr Balance, Harmonie & Fokus herstellt',
                  'Visuelle Resonanzanalyse + schriftliches Gruppenreading (optional)'
                ].map((item, index) => (
                  <Grid item xs={12} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ 
                        color: '#F29F05',
                        fontSize: '1.5rem',
                        mt: 0.5
                      }}>
                        🔸
                      </Box>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: { xs: '0.95rem', md: '1rem' },
                          lineHeight: 1.7
                        }}
                      >
                        {item}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Paper>

          {/* Warum Penta so wichtig ist */}
          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: 4,
              background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.1) 100%)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(242, 159, 5, 0.4)',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(242, 159, 5, 0.3)',
              p: { xs: 3, md: 5 },
              mb: 4
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#FFFFFF',
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  textAlign: 'center'
                }}
              >
                ❤️ Warum Penta so wichtig ist
              </Typography>

              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  lineHeight: 1.8,
                  mb: 3,
                  textAlign: 'center',
                  fontStyle: 'italic'
                }}
              >
                Viele Gruppen scheitern nicht an den Menschen –<br />
                <strong style={{ color: '#F29F05' }}>sondern an einem Feld, das sie nicht verstehen.</strong>
              </Typography>

              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#F29F05',
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '1.1rem', md: '1.3rem' }
                }}
              >
                Mit der Penta-Analyse erkennst du:
              </Typography>

              <List sx={{ pl: 0 }}>
                {[
                  'warum manche Menschen zusammen funktionieren',
                  'und andere sich energetisch „beißen"',
                  'was du tun kannst, um das Feld in Balance zu bringen',
                  'wie ihr gemeinsam euer Potenzial entfaltet'
                ].map((item, index) => (
                  <ListItem key={index} sx={{ pl: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircle size={20} color="#F29F05" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography sx={{ 
                          color: 'rgba(255, 255, 255, 0.9)',
                          fontSize: { xs: '0.95rem', md: '1rem' },
                          lineHeight: 1.7
                        }}>
                          {item}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </motion.div>
          </Paper>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.2) 0%, rgba(140, 29, 4, 0.15) 100%)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(242, 159, 5, 0.4)',
              borderRadius: 4,
              p: { xs: 4, md: 6 },
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(242, 159, 5, 0.3)'
            }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mb: 3,
                color: '#F29F05'
              }}>
                <Sparkles size={48} />
              </Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  color: '#FFFFFF',
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '1.5rem', md: '2rem' }
                }}
              >
                Bereit, die Energie eurer Gruppe zu entschlüsseln?
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  mb: 4,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  lineHeight: 1.8,
                  maxWidth: '600px',
                  mx: 'auto'
                }}
              >
                Starte jetzt deine Penta Resonanzanalyse und entdecke, wie eure Gruppe wirklich funktioniert.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<ArrowRight size={24} />}
                onClick={() => router.push('/penta/booking')}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white',
                  fontWeight: 700,
                  px: 6,
                  py: 2,
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(242, 159, 5, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 40px rgba(242, 159, 5, 0.5)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                ➡️ Penta-Paket auswählen
              </Button>
            </Card>
          </motion.div>
        </Box>
      </PageLayout>
    </Box>
  );
}

