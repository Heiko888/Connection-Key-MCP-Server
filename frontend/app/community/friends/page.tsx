"use client";

import React, { useEffect, useState } from "react";
import PageLayout from "../../components/PageLayout";
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme
} from "@mui/material";
import { 
  Users, 
  Search, 
  MapPin, 
  Heart, 
  MessageCircle, 
  Activity,
  Calendar,
  UserPlus,
  Camera,
  Coffee
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types
interface Friend {
  id: string;
  name: string;
  avatar: string;
  location: string;
  age: number;
  hdType: string;
  interests: string[];
  bio: string;
  isOnline: boolean;
  lastSeen: string;
  mutualFriends: number;
  compatibility: number;
  activities: string[];
  status: 'online' | 'away' | 'busy' | 'offline';
}

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  participants: number;
  maxParticipants: number;
  category: string;
  icon: React.ReactNode;
  color: string;
}

// Mock Data
const mockFriends: Friend[] = [
  {
    id: '1',
    name: 'Anna Schmidt',
    avatar: '/dating/default.jpg',
    location: 'Berlin',
    age: 28,
    hdType: 'Generator',
    interests: ['Yoga', 'Kunst', 'Kaffee'],
    bio: 'Liebt es, neue Menschen kennenzulernen und gemeinsam zu wachsen.',
    isOnline: true,
    lastSeen: 'vor 2 Minuten',
    mutualFriends: 12,
    compatibility: 85,
    activities: ['Yoga-Kurs', 'Kunst-Ausstellung'],
    status: 'online'
  },
  {
    id: '2',
    name: 'Max Müller',
    avatar: '/dating/default.jpg',
    location: 'Hamburg',
    age: 32,
    hdType: 'Projektor',
    interests: ['Musik', 'Reisen', 'Fotografie'],
    bio: 'Passionierter Musiker und Weltenbummler.',
    isOnline: false,
    lastSeen: 'vor 1 Stunde',
    mutualFriends: 8,
    compatibility: 92,
    activities: ['Konzert', 'Fotowalk'],
    status: 'away'
  },
  {
    id: '3',
    name: 'Sophie Weber',
    avatar: '/dating/default.jpg',
    location: 'München',
    age: 26,
    hdType: 'Manifestor',
    interests: ['Lesen', 'Kochen', 'Spiritualität'],
    bio: 'Bücherwurm und spirituelle Suchende.',
    isOnline: true,
    lastSeen: 'vor 5 Minuten',
    mutualFriends: 15,
    compatibility: 78,
    activities: ['Buchclub', 'Meditation'],
    status: 'online'
  }
];

const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Yoga im Park',
    description: 'Gemeinsame Yoga-Session im Tiergarten',
    date: '2024-01-15',
    location: 'Tiergarten, Berlin',
    participants: 8,
    maxParticipants: 15,
    category: 'Wellness',
    icon: <Activity size={20} />,
    color: '#10b981'
  },
  {
    id: '2',
    title: 'Kunst-Ausstellung',
    description: 'Besuch der neuen Ausstellung im Hamburger Bahnhof',
    date: '2024-01-18',
    location: 'Hamburger Bahnhof, Berlin',
    participants: 5,
    maxParticipants: 10,
    category: 'Kultur',
    icon: <Camera size={20} />,
    color: '#8b5cf6'
  },
  {
    id: '3',
    title: 'Kaffee & Gespräche',
    description: 'Entspannte Gespräche bei gutem Kaffee',
    date: '2024-01-20',
    location: 'Café Einstein, München',
    participants: 3,
    maxParticipants: 6,
    category: 'Gesellschaft',
    icon: <Coffee size={20} />,
    color: '#f59e0b'
  }
];

