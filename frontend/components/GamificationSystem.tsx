"use client";
import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Grid, List, ListItem, ListItemIcon, ListItemText, Divider, LinearProgress, Avatar, Badge } from '@mui/material';
import { Trophy, Star, Zap, Heart, Target, BookOpen, Users, Calendar, Award, Crown, Medal, Gem, Flame, Eye, Moon, RotateCcw, Share2, Bookmark, TrendingUp, CheckCircle } from 'lucide-react';
// import { useNotifications } from './NotificationService';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'energy' | 'relationships' | 'learning' | 'community' | 'achievement' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  color: string;
  requirements: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  category: string;
  color: string;
}

interface UserStats {
  totalPoints: number;
  level: number;
  experience: number;
  experienceToNext: number;
  badgesUnlocked: number;
  totalBadges: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  streak: number;
  lastActive: Date;
  rank: string;
  nextRank: string;
  pointsToNextRank: number;
}

const badges: Badge[] = [
  {
    id: '1',
    name: 'Energie-Entdecker',
    description: 'Erste sakrale Antwort erkannt',
    icon: '⚡',
    category: 'energy',
    rarity: 'common',
    points: 50,
    unlocked: true,
    unlockedAt: new Date('2024-01-15'),
    progress: 1,
    maxProgress: 1,
    color: '#10B981',
    requirements: ['Erste sakrale Antwort erkennen']
  },
  {
    id: '2',
    name: 'Dating-Meister',
    description: '10 erfolgreiche Dates gehabt',
    icon: '💖',
    category: 'relationships',
    rarity: 'rare',
    points: 200,
    unlocked: false,
    progress: 7,
    maxProgress: 10,
    color: '#EF4444',
    requirements: ['10 Dates absolvieren']
  },
  {
    id: '3',
    name: 'Wissens-Sammler',
    description: '50 Human Design Artikel gelesen',
    icon: '📚',
    category: 'learning',
    rarity: 'epic',
    points: 500,
    unlocked: false,
    progress: 32,
    maxProgress: 50,
    color: '#8B5CF6',
    requirements: ['50 Artikel lesen']
  },
  {
    id: '4',
    name: 'Community-Helfer',
    description: '100 Community-Beiträge gemacht',
    icon: '👥',
    category: 'community',
    rarity: 'legendary',
    points: 1000,
    unlocked: false,
    progress: 23,
    maxProgress: 100,
    color: '#F59E0B',
    requirements: ['100 Beiträge in der Community']
  },
  {
    id: '5',
    name: 'Mondkalender-Experte',
    description: '30 Tage Mondkalender geführt',
    icon: '🌙',
    category: 'achievement',
    rarity: 'rare',
    points: 300,
    unlocked: true,
    unlockedAt: new Date('2024-01-20'),
    progress: 30,
    maxProgress: 30,
    color: '#06B6D4',
    requirements: ['30 Tage Mondkalender führen']
  },
  {
    id: '6',
    name: 'Chart-Experte',
    description: '20 Human Design Charts erstellt',
    icon: '📊',
    category: 'learning',
    rarity: 'epic',
    points: 400,
    unlocked: false,
    progress: 12,
    maxProgress: 20,
    color: '#8B5CF6',
    requirements: ['20 Charts erstellen']
  }
];

const achievements: Achievement[] = [
  {
    id: '1',
    title: 'Erste Schritte',
    description: 'Dein erstes Human Design Chart erstellt',
    icon: '🎯',
    points: 100,
    unlocked: true,
    unlockedAt: new Date('2024-01-10'),
    category: 'learning',
    color: '#10B981'
  },
  {
    id: '2',
    title: 'Dating-Start',
    description: 'Dein erstes Date über die App geplant',
    icon: '💕',
    points: 150,
    unlocked: true,
    unlockedAt: new Date('2024-01-12'),
    category: 'relationships',
    color: '#EF4444'
  },
  {
    id: '3',
    title: 'Community-Mitglied',
    description: 'Ersten Beitrag in der Community gepostet',
    icon: '👥',
    points: 75,
    unlocked: true,
    unlockedAt: new Date('2024-01-14'),
    category: 'community',
    color: '#F59E0B'
  },
  {
    id: '4',
    title: 'Wissensdurst',
    description: '10 Artikel gelesen',
    icon: '📖',
    points: 200,
    unlocked: false,
    category: 'learning',
    color: '#8B5CF6'
  },
  {
    id: '5',
    title: 'Energie-Meister',
    description: 'Alle Energie-Badges freigeschaltet',
    icon: '⚡',
    points: 500,
    unlocked: false,
    category: 'energy',
    color: '#10B981'
  }
];

