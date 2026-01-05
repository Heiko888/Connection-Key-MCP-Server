'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Activity,
  Users,
  Zap,
  TrendingUp,
  Info,
  Star,
  BarChart3
} from 'lucide-react';
import RealtimeAnalysisModal from '../../components/RealtimeAnalysisModal';
import { ChartData, ChartService } from '../../lib/hd-bodygraph/chartService';
import AccessControl from '../../components/AccessControl';
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

function RealtimeAnalysisContent() {
  const [availableCharts, setAvailableCharts] = useState<ChartData[]>([]);
  const [selectedChart1, setSelectedChart1] = useState<string>('');
  const [selectedChart2, setSelectedChart2] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [quickAnalysis, setQuickAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userSubscription, setUserSubscription] = useState<any>(null);

  // Lade verfügbare Charts und Benutzer-Abonnement
  useEffect(() => {
    loadAvailableCharts();
    loadUserSubscription();
  }, []);

  const loadUserSubscription = () => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          console.log('🔍 Realtime-Analysis - User-Daten geladen:', user);
          const subscription = {
            userId: user.id || 'unknown',
            packageId: user.subscriptionPlan || 'basic',
            plan: user.subscriptionPlan || 'basic',
            status: user.subscriptionStatus || 'active',
            startDate: user.subscriptionStartDate || new Date().toISOString(),
            endDate: user.subscriptionEndDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            autoRenew: user.autoRenew || false,
            paymentMethod: user.paymentMethod || 'none',
            billingCycle: user.billingCycle || 'monthly'
          };
          console.log('💎 Realtime-Analysis - Premium-Status:', subscription.packageId);
          setUserSubscription(subscription);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  };

  const loadAvailableCharts = async () => {
    setLoading(true);
    try {
      const charts = ChartService.getDemoCharts();
      setAvailableCharts(charts);
      
      // Setze erste zwei Charts als Standard
      if (charts.length >= 2) {
        setSelectedChart1(charts[0].id);
        setSelectedChart2(charts[1].id);
      }
    } catch (err) {
      setError('Fehler beim Laden der Charts');
      console.error('Error loading charts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAnalysis = async () => {
    if (!selectedChart1 || !selectedChart2) {
      setError('Bitte wähle zwei Charts aus');
      return;
    }

    if (selectedChart1 === selectedChart2) {
      setError('Bitte wähle zwei verschiedene Charts aus');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const chart1 = availableCharts.find(c => c.id === selectedChart1);
      const chart2 = availableCharts.find(c => c.id === selectedChart2);

      if (!chart1 || !chart2) {
        setError('Charts nicht gefunden');
        return;
      }

      // RealtimeAnalysisService wird später implementiert
      // const result = await RealtimeAnalysisService.analyzeCharts(chart1, chart2);
      const result = null;
      setQuickAnalysis(result);
    } catch (err) {
      setError('Fehler bei der Analyse');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartDetailedAnalysis = () => {
    if (!selectedChart1 || !selectedChart2) {
      setError('Bitte wähle zwei Charts aus');
      return;
    }

    if (selectedChart1 === selectedChart2) {
      setError('Bitte wähle zwei verschiedene Charts aus');
      return;
    }

    setShowAnalysis(true);
  };

  const getChart1 = () => availableCharts.find(c => c.id === selectedChart1);
  const getChart2 = () => availableCharts.find(c => c.id === selectedChart2);

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#ef4444';
    return '#6b7280';
  };

  const getCompatibilityLabel = (score: number) => {
    if (score >= 80) return 'Sehr hoch';
    if (score >= 60) return 'Hoch';
    if (score >= 40) return 'Mittel';
    return 'Niedrig';
  };

  return (
    <AccessControl 
      path="/realtime-analysis" 
      userSubscription={userSubscription}
    >
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse at top, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
          radial-gradient(ellipse at bottom, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
          linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)
        `,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Floating Stars Background */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}>
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                color: 'rgba(255, 255, 255, 0.3)',
                fontSize: '12px'
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            >
              ✨
            </motion.div>
          ))}
        </Box>

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
          {/* Header */}
          <motion.div
            
            
            
          >
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Activity size={48} color="#10B981" />
                <Typography variant="h2" sx={{ ml: 2, fontWeight: 700, background: 'linear-gradient(45deg, #10B981, #34D399)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Echtzeit-Analyse
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 3 }}>
                Analysiere die energetische Kompatibilität zwischen zwei Human Design Charts in Echtzeit
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Chip 
                  icon={<Zap size={16} />} 
                  label="Echtzeit" 
                  sx={{ 
                    background: 'linear-gradient(45deg, #10B981, #34D399)',
                    color: 'white',
                    fontWeight: 600,
                    px: 2,
                    py: 1
                  }} 
                />
                <Chip 
                  icon={<TrendingUp size={16} />} 
                  label="Live-Analyse" 
                  sx={{ 
                    background: 'linear-gradient(45deg, #F59E0B, #FCD34D)',
                    color: 'white',
                    fontWeight: 600,
                    px: 2,
                    py: 1
                  }} 
                />
                <Button
                  variant="outlined"
                  component={Link}
                  href="/premium-dashboard"
                  startIcon={<BarChart3 size={20} />}
                  sx={{
                    color: '#FFD700',
                    borderColor: '#FFD700',
                    '&:hover': {
                      borderColor: '#FFD700',
                      backgroundColor: 'rgba(255, 215, 0, 0.1)',
                      boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                    }
                  }}
                >
                  ← Zurück zum Premium Dashboard
                </Button>
              </Box>
            </Box>
          </motion.div>


        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#FFD700' }} />
          </Box>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              bgcolor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            {error}
          </Alert>
        )}

        {!loading && (
          <motion.div
            
            
            
          >
            <Grid container spacing={4}>
              {/* Chart-Auswahl */}
              <Grid item xs={12} md={6}>
                <motion.div
                  
                  
                  
                >
                <Paper elevation={0} sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                  height: '100%'
                }}>
                  <Box sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Users size={24} color="#10B981" />
                      <Typography variant="h5" sx={{ ml: 2, fontWeight: 600 }}>Chart-Auswahl</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <FormControl fullWidth>
                        <InputLabel sx={{ color: '#fef3c7' }}>Erstes Chart</InputLabel>
                        <Select
                          value={selectedChart1}
                          onChange={(e) => setSelectedChart1(e.target.value)}
                          sx={{
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255,255,255,0.3)'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#FFD700'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#FFD700'
                            }
                          }}
                        >
                          {availableCharts.map((chart) => (
                            <MenuItem key={chart.id} value={chart.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip 
                                  label={chart.type} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: 'rgba(255, 215, 0, 0.2)',
                                    color: '#FFD700'
                                  }} 
                                />
                                <Typography sx={{ color: 'white' }}>
                                  {chart.name}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth>
                        <InputLabel sx={{ color: '#fef3c7' }}>Zweites Chart</InputLabel>
                        <Select
                          value={selectedChart2}
                          onChange={(e) => setSelectedChart2(e.target.value)}
                          sx={{
                            color: 'white',
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(255,255,255,0.3)'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#FFD700'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#FFD700'
                            }
                          }}
                        >
                          {availableCharts.map((chart) => (
                            <MenuItem key={chart.id} value={chart.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Chip 
                                  label={chart.type} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: 'rgba(255, 215, 0, 0.2)',
                                    color: '#FFD700'
                                  }} 
                                />
                                <Typography sx={{ color: 'white' }}>
                                  {chart.name}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                          variant="contained"
                          onClick={handleQuickAnalysis}
                          disabled={isAnalyzing || !selectedChart1 || !selectedChart2}
                          startIcon={isAnalyzing ? <CircularProgress size={20} /> : <Zap size={20} />}
                          sx={{
                            background: 'linear-gradient(45deg, #10B981, #34D399)',
                            color: 'white',
                            fontWeight: 600,
                            px: 4,
                            py: 2,
                            borderRadius: 3,
                            fontSize: '1rem',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #059669, #10B981)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)'
                            },
                            '&:disabled': {
                              bgcolor: 'rgba(255, 255, 255, 0.1)',
                              color: 'rgba(255, 255, 255, 0.3)'
                            }
                          }}
                        >
                          {isAnalyzing ? 'Analysiere...' : 'Schnell-Analyse'}
                        </Button>

                        <Button
                          variant="outlined"
                          onClick={handleStartDetailedAnalysis}
                          disabled={!selectedChart1 || !selectedChart2}
                          startIcon={<Activity size={20} />}
                          sx={{
                            color: '#F59E0B',
                            borderColor: '#F59E0B',
                            fontWeight: 600,
                            px: 4,
                            py: 2,
                            borderRadius: 3,
                            fontSize: '1rem',
                            '&:hover': {
                              borderColor: '#D97706',
                              bgcolor: 'rgba(245, 158, 11, 0.1)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 8px 25px rgba(245, 158, 11, 0.3)'
                            }
                          }}
                        >
                          Live-Analyse
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            </Grid>

              {/* Schnell-Analyse Ergebnis */}
              <Grid item xs={12} md={6}>
                <motion.div
                  
                  
                  
                >
                <Paper elevation={0} sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 3,
                  height: '100%'
                }}>
                  <Box sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <TrendingUp size={24} color="#F59E0B" />
                      <Typography variant="h5" sx={{ ml: 2, fontWeight: 600 }}>Analyse-Ergebnis</Typography>
                    </Box>

                    {quickAnalysis ? (
                      <Box>
                        {/* Kompatibilitäts-Score */}
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                          <Typography variant="h3" sx={{ 
                            color: getCompatibilityColor(quickAnalysis.analysis.compatibilityScore),
                            fontWeight: 700,
                            mb: 1
                          }}>
                            {quickAnalysis.analysis.compatibilityScore}%
                          </Typography>
                          <Chip
                            label={getCompatibilityLabel(quickAnalysis.analysis.compatibilityScore)}
                            sx={{
                              bgcolor: getCompatibilityColor(quickAnalysis.analysis.compatibilityScore),
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </Box>

                        {/* Energetische Dynamiken */}
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2 }}>
                            Energetische Dynamiken
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ color: '#ef4444' }}>
                                  {quickAnalysis.analysis.energeticDynamics.attraction}%
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.8)' }}>
                                  Anziehung
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ color: '#22c55e' }}>
                                  {quickAnalysis.analysis.energeticDynamics.harmony}%
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.8)' }}>
                                  Harmonie
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ color: '#f59e0b' }}>
                                  {quickAnalysis.analysis.energeticDynamics.challenge}%
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.8)' }}>
                                  Herausforderung
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ color: '#8b5cf6' }}>
                                  {quickAnalysis.analysis.energeticDynamics.growth}%
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.8)' }}>
                                  Wachstum
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>

                        {/* Beziehungs-Wahrscheinlichkeit */}
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                          <Typography variant="h6" sx={{ color: '#fef3c7', mb: 1 }}>
                            Beziehungs-Wahrscheinlichkeit
                          </Typography>
                          <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 700 }}>
                            {quickAnalysis.analysis.relationshipProbability}%
                          </Typography>
                        </Box>

                        {/* Top Insights */}
                        {quickAnalysis.insights.length > 0 && (
                          <Box>
                            <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Star size={20} />
                              Top Insights
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              {quickAnalysis.insights.slice(0, 3).map((insight: any, index: any) => (
                                <Paper
                                  key={index}
                                  sx={{
                                    p: 2,
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                  }}
                                >
                                  <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.8)' }}>
                                    {insight}
                                  </Typography>
                                </Paper>
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%',
                        minHeight: 300,
                        textAlign: 'center'
                      }}>
                        <Info size={48} color="#6b7280" />
                        <Typography variant="h6" sx={{ color: 'rgba(254,243,199,0.6)', mt: 2 }}>
                          Wähle zwei Charts aus und starte eine Analyse
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.4)', mt: 1 }}>
                          Erhalte detaillierte Einblicke in die energetische Kompatibilität
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {/* Info-Box */}
        <motion.div
          
          
          
        >
          <Paper elevation={0} sx={{
            mt: 4,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3
          }}>
            <Box sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Info size={24} color="#8B5CF6" />
                <Typography variant="h6" sx={{ ml: 2, fontWeight: 600 }}>Über die Echtzeit-Analyse</Typography>
              </Box>
              <Typography variant="body1" sx={{ color: 'rgba(254,243,199,0.8)', lineHeight: 1.6 }}>
                Die Echtzeit-Analyse verwendet fortschrittliche Algorithmen, um die energetische Kompatibilität 
                zwischen zwei Human Design Charts zu berechnen. Sie berücksichtigt HD-Typ, Profil, Autorität, 
                Zentren, Kanäle und Tore, um eine umfassende Bewertung der Beziehungsdynamik zu erstellen.
              </Typography>
            </Box>
          </Paper>
        </motion.div>
        </Container>
      </Box>

      {/* Realtime Analysis Modal */}
      {showAnalysis && getChart1() && getChart2() && (
        <RealtimeAnalysisModal
          open={showAnalysis}
          onClose={() => setShowAnalysis(false)}
          chart1={getChart1()!}
          chart2={getChart2()!}
        />
      )}
    </AccessControl>
  );
}

// Hauptkomponente mit ProtectedRoute
export default function RealtimeAnalysisPage() {
  return (
    <ProtectedRoute requiredRole="vip">
      <RealtimeAnalysisContent />
    </ProtectedRoute>
  );
}
