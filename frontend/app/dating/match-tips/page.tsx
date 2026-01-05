"use client";

import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid,
  Chip,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Badge,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  alpha
} from '@mui/material';
import PageLayout from '@/app/components/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Heart, 
  MapPin, 
  Calendar,
  Users,
  Star,
  Coffee,
  Music,
  Camera,
  BookOpen,
  Utensils,
  Moon,
  Sun,
  Sparkles,
  ArrowRight,
  Lightbulb,
  Target,
  Clock,
  DollarSign,
  Zap,
  Shield,
  Brain,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';


interface DatingTip {
  id: string;
  title: string;
  description: string;
  category: 'location' | 'activity' | 'timing' | 'communication';
  icon: React.ReactNode;
  color: string;
  energy: 'high' | 'medium' | 'low';
  duration: string;
  cost: 'free' | 'low' | 'medium' | 'high';
  weather: 'indoor' | 'outdoor' | 'any';
}

interface Location {
  id: string;
  name: string;
  type: string;
  description: string;
  address: string;
  energy: 'high' | 'medium' | 'low';
  atmosphere: string[];
  bestFor: string[];
  icon: React.ReactNode;
  color: string;
}

interface Partner {
  id: string;
  name: string;
  type: string;
  profile: string;
  isFavorite?: boolean;
}

interface CompatibilityScore {
  percentage: number;
  description: string;
  strengths: string[];
  challenges: string[];
}

