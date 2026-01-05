'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Favorite,
  TrendingUp,
  Info,
  Download,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface ConnectionKeyReading {
  id: string;
  reading_type: string;
  reading_data: {
    type: string;
    title: string;
    question: string;
    person1: {
      name: string;
      birthdate: string;
      birthtime?: string;
      birthplace: string;
      email?: string;
    };
    person2: {
      name: string;
      birthdate: string;
      birthtime?: string;
      birthplace: string;
      email?: string;
    };
    notes?: string;
  };
  created_at: string;
}

export default function ConnectionKeyResultsPage() {
  const router = useRouter();
  const [reading, setReading] = useState<ConnectionKeyReading | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReading = async () => {
      try {
        const currentReadingId = localStorage.getItem('currentReadingId');
        
        if (!currentReadingId) {
          setError('Kein Reading gefunden. Bitte erstelle zuerst ein Connection Key Reading.');
          setLoading(false);
          return;
        }

        // Versuche aus localStorage zu laden
        const { safeLocalStorageParse } = await import('@/lib/utils/safeJson');
        const readings = safeLocalStorageParse<any[]>('userReadings', []) || [];
        const foundReading = readings.find((r: any) => r.id === currentReadingId);
        
        if (foundReading) {
          setReading(foundReading as ConnectionKeyReading);
          setLoading(false);
          return;
        }

        // Falls nicht in localStorage, versuche von API zu laden
        const response = await fetch(`/api/readings`);
        if (response.ok) {
          const data = await response.json();
          const foundReading = data.readings?.find((r: any) => r.id === currentReadingId);
          if (foundReading) {
            setReading(foundReading as ConnectionKeyReading);
          } else {
            setError('Reading nicht gefunden.');
          }
        } else {
          setError('Fehler beim Laden des Readings.');
        }
      } catch (err: any) {
        console.error('Fehler beim Laden:', err);
        setError(err.message || 'Fehler beim Laden des Readings');
      } finally {
        setLoading(false);
      }
    };

    loadReading();
  }, []);

  // Sparkle-Positionen für animierte Hintergrund-Funken
  const sparklePositions = [
    { left: 15, top: 20 }, { left: 75, top: 35 }, { left: 45, top: 60 },
    { left: 85, top: 15 }, { left: 25, top: 80 }, { left: 65, top: 45 },
    { left: 10, top: 55 }, { left: 90, top: 70 }, { left: 35, top: 25 },
    { left: 55, top: 85 }, { left: 70, top: 10 }, { left: 30, top: 90 },
    { left: 50, top: 40 }, { left: 20, top: 65 }, { left: 80, top: 50 }
  ];

  const sparkleAnimations = [
    { duration: 2.5, delay: 0.3 }, { duration: 3.2, delay: 1.1 }, { duration: 2.8, delay: 0.7 },
    { duration: 3.5, delay: 1.5 }, { duration: 2.3, delay: 0.5 }, { duration: 3.8, delay: 1.8 },
    { duration: 2.6, delay: 0.9 }, { duration: 3.0, delay: 1.2 }, { duration: 2.9, delay: 0.4 },
    { duration: 3.3, delay: 1.6 }, { duration: 2.7, delay: 0.8 }, { duration: 3.6, delay: 1.4 },
    { duration: 2.4, delay: 0.6 }, { duration: 3.1, delay: 1.3 }, { duration: 2.5, delay: 0.9 }
  ];

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: `
            radial-gradient(circle at 20% 20%, rgba(242, 159, 5, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(140, 29, 4, 0.1) 0%, transparent 50%),
            linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
          `,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress sx={{ color: '#F29F05' }} />
      </Box>
    );
  }

  if (error || !reading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: `
            radial-gradient(circle at 20% 20%, rgba(242, 159, 5, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(140, 29, 4, 0.1) 0%, transparent 50%),
            linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
          `,
          pt: 8,
          pb: 8,
        }}
      >
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mb: 4 }}>
            {error || 'Reading nicht gefunden'}
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => router.push('/resonanzanalyse/sofort')}
            sx={{
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            Zurück zum Onboarding
          </Button>
        </Container>
      </Box>
    );
  }

  const readingData = reading.reading_data;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 20%, rgba(242, 159, 5, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(140, 29, 4, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(242, 159, 5, 0.08) 0%, transparent 50%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        backgroundAttachment: 'fixed',
        position: 'relative',
        pt: 4,
        pb: 8,
        overflow: 'hidden',
      }}
    >
      {/* Animated Gradient Circles */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: `${600 + i * 200}px`,
            height: `${600 + i * 200}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(242, 159, 5, ${0.08 - i * 0.02}), transparent)`,
            left: `${20 + i * 30}%`,
            top: `${10 + i * 20}%`,
            pointerEvents: 'none',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, Math.sin(i) * 50, 0],
            y: [0, Math.cos(i) * 50, 0],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Sparkles */}
      {sparklePositions.map((pos, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            left: `${pos.left}%`,
            top: `${pos.top}%`,
            width: '4px',
            height: '4px',
            background: '#F29F05',
            borderRadius: '50%',
            boxShadow: '0 0 6px rgba(242, 159, 5, 0.8)',
            pointerEvents: 'none',
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: sparkleAnimations[i].duration,
            delay: sparkleAnimations[i].delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ position: 'relative', width: '100%', maxWidth: 400, height: 200, mx: 'auto' }}>
            <Image
              src="/images/connection-key-optimized.png"
              alt="The Connection Key"
              fill
              style={{ objectFit: 'contain' }}
              priority
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </Box>
        </Box>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(242, 159, 5, 0.3)',
              mb: 4,
              textAlign: 'center',
            }}
          >
            <CardContent sx={{ py: 4 }}>
              <CheckCircle sx={{ fontSize: 64, color: '#F29F05', mb: 2 }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Connection Key erfolgreich erstellt! 🎉
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
                Deine Resonanzanalyse wurde gespeichert und wird nun berechnet.
              </Typography>
              <Chip
                label={readingData.title || 'Connection Key Reading'}
                sx={{
                  background: 'rgba(242, 159, 5, 0.2)',
                  color: '#F29F05',
                  fontWeight: 600,
                  fontSize: '1rem',
                  py: 2.5,
                }}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Reading Details */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Person 1 */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                height: '100%',
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700,
                  }}
                >
                  <Favorite sx={{ fontSize: 20, mr: 1, color: '#F29F05', verticalAlign: 'middle' }} />
                  Person 1
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1 }}>
                  <strong>Name:</strong> {readingData.person1.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1 }}>
                  <strong>Geburtsdatum:</strong> {readingData.person1.birthdate}
                </Typography>
                {readingData.person1.birthtime && (
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1 }}>
                    <strong>Geburtszeit:</strong> {readingData.person1.birthtime}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  <strong>Geburtsort:</strong> {readingData.person1.birthplace}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Person 2 */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                height: '100%',
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700,
                  }}
                >
                  <TrendingUp sx={{ fontSize: 20, mr: 1, color: '#F29F05', verticalAlign: 'middle' }} />
                  Person 2
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1 }}>
                  <strong>Name:</strong> {readingData.person2.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1 }}>
                  <strong>Geburtsdatum:</strong> {readingData.person2.birthdate}
                </Typography>
                {readingData.person2.birthtime && (
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 1 }}>
                    <strong>Geburtszeit:</strong> {readingData.person2.birthtime}
                  </Typography>
                )}
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  <strong>Geburtsort:</strong> {readingData.person2.birthplace}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Question */}
          {readingData.question && (
            <Grid item xs={12}>
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(242, 159, 5, 0.3)',
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      color: '#F29F05',
                      fontWeight: 700,
                    }}
                  >
                    <Info sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
                    Deine Frage
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {readingData.question}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Info Box */}
        <Card
          sx={{
            background: 'rgba(242, 159, 5, 0.1)',
            border: '1px solid rgba(242, 159, 5, 0.3)',
            mb: 4,
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              sx={{
                color: '#F29F05',
                fontWeight: 700,
                mb: 2,
              }}
            >
              💡 Nächste Schritte
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2, lineHeight: 1.8 }}>
              Dein Connection Key Reading wird nun berechnet. Dies kann einige Minuten dauern.
              Sobald die Analyse fertig ist, wird sie in deinem Dashboard angezeigt.
            </Typography>
            <Box component="ul" sx={{ color: 'rgba(255, 255, 255, 0.8)', pl: 2 }}>
              <li>Die Resonanzanalyse zeigt Goldadern und komplementäre Tore zwischen euch</li>
              <li>Du erhältst Einblicke in die energetische Verbindung</li>
              <li>Das Reading wird in deiner Reading-Liste gespeichert</li>
            </Box>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => router.push('/resonanzanalyse/sofort')}
            sx={{
              borderColor: 'rgba(242, 159, 5, 0.5)',
              color: '#F29F05',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              '&:hover': {
                borderColor: '#F29F05',
                background: 'rgba(242, 159, 5, 0.1)',
              },
            }}
          >
            Neues Reading
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push('/resonanzanalyse/next-steps')}
            sx={{
              borderColor: 'rgba(242, 159, 5, 0.5)',
              color: '#F29F05',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              '&:hover': {
                borderColor: '#F29F05',
                background: 'rgba(242, 159, 5, 0.1)',
              },
            }}
          >
            Nächste Schritte
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => router.push('/dashboard')}
            sx={{
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              color: '#fff',
              fontWeight: 700,
              px: 4,
              py: 1.5,
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(242, 159, 5, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 25px rgba(242, 159, 5, 0.5)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Zum Dashboard
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

