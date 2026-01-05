"use client";
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Container,
  Grid,
  Chip,
  Divider
} from '@mui/material';
import { 
  Sparkles, 
  Star, 
  Heart, 
  Users, 
  BookOpen, 
  Moon, 
  BarChart3, 
  CheckCircle, 
  ArrowRight, 
  Crown, 
  Zap, 
  Shield,
  Clock,
  MessageSquare,
  Calendar,
  Award,
  TrendingUp,
  Globe,
  Lock,
  Gift,
  Target,
  Lightbulb,
  Eye,
  Activity,
  Compass,
  Brain
} from 'lucide-react';
import Link from 'next/link';

export default function SalesPage() {
  const benefits = [
    {
      icon: <Brain size={32} />,
      title: "Selbsterkenntnis",
      description: "Verstehe deine einzigartige Energie und wie du sie optimal nutzen kannst."
    },
    {
      icon: <Target size={32} />,
      title: "Lebensstrategie",
      description: "Entdecke deine natürliche Art zu entscheiden und zu handeln."
    },
    {
      icon: <Heart size={32} />,
      title: "Beziehungen",
      description: "Lerne, wie du authentische Verbindungen aufbaust und pflegst."
    },
    {
      icon: <Zap size={32} />,
      title: "Energie-Management",
      description: "Optimiere deine Energie und vermeide Ausbrenner."
    },
    {
      icon: <Crown size={32} />,
      title: "Lebenszweck",
      description: "Finde deine wahre Mission und dein höchstes Potenzial."
    },
    {
      icon: <Shield size={32} />,
      title: "Authentizität",
      description: "Lebe dein wahres Selbst und fühle dich endlich verstanden."
    }
  ];

  const features = [
    "Persönliche Chart-Analyse",
    "Individuelle Strategie-Beratung",
    "Energie-Optimierung",
    "Beziehungs-Coaching",
    "Karriere-Beratung",
    "Lebenszweck-Entdeckung",
    "Mondphasen-Integration",
    "Ongoing Support"
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

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, pt: { xs: 4, md: 6 }, pb: { xs: 4, md: 8 } }}>
        {/* Hero Section */}
        <motion.div
          
          
          
        >
          <Box textAlign="center" mb={8}>
            {/* Logo */}
            <Box sx={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: { xs: 300, md: 400 }, 
              height: { xs: 120, md: 160 }, 
              mx: 'auto', 
              mb: 4 
            }}>
              <Image
                src="/images/connection-key-optimized.png"
                alt="The Connection Key"
                fill
                style={{ objectFit: 'contain' }}
                priority
                sizes="(max-width: 768px) 300px, 400px"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/Design%20ohne%20Titel(15).png';
                }}
              />
            </Box>

            <Chip
              label="✨ Entdecke dein kosmisches Potenzial"
              sx={{
                bgcolor: 'rgba(242, 159, 5, 0.2)',
                color: '#F29F05',
                fontWeight: 700,
                mb: 3,
                fontSize: '1rem',
                py: 1,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(242, 159, 5, 0.3)'
              }}
            />
            
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                color: 'white', 
                fontWeight: 900,
                mb: 4,
                fontSize: { xs: '2.5rem', md: '4rem' },
                textShadow: '0 0 30px rgba(242, 159, 5, 0.3)',
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              The Connection Key
            </Typography>
            
            <Typography 
              variant="h4" 
              sx={{ 
                color: 'rgba(255,255,255,0.9)', 
                mb: 6,
                maxWidth: 800,
                mx: 'auto',
                lineHeight: 1.4,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              Entdecke deine einzigartige kosmische Energie und lerne, wie du sie optimal nutzen kannst. 
              The Connection Key zeigt dir den Weg zu deinem authentischen Selbst im Universum.
            </Typography>

            <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                component={Link}
                href="/register"
                variant="contained"
                size="large"
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white',
                  fontWeight: 700,
                  px: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  borderRadius: 3,
                  textTransform: 'none',
                  boxShadow: '0 8px 32px rgba(242, 159, 5, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(242, 159, 5, 0.6)',
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Jetzt kostenlos starten
                <ArrowRight size={24} style={{ marginLeft: 8 }} />
              </Button>
              
              <Button
                component={Link}
                href="/human-design-chart"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  fontWeight: 700,
                  px: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  borderRadius: 3,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#8C1D04',
                    backgroundColor: 'rgba(242, 159, 5, 0.10)',
                    boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Chart berechnen
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* Benefits Section */}
        <Box sx={{ py: 8 }}>
          <motion.div
            
            whileInView={{ opacity: 1, y: 0 }}
            
            
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography 
                variant="h2" 
                sx={{ 
                  color: 'white', 
                  mb: 3, 
                  fontWeight: 800,
                  fontSize: { xs: '2rem', md: '3rem' },
                  textShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
                }}
              >
                Was The Connection Key für dich bedeutet
              </Typography>
            </Box>
            
            <Grid container spacing={4}>
              {benefits.map((benefit, index) => (
                <Grid item xs={12} sm={6} lg={4} key={index}>
                  <motion.div
                    
                    whileInView={{ opacity: 1, y: 0 }}
                    
                    
                  >
                    <Card sx={{ 
                      height: '100%',
                      background: 'rgba(242, 159, 5, 0.05)', 
                      backdropFilter: 'blur(20px)',
                      borderRadius: 4, 
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      border: '1px solid rgba(242, 159, 5, 0.15)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 30px rgba(242, 159, 5, 0.25)',
                        borderColor: 'rgba(242, 159, 5, 0.4)',
                        background: 'rgba(242, 159, 5, 0.08)',
                      }
                    }}>
                      <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <Box sx={{ 
                          width: 64, 
                          height: 64, 
                          borderRadius: '16px', 
                          background: 'linear-gradient(135deg, #F29F05, #8C1D04)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: 'white', 
                          mx: 'auto',
                          mb: 3,
                          boxShadow: '0 8px 24px rgba(242, 159, 5, 0.4)'
                        }}>
                          {benefit.icon}
                        </Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 2, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                          {benefit.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                          {benefit.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 8, background: 'rgba(242, 159, 5, 0.05)', borderRadius: 4, mb: 8, backdropFilter: 'blur(10px)', border: '1px solid rgba(242, 159, 5, 0.15)' }}>
          <Container maxWidth="lg">
            <motion.div
              
              whileInView={{ opacity: 1, y: 0 }}
              
              
            >
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    color: 'white', 
                    mb: 3, 
                    fontWeight: 800,
                    fontSize: { xs: '2rem', md: '3rem' },
                    textShadow: '0 0 20px rgba(255, 255, 255, 0.3)'
                  }}
                >
                  Was du bekommst
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <motion.div
                      
                      whileInView={{ opacity: 1, x: 0 }}
                      
                      
                    >
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        p: 3,
                        background: 'rgba(242, 159, 5, 0.1)',
                        borderRadius: 2,
                        border: '1px solid rgba(242, 159, 5, 0.2)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(242, 159, 5, 0.15)',
                          borderColor: 'rgba(242, 159, 5, 0.4)',
                          transform: 'translateY(-2px)'
                        }
                      }}>
                        <CheckCircle size={24} style={{ color: '#F29F05', marginRight: 16, filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.5))' }} />
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                          {feature}
                        </Typography>
                      </Box>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Container>
        </Box>

        {/* Testimonial */}
        <Box sx={{ py: 8 }}>
          <motion.div
            
            whileInView={{ opacity: 1, y: 0 }}
            
            
          >
            <Card sx={{ 
              background: 'rgba(242, 159, 5, 0.05)', 
              backdropFilter: 'blur(20px)',
              borderRadius: 4, 
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(242, 159, 5, 0.15)',
              p: 6
            }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 800, mb: 2, textShadow: '0 0 20px rgba(255, 255, 255, 0.3)' }}>
                  Was andere sagen
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 4 }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={24} style={{ color: '#F29F05', fill: '#F29F05', filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.5))' }} />
                ))}
              </Box>
              
              <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.9)', mb: 4, lineHeight: 1.6, fontStyle: 'italic', textAlign: 'center', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                &ldquo;The Connection Key hat mir geholfen, mich selbst wirklich zu verstehen. 
                Endlich fühle ich mich authentisch und weiß, wie ich meine kosmische Energie optimal nutzen kann!&rdquo;
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Box sx={{ 
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  boxShadow: '0 8px 24px rgba(242, 159, 5, 0.4)'
                }}>
                  AS
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                    Anna S.
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Connection Key Coach, 34
                  </Typography>
                </Box>
              </Box>
            </Card>
          </motion.div>
        </Box>

        {/* CTA Section */}
        <Box sx={{ py: 8 }}>
          <motion.div
            
            whileInView={{ opacity: 1, y: 0 }}
            
            
          >
            <Card sx={{ 
              background: 'rgba(242, 159, 5, 0.1)', 
              backdropFilter: 'blur(20px)',
              borderRadius: 4, 
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              border: '1px solid rgba(242, 159, 5, 0.2)',
              textAlign: 'center',
              p: 6
            }}>
              <Typography variant="h2" sx={{ color: 'white', fontWeight: 800, mb: 3, textShadow: '0 0 20px rgba(255, 255, 255, 0.3)' }}>
                Bereit für deine kosmische Transformation?
              </Typography>
              <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, lineHeight: 1.6, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                Entdecke dein wahres Potenzial und beginne deine Reise zu deinem authentischen Selbst im Universum
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  component={Link}
                  href="/register"
                  variant="contained"
                  size="large"
                  sx={{
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    color: 'white',
                    fontWeight: 700,
                    px: 6,
                    py: 2,
                    fontSize: '1.2rem',
                    borderRadius: 3,
                    textTransform: 'none',
                    boxShadow: '0 8px 32px rgba(242, 159, 5, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(242, 159, 5, 0.6)',
                    }
                  }}
                >
                  Jetzt kostenlos starten
                  <ArrowRight size={24} style={{ marginLeft: 8 }} />
                </Button>
                
                <Button
                  component={Link}
                  href="/human-design-chart"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'rgba(242, 159, 5, 0.5)',
                    color: '#F29F05',
                    fontWeight: 700,
                    px: 6,
                    py: 2,
                    fontSize: '1.2rem',
                    borderRadius: 3,
                    textTransform: 'none',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      borderColor: '#8C1D04',
                      backgroundColor: 'rgba(242, 159, 5, 0.10)',
                      boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
                    }
                  }}
                >
                  Chart berechnen
                </Button>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap', mt: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Lock size={16} style={{ color: '#F29F05', filter: 'drop-shadow(0 0 4px rgba(242, 159, 5, 0.5))' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Sichere Daten
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Clock size={16} style={{ color: '#F29F05', filter: 'drop-shadow(0 0 4px rgba(242, 159, 5, 0.5))' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Sofortiger Zugang
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Gift size={16} style={{ color: '#F29F05', filter: 'drop-shadow(0 0 4px rgba(242, 159, 5, 0.5))' }} />
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    7 Tage kostenlos
                  </Typography>
                </Box>
              </Box>
            </Card>
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
}
