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
  Divider
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, BookOpen, Lightbulb, Target, Zap, Heart, Brain } from 'lucide-react';
import { GateData, getGateById } from '../lib/humanDesignGates';

interface GateDetailsModalProps {
  open: boolean;
  onClose: () => void;
  gateId: string;
  gateData?: any;
}

export default function GateDetailsModal({ open, onClose, gateId, gateData }: GateDetailsModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  
  const gate = getGateById(gateId);
  const displayData = gate || gateData;
  
  if (!displayData) {
    return null;
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

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
            background: `linear-gradient(135deg, ${displayData.color}, ${displayData.color}80)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            color: 'white',
            boxShadow: `0 0 20px ${displayData.color}40`
          }}>
            {displayData.hexagram || gateId}
          </Box>
          <Box>
            <Typography variant="h4" sx={{ color: '#fef3c7', fontWeight: 700, mb: 0.5 }}>
              Tor {gateId} - {displayData.name}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(254,243,199,0.8)' }}>
              {displayData.center} • {displayData.element} • {displayData.trigram}
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
            <Tab label="Übersicht" icon={<BookOpen size={16} />} />
            <Tab label="Linien" icon={<Target size={16} />} />
            <Tab label="Keywords" icon={<Lightbulb size={16} />} />
            <Tab label="Details" icon={<Star size={16} />} />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          <AnimatePresence mode="wait">
            {activeTab === 0 && (
              <motion.div
                key="overview"
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
                          <BookOpen size={20} />
                          Beschreibung
                        </Typography>
                        <Typography sx={{ color: 'rgba(254,243,199,0.8)', lineHeight: 1.6, mb: 3 }}>
                          {displayData.description}
                        </Typography>
                        
                        <Divider sx={{ borderColor: 'rgba(254,243,199,0.2)', my: 2 }} />
                        
                        <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Zap size={20} />
                          Energie & Bedeutung
                        </Typography>
                        <Typography sx={{ color: 'rgba(254,243,199,0.8)', lineHeight: 1.6 }}>
                          Dieses Tor repräsentiert eine spezifische Energie in deinem Human Design Chart. 
                          Es zeigt dir, wie du diese Energie in deinem Leben nutzen und ausdrücken kannst.
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
                          <Heart size={20} />
                          Eigenschaften
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(254,243,199,0.7)', mb: 1 }}>
                            Zentrum:
                          </Typography>
                          <Chip 
                            label={displayData.center} 
                            sx={{ 
                              bgcolor: `${displayData.color}20`, 
                              color: displayData.color,
                              border: `1px solid ${displayData.color}40`
                            }} 
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(254,243,199,0.7)', mb: 1 }}>
                            Element:
                          </Typography>
                          <Chip 
                            label={displayData.element} 
                            sx={{ 
                              bgcolor: `${displayData.color}20`, 
                              color: displayData.color,
                              border: `1px solid ${displayData.color}40`
                            }} 
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ color: 'rgba(254,243,199,0.7)', mb: 1 }}>
                            Trigramm:
                          </Typography>
                          <Chip 
                            label={displayData.trigram} 
                            sx={{ 
                              bgcolor: `${displayData.color}20`, 
                              color: displayData.color,
                              border: `1px solid ${displayData.color}40`
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
                key="lines"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h6" sx={{ color: '#fef3c7', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Target size={20} />
                  Die 6 Linien des Tors {gateId}
                </Typography>
                
                <Grid container spacing={2}>
                  {Object.entries(displayData.lines || {}).map(([lineNumber, line]: [string, any]) => (
                    <Grid item xs={12} sm={6} md={4} key={lineNumber}>
                      <Card sx={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(254,243,199,0.1)',
                        borderRadius: 2,
                        height: '100%'
                      }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ color: displayData.color, mb: 1 }}>
                            Linie {lineNumber}
                          </Typography>
                          <Typography variant="subtitle2" sx={{ color: '#fef3c7', mb: 1, fontWeight: 600 }}>
                            {line.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.8)', lineHeight: 1.4, mb: 2 }}>
                            {line.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {line.keywords?.map((keyword: string, index: number) => (
                              <Chip
                                key={index}
                                label={keyword}
                                size="small"
                                sx={{
                                  bgcolor: `${displayData.color}20`,
                                  color: displayData.color,
                                  border: `1px solid ${displayData.color}40`,
                                  fontSize: '0.7rem'
                                }}
                              />
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            )}

            {activeTab === 2 && (
              <motion.div
                key="keywords"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h6" sx={{ color: '#fef3c7', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Lightbulb size={20} />
                  Keywords & Assoziationen
                </Typography>
                
                <Paper sx={{
                  p: 3,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(254,243,199,0.1)',
                  borderRadius: 2
                }}>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {displayData.keywords?.map((keyword: string, index: number) => (
                      <Chip
                        key={index}
                        label={keyword}
                        sx={{
                          bgcolor: `${displayData.color}20`,
                          color: displayData.color,
                          border: `1px solid ${displayData.color}40`,
                          fontSize: '0.9rem',
                          height: '32px',
                          '&:hover': {
                            bgcolor: `${displayData.color}30`,
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              </motion.div>
            )}

            {activeTab === 3 && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h6" sx={{ color: '#fef3c7', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star size={20} />
                  Detaillierte Informationen
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(254,243,199,0.1)',
                      borderRadius: 2
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Brain size={20} />
                          Mentale Aspekte
                        </Typography>
                        <Typography sx={{ color: 'rgba(254,243,199,0.8)', lineHeight: 1.6 }}>
                          Dieses Tor beeinflusst deine mentalen Prozesse und deine Art zu denken. 
                          Es zeigt dir, wie du Informationen verarbeitest und verstehst.
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
                        <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Heart size={20} />
                          Emotionale Aspekte
                        </Typography>
                        <Typography sx={{ color: 'rgba(254,243,199,0.8)', lineHeight: 1.6 }}>
                          Dieses Tor beeinflusst deine emotionalen Reaktionen und deine Art zu fühlen. 
                          Es zeigt dir, wie du mit deinen Emotionen umgehst.
                        </Typography>
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