const getRarityColor = (rarity: Badge['rarity']) => {
  switch (rarity) {
    case 'common':
      return '#6b7280';
    case 'rare':
      return '#3b82f6';
    case 'epic':
      return '#8b5cf6';
    case 'legendary':
      return '#f59e0b';
    default:
      return '#6b7280';
  }
};

const getRarityIcon = (rarity: Badge['rarity']) => {
  switch (rarity) {
    case 'common':
      return <Star size={16} />;
    case 'rare':
      return <Gem size={16} />;
    case 'epic':
      return <Crown size={16} />;
    case 'legendary':
      return <Trophy size={16} />;
    default:
      return <Star size={16} />;
  }
};

const getCategoryIcon = (category: Badge['category']) => {
  switch (category) {
    case 'energy':
      return <Zap size={16} />;
    case 'relationships':
      return <Heart size={16} />;
    case 'learning':
      return <BookOpen size={16} />;
    case 'community':
      return <Users size={16} />;
    case 'achievement':
      return <Award size={16} />;
    case 'special':
      return <Crown size={16} />;
    default:
      return <Star size={16} />;
  }
};

const getRankInfo = (level: number) => {
  if (level < 10) return { rank: 'Anfänger', nextRank: 'Entdecker', color: '#6b7280' };
  if (level < 25) return { rank: 'Entdecker', nextRank: 'Experte', color: '#F29F05' };
  if (level < 50) return { rank: 'Experte', nextRank: 'Meister', color: '#F29F05' };
  if (level < 100) return { rank: 'Meister', nextRank: 'Legende', color: '#F29F05' };
  return { rank: 'Legende', nextRank: 'Legende', color: '#F29F05' };
};

