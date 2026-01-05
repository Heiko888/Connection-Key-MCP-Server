import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, Chip, Alert, Divider, List, ListItem, ListItemIcon, ListItemText, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import { User, Heart, Target, Zap, Star, Moon, TrendingUp, Lightbulb } from 'lucide-react';
import { HumanDesignRecommendations, fetchHumanDesignRecommendations, type MoonPhase } from '../moonApi';

interface HumanDesignTabProps {
  hdRecommendations: HumanDesignRecommendations | null;
  onSetHdType: () => void;
  currentPhase: MoonPhase | null;
}

const hdTypes = [
  {
    value: 'Manifesting Generator',
    label: 'Manifesting Generator',
    icon: '⚡',
    description: 'Energie + Manifestation',
    color: '#f59e0b'
  },
  {
    value: 'Generator',
    label: 'Generator',
    icon: '🔋',
    description: 'Sakrale Energie',
    color: '#10b981'
  },
  {
    value: 'Manifestor',
    label: 'Manifestor',
    icon: '🚀',
    description: 'Initiative Energie',
    color: '#ef4444'
  },
  {
    value: 'Projector',
    label: 'Projector',
    icon: '👁️',
    description: 'Fokussierte Energie',
    color: '#8b5cf6'
  },
  {
    value: 'Reflector',
    label: 'Reflector',
    icon: '🌙',
    description: 'Lunare Energie',
    color: '#06b6d4'
  }
];

