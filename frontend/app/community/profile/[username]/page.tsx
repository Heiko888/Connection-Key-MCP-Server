'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Grid,
  Button,
  Divider,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ArrowLeft,
  MessageCircle,
  Heart,
  Star,
  Calendar,
  MapPin,
  User,
  Award,
  Activity,
  Users,
  Share2,
  Mail
} from 'lucide-react';
import { motion } from 'framer-motion';
import Logo from '../../../components/Logo';

interface UserProfile {
  username: string;
  name: string;
  avatar: string;
  type: string;
  bio?: string;
  location?: string;
  joinDate?: string;
  posts: number;
  followers: number;
  following: number;
  hdType?: string;
  hdProfile?: string;
  hdStrategy?: string;
  hdAuthority?: string;
  interests?: string[];
  recentPosts?: Array<{
    id: number;
    content: string;
    timestamp: string;
    likes: number;
    comments: number;
  }>;
}

export default function CommunityProfilePage() {
  const router = useRouter();
  const params = useParams();
  const username = params?.username as string;
  const [activeTab, setActiveTab] = useState(0);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: ERSETZEN DURCH API-CALL - Community-Profile mit echten Daten
    // Siehe: SYSTEMBEREINIGUNG-UND-PLAN.md - Priorität 1
    // API-Route: /api/community/profile/[username]
    // Mock-Daten für das Profil - später durch API-Aufruf ersetzen
    const loadProfile = () => {
      // Simuliere API-Aufruf
      setTimeout(() => {
        setProfile({
          username: username || 'user',
          name: username ? username.charAt(0).toUpperCase() + username.slice(1) : 'Benutzer',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'User')}&background=F29F05&color=fff&size=200`,
          type: 'Generator',
          bio: 'Leidenschaftlicher Human Design Enthusiast. Ich liebe es, mich mit anderen über unsere einzigartigen Designs auszutauschen und gemeinsam zu wachsen.',
          location: 'Berlin, Deutschland',
          joinDate: '2024-01-15',
          posts: 42,
          followers: 128,
          following: 89,
          hdType: 'Generator',
          hdProfile: '5/1',
          hdStrategy: 'Antworten',
          hdAuthority: 'Sakral',
          interests: ['Human Design', 'Spiritualität', 'Yoga', 'Meditation', 'Beziehungen'],
          recentPosts: [
            {
              id: 1,
              content: 'Heute habe ich eine wunderbare Resonanz mit einem anderen Generator erlebt. Die Energie war einfach unglaublich!',
              timestamp: 'vor 2 Tagen',
              likes: 24,
              comments: 8
            },
            {
              id: 2,
              content: 'Neue Erkenntnisse über mein 5/1 Profil. Die Rolle des Heretikers wird immer klarer für mich.',
              timestamp: 'vor 5 Tagen',
              likes: 18,
              comments: 5
            }
          ]
        });
        setLoading(false);
      }, 500);
    };

    loadProfile();
  }, [username]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: 'white' }}>Lädt Profil...</Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: 'white' }}>Profil nicht gefunden</Typography>
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
      overflow: 'hidden',
    }}>
      {/* Animierte Sterne */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
            background: '#F29F05',
            borderRadius: '50%',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            pointerEvents: 'none',
            opacity: Math.random() * 0.6 + 0.2,
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

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, pt: { xs: 4, md: 6 }, pb: 8, px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Zurück Button */}
        <Button
          variant="outlined"
          onClick={() => router.push('/community')}
          startIcon={<ArrowLeft size={20} />}
          sx={{
            color: '#F29F05',
            borderColor: 'rgba(242, 159, 5, 0.5)',
            mb: 4,
            '&:hover': {
              borderColor: '#F29F05',
              background: 'rgba(242, 159, 5, 0.1)'
            }
          }}
        >
          Zurück zur Community
        </Button>

        {/* Profil Header */}
        <Card sx={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          border: '1px solid rgba(242, 159, 5, 0.20)',
          boxShadow: '0 8px 32px rgba(242, 159, 5, 0.15)',
          mb: 4,
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Avatar
                  src={profile.avatar}
                  sx={{
                    width: { xs: 120, md: 160 },
                    height: { xs: 120, md: 160 },
                    mx: { xs: 'auto', md: 0 },
                    mb: 2,
                    border: '4px solid rgba(242, 159, 5, 0.4)',
                    boxShadow: '0 0 30px rgba(242, 159, 5, 0.3)'
                  }}
                />
                <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' }, mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<MessageCircle size={18} />}
                    sx={{
                      background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #8C1D04, #F29F05)'
                      }
                    }}
                  >
                    Nachricht
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Heart size={18} />}
                    sx={{
                      borderColor: 'rgba(242, 159, 5, 0.5)',
                      color: '#F29F05',
                      '&:hover': {
                        borderColor: '#F29F05',
                        background: 'rgba(242, 159, 5, 0.1)'
                      }
                    }}
                  >
                    Folgen
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} md={8}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                    {profile.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={profile.type}
                      sx={{
                        background: 'rgba(242, 159, 5, 0.20)',
                        color: '#F29F05',
                        fontWeight: 600
                      }}
                    />
                    {profile.hdProfile && (
                      <Chip
                        label={`Profil ${profile.hdProfile}`}
                        sx={{
                          background: 'rgba(242, 159, 5, 0.15)',
                          color: '#F29F05',
                          fontWeight: 600
                        }}
                      />
                    )}
                  </Box>
                  {profile.bio && (
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2, lineHeight: 1.7 }}>
                      {profile.bio}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    {profile.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MapPin size={18} style={{ color: '#F29F05' }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {profile.location}
                        </Typography>
                      </Box>
                    )}
                    {profile.joinDate && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Calendar size={18} style={{ color: '#F29F05' }} />
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          Mitglied seit {new Date(profile.joinDate).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* Stats */}
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={4}>
                    <Paper sx={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      p: 2,
                      textAlign: 'center',
                      borderRadius: 2
                    }}>
                      <Typography variant="h5" sx={{ color: '#F29F05', fontWeight: 700 }}>
                        {profile.posts}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Posts
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      p: 2,
                      textAlign: 'center',
                      borderRadius: 2
                    }}>
                      <Typography variant="h5" sx={{ color: '#F29F05', fontWeight: 700 }}>
                        {profile.followers}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Follower
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      p: 2,
                      textAlign: 'center',
                      borderRadius: 2
                    }}>
                      <Typography variant="h5" sx={{ color: '#F29F05', fontWeight: 700 }}>
                        {profile.following}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Folgt
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Paper sx={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          border: '1px solid rgba(242, 159, 5, 0.30)',
          mb: 4
        }}>
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 600,
                '&.Mui-selected': {
                  color: '#F29F05'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#F29F05'
              }
            }}
          >
            <Tab label="Posts" />
            <Tab label="Human Design" />
            <Tab label="Interessen" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 0 && (
          <Box>
            {profile.recentPosts && profile.recentPosts.length > 0 ? (
              profile.recentPosts.map((post) => (
                <Card
                  key={post.id}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: 3,
                    border: '1px solid rgba(242, 159, 5, 0.20)',
                    mb: 2,
                    '&:hover': {
                      border: '1px solid rgba(242, 159, 5, 0.30)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, lineHeight: 1.7 }}>
                      {post.content}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, pt: 2, borderTop: '1px solid rgba(242, 159, 5, 0.1)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Heart size={18} style={{ color: 'rgba(255,255,255,0.7)' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {post.likes}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MessageCircle size={18} style={{ color: 'rgba(255,255,255,0.7)' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                          {post.comments}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', ml: 'auto' }}>
                        {post.timestamp}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: '1px solid rgba(242, 159, 5, 0.20)',
                p: 4,
                textAlign: 'center'
              }}>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Noch keine Posts vorhanden
                </Typography>
              </Card>
            )}
          </Box>
        )}

        {activeTab === 1 && (
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid rgba(242, 159, 5, 0.20)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {profile.hdType && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
                        Human Design Typ
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700, mt: 0.5 }}>
                        {profile.hdType}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {profile.hdProfile && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
                        Profil
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700, mt: 0.5 }}>
                        {profile.hdProfile}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {profile.hdStrategy && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
                        Strategie
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700, mt: 0.5 }}>
                        {profile.hdStrategy}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {profile.hdAuthority && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>
                        Autorität
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#F29F05', fontWeight: 700, mt: 0.5 }}>
                        {profile.hdAuthority}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        )}

        {activeTab === 2 && (
          <Card sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            borderRadius: 3,
            border: '1px solid rgba(242, 159, 5, 0.20)'
          }}>
            <CardContent sx={{ p: 3 }}>
              {profile.interests && profile.interests.length > 0 ? (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {profile.interests.map((interest, index) => (
                    <Chip
                      key={index}
                      label={interest}
                      sx={{
                        background: 'rgba(242, 159, 5, 0.15)',
                        color: '#F29F05',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        py: 2
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Noch keine Interessen angegeben
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}

