"use client";
import React, { useState } from 'react';
import { Container, Typography, Card, CardContent, Box, Button, Paper, Chip, Tabs, Tab, Grid, Accordion, AccordionSummary, AccordionDetails, TextField, InputAdornment } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { motion } from 'framer-motion';
import { Search, Brain, Heart, Zap, Eye, Crown, Shield, Target, Star, Circle, ChevronDown, ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Logo from '../components/Logo';

interface Authority {
  id: string;
  name: string;
  germanName: string;
  description: string;
  strategy: string;
  centers: string[];
  keywords: string[];
  decisionProcess: string;
  challenges: string[];
  strengths: string[];
  color: string;
  icon: React.ReactNode;
}

export default function AuthorityPage() {
  const [selectedAuthority, setSelectedAuthority] = useState<Authority | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAuthority, setExpandedAuthority] = useState<string | false>(false);

  const authorities: Authority[] = [
    {
      id: 'sacral',
      name: 'Sacral Authority',
      germanName: 'Sakrale Autorität',
      description: 'Die sakrale Autorität ist die häufigste und natürlichste Entscheidungsmethode. Sie basiert auf der sakralen Antwort - einem inneren "Ja" oder "Nein".',
      strategy: 'Warten auf die sakrale Antwort. Höre auf deine innere Stimme und spüre die Energie in deinem Bauch.',
      centers: ['Sacral Center'],
      keywords: ['Sakrale Antwort', 'Energie', 'Bauchgefühl', 'Ja/Nein', 'Natur'],
      decisionProcess: '1. Stelle dir die Frage\n2. Spüre in deinen Bauch\n3. Warte auf die sakrale Antwort (Ja/Nein)\n4. Vertraue der Antwort',
      challenges: ['Überdenken der Antwort', 'Zweifel an der Intuition', 'Druck von außen', 'Angst vor Fehlern'],
      strengths: ['Schnelle Entscheidungen', 'Natürliche Intuition', 'Zuverlässige Antworten', 'Energische Klarheit'],
      color: '#f59e0b',
      icon: <Zap size={24} />
    },
    {
      id: 'emotional',
      name: 'Emotional Authority',
      germanName: 'Emotionale Autorität',
      description: 'Die emotionale Autorität basiert auf emotionalen Wellen. Entscheidungen müssen durch emotionale Klarheit reifen.',
      strategy: 'Warten auf emotionale Klarheit. Lass deine Emotionen durch ihre Wellen fließen, bevor du entscheidest.',
      centers: ['Solar Plexus Center'],
      keywords: ['Emotionale Wellen', 'Klarheit', 'Reifung', 'Geduld', 'Gefühle'],
      decisionProcess: '1. Erkenne die emotionale Welle\n2. Warte auf Klarheit\n3. Lass die Emotion reifen\n4. Entscheide in Klarheit',
      challenges: ['Ungeduld', 'Druck zu entscheiden', 'Emotionale Überwältigung', 'Angst vor Verpassen'],
      strengths: ['Tiefe Weisheit', 'Emotionale Reife', 'Authentische Entscheidungen', 'Menschliche Verbindung'],
      color: '#ec4899',
      icon: <Heart size={24} />
    },
    {
      id: 'splenic',
      name: 'Splenic Authority',
      germanName: 'Splenische Autorität',
      description: 'Die splenische Autorität ist die schnellste und basiert auf Intuition und Überlebensinstinkt.',
      strategy: 'Vertraue deiner Intuition. Die Antwort kommt sofort und ist zuverlässig.',
      centers: ['Spleen Center'],
      keywords: ['Intuition', 'Überleben', 'Sofort', 'Instinkt', 'Gesundheit'],
      decisionProcess: '1. Höre auf deine Intuition\n2. Vertraue der sofortigen Antwort\n3. Handle entsprechend\n4. Zweifle nicht',
      challenges: ['Zweifel an der Intuition', 'Überdenken', 'Angst vor Fehlern', 'Druck von außen'],
      strengths: ['Sofortige Klarheit', 'Zuverlässige Intuition', 'Überlebensinstinkt', 'Gesunde Entscheidungen'],
      color: '#84cc16',
      icon: <Eye size={24} />
    },
    {
      id: 'g',
      name: 'G Center Authority',
      germanName: 'G-Zentrum Autorität',
      description: 'Die G-Zentrum Autorität basiert auf Liebe und Richtung. Entscheidungen kommen aus dem Herzen.',
      strategy: 'Folge deinem Herzen. Die Antwort kommt aus Liebe und innerer Richtung.',
      centers: ['G Center'],
      keywords: ['Liebe', 'Richtung', 'Herz', 'Identität', 'Zweck'],
      decisionProcess: '1. Spüre in dein Herz\n2. Frage nach Liebe und Richtung\n3. Vertraue der Antwort\n4. Folge deinem Weg',
      challenges: ['Angst vor Liebe', 'Identitätskrisen', 'Suche nach Richtung', 'Zweifel am Herzen'],
      strengths: ['Authentische Liebe', 'Klare Richtung', 'Herzbasierte Entscheidungen', 'Wahre Identität'],
      color: '#10b981',
      icon: <Heart size={24} />
    },
    {
      id: 'ego',
      name: 'Ego Authority',
      germanName: 'Ego-Autorität',
      description: 'Die Ego-Autorität basiert auf Willen und Selbstwertigkeit. Entscheidungen kommen aus innerer Kraft.',
      strategy: 'Vertraue deinem Willen. Die Antwort kommt aus innerer Kraft und Selbstwertigkeit.',
      centers: ['Heart Center'],
      keywords: ['Wille', 'Selbstwertigkeit', 'Kraft', 'Entscheidung', 'Autorität'],
      decisionProcess: '1. Spüre deinen Willen\n2. Vertraue deiner Kraft\n3. Entscheide aus Selbstwertigkeit\n4. Handle mit Autorität',
      challenges: ['Angst vor Willensverlust', 'Selbstzweifel', 'Druck zu beweisen', 'Angst vor Autorität'],
      strengths: ['Starker Wille', 'Selbstwertigkeit', 'Entscheidungskraft', 'Natürliche Autorität'],
      color: '#ef4444',
      icon: <Shield size={24} />
    },
    {
      id: 'environmental',
      name: 'Environmental Authority',
      germanName: 'Umgebungs-Autorität',
      description: 'Die Umgebungs-Autorität basiert auf der Umgebung und dem Kontext. Entscheidungen werden durch die Umgebung beeinflusst.',
      strategy: 'Achte auf deine Umgebung. Die Antwort kommt durch den richtigen Kontext und die richtige Umgebung.',
      centers: ['G Center'],
      keywords: ['Umgebung', 'Kontext', 'Richtung', 'Raum', 'Atmosphäre'],
      decisionProcess: '1. Beobachte deine Umgebung\n2. Spüre den Kontext\n3. Vertraue der Umgebungsantwort\n4. Handle entsprechend',
      challenges: ['Falsche Umgebung', 'Kontextverlust', 'Angst vor Richtungslosigkeit', 'Druck zu entscheiden'],
      strengths: ['Umgebungsbewusstsein', 'Kontextuelle Klarheit', 'Richtungsgefühl', 'Raumverständnis'],
      color: '#8b5cf6',
      icon: <Target size={24} />
    }
  ];

  const filteredAuthorities = authorities.filter(authority =>
    authority.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    authority.germanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    authority.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAuthorityExpand = (authorityId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAuthority(isExpanded ? authorityId : false);
  };

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
      {/* Animierte Planeten-Orbits */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`orbit-${i}`}
          style={{
            position: 'absolute',
            width: `${300 + i * 200}px`,
            height: `${300 + i * 200}px`,
            borderRadius: '50%',
            border: `1px solid rgba(242, 159, 5, ${0.1 - i * 0.02})`,
            left: `${20 + i * 20}%`,
            top: `${10 + i * 15}%`,
            pointerEvents: 'none',
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20 + i * 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
      {/* Pulsierende Planeten */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`planet-${i}`}
          style={{
            position: 'absolute',
            width: `${20 + i * 10}px`,
            height: `${20 + i * 10}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(242, 159, 5, ${0.6 - i * 0.1}), rgba(140, 29, 4, ${0.3 - i * 0.05}))`,
            left: `${15 + i * 15}%`,
            top: `${20 + i * 10}%`,
            pointerEvents: 'none',
            filter: 'blur(1px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4 + i * 1,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: { xs: 4, md: 8 }, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Logo */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Logo />
        </Box>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box textAlign="center" mb={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Shield size={48} color="#F29F05" style={{ flexShrink: 0 }} />
              <Typography 
                variant="h1" 
                component="h1" 
                sx={{ 
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                  mb: 4,
                  fontSize: { xs: '2.5rem', md: '4rem' }
                }}
              >
                Autoritäten
              </Typography>
              <Shield size={48} color="#F29F05" style={{ flexShrink: 0 }} />
            </Box>
            
            <Typography 
              variant="h4" 
              sx={{ 
                color: 'rgba(255,255,255,0.85)', 
                mb: 6,
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.7,
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                fontWeight: 300
              }}
            >
              Entdecke deine natürliche Entscheidungsmethode und lerne, 
              wie du deine Autorität optimal nutzen kannst
            </Typography>
          </Box>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(242, 159, 5, 0.30)',
            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
            p: 3,
            mb: 6,
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: 'rgba(242, 159, 5, 0.40)',
              boxShadow: '0 12px 40px rgba(242, 159, 5, 0.3)'
            }
          }}>
            <TextField
              fullWidth
              placeholder="Suche nach Autoritäten, Schlüsselwörtern oder deutschen Namen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} color="#F29F05" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  background: 'transparent',
                  '& fieldset': { borderColor: 'rgba(242, 159, 5, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(242, 159, 5, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                },
                '& .MuiInputLabel-root': { color: 'rgba(255, 255, 255, 0.7)' },
                '& .MuiInputBase-input::placeholder': { color: 'rgba(255, 255, 255, 0.5)' }
              }}
            />
          </Card>
        </motion.div>

        {/* Authorities Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Grid container spacing={4}>
            {filteredAuthorities.map((authority, index) => (
              <Grid item xs={12} md={6} key={authority.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Card sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    border: '1px solid rgba(242, 159, 5, 0.25)',
                    boxShadow: '0 8px 32px rgba(242, 159, 5, 0.15)',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(242, 159, 5, 0.3)',
                      borderColor: 'rgba(242, 159, 5, 0.40)',
                      background: 'rgba(255, 255, 255, 0.12)',
                    }
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${authority.color}, ${authority.color}80)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 3,
                          color: '#fff'
                        }}>
                          {authority.icon}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h5" sx={{
                            color: 'white',
                            fontWeight: 700,
                            mb: 1,
                            textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                          }}>
                            {authority.germanName}
                          </Typography>
                          <Typography variant="body1" sx={{
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '0.9rem'
                          }}>
                            {authority.name}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography sx={{
                        color: 'rgba(255,255,255,0.9)',
                        mb: 3,
                        lineHeight: 1.6
                      }}>
                        {authority.description}
                      </Typography>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{
                          color: '#F29F05',
                          fontWeight: 700,
                          mb: 2,
                          fontSize: { xs: '1rem', md: '1.1rem' }
                        }}>
                          Strategie:
                        </Typography>
                        <Typography sx={{
                          color: 'rgba(255,255,255,0.8)',
                          fontStyle: 'italic',
                          lineHeight: 1.6
                        }}>
                          {authority.strategy}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{
                          color: '#F29F05',
                          fontWeight: 700,
                          mb: 2,
                          fontSize: { xs: '1rem', md: '1.1rem' }
                        }}>
                          Schlüsselwörter:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {authority.keywords.map((keyword, idx) => (
                            <Chip
                              key={idx}
                              label={keyword}
                              size="small"
                              sx={{
                                background: 'rgba(242, 159, 5, 0.12)',
                                color: 'rgba(255,255,255,0.9)',
                                border: '1px solid rgba(242, 159, 5, 0.25)',
                                fontSize: '0.8rem',
                                fontWeight: 500
                              }}
                            />
                          ))}
                        </Box>
                      </Box>

                      {/* Expandable Details */}
                      <Accordion 
                        expanded={expandedAuthority === authority.id}
                        onChange={handleAuthorityExpand(authority.id)}
                        sx={{
                          background: 'rgba(242, 159, 5, 0.08)',
                          border: '1px solid rgba(242, 159, 5, 0.20)',
                          borderRadius: 2,
                          '&:before': { display: 'none' },
                          '&:hover': {
                            background: 'rgba(242, 159, 5, 0.12)',
                            borderColor: 'rgba(242, 159, 5, 0.30)'
                          }
                        }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon sx={{ color: '#F29F05' }} />}
                          sx={{ color: 'white' }}
                        >
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            color: 'white',
                            fontSize: { xs: '0.95rem', md: '1rem' }
                          }}>
                            Detaillierte Informationen
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{
                                  color: '#F29F05',
                                  fontWeight: 700,
                                  mb: 2,
                                  fontSize: { xs: '1rem', md: '1.1rem' }
                                }}>
                                  Entscheidungsprozess:
                                </Typography>
                                <Typography sx={{
                                  color: 'rgba(255,255,255,0.8)',
                                  lineHeight: 1.6,
                                  whiteSpace: 'pre-line'
                                }}>
                                  {authority.decisionProcess}
                                </Typography>
                              </Box>

                              <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{
                                  color: '#F29F05',
                                  fontWeight: 700,
                                  mb: 2,
                                  fontSize: { xs: '1rem', md: '1.1rem' }
                                }}>
                                  Stärken:
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {authority.strengths.map((strength, idx) => (
                                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Star size={16} color="#F29F05" fill="#F29F05" />
                                      <Typography sx={{
                                        color: 'rgba(255,255,255,0.85)',
                                        fontSize: { xs: '0.85rem', md: '0.9rem' }
                                      }}>
                                        {strength}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              </Box>
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Box sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{
                                  color: '#F29F05',
                                  fontWeight: 700,
                                  mb: 2,
                                  fontSize: { xs: '1rem', md: '1.1rem' }
                                }}>
                                  Herausforderungen:
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {authority.challenges.map((challenge, idx) => (
                                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Circle size={16} color="#8C1D04" fill="#8C1D04" />
                                      <Typography sx={{
                                        color: 'rgba(255,255,255,0.85)',
                                        fontSize: { xs: '0.85rem', md: '0.9rem' }
                                      }}>
                                        {challenge}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              </Box>

                              <Box>
                                <Typography variant="h6" sx={{
                                  color: '#F29F05',
                                  fontWeight: 700,
                                  mb: 2,
                                  fontSize: { xs: '1rem', md: '1.1rem' }
                                }}>
                                  Zentren:
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {authority.centers.map((center, idx) => (
                                    <Chip
                                      key={idx}
                                      label={center}
                                      size="small"
                                      sx={{
                                        background: 'rgba(242, 159, 5, 0.15)',
                                        color: '#F29F05',
                                        border: '1px solid rgba(242, 159, 5, 0.3)',
                                        fontSize: '0.8rem',
                                        fontWeight: 600
                                      }}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Back to Dashboard Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Box sx={{ textAlign: 'center', mt: 8 }}>
            <Button
              component={Link}
              href="/dashboard"
              variant="outlined"
              fullWidth
              sx={{
                borderColor: 'rgba(242, 159, 5, 0.5)',
                color: '#F29F05',
                fontWeight: 700,
                px: { xs: 2, md: 6 },
                py: { xs: 1.5, md: 2 },
                borderRadius: 3,
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                minHeight: { xs: 48, md: 'auto' },
                maxWidth: { xs: '100%', md: 'auto' },
                boxShadow: '0 4px 15px rgba(242, 159, 5, 0.2)',
                '&:hover': {
                  borderColor: '#F29F05',
                  backgroundColor: 'rgba(242, 159, 5, 0.15)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(242, 159, 5, 0.3)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Zurück zum Dashboard
            </Button>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
