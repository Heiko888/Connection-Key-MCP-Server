"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  Divider,
  CircularProgress
} from "@mui/material";
import {
  BookOpen,
  Star,
  Sparkles,
  Clock,
  User,
  Heart,
  Brain,
  Zap,
  Moon,
  Sun,
  ArrowRight,
  CheckCircle,
  Gift,
  Crown,
  Shield,
  Award,
  Users
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

// Floating Stars Animation
const FloatingStars = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    >
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            background: '#F29F05',
            borderRadius: '50%',
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
    </Box>
  );
};

export default function CustomReadingsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    readingType: '',
    specificQuestions: '',
    urgency: 'normal'
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const readingTypes = [
    {
      id: 'basic',
      name: 'Basis Analyse Human Design',
      tagline: 'Dein erster Schritt zur Selbsterkenntnis',
      description: 'Entdecke die Grundlagen deines energetischen Designs und verstehe, wer du wirklich bist.',
      price: '€99',
      duration: 'PDF Reading',
      icon: <Sparkles size={32} />,
      color: '#ff6b9d',
      benefits: [
        'Erkenne deine einzigartige energetische Signatur',
        'Verstehe, wie du wirklich funktionierst',
        'Entdecke deine natürlichen Stärken',
        'Erhalte Klarheit über deine Lebensaufgabe'
      ],
      emotionalHook: 'Für alle, die endlich verstehen wollen, warum sie so sind, wie sie sind.'
    },
    {
      id: 'extended',
      name: 'Erweiterte Analyse Human Design',
      tagline: 'Tiefe Einblicke in dein energetisches System',
      description: 'Eine umfassende Reise durch dein Human Design mit detaillierten Erkenntnissen und praktischen Handlungsempfehlungen.',
      price: '€149',
      duration: 'PDF Reading',
      icon: <Brain size={32} />,
      color: '#4ecdc4',
      benefits: [
        'Alles aus Basis Analyse',
        'Verstehe deine energetischen Blockaden',
        'Entdecke deine verborgenen Talente',
        'Erhalte konkrete Handlungsempfehlungen',
        'Lerne, wie du deine Energie optimal nutzt'
      ],
      emotionalHook: 'Für alle, die bereit sind, tief in ihre energetische Wahrheit einzutauchen.',
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium Analyse Human Design',
      tagline: 'Deine persönliche Transformationsreise',
      description: 'Die vollständige Analyse mit persönlicher 1:1 Session, in der alle deine Fragen beantwortet werden.',
      price: '€199',
      duration: 'PDF + 60 Min Session',
      icon: <Crown size={32} />,
      color: '#F29F05',
      benefits: [
        'Alles aus Erweiterte Analyse',
        'Persönliche 1:1 Zoom-Session (60 Min)',
        'Stelle alle deine brennenden Fragen',
        'Erhalte individuelle Coaching-Impulse',
        'Follow-up Support für deine Transformation'
      ],
      emotionalHook: 'Für alle, die eine tiefe Transformation und persönliche Begleitung suchen.'
    },
    {
      id: 'planets',
      name: 'Planeten Reading',
      tagline: 'Die kosmische Dimension deines Designs',
      description: 'Eine einzigartige Verbindung aus Human Design und Astrologie, die die tiefe Bedeutung der Planeten in deinem Leben zeigt.',
      price: '€129',
      duration: 'PDF Reading',
      icon: <Moon size={32} />,
      color: '#9370DB',
      benefits: [
        'Entdecke die kosmische Bedeutung deiner Planeten',
        'Verstehe deine astrologische Signatur',
        'Erkenne planetarische Muster in deinem Leben',
        'Lerne, wie die Planeten deine Energie prägen'
      ],
      emotionalHook: 'Für alle, die die Verbindung zwischen Himmel und Erde in ihrem Leben verstehen wollen.'
    }
  ];

  const testimonials = [
    {
      text: "Endlich verstehe ich, warum ich so bin, wie ich bin. Das Reading hat mir eine völlig neue Perspektive auf mich selbst gegeben.",
      author: "Sarah M.",
      type: "Basis Analyse"
    },
    {
      text: "Die Erweiterte Analyse hat mir gezeigt, wo meine Blockaden liegen und wie ich sie auflösen kann. Ein Game-Changer!",
      author: "Michael K.",
      type: "Erweiterte Analyse"
    },
    {
      text: "Die Premium Session war genau das, was ich brauchte. Endlich hatte ich jemanden, der mir alle meine Fragen beantwortet hat.",
      author: "Lisa P.",
      type: "Premium Analyse"
    },
    {
      text: "Das Planeten Reading hat mir gezeigt, wie die kosmischen Kräfte in meinem Leben wirken. Faszinierend und sehr aufschlussreich!",
      author: "Tom R.",
      type: "Planeten Reading"
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <FloatingStars />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{
              background: 'rgba(242, 159, 5, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.2)',
              borderRadius: 4,
              p: 6,
              textAlign: 'center'
            }}>
              <Box sx={{ mb: 4 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <CheckCircle size={80} color="#F29F05" style={{ margin: '0 auto 24px' }} />
                </motion.div>
                <Typography variant="h3" sx={{ 
                  color: '#F29F05', 
                  fontWeight: 700, 
                  mb: 2 
                }}>
                  Deine Anfrage ist unterwegs! ✨
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: 'rgba(255,255,255,0.9)', 
                  mb: 4,
                  lineHeight: 1.6
                }}>
                  Vielen Dank für deine Anfrage. Wir freuen uns, dich auf deiner Reise zu begleiten. 
                  Du erhältst in Kürze eine Bestätigungs-E-Mail mit allen wichtigen Informationen.
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  component={Link}
                  href="/dashboard"
                  variant="contained"
                  endIcon={<ArrowRight size={18} />}
                  sx={{
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    color: 'white',
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #e08f04, #7a1a03)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Zum Dashboard
                </Button>
              </Box>
            </Card>
          </motion.div>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
        radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
        radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
        linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <FloatingStars />
      
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
        {/* Hero Section - Emotional & Storytelling */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Box textAlign="center" mb={10}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Chip
                label="✨ Entdecke, wer du wirklich bist"
                sx={{
                  bgcolor: 'rgba(242, 159, 5, 0.15)',
                  color: '#F29F05',
                  fontWeight: 700,
                  mb: 4,
                  fontSize: '1rem',
                  py: 2,
                  px: 3,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(242, 159, 5, 0.3)'
                }}
              />
            </motion.div>
            
            <Typography
              variant="h1"
              component="h1"
              sx={{
                color: 'white',
                fontWeight: 800,
                mb: 4,
                fontSize: { xs: '2.5rem', md: '4.5rem' },
                lineHeight: 1.2,
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)'
              }}
            >
              Deine energetische Signatur
              <br />
              <Box component="span" sx={{
                background: 'linear-gradient(135deg, #F29F05, #ff6b9d)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                wartet darauf, entdeckt zu werden
              </Box>
            </Typography>
            
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                mb: 6,
                maxWidth: 900,
                mx: 'auto',
                lineHeight: 1.8,
                fontWeight: 300,
                fontSize: { xs: '1.1rem', md: '1.4rem' }
              }}
            >
              Jeder Mensch trägt eine einzigartige energetische Signatur in sich – 
              eine Blaupause, die zeigt, wie du wirklich funktionierst, was dich antreibt 
              und wie du dein volles Potenzial entfaltest. 
              <br /><br />
              <Box component="span" sx={{ fontStyle: 'italic', color: '#F29F05' }}>
                Es ist Zeit, diese Signatur zu entschlüsseln.
              </Box>
            </Typography>

            {/* Trust Indicators */}
            <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap', mt: 6 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#F29F05', fontWeight: 800, mb: 0.5 }}>
                  500+
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Readings erstellt
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#F29F05', fontWeight: 800, mb: 0.5 }}>
                  98%
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Zufriedenheit
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#F29F05', fontWeight: 800, mb: 0.5 }}>
                  24h
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Antwortzeit
                </Typography>
              </Box>
            </Box>
          </Box>
        </motion.div>

        {/* Reading Types - Emotional Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Typography variant="h2" sx={{ 
            color: 'white',
            fontWeight: 800,
            mb: 8,
            textAlign: 'center',
            fontSize: { xs: '2rem', md: '3rem' }
          }}>
            Wähle deine Transformationsreise
          </Typography>
          
          <Grid container spacing={4} sx={{ mb: 10 }}>
            {readingTypes.map((reading, index) => (
              <Grid item xs={12} md={6} key={reading.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Card sx={{ 
                    background: 'rgba(242, 159, 5, 0.08)',
                    backdropFilter: 'blur(20px)',
                    border: reading.popular 
                      ? `2px solid ${reading.color}` 
                      : '1px solid rgba(242, 159, 5, 0.2)',
                    borderRadius: 4,
                    boxShadow: reading.popular 
                      ? `0 8px 32px ${reading.color}40` 
                      : '0 8px 32px rgba(0,0,0,0.3)',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px ${reading.color}60`,
                      border: `2px solid ${reading.color}`
                    }
                  }}>
                    {reading.popular && (
                      <Box sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        background: `linear-gradient(135deg, ${reading.color}, ${reading.color}dd)`,
                        color: 'white',
                        px: 2,
                        py: 0.5,
                        borderRadius: 2,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        zIndex: 1
                      }}>
                        BELIEBT
                      </Box>
                    )}
                    
                    <CardContent sx={{ p: 5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '16px',
                          background: `linear-gradient(135deg, ${reading.color}, ${reading.color}dd)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '20px',
                          boxShadow: `0 4px 20px ${reading.color}40`
                        }}>
                          <Box sx={{ color: 'white' }}>
                            {reading.icon}
                          </Box>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
                            {reading.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
                            {reading.tagline}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="body1" sx={{ 
                        color: 'rgba(255,255,255,0.9)', 
                        mb: 4, 
                        lineHeight: 1.8,
                        fontSize: '1.1rem'
                      }}>
                        {reading.description}
                      </Typography>

                      <Typography variant="body2" sx={{ 
                        color: reading.color, 
                        mb: 3,
                        fontWeight: 600,
                        fontStyle: 'italic'
                      }}>
                        {reading.emotionalHook}
                      </Typography>

                      <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

                      <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle2" sx={{ 
                          color: 'rgba(255,255,255,0.8)', 
                          mb: 2,
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          letterSpacing: 1
                        }}>
                          Was du erhältst:
                        </Typography>
                        {reading.benefits.map((benefit, benefitIndex) => (
                          <Box key={benefitIndex} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                            <CheckCircle 
                              size={20} 
                              style={{ 
                                color: reading.color, 
                                marginRight: 12, 
                                marginTop: 2,
                                flexShrink: 0
                              }} 
                            />
                            <Typography variant="body2" sx={{ 
                              color: 'rgba(255,255,255,0.9)', 
                              lineHeight: 1.6
                            }}>
                              {benefit}
                            </Typography>
                          </Box>
                        ))}
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4 }}>
                        <Box>
                          <Typography variant="h4" sx={{ 
                            color: reading.color, 
                            fontWeight: 800,
                            mb: 0.5
                          }}>
                            {reading.price}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            {reading.duration}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          onClick={() => handleInputChange('readingType', reading.id)}
                          sx={{
                            background: reading.id === formData.readingType 
                              ? `linear-gradient(135deg, ${reading.color}, ${reading.color}dd)` 
                              : 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            fontWeight: 700,
                            px: 4,
                            py: 1.5,
                            borderRadius: 3,
                            border: reading.id === formData.readingType 
                              ? `2px solid ${reading.color}` 
                              : '1px solid rgba(255,255,255,0.2)',
                            '&:hover': {
                              background: `linear-gradient(135deg, ${reading.color}, ${reading.color}dd)`,
                              transform: 'scale(1.05)'
                            }
                          }}
                        >
                          {reading.id === formData.readingType ? '✓ Ausgewählt' : 'Auswählen'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          sx={{ mb: 10 }}
        >
          <Typography variant="h2" sx={{ 
            color: 'white',
            fontWeight: 800,
            mb: 6,
            textAlign: 'center',
            fontSize: { xs: '2rem', md: '3rem' }
          }}>
            Was andere erlebt haben
          </Typography>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card sx={{
                    background: 'rgba(242, 159, 5, 0.08)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(242, 159, 5, 0.2)',
                    borderRadius: 4,
                    p: 4,
                    height: '100%'
                  }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={20} style={{ color: '#F29F05', fill: '#F29F05' }} />
                      ))}
                    </Box>
                    <Typography variant="body1" sx={{ 
                      color: 'rgba(255,255,255,0.9)', 
                      mb: 3,
                      lineHeight: 1.8,
                      fontStyle: 'italic',
                      fontSize: '1.1rem'
                    }}>
                      "{testimonial.text}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ 
                        bgcolor: '#F29F05',
                        width: 48,
                        height: 48
                      }}>
                        {testimonial.author.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                          {testimonial.author}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          {testimonial.type}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Booking Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Card sx={{
            background: 'rgba(242, 159, 5, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.2)',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            p: 6
          }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h3" sx={{ 
                color: 'white', 
                fontWeight: 700, 
                mb: 2
              }}>
                Beginne deine Reise
              </Typography>
              <Typography variant="body1" sx={{ 
                color: 'rgba(255,255,255,0.8)',
                maxWidth: 600,
                mx: 'auto'
              }}>
                Fülle das Formular aus und wir erstellen dein persönliches Reading, 
                maßgeschneidert für deine individuellen Fragen und Lebensbereiche.
              </Typography>
            </Box>
            
            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    fullWidth
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        '& fieldset': { border: 'none' },
                        '&:hover': { border: '1px solid rgba(242, 159, 5, 0.5)' },
                        '&.Mui-focused': { 
                          border: '1px solid #F29F05',
                          boxShadow: '0 0 0 2px rgba(242, 159, 5, 0.2)'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': { color: '#F29F05' }
                      },
                      '& .MuiInputBase-input': {
                        color: 'white !important'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    label="E-Mail"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    fullWidth
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        '& fieldset': { border: 'none' },
                        '&:hover': { border: '1px solid rgba(242, 159, 5, 0.5)' },
                        '&.Mui-focused': { 
                          border: '1px solid #F29F05',
                          boxShadow: '0 0 0 2px rgba(242, 159, 5, 0.2)'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': { color: '#F29F05' }
                      },
                      '& .MuiInputBase-input': {
                        color: 'white !important'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Geburtsdatum"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        '& fieldset': { border: 'none' },
                        '&:hover': { border: '1px solid rgba(242, 159, 5, 0.5)' },
                        '&.Mui-focused': { 
                          border: '1px solid #F29F05',
                          boxShadow: '0 0 0 2px rgba(242, 159, 5, 0.2)'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': { color: '#F29F05' }
                      },
                      '& .MuiInputBase-input': {
                        color: 'white !important'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Geburtszeit"
                    type="time"
                    value={formData.birthTime}
                    onChange={(e) => handleInputChange('birthTime', e.target.value)}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        '& fieldset': { border: 'none' },
                        '&:hover': { border: '1px solid rgba(242, 159, 5, 0.5)' },
                        '&.Mui-focused': { 
                          border: '1px solid #F29F05',
                          boxShadow: '0 0 0 2px rgba(242, 159, 5, 0.2)'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': { color: '#F29F05' }
                      },
                      '& .MuiInputBase-input': {
                        color: 'white !important'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Geburtsort"
                    value={formData.birthPlace}
                    onChange={(e) => handleInputChange('birthPlace', e.target.value)}
                    fullWidth
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        '& fieldset': { border: 'none' },
                        '&:hover': { border: '1px solid rgba(242, 159, 5, 0.5)' },
                        '&.Mui-focused': { 
                          border: '1px solid #F29F05',
                          boxShadow: '0 0 0 2px rgba(242, 159, 5, 0.2)'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': { color: '#F29F05' }
                      },
                      '& .MuiInputBase-input': {
                        color: 'white !important'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Was möchtest du in deinem Reading erfahren?"
                    multiline
                    rows={4}
                    value={formData.specificQuestions}
                    onChange={(e) => handleInputChange('specificQuestions', e.target.value)}
                    fullWidth
                    placeholder="Teile uns mit, welche Fragen dich bewegen, welche Lebensbereiche du erkunden möchtest oder welche Herausforderungen du gerade meisterst..."
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        '& fieldset': { border: 'none' },
                        '&:hover': { border: '1px solid rgba(242, 159, 5, 0.5)' },
                        '&.Mui-focused': { 
                          border: '1px solid #F29F05',
                          boxShadow: '0 0 0 2px rgba(242, 159, 5, 0.2)'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-focused': { color: '#F29F05' }
                      },
                      '& .MuiInputBase-input': {
                        color: 'white !important',
                        '&::placeholder': {
                          color: 'rgba(255, 255, 255, 0.5)',
                          opacity: 1
                        }
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Wann benötigst du dein Reading?</InputLabel>
                    <Select
                      value={formData.urgency}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                      sx={{
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        '& fieldset': { border: 'none' },
                        '&:hover': { border: '1px solid rgba(242, 159, 5, 0.5)' },
                        '&.Mui-focused': { 
                          border: '1px solid #F29F05',
                          boxShadow: '0 0 0 2px rgba(242, 159, 5, 0.2)'
                        },
                        '& .MuiSelect-select': {
                          color: 'white'
                        }
                      }}
                    >
                      <MenuItem value="normal">Normal (1-2 Wochen)</MenuItem>
                      <MenuItem value="urgent">Dringend (3-5 Tage)</MenuItem>
                      <MenuItem value="asap">Sofort (1-2 Tage)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading || !formData.readingType}
                      endIcon={loading ? null : <ArrowRight size={24} />}
                      sx={{
                        background: formData.readingType
                          ? 'linear-gradient(135deg, #F29F05, #8C1D04)'
                          : 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontWeight: 700,
                        px: 8,
                        py: 2,
                        fontSize: '1.2rem',
                        borderRadius: 3,
                        textTransform: 'none',
                        boxShadow: formData.readingType 
                          ? '0 8px 32px rgba(242, 159, 5, 0.4)' 
                          : 'none',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #e08f04, #7a1a03)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 40px rgba(242, 159, 5, 0.6)'
                        },
                        '&:disabled': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'rgba(255, 255, 255, 0.3)'
                        }
                      }}
                    >
                      {loading ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 2, color: 'white' }} />
                          Wird gesendet...
                        </>
                      ) : (
                        'Meine Reise beginnen'
                      )}
                    </Button>
                    {!formData.readingType && (
                      <Typography variant="caption" sx={{ 
                        color: 'rgba(255,255,255,0.6)', 
                        display: 'block', 
                        mt: 2 
                      }}>
                        Bitte wähle zuerst einen Reading-Typ aus
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Card>
        </motion.div>

        {/* Trust & Security Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          sx={{ mt: 10 }}
        >
          <Grid container spacing={4}>
            {[
              { icon: <Shield size={32} />, title: 'Sichere Zahlung', desc: 'SSL-verschlüsselt & DSGVO-konform' },
              { icon: <Award size={32} />, title: 'Qualitätsgarantie', desc: 'Professionelle Analysen von zertifizierten Coaches' },
              { icon: <Clock size={32} />, title: 'Schnelle Bearbeitung', desc: 'Dein Reading innerhalb von 1-2 Wochen' },
              { icon: <Users size={32} />, title: 'Persönliche Betreuung', desc: 'Individuelle Unterstützung bei allen Fragen' }
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: 3,
                  background: 'rgba(242, 159, 5, 0.05)',
                  borderRadius: 3,
                  border: '1px solid rgba(242, 159, 5, 0.1)'
                }}>
                  <Box sx={{
                    color: '#F29F05',
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2
                  }}>
                    {item.icon}
                  </Box>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
}
