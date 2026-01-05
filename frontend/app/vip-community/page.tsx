'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Chip,
  Avatar,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Fab
} from '@mui/material';
import { 
  Crown, 
  Star,
  Users, 
  Calendar,
  MessageCircle, 
  Plus,
  Award,
  Heart,
  Share2,
  Clock,
  TrendingUp,
  ThumbsUp,
  Bookmark,
  Settings
} from 'lucide-react';
import AccessControl from '@/components/AccessControl';
import PageLayout from '../components/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

interface VIPPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    title: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  category: 'business' | 'dating' | 'spiritual' | 'general';
  tags: string[];
  isLiked: boolean;
  isBookmarked: boolean;
}

interface VIPEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  category: 'masterclass' | 'networking' | 'retreat' | 'workshop';
  price: number;
  image: string;
  host: {
    name: string;
    avatar: string;
  };
}

interface VIPGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  category: 'business' | 'dating' | 'spiritual' | 'mastermind';
  isPrivate: boolean;
  avatar: string;
  recentActivity: string;
  joinRequest: boolean;
}

function VIPCommunityPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [posts, setPosts] = useState<VIPPost[]>([]);
  const [events, setEvents] = useState<VIPEvent[]>([]);
  const [groups, setGroups] = useState<VIPGroup[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState<{
    content: string;
    category: 'business' | 'dating' | 'spiritual' | 'general';
    tags: string;
  }>({
    content: '',
    category: 'general',
    tags: ''
  });

  useEffect(() => {
    loadVIPCommunityData();
  }, []);

  const loadVIPCommunityData = async () => {
    try {
      // Simuliere VIP Community Daten
      setPosts([
        {
          id: '1',
          author: {
            name: 'Dr. Sarah Chen',
            avatar: '/avatars/coach1.jpg',
            title: 'Human Design Expert',
            verified: true
          },
          content: '🌟 Neueste Erkenntnisse aus der Human Design Forschung: Wie sich die Energie der verschiedenen Typen in der digitalen Welt manifestiert. Spannende Diskussionen erwünscht!',
          image: '/images/hd-research.jpg',
          timestamp: '2 Stunden',
          likes: 47,
          comments: 12,
          shares: 8,
          category: 'spiritual',
          tags: ['Human Design', 'Forschung', 'Energie'],
          isLiked: false,
          isBookmarked: true
        },
        {
          id: '2',
          author: {
            name: 'Marcus Weber',
            avatar: '/avatars/coach2.jpg',
            title: 'Dating Coach',
            verified: true
          },
          content: '💕 Erfolgsgeschichte: Ein VIP-Mitglied hat durch die Anwendung seiner Human Design-Strategie seine Traumpartnerin gefunden! Die Macht der Authentizität ist real. 🎯',
          timestamp: '4 Stunden',
          likes: 89,
          comments: 23,
          shares: 15,
          category: 'dating',
          tags: ['Erfolg', 'Dating', 'Authentizität'],
          isLiked: true,
          isBookmarked: false
        },
        {
          id: '3',
          author: {
            name: 'Elena Rodriguez',
            avatar: '/avatars/coach3.jpg',
            title: 'Spiritual Guide',
            verified: true
          },
          content: '🧘‍♀️ VIP Retreat 2024 - Die Anmeldung ist offen! 3 Tage intensive Human Design Praxis in den Bergen. Nur für VIP-Mitglieder. Wer ist dabei?',
          timestamp: '6 Stunden',
          likes: 156,
          comments: 45,
          shares: 32,
          category: 'spiritual',
          tags: ['Retreat', 'VIP', 'Praxis'],
          isLiked: false,
          isBookmarked: true
        }
      ]);

      setEvents([
        {
          id: '1',
          title: 'VIP Masterclass: Business & Human Design',
          description: 'Lerne, wie du dein Human Design für Business-Erfolg nutzt. Exklusive Strategien nur für VIP-Mitglieder.',
          date: '2024-01-15',
          time: '19:00',
          location: 'Online (Zoom)',
          attendees: 47,
          maxAttendees: 50,
          category: 'masterclass',
          price: 0,
          image: '/images/masterclass-business.jpg',
          host: {
            name: 'Dr. Sarah Chen',
            avatar: '/avatars/coach1.jpg'
          }
        },
        {
          id: '2',
          title: 'Exclusive Networking Event',
          description: 'Treffe andere VIP-Mitglieder und baue wertvolle Verbindungen auf. Mit Human Design Kompatibilitäts-Analyse.',
          date: '2024-01-22',
          time: '18:30',
          location: 'Berlin, Hotel Adlon',
          attendees: 23,
          maxAttendees: 30,
          category: 'networking',
          price: 0,
          image: '/images/networking-event.jpg',
          host: {
            name: 'Marcus Weber',
            avatar: '/avatars/coach2.jpg'
          }
        },
        {
          id: '3',
          title: 'VIP Retreat 2024',
          description: '3 Tage intensive Human Design Praxis in den Schweizer Alpen. Transformation garantiert!',
          date: '2024-03-15',
          time: '09:00',
          location: 'Schweiz, Alpen Resort',
          attendees: 12,
          maxAttendees: 20,
          category: 'retreat',
          price: 2999,
          image: '/images/retreat-alps.jpg',
          host: {
            name: 'Elena Rodriguez',
            avatar: '/avatars/coach3.jpg'
          }
        }
      ]);

      setGroups([
        {
          id: '1',
          name: 'VIP Business Network',
          description: 'Exklusive Gruppe für erfolgreiche Unternehmer und Business-Profis',
          members: 1247,
          category: 'business',
          isPrivate: true,
          avatar: '/images/business-network.jpg',
          recentActivity: 'Vor 2 Stunden',
          joinRequest: false
        },
        {
          id: '2',
          name: 'Elite Dating Circle',
          description: 'Premium Dating-Gruppe für bewusste Singles',
          members: 892,
          category: 'dating',
          isPrivate: true,
          avatar: '/images/dating-circle.jpg',
          recentActivity: 'Vor 1 Stunde',
          joinRequest: false
        },
        {
          id: '3',
          name: 'Mastermind Group',
          description: 'Kleine, exklusive Gruppe für tiefe Transformation',
          members: 156,
          category: 'mastermind',
          isPrivate: true,
          avatar: '/images/mastermind.jpg',
          recentActivity: 'Vor 30 Minuten',
          joinRequest: true
        }
      ]);
    } catch (error) {
      console.error('Fehler beim Laden der VIP Community Daten:', error);
    }
  };

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  const handleBookmarkPost = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isBookmarked: !post.isBookmarked }
        : post
    ));
  };

  const handleJoinEvent = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, attendees: event.attendees + 1 }
        : event
    ));
  };

  const handleJoinGroup = (groupId: string) => {
    setGroups(groups.map(group => 
      group.id === groupId 
        ? { ...group, joinRequest: !group.joinRequest }
        : group
    ));
  };

  const handleCreatePost = () => {
    const post: VIPPost = {
      id: Date.now().toString(),
      author: {
        name: 'Du',
        avatar: '/avatars/user.jpg',
        title: 'VIP Member',
        verified: true
      },
      content: newPost.content,
      timestamp: 'Gerade eben',
      likes: 0,
      comments: 0,
      shares: 0,
      category: newPost.category,
      tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      isLiked: false,
      isBookmarked: false
    };
    
    setPosts([post, ...posts]);
    setNewPost({ content: '', category: 'general', tags: '' });
    setShowCreatePost(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business': return '#3b82f6';
      case 'dating': return '#ef4444';
      case 'spiritual': return '#8b5cf6';
      case 'mastermind': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'business': return <TrendingUp size={16} />;
      case 'dating': return <Heart size={16} />;
      case 'spiritual': return <Star size={16} />;
      case 'mastermind': return <Award size={16} />;
      default: return <Users size={16} />;
    }
  };

  return (
    <AccessControl path="/vip-community">
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
      color: 'white'
    }}>
        <PageLayout activePage="dashboard" showLogo={true} maxWidth="lg">
          {/* Header */}
          <motion.div
            
            
            
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Crown size={48} color="#F29F05" style={{ marginRight: 16 }} />
                <Box>
                  <Typography variant="h3" sx={{ 
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 700, 
                    mb: 1 
                  }}>
                    👑 VIP Community
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                    Exklusive Community für Premium-Mitglieder
                  </Typography>
                </Box>
              </Box>
              <Chip 
                  label="VIP Only" 
              sx={{ 
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    color: '#fff',
                fontWeight: 600,
                    fontSize: '1rem',
                px: 2,
                py: 1,
                boxShadow: '0 4px 20px rgba(242, 159, 5, 0.3)'
              }} 
            />
          </Box>
        </motion.div>

          {/* Tabs */}
        <motion.div
            
          
            
        >
            <Paper sx={{ 
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.1) 0%, rgba(140, 29, 4, 0.05) 100%)',
                backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.2)',
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(242, 159, 5, 0.1)'
            }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    color: 'rgba(255,255,255,0.7)',
                    '&.Mui-selected': {
                      color: '#F29F05'
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#F29F05'
                  }
                }}
              >
                <Tab label="Feed" icon={<MessageCircle size={20} />} />
                <Tab label="Events" icon={<Calendar size={20} />} />
                <Tab label="Gruppen" icon={<Users size={20} />} />
              </Tabs>

              {/* Feed Tab */}
              {activeTab === 0 && (
                <Box sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>
                      🌟 VIP Feed
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Plus size={20} />}
                      onClick={() => setShowCreatePost(true)}
                      sx={{
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        color: '#fff',
                        fontWeight: 600,
                        boxShadow: '0 4px 20px rgba(242, 159, 5, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 25px rgba(242, 159, 5, 0.4)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Post erstellen
                    </Button>
                  </Box>

                  <Grid container spacing={3}>
                    {posts.map((post) => (
                      <Grid item xs={12} key={post.id}>
                        <Card sx={{
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.1) 0%, rgba(140, 29, 4, 0.05) 100%)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(242, 159, 5, 0.2)',
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 20px rgba(242, 159, 5, 0.1)',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.3)',
                            borderColor: 'rgba(242, 159, 5, 0.5)'
                          }
                        }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar src={post.author.avatar} sx={{ width: 50, height: 50, mr: 2 }} />
                              <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="h6" sx={{ color: '#fff' }}>
                                    {post.author.name}
                            </Typography>
                                  {post.author.verified && (
                                    <Crown size={16} color="#F29F05" />
                                  )}
                            <Chip 
                                    label={post.author.title} 
                              size="small" 
                              sx={{ 
                                      background: 'rgba(242, 159, 5, 0.2)',
                                      color: '#F29F05',
                                      fontSize: '0.7rem',
                                      fontWeight: 600
                              }} 
                            />
                          </Box>
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                  {post.timestamp}
                                </Typography>
                              </Box>
                              <IconButton sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                <Settings size={20} />
                              </IconButton>
                            </Box>

                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, lineHeight: 1.6 }}>
                              {post.content}
                            </Typography>

                            {post.image && (
                              <Box sx={{ mb: 2, borderRadius: 2, overflow: 'hidden', position: 'relative', width: '100%', height: '200px' }}>
                                <Image 
                                  src={post.image} 
                                  alt="Post" 
                                  fill
                                  style={{ objectFit: 'cover' }}
                                />
                              </Box>
                            )}

                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                              {post.tags.map((tag, index) => (
                                <Chip 
                                  key={index}
                                  label={`#${tag}`} 
                                  size="small" 
                                  sx={{ 
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    color: '#8B5CF6',
                                    fontSize: '0.7rem'
                                  }} 
                                />
                              ))}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <IconButton 
                                onClick={() => handleLikePost(post.id)}
                                sx={{ color: post.isLiked ? '#ef4444' : 'rgba(255,255,255,0.7)' }}
                              >
                                <ThumbsUp size={20} />
                              </IconButton>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                {post.likes}
                              </Typography>

                              <IconButton sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                <MessageCircle size={20} />
                              </IconButton>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                {post.comments}
                              </Typography>

                              <IconButton sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                <Share2 size={20} />
                              </IconButton>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                {post.shares}
                              </Typography>

                              <Box sx={{ ml: 'auto' }}>
                                <IconButton 
                                  onClick={() => handleBookmarkPost(post.id)}
                                  sx={{ color: post.isBookmarked ? '#F29F05' : 'rgba(255,255,255,0.7)' }}
                                >
                                  <Bookmark size={20} />
                                </IconButton>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Events Tab */}
              {activeTab === 1 && (
                <Box sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                    🎯 VIP Events
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {events.map((event) => (
                      <Grid item xs={12} md={6} key={event.id}>
                        <Card sx={{
                          background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.1) 0%, rgba(140, 29, 4, 0.05) 100%)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(242, 159, 5, 0.2)',
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 20px rgba(242, 159, 5, 0.1)',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.3)',
                            borderColor: 'rgba(242, 159, 5, 0.5)'
                          }
                        }}>
                          <Box sx={{ position: 'relative', width: '100%', height: '200px' }}>
                            <Image 
                              src={event.image} 
                              alt={event.title}
                              fill
                              style={{ objectFit: 'cover' }}
                            />
                            <Chip 
                              label={event.category.toUpperCase()} 
                              size="small" 
                              sx={{ 
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                background: getCategoryColor(event.category),
                                color: '#fff',
                                fontWeight: 600
                              }} 
                            />
                          </Box>
                          
                          <CardContent>
                            <Typography variant="h6" sx={{ color: '#fff', mb: 1 }}>
                              {event.title}
                            </Typography>
                            
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                              {event.description}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Calendar size={16} color="#F29F05" style={{ marginRight: 8 }} />
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                {event.date} um {event.time}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Users size={16} color="#F29F05" style={{ marginRight: 8 }} />
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                {event.attendees}/{event.maxAttendees} Teilnehmer
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Clock size={16} color="#F29F05" style={{ marginRight: 8 }} />
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                {event.location}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                              <Avatar src={event.host.avatar} sx={{ width: 32, height: 32, mr: 1 }} />
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                Host: {event.host.name}
                              </Typography>
                            </Box>
                            
                <Button 
                  fullWidth 
                              variant="contained"
                              onClick={() => handleJoinEvent(event.id)}
                              disabled={event.attendees >= event.maxAttendees}
                  sx={{ 
                                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                                color: '#fff',
                                fontWeight: 600,
                                boxShadow: '0 4px 20px rgba(242, 159, 5, 0.3)',
                                '&:hover': {
                                  background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 6px 25px rgba(242, 159, 5, 0.4)'
                                },
                                '&:disabled': {
                                  background: 'rgba(255,255,255,0.1)',
                                  color: 'rgba(255,255,255,0.3)',
                                  boxShadow: 'none'
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              {event.attendees >= event.maxAttendees ? 'Ausgebucht' : 'Teilnehmen'}
                </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
          </Grid>
                </Box>
              )}

              {/* Groups Tab */}
              {activeTab === 2 && (
                <Box sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
                    👥 VIP Gruppen
                  </Typography>
                  
                  <Grid container spacing={3}>
                    {groups.map((group) => (
                      <Grid item xs={12} md={4} key={group.id}>
                        <Card sx={{
                          background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.1) 0%, rgba(140, 29, 4, 0.05) 100%)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(242, 159, 5, 0.2)',
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 20px rgba(242, 159, 5, 0.1)',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.3)',
                            borderColor: 'rgba(242, 159, 5, 0.5)'
                          }
                        }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Avatar 
                                src={group.avatar} 
                                sx={{ width: 60, height: 60, mr: 2 }}
                              />
                              <Box>
                                <Typography variant="h6" sx={{ color: '#fff' }}>
                                  {group.name}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {getCategoryIcon(group.category)}
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                    {group.members} Mitglieder
                          </Typography>
                                </Box>
                              </Box>
                            </Box>
                            
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2 }}>
                              {group.description}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Clock size={16} color="#F29F05" style={{ marginRight: 8 }} />
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                Letzte Aktivität: {group.recentActivity}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                              <Crown size={16} color="#F29F05" style={{ marginRight: 8 }} />
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                                {group.isPrivate ? 'Private Gruppe' : 'Öffentliche Gruppe'}
                              </Typography>
                          </Box>
                            
                <Button 
                  fullWidth 
                              variant="contained"
                              onClick={() => handleJoinGroup(group.id)}
                  sx={{ 
                                background: group.joinRequest 
                                  ? 'linear-gradient(135deg, #10b981, #059669)'
                                  : 'linear-gradient(135deg, #F29F05, #8C1D04)',
                                color: '#fff',
                                fontWeight: 600,
                                boxShadow: '0 4px 20px rgba(242, 159, 5, 0.3)',
                                '&:hover': {
                                  background: group.joinRequest 
                                    ? 'linear-gradient(135deg, #059669, #047857)'
                                    : 'linear-gradient(135deg, #8C1D04, #F29F05)',
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 6px 25px rgba(242, 159, 5, 0.4)'
                                },
                                transition: 'all 0.3s ease'
                              }}
                            >
                              {group.joinRequest ? 'Beitrittsanfrage gesendet' : 'Gruppe beitreten'}
                </Button>
                          </CardContent>
                        </Card>
          </Grid>
                    ))}
        </Grid>
                </Box>
              )}
          </Paper>
        </motion.div>

          {/* Create Post Dialog */}
          <Dialog
            open={showCreatePost}
            onClose={() => setShowCreatePost(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(242, 159, 5, 0.3)',
                boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
                color: 'white'
              }
            }}
          >
            <DialogTitle sx={{ 
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 700,
              borderBottom: '1px solid rgba(242, 159, 5, 0.3)' 
            }}>
              Neuen Post erstellen
            </DialogTitle>
            <DialogContent sx={{ pt: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Was möchtest du mit der VIP Community teilen?"
                value={newPost.content}
                onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(242, 159, 5, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                }}
              />
              
              <TextField
                fullWidth
                placeholder="Tags (durch Komma getrennt)"
                value={newPost.tags}
                onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(242, 159, 5, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#F29F05' }
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' }
                }}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <Button
                onClick={() => setShowCreatePost(false)}
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleCreatePost}
                variant="contained"
                disabled={!newPost.content.trim()}
                sx={{
                  background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                  color: '#fff',
                  fontWeight: 600,
                  boxShadow: '0 4px 20px rgba(242, 159, 5, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 25px rgba(242, 159, 5, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Posten
              </Button>
            </DialogActions>
          </Dialog>

          {/* Floating Action Button */}
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              boxShadow: '0 4px 20px rgba(242, 159, 5, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                transform: 'scale(1.1)',
                boxShadow: '0 6px 25px rgba(242, 159, 5, 0.5)'
              },
              transition: 'all 0.3s ease'
            }}
            onClick={() => setShowCreatePost(true)}
          >
            <Plus size={24} />
          </Fab>
      </PageLayout>
    </Box>
    </AccessControl>
  );
}

// Hauptkomponente mit ProtectedRoute
export default function VIPCommunityPageWrapper() {
  return (
    <ProtectedRoute requiredRole="vip">
      <VIPCommunityPage />
    </ProtectedRoute>
  );
}
