"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Sparkles, Heart, Moon, Sun, Zap, RotateCcw, Share2, Bookmark } from 'lucide-react';
import { useNotifications } from './NotificationService';

interface DailyImpulse {
  id: string;
  date: string;
  title: string;
  affirmation: string;
  description: string;
  energy: string;
  color: string;
  icon: string;
  category: 'energy' | 'love' | 'career' | 'spirituality' | 'health' | 'creativity';
  hdType?: string;
  moonPhase?: string;
}

const dailyImpulses: DailyImpulse[] = [
  {
    id: '1',
    date: new Date().toISOString().split('T')[0],
    title: 'Energie des Tages',
    affirmation: 'Ich vertraue meiner inneren Weisheit und folge meiner natürlichen Energie.',
    description: 'Heute ist der perfekte Tag, um auf deine innere Stimme zu hören. Deine Human Design Energie führt dich zu den richtigen Entscheidungen.',
    energy: 'Hoch',
    color: '#8B5CF6',
    icon: '⚡',
    category: 'energy',
    hdType: 'Generator',
    moonPhase: 'Vollmond'
  },
  {
    id: '2',
    date: new Date().toISOString().split('T')[0],
    title: 'Liebe & Verbindung',
    affirmation: 'Ich öffne mein Herz für authentische Verbindungen und echte Liebe.',
    description: 'Die Energie des Tages unterstützt dich dabei, echte Verbindungen zu schaffen. Sei offen für Begegnungen, die deine Seele berühren.',
    energy: 'Mittel',
    color: '#EF4444',
    icon: '💖',
    category: 'love',
    hdType: 'Projector',
    moonPhase: 'Neumond'
  },
  {
    id: '3',
    date: new Date().toISOString().split('T')[0],
    title: 'Kreativität & Manifestation',
    affirmation: 'Ich manifestiere meine Träume durch bewusste Kreativität und klare Absicht.',
    description: 'Deine kreative Energie ist heute besonders stark. Nutze sie, um deine Visionen in die Realität zu bringen.',
    energy: 'Sehr Hoch',
    color: '#F59E0B',
    icon: '🎨',
    category: 'creativity',
    hdType: 'Manifestor',
    moonPhase: 'Zunehmend'
  },
  {
    id: '4',
    date: new Date().toISOString().split('T')[0],
    title: 'Spiritualität & Intuition',
    affirmation: 'Ich verbinde mich mit der universellen Weisheit und vertraue meiner Intuition.',
    description: 'Die spirituelle Energie des Tages lädt dich ein, tiefer in deine innere Weisheit einzutauchen.',
    energy: 'Hoch',
    color: '#06B6D4',
    icon: '🌙',
    category: 'spirituality',
    hdType: 'Reflector',
    moonPhase: 'Abnehmend'
  }
];

