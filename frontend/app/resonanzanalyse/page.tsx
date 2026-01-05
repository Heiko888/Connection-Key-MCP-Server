"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Reading
} from '@/types/common.types';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Tabs,
  Tab,
  MenuItem,
  InputAdornment,
  Stack,
  Alert
} from '@mui/material';
import {
  MenuBook,
  ArrowForward,
  CompareArrows,
  PersonAdd,
  Search,
  FilterList,
  Visibility,
  CalendarToday,
  Close
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LogOut, Plus, Calendar, Clock, Download, Video, DollarSign, User } from 'lucide-react';
import AccessControl from '../../components/AccessControl';
import ChartComparisonModal from '../../components/ChartComparisonModal';
import ConnectionKeyAnalyzer from '../../components/ConnectionKeyAnalyzer';
import PageLayout from '../components/PageLayout';
import { supabase } from '@/lib/supabase/client';
import { safeJsonParse } from '@/lib/utils/safeJson';
import Link from 'next/link';

interface ReadingExtended extends Reading {
  question: string;
  status: string;
  datingType?: string;
  reading_type?: string;
  reading_data?: any;
}

// Komponente für Connection Key Modal Content
function ConnectionKeyModalContent({ reading }: { reading: ReadingExtended }) {
  const [calculating, setCalculating] = useState(false);
  const [chartData, setChartData] = useState<{
    person1?: { gates: number[]; centers: any; type?: string; profile?: string; authority?: string; strategy?: string; name?: string };
    person2?: { gates: number[]; centers: any; type?: string; profile?: string; authority?: string; strategy?: string; name?: string };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Berechne Charts wenn Modal geöffnet wird
    calculateCharts();
  }, [reading]);

  const calculateCharts = async () => {
    setCalculating(true);
    setError(null);
    
    try {
      const readingData = reading.reading_data;
      
      // Extrahiere Geburtsdaten
      const person1Data = readingData?.person1 || readingData?.name1 ? {
        name: readingData.person1?.name || readingData.name1 || 'Person 1',
        birthDate: readingData.person1?.birthdate || readingData.birthdate || readingData.birthDate1,
        birthTime: readingData.person1?.birthtime || readingData.birthtime || readingData.birthTime1 || '12:00',
        birthPlace: readingData.person1?.birthplace || readingData.birthplace || readingData.birthplace1
      } : null;

      const person2Data = readingData?.person2 || readingData?.name2 ? {
        name: readingData.person2?.name || readingData.name2 || 'Person 2',
        birthDate: readingData.person2?.birthdate || readingData.birthDate2,
        birthTime: readingData.person2?.birthtime || readingData.birthTime2 || '12:00',
        birthPlace: readingData.person2?.birthplace || readingData.birthplace2
      } : null;

      if (!person1Data || !person2Data) {
        throw new Error('Geburtsdaten nicht gefunden');
      }

      // Berechne beide Charts parallel
      const [chart1Response, chart2Response] = await Promise.all([
        fetch('/api/charts/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            birthDate: person1Data.birthDate,
            birthTime: person1Data.birthTime,
            birthPlace: typeof person1Data.birthPlace === 'string' ? {
              latitude: 52.52,
              longitude: 13.405,
              timezone: 'Europe/Berlin',
              name: person1Data.birthPlace
            } : person1Data.birthPlace
          })
        }),
        fetch('/api/charts/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            birthDate: person2Data.birthDate,
            birthTime: person2Data.birthTime,
            birthPlace: typeof person2Data.birthPlace === 'string' ? {
              latitude: 52.52,
              longitude: 13.405,
              timezone: 'Europe/Berlin',
              name: person2Data.birthPlace
            } : person2Data.birthPlace
          })
        })
      ]);

      if (!chart1Response.ok || !chart2Response.ok) {
        throw new Error('Fehler beim Berechnen der Charts');
      }

      const chart1 = await chart1Response.json();
      const chart2 = await chart2Response.json();

      // Konvertiere Centers
      const convertCenters = (definedCenters: string[]) => ({
        krone: definedCenters?.includes('Head') || definedCenters?.includes('HEAD') ? 'definiert' : 'undefiniert',
        ajna: definedCenters?.includes('Ajna') || definedCenters?.includes('AJNA') ? 'definiert' : 'undefiniert',
        kehle: definedCenters?.includes('Throat') || definedCenters?.includes('THROAT') ? 'definiert' : 'undefiniert',
        gZentrum: definedCenters?.includes('G') || definedCenters?.includes('G_CENTER') ? 'definiert' : 'undefiniert',
        herzEgo: definedCenters?.includes('Heart') || definedCenters?.includes('HEART') ? 'definiert' : 'undefiniert',
        sakral: definedCenters?.includes('Sacral') || definedCenters?.includes('SACRAL') ? 'definiert' : 'undefiniert',
        solarplexus: definedCenters?.includes('Solar') || definedCenters?.includes('SOLAR') ? 'definiert' : 'undefiniert',
        milz: definedCenters?.includes('Spleen') || definedCenters?.includes('SPLEEN') ? 'definiert' : 'undefiniert',
        wurzel: definedCenters?.includes('Root') || definedCenters?.includes('ROOT') ? 'definiert' : 'undefiniert',
      });

      setChartData({
        person1: {
          gates: chart1.chart?.gates || chart1.chart?.activeGates || [],
          centers: convertCenters(chart1.chart?.definedCenters),
          type: chart1.chart?.type,
          profile: chart1.chart?.profile,
          authority: chart1.chart?.authority,
          strategy: chart1.chart?.strategy,
          name: person1Data.name
        },
        person2: {
          gates: chart2.chart?.gates || chart2.chart?.activeGates || [],
          centers: convertCenters(chart2.chart?.definedCenters),
          type: chart2.chart?.type,
          profile: chart2.chart?.profile,
          authority: chart2.chart?.authority,
          strategy: chart2.chart?.strategy,
          name: person2Data.name
        }
      });
    } catch (err: any) {
      console.error('Fehler beim Berechnen der Charts:', err);
      setError(err.message || 'Fehler beim Berechnen der Charts');
    } finally {
      setCalculating(false);
    }
  };

  if (calculating) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ mb: 2, color: '#8A2BE2' }} />
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Berechne Charts...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
        <Typography variant="body2" sx={{ color: '#fff' }}>
          <strong>Fehler:</strong> {error}
        </Typography>
      </Alert>
    );
  }

  if (!chartData || !chartData.person1 || !chartData.person2) {
    return (
      <Alert severity="info" sx={{ background: 'rgba(138, 43, 226, 0.1)', border: '1px solid rgba(138, 43, 226, 0.3)' }}>
        <Typography variant="body2" sx={{ color: '#fff' }}>
          <strong>Hinweis:</strong> Chart-Daten werden berechnet...
        </Typography>
      </Alert>
    );
  }

  return (
    <ConnectionKeyAnalyzer
      person1Gates={chartData.person1.gates}
      person2Gates={chartData.person2.gates}
      person1Centers={chartData.person1.centers}
      person2Centers={chartData.person2.centers}
      person1Type={chartData.person1.type as any}
      person2Type={chartData.person2.type as any}
      person1Profile={chartData.person1.profile}
      person2Profile={chartData.person2.profile}
      person1Authority={chartData.person1.authority as any}
      person2Authority={chartData.person2.authority as any}
      person1Strategy={chartData.person1.strategy as any}
      person2Strategy={chartData.person2.strategy as any}
      person1Name={chartData.person1.name || 'Person 1'}
      person2Name={chartData.person2.name || 'Person 2'}
    />
  );
}

