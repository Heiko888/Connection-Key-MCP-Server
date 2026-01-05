"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
// Unused imports removed
// Lokales Fallback-Interface, da '@/types/common.types' kein MoonTracking exportiert
interface MoonTracking {
  id: string;
  date: string;
  mood: number;
  energy_level: number;
  sleep_quality: number;
  notes?: string;
  moon_phase: string;
  user_id?: string;
  created_at?: string;
  createdAt?: string;
  updatedAt?: string;
}
import { safeJsonParse } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Container,
  Grid,
  Chip,
  Avatar,
  LinearProgress,
  CircularProgress,
  Alert,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  Slider
} from '@mui/material';
import { 
  Plus, 
  Star,
  Activity,
  Bell,
  BookOpen,
  Heart,
  Calendar,
  Flower2,
  Users,
  ArrowLeft
} from 'lucide-react';
import AccessControl from '../../components/AccessControl';
import PageLayout from '../components/PageLayout';
import Logo from '../components/Logo';

interface MoonPhase {
  name: string;
  description: string;
  icon: string;
  energy: string;
  color: string;
  advice: string;
  explanation: string;
  reflectionExercises: string[];
  moonRituals: string[];
  humanDesignConnection: string;
}

// MoonTracking Interface aus common.types.ts verwenden

interface TrackingStats {
  totalEntries: number;
  averageMood: number;
  averageEnergy: number;
  averageSleep: number;
  mostFrequentPhase: string;
  streakDays: number;
}

interface MoonStory {
  id: string;
  title: string;
  culture: string;
  content: string;
  moon_phase: string;
  moral: string;
  tags: string[];
}

interface PlantRitual {
  id: string;
  name: string;
  moon_phase: string;
  plants: string[];
  instructions: string[];
  benefits: string[];
  timing: string;
}

interface HealthGuidance {
  id: string;
  moon_phase: string;
  nutrition: {
    recommended: string[];
    avoid: string[];
    timing: string;
  };
  health: {
    activities: string[];
    rest: string[];
    healing: string[];
  };
  supplements: string[];
}

// GateDetails interface entfernt - nicht verwendet

// Hilfsfunktionen für den Mondkalender
function generateCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay() + 1); // Montag als Start
  
  const days = [];
  const today = new Date();
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    days.push({
      day: date.getDate(),
      date: date,
      isCurrentMonth: date.getMonth() === month - 1,
      isToday: date.toDateString() === today.toDateString()
    });
  }
  
  return days;
}

