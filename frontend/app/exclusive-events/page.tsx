'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  Avatar, 
  Chip, 
  Button,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Star, 
  Heart,
  Sparkles,
  Crown,
  Clock,
  MapPin,
  Video,
  MessageCircle,
  Gift,
  Award,
  Zap,
  Moon,
  Sun,
  Globe,
  Search,
  Filter,
  TrendingUp,
  Bookmark,
  Share2,
  Bell,
  CheckCircle2
} from 'lucide-react';
import PageLayout from '@/app/components/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ExclusiveEventsPage() {
  const { user, loading: authLoading } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [bookingDialog, setBookingDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [activeTab, setActiveTab] = useState(0);
  const [savedEvents, setSavedEvents] = useState<number[]>([]);
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

  useEffect(() => {
    setIsClient(true);
    // Lade gespeicherte Events aus localStorage
    const saved = localStorage.getItem('savedEvents');
    if (saved) {
      try {
        setSavedEvents(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading saved events:', e);
      }
    }
    
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
  }, []);

  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'VIP Moon Circle',
      description: 'Exklusiver Mondkreis für Premium-Mitglieder mit energetischer Heilung und tiefen Gesprächen',
      date: '2024-01-15',
      time: '19:00',
      duration: '2 Stunden',
      location: 'Online (Zoom)',
      type: 'Workshop',
      attendees: 12,
      maxAttendees: 15,
      price: 'Kostenlos',
      host: 'Sarah Chen',
      hostAvatar: '👩‍💼',
      features: ['Energetische Heilung', 'Mondrituale', 'Gruppendiskussion', 'Meditation'],
      status: 'available',
      category: 'Spiritualität'
    },
    {
      id: 2,
      title: 'Human Design Masterclass',
      description: 'Vertiefende Einblicke in Human Design mit praktischen Übungen und persönlichen Chart-Analysen',
      date: '2024-01-18',
      time: '20:00',
      duration: '3 Stunden',
      location: 'Online (Zoom)',
      type: 'Masterclass',
      attendees: 8,
      maxAttendees: 12,
      price: 'Kostenlos',
      host: 'Michael Rodriguez',
      hostAvatar: '👨‍🎓',
      features: ['Chart-Analyse', 'Praktische Übungen', 'Q&A Session', 'Networking'],
      status: 'available',
      category: 'Bildung'
    },
    {
      id: 3,
      title: 'Premium Dating Workshop',
      description: 'Strategien für erfolgreiches energetisches Dating mit praktischen Tipps und Übungen',
      date: '2024-01-22',
      time: '18:30',
      duration: '2.5 Stunden',
      location: 'Online (Zoom)',
      type: 'Workshop',
      attendees: 15,
      maxAttendees: 20,
      price: 'Kostenlos',
      host: 'Lisa Thompson',
      hostAvatar: '👩‍❤️‍👨',
      features: ['Dating-Strategien', 'Energie-Work', 'Rollenspiele', 'Feedback'],
      status: 'available',
      category: 'Dating'
    },
    {
      id: 4,
      title: 'VIP Networking Event',
      description: 'Exklusives Networking-Event für Premium-Mitglieder mit Speed-Dating und tiefen Gesprächen',
      date: '2024-01-25',
      time: '19:30',
      duration: '3 Stunden',
      location: 'Online (Zoom)',
      type: 'Networking',
      attendees: 20,
      maxAttendees: 25,
      price: 'Kostenlos',
      host: 'David Lee',
      hostAvatar: '👨‍💼',
      features: ['Speed-Dating', 'Networking', 'Gruppendiskussion', 'Preise'],
      status: 'available',
      category: 'Networking'
    },
    {
      id: 5,
      title: 'Energetische Heilung Session',
      description: 'Gruppen-Heilungssession mit Reiki, Meditation und energetischer Reinigung',
      date: '2024-01-28',
      time: '20:00',
      duration: '2 Stunden',
      location: 'Online (Zoom)',
      type: 'Heilung',
      attendees: 10,
      maxAttendees: 15,
      price: 'Kostenlos',
      host: 'Elisabeth Taeubel',
      hostAvatar: '🧘‍♀️',
      features: ['Reiki-Heilung', 'Meditation', 'Energetische Reinigung', 'Gruppenarbeit'],
      status: 'available',
      category: 'Heilung'
    },
    {
      id: 6,
      title: 'Premium Chart Reading',
      description: 'Persönliche Chart-Readings in kleinen Gruppen mit individueller Beratung',
      date: '2024-02-01',
      time: '19:00',
      duration: '2.5 Stunden',
      location: 'Online (Zoom)',
      type: 'Reading',
      attendees: 6,
      maxAttendees: 8,
      price: 'Kostenlos',
      host: 'Elisabeth Weber',
      hostAvatar: '🔮',
      features: ['Persönliche Readings', 'Chart-Analyse', 'Individuelle Beratung', 'Gruppendiskussion'],
      status: 'available',
      category: 'Human Design'
    }
  ]);

  const [upcomingEvents, setUpcomingEvents] = useState([
    {
      id: 1,
      title: 'VIP Moon Circle',
      date: '2024-01-15',
      time: '19:00',
      status: 'Bestätigt',
      meetingLink: 'https://zoom.us/j/123456789'
    },
    {
      id: 2,
      title: 'Human Design Masterclass',
      date: '2024-01-18',
      time: '20:00',
      status: 'Wartend',
      meetingLink: null
    }
  ]);

  const handleBookEvent = (event: any) => {
    setSelectedEvent(event);
    setBookingDialog(true);
  };

  const handleConfirmBooking = () => {
    // Booking logic here
    if (selectedEvent) {
      // Hier würde die API-Call für die Buchung erfolgen
      console.log('Event gebucht:', selectedEvent);
    }
    setBookingDialog(false);
    setSelectedEvent(null);
  };

  const handleSaveEvent = (eventId: number) => {
    const newSaved = savedEvents.includes(eventId)
      ? savedEvents.filter(id => id !== eventId)
      : [...savedEvents, eventId];
    setSavedEvents(newSaved);
    localStorage.setItem('savedEvents', JSON.stringify(newSaved));
  };

  const handleShareEvent = (event: any) => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${event.title} - ${window.location.href}`);
      alert('Link in Zwischenablage kopiert!');
    }
  };

  // Filter und Sortierung
  const filteredEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           event.host.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
      const matchesType = selectedType === 'all' || event.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'attendees':
          return b.attendees - a.attendees;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const categories = ['all', ...Array.from(new Set(events.map(e => e.category)))];
  const types = ['all', ...Array.from(new Set(events.map(e => e.type)))];

  const getEventTypeColor = (type: any) => {
    switch (type) {
      case 'Workshop': return '#8b5cf6';
      case 'Masterclass': return '#06b6d4';
      case 'Networking': return '#10b981';
      case 'Heilung': return '#f59e0b';
      case 'Reading': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getEventTypeIcon = (type: any) => {
    switch (type) {
      case 'Workshop': return <Users size={20} />;
      case 'Masterclass': return <Star size={20} />;
      case 'Networking': return <MessageCircle size={20} />;
      case 'Heilung': return <Heart size={20} />;
      case 'Reading': return <Sparkles size={20} />;
      default: return <Calendar size={20} />;
    }
  };

  return (
    <ProtectedRoute requiredRole="vip">
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
        {/* Animierte Sterne im Hintergrund - nur nach Mount */}
        {isClient && starPositions.length > 0 && starPositions.map((star, i) => (
          <motion.div
            key={`star-${i}`}
            style={{
              position: 'absolute',
              width: `${star.width}px`,
              height: `${star.height}px`,
              background: '#F29F05',
              borderRadius: '50%',
              left: `${star.left}%`,
              top: `${star.top}%`,
              pointerEvents: 'none',
              opacity: star.opacity,
              zIndex: 0,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: star.delay,
            }}
          />
        ))}

        {/* Animierte Planeten-Orbits - nur nach Mount */}
        {isClient && orbitPositions.length > 0 && orbitPositions.map((orbit, i) => (
          <motion.div
            key={`orbit-${i}`}
            style={{
              position: 'absolute',
              width: `${orbit.width}px`,
              height: `${orbit.height}px`,
              borderRadius: '50%',
              border: `1px solid rgba(242, 159, 5, ${orbit.borderOpacity})`,
              left: `${orbit.left}%`,
              top: `${orbit.top}%`,
              pointerEvents: 'none',
              zIndex: 0,
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: orbit.duration,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}

        <PageLayout activePage="dashboard" showLogo={true}>
          <Box suppressHydrationWarning sx={{ position: 'relative', zIndex: 1 }}>
            <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Crown size={48} color="#F29F05" />
              <Typography 
                variant="h2" 
                sx={{ 
                  fontWeight: 700, 
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                Exklusive Events
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 2 }}>
              Premium-Veranstaltungen nur für VIP-Mitglieder
            </Typography>
            <Chip 
              icon={<Crown size={16} />} 
              label="VIP Exklusiv" 
              sx={{ 
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                color: 'white',
                fontWeight: 600,
                px: 2,
                py: 1,
                border: '1px solid rgba(242, 159, 5, 0.3)'
              }} 
            />
          </Box>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Paper elevation={0} sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.2)',
            borderRadius: 3,
            p: 3,
            mb: 4
          }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Events durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search size={20} color="rgba(255, 255, 255, 0.6)" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(242, 159, 5, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(242, 159, 5, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#F29F05',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Kategorie</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    label="Kategorie"
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(242, 159, 5, 0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(242, 159, 5, 0.5)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#F29F05',
                      },
                    }}
                  >
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat === 'all' ? 'Alle' : cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Typ</InputLabel>
                  <Select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    label="Typ"
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(242, 159, 5, 0.3)',
                      },
                    }}
                  >
                    {types.map(type => (
                      <MenuItem key={type} value={type}>{type === 'all' ? 'Alle' : type}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Sortieren</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sortieren"
                    sx={{
                      color: 'white',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(242, 159, 5, 0.3)',
                      },
                    }}
                  >
                    <MenuItem value="date">Datum</MenuItem>
                    <MenuItem value="attendees">Teilnehmer</MenuItem>
                    <MenuItem value="title">Titel</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Filter size={16} />}
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedType('all');
                    setSortBy('date');
                  }}
                  sx={{
                    borderColor: 'rgba(242, 159, 5, 0.3)',
                    color: 'white',
                    '&:hover': {
                      borderColor: '#F29F05',
                      background: 'rgba(242, 159, 5, 0.1)',
                    },
                  }}
                >
                  Zurücksetzen
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Paper elevation={0} sx={{
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.12) 0%, rgba(140, 29, 4, 0.08) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                borderRadius: 3,
                p: 3,
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  boxShadow: '0 8px 24px rgba(242, 159, 5, 0.2)'
                }
              }}>
                <Calendar size={32} color="#F29F05" />
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: '#F29F05' }}>{filteredEvents.length}</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Verfügbare Events</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper elevation={0} sx={{
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.12) 0%, rgba(140, 29, 4, 0.08) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                borderRadius: 3,
                p: 3,
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  boxShadow: '0 8px 24px rgba(242, 159, 5, 0.2)'
                }
              }}>
                <Users size={32} color="#F29F05" />
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: '#F29F05' }}>
                  {events.reduce((sum, e) => sum + e.attendees, 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Teilnehmer</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper elevation={0} sx={{
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.12) 0%, rgba(140, 29, 4, 0.08) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                borderRadius: 3,
                p: 3,
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  boxShadow: '0 8px 24px rgba(242, 159, 5, 0.2)'
                }
              }}>
                <Star size={32} color="#F29F05" />
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: '#F29F05' }}>4.9</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Durchschnittsbewertung</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper elevation={0} sx={{
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.12) 0%, rgba(140, 29, 4, 0.08) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                borderRadius: 3,
                p: 3,
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  borderColor: 'rgba(242, 159, 5, 0.5)',
                  boxShadow: '0 8px 24px rgba(242, 159, 5, 0.2)'
                }
              }}>
                <Crown size={32} color="#F29F05" />
                <Typography variant="h4" sx={{ fontWeight: 700, mt: 1, color: '#F29F05' }}>100%</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>VIP Exklusiv</Typography>
              </Paper>
            </Grid>
          </Grid>
        </motion.div>

        <Grid container spacing={4}>
          {/* Available Events */}
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#F29F05' }}>
                  Verfügbare Events
                </Typography>
                <Chip 
                  label={`${filteredEvents.length} Events`}
                  sx={{
                    background: 'rgba(242, 159, 5, 0.2)',
                    color: '#F29F05',
                    border: '1px solid rgba(242, 159, 5, 0.3)'
                  }}
                />
              </Box>
              {filteredEvents.length === 0 ? (
                <Paper elevation={0} sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(242, 159, 5, 0.2)',
                  borderRadius: 3,
                  p: 4,
                  textAlign: 'center'
                }}>
                  <Search size={48} color="rgba(255, 255, 255, 0.5)" />
                  <Typography variant="h6" sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.7)' }}>
                    Keine Events gefunden
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: 'rgba(255, 255, 255, 0.5)' }}>
                    Versuche andere Filter oder Suchbegriffe
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={3}>
                  {filteredEvents.map((event, index) => (
                  <Grid item xs={12} md={6} key={event.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Paper elevation={0} sx={{
                        background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.12) 0%, rgba(140, 29, 4, 0.08) 100%)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(242, 159, 5, 0.3)',
                        borderRadius: 3,
                        p: 3,
                        height: '100%',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          borderColor: 'rgba(242, 159, 5, 0.6)',
                          boxShadow: '0 12px 32px rgba(242, 159, 5, 0.25)'
                        }
                      }}>
                        {/* Action Buttons */}
                        <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1, zIndex: 2 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleSaveEvent(event.id)}
                            sx={{
                              background: savedEvents.includes(event.id) 
                                ? 'rgba(242, 159, 5, 0.3)' 
                                : 'rgba(255, 255, 255, 0.1)',
                              color: savedEvents.includes(event.id) ? '#F29F05' : 'white',
                              '&:hover': {
                                background: 'rgba(242, 159, 5, 0.4)'
                              }
                            }}
                          >
                            <Bookmark size={16} fill={savedEvents.includes(event.id) ? '#F29F05' : 'none'} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleShareEvent(event)}
                            sx={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              color: 'white',
                              '&:hover': {
                                background: 'rgba(242, 159, 5, 0.3)'
                              }
                            }}
                          >
                            <Share2 size={16} />
                          </IconButton>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, pr: 6 }}>
                        <Box sx={{
                          width: 50,
                          height: 50,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, #F29F05, #8C1D04)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          color: 'white',
                          boxShadow: '0 4px 12px rgba(242, 159, 5, 0.3)'
                        }}>
                          {getEventTypeIcon(event.type)}
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {event.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {event.type} • {event.category}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.5 }}>
                        {event.description}
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        {event.features.map((feature, idx) => (
                          <Chip 
                            key={idx}
                            label={feature} 
                            size="small" 
                            sx={{ 
                              mr: 1,
                              mb: 1,
                              background: 'rgba(139, 92, 246, 0.2)',
                              color: '#8b5cf6',
                              fontSize: '10px'
                            }} 
                          />
                        ))}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Clock size={16} color="rgba(255, 255, 255, 0.6)" />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          {event.date} um {event.time} ({event.duration})
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <MapPin size={16} color="rgba(255, 255, 255, 0.6)" />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          {event.location}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Users size={16} color="rgba(255, 255, 255, 0.6)" />
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          {event.attendees}/{event.maxAttendees} Teilnehmer
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: '12px' }}>
                            {event.hostAvatar}
                          </Avatar>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            Host: {event.host}
                          </Typography>
                        </Box>
                        <Chip 
                          label={event.price} 
                          size="small" 
                          sx={{ 
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#10b981',
                            fontSize: '10px'
                          }} 
                        />
                      </Box>

                      <Button 
                        fullWidth 
                        variant="contained"
                        onClick={() => handleBookEvent(event)}
                        startIcon={<Calendar size={18} />}
                        sx={{ 
                          background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                          color: 'white',
                          fontWeight: 600,
                          py: 1.5,
                          mt: 1,
                          boxShadow: '0 4px 12px rgba(242, 159, 5, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                            boxShadow: '0 6px 20px rgba(242, 159, 5, 0.4)',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        Event buchen
                      </Button>
                    </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
              )}
            </motion.div>
          </Grid>

          {/* Upcoming Events */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Paper elevation={0} sx={{
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.12) 0%, rgba(140, 29, 4, 0.08) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                borderRadius: 3,
                p: 3,
                height: 'fit-content',
                position: 'sticky',
                top: 100
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Calendar size={24} color="#F29F05" />
                  <Typography variant="h5" sx={{ ml: 2, fontWeight: 600, color: '#F29F05' }}>Deine Events</Typography>
                </Box>
                
                {upcomingEvents.map((event, index) => (
                  <Box key={event.id} sx={{ mb: 3, p: 2, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ 
                        width: 40,
                        height: 40,
                        fontSize: '16px',
                        mr: 2,
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)'
                      }}>
                        📅
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {event.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          {event.date} um {event.time}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Chip 
                        label={event.status} 
                        size="small" 
                        sx={{ 
                          background: event.status === 'Bestätigt' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: event.status === 'Bestätigt' ? '#10b981' : '#f59e0b',
                          fontSize: '10px'
                        }} 
                      />
                      {event.meetingLink && (
                        <Button
                          size="small"
                          startIcon={<Video size={16} />}
                          sx={{ 
                            color: '#F29F05',
                            fontSize: '12px',
                            minWidth: 'auto',
                            '&:hover': {
                              background: 'rgba(242, 159, 5, 0.1)'
                            }
                          }}
                        >
                          Beitreten
                        </Button>
                      )}
                    </Box>
                  </Box>
                ))}
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
          </Container>
          </Box>
        </PageLayout>

      {/* Booking Dialog */}
      <Dialog 
        open={bookingDialog} 
        onClose={() => setBookingDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(26, 26, 46, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
          color: 'white',
          fontWeight: 600
        }}>
          Event buchen
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedEvent && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {selectedEvent.title}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {selectedEvent.description}
              </Typography>
            </Box>
          )}
          
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Möchten Sie dieses exklusive Event buchen? Sie erhalten eine Bestätigung per E-Mail.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setBookingDialog(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            Abbrechen
          </Button>
          <Button 
            onClick={handleConfirmBooking}
            variant="contained"
            sx={{ 
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #8C1D04, #F29F05)'
              }
            }}
          >
            Event buchen
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </ProtectedRoute>
  );
}
