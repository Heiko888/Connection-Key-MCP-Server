"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Grid, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Users, MapPin, Clock, Star, Zap, Eye, Moon, Flame, RotateCcw, Share2, Bookmark, Calendar, Target, MessageCircle } from 'lucide-react';
import { useNotifications } from './NotificationService';

interface DatingImpulse {
  id: string;
  date: string;
  title: string;
  energy: string;
  description: string;
  color: string;
  icon: string;
  category: 'energy' | 'location' | 'activity' | 'communication' | 'timing';
  hdType?: string;
  moonPhase?: string;
  tips: string[];
  bestTimes: string[];
  locations: string[];
  activities: string[];
  communication: string;
  compatibility: string;
}

const datingImpulses: DatingImpulse[] = [
  {
    id: '1',
    date: new Date().toISOString().split('T')[0],
    title: 'Energie des Tages',
    energy: 'Hoch',
    description: 'Deine Energie ist heute besonders stark für neue Begegnungen. Nutze die Kraft für authentische Verbindungen.',
    color: '#8B5CF6',
    icon: '⚡',
    category: 'energy',
    hdType: 'Generator',
    moonPhase: 'Vollmond',
    tips: [
      'Sei offen für spontane Begegnungen',
      'Nutze deine natürliche Anziehungskraft',
      'Vertraue auf deine innere Weisheit',
      'Lass die Energie natürlich fließen'
    ],
    bestTimes: ['9:00-11:00', '15:00-17:00', '19:00-21:00'],
    locations: ['Café', 'Park', 'Buchhandlung', 'Kunstgalerie'],
    activities: ['Spaziergang', 'Kaffee trinken', 'Lesen', 'Kunst anschauen'],
    communication: 'Sei authentisch und ehrlich in deinen Gesprächen.',
    compatibility: 'Besonders kompatibel mit Projectors und anderen Generators.'
  },
  {
    id: '2',
    date: new Date().toISOString().split('T')[0],
    title: 'Liebe & Verbindung',
    energy: 'Mittel',
    description: 'Die Energie des Tages unterstützt tiefe emotionale Verbindungen. Perfekt für bedeutungsvolle Gespräche.',
    color: '#EF4444',
    icon: '💖',
    category: 'communication',
    hdType: 'Projector',
    moonPhase: 'Neumond',
    tips: [
      'Fokussiere dich auf tiefe Gespräche',
      'Höre aktiv zu und zeige Interesse',
      'Teile deine Gedanken und Gefühle',
      'Baue Vertrauen durch Offenheit auf'
    ],
    bestTimes: ['10:00-12:00', '16:00-18:00', '20:00-22:00'],
    locations: ['Restaurant', 'Bibliothek', 'Garten', 'Kunstmuseum'],
    activities: ['Essen gehen', 'Lesen', 'Gartenarbeit', 'Museum besuchen'],
    communication: 'Nutze deine natürliche Fähigkeit, andere zu verstehen.',
    compatibility: 'Harmonische Verbindungen mit Generators und Manifestors.'
  },
  {
    id: '3',
    date: new Date().toISOString().split('T')[0],
    title: 'Aktivität & Abenteuer',
    energy: 'Sehr Hoch',
    description: 'Deine Energie ist perfekt für aktive Dates und gemeinsame Abenteuer. Nutze die Dynamik!',
    color: '#F59E0B',
    icon: '🎯',
    category: 'activity',
    hdType: 'Manifestor',
    moonPhase: 'Zunehmend',
    tips: [
      'Plane aktive und abenteuerliche Dates',
      'Initiative ergreifen und führen',
      'Gemeinsame Ziele verfolgen',
      'Energie in produktive Aktivitäten lenken'
    ],
    bestTimes: ['8:00-10:00', '14:00-16:00', '18:00-20:00'],
    locations: ['Sportplatz', 'Wanderweg', 'Kletterhalle', 'Strand'],
    activities: ['Sport treiben', 'Wandern', 'Klettern', 'Beach-Volleyball'],
    communication: 'Sei direkt und ehrlich in deiner Kommunikation.',
    compatibility: 'Starke Verbindungen mit Generators und anderen Manifestors.'
  },
  {
    id: '4',
    date: new Date().toISOString().split('T')[0],
    title: 'Intuition & Weisheit',
    energy: 'Hoch',
    description: 'Deine intuitive Energie ist heute besonders stark. Vertraue auf deine innere Weisheit bei Begegnungen.',
    color: '#06B6D4',
    icon: '🌙',
    category: 'communication',
    hdType: 'Reflector',
    moonPhase: 'Abnehmend',
    tips: [
      'Vertraue auf deine Intuition',
      'Beobachte und reflektiere',
      'Lass die Verbindung natürlich entstehen',
      'Nutze deine einzigartige Perspektive'
    ],
    bestTimes: ['11:00-13:00', '17:00-19:00', '21:00-23:00'],
    locations: ['Meditationszentrum', 'Natur', 'Kunstgalerie', 'Bibliothek'],
    activities: ['Meditation', 'Naturspaziergang', 'Kunst anschauen', 'Lesen'],
    communication: 'Nutze deine Fähigkeit, die Energie anderer zu spüren.',
    compatibility: 'Besondere Verbindungen mit allen Human Design Typen.'
  }
];

