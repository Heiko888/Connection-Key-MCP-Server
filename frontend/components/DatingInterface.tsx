"use client";
import React, { useState, useEffect } from 'react';
import { safeJsonParse } from '@/lib/supabase/client';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  CircularProgress,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  Favorite,
  Close,
  Star,
  Message,
  LocationOn,
  Info,
  Send,
  FilterList
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { datingService, Match, Recommendation, DatingMessage } from '../lib/dating/datingService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dating-tabpanel-${index}`}
      aria-labelledby={`dating-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function DatingInterface() {
  const [activeTab, setActiveTab] = useState(0);
  const [currentUserId] = useState('user1'); // Mock user ID
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Recommendation | null>(null);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [newMatch, setNewMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<DatingMessage[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  
  // Premium Features States
  const [userSubscription, setUserSubscription] = useState<{
    packageId: string;
    plan: string;
    status: string;
  } | null>(null);
  const [likesRemaining, setLikesRemaining] = useState(10);
  const [superLikesRemaining, setSuperLikesRemaining] = useState(1);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [filters, setFilters] = useState({
    ageRange: [18, 50] as [number, number],
    maxDistance: 50,
    hdTypes: [] as string[],
    minCompatibility: 60,
    interests: [] as string[],
    isActive: true
  });

  useEffect(() => {
    loadDatingData();
    loadPremiumFeatures();
  }, [filters]);

  const loadPremiumFeatures = () => {
    try {
      const userSubscription = safeJsonParse(localStorage.getItem('userSubscription') || '{}', {});
      
      setUserSubscription(userSubscription);
      
      // Setze Limits basierend auf Subscription
      if (userSubscription.packageId === 'premium' || userSubscription.packageId === 'vip') {
        setLikesRemaining(999); // Unbegrenzt
        setSuperLikesRemaining(5); // 5 Super Likes pro Tag
      } else if (userSubscription.packageId === 'basic') {
        setLikesRemaining(50); // 50 Likes pro Tag
        setSuperLikesRemaining(1); // 1 Super Like pro Tag
      } else {
        setLikesRemaining(10); // 10 Likes pro Tag (Free)
        setSuperLikesRemaining(0); // Keine Super Likes (Free)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Premium-Features:', error);
      // Fallback für Free User
      setLikesRemaining(10);
      setSuperLikesRemaining(0);
    }
  };

  const loadDatingData = async () => {
    try {
      setIsLoading(true);
      
      // Lade Empfehlungen und Matches parallel
      const [recommendationsData, matchesData] = await Promise.all([
        datingService.getRecommendations(currentUserId, 20, filters),
        datingService.getMatches(currentUserId)
      ]);
      
      setRecommendations(recommendationsData);
      setMatches(matchesData);
    } catch (error) {
      console.error('Fehler beim Laden der Dating-Daten:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    setShowFilters(false);
    loadDatingData();
  };

  const resetFilters = () => {
    setFilters({
      ageRange: [18, 50],
      maxDistance: 50,
      hdTypes: [],
      minCompatibility: 60,
      interests: [],
      isActive: true
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleLike = async (profile: Recommendation, isSuperLike: boolean = false) => {
    // Prüfe Premium-Limits
    if (isSuperLike && superLikesRemaining <= 0) {
      setShowPremiumDialog(true);
      return;
    }
    
    if (!isSuperLike && likesRemaining <= 0) {
      setShowPremiumDialog(true);
      return;
    }
    
    try {
      const result = await datingService.addLike(currentUserId, profile.userId, isSuperLike);
      
      if (result.isMatch && result.match) {
        setNewMatch(result.match);
        setShowMatchDialog(true);
        // Aktualisiere Matches
        setMatches(prev => [result.match!, ...prev]);
      }
      
      // Aktualisiere Limits
      if (isSuperLike) {
        setSuperLikesRemaining(prev => Math.max(0, prev - 1));
      } else {
        setLikesRemaining(prev => Math.max(0, prev - 1));
      }
      
      // Entferne das gelikte Profil aus den Empfehlungen
      setRecommendations(prev => prev.filter(p => p.userId !== profile.userId));
      
      // Gehe zum nächsten Profil
      setCurrentProfileIndex(prev => Math.min(prev, recommendations.length - 2));
      setCurrentPhotoIndex(0); // Reset Foto-Index
    } catch (error) {
      console.error('Fehler beim Liken:', error);
    }
  };

  const handlePass = () => {
    // Entferne das aktuelle Profil aus den Empfehlungen
    setRecommendations(prev => prev.filter((_, index) => index !== currentProfileIndex));
    
    // Gehe zum nächsten Profil
    setCurrentProfileIndex(prev => Math.min(prev, recommendations.length - 2));
    setCurrentPhotoIndex(0); // Reset Foto-Index
  };

  const handleProfileClick = (profile: Recommendation) => {
    setSelectedProfile(profile);
    setShowProfileDialog(true);
  };

  const handleMatchClick = async (match: Match) => {
    setSelectedMatch(match);
    try {
      const messagesData = await datingService.getMessages(match.id);
      setMessages(messagesData);
    } catch (error) {
      console.error('Fehler beim Laden der Nachrichten:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedMatch) return;
    
    try {
      const messageData = {
        matchId: selectedMatch.id,
        senderId: currentUserId,
        receiverId: selectedMatch.user1Id === currentUserId ? selectedMatch.user2Id : selectedMatch.user1Id,
        content: newMessage.trim(),
        messageType: 'text' as const
      };
      
      const sentMessage = await datingService.sendMessage(messageData);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
    }
  };

  const getCompatibilityColor = (compatibility: number) => {
    if (compatibility >= 80) return '#10b981';
    if (compatibility >= 60) return '#f59e0b';
    if (compatibility >= 40) return '#ef4444';
    return '#6b7280';
  };


  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  const currentProfile = recommendations[currentProfileIndex];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            textAlign: 'center',
            background: 'linear-gradient(45deg, #ec4899, #f472b6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            mb: 4
          }}
        >
          💕 Human Design Dating
        </Typography>

        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 3,
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="fullWidth"
              sx={{
                flex: 1,
                '& .MuiTab-root': {
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  fontSize: '1.1rem',
                  py: 2,
                  '&.Mui-selected': {
                    color: '#ec4899',
                    background: 'rgba(236, 72, 153, 0.1)',
                  },
                },
                '& .MuiTabs-indicator': {
                  background: 'linear-gradient(45deg, #ec4899, #f472b6)',
                  height: 3,
                },
              }}
            >
              <Tab 
                icon={<Favorite />} 
                label="Entdecken" 
                iconPosition="start"
              />
              <Tab 
                icon={<Message />} 
                label={`Matches (${matches.length})`} 
                iconPosition="start"
              />
            </Tabs>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Premium Status */}
              <Chip
                label={`${likesRemaining} Likes`}
                size="small"
                sx={{
                  backgroundColor: likesRemaining > 0 ? '#10b981' : '#ef4444',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
              {superLikesRemaining > 0 && (
                <Chip
                  label={`${superLikesRemaining} Super Likes`}
                  size="small"
                  sx={{
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              )}
              
              <IconButton
                onClick={() => setShowFilters(true)}
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    color: '#ec4899',
                    backgroundColor: 'rgba(236, 72, 153, 0.1)'
                  }
                }}
              >
                <FilterList />
              </IconButton>
            </Box>
          </Box>

          {/* Entdecken Tab */}
          <TabPanel value={activeTab} index={0}>
            {currentProfile ? (
              <motion.div
                key={currentProfile.id}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.3 }}
              >
                <Card sx={{ 
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 3,
                  overflow: 'hidden'
                }}>
                  <Box sx={{ position: 'relative' }}>
                    {/* Profilbilder Carousel */}
                    <Box
                      sx={{
                        height: 400,
                        background: `linear-gradient(135deg, ${getCompatibilityColor(currentProfile.compatibility)}20, ${getCompatibilityColor(currentProfile.compatibility)}40)`,
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Foto-Carousel */}
                      <Box
                        sx={{
                          display: 'flex',
                          height: '100%',
                          transition: 'transform 0.3s ease',
                          transform: `translateX(-${currentPhotoIndex * 100}%)`,
                          width: `${currentProfile.photos.length * 100}%`
                        }}
                      >
                        {currentProfile.photos.map((photo, index) => (
                          <Box
                            key={index}
                            sx={{
                              width: `${100 / currentProfile.photos.length}%`,
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative'
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 200,
                                height: 200,
                                fontSize: '4rem',
                                background: `linear-gradient(45deg, ${getCompatibilityColor(currentProfile.compatibility)}, ${getCompatibilityColor(currentProfile.compatibility)}80)`,
                                backgroundImage: photo.startsWith('/') ? `url(${photo})` : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                              }}
                            >
                              {!photo.startsWith('/') && currentProfile.name.charAt(0)}
                            </Avatar>
                          </Box>
                        ))}
                      </Box>
                      
                      {/* Foto-Indikatoren */}
                      {currentProfile.photos.length > 1 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 16,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: 1
                          }}
                        >
                          {currentProfile.photos.map((_, index) => (
                            <Box
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPhotoIndex(index);
                              }}
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: index === currentPhotoIndex ? 'white' : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                              }}
                            />
                          ))}
                        </Box>
                      )}
                      
                      {/* Kompatibilität Badge */}
                      <Chip
                        label={`${currentProfile.compatibility}% Match`}
                        sx={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          backgroundColor: getCompatibilityColor(currentProfile.compatibility),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                      
                      {/* Foto-Navigation */}
                      {currentProfile.photos.length > 1 && (
                        <>
                          <IconButton
                            sx={{
                              position: 'absolute',
                              left: 16,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentPhotoIndex(prev => 
                                prev > 0 ? prev - 1 : currentProfile.photos.length - 1
                              );
                            }}
                          >
                            ←
                          </IconButton>
                          <IconButton
                            sx={{
                              position: 'absolute',
                              right: 16,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentPhotoIndex(prev => 
                                prev < currentProfile.photos.length - 1 ? prev + 1 : 0
                              );
                            }}
                          >
                            →
                          </IconButton>
                        </>
                      )}
                    </Box>

                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h4" color="white" fontWeight="bold">
                          {currentProfile.name}, {currentProfile.age}
                        </Typography>
                        <IconButton
                          onClick={() => handleProfileClick(currentProfile)}
                          sx={{ color: 'white' }}
                        >
                          <Info />
                        </IconButton>
                      </Box>

                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <LocationOn sx={{ color: 'rgba(255,255,255,0.7)', fontSize: 20 }} />
                        <Typography variant="body1" color="rgba(255,255,255,0.7)">
                          {currentProfile.location}
                        </Typography>
                      </Box>

                      <Typography variant="body1" color="white" mb={3}>
                        {currentProfile.bio}
                      </Typography>

                      {/* Human Design Info */}
                      <Box mb={3}>
                        <Typography variant="h6" color="white" gutterBottom>
                          🧬 Human Design
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Chip
                              label={`${currentProfile.hdType} - ${currentProfile.hdProfile}`}
                              sx={{ backgroundColor: '#8b5cf6', color: 'white', mb: 1 }}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <Chip
                              label={currentProfile.hdAuthority}
                              sx={{ backgroundColor: '#10b981', color: 'white', mb: 1 }}
                            />
                          </Grid>
                        </Grid>
                      </Box>

                      {/* Kompatibilität Details */}
                      <Box mb={3}>
                        <Typography variant="h6" color="white" gutterBottom>
                          📊 Kompatibilität
                        </Typography>
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Box>
                              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                                Typ: {currentProfile.hdCompatibility.typeCompatibility}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={currentProfile.hdCompatibility.typeCompatibility}
                                sx={{ height: 4, borderRadius: 2 }}
                              />
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box>
                              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                                Profil: {currentProfile.hdCompatibility.profileCompatibility}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={currentProfile.hdCompatibility.profileCompatibility}
                                sx={{ height: 4, borderRadius: 2 }}
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>

                      {/* Action Buttons */}
                      <Box display="flex" justifyContent="center" gap={2}>
                        <Button
                          variant="contained"
                          startIcon={<Close />}
                          onClick={handlePass}
                          sx={{
                            backgroundColor: '#6b7280',
                            '&:hover': { backgroundColor: '#4b5563' },
                            px: 4,
                            py: 1.5
                          }}
                        >
                          Pass
                        </Button>
                        
                        <Button
                          variant="contained"
                          startIcon={<Star />}
                          onClick={() => handleLike(currentProfile, true)}
                          sx={{
                            background: 'linear-gradient(45deg, #8b5cf6, #a855f7)',
                            '&:hover': { background: 'linear-gradient(45deg, #7c3aed, #9333ea)' },
                            px: 4,
                            py: 1.5
                          }}
                        >
                          Super Like
                        </Button>
                        
                        <Button
                          variant="contained"
                          startIcon={<Favorite />}
                          onClick={() => handleLike(currentProfile)}
                          sx={{
                            background: 'linear-gradient(45deg, #ec4899, #f472b6)',
                            '&:hover': { background: 'linear-gradient(45deg, #db2777, #ec4899)' },
                            px: 4,
                            py: 1.5
                          }}
                        >
                          Like
                        </Button>
                      </Box>
                    </CardContent>
                  </Box>
                </Card>
              </motion.div>
            ) : (
              <Box textAlign="center" py={8}>
                <Typography variant="h5" color="white" gutterBottom>
                  🎉 Keine neuen Profile verfügbar
                </Typography>
                <Typography variant="body1" color="rgba(255,255,255,0.7)">
                  Schau später wieder vorbei oder erweitere deine Suchkriterien!
                </Typography>
              </Box>
            )}
          </TabPanel>

          {/* Matches Tab */}
          <TabPanel value={activeTab} index={1}>
            {matches.length > 0 ? (
              <Grid container spacing={3}>
                {matches.map((match) => (
                  <Grid item xs={12} sm={6} md={4} key={match.id}>
                    <Card
                      sx={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 3,
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 32px rgba(236, 72, 153, 0.3)',
                        },
                        transition: 'all 0.3s ease'
                      }}
                      onClick={() => handleMatchClick(match)}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <Avatar
                            sx={{
                              width: 60,
                              height: 60,
                              background: `linear-gradient(45deg, ${getCompatibilityColor(match.compatibility)}, ${getCompatibilityColor(match.compatibility)}80)`
                            }}
                          >
                            {match.otherProfile?.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" color="white" fontWeight="bold">
                              {match.otherProfile?.name}
                            </Typography>
                            <Typography variant="body2" color="rgba(255,255,255,0.7)">
                              {match.otherProfile?.age} • {match.otherProfile?.location}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box mb={2}>
                          <Chip
                            label={`${match.compatibility}% Match`}
                            sx={{
                              backgroundColor: getCompatibilityColor(match.compatibility),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="rgba(255,255,255,0.7)">
                          {match.otherProfile?.hdType} • {match.otherProfile?.hdProfile}
                        </Typography>
                        
                        <Typography variant="caption" color="rgba(255,255,255,0.5)">
                          {datingService.formatDate(match.matchDate)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" py={8}>
                <Typography variant="h5" color="white" gutterBottom>
                  💔 Noch keine Matches
                </Typography>
                <Typography variant="body1" color="rgba(255,255,255,0.7)">
                  Starte mit dem Entdecken und finde deine perfekte Human Design Verbindung!
                </Typography>
              </Box>
            )}
          </TabPanel>
        </Paper>
      </Container>

      {/* Profil Detail Dialog */}
      <Dialog
        open={showProfileDialog}
        onClose={() => setShowProfileDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)',
            color: 'white'
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h5" color="white">
            {selectedProfile?.name} - Detaillierte Kompatibilität
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedProfile && (
            <Box>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" color="white" gutterBottom>
                    🧬 Human Design Details
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Typ"
                        secondary={selectedProfile.hdType}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Profil"
                        secondary={selectedProfile.hdProfile}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Authority"
                        secondary={selectedProfile.hdAuthority}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Strategy"
                        secondary={selectedProfile.hdStrategy}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" color="white" gutterBottom>
                    📊 Kompatibilität Breakdown
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Typ-Kompatibilität"
                        secondary={`${selectedProfile.hdCompatibility.typeCompatibility}%`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Profil-Kompatibilität"
                        secondary={`${selectedProfile.hdCompatibility.profileCompatibility}%`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Authority-Kompatibilität"
                        secondary={`${selectedProfile.hdCompatibility.authorityCompatibility}%`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Center-Kompatibilität"
                        secondary={`${selectedProfile.hdCompatibility.centersCompatibility}%`}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowProfileDialog(false)}>
            Schließen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Match Dialog */}
      <Dialog
        open={showMatchDialog}
        onClose={() => setShowMatchDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)',
            color: 'white',
            textAlign: 'center'
          }
        }}
      >
        <DialogContent sx={{ py: 4 }}>
          <Typography variant="h4" color="white" gutterBottom>
            🎉 Es ist ein Match!
          </Typography>
          <Typography variant="h6" color="rgba(255,255,255,0.8)" gutterBottom>
            Du und {newMatch?.otherProfile?.name} haben euch gegenseitig geliked!
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.7)">
            Eure Human Design Kompatibilität: {newMatch?.compatibility}%
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => setShowMatchDialog(false)}
            sx={{
              background: 'linear-gradient(45deg, #ec4899, #f472b6)',
              '&:hover': { background: 'linear-gradient(45deg, #db2777, #ec4899)' },
              px: 4
            }}
          >
            Weiter entdecken
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chat Dialog */}
      <Dialog
        open={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)',
            color: 'white',
            height: '80vh'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                background: `linear-gradient(45deg, ${getCompatibilityColor(selectedMatch?.compatibility || 0)}, ${getCompatibilityColor(selectedMatch?.compatibility || 0)}80)`
              }}
            >
              {selectedMatch?.otherProfile?.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" color="white">
                {selectedMatch?.otherProfile?.name}
              </Typography>
              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                {selectedMatch?.compatibility}% Match
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ flex: 1, overflow: 'auto' }}>
          <List>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  justifyContent: message.senderId === currentUserId ? 'flex-end' : 'flex-start'
                }}
              >
                <Box
                  sx={{
                    maxWidth: '70%',
                    backgroundColor: message.senderId === currentUserId ? '#ec4899' : 'rgba(255,255,255,0.1)',
                    borderRadius: 2,
                    p: 2,
                    color: 'white'
                  }}
                >
                  <Typography variant="body1">
                    {message.content}
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.7)">
                    {datingService.formatDate(message.timestamp)}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Nachricht schreiben..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
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
                  borderColor: '#ec4899',
                },
              },
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            sx={{ color: '#ec4899' }}
          >
            <Send />
          </IconButton>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog
        open={showFilters}
        onClose={() => setShowFilters(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)',
            color: 'white'
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h5" color="white">
            🔍 Filter & Suche
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Altersbereich */}
            <Typography variant="h6" color="white" gutterBottom>
              Alter: {filters.ageRange[0]} - {filters.ageRange[1]} Jahre
            </Typography>
            <Box sx={{ px: 2, mb: 3 }}>
              <input
                type="range"
                min="18"
                max="80"
                value={filters.ageRange[0]}
                onChange={(e) => setFilters(prev => ({ ...prev, ageRange: [parseInt(e.target.value), prev.ageRange[1]] }))}
                style={{ width: '100%', marginBottom: '8px' }}
              />
              <input
                type="range"
                min="18"
                max="80"
                value={filters.ageRange[1]}
                onChange={(e) => setFilters(prev => ({ ...prev, ageRange: [prev.ageRange[0], parseInt(e.target.value)] }))}
                style={{ width: '100%' }}
              />
            </Box>

            {/* Entfernung */}
            <Typography variant="h6" color="white" gutterBottom>
              Max. Entfernung: {filters.maxDistance} km
            </Typography>
            <Box sx={{ px: 2, mb: 3 }}>
              <input
                type="range"
                min="1"
                max="200"
                value={filters.maxDistance}
                onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </Box>

            {/* HD-Typen */}
            <Typography variant="h6" color="white" gutterBottom>
              Human Design Typen
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {['Generator', 'Manifesting Generator', 'Projector', 'Manifestor', 'Reflector'].map((type) => (
                <Chip
                  key={type}
                  label={type}
                  clickable
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      hdTypes: prev.hdTypes.includes(type)
                        ? prev.hdTypes.filter(t => t !== type)
                        : [...prev.hdTypes, type]
                    }));
                  }}
                  sx={{
                    backgroundColor: filters.hdTypes.includes(type) ? '#ec4899' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: filters.hdTypes.includes(type) ? '#db2777' : 'rgba(255,255,255,0.2)'
                    }
                  }}
                />
              ))}
            </Box>

            {/* Mindest-Kompatibilität */}
            <Typography variant="h6" color="white" gutterBottom>
              Mindest-Kompatibilität: {filters.minCompatibility}%
            </Typography>
            <Box sx={{ px: 2, mb: 3 }}>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.minCompatibility}
                onChange={(e) => setFilters(prev => ({ ...prev, minCompatibility: parseInt(e.target.value) }))}
                style={{ width: '100%' }}
              />
            </Box>

            {/* Interessen */}
            <Typography variant="h6" color="white" gutterBottom>
              Interessen
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {['Yoga', 'Meditation', 'Sport', 'Musik', 'Reisen', 'Kunst', 'Bücher', 'Natur', 'Kochen', 'Technologie'].map((interest) => (
                <Chip
                  key={interest}
                  label={interest}
                  clickable
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      interests: prev.interests.includes(interest)
                        ? prev.interests.filter(i => i !== interest)
                        : [...prev.interests, interest]
                    }));
                  }}
                  sx={{
                    backgroundColor: filters.interests.includes(interest) ? '#8b5cf6' : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: filters.interests.includes(interest) ? '#7c3aed' : 'rgba(255,255,255,0.2)'
                    }
                  }}
                />
              ))}
            </Box>

            {/* Aktivitätsstatus */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <input
                type="checkbox"
                id="isActive"
                checked={filters.isActive}
                onChange={(e) => setFilters(prev => ({ ...prev, isActive: e.target.checked }))}
                style={{ transform: 'scale(1.2)' }}
              />
              <Typography variant="body1" color="white">
                Nur aktive Profile anzeigen
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={resetFilters}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Zurücksetzen
          </Button>
          <Button
            onClick={() => setShowFilters(false)}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Abbrechen
          </Button>
          <Button
            variant="contained"
            onClick={applyFilters}
            sx={{
              background: 'linear-gradient(45deg, #ec4899, #f472b6)',
              '&:hover': { background: 'linear-gradient(45deg, #db2777, #ec4899)' }
            }}
          >
            Filter anwenden
          </Button>
        </DialogActions>
      </Dialog>

      {/* Premium Upgrade Dialog */}
      <Dialog
        open={showPremiumDialog}
        onClose={() => setShowPremiumDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)',
            color: 'white',
            textAlign: 'center'
          }
        }}
      >
        <DialogContent sx={{ py: 4 }}>
          <Typography variant="h4" color="white" gutterBottom>
            ⭐ Premium Upgrade erforderlich
          </Typography>
          <Typography variant="h6" color="rgba(255,255,255,0.8)" gutterBottom>
            Du hast dein tägliches Limit erreicht!
          </Typography>
          <Typography variant="body1" color="rgba(255,255,255,0.7)" sx={{ mb: 3 }}>
            Mit Premium erhältst du:
          </Typography>
          
          <Box sx={{ textAlign: 'left', mb: 3 }}>
            <Typography variant="body1" color="white" sx={{ mb: 1 }}>
              ✅ Unbegrenzte Likes
            </Typography>
            <Typography variant="body1" color="white" sx={{ mb: 1 }}>
              ✅ 5 Super Likes pro Tag
            </Typography>
            <Typography variant="body1" color="white" sx={{ mb: 1 }}>
              ✅ Erweiterte Filter
            </Typography>
            <Typography variant="body1" color="white" sx={{ mb: 1 }}>
              ✅ Prioritäts-Matching
            </Typography>
            <Typography variant="body1" color="white">
              ✅ Erweiterte Kompatibilitäts-Analyse
            </Typography>
          </Box>
          
          <Typography variant="h5" color="#FFD700" gutterBottom>
            Nur 19€/Monat
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={() => setShowPremiumDialog(false)}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            Später
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setShowPremiumDialog(false);
              window.location.href = '/subscription';
            }}
            sx={{
              background: 'linear-gradient(45deg, #FFD700, #FFA500)',
              '&:hover': { background: 'linear-gradient(45deg, #FFA500, #FF8C00)' },
              px: 4
            }}
          >
            Jetzt upgraden
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
