"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Grid, List, ListItem, ListItemIcon, ListItemText, Divider, Avatar, Badge, LinearProgress, Switch, FormControlLabel, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Users, Star, Zap, Eye, Moon, Flame, RotateCcw, Share2, Bookmark, Plus, Edit, Trash2, Download, Upload, Settings, Bell, AlertCircle, CheckCircle, ArrowRight, ArrowLeft, Heart } from 'lucide-react';
import { useNotifications } from './NotificationService';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  type: 'personal' | 'work' | 'hd_transit' | 'moon_phase' | 'workshop' | 'coaching' | 'community';
  category: 'energy' | 'relationships' | 'career' | 'spirituality' | 'health' | 'creativity';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  attendees?: string[];
  isRecurring: boolean;
  recurrencePattern?: string;
  reminder: number; // minutes before
  isSynced: boolean;
  source: 'local' | 'google' | 'outlook' | 'apple' | 'hd_app';
  color: string;
  icon: string;
  hdType?: string;
  moonPhase?: string;
  transit?: string;
  energy?: string;
  recommendations?: string[];
}

interface TransitEvent {
  id: string;
  planet: string;
  gate: string;
  description: string;
  startTime: Date;
  endTime: Date;
  intensity: 'low' | 'medium' | 'high' | 'critical';
  impact: string[];
  recommendations: string[];
  color: string;
  icon: string;
}

interface MoonPhaseEvent {
  id: string;
  phase: string;
  description: string;
  startTime: Date;
  endTime: Date;
  energy: string;
  recommendations: string[];
  color: string;
  icon: string;
}

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    description: 'Wöchentliches Team-Meeting zur Projektbesprechung',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    type: 'work',
    category: 'career',
    priority: 'medium',
    location: 'Konferenzraum A',
    attendees: ['Sarah', 'Mike', 'Anna'],
    isRecurring: true,
    recurrencePattern: 'weekly',
    reminder: 15,
    isSynced: true,
    source: 'google',
    color: '#3B82F6',
    icon: '💼'
  },
  {
    id: '2',
    title: 'Vollmond-Meditation',
    description: 'Gruppenmeditation zur Vollmond-Energie',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    endTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // 25 hours from now
    type: 'moon_phase',
    category: 'spirituality',
    priority: 'high',
    location: 'Meditationszentrum',
    isRecurring: false,
    reminder: 30,
    isSynced: false,
    source: 'hd_app',
    color: '#8B5CF6',
    icon: '🌕',
    moonPhase: 'Vollmond',
    energy: 'Intensiv und leidenschaftlich',
    recommendations: [
      'Nutze die Intensität für wichtige Entscheidungen',
      'Vermeide Konflikte und Drama',
      'Fokussiere dich auf Manifestation'
    ]
  },
  {
    id: '3',
    title: 'Mars Transit Gate 10',
    description: 'Mars durchquert Gate 10 - Zeit für Selbstliebe und Authentizität',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    type: 'hd_transit',
    category: 'energy',
    priority: 'high',
    isRecurring: false,
    reminder: 60,
    isSynced: false,
    source: 'hd_app',
    color: '#EF4444',
    icon: '🔥',
    transit: 'Mars in Gate 10',
    energy: 'Selbstliebe und Authentizität',
    recommendations: [
      'Fokussiere dich auf Selbstliebe',
      'Sei authentisch in deinen Beziehungen',
      'Nutze die Energie für persönliches Wachstum'
    ]
  },
  {
    id: '4',
    title: 'Dating-Coaching Session',
    description: 'Persönliche Coaching-Session für Human Design Dating',
    startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // 5 days + 1 hour
    type: 'coaching',
    category: 'relationships',
    priority: 'medium',
    location: 'Online',
    isRecurring: false,
    reminder: 15,
    isSynced: true,
    source: 'outlook',
    color: '#EF4444',
    icon: '💖'
  }
];

