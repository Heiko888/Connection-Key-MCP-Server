"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Typography, Button, CircularProgress, Alert, Snackbar } from '@mui/material';
import { RotateCcw, Heart, Star, MessageCircle, Users } from 'lucide-react';
import ModernSwipeCard from './ModernSwipeCard';

interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  images: string[];
  hdType: string;
  hdProfile: string;
  compatibilityScore: number;
  interests: string[];
  definedCenters: string[];
  definedChannels: string[];
}

interface ModernSwipeContainerProps {
  userId: string;
}

const ModernSwipeContainer: React.FC<ModernSwipeContainerProps> = ({ userId }) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [lastMatch, setLastMatch] = useState<any>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' as 'success' | 'error' });

  // Mock-Daten für Demo (später durch API ersetzen)
  const mockProfiles: Profile[] = [
    {
      id: '1',
      name: 'Sarah',
      age: 28,
      location: 'Berlin',
      bio: 'Generator mit viel Lebensenergie. Liebe es, Menschen zu inspirieren und gemeinsam zu wachsen.',
      images: ['/api/placeholder/400/600', '/api/placeholder/400/600'],
      hdType: 'Generator',
      hdProfile: '5/1',
      compatibilityScore: 87,
      interests: ['Yoga', 'Kochen', 'Reisen', 'Human Design'],
      definedCenters: ['Sacral', 'Solar Plexus', 'Root'],
      definedChannels: ['10-20', '34-57']
    },
    {
      id: '2',
      name: 'Marcus',
      age: 32,
      location: 'München',
      bio: 'Projector, der gerne andere führt und inspiriert. Suche nach echten Verbindungen.',
      images: ['/api/placeholder/400/600'],
      hdType: 'Projector',
      hdProfile: '3/5',
      compatibilityScore: 72,
      interests: ['Führung', 'Coaching', 'Musik', 'Philosophie'],
      definedCenters: ['Spleen', 'Throat'],
      definedChannels: ['20-34']
    },
    {
      id: '3',
      name: 'Lisa',
      age: 25,
      location: 'Hamburg',
      bio: 'Manifesting Generator mit kreativer Energie. Liebe es, neue Projekte zu starten.',
      images: ['/api/placeholder/400/600', '/api/placeholder/400/600', '/api/placeholder/400/600'],
      hdType: 'Manifesting Generator',
      hdProfile: '2/4',
      compatibilityScore: 94,
      interests: ['Kunst', 'Design', 'Startups', 'Meditation'],
      definedCenters: ['Sacral', 'Throat', 'G-Center'],
      definedChannels: ['10-20', '34-57', '20-34']
    }
  ];

  useEffect(() => {
    loadProfiles();
  }, [userId]);

  const loadProfiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Echte API-Aufruf für Profile
      const response = await fetch(`/api/swipe/profiles/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Konvertiere API-Daten zu Profile-Format
        const apiProfiles: Profile[] = data.map((user: any) => ({
          id: user._id,
          name: user.name,
          age: user.age,
          location: user.location || 'Unbekannt',
          bio: user.bio || 'Keine Beschreibung verfügbar',
          images: user.images || ['/api/placeholder/400/600'],
          hdType: user.hdType || 'Unknown',
          hdProfile: user.hdProfile || 'Unknown',
          compatibilityScore: user.compatibilityScore || 50,
          interests: user.interests || [],
          definedCenters: user.definedCenters || [],
          definedChannels: user.definedChannels || []
        }));

        setProfiles(apiProfiles);
        setCurrentIndex(0);
      } else {
        // Fallback zu Mock-Daten
        console.log('API nicht verfügbar, verwende Mock-Daten');
        setProfiles(mockProfiles);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Profile:', err);
      // Fallback zu Mock-Daten
      setProfiles(mockProfiles);
      setCurrentIndex(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    const currentProfile = profiles[currentIndex];
    
    try {
      // API-Aufruf für Swipe
      const response = await fetch('/api/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId,
          targetId: currentProfile.id,
          liked: direction === 'right'
        })
      });

      const result = await response.json();
      
      if (result.match) {
        setLastMatch({
          profile: currentProfile,
          compatibilityScore: result.compatibilityScore
        });
        setShowMatchModal(true);
        setMatches(prev => [...prev, {
          id: Date.now(),
          profile: currentProfile,
          compatibilityScore: result.compatibilityScore,
          createdAt: new Date()
        }]);
      }

      // Nächstes Profil anzeigen
      setCurrentIndex(prev => prev + 1);
      
      // Snackbar anzeigen
      setSnackbar({
        open: true,
        message: result.match ? 'Match gefunden! 🎉' : 
                direction === 'right' ? 'Interesse gespeichert!' : 'Profil übersprungen',
        type: result.match ? 'success' : 'success'
      });

    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Fehler beim Speichern des Swipes',
        type: 'error'
      });
    }
  };

  const handleSuperLike = async () => {
    const currentProfile = profiles[currentIndex];
    
    try {
      // Super Like API-Aufruf
      const response = await fetch('/api/swipe/super-like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId,
          targetId: currentProfile.id
        })
      });

      const result = await response.json();
      
      if (result.match) {
        setLastMatch({
          profile: currentProfile,
          compatibilityScore: result.compatibilityScore,
          isSuperLike: true
        });
        setShowMatchModal(true);
      }

      setCurrentIndex(prev => prev + 1);
      
      setSnackbar({
        open: true,
        message: 'Super Like gesendet! ⭐',
        type: 'success'
      });

    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Fehler beim Super Like',
        type: 'error'
      });
    }
  };

  const handleRefresh = () => {
    loadProfiles();
  };

  const currentProfile = profiles[currentIndex];
  const hasMoreProfiles = currentIndex < profiles.length;

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '60vh',
        gap: 2
      }}>
        <CircularProgress size={60} sx={{ color: '#8B5CF6' }} />
        <Typography variant="h6" sx={{ color: 'white' }}>
          Lade Profile...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '60vh',
        gap: 2
      }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          onClick={handleRefresh}
          variant="contained"
          startIcon={<RotateCcw size={20} />}
          sx={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)'
            }
          }}
        >
          Erneut versuchen
        </Button>
      </Box>
    );
  }

  if (!hasMoreProfiles) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '60vh',
        gap: 3
      }}>
        <Typography variant="h4" sx={{ color: 'white', textAlign: 'center' }}>
          Keine neuen Profile verfügbar
        </Typography>
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center' }}>
          Schau später nochmal vorbei oder erweitere deine Suchkriterien!
        </Typography>
        <Button
          onClick={handleRefresh}
          variant="contained"
          startIcon={<RotateCcw size={20} />}
          sx={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)'
            }
          }}
        >
          Profile aktualisieren
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      minHeight: '80vh',
      py: 4
    }}>
      {/* Header mit Statistiken */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        width: '100%', 
        maxWidth: 400,
        mb: 3
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Users size={20} color="white" />
          <Typography variant="body2" sx={{ color: 'white' }}>
            {matches.length} Matches
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Heart size={20} color="white" />
          <Typography variant="body2" sx={{ color: 'white' }}>
            {profiles.length - currentIndex} verbleibend
          </Typography>
        </Box>
      </Box>

      {/* Swipe-Karten Stack */}
      <Box sx={{ 
        position: 'relative', 
        width: 350, 
        height: 600,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <AnimatePresence>
          {profiles.slice(currentIndex, currentIndex + 3).map((profile, index) => (
            <ModernSwipeCard
              key={profile.id}
              profile={profile}
              onSwipe={handleSwipe}
              onSuperLike={handleSuperLike}
              isTop={index === 0}
            />
          ))}
        </AnimatePresence>
      </Box>

      {/* Match Modal */}
      {showMatchModal && lastMatch && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <Box sx={{
            backgroundColor: 'white',
            borderRadius: 4,
            p: 4,
            textAlign: 'center',
            maxWidth: 400,
            width: '90%'
          }}>
            <Typography variant="h4" sx={{ color: '#8B5CF6', mb: 2 }}>
              🎉 Match gefunden!
            </Typography>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Du und {lastMatch.profile.name} haben euch gematcht!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Kompatibilität: {lastMatch.compatibilityScore}%
            </Typography>
            <Button
              onClick={() => setShowMatchModal(false)}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7C3AED 0%, #DB2777 100%)'
                }
              }}
            >
              Weiter swipen
            </Button>
          </Box>
        </motion.div>
      )}

      {/* Snackbar für Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.type}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModernSwipeContainer;
