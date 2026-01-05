'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  IconButton,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Moon,
  Brain,
  Star,
  Zap,
  TrendingUp,
  Calendar,
  Activity,
  Eye,
  Heart,
  Target,
  Sparkles,
  BarChart3,
  ArrowRight,
  Info,
  Download,
  Share2
} from 'lucide-react';
import AccessControl from '../../components/AccessControl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface MoonInsight {
  id: string;
  title: string;
  description: string;
  category: 'emotional' | 'energetic' | 'spiritual' | 'practical';
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  timeframe: string;
  recommendations: string[];
}

interface MoonPhase {
  name: string;
  description: string;
  energy: string;
  recommendations: string[];
  color: string;
}

export default function AIMoonInsightsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<MoonInsight[]>([]);
  const [currentPhase, setCurrentPhase] = useState<MoonPhase | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [userSubscription, setUserSubscription] = useState<any>(null);

  useEffect(() => {
    loadUserSubscription();
    loadMoonInsights();
  }, []);

  const loadUserSubscription = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('userSubscription');
      if (stored) {
        try {
          setUserSubscription(JSON.parse(stored));
        } catch (error) {
          console.error('Error parsing user subscription:', error);
        }
      }
    }
  };

  const loadMoonInsights = async () => {
    setLoading(true);
    try {
      // Simuliere AI-Analyse der aktuellen Mondphase
      const mockInsights: MoonInsight[] = [
        {
          id: '1',
          title: 'Emotionale Intensität steigt',
          description: 'Die aktuelle Mondphase verstärkt emotionale Reaktionen. Achten Sie auf innere Signale.',
          category: 'emotional',
          confidence: 87,
          impact: 'high',
          timeframe: 'Nächste 3 Tage',
          recommendations: [
            'Tagebuch führen für emotionale Muster',
            'Meditation zur emotionalen Balance',
            'Kommunikation mit nahestehenden Personen'
          ]
        },
        {
          id: '2',
          title: 'Kreative Energie optimal',
          description: 'Perfekte Zeit für kreative Projekte und neue Ideen.',
          category: 'energetic',
          confidence: 92,
          impact: 'high',
          timeframe: 'Nächste 5 Tage',
          recommendations: [
            'Kreative Projekte starten',
            'Brainstorming-Sessions planen',
            'Künstlerische Aktivitäten ausüben'
          ]
        },
        {
          id: '3',
          title: 'Spirituelle Verbindung stärken',
          description: 'Ideale Zeit für spirituelle Praktiken und innere Reflexion.',
          category: 'spiritual',
          confidence: 78,
          impact: 'medium',
          timeframe: 'Nächste 7 Tage',
          recommendations: [
            'Meditation vertiefen',
            'Naturverbindung suchen',
            'Spirituelle Rituale praktizieren'
          ]
        }
      ];

      const mockPhase: MoonPhase = {
        name: 'Zunehmender Mond',
        description: 'Zeit des Wachstums und der Manifestation',
        energy: 'Aufbauend und dynamisch',
        recommendations: [
          'Neue Projekte starten',
          'Ziele setzen und verfolgen',
          'Energie für Wachstum nutzen'
        ],
        color: '#8b5cf6'
      };

      setInsights(mockInsights);
      setCurrentPhase(mockPhase);
    } catch (error) {
      console.error('Error loading moon insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emotional': return <Heart size={20} />;
      case 'energetic': return <Zap size={20} />;
      case 'spiritual': return <Star size={20} />;
      case 'practical': return <Target size={20} />;
      default: return <Activity size={20} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'emotional': return '#ef4444';
      case 'energetic': return '#f59e0b';
      case 'spiritual': return '#8b5cf6';
      case 'practical': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <AccessControl 
      path="/ai-moon-insights" 
      userSubscription={userSubscription}
    >
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
        color: 'white',
        py: 4
      }}>
        <Container maxWidth="xl">
          {/* Header */}
          <motion.div
            
            
            
          >
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography
                variant="h2"
                sx={{
                  background: 'linear-gradient(45deg, #8b5cf6, #a855f7)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2
                }}
              >
                <Brain size={48} />
                KI-Mond-Erkenntnisse
                <Moon size={48} />
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(254,243,199,0.8)', maxWidth: 600, mx: 'auto' }}>
                Künstliche Intelligenz analysiert Mondzyklen und gibt personalisierte Empfehlungen
              </Typography>
            </Box>
          </motion.div>

          {/* Navigation Button */}
          <motion.div
            
            
            
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: 6
            }}>
              <Link href="/premium-dashboard" passHref>
                <Button
                  variant="outlined"
                  startIcon={<BarChart3 size={20} />}
                  sx={{
                    borderColor: 'rgba(255, 215, 0, 0.3)',
                    color: '#FFD700',
                    fontWeight: 600,
                    px: 4,
                    py: 2,
                    borderRadius: 3,
                    fontSize: '1rem',
                    '&:hover': {
                      borderColor: '#FFD700',
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(255, 215, 0, 0.3)'
                    }
                  }}
                >
                  Zurück zum Premium Dashboard
                </Button>
              </Link>
            </Box>
          </motion.div>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#8b5cf6' }} />
            </Box>
          )}

          {!loading && (
            <>
              {/* Current Moon Phase */}
              {currentPhase && (
                <motion.div
                  
                  
                  
                >
                  <Card sx={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 3,
                    mb: 4
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Box sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${currentPhase.color}, ${currentPhase.color}80)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 3
                        }}>
                          <Moon size={30} color="white" />
                        </Box>
                        <Box>
                          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                            {currentPhase.name}
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {currentPhase.description}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
                        <strong>Energie:</strong> {currentPhase.energy}
                      </Typography>

                      <Box>
                        <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 2 }}>
                          Empfehlungen für diese Phase:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {currentPhase.recommendations.map((rec, index) => (
                            <Chip
                              key={index}
                              label={rec}
                              sx={{
                                background: 'rgba(139, 92, 246, 0.2)',
                                color: '#8b5cf6',
                                border: '1px solid rgba(139, 92, 246, 0.3)'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* AI Insights */}
              <Grid container spacing={3}>
                {insights.map((insight, index) => (
                  <Grid item xs={12} md={6} lg={4} key={insight.id}>
                    <motion.div
                      
                      
                      
                    >
                      <Card sx={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 3,
                        height: '100%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 25px rgba(139, 92, 246, 0.3)',
                          borderColor: 'rgba(139, 92, 246, 0.5)'
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              backgroundColor: getCategoryColor(insight.category),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2,
                              color: 'white'
                            }}>
                              {getCategoryIcon(insight.category)}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                {insight.title}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                                <Chip
                                  label={`${insight.confidence}%`}
                                  size="small"
                                  sx={{
                                    background: 'rgba(34, 197, 94, 0.2)',
                                    color: '#22c55e',
                                    fontSize: '0.7rem'
                                  }}
                                />
                                <Chip
                                  label={insight.impact}
                                  size="small"
                                  sx={{
                                    background: `${getImpactColor(insight.impact)}20`,
                                    color: getImpactColor(insight.impact),
                                    fontSize: '0.7rem'
                                  }}
                                />
                              </Box>
                            </Box>
                          </Box>

                          <Typography sx={{
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '0.9rem',
                            lineHeight: 1.5,
                            mb: 2
                          }}>
                            {insight.description}
                          </Typography>

                          <Typography variant="body2" sx={{ color: '#8b5cf6', mb: 2, fontWeight: 600 }}>
                            ⏰ {insight.timeframe}
                          </Typography>

                          <Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1, fontWeight: 600 }}>
                              Empfehlungen:
                            </Typography>
                            {insight.recommendations.map((rec, recIndex) => (
                              <Typography key={recIndex} variant="body2" sx={{ 
                                color: 'rgba(255,255,255,0.6)', 
                                fontSize: '0.8rem',
                                mb: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}>
                                <ArrowRight size={12} />
                                {rec}
                              </Typography>
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>

              {/* Info Section */}
              <motion.div
                
                
                
              >
                <Card sx={{
                  mt: 4,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 3
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Info size={24} />
                      Über KI-Mond-Erkenntnisse
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(254,243,199,0.8)', lineHeight: 1.6 }}>
                      Unsere KI analysiert kontinuierlich Mondzyklen, astrologische Daten und Ihre persönlichen 
                      Human Design Informationen, um personalisierte Erkenntnisse und Empfehlungen zu generieren. 
                      Die Algorithmen berücksichtigen emotionale Muster, energetische Zyklen und optimale Zeitpunkte 
                      für verschiedene Aktivitäten.
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </Container>
      </Box>
    </AccessControl>
  );
}
