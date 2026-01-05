"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button,
  Alert,
  CircularProgress,
  Container,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Heart, 
  Users, 
  Star,
  MessageCircle,
  Target,
  Zap,
  Eye,
  Activity,
  Key,
  Sparkles,
  ArrowRight,
  Calendar,
  FileText,
  BookOpen,
  Trophy,
  Bot,
  Lock,
  Crown,
  Unlock,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageLayout from '../components/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import EnhancedChartVisuals from '@/components/EnhancedChartVisuals';
import ReferralWidget from '@/components/ReferralWidget';
import UserDataService from '@/lib/services/userDataService';

interface DashboardStats {
  moonEntries: number;
  readings: number;
  matches: number;
  communityActivity: number;
  connectionKeys: number;
  bookings: number;
  resonances: number;
}

interface ChartData {
  type: string;
  profile: string;
  authority: string;
  strategy: string;
  centers: Record<string, { defined: boolean }>;
  gates: Array<{ id: number; active: boolean; center: string }>;
  planets?: Record<string, any>;
}

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    moonEntries: 0,
    readings: 0,
    matches: 0,
    communityActivity: 0,
    connectionKeys: 0,
    bookings: 0,
    resonances: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [readings, setReadings] = useState<any[]>([]);
  const [showJournalReminder, setShowJournalReminder] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [starPositions, setStarPositions] = useState<Array<{
    width: number;
    height: number;
    left: number;
    top: number;
    opacity: number;
    duration: number;
    delay: number;
  }>>([]);
  const [orbitPositions, setOrbitPositions] = useState<Array<{
    width: number;
    height: number;
    left: number;
    top: number;
    borderOpacity: number;
    duration: number;
  }>>([]);
  const [planetPositions, setPlanetPositions] = useState<Array<{
    width: number;
    height: number;
    left: number;
    top: number;
    opacity: number;
    duration: number;
    delay: number;
  }>>([]);

  const loadUserName = useCallback(async () => {
    try {
      // ✅ Verwende user aus useAuth() statt localStorage
      if (!user?.id) return;
      const userId = user.id;

      // Versuche zuerst Profil-Daten aus Supabase zu laden
      // ✅ Verwende user aus useAuth() - token wird automatisch von Supabase Client verwendet
      try {
        const profileResponse = await fetch('/api/user/profile', {
          method: 'GET',
          // Authorization Header wird vom Supabase Client automatisch gesetzt
        });
          
        if (profileResponse.ok) {
          const profileResult = await profileResponse.json();
          if (profileResult.success && profileResult.profile) {
            const profile = profileResult.profile;
            const firstName = profile.first_name || '';
            const lastName = profile.last_name || '';
            
            if (firstName) {
              setUserName(firstName);
              
              // Sync zu UserDataService
              UserDataService.updateUserData({
                firstName: profile.first_name || '',
                lastName: profile.last_name || '',
                email: profile.email || UserDataService.getEmail() || '',
                phone: profile.phone || '',
                website: profile.website || '',
                location: profile.location || '',
                birthDate: profile.birth_date || '',
                birthTime: profile.birth_time || '',
                birthPlace: profile.birth_place || '',
                bio: profile.bio || '',
                hdType: profile.hd_type || '',
                hdProfile: profile.profile || '',
                hdAuthority: profile.authority || '',
                hdStrategy: profile.strategy || '',
                hdIncarnationCross: profile.incarnation_cross || ''
              });
              
              if (process.env.NODE_ENV === 'development') {
                console.log('✅ Profil-Daten aus Supabase geladen');
              }
              return;
            }
          }
        }
      } catch (profileError: any) {
        // ✅ Fehler beim Laden der Profil-Daten - nicht kritisch
        // Keine Warnung loggen, da localStorage als Fallback verwendet wird
        // AbortError oder NetworkError sind normal bei schnellen Navigationen
      }

      // Fallback: Versuche aus UserDataService zu laden
      const userData = UserDataService.getUserData();
      if (userData?.firstName || userData?.first_name) {
        setUserName(userData.firstName || userData.first_name || '');
        return;
      }

      // Andernfalls aus Supabase laden
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('user_id', userId)
        .single();

      if (!error && profile?.first_name) {
        setUserName(profile.first_name);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Benutzernamens:', error);
    }
  }, [user]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Lade Connection Key Daten
      let connectionKeyReadings: any[] = [];
      let allReadings: any[] = [];
      let bookings: any[] = [];
      
      try {
        const readingsData = localStorage.getItem('readings');
        if (readingsData) {
          const { safeJsonParse } = await import('@/lib/utils/safeJson');
          const parsed = safeJsonParse<any[]>(readingsData, []);
          allReadings = Array.isArray(parsed) ? parsed : [];
          connectionKeyReadings = allReadings.filter((r: any) => 
            r.category === 'connection-key' || r.type === 'connectionKey' || (r as any).category === 'connection-key'
          );
        }
        
        const bookingsData = localStorage.getItem('userBookings');
        if (bookingsData) {
          const { safeJsonParse } = await import('@/lib/utils/safeJson');
          const parsed = safeJsonParse<any[]>(bookingsData, []);
          bookings = Array.isArray(parsed) ? parsed.filter((b: any) => 
            b.type === 'connection-key' || b.bookingType === 'connection-key' || b.type === 'community-event'
          ) : [];
        }
      } catch (e) {
        console.error('Error loading Connection Key data:', e);
      }

      // Simuliere Dashboard-Daten
      const mockStats: DashboardStats = {
        moonEntries: 12,
        readings: 5,
        matches: 3,
        communityActivity: 8,
        connectionKeys: connectionKeyReadings.length || 0,
        bookings: bookings.length || 0,
        resonances: connectionKeyReadings.length || 0
      };
      
      // Lade echte Chart-Daten aus localStorage oder API
      let realChartData: ChartData | null = null;
      
      try {
        // Versuche zuerst aus UserDataService zu laden
        const chart = UserDataService.getChartData();
        if (chart) {
          try {
            // Prüfe ob personality/design vorhanden sind (für planets Konvertierung)
            const personality = chart.personality;
            const design = chart.design;
            
            // Konvertiere Chart-Daten in das erwartete Format
            const definedCenters = chart.definedCenters || [];
            const centers: Record<string, { defined: boolean }> = {
              'Head': { defined: definedCenters.includes('Head') || definedCenters.includes('HEAD') },
              'Ajna': { defined: definedCenters.includes('Ajna') || definedCenters.includes('AJNA') },
              'Throat': { defined: definedCenters.includes('Throat') || definedCenters.includes('THROAT') },
              'G': { defined: definedCenters.includes('G') || definedCenters.includes('G-Center') || definedCenters.includes('G_CENTER') || definedCenters.includes('G-Center') },
              'Heart': { defined: definedCenters.includes('Heart') || definedCenters.includes('Heart/Ego') || definedCenters.includes('HEART') || definedCenters.includes('Heart/Ego') },
              'Spleen': { defined: definedCenters.includes('Spleen') || definedCenters.includes('SPLEEN') },
              'Sacral': { defined: definedCenters.includes('Sacral') || definedCenters.includes('SACRAL') },
              'Solar': { defined: definedCenters.includes('Solar') || definedCenters.includes('Solar Plexus') || definedCenters.includes('SOLAR') || definedCenters.includes('Solar Plexus') },
              'Root': { defined: definedCenters.includes('Root') || definedCenters.includes('ROOT') }
            };
            
            // Konvertiere Gates
            const gatesArray = chart.gates || chart.activeGates || [];
            const gateToCenter: Record<number, string> = {
              1: 'G', 2: 'G', 3: 'Sacral', 4: 'Ajna', 5: 'Sacral', 6: 'Solar', 7: 'G', 8: 'Throat',
              9: 'Sacral', 10: 'G', 11: 'Ajna', 12: 'Throat', 13: 'G', 14: 'Sacral', 15: 'G', 16: 'Throat',
              17: 'Ajna', 18: 'Spleen', 19: 'Root', 20: 'Throat', 21: 'Heart', 22: 'Solar', 23: 'Throat',
              24: 'Ajna', 25: 'Heart', 26: 'Heart', 27: 'Spleen', 28: 'Root', 29: 'Sacral', 30: 'Solar',
              31: 'Throat', 32: 'Solar', 33: 'Throat', 34: 'Sacral', 35: 'Throat', 36: 'Solar', 37: 'Solar',
              38: 'Root', 39: 'Root', 40: 'Heart', 41: 'Root', 42: 'Solar', 43: 'Ajna', 44: 'Spleen',
              45: 'G', 46: 'G', 47: 'Ajna', 48: 'Spleen', 49: 'G', 50: 'Solar', 51: 'Heart', 52: 'Root',
              53: 'Root', 54: 'Root', 55: 'Solar', 56: 'Throat', 57: 'Spleen', 58: 'Root', 59: 'Sacral',
              60: 'Root', 61: 'Head', 62: 'Throat', 63: 'Head', 64: 'Head'
            };
            
            const gates = gatesArray.map((gateId: number) => ({
              id: gateId,
              active: true,
              center: gateToCenter[gateId] || 'Throat'
            }));
            
            // Konvertiere personality/design zu planets Format für EnhancedChartVisuals
            const planets: Record<string, any> = {};
            if (personality) {
              Object.entries(personality).forEach(([planetName, planetData]: [string, any]) => {
                if (planetData && typeof planetData === 'object' && 'gate' in planetData) {
                  const planetSymbols: Record<string, string> = {
                    'sun': '☉', 'moon': '☽', 'earth': '⊕', 'mercury': '☿', 
                    'venus': '♀', 'mars': '♂', 'jupiter': '♃', 'saturn': '♄',
                    'uranus': '♅', 'neptune': '♆', 'pluto': '♇', 'northNode': '☊', 'southNode': '☋'
                  };
                  planets[planetName] = {
                    symbol: planetSymbols[planetName] || '○',
                    name: planetName === 'northNode' ? 'Nordknoten' : 
                          planetName === 'southNode' ? 'Südknoten' :
                          planetName.charAt(0).toUpperCase() + planetName.slice(1),
                    gate: String(planetData.gate),
                    line: String(planetData.line),
                    position: planetData.longitude || 0,
                    color: '#F29F05',
                    description: `Gate ${planetData.gate}, Line ${planetData.line}`
                  };
                }
              });
            }
            
            realChartData = {
              type: chart.type || 'Unbekannt',
              profile: chart.profile || 'Unbekannt',
              authority: chart.authority || 'Unbekannt',
              strategy: chart.strategy || 'Unbekannt',
              centers,
              gates,
              planets: Object.keys(planets).length > 0 ? planets : undefined
            };
          } catch (parseError) {
            console.error('Fehler beim Parsen der Chart-Daten:', parseError);
          }
        }
        
        // Falls keine Chart-Daten in localStorage, versuche vom API zu laden
        if (!realChartData) {
          const userData = localStorage.getItem('userData');
          if (userData) {
            try {
              const data = JSON.parse(userData);
              if (data.birthDate || data.birthdate) {
                const response = await fetch('/api/charts/calculate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    birthDate: data.birthDate || data.birthdate,
                    birthTime: data.birthTime || data.birthtime || '12:00',
                    birthPlace: typeof data.birthPlace === 'string' ? {
                      latitude: 52.52,
                      longitude: 13.405,
                      timezone: 'Europe/Berlin',
                      name: data.birthPlace
                    } : data.birthPlace
                  })
                });
                
                if (response.ok) {
                  const result = await response.json();
                  const chart = result.chart;
                  
                  const definedCenters = chart.definedCenters || [];
                  const centers: Record<string, { defined: boolean }> = {
                    'Head': { defined: definedCenters.includes('Head') || definedCenters.includes('HEAD') },
                    'Ajna': { defined: definedCenters.includes('Ajna') || definedCenters.includes('AJNA') },
                    'Throat': { defined: definedCenters.includes('Throat') || definedCenters.includes('THROAT') },
                    'G': { defined: definedCenters.includes('G') || definedCenters.includes('G-Center') || definedCenters.includes('G_CENTER') },
                    'Heart': { defined: definedCenters.includes('Heart') || definedCenters.includes('Heart/Ego') || definedCenters.includes('HEART') },
                    'Spleen': { defined: definedCenters.includes('Spleen') || definedCenters.includes('SPLEEN') },
                    'Sacral': { defined: definedCenters.includes('Sacral') || definedCenters.includes('SACRAL') },
                    'Solar': { defined: definedCenters.includes('Solar') || definedCenters.includes('Solar Plexus') || definedCenters.includes('SOLAR') },
                    'Root': { defined: definedCenters.includes('Root') || definedCenters.includes('ROOT') }
                  };
                  
                  const gatesArray = chart.gates || chart.activeGates || [];
                  const gateToCenter: Record<number, string> = {
                    1: 'G', 2: 'G', 3: 'Sacral', 4: 'Ajna', 5: 'Sacral', 6: 'Solar', 7: 'G', 8: 'Throat',
                    9: 'Sacral', 10: 'G', 11: 'Ajna', 12: 'Throat', 13: 'G', 14: 'Sacral', 15: 'G', 16: 'Throat',
                    17: 'Ajna', 18: 'Spleen', 19: 'Root', 20: 'Throat', 21: 'Heart', 22: 'Solar', 23: 'Throat',
                    24: 'Ajna', 25: 'Heart', 26: 'Heart', 27: 'Spleen', 28: 'Root', 29: 'Sacral', 30: 'Solar',
                    31: 'Throat', 32: 'Solar', 33: 'Throat', 34: 'Sacral', 35: 'Throat', 36: 'Solar', 37: 'Solar',
                    38: 'Root', 39: 'Root', 40: 'Heart', 41: 'Root', 42: 'Solar', 43: 'Ajna', 44: 'Spleen',
                    45: 'G', 46: 'G', 47: 'Ajna', 48: 'Spleen', 49: 'G', 50: 'Solar', 51: 'Heart', 52: 'Root',
                    53: 'Root', 54: 'Root', 55: 'Solar', 56: 'Throat', 57: 'Spleen', 58: 'Root', 59: 'Sacral',
                    60: 'Root', 61: 'Head', 62: 'Throat', 63: 'Head', 64: 'Head'
                  };
                  
                  const gates = gatesArray.map((gateId: number) => ({
                    id: gateId,
                    active: true,
                    center: gateToCenter[gateId] || 'Throat'
                  }));
                  
                  // Konvertiere personality/design zu planets Format für EnhancedChartVisuals
                  const planets: Record<string, any> = {};
                  if (chart.personality) {
                    Object.entries(chart.personality).forEach(([planetName, planetData]: [string, any]) => {
                      if (planetData && typeof planetData === 'object' && 'gate' in planetData) {
                        planets[planetName] = {
                          symbol: planetName === 'sun' ? '☉' : planetName === 'moon' ? '☽' : planetName === 'earth' ? '⊕' : '○',
                          name: planetName.charAt(0).toUpperCase() + planetName.slice(1),
                          gate: String(planetData.gate),
                          line: String(planetData.line),
                          position: planetData.longitude || 0,
                          color: '#F29F05',
                          description: `Gate ${planetData.gate}, Line ${planetData.line}`
                        };
                      }
                    });
                  }
                  
                  realChartData = {
                    type: chart.type || 'Unbekannt',
                    profile: chart.profile || 'Unbekannt',
                    authority: chart.authority || 'Unbekannt',
                    strategy: chart.strategy || 'Unbekannt',
                    centers,
                    gates,
                    planets: Object.keys(planets).length > 0 ? planets : undefined
                  };
                  
                  // Speichere mit UserDataService (inkl. personality/design)
                  UserDataService.setChartData({
                    ...chart,
                    hdType: chart.type, // Alias für Kompatibilität
                    type: chart.type
                  });
                }
              }
            } catch (apiError) {
              console.error('Fehler beim Laden der Chart-Daten vom API:', apiError);
            }
          }
        }
      } catch (e) {
        console.error('Fehler beim Laden der Chart-Daten:', e);
      }
      
      // Batch State Updates
      setStats(mockStats);
      setChartData(realChartData);
      setReadings(allReadings);
      
      setTimeout(() => setLoading(false), 50);
    } catch (error) {
      console.error('Fehler beim Laden der Dashboard-Daten:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // ✅ Warte auf Auth-Loading, bevor wir Daten laden
    if (authLoading) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏳ Dashboard: Warte auf Auth-Loading...');
      }
      return;
    }
    
    // ✅ Prüfe, ob User vorhanden ist
    if (!user?.id) {
      if (process.env.NODE_ENV === 'development') {
        console.log('⏳ Dashboard: Warte auf User...');
      }
      return;
    }
    
    // ✅ Dashboard wird durch ProtectedRoute geschützt
    // Auth-Prüfung erfolgt automatisch
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Dashboard wird geladen...', {
        userId: user?.id,
        userPackage: user?.package
      });
    }
    
    loadUserName();
    loadDashboardData();
  }, [authLoading, user, loadUserName, loadDashboardData]);

  // Event-Listener für Chart-Daten Updates
  useEffect(() => {
    const handleChartDataUpdate = () => {
      console.log('📊 Chart-Daten wurden aktualisiert, lade Dashboard neu...');
      loadDashboardData();
    };

    const handleUserDataUpdate = () => {
      console.log('👤 User-Daten wurden aktualisiert, lade Dashboard neu...');
      loadDashboardData();
    };

    window.addEventListener('chartDataUpdated', handleChartDataUpdate);
    window.addEventListener('userDataUpdated', handleUserDataUpdate);

    return () => {
      window.removeEventListener('chartDataUpdated', handleChartDataUpdate);
      window.removeEventListener('userDataUpdated', handleUserDataUpdate);
    };
  }, [loadDashboardData]);

  // Prüfe, ob heute bereits ein Journal-Eintrag existiert
  const checkJournalEntry = useCallback(() => {
    try {
      import('@/lib/utils/safeJson').then(({ safeLocalStorageParse }) => {
        const journalEntries = safeLocalStorageParse<any[]>('journalEntries', []);
        if (journalEntries && journalEntries.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const hasEntryToday = journalEntries.some((entry: any) => entry.date === today);
          setShowJournalReminder(!hasEntryToday);
        } else {
          setShowJournalReminder(true);
        }
      }).catch((error) => {
        console.error('Fehler beim Prüfen der Journal-Einträge:', error);
        setShowJournalReminder(true);
      });
    } catch (error) {
      console.error('Fehler beim Prüfen der Journal-Einträge:', error);
      setShowJournalReminder(true);
    }
  }, []);

  useEffect(() => {
    checkJournalEntry();
    
    // Prüfe auch beim Fokus zurück auf die Seite (wenn Nutzer vom Journal zurückkommt)
    const handleFocus = () => {
      checkJournalEntry();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [checkJournalEntry]);

  // Client-seitige Initialisierung für Animationen
  useEffect(() => {
    setIsClient(true);
    // Generiere Sterne-Positionen nur client-seitig
    setStarPositions(
      Array.from({ length: 50 }).map(() => ({
        width: Math.random() * 3 + 1,
        height: Math.random() * 3 + 1,
        left: Math.random() * 100,
        top: Math.random() * 100,
        opacity: Math.random() * 0.8 + 0.2,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2,
      }))
    );
    // Generiere Orbit-Positionen
    setOrbitPositions(
      Array.from({ length: 3 }).map((_, i) => ({
        width: 300 + i * 200,
        height: 300 + i * 200,
        left: 20 + i * 20,
        top: 10 + i * 15,
        borderOpacity: 0.1 - i * 0.02,
        duration: 20 + i * 10,
      }))
    );
    // Generiere Planet-Positionen
    setPlanetPositions(
      Array.from({ length: 5 }).map((_, i) => ({
        width: 20 + i * 10,
        height: 20 + i * 10,
        left: 15 + i * 15,
        top: 20 + i * 10,
        opacity: 0.3,
        duration: 4 + i * 1,
        delay: i * 0.5,
      }))
    );
  }, []);


  // ------------- RENDER-FUNKTIONEN -------------

  // ✨ PREMIUM: Welcome Area (Hero-Card Premium)
  const renderWelcomeArea = () => {
    const packageId = user?.package || 'basic';
    const isPremium = ['premium', 'vip', 'admin'].includes(packageId);
    const energyLevel = Math.min(100, (stats.connectionKeys * 10 + stats.resonances * 5 + stats.bookings * 3));

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card sx={{
          background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.12) 0%, rgba(140, 29, 4, 0.08) 100%)',
          backdropFilter: 'blur(30px)',
          border: '2px solid rgba(242, 159, 5, 0.3)',
          borderRadius: { xs: 3, md: 4 },
          mb: { xs: 4, md: 5 },
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(242, 159, 5, 0.2)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #F29F05, #8C1D04, #F29F05)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s ease-in-out infinite',
            '@keyframes shimmer': {
              '0%': { backgroundPosition: '200% 0' },
              '100%': { backgroundPosition: '-200% 0' }
            }
          }
        }}>
          <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative', zIndex: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3, mb: 3 }}>
              <Box sx={{ flex: 1, minWidth: { xs: '100%', md: '60%' } }}>
                <Typography variant="h3" sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                  mb: 1,
                  fontSize: { xs: '1.8rem', md: '2.5rem' }
                }}>
                  ✨ Willkommen zurück{userName ? `, ${userName}` : ''}
                </Typography>
                <Typography variant="h6" sx={{
                  color: 'rgba(255,255,255,0.85)',
                  fontWeight: 400,
                  mb: 3,
                  fontSize: { xs: '1rem', md: '1.2rem' }
                }}>
                  Deine heutige energetische Ausrichtung
                </Typography>

                {/* Energie-Balken */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                      Resonanz-Energie
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#F29F05', fontWeight: 600, fontSize: '0.85rem' }}>
                      {energyLevel}%
                    </Typography>
                  </Box>
                  <Box sx={{
                    width: '100%',
                    height: 12,
                    background: 'rgba(242, 159, 5, 0.1)',
                    borderRadius: 6,
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid rgba(242, 159, 5, 0.2)'
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${energyLevel}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #F29F05, #8C1D04)',
                        borderRadius: 6,
                        boxShadow: '0 0 20px rgba(242, 159, 5, 0.6)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                        animation: 'shimmer 2s infinite',
                        '@keyframes shimmer': {
                          '0%': { transform: 'translateX(-100%)' },
                          '100%': { transform: 'translateX(100%)' }
                        }
                      }} />
                    </motion.div>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<Sparkles size={20} />}
                    onClick={() => router.push('/human-design-chart/connection-key')}
                    disabled={!chartData}
                    sx={{
                      background: chartData ? 'linear-gradient(135deg, #F29F05, #8C1D04)' : 'rgba(242, 159, 5, 0.2)',
                      color: chartData ? 'white' : 'rgba(242, 159, 5, 0.5)',
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      borderRadius: 3,
                      fontSize: { xs: '0.95rem', md: '1.1rem' },
                      boxShadow: chartData ? '0 8px 30px rgba(242, 159, 5, 0.4)' : 'none',
                      '&:hover': chartData ? {
                        background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 40px rgba(242, 159, 5, 0.5)'
                      } : {},
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Tages-Resonanz starten
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<BookOpen size={18} />}
                    onClick={() => router.push('/journal')}
                    sx={{
                      borderColor: 'rgba(242, 159, 5, 0.5)',
                      color: '#F29F05',
                      fontWeight: 600,
                      px: 3,
                      py: 1.5,
                      borderRadius: 3,
                      fontSize: { xs: '0.95rem', md: '1rem' },
                      '&:hover': {
                        borderColor: '#F29F05',
                        background: 'rgba(242, 159, 5, 0.1)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Dein Bewusstseinsfeld
                  </Button>
                </Box>
              </Box>

              {/* Premium Badge */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                {isPremium ? (
                  <Box sx={{
                    px: 3,
                    py: 1.5,
                    background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.2), rgba(140, 29, 4, 0.15))',
                    border: '2px solid rgba(242, 159, 5, 0.5)',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    boxShadow: '0 4px 20px rgba(242, 159, 5, 0.3)'
                  }}>
                    <Crown size={20} color="#F29F05" fill="#F29F05" />
                    <Typography variant="body1" sx={{ color: '#F29F05', fontWeight: 700, fontSize: '0.95rem' }}>
                      Premium
                    </Typography>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<Lock size={18} />}
                    onClick={() => router.push('/pricing')}
                    sx={{
                      borderColor: 'rgba(242, 159, 5, 0.4)',
                      color: 'rgba(242, 159, 5, 0.8)',
                      fontWeight: 600,
                      px: 2.5,
                      py: 1,
                      borderRadius: 2,
                      fontSize: '0.85rem',
                      '&:hover': {
                        borderColor: '#F29F05',
                        background: 'rgba(242, 159, 5, 0.1)'
                      }
                    }}
                  >
                    Premium freischalten
                  </Button>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // ✨ PREMIUM: Roadmap Card (3 Steps)
  const renderRoadmap = () => {
    const steps = [
      { id: 1, label: 'Deine Signatur', completed: !!chartData, route: '/human-design-chart' },
      { id: 2, label: 'Resonanzanalyse', completed: stats.connectionKeys > 0, route: '/connection-key' },
      { id: 3, label: 'Umsetzung', completed: stats.bookings > 0, route: '/meine-buchungen' }
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card sx={{
          background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.1) 0%, rgba(140, 29, 4, 0.08) 100%)',
          backdropFilter: 'blur(25px)',
          border: '1px solid rgba(242, 159, 5, 0.3)',
          borderRadius: { xs: 3, md: 4 },
          mb: { xs: 4, md: 5 },
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(242, 159, 5, 0.15)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(242, 159, 5, 0.25)'
          },
          transition: 'all 0.3s ease'
        }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(242, 159, 5, 0.4)'
              }}>
                <Target size={24} color="white" />
              </Box>
              <Box>
                <Typography variant="h5" sx={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: { xs: '1.3rem', md: '1.6rem' },
                  mb: 0.5
                }}>
                  Deine nächsten Schritte
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                  Hier ist dein persönlicher Weg zur energetischen Meisterschaft
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  whileHover={{ scale: 1.05 }}
                  style={{ flex: 1 }}
                >
                  <Card
                    component={Link}
                    href={step.route}
                    sx={{
                      background: step.completed 
                        ? 'linear-gradient(135deg, rgba(242, 159, 5, 0.2), rgba(140, 29, 4, 0.15))'
                        : 'rgba(242, 159, 5, 0.05)',
                      border: `2px solid ${step.completed ? 'rgba(242, 159, 5, 0.5)' : 'rgba(242, 159, 5, 0.2)'}`,
                      borderRadius: 3,
                      p: 2.5,
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(242, 159, 5, 0.3)',
                        border: '2px solid rgba(242, 159, 5, 0.7)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: step.completed 
                          ? 'linear-gradient(135deg, #F29F05, #8C1D04)'
                          : 'rgba(242, 159, 5, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {step.completed ? (
                          <CheckCircle2 size={20} color="white" fill="white" />
                        ) : (
                          <Circle size={20} color="#F29F05" />
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{
                          color: step.completed ? '#F29F05' : 'rgba(255,255,255,0.6)',
                          fontWeight: 600,
                          fontSize: '0.95rem'
                        }}>
                          Schritt {step.id} – {step.label}
                        </Typography>
                      </Box>
                      {index < steps.length - 1 && (
                        <ArrowRight size={16} color="rgba(242, 159, 5, 0.5)" style={{ flexShrink: 0 }} />
                      )}
                    </Box>
                  </Card>
                </motion.div>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<ArrowRight size={18} />}
                onClick={() => {
                  const nextStep = steps.find(s => !s.completed) || steps[0];
                  router.push(nextStep.route);
                }}
                sx={{
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  borderRadius: 3,
                  '&:hover': {
                    borderColor: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)'
                  }
                }}
              >
                Nächsten Schritt öffnen
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // ✨ PREMIUM: Premium-Block mit Upsell
  const renderPremiumBlock = () => {
    const packageId = user?.package || 'basic';
    const isPremium = ['premium', 'vip', 'admin'].includes(packageId);
    
    if (isPremium) return null; // Nur für Nicht-Premium anzeigen

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card sx={{
          background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.12) 100%)',
          backdropFilter: 'blur(30px)',
          border: '2px solid rgba(242, 159, 5, 0.4)',
          borderRadius: { xs: 3, md: 4 },
          mb: { xs: 4, md: 5 },
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 12px 40px rgba(242, 159, 5, 0.25)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(242, 159, 5, 0.2) 0%, transparent 70%)',
            borderRadius: '50%'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 150,
            height: 150,
            background: 'radial-gradient(circle, rgba(140, 29, 4, 0.15) 0%, transparent 70%)',
            borderRadius: '50%'
          }
        }}>
          <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative', zIndex: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                mb: 1,
                fontSize: { xs: '1.8rem', md: '2.2rem' }
              }}>
                ✨ Unlock Your True Potential – Premium Key ✨
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem' }}>
                Erweitere deine energetische Reise mit exklusiven Premium-Features
              </Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              {[
                { icon: Eye, title: 'Visualisation', desc: 'Tiefe Einblicke in deine energetische Struktur' },
                { icon: Sparkles, title: 'Tiefe Resonanzanalyse', desc: 'Erweiterte Connection Key Analysen' },
                { icon: Key, title: 'Seelen-Chart', desc: 'Dein vollständiger energetischer Blueprint' }
              ].map((feature, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Box sx={{
                    p: 2.5,
                    background: 'rgba(242, 159, 5, 0.08)',
                    border: '1px solid rgba(242, 159, 5, 0.2)',
                    borderRadius: 3,
                    textAlign: 'center',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(242, 159, 5, 0.2)',
                      border: '1px solid rgba(242, 159, 5, 0.4)'
                    }
                  }}>
                    <Box sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.2))',
                      border: '2px solid rgba(242, 159, 5, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      boxShadow: '0 4px 15px rgba(242, 159, 5, 0.3)'
                    }}>
                      <feature.icon size={28} color="#F29F05" />
                    </Box>
                    <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700, mb: 1, fontSize: '1.1rem' }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                      {feature.desc}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Crown size={20} />}
                onClick={() => router.push('/pricing')}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white',
                  fontWeight: 700,
                  px: 6,
                  py: 2,
                  borderRadius: 3,
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  boxShadow: '0 8px 30px rgba(242, 159, 5, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 40px rgba(242, 159, 5, 0.5)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Premium freischalten
              </Button>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // ✨ PREMIUM: Gesperrte Features
  const renderLockedFeatures = () => {
    const packageId = user?.package || 'basic';
    const isPremium = ['premium', 'vip', 'admin'].includes(packageId);
    
    if (isPremium) return null; // Nur für Nicht-Premium anzeigen

    const lockedFeatures = [
      { icon: Eye, title: 'Erweiterte Resonanzanalyse', desc: 'Tiefe Einblicke in deine energetischen Verbindungen' },
      { icon: Sparkles, title: 'Deep Connection Match', desc: 'Erweiterte Kompatibilitätsanalyse' },
      { icon: Key, title: 'Dein karmischer Blueprint', desc: 'Vollständige Seelen-Chart Analyse' }
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Box sx={{ mb: { xs: 4, md: 5 } }}>
          <Typography variant="h5" sx={{
            color: 'white',
            fontWeight: 700,
            mb: 3,
            fontSize: { xs: '1.4rem', md: '1.8rem' },
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Box sx={{
              width: 4,
              height: 32,
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              borderRadius: 2
            }} />
            Exklusive Premium-Features
          </Typography>

          <Grid container spacing={3}>
            {lockedFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{
                  background: 'rgba(242, 159, 5, 0.05)',
                  border: '2px solid rgba(242, 159, 5, 0.2)',
                  borderRadius: 3,
                  p: 3,
                  position: 'relative',
                  opacity: 0.7,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    opacity: 0.9,
                    transform: 'translateY(-4px)',
                    border: '2px solid rgba(242, 159, 5, 0.4)'
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Box sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'rgba(242, 159, 5, 0.1)',
                      border: '2px solid rgba(242, 159, 5, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Lock size={24} color="rgba(242, 159, 5, 0.6)" />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{
                        color: 'rgba(255,255,255,0.6)',
                        fontWeight: 600,
                        mb: 1,
                        fontSize: '1rem'
                      }}>
                        🔒 {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.85rem',
                        mb: 2
                      }}>
                        {feature.desc}
                      </Typography>
                      <Typography variant="caption" sx={{
                        color: 'rgba(242, 159, 5, 0.8)',
                        fontSize: '0.75rem',
                        fontStyle: 'italic'
                      }}>
                        Nur für Premium freigeschaltet
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </motion.div>
    );
  };

  const renderJournalReminder = () => {
    // Card wurde entfernt
    return null;
  };

  const renderDailyFocus = () => {
    // Tägliche Empfehlung basierend auf Chart
    const getDailyRecommendation = () => {
      if (!chartData) return null;
      const recommendations = [
        { type: 'Generator', text: 'Heute ist ein guter Tag, um auf deine Sacral-Antworten zu hören und auf Impulse zu reagieren.' },
        { type: 'Manifestor', text: 'Nutze deine Initiierungsenergie – informiere andere über deine Pläne.' },
        { type: 'Projector', text: 'Perfekter Moment für Reflexion und strategische Planung.' },
        { type: 'Reflector', text: 'Nimm dir Zeit für Beobachtung – Entscheidungen können warten.' }
      ];
      return recommendations.find(r => chartData.type?.includes(r.type))?.text || 
             'Nutze deine energetische Signatur, um heute bewusst zu handeln.';
    };

    return (
      <Card sx={{
        background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
        border: '2px solid rgba(242, 159, 5, 0.4)',
        borderRadius: 3,
        mb: { xs: 3, md: 4 },
        boxShadow: '0 8px 32px rgba(242, 159, 5, 0.25)',
        position: 'relative',
        overflow: 'hidden',
        maxWidth: { md: '1320px' },
        mx: 'auto',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #F29F05, #8C1D04)',
        }
      }}>
        <CardContent sx={{ p: { xs: 2, md: 3 }, position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(242, 159, 5, 0.4)'
            }}>
              <Target size={24} color="white" fill="white" />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ 
                color: 'white', 
                fontWeight: 800,
                fontSize: { xs: '1.5rem', md: '2rem' },
                mb: 0.5
              }}>
                {userName ? `${userName}, dein nächster Schritt` : 'Dein nächster Schritt'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Was brauchst du jetzt sofort?
              </Typography>
            </Box>
          </Box>

          {getDailyRecommendation() && (
            <Box sx={{
              mb: 3,
              p: 2,
              background: 'rgba(242, 159, 5, 0.1)',
              borderRadius: { xs: 2, md: 2 },
              border: '1px solid rgba(242, 159, 5, 0.2)'
            }}>
              <Typography variant="body2" sx={{ 
                color: 'rgba(255,255,255,0.9)',
                fontStyle: 'italic',
                lineHeight: 1.6
              }}>
                💡 {getDailyRecommendation()}
              </Typography>
            </Box>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Target size={20} fill="white" />}
                onClick={() => router.push('/human-design-chart')}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white',
                  fontWeight: 700,
                  borderRadius: { xs: 2, md: 3 },
                  minHeight: 48,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  boxShadow: '0 4px 20px rgba(242, 159, 5, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(242, 159, 5, 0.5)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {chartData ? 'Chart ansehen' : 'Chart erstellen'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Sparkles size={20} />}
                onClick={() => router.push('/human-design-chart/connection-key')}
                disabled={!chartData}
                sx={{
                  background: chartData ? 'linear-gradient(135deg, #F29F05, #8C1D04)' : 'rgba(242, 159, 5, 0.2)',
                  color: chartData ? 'white' : 'rgba(242, 159, 5, 0.5)',
                  fontWeight: 700,
                  borderRadius: { xs: 2, md: 3 },
                  minHeight: 48,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  boxShadow: chartData ? '0 4px 20px rgba(242, 159, 5, 0.4)' : 'none',
                  '&:hover': chartData ? {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(242, 159, 5, 0.5)'
                  } : {},
                  transition: 'all 0.3s ease'
                }}
              >
                Resonanzanalyse
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Calendar size={20} />}
                onClick={() => router.push('/connection-key/booking')}
                sx={{
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  fontWeight: 600,
                  borderRadius: { xs: 2, md: 3 },
                  minHeight: 48,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  '&:hover': {
                    borderColor: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(242, 159, 5, 0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Session buchen
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderSubscriptionCard = () => {
    // ✅ WICHTIG: Verwende DIREKT user.package aus useAuth() - das ist die WAHRHEIT!
    // NICHT userSubscription State, der könnte veraltet sein
    const packageId = user?.package || 'basic';
    
    // ✅ Nur gültige Pakete: basic, premium, vip, admin
    const allowedPackages = ['basic', 'premium', 'vip', 'admin'];
    const currentPackage = allowedPackages.includes(packageId) ? packageId : 'basic';
    
    // Paket-Namen für Anzeige
    const packageNames: Record<string, string> = {
      'basic': 'Basic',
      'premium': 'Premium',
      'vip': 'VIP',
      'admin': 'Admin'
    };
    
    // Icons für Pakete
    const packageIcons: Record<string, string> = {
      'basic': '⭐',
      'premium': '💎',
      'vip': '👑',
      'admin': '👑'
    };
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card sx={{
          background: 'rgba(242, 159, 5, 0.08)',
          backdropFilter: 'blur(20px)',
          mb: { xs: 3, md: 4 },
          borderRadius: 3,
          border: '1px solid rgba(242, 159, 5, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(242, 159, 5, 0.15)'
          }
        }}>
          <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: 'rgba(242, 159, 5, 0.15)',
                  border: '2px solid rgba(242, 159, 5, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2,
                  fontSize: { xs: '1.2rem', md: '1.5rem' }
                }}>
                  {packageIcons[currentPackage] || '⭐'}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ 
                    color: '#F29F05',
                    fontWeight: 700, 
                    mb: { xs: 0.25, md: 0.5 },
                    fontSize: { xs: '1rem', md: '1.25rem' } 
                  }}>
                    {packageNames[currentPackage] || 'Basic'} Paket
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Status: Aktiv ✓
                  </Typography>
                </Box>
              </Box>
              {/* ✅ Upgrade-Button nur anzeigen, wenn nicht bereits VIP oder Admin */}
              {currentPackage !== 'vip' && currentPackage !== 'admin' && (
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(242, 159, 5, 0.4)',
                    color: '#F29F05',
                    '&:hover': {
                      borderColor: '#F29F05',
                      background: 'rgba(242, 159, 5, 0.1)'
                    }
                  }}
                  onClick={() => router.push('/pricing')}
                >
                  Upgrade
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const renderStats = () => (
    <Box sx={{ mb: { xs: 8, md: 10 }, mt: { xs: 2, md: 3 } }}>
      {/* ✨ PREMIUM: Section-Header mit goldenen Linien */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 3,
        mb: { xs: 4, md: 5 },
        position: 'relative'
      }}>
        <Box sx={{
          flex: 1,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5))',
          borderRadius: 1
        }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Key size={24} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
          <Typography variant="h4" sx={{ 
            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            fontSize: { xs: '1.8rem', md: '2.4rem' },
            textShadow: '0 0 20px rgba(242, 159, 5, 0.3)'
          }}>
            Statistiken
          </Typography>
          <Key size={24} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
        </Box>
        <Box sx={{
          flex: 1,
          height: 2,
          background: 'linear-gradient(90deg, rgba(242, 159, 5, 0.5), transparent)',
          borderRadius: 1
        }} />
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Grid container spacing={{ xs: 2, md: 4 }} sx={{ mb: 0 }}>
          <Grid item xs={12} sm={6} md={4}>
        <Card sx={{
          background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(242, 159, 5, 0.30)',
          borderRadius: { xs: 3, md: 4 },
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          boxShadow: '0 6px 24px rgba(242, 159, 5, 0.2)',
          cursor: 'pointer',
          maxWidth: { md: '1320px' },
          mx: 'auto',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 10px 34px rgba(242, 159, 5, 0.3)',
            border: '1px solid rgba(242, 159, 5, 0.45)'
          }
        }} onClick={() => router.push('/connection-key')}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 4, md: 5 }, position: 'relative', zIndex: 2 }}>
                {/* ✨ PREMIUM: Großer Glow-Circle mit Animation */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{
                    width: { xs: 100, md: 120 },
                    height: { xs: 100, md: 120 },
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.4), rgba(140, 29, 4, 0.3))',
                    border: '4px solid rgba(242, 159, 5, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 0 40px rgba(242, 159, 5, 0.5), 0 8px 30px rgba(242, 159, 5, 0.4)',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: -8,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.2))',
                      filter: 'blur(12px)',
                      zIndex: -1,
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
                        '50%': { opacity: 1, transform: 'scale(1.1)' }
                      }
                    }
                  }}>
                    <Key size={48} color="#F29F05" style={{ filter: 'drop-shadow(0 0 12px rgba(242, 159, 5, 0.8))' }} />
                  </Box>
                </motion.div>
                <Typography variant="h1" sx={{ 
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 900,
                  mb: 0.5,
                  fontSize: { xs: '3.5rem', md: '4.5rem' },
                  textShadow: '0 0 30px rgba(242, 159, 5, 0.4)',
                  lineHeight: 1
                }}>
                  {stats.connectionKeys}
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: 'rgba(255,255,255,0.95)',
                  fontWeight: 600,
                  mb: 1,
                  fontSize: { xs: '1rem', md: '1.1rem' }
                }}>
                  Connection Keys
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(242, 159, 5, 0.9)', fontWeight: 600, fontSize: '0.85rem' }}>
                    Ansehen
                  </Typography>
                  <ArrowRight size={14} color="#F29F05" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.30)',
              borderRadius: { xs: 3, md: 4 },
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              boxShadow: '0 6px 24px rgba(242, 159, 5, 0.2)',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 34px rgba(242, 159, 5, 0.3)',
                border: '1px solid rgba(242, 159, 5, 0.45)'
              }
            }} onClick={() => router.push('/meine-buchungen')}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 4, md: 5 }, position: 'relative', zIndex: 2 }}>
                {/* ✨ PREMIUM: Großer Glow-Circle mit Animation */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{
                    width: { xs: 100, md: 120 },
                    height: { xs: 100, md: 120 },
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.4), rgba(140, 29, 4, 0.3))',
                    border: '4px solid rgba(242, 159, 5, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 0 40px rgba(242, 159, 5, 0.5), 0 8px 30px rgba(242, 159, 5, 0.4)',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: -8,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.2))',
                      filter: 'blur(12px)',
                      zIndex: -1,
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
                        '50%': { opacity: 1, transform: 'scale(1.1)' }
                      }
                    }
                  }}>
                    <Calendar size={48} color="#F29F05" style={{ filter: 'drop-shadow(0 0 12px rgba(242, 159, 5, 0.8))' }} />
                  </Box>
                </motion.div>
                <Typography variant="h1" sx={{ 
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 900,
                  mb: 0.5,
                  fontSize: { xs: '3.5rem', md: '4.5rem' },
                  textShadow: '0 0 30px rgba(242, 159, 5, 0.4)',
                  lineHeight: 1
                }}>
                  {stats.bookings}
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: 'rgba(255,255,255,0.95)',
                  fontWeight: 600,
                  mb: 1,
                  fontSize: { xs: '1rem', md: '1.1rem' }
                }}>
                  Buchungen
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(242, 159, 5, 0.9)', fontWeight: 600, fontSize: '0.85rem' }}>
                    Ansehen
                  </Typography>
                  <ArrowRight size={14} color="#F29F05" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.30)',
              borderRadius: { xs: 3, md: 4 },
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              boxShadow: '0 6px 24px rgba(242, 159, 5, 0.2)',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 10px 34px rgba(242, 159, 5, 0.3)',
                border: '1px solid rgba(242, 159, 5, 0.45)'
              }
            }} onClick={() => router.push('/human-design-chart/connection-key')}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 4, md: 5 }, position: 'relative', zIndex: 2 }}>
                {/* ✨ PREMIUM: Großer Glow-Circle mit Animation */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{
                    width: { xs: 100, md: 120 },
                    height: { xs: 100, md: 120 },
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.4), rgba(140, 29, 4, 0.3))',
                    border: '4px solid rgba(242, 159, 5, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 0 40px rgba(242, 159, 5, 0.5), 0 8px 30px rgba(242, 159, 5, 0.4)',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      inset: -8,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.2))',
                      filter: 'blur(12px)',
                      zIndex: -1,
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
                        '50%': { opacity: 1, transform: 'scale(1.1)' }
                      }
                    }
                  }}>
                    <Sparkles size={48} color="#F29F05" style={{ filter: 'drop-shadow(0 0 12px rgba(242, 159, 5, 0.8))' }} />
                  </Box>
                </motion.div>
                <Typography variant="h1" sx={{ 
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 900,
                  mb: 0.5,
                  fontSize: { xs: '3.5rem', md: '4.5rem' },
                  textShadow: '0 0 30px rgba(242, 159, 5, 0.4)',
                  lineHeight: 1
                }}>
                  {stats.resonances}
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: 'rgba(255,255,255,0.95)',
                  fontWeight: 600,
                  mb: 1,
                  fontSize: { xs: '1rem', md: '1.1rem' }
                }}>
                  Resonanzen
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 2 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(242, 159, 5, 0.9)', fontWeight: 600, fontSize: '0.85rem' }}>
                    Ansehen
                  </Typography>
                  <ArrowRight size={14} color="#F29F05" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );

  const renderSignatur = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card sx={{ 
        background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.18) 0%, rgba(140, 29, 4, 0.12) 100%)',
        backdropFilter: 'blur(25px)',
        border: '2px solid rgba(242, 159, 5, 0.40)',
        borderRadius: 4,
        mb: { xs: 5, md: 7 },
        mt: { xs: 2, md: 3 },
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        boxShadow: '0 8px 32px rgba(242, 159, 5, 0.25)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 40px rgba(242, 159, 5, 0.35)',
          border: '1px solid rgba(242, 159, 5, 0.55)'
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 0%, rgba(242, 159, 5, 0.30) 0%, transparent 70%)',
          opacity: 0.7,
          pointerEvents: 'none'
        }
      }}>
        <CardContent sx={{ p: { xs: 2, md: 3 }, position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)'
              }}>
                <Key size={40} color="white" />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ 
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                  mb: 1,
                  fontSize: { xs: '1.8rem', md: '2.5rem' }
                }}>
                  Human Design
                </Typography>
                <Typography variant="h4" sx={{ 
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                  mb: 1,
                  fontSize: { xs: '1.3rem', md: '1.8rem' }
                }}>
                  💫 The Connection Key
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 400,
                  fontSize: { xs: '1rem', md: '1.2rem' }
                }}>
                  Entdecke die unsichtbaren Goldadern zwischen dir und anderen
                </Typography>
                {chartData && (
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    <Box sx={{
                      px: { xs: 2, md: 2.5 },
                      py: { xs: 0.75, md: 1 },
                      background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.25), rgba(140, 29, 4, 0.15))',
                      borderRadius: { xs: 2, md: 3 },
                      border: '1px solid rgba(242, 159, 5, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Zap size={18} color="#F29F05" fill="#F29F05" />
                      <Typography variant="h6" sx={{ 
                        color: '#F29F05',
                        fontWeight: 700,
                        fontSize: { xs: '1rem', md: '1.1rem' }
                      }}>
                        {chartData.type}
                      </Typography>
                    </Box>
                    <Box sx={{
                      px: { xs: 2, md: 2.5 },
                      py: { xs: 0.75, md: 1 },
                      background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.25), rgba(140, 29, 4, 0.15))',
                      borderRadius: { xs: 2, md: 3 },
                      border: '1px solid rgba(242, 159, 5, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Typography variant="h6" sx={{ 
                        color: '#F29F05',
                        fontWeight: 700,
                        fontSize: { xs: '1rem', md: '1.1rem' }
                      }}>
                        Profil {chartData.profile}
                      </Typography>
                    </Box>
                    <Box sx={{
                      px: { xs: 2, md: 2.5 },
                      py: { xs: 0.75, md: 1 },
                      background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.25), rgba(140, 29, 4, 0.15))',
                      borderRadius: { xs: 2, md: 3 },
                      border: '1px solid rgba(242, 159, 5, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Typography variant="h6" sx={{ 
                        color: '#F29F05',
                        fontWeight: 700,
                        fontSize: { xs: '1rem', md: '1.1rem' }
                      }}>
                        {chartData.authority}
                      </Typography>
                    </Box>
                    {chartData.strategy && (
                      <Box sx={{
                        px: 2.5,
                        py: 1,
                        background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.25), rgba(140, 29, 4, 0.15))',
                        borderRadius: { xs: 2, md: 3 },
                        border: '1px solid rgba(242, 159, 5, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Typography variant="body1" sx={{ 
                          color: 'rgba(255,255,255,0.9)',
                          fontWeight: 600,
                          fontSize: { xs: '0.9rem', md: '0.95rem' }
                        }}>
                          {chartData.strategy}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          <Box sx={{ 
            mb: 3,
            p: { xs: 2, md: 2.5 },
            background: 'rgba(242, 159, 5, 0.08)',
            borderRadius: { xs: 2, md: 2 },
            border: '1px solid rgba(242, 159, 5, 0.2)'
          }}>
            <Typography variant="body2" sx={{ 
              color: 'rgba(255,255,255,0.95)',
              lineHeight: 1.7,
              fontSize: { xs: '0.9rem', md: '0.95rem' }
            }}>
              <strong style={{ color: '#F29F05' }}>Human Design ist die Landkarte. The Connection Key ist der Raum dazwischen.</strong> 
              Während dein Human Design Chart zeigt, wer du bist, zeigt dir <strong style={{ color: '#F29F05' }}>The Connection Key</strong>, 
              was entsteht, wenn sich zwei Designs begegnen. Erstelle einen Connection Key, um die energetische Resonanz 
              zwischen dir und anderen zu entdecken.
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: { xs: 2, md: 3 } }}>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Target size={20} fill="white" />}
                onClick={() => router.push('/human-design-chart')}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white',
                  fontWeight: 700,
                  minHeight: 48,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  borderRadius: { xs: 2, md: 3 },
                  boxShadow: '0 4px 20px rgba(242, 159, 5, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(242, 159, 5, 0.5)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {chartData ? 'Chart ansehen' : 'Chart erstellen'}
              </Button>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Sparkles size={20} />}
                onClick={() => router.push('/human-design-chart/connection-key')}
                disabled={!chartData}
                sx={{
                  background: chartData ? 'linear-gradient(135deg, #F29F05, #8C1D04)' : 'rgba(242, 159, 5, 0.2)',
                  color: chartData ? 'white' : 'rgba(242, 159, 5, 0.5)',
                  fontWeight: 700,
                  minHeight: 48,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  borderRadius: { xs: 2, md: 3 },
                  boxShadow: chartData ? '0 4px 20px rgba(242, 159, 5, 0.4)' : 'none',
                  '&:hover': chartData ? {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(242, 159, 5, 0.5)'
                  } : {},
                  transition: 'all 0.3s ease'
                }}
              >
                Connection Key erstellen
              </Button>
              {!chartData && (
                <Typography variant="caption" sx={{ 
                  color: 'rgba(242, 159, 5, 0.8)', 
                  mt: 1, 
                  display: 'block',
                  textAlign: 'center',
                  fontSize: '0.75rem'
                }}>
                  ⚠️ Für den Connection Key muss zuerst ein Chart erstellt werden
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Calendar size={20} />}
                onClick={() => router.push('/connection-key/booking')}
                sx={{
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  fontWeight: 600,
                  minHeight: 48,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  borderRadius: { xs: 2, md: 3 },
                  '&:hover': {
                    borderColor: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(242, 159, 5, 0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Session buchen
              </Button>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FileText size={20} />}
                endIcon={<ArrowRight size={18} />}
                onClick={() => router.push('/connection-key')}
                sx={{
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  fontWeight: 600,
                  minHeight: 48,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  borderRadius: { xs: 2, md: 3 },
                  '&:hover': {
                    borderColor: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(242, 159, 5, 0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Alle Keys ansehen
              </Button>
            </Grid>
          </Grid>


          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap',
            mt: 3,
            pt: 3,
            borderTop: '1px solid rgba(242, 159, 5, 0.2)'
          }}>
            <Box sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: 'auto' },
              p: 2,
              background: 'rgba(242, 159, 5, 0.08)',
              borderRadius: { xs: 2, md: 2 },
              border: '1px solid rgba(242, 159, 5, 0.2)',
              textAlign: 'center'
            }}>
              <Typography variant="h4" sx={{ color: '#F29F05', fontWeight: 700, mb: { xs: 0.25, md: 0.5 }, fontSize: { xs: '1.3rem', md: '1.5rem' } }}>
                {stats.connectionKeys}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Connection Keys
              </Typography>
            </Box>
            <Box sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: 'auto' },
              p: 2,
              background: 'rgba(242, 159, 5, 0.08)',
              borderRadius: { xs: 2, md: 2 },
              border: '1px solid rgba(242, 159, 5, 0.2)',
              textAlign: 'center'
            }}>
              <Typography variant="h4" sx={{ color: '#F29F05', fontWeight: 700, mb: { xs: 0.25, md: 0.5 }, fontSize: { xs: '1.3rem', md: '1.5rem' } }}>
                {stats.resonances}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Resonanzen
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderDating = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    >
      {/* ✨ PREMIUM: Section-Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 3,
        mb: { xs: 3, md: 4 },
        position: 'relative'
      }}>
        <Box sx={{
          flex: 1,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5))',
          borderRadius: 1
        }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Heart size={24} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
          <Typography variant="h4" sx={{ 
            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            fontSize: { xs: '1.6rem', md: '2.2rem' }
          }}>
            Dating & Matches
          </Typography>
          <Heart size={24} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
        </Box>
        <Box sx={{
          flex: 1,
          height: 2,
          background: 'linear-gradient(90deg, rgba(242, 159, 5, 0.5), transparent)',
          borderRadius: 1
        }} />
      </Box>

      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(242, 159, 5, 0.30)',
        borderRadius: 4,
        mb: { xs: 5, md: 7 },
        mt: { xs: 2, md: 3 },
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%)',
          opacity: 0.6,
          pointerEvents: 'none'
        }
      }}>
        <CardContent sx={{ p: { xs: 2, md: 3 }, position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)'
              }}>
                <Heart size={40} color="white" fill="white" />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 400,
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  mb: 1
                }}>
                  Finde deine energetische Resonanz durch Human Design
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  lineHeight: 1.6
                }}>
                  Finde Menschen, die energetisch wirklich zu dir passen – ohne oberflächliches Swipen. 
                  Basierend auf euren Human Design Charts.
                </Typography>
              </Box>
            </Box>
          </Box>

          <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: { xs: 2, md: 3 } }}>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Heart size={20} fill="white" />}
                onClick={() => router.push('/swipe')}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white',
                  fontWeight: 700,
                  minHeight: 48,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  borderRadius: { xs: 2, md: 3 },
                  boxShadow: '0 4px 20px rgba(242, 159, 5, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(242, 159, 5, 0.5)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Swipe starten
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Users size={20} />}
                onClick={() => router.push('/dating')}
                sx={{
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  fontWeight: 600,
                  minHeight: 48,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  borderRadius: { xs: 2, md: 3 },
                  '&:hover': {
                    borderColor: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(242, 159, 5, 0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Dein Resonanzraum
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<MessageCircle size={20} />}
                endIcon={<ArrowRight size={18} />}
                onClick={() => router.push('/dating')}
                sx={{
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  fontWeight: 600,
                  minHeight: 48,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  borderRadius: { xs: 2, md: 3 },
                  '&:hover': {
                    borderColor: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(242, 159, 5, 0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Meine Matches
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap',
            mt: 3,
            pt: 3,
            borderTop: '1px solid rgba(242, 159, 5, 0.2)'
          }}>
            <Box sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: 'auto' },
              p: 2,
              background: 'rgba(242, 159, 5, 0.08)',
              borderRadius: { xs: 2, md: 2 },
              border: '1px solid rgba(242, 159, 5, 0.2)',
              textAlign: 'center'
            }}>
              <Typography variant="h4" sx={{ color: '#F29F05', fontWeight: 700, mb: { xs: 0.25, md: 0.5 }, fontSize: { xs: '1.3rem', md: '1.5rem' } }}>
                {stats.matches}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Matches
              </Typography>
            </Box>
            <Box sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: 'auto' },
              p: 2,
              background: 'rgba(242, 159, 5, 0.08)',
              borderRadius: { xs: 2, md: 2 },
              border: '1px solid rgba(242, 159, 5, 0.2)',
              textAlign: 'center'
            }}>
              <Typography variant="h4" sx={{ color: '#F29F05', fontWeight: 700, mb: { xs: 0.25, md: 0.5 }, fontSize: { xs: '1.3rem', md: '1.5rem' } }}>
                Neu
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Profile verfügbar
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );


  const renderCommunity = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* ✨ PREMIUM: Section-Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 3,
        mb: { xs: 3, md: 4 },
        position: 'relative'
      }}>
        <Box sx={{
          flex: 1,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5))',
          borderRadius: 1
        }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Users size={24} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
          <Typography variant="h4" sx={{ 
            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            fontSize: { xs: '1.6rem', md: '2.2rem' }
          }}>
            Community Resonanzen
          </Typography>
          <Users size={24} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
        </Box>
        <Box sx={{
          flex: 1,
          height: 2,
          background: 'linear-gradient(90deg, rgba(242, 159, 5, 0.5), transparent)',
          borderRadius: 1
        }} />
      </Box>

      <Card sx={{ 
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(242, 159, 5, 0.30)',
        borderRadius: 4,
        mb: { xs: 5, md: 7 },
        mt: { xs: 2, md: 3 },
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%)',
          opacity: 0.6,
          pointerEvents: 'none'
        }
      }}>
        <CardContent sx={{ p: { xs: 2, md: 3 }, position: 'relative', zIndex: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)'
              }}>
                <Users size={40} color="white" fill="white" />
              </Box>
              <Box>
                <Typography variant="h3" sx={{ 
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                  mb: 1,
                  fontSize: { xs: '1.8rem', md: '2.5rem' }
                }}>
                  👥 Community
                </Typography>
                    <Typography variant="h6" sx={{ 
                      color: 'rgba(255,255,255,0.9)',
                      fontWeight: 400,
                      fontSize: { xs: '1rem', md: '1.2rem' },
                      mb: 1
                    }}>
                      Verbinde dich mit anderen Human Design Enthusiasten
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      lineHeight: 1.6
                    }}>
                      Tausche dich aus, lerne von anderen und finde Menschen, die deine energetische Reise verstehen. 
                      Gemeinsam wachsen wir.
                    </Typography>
              </Box>
            </Box>
          </Box>

          <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: { xs: 2, md: 3 } }}>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Users size={20} fill="white" />}
                onClick={() => router.push('/community')}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white',
                  fontWeight: 700,
                  minHeight: 48,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  borderRadius: { xs: 2, md: 3 },
                  boxShadow: '0 4px 20px rgba(242, 159, 5, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(242, 159, 5, 0.5)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Community öffnen
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<MessageCircle size={20} />}
                onClick={() => router.push('/community')}
                sx={{
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  fontWeight: 600,
                  minHeight: 48,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  borderRadius: { xs: 2, md: 3 },
                  '&:hover': {
                    borderColor: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(242, 159, 5, 0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Feed & Posts
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Calendar size={20} />}
                endIcon={<ArrowRight size={18} />}
                onClick={() => router.push('/community')}
                sx={{
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  fontWeight: 600,
                  minHeight: 48,
                  fontSize: { xs: '0.9rem', md: '1rem' },
                  borderRadius: { xs: 2, md: 3 },
                  '&:hover': {
                    borderColor: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 20px rgba(242, 159, 5, 0.2)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Events & Meetups
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            flexWrap: 'wrap',
            mt: 3,
            pt: 3,
            borderTop: '1px solid rgba(242, 159, 5, 0.2)'
          }}>
            <Box sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: 'auto' },
              p: 2,
              background: 'rgba(242, 159, 5, 0.08)',
              borderRadius: { xs: 2, md: 2 },
              border: '1px solid rgba(242, 159, 5, 0.2)',
              textAlign: 'center'
            }}>
              <Typography variant="h4" sx={{ color: '#F29F05', fontWeight: 700, mb: { xs: 0.25, md: 0.5 }, fontSize: { xs: '1.3rem', md: '1.5rem' } }}>
                {stats.communityActivity}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Aktivitäten
              </Typography>
            </Box>
            <Box sx={{
              flex: 1,
              minWidth: { xs: '100%', sm: 'auto' },
              p: 2,
              background: 'rgba(242, 159, 5, 0.08)',
              borderRadius: { xs: 2, md: 2 },
              border: '1px solid rgba(242, 159, 5, 0.2)',
              textAlign: 'center'
            }}>
              <Typography variant="h4" sx={{ color: '#F29F05', fontWeight: 700, mb: { xs: 0.25, md: 0.5 }, fontSize: { xs: '1.3rem', md: '1.5rem' } }}>
                Online
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Mitglieder
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderReadings = () => (
    <Box sx={{ mb: { xs: 8, md: 10 }, mt: { xs: 2, md: 3 } }}>
      {/* ✨ PREMIUM: Section-Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 3,
        mb: { xs: 4, md: 5 },
        position: 'relative'
      }}>
        <Box sx={{
          flex: 1,
          height: 2,
          background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5))',
          borderRadius: 1
        }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BookOpen size={24} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
          <Typography variant="h4" sx={{ 
            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            fontSize: { xs: '1.6rem', md: '2.2rem' }
          }}>
            Meine Readings
          </Typography>
          <BookOpen size={24} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
        </Box>
        <Box sx={{
          flex: 1,
          height: 2,
          background: 'linear-gradient(90deg, rgba(242, 159, 5, 0.5), transparent)',
          borderRadius: 1
        }} />
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {readings.length > 0 ? (
          <Grid container spacing={3}>
            {readings.slice(0, 6).map((reading, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(242, 159, 5, 0.3)',
                  borderRadius: { xs: 2, md: 3 },
                  p: 3,
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    borderColor: '#F29F05',
                    boxShadow: '0 8px 25px rgba(242, 159, 5, 0.3)',
                  },
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                        {reading.title || reading.name || 'Reading'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        {reading.category || reading.type || 'Allgemein'}
                      </Typography>
                    </Box>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem'
                    }}>
                      {reading.category === 'connection-key' ? '🩵' : '📖'}
                    </Box>
                  </Box>
                  
                  {reading.description && (
                    <Typography variant="body2" sx={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      mb: 2,
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {reading.description}
                    </Typography>
                  )}
                  
                  {reading.createdAt && (
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 2 }}>
                      {new Date(reading.createdAt).toLocaleDateString('de-DE', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Typography>
                  )}
                  
                  <Button
                    component={Link}
                    href="/human-design-chart/connection-key"
                    variant="outlined"
                    fullWidth
                    sx={{
                      borderColor: 'rgba(242, 159, 5, 0.5)',
                      color: '#F29F05',
                      fontWeight: 600,
                      py: 1,
                      '&:hover': {
                        borderColor: '#F29F05',
                        background: 'rgba(242, 159, 5, 0.1)',
                      },
                    }}
                  >
                    Ansehen
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(242, 159, 5, 0.2)',
            borderRadius: 3,
            p: 4,
            textAlign: 'center'
          }}>
            <Box sx={{ fontSize: '3rem', mb: 2 }}>📖</Box>
            <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontWeight: 600 }}>
              Noch keine Readings vorhanden
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
              Erstelle dein erstes Reading, um deine Resonanzanalysen zu sehen.
            </Typography>
            <Button
              component={Link}
              href="/human-design-chart/connection-key"
              variant="contained"
              startIcon={<Sparkles size={18} />}
              sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                color: 'white',
                fontWeight: 700,
                px: 4,
                py: 1.5,
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Erste Resonanzanalyse erstellen
            </Button>
          </Card>
        )}
        
        {readings.length > 6 && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              component={Link}
              href="/human-design-chart/connection-key"
              variant="outlined"
              endIcon={<ArrowRight size={20} />}
              sx={{
                borderColor: 'rgba(242, 159, 5, 0.5)',
                color: '#F29F05',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                '&:hover': {
                  borderColor: '#F29F05',
                  background: 'rgba(242, 159, 5, 0.1)',
                },
              }}
            >
              Alle Readings ansehen
            </Button>
          </Box>
        )}
      </motion.div>
    </Box>
  );

  // ✨ PREMIUM: Journey Map (Gamification)
  const renderGamification = () => {
    // Berechne Fortschritt basierend auf Stats
    const totalProgress = Math.min(100, (
      (stats.connectionKeys > 0 ? 25 : 0) +
      (stats.bookings > 0 ? 25 : 0) +
      (stats.resonances > 0 ? 25 : 0) +
      (chartData ? 25 : 0)
    ));

    const journeySteps = [
      { 
        id: 1, 
        label: 'Chart erstellt', 
        completed: !!chartData, 
        icon: Star,
        description: 'Deine Human Design Signatur',
        points: 100
      },
      { 
        id: 2, 
        label: 'Erste Resonanz', 
        completed: stats.connectionKeys > 0, 
        icon: Sparkles,
        description: 'Connection Key analysiert',
        points: 150
      },
      { 
        id: 3, 
        label: 'Buchung gemacht', 
        completed: stats.bookings > 0, 
        icon: Calendar,
        description: 'Erste Session gebucht',
        points: 200
      },
      { 
        id: 4, 
        label: 'Community', 
        completed: stats.resonances > 0, 
        icon: Users,
        description: 'Resonanzen gefunden',
        points: 250
      },
      { 
        id: 5, 
        label: 'Meister', 
        completed: totalProgress === 100, 
        icon: Trophy,
        description: 'Alle Meilensteine erreicht',
        points: 500
      }
    ];

    const completedSteps = journeySteps.filter(s => s.completed).length;
    const totalPoints = journeySteps
      .filter(s => s.completed)
      .reduce((sum, s) => sum + s.points, 0);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Box sx={{ mb: { xs: 8, md: 10 }, mt: { xs: 2, md: 3 } }}>
          {/* ✨ PREMIUM: Section-Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 3,
            mb: { xs: 4, md: 5 },
            position: 'relative'
          }}>
            <Box sx={{
              flex: 1,
              height: 2,
              background: 'linear-gradient(90deg, transparent, rgba(242, 159, 5, 0.5))',
              borderRadius: 1
            }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Trophy size={24} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
              <Typography variant="h4" sx={{ 
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                fontSize: { xs: '1.6rem', md: '2.2rem' }
              }}>
                Deine Journey
              </Typography>
              <Trophy size={24} color="#F29F05" style={{ filter: 'drop-shadow(0 0 8px rgba(242, 159, 5, 0.6))' }} />
            </Box>
            <Box sx={{
              flex: 1,
              height: 2,
              background: 'linear-gradient(90deg, rgba(242, 159, 5, 0.5), transparent)',
              borderRadius: 1
            }} />
          </Box>

          <Card sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.12) 0%, rgba(140, 29, 4, 0.08) 100%)',
            backdropFilter: 'blur(25px)',
            border: '2px solid rgba(242, 159, 5, 0.4)',
            borderRadius: 4,
            p: { xs: 3, md: 5 },
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 12px 40px rgba(242, 159, 5, 0.25)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(242, 159, 5, 0.2) 0%, transparent 70%)',
              borderRadius: '50%'
            }
          }}>
            {/* Progress Overview */}
            <Box sx={{ mb: 4, textAlign: 'center', position: 'relative', zIndex: 2 }}>
              <Typography variant="h5" sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}>
                {completedSteps} von {journeySteps.length} Meilensteinen erreicht
              </Typography>
              
              {/* Progress Bar */}
              <Box sx={{ 
                width: '100%', 
                height: 12, 
                background: 'rgba(255,255,255,0.1)', 
                borderRadius: 2, 
                mb: 3,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${totalProgress}%` }}
                  transition={{ duration: 1.5, delay: 0.3 }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #F29F05, #8C1D04)',
                    borderRadius: 'inherit',
                    boxShadow: '0 0 20px rgba(242, 159, 5, 0.7)',
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 900,
                    fontSize: { xs: '2rem', md: '2.5rem' }
                  }}>
                    {totalPoints}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                    Gesamtpunkte
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" sx={{
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 900,
                    fontSize: { xs: '2rem', md: '2.5rem' }
                  }}>
                    {Math.round(totalProgress)}%
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                    Fortschritt
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Journey Steps */}
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Grid container spacing={3}>
                {journeySteps.map((step, index) => (
                  <Grid item xs={12} sm={6} md={4} key={step.id}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card sx={{
                        background: step.completed 
                          ? 'linear-gradient(135deg, rgba(242, 159, 5, 0.2) 0%, rgba(140, 29, 4, 0.15) 100%)'
                          : 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(15px)',
                        border: step.completed 
                          ? '2px solid rgba(242, 159, 5, 0.5)'
                          : '2px dashed rgba(255,255,255,0.2)',
                        borderRadius: 3,
                        p: 3,
                        textAlign: 'center',
                        position: 'relative',
                        transition: 'all 0.3s ease',
                        boxShadow: step.completed 
                          ? '0 8px 25px rgba(242, 159, 5, 0.3)'
                          : 'none',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: step.completed 
                            ? '0 12px 35px rgba(242, 159, 5, 0.4)'
                            : '0 4px 15px rgba(255,255,255,0.1)'
                        }
                      }}>
                        <Box sx={{
                          width: { xs: 70, md: 80 },
                          height: { xs: 70, md: 80 },
                          borderRadius: '50%',
                          background: step.completed
                            ? 'linear-gradient(135deg, #F29F05, #8C1D04)'
                            : 'rgba(255,255,255,0.1)',
                          border: step.completed
                            ? '3px solid rgba(242, 159, 5, 0.6)'
                            : '3px dashed rgba(255,255,255,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                          boxShadow: step.completed
                            ? '0 0 30px rgba(242, 159, 5, 0.5)'
                            : 'none',
                          position: 'relative',
                          '&::before': step.completed ? {
                            content: '""',
                            position: 'absolute',
                            inset: -4,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.2))',
                            filter: 'blur(8px)',
                            zIndex: -1,
                            animation: 'pulse 2s ease-in-out infinite',
                            '@keyframes pulse': {
                              '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
                              '50%': { opacity: 1, transform: 'scale(1.1)' }
                            }
                          } : {}
                        }}>
                          {step.completed ? (
                            <step.icon size={40} color="white" style={{ filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' }} />
                          ) : (
                            <step.icon size={40} color="rgba(255,255,255,0.3)" />
                          )}
                        </Box>
                        <Typography variant="h6" sx={{
                          color: step.completed ? '#F29F05' : 'rgba(255,255,255,0.5)',
                          fontWeight: 700,
                          mb: 1,
                          fontSize: { xs: '1rem', md: '1.1rem' }
                        }}>
                          {step.completed ? '✓' : `${step.id}.`} {step.label}
                        </Typography>
                        <Typography variant="body2" sx={{
                          color: step.completed ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                          fontSize: '0.85rem',
                          mb: 1
                        }}>
                          {step.description}
                        </Typography>
                        <Box sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 2,
                          background: step.completed
                            ? 'rgba(242, 159, 5, 0.2)'
                            : 'rgba(255,255,255,0.05)',
                          border: step.completed
                            ? '1px solid rgba(242, 159, 5, 0.4)'
                            : '1px solid rgba(255,255,255,0.1)'
                        }}>
                          <Star size={14} color={step.completed ? "#F29F05" : "rgba(255,255,255,0.3)"} />
                          <Typography variant="caption" sx={{
                            color: step.completed ? '#F29F05' : 'rgba(255,255,255,0.4)',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}>
                            {step.points} Punkte
                          </Typography>
                        </Box>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* CTA Button */}
            <Box sx={{ textAlign: 'center', mt: 4, position: 'relative', zIndex: 2 }}>
              <Button
                component={Link}
                href="/gamification"
                variant="contained"
                endIcon={<ArrowRight size={20} />}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white',
                  fontWeight: 700,
                  px: 5,
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 35px rgba(242, 159, 5, 0.5)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Vollständige Journey ansehen
              </Button>
            </Box>
          </Card>
        </Box>
      </motion.div>
    );
  };

  const renderFeatures = () => (
    <Box sx={{ mb: { xs: 8, md: 10 }, mt: { xs: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ 
        color: 'white',
        fontWeight: 700,
        mb: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        '&::before': {
          content: '""',
          width: 4,
          height: 32,
          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
          borderRadius: 2
        }
      }}>
        Weitere Features
      </Typography>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.75 }}
      >
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {/* Referral Widget */}
          <Grid item xs={12} md={12}>
            <React.Suspense fallback={
              <Card sx={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 3
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress sx={{ color: '#FFD700' }} />
                  </Box>
                </CardContent>
              </Card>
            }>
              <ReferralWidget />
            </React.Suspense>
          </Grid>
        </Grid>
      </motion.div>
    </Box>
  );

  // ------------- LOADING -------------

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(90% 70% at 50% 25%, rgba(242, 159, 5, 0.30), transparent 78%), radial-gradient(60% 50% at 80% 80%, rgba(140, 29, 4, 0.20), transparent 78%)'
        },
        gap: 3
      }}>
        <CircularProgress 
          size={70} 
          thickness={4}
          sx={{ 
            color: '#F29F05',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }} 
        />
        <Typography
          variant="h6"
          sx={{
            color: '#F29F05',
            fontWeight: 600,
            textAlign: 'center'
          }}
        >
          Lädt...
        </Typography>
      </Box>
    );
  }

  // ------------- HAUPTRENDER -------------

  // ✅ Zeige Loading-Spinner während Auth-Loading
  if (authLoading) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
      }}>
        <CircularProgress size={60} sx={{ color: "#F29F05" }} />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
        radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
        radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
        linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
      `,
      backgroundAttachment: 'fixed',
      position: 'relative',
      overflow: 'hidden',
      pt: { xs: 4, md: 6 },
      pb: 8,
    }}>
      {/* Animierte Sterne im Hintergrund - Client-seitig gerendert */}
      {isClient && starPositions.map((starProps, i) => (
        <motion.div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            width: `${starProps.width}px`,
            height: `${starProps.height}px`,
            background: '#F29F05',
            borderRadius: '50%',
            left: `${starProps.left}%`,
            top: `${starProps.top}%`,
            pointerEvents: 'none',
            opacity: starProps.opacity,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: starProps.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: starProps.delay,
          }}
        />
      ))}

      {/* Animierte Planeten-Orbits - Client-seitig gerendert */}
      {isClient && orbitPositions.map((orbitProps, i) => (
        <motion.div
          key={`orbit-${i}`}
          style={{
            position: 'absolute',
            width: `${orbitProps.width}px`,
            height: `${orbitProps.height}px`,
            borderRadius: '50%',
            border: `1px solid rgba(242, 159, 5, ${orbitProps.borderOpacity})`,
            left: `${orbitProps.left}%`,
            top: `${orbitProps.top}%`,
            pointerEvents: 'none',
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: orbitProps.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Pulsierende Planeten - Client-seitig gerendert */}
      {isClient && planetPositions.map((planetProps, i) => (
        <motion.div
          key={`planet-${i}`}
          style={{
            position: 'absolute',
            width: `${planetProps.width}px`,
            height: `${planetProps.height}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(242, 159, 5, ${0.6 - i * 0.1}), rgba(140, 29, 4, ${0.3 - i * 0.05}))`,
            left: `${planetProps.left}%`,
            top: `${planetProps.top}%`,
            pointerEvents: 'none',
            filter: 'blur(1px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: planetProps.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: planetProps.delay,
          }}
        />
      ))}

      <PageLayout activePage="dashboard" showLogo={true} maxWidth="lg">
        {/* Kompakter Header */}
        <Box sx={{ 
          mb: { xs: 3, md: 4 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2
          }}>
            <Box>
              <Typography variant="h4" suppressHydrationWarning sx={{ 
                fontWeight: 700,
                color: 'white',
                fontSize: { xs: '1.5rem', md: '2rem' },
                mb: 0.5
              }}>
                {userName ? `${userName}s Dashboard` : 'Dashboard'}
              </Typography>
              <Typography variant="body2" sx={{ 
                color: 'rgba(255,255,255,0.7)',
                fontSize: { xs: '0.85rem', md: '0.95rem' }
              }}>
                {userName ? `Willkommen zurück, ${userName}!` : 'Willkommen zurück!'} Dein persönlicher Überblick über deine Human Design Journey.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                component={Link}
                href="/seitenliste"
                variant="outlined"
                startIcon={<FileText size={16} />}
                sx={{
                  color: 'rgba(242, 159, 5, 0.9)',
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  backgroundColor: 'rgba(242, 159, 5, 0.05)',
                  px: { xs: 2, md: 2.5 },
                  py: { xs: 0.75, md: 1 },
                  borderRadius: 2,
                  fontSize: { xs: '0.8rem', md: '0.85rem' },
                  fontWeight: 500,
                  '&:hover': {
                    borderColor: 'rgba(242, 159, 5, 0.8)',
                    backgroundColor: 'rgba(242, 159, 5, 0.15)',
                    color: '#F29F05',
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Seitenliste
              </Button>
            </Box>
          </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {renderSubscriptionCard()}

        {/* Journal Erinnerung */}
        {renderJournalReminder()}

        {/* PREMIUM DASHBOARD - MOBILE & DESKTOP REIHENFOLGE */}
        {isMobile ? (
          <>
            {/* Premium Welcome Area */}
            {renderWelcomeArea()}
            {/* Roadmap */}
            {renderRoadmap()}
            {/* Energetische Signatur */}
            {renderSignatur()}
            {/* Statistiken */}
            {renderStats()}
            {/* Premium Block */}
            {renderPremiumBlock()}
            {/* Dating & Matches */}
            {renderDating()}
            {/* Community */}
            {renderCommunity()}
            {/* Readings */}
            {renderReadings()}
            {/* Gesperrte Features */}
            {renderLockedFeatures()}
            {/* Gamification */}
            {renderGamification()}
            {/* Weitere Features */}
            {renderFeatures()}
          </>
        ) : (
          <>
            {/* PREMIUM DASHBOARD - Desktop-Version */}
            {/* Premium Welcome Area */}
            {renderWelcomeArea()}
            {/* Roadmap */}
            {renderRoadmap()}
            {/* Energetische Signatur */}
            {renderSignatur()}
            {/* Statistiken */}
            {renderStats()}
            {/* Premium Block */}
            {renderPremiumBlock()}
            {/* Dating & Matches */}
            {renderDating()}
            {/* Community */}
            {renderCommunity()}
            {/* Readings */}
            {renderReadings()}
            {/* Gesperrte Features */}
            {renderLockedFeatures()}
            {/* Gamification */}
            {renderGamification()}
            {/* Weitere Features */}
            {renderFeatures()}
          </>
        )}
      </PageLayout>
    </Box>
  );
};

// Export mit ProtectedRoute - DIREKT ohne Wrapper-Komponente
export default function Dashboard() {
  return (
    <ProtectedRoute requiredRole="basic">
      <DashboardPage />
    </ProtectedRoute>
  );
}

