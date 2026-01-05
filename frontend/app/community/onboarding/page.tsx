'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Grid,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  CheckCircle,
} from '@mui/icons-material';
import {
  Users,
  MessageSquare,
  Calendar,
  Key,
  Heart,
  Sparkles,
  Share2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  'Willkommen',
  'Community Feed',
  'Events & Meetups',
  'Connection Key teilen',
  'Los geht\'s',
];

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: 'Willkommen in der Community',
    description: 'Hier findest du Gleichgesinnte, die ihre Human Design Journey teilen und gemeinsam wachsen.',
    icon: <Users size={64} color="#F29F05" />,
    features: [
      'Über 2.500+ aktive Mitglieder',
      'Connection Key Resonanzen teilen',
      'Events & Workshops',
      'Persönlicher Austausch'
    ]
  },
  {
    title: 'Community Feed',
    description: 'Im Feed siehst du alle Posts, Fragen und geteilte Connection Keys von anderen Mitgliedern.',
    icon: <MessageSquare size={64} color="#F29F05" />,
    features: [
      'Posts von der Community lesen',
      'Eigene Beiträge erstellen',
      'Auf Posts reagieren und kommentieren',
      'Connection Keys anderer entdecken'
    ]
  },
  {
    title: 'Events & Meetups',
    description: 'Nimm an exklusiven Workshops, Webinaren und lokalen Meetups teil.',
    icon: <Calendar size={64} color="#F29F05" />,
    features: [
      'Connection Key Workshops',
      'Lokale Meetups finden',
      'Online-Webinare besuchen',
      'Events erstellen und teilen'
    ]
  },
  {
    title: 'Connection Key teilen',
    description: 'Teile deine Connection Key Analysen mit der Community und entdecke Resonanzen.',
    icon: <Key size={64} color="#F29F05" />,
    features: [
      'Eigene Connection Keys posten',
      'Resonanzen mit anderen entdecken',
      'Goldadern diskutieren',
      'Energetische Verbindungen erforschen'
    ]
  },
  {
    title: 'Bereit für die Community',
    description: 'Du bist jetzt bereit, Teil unserer wachsenden Community zu werden!',
    icon: <Sparkles size={64} color="#F29F05" />,
    features: [
      'Erstelle deinen ersten Post',
      'Teile einen Connection Key',
      'Tritt Events bei',
      'Verbinde dich mit anderen'
    ]
  }
];

export default function CommunityOnboardingPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    // Prüfe, ob der Benutzer bereits das Onboarding gesehen hat
    const hasSeenOnboarding = localStorage.getItem('community-onboarding-completed');
    if (!hasSeenOnboarding) {
      setIsFirstVisit(true);
    } else {
      // Wenn bereits gesehen, direkt zur Community weiterleiten
      router.push('/community');
    }
  }, [router]);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleComplete();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('community-onboarding-completed', 'true');
    router.push('/community');
  };

  if (!isFirstVisit) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top, rgba(242, 159, 5, 0.15) 0%, rgba(0, 0, 0, 1) 50%)'
      }}>
        <CircularProgress sx={{ color: '#F29F05' }} />
      </Box>
    );
  }

  const currentStepData = onboardingSteps[activeStep];

  return (
    <Box sx={{
      minHeight: '100vh',
      position: 'relative',
      background: 'radial-gradient(ellipse at top, rgba(242, 159, 5, 0.15) 0%, rgba(0, 0, 0, 1) 50%), radial-gradient(ellipse at bottom, rgba(140, 29, 4, 0.1) 0%, rgba(0, 0, 0, 1) 70%)',
      backgroundAttachment: 'fixed',
      pt: { xs: 4, md: 8 },
      pb: 8,
    }}>
      {/* Animierter Hintergrund */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: i % 3 === 0 ? '4px' : i % 3 === 1 ? '6px' : '3px',
              height: i % 3 === 0 ? '4px' : i % 3 === 1 ? '6px' : '3px',
              background: i % 2 === 0 ? '#F29F05' : '#FFD700',
              borderRadius: '50%',
              left: `${(i * 7) % 100}%`,
              top: `${(i * 11) % 100}%`,
              boxShadow: `0 0 ${i % 3 === 0 ? '15px' : '10px'} ${i % 2 === 0 ? 'rgba(242,159,5,0.9)' : 'rgba(255,215,0,0.8)'}`
            }}
            animate={{
              opacity: [0, 1, 0.5, 1, 0],
              scale: [0.3, 1.5, 0.8, 1.3, 0.3],
              y: [0, -50, -20, -40, 0],
            }}
            transition={{
              duration: 2 + (i * 0.3),
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </Box>

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{
            position: 'relative',
            height: { xs: 100, md: 150 },
            width: { xs: 250, md: 375 },
            mx: 'auto',
            mb: 3
          }}>
            <Image
              src="/images/connection-key-optimized.png"
              alt="The Connection Key"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </Box>
        </Box>

        {/* Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    '& .MuiStepLabel-label': {
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: { xs: '0.75rem', md: '0.875rem' },
                      '&.Mui-active': {
                        color: '#F29F05',
                      },
                      '&.Mui-completed': {
                        color: '#F29F05',
                      }
                    },
                    '& .MuiStepIcon-root': {
                      color: 'rgba(255,255,255,0.3)',
                      '&.Mui-active': {
                        color: '#F29F05',
                      },
                      '&.Mui-completed': {
                        color: '#F29F05',
                      }
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(25px)',
              borderRadius: 4,
              border: '1px solid rgba(242, 159, 5, 0.30)',
              boxShadow: '0 8px 32px rgba(242, 159, 5, 0.25)',
              mb: 4
            }}>
              <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
                <Box sx={{ mb: 4 }}>
                  {currentStepData.icon}
                </Box>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                    fontSize: { xs: '1.8rem', md: '2.5rem' },
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {currentStepData.title}
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: 'rgba(255,255,255,0.85)',
                    mb: 4,
                    lineHeight: 1.8,
                    fontSize: { xs: '1rem', md: '1.2rem' },
                    maxWidth: 600,
                    mx: 'auto'
                  }}
                >
                  {currentStepData.description}
                </Typography>

                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {currentStepData.features.map((feature, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        background: 'rgba(242, 159, 5, 0.08)',
                        border: '1px solid rgba(242, 159, 5, 0.2)'
                      }}>
                        <CheckCircle sx={{ color: '#F29F05', fontSize: 24 }} />
                        <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>
                          {feature}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Button
            onClick={activeStep === 0 ? handleSkip : handleBack}
            startIcon={<ArrowBack />}
            sx={{
              color: 'rgba(255,255,255,0.7)',
              '&:hover': {
                color: '#F29F05',
                background: 'rgba(242, 159, 5, 0.1)'
              }
            }}
          >
            {activeStep === 0 ? 'Überspringen' : 'Zurück'}
          </Button>

          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={activeStep === steps.length - 1 ? <CheckCircle /> : <ArrowForward />}
            sx={{
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              color: 'white',
              fontWeight: 700,
              px: 4,
              py: 1.5,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(242, 159, 5, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 25px rgba(242, 159, 5, 0.5)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            {activeStep === steps.length - 1 ? 'Zur Community' : 'Weiter'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

