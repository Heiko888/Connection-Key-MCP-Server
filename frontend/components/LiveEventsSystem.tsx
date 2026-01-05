"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Grid, List, ListItem, ListItemIcon, ListItemText, Divider, Avatar, Badge, LinearProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, Clock, Video, Mic, Heart, Star, Zap, Eye, Moon, Flame, RotateCcw, Share2, Bookmark, Play, Pause, Volume2, VolumeX, Settings, MessageCircle, ThumbsUp, ThumbsDown, Send, CheckCircle } from 'lucide-react';
import { useNotifications } from './NotificationService';

interface LiveEvent {
  id: string;
  title: string;
  description: string;
  type: 'workshop' | 'q&a' | 'meditation' | 'coaching' | 'community';
  category: 'energy' | 'relationships' | 'career' | 'spirituality' | 'health' | 'creativity';
  host: {
    name: string;
    avatar: string;
    hdType: string;
    profile: string;
    bio: string;
  };
  startTime: Date;
  duration: number; // in minutes
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  currency: string;
  isLive: boolean;
  isUpcoming: boolean;
  isRecorded: boolean;
  tags: string[];
  requirements: string[];
  benefits: string[];
  agenda: string[];
  color: string;
  icon: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  language: string;
  recordingUrl?: string;
  chatEnabled: boolean;
  qaEnabled: boolean;
  pollsEnabled: boolean;
}

interface EventParticipant {
  id: string;
  name: string;
  avatar: string;
  hdType: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  joinedAt: Date;
}

