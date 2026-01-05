"use client";

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Chip,
  Grid,
  Paper
} from '@mui/material';
import { Crown, Star, Zap, Gift, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { SubscriptionService, AdminService } from '../../lib/supabase/services';
import PageLayout from '../components/PageLayout';

export default function AdminPage() {
  const [userId, setUserId] = useState('');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'package' | 'users' | 'stats' | 'coach'>('package');
  const [coachUserId, setCoachUserId] = useState('');
  const [coachResult, setCoachResult] = useState<string>('');
  const [coaches, setCoaches] = useState<any[]>([]);
  const [coachSearch, setCoachSearch] = useState('');
  const [coachLoading, setCoachLoading] = useState(false);

  const handleSetPackage = async (packageId: string) => {
    if (!userId.trim()) {
      setResult('❌ Bitte User ID oder E-Mail eingeben!');
      return;
    }

    setLoading(true);
    setResult('');
    try {
      // Prüfe, ob es eine E-Mail oder User ID ist
      let targetUserId = userId.trim();
      
      // Wenn es eine E-Mail ist, suche nach User ID
      if (userId.includes('@')) {
        const response = await fetch(`/api/admin/users/search?email=${encodeURIComponent(userId)}`);
        const data = await response.json();
        if (!data.success || !data.user) {
          setResult(`❌ User mit E-Mail ${userId} nicht gefunden!`);
          setLoading(false);
          return;
        }
        targetUserId = data.user.id;
      }

      // Aktualisiere Paket über die neue API-Route (aktualisiert user_metadata.package)
      const response = await fetch('/api/admin/users/package', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: targetUserId,
          package: packageId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setResult(`✅ ${packageId.toUpperCase()} Paket erfolgreich gesetzt für ${result.user.email || targetUserId}!`);
        setUserId(''); // Reset nach erfolgreichem Update
      } else {
        setResult(`❌ Fehler: ${result.error || 'Unbekannter Fehler'}`);
      }
    } catch (error: any) {
      setResult(`❌ Fehler: ${error.message || error}`);
    }
    setLoading(false);
  };

  const handleSetCoach = async (isCoach: boolean, userId?: string) => {
    const targetUserId = userId || coachUserId.trim();
    
    if (!targetUserId) {
      setCoachResult('❌ Bitte User ID oder E-Mail eingeben!');
      return;
    }

    setCoachLoading(true);
    setCoachResult('');
    try {
      // Prüfe, ob es eine E-Mail oder User ID ist
      let finalUserId = targetUserId;
      
      // Wenn es eine E-Mail ist, suche nach User ID
      if (targetUserId.includes('@')) {
        const searchResponse = await fetch(`/api/admin/users/search?email=${encodeURIComponent(targetUserId)}`);
        const searchData = await searchResponse.json();
        if (!searchData.success || !searchData.user) {
          setCoachResult(`❌ User mit E-Mail ${targetUserId} nicht gefunden!`);
          setCoachLoading(false);
          return;
        }
        finalUserId = searchData.user.id;
      }

      // Verwende die neue API-Route
      const response = await fetch('/api/admin/users/coach', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: finalUserId,
          isCoach: isCoach,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setCoachResult(`✅ Coach-Status erfolgreich ${isCoach ? 'aktiviert' : 'deaktiviert'} für ${result.user.email || finalUserId}!`);
        setCoachUserId(''); // Reset
        // Lade Coaches neu, wenn wir im Coach-Tab sind
        if (activeTab === 'coach') {
          loadCoaches();
        }
      } else {
        setCoachResult(`❌ Fehler: ${result.error || 'Unbekannter Fehler'}`);
      }
    } catch (error: any) {
      setCoachResult(`❌ Fehler: ${error.message || error}`);
    }
    setCoachLoading(false);
  };

  const loadCoaches = async () => {
    try {
      setCoachLoading(true);
      const allUsers = await AdminService.getAllUsers(100, 0);
      
      // Lade Coach-Status für jeden User
      const coachesWithStatus = await Promise.all(
        allUsers.map(async (user) => {
          try {
            const response = await fetch(`/api/admin/users/coach?userId=${user.user_id}`);
            const data = await response.json();
            return {
              ...user,
              isCoach: data.success ? data.user.isCoach : false,
              role: data.success ? data.user.role : null,
            };
          } catch (error) {
            return {
              ...user,
              isCoach: false,
              role: null,
            };
          }
        })
      );
      
      setCoaches(coachesWithStatus);
    } catch (error) {
      console.error('Error loading coaches:', error);
    } finally {
      setCoachLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const userStats = await AdminService.getUserStats();
      const subscriptionStats = await AdminService.getSubscriptionStats();
      setStats({ userStats, subscriptionStats });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const allUsers = await AdminService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'stats') {
      loadStats();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'coach') {
      loadCoaches();
    }
  }, [activeTab]);

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

      <PageLayout activePage="dashboard" showLogo={true} maxWidth="lg">
        <Box sx={{ position: 'relative', zIndex: 2, py: { xs: 2, md: 4 } }}>
          {/* Header */}
          <Box textAlign="center" mb={6}>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 'bold', 
                mb: 2,
                background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)'
              }}
            >
              🔧 Admin Panel
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: 'rgba(255,255,255,0.85)', 
                fontWeight: 300,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.8,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              Vollständige Admin-Verwaltung
            </Typography>
          </Box>

        {/* Tab Navigation */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant={activeTab === 'package' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('package')}
            sx={{
              background: activeTab === 'package' ? 'linear-gradient(135deg, #F29F05, #8C1D04)' : 'transparent',
              borderColor: 'rgba(242, 159, 5, 0.5)',
              color: activeTab === 'package' ? 'white' : 'rgba(255,255,255,0.8)',
              '&:hover': {
                borderColor: '#F29F05',
                backgroundColor: activeTab === 'package' ? 'linear-gradient(135deg, #8C1D04, #F29F05)' : 'rgba(242, 159, 5, 0.1)'
              }
            }}
          >
            📦 Paket-Management
          </Button>
          <Button
            variant={activeTab === 'users' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('users')}
            sx={{
              background: activeTab === 'users' ? 'linear-gradient(135deg, #F29F05, #8C1D04)' : 'transparent',
              borderColor: 'rgba(242, 159, 5, 0.5)',
              color: activeTab === 'users' ? 'white' : 'rgba(255,255,255,0.8)',
              '&:hover': {
                borderColor: '#F29F05',
                backgroundColor: activeTab === 'users' ? 'linear-gradient(135deg, #8C1D04, #F29F05)' : 'rgba(242, 159, 5, 0.1)'
              }
            }}
          >
            👥 User-Verwaltung
          </Button>
          <Button
            variant={activeTab === 'stats' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('stats')}
            sx={{
              background: activeTab === 'stats' ? 'linear-gradient(135deg, #F29F05, #8C1D04)' : 'transparent',
              borderColor: 'rgba(242, 159, 5, 0.5)',
              color: activeTab === 'stats' ? 'white' : 'rgba(255,255,255,0.8)',
              '&:hover': {
                borderColor: '#F29F05',
                backgroundColor: activeTab === 'stats' ? 'linear-gradient(135deg, #8C1D04, #F29F05)' : 'rgba(242, 159, 5, 0.1)'
              }
            }}
          >
            📊 Statistiken
          </Button>
          <Button
            variant={activeTab === 'coach' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('coach')}
            sx={{
              background: activeTab === 'coach' ? 'linear-gradient(45deg, #F29F05, #8C1D04)' : 'transparent',
              borderColor: 'rgba(255,255,255,0.3)',
              color: activeTab === 'coach' ? 'white' : 'rgba(255,255,255,0.8)',
              '&:hover': {
                borderColor: '#F29F05',
                backgroundColor: activeTab === 'coach' ? 'linear-gradient(45deg, #d88f04, #7a1a03)' : 'rgba(242, 159, 5, 0.1)'
              }
            }}
          >
            🎯 Coach-Verwaltung
          </Button>
        </Box>

        {/* Tab Content */}
        {activeTab === 'package' && (
          <>
            {/* User ID Input */}
            <Card sx={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4,
              mb: 4
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ color: '#F29F05', mb: 3, fontWeight: 700 }}>
                  👤 User ID eingeben
                </Typography>
                <TextField
                  fullWidth
                  label="User ID oder E-Mail"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="z.B. user@example.com oder 123e4567-e89b-12d3-a456-426614174000"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#F29F05',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#F29F05',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.7)',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#F29F05',
                    },
                  }}
                />
              </CardContent>
            </Card>

        {/* Package Buttons */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4,
              p: 3,
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)'
              }
            }}>
              <Zap size={40} color="#F29F05" style={{ marginBottom: '16px' }} />
              <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 700 }}>
                BASIC
              </Typography>
              <Button
                variant="outlined"
                onClick={() => handleSetPackage('basic')}
                disabled={loading}
                sx={{
                  borderColor: '#F29F05',
                  color: '#F29F05',
                  '&:hover': {
                    borderColor: '#F29F05',
                    backgroundColor: 'rgba(242, 159, 5, 0.1)'
                  }
                }}
              >
                Setzen
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4,
              p: 3,
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)'
              }
            }}>
              <Star size={40} color="#ffd700" style={{ marginBottom: '16px' }} />
              <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 700 }}>
                PREMIUM
              </Typography>
              <Button
                variant="outlined"
                onClick={() => handleSetPackage('premium')}
                disabled={loading}
                sx={{
                  borderColor: '#ffd700',
                  color: '#ffd700',
                  '&:hover': {
                    borderColor: '#ffd700',
                    backgroundColor: 'rgba(255, 215, 0, 0.1)'
                  }
                }}
              >
                Setzen
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4,
              p: 3,
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)'
              }
            }}>
              <Crown size={40} color="#9c27b0" style={{ marginBottom: '16px' }} />
              <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 700 }}>
                VIP
              </Typography>
              <Button
                variant="outlined"
                onClick={() => handleSetPackage('vip')}
                disabled={loading}
                sx={{
                  borderColor: '#9c27b0',
                  color: '#9c27b0',
                  '&:hover': {
                    borderColor: '#9c27b0',
                    backgroundColor: 'rgba(156, 39, 176, 0.1)'
                  }
                }}
              >
                Setzen
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(244, 67, 54, 0.5)',
              borderRadius: 4,
              p: 3,
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(244, 67, 54, 0.8)'
              }
            }}>
              <CheckCircle size={40} color="#f44336" style={{ marginBottom: '16px' }} />
              <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 700 }}>
                ADMIN
              </Typography>
              <Button
                variant="outlined"
                onClick={() => handleSetPackage('admin')}
                disabled={loading}
                sx={{
                  borderColor: '#f44336',
                  color: '#f44336',
                  '&:hover': {
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)'
                  }
                }}
              >
                Setzen
              </Button>
            </Paper>
          </Grid>
        </Grid>

            {/* Result */}
            {result && (
              <Alert 
                severity={result.includes('✅') ? 'success' : 'error'}
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  background: result.includes('✅') 
                    ? 'rgba(76, 175, 80, 0.1)' 
                    : 'rgba(244, 67, 54, 0.1)',
                  border: result.includes('✅') 
                    ? '1px solid rgba(76, 175, 80, 0.3)' 
                    : '1px solid rgba(244, 67, 54, 0.3)'
                }}
              >
                {result}
              </Alert>
            )}

            {/* Info */}
            <Card sx={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ color: '#F29F05', mb: 3, fontWeight: 700 }}>
                  ℹ️ Anleitung
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
                  1. E-Mail-Adresse oder User ID eingeben (E-Mail wird automatisch gesucht)
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
                  2. Gewünschtes Paket auswählen und "Setzen" klicken
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
                  3. Das Paket wird sofort in Supabase user_metadata.package gesetzt
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  💡 <strong>Wichtig:</strong> Das Paket wird direkt in Supabase Auth user_metadata aktualisiert, nicht nur in der subscriptions Tabelle!
                </Typography>
              </CardContent>
            </Card>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card sx={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4,
            mb: 4
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" sx={{ color: '#F29F05', mb: 3, fontWeight: 700 }}>
                👥 Alle User
              </Typography>
              {users.length > 0 ? (
                <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {users.map((user, index) => (
                    <Paper key={user.id} sx={{
                      p: 2,
                      mb: 2,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 2
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                            {user.first_name} {user.last_name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {user.email}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            ID: {user.user_id}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Chip 
                            label={user.subscription_package || 'basic'} 
                            color={user.subscription_package === 'vip' ? 'secondary' : 'primary'}
                            size="small"
                          />
                          {user.is_admin && (
                            <Chip label="Admin" color="error" size="small" />
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', py: 4 }}>
                  Keine User gefunden
                </Typography>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <Grid container spacing={3}>
            {stats?.userStats && (
              <Grid item xs={12} md={6}>
                <Card sx={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 4
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ color: '#F29F05', mb: 3, fontWeight: 700 }}>
                      👥 User-Statistiken
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Gesamt User:</Typography>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>{stats.userStats.totalUsers}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Aktive User:</Typography>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>{stats.userStats.activeUsers}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Admin User:</Typography>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>{stats.userStats.adminUsers}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {stats?.subscriptionStats && (
              <Grid item xs={12} md={6}>
                <Card sx={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 4
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ color: '#F29F05', mb: 3, fontWeight: 700 }}>
                      📊 Abonnement-Statistiken
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Free:</Typography>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>{stats.subscriptionStats.free}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Basic:</Typography>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>{stats.subscriptionStats.basic}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Premium:</Typography>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>{stats.subscriptionStats.premium}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>VIP:</Typography>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>{stats.subscriptionStats.vip}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>Admin:</Typography>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>{stats.subscriptionStats.admin}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}

        {/* Coach Tab */}
        {activeTab === 'coach' && (
          <>
            {/* Quick Add Coach */}
            <Card sx={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(242, 159, 5, 0.3)',
              borderRadius: 4,
              mb: 4
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ color: '#F29F05', mb: 3, fontWeight: 700 }}>
                  🎯 Coach-Rolle schnell vergeben
                </Typography>
                <TextField
                  fullWidth
                  label="User ID oder E-Mail"
                  value={coachUserId}
                  onChange={(e) => setCoachUserId(e.target.value)}
                  placeholder="z.B. coach@example.com oder 123e4567-e89b-12d3-a456-426614174000"
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#F29F05',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#F29F05',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.7)',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#F29F05',
                    },
                  }}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => handleSetCoach(true)}
                    disabled={coachLoading}
                    sx={{
                      background: 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)',
                      color: 'white',
                      fontWeight: 600,
                      px: 4,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #8C1D04 0%, #F29F05 100%)',
                      },
                    }}
                  >
                    ✅ Coach aktivieren
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleSetCoach(false)}
                    disabled={coachLoading}
                    sx={{
                      borderColor: 'rgba(242, 159, 5, 0.5)',
                      color: '#F29F05',
                      px: 4,
                      '&:hover': {
                        borderColor: '#F29F05',
                        background: 'rgba(242, 159, 5, 0.1)',
                      },
                    }}
                  >
                    ❌ Coach deaktivieren
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Result */}
            {coachResult && (
              <Alert 
                severity={coachResult.includes('✅') ? 'success' : 'error'}
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  background: coachResult.includes('✅') 
                    ? 'rgba(76, 175, 80, 0.1)' 
                    : 'rgba(244, 67, 54, 0.1)',
                  border: coachResult.includes('✅') 
                    ? '1px solid rgba(76, 175, 80, 0.3)' 
                    : '1px solid rgba(244, 67, 54, 0.3)'
                }}
              >
                {coachResult}
              </Alert>
            )}

            {/* Coaches List */}
            <Card sx={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(242, 159, 5, 0.3)',
              borderRadius: 4,
              mb: 4
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ color: '#F29F05', fontWeight: 700 }}>
                    👥 Alle User & Coach-Status
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={loadCoaches}
                    disabled={coachLoading}
                    sx={{
                      borderColor: 'rgba(242, 159, 5, 0.5)',
                      color: '#F29F05',
                      '&:hover': {
                        borderColor: '#F29F05',
                        background: 'rgba(242, 159, 5, 0.1)',
                      },
                    }}
                  >
                    🔄 Aktualisieren
                  </Button>
                </Box>

                {/* Search */}
                <TextField
                  fullWidth
                  label="Suche nach Name oder E-Mail"
                  value={coachSearch}
                  onChange={(e) => setCoachSearch(e.target.value)}
                  placeholder="Suche..."
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#F29F05',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#F29F05',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255,255,255,0.7)',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#F29F05',
                    },
                  }}
                />

                {coachLoading && coaches.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>Lade User...</Typography>
                  </Box>
                ) : (
                  <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                    {coaches
                      .filter((user) => {
                        if (!coachSearch) return true;
                        const search = coachSearch.toLowerCase();
                        return (
                          user.email?.toLowerCase().includes(search) ||
                          `${user.first_name} ${user.last_name}`.toLowerCase().includes(search) ||
                          user.user_id?.toLowerCase().includes(search)
                        );
                      })
                      .map((user) => (
                        <Paper
                          key={user.user_id}
                          sx={{
                            p: 3,
                            mb: 2,
                            background: user.isCoach
                              ? 'rgba(242, 159, 5, 0.1)'
                              : 'rgba(255,255,255,0.03)',
                            border: user.isCoach
                              ? '1px solid rgba(242, 159, 5, 0.3)'
                              : '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 2,
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                                {user.first_name} {user.last_name}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
                                {user.email}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                                ID: {user.user_id}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip
                                  label={user.subscription_package || 'basic'}
                                  color={user.subscription_package === 'vip' ? 'secondary' : 'primary'}
                                  size="small"
                                />
                                {user.isCoach && (
                                  <Chip
                                    label="Coach"
                                    sx={{
                                      background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                                      color: 'white',
                                      fontWeight: 600,
                                    }}
                                    size="small"
                                  />
                                )}
                                {user.is_admin && (
                                  <Chip label="Admin" color="error" size="small" />
                                )}
                              </Box>
                              <Button
                                variant={user.isCoach ? 'outlined' : 'contained'}
                                size="small"
                                onClick={() => handleSetCoach(!user.isCoach, user.user_id)}
                                disabled={coachLoading}
                                sx={{
                                  minWidth: 120,
                                  ...(user.isCoach
                                    ? {
                                        borderColor: 'rgba(242, 159, 5, 0.5)',
                                        color: '#F29F05',
                                        '&:hover': {
                                          borderColor: '#F29F05',
                                          background: 'rgba(242, 159, 5, 0.1)',
                                        },
                                      }
                                    : {
                                        background: 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)',
                                        color: 'white',
                                        '&:hover': {
                                          background: 'linear-gradient(135deg, #8C1D04 0%, #F29F05 100%)',
                                        },
                                      }),
                                }}
                              >
                                {user.isCoach ? '❌ Entfernen' : '✅ Als Coach'}
                              </Button>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    {coaches.filter((user) => {
                      if (!coachSearch) return true;
                      const search = coachSearch.toLowerCase();
                      return (
                        user.email?.toLowerCase().includes(search) ||
                        `${user.first_name} ${user.last_name}`.toLowerCase().includes(search) ||
                        user.user_id?.toLowerCase().includes(search)
                      );
                    }).length === 0 && (
                      <Typography sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center', py: 4 }}>
                        Keine User gefunden
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Info */}
            <Card sx={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(242, 159, 5, 0.3)',
              borderRadius: 4
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ color: '#F29F05', mb: 3, fontWeight: 700 }}>
                  ℹ️ Anleitung
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
                  1. <strong>Schnell vergeben:</strong> E-Mail oder User ID oben eingeben und "Coach aktivieren" klicken
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
                  2. <strong>Über Liste:</strong> In der Liste unten nach User suchen und "Als Coach" klicken
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
                  3. <strong>Coach entfernen:</strong> "Entfernen" Button in der Liste klicken
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  💡 Coaches können auf <code>/coach</code> zugreifen und Readings erstellen. Die Coach-Rolle wird sowohl in der <code>profiles</code> Tabelle als auch in den User-Metadaten gespeichert.
                </Typography>
              </CardContent>
            </Card>
          </>
        )}
        </Box>
      </PageLayout>
    </Box>
  );
}
