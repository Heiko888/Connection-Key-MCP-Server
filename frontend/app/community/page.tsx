"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
// Ungenutzte Imports entfernt
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  Chip, 
  Avatar,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Badge,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Fab
} from '@mui/material';
import { 
  Users, 
  MessageCircle, 
  Calendar, 
  MapPin, 
  Star, 
  Heart,
  Plus,
  Filter,
  MessageSquare,
  Award,
  Activity,
  ThumbsUp,
  Share2,
  MoreVertical,
  TrendingUp,
  Clock,
  Key,
  Users2
} from 'lucide-react';
import { motion } from 'framer-motion';
import AccessControl from '../../components/AccessControl';
import Link from 'next/link';
import Image from 'next/image';
import PageLayout from '../components/PageLayout';
import { supabase } from '@/lib/supabase/client';
import { safeJsonParse } from '@/lib/supabase/client';

interface PlanetPosition {
  gate: number;
  line: number;
  longitude: number;
}

interface PlanetData {
  id: string;
  name: string;
  symbol: string;
  color: string;
  description: string;
  keyTheme: string;
  archetype: string;
  personality?: PlanetPosition;
  design?: PlanetPosition;
}

const PLANET_INFO: Record<string, {
  name: string;
  symbol: string;
  color: string;
  description: string;
  keyTheme: string;
  archetype: string;
}> = {
  sun: {
    name: 'Sonne',
    symbol: '☉',
    color: '#F29F05',
    description: 'Lebensaufgabe, Kernenergie',
    keyTheme: 'Ca. 70% deiner Grundenergie',
    archetype: 'Du strahlst Lebensfreude aus, wenn du authentisch bist',
  },
  earth: {
    name: 'Erde',
    symbol: '🌍',
    color: '#8C1D04',
    description: 'Stabilität, Balance',
    keyTheme: 'Was dich erdet und wie du dein Gleichgewicht hältst',
    archetype: 'Du findest Stabilität durch deine Verbindung zur Erde',
  },
  moon: {
    name: 'Mond',
    symbol: '🌙',
    color: '#FFD700',
    description: 'Motivation, Antrieb',
    keyTheme: 'Was dich innerlich bewegt',
    archetype: 'Deine Emotionen führen dich zu deiner Bestimmung',
  },
  mercury: {
    name: 'Merkur',
    symbol: '☿',
    color: '#F29F05',
    description: 'Kommunikation, Ausdruck',
    keyTheme: 'Wofür du sprichst, welche Wahrheit du teilst',
    archetype: 'Deine Worte tragen die Kraft der Wahrheit',
  },
  venus: {
    name: 'Venus',
    symbol: '♀',
    color: '#FFD700',
    description: 'Werte, Beziehungen',
    keyTheme: 'Was du liebst, was dir Schönheit und Harmonie bedeutet',
    archetype: 'Du ziehst an, was deine Seele nährt',
  },
  mars: {
    name: 'Mars',
    symbol: '♂',
    color: '#F29F05',
    description: 'Handlung, Reife',
    keyTheme: 'Wo du impulsiv bist und durch Erfahrung reifst',
    archetype: 'Deine Handlungen formen deine Reife',
  },
  jupiter: {
    name: 'Jupiter',
    symbol: '♃',
    color: '#FFD700',
    description: 'Weisheit, Expansion',
    keyTheme: 'Dein innerer Lehrer, wo du wachsen und Fülle erfahren kannst',
    archetype: 'Du wächst durch deine Weisheit und Erfahrung',
  },
  saturn: {
    name: 'Saturn',
    symbol: '♄',
    color: '#8C1D04',
    description: 'Lektionen, Verantwortung',
    keyTheme: 'Der Lehrer des Lebens – wo du Disziplin und Reife lernen musst',
    archetype: 'Deine Herausforderungen formen deine Stärke',
  },
  uranus: {
    name: 'Uranus',
    symbol: '♅',
    color: '#F29F05',
    description: 'Einzigartigkeit, Revolution',
    keyTheme: 'Wo du anders bist, rebellierst und Freiheit suchst',
    archetype: 'Du bringst Veränderung durch deine Einzigartigkeit',
  },
  neptune: {
    name: 'Neptun',
    symbol: '♆',
    color: '#FFD700',
    description: 'Spiritualität, Illusion',
    keyTheme: 'Wo du träumst, idealisierst oder transzendierst',
    archetype: 'Deine Träume führen dich zur Transzendenz',
  },
  pluto: {
    name: 'Pluto',
    symbol: '♇',
    color: '#8C1D04',
    description: 'Transformation, Macht',
    keyTheme: 'Wo du stirbst und wiedergeboren wirst – tiefe Wandlungskraft',
    archetype: 'Du transformierst durch deine tiefste Kraft',
  },
  northNode: {
    name: 'Nordknoten',
    symbol: '☊',
    color: '#F29F05',
    description: 'Entwicklungsrichtung',
    keyTheme: 'Wo deine Lebensreise hingeht – Wachstum, Zukunft, Bestimmung',
    archetype: 'Du wächst in Richtung deiner Bestimmung',
  },
  southNode: {
    name: 'Südknoten',
    symbol: '☋',
    color: '#8C1D04',
    description: 'Herkunft, Gewohnheit',
    keyTheme: 'Wo du herkommst, alte Muster und vertraute Energien',
    archetype: 'Deine Vergangenheit gibt dir Stabilität',
  },
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface CommunityPost {
  id: number;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  type: string;
  typeColor: string;
  tags: string[];
}

interface Comment {
  id: number;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
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
      id={`community-tabpanel-${index}`}
      aria-labelledby={`community-tab-${index}`}
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

function CommunityContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [newPostDialog, setNewPostDialog] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messagesDialog, setMessagesDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ name: string; type: string; avatar: string } | null>(null);
  const [messageText, setMessageText] = useState('');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [commentDialog, setCommentDialog] = useState<{ open: boolean; postId: number | null }>({ open: false, postId: null });
  const [commentText, setCommentText] = useState('');
  const [postComments, setPostComments] = useState<Record<number, Comment[]>>({});
  const [sharedEvents, setSharedEvents] = useState<Set<number>>(new Set());
  const [planets, setPlanets] = useState<PlanetData[]>([]);
  const [eventFilter, setEventFilter] = useState<string>('all'); // 'all', 'upcoming', 'past', 'my-events'
  const [eventCategory, setEventCategory] = useState<string>('all'); // 'all', 'Meetup', 'Workshop', 'Gruppe'
  const [eventSort, setEventSort] = useState<string>('date'); // 'date', 'popularity', 'attendees'
  const [eventDetailsOpen, setEventDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Funktionen mit useCallback definieren (vor useEffect)
  const loadUserName = useCallback(async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return;

      const userData = localStorage.getItem('userData');
      if (userData) {
        const data = safeJsonParse<{ firstName?: string; first_name?: string }>(userData, {});
        if (data && (data.firstName || data.first_name)) {
          setUserName(data.firstName || data.first_name || '');
          return;
        }
      }

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
  }, [supabase]);

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
      console.error('Fehler beim Laden der Subscription:', error);
    }
  }, []);

  const loadPosts = useCallback(() => {
    if (typeof window === 'undefined') return; // Server-side guard
    
    try {
      const savedPosts = localStorage.getItem('community-posts');
      if (savedPosts) {
        try {
          const parsedPosts = JSON.parse(savedPosts);
          if (Array.isArray(parsedPosts)) {
            setPosts(parsedPosts);
          }
        } catch (parseError) {
          console.error('Fehler beim Parsen der gespeicherten Posts:', parseError);
        }
      } else {
        // Initiale Mock-Posts
        setPosts([
          {
            id: 1,
            author: "Sarah M.",
            avatar: "/api/placeholder/48/48",
            content: "Als Manifesting Generator fühle ich mich heute besonders energiegeladen! 🌟 Wer hat Lust auf einen spontanen Austausch?",
            timestamp: "vor 2 Stunden",
            likes: 24,
            comments: 8,
            shares: 3,
            type: "Manifesting Generator",
            typeColor: "#f59e0b",
            tags: ["Energie", "Austausch", "Manifesting Generator"]
          },
          {
            id: 2,
            author: "Michael K.",
            avatar: "/api/placeholder/48/48",
            content: "Hat jemand Erfahrung mit Projector-Strategien in Beziehungen? Ich bin neu in der Community und würde gerne von euren Erfahrungen lernen.",
            timestamp: "vor 4 Stunden",
            likes: 18,
            comments: 12,
            shares: 2,
            type: "Projector",
            typeColor: "#8b5cf6",
            tags: ["Beziehungen", "Strategien", "Projector"]
          },
          {
            id: 3,
            author: "Lisa W.",
            avatar: "/api/placeholder/48/48",
            content: "Neuer Mondkalender-Eintrag: Vollmond in 3 Tagen! 🌕 Perfekt für Reflector-Energie. Wie geht ihr mit Mondphasen um?",
            timestamp: "vor 6 Stunden",
            likes: 31,
            comments: 15,
            shares: 7,
            type: "Reflector",
            typeColor: "#06b6d4",
            tags: ["Mondkalender", "Vollmond", "Reflector"]
          },
          {
            id: 4,
            author: "Tom R.",
            avatar: "/api/placeholder/48/48",
            content: "Generator-Tipp: Wenn ihr euch müde fühlt, prüft eure Energie-Zentren! Oft liegt es an ungenutzter kreativer Energie.",
            timestamp: "vor 8 Stunden",
            likes: 42,
            comments: 9,
            shares: 11,
            type: "Generator",
            typeColor: "#F29F05",
            tags: ["Energie", "Tipps", "Generator"]
          }
        ]);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Posts:', error);
    }
  }, []);

  // Planetendaten verarbeiten
  const processPlanetData = useCallback((chartData: any) => {
    // Unterstütze verschiedene Datenstrukturen
    const personalityData = chartData.personality || chartData.hdChart?.personality || chartData.personalityPositions;
    const designData = chartData.design || chartData.hdChart?.design || chartData.designPositions;
    
    if (!personalityData && !designData) {
      return;
    }
    
    const planetList: PlanetData[] = [];
    const planetKeys = ['earth', 'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'northNode', 'southNode'];

    planetKeys.forEach((key) => {
      const info = PLANET_INFO[key];
      if (!info) return;

      const personality = personalityData?.[key];
      const design = designData?.[key];

      if (personality || design) {
        planetList.push({
          id: key,
          name: info.name,
          symbol: info.symbol,
          color: info.color,
          description: info.description,
          keyTheme: info.keyTheme,
          archetype: info.archetype,
          personality: personality ? {
            gate: personality.gate,
            line: personality.line,
            longitude: personality.longitude || 0,
          } : undefined,
          design: design ? {
            gate: design.gate,
            line: design.line,
            longitude: design.longitude || 0,
          } : undefined,
        });
      }
    });

    setPlanets(planetList);
  }, []);

  // Planetendaten laden
  const loadFromAPI = useCallback(async () => {
    const birthData = typeof window !== 'undefined' ? localStorage.getItem('userData') : null;
    if (!birthData) {
      return; // Keine Fehler werfen, nur keine Planeten anzeigen
    }

    try {
      const userData = JSON.parse(birthData);
      const response = await fetch('/api/charts/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: userData.birthDate || userData.birthdate,
          birthTime: userData.birthTime || userData.birthtime || '12:00',
          birthPlace: typeof userData.birthPlace === 'string' ? {
            latitude: 52.52,
            longitude: 13.405,
            timezone: 'Europe/Berlin',
            name: userData.birthPlace
          } : userData.birthPlace
        })
      });

      if (response.ok) {
        const result = await response.json();
        const chartData = result.chart || result;
        processPlanetData(chartData);
        
        // Speichere auch im localStorage für zukünftige Verwendung
        if (typeof window !== 'undefined') {
          localStorage.setItem('userChart', JSON.stringify(chartData));
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden vom API:', error);
    }
  }, [processPlanetData]);

  const loadPlanetData = useCallback(async () => {
    try {
      // Lade Chart-Daten aus localStorage oder API
      const userChart = typeof window !== 'undefined' ? localStorage.getItem('userChart') : null;
      
      if (userChart) {
        const { safeJsonParse } = await import('@/lib/utils/safeJson');
        const chartData = safeJsonParse<any>(userChart, null);
        if (chartData) {
          processPlanetData(chartData);
        } else {
          // Fallback zu API
          await loadFromAPI();
        }
      } else {
        await loadFromAPI();
      }
    } catch (err: any) {
      console.error('Fehler beim Laden der Planeten-Daten:', err);
    }
  }, [processPlanetData, loadFromAPI]);

  // Authentifizierung und Subscription prüfen
  useEffect(() => {
    const checkAuth = async () => {
      // Prüfe, ob Onboarding bereits abgeschlossen wurde
      const hasSeenOnboarding = localStorage.getItem('community-onboarding-completed');
      if (!hasSeenOnboarding) {
        router.push('/community/onboarding');
        return;
      }

      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        setIsAuthenticated(false);
        // Keine Authentifizierung erforderlich - App ist öffentlich
        return;
      }
      
      setIsAuthenticated(true);
      loadUserName();
      await loadUserSubscription();
    };

    checkAuth();
    setMounted(true);
  }, [router, loadUserName, loadUserSubscription]);

  useEffect(() => {
    if (mounted) {
      loadPosts();
      loadPlanetData();
    }
  }, [mounted, userName, loadPosts, loadPlanetData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const savePosts = (updatedPosts: CommunityPost[]) => {
    if (typeof window === 'undefined') return; // Server-side guard
    try {
      localStorage.setItem('community-posts', JSON.stringify(updatedPosts));
    } catch (error) {
      console.error('Fehler beim Speichern der Posts:', error);
    }
  };

  const handleNewPost = () => {
    if (newPostText.trim()) {
      const newPost = {
        id: Date.now(),
        author: userName || 'Du',
        avatar: userName ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=F29F05&color=fff` : "/api/placeholder/48/48",
        content: newPostText,
        timestamp: "gerade eben",
        likes: 0,
        comments: 0,
        shares: 0,
        type: "Community",
        typeColor: "#F29F05",
        tags: []
      };
      
      const updatedPosts = [newPost, ...(posts || [])];
      setPosts(updatedPosts);
      savePosts(updatedPosts);
      setNewPostText('');
      setNewPostDialog(false);
    }
  };

  const handleLikePost = (postId: number) => {
    const isLiked = likedPosts.has(postId);
    const updatedLikedPosts = new Set(likedPosts);
    
    if (isLiked) {
      updatedLikedPosts.delete(postId);
    } else {
      updatedLikedPosts.add(postId);
    }
    
    setLikedPosts(updatedLikedPosts);
    
    const updatedPosts = (posts || []).map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: isLiked ? (post.likes || 0) - 1 : (post.likes || 0) + 1
        };
      }
      return post;
    });
    
    setPosts(updatedPosts);
    savePosts(updatedPosts);
  };

  const handleCommentClick = (postId: number) => {
    setCommentDialog({ open: true, postId });
    setCommentText('');
  };

  const handleCommentSubmit = () => {
    if (commentText.trim() && commentDialog.postId !== null) {
      const newComment = {
        id: Date.now(),
        author: userName || 'Du',
        avatar: userName ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=F29F05&color=fff` : "/api/placeholder/40/40",
        content: commentText,
        timestamp: "gerade eben"
      };

      const currentComments = postComments[commentDialog.postId] || [];
      setPostComments({
        ...postComments,
        [commentDialog.postId]: [...currentComments, newComment]
      });

      // Update post comment count
      const updatedPosts = posts.map(post => {
        if (post.id === commentDialog.postId) {
          return {
            ...post,
            comments: (post.comments || 0) + 1
          };
        }
        return post;
      });
      setPosts(updatedPosts);
      savePosts(updatedPosts);

      setCommentText('');
      setCommentDialog({ open: false, postId: null });
    }
  };

  const handleShareConnectionKey = () => {
    router.push('/connection-key');
  };

  const handleJoinEvent = async (eventId: number) => {
    const isJoined = sharedEvents.has(eventId);
    const updatedEvents = new Set(sharedEvents);
    const userId = localStorage.getItem('userId');
    
    if (isJoined) {
      updatedEvents.delete(eventId);
      // Event-Registrierung entfernen
      try {
        await fetch('/api/events/unregister', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, userId })
        });
      } catch (error) {
        console.error('Fehler beim Abmelden vom Event:', error);
      }
    } else {
      updatedEvents.add(eventId);
      // Event-Registrierung speichern
      try {
        const event = upcomingEvents.find(e => e.id === eventId);
        if (event) {
          const response = await fetch('/api/events/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              eventId,
              userId,
              eventTitle: event.title,
              eventDate: event.date,
              eventTime: event.time,
              eventLocation: event.location,
              eventType: event.type
            })
          });
          
          if (response.ok) {
            // Event-Buchung in localStorage speichern für Dashboard
            const bookingData = {
              id: `event-${eventId}-${Date.now()}`,
              type: 'community-event',
              eventId,
              title: event.title,
              date: event.date,
              time: event.time,
              location: event.location,
              organizer: event.organizer,
              createdAt: new Date().toISOString()
            };
            
            const { safeLocalStorageParse, safeLocalStorageSet } = await import('@/lib/utils/safeJson');
            const existingBookings = safeLocalStorageParse<any[]>('userBookings', []);
            if (existingBookings) {
              existingBookings.push(bookingData);
              safeLocalStorageSet('userBookings', existingBookings);
            }
          }
        }
      } catch (error) {
        console.error('Fehler beim Registrieren für Event:', error);
      }
    }
    
    setSharedEvents(updatedEvents);
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setEventDetailsOpen(true);
  };

  const handleSendMessage = () => {
    if (messageText.trim() && selectedUser) {
      setMessageText('');
      setMessagesDialog(false);
      setSelectedUser(null);
    }
  };

  const handleUserClick = (user: { name: string; type: string; avatar: string; username?: string }) => {
    // Navigiere zur Profilseite
    const username = user.username || user.name.toLowerCase().replace(/\s+/g, '-');
    router.push(`/community/profile/${username}`);
  };

  const handleCompatibilityCheck = (user: { name: string; type: string; avatar: string }) => {
    // Simuliere Kompatibilitäts-Berechnung
    // Hier würde die echte Kompatibilitäts-Berechnung stattfinden
  };

  // Mock-Daten für Community Hub
  const communityStats = [
    { label: "Aktive Mitglieder", value: "2,847", icon: <Users size={24} />, color: "#F29F05" },
    { label: "Posts heute", value: posts.length.toString(), icon: <MessageSquare size={24} />, color: "#F29F05" },
    { label: "Events", value: "23", icon: <Calendar size={24} />, color: "#8C1D04" },
    { label: "Matches", value: "89", icon: <Heart size={24} />, color: "#8C1D04" }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Human Design Stammtisch Berlin",
      date: "15. Januar 2025",
      time: "19:00",
      location: "Berlin Mitte",
      attendees: 24,
      maxAttendees: 30,
      type: "Meetup",
      organizer: "Sarah M.",
      description: "Gemütlicher Austausch über Human Design Erfahrungen",
      fullDescription: "Treffe Gleichgesinnte und tausche dich über deine Human Design Erfahrungen aus. Wir diskutieren Strategien, Autoritäten und wie wir unser Design im Alltag leben können.",
      tags: ["Networking", "Austausch", "Community"],
      price: "Kostenlos",
      duration: "2 Stunden",
      requirements: "Keine Vorkenntnisse erforderlich"
    },
    {
      id: 2,
      title: "Chart-Analyse Workshop",
      date: "22. Januar 2025",
      time: "14:00",
      location: "Online",
      attendees: 12,
      maxAttendees: 20,
      type: "Workshop",
      organizer: "Dr. Maria L.",
      description: "Vertiefte Einführung in Chart-Analysen",
      fullDescription: "Lerne, wie du Human Design Charts liest und interpretierst. Wir gehen durch alle wichtigen Komponenten: Typ, Strategie, Autorität, Profile, Zentren, Kanäle und Tore.",
      tags: ["Lernen", "Workshop", "Chart-Analyse"],
      price: "€49",
      duration: "3 Stunden",
      requirements: "Grundkenntnisse in Human Design empfohlen"
    },
    {
      id: 3,
      title: "Beziehungs-Coaching Gruppe",
      date: "28. Januar 2025",
      time: "18:30",
      location: "Hamburg",
      attendees: 8,
      maxAttendees: 12,
      type: "Gruppe",
      organizer: "Michael K.",
      description: "Fokus auf Human Design in Beziehungen",
      fullDescription: "Entdecke, wie Human Design dir hilft, deine Beziehungen zu verstehen und zu vertiefen. Wir arbeiten mit Connection Keys und Resonanzanalysen.",
      tags: ["Beziehungen", "Coaching", "Connection Key"],
      price: "€35",
      duration: "2.5 Stunden",
      requirements: "Eigener Chart erforderlich"
    },
    {
      id: 4,
      title: "Mondkalender & Transits",
      date: "5. Februar 2025",
      time: "10:00",
      location: "Online",
      attendees: 15,
      maxAttendees: 25,
      type: "Workshop",
      organizer: "Lisa W.",
      description: "Verstehe die Auswirkungen von Mondphasen und Transits",
      fullDescription: "Lerne, wie du den Mondkalender und planetare Transits für dein tägliches Leben nutzen kannst. Praktische Tipps und Übungen inklusive.",
      tags: ["Mondkalender", "Transits", "Astrologie"],
      price: "€39",
      duration: "2 Stunden",
      requirements: "Keine Vorkenntnisse erforderlich"
    },
    {
      id: 5,
      title: "Generator Energie Workshop",
      date: "12. Februar 2025",
      time: "16:00",
      location: "München",
      attendees: 18,
      maxAttendees: 25,
      type: "Workshop",
      organizer: "Thomas R.",
      description: "Speziell für Generatoren: Deine Strategie leben",
      fullDescription: "Ein intensiver Workshop nur für Generatoren. Lerne, wie du deine Strategie (auf Antworten warten) optimal umsetzt und deine Sacral-Autorität nutzt.",
      tags: ["Generator", "Strategie", "Autorität"],
      price: "€45",
      duration: "3 Stunden",
      requirements: "Du musst Generator sein"
    },
    {
      id: 6,
      title: "Projector Strategien Meetup",
      date: "19. Februar 2025",
      time: "19:00",
      location: "Köln",
      attendees: 10,
      maxAttendees: 15,
      type: "Meetup",
      organizer: "Anna S.",
      description: "Austausch für Projectors über Strategien und Einladungen",
      fullDescription: "Ein sicherer Raum für Projectors, um sich über ihre Erfahrungen auszutauschen. Wie erkennst du echte Einladungen? Wie nutzt du deine Autorität?",
      tags: ["Projector", "Strategie", "Networking"],
      price: "Kostenlos",
      duration: "2 Stunden",
      requirements: "Du musst Projector sein"
    }
  ];

  // Gefilterte und sortierte Events
  const getFilteredEvents = () => {
    let filtered = [...upcomingEvents];
    
    // Filter nach Kategorie
    if (eventCategory !== 'all') {
      filtered = filtered.filter(e => e.type === eventCategory);
    }
    
    // Filter nach Status
    if (eventFilter === 'my-events') {
      filtered = filtered.filter(e => sharedEvents.has(e.id));
    }
    
    // Sortierung
    if (eventSort === 'date') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.date.split(' ')[1] + ' ' + a.date.split(' ')[0] + ' 2025');
        const dateB = new Date(b.date.split(' ')[1] + ' ' + b.date.split(' ')[0] + ' 2025');
        return dateA.getTime() - dateB.getTime();
      });
    } else if (eventSort === 'popularity') {
      filtered.sort((a, b) => {
        const popularityA = a.attendees / a.maxAttendees;
        const popularityB = b.attendees / b.maxAttendees;
        return popularityB - popularityA;
      });
    } else if (eventSort === 'attendees') {
      filtered.sort((a, b) => b.attendees - a.attendees);
    }
    
    return filtered;
  };

  const onlineUsers = [
    { id: 1, name: "Anna", type: "Generator", avatar: "/api/placeholder/40/40", status: "online" },
    { id: 2, name: "Tom", type: "Projector", avatar: "/api/placeholder/40/40", status: "online" },
    { id: 3, name: "Maria", type: "Manifestor", avatar: "/api/placeholder/40/40", status: "away" },
    { id: 4, name: "David", type: "Reflector", avatar: "/api/placeholder/40/40", status: "online" },
    { id: 5, name: "Lisa", type: "Manifesting Generator", avatar: "/api/placeholder/40/40", status: "online" }
  ];

  const trendingTopics = [
    { topic: "Generator Energie", posts: 45, trend: "up" },
    { topic: "Projector Strategien", posts: 32, trend: "up" },
    { topic: "Mondkalender", posts: 28, trend: "up" },
    { topic: "Beziehungen", posts: 67, trend: "stable" },
    { topic: "Chart-Analyse", posts: 23, trend: "down" }
  ];

  // Mock-Daten für erweiterte Features
  const directMessages = [
    {
      id: 1,
      user: { name: "Sarah M.", avatar: "/api/placeholder/40/40", type: "Manifesting Generator", status: "online" },
      lastMessage: "Hey! Wie geht es dir heute?",
      timestamp: "vor 5 Min",
      unread: 2
    },
    {
      id: 2,
      user: { name: "Michael K.", avatar: "/api/placeholder/40/40", type: "Projector", status: "away" },
      lastMessage: "Danke für den Tipp gestern!",
      timestamp: "vor 1 Std",
      unread: 0
    },
    {
      id: 3,
      user: { name: "Lisa W.", avatar: "/api/placeholder/40/40", type: "Reflector", status: "online" },
      lastMessage: "Lass uns morgen chatten!",
      timestamp: "vor 3 Std",
      unread: 1
    }
  ];

  const compatibilityMatches = [
    {
      user: { name: "Anna", type: "Generator", avatar: "/api/placeholder/48/48", age: 28, location: "Berlin" },
      compatibility: 94,
      sharedGates: 8,
      sharedChannels: 3,
      compatibilityFactors: ["Gemeinsame Kanäle", "Harmonische Profile", "Ähnliche Strategien"]
    },
    {
      user: { name: "Tom", type: "Projector", avatar: "/api/placeholder/48/48", age: 32, location: "München" },
      compatibility: 87,
      sharedGates: 6,
      sharedChannels: 2,
      compatibilityFactors: ["Komplementäre Energien", "Gegenseitige Unterstützung"]
    },
    {
      user: { name: "Maria", type: "Manifestor", avatar: "/api/placeholder/48/48", age: 25, location: "Hamburg" },
      compatibility: 91,
      sharedGates: 7,
      sharedChannels: 4,
      compatibilityFactors: ["Starke Verbindung", "Gemeinsame Ziele", "Harmonische Autorität"]
    }
  ];

  // Echte Coaches als Mentoren
  const coaches = [
    {
      id: 1,
      name: "Heiko",
      title: "Human Design Experte & Life Coach",
      avatar: "/coaches/heiko.jpg",
      rating: 4.9,
      reviews: 127,
      experience: "8+ Jahre",
      specializations: ["Human Design", "Life Coaching", "Beziehungen", "Karriere"],
      description: "Heiko ist ein zertifizierter Human Design Experte mit über 8 Jahren Erfahrung. Er hilft Menschen dabei, ihre einzigartige Design zu verstehen und im Alltag zu leben.",
      type: "mentor"
    },
    {
      id: 2,
      name: "Janine",
      title: "Human Design Beraterin & Therapeutin",
      avatar: "/coaches/janine.jpg",
      rating: 4.8,
      reviews: 89,
      experience: "6+ Jahre",
      specializations: ["Human Design", "Psychologie", "Familie", "Kinder"],
      description: "Janine ist eine erfahrene Human Design Beraterin mit psychologischem Hintergrund. Sie spezialisiert sich auf Familien- und Beziehungsdynamiken.",
      type: "mentor"
    },
    {
      id: 3,
      name: "Elisabeth",
      title: "Human Design Master & Business Coach",
      avatar: "/coaches/elisabeth.jpg",
      rating: 4.7,
      reviews: 98,
      experience: "7+ Jahre",
      specializations: ["Human Design", "Business", "Leadership", "Team-Dynamik"],
      description: "Elisabeth hilft Führungskräften und Unternehmern dabei, ihre Human Design im beruflichen Kontext zu nutzen und erfolgreiche Teams aufzubauen.",
      type: "mentor"
    }
  ];

  const mentorMenteeMatches = [
    ...coaches.map(coach => ({
      type: "mentor",
      user: { 
        name: coach.name, 
        type: coach.title, 
        avatar: coach.avatar, 
        experience: coach.experience 
      },
      specialty: coach.specializations.join(", "),
      rating: coach.rating,
      students: coach.reviews,
      description: coach.description,
      coachId: coach.id
    })),
    {
      type: "mentee",
      user: { name: "Alex", type: "Projector", avatar: "/api/placeholder/48/48", level: "Anfänger" },
      lookingFor: "Grundlagen lernen",
      goals: ["Chart verstehen", "Strategie anwenden"],
      description: "Suche Mentor für Human Design Grundlagen"
    }
  ];

  const notificationData = [
    {
      id: 1,
      type: "message",
      title: "Neue Nachricht von Sarah M.",
      content: "Hey! Wie geht es dir heute?",
      timestamp: "vor 5 Min",
      read: false,
      icon: <MessageCircle size={20} />
    },
    {
      id: 2,
      type: "match",
      title: "Neuer Kompatibilitäts-Match!",
      content: "94% Kompatibilität mit Anna gefunden",
      timestamp: "vor 1 Std",
      read: false,
      icon: <Heart size={20} />
    },
    {
      id: 3,
      type: "event",
      title: "Event-Erinnerung",
      content: "Human Design Stammtisch startet in 2 Stunden",
      timestamp: "vor 2 Std",
      read: true,
      icon: <Calendar size={20} />
    }
  ];

  return (
    <AccessControl 
      path="/community" 
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
        backgroundAttachment: 'fixed',
        position: 'relative',
        pt: { xs: 4, md: 6 },
        pb: 8,
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


        <PageLayout activePage="community" showLogo={true} maxWidth="lg">
          {/* Community Header - kompakter */}
          <Box sx={{ 
            mb: { xs: 3, md: 4 },
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-start' },
            justifyContent: 'space-between',
            gap: 3
          }}>
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '1.75rem', md: '2rem' },
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                👥 Community
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  fontSize: { xs: '0.85rem', md: '0.95rem' }
                }}
              >
                {userName ? `Willkommen zurück, ${userName}!` : 'Verbinde dich mit Gleichgesinnten'}
              </Typography>
            </Box>
            
            {/* Quick Stats - kompakt */}
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 1, md: 2 },
              flexWrap: 'wrap',
              justifyContent: { xs: 'center', md: 'flex-end' }
            }}>
              {communityStats.slice(0, 2).map((stat, index) => (
                <Box key={index} sx={{
                  textAlign: 'center',
                  px: { xs: 1.5, md: 2 },
                  py: { xs: 0.75, md: 1 },
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 2,
                  border: '1px solid rgba(242, 159, 5, 0.15)',
                  minWidth: { xs: 80, md: 100 }
                }}>
                  <Typography variant="h6" sx={{ color: stat.color, fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: { xs: '0.65rem', md: '0.7rem' } }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Search and Filter - kompakter */}
          <Box>
            <Paper sx={{
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              borderRadius: 4,
              border: '1px solid rgba(242, 159, 5, 0.20)',
              p: 3,
              mb: { xs: 3, md: 4 }
            }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 2, md: 2 }, 
                alignItems: { xs: 'stretch', md: 'center' }
              }}>
                <TextField
                  fullWidth
                  placeholder="Suche in der Community..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      fontSize: { xs: '1rem', md: '0.95rem' },
                      minHeight: { xs: 48, md: 'auto' },
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
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<Filter size={22} />}
                  fullWidth={true}
                  sx={{
                    borderColor: 'rgba(242, 159, 5, 0.30)',
                    color: '#F29F05',
                    px: { xs: 2, md: 3 },
                    py: { xs: 2, md: 1.5 },
                    fontSize: { xs: '1rem', md: '0.95rem' },
                    minHeight: { xs: 48, md: 'auto' },
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#8C1D04',
                      backgroundColor: 'rgba(242, 159, 5, 0.10)'
                    }
                  }}
                >
                  Filter
                </Button>
              </Box>
            </Paper>
          </Box>

          {/* Tabs */}
          <Paper sx={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            borderRadius: 4,
            border: '1px solid rgba(242, 159, 5, 0.30)',
            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.15)',
            mb: { xs: 3, md: 4 },
            overflow: 'hidden'
          }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 72,
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: 600,
                  fontSize: { xs: '0.95rem', md: '1.1rem' },
                  minHeight: 72,
                  px: { xs: 2.5, md: 4 },
                  py: { xs: 1.2, md: 1.5 },
                  transition: 'all 0.3s ease',
                  '&.Mui-selected': {
                    color: '#F29F05',
                    background: 'rgba(242, 159, 5, 0.10)'
                  },
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'rgba(255, 255, 255, 0.9)'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#F29F05',
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                },
                '& .MuiTabs-flexContainer': {
                  gap: { xs: 0, md: 1 }
                }
              }}
            >
              <Tab label="Feed" icon={<MessageSquare size={22} />} iconPosition="start" />
              <Tab label="Events" icon={<Calendar size={22} />} iconPosition="start" />
              <Tab label="Gruppen" icon={<Users2 size={22} />} iconPosition="start" />
              <Tab label="Online" icon={<Users size={22} />} iconPosition="start" />
              <Tab label="Nachrichten" icon={<MessageCircle size={22} />} iconPosition="start" />
              <Tab label="Matches" icon={<Heart size={22} />} iconPosition="start" />
              <Tab label="Mentoring" icon={<Award size={22} />} iconPosition="start" />
              <Tab label="Trending" icon={<TrendingUp size={22} />} iconPosition="start" />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              {/* Feed */}
              <Grid item xs={12} lg={8}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: '1px solid rgba(242, 159, 5, 0.20)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}>
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', md: 'row' },
                      alignItems: { xs: 'stretch', md: 'center' },
                      justifyContent: 'space-between', 
                      mb: { xs: 2, md: 3 },
                      gap: { xs: 2, md: 0 }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 1, md: 0 } }}>
                        <MessageSquare size={24} style={{ color: '#F29F05', marginRight: 12 }} />
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                          Community Feed
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: { xs: 1.5, md: 2 },
                        width: { xs: '100%', md: 'auto' }
                      }}>
                        <Button
                          variant="contained"
                          startIcon={<Plus size={22} />}
                          onClick={() => setNewPostDialog(true)}
                          fullWidth={true}
                          sx={{
                            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                            color: 'white',
                            fontWeight: 700,
                            px: { xs: 2, md: 3 },
                            py: { xs: 2, md: 1.5 },
                            fontSize: { xs: '1rem', md: '0.95rem' },
                            minHeight: { xs: 48, md: 'auto' },
                            borderRadius: 2,
                            boxShadow: '0 4px 20px rgba(242, 159, 5, 0.4)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 25px rgba(242, 159, 5, 0.5)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Neuer Post
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Key size={22} />}
                          onClick={handleShareConnectionKey}
                          fullWidth={true}
                          sx={{
                            borderColor: 'rgba(242, 159, 5, 0.5)',
                            color: '#F29F05',
                            fontWeight: 600,
                            px: { xs: 2, md: 3 },
                            py: { xs: 2, md: 1.5 },
                            fontSize: { xs: '1rem', md: '0.95rem' },
                            minHeight: { xs: 48, md: 'auto' },
                            borderRadius: 2,
                            '&:hover': {
                              borderColor: '#F29F05',
                              background: 'rgba(242, 159, 5, 0.1)',
                              transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.3s ease'
                          }}
                        >
                          Connection Key teilen
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                  
                  {posts.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: { xs: 5, md: 8 }, px: { xs: 2, md: 3 } }}>
                      <MessageSquare size={64} style={{ color: '#F29F05', opacity: 0.5, marginBottom: 16 }} />
                      <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                        Noch keine Posts
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Erstelle den ersten Post und teile deine Gedanken mit der Community!
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
                      {posts.map((post, index) => (
                        <Card
                          key={post.id}
                          sx={{ 
                          mb: { xs: 2, md: 3 }, 
                          background: 'rgba(255, 255, 255, 0.05)', 
                          backdropFilter: 'blur(20px)',
                          borderRadius: 3,
                          border: '1px solid rgba(242, 159, 5, 0.20)',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(242, 159, 5, 0.30)',
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 30px rgba(242, 159, 5, 0.25)'
                          }
                        }}>
                          <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5 }}>
                              <Avatar 
                                src={post.avatar}
                                onClick={() => handleUserClick({ name: post.author, type: post.type, avatar: post.avatar })}
                                sx={{ 
                                  width: { xs: 52, md: 56 }, 
                                  height: { xs: 52, md: 56 }, 
                                  mr: 2,
                                  border: '2px solid rgba(242, 159, 5, 0.3)',
                                  boxShadow: '0 0 10px rgba(242, 159, 5, 0.2)',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  '&:hover': {
                                    transform: 'scale(1.1)',
                                    boxShadow: '0 0 20px rgba(242, 159, 5, 0.4)'
                                  }
                                }} 
                              />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                                  <Typography 
                                    variant="subtitle1" 
                                    onClick={() => handleUserClick({ name: post.author, type: post.type, avatar: post.avatar })}
                                    sx={{ 
                                      color: 'white', 
                                      fontWeight: 700, 
                                      fontSize: { xs: '0.95rem', md: '1rem' },
                                      cursor: 'pointer',
                                      '&:hover': {
                                        color: '#F29F05',
                                        textDecoration: 'underline'
                                      },
                                      transition: 'all 0.2s ease'
                                    }}
                                  >
                                    {post.author}
                                  </Typography>
                                  <Chip 
                                    label={post.type} 
                                    size="small" 
                                    sx={{ 
                                      background: 'rgba(242, 159, 5, 0.20)', 
                                      color: '#F29F05',
                                      fontSize: '0.7rem',
                                      fontWeight: 600,
                                      height: 20,
                                      '& .MuiChip-label': { px: 1 }
                                    }} 
                                  />
                                </Box>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                                  {post.timestamp}
                                </Typography>
                              </Box>
                              <IconButton 
                                sx={{ 
                                  color: 'rgba(255,255,255,0.6)',
                                  '&:hover': {
                                    color: '#F29F05',
                                    background: 'rgba(242, 159, 5, 0.1)'
                                  }
                                }}
                              >
                                <MoreVertical size={20} />
                              </IconButton>
                            </Box>
                            
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                color: 'rgba(255,255,255,0.95)', 
                                mb: { xs: 2, md: 2.5 }, 
                                lineHeight: 1.7,
                                fontSize: { xs: '0.95rem', md: '1rem' }
                              }}
                            >
                              {post.content}
                            </Typography>
                          
                          <Box sx={{ display: 'flex', gap: { xs: 0.75, md: 1 }, mb: { xs: 1.5, md: 2 }, flexWrap: 'wrap' }}>
                            {(post.tags || []).map((tag: string, tagIndex: number) => (
                              <Chip
                                key={tagIndex}
                                label={`#${tag}`}
                                size="small"
                                sx={{
                                  background: 'rgba(242, 159, 5, 0.10)',
                                  color: '#F29F05',
                                  fontSize: '0.7rem'
                                }}
                              />
                            ))}
                          </Box>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: { xs: 2, md: 3 },
                            pt: 2,
                            borderTop: '1px solid rgba(242, 159, 5, 0.1)'
                          }}>
                            <Button
                              variant="text"
                              size="small"
                              startIcon={<ThumbsUp size={18} fill={likedPosts.has(post.id) ? '#F29F05' : 'none'} />}
                              onClick={() => handleLikePost(post.id)}
                              sx={{ 
                                color: likedPosts.has(post.id) ? '#F29F05' : 'rgba(255,255,255,0.7)',
                                minWidth: 'auto',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: '0.875rem',
                                '&:hover': {
                                  color: '#F29F05',
                                  background: 'rgba(242, 159, 5, 0.1)'
                                }
                              }}
                            >
                              {post.likes}
                            </Button>
                            <Button
                              variant="text"
                              size="small"
                              startIcon={<MessageCircle size={18} />}
                              onClick={() => handleCommentClick(post.id)}
                              sx={{ 
                                color: 'rgba(255,255,255,0.7)',
                                minWidth: 'auto',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: '0.875rem',
                                '&:hover': {
                                  color: '#F29F05',
                                  background: 'rgba(242, 159, 5, 0.1)'
                                }
                              }}
                            >
                              {post.comments || 0}
                            </Button>
                            <Button
                              variant="text"
                              size="small"
                              startIcon={<Share2 size={18} />}
                              sx={{ 
                                color: 'rgba(255,255,255,0.7)',
                                minWidth: 'auto',
                                px: 1.5,
                                py: 0.5,
                                borderRadius: 2,
                                fontSize: '0.875rem',
                                '&:hover': {
                                  color: '#F29F05',
                                  background: 'rgba(242, 159, 5, 0.1)'
                                }
                              }}
                            >
                              {post.shares}
                            </Button>
                          </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                </Card>
              </Grid>

              {/* Sidebar */}
              <Grid item xs={12} lg={4}>
                {/* Online Users */}
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: '1px solid rgba(242, 159, 5, 0.20)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  mb: 3
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                      Online jetzt
                    </Typography>
                    <List>
                      {onlineUsers.map((user) => (
                        <ListItem 
                          key={user.id} 
                          sx={{ 
                            px: 0,
                            cursor: 'pointer',
                            borderRadius: 2,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              background: 'rgba(242, 159, 5, 0.1)',
                              transform: 'translateX(4px)'
                            }
                          }}
                          onClick={() => handleUserClick({ name: user.name, type: user.type, avatar: user.avatar })}
                        >
                          <ListItemAvatar>
                            <Box sx={{ position: 'relative' }}>
                              <Avatar src={user.avatar} sx={{ width: 40, height: 40 }} />
                              <Box sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: user.status === 'online' ? '#F29F05' : '#8C1D04',
                                border: '2px solid rgba(255,255,255,0.1)'
                              }} />
                            </Box>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={user.name}
                            secondary={user.type}
                            primaryTypographyProps={{ color: 'white', fontSize: '0.9rem', fontWeight: 600 }}
                            secondaryTypographyProps={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>

                {/* Trending Topics */}
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: '1px solid rgba(242, 159, 5, 0.20)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                      Trending Topics
                    </Typography>
                    <List>
                      {trendingTopics.map((topic, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemText 
                            primary={topic.topic}
                            secondary={`${topic.posts} Posts`}
                            primaryTypographyProps={{ color: 'white', fontSize: '0.9rem' }}
                            secondaryTypographyProps={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}
                          />
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {topic.trend === 'up' && <TrendingUp size={16} style={{ color: '#F29F05' }} />}
                            {topic.trend === 'down' && <TrendingUp size={16} style={{ color: '#ef4444', transform: 'rotate(180deg)' }} />}
                            {topic.trend === 'stable' && <Activity size={16} style={{ color: '#f59e0b' }} />}
                          </Box>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mb: 1, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                Kommende Events
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: '0.875rem', md: '0.95rem' }, mb: 3 }}>
                Entdecke spannende Human Design Events und treffe Gleichgesinnte
              </Typography>
              
              {/* Filter und Sortierung */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                <Chip
                  label="Alle"
                  onClick={() => setEventFilter('all')}
                  sx={{
                    background: eventFilter === 'all' ? 'rgba(242, 159, 5, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    color: eventFilter === 'all' ? '#F29F05' : 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(242, 159, 5, 0.3)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': {
                      background: 'rgba(242, 159, 5, 0.15)'
                    }
                  }}
                />
                <Chip
                  label="Meine Events"
                  onClick={() => setEventFilter('my-events')}
                  sx={{
                    background: eventFilter === 'my-events' ? 'rgba(242, 159, 5, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    color: eventFilter === 'my-events' ? '#F29F05' : 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(242, 159, 5, 0.3)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': {
                      background: 'rgba(242, 159, 5, 0.15)'
                    }
                  }}
                />
                <Chip
                  label="Meetup"
                  onClick={() => setEventCategory(eventCategory === 'Meetup' ? 'all' : 'Meetup')}
                  sx={{
                    background: eventCategory === 'Meetup' ? 'rgba(242, 159, 5, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    color: eventCategory === 'Meetup' ? '#F29F05' : 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(242, 159, 5, 0.3)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': {
                      background: 'rgba(242, 159, 5, 0.15)'
                    }
                  }}
                />
                <Chip
                  label="Workshop"
                  onClick={() => setEventCategory(eventCategory === 'Workshop' ? 'all' : 'Workshop')}
                  sx={{
                    background: eventCategory === 'Workshop' ? 'rgba(242, 159, 5, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    color: eventCategory === 'Workshop' ? '#F29F05' : 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(242, 159, 5, 0.3)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': {
                      background: 'rgba(242, 159, 5, 0.15)'
                    }
                  }}
                />
                <Chip
                  label="Gruppe"
                  onClick={() => setEventCategory(eventCategory === 'Gruppe' ? 'all' : 'Gruppe')}
                  sx={{
                    background: eventCategory === 'Gruppe' ? 'rgba(242, 159, 5, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    color: eventCategory === 'Gruppe' ? '#F29F05' : 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(242, 159, 5, 0.3)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': {
                      background: 'rgba(242, 159, 5, 0.15)'
                    }
                  }}
                />
                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                  <Chip
                    label={eventSort === 'date' ? '📅 Datum' : eventSort === 'popularity' ? '⭐ Beliebtheit' : '👥 Teilnehmer'}
                    onClick={() => {
                      const sorts = ['date', 'popularity', 'attendees'];
                      const currentIndex = sorts.indexOf(eventSort);
                      setEventSort(sorts[(currentIndex + 1) % sorts.length]);
                    }}
                    sx={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: 'rgba(255,255,255,0.8)',
                      border: '1px solid rgba(242, 159, 5, 0.3)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      '&:hover': {
                        background: 'rgba(242, 159, 5, 0.15)'
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>
            <Grid container spacing={3}>
              {getFilteredEvents().map((event, index) => (
                <Grid item xs={12} sm={6} lg={4} key={event.id}>
                  <Card 
                    sx={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 4,
                      border: '1px solid rgba(242, 159, 5, 0.25)',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 40px rgba(242, 159, 5, 0.3)',
                        border: '1px solid rgba(242, 159, 5, 0.40)'
                      }
                    }}
                    onClick={() => handleEventClick(event)}
                  >
                    {/* Event Header mit Gradient */}
                    <Box sx={{
                      background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.20) 0%, rgba(140, 29, 4, 0.15) 100%)',
                      p: 2.5,
                      borderBottom: '1px solid rgba(242, 159, 5, 0.2)'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                        <Chip 
                          label={event.type} 
                          size="small" 
                          sx={{ 
                            background: 'rgba(242, 159, 5, 0.25)', 
                            color: '#F29F05',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24
                          }} 
                        />
                        <Typography variant="caption" sx={{ 
                          color: 'rgba(255,255,255,0.7)', 
                          fontSize: '0.8rem',
                          fontWeight: 500
                        }}>
                          {event.date}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ 
                        color: 'white', 
                        fontWeight: 700,
                        fontSize: { xs: '1rem', md: '1.15rem' },
                        lineHeight: 1.3,
                        mb: 1
                      }}>
                        {event.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Clock size={16} style={{ color: '#F29F05' }} />
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', fontWeight: 500 }}>
                            {event.time}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ mb: 2.5, flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <MapPin size={18} style={{ color: '#F29F05', marginRight: 10, marginTop: 2, flexShrink: 0 }} />
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255,255,255,0.9)',
                            lineHeight: 1.6,
                            fontSize: { xs: '0.875rem', md: '0.9rem' },
                            fontWeight: 500
                          }}>
                            {event.location}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" sx={{ 
                          color: 'rgba(255,255,255,0.75)', 
                          mb: 2,
                          lineHeight: 1.7,
                          fontSize: { xs: '0.875rem', md: '0.9rem' },
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {event.description}
                        </Typography>
                      </Box>

                      {/* Teilnehmer Info */}
                      <Box sx={{ 
                        mb: 2.5,
                        p: 1.5,
                        background: 'rgba(242, 159, 5, 0.08)',
                        borderRadius: 2,
                        border: '1px solid rgba(242, 159, 5, 0.15)'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Users size={16} style={{ color: '#F29F05' }} />
                            <Typography variant="body2" sx={{ 
                              color: 'rgba(255,255,255,0.9)',
                              fontWeight: 600,
                              fontSize: '0.875rem'
                            }}>
                              {event.attendees}/{event.maxAttendees} Teilnehmer
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ 
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '0.75rem',
                            fontWeight: 500
                          }}>
                            {Math.round((event.attendees / event.maxAttendees) * 100)}% belegt
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={(event.attendees / event.maxAttendees) * 100}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(90deg, #F29F05, #8C1D04)',
                              borderRadius: 3
                            },
                            '& .MuiLinearProgress-root': {
                              backgroundColor: 'rgba(255,255,255,0.1)',
                              borderRadius: 3
                            }
                          }}
                        />
                      </Box>

                      {/* Organizer Info */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mb: 2.5,
                        pb: 2,
                        borderBottom: '1px solid rgba(242, 159, 5, 0.1)'
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32,
                            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}>
                            {event.organizer.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="caption" sx={{ 
                              color: 'rgba(255,255,255,0.6)',
                              fontSize: '0.75rem',
                              display: 'block'
                            }}>
                              Organisiert von
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: 'rgba(255,255,255,0.9)',
                              fontSize: '0.85rem',
                              fontWeight: 600
                            }}>
                              {event.organizer}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Button 
                        variant={sharedEvents.has(event.id) ? "contained" : "outlined"}
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinEvent(event.id);
                        }}
                        sx={{
                          borderColor: sharedEvents.has(event.id) ? 'transparent' : 'rgba(242, 159, 5, 0.5)',
                          background: sharedEvents.has(event.id) 
                            ? 'linear-gradient(135deg, #F29F05, #8C1D04)' 
                            : 'transparent',
                          color: sharedEvents.has(event.id) ? 'white' : '#F29F05',
                          fontWeight: 700,
                          py: { xs: 1.5, md: 1.25 },
                          fontSize: { xs: '0.95rem', md: '0.9rem' },
                          minHeight: { xs: 48, md: 44 },
                          borderRadius: 2,
                          textTransform: 'none',
                          boxShadow: sharedEvents.has(event.id) 
                            ? '0 4px 15px rgba(242, 159, 5, 0.3)' 
                            : 'none',
                          '&:hover': {
                            borderColor: '#F29F05',
                            background: sharedEvents.has(event.id) 
                              ? 'linear-gradient(135deg, #8C1D04, #F29F05)' 
                              : 'rgba(242, 159, 5, 0.15)',
                            transform: 'translateY(-2px)',
                            boxShadow: sharedEvents.has(event.id)
                              ? '0 6px 20px rgba(242, 159, 5, 0.4)'
                              : '0 4px 15px rgba(242, 159, 5, 0.2)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {sharedEvents.has(event.id) ? '✓ Teilnahme bestätigt' : 'Event beitreten'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {getFilteredEvents().length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8, width: '100%' }}>
                <Calendar size={48} color="#F29F05" style={{ marginBottom: 16, opacity: 0.6 }} />
                <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                  Keine Events gefunden
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                  Versuche andere Filter oder schaue später wieder vorbei
                </Typography>
              </Box>
            )}
          </TabPanel>
          
          {/* Event Details Dialog */}
          <Dialog
            open={eventDetailsOpen}
            onClose={() => setEventDetailsOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                background: 'rgba(11, 10, 15, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                borderRadius: 4
              }
            }}
          >
            {selectedEvent && (
              <>
                <DialogTitle sx={{ 
                  background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.20) 0%, rgba(140, 29, 4, 0.15) 100%)',
                  borderBottom: '1px solid rgba(242, 159, 5, 0.2)',
                  pb: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                      <Chip 
                        label={selectedEvent.type} 
                        size="small" 
                        sx={{ 
                          background: 'rgba(242, 159, 5, 0.25)', 
                          color: '#F29F05',
                          fontWeight: 600,
                          mb: 1
                        }} 
                      />
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, mt: 1 }}>
                        {selectedEvent.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {selectedEvent.date} • {selectedEvent.time}
                    </Typography>
                  </Box>
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700, mb: 2 }}>
                        Beschreibung
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.8, mb: 3 }}>
                        {selectedEvent.fullDescription || selectedEvent.description}
                      </Typography>
                      
                      {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                          {selectedEvent.tags.map((tag: string, idx: number) => (
                            <Chip
                              key={idx}
                              label={tag}
                              size="small"
                              sx={{
                                background: 'rgba(242, 159, 5, 0.12)',
                                color: '#F29F05',
                                border: '1px solid rgba(242, 159, 5, 0.25)',
                                fontWeight: 500
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card sx={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(242, 159, 5, 0.2)',
                        p: 2
                      }}>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <MapPin size={18} color="#F29F05" />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                              Ort
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', ml: 3 }}>
                            {selectedEvent.location}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Clock size={18} color="#F29F05" />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                              Dauer
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', ml: 3 }}>
                            {selectedEvent.duration || '2 Stunden'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, mb: 1 }}>
                            Preis
                          </Typography>
                          <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700 }}>
                            {selectedEvent.price || 'Kostenlos'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600, mb: 1 }}>
                            Voraussetzungen
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            {selectedEvent.requirements || 'Keine'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2, p: 1.5, background: 'rgba(242, 159, 5, 0.08)', borderRadius: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Users size={16} color="#F29F05" />
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                                Teilnehmer
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                              {selectedEvent.attendees}/{selectedEvent.maxAttendees}
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(selectedEvent.attendees / selectedEvent.maxAttendees) * 100}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              '& .MuiLinearProgress-bar': {
                                background: 'linear-gradient(90deg, #F29F05, #8C1D04)',
                                borderRadius: 3
                              }
                            }}
                          />
                        </Box>
                      </Card>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions sx={{ 
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderTop: '1px solid rgba(242, 159, 5, 0.2)',
                  p: 2
                }}>
                  <Button
                    onClick={() => setEventDetailsOpen(false)}
                    sx={{
                      color: 'rgba(255,255,255,0.7)',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    Schließen
                  </Button>
                  <Button
                    variant={sharedEvents.has(selectedEvent.id) ? "contained" : "outlined"}
                    onClick={() => {
                      handleJoinEvent(selectedEvent.id);
                      setEventDetailsOpen(false);
                    }}
                    sx={{
                      borderColor: sharedEvents.has(selectedEvent.id) ? 'transparent' : 'rgba(242, 159, 5, 0.5)',
                      background: sharedEvents.has(selectedEvent.id) 
                        ? 'linear-gradient(135deg, #F29F05, #8C1D04)' 
                        : 'transparent',
                      color: sharedEvents.has(selectedEvent.id) ? 'white' : '#F29F05',
                      fontWeight: 700,
                      '&:hover': {
                        background: sharedEvents.has(selectedEvent.id) 
                          ? 'linear-gradient(135deg, #8C1D04, #F29F05)' 
                          : 'rgba(242, 159, 5, 0.15)'
                      }
                    }}
                  >
                    {sharedEvents.has(selectedEvent.id) ? '✓ Teilnahme bestätigt' : 'Event beitreten'}
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>

          {/* Gruppen Tab */}
          <TabPanel value={activeTab} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: '1px solid rgba(242, 159, 5, 0.20)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                }}>
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      mb: { xs: 2, md: 3 },
                      flexDirection: { xs: 'column', md: 'row' },
                      gap: 2
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Users2 size={24} style={{ color: '#F29F05', marginRight: 12 }} />
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                          Gruppen
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<Plus size={22} />}
                        sx={{
                          background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                          color: 'white',
                          fontWeight: 700,
                          px: 3,
                          py: { xs: 1.2, md: 1.5 },
                          fontSize: '0.95rem',
                          borderRadius: 2,
                          boxShadow: '0 4px 20px rgba(242, 159, 5, 0.4)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 25px rgba(242, 159, 5, 0.5)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Gruppe erstellen
                      </Button>
                    </Box>
                    
                    <Grid container spacing={3}>
                      {[
                        {
                          name: 'Generator Community',
                          description: 'Für alle Generatoren - teile deine Erfahrungen und lerne von anderen',
                          members: 1250,
                          icon: '⚡',
                          color: '#F29F05'
                        },
                        {
                          name: 'Projector Network',
                          description: 'Ein Raum für Projectors, um sich auszutauschen und zu vernetzen',
                          members: 450,
                          icon: '🎯',
                          color: '#8C1D04'
                        },
                        {
                          name: 'Manifestor Circle',
                          description: 'Für Manifestors, die ihre Energie und Initiativen teilen möchten',
                          members: 320,
                          icon: '🔥',
                          color: '#F29F05'
                        },
                        {
                          name: 'Reflector Space',
                          description: 'Ein geschützter Raum für Reflectors zum Austausch',
                          members: 180,
                          icon: '🌙',
                          color: '#8C1D04'
                        },
                        {
                          name: 'Connection Key Explorer',
                          description: 'Gruppe für alle, die Connection Keys teilen und analysieren möchten',
                          members: 890,
                          icon: '🔑',
                          color: '#F29F05'
                        },
                        {
                          name: 'Human Design Anfänger',
                          description: 'Perfekt für alle, die gerade erst mit Human Design beginnen',
                          members: 2100,
                          icon: '🌱',
                          color: '#8C1D04'
                        }
                      ].map((group, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card sx={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: 3,
                            border: '1px solid rgba(242, 159, 5, 0.20)',
                            p: 3,
                            height: '100%',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              borderColor: group.color,
                              boxShadow: `0 8px 30px ${group.color}40`
                            }
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Box sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 2,
                                background: `linear-gradient(135deg, ${group.color}, ${group.color}80)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                mr: 2
                              }}>
                                {group.icon}
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 0.5, fontSize: '1rem' }}>
                                  {group.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
                                  {group.members} Mitglieder
                                </Typography>
                              </Box>
                            </Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2, fontSize: '0.85rem', lineHeight: 1.6 }}>
                              {group.description}
                            </Typography>
                            <Button
                              variant="outlined"
                              fullWidth
                              sx={{
                                borderColor: group.color,
                                color: group.color,
                                fontWeight: 600,
                                py: { xs: 0.75, md: 1 },
                                fontSize: '0.85rem',
                                '&:hover': {
                                  borderColor: group.color,
                                  background: `${group.color}20`
                                }
                              }}
                            >
                              Beitreten
                            </Button>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Online Tab */}
          <TabPanel value={activeTab} index={3}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 3 }}>
                  Aktive Community-Mitglieder
                </Typography>
                <Grid container spacing={2}>
                  {onlineUsers.map((user, index) => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={user.id}>
                      <Box>
                        <Box sx={{ 
                          textAlign: 'center', 
                          p: 2, 
                          background: 'rgba(255, 255, 255, 0.03)', 
                          borderRadius: 2,
                          border: '1px solid rgba(242, 159, 5, 0.20)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.05)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                        onClick={() => handleUserClick({ name: user.name, type: user.type, avatar: user.avatar })}
                        >
                          <Box sx={{ position: 'relative', display: 'inline-block', mb: 1 }}>
                            <Avatar 
                              src={user.avatar} 
                              sx={{ 
                                width: 56, 
                                height: 56, 
                                mx: 'auto',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'scale(1.1)',
                                  boxShadow: '0 0 20px rgba(242, 159, 5, 0.4)'
                                }
                              }} 
                            />
                            <Box sx={{
                              position: 'absolute',
                              bottom: 2,
                              right: 2,
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                                backgroundColor: user.status === 'online' ? '#F29F05' : '#8C1D04',
                              border: '2px solid rgba(255,255,255,0.1)'
                            }} />
                          </Box>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'white', 
                              fontWeight: 600, 
                              mb: 0.5,
                              cursor: 'pointer',
                              '&:hover': {
                                color: '#F29F05'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {user.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            {user.type}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>

          {/* Messages Tab */}
          <TabPanel value={activeTab} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 3 }}>
                      Direktnachrichten
                    </Typography>
                    <List>
                      {directMessages.map((message) => (
                        <ListItem 
                          key={message.id} 
                          sx={{ 
                            p: 2, 
                            mb: 1, 
                            background: 'rgba(255, 255, 255, 0.03)', 
                            borderRadius: 2,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: 'rgba(255,255,255,0.1)'
                            }
                          }}
                          onClick={() => handleUserClick(message.user)}
                        >
                          <ListItemAvatar>
                            <Box sx={{ position: 'relative' }}>
                              <Avatar src={message.user.avatar} sx={{ width: 48, height: 48 }} />
                              <Box sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: message.user.status === 'online' ? '#F29F05' : '#8C1D04',
                                border: '2px solid rgba(255,255,255,0.1)'
                              }} />
                            </Box>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                                  {message.user.name}
                                </Typography>
                                {message.unread > 0 && (
                                  <Badge badgeContent={message.unread} color="error" />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 0.5 }}>
                                  {message.lastMessage}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                  {message.timestamp}
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                      Benachrichtigungen
                    </Typography>
                    <List>
                      {notificationData.map((notification) => (
                        <ListItem key={notification.id} sx={{ px: 0, py: 1 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              width: 32, 
                              height: 32, 
                              background: notification.read ? 'rgba(255,255,255,0.1)' : '#F29F05',
                              color: notification.read ? 'rgba(255,255,255,0.7)' : '#1f2937'
                            }}>
                              {notification.icon}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={
                              <Typography variant="body2" sx={{ 
                                color: 'white', 
                                fontWeight: notification.read ? 400 : 600,
                                fontSize: '0.9rem'
                              }}>
                                {notification.title}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                {notification.timestamp}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Matches Tab */}
          <TabPanel value={activeTab} index={5}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: '1px solid rgba(242, 159, 5, 0.20)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  mb: 3
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Heart size={24} style={{ color: '#F29F05', marginRight: 12 }} />
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                        Deine Kompatibilitäts-Matches
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      Finde Menschen mit hoher energetischer Kompatibilität basierend auf euren Human Design Charts
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {compatibilityMatches.length > 0 ? compatibilityMatches.map((match, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Box
                  >
                    <Card sx={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 3,
                      border: '1px solid rgba(242, 159, 5, 0.20)',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                      }
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            src={match.user.avatar} 
                            onClick={() => handleUserClick({ name: match.user.name, type: match.user.type, avatar: match.user.avatar })}
                            sx={{ 
                              width: 56, 
                              height: 56, 
                              mr: 2,
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'scale(1.1)',
                                boxShadow: '0 0 20px rgba(242, 159, 5, 0.4)'
                              }
                            }} 
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant="h6" 
                              onClick={() => handleUserClick({ name: match.user.name, type: match.user.type, avatar: match.user.avatar })}
                              sx={{ 
                                color: 'white', 
                                fontWeight: 600,
                                cursor: 'pointer',
                                '&:hover': {
                                  color: '#F29F05',
                                  textDecoration: 'underline'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {match.user.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              {match.user.type} • {match.user.age} • {match.user.location}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ 
                              color: match.compatibility > 90 ? '#F29F05' : match.compatibility > 80 ? '#F29F05' : '#8C1D04',
                              fontWeight: 700
                            }}>
                              {match.compatibility}%
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                              Kompatibilität
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                              Gemeinsame Tore: {match.sharedGates}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                              Kanäle: {match.sharedChannels}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ color: '#F29F05', fontWeight: 600, mb: 1 }}>
                            Kompatibilitäts-Faktoren:
                          </Typography>
                          {(match.compatibilityFactors || []).map((factor, idx) => (
                              <Chip
                              key={idx}
                              label={factor}
                              size="small"
                              sx={{
                                background: 'rgba(242, 159, 5, 0.10)',
                                color: '#F29F05',
                                fontSize: '0.7rem',
                                mr: 0.5,
                                mb: 0.5
                              }}
                            />
                          ))}
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            variant="contained" 
                            fullWidth
                            onClick={() => handleUserClick(match.user)}
                            sx={{
                              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                              color: 'white',
                              fontWeight: 600,
                              '&:hover': {
                                background: 'linear-gradient(135deg, #8C1D04, #F29F05)'
                              }
                            }}
                          >
                            Nachricht senden
                          </Button>
                          <Button 
                            variant="outlined"
                            onClick={() => handleCompatibilityCheck(match.user)}
                            sx={{
                              borderColor: 'rgba(242, 159, 5, 0.30)',
                              color: '#F29F05',
                              minWidth: 'auto',
                              px: 2,
                              '&:hover': {
                                borderColor: '#8C1D04',
                                backgroundColor: 'rgba(242, 159, 5, 0.10)'
                              }
                            }}
                          >
                            <Heart size={16} />
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              )) : (
                <Grid item xs={12}>
                  <Card sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 4,
                    border: '1px solid rgba(242, 159, 5, 0.20)',
                    p: 4,
                    textAlign: 'center'
                  }}>
                    <CardContent>
                      <Heart size={48} style={{ color: 'rgba(242, 159, 5, 0.5)', marginBottom: 16 }} />
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                        Noch keine Matches gefunden
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                        Teile deinen Connection Key oder aktiviere die Match-Suche, um kompatible Menschen zu finden.
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Key size={20} />}
                        sx={{
                          background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                          color: 'white',
                          fontWeight: 600,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #8C1D04, #F29F05)'
                          }
                        }}
                      >
                        Connection Key teilen
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </TabPanel>

          {/* Mentoring Tab */}
          <TabPanel value={activeTab} index={6}>
            <Grid container spacing={3}>
              {mentorMenteeMatches.map((match, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Box
                  >
                    <Card sx={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 3,
                      border: '1px solid rgba(242, 159, 5, 0.20)',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                      }
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar 
                            src={match.user.avatar} 
                            onClick={() => handleUserClick({ name: match.user.name, type: match.user.type, avatar: match.user.avatar })}
                            sx={{ 
                              width: 56, 
                              height: 56, 
                              mr: 2,
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'scale(1.1)',
                                boxShadow: '0 0 20px rgba(242, 159, 5, 0.4)'
                              }
                            }} 
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant="h6" 
                              onClick={() => handleUserClick({ name: match.user.name, type: match.user.type, avatar: match.user.avatar })}
                              sx={{ 
                                color: 'white', 
                                fontWeight: 600,
                                cursor: 'pointer',
                                '&:hover': {
                                  color: '#F29F05',
                                  textDecoration: 'underline'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {match.user.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              {match.user.type}
                            </Typography>
                          </Box>
                          <Chip 
                            label={match.type === 'mentor' ? 'Mentor' : 'Mentee'}
                            sx={{
                              background: match.type === 'mentor' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                              color: match.type === 'mentor' ? '#F29F05' : '#3b82f6',
                              fontWeight: 600
                            }} 
                          />
                        </Box>
                        
                        {match.type === 'mentor' ? (
                          <Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                              <strong>Spezialgebiet:</strong> {(match as any).specialty || 'N/A'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                              <strong>Erfahrung:</strong> {(match.user as any).experience || 'N/A'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Star size={16} style={{ color: '#F29F05', marginRight: 4 }} />
                                <Typography variant="body2" sx={{ color: 'white' }}>
                                  {(match as any).rating || 'N/A'}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                {(match as any).students || 0} Studenten
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Box>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                              <strong>Level:</strong> {(match.user as any).level || 'N/A'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                              <strong>Such nach:</strong> {(match as any).lookingFor || 'N/A'}
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="body2" sx={{ color: '#F29F05', fontWeight: 600, mb: 1 }}>
                                Ziele:
                              </Typography>
                              {((match as any).goals || []).map((goal: string, idx: number) => (
                                <Chip
                                  key={idx}
                                  label={goal}
                                  size="small"
                                  sx={{
                                    background: 'rgba(242, 159, 5, 0.10)',
                                    color: '#F29F05',
                                    fontSize: '0.7rem',
                                    mr: 0.5,
                                    mb: 0.5
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                        
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                          {match.description}
                        </Typography>
                        
                        <Button 
                          variant="contained" 
                          fullWidth
                          onClick={() => {
                            if (match.type === 'mentor' && (match as any).coachId) {
                              router.push('/coaching');
                            } else {
                              handleUserClick(match.user);
                            }
                          }}
                          sx={{
                            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                            color: '#1f2937',
                            fontWeight: 600,
                            '&:hover': {
                              background: 'linear-gradient(135deg, #8C1D04, #F29F05)'
                            }
                          }}
                        >
                          {match.type === 'mentor' ? 'Als Mentor kontaktieren' : 'Als Mentee kontaktieren'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Trending Tab */}
          <TabPanel value={activeTab} index={7}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  borderRadius: 4,
                  border: '1px solid rgba(242, 159, 5, 0.20)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                  mb: 3
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <TrendingUp size={24} style={{ color: '#F29F05', marginRight: 12 }} />
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                        Trending Topics
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                      Die aktuell beliebtesten Themen in der Community
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              {trendingTopics.map((topic, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box
                  >
                    <Card sx={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: 3,
                      border: '1px solid rgba(242, 159, 5, 0.20)',
                      p: 3,
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                      }
                    }}>
                      <CardContent>
                        <Box sx={{ mb: 2 }}>
                          {topic.trend === 'up' && <TrendingUp size={32} style={{ color: '#F29F05' }} />}
                          {topic.trend === 'down' && <TrendingUp size={32} style={{ color: '#ef4444', transform: 'rotate(180deg)' }} />}
                          {topic.trend === 'stable' && <Activity size={32} style={{ color: '#f59e0b' }} />}
                        </Box>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                          {topic.topic}
                        </Typography>
                        <Typography variant="h4" sx={{ color: '#F29F05', fontWeight: 700, mb: 1 }}>
                          {topic.posts}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Posts
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

        {/* Floating Action Button */}
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: { xs: 16, md: 24 },
            right: { xs: 16, md: 24 },
            width: { xs: 56, md: 56 },
            height: { xs: 56, md: 56 },
            background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
            color: '#1f2937',
            zIndex: 1000,
            '&:hover': {
              background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
              transform: 'scale(1.1)'
            }
          }}
          onClick={() => setNewPostDialog(true)}
        >
          <Plus size={28} />
        </Fab>

        {/* New Post Dialog */}
        <Dialog
          open={newPostDialog}
          onClose={() => setNewPostDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(15, 15, 35, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.20)',
              borderRadius: 3
            }
          }}
        >
          <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
            Neuen Post erstellen
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Was möchtest du mit der Community teilen?"
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              sx={{
                mt: 2,
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
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ 
            flexDirection: { xs: 'column-reverse', md: 'row' },
            gap: { xs: 1, md: 0 },
            px: { xs: 2, md: 3 },
            pb: { xs: 2, md: 3 }
          }}>
            <Button
              onClick={() => setNewPostDialog(false)}
              fullWidth={true}
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                py: { xs: 1.5, md: 1 },
                minHeight: { xs: 48, md: 'auto' },
                fontSize: { xs: '1rem', md: '0.95rem' }
              }}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleNewPost}
              variant="contained"
              fullWidth={true}
              sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                color: '#1f2937',
                fontWeight: 600,
                py: { xs: 1.5, md: 1 },
                minHeight: { xs: 48, md: 'auto' },
                fontSize: { xs: '1rem', md: '0.95rem' },
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)'
                }
              }}
            >
              Posten
            </Button>
          </DialogActions>
        </Dialog>

        {/* Messages Dialog */}
        <Dialog
          open={messagesDialog}
          onClose={() => setMessagesDialog(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(15, 15, 35, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.20)',
              borderRadius: 3
            }
          }}
        >
          <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
            Nachricht an {selectedUser?.name}
          </DialogTitle>
          <DialogContent>
            {selectedUser && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 2, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 2 }}>
                <Avatar src={selectedUser.avatar} sx={{ width: 40, height: 40, mr: 2 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                    {selectedUser.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {selectedUser.type}
                  </Typography>
                </Box>
              </Box>
            )}
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Schreibe eine Nachricht..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              sx={{
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
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ 
            flexDirection: { xs: 'column-reverse', md: 'row' },
            gap: { xs: 1, md: 0 },
            px: { xs: 2, md: 3 },
            pb: { xs: 2, md: 3 }
          }}>
            <Button
              onClick={() => setMessagesDialog(false)}
              fullWidth={true}
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                py: { xs: 1.5, md: 1 },
                minHeight: { xs: 48, md: 'auto' },
                fontSize: { xs: '1rem', md: '0.95rem' }
              }}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSendMessage}
              variant="contained"
              fullWidth={true}
              sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                color: '#1f2937',
                fontWeight: 600,
                py: { xs: 1.5, md: 1 },
                minHeight: { xs: 48, md: 'auto' },
                fontSize: { xs: '1rem', md: '0.95rem' },
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)'
                }
              }}
            >
              Senden
            </Button>
          </DialogActions>
        </Dialog>

        {/* Comment Dialog */}
        <Dialog
          open={commentDialog.open}
          onClose={() => setCommentDialog({ open: false, postId: null })}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(15, 15, 35, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.20)',
              borderRadius: 3
            }
          }}
        >
          <DialogTitle sx={{ color: 'white', fontWeight: 600 }}>
            Kommentar hinzufügen
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Schreibe einen Kommentar..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              sx={{
                mt: 2,
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
                }
              }}
            />
            {commentDialog.postId !== null && postComments[commentDialog.postId] && postComments[commentDialog.postId].length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                  Kommentare ({postComments[commentDialog.postId].length})
                </Typography>
                {postComments[commentDialog.postId].map((comment: Comment) => (
                  <Box key={comment.id} sx={{ mb: 2, p: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar src={comment.avatar} sx={{ width: 32, height: 32, mr: 1 }} />
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                        {comment.author}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', ml: 1 }}>
                        {comment.timestamp}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                      {comment.content}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ 
            flexDirection: { xs: 'column-reverse', md: 'row' },
            gap: { xs: 1, md: 0 },
            px: { xs: 2, md: 3 },
            pb: { xs: 2, md: 3 }
          }}>
            <Button
              onClick={() => setCommentDialog({ open: false, postId: null })}
              fullWidth={true}
              sx={{ 
                color: 'rgba(255,255,255,0.7)',
                py: { xs: 1.5, md: 1 },
                minHeight: { xs: 48, md: 'auto' },
                fontSize: { xs: '1rem', md: '0.95rem' }
              }}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleCommentSubmit}
              variant="contained"
              fullWidth={true}
              sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                color: 'white',
                fontWeight: 600,
                py: { xs: 1.5, md: 1 },
                minHeight: { xs: 48, md: 'auto' },
                fontSize: { xs: '1rem', md: '0.95rem' },
                '&:hover': {
                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)'
                }
              }}
            >
              Kommentieren
            </Button>
          </DialogActions>
        </Dialog>

        {/* Zurück zum Dashboard Button */}
        <Box sx={{ textAlign: 'center', mt: { xs: 6, md: 8 }, mb: { xs: 4, md: 4 }, px: { xs: 2, md: 0 } }}>
          <Button
            component={Link}
            href="/dashboard"
            variant="outlined"
            fullWidth
            sx={{
              color: '#F29F05',
              borderColor: '#F29F05',
              fontWeight: 'bold',
              px: { xs: 3, md: 4 },
              py: { xs: 2, md: 1.5 },
              fontSize: { xs: '1rem', md: '1rem' },
              minHeight: { xs: 48, md: 'auto' },
              borderRadius: 2,
              maxWidth: { xs: '100%', md: 'auto' },
              '&:hover': {
                borderColor: '#8C1D04',
                color: '#8C1D04',
                background: 'rgba(242, 159, 5, 0.1)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(242, 159, 5, 0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Zurück zum Dashboard
          </Button>
        </Box>
        </PageLayout>

        {/* CSS Animations */}
        <style>{`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.5;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.8;
            }
          }
        `}</style>
      </Box>
    </AccessControl>
  );
}

// Hauptkomponente mit ProtectedRoute
export default function CommunityPage() {
  return (
    <ProtectedRoute requiredRole="basic">
      <CommunityContent />
    </ProtectedRoute>
  );
}
