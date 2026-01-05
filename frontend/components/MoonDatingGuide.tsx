"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, Grid, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Heart, Star, Calendar, Users, Zap, Eye, Flame, RotateCcw, Share2, Bookmark } from 'lucide-react';
import { useNotifications } from './NotificationService';

interface MoonPhase {
  name: string;
  icon: string;
  description: string;
  datingEnergy: string;
  bestFor: string[];
  avoid: string[];
  tips: string[];
  color: string;
  intensity: number;
}

interface MoonDatingRecommendation {
  phase: MoonPhase;
  date: Date;
  recommendation: string;
  activities: string[];
  energy: string;
  compatibility: string;
}

const moonPhases: MoonPhase[] = [
  {
    name: 'Neumond',
    icon: '🌑',
    description: 'Zeit für Neuanfänge und neue Verbindungen',
    datingEnergy: 'Introspektiv und aufrichtig',
    bestFor: ['Erste Dates', 'Tiefe Gespräche', 'Neue Bekanntschaften', 'Authentische Verbindungen'],
    avoid: ['Oberflächliche Treffen', 'Heiße Diskussionen', 'Druck aufbauen'],
    tips: [
      'Sei besonders aufrichtig und authentisch',
      'Fokussiere dich auf tiefe Gespräche',
      'Lass die Verbindung natürlich wachsen',
      'Nutze die Energie für neue Anfänge'
    ],
    color: '#1E293B',
    intensity: 3
  },
  {
    name: 'Zunehmender Mond',
    icon: '🌒',
    description: 'Energie wächst - perfekt für Dating-Momentum',
    datingEnergy: 'Aufbauend und optimistisch',
    bestFor: ['Aktive Dates', 'Abenteuer', 'Gemeinsame Aktivitäten', 'Energie aufbauen'],
    avoid: ['Passive Aktivitäten', 'Zu viel Planung', 'Überwältigung'],
    tips: [
      'Plane aktive und abenteuerliche Dates',
      'Nutze die wachsende Energie für gemeinsame Projekte',
      'Sei optimistisch und voller Vorfreude',
      'Baue schrittweise Vertrauen auf'
    ],
    color: '#3B82F6',
    intensity: 6
  },
  {
    name: 'Vollmond',
    icon: '🌕',
    description: 'Höchste Intensität - perfekt für leidenschaftliche Momente',
    datingEnergy: 'Intensiv und leidenschaftlich',
    bestFor: ['Romantische Dates', 'Intime Momente', 'Wichtige Gespräche', 'Leidenschaft'],
    avoid: ['Konflikte', 'Überwältigung', 'Zu viel Drama'],
    tips: [
      'Nutze die Intensität für romantische Momente',
      'Sei bereit für tiefe emotionale Verbindungen',
      'Vermeide Konflikte und Drama',
      'Lass die Leidenschaft natürlich fließen'
    ],
    color: '#F59E0B',
    intensity: 9
  },
  {
    name: 'Abnehmender Mond',
    icon: '🌖',
    description: 'Zeit für Reflexion und Vertiefung bestehender Verbindungen',
    datingEnergy: 'Reflektierend und vertiefend',
    bestFor: ['Bestehende Beziehungen', 'Reflexion', 'Vertiefung', 'Heilung'],
    avoid: ['Neue Beziehungen', 'Oberflächlichkeit', 'Vergangenheit'],
    tips: [
      'Fokussiere dich auf bestehende Verbindungen',
      'Nutze die Zeit für Reflexion und Heilung',
      'Vertiefe bestehende Beziehungen',
      'Lass Altes los und mache Platz für Neues'
    ],
    color: '#8B5CF6',
    intensity: 5
  }
];

const getMoonPhaseIcon = (phase: string) => {
  switch (phase.toLowerCase()) {
    case 'neumond':
      return <Moon size={20} />;
    case 'zunehmender mond':
      return <Sun size={20} />;
    case 'vollmond':
      return <Star size={20} />;
    case 'abnehmender mond':
      return <Moon size={20} />;
    default:
      return <Moon size={20} />;
  }
};

const getIntensityColor = (intensity: number) => {
  if (intensity >= 8) return '#ef4444';
  if (intensity >= 6) return '#f59e0b';
  if (intensity >= 4) return '#3b82f6';
  return '#6b7280';
};