export default function FriendsPage() {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [showFriendDialog, setShowFriendDialog] = useState(false);
  const [friends, setFriends] = useState<Friend[]>(mockFriends);
  const [activities, setActivities] = useState<Activity[]>(mockActivities);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: `
            radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
            radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
            radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
            linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
          `,
          backgroundAttachment: 'fixed',
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleFriendClick = (friend: Friend) => {
    setSelectedFriend(friend);
    setShowFriendDialog(true);
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.interests.some(interest => 
      interest.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

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
            zIndex: 0,
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
            zIndex: 0,
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
            zIndex: 0,
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box sx={{ 
            textAlign: 'center', 
            mb: 6,
            py: { xs: 4, md: 6 }
          }}>
            <Typography
              variant="h2"
              sx={{
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                mb: 2,
                textShadow: '0 0 30px rgba(242, 159, 5, 0.25)'
              }}
            >
              👥 Freunde & Community
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(255,255,255,0.8)', 
                mb: 3,
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6
              }}
            >
              Verbinde dich mit Gleichgesinnten und teile deine Human Design Reise.
            </Typography>
          </Box>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Box sx={{ mb: 4 }}>
            <TextField
              fullWidth
              placeholder="Suche nach Namen, Ort oder Interessen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 3,
                  color: 'white',
                  '&:hover': {
                    border: '1px solid rgba(255,255,255,0.2)'
                  },
                  '&.Mui-focused': {
                    border: '1px solid #F29F05'
                  }
                },
                '& .MuiInputBase-input': {
                  color: 'white',
                  '&::placeholder': {
                    color: 'rgba(255,255,255,0.7)'
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} color="rgba(255,255,255,0.7)" />
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Box sx={{ mb: 4 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              centered
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 600,
                  '&.Mui-selected': {
                    color: 'white'
                  }
                },
                '& .MuiTabs-indicator': {
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  height: 3,
                  borderRadius: 2
                }
              }}
            >
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Users size={20} />
                    Freunde
                  </Box>
                } 
              />
              <Tab 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Activity size={20} />
                    Aktivitäten
                  </Box>
                } 
              />
            </Tabs>
          </Box>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 0 && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Grid container spacing={3}>
                {filteredFriends.map((friend, index) => (
                  <Grid item xs={12} sm={6} md={4} key={friend.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card
                        sx={{
                          background: 'rgba(255,255,255,0.05)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 3,
                          height: '100%',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                          cursor: 'pointer',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 20px 40px rgba(242, 159, 5, 0.3)',
                            border: '1px solid rgba(242, 159, 5, 0.5)'
                          }
                        }}
                        onClick={() => handleFriendClick(friend)}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Badge
                              overlap="circular"
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              badgeContent={
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    background: friend.isOnline ? '#10b981' : '#6b7280',
                                    border: '2px solid white'
                                  }}
                                />
                              }
                            >
                              <Avatar
                                src={friend.avatar}
                                sx={{
                                  width: 60,
                                  height: 60,
                                  border: '3px solid',
                                  borderColor: friend.isOnline ? 'success.main' : 'grey.500'
                                }}
                              />
                            </Badge>
                            <Box sx={{ ml: 2, flex: 1 }}>
                              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                {friend.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <MapPin size={14} color="rgba(255,255,255,0.7)" />
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                  {friend.location} • {friend.age} Jahre
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                {friend.hdType} • {friend.compatibility}% Kompatibilität
                              </Typography>
                            </Box>
                          </Box>

                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'rgba(255,255,255,0.8)', 
                              mb: 2, 
                              lineHeight: 1.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {friend.bio}
                          </Typography>

                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                            {friend.interests.slice(0, 3).map((interest, idx) => (
                              <Chip
                                key={idx}
                                label={interest}
                                size="small"
                                sx={{
                                  background: 'rgba(242, 159, 5, 0.2)',
                                  color: '#F29F05',
                                  border: '1px solid rgba(242, 159, 5, 0.3)'
                                }}
                              />
                            ))}
                            {friend.interests.length > 3 && (
                              <Chip
                                label={`+${friend.interests.length - 3}`}
                                size="small"
                                sx={{
                                  background: 'rgba(255,255,255,0.1)',
                                  color: 'rgba(255,255,255,0.7)'
                                }}
                              />
                            )}
                          </Box>

                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Heart size={16} />}
                              sx={{
                                color: 'white',
                                borderColor: 'rgba(255,255,255,0.3)',
                                '&:hover': {
                                  borderColor: 'white',
                                  background: 'rgba(255,255,255,0.1)'
                                }
                              }}
                            >
                              Favorit
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<MessageCircle size={16} />}
                              sx={{
                                color: 'white',
                                borderColor: 'rgba(255,255,255,0.3)',
                                '&:hover': {
                                  borderColor: 'white',
                                  background: 'rgba(255,255,255,0.1)'
                                }
                              }}
                            >
                              Chat
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}

          {activeTab === 1 && (
            <motion.div
              key="activities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Grid container spacing={3}>
                {activities.map((activity, index) => (
                  <Grid item xs={12} sm={6} md={4} key={activity.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card
                        sx={{
                          background: 'rgba(255,255,255,0.05)',
                          backdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: 3,
                          height: '100%',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                            border: `1px solid ${activity.color}`
                          }
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ color: activity.color, mr: 2 }}>
                              {activity.icon}
                            </Box>
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                              {activity.title}
                            </Typography>
                          </Box>

                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: 'rgba(255,255,255,0.8)', 
                              mb: 2, 
                              lineHeight: 1.5
                            }}
                          >
                            {activity.description}
                          </Typography>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <MapPin size={14} color="rgba(255,255,255,0.7)" />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              {activity.location}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Calendar size={14} color="rgba(255,255,255,0.7)" />
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              {new Date(activity.date).toLocaleDateString('de-DE')}
                            </Typography>
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              {activity.participants}/{activity.maxParticipants} Teilnehmer
                            </Typography>
                            <Chip
                              label={activity.category}
                              size="small"
                              sx={{
                                background: `${activity.color}20`,
                                color: activity.color,
                                border: `1px solid ${activity.color}50`
                              }}
                            />
                          </Box>

                          <Button
                            variant="contained"
                            fullWidth
                            startIcon={<UserPlus size={16} />}
                            sx={{
                              background: `linear-gradient(45deg, ${activity.color}, ${activity.color}cc)`,
                              color: 'white',
                              fontWeight: 600,
                              '&:hover': {
                                background: `linear-gradient(45deg, ${activity.color}cc, ${activity.color})`
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Friend Detail Dialog */}
        <Dialog
        open={showFriendDialog}
        onClose={() => setShowFriendDialog(false)}
        maxWidth="sm"
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
        {selectedFriend && (
          <>
            <DialogTitle sx={{ color: 'white', textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Avatar
                  src={selectedFriend.avatar}
                  sx={{ width: 60, height: 60 }}
                />
                <Box>
                  <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                    {selectedFriend.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    {selectedFriend.location} • {selectedFriend.age} Jahre
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                {selectedFriend.bio}
              </Typography>
              <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                Interessen
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {selectedFriend.interests.map((interest, idx) => (
                  <Chip
                    key={idx}
                    label={interest}
                    sx={{
                      background: 'rgba(242, 159, 5, 0.2)',
                      color: '#F29F05'
                    }}
                  />
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setShowFriendDialog(false)}
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              >
                Schließen
              </Button>
              <Button
                variant="contained"
                startIcon={<MessageCircle size={16} />}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: 'white'
                }}
              >
                Nachricht senden
              </Button>
            </DialogActions>
          </>
        )}
        </Dialog>
      </PageLayout>
    </Box>
  );
}