export default function GamificationSystem() {
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 1250,
    level: 15,
    experience: 750,
    experienceToNext: 250,
    badgesUnlocked: 2,
    totalBadges: badges.length,
    achievementsUnlocked: 3,
    totalAchievements: achievements.length,
    streak: 7,
    lastActive: new Date(),
    rank: 'Entdecker',
    nextRank: 'Experte',
    pointsToNextRank: 500
  });
  
  const [showBadges, setShowBadges] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [savedStats, setSavedStats] = useState<string[]>([]);
  // const { addNotification } = useNotifications();
  
  // Temporary notification function
  const addNotification = (notification: any) => {
    // You can implement a simple alert or toast here
    alert(`${notification.title}: ${notification.message}`);
  };

  useEffect(() => {
    // Load saved stats
    const saved = localStorage.getItem('saved-gamification-stats');
    if (saved) {
      setSavedStats(JSON.parse(saved));
    }
  }, []);

  const handleBadgeSelect = (badge: Badge) => {
    setSelectedBadge(badge);
  };

  const handleSave = () => {
    const newSaved = [...savedStats, 'gamification-stats'];
    setSavedStats(newSaved);
    localStorage.setItem('saved-gamification-stats', JSON.stringify(newSaved));
    
    addNotification({
      type: 'success',
      title: '💾 Gespeichert',
      message: 'Deine Gamification-Statistiken wurden gespeichert!',
    });
  };

  const handleShare = () => {
    const rankInfo = getRankInfo(userStats.level);
    const shareText = `🏆 Meine Human Design Gamification-Statistiken:\n\n⭐ Level: ${userStats.level} (${rankInfo.rank})\n💎 Punkte: ${userStats.totalPoints}\n🎖️ Badges: ${userStats.badgesUnlocked}/${userStats.totalBadges}\n🏅 Achievements: ${userStats.achievementsUnlocked}/${userStats.totalAchievements}\n🔥 Streak: ${userStats.streak} Tage\n\n#HumanDesign #Gamification #HDApp`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Meine Human Design Gamification-Statistiken',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      addNotification({
        type: 'success',
        title: '📋 Kopiert',
        message: 'Deine Statistiken wurden in die Zwischenablage kopiert!',
      });
    }
  };

  const rankInfo = getRankInfo(userStats.level);
  const levelProgress = (userStats.experience / (userStats.experience + userStats.experienceToNext)) * 100;

  return (
    <Box>
      {/* User Stats Overview */}
      <Box
        sx={{
          opacity: 1,
          transform: 'translateY(0)',
          transition: 'all 0.5s ease'
        }}
      >
        <Card
          sx={{
            background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.25) 0%, rgba(140, 29, 4, 0.15) 100%)',
            border: '2px solid rgba(242, 159, 5, 0.4)',
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative',
            mb: 4,
            boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px rgba(242, 159, 5, 0.3)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h2" sx={{ fontSize: '3rem' }}>
                  🏆
                </Typography>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: '#FFFFFF', mb: 1 }}>
                    Level {userStats.level} - {rankInfo.rank}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {userStats.totalPoints} Punkte • {userStats.streak} Tage Streak
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={handleSave}
                  size="small"
                  sx={{ color: 'rgba(255, 255, 255, 0.8)', '&:hover': { color: '#F29F05' } }}
                >
                  <Bookmark size={16} />
                </IconButton>
                <IconButton
                  onClick={handleShare}
                  size="small"
                  sx={{ color: 'rgba(255, 255, 255, 0.8)', '&:hover': { color: '#F29F05' } }}
                >
                  <Share2 size={16} />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Chip
                icon={<Star size={16} />}
                label={`${userStats.totalPoints} Punkte`}
                sx={{
                  backgroundColor: 'rgba(242, 159, 5, 0.2)',
                  color: '#F29F05',
                  border: '1px solid rgba(242, 159, 5, 0.4)',
                  fontWeight: 600,
                }}
              />
              <Chip
                icon={<Trophy size={16} />}
                label={`${userStats.badgesUnlocked}/${userStats.totalBadges} Badges`}
                sx={{
                  backgroundColor: 'rgba(242, 159, 5, 0.2)',
                  color: '#F29F05',
                  border: '1px solid rgba(242, 159, 5, 0.4)',
                  fontWeight: 600,
                }}
              />
              <Chip
                icon={<Award size={16} />}
                label={`${userStats.achievementsUnlocked}/${userStats.totalAchievements} Achievements`}
                sx={{
                  backgroundColor: 'rgba(242, 159, 5, 0.2)',
                  color: '#F29F05',
                  border: '1px solid rgba(242, 159, 5, 0.4)',
                  fontWeight: 600,
                }}
              />
              <Chip
                icon={<Flame size={16} />}
                label={`${userStats.streak} Tage Streak`}
                sx={{
                  backgroundColor: 'rgba(242, 159, 5, 0.2)',
                  color: '#F29F05',
                  border: '1px solid rgba(242, 159, 5, 0.4)',
                  fontWeight: 600,
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Level Fortschritt
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {userStats.experience}/{userStats.experience + userStats.experienceToNext} XP
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={levelProgress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    borderRadius: 4,
                  },
                }}
              />
            </Box>

            <Typography variant="h6" sx={{ color: '#F29F05', mb: 2, fontWeight: 600 }}>
              🎯 Nächster Rang: {rankInfo.nextRank} ({userStats.pointsToNextRank} Punkte)
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Badges and Achievements */}
      <Box
        sx={{
          opacity: 1,
          transform: 'translateY(0)',
          transition: 'all 0.5s ease'
        }}
      >
        <Grid container spacing={3}>
          {/* Badges */}
          <Grid item xs={12} md={6}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
              p: 3
            }}>
              <Typography variant="h5" sx={{ color: 'text.primary', mb: 3, fontWeight: 600 }}>
                🏅 Badges
              </Typography>
              
              <Grid container spacing={2}>
                {badges.map((badge, index) => (
                  <Grid item xs={12} sm={6} key={badge.id}>
                    <Box
                      sx={{
                        opacity: 1,
                        transform: 'translateY(0)',
                        transition: 'all 0.5s ease'
                      }}
                    >
                      <Card
                        sx={{
                          background: badge.unlocked 
                            ? `linear-gradient(135deg, ${badge.color}20, ${badge.color}10)`
                            : 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${badge.unlocked ? badge.color + '40' : 'rgba(255,255,255,0.1)'}`,
                          borderRadius: 2,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          opacity: badge.unlocked ? 1 : 0.6,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 25px ${badge.color}20`,
                          },
                        }}
                        onClick={() => handleBadgeSelect(badge)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Typography variant="h4">
                              {badge.icon}
                            </Typography>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {badge.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {getRarityIcon(badge.rarity)}
                                <Typography variant="caption" sx={{ color: getRarityColor(badge.rarity) }}>
                                  {badge.rarity}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                          
                          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                            {badge.description}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            {getCategoryIcon(badge.category)}
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {badge.category}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ mb: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={(badge.progress / badge.maxProgress) * 100}
                              sx={{
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: badge.color,
                                  borderRadius: 2,
                                },
                              }}
                            />
                          </Box>
                          
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {badge.points} Punkte
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Card>
          </Grid>

          {/* Achievements */}
          <Grid item xs={12} md={6}>
            <Card sx={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 3,
              p: 3
            }}>
              <Typography variant="h5" sx={{ color: 'text.primary', mb: 3, fontWeight: 600 }}>
                🏅 Achievements
              </Typography>
              
              <List>
                {achievements.map((achievement, index) => (
                  <Box
                    key={achievement.id}
                    sx={{
                      opacity: 1,
                      transform: 'translateX(0)',
                      transition: 'all 0.5s ease'
                    }}
                  >
                    <ListItem
                      sx={{
                        background: achievement.unlocked 
                          ? `linear-gradient(135deg, ${achievement.color}15, ${achievement.color}05)`
                          : 'rgba(255, 255, 255, 0.05)',
                        borderRadius: 2,
                        mb: 1,
                        border: `1px solid ${achievement.unlocked ? achievement.color + '30' : 'rgba(255,255,255,0.1)'}`,
                        opacity: achievement.unlocked ? 1 : 0.6,
                      }}
                    >
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            backgroundColor: achievement.unlocked ? achievement.color : 'rgba(255,255,255,0.1)',
                            width: 40,
                            height: 40,
                          }}
                        >
                          <Typography variant="h6">
                            {achievement.icon}
                          </Typography>
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {achievement.title}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                              {achievement.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" sx={{ color: achievement.color }}>
                                {achievement.points} Punkte
                              </Typography>
                              {achievement.unlocked && (
                                <CheckCircle size={16} color={achievement.color} />
                              )}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  </Box>
                ))}
              </List>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Badge Details Dialog */}
      <Dialog
        open={!!selectedBadge}
        onClose={() => setSelectedBadge(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            {selectedBadge?.icon}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {selectedBadge?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {selectedBadge?.description}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Anforderungen:
            </Typography>
            {selectedBadge?.requirements.map((req, index) => (
              <Typography key={index} variant="body2" sx={{ color: 'text.secondary' }}>
                • {req}
              </Typography>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Chip
              icon={getRarityIcon(selectedBadge?.rarity || 'common')}
              label={selectedBadge?.rarity}
              sx={{ backgroundColor: getRarityColor(selectedBadge?.rarity || 'common') + '20' }}
            />
            <Chip
              icon={getCategoryIcon(selectedBadge?.category || 'energy')}
              label={selectedBadge?.category}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Fortschritt: {selectedBadge?.progress}/{selectedBadge?.maxProgress}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={selectedBadge ? (selectedBadge.progress / selectedBadge.maxProgress) * 100 : 0}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: selectedBadge?.color || '#8B5CF6',
                  borderRadius: 3,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedBadge(null)}>
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
