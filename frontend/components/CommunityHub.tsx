"use client";
import React, { useState, useEffect } from 'react';
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
  TextField,
  Tabs,
  Tab,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Users,
  MessageCircle,
  Heart,
  Plus,
  Search,
  Calendar,
  MapPin,
  UserPlus,
  Send,
  ThumbsUp,
  MessageSquare
} from 'lucide-react';

interface CommunityUser {
  id: string;
  username: string;
  name: string;
  hd_type: string;
  profile: string;
  avatar?: string;
  bio?: string;
  location?: string;
  interests: string[];
  isOnline: boolean;
}

interface CommunityPost {
  id: string;
  userId: string;
  title: string;
  content: string;
  type: 'question' | 'insight' | 'experience' | 'tip';
  tags: string[];
  likes: number;
  comments: number;
  createdAt: string;
  author: CommunityUser;
}

interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  type: 'hd_type' | 'profile' | 'interest' | 'location' | 'general';
  category: string;
  memberCount: number;
  isPrivate: boolean;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: 'meetup' | 'workshop' | 'discussion' | 'meditation';
  date: string;
  time: string;
  location: string;
  isOnline: boolean;
  maxParticipants: number;
  currentParticipants: number;
}

interface CommunityHubProps {
  userId: string;
}

export default function CommunityHub({ userId }: CommunityHubProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [friends, setFriends] = useState<CommunityUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userGroups, setUserGroups] = useState<string[]>([]);
  const [userEvents, setUserEvents] = useState<string[]>([]);
  
  // Dialog States
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    type: 'question' as const,
    tags: [] as string[],
    isPublic: true
  });

  useEffect(() => {
    loadCommunityData();
    loadUserMemberships();
  }, []);

  const loadUserMemberships = () => {
    try {
      import('@/lib/utils/safeJson').then(({ safeLocalStorageParse }) => {
        const savedGroups = safeLocalStorageParse<string[]>('userGroups', []);
        const savedEvents = safeLocalStorageParse<string[]>('userEvents', []);
        setUserGroups(savedGroups || []);
        setUserEvents(savedEvents || []);
      }).catch((err) => {
        console.error('Fehler beim Laden der Mitgliedschaften:', err);
        setUserGroups([]);
        setUserEvents([]);
      });
    } catch (err) {
      console.error('Fehler beim Laden der Mitgliedschaften:', err);
      setUserGroups([]);
      setUserEvents([]);
    }
  };

  const loadCommunityData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPosts(),
        loadGroups(),
        loadEvents(),
        loadFriends()
      ]);
    } catch (err) {
      setError('Fehler beim Laden der Community-Daten');
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/community/posts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        console.error(`HTTP ${response.status}: Fehler beim Laden der Posts`);
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Ungültiger Content-Type beim Laden der Posts');
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts || []);
      } else {
        console.error('API-Fehler beim Laden der Posts:', data.error);
      }
    } catch (err) {
      console.error('Fehler beim Laden der Posts:', err);
      setError('Fehler beim Laden der Community-Posts');
    }
  };

  const loadGroups = async () => {
    try {
      const response = await fetch('/api/community/groups', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        setGroups(getMockGroups());
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setGroups(getMockGroups());
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setGroups(data.groups);
      } else {
        setGroups(getMockGroups());
      }
    } catch (err) {
      console.error('Fehler beim Laden der Gruppen:', err);
      setGroups(getMockGroups());
    }
  };

  const loadEvents = async () => {
    try {
      const response = await fetch('/api/community/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        setEvents(getMockEvents());
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setEvents(getMockEvents());
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      } else {
        setEvents(getMockEvents());
      }
    } catch (err) {
      console.error('Fehler beim Laden der Events:', err);
      setEvents(getMockEvents());
    }
  };

  const loadFriends = async () => {
    try {
      const response = await fetch('/api/community/friends', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        setFriends(getMockFriends());
        return;
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setFriends(getMockFriends());
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setFriends(data.friends);
      } else {
        setFriends(getMockFriends());
      }
    } catch (err) {
      console.error('Fehler beim Laden der Freunde:', err);
      setFriends(getMockFriends());
    }
  };

  const createPost = async () => {
    try {
      const response = await fetch('/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(newPost)
      });

      if (!response.ok) {
        const { parseErrorResponse } = await import('@/lib/utils/refactorErrorTextPattern');
        const errorMessage = await parseErrorResponse(response, 'Fehler beim Erstellen des Posts');
        setError(errorMessage);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setCreatePostOpen(false);
        setNewPost({ title: '', content: '', type: 'question', tags: [], isPublic: true });
        loadPosts();
      } else {
        setError(data.error || 'Fehler beim Erstellen des Posts');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verbindungsfehler beim Erstellen des Posts';
      setError(errorMessage);
      console.error('Fehler beim Erstellen des Posts:', err);
    }
  };

  const likePost = async (postId: string) => {
    try {
      await fetch(`/api/community/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      loadPosts();
    } catch (err) {
      console.error('Fehler beim Liken des Posts:', err);
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/community/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Erfolgreich der Gruppe beigetreten!');
          loadGroups(); // Aktualisiere die Gruppen-Liste
          loadUserMemberships(); // Aktualisiere Mitgliedschaften
        } else {
          alert(data.error || 'Fehler beim Beitreten zur Gruppe');
        }
      } else {
        // Fallback für lokale Speicherung
        const { safeLocalStorageParse, safeLocalStorageSet } = await import('@/lib/utils/safeJson');
        const userGroups = safeLocalStorageParse<string[]>('userGroups', []) || [];
        if (!userGroups.includes(groupId)) {
          userGroups.push(groupId);
          localStorage.setItem('userGroups', JSON.stringify(userGroups));
          alert('Erfolgreich der Gruppe beigetreten!');
          loadGroups();
          loadUserMemberships(); // Aktualisiere Mitgliedschaften
        } else {
          alert('Du bist bereits Mitglied dieser Gruppe!');
        }
      }
    } catch (err) {
      console.error('Fehler beim Beitreten zur Gruppe:', err);
      // Fallback für lokale Speicherung
      const { safeLocalStorageParse, safeLocalStorageSet } = await import('@/lib/utils/safeJson');
      const userGroups = safeLocalStorageParse<string[]>('userGroups', []) || [];
      if (!userGroups.includes(groupId)) {
        userGroups.push(groupId);
        safeLocalStorageSet('userGroups', userGroups);
        alert('Erfolgreich der Gruppe beigetreten!');
        loadGroups();
        loadUserMemberships(); // Aktualisiere Mitgliedschaften
      } else {
        alert('Du bist bereits Mitglied dieser Gruppe!');
      }
    }
  };

  const joinEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/community/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Erfolgreich für das Event angemeldet!');
          loadEvents(); // Aktualisiere die Events-Liste
          loadUserMemberships(); // Aktualisiere Mitgliedschaften
        } else {
          alert(data.error || 'Fehler bei der Anmeldung zum Event');
        }
      } else {
        // Fallback für lokale Speicherung
        const { safeLocalStorageParse, safeLocalStorageSet } = await import('@/lib/utils/safeJson');
        const userEvents = safeLocalStorageParse<string[]>('userEvents', []) || [];
        if (!userEvents.includes(eventId)) {
          userEvents.push(eventId);
          safeLocalStorageSet('userEvents', userEvents);
          alert('Erfolgreich für das Event angemeldet!');
          loadEvents();
          loadUserMemberships(); // Aktualisiere Mitgliedschaften
        } else {
          alert('Du bist bereits für dieses Event angemeldet!');
        }
      }
    } catch (err) {
      console.error('Fehler bei der Anmeldung zum Event:', err);
      // Fallback für lokale Speicherung
      const { safeLocalStorageParse, safeLocalStorageSet } = await import('@/lib/utils/safeJson');
      const userEvents = safeLocalStorageParse<string[]>('userEvents', []) || [];
      if (!userEvents.includes(eventId)) {
        userEvents.push(eventId);
        safeLocalStorageSet('userEvents', userEvents);
        alert('Erfolgreich für das Event angemeldet!');
        loadEvents();
        loadUserMemberships(); // Aktualisiere Mitgliedschaften
      } else {
        alert('Du bist bereits für dieses Event angemeldet!');
      }
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!confirm('Möchtest du diese Gruppe wirklich verlassen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/community/groups/${groupId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('Gruppe erfolgreich verlassen!');
          loadGroups();
          loadUserMemberships();
        } else {
          alert(data.error || 'Fehler beim Verlassen der Gruppe');
        }
      } else {
        // Fallback für lokale Speicherung
        const { safeLocalStorageParse, safeLocalStorageSet } = await import('@/lib/utils/safeJson');
        const userGroups = safeLocalStorageParse<string[]>('userGroups', []) || [];
        const updatedGroups = userGroups.filter((id: string) => id !== groupId);
        safeLocalStorageSet('userGroups', updatedGroups);
        alert('Gruppe erfolgreich verlassen!');
        loadGroups();
        loadUserMemberships();
      }
    } catch (err) {
      console.error('Fehler beim Verlassen der Gruppe:', err);
      // Fallback für lokale Speicherung
      const { safeLocalStorageParse, safeLocalStorageSet } = await import('@/lib/utils/safeJson');
      const userGroups = safeLocalStorageParse<string[]>('userGroups', []) || [];
      const updatedGroups = userGroups.filter((id: string) => id !== groupId);
      safeLocalStorageSet('userGroups', updatedGroups);
      alert('Gruppe erfolgreich verlassen!');
      loadGroups();
      loadUserMemberships();
    }
  };

  const getPostTypeColor = (type: string) => {
    const colors = {
      question: '#FFD700',
      insight: '#4CAF50',
      experience: '#2196F3',
      tip: '#FF9800'
    };
    return colors[type as keyof typeof colors] || '#666';
  };

  const getPostTypeIcon = (type: string) => {
    const icons = {
      question: '❓',
      insight: '💡',
      experience: '📖',
      tip: '💡'
    };
    return icons[type as keyof typeof icons] || '📝';
  };

  const getMockGroups = (): CommunityGroup[] => {
    return [
      {
        id: 'group1',
        name: 'Generator Community',
        description: 'Eine Gruppe für alle Generator-Typen, um Erfahrungen auszutauschen und sich gegenseitig zu unterstützen.',
        type: 'hd_type',
        category: 'Generator',
        memberCount: 1247,
        isPrivate: false
      },
      {
        id: 'group2',
        name: 'Projector Network',
        description: 'Netzwerk für Projectors - hier findest du Einladungen und kannst deine Führungsqualitäten entwickeln.',
        type: 'hd_type',
        category: 'Projector',
        memberCount: 892,
        isPrivate: false
      },
      {
        id: 'group3',
        name: 'Manifestor Power',
        description: 'Für Manifestors, die ihre Initiationskraft teilen und sich über Strategien austauschen möchten.',
        type: 'hd_type',
        category: 'Manifestor',
        memberCount: 456,
        isPrivate: false
      },
      {
        id: 'group4',
        name: 'Reflector Circle',
        description: 'Ein sicherer Raum für Reflectors, um ihre einzigartige Perspektive zu teilen.',
        type: 'hd_type',
        category: 'Reflector',
        memberCount: 234,
        isPrivate: false
      },
      {
        id: 'group5',
        name: 'Profile 2/4 Connection',
        description: 'Spezielle Gruppe für 2/4 Profile - Hermit Opportunist Verbindungen.',
        type: 'profile',
        category: '2/4',
        memberCount: 678,
        isPrivate: false
      },
      {
        id: 'group6',
        name: 'Berlin HD Meetup',
        description: 'Lokale Human Design Treffen in Berlin - regelmäßige Meetups und Workshops.',
        type: 'location',
        category: 'Berlin',
        memberCount: 189,
        isPrivate: false
      }
    ];
  };

  const getMockEvents = (): CommunityEvent[] => {
    return [
      {
        id: 'event1',
        title: 'HD Grundlagen Workshop',
        description: 'Ein umfassender Workshop für Human Design Einsteiger. Lerne die Grundlagen kennen.',
        type: 'workshop',
        date: '2024-12-15',
        time: '10:00',
        location: 'Berlin, Deutschland',
        isOnline: false,
        maxParticipants: 20,
        currentParticipants: 12
      },
      {
        id: 'event2',
        title: 'Online Meditation Circle',
        description: 'Gemeinsame Meditation basierend auf Human Design Prinzipien. Für alle Typen geeignet.',
        type: 'meditation',
        date: '2024-12-12',
        time: '19:00',
        location: 'Online',
        isOnline: true,
        maxParticipants: 50,
        currentParticipants: 23
      },
      {
        id: 'event3',
        title: 'Generator Strategy Talk',
        description: 'Tiefgreifende Diskussion über die Generator-Strategie und wie man sie im Alltag anwendet.',
        type: 'discussion',
        date: '2024-12-18',
        time: '18:30',
        location: 'München, Deutschland',
        isOnline: false,
        maxParticipants: 15,
        currentParticipants: 8
      },
      {
        id: 'event4',
        title: 'HD Dating Workshop',
        description: 'Wie Human Design dir bei der Partnersuche helfen kann. Praktische Tipps und Übungen.',
        type: 'workshop',
        date: '2024-12-20',
        time: '14:00',
        location: 'Hamburg, Deutschland',
        isOnline: false,
        maxParticipants: 25,
        currentParticipants: 18
      }
    ];
  };

  const getMockFriends = (): CommunityUser[] => {
    return [
      {
        id: 'friend1',
        username: 'sarah_hd',
        name: 'Sarah Müller',
        hd_type: 'Projector',
        profile: '3/5',
        bio: 'Human Design Coach und Projektor-Expertin',
        location: 'Berlin',
        interests: ['Coaching', 'Human Design', 'Meditation'],
        isOnline: true
      },
      {
        id: 'friend2',
        username: 'max_generator',
        name: 'Max Weber',
        hd_type: 'Generator',
        profile: '2/4',
        bio: 'Generator mit 2/4 Profil - liebe es zu reagieren!',
        location: 'München',
        interests: ['Yoga', 'Energiearbeit', 'Community'],
        isOnline: false
      },
      {
        id: 'friend3',
        username: 'lisa_reflector',
        name: 'Lisa Schmidt',
        hd_type: 'Reflector',
        profile: '6/2',
        bio: 'Reflector - ich reflektiere die Energie der Gruppe',
        location: 'Hamburg',
        interests: ['Spiritualität', 'Natur', 'Heilung'],
        isOnline: true
      },
      {
        id: 'friend4',
        username: 'tom_manifestor',
        name: 'Tom Klein',
        hd_type: 'Manifestor',
        profile: '1/3',
        bio: 'Manifestor - ich initiiere und führe',
        location: 'Köln',
        interests: ['Business', 'Führung', 'Innovation'],
        isOnline: false
      }
    ];
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse at top, rgba(139, 92, 246, 0.3) 0%, transparent 50%),
        radial-gradient(ellipse at bottom, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
        linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Background Elements */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              background: '#FFD700',
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </Box>

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: 6 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
            >
              <Box sx={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B6B 100%)',
                mb: 4,
                boxShadow: '0 20px 40px rgba(255, 215, 0, 0.4)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: -4,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B)',
                  zIndex: -1,
                  filter: 'blur(20px)',
                  opacity: 0.7
                }
              }}>
                <Users size={50} color="#1a1a2e" />
              </Box>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <Typography variant="h2" sx={{ 
                color: 'white', 
                fontWeight: 800, 
                mb: 2,
                fontSize: { xs: '2rem', md: '3rem' },
                textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B6B 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                ✨ Community Hub ✨
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Typography variant="h6" sx={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6
              }}>
                Verbinde dich mit anderen Human Design Enthusiasten und teile deine Erfahrungen
              </Typography>
            </motion.div>
          </Box>

          {/* Fehler-Anzeige */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ 
                mb: 4, 
                p: 3, 
                background: 'rgba(239, 68, 68, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)'
              }}>
                <Typography sx={{ color: '#ef4444', fontWeight: 600 }}>{error}</Typography>
              </Box>
            </motion.div>
          )}

          {/* Suchleiste */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <Box sx={{ mb: 4 }}>
              <TextField
                fullWidth
                placeholder="Suche nach Posts, Gruppen, Events oder Personen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={20} style={{ marginRight: 8, color: 'rgba(255, 255, 255, 0.7)' }} />
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#FFD700',
                    },
                  },
                  '& .MuiInputBase-input': {
                    color: 'white',
                    '&::placeholder': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      opacity: 1,
                    },
                  },
                }}
              />
            </Box>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            <Box sx={{ 
              borderBottom: 1, 
              borderColor: 'rgba(255, 255, 255, 0.2)', 
              mb: 4,
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              p: 1
            }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '1rem',
                    minHeight: 48,
                    borderRadius: 2,
                    mx: 0.5,
                    '&.Mui-selected': {
                      color: '#FFD700',
                      background: 'rgba(255, 215, 0, 0.1)',
                    },
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.05)',
                    }
                  },
                  '& .MuiTabs-indicator': {
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    height: 3,
                    borderRadius: 2
                  }
                }}
              >
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MessageCircle size={18} />
                      Posts
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Users size={18} />
                      Gruppen
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Calendar size={18} />
                      Events
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <UserPlus size={18} />
                      Freunde
                    </Box>
                  } 
                />
                <Tab 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Users size={18} />
                      Meine Gruppen
                      {userGroups.length > 0 && (
                        <Chip 
                          label={userGroups.length} 
                          size="small" 
                          sx={{ 
                            ml: 1, 
                            background: '#FFD700', 
                            color: '#1a1a2e',
                            fontSize: '0.7rem',
                            height: 18,
                            minWidth: 18
                          }} 
                        />
                      )}
                    </Box>
                  } 
                />
              </Tabs>
            </Box>
          </motion.div>

          {/* Tab Content */}
          {activeTab === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Box>
                {/* Create Post Button */}
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h4" sx={{ 
                    color: 'white', 
                    fontWeight: 700,
                    textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
                  }}>
                    📝 Community Posts
                  </Typography>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<Plus />}
                      onClick={() => setCreatePostOpen(true)}
                      sx={{ 
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B6B 100%)',
                        color: '#1a1a2e',
                        fontWeight: 700,
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #FFA500 0%, #FF6B6B 50%, #FFD700 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 35px rgba(255, 215, 0, 0.6)',
                        }
                      }}
                    >
                      ✨ Neuer Post
                    </Button>
                  </motion.div>
                </Box>

                {/* Posts */}
                <Grid container spacing={4}>
                  {posts.map((post, index) => (
                    <Grid item xs={12} md={6} key={post.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                        whileHover={{ y: -8 }}
                      >
                        <Card sx={{
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: 4,
                          border: '1px solid rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
                          }
                        }}>
                          <CardContent sx={{ p: 4 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '50%',
                                  background: `linear-gradient(135deg, ${getPostTypeColor(post.type)}, ${getPostTypeColor(post.type)}dd)`,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  boxShadow: `0 4px 12px ${getPostTypeColor(post.type)}40`
                                }}>
                                  <Typography sx={{ fontSize: '1.2rem' }}>
                                    {getPostTypeIcon(post.type)}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
                                    {new Date(post.createdAt).toLocaleDateString('de-DE')}
                                  </Typography>
                                  <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
                                    von {post.author.name}
                                  </Typography>
                                </Box>
                              </Box>
                              <Chip
                                label={post.type}
                                size="small"
                                sx={{
                                  background: 'rgba(255,215,0,0.2)',
                                  color: '#FFD700',
                                  border: '1px solid rgba(255,215,0,0.3)',
                                  textTransform: 'capitalize',
                                  fontWeight: 600
                                }}
                              />
                            </Box>

                            <Typography variant="h6" sx={{
                              color: 'rgba(255,255,255,0.9)',
                              fontWeight: 700,
                              mb: 2,
                              lineHeight: 1.4
                            }}>
                              {post.title}
                            </Typography>

                            <Typography sx={{
                              color: 'rgba(255,255,255,0.8)',
                              mb: 3,
                              lineHeight: 1.6,
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {post.content}
                            </Typography>

                            {post.tags.length > 0 && (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                {post.tags.map((tag) => (
                                  <Chip
                                    key={tag}
                                    label={tag}
                                    size="small"
                                    sx={{
                                      background: 'rgba(255,215,0,0.15)',
                                      color: '#FFD700',
                                      border: '1px solid rgba(255,215,0,0.2)',
                                      fontSize: '0.8rem'
                                    }}
                                  />
                                ))}
                              </Box>
                            )}

                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 2,
                              pt: 2,
                              borderTop: '1px solid rgba(255,255,255,0.1)'
                            }}>
                              <IconButton 
                                onClick={() => likePost(post.id)}
                                sx={{
                                  color: '#FFD700',
                                  '&:hover': {
                                    background: 'rgba(255, 215, 0, 0.1)',
                                  }
                                }}
                              >
                                <ThumbsUp size={16} />
                              </IconButton>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                {post.likes}
                              </Typography>
                              
                              <IconButton sx={{
                                color: '#8B5CF6',
                                '&:hover': {
                                  background: 'rgba(139, 92, 246, 0.1)',
                                }
                              }}>
                                <MessageSquare size={16} />
                              </IconButton>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                {post.comments}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </motion.div>
          )}

          {activeTab === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography variant="h3" sx={{ 
                    color: '#FFD700', 
                    fontWeight: 700 
                  }}>
                    Gruppen
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={() => setCreateGroupOpen(true)}
                    sx={{
                      background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                      color: '#000',
                      fontWeight: 700,
                      px: 4,
                      py: 2,
                      borderRadius: 3,
                      '&:hover': {
                        background: 'linear-gradient(45deg, #FFA500, #FF8C00)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 30px rgba(255,215,0,0.4)'
                      }
                    }}
                  >
                    Neue Gruppe
                  </Button>
                </Box>

                <Grid container spacing={4}>
                  {groups.map((group, index) => (
                    <Grid item xs={12} md={6} key={group.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                        whileHover={{ y: -8 }}
                      >
                        <Card sx={{
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: 4,
                          border: '1px solid rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
                          }
                        }}>
                          <CardContent sx={{ p: 4 }}>
                            <Typography variant="h5" sx={{
                              color: 'rgba(255,255,255,0.9)',
                              fontWeight: 700,
                              mb: 2
                            }}>
                              {group.name}
                            </Typography>
                            <Typography sx={{
                              color: 'rgba(255,255,255,0.8)',
                              mb: 3,
                              lineHeight: 1.6
                            }}>
                              {group.description}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                              <Chip 
                                label={group.type} 
                                size="small"
                                sx={{
                                  background: 'rgba(255,215,0,0.15)',
                                  color: '#FFD700',
                                  border: '1px solid rgba(255,215,0,0.2)',
                                  fontSize: '0.8rem'
                                }}
                              />
                              <Chip 
                                label={group.category} 
                                size="small"
                                sx={{
                                  background: 'rgba(139, 92, 246, 0.15)',
                                  color: '#8B5CF6',
                                  border: '1px solid rgba(139, 92, 246, 0.2)',
                                  fontSize: '0.8rem'
                                }}
                              />
                              <Chip 
                                label={`${group.memberCount} Mitglieder`} 
                                size="small"
                                sx={{
                                  background: 'rgba(16, 185, 129, 0.15)',
                                  color: '#10b981',
                                  border: '1px solid rgba(16, 185, 129, 0.2)',
                                  fontSize: '0.8rem'
                                }}
                              />
                            </Box>
                            <Button
                              variant="outlined"
                              fullWidth
                              onClick={() => userGroups.includes(group.id) ? leaveGroup(group.id) : joinGroup(group.id)}
                              sx={{ 
                                color: userGroups.includes(group.id) ? '#ef4444' : '#FFD700', 
                                borderColor: userGroups.includes(group.id) ? '#ef4444' : '#FFD700',
                                fontWeight: 600,
                                py: 1.5,
                                '&:hover': {
                                  borderColor: userGroups.includes(group.id) ? '#dc2626' : '#FFA500',
                                  bgcolor: userGroups.includes(group.id) ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 215, 0, 0.1)',
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              {userGroups.includes(group.id) ? 'Verlassen' : 'Beitreten'}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </motion.div>
          )}

          {activeTab === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography variant="h3" sx={{ 
                    color: '#FFD700', 
                    fontWeight: 700 
                  }}>
                    Events
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={() => setCreateEventOpen(true)}
                    sx={{
                      background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                      color: '#000',
                      fontWeight: 700,
                      px: 4,
                      py: 2,
                      borderRadius: 3,
                      '&:hover': {
                        background: 'linear-gradient(45deg, #FFA500, #FF8C00)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 30px rgba(255,215,0,0.4)'
                      }
                    }}
                  >
                    Neues Event
                  </Button>
                </Box>

                <Grid container spacing={4}>
                  {events.map((event, index) => (
                    <Grid item xs={12} md={6} key={event.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                        whileHover={{ y: -8 }}
                      >
                        <Card sx={{
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: 4,
                          border: '1px solid rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
                          }
                        }}>
                          <CardContent sx={{ p: 4 }}>
                            <Typography variant="h5" sx={{
                              color: 'rgba(255,255,255,0.9)',
                              fontWeight: 700,
                              mb: 2
                            }}>
                              {event.title}
                            </Typography>
                            <Typography sx={{
                              color: 'rgba(255,255,255,0.8)',
                              mb: 3,
                              lineHeight: 1.6
                            }}>
                              {event.description}
                            </Typography>
                            
                            <Box sx={{ mb: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Calendar size={16} color="#FFD700" />
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                  {new Date(event.date).toLocaleDateString('de-DE')} um {event.time}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <MapPin size={16} color="#8B5CF6" />
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                  {event.isOnline ? 'Online' : event.location}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Users size={16} color="#10b981" />
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                  {event.currentParticipants}/{event.maxParticipants} Teilnehmer
                                </Typography>
                              </Box>
                            </Box>

                            <Button
                              variant="outlined"
                              fullWidth
                              onClick={() => joinEvent(event.id)}
                              sx={{ 
                                color: '#FFD700', 
                                borderColor: '#FFD700',
                                fontWeight: 600,
                                py: 1.5,
                                '&:hover': {
                                  borderColor: '#FFA500',
                                  bgcolor: 'rgba(255, 215, 0, 0.1)',
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              Teilnehmen
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </motion.div>
          )}

          {activeTab === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <Box>
                <Typography variant="h3" sx={{ 
                  color: '#FFD700', 
                  fontWeight: 700,
                  mb: 4
                }}>
                  Deine Freunde
                </Typography>
                
                <Grid container spacing={4}>
                  {friends.map((friend, index) => (
                    <Grid item xs={12} sm={6} md={4} key={friend.id}>
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                        whileHover={{ y: -8 }}
                      >
                        <Card sx={{
                          background: 'rgba(255,255,255,0.05)',
                          borderRadius: 4,
                          border: '1px solid rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
                          }
                        }}>
                          <CardContent sx={{ p: 4, textAlign: 'center' }}>
                            <Badge
                              overlap="circular"
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              badgeContent={
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    bgcolor: friend.isOnline ? '#10b981' : '#6b7280'
                                  }}
                                />
                              }
                            >
                              <Avatar sx={{ 
                                width: 60, 
                                height: 60, 
                                mx: 'auto', 
                                mb: 2,
                                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                color: '#1a1a2e',
                                fontWeight: 700,
                                fontSize: '1.5rem'
                              }}>
                                {friend.name.charAt(0)}
                              </Avatar>
                            </Badge>
                            
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700, 
                              mb: 1,
                              color: 'rgba(255,255,255,0.9)'
                            }}>
                              {friend.name}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              color: 'rgba(255,255,255,0.8)', 
                              mb: 1 
                            }}>
                              {friend.hd_type} • {friend.profile}
                            </Typography>
                            {friend.location && (
                              <Typography variant="body2" sx={{ 
                                color: 'rgba(255,255,255,0.7)', 
                                mb: 3 
                              }}>
                                📍 {friend.location}
                              </Typography>
                            )}
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<MessageSquare size={16} />}
                              sx={{ 
                                color: '#FFD700', 
                                borderColor: '#FFD700',
                                fontWeight: 600,
                                '&:hover': {
                                  borderColor: '#FFA500',
                                  bgcolor: 'rgba(255, 215, 0, 0.1)',
                                  transform: 'translateY(-2px)'
                                }
                              }}
                            >
                              Nachricht
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </motion.div>
          )}

          {activeTab === 4 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <Box>
                <Typography variant="h3" sx={{ 
                  color: '#FFD700', 
                  fontWeight: 700,
                  mb: 4
                }}>
                  Meine Gruppen ({userGroups.length})
                </Typography>
                
                {userGroups.length === 0 ? (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 8,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(20px)'
                  }}>
                    <Typography variant="h6" sx={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      mb: 2 
                    }}>
                      Du bist noch keiner Gruppe beigetreten
                    </Typography>
                    <Typography sx={{ 
                      color: 'rgba(255,255,255,0.6)', 
                      mb: 4 
                    }}>
                      Entdecke interessante Gruppen und tritt ihnen bei!
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => setActiveTab(1)}
                      sx={{
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B6B 100%)',
                        color: '#1a1a2e',
                        fontWeight: 700,
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #FFA500 0%, #FF6B6B 50%, #FFD700 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
                        }
                      }}
                    >
                      Gruppen entdecken
                    </Button>
                  </Box>
                ) : (
                  <Grid container spacing={4}>
                    {groups
                      .filter(group => userGroups.includes(group.id))
                      .map((group, index) => (
                        <Grid item xs={12} md={6} key={group.id}>
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 + index * 0.1, duration: 0.6 }}
                            whileHover={{ y: -8 }}
                          >
                            <Card sx={{
                              background: 'rgba(255,255,255,0.05)',
                              borderRadius: 4,
                              border: '1px solid rgba(255,255,255,0.1)',
                              backdropFilter: 'blur(20px)',
                              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
                              }
                            }}>
                              <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                  <Typography variant="h5" sx={{
                                    color: 'rgba(255,255,255,0.9)',
                                    fontWeight: 700
                                  }}>
                                    {group.name}
                                  </Typography>
                                  <Chip
                                    label="Mitglied"
                                    size="small"
                                    sx={{
                                      background: 'rgba(16, 185, 129, 0.2)',
                                      color: '#10b981',
                                      border: '1px solid rgba(16, 185, 129, 0.3)',
                                      fontWeight: 600
                                    }}
                                  />
                                </Box>
                                
                                <Typography sx={{
                                  color: 'rgba(255,255,255,0.8)',
                                  mb: 3,
                                  lineHeight: 1.6
                                }}>
                                  {group.description}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                  <Chip 
                                    label={group.type} 
                                    size="small"
                                    sx={{
                                      background: 'rgba(255,215,0,0.15)',
                                      color: '#FFD700',
                                      border: '1px solid rgba(255,215,0,0.2)',
                                      fontSize: '0.8rem'
                                    }}
                                  />
                                  <Chip 
                                    label={group.category} 
                                    size="small"
                                    sx={{
                                      background: 'rgba(139, 92, 246, 0.15)',
                                      color: '#8B5CF6',
                                      border: '1px solid rgba(139, 92, 246, 0.2)',
                                      fontSize: '0.8rem'
                                    }}
                                  />
                                  <Chip 
                                    label={`${group.memberCount} Mitglieder`} 
                                    size="small"
                                    sx={{
                                      background: 'rgba(16, 185, 129, 0.15)',
                                      color: '#10b981',
                                      border: '1px solid rgba(16, 185, 129, 0.2)',
                                      fontSize: '0.8rem'
                                    }}
                                  />
                                </Box>
                                
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                  <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{ 
                                      color: '#FFD700', 
                                      borderColor: '#FFD700',
                                      fontWeight: 600,
                                      py: 1.5,
                                      '&:hover': {
                                        borderColor: '#FFA500',
                                        bgcolor: 'rgba(255, 215, 0, 0.1)',
                                        transform: 'translateY(-2px)'
                                      }
                                    }}
                                  >
                                    Gruppe öffnen
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    onClick={() => leaveGroup(group.id)}
                                    sx={{ 
                                      color: '#ef4444', 
                                      borderColor: '#ef4444',
                                      fontWeight: 600,
                                      py: 1.5,
                                      px: 2,
                                      '&:hover': {
                                        borderColor: '#dc2626',
                                        bgcolor: 'rgba(239, 68, 68, 0.1)',
                                        transform: 'translateY(-2px)'
                                      }
                                    }}
                                  >
                                    Verlassen
                                  </Button>
                                </Box>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </Grid>
                      ))}
                  </Grid>
                )}
              </Box>
            </motion.div>
          )}

          {/* Create Post Dialog */}
          <Dialog 
            open={createPostOpen} 
            onClose={() => setCreatePostOpen(false)} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
              sx: {
                background: 'rgba(15, 15, 35, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 4,
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
              }
            }}
          >
            <DialogTitle sx={{ 
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B6B 100%)',
              color: '#1a1a2e',
              fontWeight: 700,
              fontSize: '1.5rem'
            }}>
              ✨ Neuen Post erstellen
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <TextField
                fullWidth
                label="Titel"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                sx={{ 
                  mb: 3, 
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
                      borderColor: '#FFD700',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.7)',
                  }
                }}
              />
              <TextField
                fullWidth
                label="Inhalt"
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                multiline
                rows={4}
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
                      borderColor: '#FFD700',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.7)',
                  }
                }}
              />
              <TextField
                fullWidth
                label="Tags (durch Komma getrennt)"
                value={newPost.tags.join(', ')}
                onChange={(e) => setNewPost(prev => ({ 
                  ...prev, 
                  tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                }))}
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
                      borderColor: '#FFD700',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255,255,255,0.7)',
                  }
                }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 4, gap: 2 }}>
              <Button 
                onClick={() => setCreatePostOpen(false)}
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Abbrechen
              </Button>
              <Button 
                onClick={createPost}
                variant="contained"
                sx={{ 
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B6B 100%)',
                  color: '#1a1a2e',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #FFA500 0%, #FF6B6B 50%, #FFD700 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(255, 215, 0, 0.4)',
                  }
                }}
              >
                ✨ Post erstellen
              </Button>
            </DialogActions>
          </Dialog>
        </motion.div>
      </Container>
    </Box>
  );
}
