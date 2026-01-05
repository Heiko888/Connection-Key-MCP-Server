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
  Paper,
  IconButton,
  Divider,
  LinearProgress
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Clock, Zap, ArrowRight, ArrowLeft, RotateCcw, Calendar, TrendingUp, Eye } from 'lucide-react';
import { PlanetData, getNextTransit } from '../lib/planetsData';

interface PlanetTransitModalProps {
  open: boolean;
  onClose: () => void;
  planet: PlanetData;
}

export default function PlanetTransitModal({ open, onClose, planet }: PlanetTransitModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  
  if (!planet) {
    return null;
  }
  
  const nextTransit = getNextTransit(planet.id);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Berechne die Position des Planeten im Chart (vereinfacht)
  const getPlanetPosition = () => {
    if (!planet || !planet.currentPosition) {
      return { x: 50, y: 50 };
    }
    const angle = (planet.currentPosition * Math.PI) / 180;
    const radius = 35;
    return {
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle)
    };
  };

  const _position = getPlanetPosition();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
          borderRadius: 3
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
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${planet.color}, ${planet.color}80)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white',
            boxShadow: `0 0 20px ${planet.color}40`,
            position: 'relative'
          }}>
            {planet.symbol}
            {planet.isRetrograde && (
              <Box sx={{
                position: 'absolute',
                top: -5,
                right: -5,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem'
              }}>
                <RotateCcw size={12} />
              </Box>
            )}
          </Box>
          <Box>
            <Typography variant="h4" sx={{ color: '#fef3c7', fontWeight: 700, mb: 0.5 }}>
              {planet.name}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(254,243,199,0.8)' }}>
              Tor {planet.currentGate} • Linie {planet.currentLine}
              {planet.isRetrograde && ' • Retrograde'}
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
            <Tab label="Aktueller Transit" icon={<Zap size={16} />} />
            <Tab label="Bedeutung" icon={<Star size={16} />} />
            <Tab label="Nächster Transit" icon={<Calendar size={16} />} />
            <Tab label="Position" icon={<Eye size={16} />} />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          <AnimatePresence mode="wait">
            {activeTab === 0 && (
              <motion.div
                key="current-transit"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Card sx={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(254,243,199,0.1)',
                      borderRadius: 2
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Zap size={20} />
                          Aktueller Transit-Effekt
                        </Typography>
                        <Typography sx={{ color: 'rgba(254,243,199,0.8)', lineHeight: 1.6, mb: 3 }}>
                          {planet.transitEffect}
                        </Typography>
                        
                        <Divider sx={{ borderColor: 'rgba(254,243,199,0.2)', my: 2 }} />
                        
                        <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TrendingUp size={20} />
                          Einfluss auf dein Leben
                        </Typography>
                        <Typography sx={{ color: 'rgba(254,243,199,0.8)', lineHeight: 1.6 }}>
                          {planet.influence}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Card sx={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(254,243,199,0.1)',
                      borderRadius: 2
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Clock size={20} />
                          Transit-Info
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(254,243,199,0.7)', mb: 1 }}>
                            Aktuelle Position:
                          </Typography>
                          <Chip 
                            label={`${planet.currentPosition.toFixed(1)}°`}
                            sx={{ 
                              bgcolor: `${planet.color}20`, 
                              color: planet.color,
                              border: `1px solid ${planet.color}40`
                            }} 
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(254,243,199,0.7)', mb: 1 }}>
                            Geschwindigkeit:
                          </Typography>
                          <Chip 
                            label={`${planet.speed}°/Tag`}
                            sx={{ 
                              bgcolor: `${planet.color}20`, 
                              color: planet.color,
                              border: `1px solid ${planet.color}40`
                            }} 
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(254,243,199,0.7)', mb: 1 }}>
                            Status:
                          </Typography>
                          <Chip 
                            label={planet.isRetrograde ? 'Retrograde' : 'Direkt'}
                            sx={{ 
                              bgcolor: planet.isRetrograde ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)', 
                              color: planet.isRetrograde ? '#ef4444' : '#22c55e',
                              border: `1px solid ${planet.isRetrograde ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`
                            }} 
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </motion.div>
            )}

            {activeTab === 1 && (
              <motion.div
                key="meaning"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h6" sx={{ color: '#fef3c7', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star size={20} />
                  Bedeutung von {planet.name}
                </Typography>
                
                <Paper sx={{
                  p: 3,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(254,243,199,0.1)',
                  borderRadius: 2
                }}>
                  <Typography sx={{ color: 'rgba(254,243,199,0.8)', lineHeight: 1.6, mb: 3 }}>
                    {planet.description}
                  </Typography>
                  
                  <Divider sx={{ borderColor: 'rgba(254,243,199,0.2)', my: 2 }} />
                  
                  <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2 }}>
                    Einfluss auf dein Human Design
                  </Typography>
                  <Typography sx={{ color: 'rgba(254,243,199,0.8)', lineHeight: 1.6 }}>
                    {planet.influence}
                  </Typography>
                </Paper>
              </motion.div>
            )}

            {activeTab === 2 && (
              <motion.div
                key="next-transit"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h6" sx={{ color: '#fef3c7', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Calendar size={20} />
                  Nächster Transit
                </Typography>
                
                {nextTransit ? (
                  <Card sx={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(254,243,199,0.1)',
                    borderRadius: 2
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Box sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${planet.color}, ${planet.color}80)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          color: 'white'
                        }}>
                          {planet.symbol}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ color: '#fef3c7' }}>
                            Tor {nextTransit.gate}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)' }}>
                            {nextTransit.date}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography sx={{ color: 'rgba(254,243,199,0.8)', lineHeight: 1.6, mb: 2 }}>
                        {nextTransit.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ArrowRight size={16} color="#fef3c7" />
                        <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)' }}>
                          Von Tor {planet.currentGate} zu Tor {nextTransit.gate}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                ) : (
                  <Paper sx={{
                    p: 3,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(254,243,199,0.1)',
                    borderRadius: 2,
                    textAlign: 'center'
                  }}>
                    <Typography sx={{ color: 'rgba(254,243,199,0.7)' }}>
                      Keine Transit-Informationen verfügbar
                    </Typography>
                  </Paper>
                )}
              </motion.div>
            )}

            {activeTab === 3 && (
              <motion.div
                key="position"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h6" sx={{ color: '#fef3c7', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Eye size={20} />
                  Position im Chart
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
                          Aktuelle Position
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(254,243,199,0.7)', mb: 1 }}>
                            Grad:
                          </Typography>
                          <Typography sx={{ color: '#fef3c7', fontSize: '1.2rem', fontWeight: 600 }}>
                            {planet.currentPosition.toFixed(1)}°
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(254,243,199,0.7)', mb: 1 }}>
                            Tor:
                          </Typography>
                          <Typography sx={{ color: '#fef3c7', fontSize: '1.2rem', fontWeight: 600 }}>
                            {planet.currentGate}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(254,243,199,0.7)', mb: 1 }}>
                            Linie:
                          </Typography>
                          <Typography sx={{ color: '#fef3c7', fontSize: '1.2rem', fontWeight: 600 }}>
                            {planet.currentLine}
                          </Typography>
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
                          Bewegung
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(254,243,199,0.7)', mb: 1 }}>
                            Geschwindigkeit:
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={Math.min((planet.speed / 15) * 100, 100)}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'rgba(254,243,199,0.2)',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: planet.color,
                                borderRadius: 4
                              }
                            }}
                          />
                          <Typography variant="caption" sx={{ color: 'rgba(254,243,199,0.7)', mt: 1, display: 'block' }}>
                            {planet.speed}° pro Tag
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(254,243,199,0.7)', mb: 1 }}>
                            Richtung:
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {planet.isRetrograde ? (
                              <>
                                <ArrowLeft size={16} color="#ef4444" />
                                <Typography sx={{ color: '#ef4444' }}>Retrograde</Typography>
                              </>
                            ) : (
                              <>
                                <ArrowRight size={16} color="#22c55e" />
                                <Typography sx={{ color: '#22c55e' }}>Direkt</Typography>
                              </>
                            )}
                          </Box>
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