const mockEvents: LiveEvent[] = [
  {
    id: '1',
    title: 'Generator Energie-Meister Workshop',
    description: 'Lerne deine sakrale Energie optimal zu nutzen und authentisch zu leben. In diesem interaktiven Workshop entdeckst du deine natürlichen Energie-Zyklen.',
    type: 'workshop',
    category: 'energy',
    host: {
      name: 'Sarah Miller',
      avatar: '/images/sarah.jpg',
      hdType: 'Generator',
      profile: '2/4',
      bio: 'Human Design Expertin mit 10+ Jahren Erfahrung'
    },
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    duration: 90,
    maxParticipants: 50,
    currentParticipants: 23,
    price: 29.99,
    currency: 'EUR',
    isLive: false,
    isUpcoming: true,
    isRecorded: false,
    tags: ['Generator', 'Energie', 'Workshop', 'Sakrale Autorität'],
    requirements: ['Human Design Grundlagen', 'Stift und Papier', 'Ruhige Umgebung'],
    benefits: ['Bessere Energie-Wahrnehmung', 'Authentische Entscheidungen', 'Work-Life-Balance'],
    agenda: [
      'Begrüßung und Vorstellung (10 Min)',
      'Energie-Bewusstsein entwickeln (20 Min)',
      'Sakrale Antworten verstehen (25 Min)',
      'Praktische Übungen (20 Min)',
      'Q&A Session (15 Min)'
    ],
    color: '#10B981',
    icon: '⚡',
    level: 'intermediate',
    language: 'Deutsch',
    chatEnabled: true,
    qaEnabled: true,
    pollsEnabled: true
  },
  {
    id: '2',
    title: 'Dating nach Human Design - Q&A Session',
    description: 'Stelle deine Fragen zum Dating und zu Beziehungen basierend auf Human Design. Unsere Experten beantworten alle deine Fragen live.',
    type: 'q&a',
    category: 'relationships',
    host: {
      name: 'Dr. Michael Chen',
      avatar: '/images/michael.jpg',
      hdType: 'Projector',
      profile: '3/5',
      bio: 'Beziehungsexperte und Human Design Berater'
    },
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    duration: 60,
    maxParticipants: 100,
    currentParticipants: 67,
    price: 0,
    currency: 'EUR',
    isLive: false,
    isUpcoming: true,
    isRecorded: false,
    tags: ['Dating', 'Beziehungen', 'Q&A', 'Kompatibilität'],
    requirements: ['Interesse an Human Design Dating'],
    benefits: ['Persönliche Fragen beantwortet', 'Dating-Tipps', 'Kompatibilitäts-Verständnis'],
    agenda: [
      'Begrüßung (5 Min)',
      'Q&A Session (50 Min)',
      'Zusammenfassung (5 Min)'
    ],
    color: '#EF4444',
    icon: '💖',
    level: 'all',
    language: 'Deutsch',
    chatEnabled: true,
    qaEnabled: true,
    pollsEnabled: false
  },
  {
    id: '3',
    title: 'Mondkalender-Meditation für Reflectors',
    description: 'Eine speziell für Reflectors entwickelte Meditation, die mit den Mondzyklen synchronisiert ist. Entdecke deine einzigartige Sensibilität.',
    type: 'meditation',
    category: 'spirituality',
    host: {
      name: 'Luna Rodriguez',
      avatar: '/images/luna.jpg',
      hdType: 'Reflector',
      profile: '4/6',
      bio: 'Meditationslehrerin und Reflector-Expertin'
    },
    startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    duration: 45,
    maxParticipants: 30,
    currentParticipants: 18,
    price: 15.99,
    currency: 'EUR',
    isLive: true,
    isUpcoming: false,
    isRecorded: true,
    tags: ['Meditation', 'Reflector', 'Mondkalender', 'Spiritualität'],
    requirements: ['Ruhige Umgebung', 'Meditationskissen (optional)', 'Decke'],
    benefits: ['Tiefe Entspannung', 'Mondenergie-Verständnis', 'Reflector-Wisdom'],
    agenda: [
      'Begrüßung und Einführung (5 Min)',
      'Mondenergie-Verbindung (10 Min)',
      'Reflector-Meditation (25 Min)',
      'Integration und Sharing (5 Min)'
    ],
    color: '#06B6D4',
    icon: '🌙',
    level: 'beginner',
    language: 'Deutsch',
    recordingUrl: '/recordings/reflector-meditation-2024-01-15.mp4',
    chatEnabled: true,
    qaEnabled: false,
    pollsEnabled: false
  },
  {
    id: '4',
    title: 'Manifestor Power Session',
    description: 'Entdecke deine Manifestor-Kraft und lerne, wie du deine Initiative optimal nutzt. Für alle Manifestors, die ihre Power entfalten wollen.',
    type: 'coaching',
    category: 'career',
    host: {
      name: 'Alex Thunder',
      avatar: '/images/alex.jpg',
      hdType: 'Manifestor',
      profile: '1/3',
      bio: 'Business-Coach und Manifestor-Experte'
    },
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    duration: 120,
    maxParticipants: 25,
    currentParticipants: 12,
    price: 49.99,
    currency: 'EUR',
    isLive: false,
    isUpcoming: true,
    isRecorded: false,
    tags: ['Manifestor', 'Power', 'Coaching', 'Karriere'],
    requirements: ['Manifestor Human Design', 'Notizbuch', 'Offenheit für Veränderung'],
    benefits: ['Manifestor-Power verstehen', 'Initiative entwickeln', 'Karriere-Strategien'],
    agenda: [
      'Manifestor-Energie verstehen (30 Min)',
      'Power-Übungen (40 Min)',
      'Karriere-Strategien (30 Min)',
      'Q&A und Networking (20 Min)'
    ],
    color: '#F59E0B',
    icon: '🔥',
    level: 'advanced',
    language: 'Deutsch',
    chatEnabled: true,
    qaEnabled: true,
    pollsEnabled: true
  }
];

const getEventTypeIcon = (type: LiveEvent['type']) => {
  switch (type) {
    case 'workshop':
      return <Video size={20} />;
    case 'q&a':
      return <MessageCircle size={20} />;
    case 'meditation':
      return <Heart size={20} />;
    case 'coaching':
      return <Star size={20} />;
    case 'community':
      return <Users size={20} />;
    default:
      return <Calendar size={20} />;
  }
};

const getCategoryIcon = (category: LiveEvent['category']) => {
  switch (category) {
    case 'energy':
      return <Zap size={16} />;
    case 'relationships':
      return <Heart size={16} />;
    case 'career':
      return <Star size={16} />;
    case 'spirituality':
      return <Moon size={16} />;
    case 'health':
      return <Heart size={16} />;
    case 'creativity':
      return <Star size={16} />;
    default:
      return <Star size={16} />;
  }
};