const ReadingContent: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [logoSrc, setLogoSrc] = useState('/images/connection-key-logo.png');
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  // isClient State entfernt für bessere Performance
  const [readings, setReadings] = useState<ReadingExtended[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'all' | 'connectionKey' | 'humanDesign'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newReadingDialog, setNewReadingDialog] = useState<boolean>(false);
  const [newReadingTitle, setNewReadingTitle] = useState('');
  const [newReadingQuestion, setNewReadingQuestion] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDatingType, setSelectedDatingType] = useState('');
  const [newReadingBirthdate, setNewReadingBirthdate] = useState('');
  const [newReadingBirthtime, setNewReadingBirthtime] = useState('');
  const [newReadingBirthplace, setNewReadingBirthplace] = useState('');
  const [newReadingEmail, setNewReadingEmail] = useState('');
  const [newReadingPhone, setNewReadingPhone] = useState('');
  
  // Chartvergleich States
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [chart1Data, setChart1Data] = useState<any>(null);
  const [chart2Data, setChart2Data] = useState<any>(null);
  const [selectedChart1, setSelectedChart1] = useState('');
  const [selectedChart2, setSelectedChart2] = useState('');
  const [friends, setFriends] = useState<any[]>([]);
  
  // Connection Key Analyse Modal
  const [showConnectionKeyModal, setShowConnectionKeyModal] = useState(false);
  const [selectedConnectionKeyReading, setSelectedConnectionKeyReading] = useState<ReadingExtended | null>(null);

  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Buchungen States
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingFilterTab, setBookingFilterTab] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);

  const loadFriends = useCallback(async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const response = await fetch(`/api/friends?userId=${userId}`);
      const data = await response.json();

      if (data.success && data.friends) {
        setFriends(data.friends);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Friends:', error);
    }
  }, []);

  const loadUserSubscription = useCallback(async () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = safeJsonParse(userData, {});
        // Subscription-Service wird später implementiert
        const subscription = null;
        setUserSubscription(subscription);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Abonnements:', error);
    }
  }, []);

  const loadReadings = useCallback(async () => {
    try {
      setLoading(true);
      // SSR-sicherer localStorage Zugriff
      if (typeof window !== 'undefined') {
        const localReadings = safeJsonParse(localStorage.getItem('userReadings') || '[]', []) as ReadingExtended[];
        setReadings(localReadings);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Readings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // URL-Parameter für Tab-Navigation prüfen
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) {
        const tabIndex = parseInt(tabParam);
        if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex <= 2) {
          setActiveTab(tabIndex);
        }
      }
    }
  }, []);

  // Authentifizierung und Subscription prüfen
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        // Keine Authentifizierung erforderlich - App ist öffentlich
        return;
      }
      
      // Daten laden
      loadReadings();
      loadUserSubscription();
      loadFriends();
      loadBookings();
    };

    checkAuth();
  }, [router, loadReadings, loadUserSubscription, loadFriends]);

  // Lade Buchungen
  const loadBookings = useCallback(async () => {
    try {
      setBookingsLoading(true);
      
      // Lade Buchungen aus localStorage
      const userBookingsData = localStorage.getItem('userBookings');
      let localBookings: any[] = [];

      if (userBookingsData) {
        const { safeJsonParse } = await import('@/lib/utils/safeJson');
        const parsed = safeJsonParse<any[]>(userBookingsData, []);
        localBookings = Array.isArray(parsed) ? parsed : [];
      }

      // Lade Coaching-Buchungen (falls API verfügbar)
      const userId = localStorage.getItem('userId');
      let coachingBookings: any[] = [];

      if (userId) {
        try {
          const response = await fetch(`/api/coaching/bookings/${userId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && Array.isArray(data.bookings)) {
              coachingBookings = data.bookings.map((b: any) => ({
                id: b.id,
                type: 'coaching',
                coach: b.coach?.name || 'Unbekannt',
                coachId: b.coachId,
                date: b.date,
                time: b.time,
                sessionType: b.sessionType,
                status: b.status || 'pending',
                paymentStatus: b.paymentStatus,
                meetingLink: b.meetingLink,
                notes: b.notes,
                createdAt: b.createdAt
              }));
            }
          }
        } catch (e) {
          console.log('Coaching API nicht verfügbar, verwende nur localStorage');
        }
      }

      // Kombiniere alle Buchungen
      const allBookings = [
        ...localBookings,
        ...coachingBookings
      ].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || 0).getTime();
        const dateB = new Date(b.createdAt || b.date || 0).getTime();
        return dateB - dateA;
      });

      setBookings(allBookings);
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  // Onboarding prüfen beim ersten Besuch
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasSeenOnboarding = localStorage.getItem('resonanzanalyse-onboarding-completed');
      if (!hasSeenOnboarding && readings.length === 0) {
        // Zeige Onboarding nur wenn keine Readings vorhanden sind
        setShowOnboarding(true);
      }
    }
  }, [readings.length]);

  const handleLogout = async () => {
    try {
      // Supabase Logout
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout Fehler:', error);
        return;
      }
      
      // LocalStorage leeren
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userData');
      // ✅ DEAKTIVIERT: profileSetupCompleted wird nicht mehr verwendet
      
      console.log('Erfolgreich abgemeldet');
      // Verzögerte Weiterleitung um Loop zu vermeiden
      setTimeout(() => router.push('/login'), 100);
    } catch (error) {
      console.error('Logout Fehler:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const createNewReading = async () => {
    if (!newReadingTitle || !newReadingQuestion || !newReadingBirthdate || !newReadingBirthtime || !newReadingBirthplace || !newReadingEmail) {
      alert('Bitte fülle alle Pflichtfelder aus!');
      return;
    }

    setLoading(true);
    try {
      // Hole User-ID
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') || 'anonymous' : 'anonymous';

      // Transformiere Legacy-Daten zu V2-Format
      const { mapLegacyToV2, mapV2ToLegacy } = await import('@/lib/utils/legacyReadingMapper');
      const legacyData = {
        userId,
        title: newReadingTitle,
        question: newReadingQuestion,
        category: selectedCategory,
        datingType: selectedDatingType,
        birthdate: newReadingBirthdate,
        birthtime: newReadingBirthtime,
        birthplace: newReadingBirthplace,
        email: newReadingEmail,
        phone: newReadingPhone
      };

      const v2Request = mapLegacyToV2(legacyData);
      if (!v2Request) {
        throw new Error('Fehler beim Transformieren der Reading-Daten');
      }

      // Sende Reading an V2-API
      const response = await fetch('/api/coach/readings-v2/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(v2Request)
      });

      const v2Data = await response.json();

      if (!response.ok) {
        throw new Error(v2Data.reading?.errorMessage || v2Data.error || 'Fehler beim Erstellen des Readings');
      }

      // Transformiere V2-Response zu Legacy-Format (für Kompatibilität)
      const legacyResponse = mapV2ToLegacy(v2Data);

      // Speichere auch lokal für Offline-Zugriff
      if (typeof window !== 'undefined') {
        const existingReadings = safeJsonParse(localStorage.getItem('userReadings') || '[]', []) as ReadingExtended[];
        existingReadings.push(legacyResponse.reading as ReadingExtended);
        localStorage.setItem('userReadings', JSON.stringify(existingReadings));
        localStorage.setItem('currentReadingId', legacyResponse.reading.id);
      }

      // Aktualisiere State
      loadReadings();
      setNewReadingDialog(false);
      
      // Reset Form
      setNewReadingTitle('');
      setNewReadingQuestion('');
      setSelectedCategory('');
      setSelectedDatingType('');
      setNewReadingBirthdate('');
      setNewReadingBirthtime('');
      setNewReadingBirthplace('');
      setNewReadingEmail('');
      setNewReadingPhone('');

      // Weiterleitung zur "Nächste Schritte"-Seite
      console.log('Reading erfolgreich erstellt, leite weiter...');
      
      // Verwende window.location als Fallback für robustere Weiterleitung
      if (typeof window !== 'undefined') {
        window.location.href = '/resonanzanalyse/next-steps';
      } else {
        router.push('/resonanzanalyse/next-steps');
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Readings:', error);
      alert(error instanceof Error ? error.message : 'Fehler beim Erstellen des Readings');
    } finally {
      setLoading(false);
    }
  };

  const generateReadingContent = (category: string, datingType: string, question: string): string => {
    try {
      // Erweiterte Reading-Struktur basierend auf dem 6/3 Generator Beispiel
      let content = `# 🧬 **${newReadingTitle}**\n\n`;
      content += `**📅 Erstellt am:** ${new Date().toLocaleDateString('de-DE')}\n`;
      content += `**🎯 Kategorie:** ${category}\n`;
      content += `**👤 Human Design Typ:** ${datingType}\n\n`;
      
      content += `## ❓ Deine Frage\n\n`;
      content += `*"${question}"*\n\n`;
      
      content += `---\n\n`;
      
      // Erweiterte Human Design Profile
      interface HDProfile {
        type: string;
        strategy: string;
        authority: string;
        profile: string;
        description: string;
        energy: string;
        strengths: string[];
        challenges: string[];
        centers: {
          defined: string[];
          open: string[];
        };
        business: {
          style: string;
          marketing: string;
          sales: string;
          formats: string[];
        };
      }
      
      const hdProfiles: Record<string, HDProfile> = {
        'Generator': {
          type: 'Generator',
          strategy: 'Reagieren',
          authority: 'Sakral-Autorität',
          profile: 'Lebenskraft und Ausdauer',
          description: 'Du bist die Lebenskraft des Planeten. Deine Energie ist konstant und zuverlässig.',
          energy: 'Lebenskraft und Ausdauer',
          strengths: ['Ausdauer', 'Zuverlässigkeit', 'Lebensfreude', 'Arbeitskraft', 'Konstante Energie'],
          challenges: ['Warten lernen', 'Nicht initiieren', 'Sakral-Signale hören', 'Frustration vermeiden'],
          centers: {
            defined: ['Sakral', 'Wurzel', 'Milz'],
            open: ['Ajna', 'Krone', 'Hals', 'Emotion', 'Ego', 'G-Zentrum']
          },
          business: {
            style: 'Reaktion + Erfahrung + Weisheit',
            marketing: 'Authentizität statt Strategie',
            sales: 'Resonanz statt Push',
            formats: ['Retreats', '1:1-Angebote', 'Storytelling', 'Prozess-basierte Programme']
          }
        },
        'Manifesting Generator': {
          type: 'Manifesting Generator',
          strategy: 'Warten auf die Antwort, dann informieren',
          authority: 'Sakral-Autorität',
          profile: 'Dynamische Lebenskraft',
          description: 'Du bist der dynamische Macher - du kannst sowohl initiieren als auch reagieren.',
          energy: 'Dynamische Lebenskraft',
          strengths: ['Flexibilität', 'Effizienz', 'Multi-Tasking', 'Energie', 'Schnelle Umsetzung'],
          challenges: ['Geduld', 'Kommunikation', 'Prioritäten setzen', 'Informieren lernen'],
          centers: {
            defined: ['Sakral', 'Wurzel', 'Milz'],
            open: ['Ajna', 'Krone', 'Hals', 'Emotion', 'Ego', 'G-Zentrum']
          },
          business: {
            style: 'Dynamik + Effizienz + Anpassung',
            marketing: 'Schnelle, effiziente Kommunikation',
            sales: 'Direkte, klare Angebote',
            formats: ['Online-Kurse', 'Schnelle Programme', 'Multi-Format-Angebote']
          }
        },
        'Projector': {
          type: 'Projector',
          strategy: 'Warten auf die Einladung',
          authority: 'Emotionale oder andere Autorität',
          profile: 'Führung und Beratung',
          description: 'Du bist der natürliche Führer und Berater. Du siehst andere klar.',
          energy: 'Führung und Beratung',
          strengths: ['Weisheit', 'Führungsqualitäten', 'Einsicht', 'Beratung', 'Tiefe Analyse'],
          challenges: ['Warten auf Einladungen', 'Nicht initiieren', 'Erkennung finden', 'Geduld'],
          centers: {
            defined: ['Milz', 'Wurzel'],
            open: ['Sakral', 'Ajna', 'Krone', 'Hals', 'Emotion', 'Ego', 'G-Zentrum']
          },
          business: {
            style: 'Weisheit + Führung + Beratung',
            marketing: 'Wertvolle Inhalte, die Einladungen schaffen',
            sales: 'Beratung und Führung',
            formats: ['Coaching', 'Beratung', 'Führungsprogramme', 'Mentoring']
          }
        },
        'Manifestor': {
          type: 'Manifestor',
          strategy: 'Informieren',
          authority: 'Emotionale oder andere Autorität',
          profile: 'Initiierung und Aktion',
          description: 'Du bist der Initiator. Du bringst Dinge in Bewegung.',
          energy: 'Initiierung und Aktion',
          strengths: ['Initiative', 'Unabhängigkeit', 'Durchsetzungskraft', 'Führung', 'Innovation'],
          challenges: ['Informieren lernen', 'Frieden schaffen', 'Andere einbeziehen', 'Geduld'],
          centers: {
            defined: ['Hals', 'Wurzel'],
            open: ['Sakral', 'Ajna', 'Krone', 'Milz', 'Emotion', 'Ego', 'G-Zentrum']
          },
          business: {
            style: 'Initiierung + Innovation + Führung',
            marketing: 'Bahnbrechende Ideen und Innovationen',
            sales: 'Überzeugungskraft und Durchsetzung',
            formats: ['Startups', 'Innovationsprogramme', 'Führungskräfte-Entwicklung']
          }
        },
        'Reflector': {
          type: 'Reflector',
          strategy: 'Warten auf den Mondzyklus',
          authority: 'Mond-Autorität',
          profile: 'Spiegel der Gemeinschaft',
          description: 'Du bist der Spiegel der Gemeinschaft. Du reflektierst die Gesundheit der Gruppe.',
          energy: 'Spiegel der Gemeinschaft',
          strengths: ['Objektivität', 'Gemeinschaftsgefühl', 'Flexibilität', 'Weisheit', 'Spiegelfunktion'],
          challenges: ['Entscheidungen treffen', 'Mondzyklus befolgen', 'Schutz vor Einflüssen', 'Geduld'],
          centers: {
            defined: [],
            open: ['Sakral', 'Ajna', 'Krone', 'Hals', 'Milz', 'Emotion', 'Ego', 'G-Zentrum', 'Wurzel']
          },
          business: {
            style: 'Spiegelung + Gemeinschaft + Weisheit',
            marketing: 'Gemeinschaftsorientierte Inhalte',
            sales: 'Gemeinschaftsbildung und Verbindung',
            formats: ['Community-Programme', 'Gruppen-Coaching', 'Gemeinschafts-Events']
          }
        }
      };
      
      const userProfile = hdProfiles[datingType] || hdProfiles['Generator'];
      
      // Vollständiges Human Design Profil
      content += `## 🧬 **${userProfile.type} mit ${userProfile.authority}**\n\n`;
      content += `**Typ:** ${userProfile.type}\n`;
      content += `**Strategie:** ${userProfile.strategy}\n`;
      content += `**Autorität:** ${userProfile.authority}\n`;
      content += `**Profil:** ${userProfile.profile}\n\n`;
      
      content += `### 🔋 **Typ: ${userProfile.type}**\n\n`;
      content += `${userProfile.description}\n\n`;
      
      content += `**Was dich stärkt:**\n\n`;
      userProfile.strengths.forEach((strength: string) => {
        content += `* ${strength}\n`;
      });
      content += `\n`;
      
      content += `**Deine Herausforderungen:**\n\n`;
      userProfile.challenges.forEach((challenge: string) => {
        content += `* ${challenge}\n`;
      });
      content += `\n`;
      
      content += `### 🌊 **Autorität: ${userProfile.authority}**\n\n`;
      if (userProfile.authority === 'Sakral-Autorität') {
        content += `Du triffst Entscheidungen über dein Bauchgefühl. Dein Sakralzentrum gibt dir klare Ja-/Nein-Antworten.\n\n`;
        content += `**Entscheidungsstil:**\n`;
        content += `* Höre auf deine Sakral-Antworten (Ah-hah, Uh-uh)\n`;
        content += `* Vertraue deinem ersten Gefühl\n`;
        content += `* Warte auf die richtige Frage\n`;
        content += `* Reagiere spontan auf das, was dich begeistert\n\n`;
      } else if (userProfile.authority === 'Emotionale oder andere Autorität') {
        content += `Du triffst Entscheidungen nicht spontan – du brauchst Zeit, um durch deine emotionale Welle zu gehen.\n\n`;
        content += `**Entscheidungsstil:**\n`;
        content += `* Warte, bis du emotional ausgeglichen bist\n`;
        content += `* Beobachte deine Hoch- und Tiefphasen\n`;
        content += `* Triff keine Entscheidungen in Euphorie oder Verzweiflung\n`;
        content += `* Gib dir mehrere Tage Bedenkzeit bei großen Entscheidungen\n\n`;
      } else if (userProfile.authority === 'Mond-Autorität') {
        content += `Du brauchst einen vollen Mondzyklus (28 Tage), um wichtige Entscheidungen zu treffen.\n\n`;
        content += `**Entscheidungsstil:**\n`;
        content += `* Warte auf den Mondzyklus\n`;
        content += `* Sammle Informationen über 28 Tage\n`;
        content += `* Beobachte deine Reaktionen auf verschiedene Optionen\n`;
        content += `* Vertraue auf die Klarheit nach dem Zyklus\n\n`;
      }
      
      content += `### 🌀 **Zentren**\n\n`;
      content += `**Definiert:**\n`;
      userProfile.centers.defined.forEach((center: string) => {
        content += `* **${center}**: Stabile, zuverlässige Energie\n`;
      });
      content += `\n`;
      
      content += `**Offen:**\n`;
      userProfile.centers.open.forEach((center: string) => {
        content += `* **${center}**: Empfänglich für Einflüsse - hier kannst du wachsen\n`;
      });
      content += `\n`;
      
      content += `---\n\n`;
      
      // Business & Marketing Bereich (falls relevant)
      if (category === 'business' || category === 'career' || category === 'leadership') {
        content += `## 🔥 **Business & Marketing als ${userProfile.type}**\n\n`;
        content += `### 🧭 **Grundenergie im Business: ${userProfile.business.style}**\n\n`;
        content += `### 📈 **Dein natürlicher Marketingstil: ${userProfile.business.marketing}**\n\n`;
        content += `### 💬 **Verkaufsenergie: ${userProfile.business.sales}**\n\n`;
        content += `### 🛠️ **Konkrete Businessformate, die zu dir passen:**\n\n`;
        userProfile.business.formats.forEach((format: string) => {
          content += `| 🔹 ${format} | Deine natürliche Stärke in diesem Bereich |\n`;
        });
        content += `\n`;
        
        content += `### 🧠 **Dein ideales Marketingmantra:**\n\n`;
        content += `> **"Ich bin kein Produkt. Ich bin Erfahrung, Reife und Echtheit."**\n`;
        content += `> **"Ich muss nicht verkaufen – ich muss sichtbar sein in meinem Prozess."**\n\n`;
        
        content += `### 🚫 **Warnsignale, dass du dich im Business verlierst:**\n\n`;
        content += `* Du machst etwas, nur weil „man das so macht"\n`;
        content += `* Du bist im Launch, fühlst dich aber leer\n`;
        content += `* Du passt dich an den Markt an und verlierst deine Stimme\n`;
        content += `* Du verbirgst Fehler – obwohl sie deine Stärke wären\n\n`;
        
        content += `---\n\n`;
      }
      
      // Kategorie-spezifische Bereiche
      content += `## 🔍 **Detaillierte Bereiche**\n\n`;
      
      interface DetailedArea {
        title: string;
        areas: Array<{
          name: string;
          content: string;
        }>;
      }
      
      const detailedAreas: Record<string, DetailedArea> = {
        'first-date': {
          title: '💕 First Date Bereich',
          areas: [
            {
              name: 'Ort & Aktivität',
              content: `Wähle einen Ort, der zu deiner ${userProfile.type}-Energie passt. ${userProfile.type === 'Generator' ? 'Generatoren lieben Aktivität und Bewegung.' : userProfile.type === 'Projector' ? 'Projectors bevorzugen ruhige Gespräche und tiefe Verbindung.' : userProfile.type === 'Manifestor' ? 'Manifestors brauchen Raum für Initiative und Führung.' : 'Reflectors brauchen Zeit und Raum zum Spiegeln.'}`
            },
            {
              name: 'Kommunikation',
              content: `Sei authentisch und folge deiner inneren Autorität. ${userProfile.type === 'Generator' ? 'Generatoren warten auf Fragen und reagieren spontan.' : userProfile.type === 'Projector' ? 'Projectors teilen Weisheit nur bei Einladung.' : userProfile.type === 'Manifestor' ? 'Manifestors informieren über ihre Pläne.' : 'Reflectors brauchen Zeit für ihre Antworten.'}`
            },
            {
              name: 'Energie-Management',
              content: 'Achte auf die Energie deines Dates. Manche brauchen mehr Raum, andere mehr Nähe. Respektiere die unterschiedlichen Bedürfnisse und folge deiner eigenen Energie.'
            },
            {
              name: 'Nach dem Date',
              content: 'Reflektiere über deine Energie und Reaktionen. Was hat sich gut angefühlt? Was war herausfordernd? Nutze diese Erkenntnisse für zukünftige Dates.'
            }
          ]
        },
        'relationship': {
          title: '💑 Beziehungs-Bereich',
          areas: [
            {
              name: 'Energie-Dynamik',
              content: `Verstehe die Energie-Dynamik zwischen euch. Als ${userProfile.type} bringst du ${userProfile.energy} in die Beziehung. Wie ergänzen sich eure Energien?`
            },
            {
              name: 'Kommunikationsstrategien',
              content: `Respektiere die unterschiedlichen Strategien. Als ${userProfile.type} folgst du der Strategie "${userProfile.strategy}". Kommuniziere das klar mit deinem Partner.`
            },
            {
              name: 'Gemeinsame Channels',
              content: 'Nutze eure gemeinsamen Channels für tiefere Verbindung. Diese sind eure natürlichen Verbindungspunkte und zeigen eure gemeinsamen Talente.'
            },
            {
              name: 'Wachstum zusammen',
              content: 'Arbeite an euren individuellen Wachstumsbereichen. Unterstützt euch gegenseitig beim Lernen und Wachsen, besonders in den offenen Centers.'
            }
          ]
        },
        'communication': {
          title: '💬 Kommunikations-Bereich',
          areas: [
            {
              name: `${userProfile.type} Kommunikation`,
              content: `${userProfile.type === 'Generator' ? 'Warte auf die richtige Frage, bevor du antwortest. Deine Sakral-Autorität zeigt dir, wann du wirklich antworten solltest.' : userProfile.type === 'Projector' ? 'Teile deine Weisheit, aber nur wenn du eingeladen wirst. Deine Einsichten sind wertvoll, aber nur wenn sie gewünscht sind.' : userProfile.type === 'Manifestor' ? 'Informiere andere über deine Pläne. Kommunikation ist der Schlüssel zu friedlichen Beziehungen.' : 'Nimm dir Zeit für wichtige Entscheidungen. Der Mondzyklus gibt dir die Klarheit, die du brauchst.'}`
            },
            {
              name: 'Authentische Kommunikation',
              content: 'Kommuniziere aus deiner wahren Natur heraus. Sei ehrlich über deine Bedürfnisse und Grenzen.'
            },
            {
              name: 'Energie-basierte Kommunikation',
              content: 'Achte auf die Energie deines Gesprächspartners. Verschiedene Typen brauchen verschiedene Arten der Kommunikation.'
            },
            {
              name: 'Konfliktlösung',
              content: 'Nutze deine Human Design Weisheit für bessere Konfliktlösung. Verstehe die Energie des anderen und finde gemeinsame Lösungen.'
            }
          ]
        },
        'career': {
          title: '💼 Karriere-Bereich',
          areas: [
            {
              name: 'Energie & Arbeit',
              content: `Finde Arbeit, die zu deiner ${userProfile.type}-Energie passt. ${userProfile.type === 'Generator' ? 'Generatoren brauchen befriedigende Arbeit, die sie energetisiert.' : userProfile.type === 'Projector' ? 'Projectors suchen Anerkennung und Führungsrollen.' : userProfile.type === 'Manifestor' ? 'Manifestors brauchen Freiheit und Initiative.' : 'Reflectors brauchen vielfältige Erfahrungen.'}`
            },
            {
              name: 'Strategie im Beruf',
              content: `Wende deine Strategie "${userProfile.strategy}" auch im Beruf an. Warte auf die richtigen Gelegenheiten und folge deiner Autorität.`
            },
            {
              name: 'Wachstum & Entwicklung',
              content: 'Nutze deine offenen Centers für berufliches Wachstum. Sie zeigen dir, wo du lernen und dich entwickeln kannst.'
            },
            {
              name: 'Zusammenarbeit',
              content: 'Verstehe die Energie deiner Kollegen. Verschiedene Typen brauchen verschiedene Arten der Zusammenarbeit und Führung.'
            }
          ]
        },
        'health': {
          title: '🌱 Gesundheits-Bereich',
          areas: [
            {
              name: 'Energie-Management',
              content: `Achte auf deine Energie. Als ${userProfile.type} brauchst du ${userProfile.type === 'Generator' ? 'Bewegung und befriedigende Aktivitäten.' : userProfile.type === 'Projector' ? 'Ruhe und Anerkennung.' : userProfile.type === 'Manifestor' ? 'Freiheit und Initiative.' : 'Zeit und Raum zum Spiegeln.'}`
            },
            {
              name: 'Ernährung',
              content: 'Höre auf deine innere Autorität bei der Ernährung. Dein Körper weiß, was er braucht, wenn du ihm zuhörst.'
            },
            {
              name: 'Stress-Management',
              content: 'Verstehe deine Stress-Signale. Offene Centers zeigen dir, wo du anfällig für Stress bist und wie du dich schützen kannst.'
            },
            {
              name: 'Wohlbefinden',
              content: `Folge deiner Strategie "${userProfile.strategy}" für besseres Wohlbefinden. Sie ist dein Kompass für ein gesundes Leben.`
            }
          ]
        },
        'marketing': {
          title: '📈 Marketing & Verkauf',
          areas: [
            {
              name: 'Authentisches Marketing',
              content: `Als ${userProfile.type} funktioniert für dich ${userProfile.business.marketing}. Zeige deine echte Persönlichkeit und teile deine Erfahrungen.`
            },
            {
              name: 'Verkaufsstrategie',
              content: `Deine Verkaufsenergie ist ${userProfile.business.sales}. Nutze deine natürlichen Stärken für authentische Verkaufsgespräche.`
            },
            {
              name: 'Content-Erstellung',
              content: 'Erstelle Inhalte, die zu deiner Energie passen. Teile deine Geschichte und deine Erfahrungen authentisch.'
            },
            {
              name: 'Kundenbeziehungen',
              content: 'Baue echte Beziehungen zu deinen Kunden auf. Deine Human Design Weisheit hilft dir, die richtigen Menschen anzusprechen.'
            }
          ]
        },
        'entrepreneurship': {
          title: '💡 Unternehmertum',
          areas: [
            {
              name: 'Geschäftsidee entwickeln',
              content: `Als ${userProfile.type} bringst du ${userProfile.energy} in dein Unternehmen. Nutze deine natürlichen Talente für deine Geschäftsidee.`
            },
            {
              name: 'Strategie & Planung',
              content: `Folge deiner Strategie "${userProfile.strategy}" auch im Business. Plane nicht zu detailliert, sondern reagiere auf Gelegenheiten.`
            },
            {
              name: 'Team aufbauen',
              content: 'Baue ein Team auf, das deine Energie ergänzt. Verstehe die verschiedenen Human Design Typen für bessere Zusammenarbeit.'
            },
            {
              name: 'Wachstum & Skalierung',
              content: 'Skaliere dein Business im Einklang mit deiner Energie. Erzwinge kein Wachstum, das nicht zu dir passt.'
            }
          ]
        },
        'teamwork': {
          title: '👥 Teamarbeit',
          areas: [
            {
              name: 'Team-Dynamik verstehen',
              content: `Als ${userProfile.type} bringst du ${userProfile.energy} ins Team. Verstehe die Energie deiner Teammitglieder für bessere Zusammenarbeit.`
            },
            {
              name: 'Kommunikation im Team',
              content: 'Nutze deine Human Design Weisheit für bessere Teamkommunikation. Verschiedene Typen brauchen verschiedene Kommunikationsstile.'
            },
            {
              name: 'Konflikte lösen',
              content: 'Löse Teamkonflikte durch Verständnis der verschiedenen Energien. Jeder Typ hat andere Bedürfnisse und Reaktionsweisen.'
            },
            {
              name: 'Produktivität steigern',
              content: 'Steigere die Teamproduktivität durch optimale Energieverteilung. Nutze die Stärken jedes Teammitglieds.'
            }
          ]
        },
        'job-search': {
          title: '🔍 Jobsuche',
          areas: [
            {
              name: 'Richtige Jobs finden',
              content: `Suche Jobs, die zu deiner ${userProfile.type}-Energie passen. ${userProfile.type === 'Generator' ? 'Generatoren brauchen befriedigende Arbeit.' : userProfile.type === 'Projector' ? 'Projectors suchen Anerkennung und Führung.' : userProfile.type === 'Manifestor' ? 'Manifestors brauchen Freiheit und Initiative.' : 'Reflectors brauchen vielfältige Erfahrungen.'}`
            },
            {
              name: 'Bewerbungsstrategie',
              content: `Nutze deine Strategie "${userProfile.strategy}" auch bei der Jobsuche. Warte auf die richtigen Gelegenheiten und folge deiner Autorität.`
            },
            {
              name: 'Vorstellungsgespräche',
              content: 'Sei authentisch in Vorstellungsgesprächen. Zeige deine echte Persönlichkeit und deine Human Design Stärken.'
            },
            {
              name: 'Networking',
              content: 'Baue echte berufliche Beziehungen auf. Nutze deine Human Design Weisheit für authentisches Networking.'
            }
          ]
        },
        'skills': {
          title: '🎯 Fähigkeiten entwickeln',
          areas: [
            {
              name: 'Natürliche Talente nutzen',
              content: `Entwickle deine natürlichen ${userProfile.type}-Talente. Nutze deine definierten Centers für deine Stärken.`
            },
            {
              name: 'Wachstumsbereiche',
              content: 'Arbeite an deinen offenen Centers für persönliches Wachstum. Sie zeigen dir, wo du lernen und dich entwickeln kannst.'
            },
            {
              name: 'Lernstrategien',
              content: `Lerne im Einklang mit deiner Strategie "${userProfile.strategy}". Finde Lernmethoden, die zu deiner Energie passen.`
            },
            {
              name: 'Fähigkeiten anwenden',
              content: 'Wende deine Fähigkeiten authentisch an. Nutze deine Human Design Weisheit für bessere Anwendung deiner Talente.'
            }
          ]
        },
        'networking': {
          title: '🤝 Networking',
          areas: [
            {
              name: 'Authentische Verbindungen',
              content: `Baue echte Verbindungen auf, die zu deiner ${userProfile.type}-Energie passen. Sei authentisch in deinen Beziehungen.`
            },
            {
              name: 'Networking-Strategie',
              content: `Nutze deine Strategie "${userProfile.strategy}" auch beim Networking. Warte auf die richtigen Gelegenheiten und Menschen.`
            },
            {
              name: 'Wertvolle Beziehungen',
              content: 'Baue wertvolle berufliche Beziehungen auf. Verstehe die verschiedenen Human Design Typen für bessere Verbindungen.'
            },
            {
              name: 'Gegenseitige Unterstützung',
              content: 'Unterstütze andere und lass dich unterstützen. Nutze deine Human Design Weisheit für gegenseitige Hilfe.'
            }
          ]
        },
        'team-management': {
          title: '👥 Team-Management',
          areas: [
            {
              name: 'Führungsstil entwickeln',
              content: `Als ${userProfile.type} entwickle einen Führungsstil, der zu deiner Energie passt. Nutze deine natürlichen Führungsqualitäten.`
            },
            {
              name: 'Team-Energie verstehen',
              content: 'Verstehe die Energie deines Teams. Verschiedene Human Design Typen brauchen verschiedene Führungsansätze.'
            },
            {
              name: 'Motivation & Engagement',
              content: 'Motiviere dein Team durch Verständnis ihrer individuellen Bedürfnisse. Jeder Typ hat andere Motivationsfaktoren.'
            },
            {
              name: 'Performance-Management',
              content: 'Führe Performance-Gespräche im Einklang mit Human Design Prinzipien. Verstehe die Stärken und Wachstumsbereiche jedes Teammitglieds.'
            }
          ]
        },
        'decision-making': {
          title: '🎯 Entscheidungsfindung',
          areas: [
            {
              name: 'Entscheidungsprozess',
              content: `Nutze deine ${userProfile.authority} für bessere Entscheidungen. Folge deiner inneren Autorität bei wichtigen Entscheidungen.`
            },
            {
              name: 'Team-Entscheidungen',
              content: 'Führe Team-Entscheidungen durch Verständnis der verschiedenen Autoritäten. Jeder Typ hat andere Entscheidungsprozesse.'
            },
            {
              name: 'Strategische Planung',
              content: `Plane strategisch im Einklang mit deiner Strategie "${userProfile.strategy}". Erzwinge keine Entscheidungen, die nicht zu dir passen.`
            },
            {
              name: 'Risikobewertung',
              content: 'Bewerte Risiken durch deine Human Design Weisheit. Nutze deine natürliche Intuition für bessere Entscheidungen.'
            }
          ]
        }
      };
      
      const selectedArea = detailedAreas[category] || detailedAreas['first-date'];
      
      content += `### ${selectedArea.title}\n\n`;
      
      selectedArea.areas.forEach((area, index: number) => {
        content += `#### ${index + 1}. ${area.name}\n\n`;
        content += `${area.content}\n\n`;
      });
      
      content += `---\n\n`;
      
      // Praktische Übungen
      content += `## 🎯 **Praktische Übungen**\n\n`;
      content += `### Diese Woche:\n\n`;
      content += `• **Tag 1-2:** Beobachte deine Energie und Reaktionen\n`;
      content += `• **Tag 3-4:** Experimentiere mit deiner Strategie "${userProfile.strategy}"\n`;
      content += `• **Tag 5-6:** Arbeite an einem Wachstumsbereich\n`;
      content += `• **Tag 7:** Reflektiere über deine Erfahrungen\n\n`;
      
      content += `### Nächste Schritte:\n\n`;
      content += `• Vertraue auf deine innere Weisheit\n`;
      content += `• Sei geduldig mit dir selbst und dem Prozess\n`;
      content += `• Dokumentiere deine Erkenntnisse\n`;
      content += `• Teile deine Erfahrungen mit anderen\n\n`;
      
      content += `---\n\n`;
      content += `*Dieses Reading wurde basierend auf Human Design Prinzipien erstellt und ist eine persönliche Interpretation deiner energetischen Struktur.*\n\n`;
      content += `*Für ein persönliches Reading wende dich an einen zertifizierten Human Design Berater.*`;
      
      return content;
    } catch (error) {
      console.error('Fehler in generateReadingContent:', error);
      return `📖 **${newReadingTitle}**\n\n**Deine Frage:** ${question}\n\n**✨ Allgemeine Human Design Insights:**\n\nBasierend auf deiner Frage und deinem Human Design hier einige wertvolle Erkenntnisse:\n\n• Folge immer deiner inneren Autorität bei wichtigen Entscheidungen\n• Nutze deine Strategie als Kompass für dein Leben\n• Arbeite an deinen offenen Centers für persönliches Wachstum\n• Verstehe deine Definition für bessere Beziehungen\n\n**🎯 Nächste Schritte:**\n• Beobachte deine Energie und Reaktionen in den nächsten Tagen\n• Experimentiere mit den gegebenen Tipps\n• Vertraue auf deine innere Weisheit\n• Sei geduldig mit dir selbst und dem Prozess\n\n*Dieses Reading wurde basierend auf Human Design Prinzipien erstellt.*`;
    }
  };

  // isClient Check entfernt - Seite lädt sofort

  return (
    <AccessControl 
      path={pathname} 
      userSubscription={userSubscription}
      onUpgrade={() => router.push('/pricing')}
    >
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
        radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
        radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
        linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Gold Stars Background */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 }}>
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
            style={{
              position: 'absolute',
              width: `${10 + i * 2}px`,
              height: `${10 + i * 2}px`,
              background: `radial-gradient(circle, rgba(242, 159, 5, ${0.6 - i * 0.05}), transparent 70%)`,
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              pointerEvents: 'none',
            }}
          />
        ))}
      </Box>

      {/* Onboarding Dialog */}
      <Dialog
        open={showOnboarding}
        onClose={() => {
          setShowOnboarding(false);
          localStorage.setItem('resonanzanalyse-onboarding-completed', 'true');
        }}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 100%)',
            borderRadius: 4,
            border: '2px solid rgba(242, 159, 5, 0.3)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.2), rgba(140, 29, 4, 0.2))',
          borderBottom: '2px solid rgba(242, 159, 5, 0.3)',
          color: '#fff',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 3,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ fontSize: 32 }}>✨</Box>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
              Willkommen bei der Resonanzanalyse
            </Typography>
          </Box>
          <Button
            onClick={() => {
              setShowOnboarding(false);
              localStorage.setItem('resonanzanalyse-onboarding-completed', 'true');
            }}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              minWidth: 'auto',
              '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <Close />
          </Button>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="h6" sx={{ color: '#F29F05', mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MenuBook sx={{ fontSize: 28 }} />
                Was ist Resonanzanalyse?
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.8 }}>
                Die Resonanzanalyse zeigt dir die energetische Verbindung zwischen zwei Menschen basierend auf Human Design. 
                Sie offenbart, wo Resonanz, Ergänzung oder Spannung entsteht – also, wo das gemeinsame Feld "andockt".
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ color: '#F29F05', mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonAdd sx={{ fontSize: 28 }} />
                Wie erstelle ich ein Reading?
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Typography sx={{ color: '#F29F05', fontSize: '1.5rem', fontWeight: 700 }}>1.</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', flex: 1 }}>
                    Klicke auf <strong>"Connection Key erstellen"</strong> oder <strong>"Neues Reading"</strong>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Typography sx={{ color: '#F29F05', fontSize: '1.5rem', fontWeight: 700 }}>2.</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', flex: 1 }}>
                    Gib die Geburtsdaten von dir und der anderen Person ein
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Typography sx={{ color: '#F29F05', fontSize: '1.5rem', fontWeight: 700 }}>3.</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', flex: 1 }}>
                    Wähle eine Kategorie (Dating, Business, Persönlich, etc.) und beschreibe dein Anliegen
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Typography sx={{ color: '#F29F05', fontSize: '1.5rem', fontWeight: 700 }}>4.</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', flex: 1 }}>
                    Sende deine Anfrage ab – du wirst zu den nächsten Schritten weitergeleitet
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ color: '#F29F05', mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Visibility sx={{ fontSize: 28 }} />
                Wie sehe ich meine Readings?
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.8, mb: 2 }}>
                Alle deine Readings findest du im Tab <strong>"📚 Meine Readings"</strong>. Dort kannst du:
              </Typography>
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Typography sx={{ color: '#F29F05', fontSize: '1.2rem' }}>→</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', flex: 1 }}>
                    Deine Readings filtern und durchsuchen
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Typography sx={{ color: '#F29F05', fontSize: '1.2rem' }}>→</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', flex: 1 }}>
                    Connection Key Resonanzanalysen ansehen (Button "🩵 Resonanzanalyse")
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Typography sx={{ color: '#F29F05', fontSize: '1.2rem' }}>→</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', flex: 1 }}>
                    PDFs herunterladen (wenn freigegeben)
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" sx={{ color: '#F29F05', mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CompareArrows sx={{ fontSize: 28 }} />
                Was ist Chartvergleich?
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.8 }}>
                Im Tab <strong>"🔄 Chartvergleich"</strong> kannst du zwei Human Design Charts direkt vergleichen und 
                die energetischen Verbindungen zwischen ihnen entdecken.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(242, 159, 5, 0.3)' }}>
          <Button
            onClick={() => {
              setShowOnboarding(false);
              localStorage.setItem('resonanzanalyse-onboarding-completed', 'true');
            }}
            variant="outlined"
            sx={{
              borderColor: 'rgba(242, 159, 5, 0.5)',
              color: '#F29F05',
              '&:hover': {
                borderColor: '#F29F05',
                background: 'rgba(242, 159, 5, 0.1)',
              }
            }}
          >
            Überspringen
          </Button>
          <Button
            onClick={() => {
              setShowOnboarding(false);
              localStorage.setItem('resonanzanalyse-onboarding-completed', 'true');
              router.push('/resonanzanalyse/sofort');
            }}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              fontWeight: 700,
              px: 4,
              '&:hover': {
                background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
              }
            }}
            endIcon={<ArrowForward />}
          >
            Jetzt Reading erstellen
          </Button>
        </DialogActions>
      </Dialog>

      <PageLayout activePage="dashboard" showLogo={true} maxWidth="lg">
        <Box sx={{ position: 'relative', zIndex: 2, py: { xs: 2, md: 4 } }}>

        {/* Die Resonanzanalyse - Energetischer Kompass */}
        <Box sx={{ 
          mb: 6,
          mt: 4
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Box sx={{
              maxWidth: '900px',
              mx: 'auto',
              px: { xs: 2, md: 4 }
            }}>
              <Typography variant="h4" sx={{
                textAlign: 'center',
                mb: 3,
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}>
                🧭 Die Resonanzanalyse ist der energetische Kompass des Systems
              </Typography>

              <Typography variant="body1" sx={{
                color: 'rgba(255, 255, 255, 0.85)',
                mb: 4,
                lineHeight: 1.8,
                fontSize: { xs: '1rem', md: '1.15rem' },
                textAlign: 'center',
                maxWidth: '800px',
                mx: 'auto'
              }}>
                Sie zeigt, wie stark die Verbindung zwischen Bewusstsein, Energie und System (Server, Daten, Mensch) schwingt – also wie „sauber" der energetische Fluss ist.
              </Typography>

              <Box sx={{
                background: 'rgba(242, 159, 5, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(242, 159, 5, 0.2)',
                borderRadius: 4,
                p: { xs: 3, md: 4 },
                maxWidth: '800px',
                mx: 'auto'
              }}>
                <Typography variant="h6" sx={{
                  color: '#F29F05',
                  mb: 3,
                  fontWeight: 700,
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  textAlign: 'center'
                }}>
                  Sie dient als diagnostischer Teil des „Connecting Keys":
                </Typography>

                <Stack spacing={2.5} sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Typography sx={{ 
                      color: '#F29F05', 
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      lineHeight: 1,
                      mt: 0.5
                    }}>
                      →
                    </Typography>
                    <Typography variant="body1" sx={{
                      color: 'rgba(255, 255, 255, 0.85)',
                      lineHeight: 1.8,
                      fontSize: { xs: '0.95rem', md: '1.05rem' },
                      flex: 1
                    }}>
                      <strong>Wo besteht Resonanz</strong> (Harmonie, Synchronität)?
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Typography sx={{ 
                      color: '#F29F05', 
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      lineHeight: 1,
                      mt: 0.5
                    }}>
                      →
                    </Typography>
                    <Typography variant="body1" sx={{
                      color: 'rgba(255, 255, 255, 0.85)',
                      lineHeight: 1.8,
                      fontSize: { xs: '0.95rem', md: '1.05rem' },
                      flex: 1
                    }}>
                      <strong>Wo Dissonanz</strong> (Blockaden, Fehlkommunikation, Energieverlust)?
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </motion.div>
        </Box>

        {/* Call-to-Action: Resonanzanalyse erstellen */}
        <Box sx={{ 
          mb: 6,
          mt: 4,
          display: 'flex',
          justifyContent: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/resonanzanalyse/sofort')}
              startIcon={<PersonAdd sx={{ fontSize: 28 }} />}
              endIcon={<ArrowForward sx={{ fontSize: 24 }} />}
              sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                color: 'white',
                fontWeight: 700,
                px: 6,
                py: 2.5,
                fontSize: { xs: '1rem', md: '1.2rem' },
                borderRadius: 4,
                boxShadow: '0 8px 25px rgba(242, 159, 5, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 35px rgba(242, 159, 5, 0.5)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              🩵 Jetzt Resonanzanalyse erstellen
            </Button>
          </motion.div>
        </Box>

          {/* Main Content */}
          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: 4,
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(242, 159, 5, 0.3)',
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)'
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  py: 2,
                  '&.Mui-selected': {
                    color: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.1)',
                  },
                },
                '& .MuiTabs-indicator': {
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  height: 3,
                  borderRadius: 2
                },
              }}
            >
              <Tab label="📚 Meine Readings" />
              <Tab label="🔄 Chartvergleich" />
              <Tab label="📅 Meine Buchungen" />
            </Tabs>

            <Box sx={{ p: 4 }}>
              {activeTab === 0 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                      Deine Readings
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* Quick Actions */}
                      <Button
                        variant="contained"
                        component={Link}
                        href="/resonanzanalyse/sofort"
                        startIcon={<ArrowForward />}
                        sx={{
                          background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                          }
                        }}
                      >
                        ✨ Sofort-Analyse
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ArrowForward />}
                        onClick={() => router.push('/resonanzanalyse/sofort')}
                        sx={{
                          borderColor: 'rgba(242, 159, 5, 0.5)',
                          color: '#F29F05',
                          '&:hover': {
                            borderColor: '#F29F05',
                            background: 'rgba(242, 159, 5, 0.1)',
                          }
                        }}
                      >
                        Connection Key
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<ArrowForward />}
                        onClick={() => setNewReadingDialog(true)}
                        sx={{
                          borderColor: 'rgba(242, 159, 5, 0.5)',
                          color: '#F29F05',
                          '&:hover': {
                            borderColor: '#F29F05',
                            background: 'rgba(242, 159, 5, 0.1)',
                          }
                        }}
                      >
                        Human Design
                      </Button>
                    </Box>
                  </Box>

                  {/* Filter & Search Bar */}
                  <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField
                      placeholder="Readings durchsuchen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search sx={{ color: 'rgba(255,255,255,0.5)' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        flex: 1,
                        minWidth: 200,
                        '& .MuiOutlinedInput-root': {
                          color: 'white',
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                          '&:hover fieldset': { borderColor: '#F29F05' },
                          '&.Mui-focused fieldset': { borderColor: '#F29F05' },
                        },
                      }}
                    />
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                      <Chip
                        label="Alle"
                        onClick={() => setFilterType('all')}
                        variant={filterType === 'all' ? 'filled' : 'outlined'}
                        sx={{
                          background: filterType === 'all' ? 'rgba(242, 159, 5, 0.3)' : 'transparent',
                          borderColor: 'rgba(242, 159, 5, 0.5)',
                          color: '#F29F05',
                          cursor: 'pointer',
                          '&:hover': {
                            background: 'rgba(242, 159, 5, 0.2)',
                          }
                        }}
                      />
                      <Chip
                        label="Connection Key"
                        onClick={() => setFilterType('connectionKey')}
                        variant={filterType === 'connectionKey' ? 'filled' : 'outlined'}
                        sx={{
                          background: filterType === 'connectionKey' ? 'rgba(242, 159, 5, 0.3)' : 'transparent',
                          borderColor: 'rgba(242, 159, 5, 0.5)',
                          color: '#F29F05',
                          cursor: 'pointer',
                          '&:hover': {
                            background: 'rgba(242, 159, 5, 0.2)',
                          }
                        }}
                      />
                      <Chip
                        label="Human Design"
                        onClick={() => setFilterType('humanDesign')}
                        variant={filterType === 'humanDesign' ? 'filled' : 'outlined'}
                        sx={{
                          background: filterType === 'humanDesign' ? 'rgba(242, 159, 5, 0.3)' : 'transparent',
                          borderColor: 'rgba(242, 159, 5, 0.5)',
                          color: '#F29F05',
                          cursor: 'pointer',
                          '&:hover': {
                            background: 'rgba(242, 159, 5, 0.2)',
                          }
                        }}
                      />
                      <Chip
                        label="Status filtern"
                        onClick={() => {}}
                        variant="outlined"
                        icon={<FilterList sx={{ color: 'rgba(242, 159, 5, 0.7)' }} />}
                        sx={{
                          borderColor: 'rgba(242, 159, 5, 0.5)',
                          color: '#F29F05',
                          cursor: 'pointer',
                        }}
                      />
                    </Stack>
                  </Box>

                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : readings.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <MenuBook sx={{ fontSize: 64, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                        Noch keine Readings vorhanden
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Erstelle dein erstes Reading und entdecke dein energetisches Potenzial
                      </Typography>
                    </Box>
                  ) : (() => {
                    // Filter Readings
                    let filteredReadings = readings;
                    
                    // Filter by type
                    if (filterType === 'connectionKey') {
                      filteredReadings = filteredReadings.filter(r => (r as any).type === 'connectionKey' || r.category === 'connection-key');
                    } else if (filterType === 'humanDesign') {
                      filteredReadings = filteredReadings.filter(r => (r as any).type !== 'connectionKey' && r.category !== 'connection-key');
                    }
                    
                    // Filter by status
                    if (filterStatus !== 'all') {
                      filteredReadings = filteredReadings.filter(r => r.status === filterStatus);
                    }
                    
                    // Filter by search query
                    if (searchQuery) {
                      const query = searchQuery.toLowerCase();
                      filteredReadings = filteredReadings.filter(r => 
                        r.title?.toLowerCase().includes(query) ||
                        r.question?.toLowerCase().includes(query)
                      );
                    }
                    
                    if (filteredReadings.length === 0) {
                      return (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                          <MenuBook sx={{ fontSize: 64, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
                          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                            Keine Readings gefunden
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                            {searchQuery ? 'Versuche andere Suchbegriffe' : 'Passe deine Filter an oder erstelle ein neues Reading'}
                          </Typography>
                        </Box>
                      );
                    }
                    
                    return (
                      <Grid container spacing={3}>
                        {filteredReadings.map((reading) => (
                        <Grid item xs={12} md={6} lg={4} key={reading.id}>
                          <Card
                            sx={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: 3,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 25px rgba(242, 159, 5, 0.3)',
                                borderColor: '#F29F05',
                              }
                            }}
                          >
                            <CardContent>
                              <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 600 }}>
                                {reading.title}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                                {reading.question}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                <Chip
                                  label={
                                    reading.status === 'pending' ? '⏳ Warte auf Termin' :
                                    reading.status === 'zoom-scheduled' ? '📅 Termin vereinbart' :
                                    reading.status === 'completed' ? '✅ Zoom abgeschlossen' :
                                    reading.status === 'approved' ? '🎉 Freigegeben' :
                                    'In Bearbeitung'
                                  }
                                  size="small"
                                  sx={{
                                    background: 
                                      reading.status === 'pending' ? '#eab308' :
                                      reading.status === 'zoom-scheduled' ? '#3b82f6' :
                                      reading.status === 'completed' ? '#8b5cf6' :
                                      reading.status === 'approved' ? '#10b981' :
                                      '#f59e0b',
                                    color: 'white',
                                    fontWeight: 500
                                  }}
                                />
                                {reading.category && (
                                  <Chip
                                    label={reading.category === 'dating' ? '💕 Dating' : 
                                           reading.category === 'business' ? '💼 Business' : 
                                           reading.category === 'personal' ? '✨ Persönlich' : '🌟 Allgemein'}
                                    size="small"
                                    sx={{
                                      background: 'rgba(242, 159, 5, 0.2)',
                                      color: '#F29F05',
                                      fontWeight: 500
                                    }}
                                  />
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {/* Connection Key Analyse Button */}
                                {/* Prüfe verschiedene mögliche Felder für Connection Key Readings */}
                                {(() => {
                                  const isConnectionKey = 
                                    (reading as any).type === 'connectionKey' ||
                                    reading.category === 'connection-key' ||
                                    (reading as any).reading_type === 'connectionKey' ||
                                    (reading as any).reading_data?.type === 'connectionKey' ||
                                    (reading as any).reading_data?.category === 'connection-key' ||
                                    reading.title?.toLowerCase().includes('connection key');
                                  
                                  return isConnectionKey ? (
                                    <Button
                                      variant="contained"
                                      size="small"
                                      onClick={() => {
                                        console.log('Connection Key Reading:', reading);
                                        setSelectedConnectionKeyReading(reading);
                                        setShowConnectionKeyModal(true);
                                      }}
                                      sx={{
                                        background: 'linear-gradient(135deg, #8A2BE2, #9D4EDD)',
                                        color: 'white',
                                        fontWeight: 600,
                                        '&:hover': {
                                          background: 'linear-gradient(135deg, #9D4EDD, #8A2BE2)',
                                          transform: 'translateY(-2px)',
                                          boxShadow: '0 8px 25px rgba(138, 43, 226, 0.4)',
                                        },
                                        transition: 'all 0.3s ease',
                                      }}
                                    >
                                      🩵 Resonanzanalyse
                                    </Button>
                                  ) : null;
                                })()}
                                
                                {/* Test-Button für alle Readings (zum Debuggen) */}
                                {readings.length > 0 && (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                      console.log('Alle Readings:', readings);
                                      console.log('Aktuelles Reading:', reading);
                                      console.log('Reading Type:', (reading as any).type);
                                      console.log('Reading Category:', reading.category);
                                      console.log('Reading Type (reading_type):', (reading as any).reading_type);
                                      console.log('Reading Data:', (reading as any).reading_data);
                                      alert(`Reading Info:\nType: ${(reading as any).type || (reading as any).reading_type}\nCategory: ${reading.category}\nTitle: ${reading.title}`);
                                    }}
                                    sx={{
                                      borderColor: 'rgba(255,255,255,0.3)',
                                      color: 'rgba(255,255,255,0.7)',
                                      fontSize: '0.7rem',
                                      minWidth: 'auto',
                                      px: 1,
                                    }}
                                  >
                                    🔍 Debug
                                  </Button>
                                )}
                                
                                {reading.status === 'approved' ? (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => {
                                      // Download Reading als PDF
                                      alert('PDF-Download wird implementiert. Reading ist freigegeben!');
                                    }}
                                    sx={{
                                      background: 'linear-gradient(45deg, #10b981, #059669)',
                                      color: 'white',
                                      fontWeight: 600,
                                      '&:hover': {
                                        background: 'linear-gradient(45deg, #059669, #047857)',
                                      }
                                    }}
                                  >
                                    📥 PDF herunterladen
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                      if (reading.status === 'pending') {
                                        router.push('/resonanzanalyse/next-steps');
                                      } else if (reading.status === 'zoom-scheduled') {
                                        alert('Dein Zoom-Termin ist vereinbart. Du erhältst das PDF nach dem Reading und Coach-Freigabe.');
                                      } else if (reading.status === 'completed') {
                                        alert('Dein Zoom-Reading ist abgeschlossen. Der Coach bereitet gerade dein PDF vor. Du wirst benachrichtigt, sobald es verfügbar ist.');
                                      }
                                    }}
                                    sx={{
                                      borderColor: 'rgba(255,255,255,0.3)',
                                      color: 'white',
                                      '&:hover': {
                                        borderColor: '#F29F05',
                                        backgroundColor: 'rgba(242, 159, 5, 0.1)'
                                      }
                                    }}
                                  >
                                    {reading.status === 'pending' ? '📋 Status anzeigen' :
                                     reading.status === 'zoom-scheduled' ? '📅 Termin-Info' :
                                     reading.status === 'completed' ? '⏳ In Bearbeitung' :
                                     'Details anzeigen'}
                                  </Button>
                                )}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                      </Grid>
                    );
                  })()}
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                      🔄 Chartvergleich
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
                      Vergleiche zwei Human Design Charts und entdecke die energetischen Verbindungen
                    </Typography>
                  </Box>

                  {/* Info-Box: Was bringt der Chartvergleich? */}
                  <Alert 
                    severity="info" 
                    sx={{ 
                      mb: 4,
                      background: 'rgba(242, 159, 5, 0.1)',
                      border: '1px solid rgba(242, 159, 5, 0.3)',
                      '& .MuiAlert-icon': {
                        color: '#F29F05'
                      }
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1, fontWeight: 600 }}>
                      💡 Was bringt dir der Chartvergleich?
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                      • <strong>Kompatibilitäts-Score:</strong> Sieh auf einen Blick, wie gut eure Charts harmonieren
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                      • <strong>Gemeinsame Tore & Kanäle:</strong> Entdecke, welche energetischen Verbindungen ihr teilt
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                      • <strong>Visueller Vergleich:</strong> Beide Charts nebeneinander oder übereinander gelegt
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      • <strong>Automatische Datenübernahme:</strong> Dein Chart wird automatisch aus deinem Human Design Chart übernommen
                    </Typography>
                  </Alert>

                  <Grid container spacing={3}>
                    {/* Chart 1 Selection */}
                    <Grid item xs={12} md={6}>
                      <Card sx={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '2px solid rgba(242, 159, 5, 0.3)',
                        borderRadius: 3,
                        p: 3
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <PersonAdd sx={{ fontSize: 40, color: '#F29F05', mr: 2 }} />
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                            Chart 1 (Du)
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                          Dein eigenes Chart wird automatisch verwendet
                        </Typography>
                        {(() => {
                          // Lade echte Daten aus localStorage - zuerst aus userChart, dann aus userData
                          const userChartData = typeof window !== 'undefined' ? localStorage.getItem('userChart') : null;
                          const userData = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
                          let userChart = {
                            type: 'Noch nicht erstellt',
                            profile: '-',
                            authority: '-',
                            strategy: '-',
                            hasFullData: false
                          };
                          
                          // Priorität: userChart (vom Human Design Chart) > userData
                          if (userChartData) {
                            const parsed = safeJsonParse<any>(userChartData, null);
                            if (parsed) {
                              userChart = {
                                type: parsed.hdType || 'Nicht angegeben',
                                profile: parsed.profile || 'Nicht angegeben',
                                authority: parsed.authority || 'Nicht angegeben',
                                strategy: parsed.strategy || 'Nicht angegeben',
                                hasFullData: true
                              };
                            }
                          }
                          
                          // Fallback zu userData
                          if (!userChart.hasFullData && userData) {
                            const parsed = safeJsonParse<any>(userData, null);
                            if (parsed) {
                              userChart = {
                                type: parsed.hdType || 'Nicht angegeben',
                                profile: parsed.hdProfile || 'Nicht angegeben',
                                authority: parsed.hdAuthority || 'Nicht angegeben',
                                strategy: parsed.hdStrategy || 'Nicht angegeben',
                                hasFullData: false
                              };
                            }
                          }
                          
                          return (
                            <Box sx={{
                              p: 3,
                              background: 'rgba(242, 159, 5, 0.1)',
                              borderRadius: 2,
                              border: '1px solid rgba(242, 159, 5, 0.3)'
                            }}>
                              <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                                <strong>Typ:</strong> {userChart.type}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                                <strong>Profil:</strong> {userChart.profile}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                                <strong>Autorität:</strong> {userChart.authority}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                                <strong>Strategie:</strong> {userChart.strategy}
                              </Typography>
                              {userChart.type === 'Noch nicht erstellt' && (
                                <Box sx={{ mt: 2 }}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => router.push('/human-design-chart')}
                                    sx={{
                                      borderColor: '#F29F05',
                                      color: '#F29F05',
                                      '&:hover': {
                                        borderColor: '#8C1D04',
                                        background: 'rgba(242, 159, 5, 0.1)'
                                      }
                                    }}
                                  >
                                    Human Design Chart erstellen →
                                  </Button>
                                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', mt: 1 }}>
                                    Dein Chart wird automatisch für den Vergleich verwendet
                                  </Typography>
                                </Box>
                              )}
                              {userChart.hasFullData && (
                                <Typography variant="caption" sx={{ color: '#F29F05', display: 'block', mt: 1 }}>
                                  ✓ Daten aus deinem Human Design Chart übernommen
                                </Typography>
                              )}
                            </Box>
                          );
                        })()}
                      </Card>
                    </Grid>

                    {/* Chart 2 Selection */}
                    <Grid item xs={12} md={6}>
                      <Card sx={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '2px solid rgba(242, 159, 5, 0.3)',
                        borderRadius: 3,
                        p: 3
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                          <PersonAdd sx={{ fontSize: 40, color: '#F29F05', mr: 2 }} />
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                            Chart 2 (Partner)
                          </Typography>
                        </Box>
<TextField
                          fullWidth
                          select
                          label="Wähle ein Chart zum Vergleich"
                          value={selectedChart2}
                          onChange={(e) => setSelectedChart2(e.target.value)}
                          sx={{
                            mb: 2,
                            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&:hover fieldset': { borderColor: '#F29F05' },
                            '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                          }
                          }}
                        >
                          <MenuItem value="">
                            <em>Wähle ein Profil...</em>
                          </MenuItem>
                          {friends.length > 0 ? (
                            friends.map((friend, index) => (
                              <MenuItem key={friend.id} value={`partner${index}`}>
                                {friend.name || `Partner ${index + 1}`} - {friend.hdType || friend.hd_type || 'Unbekannter Typ'}
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem value="" disabled>
                              Noch keine Friends gespeichert - Gehe zu /friends um welche hinzuzufügen
                            </MenuItem>
                          )}
                          <MenuItem value="custom">Eigenes Chart eingeben</MenuItem>
                        </TextField>

{(() => {
                          // Zeige ausgewählten Partner an
                          if (!selectedChart2 || selectedChart2 === '') return null;
                          
                          if (selectedChart2 === 'custom') {
                            return (
                              <Box sx={{
                                p: 3,
                                background: 'rgba(242, 159, 5, 0.1)',
                                borderRadius: 2,
                                border: '1px solid rgba(242, 159, 5, 0.3)',
                                textAlign: 'center'
                              }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                                  Eigenes Chart eingeben wird noch implementiert
                                </Typography>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  href="/friends"
                                  sx={{
                                    borderColor: '#F29F05',
                                    color: '#F29F05',
                                    '&:hover': {
                                      borderColor: '#8C1D04',
                                      background: 'rgba(242, 159, 5, 0.1)'
                                    }
                                  }}
                                >
                                  Zur Freundesliste →
                                </Button>
                              </Box>
                            );
                          }
                          
                          // Finde den ausgewählten Partner aus dem friends-State
                          const partnerIndex = parseInt(selectedChart2.replace('partner', ''));
                          const partner = friends[partnerIndex];
                          
                          if (!partner) {
                            return (
                              <Box sx={{
                                p: 3,
                                background: 'rgba(78, 205, 196, 0.1)',
                                borderRadius: 2,
                                border: '1px solid rgba(78, 205, 196, 0.3)'
                              }}>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                  Partner nicht gefunden
                                </Typography>
                              </Box>
                            );
                          }
                          
                          return (
                            <Box sx={{
                              p: 3,
                              background: 'rgba(242, 159, 5, 0.1)',
                              borderRadius: 2,
                              border: '1px solid rgba(242, 159, 5, 0.3)'
                            }}>
                              <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                                <strong>Typ:</strong> {partner.hdType || partner.hd_type || 'Nicht angegeben'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                                <strong>Profil:</strong> {partner.hdProfile || partner.hd_profile || 'Nicht angegeben'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'white', mb: 1 }}>
                                <strong>Autorität:</strong> {partner.hdAuthority || partner.hd_authority || 'Nicht angegeben'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'white' }}>
                                <strong>Strategie:</strong> {partner.hdStrategy || partner.hd_strategy || 'Nicht angegeben'}
                              </Typography>
                            </Box>
                          );
                        })()}
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Compare Button */}
                  <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<CompareArrows />}
                      onClick={async () => {
                        // Lade echte User-Daten für Chart 1 - zuerst aus userChart, dann aus userData
                        const userChartData = localStorage.getItem('userChart');
                        const userData = localStorage.getItem('userData');
                        let userChart = null;
                        
                        // Priorität: userChart (vom Human Design Chart) > userData
                        if (userChartData) {
                          try {
                            const parsed = safeJsonParse<any>(userChartData, null);
                            if (parsed) {
                              // Versuche vollständige Chart-Daten zu laden
                              const userDataParsed = userData ? safeJsonParse<any>(userData, {}) : {};
                              const chartResponse = await fetch('/api/charts/calculate', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  birthDate: parsed.birthDate || userDataParsed?.birthDate || null,
                                  birthTime: parsed.birthTime || userDataParsed?.birthTime || null,
                                  birthPlace: parsed.birthPlace || userDataParsed?.birthPlace || null
                                })
                              });
                              
                              if (chartResponse.ok) {
                                const chartResult = await chartResponse.json();
                                const chart = chartResult.chart;
                                userChart = {
                                  hdType: chart.type || parsed.hdType,
                                  profile: chart.profile || parsed.profile,
                                  authority: chart.authority || parsed.authority,
                                  strategy: chart.strategy || parsed.strategy,
                                  gates: chart.gates?.map((g: number) => ({ id: String(g), active: true })) || [],
                                  channels: chart.channels || [],
                                  centers: chart.definedCenters?.map((c: string) => ({ id: c.toLowerCase(), active: true })) || []
                                };
                              } else {
                                // Fallback zu gespeicherten Daten
                                userChart = {
                                  hdType: parsed.hdType,
                                  profile: parsed.profile,
                                  authority: parsed.authority,
                                  strategy: parsed.strategy,
                                  gates: [],
                                  channels: [],
                                  centers: []
                                };
                              }
                            }
                          } catch (e) {
                            console.error('Fehler beim Laden des userChart:', e);
                          }
                        }
                        
                        // Fallback zu userData
                        if (!userChart && userData) {
                          const parsed = safeJsonParse<any>(userData, null);
                          if (parsed) {
                            userChart = {
                              hdType: parsed.hdType || 'Noch nicht erstellt',
                              profile: parsed.hdProfile || 'Noch nicht erstellt',
                              authority: parsed.hdAuthority || 'Noch nicht erstellt',
                              strategy: parsed.hdStrategy || 'Noch nicht erstellt',
                              gates: parsed.gates || [],
                              channels: parsed.channels || [],
                              centers: parsed.centers || []
                            };
                          }
                        }
                        
                        // Fallback zu Demo-Daten wenn kein User-Chart vorhanden
                        if (!userChart) {
                          userChart = {
                            hdType: 'Generator',
                            profile: '2/4',
                            authority: 'Sakral',
                            strategy: 'Warten und Reagieren',
                            gates: [
                              { id: '1', active: true, name: 'Tor 1' },
                              { id: '8', active: true, name: 'Tor 8' },
                              { id: '13', active: true, name: 'Tor 13' }
                            ],
                            channels: [
                              { id: '1-8', active: true, name: 'Kanal 1-8' }
                            ],
                            centers: [
                              { id: 'sacral', active: true, name: 'Sakral' },
                              { id: 'throat', active: true, name: 'Kehle' }
                            ]
                          };
                        }
                        
                        setChart1Data(userChart);
                        
                        // Lade echte Partner-Daten für Chart 2
                        if (selectedChart2 && selectedChart2 !== 'custom') {
                          const partnerIndex = parseInt(selectedChart2.replace('partner', ''));
                          const partner = friends[partnerIndex];
                          
                          if (partner) {
                            setChart2Data({
                              hdType: partner.hdType || partner.hd_type || 'Nicht angegeben',
                              profile: partner.hdProfile || partner.hd_profile || 'Nicht angegeben',
                              authority: partner.hdAuthority || partner.hd_authority || 'Nicht angegeben',
                              strategy: partner.hdStrategy || partner.hd_strategy || 'Nicht angegeben',
                              gates: partner.gates || [],
                              channels: partner.channels || [],
                              centers: partner.centers || []
                            });
                          }
                        }
                        
                        setShowComparisonModal(true);
                      }}
                      disabled={!selectedChart2}
                      sx={{
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        px: 6,
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                          transform: 'scale(1.05)',
                        },
                        '&:disabled': {
                          background: 'rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.3)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Charts vergleichen
                    </Button>
                  </Box>

                  {/* Info Box */}
                  <Card sx={{ 
                    mt: 4, 
                    background: 'rgba(242, 159, 5, 0.1)', 
                    border: '1px solid rgba(242, 159, 5, 0.3)',
                    borderRadius: 3
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                        💡 Was ist der Connection Key?
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                        Der Connection Key ist eine tiefgehende Analyse der energetischen Resonanz zwischen zwei Menschen. 
                        Durch den Vergleich der Human Design Charts erkennen wir:
                      </Typography>
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              background: '#F29F05', 
                              mr: 2 
                            }} />
                            <Typography variant="body2" sx={{ color: 'white' }}>
                              Gemeinsame definierte Zentren
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              background: '#F29F05', 
                              mr: 2 
                            }} />
                            <Typography variant="body2" sx={{ color: 'white' }}>
                              Elektromagnetische Verbindungen
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              background: '#F29F05', 
                              mr: 2 
                            }} />
                            <Typography variant="body2" sx={{ color: 'white' }}>
                              Kompatibilität der Strategien
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ 
                              width: 8, 
                              height: 8, 
                              borderRadius: '50%', 
                              background: '#F29F05', 
                              mr: 2 
                            }} />
                            <Typography variant="body2" sx={{ color: 'white' }}>
                              Potenzielle Herausforderungen
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                      Meine Buchungen
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Plus size={20} />}
                      onClick={() => router.push('/connection-key/booking')}
                      sx={{
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        color: '#fff',
                        fontWeight: 700,
                        px: 4,
                        py: 1.5,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                        }
                      }}
                    >
                      Neue Buchung
                    </Button>
                  </Box>

                  {/* Buchungen Filter Tabs */}
                  <Box sx={{ mb: 3 }}>
                    <Tabs
                      value={bookingFilterTab}
                      onChange={(_, newValue) => setBookingFilterTab(newValue)}
                      sx={{
                        '& .MuiTab-root': {
                          color: 'rgba(255, 255, 255, 0.7)',
                          '&.Mui-selected': {
                            color: '#F29F05'
                          }
                        },
                        '& .MuiTabs-indicator': {
                          backgroundColor: '#F29F05'
                        }
                      }}
                    >
                      <Tab label={`Alle (${bookings.length})`} />
                      <Tab label={`Ausstehend (${bookings.filter((b: any) => b.status === 'pending' || b.status === 'confirmed').length})`} />
                      <Tab label={`Abgeschlossen (${bookings.filter((b: any) => b.status === 'completed').length})`} />
                    </Tabs>
                  </Box>

                  {bookingsLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                      <CircularProgress sx={{ color: '#F29F05' }} />
                    </Box>
                  ) : (
                    <>
                      {(() => {
                        const filteredBookings = bookingFilterTab === 0
                          ? bookings
                          : bookingFilterTab === 1
                          ? bookings.filter((b: any) => b.status === 'pending' || b.status === 'confirmed')
                          : bookings.filter((b: any) => b.status === 'completed');

                        if (filteredBookings.length === 0) {
                          return (
                            <Card sx={{
                              background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.1) 0%, rgba(140, 29, 4, 0.05) 100%)',
                              backdropFilter: 'blur(20px)',
                              border: '1px solid rgba(242, 159, 5, 0.2)',
                              borderRadius: 3,
                              p: 4,
                              textAlign: 'center',
                              boxShadow: '0 4px 20px rgba(242, 159, 5, 0.1)'
                            }}>
                              <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
                                Noch keine Buchungen vorhanden
                              </Typography>
                              <Button
                                variant="contained"
                                onClick={() => router.push('/connection-key/booking')}
                                sx={{
                                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)'
                                  }
                                }}
                              >
                                Jetzt buchen
                              </Button>
                            </Card>
                          );
                        }

                        return (
                          <Grid container spacing={3}>
                            {filteredBookings.map((booking: any) => (
                              <Grid item xs={12} md={6} lg={4} key={booking.id || booking.bookingId}>
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <Card
                                    sx={{
                                      background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.1) 0%, rgba(140, 29, 4, 0.05) 100%)',
                                      backdropFilter: 'blur(20px)',
                                      border: '1px solid rgba(242, 159, 5, 0.2)',
                                      borderRadius: 3,
                                      transition: 'all 0.3s ease',
                                      cursor: 'pointer',
                                      boxShadow: '0 4px 20px rgba(242, 159, 5, 0.1)',
                                      '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: '0 8px 32px rgba(242, 159, 5, 0.3)',
                                        borderColor: 'rgba(242, 159, 5, 0.5)',
                                      }
                                    }}
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setBookingDetailsOpen(true);
                                    }}
                                  >
                                    <CardContent sx={{ p: 3 }}>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                        <Chip
                                          label={booking.type === 'coaching' ? 'Coaching' : booking.type === 'connection-key' ? 'Connection Key' : 'Buchung'}
                                          size="small"
                                          sx={{
                                            background: 'rgba(242, 159, 5, 0.2)',
                                            color: '#F29F05',
                                            fontWeight: 600,
                                            fontSize: '0.75rem'
                                          }}
                                        />
                                        <Chip
                                          label={booking.status === 'completed' ? 'Abgeschlossen' : booking.status === 'confirmed' ? 'Bestätigt' : 'Ausstehend'}
                                          size="small"
                                          color={booking.status === 'completed' ? 'success' : booking.status === 'confirmed' ? 'success' : 'warning'}
                                          sx={{ fontSize: '0.75rem' }}
                                        />
                                      </Box>

                                      <Typography variant="h6" sx={{ color: '#fff', mb: 1, fontWeight: 600, fontSize: '1.1rem' }}>
                                        {booking.coach || booking.packageName || booking.type === 'connection-key' && booking.partner1Name && booking.partner2Name 
                                          ? `${booking.partner1Name} & ${booking.partner2Name}` 
                                          : 'Buchung'}
                                      </Typography>

                                      {booking.date && (
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                                          📅 {new Date(booking.date).toLocaleDateString('de-DE', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                          })}
                                        </Typography>
                                      )}

                                      {booking.time && (
                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                                          🕐 {booking.time} Uhr
                                        </Typography>
                                      )}

                                      {booking.price && (
                                        <Typography variant="body2" sx={{ color: '#F29F05', fontWeight: 600, mt: 2 }}>
                                          €{booking.price}
                                        </Typography>
                                      )}
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              </Grid>
                            ))}
                          </Grid>
                        );
                      })()}
                    </>
                  )}
                </Box>
              )}
            </Box>
          </Paper>
        </Box>
      </PageLayout>

      {/* New Reading Dialog */}
      <Dialog
        open={newReadingDialog}
        onClose={() => setNewReadingDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
          Neues Reading erstellen
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
            Bitte fülle alle Felder aus. Diese Informationen werden für dein persönliches Zoom-Reading mit unserem Coach benötigt.
          </Typography>

          <TextField
            autoFocus
            margin="dense"
            label="Titel des Readings *"
            fullWidth
            variant="outlined"
            value={newReadingTitle}
            onChange={(e) => setNewReadingTitle(e.target.value)}
            placeholder="z.B. Mein Human Design für Business"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#F29F05',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-focused': {
                  color: '#F29F05',
                },
              },
            }}
          />
          
          <TextField
            select
            margin="dense"
            label="Kategorie *"
            fullWidth
            variant="outlined"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#F29F05',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-focused': {
                  color: '#F29F05',
                },
              },
            }}
          >
            <MenuItem value="dating">💕 Dating & Beziehungen</MenuItem>
            <MenuItem value="business">💼 Business & Karriere</MenuItem>
            <MenuItem value="career">🚀 Karriere & Führung</MenuItem>
            <MenuItem value="leadership">👑 Leadership & Management</MenuItem>
            <MenuItem value="communication">💬 Kommunikation</MenuItem>
            <MenuItem value="health">🌱 Gesundheit & Wohlbefinden</MenuItem>
            <MenuItem value="personal">✨ Persönliche Entwicklung</MenuItem>
            <MenuItem value="general">🌟 Allgemein</MenuItem>
          </TextField>

          {selectedCategory === 'dating' && (
            <TextField
              select
              margin="dense"
              label="Dating-Bereich"
              fullWidth
              variant="outlined"
              value={selectedDatingType}
              onChange={(e) => setSelectedDatingType(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#F29F05',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-focused': {
                    color: '#F29F05',
                  },
                },
              }}
            >
              <MenuItem value="first-date">🥰 Erstes Date</MenuItem>
              <MenuItem value="relationship">💑 Beziehung</MenuItem>
              <MenuItem value="communication">💬 Kommunikation</MenuItem>
              <MenuItem value="intimacy">🔥 Intimität</MenuItem>
            </TextField>
          )}

          {selectedCategory === 'business' && (
            <TextField
              select
              margin="dense"
              label="Business-Bereich"
              fullWidth
              variant="outlined"
              value={selectedDatingType}
              onChange={(e) => setSelectedDatingType(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#F29F05',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-focused': {
                    color: '#F29F05',
                  },
                },
              }}
            >
              <MenuItem value="career">🚀 Karriere & Entwicklung</MenuItem>
              <MenuItem value="marketing">📈 Marketing & Verkauf</MenuItem>
              <MenuItem value="entrepreneurship">💡 Unternehmertum</MenuItem>
              <MenuItem value="teamwork">👥 Teamarbeit</MenuItem>
            </TextField>
          )}

          {selectedCategory === 'career' && (
            <TextField
              select
              margin="dense"
              label="Karriere-Bereich"
              fullWidth
              variant="outlined"
              value={selectedDatingType}
              onChange={(e) => setSelectedDatingType(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#F29F05',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-focused': {
                    color: '#F29F05',
                  },
                },
              }}
            >
              <MenuItem value="career">🚀 Karriereplanung</MenuItem>
              <MenuItem value="job-search">🔍 Jobsuche</MenuItem>
              <MenuItem value="skills">🎯 Fähigkeiten entwickeln</MenuItem>
              <MenuItem value="networking">🤝 Networking</MenuItem>
            </TextField>
          )}

          {selectedCategory === 'leadership' && (
            <TextField
              select
              margin="dense"
              label="Leadership-Bereich"
              fullWidth
              variant="outlined"
              value={selectedDatingType}
              onChange={(e) => setSelectedDatingType(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#F29F05',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-focused': {
                    color: '#F29F05',
                  },
                },
              }}
            >
              <MenuItem value="leadership">👑 Führungsstil</MenuItem>
              <MenuItem value="team-management">👥 Team-Management</MenuItem>
              <MenuItem value="decision-making">🎯 Entscheidungsfindung</MenuItem>
              <MenuItem value="communication">💬 Führungskommunikation</MenuItem>
            </TextField>
          )}

          <TextField
            margin="dense"
            label="Deine Frage oder dein Anliegen *"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={newReadingQuestion}
            onChange={(e) => setNewReadingQuestion(e.target.value)}
            placeholder={selectedCategory === 'dating' ? 
              "z.B. Wie kann ich beim ersten Date authentisch sein?" : 
              "Beschreibe dein Anliegen oder deine Frage..."
            }
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#F29F05',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-focused': {
                  color: '#F29F05',
                },
              },
            }}
          />

          <Typography variant="subtitle1" sx={{ color: '#F29F05', fontWeight: 600, mt: 3, mb: 2 }}>
            📅 Geburtsdaten für dein Human Design Chart
          </Typography>

          <TextField
            margin="dense"
            label="Geburtsdatum *"
            fullWidth
            type="date"
            variant="outlined"
            value={newReadingBirthdate}
            onChange={(e) => setNewReadingBirthdate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#F29F05',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-focused': {
                  color: '#F29F05',
                },
              },
            }}
          />

          <TextField
            margin="dense"
            label="Geburtszeit *"
            fullWidth
            type="time"
            variant="outlined"
            value={newReadingBirthtime}
            onChange={(e) => setNewReadingBirthtime(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Die genaue Uhrzeit ist wichtig für dein Chart"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#F29F05',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-focused': {
                  color: '#F29F05',
                },
              },
              '& .MuiFormHelperText-root': {
                color: 'rgba(255,255,255,0.5)',
              },
            }}
          />

          <TextField
            margin="dense"
            label="Geburtsort (Stadt, Land) *"
            fullWidth
            variant="outlined"
            value={newReadingBirthplace}
            onChange={(e) => setNewReadingBirthplace(e.target.value)}
            placeholder="z.B. München, Deutschland"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#F29F05',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-focused': {
                  color: '#F29F05',
                },
              },
            }}
          />

          <Typography variant="subtitle1" sx={{ color: '#F29F05', fontWeight: 600, mt: 3, mb: 2 }}>
            📞 Kontaktdaten für Zoom-Reading
          </Typography>

          <TextField
            margin="dense"
            label="E-Mail-Adresse *"
            fullWidth
            type="email"
            variant="outlined"
            value={newReadingEmail}
            onChange={(e) => setNewReadingEmail(e.target.value)}
            placeholder="deine@email.de"
            helperText="Wir senden dir den Zoom-Link an diese E-Mail"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#F29F05',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-focused': {
                  color: '#F29F05',
                },
              },
              '& .MuiFormHelperText-root': {
                color: 'rgba(255,255,255,0.5)',
              },
            }}
          />

          <TextField
            margin="dense"
            label="Telefonnummer (optional)"
            fullWidth
            type="tel"
            variant="outlined"
            value={newReadingPhone}
            onChange={(e) => setNewReadingPhone(e.target.value)}
            placeholder="+49 123 456789"
            helperText="Für Rückfragen oder falls du per Telefon erreicht werden möchtest"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#F29F05',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255,255,255,0.7)',
                '&.Mui-focused': {
                  color: '#F29F05',
                },
              },
              '& .MuiFormHelperText-root': {
                color: 'rgba(255,255,255,0.5)',
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setNewReadingDialog(false)}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Abbrechen
          </Button>
          <Button
            onClick={createNewReading}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              fontWeight: 600,
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
              }
            }}
          >
            Anfrage abschicken →
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chart Comparison Modal */}
      {showComparisonModal && chart1Data && chart2Data && (
        <ChartComparisonModal
          open={showComparisonModal}
          onClose={() => setShowComparisonModal(false)}
          chart1Data={chart1Data}
          chart2Data={chart2Data}
        />
      )}

      {/* Buchungen Details Dialog */}
      <Dialog
        open={bookingDetailsOpen}
        onClose={() => setBookingDetailsOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.3)',
            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)'
          }
        }}
      >
        {selectedBooking && (
          <>
            <DialogTitle sx={{ color: '#fff', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Buchungsdetails
                </Typography>
                <Chip
                  label={selectedBooking.status === 'completed' ? 'Abgeschlossen' : selectedBooking.status === 'confirmed' ? 'Bestätigt' : 'Ausstehend'}
                  color={selectedBooking.status === 'completed' ? 'success' : selectedBooking.status === 'confirmed' ? 'success' : 'warning'}
                />
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#F29F05', mb: 1 }}>
                    Typ
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#fff' }}>
                    {selectedBooking.type === 'coaching' ? 'Coaching-Session' : selectedBooking.type === 'connection-key' ? 'Connection Key' : 'Buchung'}
                  </Typography>
                </Box>

                {selectedBooking.coach && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#F29F05', mb: 1 }}>
                      Coach
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#fff' }}>
                      {selectedBooking.coach}
                    </Typography>
                  </Box>
                )}

                {selectedBooking.date && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#F29F05', mb: 1 }}>
                      Datum & Uhrzeit
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#fff' }}>
                      {new Date(selectedBooking.date).toLocaleDateString('de-DE', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {selectedBooking.time && ` um ${selectedBooking.time} Uhr`}
                    </Typography>
                  </Box>
                )}

                {selectedBooking.partner1Name && (
                  <>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#F29F05', mb: 1 }}>
                        Partner 1
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#fff' }}>
                        {selectedBooking.partner1Name}
                        {selectedBooking.partner1BirthDate && ` - ${new Date(selectedBooking.partner1BirthDate).toLocaleDateString('de-DE')}`}
                      </Typography>
                    </Box>
                  </>
                )}

                {selectedBooking.partner2Name && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#F29F05', mb: 1 }}>
                      Partner 2
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#fff' }}>
                      {selectedBooking.partner2Name}
                      {selectedBooking.partner2BirthDate && ` - ${new Date(selectedBooking.partner2BirthDate).toLocaleDateString('de-DE')}`}
                    </Typography>
                  </Box>
                )}

                {selectedBooking.price && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#F29F05', mb: 1 }}>
                      Preis
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>
                      €{selectedBooking.price}
                    </Typography>
                  </Box>
                )}

                {selectedBooking.meetingLink && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#F29F05', mb: 1 }}>
                      Zoom-Link
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Video size={18} />}
                      href={selectedBooking.meetingLink}
                      target="_blank"
                      sx={{
                        borderColor: '#F29F05',
                        color: '#F29F05',
                        '&:hover': {
                          borderColor: '#F29F05',
                          backgroundColor: 'rgba(242, 159, 5, 0.1)'
                        }
                      }}
                    >
                      Zoom-Meeting öffnen
                    </Button>
                  </Box>
                )}

                {selectedBooking.notes && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#F29F05', mb: 1 }}>
                      Notizen
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {selectedBooking.notes}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </DialogContent>
            <DialogActions sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', p: 2 }}>
              <Button
                onClick={() => setBookingDetailsOpen(false)}
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                Schließen
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Connection Key Analyse Modal */}
      <Dialog
        open={showConnectionKeyModal}
        onClose={() => setShowConnectionKeyModal(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(180deg, #1a1820 0%, #1a1820 100%)',
            borderRadius: 3,
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.2), rgba(157, 78, 221, 0.2))',
          borderBottom: '2px solid rgba(138, 43, 226, 0.3)',
          color: '#fff',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          <Box sx={{ fontSize: 32 }}>🩵</Box>
          <Box>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
              Connection Key Resonanzanalyse
            </Typography>
            {selectedConnectionKeyReading && (
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 0.5 }}>
                {selectedConnectionKeyReading.title}
              </Typography>
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
          {selectedConnectionKeyReading && (
            <ConnectionKeyModalContent reading={selectedConnectionKeyReading} />
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(138, 43, 226, 0.3)' }}>
          <Button
            onClick={() => setShowConnectionKeyModal(false)}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </AccessControl>
  );
}

// Hauptkomponente mit ProtectedRoute (Premium erforderlich)
export default function ReadingPage() {
  return (
    <ProtectedRoute requiredRole="premium">
      <ReadingContent />
    </ProtectedRoute>
  );
}
