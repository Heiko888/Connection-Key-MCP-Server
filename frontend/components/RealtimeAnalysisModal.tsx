'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  X,
  Zap,
  Heart,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Play,
  Pause,
  RotateCcw,
  Download,
  Share2,
  Activity,
  Users,
  Target,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartData } from '../lib/hd-bodygraph/chartService';

interface RealtimeAnalysisModalProps {
  open: boolean;
  onClose: () => void;
  chart1: ChartData;
  chart2: ChartData;
}

export default function RealtimeAnalysisModal({
  open,
  onClose,
  chart1,
  chart2
}: RealtimeAnalysisModalProps) {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const analysisRef = useRef<any>(null);

  // Initiale Analyse beim Öffnen
  useEffect(() => {
    if (open && chart1 && chart2) {
      performInitialAnalysis();
    }
  }, [open, chart1, chart2]);

  // Cleanup beim Schließen
  useEffect(() => {
    if (!open) {
      stopLiveAnalysis();
    }
  }, [open]);

  const performInitialAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // RealtimeAnalysisService wird später implementiert
      const result = null;
      setAnalysis(result);
      analysisRef.current = result;
      setLastUpdate(new Date());
    } catch (err) {
      setError('Fehler bei der Analyse');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const startLiveAnalysis = async () => {
    if (wsConnection) return;
    
    try {
      // RealtimeAnalysisService wird später implementiert
      const ws = null;
      
      setWsConnection(ws);
      setIsLive(true);
    } catch (err) {
      setError('Fehler beim Starten der Live-Analyse');
      console.error('Live analysis error:', err);
    }
  };

  const stopLiveAnalysis = () => {
    if (wsConnection) {
      wsConnection.close();
      setWsConnection(null);
    }
    setIsLive(false);
  };

  const toggleLiveAnalysis = () => {
    if (isLive) {
      stopLiveAnalysis();
    } else {
      startLiveAnalysis();
    }
  };

  const handleExport = () => {
    if (!analysis) return;
    
    const dataStr = JSON.stringify(analysis, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chart-analysis-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (!analysis) return;
    
    const shareData = {
      title: 'Human Design Chart Analyse',
      text: `Kompatibilität: ${analysis.analysis.compatibilityScore}%`,
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(JSON.stringify(analysis, null, 2));
    }
  };

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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          color: 'white',
          borderRadius: 3,
          minHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Activity size={24} color="#FFD700" />
          <Typography variant="h5" sx={{ color: '#FFD700', fontWeight: 600 }}>
            Echtzeit Chart-Analyse
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={isLive ? "Live-Analyse stoppen" : "Live-Analyse starten"}>
            <IconButton
              onClick={toggleLiveAnalysis}
              sx={{ 
                color: isLive ? '#22c55e' : '#FFD700',
                bgcolor: isLive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255, 215, 0, 0.1)'
              }}
            >
              {isLive ? <Pause size={20} /> : <Play size={20} />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Analyse neu starten">
            <IconButton onClick={performInitialAnalysis} sx={{ color: '#FFD700' }}>
              <RotateCcw size={20} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Exportieren">
            <IconButton onClick={handleExport} sx={{ color: '#FFD700' }}>
              <Download size={20} />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Teilen">
            <IconButton onClick={handleShare} sx={{ color: '#FFD700' }}>
              <Share2 size={20} />
            </IconButton>
          </Tooltip>
          
          <IconButton onClick={onClose} sx={{ color: '#FFD700' }}>
            <X size={20} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress sx={{ color: '#FFD700' }} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3, bgcolor: 'rgba(239, 68, 68, 0.1)' }}>
            {error}
          </Alert>
        )}

        {analysis && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header mit Live-Status */}
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: '#fef3c7', mb: 1 }}>
                    {chart1.name} ↔ {chart2.name}
                  </Typography>
                  {lastUpdate && (
                    <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)' }}>
                      Letztes Update: {lastUpdate.toLocaleTimeString()}
                    </Typography>
                  )}
                </Box>
                
                {isLive && (
                  <Chip
                    icon={<Activity size={16} />}
                    label="Live"
                    color="success"
                    variant="outlined"
                    sx={{ 
                      color: '#22c55e',
                      borderColor: '#22c55e',
                      animation: 'pulse 2s infinite'
                    }}
                  />
                )}
              </Box>

              {/* Haupt-Kompatibilitäts-Score */}
              <Card sx={{ 
                mb: 3, 
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: '#fef3c7' }}>
                      Gesamt-Kompatibilität
                    </Typography>
                    <Chip
                      label={getCompatibilityLabel(analysis.analysis.compatibilityScore)}
                      sx={{
                        bgcolor: getCompatibilityColor(analysis.analysis.compatibilityScore),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={analysis.analysis.compatibilityScore}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getCompatibilityColor(analysis.analysis.compatibilityScore),
                          borderRadius: 6
                        }
                      }}
                    />
                    <Typography
                      variant="h4"
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: 'white',
                        fontWeight: 700,
                        textShadow: '0 0 10px rgba(0,0,0,0.5)'
                      }}
                    >
                      {analysis.analysis.compatibilityScore}%
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.8)' }}>
                    Beziehungs-Wahrscheinlichkeit: {analysis.analysis.relationshipProbability}%
                  </Typography>
                </CardContent>
              </Card>

              {/* Energetische Dynamiken */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    height: '100%'
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Zap size={20} color="#FFD700" />
                        Energetische Dynamiken
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.8)' }}>
                              Anziehung
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#fef3c7' }}>
                              {analysis.analysis.energeticDynamics.attraction}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={analysis.analysis.energeticDynamics.attraction}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.1)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#ef4444',
                                borderRadius: 3
                              }
                            }}
                          />
                        </Box>
                        
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.8)' }}>
                              Harmonie
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#fef3c7' }}>
                              {analysis.analysis.energeticDynamics.harmony}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={analysis.analysis.energeticDynamics.harmony}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.1)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#22c55e',
                                borderRadius: 3
                              }
                            }}
                          />
                        </Box>
                        
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.8)' }}>
                              Herausforderung
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#fef3c7' }}>
                              {analysis.analysis.energeticDynamics.challenge}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={analysis.analysis.energeticDynamics.challenge}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.1)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#f59e0b',
                                borderRadius: 3
                              }
                            }}
                          />
                        </Box>
                        
                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.8)' }}>
                              Wachstum
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#fef3c7' }}>
                              {analysis.analysis.energeticDynamics.growth}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={analysis.analysis.energeticDynamics.growth}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.1)',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: '#8b5cf6',
                                borderRadius: 3
                              }
                            }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    height: '100%'
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Users size={20} color="#FFD700" />
                        Zentren-Interaktionen
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                          <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.8)', mb: 1 }}>
                            Komplementär ({analysis.analysis.centerInteractions.complementary.length})
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {analysis.analysis.centerInteractions.complementary.map((center: any, index: number) => (
                              <Chip
                                key={index}
                                label={center}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(34, 197, 94, 0.2)',
                                  color: '#22c55e',
                                  border: '1px solid rgba(34, 197, 94, 0.3)'
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                        
                        <Box>
                          <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.8)', mb: 1 }}>
                            Neutral ({analysis.analysis.centerInteractions.neutral.length})
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {analysis.analysis.centerInteractions.neutral.map((center: any, index: number) => (
                              <Chip
                                key={index}
                                label={center}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(107, 114, 128, 0.2)',
                                  color: '#9ca3af',
                                  border: '1px solid rgba(107, 114, 128, 0.3)'
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                        
                        <Box>
                          <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.8)', mb: 1 }}>
                            Konfliktierend ({analysis.analysis.centerInteractions.conflicting.length})
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {analysis.analysis.centerInteractions.conflicting.map((center: any, index: number) => (
                              <Chip
                                key={index}
                                label={center}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(239, 68, 68, 0.2)',
                                  color: '#ef4444',
                                  border: '1px solid rgba(239, 68, 68, 0.3)'
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Empfehlungen */}
              <Card sx={{ 
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Lightbulb size={20} color="#FFD700" />
                    Empfehlungen & Insights
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" sx={{ color: '#22c55e', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Star size={16} />
                        Stärken
                      </Typography>
                      <List dense>
                        {analysis.analysis.recommendations.strengths.map((strength: any, index: number) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <Star size={16} color="#22c55e" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={strength}
                              primaryTypographyProps={{ 
                                variant: 'body2',
                                sx: { color: 'rgba(254,243,199,0.8)' }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" sx={{ color: '#f59e0b', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AlertTriangle size={16} />
                        Herausforderungen
                      </Typography>
                      <List dense>
                        {analysis.analysis.recommendations.challenges.map((challenge: any, index: number) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <AlertTriangle size={16} color="#f59e0b" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={challenge}
                              primaryTypographyProps={{ 
                                variant: 'body2',
                                sx: { color: 'rgba(254,243,199,0.8)' }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2" sx={{ color: '#8b5cf6', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Target size={16} />
                        Ratschläge
                      </Typography>
                      <List dense>
                        {analysis.analysis.recommendations.advice.map((advice: any, index: number) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <Target size={16} color="#8b5cf6" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={advice}
                              primaryTypographyProps={{ 
                                variant: 'body2',
                                sx: { color: 'rgba(254,243,199,0.8)' }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Insights */}
              {analysis.insights.length > 0 && (
                <Card sx={{ 
                  mt: 3,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Heart size={20} color="#FFD700" />
                      Insights
                    </Typography>
                    <List>
                      {analysis.insights.map((insight: any, index: number) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <TrendingUp size={20} color="#FFD700" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={insight}
                            primaryTypographyProps={{ 
                              sx: { color: 'rgba(254,243,199,0.8)' }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#FFD700',
            borderColor: '#FFD700',
            '&:hover': {
              borderColor: '#fbbf24',
              bgcolor: 'rgba(255, 215, 0, 0.1)'
            }
          }}
        >
          Schließen
        </Button>
      </DialogActions>
    </Dialog>
  );
}