function MatchTipsContent() {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userType, setUserType] = useState('');
  const [partnerType, setUserPartnerType] = useState('');
  const [userProfile, setUserProfile] = useState('');
  const [partnerProfile, setPartnerProfile] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  // Neue States für Features 1-5
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('');
  const [showPartnerDialog, setShowPartnerDialog] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterEnergy, setFilterEnergy] = useState<string>('all');
  const [filterCost, setFilterCost] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [compatibilityScore, setCompatibilityScore] = useState<CompatibilityScore | null>(null);

  // Feature 1: Automatisches Laden der User-Daten
  useEffect(() => {
    setMounted(true);
    
    // Lade User-Daten aus localStorage
    (async () => {
      try {
        const userDataStr = localStorage.getItem('userData');
        const userChartStr = localStorage.getItem('userChart');
        
        const { safeJsonParse } = await import('@/lib/utils/safeJson');
        if (userDataStr) {
          const userData = safeJsonParse<any>(userDataStr, null);
          if (userData) {
            if (userData.hdType) setUserType(userData.hdType);
            if (userData.hdProfile) setUserProfile(userData.hdProfile);
          }
        } else if (userChartStr) {
          const userChart = safeJsonParse<any>(userChartStr, null);
          if (userChart) {
            if (userChart.type) setUserType(userChart.type);
            if (userChart.profile) setUserProfile(userChart.profile);
          }
        }
      } catch (error) {
        console.error('Fehler beim Laden der User-Daten:', error);
      }
    })();
    
    // Lade gespeicherte Partner
    loadPartners();
    
    // Lade Favoriten
    loadFavorites();
  }, []);
  
  // Feature 2: Partner-Profile Management
  const loadPartners = () => {
    import('@/lib/utils/safeJson').then(({ safeLocalStorageParse }) => {
      try {
        const savedPartners = safeLocalStorageParse<any[]>('datingPartners', []);
        if (savedPartners && savedPartners.length > 0) {
          setPartners(savedPartners);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Partner:', error);
      }
    }).catch((error) => {
      console.error('Fehler beim Laden der Partner:', error);
    });
  };
  
  const savePartners = (partnersList: Partner[]) => {
    try {
      localStorage.setItem('datingPartners', JSON.stringify(partnersList));
      setPartners(partnersList);
    } catch (error) {
      console.error('Fehler beim Speichern der Partner:', error);
    }
  };
  
  const handleAddPartner = () => {
    if (newPartnerName && partnerType && partnerProfile) {
      const newPartner: Partner = {
        id: Date.now().toString(),
        name: newPartnerName,
        type: partnerType,
        profile: partnerProfile,
        isFavorite: false
      };
      const updatedPartners = [...partners, newPartner];
      savePartners(updatedPartners);
      setNewPartnerName('');
      setShowPartnerDialog(false);
    }
  };
  
  const handleSelectPartner = (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId);
    if (partner) {
      setSelectedPartnerId(partnerId);
      setUserPartnerType(partner.type);
      setPartnerProfile(partner.profile);
    }
  };
  
  const handleDeletePartner = (partnerId: string) => {
    const updatedPartners = partners.filter(p => p.id !== partnerId);
    savePartners(updatedPartners);
    if (selectedPartnerId === partnerId) {
      setSelectedPartnerId('');
      setUserPartnerType('');
      setPartnerProfile('');
    }
  };
  
  // Feature 4: Favoriten Management
  const loadFavorites = () => {
    import('@/lib/utils/safeJson').then(({ safeLocalStorageParse }) => {
      try {
        const savedFavorites = safeLocalStorageParse<string[]>('datingTipsFavorites', []);
        if (savedFavorites && savedFavorites.length > 0) {
          setFavorites(new Set(savedFavorites));
        }
      } catch (error) {
        console.error('Fehler beim Laden der Favoriten:', error);
      }
    }).catch((error) => {
      console.error('Fehler beim Laden der Favoriten:', error);
    });
  };
  
  const toggleFavorite = (tipId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(tipId)) {
      newFavorites.delete(tipId);
    } else {
      newFavorites.add(tipId);
    }
    setFavorites(newFavorites);
    try {
      localStorage.setItem('datingTipsFavorites', JSON.stringify(Array.from(newFavorites)));
    } catch (error) {
      console.error('Fehler beim Speichern der Favoriten:', error);
    }
  };
  
  // Feature 5: Kompatibilitäts-Score Berechnung
  const calculateCompatibility = (userType: string, partnerType: string): CompatibilityScore => {
    // Kompatibilitäts-Matrix basierend auf Human Design
    const compatibilityMatrix: Record<string, Record<string, { score: number; desc: string; strengths: string[]; challenges: string[] }>> = {
      'Generator': {
        'Generator': { score: 75, desc: 'Zwei Generatoren können sich gegenseitig Energie geben', strengths: ['Gemeinsame Energie', 'Verständnis für Bedürfnisse'], challenges: ['Beide brauchen Antworten', 'Können sich blockieren'] },
        'Projector': { score: 90, desc: 'Perfekte Ergänzung: Generator gibt Energie, Projector gibt Richtung', strengths: ['Energie-Flow', 'Weisheit wird geschätzt'], challenges: ['Projector braucht Einladungen', 'Generator braucht Antworten'] },
        'Manifestor': { score: 70, desc: 'Kraftvolle Verbindung, braucht Kommunikation', strengths: ['Beide sind initiativ', 'Viel Potenzial'], challenges: ['Manifestor muss informieren', 'Generator braucht Antworten'] },
        'Manifesting Generator': { score: 80, desc: 'Ähnliche Energien, gute Basis', strengths: ['Gemeinsame Energie', 'Schnelle Aktion'], challenges: ['Beide brauchen Antworten', 'Können übereifrig sein'] },
        'Reflector': { score: 65, desc: 'Unterschiedliche Rhythmen, braucht Geduld', strengths: ['Reflector spiegelt Generator', 'Tiefe Verbindung'], challenges: ['Reflector braucht Zeit', 'Generator ist ungeduldig'] }
      },
      'Projector': {
        'Generator': { score: 90, desc: 'Perfekte Ergänzung: Generator gibt Energie, Projector gibt Richtung', strengths: ['Energie-Flow', 'Weisheit wird geschätzt'], challenges: ['Projector braucht Einladungen', 'Generator braucht Antworten'] },
        'Projector': { score: 60, desc: 'Zwei Projectors brauchen externe Energie', strengths: ['Tiefes Verständnis', 'Gemeinsame Weisheit'], challenges: ['Beide brauchen Energie', 'Können sich blockieren'] },
        'Manifestor': { score: 75, desc: 'Gute Verbindung wenn Manifestor informiert', strengths: ['Beide sind strategisch', 'Kreative Zusammenarbeit'], challenges: ['Manifestor muss informieren', 'Projector braucht Einladungen'] },
        'Manifesting Generator': { score: 85, desc: 'Starke Verbindung mit viel Potenzial', strengths: ['Energie + Weisheit', 'Schnelle Umsetzung'], challenges: ['Projector braucht Einladungen', 'MG braucht Antworten'] },
        'Reflector': { score: 70, desc: 'Beide brauchen Zeit und Raum', strengths: ['Tiefes Verständnis', 'Geduld'], challenges: ['Beide brauchen Zeit', 'Können passiv sein'] }
      },
      'Manifestor': {
        'Generator': { score: 70, desc: 'Kraftvolle Verbindung, braucht Kommunikation', strengths: ['Beide sind initiativ', 'Viel Potenzial'], challenges: ['Manifestor muss informieren', 'Generator braucht Antworten'] },
        'Projector': { score: 75, desc: 'Gute Verbindung wenn Manifestor informiert', strengths: ['Beide sind strategisch', 'Kreative Zusammenarbeit'], challenges: ['Manifestor muss informieren', 'Projector braucht Einladungen'] },
        'Manifestor': { score: 55, desc: 'Zwei Manifestors können sich blockieren', strengths: ['Gemeinsame Initiative', 'Kraftvoll'], challenges: ['Beide müssen informieren', 'Können sich behindern'] },
        'Manifesting Generator': { score: 80, desc: 'Sehr kraftvolle Verbindung', strengths: ['Beide sind initiativ', 'Schnelle Aktion'], challenges: ['Beide müssen informieren', 'Können übereifrig sein'] },
        'Reflector': { score: 60, desc: 'Unterschiedliche Rhythmen', strengths: ['Reflector spiegelt Manifestor', 'Tiefe'], challenges: ['Reflector braucht Zeit', 'Manifestor ist ungeduldig'] }
      },
      'Manifesting Generator': {
        'Generator': { score: 80, desc: 'Ähnliche Energien, gute Basis', strengths: ['Gemeinsame Energie', 'Schnelle Aktion'], challenges: ['Beide brauchen Antworten', 'Können übereifrig sein'] },
        'Projector': { score: 85, desc: 'Starke Verbindung mit viel Potenzial', strengths: ['Energie + Weisheit', 'Schnelle Umsetzung'], challenges: ['Projector braucht Einladungen', 'MG braucht Antworten'] },
        'Manifestor': { score: 80, desc: 'Sehr kraftvolle Verbindung', strengths: ['Beide sind initiativ', 'Schnelle Aktion'], challenges: ['Beide müssen informieren', 'Können übereifrig sein'] },
        'Manifesting Generator': { score: 75, desc: 'Zwei MGs können sehr dynamisch sein', strengths: ['Gemeinsame Energie', 'Schnelle Umsetzung'], challenges: ['Beide brauchen Antworten', 'Können übereifrig sein'] },
        'Reflector': { score: 65, desc: 'Unterschiedliche Rhythmen', strengths: ['Reflector spiegelt MG', 'Tiefe'], challenges: ['Reflector braucht Zeit', 'MG ist ungeduldig'] }
      },
      'Reflector': {
        'Generator': { score: 65, desc: 'Unterschiedliche Rhythmen, braucht Geduld', strengths: ['Reflector spiegelt Generator', 'Tiefe Verbindung'], challenges: ['Reflector braucht Zeit', 'Generator ist ungeduldig'] },
        'Projector': { score: 70, desc: 'Beide brauchen Zeit und Raum', strengths: ['Tiefes Verständnis', 'Geduld'], challenges: ['Beide brauchen Zeit', 'Können passiv sein'] },
        'Manifestor': { score: 60, desc: 'Unterschiedliche Rhythmen', strengths: ['Reflector spiegelt Manifestor', 'Tiefe'], challenges: ['Reflector braucht Zeit', 'Manifestor ist ungeduldig'] },
        'Manifesting Generator': { score: 65, desc: 'Unterschiedliche Rhythmen', strengths: ['Reflector spiegelt MG', 'Tiefe'], challenges: ['Reflector braucht Zeit', 'MG ist ungeduldig'] },
        'Reflector': { score: 50, desc: 'Zwei Reflectors brauchen viel Zeit', strengths: ['Tiefes Verständnis', 'Geduld'], challenges: ['Beide brauchen Zeit', 'Können sehr passiv sein'] }
      }
    };
    
    const result = compatibilityMatrix[userType]?.[partnerType] || {
      score: 50,
      desc: 'Interessante Kombination mit Potenzial',
      strengths: ['Neue Perspektiven', 'Lernen voneinander'],
      challenges: ['Unterschiedliche Bedürfnisse', 'Kommunikation wichtig']
    };
    
    return {
      percentage: result.score,
      description: result.desc,
      strengths: result.strengths,
      challenges: result.challenges
    };
  };
  
  // Berechne Kompatibilität wenn beide Typen vorhanden sind
  useEffect(() => {
    if (userType && partnerType) {
      setCompatibilityScore(calculateCompatibility(userType, partnerType));
    } else {
      setCompatibilityScore(null);
    }
  }, [userType, partnerType]);

  // Dating-Tipps basierend auf Human Design Konstellationen
  const getDatingTips = (userType: string, partnerType: string, userProfile: string, partnerProfile: string): DatingTip[] => {
    const tips: DatingTip[] = [];

    // Generator + Projector Kombinationen
    if ((userType === 'Generator' && partnerType === 'Projector') || 
        (userType === 'Projector' && partnerType === 'Generator')) {
      tips.push(
        {
          id: 'gen-proj-1',
          title: 'Energie-Aufladung für Generatoren',
          description: 'Wähle Orte, wo der Generator seine Energie aufladen kann - lebendige Cafés, Märkte oder Workshops.',
          category: 'location',
          icon: <Coffee size={24} />,
          color: '#10b981',
          energy: 'high',
          duration: '2-3 Stunden',
          cost: 'low',
          weather: 'indoor'
        },
        {
          id: 'gen-proj-2',
          title: 'Projektor-Wertschätzung',
          description: 'Zeige dem Projector, dass seine Weisheit geschätzt wird - frage nach seiner Meinung und höre aktiv zu.',
          category: 'communication',
          icon: <Users size={24} />,
          color: '#8b5cf6',
          energy: 'medium',
          duration: 'Gespräch',
          cost: 'free',
          weather: 'any'
        }
      );
    }

    // Manifestor + Projector Kombinationen
    if ((userType === 'Manifestor' && partnerType === 'Projector') || 
        (userType === 'Projector' && partnerType === 'Manifestor')) {
      tips.push(
        {
          id: 'man-proj-1',
          title: 'Informieren vor Handeln',
          description: 'Manifestors sollten Projectors über Pläne informieren - spontane Aktivitäten können Projectors überwältigen.',
          category: 'communication',
          icon: <Lightbulb size={24} />,
          color: '#ef4444',
          energy: 'medium',
          duration: 'Planung',
          cost: 'free',
          weather: 'any'
        },
        {
          id: 'man-proj-2',
          title: 'Kreative Zusammenarbeit',
          description: 'Projekte oder kreative Aktivitäten, wo beide ihre Stärken einbringen können.',
          category: 'activity',
          icon: <Camera size={24} />,
          color: '#f59e0b',
          energy: 'high',
          duration: '3-4 Stunden',
          cost: 'medium',
          weather: 'any'
        }
      );
    }

    // Reflector Kombinationen
    if (userType === 'Reflector' || partnerType === 'Reflector') {
      tips.push(
        {
          id: 'refl-1',
          title: 'Mondzyklus beachten',
          description: 'Reflectors brauchen Zeit für Entscheidungen - plane Dates mit genügend Vorlaufzeit.',
          category: 'timing',
          icon: <Moon size={24} />,
          color: '#06b6d4',
          energy: 'low',
          duration: 'Planung',
          cost: 'free',
          weather: 'any'
        },
        {
          id: 'refl-2',
          title: 'Ruhige, reflektierende Orte',
          description: 'Wähle Orte mit ruhiger Atmosphäre - Parks, Museen oder ruhige Cafés.',
          category: 'location',
          icon: <BookOpen size={24} />,
          color: '#06b6d4',
          energy: 'low',
          duration: '2-3 Stunden',
          cost: 'low',
          weather: 'any'
        }
      );
    }

    // Manifesting Generator Kombinationen
    if (userType === 'Manifesting Generator' || partnerType === 'Manifesting Generator') {
      tips.push(
        {
          id: 'mgen-1',
          title: 'Multi-Tasking Aktivitäten',
          description: 'Aktivitäten, die mehrere Interessen gleichzeitig bedienen - Food Markets, Festivals.',
          category: 'activity',
          icon: <Utensils size={24} />,
          color: '#f59e0b',
          energy: 'high',
          duration: '3-5 Stunden',
          cost: 'medium',
          weather: 'any'
        }
      );
    }

    // Profil-spezifische Tipps
    if (userProfile.includes('3') || partnerProfile.includes('3')) {
      tips.push(
        {
          id: 'line3-1',
          title: 'Experimentelle Dates',
          description: 'Line 3 liebt Experimente - probiert neue Restaurants, Aktivitäten oder Routen aus.',
          category: 'activity',
          icon: <Target size={24} />,
          color: '#ef4444',
          energy: 'high',
          duration: '2-4 Stunden',
          cost: 'medium',
          weather: 'any'
        }
      );
    }

    if (userProfile.includes('4') || partnerProfile.includes('4')) {
      tips.push(
        {
          id: 'line4-1',
          title: 'Freundeskreis einbeziehen',
          description: 'Line 4 liebt soziale Verbindungen - Double Dates oder Gruppenaktivitäten.',
          category: 'activity',
          icon: <Users size={24} />,
          color: '#8b5cf6',
          energy: 'medium',
          duration: '3-4 Stunden',
          cost: 'medium',
          weather: 'any'
        }
      );
    }

    return tips;
  };

  // Orte basierend auf Human Design Typen
  const getRecommendedLocations = (userType: string, partnerType: string): Location[] => {
    const locations: Location[] = [];

    // Generator-freundliche Orte
    if (userType === 'Generator' || partnerType === 'Generator') {
      locations.push(
        {
          id: 'gen-cafe',
          name: 'Lebendiges Café',
          type: 'Café',
          description: 'Energiegeladene Atmosphäre mit vielen Menschen und Aktivitäten',
          address: 'Beispiel: Café Central, Berlin',
          energy: 'high',
          atmosphere: ['lebendig', 'sozial', 'energiegeladen'],
          bestFor: ['Gespräche', 'Menschen beobachten', 'Energie tanken'],
          icon: <Coffee size={24} />,
          color: '#10b981'
        },
        {
          id: 'gen-market',
          name: 'Wochenmarkt',
          type: 'Markt',
          description: 'Viele verschiedene Eindrücke und Möglichkeiten zu interagieren',
          address: 'Beispiel: Mauerpark Flohmarkt, Berlin',
          energy: 'high',
          atmosphere: ['bunt', 'vielfältig', 'spontan'],
          bestFor: ['Entdecken', 'Shoppen', 'Street Food'],
          icon: <Utensils size={24} />,
          color: '#f59e0b'
        }
      );
    }

    // Projector-freundliche Orte
    if (userType === 'Projector' || partnerType === 'Projector') {
      locations.push(
        {
          id: 'proj-museum',
          name: 'Museum oder Galerie',
          type: 'Kultur',
          description: 'Ruhige Atmosphäre für tiefe Gespräche und Reflexion',
          address: 'Beispiel: Pergamonmuseum, Berlin',
          energy: 'low',
          atmosphere: ['ruhig', 'inspirierend', 'kontemplativ'],
          bestFor: ['Gespräche', 'Lernen', 'Reflexion'],
          icon: <BookOpen size={24} />,
          color: '#8b5cf6'
        },
        {
          id: 'proj-park',
          name: 'Ruhiger Park',
          type: 'Natur',
          description: 'Naturverbindung für entspannte Gespräche',
          address: 'Beispiel: Tiergarten, Berlin',
          energy: 'low',
          atmosphere: ['entspannend', 'natürlich', 'friedlich'],
          bestFor: ['Spaziergänge', 'Picknick', 'Gespräche'],
          icon: <MapPin size={24} />,
          color: '#10b981'
        }
      );
    }

    // Manifestor-freundliche Orte
    if (userType === 'Manifestor' || partnerType === 'Manifestor') {
      locations.push(
        {
          id: 'man-activity',
          name: 'Aktivitätszentrum',
          type: 'Aktivität',
          description: 'Plätze für spontane Aktivitäten und Abenteuer',
          address: 'Beispiel: Kletterhalle, Berlin',
          energy: 'high',
          atmosphere: ['dynamisch', 'abenteuerlich', 'spontan'],
          bestFor: ['Sport', 'Abenteuer', 'Herausforderungen'],
          icon: <Target size={24} />,
          color: '#ef4444'
        }
      );
    }

    // Reflector-freundliche Orte
    if (userType === 'Reflector' || partnerType === 'Reflector') {
      locations.push(
        {
          id: 'refl-quiet',
          name: 'Ruhiges Café',
          type: 'Café',
          description: 'Entspannte Atmosphäre für tiefe Gespräche',
          address: 'Beispiel: Café Einstein, Berlin',
          energy: 'low',
          atmosphere: ['ruhig', 'gemütlich', 'intim'],
          bestFor: ['Gespräche', 'Reflexion', 'Entspannung'],
          icon: <Coffee size={24} />,
          color: '#06b6d4'
        }
      );
    }

    return locations;
  };

  const handleGenerateTips = () => {
    if (userType && partnerType && userProfile && partnerProfile) {
      setShowResults(true);
    }
  };
  
  // Feature 3: Filter & Sortierung
  const allTips = showResults ? getDatingTips(userType, partnerType, userProfile, partnerProfile) : [];
  const filteredTips = allTips.filter(tip => {
    // Kategorie-Filter
    if (filterCategory !== 'all' && tip.category !== filterCategory) return false;
    
    // Energie-Filter
    if (filterEnergy !== 'all' && tip.energy !== filterEnergy) return false;
    
    // Kosten-Filter
    if (filterCost !== 'all' && tip.cost !== filterCost) return false;
    
    // Favoriten-Filter
    if (showFavoritesOnly && !favorites.has(tip.id)) return false;
    
    return true;
  });
  
  const tips = filteredTips;
  const locations = showResults ? getRecommendedLocations(userType, partnerType) : [];

  // Verhindere Hydration-Probleme
  if (!mounted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F1220 0%, #1A0E08 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="h6" sx={{ color: 'white' }}>
          Lade...
        </Typography>
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
      overflow: 'hidden'
    }}>
      {/* Animierte Sterne im Hintergrund */}
      {Array.from({ length: 50 }).map((_, i) => (
        <Box
          key={`star-${i}`}
          sx={{
            position: 'absolute',
            width: `${Math.random() * 3 + 1}px`,
            height: `${Math.random() * 3 + 1}px`,
            background: '#F29F05',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            pointerEvents: 'none',
            opacity: Math.random() * 0.8 + 0.2,
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite alternate`,
            '@keyframes twinkle': {
              '0%': { opacity: 0.2, transform: 'scale(1)' },
              '100%': { opacity: 1, transform: 'scale(1.5)' }
            }
          }}
        />
      ))}
      
      <PageLayout activePage="dating" showLogo={true} maxWidth="lg">
        {/* Modern Header */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              mb: 3,
              gap: 2
            }}>
              <Heart size={48} color="#F29F05" />
              <Typography
                variant="h2"
                sx={{
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  textShadow: '0 0 30px rgba(242, 159, 5, 0.3)'
                }}
              >
                Date-Tipps
              </Typography>
              <Sparkles size={48} color="#F29F05" />
            </Box>
            <Typography sx={{ 
              color: alpha(theme.palette.common.white, 0.9), 
              fontSize: '1.3rem',
              fontWeight: 300,
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6
            }}>
              Entdecke perfekte Date-Ideen, die zu eurer einzigartigen Verbindung passen
            </Typography>
          </motion.div>
        </Box>

        {/* Erklärungsabsatz */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Box sx={{ 
            maxWidth: '800px', 
            mx: 'auto', 
            mb: 4,
            p: 3,
            background: 'rgba(242, 159, 5, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(242, 159, 5, 0.1)',
            borderRadius: 3
          }}>
            <Typography sx={{ 
              color: alpha(theme.palette.common.white, 0.85), 
              fontSize: '1.1rem',
              fontWeight: 400,
              lineHeight: 1.8,
              textAlign: 'center'
            }}>
              Wähle einfach dein Human Design Profil und das deines Partners aus. 
              Basierend auf euren einzigartigen Energien und Typen erhältst du dann 
              <strong style={{ color: '#FFD700' }}> personalisierte Date-Ideen</strong>, 
              <strong style={{ color: '#FFD700' }}> passende Orte</strong> und 
              <strong style={{ color: '#FFD700' }}> wertvolle Tipps</strong>, 
              die euch helfen, eure Verbindung zu vertiefen und unvergessliche Momente zu erleben.
            </Typography>
          </Box>
        </motion.div>

        {/* Modern Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card sx={{
            background: 'rgba(242, 159, 5, 0.06)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.15)',
            borderRadius: 4,
            mb: 4
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ color: 'white', mb: 3, textAlign: 'center' }}>
              Eure Human Design Profile
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
                  Dein Profil
                </Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Dein Typ</InputLabel>
                  <Select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    sx={{ color: 'white' }}
                  >
                    <MenuItem value="Generator">Generator</MenuItem>
                    <MenuItem value="Manifesting Generator">Manifesting Generator</MenuItem>
                    <MenuItem value="Projector">Projector</MenuItem>
                    <MenuItem value="Manifestor">Manifestor</MenuItem>
                    <MenuItem value="Reflector">Reflector</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Dein Profil</InputLabel>
                  <Select
                    value={userProfile}
                    onChange={(e) => setUserProfile(e.target.value)}
                    sx={{ color: 'white' }}
                  >
                    <MenuItem value="1/3">1/3</MenuItem>
                    <MenuItem value="1/4">1/4</MenuItem>
                    <MenuItem value="2/4">2/4</MenuItem>
                    <MenuItem value="2/5">2/5</MenuItem>
                    <MenuItem value="3/5">3/5</MenuItem>
                    <MenuItem value="3/6">3/6</MenuItem>
                    <MenuItem value="4/6">4/6</MenuItem>
                    <MenuItem value="4/1">4/1</MenuItem>
                    <MenuItem value="5/1">5/1</MenuItem>
                    <MenuItem value="5/2">5/2</MenuItem>
                    <MenuItem value="6/2">6/2</MenuItem>
                    <MenuItem value="6/3">6/3</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#FFD700' }}>
                    Partner-Profil
                  </Typography>
                  {partners.length > 0 && (
                    <Button
                      size="small"
                      startIcon={<Users size={16} />}
                      onClick={() => setShowPartnerDialog(true)}
                      sx={{ color: '#FFD700', fontSize: '0.75rem' }}
                    >
                      Gespeicherte Partner ({partners.length})
                    </Button>
                  )}
                </Box>
                
                {/* Feature 2: Gespeicherte Partner-Auswahl */}
                {partners.length > 0 && (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Gespeicherter Partner</InputLabel>
                    <Select
                      value={selectedPartnerId}
                      onChange={(e) => handleSelectPartner(e.target.value)}
                      sx={{ color: 'white' }}
                    >
                      <MenuItem value="">Neuer Partner</MenuItem>
                      {partners.map(partner => (
                        <MenuItem key={partner.id} value={partner.id}>
                          {partner.name} ({partner.type} {partner.profile})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Partner Typ</InputLabel>
                  <Select
                    value={partnerType}
                    onChange={(e) => setUserPartnerType(e.target.value)}
                    sx={{ color: 'white' }}
                  >
                    <MenuItem value="Generator">Generator</MenuItem>
                    <MenuItem value="Manifesting Generator">Manifesting Generator</MenuItem>
                    <MenuItem value="Projector">Projector</MenuItem>
                    <MenuItem value="Manifestor">Manifestor</MenuItem>
                    <MenuItem value="Reflector">Reflector</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Partner Profil</InputLabel>
                  <Select
                    value={partnerProfile}
                    onChange={(e) => setPartnerProfile(e.target.value)}
                    sx={{ color: 'white' }}
                  >
                    <MenuItem value="1/3">1/3</MenuItem>
                    <MenuItem value="1/4">1/4</MenuItem>
                    <MenuItem value="2/4">2/4</MenuItem>
                    <MenuItem value="2/5">2/5</MenuItem>
                    <MenuItem value="3/5">3/5</MenuItem>
                    <MenuItem value="3/6">3/6</MenuItem>
                    <MenuItem value="4/6">4/6</MenuItem>
                    <MenuItem value="4/1">4/1</MenuItem>
                    <MenuItem value="5/1">5/1</MenuItem>
                    <MenuItem value="5/2">5/2</MenuItem>
                    <MenuItem value="6/2">6/2</MenuItem>
                    <MenuItem value="6/3">6/3</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGenerateTips}
                  disabled={!userType || !partnerType || !userProfile || !partnerProfile}
                  startIcon={<Zap size={20} />}
                  sx={{
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    color: 'white',
                    fontWeight: 700,
                    px: 6,
                    py: 2,
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(242, 159, 5, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                      boxShadow: '0 12px 40px rgba(242, 159, 5, 0.4)',
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Sparkles size={20} style={{ marginRight: 8 }} />
                Tipps generieren
              </Button>
              </motion.div>
              
              {/* Feature 2: Partner speichern Button */}
              {userType && partnerType && userProfile && partnerProfile && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Plus size={16} />}
                    onClick={() => setShowPartnerDialog(true)}
                    sx={{
                      borderColor: 'rgba(242, 159, 5, 0.5)',
                      color: '#F29F05',
                      '&:hover': {
                        borderColor: '#F29F05',
                        background: 'rgba(242, 159, 5, 0.1)'
                      }
                    }}
                  >
                    Partner speichern
                  </Button>
                </Box>
              )}
            </Box>
            
            {/* Feature 2: Partner-Dialog */}
            {showPartnerDialog && (
              <Box sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                p: 2
              }}>
                <Card sx={{
                  background: '#1a1a1a',
                  maxWidth: 500,
                  width: '100%',
                  p: 3
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ color: 'white' }}>
                      Partner speichern
                    </Typography>
                    <IconButton onClick={() => setShowPartnerDialog(false)} sx={{ color: 'white' }}>
                      <X size={20} />
                    </IconButton>
                  </Box>
                  
                  <TextField
                    fullWidth
                    label="Partner Name"
                    value={newPartnerName}
                    onChange={(e) => setNewPartnerName(e.target.value)}
                    sx={{ mb: 2 }}
                    InputLabelProps={{ sx: { color: 'rgba(255,255,255,0.7)' } }}
                    inputProps={{ sx: { color: 'white' } }}
                  />
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      onClick={handleAddPartner}
                      disabled={!newPartnerName || !partnerType || !partnerProfile}
                      sx={{
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        color: 'white'
                      }}
                    >
                      Speichern
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setShowPartnerDialog(false);
                        setNewPartnerName('');
                      }}
                      sx={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}
                    >
                      Abbrechen
                    </Button>
                  </Box>
                  
                  {partners.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                        Gespeicherte Partner:
                      </Typography>
                      {partners.map(partner => (
                        <Box key={partner.id} sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 1.5,
                          mb: 1,
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: 1
                        }}>
                          <Typography sx={{ color: 'white', fontSize: '0.9rem' }}>
                            {partner.name} - {partner.type} {partner.profile}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleDeletePartner(partner.id)}
                            sx={{ color: 'rgba(239, 68, 68, 0.8)' }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Card>
              </Box>
            )}
          </CardContent>
        </Card>
        </motion.div>

        {/* Feature 5: Kompatibilitäts-Score */}
        {showResults && compatibilityScore && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card sx={{
              background: 'rgba(255, 215, 0, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: 4,
              mb: 4,
              textAlign: 'center',
              p: 4
            }}>
              <Typography variant="h3" sx={{ 
                color: '#FFD700', 
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' }
              }}>
                {compatibilityScore.percentage}% Kompatibilität
              </Typography>
              <Typography variant="h6" sx={{ color: 'white', mb: 3 }}>
                {userType} + {partnerType}
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3, maxWidth: '600px', mx: 'auto' }}>
                {compatibilityScore.description}
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, background: 'rgba(16, 185, 129, 0.1)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#10b981', mb: 1, fontWeight: 600 }}>
                      💪 Stärken
                    </Typography>
                    {compatibilityScore.strengths.map((strength, idx) => (
                      <Typography key={idx} variant="body2" sx={{ color: 'white', mb: 0.5 }}>
                        • {strength}
                      </Typography>
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, background: 'rgba(239, 68, 68, 0.1)', borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#ef4444', mb: 1, fontWeight: 600 }}>
                      ⚠️ Herausforderungen
                    </Typography>
                    {compatibilityScore.challenges.map((challenge, idx) => (
                      <Typography key={idx} variant="body2" sx={{ color: 'white', mb: 0.5 }}>
                        • {challenge}
                      </Typography>
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </motion.div>
        )}

        {/* Ergebnisse */}
        {showResults && (
          <>
            {/* Modern Dating Tips */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Box sx={{ mb: 8, mt: 6 }}>
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                  <Typography variant="h4" sx={{ 
                    color: 'white', 
                    mb: 2,
                    fontWeight: 700,
                    fontSize: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2
                  }}>
                    <Lightbulb size={32} color="#ffa726" />
                    Eure Date-Tipps
                    <Brain size={32} color="#42a5f5" />
                  </Typography>
                  <Typography sx={{ color: alpha(theme.palette.common.white, 0.8), fontSize: '1.1rem' }}>
                    Abgestimmt auf eure einzigartige Verbindung
                  </Typography>
                </Box>
                
                {/* Feature 3: Filter & Sortierung */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Filter size={20} color="#F29F05" />
                      <Typography variant="h6" sx={{ color: 'white' }}>
                        Filter
                      </Typography>
                    </Box>
                    <Chip
                      label={showFavoritesOnly ? "Nur Favoriten" : "Alle Tipps"}
                      onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                      icon={showFavoritesOnly ? <Heart size={16} fill="#F29F05" /> : <Heart size={16} />}
                      sx={{
                        background: showFavoritesOnly ? 'rgba(242, 159, 5, 0.2)' : 'rgba(255,255,255,0.1)',
                        color: showFavoritesOnly ? '#F29F05' : 'white',
                        border: '1px solid rgba(242, 159, 5, 0.3)',
                        cursor: 'pointer'
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip
                      label="Alle Kategorien"
                      onClick={() => setFilterCategory('all')}
                      sx={{
                        background: filterCategory === 'all' ? 'rgba(242, 159, 5, 0.2)' : 'rgba(255,255,255,0.1)',
                        color: filterCategory === 'all' ? '#F29F05' : 'white',
                        cursor: 'pointer'
                      }}
                    />
                    <Chip
                      label="Orte"
                      onClick={() => setFilterCategory('location')}
                      sx={{
                        background: filterCategory === 'location' ? 'rgba(242, 159, 5, 0.2)' : 'rgba(255,255,255,0.1)',
                        color: filterCategory === 'location' ? '#F29F05' : 'white',
                        cursor: 'pointer'
                      }}
                    />
                    <Chip
                      label="Aktivitäten"
                      onClick={() => setFilterCategory('activity')}
                      sx={{
                        background: filterCategory === 'activity' ? 'rgba(242, 159, 5, 0.2)' : 'rgba(255,255,255,0.1)',
                        color: filterCategory === 'activity' ? '#F29F05' : 'white',
                        cursor: 'pointer'
                      }}
                    />
                    <Chip
                      label="Timing"
                      onClick={() => setFilterCategory('timing')}
                      sx={{
                        background: filterCategory === 'timing' ? 'rgba(242, 159, 5, 0.2)' : 'rgba(255,255,255,0.1)',
                        color: filterCategory === 'timing' ? '#F29F05' : 'white',
                        cursor: 'pointer'
                      }}
                    />
                    <Chip
                      label="Kommunikation"
                      onClick={() => setFilterCategory('communication')}
                      sx={{
                        background: filterCategory === 'communication' ? 'rgba(242, 159, 5, 0.2)' : 'rgba(255,255,255,0.1)',
                        color: filterCategory === 'communication' ? '#F29F05' : 'white',
                        cursor: 'pointer'
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label="Alle Energien"
                      onClick={() => setFilterEnergy('all')}
                      sx={{
                        background: filterEnergy === 'all' ? 'rgba(242, 159, 5, 0.2)' : 'rgba(255,255,255,0.1)',
                        color: filterEnergy === 'all' ? '#F29F05' : 'white',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    />
                    <Chip
                      label="High Energy"
                      onClick={() => setFilterEnergy('high')}
                      sx={{
                        background: filterEnergy === 'high' ? 'rgba(242, 159, 5, 0.2)' : 'rgba(255,255,255,0.1)',
                        color: filterEnergy === 'high' ? '#F29F05' : 'white',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    />
                    <Chip
                      label="Medium"
                      onClick={() => setFilterEnergy('medium')}
                      sx={{
                        background: filterEnergy === 'medium' ? 'rgba(242, 159, 5, 0.2)' : 'rgba(255,255,255,0.1)',
                        color: filterEnergy === 'medium' ? '#F29F05' : 'white',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    />
                    <Chip
                      label="Low"
                      onClick={() => setFilterEnergy('low')}
                      sx={{
                        background: filterEnergy === 'low' ? 'rgba(242, 159, 5, 0.2)' : 'rgba(255,255,255,0.1)',
                        color: filterEnergy === 'low' ? '#F29F05' : 'white',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    />
                    <Chip
                      label="Alle Kosten"
                      onClick={() => setFilterCost('all')}
                      sx={{
                        background: filterCost === 'all' ? 'rgba(242, 159, 5, 0.2)' : 'rgba(255,255,255,0.1)',
                        color: filterCost === 'all' ? '#F29F05' : 'white',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    />
                    <Chip
                      label="Kostenlos"
                      onClick={() => setFilterCost('free')}
                      sx={{
                        background: filterCost === 'free' ? 'rgba(242, 159, 5, 0.2)' : 'rgba(255,255,255,0.1)',
                        color: filterCost === 'free' ? '#F29F05' : 'white',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    />
                    <Chip
                      label="Günstig"
                      onClick={() => setFilterCost('low')}
                      sx={{
                        background: filterCost === 'low' ? 'rgba(242, 159, 5, 0.2)' : 'rgba(255,255,255,0.1)',
                        color: filterCost === 'low' ? '#F29F05' : 'white',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>
                  
                  {tips.length === 0 && (
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', mt: 2, textAlign: 'center' }}>
                      Keine Tipps gefunden. Versuche andere Filter.
                    </Typography>
                  )}
                </Box>
                
                <Grid container spacing={4}>
                  {tips.map((tip, index) => (
                    <Grid item xs={12} md={6} key={tip.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        whileHover={{ y: -8 }}
                      >
                        <Card sx={{
                          background: 'rgba(242, 159, 5, 0.06)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(242, 159, 5, 0.15)',
                          borderRadius: 4,
                          height: '100%',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(242, 159, 5, 0.30)'
                          }
                        }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                              <Box sx={{ color: tip.color, mr: 2 }}>
                                {tip.icon}
                              </Box>
                              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                {tip.title}
                              </Typography>
                            </Box>
                            {/* Feature 4: Favoriten-Icon */}
                            <IconButton
                              onClick={() => toggleFavorite(tip.id)}
                              sx={{
                                color: favorites.has(tip.id) ? '#F29F05' : 'rgba(255,255,255,0.5)',
                                '&:hover': {
                                  color: '#F29F05',
                                  background: 'rgba(242, 159, 5, 0.1)'
                                }
                              }}
                            >
                              <Heart size={20} fill={favorites.has(tip.id) ? '#F29F05' : 'transparent'} />
                            </IconButton>
                          </Box>
                          
                          <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 2, lineHeight: 1.6 }}>
                            {tip.description}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                              label={tip.duration}
                              size="small"
                              icon={<Clock size={16} />}
                              sx={{ background: 'rgba(242, 159, 5, 0.20)', color: '#F29F05' }}
                            />
                            <Chip
                              label={tip.energy}
                              size="small"
                              sx={{ background: 'rgba(89, 10, 3, 0.20)', color: '#590A03' }}
                            />
                            <Chip
                              label={tip.cost}
                              size="small"
                              icon={<DollarSign size={16} />}
                              sx={{ background: 'rgba(38, 10, 10, 0.20)', color: '#260A0A' }}
                            />
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Empfohlene Orte */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" sx={{ color: 'white', mb: 4, textAlign: 'center' }}>
                📍 Empfohlene Orte
              </Typography>
              
              <Grid container spacing={3}>
                {locations.map((location) => (
                  <Grid item xs={12} md={6} key={location.id}>
                    <motion.div
                      
                      
                      
                    >
                      <Card sx={{
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 3,
                        height: '100%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ color: location.color, mr: 2 }}>
                              {location.icon}
                            </Box>
                            <Box>
                              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                {location.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                {location.type}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Typography sx={{ color: 'rgba(255,255,255,0.8)', mb: 2, lineHeight: 1.6 }}>
                            {location.description}
                          </Typography>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ color: '#FFD700', mb: 1 }}>
                              <MapPin size={16} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                              {location.address}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                              Atmosphäre:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {location.atmosphere.map((atm, index) => (
                                <Chip
                                  key={index}
                                  label={atm}
                                  size="small"
                                  sx={{ background: 'rgba(255, 215, 0, 0.2)', color: '#FFD700' }}
                                />
                              ))}
                            </Box>
                          </Box>
                          
                          <Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                              Ideal für:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              {location.bestFor.map((activity, index) => (
                                <Chip
                                  key={index}
                                  label={activity}
                                  size="small"
                                  sx={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
            </motion.div>
          </>
        )}
      </PageLayout>
    </Box>
  );
}

// Export mit ProtectedRoute
export default function MatchTipsPage() {
  return (
    <ProtectedRoute requiredRole="basic">
      <MatchTipsContent />
    </ProtectedRoute>
  );
}
