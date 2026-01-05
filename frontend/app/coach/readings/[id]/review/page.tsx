'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Slider,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import Image from 'next/image';
import CoachAuth from '@/components/CoachAuth';
import CoachNavigation from '@/components/CoachNavigation';
import { getReadingType } from '@/lib/readingTypes';

interface ReadingData {
  id: string;
  readingType: string;
  clientName: string;
  generatedText: string | null;
  approvalStatus: string;
}

function ReviewReadingPageContent() {
  const params = useParams();
  const router = useRouter();
  const readingId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reading, setReading] = useState<ReadingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Metriken (0-5)
  const [clarity, setClarity] = useState<number>(3);
  const [relevance, setRelevance] = useState<number>(3);
  const [depth, setDepth] = useState<number>(3);
  const [tone, setTone] = useState<number>(3);
  const [actionability, setActionability] = useState<number>(3);
  const [comment, setComment] = useState<string>('');

  const readingConfig = reading ? getReadingType(reading.readingType) : null;

  // Berechne Durchschnitt
  const averageScore = ((clarity + relevance + depth + tone + actionability) / 5).toFixed(2);

  useEffect(() => {
    if (!readingId) return;

    const loadReading = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/coach/readings-v2/${readingId}`);
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        if (!data.success || !data.reading) {
          throw new Error('Ungültige Antwort vom Server');
        }

        // Lade Version mit generatedText
        const versionResponse = await fetch(`/api/coach/readings-v2/${readingId}/versions/${data.reading.currentVersionId}`);
        if (versionResponse.ok) {
          const versionData = await versionResponse.json();
          if (versionData.success && versionData.version) {
            setReading({
              id: data.reading.id,
              readingType: data.reading.readingType,
              clientName: data.reading.clientName,
              generatedText: versionData.version.generatedText,
              approvalStatus: data.reading.approvalStatus || 'draft',
            });
          }
        } else {
          setReading({
            id: data.reading.id,
            readingType: data.reading.readingType,
            clientName: data.reading.clientName,
            generatedText: null,
            approvalStatus: data.reading.approvalStatus || 'draft',
          });
        }
      } catch (err: any) {
        console.error('Fehler beim Laden des Readings:', err);
        setError(err.message || 'Fehler beim Laden des Readings');
      } finally {
        setLoading(false);
      }
    };

    loadReading();
  }, [readingId]);

  const handleSubmit = async (action: 'approve' | 'revision_required') => {
    if (!reading) return;

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch(`/api/coach/readings/${readingId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clarity,
          relevance,
          depth,
          tone,
          actionability,
          comment: comment.trim() || undefined,
          action,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Fehler beim Speichern der Review');
      }

      setSubmitSuccess(true);

      // Nach 2 Sekunden zurück zur Reading-Seite
      setTimeout(() => {
        router.push(`/coach/readings-v2/${readingId}`);
      }, 2000);
    } catch (err: any) {
      console.error('Fehler beim Speichern der Review:', err);
      setSubmitError(err.message || 'Fehler beim Speichern der Review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0b0a0f' }}>
        <CircularProgress sx={{ color: '#e8b86d' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, background: '#0b0a0f', minHeight: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!reading) {
    return (
      <Box sx={{ p: 4, background: '#0b0a0f', minHeight: '100vh' }}>
        <Alert severity="info">Reading nicht gefunden.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ background: '#0b0a0f', minHeight: '100vh' }}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 1100 }}>
        <CoachNavigation />
      </Box>
      <Container sx={{ py: { xs: 4, md: 8 } }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 6 } }}>
          <Box
            sx={{
              position: 'relative',
              width: { xs: '100%', md: 600 },
              maxWidth: 600,
              height: { xs: 120, md: 180 },
              mx: 'auto',
            }}
          >
            <Image
              src="/images/connection-key-optimized.png"
              alt="The Connection Key"
              fill
              style={{ objectFit: 'contain' }}
              priority
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ maxWidth: '1000px', mx: 'auto' }}>
          {/* Header */}
          <Box sx={{ mb: { xs: 3, md: 4 }, px: { xs: 2, md: 0 } }}>
            <Typography 
              variant="h4" 
              sx={{ 
                color: '#ffffff', 
                fontWeight: 700, 
                mb: 1,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
              }}
            >
              Reading-Qualität bewerten
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.5 }}>
              {readingConfig?.label || reading.readingType} • {reading.clientName}
            </Typography>
            <Chip
              label={`Durchschnitt: ${averageScore}/5.0`}
              sx={{
                background: 'rgba(232, 184, 109, 0.2)',
                color: '#e8b86d',
                fontWeight: 600,
              }}
            />
          </Box>

          {/* Reading-Text */}
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              mb: 4,
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                Generierter Text
              </Typography>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 2 }} />
              {reading.generatedText ? (
                <Typography
                  sx={{
                    color: '#ffffff',
                    whiteSpace: 'pre-line',
                    lineHeight: 1.8,
                  }}
                >
                  {reading.generatedText}
                </Typography>
              ) : (
                <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
                  Noch kein Text verfügbar
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Qualitätsmetriken */}
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              mb: { xs: 3, md: 4 },
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#ffffff', 
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: '1rem', md: '1.25rem' },
                }}
              >
                Qualitätsmetriken (0-5)
              </Typography>

              {/* Clarity */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: '#ffffff', fontWeight: 600 }}>
                    Clarity (Verständlichkeit, Struktur, Sprachfluss)
                  </Typography>
                  <Typography sx={{ color: '#e8b86d', fontWeight: 600 }}>
                    {clarity}/5
                  </Typography>
                </Box>
                <Slider
                  value={clarity}
                  onChange={(_, value) => setClarity(value as number)}
                  min={0}
                  max={5}
                  step={0.5}
                  marks
                  sx={{
                    color: '#e8b86d',
                    '& .MuiSlider-markLabel': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                />
              </Box>

              {/* Relevance */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: '#ffffff', fontWeight: 600 }}>
                    Relevance (Bezug zum Reading-Typ, keine Halluzinationen)
                  </Typography>
                  <Typography sx={{ color: '#e8b86d', fontWeight: 600 }}>
                    {relevance}/5
                  </Typography>
                </Box>
                <Slider
                  value={relevance}
                  onChange={(_, value) => setRelevance(value as number)}
                  min={0}
                  max={5}
                  step={0.5}
                  marks
                  sx={{
                    color: '#e8b86d',
                    '& .MuiSlider-markLabel': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                />
              </Box>

              {/* Depth */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: '#ffffff', fontWeight: 600 }}>
                    Depth (Mehrwert, Erkenntnistiefe, nicht oberflächlich)
                  </Typography>
                  <Typography sx={{ color: '#e8b86d', fontWeight: 600 }}>
                    {depth}/5
                  </Typography>
                </Box>
                <Slider
                  value={depth}
                  onChange={(_, value) => setDepth(value as number)}
                  min={0}
                  max={5}
                  step={0.5}
                  marks
                  sx={{
                    color: '#e8b86d',
                    '& .MuiSlider-markLabel': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                />
              </Box>

              {/* Tone */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: '#ffffff', fontWeight: 600 }}>
                    Tone (passend zur Marke, empathisch, konsistent)
                  </Typography>
                  <Typography sx={{ color: '#e8b86d', fontWeight: 600 }}>
                    {tone}/5
                  </Typography>
                </Box>
                <Slider
                  value={tone}
                  onChange={(_, value) => setTone(value as number)}
                  min={0}
                  max={5}
                  step={0.5}
                  marks
                  sx={{
                    color: '#e8b86d',
                    '& .MuiSlider-markLabel': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                />
              </Box>

              {/* Actionability */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography sx={{ color: '#ffffff', fontWeight: 600 }}>
                    Actionability (konkrete Hinweise, umsetzbare Impulse)
                  </Typography>
                  <Typography sx={{ color: '#e8b86d', fontWeight: 600 }}>
                    {actionability}/5
                  </Typography>
                </Box>
                <Slider
                  value={actionability}
                  onChange={(_, value) => setActionability(value as number)}
                  min={0}
                  max={5}
                  step={0.5}
                  marks
                  sx={{
                    color: '#e8b86d',
                    '& .MuiSlider-markLabel': {
                      color: 'rgba(255, 255, 255, 0.7)',
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* Kommentar */}
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              mb: 4,
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                Kommentar (optional)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ihre Anmerkungen zur Qualität..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#e8b86d',
                    },
                  },
                }}
              />
            </CardContent>
          </Card>

          {/* Aktionen */}
          <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />}
              onClick={() => handleSubmit('approve')}
              disabled={submitting || submitSuccess}
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #66bb6a 100%)',
                color: '#ffffff',
                px: { xs: 2, md: 4 },
                py: { xs: 1, md: 1.5 },
                fontSize: { xs: '0.8125rem', md: '1rem' },
                fontWeight: 600,
                textTransform: 'none',
                '&:hover:not(:disabled)': {
                  background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                },
                '&:disabled': {
                  opacity: 0.5,
                },
              }}
            >
              {submitting ? 'Wird gespeichert...' : submitSuccess ? 'Gespeichert!' : 'Freigeben'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<EditIcon sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />}
              onClick={() => handleSubmit('revision_required')}
              disabled={submitting || submitSuccess}
              sx={{
                borderColor: '#ff9800',
                color: '#ff9800',
                px: { xs: 2, md: 4 },
                py: { xs: 1, md: 1.5 },
                fontSize: { xs: '0.8125rem', md: '1rem' },
                fontWeight: 600,
                textTransform: 'none',
                '&:hover:not(:disabled)': {
                  borderColor: '#ffb74d',
                  background: 'rgba(255, 152, 0, 0.1)',
                },
                '&:disabled': {
                  opacity: 0.5,
                },
              }}
            >
              Zur Überarbeitung
            </Button>
          </Box>

          {/* Fehler/Success */}
          {submitError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {submitError}
            </Alert>
          )}
          {submitSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Review gespeichert. Weiterleitung zur Reading-Seite...
            </Alert>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default function ReviewReadingPage() {
  return (
    <CoachAuth>
      <ReviewReadingPageContent />
    </CoachAuth>
  );
}