export default function HumanDesignTab({ hdRecommendations, onSetHdType, currentPhase }: HumanDesignTabProps) {
  const [selectedHdType, setSelectedHdType] = useState<string>('Generator');
  const [recommendations, setRecommendations] = useState<HumanDesignRecommendations | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hdRecommendations) {
      setRecommendations(hdRecommendations);
    }
  }, [hdRecommendations]);

  const loadRecommendations = async (hdType: string) => {
    setLoading(true);
    try {
      const data = await fetchHumanDesignRecommendations(hdType);
      setRecommendations(data);
    } catch (error) {
      console.error('Fehler beim Laden der HD-Empfehlungen:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHdTypeChange = async (hdType: string) => {
    setSelectedHdType(hdType);
    await loadRecommendations(hdType);
  };

  const getHdTypeColor = (hdType: string) => {
    const type = hdTypes.find(t => t.value === hdType);
    return type?.color || '#718096';
  };

  const isOptimalPhase = (phaseName: string) => {
    if (!recommendations) return false;
    return recommendations.recommendations.optimal_phases.includes(phaseName);
  };

  const getPhaseIcon = (phaseName: string) => {
    const icons: { [key: string]: string } = {
      'Neumond': '🌑',
      'Zunehmender Sichelmond': '🌒',
      'Erstes Viertel': '🌓',
      'Zunehmender Gibbous': '🌔',
      'Vollmond': '🌕',
      'Abnehmender Gibbous': '🌖',
      'Letztes Viertel': '🌗',
      'Abnehmender Sichelmond': '🌘'
    };
    return icons[phaseName] || '🌙';
  };

  return (
    <motion.div
      
      
      
    >
      <Card sx={{
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        border: '1px solid rgba(254,243,199,0.2)'
      }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <User size={24} color="#fef3c7" />
              <Typography variant="h5" sx={{
                color: '#fef3c7',
                fontWeight: 700,
                ml: 2
              }}>
                Human Design Integration
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={onSetHdType}
              sx={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                color: '#1f2937',
                fontWeight: 700,
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #fde68a 0%, #fef3c7 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 25px rgba(254,243,199,0.3)'
                }
              }}
            >
              HD-Typ ändern
            </Button>
          </Box>

          {/* HD Type Selection */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2 }}>
              Dein Human Design Typ
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              {hdTypes.map((hdType) => (
                <motion.div
                  key={hdType.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Paper
                    onClick={() => handleHdTypeChange(hdType.value)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      background: selectedHdType === hdType.value 
                        ? `linear-gradient(135deg, ${hdType.color}20 0%, ${hdType.color}10 100%)`
                        : 'rgba(255,255,255,0.05)',
                      border: selectedHdType === hdType.value 
                        ? `2px solid ${hdType.color}`
                        : '1px solid rgba(254,243,199,0.1)',
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${hdType.color}15 0%, ${hdType.color}05 100%)`,
                        borderColor: hdType.color
                      }
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography sx={{ fontSize: '2rem', mb: 1 }}>
                        {hdType.icon}
                      </Typography>
                      <Typography sx={{
                        color: selectedHdType === hdType.value ? hdType.color : '#fef3c7',
                        fontWeight: selectedHdType === hdType.value ? 700 : 600,
                        fontSize: '0.9rem',
                        mb: 0.5
                      }}>
                        {hdType.label}
                      </Typography>
                      <Typography sx={{
                        color: 'rgba(254,243,199,0.7)',
                        fontSize: '0.8rem'
                      }}>
                        {hdType.description}
                      </Typography>
                    </Box>
                  </Paper>
                </motion.div>
              ))}
            </Box>
          </Box>

          {/* Current Phase Status */}
          {currentPhase && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Moon size={20} />
                Aktuelle Mondphase
              </Typography>
              <Paper sx={{
                p: 3,
                background: isOptimalPhase(currentPhase.name) 
                  ? 'linear-gradient(135deg, rgba(34,197,94,0.2) 0%, rgba(34,197,94,0.1) 100%)'
                  : 'rgba(255,255,255,0.05)',
                border: isOptimalPhase(currentPhase.name) 
                  ? '2px solid rgba(34,197,94,0.5)'
                  : '1px solid rgba(254,243,199,0.1)',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ fontSize: '2rem' }}>
                    {getPhaseIcon(currentPhase.name)}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{
                      color: '#fef3c7',
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      mb: 0.5
                    }}>
                      {currentPhase.name}
                    </Typography>
                    <Typography sx={{
                      color: 'rgba(254,243,199,0.7)',
                      fontSize: '0.9rem'
                    }}>
                      {currentPhase.description}
                    </Typography>
                  </Box>
                  {isOptimalPhase(currentPhase.name) && (
                    <Chip
                      label="Optimal für dich"
                      icon={<Star size={16} />}
                      sx={{
                        background: 'rgba(34,197,94,0.2)',
                        color: '#86efac',
                        border: '1px solid rgba(34,197,94,0.3)',
                        fontWeight: 600
                      }}
                    />
                  )}
                </Box>
              </Paper>
            </Box>
          )}

          {/* Recommendations */}
          {recommendations && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Heart size={20} />
                Deine HD-Empfehlungen
              </Typography>
              
              <Grid container spacing={3}>
                {/* Optimal Phases */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{
                    p: 3,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(254,243,199,0.1)',
                    borderRadius: 2
                  }}>
                    <Typography sx={{
                      color: '#fef3c7',
                      fontWeight: 600,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Target size={18} />
                      Optimale Mondphasen
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {recommendations.recommendations.optimal_phases.map((phase, index) => (
                        <Chip
                          key={index}
                          label={`${getPhaseIcon(phase)} ${phase}`}
                          sx={{
                            background: 'rgba(34,197,94,0.2)',
                            color: '#86efac',
                            border: '1px solid rgba(34,197,94,0.3)',
                            fontSize: '0.8rem'
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                {/* Advice */}
                <Grid item xs={12} md={6}>
                  <Paper sx={{
                    p: 3,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(254,243,199,0.1)',
                    borderRadius: 2
                  }}>
                    <Typography sx={{
                      color: '#fef3c7',
                      fontWeight: 600,
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Lightbulb size={18} />
                      Empfehlung
                    </Typography>
                    <Typography sx={{
                      color: 'rgba(254,243,199,0.8)',
                      lineHeight: 1.6
                    }}>
                      {recommendations.recommendations.advice}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Rituals */}
              <Paper sx={{
                p: 3,
                mt: 3,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(254,243,199,0.1)',
                borderRadius: 2
              }}>
                <Typography sx={{
                  color: '#fef3c7',
                  fontWeight: 600,
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Zap size={18} />
                  Empfohlene Rituale
                </Typography>
                <List sx={{ p: 0 }}>
                  {recommendations.recommendations.rituals.map((ritual, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Typography sx={{ color: getHdTypeColor(selectedHdType), fontSize: '1.2rem' }}>
                          ✨
                        </Typography>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography sx={{
                            color: 'rgba(254,243,199,0.9)',
                            fontSize: '0.9rem'
                          }}>
                            {ritual}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          )}

          {/* Info Box */}
          <Alert
            severity="info"
            sx={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.2)',
              color: '#93c5fd',
              '& .MuiAlert-icon': {
                color: '#93c5fd'
              }
            }}
          >
            <Typography sx={{ fontSize: '0.9rem' }}>
              <strong>Human Design + Mondphasen:</strong> Dein HD-Typ bestimmt, welche Mondphasen für dich optimal sind. 
              Nutze diese Verbindung, um deine Energie und Entscheidungen mit dem Mondzyklus zu synchronisieren.
            </Typography>
          </Alert>
        </CardContent>
      </Card>
    </motion.div>
  );
}