const mockTransits: TransitEvent[] = [
  {
    id: '1',
    planet: 'Mars',
    gate: 'Gate 10',
    description: 'Mars durchquert Gate 10 - Zeit für Selbstliebe und Authentizität',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    intensity: 'high',
    impact: ['Selbstliebe', 'Authentizität', 'Persönliches Wachstum'],
    recommendations: [
      'Fokussiere dich auf Selbstliebe',
      'Sei authentisch in deinen Beziehungen',
      'Nutze die Energie für persönliches Wachstum'
    ],
    color: '#EF4444',
    icon: '🔥'
  },
  {
    id: '2',
    planet: 'Venus',
    gate: 'Gate 20',
    description: 'Venus durchquert Gate 20 - Zeit für Präsenz und Bewusstsein',
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    intensity: 'medium',
    impact: ['Präsenz', 'Bewusstsein', 'Beziehungen'],
    recommendations: [
      'Sei präsent in deinen Beziehungen',
      'Entwickle dein Bewusstsein',
      'Nutze die Energie für tiefe Verbindungen'
    ],
    color: '#8B5CF6',
    icon: '💖'
  }
];

const mockMoonPhases: MoonPhaseEvent[] = [
  {
    id: '1',
    phase: 'Vollmond',
    description: 'Vollmond-Energie für Manifestation und Vollendung',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 25 * 60 * 60 * 1000),
    energy: 'Intensiv und leidenschaftlich',
    recommendations: [
      'Nutze die Intensität für wichtige Entscheidungen',
      'Vermeide Konflikte und Drama',
      'Fokussiere dich auf Manifestation'
    ],
    color: '#F59E0B',
    icon: '🌕'
  },
  {
    id: '2',
    phase: 'Neumond',
    description: 'Neumond-Energie für Neuanfänge und neue Verbindungen',
    startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    energy: 'Introspektiv und aufrichtig',
    recommendations: [
      'Sei besonders aufrichtig und authentisch',
      'Fokussiere dich auf tiefe Gespräche',
      'Lass die Verbindung natürlich wachsen'
    ],
    color: '#1E293B',
    icon: '🌑'
  }
];

const getEventTypeIcon = (type: CalendarEvent['type']) => {
  switch (type) {
    case 'personal':
      return <Calendar size={20} />;
    case 'work':
      return <Users size={20} />;
    case 'hd_transit':
      return <Star size={20} />;
    case 'moon_phase':
      return <Moon size={20} />;
    case 'workshop':
      return <Star size={20} />;
    case 'coaching':
      return <Star size={20} />;
    case 'community':
      return <Users size={20} />;
    default:
      return <Calendar size={20} />;
  }
};

const getPriorityColor = (priority: CalendarEvent['priority']) => {
  switch (priority) {
    case 'low':
      return '#22c55e';
    case 'medium':
      return '#f59e0b';
    case 'high':
      return '#ef4444';
    case 'critical':
      return '#dc2626';
    default:
      return '#6b7280';
  }
};

const getIntensityColor = (intensity: TransitEvent['intensity']) => {
  switch (intensity) {
    case 'low':
      return '#22c55e';
    case 'medium':
      return '#f59e0b';
    case 'high':
      return '#ef4444';
    case 'critical':
      return '#dc2626';
    default:
      return '#6b7280';
  }
};