const getCategoryIcon = (category: DatingImpulse['category']) => {
  switch (category) {
    case 'energy':
      return <Zap size={20} />;
    case 'location':
      return <MapPin size={20} />;
    case 'activity':
      return <Target size={20} />;
    case 'communication':
      return <MessageCircle size={20} />;
    case 'timing':
      return <Clock size={20} />;
    default:
      return <Star size={20} />;
  }
};

const getEnergyColor = (energy: string) => {
  switch (energy) {
    case 'Sehr Hoch':
      return '#22c55e';
    case 'Hoch':
      return '#84cc16';
    case 'Mittel':
      return '#f59e0b';
    case 'Niedrig':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

const getHdTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'generator':
      return <Zap size={16} />;
    case 'projector':
      return <Eye size={16} />;
    case 'manifestor':
      return <Flame size={16} />;
    case 'reflector':
      return <Moon size={16} />;
    default:
      return <Users size={16} />;
  }
};

const getHdTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'generator':
      return '#10B981';
    case 'projector':
      return '#8B5CF6';
    case 'manifestor':
      return '#F59E0B';
    case 'reflector':
      return '#06B6D4';
    default:
      return '#6B7280';
  }
};

export default function DatingImpulse() {
  const [currentImpulse, setCurrentImpulse] = useState<DatingImpulse | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [savedImpulses, setSavedImpulses] = useState<string[]>([]);
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Load saved impulses
    const saved = localStorage.getItem('saved-dating-impulses');
    if (saved) {
      setSavedImpulses(JSON.parse(saved));
    }

    // Get today's impulse
    const today = new Date().toISOString().split('T')[0];
    const todayImpulse = datingImpulses.find(impulse => impulse.date === today);
    
    if (todayImpulse) {
      setCurrentImpulse(todayImpulse);
    } else {
      // Generate new impulse for today
      const randomImpulse = datingImpulses[Math.floor(Math.random() * datingImpulses.length)];
      const newImpulse = {
        ...randomImpulse,
        id: Date.now().toString(),
        date: today,
        hdType: randomImpulse.hdType,
        moonPhase: randomImpulse.moonPhase
      };
      setCurrentImpulse(newImpulse);
    }
  }, []);

  const handleRefresh = () => {
    const randomImpulse = datingImpulses[Math.floor(Math.random() * datingImpulses.length)];
    const newImpulse = {
      ...randomImpulse,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      hdType: randomImpulse.hdType,
      moonPhase: randomImpulse.moonPhase
    };
    setCurrentImpulse(newImpulse);
    
    addNotification({
      type: 'daily',
      title: '✨ Neuer Dating-Impuls',
      message: 'Dein täglicher Dating-Impuls wurde aktualisiert!',
    });
  };

  const handleSave = () => {
    if (!currentImpulse) return;
    
    const newSaved = [...savedImpulses, currentImpulse.id];
    setSavedImpulses(newSaved);
    localStorage.setItem('saved-dating-impulses', JSON.stringify(newSaved));
    
    addNotification({
      type: 'success',
      title: '💾 Gespeichert',
      message: 'Dein Dating-Impuls wurde zu deinen Favoriten hinzugefügt!',
    });
  };

  const handleShare = () => {
    if (!currentImpulse) return;
    
    const shareText = `💕 Mein täglicher Dating-Impuls:\n\n${currentImpulse.icon} ${currentImpulse.title}\n\n${currentImpulse.description}\n\n💡 Tipps: ${currentImpulse.tips.slice(0, 2).join(', ')}\n\n⏰ Beste Zeiten: ${currentImpulse.bestTimes.join(', ')}\n\n#DatingImpuls #HumanDesign #HDApp`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Mein täglicher Dating-Impuls',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      addNotification({
        type: 'success',
        title: '📋 Kopiert',
        message: 'Dein Dating-Impuls wurde in die Zwischenablage kopiert!',
      });
    }
  };

  if (!currentImpulse) return null;

  const isSaved = savedImpulses.includes(currentImpulse.id);

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.15)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(242, 159, 5, 0.25)',
              borderColor: 'rgba(242, 159, 5, 0.5)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h2" sx={{ fontSize: '3rem' }}>
                  {currentImpulse.icon}
                </Typography>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                    {currentImpulse.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {new Date().toLocaleDateString('de-DE', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={handleRefresh}
                  size="small"
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      backgroundColor: 'rgba(242, 159, 5, 0.1)',
                      color: '#F29F05',
                    }
                  }}
                >
                  <RotateCcw size={16} />
                </IconButton>
                <IconButton
                  onClick={handleSave}
                  size="small"
                  sx={{ 
                    color: isSaved ? '#F29F05' : 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      backgroundColor: 'rgba(242, 159, 5, 0.1)',
                      color: '#F29F05',
                    }
                  }}
                >
                  <Bookmark size={16} />
                </IconButton>
                <IconButton
                  onClick={handleShare}
                  size="small"
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      backgroundColor: 'rgba(242, 159, 5, 0.1)',
                      color: '#F29F05',
                    }
                  }}
                >
                  <Share2 size={16} />
                </IconButton>
              </Box>
            </Box>

            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
              {currentImpulse.description}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              <Chip
                icon={getCategoryIcon(currentImpulse.category)}
                label={currentImpulse.category}
                size="small"
                sx={{
                  backgroundColor: 'rgba(242, 159, 5, 0.15)',
                  color: '#F29F05',
                  border: '1px solid rgba(242, 159, 5, 0.3)',
                  fontWeight: 500,
                }}
              />
              <Chip
                label={`Energie: ${currentImpulse.energy}`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(242, 159, 5, 0.15)',
                  color: '#F29F05',
                  border: '1px solid rgba(242, 159, 5, 0.3)',
                  fontWeight: 500,
                }}
              />
              {currentImpulse.hdType && (
                <Chip
                  icon={getHdTypeIcon(currentImpulse.hdType)}
                  label={currentImpulse.hdType}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(242, 159, 5, 0.15)',
                    color: '#F29F05',
                    border: '1px solid rgba(242, 159, 5, 0.3)',
                    fontWeight: 500,
                  }}
                />
              )}
              {currentImpulse.moonPhase && (
                <Chip
                  label={currentImpulse.moonPhase}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(242, 159, 5, 0.15)',
                    color: '#F29F05',
                    border: '1px solid rgba(242, 159, 5, 0.3)',
                    fontWeight: 500,
                  }}
                />
              )}
            </Box>

            <Button
              variant="outlined"
              onClick={() => setShowDetails(true)}
              sx={{
                borderColor: '#F29F05',
                color: '#F29F05',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: 'rgba(242, 159, 5, 0.15)',
                  borderColor: '#F29F05',
                  boxShadow: '0 4px 12px rgba(242, 159, 5, 0.3)',
                },
              }}
            >
              Alle Details anzeigen
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Details Dialog */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.3)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h4" sx={{ mb: 1, color: '#ffffff', fontWeight: 700 }}>
            {currentImpulse.icon} {currentImpulse.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {new Date().toLocaleDateString('de-DE', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6, textAlign: 'center' }}>
            {currentImpulse.description}
          </Typography>

          <Grid container spacing={3}>
            {/* Best Times */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: '#F29F05', fontWeight: 600 }}>
                ⏰ Beste Zeiten:
              </Typography>
              <List dense>
                {currentImpulse.bestTimes.map((time, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Clock size={16} style={{ color: '#F29F05' }} />
                    </ListItemIcon>
                    <ListItemText primary={time} primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.9)' } }} />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Locations */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: '#F29F05', fontWeight: 600 }}>
                📍 Empfohlene Orte:
              </Typography>
              <List dense>
                {currentImpulse.locations.map((location, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <MapPin size={16} style={{ color: '#F29F05' }} />
                    </ListItemIcon>
                    <ListItemText primary={location} primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.9)' } }} />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Activities */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: '#F29F05', fontWeight: 600 }}>
                🎯 Aktivitäten:
              </Typography>
              <List dense>
                {currentImpulse.activities.map((activity, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Target size={16} style={{ color: '#F29F05' }} />
                    </ListItemIcon>
                    <ListItemText primary={activity} primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.9)' } }} />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Communication */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: '#F29F05', fontWeight: 600 }}>
                💬 Kommunikation:
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
                {currentImpulse.communication}
              </Typography>
            </Grid>

            {/* Tips */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2, borderColor: 'rgba(242, 159, 5, 0.2)' }} />
              <Typography variant="h6" sx={{ mb: 2, color: '#F29F05', fontWeight: 600 }}>
                💡 Dating-Tipps:
              </Typography>
              <List dense>
                {currentImpulse.tips.map((tip, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Star size={16} style={{ color: '#F29F05' }} />
                    </ListItemIcon>
                    <ListItemText primary={tip} primaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.9)' } }} />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Compatibility */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2, borderColor: 'rgba(242, 159, 5, 0.2)' }} />
              <Typography variant="h6" sx={{ mb: 2, color: '#F29F05', fontWeight: 600 }}>
                💕 Kompatibilität:
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.6 }}>
                {currentImpulse.compatibility}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleShare} 
            startIcon={<Share2 size={16} />}
            sx={{
              color: '#F29F05',
              borderColor: 'rgba(242, 159, 5, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(242, 159, 5, 0.1)',
                borderColor: '#F29F05',
              }
            }}
            variant="outlined"
          >
            Teilen
          </Button>
          <Button 
            onClick={handleSave} 
            startIcon={<Bookmark size={16} />}
            sx={{
              color: isSaved ? '#F29F05' : 'rgba(255, 255, 255, 0.7)',
              borderColor: isSaved ? '#F29F05' : 'rgba(242, 159, 5, 0.3)',
              '&:hover': {
                backgroundColor: 'rgba(242, 159, 5, 0.1)',
                borderColor: '#F29F05',
              }
            }}
            variant="outlined"
          >
            {isSaved ? 'Gespeichert' : 'Speichern'}
          </Button>
          <Button 
            onClick={() => setShowDetails(false)} 
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              color: '#ffffff',
              '&:hover': {
                background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                boxShadow: '0 4px 12px rgba(242, 159, 5, 0.4)',
              },
            }}
          >
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