const getIntensityLabel = (intensity: number) => {
  if (intensity >= 8) return 'Sehr Hoch';
  if (intensity >= 6) return 'Hoch';
  if (intensity >= 4) return 'Mittel';
  return 'Niedrig';
};

export default function MoonDatingGuide() {
  const [currentPhase, setCurrentPhase] = useState<MoonPhase | null>(null);
  const [recommendations, setRecommendations] = useState<MoonDatingRecommendation[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [savedRecommendations, setSavedRecommendations] = useState<string[]>([]);
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Simulate current moon phase (in real app, this would come from an API)
    const randomPhase = moonPhases[Math.floor(Math.random() * moonPhases.length)];
    setCurrentPhase(randomPhase);

    // Generate recommendations for the next 7 days
    generateRecommendations();
  }, []);

  const generateRecommendations = () => {
    const newRecommendations: MoonDatingRecommendation[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      const phase = moonPhases[Math.floor(Math.random() * moonPhases.length)];
      
      const recommendation: MoonDatingRecommendation = {
        phase,
        date,
        recommendation: getDatingRecommendation(phase, date),
        activities: getDatingActivities(phase),
        energy: phase.datingEnergy,
        compatibility: getCompatibilityAdvice(phase)
      };
      
      newRecommendations.push(recommendation);
    }

    setRecommendations(newRecommendations);
  };

  const getDatingRecommendation = (phase: MoonPhase, date: Date): string => {
    const dayOfWeek = date.toLocaleDateString('de-DE', { weekday: 'long' });
    
    switch (phase.name) {
      case 'Neumond':
        return `Perfekte Zeit für ein erstes Date! Die Neumond-Energie unterstützt aufrichtige Gespräche und neue Verbindungen.`;
      case 'Zunehmender Mond':
        return `Die wachsende Mondenergie macht ${dayOfWeek} ideal für aktive Dates und gemeinsame Abenteuer.`;
      case 'Vollmond':
        return `Vollmond-Intensität! Perfekt für romantische Momente und tiefe emotionale Verbindungen.`;
      case 'Abnehmender Mond':
        return `Zeit für Reflexion und Vertiefung bestehender Beziehungen. Nutze die Energie für Heilung und Wachstum.`;
      default:
        return `Die Mondenergie unterstützt heute besondere Verbindungen.`;
    }
  };

  const getDatingActivities = (phase: MoonPhase): string[] => {
    switch (phase.name) {
      case 'Neumond':
        return ['Café-Treffen', 'Spaziergang im Park', 'Museum besuchen', 'Kochen zusammen'];
      case 'Zunehmender Mond':
        return ['Wandern', 'Sport treiben', 'Konzert besuchen', 'Gemeinsame Projekte'];
      case 'Vollmond':
        return ['Romantisches Dinner', 'Sternenbeobachtung', 'Tanzkurs', 'Spa-Abend'];
      case 'Abnehmender Mond':
        return ['Meditation zusammen', 'Tagebuch schreiben', 'Alte Fotos anschauen', 'Heilungsrituale'];
      default:
        return ['Spaziergang', 'Café', 'Kino', 'Restaurant'];
    }
  };

  const getCompatibilityAdvice = (phase: MoonPhase): string => {
    switch (phase.name) {
      case 'Neumond':
        return 'Fokussiere dich auf Authentizität und echte Verbindungen.';
      case 'Zunehmender Mond':
        return 'Nutze die aufbauende Energie für gemeinsame Ziele.';
      case 'Vollmond':
        return 'Sei bereit für intensive emotionale Momente.';
      case 'Abnehmender Mond':
        return 'Vertiefe bestehende Verbindungen und lass Altes los.';
      default:
        return 'Folge deiner Intuition bei der Partnerwahl.';
    }
  };

  const handleSaveRecommendation = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const newSaved = [...savedRecommendations, dateString];
    setSavedRecommendations(newSaved);
    localStorage.setItem('saved-moon-dating-recommendations', JSON.stringify(newSaved));
    
    addNotification({
      type: 'success',
      title: '💾 Gespeichert',
      message: 'Deine Mondkalender-Dating-Empfehlung wurde gespeichert!',
    });
  };

  const handleShareRecommendation = (recommendation: MoonDatingRecommendation) => {
    const shareText = `🌙 Mondkalender-Dating-Empfehlung für ${recommendation.date.toLocaleDateString('de-DE')}:\n\n${recommendation.phase.icon} ${recommendation.phase.name}\n\n${recommendation.recommendation}\n\n💡 Aktivitäten: ${recommendation.activities.join(', ')}\n\n#MondkalenderDating #HumanDesign #HDApp`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Mondkalender-Dating-Empfehlung',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      addNotification({
        type: 'success',
        title: '📋 Kopiert',
        message: 'Deine Empfehlung wurde in die Zwischenablage kopiert!',
      });
    }
  };

  if (!currentPhase) return null;

  return (
    <Box>
      {/* Current Moon Phase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            background: `linear-gradient(135deg, ${currentPhase.color}20, ${currentPhase.color}10)`,
            border: `2px solid ${currentPhase.color}40`,
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            mb: 4,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${currentPhase.color}30`,
            },
            transition: 'all 0.3s ease',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h2" sx={{ fontSize: '3rem' }}>
                  {currentPhase.icon}
                </Typography>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                    {currentPhase.name}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {currentPhase.description}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={() => setShowDetails(true)}
                  sx={{
                    borderColor: currentPhase.color,
                    color: currentPhase.color,
                    '&:hover': {
                      backgroundColor: `${currentPhase.color}20`,
                      borderColor: currentPhase.color,
                    },
                  }}
                >
                  Details
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Chip
                icon={getMoonPhaseIcon(currentPhase.name)}
                label={`Energie: ${currentPhase.datingEnergy}`}
                sx={{
                  backgroundColor: `${currentPhase.color}20`,
                  color: currentPhase.color,
                  border: `1px solid ${currentPhase.color}40`,
                }}
              />
              <Chip
                label={`Intensität: ${getIntensityLabel(currentPhase.intensity)}`}
                sx={{
                  backgroundColor: `${getIntensityColor(currentPhase.intensity)}20`,
                  color: getIntensityColor(currentPhase.intensity),
                  border: `1px solid ${getIntensityColor(currentPhase.intensity)}40`,
                }}
              />
            </Box>

            <Typography variant="h6" sx={{ color: currentPhase.color, mb: 2 }}>
              💕 Dating-Empfehlung für heute:
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
              {getDatingRecommendation(currentPhase, new Date())}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {currentPhase.bestFor.slice(0, 3).map((activity, index) => (
                <Chip
                  key={index}
                  label={activity}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'text.primary',
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* 7-Day Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Typography variant="h5" sx={{ color: 'text.primary', mb: 3, fontWeight: 600 }}>
          📅 7-Tage Dating-Vorhersage
        </Typography>
        
        <Grid container spacing={2}>
          {recommendations.map((rec, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${rec.phase.color}15, ${rec.phase.color}05)`,
                    border: `1px solid ${rec.phase.color}30`,
                    borderRadius: 2,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${rec.phase.color}20`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="h4">
                        {rec.phase.icon}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {rec.date.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {rec.phase.name}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.4 }}>
                      {rec.recommendation}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      {rec.activities.slice(0, 2).map((activity, idx) => (
                        <Chip
                          key={idx}
                          label={activity}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: 'text.primary',
                            fontSize: '0.7rem',
                          }}
                        />
                      ))}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        onClick={() => handleSaveRecommendation(rec.date)}
                        sx={{ minWidth: 'auto', p: 1 }}
                      >
                        <Bookmark size={16} />
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleShareRecommendation(rec)}
                        sx={{ minWidth: 'auto', p: 1 }}
                      >
                        <Share2 size={16} />
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Details Dialog */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            {currentPhase.icon} {currentPhase.name}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Detaillierte Dating-Empfehlungen
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: 'success.main' }}>
                ✅ Perfekt für:
              </Typography>
              <List dense>
                {currentPhase.bestFor.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Heart size={16} color="#22c55e" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: 'warning.main' }}>
                ⚠️ Besser vermeiden:
              </Typography>
              <List dense>
                {currentPhase.avoid.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Star size={16} color="#f59e0b" />
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                💡 Dating-Tipps:
              </Typography>
              <List dense>
                {currentPhase.tips.map((tip, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Zap size={16} color="#8B5CF6" />
                    </ListItemIcon>
                    <ListItemText primary={tip} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setShowDetails(false)} variant="contained">
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