const getCategoryIcon = (category: CalendarEvent['category']) => {
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

export default function CalendarSyncSystem() {
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [transits, setTransits] = useState<TransitEvent[]>(mockTransits);
  const [moonPhases, setMoonPhases] = useState<MoonPhaseEvent[]>(mockMoonPhases);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showTransits, setShowTransits] = useState(true);
  const [showMoonPhases, setShowMoonPhases] = useState(true);
  const [syncSettings, setSyncSettings] = useState({
    google: false,
    outlook: false,
    apple: false,
    autoSync: true,
    transitNotifications: true,
    moonPhaseNotifications: true
  });
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Load saved events
    const saved = localStorage.getItem('saved-calendar-events');
    if (saved) {
      setSavedEvents(JSON.parse(saved));
    }

    // Load sync settings
    const settings = localStorage.getItem('calendar-sync-settings');
    if (settings) {
      setSyncSettings(JSON.parse(settings));
    }
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'all' || event.type === filterType;
    const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
    return matchesType && matchesCategory;
  });

  const handleEventSelect = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleAddEvent = () => {
    setShowAddEvent(true);
  };

  const handleSaveEvent = (eventId: string) => {
    const newSaved = [...savedEvents, eventId];
    setSavedEvents(newSaved);
    localStorage.setItem('saved-calendar-events', JSON.stringify(newSaved));
    
    addNotification({
      type: 'success',
      title: '💾 Gespeichert',
      message: 'Event wurde zu deinen Favoriten hinzugefügt!',
    });
  };

  const handleSyncSettings = (setting: string, value: boolean) => {
    const newSettings = { ...syncSettings, [setting]: value };
    setSyncSettings(newSettings);
    localStorage.setItem('calendar-sync-settings', JSON.stringify(newSettings));
    
    addNotification({
      type: 'success',
      title: '⚙️ Einstellungen gespeichert',
      message: 'Deine Sync-Einstellungen wurden aktualisiert!',
    });
  };

  const handleSyncCalendar = (source: string) => {
    addNotification({
      type: 'info',
      title: '🔄 Synchronisation gestartet',
      message: `Synchronisiere mit ${source}...`,
    });
    
    // Simulate sync
    setTimeout(() => {
      addNotification({
        type: 'success',
        title: '✅ Synchronisation abgeschlossen',
        message: `Kalender erfolgreich mit ${source} synchronisiert!`,
      });
    }, 2000);
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
    
    if (diff < 0) return 'Bereits vorbei';
    
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
      {/* Sync Settings */}
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
          <Typography variant="h6" sx={{ color: 'text.primary', mb: 3, fontWeight: 600 }}>
            🔄 Kalender-Synchronisation
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                📅 Externe Kalender:
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={syncSettings.google}
                        onChange={(e) => handleSyncSettings('google', e.target.checked)}
                      />
                    }
                    label="Google Calendar"
                  />
                  {syncSettings.google && (
                    <Button
                      size="small"
                      onClick={() => handleSyncCalendar('Google Calendar')}
                      sx={{ ml: 2 }}
                    >
                      <RotateCcw size={16} />
                    </Button>
                  )}
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={syncSettings.outlook}
                        onChange={(e) => handleSyncSettings('outlook', e.target.checked)}
                      />
                    }
                    label="Outlook Calendar"
                  />
                  {syncSettings.outlook && (
                    <Button
                      size="small"
                      onClick={() => handleSyncCalendar('Outlook Calendar')}
                      sx={{ ml: 2 }}
                    >
                      <RotateCcw size={16} />
                    </Button>
                  )}
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={syncSettings.apple}
                        onChange={(e) => handleSyncSettings('apple', e.target.checked)}
                      />
                    }
                    label="Apple Calendar"
                  />
                  {syncSettings.apple && (
                    <Button
                      size="small"
                      onClick={() => handleSyncCalendar('Apple Calendar')}
                      sx={{ ml: 2 }}
                    >
                      <RotateCcw size={16} />
                    </Button>
                  )}
                </ListItem>
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                🔔 Benachrichtigungen:
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={syncSettings.autoSync}
                        onChange={(e) => handleSyncSettings('autoSync', e.target.checked)}
                      />
                    }
                    label="Automatische Synchronisation"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={syncSettings.transitNotifications}
                        onChange={(e) => handleSyncSettings('transitNotifications', e.target.checked)}
                      />
                    }
                    label="Transit-Benachrichtigungen"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={syncSettings.moonPhaseNotifications}
                        onChange={(e) => handleSyncSettings('moonPhaseNotifications', e.target.checked)}
                      />
                    }
                    label="Mondphasen-Benachrichtigungen"
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Card>
      </motion.div>

      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.2)',
          p: 3,
          mb: 4
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
              🔍 Filter
            </Typography>
            <Button
              variant="contained"
              onClick={handleAddEvent}
              startIcon={<Plus size={16} />}
            >
              Event hinzufügen
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label="Alle Events"
              onClick={() => setFilterType('all')}
              color={filterType === 'all' ? 'primary' : 'default'}
              variant={filterType === 'all' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Persönlich"
              onClick={() => setFilterType('personal')}
              color={filterType === 'personal' ? 'primary' : 'default'}
              variant={filterType === 'personal' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Arbeit"
              onClick={() => setFilterType('work')}
              color={filterType === 'work' ? 'primary' : 'default'}
              variant={filterType === 'work' ? 'filled' : 'outlined'}
            />
            <Chip
              label="HD Transite"
              onClick={() => setFilterType('hd_transit')}
              color={filterType === 'hd_transit' ? 'primary' : 'default'}
              variant={filterType === 'hd_transit' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Mondphasen"
              onClick={() => setFilterType('moon_phase')}
              color={filterType === 'moon_phase' ? 'primary' : 'default'}
              variant={filterType === 'moon_phase' ? 'filled' : 'outlined'}
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
                      {event.isSynced && (
                        <Badge
                          badgeContent="SYNC"
                          color="success"
                          sx={{
                            '& .MuiBadge-badge': {
                              fontSize: '0.6rem',
                              fontWeight: 600,
                            },
                          }}
                        />
                      )}
                    </Box>

                    {/* Event Description */}
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.4 }}>
                      {event.description}
                    </Typography>

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
                        label={event.priority}
                        size="small"
                        sx={{
                          backgroundColor: `${getPriorityColor(event.priority)}20`,
                          color: getPriorityColor(event.priority),
                          fontSize: '0.7rem',
                        }}
                      />
                      <Chip
                        icon={getCategoryIcon(event.category)}
                        label={event.category}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          color: 'text.primary',
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>

                    {/* Time Until Event */}
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      {getTimeUntilEvent(event.startTime)}
                    </Typography>

                    {/* HD Specific Info */}
                    {event.transit && (
                      <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                          🔥 Transit: {event.transit}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {event.energy}
                        </Typography>
                      </Box>
                    )}

                    {event.moonPhase && (
                      <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                          🌙 {event.moonPhase}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {event.energy}
                        </Typography>
                      </Box>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => handleEventSelect(event)}
                        sx={{
                          flex: 1,
                          backgroundColor: event.color,
                          '&:hover': {
                            backgroundColor: event.color,
                            opacity: 0.9,
                          },
                        }}
                      >
                        Details
                      </Button>
                      <IconButton
                        onClick={() => handleSaveEvent(event.id)}
                        sx={{ color: savedEvents.includes(event.id) ? 'primary.main' : 'text.secondary' }}
                      >
                        <Bookmark size={16} />
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
            {selectedEvent?.type} • {selectedEvent?.priority} • {formatTime(selectedEvent?.startTime || new Date())}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6, textAlign: 'center' }}>
            {selectedEvent?.description}
          </Typography>

          <Grid container spacing={3}>
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
                    <Clock size={16} color="#8B5CF6" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Endzeit" 
                    secondary={selectedEvent ? formatTime(selectedEvent.endTime) : ''} 
                  />
                </ListItem>
                {selectedEvent?.location && (
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Calendar size={16} color="#8B5CF6" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Ort" 
                      secondary={selectedEvent.location} 
                    />
                  </ListItem>
                )}
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Bell size={16} color="#8B5CF6" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Erinnerung" 
                    secondary={`${selectedEvent?.reminder} Min vorher`} 
                  />
                </ListItem>
              </List>
            </Grid>

            {/* HD Specific Info */}
            <Grid item xs={12} md={6}>
              {selectedEvent?.transit && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    🔥 Transit-Informationen:
                  </Typography>
                  <Box sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                      {selectedEvent.transit}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      {selectedEvent.energy}
                    </Typography>
                    {selectedEvent.recommendations && (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                          Empfehlungen:
                        </Typography>
                        {selectedEvent.recommendations.map((rec, index) => (
                          <Typography key={index} variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                            • {rec}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {selectedEvent?.moonPhase && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    🌙 Mondphasen-Informationen:
                  </Typography>
                  <Box sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                      {selectedEvent.moonPhase}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      {selectedEvent.energy}
                    </Typography>
                    {selectedEvent.recommendations && (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}>
                          Empfehlungen:
                        </Typography>
                        {selectedEvent.recommendations.map((rec, index) => (
                          <Typography key={index} variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                            • {rec}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Box>
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setShowEventDetails(false)} variant="contained">
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
