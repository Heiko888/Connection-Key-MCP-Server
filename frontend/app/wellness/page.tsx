"use client";

import React, { useState, useEffect } from 'react';
import { useSSRSafeDate } from '@/lib/hooks/useSSRSafe';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Tabs, 
  Tab, 
  Grid, 
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  LinearProgress,
  Divider,
  Button,
  Slider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Heart, 
  Activity, 
  Moon, 
  Brain,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Star,
  Zap,
  Lightbulb,
  Plus,
  Save
} from 'lucide-react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';

interface PHSDiet {
  type: string;
  foods: string[];
  avoid: string[];
  timing: string;
  environment: string;
  benefits: string[];
  recipes: string[];
}

interface WellnessTracking {
  energy: number;
  mood: number;
  stress: number;
  sleep: number;
  exercise: number;
  nutrition: number;
  date: string;
  notes: string;
}

interface MeditationGuide {
  type: string;
  duration: string;
  technique: string;
  benefits: string[];
  instructions: string[];
  timing: string;
}

interface StressManagement {
  triggers: string[];
  techniques: string[];
  prevention: string[];
  recovery: string[];
  tools: string[];
}

function WellnessContent() {
  const [activeTab, setActiveTab] = useState(0);
  const [phs, setPhs] = useState<PHSDiet | null>(null);
  const [tracking, setTracking] = useState<WellnessTracking[]>([]);
  const [meditation, setMeditation] = useState<MeditationGuide[]>([]);
  const [stress, setStress] = useState<StressManagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openTrackingDialog, setOpenTrackingDialog] = useState(false);
  const [newTracking, setNewTracking] = useState<Partial<WellnessTracking>>({
    energy: 5,
    mood: 5,
    stress: 5,
    sleep: 5,
    exercise: 5,
    nutrition: 5,
    notes: ''
  });

  useEffect(() => {
    loadWellnessData();
  }, []);

  const loadWellnessData = async () => {
    try {
      setLoading(true);
      
      // TODO: ERSETZEN DURCH API-CALL - Wellness-Tracking implementieren
      // Siehe: SYSTEMBEREINIGUNG-UND-PLAN.md - Priorität 3
      // API-Route: /api/wellness/phs und /api/wellness/tracking
      // Mock-Daten für Demo
      const mockPhs: PHSDiet = {
        type: 'Sensitive',
        foods: [
          'Frische, lokale Zutaten',
          'Bio-Gemüse und Obst',
          'Nüsse und Samen',
          'Vollkornprodukte',
          'Pflanzliche Proteine'
        ],
        avoid: [
          'Verarbeitete Lebensmittel',
          'Künstliche Zusatzstoffe',
          'Fast Food',
          'Zuckerhaltige Getränke',
          'Alkohol'
        ],
        timing: 'Regelmäßige Mahlzeiten in ruhiger Atmosphäre',
        environment: 'Ruhige, natürliche Umgebung ohne Ablenkungen',
        benefits: [
          'Verbesserte Verdauung',
          'Höhere Energie',
          'Besseres Wohlbefinden',
          'Stärkere Intuition'
        ],
        recipes: [
          'Quinoa-Bowl mit Gemüse',
          'Grüner Smoothie',
          'Mediterrane Salate',
          'Gedämpftes Gemüse'
        ]
      };

      // TODO: ERSETZEN DURCH API-CALL
      const mockTracking: WellnessTracking[] = [
        {
          energy: 8,
          mood: 7,
          stress: 3,
          sleep: 8,
          exercise: 6,
          nutrition: 9,
          date: '2024-03-20',
          notes: 'Guter Tag, viel Energie'
        },
        {
          energy: 6,
          mood: 5,
          stress: 6,
          sleep: 6,
          exercise: 4,
          nutrition: 7,
          date: '2024-03-19',
          notes: 'Etwas müde, stressiger Tag'
        },
        {
          energy: 9,
          mood: 8,
          stress: 2,
          sleep: 9,
          exercise: 8,
          nutrition: 8,
          date: '2024-03-18',
          notes: 'Ausgezeichneter Tag!'
        }
      ];

      // TODO: ERSETZEN DURCH API-CALL
      const mockMeditation: MeditationGuide[] = [
        {
          type: 'Sakral-Meditation',
          duration: '15-20 Minuten',
          technique: 'Fokus auf das Sakralzentrum',
          benefits: [
            'Energie aufladen',
            'Kreativität steigern',
            'Lebenskraft stärken'
          ],
          instructions: [
            'Setze dich bequem hin',
            'Fokussiere dich auf dein Sakralzentrum',
            'Atme tief in den Bauch',
            'Spüre die Energie fließen'
          ],
          timing: 'Morgens oder abends'
        },
        {
          type: 'G-Zentrum Meditation',
          duration: '10-15 Minuten',
          technique: 'Herzöffnung und Selbstliebe',
          benefits: [
            'Selbstliebe stärken',
            'Richtung finden',
            'Herz öffnen'
          ],
          instructions: [
            'Platziere deine Hand auf dein Herz',
            'Atme in dein Herz hinein',
            'Spüre Liebe und Akzeptanz',
            'Visualisiere deine Richtung'
          ],
          timing: 'Jederzeit'
        }
      ];

      const mockStress: StressManagement = {
        triggers: [
          'Unvorhergesehene Veränderungen',
          'Mikromanagement',
          'Lärm und Chaos',
          'Unterbrechungen'
        ],
        techniques: [
          'Tiefes Atmen',
          'Meditation',
          'Spaziergänge in der Natur',
          'Journaling',
          'Yoga'
        ],
        prevention: [
          'Regelmäßige Pausen',
          'Grenzen setzen',
          'Nein sagen lernen',
          'Prioritäten setzen'
        ],
        recovery: [
          'Alleinzeit',
          'Natur',
          'Kreative Aktivitäten',
          'Entspannungstechniken'
        ],
        tools: [
          'Meditations-App',
          'Journal',
          'Aromatherapie',
          'Entspannungsmusik'
        ]
      };

      setPhs(mockPhs);
      setTracking(mockTracking);
      setMeditation(mockMeditation);
      setStress(mockStress);
    } catch (err) {
      setError('Fehler beim Laden der Wellness-Daten');
      console.error('Error loading wellness data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleOpenTrackingDialog = () => {
    setOpenTrackingDialog(true);
  };

  const handleCloseTrackingDialog = () => {
    setOpenTrackingDialog(false);
    setNewTracking({
      energy: 5,
      mood: 5,
      stress: 5,
      sleep: 5,
      exercise: 5,
      nutrition: 5,
      notes: ''
    });
  };

  const today = useSSRSafeDate();
  
  const handleSaveTracking = () => {
    const newEntry: WellnessTracking = {
      ...newTracking as WellnessTracking,
      date: today
    };
    
    setTracking(prev => [newEntry, ...prev]);
    handleCloseTrackingDialog();
  };

  const getWellnessColor = (value: number) => {
    if (value >= 8) return '#10b981';
    if (value >= 6) return '#f59e0b';
    return '#f56565';
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 20%, rgba(255, 107, 157, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)
        `,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center'
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 20%, rgba(255, 107, 157, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
          linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)
        `,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center'
      }}>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 20%, rgba(255, 107, 157, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3, position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ 
            textAlign: 'center', 
            mb: 6,
            py: { xs: 4, md: 6 }
          }}>
            <Typography
              variant="h2"
              sx={{
                background: 'linear-gradient(135deg, #ff6b9d, #c44569, #4ecdc4)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                mb: 2,
                textShadow: '0 0 30px rgba(255, 107, 157, 0.3)'
              }}
            >
              🌿 Gesundheit & Wellness
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                mb: 3,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Optimiere deine Gesundheit basierend auf deinem Human Design - PHS-Diäten, Wellness-Tracking und Meditation.
            </Typography>
          </Box>
        </motion.div>

        {/* Tabs */}
        <Card sx={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 3,
          mb: 4
        }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 600,
                '&.Mui-selected': {
                  color: '#FFD700'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#FFD700'
              }
            }}
          >
            <Tab label="PHS Diät" icon={<Heart size={20} />} />
            <Tab label="Wellness Tracking" icon={<Activity size={20} />} />
            <Tab label="Meditation" icon={<Moon size={20} />} />
            <Tab label="Stress-Management" icon={<Brain size={20} />} />
          </Tabs>
        </Card>

        {/* Tab Content */}
        {activeTab === 0 && phs && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 3,
              p: 3
            }}>
              <Typography variant="h5" sx={{ color: '#ef4444', fontWeight: 700, mb: 3 }}>
                PHS Diät - {phs.type}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#10b981', mb: 2 }}>
                    Empfohlene Lebensmittel
                  </Typography>
                  <List>
                    {phs.foods.map((food, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CheckCircle size={20} color="#10b981" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={food}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#f56565', mb: 2 }}>
                    Vermeiden
                  </Typography>
                  <List>
                    {phs.avoid.map((item, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <AlertTriangle size={20} color="#f56565" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#ef4444', mb: 2 }}>
                    Timing & Umgebung
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                    <strong>Timing:</strong> {phs.timing}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    <strong>Umgebung:</strong> {phs.environment}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#ef4444', mb: 2 }}>
                    Vorteile
                  </Typography>
                  <List>
                    {phs.benefits.map((benefit, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Star size={20} color="#ef4444" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={benefit}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
              
              <Typography variant="h6" sx={{ color: '#ef4444', mb: 2 }}>
                Rezepte
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {phs.recipes.map((recipe, index) => (
                  <Chip 
                    key={index}
                    label={recipe}
                    sx={{ 
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      fontWeight: 600
                    }}
                  />
                ))}
              </Box>
            </Card>
          </motion.div>
        )}

        {activeTab === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ color: 'white' }}>
                Wellness Tracking
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={handleOpenTrackingDialog}
                sx={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669, #10b981)'
                  }
                }}
              >
                Neuer Eintrag
              </Button>
            </Box>
            
            <Grid container spacing={3}>
              {tracking.map((entry, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card sx={{
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: 3,
                      p: 3,
                      height: '100%'
                    }}>
                      <Typography variant="h6" sx={{ color: '#10b981', mb: 2 }}>
                        {entry.date}
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                            Energie
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={entry.energy * 10} 
                              sx={{ 
                                flexGrow: 1, 
                                height: 6, 
                                borderRadius: 3,
                                '& .MuiLinearProgress-bar': {
                                  background: getWellnessColor(entry.energy)
                                }
                              }}
                            />
                            <Typography variant="body2" sx={{ color: 'white', ml: 1, minWidth: 20 }}>
                              {entry.energy}
                            </Typography>
                          </Box>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                            Stimmung
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={entry.mood * 10} 
                              sx={{ 
                                flexGrow: 1, 
                                height: 6, 
                                borderRadius: 3,
                                '& .MuiLinearProgress-bar': {
                                  background: getWellnessColor(entry.mood)
                                }
                              }}
                            />
                            <Typography variant="body2" sx={{ color: 'white', ml: 1, minWidth: 20 }}>
                              {entry.mood}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      {entry.notes && (
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 2, fontStyle: 'italic' }}>
                          "{entry.notes}"
                        </Typography>
                      )}
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {activeTab === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h5" sx={{ color: 'white', mb: 3 }}>
              Meditation Guides
            </Typography>
            
            <Grid container spacing={3}>
              {meditation.map((guide, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card sx={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: 3,
                      p: 3,
                      height: '100%'
                    }}>
                      <Typography variant="h6" sx={{ color: '#8b5cf6', fontWeight: 700, mb: 2 }}>
                        {guide.type}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                        {guide.duration} • {guide.timing}
                      </Typography>
                      
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
                        {guide.technique}
                      </Typography>
                      
                      <Typography variant="subtitle2" sx={{ color: '#8b5cf6', mb: 1 }}>
                        Vorteile:
                      </Typography>
                      <List dense>
                        {guide.benefits.map((benefit, benefitIndex) => (
                          <ListItem key={benefitIndex} sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 20 }}>
                              <CheckCircle size={16} color="#8b5cf6" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={benefit}
                              sx={{ 
                                color: 'rgba(255,255,255,0.8)',
                                '& .MuiListItemText-primary': {
                                  fontSize: '0.875rem'
                                }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                      
                      <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                      
                      <Typography variant="subtitle2" sx={{ color: '#8b5cf6', mb: 1 }}>
                        Anleitung:
                      </Typography>
                      <List dense>
                        {guide.instructions.map((instruction, instIndex) => (
                          <ListItem key={instIndex} sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 20 }}>
                              <Target size={16} color="#8b5cf6" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={instruction}
                              sx={{ 
                                color: 'rgba(255,255,255,0.8)',
                                '& .MuiListItemText-primary': {
                                  fontSize: '0.875rem'
                                }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}

        {activeTab === 3 && stress && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 3,
              p: 3
            }}>
              <Typography variant="h5" sx={{ color: '#f59e0b', fontWeight: 700, mb: 3 }}>
                Stress-Management
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#f56565', mb: 2 }}>
                    Stress-Auslöser
                  </Typography>
                  <List>
                    {stress.triggers.map((trigger, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <AlertTriangle size={20} color="#f56565" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={trigger}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#10b981', mb: 2 }}>
                    Entspannungstechniken
                  </Typography>
                  <List>
                    {stress.techniques.map((technique, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CheckCircle size={20} color="#10b981" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={technique}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#f59e0b', mb: 2 }}>
                    Prävention
                  </Typography>
                  <List>
                    {stress.prevention.map((item, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Lightbulb size={20} color="#f59e0b" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 2 }}>
                    Tools
                  </Typography>
                  <List>
                    {stress.tools.map((tool, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Zap size={20} color="#8b5cf6" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={tool}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Card>
          </motion.div>
        )}

        {/* Tracking Dialog */}
        <Dialog open={openTrackingDialog} onClose={handleCloseTrackingDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ color: 'white', background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
            Neuer Wellness-Eintrag
          </DialogTitle>
          <DialogContent sx={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>
                  Energie: {newTracking.energy}
                </Typography>
                <Slider
                  value={newTracking.energy || 5}
                  onChange={(_, value) => setNewTracking(prev => ({ ...prev, energy: value as number }))}
                  min={1}
                  max={10}
                  step={1}
                  sx={{ color: '#10b981' }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>
                  Stimmung: {newTracking.mood}
                </Typography>
                <Slider
                  value={newTracking.mood || 5}
                  onChange={(_, value) => setNewTracking(prev => ({ ...prev, mood: value as number }))}
                  min={1}
                  max={10}
                  step={1}
                  sx={{ color: '#10b981' }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ color: 'white', mb: 1 }}>
                  Stress: {newTracking.stress}
                </Typography>
                <Slider
                  value={newTracking.stress || 5}
                  onChange={(_, value) => setNewTracking(prev => ({ ...prev, stress: value as number }))}
                  min={1}
                  max={10}
                  step={1}
                  sx={{ color: '#f56565' }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notizen"
                  multiline
                  rows={3}
                  value={newTracking.notes}
                  onChange={(e) => setNewTracking(prev => ({ ...prev, notes: e.target.value }))}
                  sx={{ mt: 2 }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
            <Button onClick={handleCloseTrackingDialog} sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleSaveTracking}
              startIcon={<Save size={20} />}
              sx={{ 
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                fontWeight: 600
              }}
            >
              Speichern
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

// Hauptkomponente mit ProtectedRoute
export default function WellnessPage() {
  return (
    <ProtectedRoute requiredRole="vip">
      <WellnessContent />
    </ProtectedRoute>
  );
}
