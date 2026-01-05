'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import {
  ExpandMore,
  Favorite,
  TrendingUp,
  CheckCircle,
  Info,
  Psychology,
  Favorite as HeartIcon,
  Bolt,
  People,
  AutoAwesome,
} from '@mui/icons-material';
import {
  analyzeConnectionKey,
  formatConnectionKeyAnalysis,
  type ConnectionKeyAnalysis,
} from '@/lib/human-design';
import {
  calculateCenters,
  type CenterStatus,
} from '@/lib/human-design';
import {
  calculateTypeAndAuthority,
  type HDType,
  type HDAuthority,
  type Strategy,
} from '@/lib/human-design';

interface ConnectionKeyAnalyzerProps {
  person1Gates: number[];
  person2Gates: number[];
  person1Centers: CenterStatus;
  person2Centers: CenterStatus;
  person1Type?: HDType;
  person2Type?: HDType;
  person1Profile?: string;
  person2Profile?: string;
  person1Authority?: HDAuthority;
  person2Authority?: HDAuthority;
  person1Strategy?: Strategy;
  person2Strategy?: Strategy;
  person1Name?: string;
  person2Name?: string;
}

export default function ConnectionKeyAnalyzer({
  person1Gates,
  person2Gates,
  person1Centers,
  person2Centers,
  person1Type,
  person2Type,
  person1Profile,
  person2Profile,
  person1Authority,
  person2Authority,
  person1Strategy,
  person2Strategy,
  person1Name = 'Person 1',
  person2Name = 'Person 2',
}: ConnectionKeyAnalyzerProps) {
  const [analysis, setAnalysis] = useState<ConnectionKeyAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | false>(false);
  const [error, setError] = useState<string | null>(null);

  const performAnalysis = () => {
    // Prüfe ob genug Daten vorhanden sind
    if (person1Gates.length === 0 || person2Gates.length === 0) {
      const errorMsg = `Nicht genug Daten für die Analyse. Person 1: ${person1Gates.length} Gates, Person 2: ${person2Gates.length} Gates.`;
      console.error('❌', errorMsg);
      setError(errorMsg);
      return;
    }

    console.log('🚀 Starting Connection Key analysis with:', {
      person1Gates: person1Gates.length,
      person2Gates: person2Gates.length,
      person1Centers: Object.keys(person1Centers).length,
      person2Centers: Object.keys(person2Centers).length,
      person1Type,
      person2Type,
      person1Profile,
      person2Profile
    });

    setLoading(true);
    setError(null);
    
    try {
      const result = analyzeConnectionKey(
        person1Gates,
        person2Gates,
        person1Centers,
        person2Centers,
        person1Type,
        person2Type,
        person1Profile,
        person2Profile,
        person1Authority,
        person2Authority,
        person1Strategy,
        person2Strategy
      );
      
      console.log('✅ Connection Key Analysis completed:', {
        totalResonancePoints: result.summary.totalResonancePoints,
        connectionStrength: result.summary.connectionStrength,
        dominantLevel: result.summary.dominantLevel,
        connectionKeys: result.connectionKeys.length,
        goldenThreads: result.goldenThreads.length,
        centers: result.centers.length
      });
      
      setAnalysis(result);
      console.log('📊 Full Analysis Result:', result);
      console.log('📝 Formatted Report:', formatConnectionKeyAnalysis(result));
    } catch (err) {
      console.error('❌ Error analyzing connection key:', err);
      const errorMessage = err instanceof Error ? err.message : 'Fehler bei der Analyse. Bitte versuche es erneut.';
      setError(errorMessage);
      console.error('Error details:', {
        message: errorMessage,
        stack: err instanceof Error ? err.stack : undefined,
        person1Gates: person1Gates.length,
        person2Gates: person2Gates.length
      });
    } finally {
      setLoading(false);
    }
  };

  // Automatisch analysieren wenn Daten vorhanden sind
  useEffect(() => {
    // Prüfe ob genug Daten vorhanden sind
    const person1GatesCount = person1Gates?.length || 0;
    const person2GatesCount = person2Gates?.length || 0;
    const hasEnoughData = person1GatesCount > 0 && person2GatesCount > 0;
    
    console.log('🔍 ConnectionKeyAnalyzer useEffect triggered:', {
      person1Gates: person1GatesCount,
      person2Gates: person2GatesCount,
      hasAnalysis: !!analysis,
      isLoading: loading,
      hasEnoughData
    });
    
    // Verhindere Endlosschleife: Nur einmal analysieren wenn Daten vorhanden sind
    if (hasEnoughData && !analysis && !loading) {
      console.log('🔄 Auto-starting Connection Key analysis...', {
        person1Gates: person1GatesCount,
        person2Gates: person2GatesCount
      });
      
      // Kleine Verzögerung, um sicherzustellen, dass alle Props gesetzt sind
      const timer = setTimeout(() => {
        performAnalysis();
      }, 100);
      
      return () => clearTimeout(timer);
    } else if (!hasEnoughData && person1GatesCount === 0 && person2GatesCount === 0) {
      // Nur Fehler setzen wenn wirklich keine Daten vorhanden sind (nicht bei jedem Render)
      if (!error || !error.includes('Nicht genug Daten')) {
        console.log('⚠️ Not enough data for analysis:', {
          person1Gates: person1GatesCount,
          person2Gates: person2GatesCount
        });
        setError(`Nicht genug Daten: Person 1 hat ${person1GatesCount} Gates, Person 2 hat ${person2GatesCount} Gates`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person1Gates?.length, person2Gates?.length, analysis, loading]);

  const handleAnalyze = () => {
    performAnalysis();
  };

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'mental':
        return <Psychology sx={{ fontSize: 20 }} />;
      case 'emotional':
        return <HeartIcon sx={{ fontSize: 20 }} />;
      case 'physical':
        return <Bolt sx={{ fontSize: 20 }} />;
      default:
        return <Info sx={{ fontSize: 20 }} />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'mental':
        return '#4A90E2';
      case 'emotional':
        return '#E24A90';
      case 'physical':
        return '#4AE2A0';
      default:
        return '#F29F05';
    }
  };

  const getInteractionColor = (interaction: string) => {
    switch (interaction) {
      case 'invitation':
        return '#4AE2A0';
      case 'reaction':
        return '#F29F05';
      case 'leadership':
        return '#4A90E2';
      case 'challenge':
        return '#E24A4A';
      default:
        return '#F29F05';
    }
  };

  return (
    <Box sx={{ width: '100%', pb: 2 }}>
      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.1), rgba(140, 29, 4, 0.1))',
          border: '2px solid rgba(242, 159, 5, 0.3)',
          borderRadius: 3,
          mb: { xs: 2, md: 3 },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AutoAwesome sx={{ fontSize: 32, color: '#F29F05', mr: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#fff' }}>
              🩵 Connection Key Resonanzanalyse
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
            Analysiere die energetische Verbindung zwischen {person1Name} und {person2Name}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              <CircularProgress sx={{ mb: 2, color: '#F29F05' }} />
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Analysiere Resonanz...
              </Typography>
            </Box>
          )}

          {!loading && !analysis && (
            <Box>
              <Button
                variant="contained"
                onClick={handleAnalyze}
                disabled={person1Gates.length === 0 || person2Gates.length === 0}
                startIcon={<Favorite />}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)',
                  },
                  '&:disabled': {
                    background: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.3)'
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Resonanzanalyse starten
              </Button>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                {person1Name}: {person1Gates.length} Gates | {person2Name}: {person2Gates.length} Gates
              </Typography>
            </Box>
          )}

          {analysis && (
            <Alert severity="success" sx={{ mb: 2, background: 'rgba(74, 226, 160, 0.1)', border: '1px solid rgba(74, 226, 160, 0.3)' }}>
              <Typography variant="body2" sx={{ color: '#4AE2A0', fontWeight: 600 }}>
                ✓ Analyse erfolgreich abgeschlossen
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <Box sx={{ pt: { xs: 1, md: 2 } }}>
          {/* Zusammenfassung */}
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 3 } }}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.2), rgba(242, 159, 5, 0.1))',
                  border: '2px solid rgba(242, 159, 5, 0.5)',
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <AutoAwesome sx={{ color: '#F29F05', mr: 1 }} />
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '1rem', md: '1.1rem' } }}>
                      Resonanzpunkte
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ color: '#F29F05', fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, mb: 0.5 }}>
                    {analysis.summary.totalResonancePoints}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: { xs: '0.85rem', md: '0.9rem' } }}>
                    Gefundene Verbindungen
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(74, 226, 160, 0.2), rgba(74, 226, 160, 0.1))',
                  border: '2px solid rgba(74, 226, 160, 0.5)',
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <TrendingUp sx={{ color: '#4AE2A0', mr: 1 }} />
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '1rem', md: '1.1rem' } }}>
                      Verbindungsstärke
                    </Typography>
                  </Box>
                  <Typography variant="h3" sx={{ color: '#4AE2A0', fontWeight: 800, fontSize: { xs: '2rem', md: '2.5rem' }, mb: 0.5 }}>
                    {analysis.summary.connectionStrength}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: { xs: '0.85rem', md: '0.9rem' } }}>
                    Energetische Resonanz
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.2), rgba(242, 159, 5, 0.1))',
                  border: '2px solid rgba(242, 159, 5, 0.5)',
                  borderRadius: 2,
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    {getLevelIcon(analysis.summary.dominantLevel)}
                    <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, ml: 1, fontSize: { xs: '1rem', md: '1.1rem' } }}>
                      Dominante Ebene
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: getLevelColor(analysis.summary.dominantLevel), 
                      fontWeight: 800,
                      fontSize: { xs: '1.5rem', md: '1.75rem' },
                      textTransform: 'capitalize',
                      mb: 0.5
                    }}
                  >
                    {analysis.summary.dominantLevel === 'mental' ? '🧠 Mental' : 
                     analysis.summary.dominantLevel === 'emotional' ? '❤️ Emotional' : 
                     '💪 Körperlich'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: { xs: '0.85rem', md: '0.9rem' } }}>
                    Hauptresonanz-Frequenz
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Energetische Zusammenfassung */}
          <Alert 
            severity="info" 
            icon={<Info />}
            sx={{ 
              mb: { xs: 2, md: 3 },
              background: 'rgba(242, 159, 5, 0.1)',
              border: '1px solid rgba(242, 159, 5, 0.3)',
              color: '#fff',
              p: { xs: 2, md: 2.5 },
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
              Energetische Zusammenfassung:
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.7 }}>
              {analysis.summary.energeticSummary}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Link href="/connection-key/booking" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{
                    borderColor: 'rgba(242, 159, 5, 0.5)',
                    color: '#F29F05',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#F29F05',
                      background: 'rgba(242, 159, 5, 0.1)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  🔍 Zur vollständigen Resonanzanalyse →
                </Button>
              </Link>
            </Box>
          </Alert>

          {/* Typ-Verbindung */}
          <Accordion
            expanded={expanded === 'type'}
            onChange={handleAccordionChange('type')}
            sx={{
              background: 'rgba(242, 159, 5, 0.1)',
              border: '1px solid rgba(242, 159, 5, 0.3)',
              mb: { xs: 1.5, md: 2 },
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#F29F05' }} />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <People sx={{ color: getInteractionColor(analysis.typeConnection.interaction), mr: 2 }} />
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                  Typ-Verbindung: {analysis.typeConnection.person1Type} ↔ {analysis.typeConnection.person2Type}
                </Typography>
                <Chip
                  label={analysis.typeConnection.interaction}
                  size="small"
                  sx={{
                    ml: 'auto',
                    background: getInteractionColor(analysis.typeConnection.interaction),
                    color: '#fff',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2, lineHeight: 1.7 }}>
                {analysis.typeConnection.description}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}>
                <strong>Energetische Dynamik:</strong> {analysis.typeConnection.energeticDynamics}
              </Typography>
            </AccordionDetails>
          </Accordion>

          {/* Connection Keys */}
          {analysis.connectionKeys.length > 0 && (
            <Accordion
              expanded={expanded === 'keys'}
              onChange={handleAccordionChange('keys')}
              sx={{
                background: 'rgba(242, 159, 5, 0.1)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                mb: { xs: 1.5, md: 2 },
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#F29F05' }} />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <AutoAwesome sx={{ color: '#F29F05', mr: 2 }} />
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                    Connection Keys ({analysis.connectionKeys.length})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: { xs: 2, md: 3 } }}>
                <Stack spacing={{ xs: 1.5, md: 2 }}>
                  {analysis.connectionKeys.map((key, idx) => (
                    <Card
                      key={idx}
                      sx={{
                        background: 'rgba(242, 159, 5, 0.15)',
                        border: `2px solid ${getLevelColor(key.type)}`,
                        borderRadius: 2,
                        p: { xs: 1.5, md: 2 },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getLevelIcon(key.type)}
                        <Typography variant="h6" sx={{ color: '#fff', ml: 1, fontWeight: 700 }}>
                          Kanal {key.channel}
                        </Typography>
                        <Chip
                          label={key.type}
                          size="small"
                          sx={{
                            ml: 'auto',
                            background: getLevelColor(key.type),
                            color: '#fff',
                            textTransform: 'capitalize',
                          }}
                        />
                      </Box>
                      <Typography variant="body1" sx={{ color: '#F29F05', fontWeight: 600, mb: 1 }}>
                        {key.theme}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        {key.description}
                      </Typography>
                    </Card>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Resonanzachsen */}
          {analysis.resonanceAxes && analysis.resonanceAxes.length > 0 && (
            <Accordion
              expanded={expanded === 'axes'}
              onChange={handleAccordionChange('axes')}
              sx={{
                background: 'rgba(242, 159, 5, 0.1)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                mb: { xs: 1.5, md: 2 },
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#F29F05' }} />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <AutoAwesome sx={{ color: '#F29F05', mr: 2 }} />
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                    🔗 Resonanzachsen ({analysis.resonanceAxes.length})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                  Komplementäre Tore, die durch eure Verbindung einen Kanal bilden können.
                </Typography>
                <Stack spacing={{ xs: 1.5, md: 2 }}>
                  {analysis.resonanceAxes.map((axis, idx) => (
                    <Card
                      key={idx}
                      sx={{
                        background: 'rgba(242, 159, 5, 0.15)',
                        border: `2px solid ${getLevelColor(axis.level)}`,
                        borderRadius: 2,
                        p: { xs: 1.5, md: 2 },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {getLevelIcon(axis.level)}
                        <Typography variant="h6" sx={{ color: '#fff', ml: 1, fontWeight: 700 }}>
                          Kanal {axis.channelName}
                        </Typography>
                        <Chip
                          label={axis.level}
                          size="small"
                          sx={{
                            ml: 'auto',
                            background: getLevelColor(axis.level),
                            color: '#fff',
                            textTransform: 'capitalize',
                          }}
                        />
                      </Box>
                      <Typography variant="body1" sx={{ color: '#F29F05', fontWeight: 600, mb: 1 }}>
                        {axis.theme}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                        {axis.description}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', display: 'block' }}>
                        {person1Name}: Tor {axis.person1HasGate} | {person2Name}: Tor {axis.person2HasGate}
                      </Typography>
                    </Card>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Goldadern */}
          {analysis.goldenThreads.length > 0 && (
            <Accordion
              expanded={expanded === 'threads'}
              onChange={handleAccordionChange('threads')}
              sx={{
                background: 'rgba(242, 159, 5, 0.1)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                mb: { xs: 1.5, md: 2 },
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#F29F05' }} />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <AutoAwesome sx={{ color: '#F29F05', mr: 2 }} />
                  <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                    ✨ Goldadern ({analysis.goldenThreads.length})
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: { xs: 2, md: 3 } }}>
                <Stack spacing={{ xs: 1.5, md: 2 }}>
                  {analysis.goldenThreads.map((thread, idx) => (
                    <Card
                      key={idx}
                      sx={{
                        background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.2), rgba(242, 159, 5, 0.1))',
                        border: '2px solid rgba(242, 159, 5, 0.5)',
                        borderRadius: 2,
                        p: { xs: 1.5, md: 2 },
                      }}
                    >
                      <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700, mb: 1 }}>
                        {thread.channel}: {thread.theme}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        {thread.description}
                      </Typography>
                    </Card>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Profil-Interaktion */}
          {analysis.profileInteraction && (
            <Accordion
              expanded={expanded === 'profile'}
              onChange={handleAccordionChange('profile')}
              sx={{
                background: 'rgba(242, 159, 5, 0.1)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                mb: { xs: 1.5, md: 2 },
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#F29F05' }} />}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '0.95rem', md: '1.1rem' } }}>
                  📋 Profil-Interaktion: {analysis.profileInteraction.person1Profile} ↔ {analysis.profileInteraction.person2Profile}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: { xs: 2, md: 3 } }}>
                {analysis.profileInteraction.description && (
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2, lineHeight: 1.7 }}>
                    {analysis.profileInteraction.description}
                  </Typography>
                )}
                {analysis.profileInteraction.learningFields.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ color: '#4AE2A0', fontWeight: 600, mb: 1 }}>
                      Lernfelder:
                    </Typography>
                    {analysis.profileInteraction.learningFields.map((field, idx) => (
                      <Typography key={idx} variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 0.5 }}>
                        • {field}
                      </Typography>
                    ))}
                  </Box>
                )}
                {analysis.profileInteraction.mirrorThemes && analysis.profileInteraction.mirrorThemes.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ color: '#8B5CF6', fontWeight: 600, mb: 1 }}>
                      Spiegelthemen:
                    </Typography>
                    {analysis.profileInteraction.mirrorThemes.map((theme, idx) => (
                      <Typography key={idx} variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 0.5 }}>
                        • {theme}
                      </Typography>
                    ))}
                  </Box>
                )}
                {analysis.profileInteraction.complementaryAspects.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: '#F29F05', fontWeight: 600, mb: 1 }}>
                      Komplementäre Aspekte:
                    </Typography>
                    {analysis.profileInteraction.complementaryAspects.map((aspect, idx) => (
                      <Typography key={idx} variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 0.5 }}>
                        • {aspect}
                      </Typography>
                    ))}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          )}

          {/* Autorität & Strategie */}
          {analysis.combinedAuthorityStrategy && (
            <Accordion
              expanded={expanded === 'authority'}
              onChange={handleAccordionChange('authority')}
              sx={{
                background: 'rgba(242, 159, 5, 0.1)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                mb: { xs: 1.5, md: 2 },
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#F29F05' }} />}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '0.95rem', md: '1.1rem' } }}>
                  🎯 Kombinierte Autorität & Strategie
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 2, lineHeight: 1.7 }}>
                  {analysis.combinedAuthorityStrategy.combinedDecisionLogic}
                </Typography>
                {analysis.combinedAuthorityStrategy.recommendations.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: '#4AE2A0', fontWeight: 600, mb: 1 }}>
                      Empfehlungen:
                    </Typography>
                    {analysis.combinedAuthorityStrategy.recommendations.map((rec, idx) => (
                      <Box key={idx} sx={{ display: 'flex', alignItems: 'start', mb: 1 }}>
                        <CheckCircle sx={{ color: '#4AE2A0', fontSize: 20, mr: 1, mt: 0.5 }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                          {rec}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          )}

          {/* Zentren-Vergleich */}
          <Accordion
            expanded={expanded === 'centers'}
            onChange={handleAccordionChange('centers')}
            sx={{
              background: 'rgba(242, 159, 5, 0.1)',
              border: '1px solid rgba(242, 159, 5, 0.3)',
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: '#F29F05' }} />}>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '0.95rem', md: '1.1rem' } }}>
                🔹 Zentren-Vergleich
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: { xs: 2, md: 3 } }}>
              <Grid container spacing={{ xs: 1.5, md: 2 }}>
                {analysis.centers.map((center, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Card
                      sx={{
                        background: center.type === 'resonance' 
                          ? 'rgba(74, 226, 160, 0.15)' 
                          : center.type === 'growth'
                          ? 'rgba(242, 159, 5, 0.15)'
                          : 'rgba(242, 159, 5, 0.15)',
                        border: `1px solid ${
                          center.type === 'resonance' 
                            ? 'rgba(74, 226, 160, 0.5)' 
                            : center.type === 'growth'
                            ? 'rgba(242, 159, 5, 0.5)'
                            : 'rgba(242, 159, 5, 0.5)'
                        }`,
                        borderRadius: 2,
                        p: { xs: 1.5, md: 2 },
                        height: '100%',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
                        {center.centerName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', mb: 0.5 }}>
                        {person1Name}: {center.person1}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', mb: 1 }}>
                        {person2Name}: {center.person2}
                      </Typography>
                      <Chip
                        label={center.type}
                        size="small"
                        sx={{
                          background: center.type === 'resonance' 
                            ? '#4AE2A0' 
                            : center.type === 'growth'
                            ? '#F29F05'
                            : '#F29F05',
                          color: '#fff',
                          fontSize: '0.7rem',
                          textTransform: 'capitalize',
                        }}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </Box>
  );
}

