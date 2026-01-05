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
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Star, 
  Brain, 
  Heart, 
  Zap, 
  Target,
  Info,
  CheckCircle,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';

interface ExtendedAnalysis {
  incarnationCross: {
    cross: string;
    description: string;
    lifePurpose: string;
    challenges: string[];
    gifts: string[];
  };
  variable: {
    environment: string;
    motivation: string;
    perspective: string;
    mind: string;
    description: string;
  };
  phs: {
    type: string;
    diet: string;
    environment: string;
    digestion: string;
    recommendations: string[];
  };
  color: {
    level: string;
    description: string;
    consciousness: string;
    development: string;
  };
  base: {
    type: string;
    description: string;
    energy: string;
    manifestation: string;
  };
}

function ExtendedAnalysisContent() {
  const [activeTab, setActiveTab] = useState(0);
  const [analysis, setAnalysis] = useState<ExtendedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExtendedAnalysis();
  }, []);

  const loadExtendedAnalysis = async () => {
    try {
      setLoading(true);
      // Mock-Daten für Demo
      const mockAnalysis: ExtendedAnalysis = {
        incarnationCross: {
          cross: "Right Angle Cross of the Sphinx (28/38 | 27/50)",
          description: "Das Kreuz der Sphinx - Weisheit und Führung",
          lifePurpose: "Du bist hier, um durch deine Weisheit und Führungsqualitäten andere zu inspirieren und zu leiten.",
          challenges: [
            "Perfektionismus loslassen",
            "Angst vor Autorität überwinden", 
            "Geduld mit dem eigenen Wachstum"
          ],
          gifts: [
            "Natürliche Führungsqualitäten",
            "Tiefe Weisheit und Einsicht",
            "Fähigkeit, andere zu inspirieren"
          ]
        },
        variable: {
          environment: "Caves",
          motivation: "Hope",
          perspective: "Individual",
          mind: "Active",
          description: "Du brauchst einen ruhigen, geschützten Raum, um deine individuellen Ideen zu entwickeln und anderen Hoffnung zu geben."
        },
        phs: {
          type: "Sensitive",
          diet: "Vegetarisch mit Fokus auf frische, lokale Zutaten",
          environment: "Ruhige, natürliche Umgebung",
          digestion: "Langsame, bewusste Verdauung",
          recommendations: [
            "Iss in ruhiger Atmosphäre",
            "Vermeide verarbeitete Lebensmittel",
            "Höre auf deinen Körper",
            "Regelmäßige Mahlzeiten"
          ]
        },
        color: {
          level: "Color 3",
          description: "Du bist in der dritten Bewusstseinsstufe - dem Stadium der Mutation und Transformation.",
          consciousness: "Du erlebst tiefe innere Transformationen und bist bereit für radikale Veränderungen.",
          development: "Fokus auf emotionale Heilung und spirituelles Wachstum."
        },
        base: {
          type: "Base 4",
          description: "Du hast eine stabile, erdende Grundenergie, die anderen Sicherheit gibt.",
          energy: "Ruhig, stabil, erdend",
          manifestation: "Du manifestierst durch geduldiges, beständiges Handeln."
        }
      };
      
      setAnalysis(mockAnalysis);
    } catch (err) {
      setError('Fehler beim Laden der erweiterten Analyse');
      console.error('Error loading extended analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
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

  if (!analysis) {
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
        <Alert severity="info" sx={{ mt: 2 }}>
          Keine erweiterte Analyse verfügbar. Bitte erstelle zuerst dein Human Design Chart.
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
              🔬 Erweiterte Analyse
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
              Tiefe Einblicke in dein energetisches Design - Incarnation Cross, Variable, PHS und mehr.
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
            <Tab label="Incarnation Cross" icon={<Star size={20} />} />
            <Tab label="Variable" icon={<Brain size={20} />} />
            <Tab label="PHS" icon={<Heart size={20} />} />
            <Tab label="Color" icon={<Zap size={20} />} />
            <Tab label="Base" icon={<Target size={20} />} />
          </Tabs>
        </Card>

        {/* Tab Content */}
        {activeTab === 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 3,
              p: 3
            }}>
              <Typography variant="h5" sx={{ color: '#FFD700', fontWeight: 700, mb: 2 }}>
                {analysis.incarnationCross.cross}
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
                {analysis.incarnationCross.description}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                    Lebensaufgabe
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
                    {analysis.incarnationCross.lifePurpose}
                  </Typography>
                  
                  <Typography variant="h6" sx={{ color: '#10b981', mb: 2 }}>
                    Deine Gaben
                  </Typography>
                  <List>
                    {analysis.incarnationCross.gifts.map((gift, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CheckCircle size={20} color="#10b981" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={gift}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#f56565', mb: 2 }}>
                    Herausforderungen
                  </Typography>
                  <List>
                    {analysis.incarnationCross.challenges.map((challenge, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <AlertTriangle size={20} color="#f56565" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={challenge}
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

        {activeTab === 1 && (
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
                Variable - Deine einzigartige Perspektive
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Chip 
                      label={`Environment: ${analysis.variable.environment}`}
                      sx={{ 
                        background: 'rgba(139, 92, 246, 0.2)',
                        color: '#8b5cf6',
                        fontWeight: 600,
                        mb: 1
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                      Du brauchst einen ruhigen, geschützten Raum für tiefes Denken.
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Chip 
                      label={`Motivation: ${analysis.variable.motivation}`}
                      sx={{ 
                        background: 'rgba(139, 92, 246, 0.2)',
                        color: '#8b5cf6',
                        fontWeight: 600,
                        mb: 1
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                      Du motivierst andere durch deine Vision und Hoffnung.
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 3 }}>
                    <Chip 
                      label={`Perspective: ${analysis.variable.perspective}`}
                      sx={{ 
                        background: 'rgba(139, 92, 246, 0.2)',
                        color: '#8b5cf6',
                        fontWeight: 600,
                        mb: 1
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                      Du siehst die Welt aus einer einzigartigen Perspektive.
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Chip 
                      label={`Mind: ${analysis.variable.mind}`}
                      sx={{ 
                        background: 'rgba(139, 92, 246, 0.2)',
                        color: '#8b5cf6',
                        fontWeight: 600,
                        mb: 1
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1 }}>
                      Dein Geist ist aktiv und sucht nach Verbindungen.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
              
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.6 }}>
                {analysis.variable.description}
              </Typography>
            </Card>
          </motion.div>
        )}

        {activeTab === 2 && (
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
                PHS - Primary Health System
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#ef4444', mb: 2 }}>
                    Ernährung & Verdauung
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                    <strong>Typ:</strong> {analysis.phs.type}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                    <strong>Diät:</strong> {analysis.phs.diet}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                    <strong>Verdauung:</strong> {analysis.phs.digestion}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#ef4444', mb: 2 }}>
                    Umgebung
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {analysis.phs.environment}
                  </Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />
              
              <Typography variant="h6" sx={{ color: '#ef4444', mb: 2 }}>
                Empfehlungen
              </Typography>
              <List>
                {analysis.phs.recommendations.map((rec, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Lightbulb size={20} color="#ef4444" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={rec}
                      sx={{ color: 'rgba(255,255,255,0.8)' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Card>
          </motion.div>
        )}

        {activeTab === 3 && (
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
                Color - Bewusstseinsstufe
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Chip 
                  label={analysis.color.level}
                  sx={{ 
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    fontWeight: 600,
                    mb: 2
                  }}
                />
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
                  {analysis.color.description}
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#10b981', mb: 2 }}>
                    Bewusstsein
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {analysis.color.consciousness}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#10b981', mb: 2 }}>
                    Entwicklung
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {analysis.color.development}
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          </motion.div>
        )}

        {activeTab === 4 && (
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
                Base - Grundenergie
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Chip 
                  label={analysis.base.type}
                  sx={{ 
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#f59e0b',
                    fontWeight: 600,
                    mb: 2
                  }}
                />
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
                  {analysis.base.description}
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#f59e0b', mb: 2 }}>
                    Energie
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {analysis.base.energy}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" sx={{ color: '#f59e0b', mb: 2 }}>
                    Manifestation
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    {analysis.base.manifestation}
                  </Typography>
                </Grid>
              </Grid>
            </Card>
          </motion.div>
        )}
      </Box>
    </Box>
  );
}

// Hauptkomponente mit ProtectedRoute
export default function ExtendedAnalysisPage() {
  return (
    <ProtectedRoute requiredRole="vip">
      <ExtendedAnalysisContent />
    </ProtectedRoute>
  );
}
