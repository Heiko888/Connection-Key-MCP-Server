'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Heart, Star, Target, GitCompare, TrendingUp } from 'lucide-react';
import HumanDesignChart from '../app/mondkalender/components/HumanDesignChart';

interface ChartData {
  hdType?: string;
  profile?: string;
  authority?: string;
  strategy?: string;
  gates?: Array<{ id: string; active: boolean; name?: string }>;
  channels?: Array<{ id: string; active: boolean; name?: string }>;
  centers?: Array<{ id: string; active: boolean; name?: string }>;
  planets?: Array<{ id: string; name?: string; position?: number }>;
}

interface ChartComparisonModalProps {
  open: boolean;
  onClose: () => void;
  chart1Data: ChartData;
  chart2Data: ChartData;
}

export default function ChartComparisonModal({ open, onClose, chart1Data, chart2Data }: ChartComparisonModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [showSideBySide, setShowSideBySide] = useState(true);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Vergleichslogik
  const getCompatibilityScore = () => {
    // Vereinfachte Kompatibilitäts-Berechnung
    const commonGates = chart1Data.gates?.filter((gate) => 
      chart2Data.gates?.some((gate2) => gate.id === gate2.id && gate.active && gate2.active)
    ) || [];
    
    const commonChannels = chart1Data.channels?.filter((channel) => 
      chart2Data.channels?.some((channel2) => channel.id === channel2.id && channel.active && channel2.active)
    ) || [];
    
    const score = Math.min(100, (commonGates.length * 5) + (commonChannels.length * 10));
    return score;
  };

  const compatibilityScore = getCompatibilityScore();

  const getCompatibilityLevel = (score: number) => {
    if (score >= 80) return { level: 'Sehr hoch', color: '#22c55e', icon: '💫' };
    if (score >= 60) return { level: 'Hoch', color: '#84cc16', icon: '✨' };
    if (score >= 40) return { level: 'Mittel', color: '#f59e0b', icon: '🌟' };
    if (score >= 20) return { level: 'Niedrig', color: '#f97316', icon: '⭐' };
    return { level: 'Sehr niedrig', color: '#ef4444', icon: '💫' };
  };

  const compatibility = getCompatibilityLevel(compatibilityScore);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          background: `
            radial-gradient(ellipse at top, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at bottom, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
            linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)
          `,
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(254,243,199,0.2)',
          borderRadius: 3,
          minHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#fef3c7',
        borderBottom: '1px solid rgba(254,243,199,0.2)',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: 'white'
          }}>
            <GitCompare size={24} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ color: '#fef3c7', fontWeight: 700, mb: 0.5 }}>
              Chart-Vergleich
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(254,243,199,0.8)' }}>
              Kompatibilitäts-Analyse
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#fef3c7' }}>
          <X size={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Tab Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(254,243,199,0.2)', px: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(254,243,199,0.7)',
                '&.Mui-selected': {
                  color: '#fef3c7'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#fef3c7'
              }
            }}
          >
            <Tab label="Charts" icon={<Users size={16} />} />
            <Tab label="Kompatibilität" icon={<Heart size={16} />} />
            <Tab label="Gemeinsamkeiten" icon={<Star size={16} />} />
            <Tab label="Unterschiede" icon={<Target size={16} />} />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          <AnimatePresence mode="wait">
            {activeTab === 0 && (
              <motion.div
                key="charts"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Chart Display Options */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showSideBySide}
                        onChange={(e) => setShowSideBySide(e.target.checked)}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#8b5cf6',
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#8b5cf6',
                          },
                        }}
                      />
                    }
                    label="Nebeneinander anzeigen"
                    sx={{ color: '#fef3c7' }}
                  />
                </Box>

                {showSideBySide ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Card sx={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(254,243,199,0.1)',
                        borderRadius: 2
                      }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, textAlign: 'center' }}>
                            Chart 1
                          </Typography>
                          <Box sx={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HumanDesignChart
                              hdType={chart1Data.hdType || 'Generator'}
                              profile={chart1Data.profile || '1/3'}
                              authority={chart1Data.authority || 'Sacral'}
                              strategy={chart1Data.strategy || 'Respond'}
                              centers={{}}
                              channels={{}}
                              gates={{}}
                              planets={{}}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card sx={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(254,243,199,0.1)',
                        borderRadius: 2
                      }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, textAlign: 'center' }}>
                            Chart 2
                          </Typography>
                          <Box sx={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <HumanDesignChart
                              hdType={chart2Data.hdType || 'Manifestor'}
                              profile={chart2Data.profile || '2/4'}
                              authority={chart2Data.authority || 'Splenic'}
                              strategy={chart2Data.strategy || 'Inform'}
                              centers={{}}
                              channels={{}}
                              gates={{}}
                              planets={{}}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography sx={{ color: 'rgba(254,243,199,0.7)', mb: 3 }}>
                      Wähle &quot;Nebeneinander anzeigen&quot; um beide Charts zu vergleichen
                    </Typography>
                  </Box>
                )}
              </motion.div>
            )}

            {activeTab === 1 && (
              <motion.div
                key="compatibility"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(254,243,199,0.1)',
                      borderRadius: 2
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#fef3c7', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Heart size={20} />
                          Kompatibilitäts-Score
                        </Typography>
                        
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                          <Typography variant="h1" sx={{ 
                            color: compatibility.color, 
                            fontWeight: 800,
                            fontSize: '4rem'
                          }}>
                            {compatibilityScore}%
                          </Typography>
                          <Typography variant="h5" sx={{ color: '#fef3c7', mb: 1 }}>
                            {compatibility.icon} {compatibility.level}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)' }}>
                            Kompatibilität zwischen den Charts
                          </Typography>
                        </Box>
                        
                        <Divider sx={{ borderColor: 'rgba(254,243,199,0.2)', my: 2 }} />
                        
                        <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2 }}>
                          Was bedeutet das?
                        </Typography>
                        <Typography sx={{ color: 'rgba(254,243,199,0.8)', lineHeight: 1.6 }}>
                          {compatibilityScore >= 80 && "Diese Charts haben eine sehr hohe Kompatibilität. Die Energien ergänzen sich perfekt und schaffen eine harmonische Verbindung."}
                          {compatibilityScore >= 60 && compatibilityScore < 80 && "Diese Charts haben eine hohe Kompatibilität. Es gibt viele gemeinsame Energien und eine gute Basis für eine Beziehung."}
                          {compatibilityScore >= 40 && compatibilityScore < 60 && "Diese Charts haben eine mittlere Kompatibilität. Es gibt sowohl Gemeinsamkeiten als auch Unterschiede, die zu interessanten Dynamiken führen können."}
                          {compatibilityScore >= 20 && compatibilityScore < 40 && "Diese Charts haben eine niedrige Kompatibilität. Die Unterschiede überwiegen, was zu Herausforderungen führen kann."}
                          {compatibilityScore < 20 && "Diese Charts haben eine sehr niedrige Kompatibilität. Die Energien sind sehr unterschiedlich und können zu Spannungen führen."}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card sx={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(254,243,199,0.1)',
                      borderRadius: 2
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#fef3c7', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUp size={20} />
                          Kompatibilitäts-Faktoren
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(254,243,199,0.7)', mb: 1 }}>
                            Gemeinsame Tore:
                          </Typography>
                          <Typography sx={{ color: '#fef3c7', fontSize: '1.5rem', fontWeight: 600 }}>
                            {chart1Data.gates?.filter((gate) => 
                              chart2Data.gates?.some((gate2) => gate.id === gate2.id && gate.active && gate2.active)
                            ).length || 0}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(254,243,199,0.7)', mb: 1 }}>
                            Gemeinsame Kanäle:
                          </Typography>
                          <Typography sx={{ color: '#fef3c7', fontSize: '1.5rem', fontWeight: 600 }}>
                            {chart1Data.channels?.filter((channel) => 
                              chart2Data.channels?.some((channel2) => channel.id === channel2.id && channel.active && channel2.active)
                            ).length || 0}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(254,243,199,0.7)', mb: 1 }}>
                            Typ-Kompatibilität:
                          </Typography>
                          <Typography sx={{ color: '#fef3c7', fontSize: '1.5rem', fontWeight: 600 }}>
                            {chart1Data.hdType === chart2Data.hdType ? 'Gleich' : 'Verschieden'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(254,243,199,0.7)', mb: 1 }}>
                            Profil-Kompatibilität:
                          </Typography>
                          <Typography sx={{ color: '#fef3c7', fontSize: '1.5rem', fontWeight: 600 }}>
                            {chart1Data.profile === chart2Data.profile ? 'Gleich' : 'Verschieden'}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </motion.div>
            )}

            {activeTab === 2 && (
              <motion.div
                key="similarities"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h6" sx={{ color: '#fef3c7', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star size={20} />
                  Gemeinsamkeiten
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{
                      background: 'rgba(34,197,94,0.1)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      borderRadius: 2
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#22c55e', mb: 2 }}>
                          Gemeinsame Tore
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {chart1Data.gates?.filter((gate) => 
                            chart2Data.gates?.some((gate2) => gate.id === gate2.id && gate.active && gate2.active)
                          ).map((gate) => (
                            <Chip
                              key={gate.id}
                              label={`Tor ${gate.id}`}
                              sx={{
                                bgcolor: 'rgba(34,197,94,0.2)',
                                color: '#22c55e',
                                border: '1px solid rgba(34,197,94,0.3)'
                              }}
                            />
                          )) || []}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card sx={{
                      background: 'rgba(34,197,94,0.1)',
                      border: '1px solid rgba(34,197,94,0.3)',
                      borderRadius: 2
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#22c55e', mb: 2 }}>
                          Gemeinsame Kanäle
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {chart1Data.channels?.filter((channel) => 
                            chart2Data.channels?.some((channel2) => channel.id === channel2.id && channel.active && channel2.active)
                          ).map((channel) => (
                            <Chip
                              key={channel.id}
                              label={channel.id}
                              sx={{
                                bgcolor: 'rgba(34,197,94,0.2)',
                                color: '#22c55e',
                                border: '1px solid rgba(34,197,94,0.3)'
                              }}
                            />
                          )) || []}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </motion.div>
            )}

            {activeTab === 3 && (
              <motion.div
                key="differences"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h6" sx={{ color: '#fef3c7', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Target size={20} />
                  Unterschiede
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(254,243,199,0.1)',
                      borderRadius: 2
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2 }}>
                          Chart 1 - Einzigartige Tore
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {chart1Data.gates?.filter((gate) => 
                            !chart2Data.gates?.some((gate2) => gate.id === gate2.id && gate.active && gate2.active)
                          ).map((gate) => (
                            <Chip
                              key={gate.id}
                              label={`Tor ${gate.id}`}
                              sx={{
                                bgcolor: 'rgba(139,92,246,0.2)',
                                color: '#8b5cf6',
                                border: '1px solid rgba(139,92,246,0.3)'
                              }}
                            />
                          )) || []}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card sx={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(254,243,199,0.1)',
                      borderRadius: 2
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2 }}>
                          Chart 2 - Einzigartige Tore
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {chart2Data.gates?.filter((gate) => 
                            !chart1Data.gates?.some((gate2) => gate.id === gate2.id && gate.active && gate2.active)
                          ).map((gate) => (
                            <Chip
                              key={gate.id}
                              label={`Tor ${gate.id}`}
                              sx={{
                                bgcolor: 'rgba(236,72,153,0.2)',
                                color: '#ec4899',
                                border: '1px solid rgba(236,72,153,0.3)'
                              }}
                            />
                          )) || []}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(254,243,199,0.2)' }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#fef3c7',
            border: '1px solid rgba(254,243,199,0.3)',
            '&:hover': {
              backgroundColor: 'rgba(254,243,199,0.1)'
            }
          }}
        >
          Schließen
        </Button>
      </DialogActions>
    </Dialog>
  );
}