const getCategoryIcon = (category: DailyImpulse['category']) => {
  switch (category) {
    case 'energy':
      return <Zap size={20} />;
    case 'love':
      return <Heart size={20} />;
    case 'career':
      return <Star size={20} />;
    case 'spirituality':
      return <Moon size={20} />;
    case 'health':
      return <Sun size={20} />;
    case 'creativity':
      return <Sparkles size={20} />;
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

interface DailyImpulseProps {
  userHdType?: string;
  userMoonPhase?: string;
}

const DailyImpulse: React.FC<DailyImpulseProps> = ({ userHdType, userMoonPhase }) => {
  const [currentImpulse, setCurrentImpulse] = useState<DailyImpulse | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [savedImpulses, setSavedImpulses] = useState<string[]>([]);
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Load saved impulses
    const saved = localStorage.getItem('saved-daily-impulses');
    if (saved) {
      setSavedImpulses(JSON.parse(saved));
    }

    // Get today's impulse
    const today = new Date().toISOString().split('T')[0];
    const todayImpulse = dailyImpulses.find(impulse => impulse.date === today);
    
    if (todayImpulse) {
      setCurrentImpulse(todayImpulse);
    } else {
      // Generate new impulse for today
      const randomImpulse = dailyImpulses[Math.floor(Math.random() * dailyImpulses.length)];
      const newImpulse = {
        ...randomImpulse,
        id: Date.now().toString(),
        date: today,
        hdType: userHdType || randomImpulse.hdType,
        moonPhase: userMoonPhase || randomImpulse.moonPhase
      };
      setCurrentImpulse(newImpulse);
    }
  }, [userHdType, userMoonPhase]);

  const handleRefresh = () => {
    const randomImpulse = dailyImpulses[Math.floor(Math.random() * dailyImpulses.length)];
    const newImpulse = {
      ...randomImpulse,
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      hdType: userHdType || randomImpulse.hdType,
      moonPhase: userMoonPhase || randomImpulse.moonPhase
    };
    setCurrentImpulse(newImpulse);
    
    addNotification({
      type: 'daily',
      title: '✨ Neuer Impuls',
      message: 'Dein täglicher Human Design Impuls wurde aktualisiert!',
    });
  };

  const handleSave = () => {
    if (!currentImpulse) return;
    
    const newSaved = [...savedImpulses, currentImpulse.id];
    setSavedImpulses(newSaved);
    localStorage.setItem('saved-daily-impulses', JSON.stringify(newSaved));
    
    addNotification({
      type: 'success',
      title: '💾 Gespeichert',
      message: 'Dein täglicher Impuls wurde zu deinen Favoriten hinzugefügt!',
    });
  };

  const handleShare = () => {
    if (!currentImpulse) return;
    
    const shareText = `🌟 Mein täglicher Human Design Impuls:\n\n"${currentImpulse.affirmation}"\n\n${currentImpulse.description}\n\n#HumanDesign #TäglicherImpuls #HDApp`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Mein täglicher Human Design Impuls',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      addNotification({
        type: 'success',
        title: '📋 Kopiert',
        message: 'Dein Impuls wurde in die Zwischenablage kopiert!',
      });
    }
  };

  if (!currentImpulse) return null;

  const isSaved = savedImpulses.includes(currentImpulse.id);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            background: `linear-gradient(135deg, ${currentImpulse.color}20, ${currentImpulse.color}10)`,
            border: `2px solid ${currentImpulse.color}40`,
            borderRadius: 3,
            overflow: 'hidden',
            position: 'relative',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 8px 25px ${currentImpulse.color}30`,
            },
            transition: 'all 0.3s ease',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h4" sx={{ fontSize: '2rem' }}>
                  {currentImpulse.icon}
                </Typography>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {currentImpulse.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
                  sx={{ color: 'text.secondary' }}
                >
                  <RotateCcw size={16} />
                </IconButton>
                <IconButton
                  onClick={handleSave}
                  size="small"
                  sx={{ color: isSaved ? 'primary.main' : 'text.secondary' }}
                >
                  <Bookmark size={16} />
                </IconButton>
                <IconButton
                  onClick={handleShare}
                  size="small"
                  sx={{ color: 'text.secondary' }}
                >
                  <Share2 size={16} />
                </IconButton>
              </Box>
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                color: currentImpulse.color,
                mb: 2,
                fontStyle: 'italic',
                textAlign: 'center',
                px: 2,
                py: 1,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                border: `1px solid ${currentImpulse.color}30`,
              }}
            >
              "{currentImpulse.affirmation}"
            </Typography>

            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
              {currentImpulse.description}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={getCategoryIcon(currentImpulse.category)}
                label={currentImpulse.category}
                size="small"
                sx={{
                  backgroundColor: `${currentImpulse.color}20`,
                  color: currentImpulse.color,
                  border: `1px solid ${currentImpulse.color}40`,
                }}
              />
              <Chip
                label={`Energie: ${currentImpulse.energy}`}
                size="small"
                sx={{
                  backgroundColor: `${getEnergyColor(currentImpulse.energy)}20`,
                  color: getEnergyColor(currentImpulse.energy),
                  border: `1px solid ${getEnergyColor(currentImpulse.energy)}40`,
                }}
              />
              {currentImpulse.hdType && (
                <Chip
                  label={currentImpulse.hdType}
                  size="small"
                  sx={{
                    backgroundColor: 'primary.20',
                    color: 'primary.main',
                    border: '1px solid primary.40',
                  }}
                />
              )}
              {currentImpulse.moonPhase && (
                <Chip
                  label={currentImpulse.moonPhase}
                  size="small"
                  sx={{
                    backgroundColor: 'secondary.20',
                    color: 'secondary.main',
                    border: '1px solid secondary.40',
                  }}
                />
              )}
            </Box>

            <Button
              variant="outlined"
              onClick={() => setShowDetails(true)}
              sx={{
                borderColor: currentImpulse.color,
                color: currentImpulse.color,
                '&:hover': {
                  backgroundColor: `${currentImpulse.color}20`,
                  borderColor: currentImpulse.color,
                },
              }}
            >
              Mehr Details
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            {currentImpulse.icon} {currentImpulse.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {new Date().toLocaleDateString('de-DE', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: currentImpulse.color,
              mb: 3,
              fontStyle: 'italic',
              textAlign: 'center',
              px: 2,
              py: 2,
              backgroundColor: 'rgba(0,0,0,0.05)',
              borderRadius: 2,
            }}
          >
            "{currentImpulse.affirmation}"
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
            {currentImpulse.description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
            <Chip
              icon={getCategoryIcon(currentImpulse.category)}
              label={currentImpulse.category}
              sx={{
                backgroundColor: `${currentImpulse.color}20`,
                color: currentImpulse.color,
                border: `1px solid ${currentImpulse.color}40`,
              }}
            />
            <Chip
              label={`Energie: ${currentImpulse.energy}`}
              sx={{
                backgroundColor: `${getEnergyColor(currentImpulse.energy)}20`,
                color: getEnergyColor(currentImpulse.energy),
                border: `1px solid ${getEnergyColor(currentImpulse.energy)}40`,
              }}
            />
            {currentImpulse.hdType && (
              <Chip
                label={currentImpulse.hdType}
                sx={{
                  backgroundColor: 'primary.20',
                  color: 'primary.main',
                  border: '1px solid primary.40',
                }}
              />
            )}
            {currentImpulse.moonPhase && (
              <Chip
                label={currentImpulse.moonPhase}
                sx={{
                  backgroundColor: 'secondary.20',
                  color: 'secondary.main',
                  border: '1px solid secondary.40',
                }}
              />
            )}
          </Box>

          <Box sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1, color: currentImpulse.color }}>
              💡 Tipp für heute:
            </Typography>
            <Typography variant="body2">
              Nutze diese Energie, um bewusst Entscheidungen zu treffen, die mit deinem Human Design übereinstimmen. 
              Vertraue auf deine innere Weisheit und lasse dich von deiner natürlichen Energie leiten.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleShare} startIcon={<Share2 size={16} />}>
            Teilen
          </Button>
          <Button onClick={handleSave} startIcon={<Bookmark size={16} />}>
            {isSaved ? 'Gespeichert' : 'Speichern'}
          </Button>
          <Button onClick={() => setShowDetails(false)} variant="contained">
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DailyImpulse;
