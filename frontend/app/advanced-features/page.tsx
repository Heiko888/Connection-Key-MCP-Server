"use client";

import React, { useState, useEffect } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import { 
  Brain, 
  Mic, 
  Box as BoxIcon, 
  Camera,
  Play,
  Pause,
  Volume2,
  Settings,
  Download,
  Upload,
  Share,
  Star,
  Zap,
  Target,
  CheckCircle,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AICoaching {
  type: string;
  description: string;
  features: string[];
  benefits: string[];
  examples: string[];
}

interface VoiceReading {
  type: string;
  duration: string;
  features: string[];
  quality: string;
  languages: string[];
  description: string;
}

interface Bodygraph3D {
  features: string[];
  interactions: string[];
  benefits: string[];
  requirements: string[];
}

interface ARFeatures {
  features: string[];
  useCases: string[];
  benefits: string[];
  requirements: string[];
}

export default function AdvancedFeaturesPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [aiCoaching, setAiCoaching] = useState<AICoaching | null>(null);
  const [voiceReading, setVoiceReading] = useState<VoiceReading | null>(null);
  const [bodygraph3D, setBodygraph3D] = useState<Bodygraph3D | null>(null);
  const [arFeatures, setArFeatures] = useState<ARFeatures | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openAIDialog, setOpenAIDialog] = useState(false);
  const [openVoiceDialog, setOpenVoiceDialog] = useState(false);
  const [open3DDialog, setOpen3DDialog] = useState(false);
  const [openARDialog, setOpenARDialog] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [voiceText, setVoiceText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadAdvancedFeatures();
  }, []);

  const loadAdvancedFeatures = async () => {
    try {
      setLoading(true);
      
      // Mock-Daten für Demo
      const mockAICoaching: AICoaching = {
        type: 'AI-Powered Human Design Coach',
        description: 'Ein intelligenter Coach, der basierend auf deinem Human Design personalisierte Beratung bietet.',
        features: [
          'Personalisierte Coaching-Sessions',
          '24/7 Verfügbarkeit',
          'Adaptive Lernalgorithmen',
          'Emotionale Intelligenz',
          'Kontextuelle Beratung'
        ],
        benefits: [
          'Kontinuierliche Unterstützung',
          'Personalisierte Insights',
          'Sofortige Antworten',
          'Kosteneffizient',
          'Skalierbar'
        ],
        examples: [
          'Strategie-Beratung für Generators',
          'Autoritäts-Coaching für Projectors',
          'Timing-Empfehlungen für Manifestors',
          'Reflektion für Reflectors'
        ]
      };

      const mockVoiceReading: VoiceReading = {
        type: 'AI Voice Reading Generator',
        description: 'Generiere professionelle Human Design Readings mit künstlicher Intelligenz.',
        features: [
          'Natürliche Sprachsynthese',
          'Personalisierte Inhalte',
          'Mehrere Sprachen',
          'Emotionale Modulation',
          'Anpassbare Stimmen'
        ],
        quality: 'Studio-Qualität',
        languages: ['Deutsch', 'Englisch', 'Spanisch', 'Französisch', 'Italienisch'],
        duration: '15-60 Minuten'
      };

      const mockBodygraph3D: Bodygraph3D = {
        features: [
          'Interaktive 3D-Visualisierung',
          'Zoom und Rotation',
          'Animierte Energieflüsse',
          'Transit-Overlays',
          'VR-Unterstützung'
        ],
        interactions: [
          'Touch-Gesten',
          'Voice-Kommandos',
          'Hand-Tracking',
          'Eye-Tracking',
          'Haptic Feedback'
        ],
        benefits: [
          'Bessere Verständlichkeit',
          'Immersive Erfahrung',
          'Detaillierte Analyse',
          'Interaktive Exploration',
          'Moderne Technologie'
        ],
        requirements: [
          'WebGL-Unterstützung',
          'Moderne Browser',
          'VR-Headset (optional)',
          'Stabile Internetverbindung'
        ]
      };

      const mockARFeatures: ARFeatures = {
        features: [
          'AR Bodygraph Overlay',
          'Real-time Transits',
          'Interactive Elements',
          'Spatial Audio',
          'Gesture Recognition'
        ],
        useCases: [
          'Live-Readings',
          'Gruppen-Sessions',
          'Workshops',
          'Präsentationen',
          'Lernumgebungen'
        ],
        benefits: [
          'Immersive Erfahrung',
          'Praktische Anwendung',
          'Interaktive Lernerfahrung',
          'Moderne Technologie',
          'Engagement steigern'
        ],
        requirements: [
          'AR-fähiges Gerät',
          'Kamera-Zugriff',
          'Stabile Verbindung',
          'Ausreichend Speicher'
        ]
      };

      setAiCoaching(mockAICoaching);
      setVoiceReading(mockVoiceReading);
      setBodygraph3D(mockBodygraph3D);
      setArFeatures(mockARFeatures);
    } catch (err) {
      setError('Fehler beim Laden der erweiterten Features');
      console.error('Error loading advanced features:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAICoaching = () => {
    setOpenAIDialog(true);
  };

  const handleVoiceReading = () => {
    setOpenVoiceDialog(true);
  };

  const handle3DBodygraph = () => {
    setOpen3DDialog(true);
  };

  const handleARFeatures = () => {
    setOpenARDialog(true);
  };

  const handleCloseDialogs = () => {
    setOpenAIDialog(false);
    setOpenVoiceDialog(false);
    setOpen3DDialog(false);
    setOpenARDialog(false);
    setAiPrompt('');
    setVoiceText('');
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // Mock recording functionality
    setTimeout(() => {
      setIsRecording(false);
      setVoiceText('Dein Human Design Reading wurde generiert...');
    }, 3000);
  };

  const handlePlayReading = () => {
    setIsPlaying(true);
    // Mock playback functionality
    setTimeout(() => {
      setIsPlaying(false);
    }, 5000);
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
              🚀 Erweiterte Features
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
              Entdecke die Zukunft des Human Design mit KI, 3D und AR - AI-Coaching, Voice-Readings und immersive Erfahrungen.
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
            <Tab label="AI Coaching" icon={<Brain size={20} />} />
            <Tab label="Voice Readings" icon={<Mic size={20} />} />
            <Tab label="3D Bodygraph" icon={<BoxIcon size={20} />} />
            <Tab label="AR Features" icon={<Camera size={20} />} />
          </Tabs>
        </Card>

        {/* Tab Content */}
        {activeTab === 0 && aiCoaching && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: 3,
              p: 3
            }}>
              <Typography variant="h5" sx={{ color: '#8b5cf6', fontWeight: 700, mb: 3 }}>
                {aiCoaching.type}
              </Typography>
              
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 4, lineHeight: 1.6 }}>
                {aiCoaching.description}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 2 }}>
                    Features
                  </Typography>
                  <List>
                    {aiCoaching.features.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CheckCircle size={20} color="#8b5cf6" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#10b981', mb: 2 }}>
                    Vorteile
                  </Typography>
                  <List>
                    {aiCoaching.benefits.map((benefit, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Star size={20} color="#10b981" />
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
              
              <Typography variant="h6" sx={{ color: '#8b5cf6', mb: 2 }}>
                Beispiele
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                {aiCoaching.examples.map((example, index) => (
                  <Chip 
                    key={index}
                    label={example}
                    sx={{ 
                      background: 'rgba(139, 92, 246, 0.2)',
                      color: '#8b5cf6',
                      fontWeight: 600
                    }}
                  />
                ))}
              </Box>
              
              <Button
                variant="contained"
                startIcon={<Brain size={20} />}
                onClick={handleAICoaching}
                sx={{
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)'
                  }
                }}
              >
                AI Coach starten
              </Button>
            </Card>
          </motion.div>
        )}

        {activeTab === 1 && voiceReading && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 3,
              p: 3
            }}>
              <Typography variant="h5" sx={{ color: '#10b981', fontWeight: 700, mb: 3 }}>
                {voiceReading.type}
              </Typography>
              
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 4, lineHeight: 1.6 }}>
                {voiceReading.description}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#10b981', mb: 2 }}>
                    Features
                  </Typography>
                  <List>
                    {voiceReading.features.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CheckCircle size={20} color="#10b981" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#10b981', mb: 2 }}>
                    Sprachen
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {voiceReading.languages.map((language, index) => (
                      <Chip 
                        key={index}
                        label={language}
                        sx={{ 
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#10b981',
                          fontWeight: 600
                        }}
                      />
                    ))}
                  </Box>
                  
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Qualität:</strong> {voiceReading.quality}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    <strong>Dauer:</strong> {voiceReading.duration}
                  </Typography>
                </Grid>
              </Grid>
              
              <Button
                variant="contained"
                startIcon={<Mic size={20} />}
                onClick={handleVoiceReading}
                sx={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #059669, #10b981)'
                  }
                }}
              >
                Voice Reading erstellen
              </Button>
            </Card>
          </motion.div>
        )}

        {activeTab === 2 && bodygraph3D && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: 3,
              p: 3
            }}>
              <Typography variant="h5" sx={{ color: '#FFD700', fontWeight: 700, mb: 3 }}>
                3D Bodygraph
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                    Features
                  </Typography>
                  <List>
                    {bodygraph3D.features.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CheckCircle size={20} color="#FFD700" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                    Interaktionen
                  </Typography>
                  <List>
                    {bodygraph3D.interactions.map((interaction, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Zap size={20} color="#FFD700" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={interaction}
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
                  <Typography variant="h6" sx={{ color: '#10b981', mb: 2 }}>
                    Vorteile
                  </Typography>
                  <List>
                    {bodygraph3D.benefits.map((benefit, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Star size={20} color="#10b981" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={benefit}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#f56565', mb: 2 }}>
                    Anforderungen
                  </Typography>
                  <List>
                    {bodygraph3D.requirements.map((requirement, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Info size={20} color="#f56565" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={requirement}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
              
              <Button
                variant="contained"
                startIcon={<BoxIcon size={20} />}
                onClick={handle3DBodygraph}
                sx={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  color: 'black',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FFA500, #FFD700)'
                  }
                }}
              >
                3D Bodygraph öffnen
              </Button>
            </Card>
          </motion.div>
        )}

        {activeTab === 3 && arFeatures && (
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
                AR Features
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#ef4444', mb: 2 }}>
                    Features
                  </Typography>
                  <List>
                    {arFeatures.features.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CheckCircle size={20} color="#ef4444" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#ef4444', mb: 2 }}>
                    Anwendungsfälle
                  </Typography>
                  <List>
                    {arFeatures.useCases.map((useCase, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Target size={20} color="#ef4444" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={useCase}
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
                  <Typography variant="h6" sx={{ color: '#10b981', mb: 2 }}>
                    Vorteile
                  </Typography>
                  <List>
                    {arFeatures.benefits.map((benefit, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Star size={20} color="#10b981" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={benefit}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#f56565', mb: 2 }}>
                    Anforderungen
                  </Typography>
                  <List>
                    {arFeatures.requirements.map((requirement, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Info size={20} color="#f56565" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={requirement}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
              
              <Button
                variant="contained"
                startIcon={<Camera size={20} />}
                onClick={handleARFeatures}
                sx={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #dc2626, #ef4444)'
                  }
                }}
              >
                AR Features aktivieren
              </Button>
            </Card>
          </motion.div>
        )}

        {/* AI Coaching Dialog */}
        <Dialog open={openAIDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
          <DialogTitle sx={{ color: 'white', background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
            AI Human Design Coach
          </DialogTitle>
          <DialogContent sx={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
            <TextField
              fullWidth
              label="Stelle deine Frage..."
              multiline
              rows={4}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              sx={{ mt: 2 }}
              placeholder="Z.B.: Wie kann ich als Generator meine Energie besser nutzen?"
            />
          </DialogContent>
          <DialogActions sx={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
            <Button onClick={handleCloseDialogs} sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleCloseDialogs}
              sx={{ 
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                color: 'white',
                fontWeight: 600
              }}
            >
              Coach fragen
            </Button>
          </DialogActions>
        </Dialog>

        {/* Voice Reading Dialog */}
        <Dialog open={openVoiceDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
          <DialogTitle sx={{ color: 'white', background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
            Voice Reading Generator
          </DialogTitle>
          <DialogContent sx={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                startIcon={isRecording ? <Pause size={20} /> : <Mic size={20} />}
                onClick={handleStartRecording}
                disabled={isRecording}
                sx={{
                  background: isRecording ? '#f56565' : 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  fontWeight: 600
                }}
              >
                {isRecording ? 'Aufnahme läuft...' : 'Aufnahme starten'}
              </Button>
              
              {voiceText && (
                <TextField
                  fullWidth
                  label="Generierter Text"
                  multiline
                  rows={6}
                  value={voiceText}
                  InputProps={{ readOnly: true }}
                />
              )}
              
              {voiceText && (
                <Button
                  variant="contained"
                  startIcon={isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  onClick={handlePlayReading}
                  disabled={isPlaying}
                  sx={{
                    background: isPlaying ? '#f56565' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    color: 'white',
                    fontWeight: 600
                  }}
                >
                  {isPlaying ? 'Wiedergabe läuft...' : 'Abspielen'}
                </Button>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
            <Button onClick={handleCloseDialogs} sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Schließen
            </Button>
            <Button 
              startIcon={<Download size={20} />}
              sx={{ 
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                fontWeight: 600
              }}
            >
              Download
            </Button>
          </DialogActions>
        </Dialog>

        {/* 3D Bodygraph Dialog */}
        <Dialog open={open3DDialog} onClose={handleCloseDialogs} maxWidth="lg" fullWidth>
          <DialogTitle sx={{ color: 'white', background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
            3D Bodygraph
          </DialogTitle>
          <DialogContent sx={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
            <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                3D Bodygraph wird geladen...
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
            <Button onClick={handleCloseDialogs} sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Schließen
            </Button>
            <Button 
              startIcon={<Share size={20} />}
              sx={{ 
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: 'black',
                fontWeight: 600
              }}
            >
              Teilen
            </Button>
          </DialogActions>
        </Dialog>

        {/* AR Features Dialog */}
        <Dialog open={openARDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
          <DialogTitle sx={{ color: 'white', background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
            AR Features
          </DialogTitle>
          <DialogContent sx={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="AR Bodygraph Overlay"
                sx={{ color: 'white' }}
              />
              <FormControlLabel
                control={<Switch />}
                label="Real-time Transits"
                sx={{ color: 'white' }}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Interactive Elements"
                sx={{ color: 'white' }}
              />
              <FormControlLabel
                control={<Switch />}
                label="Spatial Audio"
                sx={{ color: 'white' }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
            <Button onClick={handleCloseDialogs} sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Abbrechen
            </Button>
            <Button 
              sx={{ 
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                fontWeight: 600
              }}
            >
              AR aktivieren
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
