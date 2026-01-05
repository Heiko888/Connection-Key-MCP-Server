"use client";

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Container,
  Grid,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import { 
  Heart, 
  MessageCircle, 
  MapPin, 
  Calendar,
  Users,
  Star,
  Filter,
  Search,
  Settings,
  Bell,
  MoreVertical,
  User,
  Shield,
  LogOut,
  HelpCircle,
  Info,
  Sparkles,
  Target,
  Activity,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  RefreshCw,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageLayout from '../components/PageLayout';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';

function DatingDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    ageRange: [18, 65],
    hdType: '',
    location: '',
    interests: [] as string[],
    compatibility: 0
  });

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Settings menu handlers
  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  // Filter handlers
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    console.log('Filter angewendet:', filters);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      ageRange: [18, 65],
      hdType: '',
      location: '',
      interests: [],
      compatibility: 0
    });
  };

  // TODO: ERSETZEN DURCH API-CALL - Dating-Dashboard mit echten Daten
  // Siehe: SYSTEMBEREINIGUNG-UND-PLAN.md - Priorität 2
  // API-Route: /api/dating/matches
  // Mock data for dashboard
  const existingMatches = [
    {
      id: 1,
      name: "Sarah",
      age: 28,
      type: "Generator",
      profile: "1/3",
      distance: "2 km",
      lastActive: "vor 2 Stunden",
      compatibility: 95,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      interests: ["Yoga", "Reisen", "Kochen"]
    },
    {
      id: 2,
      name: "Marcus",
      age: 32,
      type: "Projector",
      profile: "2/4",
      distance: "5 km",
      lastActive: "vor 1 Tag",
      compatibility: 88,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      interests: ["Musik", "Fotografie", "Natur"]
    },
    {
      id: 3,
      name: "Emma",
      age: 25,
      type: "Manifesting Generator",
      profile: "3/5",
      distance: "8 km",
      lastActive: "vor 3 Stunden",
      compatibility: 92,
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      interests: ["Tanzen", "Kunst", "Wellness"]
    }
  ];

  // TODO: ERSETZEN DURCH API-CALL - Events-System implementieren
  // API-Route: /api/events
  const events = [
    {
      id: 1,
      title: "Human Design Meetup",
      date: "15. Jan 2025",
      time: "19:00",
      location: "Berlin Mitte",
      attendees: 24,
      type: "Meetup"
    },
    {
      id: 2,
      title: "Reiki & Human Design Workshop",
      date: "22. Jan 2025",
      time: "14:00",
      location: "Hamburg Altona",
      attendees: 12,
      type: "Workshop"
    },
    {
      id: 3,
      title: "Dating & Energie Workshop",
      date: "28. Jan 2025",
      time: "18:30",
      location: "München Schwabing",
      attendees: 18,
      type: "Workshop"
    }
  ];

  // TODO: ERSETZEN DURCH API-CALL - Statistiken aus Datenbank berechnen
  // API-Route: /api/dating/stats
  const stats = [
    { label: "Verbindungen", value: "12", icon: <Heart size={24} />, color: "#8C1D04" },
    { label: "Gespräche", value: "8", icon: <MessageCircle size={24} />, color: "#F29F05" },
    { label: "Begegnungen", value: "3", icon: <Calendar size={24} />, color: "#F29F05" },
    { label: "Resonanz", value: "94%", icon: <Star size={24} />, color: "#F29F05" }
  ];

  const tabs = [
    { id: 'overview', label: 'Übersicht', icon: <Activity size={20} /> },
    { id: 'matches', label: 'Verbindungen', icon: <Heart size={20} /> },
    { id: 'messages', label: 'Gespräche', icon: <MessageCircle size={20} /> },
    { id: 'events', label: 'Begegnungen', icon: <Calendar size={20} /> },
    { id: 'swipe', label: 'Entdecken', icon: <Target size={20} /> },
    { id: 'match-tips', label: 'Match Tipps', icon: <Sparkles size={20} /> }
  ];

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
      {/* Resonanz-Animationen */}
      {isClient && (
        <>
          {/* Pulsierende Resonanz-Kreise (Wellen-Effekt) */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={`resonance-wave-${i}`}
              style={{
                position: 'absolute',
                width: `${200 + i * 150}px`,
                height: `${200 + i * 150}px`,
                borderRadius: '50%',
                border: `2px solid rgba(242, 159, 5, ${0.3 - i * 0.04})`,
                left: `${15 + i * 12}%`,
                top: `${10 + i * 8}%`,
                pointerEvents: 'none',
                zIndex: 0,
              }}
              animate={{
                scale: [1, 2.5, 1],
                opacity: [0.4, 0, 0.4],
              }}
              transition={{
                duration: 4 + i * 0.8,
                repeat: Infinity,
                ease: 'easeOut',
                delay: i * 0.6,
              }}
            />
          ))}

          {/* Pulsierende Energiepunkte (Resonanz-Zentren) */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={`resonance-point-${i}`}
              style={{
                position: 'absolute',
                width: `${8 + (i % 3) * 4}px`,
                height: `${8 + (i % 3) * 4}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle, rgba(242, 159, 5, ${0.8 - (i % 3) * 0.2}), rgba(140, 29, 4, ${0.4 - (i % 3) * 0.1}))`,
                left: `${20 + (i * 11) % 60}%`,
                top: `${15 + (i * 13) % 70}%`,
                pointerEvents: 'none',
                zIndex: 1,
                boxShadow: `0 0 ${10 + (i % 3) * 5}px rgba(242, 159, 5, 0.6)`,
              }}
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2.5 + (i % 3) * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            />
          ))}

          {/* Verbindungslinien zwischen Resonanz-Punkten */}
          {Array.from({ length: 4 }).map((_, i) => {
            const startX = 20 + (i * 15) % 50;
            const startY = 20 + (i * 12) % 50;
            const endX = startX + 20 + (i * 5);
            const endY = startY + 15 + (i * 3);
            const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
            const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);
            
            return (
              <motion.div
                key={`resonance-line-${i}`}
                style={{
                  position: 'absolute',
                  width: `${distance}%`,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent, rgba(242, 159, 5, ${0.3 - i * 0.05}), transparent)`,
                  left: `${startX}%`,
                  top: `${startY}%`,
                  transformOrigin: 'left center',
                  transform: `rotate(${angle}deg)`,
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
                animate={{
                  opacity: [0.2, 0.6, 0.2],
                  scaleX: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.4,
                }}
              />
            );
          })}

          {/* Schwebende Resonanz-Partikel */}
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={`resonance-particle-${i}`}
              style={{
                position: 'absolute',
                width: `${3 + (i % 2)}px`,
                height: `${3 + (i % 2)}px`,
                borderRadius: '50%',
                background: i % 2 === 0 ? '#F29F05' : '#FFD700',
                left: `${10 + (i * 7) % 80}%`,
                top: `${20 + (i * 5) % 60}%`,
                pointerEvents: 'none',
                zIndex: 1,
                boxShadow: `0 0 ${5 + (i % 2) * 3}px ${i % 2 === 0 ? 'rgba(242, 159, 5, 0.8)' : 'rgba(255, 215, 0, 0.6)'}`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, (i % 2 === 0 ? 1 : -1) * 15, 0],
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 3.5 + (i % 3) * 0.7,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.25,
              }}
            />
          ))}

          {/* Pulsierende Resonanz-Zonen (große Energiebereiche) */}
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={`resonance-zone-${i}`}
              style={{
                position: 'absolute',
                width: `${300 + i * 200}px`,
                height: `${300 + i * 200}px`,
                borderRadius: '50%',
                background: `radial-gradient(circle, rgba(242, 159, 5, ${0.15 - i * 0.03}), transparent 70%)`,
                left: `${25 + i * 25}%`,
                top: `${30 + i * 20}%`,
                pointerEvents: 'none',
                zIndex: 0,
                filter: 'blur(20px)',
              }}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 6 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 1.5,
              }}
            />
          ))}
        </>
      )}

      <PageLayout activePage="dating" showLogo={true}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: { xs: '1.75rem', md: '2.25rem' },
                    mb: 1
                  }}
                >
                  Dein Resonanzraum
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)', 
                    fontSize: { xs: '0.9rem', md: '1rem' }
                  }}
                >
                  Begegne Menschen auf deiner Frequenz
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  component={Link}
                  href="/swipe"
                  variant="contained"
                  startIcon={<Heart size={20} />}
                  sx={{
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    color: 'white',
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    }
                  }}
                >
                  Entdecken
                </Button>
                <IconButton
                  onClick={handleSettingsClick}
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.1)',
                      borderColor: 'rgba(255,255,255,0.3)'
                    }
                  }}
                >
                  <Settings size={20} />
                </IconButton>
              </Box>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {stats.map((stat, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Card sx={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(242, 159, 5, 0.20)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      border: '1px solid rgba(242, 159, 5, 0.40)'
                    }
                  }}>
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        mb: 1,
                        color: stat.color
                      }}>
                        {stat.icon}
                      </Box>
                      <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                        {stat.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Tabs */}
            <Paper sx={{ 
              background: 'rgba(255,255,255,0.05)', 
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(242, 159, 5, 0.20)',
              mb: 3
            }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    color: 'rgba(255,255,255,0.7)',
                    fontWeight: 600,
                    textTransform: 'none',
                    minHeight: 64,
                    '&.Mui-selected': {
                      color: '#F29F05'
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#F29F05'
                  }
                }}
              >
                {tabs.map((tab, index) => (
                  <Tab 
                    key={tab.id}
                    icon={tab.icon}
                    iconPosition="start"
                    label={tab.label}
                  />
                ))}
              </Tabs>
            </Paper>
          </Box>

          {/* Tab Content */}
          {activeTab === 0 && (
            <Grid container spacing={3}>
              {/* Recent Matches */}
              <Grid item xs={12} md={8}>
                <Card sx={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(242, 159, 5, 0.20)',
                  borderRadius: 2
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                        Neue Resonanzen
                      </Typography>
                      <Button
                        component={Link}
                        href="/swipe"
                        size="small"
                        sx={{ color: '#F29F05', textTransform: 'none' }}
                      >
                        Alle anzeigen <ArrowRight size={16} style={{ marginLeft: 4 }} />
                      </Button>
                    </Box>
                    <Grid container spacing={2}>
                      {existingMatches.map((match) => (
                        <Grid item xs={12} sm={6} key={match.id}>
                          <Card sx={{
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid rgba(242, 159, 5, 0.15)',
                            borderRadius: 2,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              border: '1px solid rgba(242, 159, 5, 0.30)'
                            }
                          }}>
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Avatar 
                                  src={match.image} 
                                  sx={{ width: 50, height: 50, mr: 2 }}
                                />
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                                    {match.name}, {match.age}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                                    {match.type} • {match.profile}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                    <Star size={14} color="#F29F05" />
                                    <Typography variant="body2" sx={{ color: '#F29F05', ml: 0.5, fontSize: '0.85rem', fontWeight: 600 }}>
                                      {match.compatibility}%
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                {match.interests.slice(0, 2).map((interest, idx) => (
                                  <Chip
                                    key={idx}
                                    label={interest}
                                    size="small"
                                    sx={{
                                      background: 'rgba(242, 159, 5, 0.15)',
                                      color: '#F29F05',
                                      border: '1px solid rgba(242, 159, 5, 0.30)',
                                      fontSize: '0.75rem',
                                      height: 24
                                    }}
                                  />
                                ))}
                              </Box>
                              <Button
                                variant="outlined"
                                fullWidth
                                size="small"
                                startIcon={<MessageCircle size={16} />}
                                component={Link}
                                href={`/dating/chat/${match.id}`}
                                sx={{
                                  borderColor: '#F29F05',
                                  color: '#F29F05',
                                  textTransform: 'none',
                                  '&:hover': {
                                    borderColor: '#8C1D04',
                                    background: 'rgba(242, 159, 5, 0.10)'
                                  }
                                }}
                              >
                                Gespräch beginnen
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Quick Actions & Events */}
              <Grid item xs={12} md={4}>
                <Card sx={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(242, 159, 5, 0.20)',
                  borderRadius: 2,
                  mb: 3
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                      Impulse
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Button
                        component={Link}
                        href="/swipe"
                        variant="contained"
                        fullWidth
                        startIcon={<Heart size={18} />}
                        sx={{
                          background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                          color: 'white',
                          textTransform: 'none',
                          py: 1.5,
                          '&:hover': {
                            background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                          }
                        }}
                      >
                        Neue Resonanzen entdecken
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        startIcon={<Filter size={18} />}
                        onClick={() => setShowFilters(!showFilters)}
                        sx={{
                          borderColor: 'rgba(242, 159, 5, 0.5)',
                          color: '#F29F05',
                          textTransform: 'none',
                          py: 1.5,
                          '&:hover': {
                            borderColor: '#F29F05',
                            background: 'rgba(242, 159, 5, 0.10)'
                          }
                        }}
                      >
                        Resonanz filtern
                      </Button>
                      <Button
                        component={Link}
                        href="/dating/match-tips"
                        variant="outlined"
                        fullWidth
                        startIcon={<Sparkles size={18} />}
                        sx={{
                          borderColor: 'rgba(242, 159, 5, 0.5)',
                          color: '#F29F05',
                          textTransform: 'none',
                          py: 1.5,
                          '&:hover': {
                            borderColor: '#F29F05',
                            background: 'rgba(242, 159, 5, 0.10)'
                          }
                        }}
                      >
                        Verbindungs-Impulse
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                <Card sx={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(242, 159, 5, 0.20)',
                  borderRadius: 2
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                      Begegnungen im Feld
                    </Typography>
                    <List sx={{ p: 0 }}>
                      {events.slice(0, 2).map((event, index) => (
                        <React.Fragment key={event.id}>
                          <ListItem sx={{ px: 0, py: 1.5 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ 
                                bgcolor: 'rgba(242, 159, 5, 0.2)',
                                width: 40,
                                height: 40
                              }}>
                                <Calendar size={20} color="#F29F05" />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                                  {event.title}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                                    {event.date} • {event.time}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                                    {event.location}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                          {index < 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />}
                        </React.Fragment>
                      ))}
                    </List>
                    <Button
                      component={Link}
                      href="/exclusive-events"
                      fullWidth
                      size="small"
                      sx={{ 
                        mt: 2,
                        color: '#F29F05',
                        textTransform: 'none'
                      }}
                    >
                      Alle Begegnungen ansehen
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Card sx={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.20)',
              borderRadius: 2
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    Alle Verbindungen
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      <RefreshCw size={18} />
                    </IconButton>
                    <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      <Filter size={18} />
                    </IconButton>
                  </Box>
                </Box>
                <Grid container spacing={2}>
                  {existingMatches.map((match) => (
                    <Grid item xs={12} sm={6} md={4} key={match.id}>
                      <Card sx={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(242, 159, 5, 0.15)',
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          border: '1px solid rgba(242, 159, 5, 0.30)'
                        }
                      }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar 
                              src={match.image} 
                              sx={{ width: 60, height: 60, mr: 2 }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                                {match.name}, {match.age}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                                {match.type} • {match.profile}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                <Star size={14} color="#F29F05" />
                                <Typography variant="body2" sx={{ color: '#F29F05', ml: 0.5, fontSize: '0.85rem', fontWeight: 600 }}>
                                  {match.compatibility}% Resonanz
                                </Typography>
                              </Box>
                            </Box>
                            <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              <MoreVertical size={18} />
                            </IconButton>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                            {match.interests.map((interest, idx) => (
                              <Chip
                                key={idx}
                                label={interest}
                                size="small"
                                sx={{
                                  background: 'rgba(242, 159, 5, 0.15)',
                                  color: '#F29F05',
                                  border: '1px solid rgba(242, 159, 5, 0.30)',
                                  fontSize: '0.75rem',
                                  height: 24
                                }}
                              />
                            ))}
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              fullWidth
                              size="small"
                              startIcon={<Heart size={16} />}
                              sx={{
                                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                                textTransform: 'none',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                                }
                              }}
                            >
                              Verbinden
                            </Button>
                            <Button
                              variant="outlined"
                              fullWidth
                              size="small"
                              startIcon={<MessageCircle size={16} />}
                              component={Link}
                              href={`/dating/chat/${match.id}`}
                              sx={{
                                borderColor: '#F29F05',
                                color: '#F29F05',
                                textTransform: 'none',
                                '&:hover': {
                                  borderColor: '#8C1D04',
                                  background: 'rgba(242, 159, 5, 0.10)'
                                }
                              }}
                            >
                              Gespräch beginnen
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {activeTab === 2 && (
            <Card sx={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.20)',
              borderRadius: 2
            }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                    Gespräche
                  </Typography>
                </Box>
                <List>
                  {existingMatches.map((match, index) => (
                    <React.Fragment key={match.id}>
                      <ListItem 
                        sx={{ 
                          p: 3,
                          cursor: 'pointer',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.05)'
                          }
                        }}
                        component={Link}
                        href={`/dating/chat/${match.id}`}
                      >
                        <ListItemAvatar>
                          <Badge badgeContent={index === 0 ? 2 : 0} color="error">
                            <Avatar src={match.image} />
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 600 }}>
                                {match.name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
                                {match.lastActive}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                              Hey! Wie war dein Tag? 😊
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < existingMatches.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {activeTab === 3 && (
            <Grid container spacing={3}>
              {events.map((event) => (
                <Grid item xs={12} md={6} key={event.id}>
                  <Card sx={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(242, 159, 5, 0.20)',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      border: '1px solid rgba(242, 159, 5, 0.40)'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                            {event.title}
                          </Typography>
                          <Chip 
                            label={event.type} 
                            size="small" 
                            sx={{ 
                              background: 'rgba(242, 159, 5, 0.20)', 
                              color: '#F29F05',
                              border: '1px solid rgba(242, 159, 5, 0.30)'
                            }} 
                          />
                        </Box>
                        <IconButton size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          <MoreVertical size={18} />
                        </IconButton>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Calendar size={16} color="rgba(255,255,255,0.7)" />
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', ml: 1, fontSize: '0.9rem' }}>
                            {event.date} • {event.time}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <MapPin size={16} color="rgba(255,255,255,0.7)" />
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', ml: 1, fontSize: '0.9rem' }}>
                            {event.location}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Users size={16} color="rgba(255,255,255,0.7)" />
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', ml: 1, fontSize: '0.9rem' }}>
                            {event.attendees} Teilnehmer
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="contained"
                        fullWidth
                        startIcon={<Calendar size={16} />}
                        sx={{
                          background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                          textTransform: 'none',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                          }
                        }}
                      >
                        Teilnehmen
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {activeTab === 4 && (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h5" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
                Öffne deinen Resonanzraum
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4 }}>
                Entdecke Menschen, deren Energie wirklich zu dir passt
              </Typography>
              <Button
                component={Link}
                href="/swipe"
                variant="contained"
                size="large"
                startIcon={<Heart size={24} />}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white',
                  px: 6,
                  py: 2,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                  }
                }}
              >
                Entdecken beginnen
              </Button>
            </Box>
          )}

          {activeTab === 5 && (
            <Card sx={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.20)',
              borderRadius: 2
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Sparkles size={48} color="#F29F05" style={{ marginBottom: 16 }} />
                  <Typography variant="h4" sx={{ color: 'white', mb: 2, fontWeight: 700 }}>
                    Match Tipps
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4, maxWidth: 600, mx: 'auto' }}>
                    Erhalte personalisierte Tipps für deine Dates basierend auf Human Design Kompatibilität
                  </Typography>
                </Box>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={4}>
                    <Card sx={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(242, 159, 5, 0.15)',
                      borderRadius: 2,
                      height: '100%'
                    }}>
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Target size={32} color="#F29F05" style={{ marginBottom: 12 }} />
                        <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 600 }}>
                          Orte & Aktivitäten
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Finde die perfekten Locations und Aktivitäten für eure Energie-Kombination
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(242, 159, 5, 0.15)',
                      borderRadius: 2,
                      height: '100%'
                    }}>
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Clock size={32} color="#F29F05" style={{ marginBottom: 12 }} />
                        <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 600 }}>
                          Timing & Kommunikation
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Lerne, wann und wie du am besten kommunizierst für maximale Resonanz
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card sx={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(242, 159, 5, 0.15)',
                      borderRadius: 2,
                      height: '100%'
                    }}>
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Star size={32} color="#F29F05" style={{ marginBottom: 12 }} />
                        <Typography variant="h6" sx={{ color: 'white', mb: 1, fontWeight: 600 }}>
                          Kompatibilität
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Verstehe eure Stärken und Herausforderungen in der Verbindung
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    component={Link}
                    href="/dating/match-tips"
                    variant="contained"
                    size="large"
                    startIcon={<Sparkles size={24} />}
                    sx={{
                      background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                      color: 'white',
                      px: 6,
                      py: 2,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                      }
                    }}
                  >
                    Match Tipps öffnen
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Filter Section */}
          {showFilters && (
            <Card sx={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.20)',
              borderRadius: 2,
              mt: 3,
              p: 3
            }}>
              <Typography variant="h6" sx={{ color: 'white', mb: 3, textAlign: 'center' }}>
                🔍 Resonanz filtern
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                    Altersbereich: {filters.ageRange[0]} - {filters.ageRange[1]} Jahre
                  </Typography>
                  <Box sx={{ px: 2 }}>
                    <input
                      type="range"
                      min="18"
                      max="65"
                      value={filters.ageRange[0]}
                      onChange={(e) => handleFilterChange('ageRange', [parseInt(e.target.value), filters.ageRange[1]])}
                      style={{ width: '100%', marginBottom: 8 }}
                    />
                    <input
                      type="range"
                      min="18"
                      max="65"
                      value={filters.ageRange[1]}
                      onChange={(e) => handleFilterChange('ageRange', [filters.ageRange[0], parseInt(e.target.value)])}
                      style={{ width: '100%' }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 1 }}>
                    Human Design Typ
                  </Typography>
                  <select
                    value={filters.hdType}
                    onChange={(e) => handleFilterChange('hdType', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white'
                    }}
                  >
                    <option value="">Alle Typen</option>
                    <option value="Generator">Generator</option>
                    <option value="Projector">Projector</option>
                    <option value="Manifestor">Manifestor</option>
                    <option value="Reflector">Reflector</option>
                  </select>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      onClick={resetFilters}
                      sx={{
                        borderColor: 'rgba(255,255,255,0.3)',
                        color: 'white',
                        '&:hover': { borderColor: 'rgba(255,255,255,0.6)' }
                      }}
                    >
                      Zurücksetzen
                    </Button>
                    <Button
                      variant="contained"
                      onClick={applyFilters}
                      sx={{
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                        }
                      }}
                    >
                      Filter anwenden
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          )}
        </Container>
      </PageLayout>

      {/* Settings Menu */}
      <Menu
        anchorEl={settingsAnchorEl}
        open={Boolean(settingsAnchorEl)}
        onClose={handleSettingsClose}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(242, 159, 5, 0.20)',
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            mt: 1,
            minWidth: 200
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={handleSettingsClose}
          component={Link}
          href="/profil"
          sx={{ 
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <ListItemIcon>
            <User size={20} color="#F29F05" />
          </ListItemIcon>
          <ListItemText primary="Profil bearbeiten" />
        </MenuItem>
        <MenuItem 
          onClick={handleSettingsClose}
          component={Link}
          href="/settings"
          sx={{ 
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <ListItemIcon>
            <Settings size={20} color="#F29F05" />
          </ListItemIcon>
          <ListItemText primary="Einstellungen" />
        </MenuItem>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <MenuItem 
          onClick={handleSettingsClose}
          component={Link}
          href="/support"
          sx={{
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
          }}
        >
          <ListItemIcon>
            <HelpCircle size={20} color="#F29F05" />
          </ListItemIcon>
          <ListItemText primary="Hilfe & Support" />
        </MenuItem>
      </Menu>
    </Box>
  );
}

// Export mit ProtectedRoute
export default function Dating() {
  return (
    <ProtectedRoute requiredRole="premium">
      <DatingDashboard />
    </ProtectedRoute>
  );
}
