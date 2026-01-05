'use client';

import React, { useState, useEffect, createElement } from 'react';
import {
  Box, 
  Container, 
  Typography, 
  Paper, 
  Chip, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  Tabs, 
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Star, 
  User, 
  Brain, 
  Crown, 
  Target, 
  Zap, 
  Shield, 
  Share2, 
  Download, 
  Moon,
  Activity,
  TrendingUp,
  BookOpen,
  Users,
  Calendar,
  Heart,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Eye,
  EyeOff,
  Filter,
  Copy,
} from 'lucide-react';
import AccessControl from '@/components/AccessControl';
import { safeJsonParse } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ConnectionKeyAnalyzer from '../../components/ConnectionKeyAnalyzer';
import { Heart as HeartIcon } from 'lucide-react';
import { Orbit } from 'lucide-react';
import Bodygraph from '@/components/Bodygraph';
import PremiumBodygraphSection from '@/components/PremiumBodygraphSection';
import { DefinedState, CenterId } from '@/lib/hd-bodygraph/types';
import { motion } from 'framer-motion';
import PageLayout from '../components/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import UserDataService from '@/lib/services/userDataService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface Center {
  defined: boolean;
  color: string;
  gates: string[];
  description: string;
}

interface Channel {
  from: number;
  to: number;
  active: boolean;
  name: string;
}

interface Gate {
  id: number;
  active: boolean;
  name: string;
  description: string;
}

interface UserSubscription {
  userId?: string;
  packageId?: string;
  plan?: string;
  status?: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chart-tabpanel-${index}`}
      aria-labelledby={`chart-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ConnectionKeyFormProps {
  onSubmit: (birthDate: string, birthTime: string, birthPlace: string, name: string) => void;
  loading: boolean;
  error: string | null;
}

function ConnectionKeyFormComponent({ onSubmit, loading, error }: ConnectionKeyFormProps) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && birthDate && birthTime && birthPlace) {
      onSubmit(birthDate, birthTime, birthPlace, name);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {error && (
        <Alert severity="error" sx={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          {error}
        </Alert>
      )}
      
      <TextField
        label="Name der Person"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
            '&.Mui-focused fieldset': { borderColor: '#F29F05' }
          },
          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
        }}
      />
      
      <TextField
        label="Geburtsdatum"
        type="date"
        value={birthDate}
        onChange={(e) => setBirthDate(e.target.value)}
        required
        fullWidth
        InputLabelProps={{ shrink: true }}
        sx={{
          '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
            '&.Mui-focused fieldset': { borderColor: '#F29F05' }
          },
          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
        }}
      />
      
      <TextField
        label="Geburtszeit"
        type="time"
        value={birthTime}
        onChange={(e) => setBirthTime(e.target.value)}
        required
        fullWidth
        InputLabelProps={{ shrink: true }}
        sx={{
          '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
            '&.Mui-focused fieldset': { borderColor: '#F29F05' }
          },
          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
        }}
      />
      
      <TextField
        label="Geburtsort"
        value={birthPlace}
        onChange={(e) => setBirthPlace(e.target.value)}
        required
        fullWidth
        placeholder="z.B. Berlin, Deutschland"
        sx={{
          '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
            '&.Mui-focused fieldset': { borderColor: '#F29F05' }
          },
          '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
          '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
        }}
      />
      
      <Button
        type="submit"
        variant="contained"
        disabled={loading || !name || !birthDate || !birthTime || !birthPlace}
        onClick={(e) => {
          // Zusätzliche Validierung beim Klick
          if (!name || !birthDate || !birthTime || !birthPlace) {
            e.preventDefault();
            return;
          }
        }}
        sx={{
          background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
          color: 'white',
          fontWeight: 600,
          py: 1.5,
          '&:hover': {
            background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)',
          },
          '&:disabled': {
            background: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.3)'
          },
          transition: 'all 0.3s ease',
        }}
      >
        {loading ? 'Berechne Chart...' : '🩵 Resonanzanalyse starten'}
      </Button>
    </Box>
  );
}

function HumanDesignChartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(0);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [hasPassedThreshold, setHasPassedThreshold] = useState(false);
  
  // Bodygraph Premium Features State
  const [zoomLevel, setZoomLevel] = useState(100);
  const [expertMode, setExpertMode] = useState(false);
  const [showDefinedOnly, setShowDefinedOnly] = useState(false);
  const [showChannels, setShowChannels] = useState(true);
  const [hoveredElement, setHoveredElement] = useState<{type: 'center' | 'channel' | 'gate', id: string, info: string} | null>(null);
  
  // Die Heiligen Hallen - Progressive Öffnung
  const [chartVisible, setChartVisible] = useState(false);
  const [interactionsEnabled, setInteractionsEnabled] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  
  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showChartForm, setShowChartForm] = useState(false);
  const [chartFormData, setChartFormData] = useState({
    birthDate: '',
    birthTime: '',
    birthPlace: ''
  });
  const [calculatingChart, setCalculatingChart] = useState(false);
  const [chartFormError, setChartFormError] = useState<string | null>(null);
  const [recalculating, setRecalculating] = useState(false);
  
  // Connection Key Analyse States
  const [showConnectionKeyModal, setShowConnectionKeyModal] = useState(false);
  const [person2Data, setPerson2Data] = useState<{
    name: string;
    birthDate: string;
    birthTime: string;
    birthPlace: string;
    gates?: number[];
    centers?: any;
    type?: string;
    profile?: string;
    authority?: string;
    strategy?: string;
  } | null>(null);
  const [loadingPerson2, setLoadingPerson2] = useState(false);
  const [person2Error, setPerson2Error] = useState<string | null>(null);
  
  const [chartData, setChartData] = useState<{
    hdChart?: {
      type: string;
      profile: string;
      authority: string;
      strategy: string;
      incarnationCross: string | {
        name: string;
        sunGate: number;
        earthGate: number;
        sunLine: number;
        earthLine: number;
        description?: string;
        lifeTheme?: string;
        purpose?: string;
        challenges?: string;
        gifts?: string;
        affirmation?: string;
      };
      gates?: number[];
      activeGates?: number[];
    };
    user?: {
      hdType?: string;
      profile?: string;
      authority?: string;
    };
    birthData?: {
      birthDate: string;
      birthTime: string;
      birthPlace: string;
    };
    centers?: string[];
    openCenters?: string[];
    gates?: number[];
  } | null>(null);

  // Prüfe, ob Benutzer die Schwelle überschritten hat
  useEffect(() => {
    if (!searchParams) return;
    
    const fromSchwelle = searchParams.get('from') === 'schwelle';
    const sessionThreshold = typeof window !== 'undefined' 
      ? sessionStorage.getItem('hasPassedThreshold') === 'true'
      : false;
    
    if (fromSchwelle || sessionThreshold) {
      setHasPassedThreshold(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = typeof window !== 'undefined' ? UserDataService.getToken() : null;
      const userId = typeof window !== 'undefined' ? UserDataService.getUserId() : null;
      
      if (!token || !userId) {
        setIsAuthenticated(false);
        // Lade trotzdem Chart-Daten für Demo-Zwecke
        await loadDemoChartData();
        // Zeige Onboarding für nicht authentifizierte Benutzer
        const onboardingCompleted = typeof window !== 'undefined' ? localStorage.getItem('human-design-chart-onboarding-completed') : null;
        if (!onboardingCompleted) {
          setShowOnboarding(true);
        }
        return;
      }
      
      setIsAuthenticated(true);
      loadUserName();
      await loadUserSubscription();
      const hasChart = await loadChartData();
      
      // Zeige Onboarding, wenn kein Chart vorhanden ist
      if (!hasChart) {
        const onboardingCompleted = typeof window !== 'undefined' ? localStorage.getItem('human-design-chart-onboarding-completed') : null;
        if (!onboardingCompleted) {
          setShowOnboarding(true);
        }
      }
    };

    checkAuth();
  }, []);

  // Chart Fade-in nach Laden (nach chartData Deklaration)
  useEffect(() => {
    if (chartData?.hdChart) {
      // Chart erscheint nach 400ms (sanftes Fade-in 600-1000ms total)
      const timer = setTimeout(() => {
        setChartVisible(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [chartData]);
  
  // Progressive Öffnung nach Scroll oder Zeit
  useEffect(() => {
    const handleScroll = () => {
      if (!hasScrolled && window.scrollY > 100) {
        setHasScrolled(true);
        // Nach Scroll: Interaktionen nach 2 Sekunden freigeben
        setTimeout(() => {
          setInteractionsEnabled(true);
        }, 2000);
      }
    };
    
    // Alternativ: Nach 10 Sekunden automatisch freigeben
    const autoEnableTimer = setTimeout(() => {
      if (!interactionsEnabled) {
        setInteractionsEnabled(true);
      }
    }, 10000);
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(autoEnableTimer);
    };
  }, [hasScrolled, interactionsEnabled]);

  // Blockiere Body-Scroll wenn Modal geöffnet ist
  useEffect(() => {
    if (showConnectionKeyModal) {
      // Speichere die aktuelle Scroll-Position
      const scrollY = window.scrollY;
      // Blockiere Body-Scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Stelle Body-Scroll wieder her
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showConnectionKeyModal]);

  const loadUserName = async () => {
    try {
      const userId = typeof window !== 'undefined' ? UserDataService.getUserId() : null;
      if (!userId) return;

      // Versuche zuerst aus UserDataService zu laden
      const userData = typeof window !== 'undefined' ? UserDataService.getUserData() : null;
      if (userData) {
        const data = userData;
        if (data.firstName || data.first_name) {
          setUserName(data.firstName || data.first_name || '');
          return;
        }
      }

      // Andernfalls aus Supabase laden
      const { createClient } = await import('@/utils/supabase/client');
      const supabase = createClient();
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
  };

  const loadDemoChartData = async () => {
    try {
      // Verwende Demo-Geburtsdaten für echte Chart-Berechnung
      const response = await fetch('/api/charts/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthDate: '1980-12-08',
          birthTime: '22:10',
          birthPlace: {
            latitude: 49.7036,
            longitude: 9.2654,
            timezone: 'Europe/Berlin',
            name: 'Miltenberg, Deutschland'
          }
        }),
      });

      if (response.ok) {
        const chartResult = await response.json();
        
        const chart = chartResult.chart;
        
        // Speichere die berechneten Daten
        setChartData({
          hdChart: {
            type: chart.type,
            profile: chart.profile,
            authority: chart.authority,
            strategy: chart.strategy,
            incarnationCross: chart.incarnationCross,
            gates: chart.gates || chart.activeGates || [],
            activeGates: chart.gates || chart.activeGates || []
          },
          user: {
            hdType: chart.type,
            profile: chart.profile,
            authority: chart.authority
          },
          birthData: {
            birthDate: '08.12.1980',
            birthTime: '22:10',
            birthPlace: 'Miltenberg, Deutschland'
          },
          centers: chart.definedCenters,
          openCenters: chart.openCenters,
          gates: chart.gates || chart.activeGates || []
        });
      } else {
        console.error('❌ Demo-Chart-Berechnung fehlgeschlagen:', response.status);
      }
    } catch (error) {
      console.error('❌ Fehler beim Laden der Demo-Chart-Daten:', error);
    }
  };

  const loadUserSubscription = async () => {
    try {
      const userData = typeof window !== 'undefined' ? UserDataService.getUserData() : null;
      if (userData) {
        try {
          const user = userData;
          // Subscription-Service wird später implementiert
        } catch (parseError) {
          console.error('JSON.parse Fehler in loadUserSubscription:', parseError);
          localStorage.removeItem('userData');
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Subscription:', error);
      // Lösche ungültige Daten aus localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userData');
      }
    }
  };

  const loadChartData = async (): Promise<boolean> => {
    try {
      const userId = typeof window !== 'undefined' ? UserDataService.getUserId() : null;
      if (!userId) {
        await loadDemoChartData();
        return false;
      }

      // Lade Benutzerdaten aus UserDataService
      const userData = typeof window !== 'undefined' ? UserDataService.getUserData() : null;
      if (!userData) {
        await loadDemoChartData();
        return false;
      }

      try {
        const user = userData as any;

        // Prüfe ob Geburtsdaten vorhanden sind
        if (user.birthDate && user.birthTime && user.birthPlace) {

          try {
            // Parse birthPlace wenn es ein String ist
            let birthPlaceData;
            if (typeof user.birthPlace === 'string') {
              // Extrahiere Stadt/Land aus String
              birthPlaceData = {
                latitude: 52.52, // Default Berlin
                longitude: 13.405,
                timezone: 'Europe/Berlin',
                name: user.birthPlace
              };
            } else {
              birthPlaceData = user.birthPlace;
            }

            // Echte Chart-Berechnung über API
            const response = await fetch('/api/charts/calculate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                birthDate: user.birthDate,
                birthTime: user.birthTime,
                birthPlace: birthPlaceData
              }),
            });

            if (response.ok) {
              const chartResult = await response.json();
              
              const chart = chartResult?.chart;
              
              if (!chart) {
                console.error('❌ Chart-Daten fehlen in der Antwort:', chartResult);
                await loadDemoChartData();
                return false;
              }
              
              // Extrahiere Gates - prüfe verschiedene Formate
              let gates: number[] = [];
              if (Array.isArray(chart.gates)) {
                gates = chart.gates.map((g: any) => typeof g === 'number' ? g : (g?.id || g?.gate || g));
              } else if (Array.isArray(chart.activeGates)) {
                gates = chart.activeGates.map((g: any) => typeof g === 'number' ? g : (g?.id || g?.gate || g));
              } else if (chart.personality && Array.isArray(chart.personality.gates)) {
                gates = chart.personality.gates.map((g: any) => typeof g === 'number' ? g : (g?.id || g?.gate || g));
              }
              
              // Filtere ungültige Werte
              gates = gates.filter((g: any) => typeof g === 'number' && g > 0 && g <= 64);
              
              console.log('📊 Person 1 Chart Gates extracted:', {
                rawGates: chart.gates,
                rawActiveGates: chart.activeGates,
                extractedGates: gates,
                gatesCount: gates.length,
                chartKeys: Object.keys(chart)
              });
              
              // Speichere die berechneten Daten
              setChartData({
                hdChart: {
                  type: chart.type || 'Generator',
                  profile: chart.profile || '1/3',
                  authority: chart.authority || 'Sacral',
                  strategy: chart.strategy || 'Wait to Respond',
                  incarnationCross: chart.incarnationCross || null,
                  gates: gates,
                  activeGates: gates
                },
                user: {
                  hdType: chart.type || 'Generator',
                  profile: chart.profile || '1/3',
                  authority: chart.authority || 'Sacral'
                },
                birthData: {
                  birthDate: user.birthDate,
                  birthTime: user.birthTime,
                  birthPlace: typeof birthPlaceData === 'object' && birthPlaceData?.name ? birthPlaceData.name : (typeof user.birthPlace === 'string' ? user.birthPlace : 'Unbekannt')
                },
                centers: Array.isArray(chart.definedCenters) ? chart.definedCenters : [],
                openCenters: Array.isArray(chart.openCenters) ? chart.openCenters : [],
                gates: gates
              });

              // Speichere mit UserDataService (inkl. personality/design für EnhancedChartVisuals)
              if (typeof window !== 'undefined') {
                // Update auch Geburtsdaten in userData
                UserDataService.updateUserData({
                  birthDate: user.birthDate,
                  birthTime: user.birthTime,
                  birthPlace: typeof birthPlaceData === 'object' && birthPlaceData?.name ? birthPlaceData.name : (typeof user.birthPlace === 'string' ? user.birthPlace : undefined),
                  // Chart-Daten automatisch ins Profil übernehmen
                  hdType: chart.type,
                  hdProfile: chart.profile,
                  hdAuthority: chart.authority,
                  hdStrategy: chart.strategy,
                  hdIncarnationCross: chart.incarnationCross
                });
                
                UserDataService.setChartData({
                  hdType: chart.type,
                  type: chart.type, // Alias für Kompatibilität
                  profile: chart.profile,
                  authority: chart.authority,
                  strategy: chart.strategy,
                  incarnationCross: chart.incarnationCross,
                  definedCenters: chart.definedCenters,
                  openCenters: chart.openCenters,
                  gates: chart.gates || chart.activeGates || [],
                  // Wichtig: personality und design für EnhancedChartVisuals
                  personality: chart.personality,
                  design: chart.design
                });
              }

              return true;
            } else {
              // Versuche detaillierte Fehlermeldung vom Server zu erhalten
              let errorMessage = 'Chart-Berechnung fehlgeschlagen. Verwende Demo-Daten.';
              try {
                const { safeResponseText, safeTextParse } = await import('@/lib/utils/safeJson');
                const errorText = await safeResponseText(response, 'Unknown error');
                const errorData = safeTextParse<{ error?: string; message?: string; details?: any }>(errorText, null);
                
                if (errorData && !('error' in errorData)) {
                  errorMessage = errorData.error || errorData.message || errorMessage;
                  console.error('❌ Chart-Berechnung fehlgeschlagen:', {
                    status: response.status,
                    error: errorMessage,
                    details: errorData.details
                  });
                } else {
                  console.error('❌ Chart-Berechnung fehlgeschlagen:', {
                    status: response.status,
                    errorText: 'error' in errorData ? errorData.error : errorText
                  });
                }
              } catch {
                console.error('❌ Chart-Berechnung fehlgeschlagen:', response.status);
              }
              // Fallback zu Demo-Daten
              await loadDemoChartData();
              return false;
            }
          } catch (chartError) {
            console.error('❌ Fehler bei Chart-Berechnung:', {
              error: chartError,
              message: chartError instanceof Error ? chartError.message : String(chartError),
              stack: chartError instanceof Error ? chartError.stack : undefined
            });
            // Fallback zu Demo-Daten
            await loadDemoChartData();
            return false;
          }
        } else {
          await loadDemoChartData();
          return false;
        }
      } catch (parseError) {
        console.error('❌ JSON Parse Fehler:', parseError);
        await loadDemoChartData();
        return false;
      }
    } catch (error) {
      console.error('❌ Fehler beim Laden der Chart-Daten:', error);
      // Fallback zu Demo-Daten
      await loadDemoChartData();
      return false;
    }
  };

  const handleCreateChart = async () => {
    setCalculatingChart(true);
    setChartFormError(null);

    try {
      if (!chartFormData.birthDate || !chartFormData.birthTime || !chartFormData.birthPlace) {
        setChartFormError('Bitte fülle alle Felder aus.');
        setCalculatingChart(false);
        return;
      }

      let birthPlaceData;
      if (typeof chartFormData.birthPlace === 'string') {
        birthPlaceData = {
          latitude: 52.52,
          longitude: 13.405,
          timezone: 'Europe/Berlin',
          name: chartFormData.birthPlace
        };
      } else {
        birthPlaceData = chartFormData.birthPlace;
      }

      const response = await fetch('/api/charts/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: chartFormData.birthDate,
          birthTime: chartFormData.birthTime,
          birthPlace: birthPlaceData
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Fehler beim Berechnen des Charts' }));
        throw new Error(errorData.error || 'Fehler beim Berechnen des Charts');
      }

      const chartResult = await response.json();
      const chart = chartResult?.chart;

      if (!chart) {
        throw new Error('Chart-Daten konnten nicht berechnet werden');
      }

      // Speichere Geburtsdaten und Chart-Daten mit UserDataService
      if (typeof window !== 'undefined') {
        // Update UserData mit Geburtsdaten und Chart-Daten (Merge-Mechanismus)
        UserDataService.updateUserData({
          birthDate: chartFormData.birthDate,
          birthTime: chartFormData.birthTime,
          birthPlace: chartFormData.birthPlace,
          // Chart-Daten automatisch ins Profil übernehmen
          hdType: chart.type,
          hdProfile: chart.profile,
          hdAuthority: chart.authority,
          hdStrategy: chart.strategy,
          hdIncarnationCross: chart.incarnationCross
        });
        
        // Speichere Chart-Daten auch separat für Kompatibilität (inkl. personality/design für EnhancedChartVisuals)
        UserDataService.setChartData({
          hdType: chart.type,
          type: chart.type, // Alias für Kompatibilität
          profile: chart.profile,
          authority: chart.authority,
          strategy: chart.strategy,
          incarnationCross: chart.incarnationCross,
          definedCenters: chart.definedCenters,
          openCenters: chart.openCenters,
          gates: chart.gates || chart.activeGates || [],
          // Wichtig: personality und design für EnhancedChartVisuals
          personality: chart.personality,
          design: chart.design
        });
        
        console.log('✅ Geburtsdaten und Chart-Daten ins Profil übernommen');
        
        // Speichere Chart-Daten auch in Supabase (dauerhaft)
        try {
          const token = UserDataService.getToken();
          const userEmail = UserDataService.getEmail();
          
          if (token && userEmail) {
            const profileResponse = await fetch('/api/user/profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                email: userEmail,
                birthDate: chartFormData.birthDate,
                birthTime: chartFormData.birthTime,
                birthPlace: chartFormData.birthPlace,
                hdType: chart.type,
                hdProfile: chart.profile,
                hdAuthority: chart.authority,
                hdStrategy: chart.strategy,
                hdIncarnationCross: chart.incarnationCross,
              }),
            });
            
            if (profileResponse.ok) {
              console.log('✅ Chart-Daten in Supabase gespeichert');
            } else {
              console.warn('⚠️ Chart-Daten konnten nicht in Supabase gespeichert werden, aber localStorage ist OK');
            }
          }
        } catch (supabaseError) {
          console.warn('⚠️ Fehler beim Speichern in Supabase (nicht kritisch):', supabaseError);
        }
      }

      // Lade Chart-Daten neu
      await loadChartData();
      setShowChartForm(false);
      setShowOnboarding(false);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('human-design-chart-onboarding-completed', 'true');
      }
    } catch (err: any) {
      console.error('Fehler beim Erstellen des Charts:', err);
      setChartFormError(err.message || 'Fehler beim Berechnen des Charts');
    } finally {
      setCalculatingChart(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Konvertiere Chart-Daten in DefinedState für Bodygraph-Komponente
  const convertChartToDefinedState = (): DefinedState | null => {
    if (!chartData?.hdChart) return null;

    const defined: DefinedState = {
      centers: {},
      gates: {},
      channels: {}
    };

    const chart = chartData.hdChart;

    // Zentren-Mapping
    const centerNameToId: Record<string, CenterId> = {
      'Head': 'HEAD',
      'Ajna': 'AJNA',
      'Throat': 'THROAT',
      'G': 'G',
      'G-Center': 'G',
      'Heart': 'HEART',
      'Heart/Ego': 'HEART',
      'Ego': 'HEART',
      'Sacral': 'SACRAL',
      'Spleen': 'SPLEEN',
      'Solar': 'SOLAR',
      'Solar Plexus': 'SOLAR',
      'Root': 'ROOT',
    };

    // Zentren: Prüfe ob definedCenters vorhanden sind
    if (chartData.centers && Array.isArray(chartData.centers)) {
      chartData.centers.forEach((centerName: string) => {
        const centerId = centerNameToId[centerName];
        if (centerId) {
          defined.centers![centerId] = true;
        }
      });
    }

    // Gates: API gibt Array von Zahlen zurück
    const gates = chart.gates || chart.activeGates || [];
    if (Array.isArray(gates)) {
      gates.forEach((gate: number | { id: number; gate: number }) => {
        const gateId = typeof gate === 'number' ? gate : (gate.id || gate.gate);
        if (gateId && gateId >= 1 && gateId <= 64) {
          defined.gates![gateId] = true;
        }
      });
    }

    // Kanäle: Berechne aus definierten Gates
    if (defined.gates) {
      const activeGates = Object.keys(defined.gates).map(Number);
      const CHANNELS = [
        [1, 8], [2, 14], [3, 60], [4, 63], [5, 15], [6, 59], [7, 31], [9, 52],
        [10, 20], [10, 34], [10, 57], [11, 56], [12, 22], [13, 33], [16, 48],
        [17, 62], [18, 58], [19, 49], [20, 34], [20, 57], [21, 45], [23, 43],
        [24, 61], [25, 51], [26, 44], [27, 50], [28, 38], [29, 46], [30, 41],
        [32, 54], [35, 36], [37, 40], [39, 55], [42, 53], [47, 64]
      ];
      
      CHANNELS.forEach(([gate1, gate2]) => {
        if (activeGates.includes(gate1) && activeGates.includes(gate2)) {
          const channelId = `${gate1}-${gate2}`;
          defined.channels![channelId] = true;
        }
      });
    }

    return defined;
  };

  const recalculateChart = async () => {
    setRecalculating(true);
    try {
      await loadChartData();
    } finally {
      setRecalculating(false);
    }
  };

  // Funktion zum Berechnen von Person 2 Chart für Connection Key Analyse
  const calculatePerson2Chart = async (birthDate: string, birthTime: string, birthPlace: string, name: string) => {
    setLoadingPerson2(true);
    setPerson2Error(null);
    
    try {
      // Validierung der Eingaben
      if (!birthDate || !birthTime || !birthPlace || !name) {
        setPerson2Error('Bitte fülle alle Felder aus.');
        setLoadingPerson2(false);
        return;
      }

      // Validiere Datumsformat
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(birthDate)) {
        setPerson2Error('Bitte gib ein gültiges Geburtsdatum im Format JJJJ-MM-TT ein.');
        setLoadingPerson2(false);
        return;
      }

      // Validiere Zeitformat
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(birthTime)) {
        setPerson2Error('Bitte gib eine gültige Geburtszeit im Format HH:MM ein.');
        setLoadingPerson2(false);
        return;
      }

      let birthPlaceData;
      if (typeof birthPlace === 'string') {
        birthPlaceData = {
          latitude: 52.52,
          longitude: 13.405,
          timezone: 'Europe/Berlin',
          name: birthPlace
        };
      } else {
        birthPlaceData = birthPlace;
      }

      const response = await fetch('/api/charts/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthDate,
          birthTime,
          birthPlace: birthPlaceData
        }),
      });

      if (response.ok) {
        const chartResult = await response.json();
        const chart = chartResult.chart;
        
        if (!chart) {
          setPerson2Error('Chart-Daten konnten nicht geladen werden. Bitte versuche es erneut.');
          return;
        }
        
        // Extrahiere Gates - prüfe verschiedene Formate
        let gates: number[] = [];
        if (Array.isArray(chart.gates)) {
          gates = chart.gates.map((g: any) => typeof g === 'number' ? g : (g?.id || g?.gate || g));
        } else if (Array.isArray(chart.activeGates)) {
          gates = chart.activeGates.map((g: any) => typeof g === 'number' ? g : (g?.id || g?.gate || g));
        } else if (chart.personality && Array.isArray(chart.personality.gates)) {
          gates = chart.personality.gates.map((g: any) => typeof g === 'number' ? g : (g?.id || g?.gate || g));
        }
        
        // Filtere ungültige Werte
        gates = gates.filter((g: any) => typeof g === 'number' && g > 0 && g <= 64);
        
        console.log('📊 Person 2 Chart Data:', {
          rawGates: chart.gates,
          rawActiveGates: chart.activeGates,
          extractedGates: gates,
          gatesCount: gates.length,
          gatesArray: gates.slice(0, 10), // Erste 10 für Debug
          type: chart.type,
          profile: chart.profile,
          definedCenters: chart.definedCenters,
          chartKeys: Object.keys(chart)
        });
        
        // Konvertiere Centers zu CenterStatus Format
        // Sicherstellen, dass definedCenters ein Array ist
        const definedCentersArray = Array.isArray(chart.definedCenters) ? chart.definedCenters : [];
        
        const centers: any = {
          krone: definedCentersArray.includes('Head') || definedCentersArray.includes('HEAD') ? 'definiert' : 'undefiniert',
          ajna: definedCentersArray.includes('Ajna') || definedCentersArray.includes('AJNA') ? 'definiert' : 'undefiniert',
          kehle: definedCentersArray.includes('Throat') || definedCentersArray.includes('THROAT') ? 'definiert' : 'undefiniert',
          gZentrum: definedCentersArray.includes('G') || definedCentersArray.includes('G_CENTER') ? 'definiert' : 'undefiniert',
          herzEgo: definedCentersArray.includes('Heart') || definedCentersArray.includes('HEART') ? 'definiert' : 'undefiniert',
          sakral: definedCentersArray.includes('Sacral') || definedCentersArray.includes('SACRAL') ? 'definiert' : 'undefiniert',
          solarplexus: definedCentersArray.includes('Solar') || definedCentersArray.includes('SOLAR') ? 'definiert' : 'undefiniert',
          milz: definedCentersArray.includes('Spleen') || definedCentersArray.includes('SPLEEN') ? 'definiert' : 'undefiniert',
          wurzel: definedCentersArray.includes('Root') || definedCentersArray.includes('ROOT') ? 'definiert' : 'undefiniert',
        };
        
        const person2DataToSet = {
          name,
          birthDate,
          birthTime,
          birthPlace,
          gates,
          centers,
          type: chart.type,
          profile: chart.profile,
          authority: chart.authority,
          strategy: chart.strategy
        };
        
        console.log('✅ Setting Person 2 Data:', {
          name,
          gatesCount: gates.length,
          centers,
          type: chart.type
        });
        
        setPerson2Data(person2DataToSet);
        
        setShowConnectionKeyModal(true);
      } else {
        // Versuche detaillierte Fehlermeldung vom Server zu erhalten
        let errorMessage = 'Fehler beim Berechnen des Charts. Bitte überprüfe die Eingaben.';
        let errorDetails: any = null;
        
        try {
          const { safeResponseText, safeTextParse } = await import('@/lib/utils/safeJson');
          const errorText = await safeResponseText(response, 'Unknown error');
          const errorData = safeTextParse<{ error?: string; message?: string; details?: any }>(errorText, null);
          
          if (errorData && !('error' in errorData)) {
            errorMessage = errorData.error || errorData.message || errorMessage;
            errorDetails = errorData.details;
            
            // Übersetze häufige Fehlermeldungen ins Deutsche
            if (errorMessage.includes('Invalid date') || errorMessage.includes('date')) {
              errorMessage = 'Ungültiges Datumsformat. Bitte verwende das Format JJJJ-MM-TT (z.B. 1990-05-15).';
            } else if (errorMessage.includes('Invalid time') || errorMessage.includes('time')) {
              errorMessage = 'Ungültiges Zeitformat. Bitte verwende das Format HH:MM (z.B. 14:30).';
            } else if (errorMessage.includes('latitude') || errorMessage.includes('longitude') || errorMessage.includes('location')) {
              errorMessage = 'Ungültige Ortsangabe. Bitte überprüfe den Geburtsort.';
            } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('ECONNREFUSED')) {
              errorMessage = 'Verbindungsfehler. Bitte überprüfe deine Internetverbindung und versuche es erneut.';
            } else if (errorMessage.includes('required')) {
              errorMessage = 'Bitte fülle alle erforderlichen Felder aus (Datum, Zeit, Ort).';
            }
            
            console.error('❌ Chart-Berechnung fehlgeschlagen:', {
              status: response.status,
              error: errorMessage,
              details: errorDetails,
              requestData: { birthDate, birthTime, birthPlace: birthPlaceData }
            });
          } else {
            errorMessage = `HTTP ${response.status}: ${errorText || errorMessage}`;
            console.error('❌ Chart-Berechnung fehlgeschlagen (nicht-JSON Antwort):', {
              status: response.status,
              errorText
            });
          }
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${errorMessage}`;
          console.error('❌ Fehler beim Parsen der Fehlerantwort:', parseError);
        }
        
        setPerson2Error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Fehler beim Berechnen von Person 2 Chart:', {
        error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        requestData: { birthDate, birthTime, birthPlace }
      });
      
      let errorMessage = 'Fehler beim Berechnen des Charts. Bitte versuche es erneut.';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage = 'Verbindungsfehler. Bitte überprüfe deine Internetverbindung.';
        } else if (error.message.includes('JSON')) {
          errorMessage = 'Ungültige Antwort vom Server. Bitte versuche es später erneut.';
        } else {
          errorMessage = `Fehler: ${error.message}`;
        }
      }
      
      setPerson2Error(errorMessage);
    } finally {
      setLoadingPerson2(false);
    }
  };

  // Berechne Centers aus echten Chart-Daten
  const calculateCentersFromChart = () => {
    if (!chartData) return null;
    
    const definedCentersArray = Array.isArray(chartData.centers) ? chartData.centers : [];
    const openCentersArray = Array.isArray(chartData.openCenters) ? chartData.openCenters : [];
    const gates = chartData.gates || chartData.hdChart?.gates || [];
    
    return {
      head: {
        defined: definedCentersArray.includes('Head') || definedCentersArray.includes('HEAD'),
        color: '#fbbf24',
        gates: gates.filter((g: number) => [64, 61, 63].includes(g)).map(String),
        description: 'Das Kopf-Zentrum ist das Zentrum der Inspiration und des mentalen Drucks. Es ist verantwortlich für Fragen und Zweifel.'
      },
      ajna: {
        defined: definedCentersArray.includes('Ajna') || definedCentersArray.includes('AJNA'),
        color: '#8b5cf6',
        gates: gates.filter((g: number) => [47, 24, 4, 17, 43, 11].includes(g)).map(String),
        description: 'Das Ajna-Zentrum ist das Zentrum der Konzeptualisierung und des Bewusstseins. Es verarbeitet Informationen und schafft Konzepte.'
      },
      throat: {
        defined: definedCentersArray.includes('Throat') || definedCentersArray.includes('THROAT'),
        color: '#06b6d4',
        gates: gates.filter((g: number) => [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16].includes(g)).map(String),
        description: 'Das Kehlkopf-Zentrum ist das Zentrum der Manifestation und Kommunikation. Es ist verantwortlich für Sprechen und Handeln.'
      },
      g: {
        defined: definedCentersArray.includes('G') || definedCentersArray.includes('G_CENTER'),
        color: '#10b981',
        gates: gates.filter((g: number) => [7, 1, 13, 10, 15, 2, 46, 25].includes(g)).map(String),
        description: 'Das G-Zentrum ist das Zentrum der Identität und Richtung. Es ist verantwortlich für Liebe, Richtung und Identität.'
      },
      heart: {
        defined: definedCentersArray.includes('Heart') || definedCentersArray.includes('HEART'),
        color: '#ef4444',
        gates: gates.filter((g: number) => [21, 40, 26, 51].includes(g)).map(String),
        description: 'Das Herz-Zentrum ist das Zentrum des Willens und der Kraft. Es ist verantwortlich für Ego und Willenskraft.'
      },
      spleen: {
        defined: definedCentersArray.includes('Spleen') || definedCentersArray.includes('SPLEEN'),
        color: '#f59e0b',
        gates: gates.filter((g: number) => [48, 57, 44, 50, 32, 28, 18].includes(g)).map(String),
        description: 'Das Milz-Zentrum ist das Zentrum der Intuition und des Überlebens. Es ist verantwortlich für Angst und Intuition.'
      },
      sacral: {
        defined: definedCentersArray.includes('Sacral') || definedCentersArray.includes('SACRAL'),
        color: '#ec4899',
        gates: gates.filter((g: number) => [5, 14, 29, 59, 9, 3, 42, 27, 34].includes(g)).map(String),
        description: 'Das Sakral-Zentrum ist das Zentrum der Lebenskraft und Sexualität. Es ist verantwortlich für Energie und Vitalität.'
      },
      root: {
        defined: definedCentersArray.includes('Root') || definedCentersArray.includes('ROOT'),
        color: '#dc2626',
        gates: gates.filter((g: number) => [53, 60, 52, 19, 39, 41, 58, 38, 54].includes(g)).map(String),
        description: 'Das Wurzel-Zentrum ist das Zentrum des Drucks und der Adrenalinproduktion. Es ist verantwortlich für Stress und Druck.'
      },
      solar: {
        defined: definedCentersArray.includes('Solar') || definedCentersArray.includes('SOLAR'),
        color: '#f97316',
        gates: gates.filter((g: number) => [6, 37, 22, 36, 30, 55, 49].includes(g)).map(String),
        description: 'Das Solarplexus-Zentrum ist das Zentrum der Emotionen und des Bewusstseins. Es ist verantwortlich für Emotionen und Bewusstsein.'
      }
    };
  };

  // Übersetze Strategie und Autorität ins Deutsche
  const translateStrategy = (strategy: string | undefined): string => {
    if (!strategy) return 'Warten auf die Antwort';
    const translations: { [key: string]: string } = {
      'Wait to Respond': 'Warten auf die Antwort',
      'Wait for the Response': 'Warten auf die Antwort',
      'Wait': 'Warten',
      'Inform': 'Informieren',
      'Wait to Respond, then Inform': 'Warten auf die Antwort, dann informieren',
      'Wait for Invitation': 'Warten auf Einladung',
      'Wait for Recognition': 'Warten auf Anerkennung',
      'Surrender': 'Sich ergeben',
      'Surrender and Wait': 'Sich ergeben und warten'
    };
    return translations[strategy] || strategy;
  };

  const translateAuthority = (authority: string | undefined): string => {
    if (!authority) return 'Sakral-Autorität';
    const translations: { [key: string]: string } = {
      'Sacral': 'Sakral-Autorität',
      'Sakral': 'Sakral-Autorität',
      'Emotional': 'Emotionale Autorität',
      'Emotional-Solar': 'Emotionale Autorität',
      'Splenic': 'Milz-Autorität',
      'Spleen': 'Milz-Autorität',
      'Ego': 'Herz-Ego-Autorität',
      'Heart': 'Herz-Ego-Autorität',
      'Self-Projected': 'Selbstprojizierte Autorität',
      'G': 'G-Zentrum-Autorität',
      'G-Center': 'G-Zentrum-Autorität',
      'Mental': 'Mentale Autorität',
      'No Inner Authority': 'Keine innere Autorität',
      'Outer Authority': 'Äußere Autorität'
    };
    return translations[authority] || authority;
  };

  // Echte Chart-Daten mit Fallback zu Mock-Daten nur wenn keine Daten vorhanden
  const calculatedCenters = calculateCentersFromChart();
  const chartInfo = {
    hdType: chartData?.hdChart?.type || chartData?.user?.hdType || 'Manifesting Generator',
    profile: chartData?.hdChart?.profile || chartData?.user?.profile || '5/1',
    authority: translateAuthority(chartData?.hdChart?.authority || chartData?.user?.authority || 'Sacral'),
    strategy: translateStrategy(chartData?.hdChart?.strategy || 'Wait to Respond'),
    incarnationCross: chartData?.hdChart?.incarnationCross || {
      name: 'Right Angle Cross of the Sleeping Phoenix',
      sunGate: 1,
      earthGate: 2,
      sunLine: 1,
      earthLine: 1,
      description: 'Dein Inkarnationskreuz zeigt deine Lebensaufgabe und deinen höheren Zweck.',
      lifeTheme: 'Individuelle Lebensaufgabe',
      purpose: 'Deine einzigartige Lebensaufgabe zu erfüllen',
      challenges: 'Deine wahre Natur zu leben',
      gifts: 'Einzigartige Gaben und Talente',
      affirmation: 'Ich lebe meine einzigartige Lebensaufgabe'
    },
    centers: calculatedCenters || {
      head: {
        defined: true,
        color: '#fbbf24',
        gates: ['1', '2', '3'],
        description: 'Das Kopf-Zentrum ist das Zentrum der Inspiration und des mentalen Drucks. Es ist verantwortlich für Fragen und Zweifel.'
      },
      ajna: {
        defined: true,
        color: '#8b5cf6',
        gates: ['4', '5', '6'],
        description: 'Das Ajna-Zentrum ist das Zentrum der Konzeptualisierung und des Bewusstseins. Es verarbeitet Informationen und schafft Konzepte.'
      },
      throat: {
        defined: false,
        color: '#06b6d4',
        gates: [],
        description: 'Das Kehlkopf-Zentrum ist das Zentrum der Manifestation und Kommunikation. Es ist verantwortlich für Sprechen und Handeln.'
      },
      g: {
        defined: true,
        color: '#10b981',
        gates: ['7', '8', '9'],
        description: 'Das G-Zentrum ist das Zentrum der Identität und Richtung. Es ist verantwortlich für Liebe, Richtung und Identität.'
      },
      heart: {
        defined: false,
        color: '#ef4444',
        gates: [],
        description: 'Das Herz-Zentrum ist das Zentrum des Willens und der Kraft. Es ist verantwortlich für Ego und Willenskraft.'
      },
      spleen: {
        defined: true,
        color: '#f59e0b',
        gates: ['10', '11', '12'],
        description: 'Das Milz-Zentrum ist das Zentrum der Intuition und des Überlebens. Es ist verantwortlich für Angst und Intuition.'
      },
      sacral: {
        defined: true,
        color: '#ec4899',
        gates: ['13', '14', '15'],
        description: 'Das Sakral-Zentrum ist das Zentrum der Lebenskraft und Sexualität. Es ist verantwortlich für Energie und Vitalität.'
      },
      root: {
        defined: false,
        color: '#dc2626',
        gates: [],
        description: 'Das Wurzel-Zentrum ist das Zentrum des Drucks und der Adrenalinproduktion. Es ist verantwortlich für Stress und Druck.'
      },
      solar: {
        defined: true,
        color: '#f97316',
        gates: ['16', '17', '18'],
        description: 'Das Solarplexus-Zentrum ist das Zentrum der Emotionen und des Bewusstseins. Es ist verantwortlich für Emotionen und Bewusstsein.'
      }
    },
    channels: [
      { from: 1, to: 8, active: true, name: 'Channel of Inspiration' },
      { from: 2, to: 14, active: true, name: 'Channel of the Keeper' },
      { from: 3, to: 60, active: false, name: 'Channel of Mutation' },
      { from: 4, to: 63, active: true, name: 'Channel of Logic' }
    ],
    gates: [
      { id: 1, active: true, name: 'The Creative', description: 'Kreative Energie und Inspiration' },
      { id: 2, active: true, name: 'The Keeper', description: 'Bewahrung und Führung' },
      { id: 3, active: false, name: 'The Ordering', description: 'Ordnung und Struktur' },
      { id: 4, active: true, name: 'The Formulater', description: 'Formulierung und Konzeptualisierung' }
    ]
  };

  const typeInfo: Record<string, {
    description: string;
    strategy: string;
    authority: string;
    color: string;
    iconComponent: React.ComponentType<any>;
  }> = {
    'Manifesting Generator': {
      description: 'Manifestierender Generator: Die dynamischen Macher des Human Design Systems. Sie haben die Fähigkeit, sowohl zu initiieren als auch zu reagieren.',
      strategy: 'Warten auf die Antwort, dann informieren',
      authority: 'Sakral-Autorität',
      color: '#f59e0b',
      iconComponent: Zap
    },
    'Manifestierender Generator': {
      description: 'Manifestierender Generator: Die dynamischen Macher des Human Design Systems. Sie haben die Fähigkeit, sowohl zu initiieren als auch zu reagieren.',
      strategy: 'Warten auf die Antwort, dann informieren',
      authority: 'Sakral-Autorität',
      color: '#f59e0b',
      iconComponent: Zap
    },
    'Generator': {
      description: 'Generator: Die Lebenskraft des Planeten. Sie sind hier, um zu arbeiten und zu erschaffen.',
      strategy: 'Warten auf die Antwort',
      authority: 'Sakral-Autorität',
      color: '#10b981',
      iconComponent: Activity
    },
    'Projector': {
      description: 'Projektor: Die natürlichen Führer und Berater. Sie sind hier, um andere zu führen und zu beraten.',
      strategy: 'Warten auf die Einladung',
      authority: 'Emotionale oder andere Autorität',
      color: '#F29F05',
      iconComponent: Target
    },
    'Projektor': {
      description: 'Projektor: Die natürlichen Führer und Berater. Sie sind hier, um andere zu führen und zu beraten.',
      strategy: 'Warten auf die Einladung',
      authority: 'Emotionale oder andere Autorität',
      color: '#F29F05',
      iconComponent: Target
    },
    'Manifestor': {
      description: 'Manifestor: Die Initiatoren. Sie sind hier, um Dinge in Bewegung zu setzen.',
      strategy: 'Informieren',
      authority: 'Emotionale oder andere Autorität',
      color: '#ef4444',
      iconComponent: Crown
    },
    'Reflector': {
      description: 'Reflektor: Die Spiegel der Gemeinschaft. Sie reflektieren die Gesundheit der Gemeinschaft.',
      strategy: 'Warten auf den Mondzyklus',
      authority: 'Mond-Autorität',
      color: '#06b6d4',
      iconComponent: Moon
    },
    'Reflektor': {
      description: 'Reflektor: Die Spiegel der Gemeinschaft. Sie reflektieren die Gesundheit der Gemeinschaft.',
      strategy: 'Warten auf den Mondzyklus',
      authority: 'Mond-Autorität',
      color: '#06b6d4',
      iconComponent: Moon
    }
  };

  // Normalisiere den Typ-Namen für die Suche (unterstützt sowohl englische als auch deutsche Namen)
  const normalizeTypeName = (type: string): keyof typeof typeInfo => {
    const typeMap: Record<string, keyof typeof typeInfo> = {
      'Manifesting Generator': 'Manifesting Generator',
      'Manifestierender Generator': 'Manifestierender Generator',
      'Generator': 'Generator',
      'Manifestor': 'Manifestor',
      'Projector': 'Projektor',
      'Projektor': 'Projektor',
      'Reflector': 'Reflektor',
      'Reflektor': 'Reflektor'
    };
    return typeMap[type] || 'Manifesting Generator';
  };
  
  // Übersetze Typ-Namen ins Deutsche für die Anzeige
  const getDisplayTypeName = (type: string): string => {
    const typeDisplayMap: Record<string, string> = {
      'Manifesting Generator': 'Manifestierender Generator',
      'Manifestierender Generator': 'Manifestierender Generator',
      'Generator': 'Generator',
      'Manifestor': 'Manifestor',
      'Projector': 'Projektor',
      'Projektor': 'Projektor',
      'Reflector': 'Reflektor',
      'Reflektor': 'Reflektor'
    };
    return typeDisplayMap[type] || type;
  };
  
  // Berechne Type Info basierend auf chartInfo (direkt nach typeInfo Definition)
  // chartInfo ist immer definiert durch Fallback-Werte in der Definition
  const hdType = chartInfo?.hdType || 'Manifesting Generator';
  const currentTypeInfo = typeInfo[normalizeTypeName(hdType)] || typeInfo['Manifesting Generator'];
  const displayTypeName = getDisplayTypeName(hdType);

  // Zeige die Seite auch ohne Authentifizierung (mit Demo-Daten oder Onboarding)
  // Die Authentifizierung wird nur für das Speichern von Daten benötigt

  return (
    <AccessControl
      path="/human-design-chart"
      userSubscription={userSubscription}
      onUpgrade={() => window.location.href = '/subscription'}
    >
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
        
        {/* Fixed Navigation - DEAKTIVIERT */}
        {/* <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(15, 15, 35, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)'
        }}>
          <Container maxWidth="lg">
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2
            }}>
              <Typography
                component={Link}
                href="/"
                variant="h5"
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                  textDecoration: 'none',
                  cursor: 'pointer'
                }}
              >
                🔑 The Connection Key
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  component={Link}
                  href="/energetische-signatur"
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: 'rgba(242, 159, 5, 0.5)',
                      backgroundColor: 'rgba(242, 159, 5, 0.1)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Info
                </Button>
                <Button
                  component={Link}
                  href="/dashboard"
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 15px rgba(242, 159, 5, 0.3)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Dashboard
                </Button>
              </Box>
            </Box>
          </Container>
        </Box> */}
        
        <PageLayout activePage="dashboard" showLogo={true}>
          <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, sm: 3 } }}>
            {/* Der Vorhof - Sanfte Annäherung (nur wenn Schwelle noch nicht überschritten) */}
            {!hasPassedThreshold && (
            <Box sx={{ mb: { xs: 5, md: 8 } }}>
              {/* Hero-Bereich */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: 12, 
                  mt: { xs: -3, md: -5 },
                  px: { xs: 2, md: 0 }
                }}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 900,
                      mb: 3,
                      fontSize: { xs: '2rem', md: '3.5rem' },
                      color: 'white',
                      lineHeight: 1.2,
                    }}
                  >
                    Deine energetische Signatur
                    <br />
                    <Box
                      component="span"
                      sx={{
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      deines Human Design
                    </Box>
                  </Typography>
                  
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      mb: 2,
                      maxWidth: { xs: '100%', md: 900 },
                      mx: 'auto',
                      px: { xs: 2, md: 0 },
                      lineHeight: 1.6,
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.4rem' },
                      fontWeight: 600,
                    }}
                  >
                    <strong>Human Design</strong> zeigt dir, was wirklich in dir passiert – unsichtbar, aber spürbar.
                  </Typography>
                  
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      mb: 4,
                      maxWidth: { xs: '100%', md: 800 },
                      mx: 'auto',
                      px: { xs: 2, md: 0 },
                      lineHeight: 1.7,
                      fontSize: { xs: '0.95rem', md: '1.2rem' },
                      fontWeight: 400,
                    }}
                  >
                    Typ, Strategie, Autorität, Zentren – alles hat eine energetische Signatur.
                  </Typography>
                </Box>
              </motion.div>

              {/* Begleitender Text - Einladung */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box sx={{
                  maxWidth: 700,
                  mx: 'auto',
                  mb: { xs: 5, md: 6 },
                  px: { xs: 2, md: 0 }
                }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.75)',
                      mb: 3,
                      maxWidth: { xs: '100%', md: 900 },
                      mx: 'auto',
                      px: { xs: 2, md: 0 },
                      lineHeight: 1.8,
                      fontSize: { xs: '0.9rem', md: '1.1rem' },
                    }}
                  >
                    Statt zu raten, wer du sein sollst oder warum du dich so fühlst, macht <strong>Human Design deine energetische Signatur sichtbar</strong> – basierend auf deinem Geburtsdatum, deiner Geburtszeit und deinem Geburtsort.
                  </Typography>
                </Box>
              </motion.div>

              {/* Innere Fragen - Resonanz */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Box sx={{
                  maxWidth: 800,
                  mx: 'auto',
                  mb: { xs: 5, md: 6 },
                  px: { xs: 2, md: 0 }
                }}>
                  <Box sx={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(242, 159, 5, 0.15)',
                    borderRadius: 3,
                    p: { xs: 3, md: 4 }
                  }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.75)',
                        fontSize: { xs: '0.9rem', md: '1.1rem' },
                        lineHeight: 1.8,
                        textAlign: 'center',
                        mb: 3,
                      }}
                    >
                      Vielleicht fragst du dich:
                    </Typography>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 2.5,
                      textAlign: 'left'
                    }}>
                      {[
                        'Wo folgst du nicht dir?',
                        'Wo reagierst du statt zu vertrauen?',
                        'Wo versuchst du, jemand zu sein?'
                      ].map((question, index) => (
                        <Typography
                          key={index}
                          variant="body1"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.75)',
                            fontSize: { xs: '0.9rem', md: '1.1rem' },
                            lineHeight: 1.8,
                            pl: 3,
                            position: 'relative',
                            '&::before': {
                              content: '"—"',
                              position: 'absolute',
                              left: 0,
                              color: 'rgba(242, 159, 5, 0.5)'
                            }
                          }}
                        >
                          {question}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </motion.div>

              {/* Sanfte CTA - Keine Hektik */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Box sx={{ 
                  textAlign: 'center',
                  maxWidth: 600,
                  mx: 'auto',
                  px: { xs: 2, md: 0 }
                }}>
                  <Button
                    component={Link}
                    href="/human-design-chart/schwelle"
                    variant="outlined"
                    sx={{
                      borderColor: 'rgba(242, 159, 5, 0.4)',
                      color: 'rgba(255, 255, 255, 0.9)',
                      px: { xs: 4, md: 6 },
                      py: { xs: 1.5, md: 2 },
                      borderRadius: 2,
                      fontWeight: 300,
                      textTransform: 'none',
                      fontSize: { xs: '0.95rem', md: '1.05rem' },
                      width: { xs: '100%', sm: 'auto' },
                      minWidth: { xs: '100%', sm: 280 },
                      transition: 'all 0.4s ease',
                      '&:hover': {
                        borderColor: 'rgba(242, 159, 5, 0.6)',
                        backgroundColor: 'rgba(242, 159, 5, 0.05)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Bereit zu schauen
                  </Button>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.75)',
                      fontSize: { xs: '0.9rem', md: '1.1rem' },
                      display: 'block',
                      mt: 3,
                      lineHeight: 1.8,
                    }}
                  >
                    Nimm dir die Zeit, die du brauchst.
                    <br />
                    Dieser Raum wartet auf dich.
                  </Typography>
                </Box>
              </motion.div>
            </Box>
            )}

          {/* Die Heiligen Hallen - Stiller Offenbarungsraum (nur nach Schwelle) */}
          {chartData?.hdChart && hasPassedThreshold && (
            <Box sx={{ mb: { xs: 6, md: 8 } }}>
              {/* Einstieg - Ankommen im Raum */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Box sx={{ 
                  textAlign: 'center', 
                  mb: { xs: 4, md: 6 },
                  px: { xs: 2, md: 0 }
                }}>
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      mb: 2,
                      maxWidth: { xs: '100%', md: 900 },
                      mx: 'auto',
                      px: { xs: 2, md: 0 },
                      lineHeight: 1.6,
                      fontSize: { xs: '1rem', sm: '1.1rem', md: '1.4rem' },
                      fontWeight: 600,
                    }}
                  >
                    Dies ist deine energetische Signatur.
                    <br />
                    Sie erklärt dich nicht.
                    <br />
                    Sie erinnert dich.
                  </Typography>
                </Box>
              </motion.div>

              {/* Chart-Erscheinung (zentraler Moment) */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: chartVisible ? 1 : 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: { xs: 500, md: 700 },
                  mb: { xs: 4, md: 6 },
                  position: 'relative',
                  // Keine Interaktionen beim Erstkontakt
                  '& svg': {
                    pointerEvents: interactionsEnabled ? 'auto' : 'none',
                    userSelect: 'none',
                    cursor: interactionsEnabled ? 'pointer' : 'default',
                  },
                  // Verhindere alle Interaktionen wenn nicht aktiviert
                  ...(!interactionsEnabled && {
                    '& *': {
                      pointerEvents: 'none',
                    }
                  })
                }}>
                  {chartData && (() => {
                    // Build defined state for Bodygraph
                    const definedCentersArray = Array.isArray(chartData.centers) ? chartData.centers : [];
                    const definedState: DefinedState = {
                      centers: {
                        HEAD: definedCentersArray.includes('Head') || definedCentersArray.includes('HEAD'),
                        AJNA: definedCentersArray.includes('Ajna') || definedCentersArray.includes('AJNA'),
                        THROAT: definedCentersArray.includes('Throat') || definedCentersArray.includes('THROAT'),
                        G: definedCentersArray.includes('G') || definedCentersArray.includes('G_CENTER'),
                        HEART: definedCentersArray.includes('Heart') || definedCentersArray.includes('HEART'),
                        SACRAL: definedCentersArray.includes('Sacral') || definedCentersArray.includes('SACRAL'),
                        SOLAR: definedCentersArray.includes('Solar') || definedCentersArray.includes('SOLAR'),
                        SPLEEN: definedCentersArray.includes('Spleen') || definedCentersArray.includes('SPLEEN'),
                        ROOT: definedCentersArray.includes('Root') || definedCentersArray.includes('ROOT'),
                      }
                    };
                    
                    return (
                      <Bodygraph
                        defined={definedState}
                        width={600}
                        height={800}
                        showLabels={false}
                        showGateNumbers={false}
                        showChannels={true}
                        // Keine Hover-Effekte beim Erstkontakt
                        onElementHover={interactionsEnabled ? (type, id, info) => {
                          setHoveredElement({ type, id, info });
                        } : undefined}
                        onElementLeave={interactionsEnabled ? () => {
                          setHoveredElement(null);
                        } : undefined}
                        // Keine Interaktionen beim Erstkontakt
                        showDefinedOnly={false}
                      />
                    );
                  })()}
                </Box>
              </motion.div>

              {/* Begleittext */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: chartVisible ? 1 : 0, y: chartVisible ? 0 : 20 }}
                transition={{ duration: 0.8, delay: 1.0 }}
              >
                <Box sx={{
                  maxWidth: 600,
                  mx: 'auto',
                  mb: { xs: 4, md: 5 },
                  textAlign: 'center',
                  px: { xs: 2, md: 0 }
                }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.75)',
                      mb: 3,
                      maxWidth: { xs: '100%', md: 900 },
                      mx: 'auto',
                      px: { xs: 2, md: 0 },
                      lineHeight: 1.8,
                      fontSize: { xs: '0.9rem', md: '1.1rem' },
                    }}
                  >
                    Betrachte, ohne einzuordnen.
                    <br />
                    Dein Körper erkennt mehr als dein Verstand.
                  </Typography>
                </Box>
              </motion.div>

              {/* Progressive Öffnung - Hinweis */}
              {!interactionsEnabled && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: chartVisible ? 1 : 0 }}
                  transition={{ duration: 0.8, delay: 1.5 }}
                >
                  <Box sx={{
                    maxWidth: 500,
                    mx: 'auto',
                    textAlign: 'center',
                    px: { xs: 2, md: 0 }
                  }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.75)',
                        fontSize: { xs: '0.9rem', md: '1.1rem' },
                        lineHeight: 1.8,
                      }}
                    >
                      Wenn du bereit bist, kannst du tiefer gehen.
                    </Typography>
                  </Box>
                </motion.div>
              )}

              {/* Optionaler CTA - Nur wenn Interaktionen freigegeben */}
              {interactionsEnabled && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Box sx={{ 
                    textAlign: 'center',
                    maxWidth: 400,
                    mx: 'auto',
                    mt: { xs: 4, md: 5 },
                    px: { xs: 2, md: 0 }
                  }}>
                    <Button
                      onClick={() => {
                        // Scroll zu den Tabs
                        const tabsElement = document.querySelector('[role="tablist"]');
                        if (tabsElement) {
                          tabsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      variant="outlined"
                      sx={{
                        borderColor: 'rgba(242, 159, 5, 0.4)',
                        color: 'rgba(255, 255, 255, 0.9)',
                        px: { xs: 4, md: 6 },
                        py: { xs: 1.5, md: 2 },
                        borderRadius: 2,
                        fontWeight: 300,
                        textTransform: 'none',
                        fontSize: { xs: '0.95rem', md: '1.05rem' },
                        width: { xs: '100%', sm: 'auto' },
                        minWidth: { xs: '100%', sm: 240 },
                        transition: 'all 0.4s ease',
                        '&:hover': {
                          borderColor: 'rgba(242, 159, 5, 0.6)',
                          backgroundColor: 'rgba(242, 159, 5, 0.05)',
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      Mein Design erkunden
                    </Button>
                  </Box>
                </motion.div>
              )}
            </Box>
          )}

          {/* Type Overview Card - Kompakt (nur nach Schwelle) */}
          {chartData?.hdChart && hasPassedThreshold && (
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              borderRadius: { xs: 1.5, sm: 2 },
              border: '1px solid rgba(242, 159, 5, 0.20)',
              mb: { xs: 2, sm: 3 },
              transition: 'all 0.3s ease',
              '&:hover': {
                border: '1px solid rgba(242, 159, 5, 0.40)'
              }
            }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} sm={4} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: 2,
                        background: `${currentTypeInfo.color}20`,
                        color: currentTypeInfo.color,
                        mb: 1.5
                      }}>
                        {React.createElement(currentTypeInfo.iconComponent, { size: 24 })}
                      </Box>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                        {displayTypeName}
                      </Typography>
                      <Chip 
                        label={`Profil ${chartInfo.profile}`}
                        size="small"
                        sx={{
                          background: 'rgba(242, 159, 5, 0.2)',
                          color: '#F29F05',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={8} md={9}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Target size={16} style={{ color: '#F29F05', marginRight: 8 }} />
                          <Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
                              Strategie
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                              {chartInfo.strategy}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Shield size={16} style={{ color: '#F29F05', marginRight: 8 }} />
                          <Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
                              Autorität
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                              {chartInfo.authority}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Brain size={16} style={{ color: '#F29F05', marginRight: 8 }} />
                          <Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
                              Zentren
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                              {chartData?.centers?.length || 0} definiert
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Star size={16} style={{ color: '#F29F05', marginRight: 8 }} />
                          <Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
                              Tore
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>
                              {chartData?.gates?.length || 0} aktiv
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards (nur nach Schwelle) */}
          {chartData?.hdChart && hasPassedThreshold && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 4 }}>
                <Grid item xs={6} sm={3}>
                  <Card sx={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(242, 159, 5, 0.20)',
                    borderRadius: { xs: 1.5, sm: 2 },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      border: '1px solid rgba(242, 159, 5, 0.40)'
                    }
                  }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: { xs: 0.5, sm: 1 },
                        color: '#F29F05'
                      }}>
                        <User size={20} style={{ width: '20px', height: '20px' }} />
                      </Box>
                      <Typography variant="h5" sx={{ 
                        color: 'white', 
                        fontWeight: 700, 
                        mb: 0.5,
                        fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
                      }}>
                        {chartData?.hdChart?.type || '-'}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.7)', 
                        fontSize: { xs: '0.75rem', sm: '0.85rem' }
                      }}>
                        Deine Natur
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(242, 159, 5, 0.20)',
                    borderRadius: { xs: 1.5, sm: 2 },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      border: '1px solid rgba(242, 159, 5, 0.40)'
                    }
                  }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: { xs: 0.5, sm: 1 },
                        color: '#F29F05'
                      }}>
                        <Target size={20} style={{ width: '20px', height: '20px' }} />
                      </Box>
                      <Typography variant="h5" sx={{ 
                        color: 'white', 
                        fontWeight: 700, 
                        mb: 0.5,
                        fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
                      }}>
                        {chartData?.hdChart?.profile || '-'}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.7)', 
                        fontSize: { xs: '0.75rem', sm: '0.85rem' }
                      }}>
                        Dein Weg
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(242, 159, 5, 0.20)',
                    borderRadius: { xs: 1.5, sm: 2 },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      border: '1px solid rgba(242, 159, 5, 0.40)'
                    }
                  }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: { xs: 0.5, sm: 1 },
                        color: '#F29F05'
                      }}>
                        <Brain size={20} style={{ width: '20px', height: '20px' }} />
                      </Box>
                      <Typography variant="h5" sx={{ 
                        color: 'white', 
                        fontWeight: 700, 
                        mb: 0.5,
                        fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
                      }}>
                        {chartData?.centers?.length || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.7)', 
                        fontSize: { xs: '0.75rem', sm: '0.85rem' }
                      }}>
                        Deine Energie
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Card sx={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(242, 159, 5, 0.20)',
                    borderRadius: { xs: 1.5, sm: 2 },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      border: '1px solid rgba(242, 159, 5, 0.40)'
                    }
                  }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 }, textAlign: 'center' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: { xs: 0.5, sm: 1 },
                        color: '#F29F05'
                      }}>
                        <Star size={20} style={{ width: '20px', height: '20px' }} />
                      </Box>
                      <Typography variant="h5" sx={{ 
                        color: 'white', 
                        fontWeight: 700, 
                        mb: 0.5,
                        fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }
                      }}>
                        {chartData?.gates?.length || 0}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.7)', 
                        fontSize: { xs: '0.75rem', sm: '0.85rem' }
                      }}>
                        Deine Tore
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {/* Tabs (nur nach Schwelle) */}
          {hasPassedThreshold && (
          <Paper sx={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.15)',
            mb: 4,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 64,
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: 600,
                  fontSize: { xs: '0.875rem', md: '1rem' },
                  minHeight: 64,
                  px: { xs: 2, md: 3 },
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': {
                    color: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)'
                  },
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'rgba(255, 255, 255, 0.9)'
                  }
                },
                '& .MuiTabs-indicator': {
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                },
                '& .MuiTabs-flexContainer': {
                  gap: { xs: 0, md: 1 }
                }
              }}
            >
              <Tab label="Zentren" icon={<Brain size={20} />} iconPosition="start" />
              <Tab label="Kanäle" icon={<Activity size={20} />} iconPosition="start" />
              <Tab label="Tore" icon={<Star size={20} />} iconPosition="start" />
              <Tab label="Profil & Details" icon={<Target size={20} />} iconPosition="start" />
              <Tab label="🩵 Connection Key" icon={<HeartIcon size={20} />} iconPosition="start" />
              <Tab label="🪐 Planeten" icon={<Orbit size={20} />} iconPosition="start" />
            </Tabs>
          </Paper>
          )}

          {/* Tab Content (nur nach Schwelle) */}
          {hasPassedThreshold && chartData?.hdChart && (
          <>
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              {chartInfo?.centers && Object.entries(chartInfo.centers).map(([centerName, center]: [string, Center]) => (
                <Grid item xs={12} sm={6} md={4} key={centerName}>
                  <Card sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.15)',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                      borderColor: 'rgba(255,255,255,0.3)'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: center.defined ? center.color : 'rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}>
                          <Box sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: center.defined ? 'white' : 'rgba(255,255,255,0.3)'
                          }} />
                        </Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, textTransform: 'capitalize' }}>
                          {centerName} Zentrum
                        </Typography>
                      </Box>
                      <Chip 
                        label={center.defined ? 'Definiert' : 'Undefiniert'}
                        size="small"
                        sx={{
                          background: center.defined ? `${center.color}20` : 'rgba(255,255,255,0.1)',
                          color: center.defined ? center.color : 'rgba(255,255,255,0.7)',
                          mb: 2
                        }}
                      />
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                        {center.description}
                      </Typography>
                      {center?.gates && center.gates.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            Tore: {center.gates.join(', ')}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Grid container spacing={3}>
              {chartInfo?.channels && chartInfo.channels.map((channel: Channel, index: number) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.15)',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                      borderColor: 'rgba(255,255,255,0.3)'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          backgroundColor: channel.active ? '#10b981' : 'rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}>
                          <Activity size={20} style={{ color: channel.active ? 'white' : 'rgba(255,255,255,0.3)' }} />
                        </Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                          {channel.from}-{channel.to}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                        {channel.name}
                      </Typography>
                      <Chip 
                        label={channel.active ? 'Aktiv' : 'Inaktiv'}
                        size="small"
                        sx={{
                          background: channel.active ? '#10b98120' : 'rgba(255,255,255,0.1)',
                          color: channel.active ? '#10b981' : 'rgba(255,255,255,0.7)'
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              {chartInfo?.gates && chartInfo.gates.map((gate: Gate) => (
                <Grid item xs={12} sm={6} md={4} key={gate.id}>
                  <Card sx={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.15)',
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
                      borderColor: 'rgba(255,255,255,0.3)'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: gate.active ? '#FFD700' : 'rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2
                        }}>
                          <Star size={20} style={{ color: gate.active ? '#1f2937' : 'rgba(255,255,255,0.3)' }} />
                        </Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                          Tor {gate.id}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                        {gate.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, mb: 2 }}>
                        {gate.description}
                      </Typography>
                      <Chip 
                        label={gate.active ? 'Aktiv' : 'Inaktiv'}
                        size="small"
                        sx={{
                          background: gate.active ? '#FFD70020' : 'rgba(255,255,255,0.1)',
                          color: gate.active ? '#FFD700' : 'rgba(255,255,255,0.7)'
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={3}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 3 }}>
                  Dein Profil: {chartInfo.profile}
                </Typography>
                <Grid container spacing={3}>
                  {/* Grundlegende Profil-Informationen */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                        🎭 Profil-Details
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: '#FFD700', fontWeight: 600 }}>
                          Profil: {chartInfo.profile}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
                          Das Profil zeigt deine Lebensrolle und wie du dich in der Welt bewegst.
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: '#FFD700', fontWeight: 600 }}>
                          Typ: {displayTypeName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
                          Dein energetischer Typ bestimmt deine Strategie und Autorität.
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                        🎯 Strategie & Autorität
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: '#FFD700', fontWeight: 600 }}>
                          Strategie: {chartInfo.strategy}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
                          Deine Strategie zeigt, wie du am besten Entscheidungen triffst.
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: '#FFD700', fontWeight: 600 }}>
                          Autorität: {chartInfo.authority}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 1 }}>
                          Deine innere Autorität hilft dir, die richtigen Entscheidungen zu treffen.
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  {/* Inkarnationskreuz */}
                  <Grid item xs={12}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                        ✨ Inkarnationskreuz
                      </Typography>
                      
                      {typeof chartInfo.incarnationCross === 'object' && chartInfo.incarnationCross && chartInfo.incarnationCross.name ? (
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: '#FFD700', fontWeight: 600, mb: 1 }}>
                            {chartInfo.incarnationCross.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                            Sonne: Tor {chartInfo.incarnationCross.sunGate}.{chartInfo.incarnationCross.sunLine} • 
                            Erde: Tor {chartInfo.incarnationCross.earthGate}.{chartInfo.incarnationCross.earthLine}
                          </Typography>
                          
                          {chartInfo.incarnationCross.description && (
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, mb: 2 }}>
                              {chartInfo.incarnationCross.description}
                            </Typography>
                          )}
                          
                          <Grid container spacing={2}>
                            {chartInfo.incarnationCross.lifeTheme && (
                              <Grid item xs={12} sm={6}>
                                <Paper sx={{ p: 2, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                  <Typography variant="subtitle2" sx={{ color: '#FFD700', fontWeight: 600, mb: 1 }}>
                                    🎯 Lebensaufgabe
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    {chartInfo.incarnationCross.lifeTheme}
                                  </Typography>
                                </Paper>
                              </Grid>
                            )}
                            
                            {chartInfo.incarnationCross.purpose && (
                              <Grid item xs={12} sm={6}>
                                <Paper sx={{ p: 2, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                  <Typography variant="subtitle2" sx={{ color: '#FFD700', fontWeight: 600, mb: 1 }}>
                                    🌟 Zweck
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    {chartInfo.incarnationCross.purpose}
                                  </Typography>
                                </Paper>
                              </Grid>
                            )}
                            
                            {chartInfo.incarnationCross.challenges && (
                              <Grid item xs={12} sm={6}>
                                <Paper sx={{ p: 2, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                  <Typography variant="subtitle2" sx={{ color: '#FFD700', fontWeight: 600, mb: 1 }}>
                                    ⚡ Herausforderungen
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    {chartInfo.incarnationCross.challenges}
                                  </Typography>
                                </Paper>
                              </Grid>
                            )}
                            
                            {chartInfo.incarnationCross.gifts && (
                              <Grid item xs={12} sm={6}>
                                <Paper sx={{ p: 2, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                  <Typography variant="subtitle2" sx={{ color: '#FFD700', fontWeight: 600, mb: 1 }}>
                                    🎁 Gaben
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    {chartInfo.incarnationCross.gifts}
                                  </Typography>
                                </Paper>
                              </Grid>
                            )}
                            
                            {chartInfo.incarnationCross.affirmation && (
                              <Grid item xs={12}>
                                <Paper sx={{ p: 2, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                  <Typography variant="subtitle2" sx={{ color: '#FFD700', fontWeight: 600, mb: 1 }}>
                                    💫 Affirmation
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>
                                    "{chartInfo.incarnationCross.affirmation}"
                                  </Typography>
                                </Paper>
                              </Grid>
                            )}
                          </Grid>
                        </Box>
                      ) : (
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: '#FFD700', fontWeight: 600, mb: 1 }}>
                            {typeof chartInfo.incarnationCross === 'string' ? chartInfo.incarnationCross : chartInfo.incarnationCross.name}
                          </Typography>
                          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                            Dein Inkarnationskreuz zeigt deine Lebensaufgabe und deinen höheren Zweck. 
                            Es ist das Kreuz, das du in dieser Inkarnation trägst und das deine 
                            wichtigsten Lebenslektionen und Potenziale definiert.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  {/* Detaillierte Profil-Beschreibung */}
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                        🌟 Profil-Bedeutung
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                        Als Profil {chartInfo.profile} hast du eine einzigartige Lebensrolle. 
                        Dein Profil zeigt, wie du dich in der Welt bewegst und welche Erfahrungen 
                        du sammeln wirst. Es ist dein Fahrplan für persönliches Wachstum und 
                        spirituelle Entwicklung.
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                        🎪 Lebensaufgabe
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                        Deine Lebensaufgabe ist es, deine einzigartige Energie und dein Potenzial zu entfalten, 
                        indem du deiner Strategie und Autorität folgst. Vertraue auf deine innere Weisheit 
                        und lass dich von deinem höheren Zweck leiten.
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Praktische Anwendung */}
                  <Grid item xs={12}>
                    <Box sx={{ 
                      p: 3, 
                      bgcolor: 'rgba(242, 159, 5, 0.1)', 
                      borderRadius: 2, 
                      border: '1px solid rgba(242, 159, 5, 0.3)' 
                    }}>
                      <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 600, mb: 2 }}>
                        💡 Praktische Anwendung
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="subtitle2" sx={{ color: '#FFD700', fontWeight: 600, mb: 1 }}>
                              Täglich
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                              Folge deiner Strategie bei allen wichtigen Entscheidungen
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="subtitle2" sx={{ color: '#FFD700', fontWeight: 600, mb: 1 }}>
                              Wöchentlich
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                              Reflektiere über deine Profil-Eigenschaften und deren Ausdruck
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="subtitle2" sx={{ color: '#FFD700', fontWeight: 600, mb: 1 }}>
                              Monatlich
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                              Überprüfe deinen Fortschritt auf deinem Inkarnationskreuz-Pfad
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>

                  {/* Spezifische Profil-Interpretation */}
                  <Grid item xs={12}>
                    <Box sx={{ 
                      p: 3, 
                      bgcolor: 'rgba(255, 215, 0, 0.1)', 
                      borderRadius: 2, 
                      border: '1px solid rgba(255, 215, 0, 0.3)' 
                    }}>
                      <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 600, mb: 2 }}>
                        🔮 Profil-Interpretation für {chartInfo.profile}
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                              Stärken & Talente
                            </Typography>
                            <List dense>
                              <ListItem sx={{ px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <Star size={16} color="#FFD700" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary="Natürliche Autorität" 
                                  primaryTypographyProps={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}
                                />
                              </ListItem>
                              <ListItem sx={{ px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <Star size={16} color="#FFD700" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary="Tiefe Einsichten" 
                                  primaryTypographyProps={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}
                                />
                              </ListItem>
                              <ListItem sx={{ px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <Star size={16} color="#FFD700" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary="Transformative Kraft" 
                                  primaryTypographyProps={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}
                                />
                              </ListItem>
                            </List>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box>
                            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                              Wachstumsbereiche
                            </Typography>
                            <List dense>
                              <ListItem sx={{ px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <TrendingUp size={16} color="#F29F05" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary="Geduld entwickeln" 
                                  primaryTypographyProps={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}
                                />
                              </ListItem>
                              <ListItem sx={{ px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <TrendingUp size={16} color="#F29F05" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary="Vertrauen in den Prozess" 
                                  primaryTypographyProps={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}
                                />
                              </ListItem>
                              <ListItem sx={{ px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <TrendingUp size={16} color="#F29F05" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary="Selbstakzeptanz" 
                                  primaryTypographyProps={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}
                                />
                              </ListItem>
                            </List>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>

                  {/* Zusätzliche Ressourcen */}
                  <Grid item xs={12}>
                    <Box sx={{ 
                      p: 4, 
                      bgcolor: 'rgba(255,255,255,0.05)', 
                      borderRadius: 3, 
                      border: '1px solid rgba(255,255,255,0.1)' 
                    }}>
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BookOpen size={24} color="#FFD700" />
                        📚 Weiterführende Ressourcen
                      </Typography>
                      
                      <Grid container spacing={3}>
                        {/* Human Design Grundlagen */}
                        <Grid item xs={12} sm={6} md={4}>
                          <Link href="/grundlagen-hd" passHref>
                            <Button
                              variant="outlined"
                              fullWidth
                              startIcon={<BookOpen size={20} />}
                              sx={{
                                borderColor: 'rgba(255, 215, 0, 0.3)',
                                color: '#FFD700',
                                py: 2,
                                '&:hover': {
                                  borderColor: '#FFD700',
                                  backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              Human Design Grundlagen
                            </Button>
                          </Link>
                        </Grid>

                        {/* Chart-Vergleich */}
                        <Grid item xs={12} sm={6} md={4}>
                          <Link href="/chart-comparison" passHref>
                            <Button
                              variant="outlined"
                              fullWidth
                              startIcon={<Users size={20} />}
                              sx={{
                                borderColor: 'rgba(242, 159, 5, 0.3)',
                                color: '#F29F05',
                                py: 2,
                                '&:hover': {
                                  borderColor: '#F29F05',
                                  backgroundColor: 'rgba(242, 159, 5, 0.1)',
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              Chart-Vergleich
                            </Button>
                          </Link>
                        </Grid>

                        {/* Community */}
                        <Grid item xs={12} sm={6} md={4}>
                          <Link href="/community" passHref>
                            <Button
                              variant="outlined"
                              fullWidth
                              startIcon={<Heart size={20} />}
                              sx={{
                                borderColor: 'rgba(239, 68, 68, 0.3)',
                                color: '#ef4444',
                                py: 2,
                                '&:hover': {
                                  borderColor: '#ef4444',
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              Community
                            </Button>
                          </Link>
                        </Grid>

                        {/* Mondkalender */}
                        <Grid item xs={12} sm={6} md={4}>
                          <Link href="/mondkalender" passHref>
                            <Button
                              variant="outlined"
                              fullWidth
                              startIcon={<Calendar size={20} />}
                              sx={{
                                borderColor: 'rgba(16, 185, 129, 0.3)',
                                color: '#10b981',
                                py: 2,
                                '&:hover': {
                                  borderColor: '#10b981',
                                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              Mondkalender
                            </Button>
                          </Link>
                        </Grid>


                        {/* Dashboard */}
                        <Grid item xs={12} sm={6} md={4}>
                          <Link href="/dashboard" passHref>
                            <Button
                              variant="outlined"
                              fullWidth
                              startIcon={<TrendingUp size={20} />}
                              sx={{
                                borderColor: 'rgba(6, 182, 212, 0.3)',
                                color: '#06b6d4',
                                py: 2,
                                '&:hover': {
                                  borderColor: '#06b6d4',
                                  backgroundColor: 'rgba(6, 182, 212, 0.1)',
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              Dashboard
                            </Button>
                          </Link>
                        </Grid>
                      </Grid>

                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Connection Key Tab */}
          <TabPanel value={activeTab} index={4}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 3, textAlign: 'center' }}>
                  🩵 Connection Key Resonanzanalyse
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, textAlign: 'center', maxWidth: 700, mx: 'auto', lineHeight: 1.8 }}>
                  Analysiere die energetische Verbindung zwischen dir und einer anderen Person. 
                  Entdecke Goldadern, komplementäre Tore und die Resonanz, die euch verbindet.
                </Typography>

                <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, textAlign: 'center' }}>
                  <Link href="/human-design-chart/connection-key" style={{ textDecoration: 'none' }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<HeartIcon size={24} />}
                      sx={{
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        color: 'white',
                        fontWeight: 700,
                        px: 6,
                        py: 2,
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        boxShadow: '0 4px 16px rgba(242, 159, 5, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 32px rgba(242, 159, 5, 0.4)'
                        }
                      }}
                    >
                      Zur vollständigen Connection Key Analyse →
                    </Button>
                  </Link>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Planeten Tab */}
          <TabPanel value={activeTab} index={5}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 3, textAlign: 'center' }}>
                  🪐 Deine planetare Signatur
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, textAlign: 'center', maxWidth: 700, mx: 'auto', lineHeight: 1.8 }}>
                  Die Planeten im Human Design Chart sind die Träger der Tore – sie bestimmen, welche Tore in deinem Chart aktiviert werden und welche Energie du in deinem Design ausdrückst. 
                  Die Tore definieren, <strong>was</strong> in dir wirkt. Die Planeten zeigen, <strong>wie</strong> und <strong>warum</strong> es wirkt.
                </Typography>

                <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, textAlign: 'center' }}>
                  <Link href="/human-design-chart/planeten-signatur" style={{ textDecoration: 'none' }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Orbit size={24} />}
                      sx={{
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        color: 'white',
                        fontWeight: 700,
                        px: 6,
                        py: 2,
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        textTransform: 'none',
                        boxShadow: '0 4px 16px rgba(242, 159, 5, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                          transform: 'translateY(-3px)',
                          boxShadow: '0 8px 32px rgba(242, 159, 5, 0.4)'
                        }
                      }}
                    >
                      Zur vollständigen Planeten-Analyse →
                    </Button>
                  </Link>
                </Box>

                <Box sx={{ mt: 6 }}>
                  <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 600, mb: 3, textAlign: 'center' }}>
                    Die wichtigsten Planeten
                  </Typography>
                  <Grid container spacing={3}>
                    {[
                      { name: 'Sonne', symbol: '☀️', desc: 'Lebensaufgabe, Kernenergie – ca. 70% deiner Grundenergie' },
                      { name: 'Erde', symbol: '🌍', desc: 'Stabilität, Balance – was dich erdet' },
                      { name: 'Mond', symbol: '🌙', desc: 'Motivation, Antrieb – was dich innerlich bewegt' },
                      { name: 'Nordknoten', symbol: '☊', desc: 'Entwicklungsrichtung – wo deine Lebensreise hingeht' },
                      { name: 'Südknoten', symbol: '☋', desc: 'Herkunft, Gewohnheit – wo du herkommst' },
                    ].map((planet, idx) => (
                      <Grid item xs={12} sm={6} key={idx}>
                        <Card sx={{
                          background: 'rgba(242, 159, 5, 0.1)',
                          border: '1px solid rgba(242, 159, 5, 0.3)',
                          borderRadius: 2,
                          p: 2,
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="h4" sx={{ fontSize: '2rem' }}>
                              {planet.symbol}
                            </Typography>
                            <Box>
                              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                                {planet.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                                {planet.desc}
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </TabPanel>
          </>
          )}

          {/* Action Buttons (nur nach Schwelle) */}
          {hasPassedThreshold && (
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1.5, sm: 2 }, 
            justifyContent: 'center', 
            mt: { xs: 4, sm: 6 },
            mb: { xs: 3, sm: 4 },
            flexWrap: 'wrap',
            px: { xs: 1, sm: 0 }
          }}>
            <Button
              variant="outlined"
              startIcon={recalculating ? <CircularProgress size={18} sx={{ color: '#F29F05' }} /> : <RefreshCw size={18} />}
              onClick={recalculateChart}
              disabled={recalculating}
              sx={{
                borderColor: 'rgba(242, 159, 5, 0.4)',
                color: '#F29F05',
                fontWeight: 600,
                px: { xs: 2, sm: 4 },
                py: { xs: 1.25, sm: 1.5 },
                borderRadius: { xs: 2, sm: 3 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                textTransform: 'none',
                borderWidth: 2,
                transition: 'all 0.3s ease',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  borderColor: '#F29F05',
                  backgroundColor: 'rgba(242, 159, 5, 0.15)',
                  transform: 'translateY(-3px)',
                  borderWidth: 2
                },
                '&:disabled': {
                  borderColor: 'rgba(242, 159, 5, 0.2)',
                  color: 'rgba(242, 159, 5, 0.5)',
                  backgroundColor: 'rgba(242, 159, 5, 0.05)'
                }
              }}
            >
              {recalculating ? 'Berechne...' : 'Mein Design neu betreten'}
            </Button>
            <Button
              variant="contained"
              startIcon={<Share2 size={18} />}
              sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                color: 'white',
                fontWeight: 600,
                px: { xs: 2, sm: 4 },
                py: { xs: 1.25, sm: 1.5 },
                borderRadius: { xs: 2, sm: 3 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                textTransform: 'none',
                boxShadow: '0 4px 16px rgba(242, 159, 5, 0.3)',
                transition: 'all 0.3s ease',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 32px rgba(242, 159, 5, 0.4)'
                }
              }}
            >
              Design bewusst teilen
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download size={18} />}
              sx={{
                borderColor: 'rgba(242, 159, 5, 0.4)',
                color: '#F29F05',
                fontWeight: 600,
                px: { xs: 2, sm: 4 },
                py: { xs: 1.25, sm: 1.5 },
                borderRadius: { xs: 2, sm: 3 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                textTransform: 'none',
                borderWidth: 2,
                transition: 'all 0.3s ease',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  borderColor: '#F29F05',
                  backgroundColor: 'rgba(242, 159, 5, 0.15)',
                  transform: 'translateY(-3px)',
                  borderWidth: 2
                }
              }}
            >
              Meine energetische Signatur sichern
            </Button>
          </Box>
          )}
          </Container>
        </PageLayout>
      </Box>

        {/* Connection Key Analyse Modal */}
        <Dialog
          open={showConnectionKeyModal}
          onClose={() => setShowConnectionKeyModal(false)}
          maxWidth="xl"
          fullWidth
          disableScrollLock={false}
          sx={{
            '& .MuiBackdrop-root': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(4px)',
            }
          }}
          PaperProps={{
            sx: {
              background: 'linear-gradient(180deg, #0b0a0f 0%, #1a1518 100%)',
              borderRadius: 3,
              maxHeight: '95vh',
              height: { xs: '95vh', md: '90vh' },
              border: '1px solid rgba(242, 159, 5, 0.2)',
              display: 'flex',
              flexDirection: 'column',
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15), rgba(140, 29, 4, 0.15))',
            borderBottom: '2px solid rgba(242, 159, 5, 0.3)',
            color: '#fff',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            py: 2,
            px: 3,
            flexShrink: 0,
          }}>
            <Box sx={{ fontSize: 32 }}>🩵</Box>
            <Box>
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
                Connection Key Resonanzanalyse
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 0.5 }}>
                {userName || 'Du'} & {person2Data?.name || 'Person 2'}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            overflowY: 'auto',
            flex: 1,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.05)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(242, 159, 5, 0.3)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(242, 159, 5, 0.5)',
              },
            },
          }}>
            {person2Data && chartData ? (
              <Box>
                <ConnectionKeyAnalyzer
                  person1Gates={(() => {
                    // Versuche verschiedene Stellen für Gates
                    let gates: number[] = [];
                    
                    if (Array.isArray(chartData.gates) && chartData.gates.length > 0) {
                      gates = chartData.gates;
                    } else if (Array.isArray(chartData.hdChart?.gates) && chartData.hdChart.gates.length > 0) {
                      gates = chartData.hdChart.gates;
                    } else if (Array.isArray(chartData.hdChart?.activeGates) && chartData.hdChart.activeGates.length > 0) {
                      gates = chartData.hdChart.activeGates;
                    }
                    
                    // Stelle sicher, dass es Zahlen sind
                    gates = gates.map((g: any) => typeof g === 'number' ? g : (g?.id || g?.gate || g)).filter((g: any) => typeof g === 'number' && g > 0 && g <= 64);
                    
                    console.log('🔍 Person 1 Gates for Connection Key:', {
                      chartDataGates: chartData.gates,
                      hdChartGates: chartData.hdChart?.gates,
                      hdChartActiveGates: chartData.hdChart?.activeGates,
                      finalGates: gates,
                      gatesCount: gates.length,
                      chartDataKeys: Object.keys(chartData)
                    });
                    
                    return gates;
                  })()}
                  person2Gates={(() => {
                    let gates: number[] = [];
                    
                    if (Array.isArray(person2Data.gates) && person2Data.gates.length > 0) {
                      gates = person2Data.gates;
                    }
                    
                    // Stelle sicher, dass es Zahlen sind
                    gates = gates.map((g: any) => typeof g === 'number' ? g : (g?.id || g?.gate || g)).filter((g: any) => typeof g === 'number' && g > 0 && g <= 64);
                    
                    console.log('🔍 Person 2 Gates for Connection Key:', {
                      person2DataGates: person2Data.gates,
                      finalGates: gates,
                      gatesCount: gates.length,
                      person2DataKeys: Object.keys(person2Data)
                    });
                    
                    return gates;
                  })()}
                  person1Centers={(() => {
                    // Sicherstellen, dass centers ein Array ist
                    const centersArray = Array.isArray(chartData.centers) ? chartData.centers : [];
                    return {
                      krone: centersArray.includes('Head') || centersArray.includes('HEAD') ? 'definiert' : 'undefiniert',
                      ajna: centersArray.includes('Ajna') || centersArray.includes('AJNA') ? 'definiert' : 'undefiniert',
                      kehle: centersArray.includes('Throat') || centersArray.includes('THROAT') ? 'definiert' : 'undefiniert',
                      gZentrum: centersArray.includes('G') || centersArray.includes('G_CENTER') ? 'definiert' : 'undefiniert',
                      herzEgo: centersArray.includes('Heart') || centersArray.includes('HEART') ? 'definiert' : 'undefiniert',
                      sakral: centersArray.includes('Sacral') || centersArray.includes('SACRAL') ? 'definiert' : 'undefiniert',
                      solarplexus: centersArray.includes('Solar') || centersArray.includes('SOLAR') ? 'definiert' : 'undefiniert',
                      milz: centersArray.includes('Spleen') || centersArray.includes('SPLEEN') ? 'definiert' : 'undefiniert',
                      wurzel: centersArray.includes('Root') || centersArray.includes('ROOT') ? 'definiert' : 'undefiniert',
                    };
                  })()}
                  person2Centers={person2Data.centers || {
                    krone: 'undefiniert',
                    ajna: 'undefiniert',
                    kehle: 'undefiniert',
                    gZentrum: 'undefiniert',
                    herzEgo: 'undefiniert',
                    sakral: 'undefiniert',
                    solarplexus: 'undefiniert',
                    milz: 'undefiniert',
                    wurzel: 'undefiniert',
                  }}
                  person1Type={chartData.hdChart?.type as any}
                  person2Type={person2Data.type as any}
                  person1Profile={chartData.hdChart?.profile}
                  person2Profile={person2Data.profile}
                  person1Authority={chartData.hdChart?.authority as any}
                  person2Authority={person2Data.authority as any}
                  person1Strategy={chartData.hdChart?.strategy as any}
                  person2Strategy={person2Data.strategy as any}
                  person1Name={userName || 'Du'}
                  person2Name={person2Data.name}
                />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CircularProgress sx={{ mb: 2, color: '#F29F05' }} />
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Lade Chart-Daten...
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            p: { xs: 2, sm: 3 }, 
            borderTop: '1px solid rgba(242, 159, 5, 0.3)',
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
          }}>
            <Link href="/connection-key/booking" style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                sx={{ 
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  color: '#F29F05',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  '&:hover': {
                    borderColor: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)',
                    color: '#FFD700',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                🔍 Vollständige Analyse
              </Button>
            </Link>
            <Button
              onClick={() => setShowConnectionKeyModal(false)}
              sx={{ 
                color: '#F29F05',
                fontWeight: 600,
                px: 3,
                py: 1,
                '&:hover': {
                  background: 'rgba(242, 159, 5, 0.1)',
                  color: '#FFD700',
                }
              }}
            >
              Schließen
            </Button>
          </DialogActions>
        </Dialog>

        {/* Onboarding Dialog */}
        <Dialog
          open={showOnboarding}
          onClose={() => {
            setShowOnboarding(false);
            if (typeof window !== 'undefined') {
              localStorage.setItem('human-design-chart-onboarding-completed', 'true');
            }
          }}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: 'linear-gradient(180deg, #0b0a0f 0%, #1a1518 100%)',
              borderRadius: 3,
              border: '1px solid rgba(242, 159, 5, 0.3)',
            }
          }}
        >
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15), rgba(140, 29, 4, 0.15))',
            borderBottom: '2px solid rgba(242, 159, 5, 0.3)',
            color: '#fff',
            fontWeight: 700,
            textAlign: 'center',
            py: 3,
          }}>
            🪐 Erstelle dein Human Design Chart
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3, lineHeight: 1.8, textAlign: 'center' }}>
              Um dein persönliches Human Design Chart zu erstellen, benötigen wir deine Geburtsdaten. 
              Diese werden verwendet, um dein einzigartiges energetisches Profil zu berechnen.
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, background: 'rgba(242, 159, 5, 0.1)', borderRadius: 2 }}>
                <Calendar size={24} style={{ color: '#F29F05' }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                    Geburtsdatum
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Tag, Monat, Jahr
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, background: 'rgba(242, 159, 5, 0.1)', borderRadius: 2 }}>
                <Activity size={24} style={{ color: '#F29F05' }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                    Geburtszeit
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    So genau wie möglich (24h Format)
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, background: 'rgba(242, 159, 5, 0.1)', borderRadius: 2 }}>
                <Target size={24} style={{ color: '#F29F05' }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                    Geburtsort
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Stadt und Land
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowOnboarding(false);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('human-design-chart-onboarding-completed', 'true');
                  }
                }}
                sx={{
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: '#fff',
                  '&:hover': {
                    borderColor: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)',
                  }
                }}
              >
                Später
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setShowOnboarding(false);
                  setShowChartForm(true);
                }}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white',
                  fontWeight: 600,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                  }
                }}
              >
                Jetzt erstellen
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Chart Creation Form Dialog */}
        <Dialog
          open={showChartForm}
          onClose={() => setShowChartForm(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: 'linear-gradient(180deg, #0b0a0f 0%, #1a1518 100%)',
              borderRadius: 3,
              border: '1px solid rgba(242, 159, 5, 0.3)',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }
          }}
        >
          <DialogTitle sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15), rgba(140, 29, 4, 0.15))',
            borderBottom: '2px solid rgba(242, 159, 5, 0.3)',
            color: '#fff',
            fontWeight: 700,
            textAlign: 'center',
            py: 2,
            flexShrink: 0,
          }}>
            Deine Geburtsdaten
          </DialogTitle>
          <DialogContent sx={{ 
            p: 4,
            overflowY: 'auto',
            flex: 1,
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'rgba(255, 255, 255, 0.05)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'rgba(242, 159, 5, 0.3)',
              borderRadius: '4px',
              '&:hover': {
                background: 'rgba(242, 159, 5, 0.5)',
              },
            },
          }}>
            {chartFormError && (
              <Alert severity="error" sx={{ mb: 3, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                {chartFormError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Geburtsdatum"
                type="date"
                value={chartFormData.birthDate}
                onChange={(e) => setChartFormData({ ...chartFormData, birthDate: e.target.value })}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' },
                  '& input[type="date"]': {
                    color: 'white',
                    padding: '14px',
                  },
                  '& input[type="date"]::-webkit-calendar-picker-indicator': {
                    filter: 'invert(1)',
                    cursor: 'pointer',
                  }
                }}
              />
              
              <TextField
                label="Geburtszeit"
                type="time"
                value={chartFormData.birthTime}
                onChange={(e) => setChartFormData({ ...chartFormData, birthTime: e.target.value })}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' },
                  '& input[type="time"]': {
                    color: 'white',
                    padding: '14px',
                  },
                  '& input[type="time"]::-webkit-calendar-picker-indicator': {
                    filter: 'invert(1)',
                    cursor: 'pointer',
                  }
                }}
              />
              
              <TextField
                label="Geburtsort"
                value={chartFormData.birthPlace}
                onChange={(e) => setChartFormData({ ...chartFormData, birthPlace: e.target.value })}
                required
                fullWidth
                placeholder="z.B. Berlin, Deutschland"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#F29F05' }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ 
            p: 3, 
            borderTop: '1px solid rgba(242, 159, 5, 0.3)',
            flexShrink: 0,
          }}>
            <Button
              onClick={() => setShowChartForm(false)}
              sx={{
                color: 'rgba(255,255,255,0.7)',
                '&:hover': {
                  color: '#fff',
                  background: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleCreateChart}
              disabled={calculatingChart || !chartFormData.birthDate || !chartFormData.birthTime || !chartFormData.birthPlace}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                },
                '&:disabled': {
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              {calculatingChart ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: '#fff' }} />
                  Berechne...
                </>
              ) : (
                'Chart erstellen'
              )}
            </Button>
          </DialogActions>
        </Dialog>
    </AccessControl>
  );
}

// Export mit ProtectedRoute
export default function HumanDesignChartPage() {
  return (
    <ProtectedRoute requiredRole="basic">
      <HumanDesignChartContent />
    </ProtectedRoute>
  );
}
