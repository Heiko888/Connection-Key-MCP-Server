"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid,
  Chip,
  Avatar,
  IconButton,
  Paper,
  Stack,
  CircularProgress
} from '@mui/material';
import {
  Heart, 
  X, 
  MessageCircle, 
  Star,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Target,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '../components/Logo';
import { ArrowLeft, Users, GitCompare } from 'lucide-react';
import ProfileComparison from '../../components/ProfileComparison';
import DashboardBurgerMenu from '../components/DashboardBurgerMenu';
import PageLayout from '../components/PageLayout';

interface Profile {
  _id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  hd_type: string;
  profile: string;
  authority: string;
  strategy: string;
  image: string;
  interests: string[];
  compatibility_score: number;
  // Erweiterte Informationen
  occupation?: string;
  education?: string;
  lifestyle?: string;
  values?: string[];
  goals?: string;
  personality_traits?: string[];
  relationship_style?: string;
  deal_breakers?: string[];
  favorite_activities?: string[];
  music_taste?: string[];
  travel_preferences?: string;
}

interface Match {
  _id: string;
  userA: { _id: string; name: string; image: string };
  userB: { _id: string; name: string; image: string };
  createdAt: string;
}

export default function SwipePage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [matches, setMatches] = useState<Match[]>([]);
  const [showMatchAnim, setShowMatchAnim] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [revealedProfiles, setRevealedProfiles] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'swipe' | 'compare'>('compare');
  const [ownChartData, setOwnChartData] = useState<any>(null);
  
  // States für Chart-Laden
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [chartLoadAttempts, setChartLoadAttempts] = useState(0);
  const MAX_CHART_LOAD_ATTEMPTS = 2; // Maximal 2 Versuche
  
  // Retry-Mechanismus für Mobile: Lade Daten erneut, falls sie beim ersten Mal fehlen
  const [hasRetried, setHasRetried] = useState(false);

  // Mock-Daten für Demo
  const mockProfiles: Profile[] = [
    {
      _id: '1',
      name: 'Luna',
      age: 28,
      location: 'Berlin',
      bio: 'Generator mit emotionaler Autorität. Liebe es, authentische Verbindungen zu schaffen. Ich bin eine leidenschaftliche Yogalehrerin und verbringe meine Zeit gerne in der Natur. Meine Freunde beschreiben mich als einfühlsam und spirituell.',
      hd_type: 'Generator',
      profile: '2/4',
      authority: 'Emotional',
      strategy: 'Wait to Respond',
      image: '/api/placeholder/300/400',
      interests: ['Yoga', 'Astrologie', 'Natur', 'Meditation', 'Kochen', 'Reisen'],
      compatibility_score: 85,
      // Erweiterte Informationen
      occupation: 'Yogalehrerin & Astrologin',
      education: 'Studium der Psychologie',
      lifestyle: 'Vegetarisch, meditiert täglich',
      values: ['Authentizität', 'Spiritualität', 'Nachhaltigkeit'],
      goals: 'Tiefe spirituelle Verbindungen finden',
      personality_traits: ['Einfühlsam', 'Intuitiv', 'Kreativ', 'Geduldig'],
      relationship_style: 'Sucht nach tiefer emotionaler Verbindung',
      deal_breakers: ['Oberflächlichkeit', 'Mangel an Spiritualität'],
      favorite_activities: ['Sonnenaufgang-Yoga', 'Astrologie-Studium', 'Waldspaziergänge'],
      music_taste: ['Ambient', 'Meditation', 'Indie Folk'],
      travel_preferences: 'Spirituelle Retreats, Natur-Reisen'
    },
    {
      _id: '2',
      name: 'Phoenix',
      age: 32,
      location: 'München',
      bio: 'Projector mit splenischer Autorität. Hier um zu führen und zu inspirieren.',
      hd_type: 'Projector',
      profile: '3/5',
      authority: 'Splenic',
      strategy: 'Wait for the Invitation',
      image: '/api/placeholder/300/400',
      interests: ['Coaching', 'Spiritualität', 'Reisen'],
      compatibility_score: 92
    },
    {
      _id: '3',
      name: 'Sage',
      age: 26,
      location: 'Hamburg',
      bio: 'Manifestor mit emotionaler Autorität. Erschaffe gerne neue Wege.',
      hd_type: 'Manifestor',
      profile: '1/3',
      authority: 'Emotional',
      strategy: 'Inform Before Acting',
      image: '/api/placeholder/300/400',
      interests: ['Kunst', 'Musik', 'Innovation'],
      compatibility_score: 78
    }
  ];

  useEffect(() => {
    loadProfiles();
    loadOwnChart();
  }, []);

  useEffect(() => {
    // Verhindere Retry, wenn bereits retried wurde oder Daten bereits vorhanden sind
    if (hasRetried || (ownChartData && profiles.length > 0)) {
      return;
    }
    
    // Nur retry, wenn wir im Compare-Modus sind und wirklich Daten fehlen
    if (viewMode === 'compare') {
      const needsRetry = (!ownChartData && chartLoadAttempts < MAX_CHART_LOAD_ATTEMPTS) || 
                         (profiles.length === 0 && !isLoading);
      
      if (needsRetry) {
        const retryTimer = setTimeout(() => {
          console.log('🔄 Retry: Lade Daten erneut...');
          setHasRetried(true); // Markiere als retried
          
          if (!ownChartData && chartLoadAttempts < MAX_CHART_LOAD_ATTEMPTS) {
            loadOwnChart();
          }
          if (profiles.length === 0 && !isLoading) {
            loadProfiles();
          }
        }, 3000); // Erhöhe auf 3 Sekunden, um Endlosschleife zu vermeiden
        
        return () => clearTimeout(retryTimer);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, hasRetried, ownChartData, profiles.length, isLoading, chartLoadAttempts]);
  
  const loadOwnChart = async () => {
    // Verhindere mehrfaches Laden
    if (isLoadingChart || ownChartData) {
      return;
    }
    
    // Verhindere zu viele Versuche
    if (chartLoadAttempts >= MAX_CHART_LOAD_ATTEMPTS) {
      console.warn('⚠️ Maximale Anzahl von Chart-Ladeversuchen erreicht');
      return;
    }
    
    try {
      setIsLoadingChart(true);
      setChartLoadAttempts(prev => prev + 1);
      
      // Warte kurz, um sicherzustellen, dass window verfügbar ist (besonders auf Mobile)
      if (typeof window === 'undefined') {
        console.warn('Window nicht verfügbar, überspringe Chart-Laden');
        setIsLoadingChart(false);
        return;
      }

      // Lade eigenes Chart aus localStorage
      const userChart = localStorage.getItem('userChart');
      console.log('🔍 Lade userChart aus localStorage:', userChart ? 'gefunden' : 'nicht gefunden');
      
      if (userChart) {
        const { safeJsonParse } = await import('@/lib/utils/safeJson');
        const chart = safeJsonParse<any>(userChart, null);
        if (chart) {
          console.log('✅ userChart geladen:', chart);
          setOwnChartData(chart);
          return;
        }
      }
      
      // Versuche aus userData zu laden
      const userData = localStorage.getItem('userData');
      console.log('🔍 Lade userData aus localStorage:', userData ? 'gefunden' : 'nicht gefunden');
      
      if (userData) {
        const { safeJsonParse } = await import('@/lib/utils/safeJson');
        const user = safeJsonParse<any>(userData, null);
        if (user) {
          console.log('📋 userData geladen:', { 
            hasBirthDate: !!user.birthDate, 
            hasBirthTime: !!user.birthTime, 
            hasBirthPlace: !!user.birthPlace 
          });
          
          if (user.birthDate && user.birthTime && user.birthPlace) {
            console.log('🔄 Berechne Chart über API...');
            // Berechne Chart über API
            const response = await fetch('/api/charts/calculate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                birthDate: user.birthDate,
                birthTime: user.birthTime,
                birthPlace: typeof user.birthPlace === 'string' ? {
                  latitude: 52.52,
                  longitude: 13.405,
                  timezone: 'Europe/Berlin',
                  name: user.birthPlace
                } : user.birthPlace
              })
            });
            
            if (response.ok) {
              const result = await response.json();
              console.log('✅ Chart von API geladen:', result);
              const chartData = result.chart || result;
              setOwnChartData(chartData);
              // Speichere auch im localStorage für zukünftige Verwendung
              if (typeof window !== 'undefined') {
                localStorage.setItem('userChart', JSON.stringify(chartData));
              }
            } else {
              console.error('❌ API-Fehler beim Laden des Charts:', response.status, response.statusText);
            }
          } else {
            console.warn('⚠️ userData hat nicht alle erforderlichen Felder');
          }
        }
      } else {
        console.warn('⚠️ Keine userChart oder userData im localStorage gefunden');
      }
    } catch (error) {
            console.error('❌ Fehler beim Laden des eigenen Charts:', error);
    } finally {
      setIsLoadingChart(false);
    }
  };

  const loadProfiles = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Lade Profile von API...');
      
      const response = await fetch('/api/users/discover', {
        credentials: 'include', // Wichtig für Cookies/Session
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();

      console.log('📡 API Response:', { 
        ok: response.ok, 
        status: response.status, 
        statusText: response.statusText,
        hasUsers: Array.isArray(data?.users), 
        userCount: data?.users?.length || 0,
        success: data?.success,
        message: data?.message,
        debug: data?.debug,
        error: data?.error
      });

      // Prüfe auf Authentifizierungsfehler
      if (response.status === 401) {
        console.error('❌ Nicht authentifiziert! Bitte einloggen.');
        console.error('Debug Info:', data?.debug);
        // Fallback zu Mock-Daten
        setProfiles(mockProfiles);
        return;
      }

      // Prüfe auf Server-Fehler
      if (response.status >= 500) {
        console.error('❌ Server-Fehler:', data?.error);
        console.error('Debug Info:', data?.debug);
        // Fallback zu Mock-Daten
        setProfiles(mockProfiles);
        return;
      }

      const hasUsers = Array.isArray(data?.users) && data.users.length > 0;

      if (response.ok && data?.success && hasUsers) {
        // Konvertiere API-Daten zu Profile-Format
        const formattedProfiles = data.users.map((user: any) => ({
          _id: user.id || user.user_id,
          name: user.name,
          age: user.age || 28,
          location: user.location || 'Unbekannt',
          bio: user.bio || 'Noch keine Bio vorhanden.',
          hd_type: user.hd_type || 'Generator',
          profile: user.profile || '2/4',
          authority: user.authority || 'Emotional',
          strategy: user.strategy || 'Wait to Respond',
          image: user.image || '/dating/default.jpg',
          interests: user.interests || [],
          compatibility_score: user.compatibility_score || 75
        }));

        console.log(`✅ Geladene Nutzer für Swipe: ${formattedProfiles.length}`);
        setProfiles(formattedProfiles);
      } else {
        // Fallback zu Mock-Daten bei 0 Nutzern
        console.warn('⚠️ Keine oder 0 User von der API – verwende Mock-Daten');
        console.warn('API Message:', data?.message);
        console.warn('Debug Info:', data?.debug);
        console.log(`📦 Verwende ${mockProfiles.length} Mock-Profile`);
        setProfiles(mockProfiles);
      }
    } catch (error: any) {
      console.error('❌ Fehler beim Laden der Profile:', error);
      console.error('Error Details:', {
        message: error.message,
        stack: error.stack
      });
      // Fallback zu Mock-Daten bei Fehler
      console.log(`📦 Verwende ${mockProfiles.length} Mock-Profile als Fallback`);
      setProfiles(mockProfiles);
    } finally {
      setIsLoading(false);
    }
  };

  const revealProfile = () => {
    if (currentProfile) {
      setRevealedProfiles(prev => new Set([...prev, currentProfile._id]));
    }
  };

  const handleSwipe = async (liked: boolean) => {
    if (currentIndex >= profiles.length) return;

    const currentProfile = profiles[currentIndex];
    setSwipeDirection(liked ? 'right' : 'left');

    try {
      // Call echte API
      const response = await fetch('/api/users/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: currentProfile._id,
          targetFriendId: currentProfile._id,
          action: liked ? 'like' : 'pass'
        })
      });

      const data = await response.json();

      if (data.success && data.isMatch) {
        // Es ist ein Match!
        setShowMatchAnim(true);
        setTimeout(() => setShowMatchAnim(false), 3000);
        
        const newMatch = {
          _id: data.friendship?.id || Date.now().toString(),
          userA: { _id: 'current-user-id', name: 'Du', image: '/api/placeholder/100/100' },
          userB: { _id: currentProfile._id, name: currentProfile.name, image: currentProfile.image },
          createdAt: new Date().toISOString()
        };
        setMatches(prev => [...prev, newMatch]);
      }

      // Gehe zum nächsten Profil
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setSwipeDirection(null);
      }, 500);

    } catch (error) {
      console.error('Error processing swipe:', error);
      // Bei Fehler trotzdem weitergehen
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setSwipeDirection(null);
      }, 500);
    }
  };

  const currentProfile = profiles[currentIndex];

  if (isLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        width: '100%',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        backgroundAttachment: 'fixed',
        position: 'relative',
        overflow: 'hidden',
        overflowX: 'hidden',
        pt: 4,
        pb: 8,
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
            radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
            radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
            linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
          `,
          backgroundAttachment: 'fixed',
          backgroundSize: '100% 100%',
          zIndex: -1,
        }
      }}>
        <PageLayout activePage={undefined} showLogo={false} maxWidth="lg">
          <Box display="flex" flexDirection="column" alignItems="center" py={8}>
            <CircularProgress size={60} sx={{ color: '#F29F05', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Lade passende Profile...
            </Typography>
          </Box>
        </PageLayout>
      </Box>
    );
  }

  if (currentIndex >= profiles.length) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        width: '100%',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        backgroundAttachment: 'fixed',
        position: 'relative',
        overflow: 'hidden',
        overflowX: 'hidden',
        pt: 4,
        pb: 8,
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
            radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
            radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
            linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
          `,
          backgroundAttachment: 'fixed',
          backgroundSize: '100% 100%',
          zIndex: -1,
        }
      }}>
        <PageLayout activePage={undefined} showLogo={false} maxWidth="lg">
          <Box textAlign="center" py={8}>
            <Typography variant="h5" gutterBottom sx={{ 
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              mb: 3 
            }}>
              ✨ Alle Resonanzen entdeckt!
            </Typography>
            <Typography variant="body1" component="div" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
              Schau später wieder vorbei für neue kosmische Verbindungen.
            </Typography>
          <Button
            variant="contained"
              size="large"
              onClick={() => setCurrentIndex(0)}
            sx={{
                mt: 2,
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 15px rgba(242, 159, 5, 0.35)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Neu starten
            </Button>
            <Box sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowLeft size={20} />}
                onClick={() => router.push('/dashboard')}
                sx={{
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  fontWeight: 600,
                  py: 1.5,
                  px: 4,
                  fontSize: '1rem',
                  borderRadius: 3,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(242, 159, 5, 0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Zurück zum Dashboard
              </Button>
            </Box>
        </Box>
        </PageLayout>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100%',
      background: `
        radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
        radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
        radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
        linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
      `,
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden',
      overflowX: 'hidden',
      pt: 4,
      pb: 8,
      '&::before': {
        content: '""',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        backgroundAttachment: 'fixed',
        backgroundSize: '100% 100%',
        zIndex: -1,
      }
    }}>
      <PageLayout activePage={undefined} showLogo={false} maxWidth="lg">
      <Box sx={{ position: 'relative', zIndex: 2, pt: { xs: 2, md: 4 }, pb: { xs: 4, md: 8 } }}>
      {/* Animierte Sterne im Hintergrund */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            background: '#F29F05',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            pointerEvents: 'none',
            opacity: Math.random() * 0.8 + 0.2,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 2,
          }}
        />
      ))}
      {/* Animierte Planeten-Orbits */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={`orbit-${i}`}
          style={{
            position: 'absolute',
            width: `${300 + i * 200}px`,
            height: `${300 + i * 200}px`,
            borderRadius: '50%',
            border: `1px solid rgba(242, 159, 5, ${0.1 - i * 0.02})`,
            left: `${20 + i * 20}%`,
            top: `${10 + i * 15}%`,
            pointerEvents: 'none',
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 20 + i * 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
      {/* Pulsierende Planeten */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`planet-${i}`}
          style={{
            position: 'absolute',
            width: `${20 + i * 10}px`,
            height: `${20 + i * 10}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(242, 159, 5, ${0.6 - i * 0.1}), rgba(140, 29, 4, ${0.3 - i * 0.05}))`,
            left: `${15 + i * 15}%`,
            top: `${20 + i * 10}%`,
            pointerEvents: 'none',
            filter: 'blur(1px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 4 + i * 1,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}
      
      <Box sx={{ position: 'relative', zIndex: 2, pt: { xs: 2, md: 4 }, pb: { xs: 4, md: 8 } }}>
        {/* Logo */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Logo />
        </Box>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ 
            textAlign: 'center', 
            mb: 6,
            py: { xs: 2, md: 4 }
          }}>
          <Typography
              variant="h2"
            sx={{
                color: '#ffffff',
              fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                mb: 2
              }}
            >
              ✨ Deine Resonanzen
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
              Finde deine energetische Entsprechung
          </Typography>

          {/* View Mode Toggle */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
            <Button
              variant={viewMode === 'swipe' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('swipe')}
              startIcon={<Heart size={20} />}
              sx={{
                background: viewMode === 'swipe' ? 'linear-gradient(135deg, #F29F05, #8C1D04)' : 'transparent',
                color: viewMode === 'swipe' ? 'white' : '#F29F05',
                border: '1px solid rgba(242, 159, 5, 0.5)',
                '&:hover': {
                  background: viewMode === 'swipe' ? 'linear-gradient(135deg, #8C1D04, #F29F05)' : 'rgba(242, 159, 5, 0.1)'
                }
              }}
            >
              Entdecken
            </Button>
            <Button
              variant={viewMode === 'compare' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('compare')}
              startIcon={<GitCompare size={20} />}
              sx={{
                background: viewMode === 'compare' ? 'linear-gradient(135deg, #F29F05, #8C1D04)' : 'transparent',
                color: viewMode === 'compare' ? 'white' : '#F29F05',
                border: '1px solid rgba(242, 159, 5, 0.5)',
                '&:hover': {
                  background: viewMode === 'compare' ? 'linear-gradient(135deg, #8C1D04, #F29F05)' : 'rgba(242, 159, 5, 0.1)'
                }
              }}
            >
              Vergleich
            </Button>
          </Box>
        </Box>
        </motion.div>
      {/* Match Animation */}
      <AnimatePresence>
        {showMatchAnim && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              borderRadius: '20px',
              padding: '40px',
              textAlign: 'center',
              color: 'white',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}
          >
            <Typography variant="h3" sx={{ mb: 2 }}>
              ✨ Resonanz!
            </Typography>
            <Typography variant="h6">
              Du und {currentProfile?.name} haben Resonanz gefunden!
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Comparison View */}
        {viewMode === 'compare' && (
          <>
            {(() => {
              console.log('🔍 Vergleichsmodus - Status:', {
                hasCurrentProfile: !!currentProfile,
                hasOwnChartData: !!ownChartData,
                profilesCount: profiles.length,
                currentIndex: currentIndex,
                currentProfileName: currentProfile?.name
              });
              return null;
            })()}
            {currentProfile && ownChartData ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <ProfileComparison
                    ownChartData={ownChartData}
                    otherProfile={currentProfile}
                    onSwipe={handleSwipe}
                  />
                </motion.div>
                {/* Zurück zum Dashboard Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowLeft size={20} />}
                      onClick={() => router.push('/dashboard')}
                      sx={{
                        borderColor: 'rgba(242, 159, 5, 0.5)',
                        color: '#F29F05',
                        fontWeight: 600,
                        py: 1.5,
                        px: 4,
                        fontSize: '1rem',
                        borderRadius: 3,
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: '#F29F05',
                          background: 'rgba(242, 159, 5, 0.1)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 20px rgba(242, 159, 5, 0.2)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Zurück zum Dashboard
                    </Button>
                  </Box>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(242, 159, 5, 0.5)',
                  borderRadius: 4,
                  p: 4,
                  textAlign: 'center',
                  mb: 4
                }}>
                  {isLoadingChart || (profiles.length === 0 && isLoading) ? (
                    <>
                      <CircularProgress size={40} sx={{ color: '#F29F05', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#F29F05', mb: 2, fontWeight: 600 }}>
                        Lade Vergleichsdaten...
                      </Typography>
                      {!ownChartData && isLoadingChart && (
                        <Typography variant="body2" component="div" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                          Dein Human Design Chart wird geladen...
                        </Typography>
                      )}
                      {!currentProfile && profiles.length === 0 && isLoading && (
                        <Typography variant="body2" component="div" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Profile werden geladen...
                        </Typography>
                      )}
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" sx={{ color: '#F29F05', mb: 2, fontWeight: 600 }}>
                        Daten nicht verfügbar
                      </Typography>
                      {!ownChartData && chartLoadAttempts >= MAX_CHART_LOAD_ATTEMPTS && (
                        <Typography variant="body2" component="div" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                          Dein Human Design Chart konnte nicht geladen werden. Bitte erstelle zuerst dein Profil.
                        </Typography>
                      )}
                      {profiles.length === 0 && !isLoading && (
                        <Typography variant="body2" component="div" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                          Keine Profile verfügbar. Bitte versuche es später erneut.
                        </Typography>
                      )}
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setChartLoadAttempts(0);
                          if (!ownChartData) loadOwnChart();
                          if (profiles.length === 0) loadProfiles();
                        }}
                        sx={{
                          borderColor: 'rgba(242, 159, 5, 0.5)',
                          color: '#F29F05',
                          mt: 2,
                          '&:hover': {
                            borderColor: '#F29F05',
                            background: 'rgba(242, 159, 5, 0.1)'
                          }
                        }}
                      >
                        Erneut versuchen
                      </Button>
                    </>
                  )}
                </Card>
                {/* Zurück zum Dashboard Button */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowLeft size={20} />}
                    onClick={() => router.push('/dashboard')}
                    sx={{
                      borderColor: 'rgba(242, 159, 5, 0.5)',
                      color: '#F29F05',
                      fontWeight: 600,
                      py: 1.5,
                      px: 4,
                      fontSize: '1rem',
                      borderRadius: 3,
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#F29F05',
                        background: 'rgba(242, 159, 5, 0.1)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 20px rgba(242, 159, 5, 0.2)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Zurück zum Dashboard
                  </Button>
                </Box>
              </motion.div>
            )}
          </>
        )}

        {/* Swipe Cards - Mobile: Single Card, Desktop: Grid */}
        {viewMode === 'swipe' && (
          <>
        {/* Mobile View - Single Card Stack */}
        <Box
          sx={{
            display: { xs: 'block', md: 'none' },
            position: 'relative',
            height: '700px',
            mb: 4,
            maxWidth: '450px',
            mx: 'auto'
          }}
        >
        <motion.div
          key={currentProfile._id}
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            x: swipeDirection === 'left' ? -300 : swipeDirection === 'right' ? 300 : 0,
            rotate: swipeDirection === 'left' ? -30 : swipeDirection === 'right' ? 30 : 0
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.8, 
            y: -50,
            x: swipeDirection === 'left' ? -300 : swipeDirection === 'right' ? 300 : 0,
            rotate: swipeDirection === 'left' ? -30 : swipeDirection === 'right' ? 30 : 0
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%'
          }}
        >
          <Card
            sx={{
              height: '100%',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.3)',
              boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)'
            }}
          >
            {/* Profile Image */}
            <Box
              sx={{
                height: '300px',
                background: `url(${currentProfile.image}) center/cover`,
                position: 'relative',
                filter: revealedProfiles.has(currentProfile._id) ? 'none' : 'blur(20px)',
                transition: 'filter 0.5s ease-in-out'
              }}
            >
              {/* Gradient Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '200px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))'
                }}
              />
              
              {/* Compatibility Score */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  p: 1,
                  color: 'white'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {currentProfile.compatibility_score}%
                </Typography>
                <Typography variant="caption">
                  Resonanz
                </Typography>
              </Box>

              {/* Reveal Button */}
              {!revealedProfiles.has(currentProfile._id) && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    zIndex: 10
                  }}
                >
        <Button
          variant="contained"
                    onClick={revealProfile}
          sx={{
            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
            color: 'white',
                      px: 4,
            py: 1.5,
            borderRadius: 3,
            fontWeight: 600,
            textTransform: 'none',
                      fontSize: '1.1rem',
            boxShadow: '0 8px 25px rgba(242, 159, 5, 0.30)',
            '&:hover': {
              background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 35px rgba(242, 159, 5, 0.40)'
            }
          }}
        >
                    🔍 Bild anzeigen
        </Button>
                  <Typography 
                    variant="body2" 
          sx={{
            color: 'white',
                      mt: 1, 
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      fontSize: '0.9rem'
                    }}
                  >
                    Lerne die Person erst kennen
          </Typography>
        </Box>
      )}
            </Box>

            <CardContent sx={{ 
              p: 2, 
              height: '300px', 
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(242,159,5,0.45)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(242,159,5,0.65)',
              }
            }}>
              <Stack spacing={1.5}>
                {/* Name and Age */}
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {currentProfile.name}, {currentProfile.age}
                        </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {currentProfile.location}
                        </Typography>
                      </Box>

                {/* Bio */}
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
                  {currentProfile.bio}
                              </Typography>

                {/* Erweiterte Informationen */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                    💼 Beruf & Bildung
                              </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem', mb: 0.5 }}>
                    {currentProfile.occupation} • {currentProfile.education}
                              </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
                    {currentProfile.lifestyle}
                              </Typography>
                      </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                    🎯 Werte & Ziele
                        </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 0.5 }}>
                    {currentProfile.values?.map((value, index) => (
                              <Chip
                                key={index}
                        label={value} 
                                size="small"
                                sx={{
                          background: 'rgba(242, 159, 5, 0.20)', 
                          color: '#F29F05',
                          fontSize: '0.7rem',
                          height: '20px'
                                }}
                              />
                            ))}
                  </Stack>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
                    {currentProfile.goals}
                              </Typography>
                      </Box>

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                    🎭 Persönlichkeit
                        </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 0.5 }}>
                    {currentProfile.personality_traits?.map((trait, index) => (
                      <Chip 
                        key={index}
                        label={trait} 
                        size="small" 
                          sx={{
                          background: 'rgba(140, 29, 4, 0.20)', 
                          color: '#8C1D04',
                          fontSize: '0.7rem',
                          height: '20px'
                        }}
                      />
                    ))}
                  </Stack>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
                    {currentProfile.relationship_style}
                        </Typography>
                      </Box>

                    <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                    🎵 Musik & Aktivitäten
                          </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem', mb: 0.5 }}>
                    Musik: {currentProfile.music_taste?.join(', ')}
                        </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem', mb: 0.5 }}>
                    Aktivitäten: {currentProfile.favorite_activities?.join(', ')}
                            </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.85rem' }}>
                    Reisen: {currentProfile.travel_preferences}
                            </Typography>
                        </Box>

                {/* Human Design Info */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                    Human Design
                              </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip 
                      label={currentProfile.hd_type} 
                      size="small" 
                      sx={{ background: 'linear-gradient(135deg, #F29F05, #8C1D04)', color: 'white' }}
                    />
                    <Chip 
                      label={currentProfile.profile} 
                      size="small" 
                      sx={{ background: 'linear-gradient(135deg, #F29F05, #8C1D04)', color: 'white' }}
                    />
                    <Chip 
                      label={currentProfile.authority} 
                      size="small" 
                      sx={{ background: 'linear-gradient(135deg, #F29F05, #8C1D04)', color: 'white' }}
                    />
                  </Stack>
                            </Box>

                {/* Interests */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 'bold' }}>
                    Interessen
                            </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {currentProfile.interests.map((interest, index) => (
                      <Chip 
                        key={index}
                        label={interest} 
                        size="small" 
                        sx={{ background: 'rgba(242, 159, 5, 0.20)', color: '#F29F05' }}
                      />
                    ))}
                  </Stack>
                            </Box>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
        </Box>

        {/* Desktop View - Grid Layout */}
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            mb: 4
          }}
        >
          <Grid container spacing={3}>
            {profiles.slice(currentIndex, currentIndex + 3).map((profile, index) => (
              <Grid item xs={12} md={4} key={profile._id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 4,
                      overflow: 'hidden',
                      position: 'relative',
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(20px)',
                      border: index === 0 ? '2px solid rgba(242, 159, 5, 0.5)' : '1px solid rgba(242, 159, 5, 0.3)',
                      boxShadow: index === 0 ? '0 12px 40px rgba(242, 159, 5, 0.3)' : '0 8px 32px rgba(242, 159, 5, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 16px 48px rgba(242, 159, 5, 0.4)',
                        border: '2px solid rgba(242, 159, 5, 0.6)'
                      },
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      if (index === 0) {
                        setCurrentIndex(prev => prev + 1);
                      }
                    }}
                  >
                    {/* Profile Image */}
                    <Box
                      sx={{
                        height: '400px',
                        background: `url(${profile.image}) center/cover`,
                        position: 'relative',
                        filter: revealedProfiles.has(profile._id) ? 'none' : 'blur(15px)',
                        transition: 'filter 0.5s ease-in-out'
                      }}
                    >
                      {/* Gradient Overlay */}
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '150px',
                          background: 'linear-gradient(transparent, rgba(0,0,0,0.8))'
                        }}
                      />
                      
                      {/* Compatibility Score */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                          backdropFilter: 'blur(10px)',
                          borderRadius: 2,
                          p: 1.5,
                          color: 'white',
                          minWidth: '80px',
                          textAlign: 'center'
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                          {profile.compatibility_score}%
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                          Resonanz
                        </Typography>
                      </Box>

                      {/* Reveal Button */}
                      {!revealedProfiles.has(profile._id) && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            zIndex: 10
                          }}
                        >
                          <Button
                            variant="contained"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRevealedProfiles(prev => new Set([...prev, profile._id]));
                            }}
                            sx={{
                              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                              color: 'white',
                              px: 4,
                              py: 1.5,
                              borderRadius: 3,
                              fontWeight: 600,
                              textTransform: 'none',
                              fontSize: '1rem',
                              boxShadow: '0 8px 25px rgba(242, 159, 5, 0.30)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 12px 35px rgba(242, 159, 5, 0.40)'
                              }
                            }}
                          >
                            🔍 Bild anzeigen
                          </Button>
                          <Typography 
                            variant="body2" 
                            sx={{
                              color: 'white',
                              mt: 1, 
                              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                              fontSize: '0.85rem'
                            }}
                          >
                            Klicke für Details
                          </Typography>
                        </Box>
                      )}

                      {/* Name Overlay */}
                      {revealedProfiles.has(profile._id) && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            p: 3,
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.9))'
                          }}
                        >
                          <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
                            {profile.name}, {profile.age}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                            {profile.location}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Card Content - Only show if revealed */}
                    {revealedProfiles.has(profile._id) && (
                      <CardContent sx={{ 
                        p: 3, 
                        maxHeight: '300px', 
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: 'rgba(255,255,255,0.1)',
                          borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: 'rgba(242,159,5,0.45)',
                          borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                          background: 'rgba(242,159,5,0.65)',
                        }
                      }}>
                        <Stack spacing={2}>
                          {/* Bio */}
                          <Typography variant="body2" component="div" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                            {profile.bio}
                          </Typography>

                          {/* Human Design Info */}
                          <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#F29F05' }}>
                              Human Design
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              <Chip 
                                label={profile.hd_type} 
                                size="small" 
                                sx={{ background: 'linear-gradient(135deg, #F29F05, #8C1D04)', color: 'white', fontSize: '0.75rem' }}
                              />
                              <Chip 
                                label={profile.profile} 
                                size="small" 
                                sx={{ background: 'linear-gradient(135deg, #F29F05, #8C1D04)', color: 'white', fontSize: '0.75rem' }}
                              />
                              <Chip 
                                label={profile.authority} 
                                size="small" 
                                sx={{ background: 'linear-gradient(135deg, #F29F05, #8C1D04)', color: 'white', fontSize: '0.75rem' }}
                              />
                            </Stack>
                          </Box>

                          {/* Interests */}
                          <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#F29F05' }}>
                              Interessen
                            </Typography>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                              {profile.interests.slice(0, 6).map((interest, idx) => (
                                <Chip 
                                  key={idx}
                                  label={interest} 
                                  size="small" 
                                  sx={{ background: 'rgba(242, 159, 5, 0.20)', color: '#F29F05', fontSize: '0.7rem', mb: 0.5 }}
                                />
                              ))}
                            </Stack>
                          </Box>

                          {/* Action Buttons */}
                          <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
                            <Button
                              fullWidth
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (index === 0) {
                                  handleSwipe(false);
                                }
                              }}
                              sx={{
                                borderColor: 'rgba(140, 29, 4, 0.5)',
                                color: '#8C1D04',
                                '&:hover': {
                                  borderColor: '#8C1D04',
                                  background: 'rgba(140, 29, 4, 0.1)'
                                }
                              }}
                            >
                              <X size={18} style={{ marginRight: 4 }} />
                              Überspringen
                            </Button>
                            <Button
                              fullWidth
                              variant="contained"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (index === 0) {
                                  handleSwipe(true);
                                }
                              }}
                              sx={{
                                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                                color: 'white',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)'
                                }
                              }}
                            >
                              <Heart size={18} style={{ marginRight: 4 }} />
                              Verbinden
                            </Button>
                          </Box>
                        </Stack>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Desktop Info Text */}
          <Box sx={{ textAlign: 'center', mt: 3, mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              💡 Klicke auf ein Profil, um die Resonanz zu entdecken. Das erste Profil ist aktiv.
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons - Mobile Only */}
        <Box 
          display="flex" 
          justifyContent="center" 
          gap={3} 
          mb={4}
          sx={{ display: { xs: 'flex', md: 'none' } }}
        >
          <IconButton
            onClick={() => handleSwipe(false)}
            disabled={!revealedProfiles.has(currentProfile._id)}
            sx={{
              width: 60,
              height: 60,
              background: revealedProfiles.has(currentProfile._id) 
                ? 'linear-gradient(135deg, #8C1D04, #590A03)' 
                : 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              opacity: revealedProfiles.has(currentProfile._id) ? 1 : 0.5,
              '&:hover': { 
                background: revealedProfiles.has(currentProfile._id)
                  ? 'linear-gradient(135deg, #590A03, #260A0A)'
                  : 'rgba(255, 255, 255, 0.2)',
                transform: revealedProfiles.has(currentProfile._id) ? 'scale(1.1)' : 'none'
              }
            }}
          >
            <X size={30} />
          </IconButton>

          <IconButton
            onClick={() => handleSwipe(true)}
            disabled={!revealedProfiles.has(currentProfile._id)}
            sx={{
              width: 60,
              height: 60,
              background: revealedProfiles.has(currentProfile._id)
                ? 'linear-gradient(135deg, #F29F05, #8C1D04)'
                : 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              opacity: revealedProfiles.has(currentProfile._id) ? 1 : 0.5,
              '&:hover': {
                background: revealedProfiles.has(currentProfile._id)
                  ? 'linear-gradient(135deg, #8C1D04, #F29F05)'
                  : 'rgba(255, 255, 255, 0.2)',
                transform: revealedProfiles.has(currentProfile._id) ? 'scale(1.1)' : 'none'
              }
            }}
          >
            <Heart size={30} />
          </IconButton>
        </Box>

        {/* Hinweis für Swipe-Buttons - Mobile Only */}
        {!revealedProfiles.has(currentProfile._id) && (
          <Box 
            textAlign="center" 
            mb={2}
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
              💡 Schau dir das Bild an, um zu entdecken
            </Typography>
          </Box>
        )}

        {/* Matches Counter */}
        {matches.length > 0 && (
          <Box textAlign="center">
            <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
              ✨ {matches.length} Verbindung{matches.length > 1 ? 'en' : ''} gefunden!
                      </Typography>
                          <Button
                              variant="contained"
              startIcon={<MessageCircle />}
              onClick={() => router.push('/dating')}
                              sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)'
                }
              }}
            >
              Verbindungen anzeigen
                            </Button>
                    </Box>
                  )}

        {/* Zurück zum Dashboard Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 4 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowLeft size={20} />}
              onClick={() => router.push('/dashboard')}
              sx={{
                borderColor: 'rgba(242, 159, 5, 0.5)',
                color: '#F29F05',
                fontWeight: 600,
                py: 1.5,
                px: 4,
                fontSize: '1rem',
                borderRadius: 3,
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#F29F05',
                  background: 'rgba(242, 159, 5, 0.1)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(242, 159, 5, 0.2)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Zurück zum Dashboard
            </Button>
          </Box>
        </motion.div>
          </>
        )}
      </Box>
      </Box>
      </PageLayout>
    </Box>
  );
}
