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
  LinearProgress,
  Divider
} from '@mui/material';
import { 
  Clock, 
  Sun, 
  Moon, 
  Star,
  Zap,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import SocialShare from '@/components/SocialShare';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Transit {
  planet: string;
  currentPosition: number;
  natalPosition: number;
  aspect: string;
  influence: string;
  duration: string;
  intensity: 'low' | 'medium' | 'high';
  description: string;
  advice: string[];
  startDate: string;
  endDate: string;
}

interface SolarReturn {
  year: number;
  sunPosition: number;
  moonPosition: number;
  ascendant: number;
  themes: string[];
  opportunities: string[];
  challenges: string[];
  focus: string;
}

interface Eclipse {
  type: 'solar' | 'lunar';
  date: string;
  sign: string;
  degree: number;
  influence: string;
  duration: string;
  advice: string[];
}

function TransitsContent() {
  const [activeTab, setActiveTab] = useState(0);
  const [transits, setTransits] = useState<Transit[]>([]);
  const [solarReturn, setSolarReturn] = useState<SolarReturn | null>(null);
  const [eclipses, setEclipses] = useState<Eclipse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTransitsData();
  }, []);

  const loadTransitsData = async () => {
    try {
      setLoading(true);
      
      // Mock-Daten für Demo
      const mockTransits: Transit[] = [
        {
          planet: 'Jupiter',
          currentPosition: 15.5,
          natalPosition: 8.2,
          aspect: 'Trine',
          influence: 'Expansion und Wachstum',
          duration: '3 Monate',
          intensity: 'high',
          description: 'Jupiter bildet ein harmonisches Trine zu deinem natalen Jupiter. Dies ist eine Zeit des Wachstums und der Expansion.',
          advice: [
            'Nutze diese Zeit für neue Projekte',
            'Erweitere deinen Horizont',
            'Sei offen für neue Möglichkeiten'
          ],
          startDate: '2024-01-15',
          endDate: '2024-04-15'
        },
        {
          planet: 'Saturn',
          currentPosition: 22.8,
          natalPosition: 18.3,
          aspect: 'Square',
          influence: 'Struktur und Disziplin',
          duration: '6 Monate',
          intensity: 'medium',
          description: 'Saturn bildet ein Quadrat zu deinem natalen Saturn. Zeit für Struktur und Disziplin.',
          advice: [
            'Arbeite an deinen langfristigen Zielen',
            'Sei geduldig mit dem Prozess',
            'Übe Disziplin in wichtigen Bereichen'
          ],
          startDate: '2024-02-01',
          endDate: '2024-08-01'
        },
        {
          planet: 'Mars',
          currentPosition: 5.2,
          natalPosition: 12.7,
          aspect: 'Opposition',
          influence: 'Energie und Aktion',
          duration: '2 Wochen',
          intensity: 'high',
          description: 'Mars steht in Opposition zu deinem natalen Mars. Hohe Energie und Aktion.',
          advice: [
            'Nutze deine Energie produktiv',
            'Vermeide Konflikte',
            'Sei vorsichtig mit impulsiven Entscheidungen'
          ],
          startDate: '2024-03-01',
          endDate: '2024-03-15'
        }
      ];

      const mockSolarReturn: SolarReturn = {
        year: 2024,
        sunPosition: 285.5,
        moonPosition: 142.3,
        ascendant: 78.9,
        themes: [
          'Neue Anfänge',
          'Persönliches Wachstum',
          'Kreative Projekte'
        ],
        opportunities: [
          'Berufliche Weiterentwicklung',
          'Neue Beziehungen',
          'Kreative Ausdrucksmöglichkeiten'
        ],
        challenges: [
          'Geduld mit dem Prozess',
          'Balance zwischen Arbeit und Privatleben',
          'Kommunikation verbessern'
        ],
        focus: 'Dieses Jahr steht im Zeichen der persönlichen Transformation und des kreativen Ausdrucks.'
      };

      const mockEclipses: Eclipse[] = [
        {
          type: 'solar',
          date: '2024-04-08',
          sign: 'Aries',
          degree: 19.2,
          influence: 'Neue Anfänge und persönliche Initiative',
          duration: '6 Monate',
          advice: [
            'Setze neue Ziele',
            'Beginne neue Projekte',
            'Sei mutig und initiativ'
          ]
        },
        {
          type: 'lunar',
          date: '2024-03-25',
          sign: 'Libra',
          degree: 5.1,
          influence: 'Beziehungen und Balance',
          duration: '3 Monate',
          advice: [
            'Arbeite an deinen Beziehungen',
            'Suche Balance in deinem Leben',
            'Löse alte Konflikte'
          ]
        }
      ];

      setTransits(mockTransits);
      setSolarReturn(mockSolarReturn);
      setEclipses(mockEclipses);
    } catch (err) {
      setError('Fehler beim Laden der Transite-Daten');
      console.error('Error loading transits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getIntensityIcon = (intensity: string) => {
    switch (intensity) {
      case 'high': return <Zap size={16} />;
      case 'medium': return <Target size={16} />;
      case 'low': return <CheckCircle size={16} />;
      default: return <Info size={16} />;
    }
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
              py: { xs: 4, md: 6 },
              position: 'relative'
            }}>
              {/* Social Share Button */}
              <Box sx={{ position: 'absolute', top: 0, right: 0 }}>
                <SocialShare
                  title="Aktuelle Transite & Kosmisches Timing"
                  description="Schau dir die aktuellen planetaren Transits und ihre Bedeutung an!"
                  type="transit"
                  onShare={(platform) => {
                    console.log(`Transits geteilt auf ${platform}`);
                  }}
                />
              </Box>
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
              🌙 Transite & Timing
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
              Entdecke die kosmischen Einflüsse auf dein Leben - Planeten-Transite, Solar Return und Eclipses.
            </Typography>
          </Box>
        </motion.div>

        {/* Tabs */}
        <Card sx={{
          backgroundColor: 'transparent !important',
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
                minWidth: 180,
                px: 4,
                '&.Mui-selected': {
                  color: '#FFD700'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#FFD700'
              }
            }}
          >
            <Tab label="Aktuelle Transite" icon={<Clock size={20} />} />
            <Tab label="Solar Return" icon={<Sun size={20} />} />
            <Tab label="Eclipses" icon={<Moon size={20} />} />
          </Tabs>
        </Card>

        {/* Tab Content */}
        {activeTab === 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h5" sx={{ color: 'white', mb: 3 }}>
              Aktuelle Planeten-Transite
            </Typography>
            
            <Grid container spacing={3}>
              {transits.map((transit, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card sx={{
                      backgroundColor: 'rgba(30, 35, 60, 0.6) !important',
                      background: `linear-gradient(135deg, rgba(${getIntensityColor(transit.intensity).slice(1)}, 0.1) 0%, rgba(${getIntensityColor(transit.intensity).slice(1)}, 0.05) 100%)`,
                      border: `1px solid ${getIntensityColor(transit.intensity)}40`,
                      borderRadius: 3,
                      p: 3,
                      height: '100%',
                      color: '#FFD700'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Star size={24} color={getIntensityColor(transit.intensity)} />
                        <Typography variant="h6" sx={{ color: 'white', ml: 1, fontWeight: 600 }}>
                          {transit.planet}
                        </Typography>
                        <Chip 
                          label={transit.intensity.toUpperCase()}
                          size="small"
                          sx={{ 
                            ml: 'auto',
                            background: getIntensityColor(transit.intensity),
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                        {transit.aspect} • {transit.duration}
                      </Typography>
                      
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
                        {transit.description}
                      </Typography>
                      
                      <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                      
                      <Typography variant="subtitle2" sx={{ color: getIntensityColor(transit.intensity), mb: 1 }}>
                        Empfehlungen:
                      </Typography>
                      <List dense>
                        {transit.advice.map((advice, adviceIndex) => (
                          <ListItem key={adviceIndex} sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 20 }}>
                              {getIntensityIcon(transit.intensity)}
                            </ListItemIcon>
                            <ListItemText 
                              primary={advice}
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

        {activeTab === 1 && solarReturn && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card sx={{
              backgroundColor: 'rgba(30, 35, 60, 0.6) !important',
              background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: 3,
              p: 3,
              color: '#FFD700'
            }}>
              <Typography variant="h5" sx={{ color: '#FFD700', fontWeight: 700, mb: 3 }}>
                Solar Return {solarReturn.year}
              </Typography>
              
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 4, lineHeight: 1.6 }}>
                {solarReturn.focus}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                    Themen
                  </Typography>
                  <List>
                    {solarReturn.themes.map((theme, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Target size={20} color="#FFD700" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={theme}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" sx={{ color: '#10b981', mb: 2 }}>
                    Chancen
                  </Typography>
                  <List>
                    {solarReturn.opportunities.map((opportunity, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <TrendingUp size={20} color="#10b981" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={opportunity}
                          sx={{ color: 'rgba(255,255,255,0.8)' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" sx={{ color: '#f56565', mb: 2 }}>
                    Herausforderungen
                  </Typography>
                  <List>
                    {solarReturn.challenges.map((challenge, index) => (
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

        {activeTab === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h5" sx={{ color: 'white', mb: 3 }}>
              Kommende Eclipses
            </Typography>
            
            <Grid container spacing={3}>
              {eclipses.map((eclipse, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card sx={{
                      backgroundColor: 'rgba(30, 35, 60, 0.6) !important',
                      background: eclipse.type === 'solar' 
                        ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.05) 100%)',
                      border: eclipse.type === 'solar' 
                        ? '1px solid rgba(255, 215, 0, 0.3)'
                        : '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: 3,
                      p: 3,
                      color: '#FFD700'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {eclipse.type === 'solar' ? <Sun size={24} /> : <Moon size={24} />}
                        <Typography variant="h6" sx={{ color: 'white', ml: 1, fontWeight: 600 }}>
                          {eclipse.type === 'solar' ? 'Sonnenfinsternis' : 'Mondfinsternis'}
                        </Typography>
                        <Chip 
                          label={eclipse.date}
                          size="small"
                          sx={{ 
                            ml: 'auto',
                            background: eclipse.type === 'solar' ? '#FFD700' : '#8b5cf6',
                            color: 'white',
                            fontWeight: 600
                          }}
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                        {eclipse.sign} • {eclipse.degree}° • {eclipse.duration}
                      </Typography>
                      
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
                        {eclipse.influence}
                      </Typography>
                      
                      <Typography variant="subtitle2" sx={{ 
                        color: eclipse.type === 'solar' ? '#FFD700' : '#8b5cf6', 
                        mb: 1 
                      }}>
                        Empfehlungen:
                      </Typography>
                      <List dense>
                        {eclipse.advice.map((advice, adviceIndex) => (
                          <ListItem key={adviceIndex} sx={{ px: 0, py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 20 }}>
                              {eclipse.type === 'solar' ? <Sun size={16} /> : <Moon size={16} />}
                            </ListItemIcon>
                            <ListItemText 
                              primary={advice}
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
      </Box>
    </Box>
  );
}

// Hauptkomponente mit ProtectedRoute
export default function TransitsPage() {
  return (
    <ProtectedRoute requiredRole="vip">
      <TransitsContent />
    </ProtectedRoute>
  );
}