// Echte Mondphasen-Berechnung basierend auf astronomischen Daten
function getMoonPhase(date: Date): { icon: string; name: string; phase: number } {
  // Referenzdatum: 6. Januar 2000, 18:14 UTC (Neumond)
  const knownNewMoon = new Date('2000-01-06T18:14:00Z');
  
  // Mondzyklus: 29.53059 Tage
  const lunarCycle = 29.53059;
  
  // Berechne die Anzahl der Tage seit dem bekannten Neumond
  const daysSinceKnownNewMoon = (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  
  // Berechne die aktuelle Mondphase (0 = Neumond, 0.25 = Erstes Viertel, 0.5 = Vollmond, 0.75 = Letztes Viertel)
  const phase = ((daysSinceKnownNewMoon % lunarCycle) + lunarCycle) % lunarCycle;
  const normalizedPhase = phase / lunarCycle;
  
  // Bestimme Mondphase basierend auf dem normalisierten Wert
  if (normalizedPhase < 0.0625) {
    return { icon: '🌑', name: 'Neumond', phase: normalizedPhase };
  } else if (normalizedPhase < 0.1875) {
    return { icon: '🌒', name: 'Zunehmende Sichel', phase: normalizedPhase };
  } else if (normalizedPhase < 0.3125) {
    return { icon: '🌓', name: 'Erstes Viertel', phase: normalizedPhase };
  } else if (normalizedPhase < 0.4375) {
    return { icon: '🌔', name: 'Zunehmender Mond', phase: normalizedPhase };
  } else if (normalizedPhase < 0.5625) {
    return { icon: '🌕', name: 'Vollmond', phase: normalizedPhase };
  } else if (normalizedPhase < 0.6875) {
    return { icon: '🌖', name: 'Abnehmender Mond', phase: normalizedPhase };
  } else if (normalizedPhase < 0.8125) {
    return { icon: '🌗', name: 'Letztes Viertel', phase: normalizedPhase };
  } else {
    return { icon: '🌘', name: 'Abnehmende Sichel', phase: normalizedPhase };
  }
}

function getMoonPhaseIcon(date: Date): string {
  return getMoonPhase(date).icon;
}


export default function MondkalenderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [currentPhase, setCurrentPhase] = useState<MoonPhase | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setTrackingData] = useState<MoonTracking[]>([]);
  const [stats, setStats] = useState<TrackingStats>({
    totalEntries: 0,
    averageMood: 0,
    averageEnergy: 0,
    averageSleep: 0,
    mostFrequentPhase: 'Keine Daten',
    streakDays: 0
  });
  const [activeTab, setActiveTab] = useState(0);
  const [newEntry, setNewEntry] = useState({
    mood: 5,
    energy_level: 5,
    sleep_quality: 5,
    notes: '',
    moon_phase: ''
  });

  // Authentifizierung und Subscription prüfen
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      // App ist öffentlich zugänglich - auch ohne Login
      setIsAuthenticated(true); // Immer true für öffentliche App
      
      // Versuche Subscription zu laden, aber nicht blockierend
      if (token && userId) {
      await loadUserSubscription();
      } else {
        // Fallback: Basic-Plan für nicht-angemeldete Benutzer
        setUserSubscription({
          userId: 'guest',
          packageId: 'basic',
          plan: 'Basic Plan',
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          autoRenew: false,
          paymentMethod: 'none',
          billingCycle: 'yearly'
        });
      }
      
      // Loading beenden
      setLoading(false);
    };

    const loadUserSubscription = async () => {
      try {
        // Gültige Pakete - NUR diese werden akzeptiert
        const allowedPackages = ['basic', 'premium', 'vip', 'admin'];
        
        // PRIORITÄT 1: useAuth().user.package (kommt aus Supabase)
        let packageId = user?.package || 'basic';
        
        // Normalisiere ungültige Werte zu 'basic'
        if (!allowedPackages.includes(packageId)) {
          console.warn(`⚠️ Mondkalender: Ungültiges Paket "${packageId}" → wird zu "basic" normalisiert`);
          packageId = 'basic';
        }
        
        // PRIORITÄT 2: localStorage.userPackage (wird von useAuth gesetzt)
        if (packageId === 'basic') {
          const storedPackage = localStorage.getItem('userPackage');
          if (storedPackage && allowedPackages.includes(storedPackage)) {
            packageId = storedPackage as 'basic' | 'premium' | 'vip' | 'admin';
          }
        }
        
        // Finale Validierung
        if (!allowedPackages.includes(packageId)) {
          packageId = 'basic';
        }
        
        setUserSubscription({
          userId: user?.id || 'unknown',
          packageId: packageId,
          plan: packageId,
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          autoRenew: false,
          paymentMethod: 'none',
          billingCycle: 'monthly'
        });
        console.log('✅ Subscription aus useAuth geladen:', packageId);
      } catch (error) {
        console.error('Fehler beim Laden des Abonnements:', error);
        // Fallback: Basic-Plan
        setUserSubscription({
          userId: user?.id || 'unknown',
          packageId: 'basic',
          plan: 'basic',
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          autoRenew: false,
          paymentMethod: 'none',
          billingCycle: 'monthly'
        });
      }
    };

    checkAuth();
  }, []);
  const [notificationSettings, setNotificationSettings] = useState({
    moonPhaseReminders: true,
    dailyReminders: false,
    weeklyReports: true
  });
  const [moonStories, setMoonStories] = useState<MoonStory[]>([]);
  const [plantRituals, setPlantRituals] = useState<PlantRitual[]>([]);
  const [healthGuidance, setHealthGuidance] = useState<HealthGuidance[]>([]);
  const [selectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [userProfile, setUserProfile] = useState<Record<string, unknown> | null>(null);

  // Lade User-Profil beim Start
  useEffect(() => {
    loadUserProfile();
  }, []);

  const moonPhases: MoonPhase[] = useMemo(() => [
    {
      name: "Neumond",
      description: "Zeit für Neuanfänge und Intentionen",
      icon: "🌑",
      energy: "Niedrig",
      color: "#2C3E50",
      advice: "Perfekt für Meditation und Zielsetzung",
      explanation: "Der Neumond ist die beste Zeit, um neue Projekte zu starten und sich Ziele zu setzen. Die Energie ist nach innen gerichtet und unterstützt Introspektion.",
      reflectionExercises: [
        "Was möchte ich in diesem Zyklus erreichen?",
        "Welche Gewohnheiten möchte ich etablieren?",
        "Was kann ich loslassen?",
        "Welche Human Design-Strategie möchte ich vertiefen?"
      ],
      moonRituals: [
        "Intentionen aufschreiben",
        "Meditation",
        "Räuchern",
        "Vision Board erstellen",
        "Human Design Chart studieren"
      ],
      humanDesignConnection: "🌌 G-Zentrum Aktivierung: Der Neumond aktiviert dein G-Zentrum - die Quelle deiner Richtung und Liebe. Nutze diese Zeit, um deine innere Autorität zu stärken und deine wahre Richtung zu finden. Für Generators: Höre auf deine Sacral-Antworten. Für Projectors: Warte auf Einladungen. Für Manifestors: Informiere andere über deine Pläne. Für Reflectors: Nutze die 28-Tage-Regel für wichtige Entscheidungen."
    },
    {
      name: "Zunehmender Mond",
      description: "Zeit für Wachstum und Entwicklung",
      icon: "🌒",
      energy: "Steigend",
      color: "#3498DB",
      advice: "Ideal für Lernen und neue Fähigkeiten",
      explanation: "Die Energie steigt und unterstützt Wachstum und Entwicklung. Perfekt für das Erlernen neuer Fähigkeiten und das Aufbauen von Ressourcen.",
      reflectionExercises: [
        "Was lerne ich gerade über mein Human Design?",
        "Wie kann ich meine definierten Zentren stärken?",
        "Welche undefinierten Zentren brauchen Aufmerksamkeit?",
        "Welche Profile-Aspekte möchte ich entwickeln?"
      ],
      moonRituals: [
        "Neue Fähigkeiten lernen",
        "Bücher lesen",
        "Kurse besuchen",
        "Netzwerken",
        "Human Design Reading vertiefen"
      ],
      humanDesignConnection: "🦋 Spleen-Zentrum Fokus: Der zunehmende Mond stärkt dein Spleen-Zentrum - dein Überlebensinstinkt und deine Intuition. Nutze diese Zeit, um deine natürlichen Instinkte zu schärfen. Für definierte Spleen-Zentren: Vertraue deinen Überlebensinstinkten. Für undefinierte: Lerne von anderen, aber folge nicht blind. Diese Phase unterstützt auch das Erlernen neuer Fähigkeiten, die zu deinem Human Design passen."
    },
    {
      name: "Vollmond",
      description: "Zeit für Manifestation und Vollendung",
      icon: "🌕",
      energy: "Hoch",
      color: "#F39C12",
      advice: "Perfekt für Rituale und Manifestation",
      explanation: "Die höchste Energie des Mondzyklus - ideal für Manifestation und Rituale. Der Vollmond bringt alles ans Licht und verstärkt Emotionen.",
      reflectionExercises: [
        "Was habe ich in diesem Mondzyklus erreicht?",
        "Welche Human Design-Erkenntnisse sind mir gekommen?",
        "Wie fühle ich mich in meiner Authentizität?",
        "Was möchte ich in die Welt bringen?"
      ],
      moonRituals: [
        "Vollmond-Ritual",
        "Kräuter sammeln",
        "Kristalle aufladen",
        "Gratitude-Praxis",
        "Human Design Manifestation"
      ],
      humanDesignConnection: "🔥 Solar Plexus Explosion: Der Vollmond aktiviert dein Solar Plexus-Zentrum - das Zentrum der Emotionen und Entscheidungen. Diese Zeit ist besonders kraftvoll für emotionale Klärung und authentische Entscheidungen. Für definierte Solar Plexus: Nutze deine emotionale Autorität für wichtige Entscheidungen. Für undefinierte: Lass dich nicht von den Emotionen anderer überwältigen. Der Vollmond verstärkt auch deine natürlichen Talente - nutze diese Energie, um dein Human Design in die Welt zu bringen. Perfekt für Manifestation deiner wahren Natur!"
    },
    {
      name: "Abnehmender Mond",
      description: "Zeit für Loslassen und Reinigung",
      icon: "🌖",
      energy: "Fallend",
      color: "#E74C3C",
      advice: "Ideal für Entgiftung und Loslassen",
      explanation: "Die Energie nimmt ab - perfekt für Reinigung und Loslassen. Zeit, um Altes zu verabschieden und Platz für Neues zu schaffen.",
      reflectionExercises: [
        "Was kann ich loslassen, was nicht zu meinem Human Design passt?",
        "Welche Konditionierungen belasten mich?",
        "Was brauche ich nicht mehr in meinem Leben?",
        "Wie kann ich meine undefinierten Zentren entlasten?"
      ],
      moonRituals: [
        "Entgiftung",
        "Aufräumen",
        "Vergeben",
        "Alte Gewohnheiten ablegen",
        "Human Design Konditionierung reinigen"
      ],
      humanDesignConnection: "🌱 Wurzel-Zentrum Reinigung: Der abnehmende Mond unterstützt dein Wurzel-Zentrum - das Zentrum des Drucks und der Adrenalin-Energie. Nutze diese Zeit, um Druck abzubauen und Stress zu reduzieren. Für definierte Wurzel-Zentren: Lass den Druck los, der nicht deiner ist. Für undefinierte: Entferne dich von stressigen Situationen. Diese Phase ist ideal, um Konditionierungen zu erkennen und loszulassen, die nicht zu deinem authentischen Human Design gehören. Perfekt für innere Reinigung und Vorbereitung auf den nächsten Zyklus."
    }
  ], []);

  const loadCurrentMoonPhase = useCallback(async () => {
    try {
      console.log('Lade echte Mondphase-Daten...');
      
      // Berechne echte Mondphase für heute
      const currentDate = new Date();
      const moonPhaseData = getMoonPhase(currentDate);
      
      // Finde passende Mondphase-Details basierend auf dem Namen
      let matchingPhase = moonPhases.find(phase => 
        phase.name === moonPhaseData.name || 
        phase.name.includes('Neumond') && moonPhaseData.name === 'Neumond' ||
        phase.name.includes('Vollmond') && moonPhaseData.name === 'Vollmond' ||
        phase.name.includes('Zunehmend') && moonPhaseData.name.includes('Zunehmend') ||
        phase.name.includes('Abnehmend') && moonPhaseData.name.includes('Abnehmend')
      );
      
      // Fallback zu einer passenden Phase
      if (!matchingPhase) {
        if (moonPhaseData.name === 'Neumond') {
          matchingPhase = moonPhases[0]; // Neumond
        } else if (moonPhaseData.name === 'Vollmond') {
          matchingPhase = moonPhases[2]; // Vollmond
        } else if (moonPhaseData.name.includes('Zunehmend')) {
          matchingPhase = moonPhases[1]; // Zunehmender Mond
        } else {
          matchingPhase = moonPhases[3]; // Abnehmender Mond
        }
      }
      
      // Erstelle aktualisierte Phase mit echten Daten
      const currentPhaseData: MoonPhase = {
        ...matchingPhase,
        name: moonPhaseData.name,
        icon: moonPhaseData.icon,
        description: `Aktuelle Mondphase: ${moonPhaseData.name} (${Math.round(moonPhaseData.phase * 100)}% des Zyklus)`
      };
      
      setCurrentPhase(currentPhaseData);
      
      // Versuche optional API-Aufruf im Hintergrund für zusätzliche Daten
      try {
        // const apiPhase = await apiService.getCurrentMoonPhase(); // Entfernt - verwende lokale Daten
        const apiPhase: any = null; // Fallback für lokale Entwicklung
        
        if (apiPhase && (apiPhase as any).success && (apiPhase as any).data) {
          const convertedPhase: MoonPhase = {
            name: (apiPhase as any).data.name || moonPhaseData.name,
            description: (apiPhase as any).data.description || currentPhaseData.description,
            icon: (apiPhase as any).data.emoji || moonPhaseData.icon,
            energy: (apiPhase as any).data.energy === 'high' ? 'Hoch' : (apiPhase as any).data.energy === 'medium' ? 'Mittel' : 'Niedrig',
            color: currentPhaseData.color,
            advice: currentPhaseData.advice,
            explanation: (apiPhase as any).data.description || currentPhaseData.explanation,
            reflectionExercises: currentPhaseData.reflectionExercises,
            moonRituals: currentPhaseData.moonRituals,
            humanDesignConnection: (apiPhase as any).data.humanDesignConnection || currentPhaseData.humanDesignConnection
          };
          setCurrentPhase(convertedPhase);
        }
      } catch {
        // API-Fehler ignorieren, lokale Daten verwenden
      }
    } catch (err) {
      console.error('Fehler beim Laden der Mondphase:', err);
      // Fallback zu lokalen Daten
      setCurrentPhase(moonPhases[0]);
    } finally {
      setLoading(false);
    }
  }, [moonPhases]);

  const calculateStreak = useCallback((data: MoonTracking[]) => {
    if (data.length === 0) return 0;
    
    const sortedDates = data
      .map(entry => new Date(entry.date))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < sortedDates.length; i++) {
      const entryDate = new Date(sortedDates[i]);
      entryDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }, []);

  const calculateStats = useCallback((data: MoonTracking[]) => {
    if (data.length === 0) {
      setStats({
        totalEntries: 0,
        averageMood: 0,
        averageEnergy: 0,
        averageSleep: 0,
        mostFrequentPhase: 'Keine Daten',
        streakDays: 0
      });
      return;
    }

    const totalMood = data.reduce((sum, entry) => sum + entry.mood, 0);
    const totalEnergy = data.reduce((sum, entry) => sum + entry.energy_level, 0);
    const totalSleep = data.reduce((sum, entry) => sum + entry.sleep_quality, 0);

    const phaseCounts = data.reduce((acc, entry) => {
      acc[entry.moon_phase] = (acc[entry.moon_phase] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentPhase = Object.entries(phaseCounts).reduce((a, b) => 
      phaseCounts[a[0]] > phaseCounts[b[0]] ? a : b
    )[0];

    setStats({
      totalEntries: data.length,
      averageMood: Math.round((totalMood / data.length) * 10) / 10,
      averageEnergy: Math.round((totalEnergy / data.length) * 10) / 10,
      averageSleep: Math.round((totalSleep / data.length) * 10) / 10,
      mostFrequentPhase,
      streakDays: calculateStreak(data)
    });
  }, [calculateStreak]);

  const loadUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // const data = await apiService.getMoonTracking(localStorage.getItem('userId') || ''); // Entfernt - verwende lokale Daten
      const data: any = null; // Fallback für lokale Entwicklung
      
      if (data && (data as any).success && (data as any).data) {
        setTrackingData((data as any).data);
        calculateStats((data as any).data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    }
  }, [calculateStats]);

  const loadUserProfile = async () => {
    try {
      // SSR-sicherer localStorage Zugriff
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = safeJsonParse(userData, {});
          setUserProfile(user);
          return;
        }
      }
      
      // Fallback zu Mock-Daten
      setUserProfile({
        hdType: 'Generator',
        hdStrategy: 'Auf Sacral-Antworten warten',
        hdAuthority: 'Sacral-Autorität',
        hdProfile: '3/5 Profil'
      });
    } catch (error) {
      console.error('Fehler beim Laden des User-Profils:', error);
      // Fallback zu Mock-Daten
      setUserProfile({
        hdType: 'Generator',
        hdStrategy: 'Auf Sacral-Antworten warten',
        hdAuthority: 'Sacral-Autorität',
        hdProfile: '3/5 Profil'
      });
    }
  };

  const loadMoonStories = useCallback(async () => {
    try {
      // Mock-Daten für Mond-Geschichten (später durch Supabase ersetzen)
      const stories: MoonStory[] = [
        {
          id: '1',
          title: 'Neumond - Neubeginn',
          culture: 'German',
          content: 'Der Neumond ist die perfekte Zeit für neue Projekte und Absichten.',
          moon_phase: 'new_moon',
          moral: 'Jeder Neubeginn braucht Geduld und Vertrauen.',
          tags: ['Neubeginn', 'Absichten', 'Geduld']
        },
        {
          id: '2', 
          title: 'Vollmond - Erfüllung',
          culture: 'German',
          content: 'Der Vollmond bringt Klarheit und zeigt uns, was wir erreicht haben.',
          moon_phase: 'full_moon',
          moral: 'Feiere deine Erfolge und erkenne dein Wachstum.',
          tags: ['Erfüllung', 'Klarheit', 'Erfolg']
        }
      ];
      if (stories) {
        setMoonStories(stories);
      }
      } catch (error) {
      console.error('Fehler beim Laden der Mond-Geschichten:', error);
      // Fallback zu Mock-Daten
      setMoonStories([
        {
          id: '1',
          title: 'Die Mondgöttin Selene',
          culture: 'Griechisch',
          content: 'Selene, die griechische Mondgöttin, fährt jeden Abend mit ihrem silbernen Wagen über den Himmel. Sie verliebte sich in den schönen Hirten Endymion und bat Zeus, ihm ewigen Schlaf zu gewähren, damit er für immer jung und schön bliebe.',
          moon_phase: 'Vollmond',
          moral: 'Die Kraft der Liebe und des ewigen Begehrens',
          tags: ['Liebe', 'Ewigkeit', 'Schönheit', 'Träume']
        },
        {
          id: '2',
          title: 'Der Mondhase',
          culture: 'Chinesisch',
          content: 'In der chinesischen Mythologie lebt ein Hase auf dem Mond, der mit einem Mörser und Stößel das Elixier der Unsterblichkeit herstellt. Der Hase symbolisiert Geduld und Ausdauer bei der Verfolgung spiritueller Ziele.',
          moon_phase: 'Vollmond',
          moral: 'Geduld und Ausdauer führen zur spirituellen Transformation',
          tags: ['Geduld', 'Spiritualität', 'Unsterblichkeit', 'Ausdauer']
        },
        {
          id: '3',
          title: 'Mani und die Wölfe',
          culture: 'Nordisch',
          content: 'In der nordischen Mythologie fährt Mani, der Mondgott, in seinem Wagen über den Himmel, verfolgt von zwei Wölfen. Diese Wölfe symbolisieren die Zeit, die unaufhaltsam vergeht, und erinnern uns an die Vergänglichkeit des Lebens.',
          moon_phase: 'Abnehmender Mond',
          moral: 'Nutze die Zeit weise und lebe im Moment',
          tags: ['Zeit', 'Vergänglichkeit', 'Weisheit', 'Gegenwart']
        },
        {
          id: '4',
          title: 'Die Mondgöttin Chang\'e',
          culture: 'Chinesisch',
          content: 'Chang\'e, die chinesische Mondgöttin, stahl das Elixier der Unsterblichkeit und floh zum Mond. Dort lebt sie in Einsamkeit, aber ihre Liebe zur Erde ist ungebrochen. Sie symbolisiert Opferbereitschaft und die Verbindung zwischen Himmel und Erde.',
          moon_phase: 'Neumond',
          moral: 'Manchmal müssen wir Opfer bringen, um unser wahres Selbst zu finden',
          tags: ['Opfer', 'Einsamkeit', 'Liebe', 'Transformation']
        },
        {
          id: '5',
          title: 'Der Mond und die Gezeiten',
          culture: 'Polynesisch',
          content: 'Die polynesische Legende erzählt von Maui, der den Mond einfing und ihn zwang, regelmäßig zu erscheinen. Dadurch entstanden die Gezeiten, die das Leben im Ozean und an den Küsten regeln. Der Mond wird als Regulator der natürlichen Rhythmen verehrt.',
          moon_phase: 'Zunehmender Mond',
          moral: 'Der Mond regelt die natürlichen Rhythmen des Lebens',
          tags: ['Rhythmus', 'Natur', 'Gezeiten', 'Regulation']
        },
        {
          id: '6',
          title: 'Die Mondfrau',
          culture: 'Japanisch',
          content: 'In der japanischen Folklore lebt eine alte Frau auf dem Mond, die unermüdlich Reis kocht. Sie symbolisiert Fruchtbarkeit, Wohlstand und die Verbindung zwischen Himmel und Erde. Ihre Arbeit bringt Segen für die Ernte.',
          moon_phase: 'Vollmond',
          moral: 'Fleiß und Hingabe bringen Fruchtbarkeit und Wohlstand',
          tags: ['Fruchtbarkeit', 'Wohlstand', 'Fleiß', 'Ernte']
        }
      ]);
    }
  }, []);

  const loadPlantRituals = useCallback(async () => {
    try {
      // Mock-Daten für Pflanzen-Rituale (später durch Supabase ersetzen)
      const rituals: PlantRitual[] = [
        {
          id: '1',
          name: 'Neumond-Säen',
          moon_phase: 'new_moon',
          plants: ['Basilikum', 'Koriander', 'Petersilie'],
          instructions: [
            'Bereiten Sie die Erde vor',
            'Säen Sie die Samen bei Sonnenuntergang',
            'Sprechen Sie Ihre Absicht aus',
            'Gießen Sie mit Mondwasser'
          ],
          benefits: [
            'Starkes Wurzelwachstum',
            'Tiefe Verbindung zur Erde',
            'Intensive Aromen',
            'Längere Haltbarkeit'
          ],
          timing: 'Bei Sonnenuntergang'
        },
        {
          id: '2',
          name: 'Vollmond-Ernte',
          moon_phase: 'full_moon',
          plants: ['Lavendel', 'Rosmarin', 'Thymian'],
          instructions: [
            'Warten Sie bis nach Sonnenuntergang',
            'Ernten Sie bei trockenem Wetter',
            'Verwenden Sie eine goldene Schere',
            'Lagern Sie in dunklen Gläsern'
          ],
          benefits: [
            'Maximale ätherische Öle',
            'Längere Haltbarkeit',
            'Stärkere Heilwirkung',
            'Energetische Reinigung'
          ],
          timing: 'Nach Sonnenuntergang'
        }
      ];
      if (rituals) {
        setPlantRituals(rituals);
      }
      } catch (error) {
      console.error('Fehler beim Laden der Pflanzen-Rituale:', error);
      // Fallback zu Mock-Daten
      setPlantRituals([
        {
          id: '1',
          name: 'Neumond-Saat',
          moon_phase: 'Neumond',
          plants: ['Wurzelgemüse', 'Kartoffeln', 'Karotten', 'Rüben'],
          instructions: [
            'Bereite den Boden vor und lockere ihn auf',
            'Säe die Samen in der Dunkelheit des Neumonds',
            'Visualisiere das Wachstum der Wurzeln',
            'Gieße mit Mondwasser (über Nacht stehen gelassen)'
          ],
          benefits: ['Stärkere Wurzelbildung', 'Bessere Nährstoffaufnahme', 'Robustere Pflanzen'],
          timing: 'Nachts oder in der Dämmerung'
        }
      ]);
    }
  }, []);

  const loadHealthGuidance = useCallback(async () => {
    try {
      // Mock-Daten für Gesundheits-Guidance (später durch Supabase ersetzen)
      const guidance: HealthGuidance[] = [
        {
          id: '1',
          moon_phase: 'new_moon',
          nutrition: {
            recommended: ['Viel Wasser', 'Grüne Smoothies', 'Leichte Kost'],
            avoid: ['Schwere Mahlzeiten', 'Alkohol', 'Zucker'],
            timing: 'Frühe Mahlzeiten, spätes Fasten'
          },
          health: {
            activities: ['Meditation', 'Yoga', 'Atemübungen'],
            rest: ['Früher schlafen gehen', 'Ruhephasen einlegen'],
            healing: ['Entgiftung', 'Reinigung', 'Reflexion']
          },
          supplements: ['Magnesium', 'Vitamin D', 'Probiotika']
        },
        {
          id: '2',
          moon_phase: 'full_moon',
          nutrition: {
            recommended: ['Energiereiche Nahrung', 'Proteine', 'Komplexe Kohlenhydrate'],
            avoid: ['Übermäßiges Essen', 'Schnelle Kohlenhydrate'],
            timing: 'Regelmäßige Mahlzeiten, ausreichend trinken'
          },
          health: {
            activities: ['Sport', 'Spaziergänge', 'Tanzen'],
            rest: ['Ausreichend Schlaf', 'Regeneration'],
            healing: ['Energie tanken', 'Aktivität', 'Geselligkeit']
          },
          supplements: ['B-Vitamine', 'Eisen', 'Omega-3']
        }
      ];
      if (guidance) {
        setHealthGuidance(guidance);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Gesundheits-Empfehlungen:', error);
      // Fallback zu Mock-Daten
      setHealthGuidance([
        {
          id: '1',
          moon_phase: 'Neumond',
          nutrition: {
            recommended: ['Entgiftende Tees', 'Grüne Smoothies', 'Wurzelgemüse', 'Fermentierte Lebensmittel'],
            avoid: ['Schwere Mahlzeiten', 'Alkohol', 'Zucker', 'Verarbeitete Lebensmittel'],
            timing: 'Leichte Mahlzeiten, viel Flüssigkeit'
          },
          health: {
            activities: ['Meditation', 'Yoga', 'Spaziergänge', 'Atemübungen'],
            rest: ['Früher schlafen', 'Digital Detox', 'Ruhephasen', 'Reflexion'],
            healing: ['Entgiftung', 'Fasten', 'Kräutertees', 'Sauna']
          },
          supplements: ['Mariendistel', 'Brennnessel', 'Löwenzahn', 'Chlorella']
        }
      ]);
    }
  }, []);

  useEffect(() => {
    loadCurrentMoonPhase();
    loadUserData();
    loadMoonStories();
    loadPlantRituals();
    loadHealthGuidance();
  }, [loadCurrentMoonPhase, loadUserData, loadMoonStories, loadPlantRituals, loadHealthGuidance]);

  const handleSaveEntry = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const entryData: MoonTracking = {
        id: Date.now().toString(),
        user_id: localStorage.getItem('userId') || '',
        date: new Date().toISOString().split('T')[0],
        mood: newEntry.mood,
        energy_level: newEntry.energy_level,
        sleep_quality: newEntry.sleep_quality,
        notes: newEntry.notes,
        moon_phase: currentPhase?.name || 'Unbekannt',
        created_at: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Mock-Response für Mond-Tracking (später durch Supabase ersetzen)
      const response = { 
        success: true, 
        message: 'Mond-Tracking-Daten gespeichert',
        data: {
          userId: 'current-user',
          date: new Date().toISOString(),
          phase: currentPhase?.name || 'unknown',
          mood: newEntry.mood,
          energy: newEntry.energy_level,
          notes: newEntry.notes
        }
      };

      if (response.success) {
        setNewEntry({
          mood: 5,
          energy_level: 5,
          sleep_quality: 5,
          notes: '',
          moon_phase: ''
        });
        loadUserData();
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Zeige Loading-Screen nur während des Ladens
  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #0F1220 0%, #1A0E08 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(90% 70% at 50% 28%, rgba(242, 159, 5, 0.36), transparent 78%), radial-gradient(60% 50% at 82% 82%, rgba(140, 29, 4, 0.24), transparent 78%)'
        },
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} sx={{ color: '#F29F05' }} />
          <Typography variant="h6" sx={{ color: 'white', textAlign: 'center' }}>
          Mondkalender wird geladen...
          </Typography>
      </Box>
    );
  }


  return (
    <AccessControl 
      path={pathname} 
      userSubscription={userSubscription}
      onUpgrade={() => router.push('/subscription')}
    >
      <Box sx={{ 
        minHeight: '100vh',
        position: 'relative',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        backgroundAttachment: 'fixed',
        overflow: 'hidden',
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

        <PageLayout activePage="dashboard" showLogo={true}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography 
                variant="h1" 
                sx={{ 
                  color: '#ffffff',
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '4rem' }
                }}
              >
                🌕 Mondkalender
              </Typography>
              <Typography
                variant="h5"
                sx={{ 
                  color: 'rgba(255,255,255,0.85)', 
                  maxWidth: 700, 
                  mx: 'auto', 
                  lineHeight: 1.7,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  fontWeight: 300
                }}
              >
                Entdecke die Kraft der Mondzyklen und ihre Auswirkungen auf dein Leben
              </Typography>
            </Box>
          
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            {/* Upgrade Promotion für Basic-User */}
            {userSubscription?.packageId === 'basic' && (
                <Box sx={{
                  background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.10) 0%, rgba(140, 29, 4, 0.10) 100%)',
                  border: '1px solid rgba(242, 159, 5, 0.30)',
                  borderRadius: 3,
                  p: 3,
                  mb: 4,
                  backdropFilter: 'blur(10px)'
                }}>
                  <Typography variant="h6" sx={{ color: '#F29F05', mb: 1, fontWeight: 'bold' }}>
                    🌙 Entdecke den vollständigen Mondkalender
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                    Als Premium-Mitglied erhältst du erweiterte Mondphasen-Analysen, persönliche Rituale und exklusive Insights.
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => router.push('/subscription')}
                    sx={{
                      background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                      color: 'white',
                      fontWeight: 'bold',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    🚀 Jetzt upgraden
                  </Button>
                </Box>
            )}
            
          </Box>

        {/* Profil Widget */}
        <motion.div
          
          
          
        >
          <Card sx={{ 
            background: 'rgba(242, 159, 5, 0.06)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.15)',
            borderRadius: 3, 
            mb: 4
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar 
                  sx={{ 
                    width: 60, 
                    height: 60, 
                    mr: 3,
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    fontSize: '1.5rem'
                  }}
                >
                  👤
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ color: '#F29F05', fontWeight: 600, mb: 1 }}>
                    Dein Human Design Profil
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Personalisierte Mond-Insights basierend auf deinem Chart
                  </Typography>
                </Box>
                <Chip 
                  label="Premium" 
                  sx={{ 
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    color: 'white',
                    fontWeight: 600
                  }} 
                />
              </Box>
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ color: '#F29F05', mb: 1 }}>
                      🧬
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                      {String(userProfile?.hdType || 'Generator')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Dein Human Design Typ
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ color: '#10b981', mb: 1 }}>
                      🎯
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                      Strategie
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {String(userProfile?.hdStrategy || 'Auf Sacral-Antworten warten')}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ color: '#f59e0b', mb: 1 }}>
                      ⚡
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                      Autorität
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {String(userProfile?.hdAuthority || 'Sacral-Autorität')}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ color: '#ef4444', mb: 1 }}>
                      📊
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                      {String(userProfile?.hdProfile || '3/5 Profil')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Martyrer-Heretiker
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 3, p: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontStyle: 'italic' }}>
                  &ldquo;Als Generator profitierst du besonders von der zunehmenden Mondphase für neue Projekte 
                  und vom abnehmenden Mond für Reflexion und Loslassen.&rdquo;
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {/* Aktuelle Mondphase */}
          {currentPhase && (
        <motion.div
          
          
              
            >
                <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 3,
                mb: 4
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h1" sx={{ 
                        mr: 2, 
                        fontSize: '4rem',
                        animation: 'moonPhaseGlow 3s ease-in-out infinite alternate'
                      }}>
                        {currentPhase.icon}
                      </Typography>
                      <Box>
                      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 600, mb: 1 }}>
                        {currentPhase.name}
                        </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                        {currentPhase.description}
                        </Typography>
                      </Box>
                    </Box>

                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ color: '#F29F05', mb: 2 }}>
                        💡 Empfehlung
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        {currentPhase.advice}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ color: '#F29F05', mb: 2 }}>
                        ⚡ Energie-Level
                      </Typography>
                      <Chip 
                        label={currentPhase.energy} 
                        sx={{ 
                          background: currentPhase.color,
                          color: '#fff',
                          fontWeight: 600
                        }} 
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
                    </motion.div>
          )}

        
          {/* Tabs */}
          <motion.div
            
            
            
          >
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 3
            }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  '& .MuiTab-root': {
                    color: 'rgba(255,255,255,0.7)',
                    fontWeight: 600,
                    fontSize: '1rem',
                    py: 2,
                    '&.Mui-selected': {
                      color: '#F29F05'
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#F29F05',
                    height: 3
                  }
                }}
              >
                <Tab 
                  icon={<Calendar size={24} />} 
                  label="Kalender & Phasen" 
                  iconPosition="start" 
                />
                <Tab 
                  icon={<Activity size={24} />} 
                  label="Tracking & Stats" 
                  iconPosition="start" 
                />
                <Tab 
                  icon={<BookOpen size={24} />} 
                  label="Wissen & Rituale" 
                  iconPosition="start" 
                />
                <Tab 
                  icon={<Users size={24} />} 
                  label="Beziehungen & Verbindungen" 
                  iconPosition="start" 
                />
                <Tab 
                  icon={<Bell size={24} />} 
                  label="Einstellungen" 
                  iconPosition="start" 
                />
              </Tabs>

              {/* Kalender & Phasen Tab */}
              {activeTab === 0 && (
                <Box sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                    📅 Mondkalender & Phasen
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4 }}>
                    Hier findest du den vollständigen Mondkalender mit echten Mondphasen und deren Auswirkungen.
                  </Typography>
                  
                  {/* Monatsauswahl */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                      Wähle einen Monat:
                    </Typography>
                    <Grid container spacing={3}>
                      {[
                        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
                      ].map((month, index) => (
                        <Grid item xs={3} sm={2} md={1} key={index}>
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => setSelectedMonth(index + 1)}
                            sx={{
                              color: selectedMonth === index + 1 ? '#02000D' : '#F29F05',
                              borderColor: selectedMonth === index + 1 ? '#F29F05' : 'rgba(242, 159, 5, 0.30)',
                              backgroundColor: selectedMonth === index + 1 ? 'rgba(242, 159, 5, 0.20)' : 'transparent',
                              '&:hover': {
                                borderColor: '#F29F05',
                                backgroundColor: 'rgba(242, 159, 5, 0.10)'
                              }
                            }}
                          >
                            {month}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  {/* Kalender-Grid */}
                  <Card sx={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    p: 3,
                    mb: 4
                  }}>
                    <Typography variant="h6" sx={{ color: '#fff', mb: 3, textAlign: 'center' }}>
                      {[
                        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
                      ][selectedMonth - 1]} {selectedYear}
                    </Typography>
                    
                    {/* Wochentage Header */}
                    <Grid container spacing={1} sx={{ mb: 1 }}>
                      {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
                        <Grid item xs key={day}>
                          <Typography variant="subtitle2" sx={{ 
                            color: '#F29F05', 
                            textAlign: 'center', 
                            fontWeight: 600,
                            py: 1
                          }}>
                            {day}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                    
                    {/* Kalender-Tage */}
                    <Grid container spacing={0.5}>
                      {generateCalendarDays(selectedYear, selectedMonth).map((day, index) => (
                        <Grid item xs={12/7} key={index} sx={{ aspectRatio: '1' }}>
                          <Card sx={{
                            background: day.isCurrentMonth 
                              ? (day.isToday ? 'rgba(242, 159, 5, 0.25)' : 'rgba(255, 255, 255, 0.05)')
                              : 'rgba(255, 255, 255, 0.02)',
                            border: day.isToday 
                              ? '2px solid #F29F05' 
                              : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 1,
                            height: '100%',
                            minHeight: 80,
                            p: 0.5,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            '&:hover': {
                              backgroundColor: day.isCurrentMonth 
                                ? 'rgba(242, 159, 5, 0.10)' 
                                : 'rgba(255, 255, 255, 0.05)'
                            }
                          }}>
                            <Typography variant="body2" sx={{ 
                              color: day.isCurrentMonth ? '#fff' : 'rgba(255,255,255,0.4)', 
                              fontWeight: day.isToday ? 700 : 400,
                              fontSize: '0.8rem',
                              textAlign: 'center'
                            }}>
                              {day.day}
                            </Typography>
                            
                            {day.isCurrentMonth && (
                              <Box sx={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <Typography variant="h6" sx={{ color: '#F29F05', mb: 0.5, fontSize: '1.2rem' }}>
                                  {getMoonPhaseIcon(day.date)}
                                </Typography>
                                <Typography variant="caption" sx={{ 
                                  color: 'rgba(255,255,255,0.7)', 
                                  fontSize: '0.6rem',
                                  lineHeight: 1,
                                  textAlign: 'center'
                                }}>
                                  {getMoonPhase(day.date)?.name || 'Mond'}
                                </Typography>
                              </Box>
                            )}
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Card>
                  
                  {/* Aktuelle Mondphase Details */}
                  {currentPhase && (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
                        🌙 Aktuelle Mondphase Details
                      </Typography>
                      <Grid container spacing={5}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                            📖 Erklärung
                          </Typography>
                          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 3 }}>
                            {currentPhase.explanation}
                          </Typography>
                          
                          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                            🧘 Reflektionsübungen
                          </Typography>
                          <List>
                            {currentPhase.reflectionExercises.map((exercise, index) => (
                              <ListItem key={index} sx={{ px: 0 }}>
                                <ListItemIcon>
                                  <Star size={16} style={{ color: '#F29F05' }} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={exercise}
                                  sx={{ color: 'rgba(255,255,255,0.8)' }}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                            🔮 Mondrituale
                          </Typography>
                          <List>
                            {currentPhase.moonRituals.map((ritual, index) => (
                              <ListItem key={index} sx={{ px: 0 }}>
                                <ListItemIcon>
                                  <Star size={16} style={{ color: '#F29F05' }} />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={ritual}
                                  sx={{ color: 'rgba(255,255,255,0.8)' }}
                                />
                              </ListItem>
                            ))}
                          </List>

                          <Typography variant="h6" sx={{ color: '#fff', mb: 2, mt: 3 }}>
                            🧬 Human Design Verbindung
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                            {currentPhase.humanDesignConnection}
                          </Typography>
                          
                          {/* Spezielle Human Design Vollmond-Rituale */}
                          {currentPhase.name === 'Vollmond' && (
                            <Box sx={{ 
                              mt: 3, 
                              p: 3, 
                              background: 'rgba(255, 215, 0, 0.1)', 
                              borderRadius: 2,
                              border: '1px solid rgba(255, 215, 0, 0.3)'
                            }}>
                              <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                                🌕 Human Design Vollmond-Rituale
                              </Typography>
                              <List dense>
                                <ListItem sx={{ px: 0 }}>
                                  <ListItemIcon>
                                    <Star size={16} style={{ color: '#FFD700' }} />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary="Chart-Reflexion: Studiere dein Human Design Chart bei Vollmondlicht"
                                    sx={{ color: 'rgba(255,255,255,0.8)' }}
                                  />
                                </ListItem>
                                <ListItem sx={{ px: 0 }}>
                                  <ListItemIcon>
                                    <Star size={16} style={{ color: '#FFD700' }} />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary="Authentizitäts-Check: Prüfe, ob du deiner Strategie und Autorität folgst"
                                    sx={{ color: 'rgba(255,255,255,0.8)' }}
                                  />
                                </ListItem>
                                <ListItem sx={{ px: 0 }}>
                                  <ListItemIcon>
                                    <Star size={16} style={{ color: '#FFD700' }} />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary="Konditionierung loslassen: Identifiziere und befreie dich von nicht-authentischen Mustern"
                                    sx={{ color: 'rgba(255,255,255,0.8)' }}
                                  />
                                </ListItem>
                                <ListItem sx={{ px: 0 }}>
                                  <ListItemIcon>
                                    <Star size={16} style={{ color: '#FFD700' }} />
                                  </ListItemIcon>
                                  <ListItemText 
                                    primary="Manifestation: Visualisiere, wie du dein Human Design in die Welt bringst"
                                    sx={{ color: 'rgba(255,255,255,0.8)' }}
                                  />
                                </ListItem>
                              </List>
                            </Box>
                          )}
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Box>
              )}

              {/* Tracking & Stats Tab */}
              {activeTab === 1 && (
                <Box sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                    📊 Tracking & Statistiken
                  </Typography>
                  
                  {/* Tracking Form */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
                      📝 Heute tracken
                    </Typography>
                    
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                          Stimmung: {newEntry.mood}/10
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={newEntry.mood * 10} 
                          sx={{
                            height: 8, 
                            borderRadius: 4,
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(90deg, #ef4444, #f59e0b, #10b981)'
                            }
                          }}
                        />
                        <Slider
                          value={newEntry.mood}
                          onChange={(e, value) => setNewEntry({...newEntry, mood: value as number})}
                          min={1}
                          max={10}
                          step={1}
                          marks
                          valueLabelDisplay="auto"
                          sx={{ mt: 2 }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                          Energie: {newEntry.energy_level}/10
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={newEntry.energy_level * 10} 
                          sx={{
                            height: 8, 
                            borderRadius: 4,
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(90deg, #6b7280, #f59e0b, #10b981)'
                            }
                          }}
                        />
                        <Slider
                          value={newEntry.energy_level}
                          onChange={(e, value) => setNewEntry({...newEntry, energy_level: value as number})}
                          min={1}
                          max={10}
                          step={1}
                          marks
                          valueLabelDisplay="auto"
                          sx={{ mt: 2 }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                          Schlaf: {newEntry.sleep_quality}/10
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={newEntry.sleep_quality * 10} 
                          sx={{
                            height: 8, 
                            borderRadius: 4,
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(90deg, #6b7280, #3b82f6, #8b5cf6)'
                            }
                          }}
                        />
                        <Slider
                          value={newEntry.sleep_quality}
                          onChange={(e, value) => setNewEntry({...newEntry, sleep_quality: value as number})}
                          min={1}
                          max={10}
                          step={1}
                          marks
                          valueLabelDisplay="auto"
                          sx={{ mt: 2 }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          placeholder="Notizen zum heutigen Tag..."
                          value={newEntry.notes}
                          onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              color: '#fff',
                              '& fieldset': {
                                borderColor: 'rgba(255,255,255,0.3)'
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(255,255,255,0.5)'
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#F29F05'
                              }
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          onClick={handleSaveEntry}
                          startIcon={<Plus size={20} />}
                          sx={{
                            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                            color: '#fff',
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 600,
                            borderRadius: 3,
                            '&:hover': { 
                              background: 'linear-gradient(135deg, #8C1D04, #590A03)'
                            }
                          }}
                        >
                          Eintrag speichern
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  {/* Statistiken */}
                  <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
                    📊 Deine Statistiken
                  </Typography>
                  
                  {stats ? (
                    <Grid container spacing={4}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 2
                        }}>
                          <CardContent sx={{ textAlign: 'center', p: 3 }}>
                            <Typography variant="h4" sx={{ color: '#F29F05', fontWeight: 700 }}>
                              {stats.totalEntries}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              Einträge
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 2
                        }}>
                          <CardContent sx={{ textAlign: 'center', p: 3 }}>
                            <Typography variant="h4" sx={{ color: '#10b981', fontWeight: 700 }}>
                              {stats.averageMood}/10
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              Ø Stimmung
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 2
                        }}>
                          <CardContent sx={{ textAlign: 'center', p: 3 }}>
                            <Typography variant="h4" sx={{ color: '#f59e0b', fontWeight: 700 }}>
                              {stats.averageEnergy}/10
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              Ø Energie
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ 
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 2
                        }}>
                          <CardContent sx={{ textAlign: 'center', p: 3 }}>
                            <Typography variant="h4" sx={{ color: '#ef4444', fontWeight: 700 }}>
                              {stats.streakDays}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              Tage Streak
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      Noch keine Tracking-Daten vorhanden. Starte dein Tracking!
                    </Alert>
                  )}
                </Box>
              )}

              {/* Wissen & Rituale Tab */}
              {activeTab === 2 && (
                <Box sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                    📚 Wissen & Rituale
                  </Typography>
                  
                  <Grid container spacing={5}>
                    {/* Mond-Geschichten */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
                        📖 Mond-Geschichten & Mythen
                      </Typography>
                      
                      <Grid container spacing={4}>
                        {moonStories.map((story) => (
                          <Grid item xs={12} key={story.id}>
                            <Card sx={{
                              background: 'rgba(255, 255, 255, 0.05)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: 2
                            }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <Typography variant="h6" sx={{ color: '#FFD700', mr: 1 }}>
                                    {story.moon_phase === 'Vollmond' ? '🌕' : 
                                     story.moon_phase === 'Neumond' ? '🌑' : '🌙'}
                                  </Typography>
                                  <Typography variant="h6" sx={{ color: '#fff' }}>
                                    {story.title}
                                  </Typography>
                                </Box>
                                <Chip 
                                  label={story.culture} 
                                  size="small" 
                                  sx={{ 
                                    background: '#F29F05', 
                                    color: '#fff', 
                                    mb: 2 
                                  }} 
                                />
                                <Typography variant="body2" sx={{ 
                                  color: 'rgba(255,255,255,0.8)', 
                                  mb: 2, 
                                  display: '-webkit-box',
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}>
                                  {story.content}
                                </Typography>
                                <Typography variant="body2" sx={{ 
                                  color: '#FFD700', 
                                  fontStyle: 'italic',
                                  fontSize: '0.9rem'
                                }}>
                                  💡 {story.moral}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>

                    {/* Pflanzen-Rituale */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
                        🌱 Pflanzen-Rituale & Mond-Gärtnern
                      </Typography>
                      
                      <Grid container spacing={4}>
                        {plantRituals.map((ritual) => (
                          <Grid item xs={12} key={ritual.id}>
                            <Card sx={{
                              background: 'rgba(34, 197, 94, 0.1)',
                              border: '1px solid rgba(34, 197, 94, 0.3)',
                              borderRadius: 2
                            }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <Flower2 size={24} color="#22c55e" style={{ marginRight: 8 }} />
                                  <Typography variant="h6" sx={{ color: '#22c55e' }}>
                                    {ritual.name}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={ritual.moon_phase} 
                                  size="small" 
                                  sx={{
                                    background: '#22c55e', 
                                    color: '#fff', 
                                    mb: 2 
                                  }} 
                                />
                                <Typography variant="body2" sx={{ color: '#fff', mb: 2 }}>
                                  <strong>Pflanzen:</strong> {ritual.plants.join(', ')}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#fff', mb: 2 }}>
                                  <strong>Timing:</strong> {ritual.timing}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                  <strong>Vorteile:</strong> {ritual.benefits.join(', ')}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>

                    {/* Gesundheit */}
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
                        💚 Gesundheit & Ernährung nach Mondphasen
                      </Typography>
                      
                      <Grid container spacing={4}>
                        {healthGuidance.map((guidance) => (
                          <Grid item xs={12} md={6} key={guidance.id}>
                            <Card sx={{ 
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: 2
                            }}>
                              <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                  <Heart size={24} color="#ef4444" style={{ marginRight: 8 }} />
                                  <Typography variant="h6" sx={{ color: '#ef4444' }}>
                                    {guidance.moon_phase}
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
                                    <strong>🍎 Ernährung:</strong>
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                                    Empfohlen: {guidance.nutrition.recommended.join(', ')}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    Vermeiden: {guidance.nutrition.avoid.join(', ')}
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
                                    <strong>⚡ Aktivitäten:</strong>
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    {guidance.health.activities.join(', ')}
                                  </Typography>
                                </Box>
                                
                                <Box>
                                  <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
                                    <strong>💊 Ergänzungen:</strong>
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    {guidance.supplements.join(', ')}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Beziehungen & Verbindungen Tab */}
              {activeTab === 3 && (
                <Box sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ 
                    color: 'white', 
                    mb: 2, 
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    💑 Beziehungen & Verbindungen anhand des Profils
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4 }}>
                    Entdecke, wie verschiedene Human Design Profile die Mondphasen für authentische Beziehungen und Verbindungen nutzen können.
                  </Typography>
                  
                  <Grid container spacing={4}>
                    {[
                      {
                        id: '1',
                        profile: '1/3 - Der Forscher/Experte',
                        moon_phase: 'Neumond',
                        description: 'Der Neumond unterstützt deine natürliche Neigung, tief zu graben und zu forschen. Nutze diese Zeit, um neue Verbindungen zu erkunden und zu verstehen, was wirklich funktioniert.',
                        tips: [
                          'Neue Kontakte knüpfen und erste Eindrücke sammeln',
                          'Tiefe Gespräche führen, um echte Verbindungen zu finden',
                          'Vorsichtig vorgehen und nicht zu schnell urteilen',
                          'Deine natürliche Neugier nutzen, um Menschen kennenzulernen'
                        ],
                        connection_advice: 'Der Neumond hilft dir, authentische Verbindungen zu finden, die deine tiefe Natur respektieren. Nutze deine Strategie: Warte auf Einladungen (Projector) oder höre auf deine Sacral-Antworten (Generator).'
                      },
                      {
                        id: '2',
                        profile: '1/4 - Der Forscher/Optimist',
                        moon_phase: 'Zunehmender Mond',
                        description: 'Der zunehmende Mond verstärkt deine optimistische Natur und hilft dir, dein Netzwerk zu erweitern. Perfekt für soziale Aktivitäten und neue Freundschaften.',
                        tips: [
                          'Soziale Events besuchen und neue Menschen treffen',
                          'Deine natürliche Freundlichkeit nutzen, um Brücken zu bauen',
                          'Bestehende Freundschaften vertiefen',
                          'Dein Netzwerk erweitern durch gemeinsame Interessen'
                        ],
                        connection_advice: 'Der zunehmende Mond unterstützt deine natürliche Fähigkeit, Menschen zusammenzubringen. Nutze deine Autorität, um zu erkennen, welche Verbindungen wirklich nähren.'
                      },
                      {
                        id: '3',
                        profile: '2/4 - Der Hermit/Optimist',
                        moon_phase: 'Vollmond',
                        description: 'Der Vollmond bringt deine duale Natur ans Licht - dein Bedürfnis nach Alleinsein und gleichzeitig deine soziale Seite. Nutze diese Zeit für tiefe, bedeutsame Verbindungen.',
                        tips: [
                          'Qualität vor Quantität: Wenige, aber tiefe Verbindungen',
                          'Zeit für dich allein einplanen, um Energie zu tanken',
                          'Wenn du eingeladen wirst, nutze diese Gelegenheiten',
                          'Deine natürliche Authentizität zeigen'
                        ],
                        connection_advice: 'Der Vollmond zeigt dir, welche Verbindungen wirklich nähren. Als 2/4: Nutze deine natürliche Fähigkeit, Menschen zu erkennen, die zu dir passen, aber respektiere auch dein Bedürfnis nach Rückzug.'
                      },
                      {
                        id: '4',
                        profile: '3/5 - Der Märtyrer/Heretiker',
                        moon_phase: 'Abnehmender Mond',
                        description: 'Der abnehmende Mond unterstützt dich dabei, aus Beziehungen zu lernen und loszulassen, was nicht funktioniert. Perfekt für Reflektion und Wachstum.',
                        tips: [
                          'Aus vergangenen Beziehungen lernen',
                          'Muster erkennen, die nicht mehr dienen',
                          'Loslassen, was nicht authentisch ist',
                          'Neue Wege in Beziehungen ausprobieren'
                        ],
                        connection_advice: 'Der abnehmende Mond hilft dir, deine natürliche Neigung zu experimentieren zu nutzen, während du gleichzeitig lernst, was wirklich funktioniert. Nutze diese Zeit für innere Klärung.'
                      },
                      {
                        id: '5',
                        profile: '4/6 - Der Opportunist/Role Model',
                        moon_phase: 'Neumond',
                        description: 'Der Neumond ist ideal für dich, um neue Verbindungen zu knüpfen und dein natürliches Netzwerk zu erweitern. Nutze deine Fähigkeit, Menschen zusammenzubringen.',
                        tips: [
                          'Neue Kontakte in deinem Netzwerk knüpfen',
                          'Gemeinsame Projekte initiieren',
                          'Deine natürliche Fähigkeit nutzen, Menschen zu verbinden',
                          'Als Role Model andere inspirieren'
                        ],
                        connection_advice: 'Der Neumond unterstützt deine natürliche Rolle als Verbinder. Nutze deine Strategie und Autorität, um zu erkennen, welche Verbindungen wirklich nähren und wachsen können.'
                      },
                      {
                        id: '6',
                        profile: '5/1 - Der Generalist/Forscher',
                        moon_phase: 'Vollmond',
                        description: 'Der Vollmond bringt deine natürliche Fähigkeit ans Licht, Lösungen für andere zu finden. Nutze diese Zeit, um zu sehen, welche Verbindungen wirklich funktionieren.',
                        tips: [
                          'Deine natürliche Fähigkeit nutzen, anderen zu helfen',
                          'Erkenne, welche Verbindungen wirklich nähren',
                          'Vermeide Projektionen - sei authentisch',
                          'Nutze deine praktische Weisheit in Beziehungen'
                        ],
                        connection_advice: 'Der Vollmond zeigt dir, welche Verbindungen wirklich funktionieren. Als 5/1: Nutze deine natürliche Fähigkeit, praktische Lösungen zu finden, aber erkenne auch deine eigenen Bedürfnisse.'
                      },
                      {
                        id: '7',
                        profile: '6/2 - Der Role Model/Hermit',
                        moon_phase: 'Vollmond',
                        description: 'Der Vollmond bringt deine natürliche Rolle als Role Model ans Licht. Nutze diese Zeit, um zu sehen, welche Verbindungen wirklich nähren und welche du loslassen kannst.',
                        tips: [
                          'Erkenne, welche Verbindungen wirklich nähren',
                          'Nutze deine natürliche Weisheit, um andere zu führen',
                          'Zeit für dich allein einplanen, um Energie zu tanken',
                          'Deine natürliche Authentizität als Vorbild zeigen'
                        ],
                        connection_advice: 'Der Vollmond zeigt dir, welche Verbindungen wirklich funktionieren. Als 6/2: Nutze deine natürliche Rolle als Role Model, aber respektiere auch dein Bedürfnis nach Rückzug und Alleinsein.'
                      },
                      {
                        id: '8',
                        profile: '6/3 - Der Role Model/Experte',
                        moon_phase: 'Abnehmender Mond',
                        description: 'Der abnehmende Mond unterstützt dich dabei, aus Beziehungen zu lernen und loszulassen, was nicht funktioniert. Perfekt für Reflektion und Wachstum in Verbindungen.',
                        tips: [
                          'Aus vergangenen Beziehungen lernen',
                          'Muster erkennen, die nicht mehr dienen',
                          'Loslassen, was nicht authentisch ist',
                          'Deine natürliche Neugier nutzen, um Menschen zu verstehen'
                        ],
                        connection_advice: 'Der abnehmende Mond hilft dir, deine natürliche Neigung zu experimentieren zu nutzen, während du gleichzeitig lernst, was wirklich funktioniert. Als 6/3: Nutze diese Zeit für innere Klärung und Wachstum.'
                      },
                      {
                        id: '9',
                        profile: '4/1 - Der Opportunist/Forscher',
                        moon_phase: 'Zunehmender Mond',
                        description: 'Der zunehmende Mond verstärkt deine natürliche Fähigkeit, Menschen zusammenzubringen. Perfekt für soziale Aktivitäten und neue Freundschaften.',
                        tips: [
                          'Soziale Events besuchen und neue Menschen treffen',
                          'Deine natürliche Freundlichkeit nutzen, um Brücken zu bauen',
                          'Bestehende Freundschaften vertiefen',
                          'Dein Netzwerk erweitern durch gemeinsame Interessen'
                        ],
                        connection_advice: 'Der zunehmende Mond unterstützt deine natürliche Fähigkeit, Menschen zusammenzubringen. Nutze deine Autorität, um zu erkennen, welche Verbindungen wirklich nähren.'
                      },
                      {
                        id: '10',
                        profile: '2/5 - Der Hermit/Heretiker',
                        moon_phase: 'Neumond',
                        description: 'Der Neumond unterstützt deine natürliche Neigung, tief zu graben und zu forschen. Nutze diese Zeit, um neue Verbindungen zu erkunden und zu verstehen, was wirklich funktioniert.',
                        tips: [
                          'Neue Kontakte knüpfen und erste Eindrücke sammeln',
                          'Tiefe Gespräche führen, um echte Verbindungen zu finden',
                          'Vorsichtig vorgehen und nicht zu schnell urteilen',
                          'Deine natürliche Neugier nutzen, um Menschen kennenzulernen'
                        ],
                        connection_advice: 'Der Neumond hilft dir, authentische Verbindungen zu finden, die deine tiefe Natur respektieren. Als 2/5: Nutze deine natürliche Fähigkeit, Menschen zu erkennen, die zu dir passen.'
                      },
                      {
                        id: '11',
                        profile: '3/6 - Der Märtyrer/Role Model',
                        moon_phase: 'Abnehmender Mond',
                        description: 'Der abnehmende Mond unterstützt dich dabei, aus Beziehungen zu lernen und loszulassen, was nicht funktioniert. Perfekt für Reflektion und Wachstum.',
                        tips: [
                          'Aus vergangenen Beziehungen lernen',
                          'Muster erkennen, die nicht mehr dienen',
                          'Loslassen, was nicht authentisch ist',
                          'Neue Wege in Beziehungen ausprobieren'
                        ],
                        connection_advice: 'Der abnehmende Mond hilft dir, deine natürliche Neigung zu experimentieren zu nutzen, während du gleichzeitig lernst, was wirklich funktioniert. Nutze diese Zeit für innere Klärung.'
                      },
                      {
                        id: '12',
                        profile: '5/2 - Der Generalist/Hermit',
                        moon_phase: 'Vollmond',
                        description: 'Der Vollmond bringt deine natürliche Fähigkeit ans Licht, Lösungen für andere zu finden. Nutze diese Zeit, um zu sehen, welche Verbindungen wirklich funktionieren.',
                        tips: [
                          'Deine natürliche Fähigkeit nutzen, anderen zu helfen',
                          'Erkenne, welche Verbindungen wirklich nähren',
                          'Zeit für dich allein einplanen, um Energie zu tanken',
                          'Nutze deine praktische Weisheit in Beziehungen'
                        ],
                        connection_advice: 'Der Vollmond zeigt dir, welche Verbindungen wirklich funktionieren. Als 5/2: Nutze deine natürliche Fähigkeit, praktische Lösungen zu finden, aber respektiere auch dein Bedürfnis nach Rückzug.'
                      }
                    ].map((relationship) => (
                      <Grid item xs={12} md={6} key={relationship.id}>
                        <Card sx={{ 
                          background: 'rgba(242, 159, 5, 0.1)',
                          border: '1px solid rgba(242, 159, 5, 0.3)',
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 10px 30px rgba(242, 159, 5, 0.3)',
                            border: '1px solid rgba(242, 159, 5, 0.5)'
                          }
                        }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Users size={24} color="#F29F05" style={{ marginRight: 8 }} />
                              <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700 }}>
                                {relationship.profile}
                              </Typography>
                            </Box>
                            
                            <Chip
                              label={relationship.moon_phase} 
                              size="small" 
                              sx={{
                                background: 'rgba(242, 159, 5, 0.25)', 
                                color: '#F29F05', 
                                mb: 2,
                                fontWeight: 600
                              }} 
                            />
                            
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, lineHeight: 1.7 }}>
                              {relationship.description}
                            </Typography>
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" sx={{ color: '#F29F05', mb: 1, fontWeight: 600 }}>
                                💡 Praktische Tipps:
                              </Typography>
                              {relationship.tips.map((tip, idx) => (
                                <Typography key={idx} variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 0.5, pl: 2 }}>
                                  • {tip}
                                </Typography>
                              ))}
                            </Box>
                            
                            <Box sx={{ 
                              mt: 2, 
                              p: 2, 
                              background: 'rgba(242, 159, 5, 0.08)', 
                              borderRadius: 2,
                              border: '1px solid rgba(242, 159, 5, 0.2)'
                            }}>
                              <Typography variant="body2" sx={{ color: '#F29F05', fontWeight: 600, mb: 1 }}>
                                🔑 Connection Key Tipp:
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.7 }}>
                                {relationship.connection_advice}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Einstellungen Tab */}
              {activeTab === 4 && (
                <Box sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                    ⚙️ Einstellungen
                  </Typography>
                  
                  <Typography variant="h6" sx={{ color: '#fff', mb: 3 }}>
                    🔔 Benachrichtigungen
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.moonPhaseReminders}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            moonPhaseReminders: e.target.checked
                          })}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#F29F05'
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#F29F05'
                            }
                          }}
                        />
                      }
                      label="Mondphasen-Erinnerungen"
                      sx={{ color: 'rgba(255,255,255,0.8)' }}
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.dailyReminders}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            dailyReminders: e.target.checked
                          })}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#F29F05'
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#F29F05'
                            }
                          }}
                        />
                      }
                      label="Tägliche Erinnerungen"
                      sx={{ color: 'rgba(255,255,255,0.8)' }}
                    />
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notificationSettings.weeklyReports}
                          onChange={(e) => setNotificationSettings({
                            ...notificationSettings,
                            weeklyReports: e.target.checked
                          })}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#F29F05'
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: '#F29F05'
                            }
                          }}
                        />
                      }
                      label="Wöchentliche Berichte"
                      sx={{ color: 'rgba(255,255,255,0.8)' }}
                    />
                  </Box>
                </Box>
              )}

              </Card>

				{/* Dating-Tipps Widget entfernt – Inhalte auf der Dating-Seite integriert */}
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
          </Box>
        </PageLayout>
      </Box>
    </AccessControl>
  );
}