const getLevelColor = (level: LiveEvent['level']) => {
  switch (level) {
    case 'beginner':
      return '#22c55e';
    case 'intermediate':
      return '#f59e0b';
    case 'advanced':
      return '#8b5cf6';
    case 'all':
      return '#6b7280';
    default:
      return '#6b7280';
  }
};

const getHdTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'generator':
      return <Zap size={16} />;
    case 'projector':
      return <Eye size={16} />;
    case 'manifestor':
      return <Flame size={16} />;
    case 'reflector':
      return <Moon size={16} />;
    default:
      return <Users size={16} />;
  }
};

const getHdTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'generator':
      return '#10B981';
    case 'projector':
      return '#8B5CF6';
    case 'manifestor':
      return '#F59E0B';
    case 'reflector':
      return '#06B6D4';
    default:
      return '#6B7280';
  }
};

export default function LiveEventsSystem() {
  const [events, setEvents] = useState<LiveEvent[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showLiveEvent, setShowLiveEvent] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, user: string, message: string, timestamp: Date}>>([]);
  const [newMessage, setNewMessage] = useState('');
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Load saved events
    const saved = localStorage.getItem('saved-live-events');
    if (saved) {
      setSavedEvents(JSON.parse(saved));
    }

    // Simulate live event updates
    const interval = setInterval(() => {
      setEvents(prev => prev.map(event => ({
        ...event,
        currentParticipants: Math.max(0, event.currentParticipants + Math.floor(Math.random() * 3) - 1)
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    return matchesType && matchesCategory;
  });

  const handleEventSelect = (event: LiveEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleJoinEvent = (event: LiveEvent) => {
    if (event.isLive) {
      setSelectedEvent(event);
      setShowLiveEvent(true);
      addNotification({
        type: 'success',
        title: '🎉 Event beigetreten!',
        message: `Du bist dem ${event.title} beigetreten!`,
      });
    } else {
      addNotification({
        type: 'info',
        title: '⏰ Event geplant',
        message: `Du wirst benachrichtigt, wenn ${event.title} startet!`,
      });
    }
  };

  const handleSaveEvent = (eventId: string) => {
    const newSaved = [...savedEvents, eventId];
    setSavedEvents(newSaved);
    localStorage.setItem('saved-live-events', JSON.stringify(newSaved));
    
    addNotification({
      type: 'success',
      title: '💾 Gespeichert',
      message: 'Event wurde zu deinen Favoriten hinzugefügt!',
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now().toString(),
      user: 'Du',
      message: newMessage,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeUntilEvent = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff < 0) return 'Bereits gestartet';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `in ${days} Tag${days > 1 ? 'en' : ''}`;
    if (hours > 0) return `in ${hours} Stunde${hours > 1 ? 'n' : ''}`;
    if (minutes > 0) return `in ${minutes} Minute${minutes > 1 ? 'n' : ''}`;
    return 'Startet jetzt!';
  };

  return (
    <Box>
      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.2)',
          p: 3,
          mb: 4
        }}>
          <Typography variant="h6" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>
            🔍 Filter
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label="Alle Events"
              onClick={() => setFilterType('all')}
              color={filterType === 'all' ? 'primary' : 'default'}
              variant={filterType === 'all' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Workshops"
              onClick={() => setFilterType('workshop')}
              color={filterType === 'workshop' ? 'primary' : 'default'}
              variant={filterType === 'workshop' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Q&A Sessions"
              onClick={() => setFilterType('q&a')}
              color={filterType === 'q&a' ? 'primary' : 'default'}
              variant={filterType === 'q&a' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Meditationen"
              onClick={() => setFilterType('meditation')}
              color={filterType === 'meditation' ? 'primary' : 'default'}
              variant={filterType === 'meditation' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Coaching"
              onClick={() => setFilterType('coaching')}
              color={filterType === 'coaching' ? 'primary' : 'default'}
              variant={filterType === 'coaching' ? 'filled' : 'outlined'}
            />
          </Box>
        </Card>
      </motion.div>

      {/* Events Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Grid container spacing={3}>
          {filteredEvents.map((event, index) => (
            <Grid item xs={12} md={6} lg={4} key={event.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${event.color}15, ${event.color}05)`,
                    border: `1px solid ${event.color}30`,
                    borderRadius: 3,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 30px ${event.color}20`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Event Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="h3">
                        {event.icon}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                          {event.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getEventTypeIcon(event.type)}
                          <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                            {event.type}
                          </Typography>
                        </Box>
                      </Box>
                      {event.isLive && (
                        <Badge
                          badgeContent="LIVE"
                          color="error"
                          sx={{
                            '& .MuiBadge-badge': {
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              animation: 'pulse 2s infinite',
                            },
                          }}
                        />
                      )}
                    </Box>

                    {/* Event Description */}
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.4 }}>
                      {event.description}
                    </Typography>

                    {/* Host Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        src={event.host.avatar}
                        sx={{ width: 32, height: 32 }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {event.host.name}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {getHdTypeIcon(event.host.hdType)}
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {event.host.hdType} {event.host.profile}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Event Details */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<Clock size={16} />}
                        label={formatTime(event.startTime)}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          color: 'text.primary',
                          fontSize: '0.7rem',
                        }}
                      />
                      <Chip
                        icon={<Users size={16} />}
                        label={`${event.currentParticipants}/${event.maxParticipants}`}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          color: 'text.primary',
                          fontSize: '0.7rem',
                        }}
                      />
                      <Chip
                        label={event.level}
                        size="small"
                        sx={{
                          backgroundColor: `${getLevelColor(event.level)}20`,
                          color: getLevelColor(event.level),
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>

                    {/* Price and Status */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: event.price === 0 ? 'success.main' : 'text.primary' }}>
                        {event.price === 0 ? 'Kostenlos' : `${event.price} ${event.currency}`}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {getTimeUntilEvent(event.startTime)}
                      </Typography>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => handleJoinEvent(event)}
                        disabled={!event.isLive && !event.isUpcoming}
                        sx={{
                          flex: 1,
                          backgroundColor: event.color,
                          '&:hover': {
                            backgroundColor: event.color,
                            opacity: 0.9,
                          },
                        }}
                      >
                        {event.isLive ? 'Beitreten' : event.isUpcoming ? 'Anmelden' : 'Aufzeichnung'}
                      </Button>
                      <IconButton
                        onClick={() => handleSaveEvent(event.id)}
                        sx={{ color: savedEvents.includes(event.id) ? 'primary.main' : 'text.secondary' }}
                      >
                        <Bookmark size={16} />
                      </IconButton>
                      <IconButton
                        onClick={() => handleEventSelect(event)}
                        sx={{ color: 'text.secondary' }}
                      >
                        <Star size={16} />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Event Details Dialog */}
      <Dialog
        open={showEventDetails}
        onClose={() => setShowEventDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            {selectedEvent?.icon} {selectedEvent?.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {selectedEvent?.type} • {selectedEvent?.level} • {selectedEvent?.duration} Min
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6, textAlign: 'center' }}>
            {selectedEvent?.description}
          </Typography>

          <Grid container spacing={3}>
            {/* Host Info */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                👤 Host:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar
                  src={selectedEvent?.host.avatar}
                  sx={{ width: 48, height: 48 }}
                />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedEvent?.host.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getHdTypeIcon(selectedEvent?.host.hdType || '')}
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {selectedEvent?.host.hdType} {selectedEvent?.host.profile}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {selectedEvent?.host.bio}
              </Typography>
            </Grid>

            {/* Event Info */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                📅 Event-Details:
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Clock size={16} color="#8B5CF6" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Startzeit" 
                    secondary={selectedEvent ? formatTime(selectedEvent.startTime) : ''} 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Users size={16} color="#8B5CF6" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Teilnehmer" 
                    secondary={`${selectedEvent?.currentParticipants}/${selectedEvent?.maxParticipants}`} 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Star size={16} color="#8B5CF6" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Level" 
                    secondary={selectedEvent?.level} 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <MessageCircle size={16} color="#8B5CF6" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sprache" 
                    secondary={selectedEvent?.language} 
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Agenda */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                📋 Agenda:
              </Typography>
              <List dense>
                {selectedEvent?.agenda.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Typography variant="body2" sx={{ 
                        color: 'primary.main', 
                        fontWeight: 600,
                        minWidth: 24,
                        textAlign: 'center'
                      }}>
                        {index + 1}
                      </Typography>
                    </ListItemIcon>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Benefits */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: 'success.main' }}>
                ✅ Vorteile:
              </Typography>
              <List dense>
                {selectedEvent?.benefits.map((benefit, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Star size={16} color="#22c55e" />
                    </ListItemIcon>
                    <ListItemText primary={benefit} />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Requirements */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: 'warning.main' }}>
                📋 Voraussetzungen:
              </Typography>
              <List dense>
                {selectedEvent?.requirements.map((req, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle size={16} color="#f59e0b" />
                    </ListItemIcon>
                    <ListItemText primary={req} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={() => {
              if (selectedEvent) {
                handleJoinEvent(selectedEvent);
                setShowEventDetails(false);
              }
            }} 
            variant="contained"
            sx={{
              backgroundColor: selectedEvent?.color,
              '&:hover': {
                backgroundColor: selectedEvent?.color,
                opacity: 0.9,
              },
            }}
          >
            {selectedEvent?.isLive ? 'Beitreten' : selectedEvent?.isUpcoming ? 'Anmelden' : 'Aufzeichnung ansehen'}
          </Button>
          <Button onClick={() => setShowEventDetails(false)} variant="outlined">
            Schließen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Live Event Dialog */}
      <Dialog
        open={showLiveEvent}
        onClose={() => setShowLiveEvent(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h5" sx={{ mb: 1 }}>
            {selectedEvent?.icon} {selectedEvent?.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            LIVE • {selectedEvent?.currentParticipants} Teilnehmer
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0, height: '100%' }}>
          <Grid container sx={{ height: '100%' }}>
            {/* Video Area */}
            <Grid item xs={12} md={8} sx={{ height: '100%' }}>
              <Box sx={{
                height: '100%',
                background: 'linear-gradient(135deg, #0F0F23, #1A1A2E)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <Typography variant="h4" sx={{ color: 'white', textAlign: 'center' }}>
                  🎥 Live Video Stream
                  <br />
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {selectedEvent?.host.name} ist live
                  </Typography>
                </Typography>
                
                {/* Video Controls */}
                <Box sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  right: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={() => setIsMuted(!isMuted)}
                      sx={{ 
                        backgroundColor: 'rgba(0,0,0,0.5)', 
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                      }}
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </IconButton>
                    <IconButton
                      onClick={() => setIsVideoOn(!isVideoOn)}
                      sx={{ 
                        backgroundColor: 'rgba(0,0,0,0.5)', 
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                      }}
                    >
                      {isVideoOn ? <Video size={20} /> : <Video size={20} />}
                    </IconButton>
                    <IconButton
                      sx={{ 
                        backgroundColor: 'rgba(0,0,0,0.5)', 
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                      }}
                    >
                      <Settings size={20} />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      sx={{ 
                        backgroundColor: 'rgba(0,0,0,0.5)', 
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                      }}
                    >
                      <ThumbsUp size={20} />
                    </IconButton>
                    <IconButton
                      sx={{ 
                        backgroundColor: 'rgba(0,0,0,0.5)', 
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                      }}
                    >
                      <ThumbsDown size={20} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Chat Area */}
            <Grid item xs={12} md={4} sx={{ height: '100%', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Chat Header */}
                <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    💬 Chat
                  </Typography>
                </Box>

                {/* Chat Messages */}
                <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
                  <List dense>
                    {chatMessages.map((msg) => (
                      <ListItem key={msg.id} sx={{ px: 0, py: 0.5 }}>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {msg.user}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {msg.message}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>

                {/* Chat Input */}
                <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Nachricht schreiben..."
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.2)',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        outline: 'none'
                      }}
                    />
                    <IconButton
                      onClick={handleSendMessage}
                      sx={{ 
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': { backgroundColor: 'primary.dark' }
                      }}
                    >
                      <Send size={16} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
