"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Container,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Drawer,
  IconButton,
  ListItemButton,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Edit, 
  Save, 
  Heart,
  Star,
  Calendar,
  Moon,
  BookOpen,
  Activity,
  Check,
  Sparkles,
  Key,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  User,
  Target,
  Zap,
  Shield,
  X,
  CheckCircle,
  Menu,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import AccessControl from '../../components/AccessControl';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '../components/Logo';
import PageLayout from '../components/PageLayout';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import UserDataService from '@/lib/services/userDataService';

interface ProfileData {
  user: {
    id?: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    email?: string;
    phone?: string;
    location?: string;
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
    bio?: string;
    description?: string;
    interests?: string[];
    website?: string;
  };
  hdChart: {
    type?: string;
    profile?: string;
    strategy?: string;
    authority?: string;
    incarnationCross?: string;
  };
  moonData: Array<{
    id: string;
    date: string;
    phase: string;
    notes: string;
  }>;
  matchingHistory: Array<{
    id: string;
    person1: string;
    person2: string;
    score: number;
    date: string;
  }>;
  coachingSessions: Array<{
    id: string;
    coach: string;
    type: string;
    date: string;
    status: string;
  }>;
  statistics: {
    totalMoonEntries: number;
    totalMatchingAnalyses: number;
    totalCoachingSessions: number;
    lastActivity: string;
  };
}

function ProfilContent() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [localLoading, setLocalLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    postalCode: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    hdType: '',
    hdProfile: '',
    hdStrategy: '',
    hdAuthority: '',
    hdIncarnationCross: '',
    description: '',
    interests: [] as string[],
    website: '',
    bio: '',
    isPublic: true,
    notifications: true,
    emailNotifications: true,
    allowMessages: true,
    dataSharing: false
  });

  const [formData, setFormData] = useState(profile);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
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

  // Loading-State wird später implementiert
  const isLoading = false;
  const error = null;
  const setGlobalLoading = (loading: boolean) => {};
  const setError = (err: string | null) => {};

  // Profil-Daten mit UserDataService laden
  const loadProfileData = React.useCallback(async () => {
    try {
      setLocalLoading(true);
      const userId = UserDataService.getUserId();
      
      if (!userId) {
        setLocalLoading(false);
        return;
      }

      // Lade Daten mit UserDataService
      const userData = UserDataService.getUserData();
      const chartData = UserDataService.getChartData();
      
      // Wenn keine userData vorhanden, erstelle minimale Daten
      if (!userData) {
        const email = UserDataService.getEmail() || user?.email;
        if (email) {
          // Generiere Namen aus Email
          const emailName = email.split('@')[0];
          const nameParts = emailName.split(/[._-]/);
          const firstName = nameParts[0]?.charAt(0).toUpperCase() + nameParts[0]?.slice(1) || 'User';
          const lastName = nameParts[1]?.charAt(0).toUpperCase() + nameParts[1]?.slice(1) || '';
          
          UserDataService.updateUserData({
            firstName,
            lastName,
            email,
            bio: 'Noch kein Profil ausgefüllt. Klicke auf "Bearbeiten" um dein Profil zu vervollständigen!',
            interests: []
          });
        } else {
          // Fallback auf Test-Daten
          await loadTestData();
          setLocalLoading(false);
          return;
        }
      }
      
      // Lade aktualisierte Daten
      const updatedUserData = UserDataService.getUserData();
      if (!updatedUserData) {
        await loadTestData();
        setLocalLoading(false);
        return;
      }
      
      // Setze Profil-State
      const fullName = UserDataService.getFullName() || 'Unbekannter Benutzer';
      const userEmail = updatedUserData.email || user?.email || '';
      
      // Human Design Daten: Zuerst aus UserData, dann aus ChartData als Fallback
      const hdType = updatedUserData.hdType || chartData?.type || chartData?.hdType || '';
      const hdProfile = updatedUserData.hdProfile || chartData?.profile || '';
      const hdStrategy = updatedUserData.hdStrategy || chartData?.strategy || '';
      const hdAuthority = updatedUserData.hdAuthority || chartData?.authority || '';
      const hdIncarnationCross = updatedUserData.hdIncarnationCross || chartData?.incarnationCross || '';
      
      setProfile(prev => ({
        ...prev,
        name: fullName,
        email: userEmail,
        phone: updatedUserData.phone || '',
        location: updatedUserData.location || '',
        birthDate: updatedUserData.birthDate || '',
        birthTime: updatedUserData.birthTime || '',
        birthPlace: updatedUserData.birthPlace || '',
        description: updatedUserData.bio || updatedUserData.description || '',
        interests: updatedUserData.interests || [],
        website: updatedUserData.website || '',
        bio: updatedUserData.bio || updatedUserData.description || '',
        hdType,
        hdProfile,
        hdStrategy,
        hdAuthority,
        hdIncarnationCross
      }));
      
      console.log('📝 Profil-Daten gesetzt:', {
        name: fullName,
        email: userEmail,
        hasEmail: !!userEmail,
        hdType,
        hdProfile,
        hdStrategy,
        hdAuthority,
        hasChartData: !!chartData,
        chartDataType: chartData?.type || chartData?.hdType
      });

      // Statistiken aus echten Daten berechnen
      setProfileData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          statistics: {
            totalMoonEntries: 0,
            totalMatchingAnalyses: 0,
            totalCoachingSessions: 0,
            lastActivity: new Date().toISOString()
          }
        };
      });
    } catch (error) {
      console.error('Fehler beim Laden der Profil-Daten:', error);
      // Fallback auf Test-Daten
      await loadTestData();
    } finally {
      setLocalLoading(false);
    }
  }, [user]);

  // Client-seitige Initialisierung
  useEffect(() => {
    setIsClient(true);
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
  }, []);

  // Authentifizierung und Subscription prüfen
  useEffect(() => {
    const checkAuth = async () => {
      const token = UserDataService.getToken();
      const userId = UserDataService.getUserId();
      
      if (!token || !userId) {
        setIsAuthenticated(false);
        // Keine Authentifizierung erforderlich - App ist öffentlich
        return;
      }
      
      setIsAuthenticated(true);
      
      // Daten laden
      loadProfileData();
      await loadUserSubscription();
    };

    checkAuth();
  }, [router]);

  // Event-Listener für Chart-Daten Updates
  useEffect(() => {
    const handleChartDataUpdate = () => {
      console.log('📊 Chart-Daten wurden aktualisiert, lade Profil neu...');
      loadProfileData();
    };

    const handleUserDataUpdate = () => {
      console.log('👤 User-Daten wurden aktualisiert, lade Profil neu...');
      loadProfileData();
    };

    window.addEventListener('chartDataUpdated', handleChartDataUpdate);
    window.addEventListener('userDataUpdated', handleUserDataUpdate);

    return () => {
      window.removeEventListener('chartDataUpdated', handleChartDataUpdate);
      window.removeEventListener('userDataUpdated', handleUserDataUpdate);
    };
  }, [loadProfileData]);

  const loadUserSubscription = useCallback(async () => {
    try {
      const { safeLocalStorageParse } = await import('@/lib/utils/safeJson');
      const user = safeLocalStorageParse<any>('userData', null);
      if (user) {
        // Subscription-Service wird später implementiert
        const subscription = null;
        setUserSubscription(subscription);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Subscription:', error);
    }
  }, []);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  // Test-Daten aus der Datenbank laden
  const loadTestData = async () => {
    try {
      // Fallback auf statische Test-Daten
      setProfile(prev => ({
        ...prev,
        name: 'Test Benutzer',
        email: 'test@example.com',
        phone: '+49 123 456789',
        location: 'Hamburg, Deutschland',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Hamburg',
        hdType: 'Generator',
        hdProfile: '2/4',
        hdStrategy: 'Auf andere reagieren',
        hdAuthority: 'Sakral',
        description: 'Energiegeladener Generator, der gerne neue Menschen kennenlernt und tiefgründige Gespräche führt.',
        interests: ['Sport', 'Musik', 'Reisen', 'Human Design', 'Kochen'],
        bio: 'Ich bin ein leidenschaftlicher Generator, der gerne neue Verbindungen knüpft und tiefgründige Gespräche führt.'
      }));
      
      // Setze auch die Profil-Daten für die Anzeige
      setProfileData({
        user: {
          id: 'test-user',
          firstName: 'Test',
          lastName: 'Benutzer',
          email: 'test@example.com'
        },
        hdChart: {
          type: 'Generator',
          profile: '2/4'
        },
        moonData: [],
        matchingHistory: [],
        coachingSessions: [],
        statistics: {
          totalMoonEntries: 0,
          totalMatchingAnalyses: 0,
          totalCoachingSessions: 0,
          lastActivity: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Fehler beim Laden der Test-Daten:', error);
      // Letzter Fallback auf statische Daten
      setProfile(prev => ({
        ...prev,
        name: 'Max Mustermann',
        email: 'max@example.com',
        phone: '+49 123 456789',
        location: 'Hamburg, Deutschland',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Hamburg',
        hdType: 'Generator',
        hdProfile: '2/4',
        hdStrategy: 'Auf andere reagieren',
        hdAuthority: 'Sakral',
        description: 'Energiegeladener Generator, der gerne neue Menschen kennenlernt und tiefgründige Gespräche führt.',
        interests: ['Sport', 'Musik', 'Reisen', 'Human Design', 'Kochen'],
        bio: 'Ich bin ein leidenschaftlicher Generator, der gerne neue Verbindungen knüpft und tiefgründige Gespräche führt.'
      }));
    }
  };

  const handleSave = async () => {
    setGlobalLoading(true);
    try {
      const token = UserDataService.getToken();
      const userId = UserDataService.getUserId();
      
      if (!token || !userId) {
        setMessage('Nicht angemeldet');
        return;
      }

      // Namen splitten
      const nameParts = formData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Aktualisiere mit UserDataService (Merge-Mechanismus)
      UserDataService.updateUserData({
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        birthDate: formData.birthDate,
        birthTime: formData.birthTime,
        birthPlace: formData.birthPlace,
        bio: formData.bio,
        website: formData.website,
        interests: formData.interests,
        profileImage: profileImage || imagePreview || undefined
      });

      // Aktualisiere lokalen State
      setProfile(formData);
      
      setIsEditing(false);
      setMessage('✅ Profil erfolgreich aktualisiert!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Fehler beim Speichern des Profils:', error);
      setMessage('Fehler beim Speichern des Profils');
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleInputChange = React.useCallback((field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        // In einer echten App würde hier der Upload stattfinden
        setProfileImage(result);
        // Speichere in UserDataService
        UserDataService.updateUserData({ profileImage: result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Lade Profilbild aus UserDataService
  useEffect(() => {
    const userData = UserDataService.getUserData();
    if (userData?.profileImage) {
      setProfileImage(userData.profileImage);
    }
  }, []);

  if (localLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={70}
            thickness={4}
            sx={{ 
              color: '#e8b86d',
              mb: { xs: 2, md: 3 },
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }} 
          />
          <Typography variant="h6" sx={{ 
            color: '#e8b86d',
            fontWeight: 600
          }}>
            Lade Profil-Daten...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <AccessControl 
      path="/profil" 
      userSubscription={userSubscription}
      onUpgrade={() => router.push('/pricing')}
    >
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
        `,
        backgroundAttachment: 'fixed',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 4, md: 6 },
        pb: 8,
      }}>
        {/* Animierte Sterne im Hintergrund - Client-seitig gerendert */}
        {isClient && starPositions.map((starProps, i) => (
          <motion.div
            key={`star-${i}`}
            style={{
              position: 'absolute',
              width: `${starProps.width}px`,
              height: `${starProps.height}px`,
              background: '#F29F05',
              borderRadius: '50%',
              left: `${starProps.left}%`,
              top: `${starProps.top}%`,
              pointerEvents: 'none',
              opacity: starProps.opacity,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: starProps.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: starProps.delay,
            }}
          />
        ))}
        <PageLayout activePage="profil" showLogo={true}>
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, md: 4 } }}>
          {/* Kompakter Header */}
          <Box sx={{ 
            mb: { xs: 3, md: 4 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2
          }}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#FFFFFF',
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  mb: 0.5
                }}
              >
                Profil-Verwaltung
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255,255,255,0.7)', 
                  fontSize: { xs: '0.85rem', md: '0.95rem' }
                }}
              >
                Verwalte deine persönlichen Daten und Einstellungen
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={isLoading}
              startIcon={isEditing ? <Save size={18} /> : <Edit size={18} />}
              sx={{
                background: 'linear-gradient(135deg, #FFD700, #F29F05)',
                color: '#0b0a0f',
                fontWeight: 700,
                px: { xs: 2, md: 3 },
                py: { xs: 1, md: 1.2 },
                borderRadius: 2,
                fontSize: { xs: '0.85rem', md: '0.95rem' },
                boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #F29F05, #FFD700)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(255, 215, 0, 0.5)'
                },
                transition: 'all 0.3s ease',
              }}
            >
              {isEditing ? 'Speichern' : 'Bearbeiten'}
            </Button>
          </Box>

          {/* Message Alert */}
          {message && (
            <Alert 
              severity="success" 
              sx={{ mb: 3, borderRadius: 2 }}
              onClose={() => setMessage('')}
            >
              {message}
            </Alert>
          )}

          <Grid container spacing={{ xs: 3, md: 4 }}>
          {/* Linke Spalte - Profil-Informationen */}
          <Grid item xs={12} lg={8}>
              {/* Profilbild-Karte - Dashboard-Style */}
              <Card sx={{ 
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(242, 159, 5, 0.2)',
                borderRadius: 3,
                mb: { xs: 3, md: 4 },
                boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 10px rgba(242, 159, 5, 0.1)'
              }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: { xs: 2, md: 3 } }}>
                    {/* Profilbild - Kompakter */}
                    <Box sx={{ position: 'relative' }}>
                      {/* Glow-Effekt hinter Avatar */}
                      <Box
                        sx={{
                          position: 'absolute',
                          width: { xs: 120, md: 150 },
                          height: { xs: 120, md: 150 },
                          borderRadius: '50%',
                          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.15) 0%, transparent 70%)',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          zIndex: 0,
                          animation: 'pulseGlow 3s ease-in-out infinite',
                          '@keyframes pulseGlow': {
                            '0%, 100%': { opacity: 0.15, transform: 'translate(-50%, -50%) scale(1)' },
                            '50%': { opacity: 0.25, transform: 'translate(-50%, -50%) scale(1.05)' },
                          },
                        }}
                      />
                      <Box
                        sx={{
                          width: { xs: 100, md: 130 },
                          height: { xs: 100, md: 130 },
                          borderRadius: '50%',
                          background: profileImage || imagePreview 
                            ? `url(${imagePreview || profileImage}) center/cover`
                            : 'linear-gradient(135deg, #F29F05, #8C1D04)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: { xs: '2rem', md: '2.5rem' },
                          fontWeight: 'bold',
                          color: 'white',
                          border: '2px solid rgba(255, 215, 0, 0.3)',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.3), 0 0 10px rgba(255, 215, 0, 0.15)',
                          position: 'relative',
                          overflow: 'hidden',
                          zIndex: 1,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.02)',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.4), 0 0 15px rgba(255, 215, 0, 0.2)',
                          },
                        }}
                      >
                        {!profileImage && !imagePreview && (
                          <Box>{profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}</Box>
                        )}
                      </Box>
                      
                      {/* Upload Button */}
                      {isEditing && (
                        <label htmlFor="profile-image-upload">
                          <input
                            id="profile-image-upload"
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={handleImageChange}
                          />
                          <Button
                            component="span"
                            variant="contained"
                            size="small"
                            sx={{
                              position: 'absolute',
                              bottom: { xs: 2, md: 5 },
                              right: { xs: 2, md: 5 },
                              minWidth: 'auto',
                              width: { xs: 32, md: 40 },
                              height: { xs: 32, md: 40 },
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                              }
                            }}
                          >
                            📷
                          </Button>
                        </label>
                      )}
                    </Box>

                    {/* Name und Basis-Info */}
                    <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 }, justifyContent: { xs: 'center', sm: 'flex-start' }, flexWrap: 'wrap' }}>
                        <Typography variant="h5" sx={{ 
                          fontWeight: 700,
                          fontSize: { xs: '1.25rem', md: '1.5rem' },
                          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>
                          {profile.name}
                        </Typography>
                        {/* Package Badge */}
                        {(() => {
                          // ✅ Verwende user von useAuth() (bereits in Komponente definiert)
                          const packageId = user?.package || 'basic';
                          
                          // ✅ Nur gültige Pakete: basic, premium, vip, admin
                          const allowedPackages = ['basic', 'premium', 'vip', 'admin'];
                          const currentPackage = allowedPackages.includes(packageId) ? packageId : 'basic';
                          
                          const badges = {
                            vip: { icon: '👑', label: 'VIP', color: '#FFD700', bg: 'linear-gradient(135deg, #FFD700, #FFA500)' },
                            premium: { icon: '💎', label: 'Premium', color: '#4ecdc4', bg: 'linear-gradient(135deg, #4ecdc4, #2a9d8f)' },
                            basic: { icon: '⭐', label: 'Basic', color: '#ff6b9d', bg: 'linear-gradient(135deg, #ff6b9d, #ff8fab)' },
                            admin: { icon: '👑', label: 'Admin', color: '#FFD700', bg: 'linear-gradient(135deg, #FFD700, #FFA500)' }
                          };
                          
                          const badge = badges[currentPackage as keyof typeof badges] || badges.basic;
                          
                          return (
                            <Box sx={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              px: { xs: 1.5, md: 2 },
                              py: { xs: 0.4, md: 0.5 },
                              borderRadius: 3,
                              background: badge.bg,
                              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                              fontWeight: 'bold',
                              fontSize: { xs: '0.85rem', md: '0.9rem' },
                              color: 'white'
                            }}>
                              <span>{badge.icon}</span>
                              <span>{badge.label}</span>
                            </Box>
                          );
                        })()}
                      </Box>
                      {/* HD-Status dynamisch */}
                      <Box sx={{ mt: { xs: 1, md: 1.5 }, mb: 0.5 }}>
                        {profile.hdType && profile.hdProfile && profile.hdStrategy && profile.hdAuthority ? (
                          <Typography variant="body1" sx={{ 
                            fontSize: { xs: '0.9rem', md: '1rem' },
                            color: '#FFD700', 
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            flexWrap: 'wrap',
                            justifyContent: { xs: 'center', sm: 'flex-start' }
                          }}>
                            <Box component="span">{profile.hdProfile}</Box>
                            <Box component="span" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>·</Box>
                            <Box component="span">{profile.hdType}</Box>
                            <Box component="span" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 400 }}>·</Box>
                            <Box component="span" sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' }, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                              {profile.hdAuthority}
                            </Box>
                          </Typography>
                        ) : (
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255,255,255,0.5)', 
                            fontStyle: 'italic',
                            fontSize: { xs: '0.8rem', md: '0.85rem' }
                          }}>
                            Human Design Profil noch nicht vollständig
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.8)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.5, 
                        mt: 0.5,
                        fontSize: { xs: '0.85rem', md: '0.9rem' },
                        justifyContent: { xs: 'center', sm: 'flex-start' }
                      }}>
                        <MapPin size={14} color="#FFD700" />
                        {profile.location || 'Standort nicht angegeben'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Paket-Status Karte - Verbessert */}
              {(() => {
                // ✅ Verwende useAuth() als Single Source of Truth
                const packageId = user?.package || 'basic';
                
                // ✅ Nur gültige Pakete: basic, premium, vip, admin
                const allowedPackages = ['basic', 'premium', 'vip', 'admin'];
                const currentPackage = allowedPackages.includes(packageId) ? packageId : 'basic';
                
                const packages = {
                  vip: { 
                    icon: '👑', 
                    label: 'VIP Mitglied', 
                    color: '#FFD700', 
                    bg: 'linear-gradient(135deg, rgba(255,215,0,0.25), rgba(255,165,0,0.15))',
                    features: [
                      { text: 'Unbegrenzte Chart-Analysen', icon: <Sparkles size={16} /> },
                      { text: 'Persönlicher Coach', icon: <User size={16} /> },
                      { text: 'Alle Premium-Features', icon: <Star size={16} /> },
                      { text: 'VIP-Community Zugang', icon: <Key size={16} /> }
                    ]
                  },
                  premium: { 
                    icon: '💎', 
                    label: 'Premium Mitglied', 
                    color: '#4ecdc4', 
                    bg: 'linear-gradient(135deg, rgba(78,205,196,0.25), rgba(42,157,143,0.15))',
                    features: [
                      { text: 'Erweiterte Analysen', icon: <Target size={16} /> },
                      { text: 'Partnermatchings', icon: <Heart size={16} /> },
                      { text: 'Mondphasen-Tracking', icon: <Moon size={16} /> },
                      { text: 'Priority Support', icon: <Zap size={16} /> }
                    ]
                  },
                  basic: { 
                    icon: '⭐', 
                    label: 'Basic Mitglied', 
                    color: '#ff6b9d', 
                    bg: 'linear-gradient(135deg, rgba(255,107,157,0.25), rgba(255,143,171,0.15))',
                    features: [
                      { text: 'Basis Chart-Analyse', icon: <BookOpen size={16} /> },
                      { text: 'Tageshoroskop', icon: <Calendar size={16} /> },
                      { text: 'Community Zugang', icon: <User size={16} /> }
                    ]
                  },
                  admin: { 
                    icon: '👑', 
                    label: 'Admin Mitglied', 
                    color: '#FFD700', 
                    bg: 'linear-gradient(135deg, rgba(255,215,0,0.25), rgba(255,165,0,0.15))',
                    features: [
                      { text: 'Alle VIP-Features', icon: <Sparkles size={16} /> },
                      { text: 'Admin-Zugang', icon: <Key size={16} /> },
                      { text: 'Paket-Verwaltung', icon: <Settings size={16} /> }
                    ]
                  }
                };
                
                const pkg = packages[currentPackage as keyof typeof packages] || packages.basic;
                
                return (
                  <Card sx={{ 
                    background: currentPackage === 'vip' || currentPackage === 'premium' || currentPackage === 'admin'
                      ? `linear-gradient(135deg, rgba(242, 159, 5, 0.25), rgba(140, 29, 4, 0.15))`
                      : 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${currentPackage === 'vip' || currentPackage === 'premium' || currentPackage === 'admin' ? 'rgba(242, 159, 5, 0.3)' : 'rgba(242, 159, 5, 0.2)'}`,
                    borderRadius: 3,
                    mb: { xs: 3, md: 4 },
                    boxShadow: currentPackage === 'vip' || currentPackage === 'premium' || currentPackage === 'admin'
                      ? '0 4px 20px rgba(242, 159, 5, 0.4), 0 0 10px rgba(242, 159, 5, 0.2)'
                      : '0 4px 20px rgba(0,0,0,0.3), 0 0 10px rgba(242, 159, 5, 0.1)'
                  }}>
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 2, gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.5 } }}>
                          <Box component="span" sx={{ 
                            fontSize: '1.75rem',
                            [theme.breakpoints.up('md')]: {
                              fontSize: '2rem'
                            }
                          }}>{pkg.icon}</Box>
                          <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                            {pkg.label}
                          </Typography>
                        </Box>
                        <Button
                          component="a"
                          href="/pricing"
                          variant="contained"
                          sx={{
                            background: 'linear-gradient(135deg, #FFD700, #F29F05)',
                            color: '#0b0a0f',
                            fontWeight: 700,
                            px: { xs: 2, md: 3 },
                            py: { xs: 1, md: 1.2 },
                            borderRadius: 2,
                            fontSize: { xs: '0.85rem', md: '0.95rem' },
                            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                            textTransform: 'none',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #F29F05, #FFD700)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(255, 215, 0, 0.5)'
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Paket verwalten
                        </Button>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 700, mb: 1 }}>
                          Deine Vorteile:
                        </Typography>
                        {pkg.features.map((feature, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ 
                              color: '#FFD700',
                              display: 'flex',
                              alignItems: 'center',
                              minWidth: 20,
                            }}>
                              <CheckCircle size={18} />
                            </Box>
                            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                              {feature.text}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Persönliche Informationen Karte - Dashboard-Style */}
              <Card sx={{ 
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(242, 159, 5, 0.2)',
                borderRadius: 3,
                mb: { xs: 3, md: 4 },
                boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 10px rgba(242, 159, 5, 0.1)'
              }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 700, mb: { xs: 2, md: 3 }, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                    Persönliche Informationen
                  </Typography>

                  <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
                    {/* Name */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: '#C2B4D0', mb: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Name
                      </Typography>
                      {isEditing ? (
                        <TextField
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(255,255,255,0.25)',
                              color: 'white'
                            }
                          }}
                        />
                      ) : (
                        <Typography variant="body1" sx={{ 
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          fontWeight: 600,
                          color: '#FFFFFF',
                          wordBreak: 'break-word'
                        }}>
                          {profile.name || 'Nicht angegeben'}
                        </Typography>
                      )}
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: '#C2B4D0', mb: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        E-Mail
                      </Typography>
                      {isEditing ? (
                        <TextField
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(255,255,255,0.25)',
                              color: 'white'
                            }
                          }}
                        />
                      ) : (
                        <Typography variant="body1" sx={{ 
                          fontSize: { xs: '0.95rem', md: '1rem' },
                          color: '#FFFFFF', 
                          fontWeight: 500, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          wordBreak: 'break-word'
                        }}>
                          <Mail size={16} color="#F29F05" style={{ opacity: 0.9 }} />
                          {profile.email || 'Nicht angegeben'}
                        </Typography>
                      )}
                    </Grid>

                    {/* Telefon */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: '#C2B4D0', mb: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Telefon
                      </Typography>
                      {isEditing ? (
                        <TextField
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(255,255,255,0.25)',
                              color: 'white'
                            }
                          }}
                        />
                      ) : (
                        <Typography variant="body1" sx={{ 
                          fontSize: { xs: '0.95rem', md: '1rem' },
                          color: '#FFFFFF', 
                          fontWeight: 500, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          wordBreak: 'break-word'
                        }}>
                          <Phone size={16} color="#F29F05" style={{ opacity: 0.9 }} />
                          {profile.phone || 'Nicht angegeben'}
                        </Typography>
                      )}
                    </Grid>

                    {/* Standort */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" sx={{ color: '#C2B4D0', mb: 0.5, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Standort
                      </Typography>
                      {isEditing ? (
                        <TextField
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'rgba(255,255,255,0.25)',
                              color: 'white'
                            }
                          }}
                        />
                      ) : (
                        <Typography variant="body1" sx={{ 
                          fontSize: { xs: '0.95rem', md: '1rem' },
                          color: '#FFFFFF', 
                          fontWeight: 500, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          wordBreak: 'break-word'
                        }}>
                          <MapPin size={16} color="#F29F05" style={{ opacity: 0.9 }} />
                          {profile.location || 'Nicht angegeben'}
                        </Typography>
                      )}
                    </Grid>
                  </Grid>

                </CardContent>
              </Card>

              {/* Über mich - Separate Card - Dashboard-Style */}
              <Card sx={{ 
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(242, 159, 5, 0.2)',
                borderRadius: 3,
                mb: { xs: 3, md: 4 },
                boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 10px rgba(242, 159, 5, 0.1)'
              }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  {/* Bio */}
                  <Box sx={{ 
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 2,
                    p: { xs: 2, md: 3 },
                  }}>
                    <Typography variant="caption" sx={{ color: '#C2B4D0', mb: 1, fontSize: { xs: '0.7rem', md: '0.75rem' }, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                      Über mich
                    </Typography>
                    {isEditing ? (
                      <TextField
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        variant="outlined"
                        multiline
                        rows={4}
                        fullWidth
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: 'rgba(255,255,255,0.9)',
                          }
                        }}
                      />
                    ) : (
                      <Typography variant="body1" sx={{ color: '#FFFFFF', lineHeight: 1.7, fontSize: '1rem' }}>
                        {profile.bio || 'Noch keine Beschreibung vorhanden. Klicke auf "Bearbeiten" um eine hinzuzufügen.'}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>

              {/* Human Design Informationen - Dashboard-Style */}
              <Card sx={{ 
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(242, 159, 5, 0.2)',
                borderRadius: 3,
                mb: { xs: 3, md: 4 },
                boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 10px rgba(242, 159, 5, 0.1)'
              }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" sx={{ color: '#FFFFFF', mb: { xs: 2, md: 3 }, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                    <Star size={20} color="#F29F05" style={{ opacity: 0.9 }} />
                    Human Design Profil
                  </Typography>
                  
                  {/* 4 Mini-Cards im 2x2 Grid mit Icons */}
                  <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: { xs: 2, md: 3 } }}>
                    <Grid item xs={6}>
                      <Box sx={{
                        background: 'rgba(242, 159, 5, 0.1)',
                        border: '1px solid rgba(242, 159, 5, 0.2)',
                        borderRadius: 3,
                        p: 2.5,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.2))',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(242, 159, 5, 0.3)',
                        },
                      }}>
                        <Star size={20} color="#F29F05" style={{ opacity: 0.9 }} />
                        <Typography variant="caption" sx={{ color: '#C2B4D0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          HD-Typ
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 700, mt: 0.5 }}>
                          {profile.hdType || '—'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box sx={{
                        background: 'rgba(242, 159, 5, 0.1)',
                        border: '1px solid rgba(242, 159, 5, 0.2)',
                        borderRadius: 3,
                        p: 2.5,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.2))',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(242, 159, 5, 0.3)',
                        },
                      }}>
                        <User size={20} color="#F29F05" style={{ opacity: 0.9 }} />
                        <Typography variant="caption" sx={{ color: '#C2B4D0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Profil
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 700, mt: 0.5 }}>
                          {profile.hdProfile || '—'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box sx={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255, 215, 0, 0.15)',
                        borderRadius: 3,
                        p: 2.5,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.05)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 2px 8px rgba(255, 215, 0, 0.15)',
                        },
                      }}>
                        <Target size={20} color="#F29F05" style={{ opacity: 0.9 }} />
                        <Typography variant="caption" sx={{ color: '#C2B4D0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Strategie
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#FFD700', fontWeight: 600, mt: 0.5, fontSize: '0.9rem' }}>
                          {profile.hdStrategy || '—'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box sx={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255, 215, 0, 0.15)',
                        borderRadius: 3,
                        p: 2.5,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.05)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 2px 8px rgba(255, 215, 0, 0.15)',
                        },
                      }}>
                        <Zap size={20} color="#F29F05" style={{ opacity: 0.9 }} />
                        <Typography variant="caption" sx={{ color: '#C2B4D0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Autorität
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#FFD700', fontWeight: 600, mt: 0.5, fontSize: '0.9rem' }}>
                          {profile.hdAuthority || '—'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Link zu vollständigem Profil - größer und zentriert */}
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                      component="a"
                      href="/human-design-chart"
                      variant="outlined"
                      endIcon={<ArrowRight size={20} />}
                      sx={{
                        borderColor: 'rgba(255, 215, 0, 0.5)',
                        color: '#FFD700',
                        fontWeight: 700,
                        py: 2,
                        px: 4,
                        borderRadius: 3,
                        fontSize: '1rem',
                        '&:hover': {
                          borderColor: '#FFD700',
                          background: 'rgba(255, 215, 0, 0.1)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 16px rgba(255, 215, 0, 0.3)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Vollständiges HD-Profil ansehen
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Geburtsdaten - Dashboard-Style */}
              <Card sx={{ 
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.15) 0%, rgba(140, 29, 4, 0.10) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(242, 159, 5, 0.2)',
                borderRadius: 3,
                mb: { xs: 3, md: 4 },
                boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 10px rgba(242, 159, 5, 0.1)'
              }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" sx={{ color: '#FFFFFF', mb: { xs: 2, md: 3 }, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                    <Calendar size={20} color="#F29F05" style={{ opacity: 0.9 }} />
                    Geburtsdaten
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{
                        background: 'rgba(242, 159, 5, 0.1)',
                        border: '1px solid rgba(242, 159, 5, 0.2)',
                        borderRadius: 3,
                        p: 3,
                        textAlign: 'center',
                        height: '100%',
                        minHeight: 120,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1.5,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.3), rgba(140, 29, 4, 0.2))',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(242, 159, 5, 0.3)',
                        },
                      }}>
                        <Calendar size={28} color="#F29F05" style={{ opacity: 0.9 }} />
                        <Typography variant="caption" sx={{ color: '#C2B4D0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Geburtsdatum
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.95rem' }}>
                          {profile.birthDate || 'Nicht verfügbar'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Box sx={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255, 215, 0, 0.15)',
                        borderRadius: 3,
                        p: 3,
                        textAlign: 'center',
                        height: '100%',
                        minHeight: 120,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1.5,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.05)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 2px 8px rgba(255, 215, 0, 0.12)',
                        },
                      }}>
                        <Activity size={28} color="#F29F05" style={{ opacity: 0.9 }} />
                        <Typography variant="caption" sx={{ color: '#C2B4D0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Geburtszeit
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.95rem' }}>
                          {profile.birthTime || 'Nicht verfügbar'}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Box sx={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255, 215, 0, 0.15)',
                        borderRadius: 3,
                        p: 3,
                        textAlign: 'center',
                        height: '100%',
                        minHeight: 120,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1.5,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.05)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 2px 8px rgba(255, 215, 0, 0.12)',
                        },
                      }}>
                        <MapPin size={28} color="#F29F05" style={{ opacity: 0.9 }} />
                        <Typography variant="caption" sx={{ color: '#C2B4D0', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Geburtsort
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.95rem' }}>
                          {profile.birthPlace || 'Nicht verfügbar'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
          </Grid>

          {/* Rechte Spalte - Aktivitäten und Statistiken */}
          <Grid item xs={12} lg={4}>
              {/* Aktivitäts-Statistiken - Dashboard-Style */}
              <Card sx={{ 
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(242, 159, 5, 0.2)',
                borderRadius: 3,
                mb: { xs: 3, md: 4 },
                boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 10px rgba(242, 159, 5, 0.1)'
              }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: { xs: 2, md: 3 }, fontWeight: 700, textAlign: 'center', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                    Meine Aktivitäten
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.05)', transition: 'all 0.2s ease', '&:hover': { background: 'rgba(255,255,255,0.08)' } }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        background: 'rgba(255, 215, 0, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Moon size={20} color="#FFD700" />
                      </Box>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, flex: 1 }}>
                        Mond-Einträge
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 800 }}>
                        {profileData?.statistics.totalMoonEntries || 0}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.05)', transition: 'all 0.2s ease', '&:hover': { background: 'rgba(255,255,255,0.08)' } }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        background: 'rgba(255, 215, 0, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Heart size={20} color="#FFD700" />
                      </Box>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, flex: 1 }}>
                        Matching-Analysen
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 800 }}>
                        {profileData?.statistics.totalMatchingAnalyses || 0}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.05)', transition: 'all 0.2s ease', '&:hover': { background: 'rgba(255,255,255,0.08)' } }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        background: 'rgba(255, 215, 0, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <BookOpen size={20} color="#FFD700" />
                      </Box>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, flex: 1 }}>
                        Coaching-Sessions
                      </Typography>
                      <Typography variant="h4" sx={{ color: '#FFD700', fontWeight: 800 }}>
                        {profileData?.statistics.totalCoachingSessions || 0}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.05)', transition: 'all 0.2s ease', '&:hover': { background: 'rgba(255,255,255,0.08)' } }}>
                      <Box sx={{ 
                        width: 40, 
                        height: 40, 
                        borderRadius: '50%', 
                        background: 'rgba(255, 215, 0, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Activity size={20} color="#FFD700" />
                      </Box>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, flex: 1 }}>
                        Letzte Aktivität
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 700 }}>
                        {profileData?.statistics.lastActivity ? 
                          new Date(profileData.statistics.lastActivity).toLocaleDateString('de-DE') : 
                          'Heute'
                        }
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Profil-Vollständigkeit */}
              {(() => {
                const userData = UserDataService.getUserData();
                const profileImage = userData?.profileImage;
                const datingPhotos = Array.isArray(userData?.datingPhotos) ? userData.datingPhotos : [];
                
                let completedSteps = 0;
                let totalSteps = 5;
                const missingSteps = [];
                
                // Check welche Schritte fehlen
                if (profile.name && profile.name !== 'Unbekannter Benutzer') completedSteps++;
                else missingSteps.push('Name eingeben');
                
                if (profile.email) completedSteps++;
                else missingSteps.push('E-Mail bestätigen');
                
                if (profile.birthDate && profile.birthTime && profile.birthPlace) completedSteps++;
                else missingSteps.push('Geburtsdaten vervollständigen');
                
                if (profileImage || datingPhotos.length > 0) completedSteps++;
                else missingSteps.push('Fotos hochladen');
                
                if (profile.bio && profile.bio.length > 50) completedSteps++;
                else missingSteps.push('Bio schreiben');
                
                const percentage = Math.round((completedSteps / totalSteps) * 100);
                const isComplete = percentage === 100;
                
                return (
                  <Card sx={{ 
                    background: isComplete 
                      ? 'linear-gradient(135deg, rgba(78,205,196,0.2), rgba(42,157,143,0.1))'
                      : 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    border: isComplete 
                      ? '1px solid rgba(78,205,196,0.3)' 
                      : '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 3,
                    mb: { xs: 3, md: 4 },
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
                  }}>
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                      <Typography variant="h6" sx={{ color: '#FFD700', mb: { xs: 1.5, md: 2 }, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                        Profil-Vollständigkeit
                      </Typography>
                      
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 3, fontWeight: 500 }}>
                        Dein Profil ist zu <Box component="span" sx={{ color: '#FFD700', fontWeight: 700, fontSize: '1.2rem' }}>{percentage}%</Box> vollständig
                      </Typography>
                      
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                            {completedSteps} von {totalSteps} Schritten
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#FFD700', fontWeight: 700 }}>
                            {percentage}%
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          width: '100%', 
                          height: 6, 
                          background: 'rgba(255,255,255,0.1)', 
                          borderRadius: 3,
                          overflow: 'hidden',
                          border: '1px solid rgba(255, 215, 0, 0.2)',
                          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
                        }}>
                          <Box sx={{ 
                            width: `${percentage}%`, 
                            height: '100%', 
                            background: isComplete 
                              ? 'linear-gradient(90deg, #4ecdc4, #2a9d8f)'
                              : 'linear-gradient(90deg, #FFD700, #F29F05)',
                            transition: 'width 0.3s ease',
                            boxShadow: `0 0 8px ${isComplete ? 'rgba(78,205,196,0.4)' : 'rgba(255, 215, 0, 0.6)'}`,
                          }} />
                        </Box>
                      </Box>
                      
                      {isComplete ? (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          p: 2,
                          background: 'rgba(78,205,196,0.2)',
                          borderRadius: 2,
                          border: '1px solid rgba(78,205,196,0.3)'
                        }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                            Dein Profil ist vollständig!
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 0.5 }}>
                            Noch {missingSteps.length} Schritt{missingSteps.length !== 1 ? 'e' : ''} fehlen:
                          </Typography>
                          {missingSteps.slice(0, 3).map((step, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <X size={16} color="#F29F05" />
                              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.85rem' }}>
                                {step}
                              </Typography>
                            </Box>
                          ))}
                          <Button
                            variant="contained"
                            href={missingSteps.includes('Fotos hochladen') ? '/profil-einrichten' : '#'}
                            onClick={!missingSteps.includes('Fotos hochladen') ? () => setIsEditing(true) : undefined}
                            endIcon={<ArrowRight size={20} />}
                            sx={{
                              mt: 3,
                              background: 'linear-gradient(135deg, #FFD700, #F29F05, #FFD700)',
                              color: '#0b0a0f',
                              fontWeight: 700,
                              py: 2,
                              px: 4,
                              borderRadius: 3,
                              fontSize: '1rem',
                              boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4), 0 0 10px rgba(255, 215, 0, 0.2)',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #F29F05, #FFD700, #F29F05)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 20px rgba(255, 215, 0, 0.5), 0 0 15px rgba(255, 215, 0, 0.3)'
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            Jetzt vervollständigen
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Schnellaktionen - Dashboard-Style */}
              <Card sx={{ 
                background: 'rgba(242, 159, 5, 0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(242, 159, 5, 0.2)',
                borderRadius: 3,
                mb: { xs: 3, md: 4 },
                boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 10px rgba(242, 159, 5, 0.1)'
              }}>
                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" sx={{ color: '#FFD700', mb: { xs: 2, md: 2.5 }, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                    Schnellaktionen
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      component="a"
                      href="/friends"
                      variant="outlined"
                      startIcon={<Heart size={20} />}
                      fullWidth
                      sx={{
                        justifyContent: 'flex-start',
                        borderColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        py: 1.75,
                        px: 2,
                        borderRadius: 3,
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#ff6b9d',
                          background: 'rgba(255,107,157,0.15)',
                          transform: 'translateX(4px)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <span>Matches</span>
                        <Box sx={{ 
                          background: '#ff6b9d', 
                          color: 'white', 
                          px: 1, 
                          py: 0.25, 
                          borderRadius: 2,
                          fontSize: '0.7rem',
                          fontWeight: 600
                        }}>
                          Neu
                        </Box>
                      </Box>
                    </Button>
                    
                    <Button
                      component="a"
                      href="/resonanzanalyse/sofort"
                      variant="outlined"
                      startIcon={<BookOpen size={20} />}
                      fullWidth
                      sx={{
                        justifyContent: 'flex-start',
                        borderColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        py: 1.75,
                        px: 2,
                        borderRadius: 3,
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#4ecdc4',
                          background: 'rgba(78,205,196,0.15)',
                          transform: 'translateX(4px)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Neue Analyse starten
                    </Button>
                    
                    <Button
                      component="a"
                      href="/moon-cycles"
                      variant="outlined"
                      startIcon={<Moon size={20} />}
                      fullWidth
                      sx={{
                        justifyContent: 'flex-start',
                        borderColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        py: 1.75,
                        px: 2,
                        borderRadius: 3,
                        fontWeight: 600,
                        '&:hover': {
                          borderColor: '#FFD700',
                          background: 'rgba(255,215,0,0.15)',
                          transform: 'translateX(4px)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Aktuelle Mondphase
                    </Button>
                    
                    <Button
                      component="a"
                      href="/pricing"
                      variant="contained"
                      startIcon={<Star size={20} />}
                      fullWidth
                      sx={{
                        justifyContent: 'flex-start',
                        background: 'linear-gradient(135deg, #FFD700, #F29F05, #FFD700)',
                        color: '#0b0a0f',
                        py: 1.75,
                        px: 2,
                        borderRadius: 3,
                        fontWeight: 700,
                        boxShadow: '0 4px 15px rgba(255, 215, 0, 0.5), 0 0 20px rgba(255, 215, 0, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #F29F05, #FFD700, #F29F05)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 25px rgba(255, 215, 0, 0.6), 0 0 30px rgba(255, 215, 0, 0.4)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Paket upgraden
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* HD-Tipp des Tages */}
              {(() => {
                const hdType = profile.hdType || 'Generator';
                const tips = {
                  'Generator': {
                    icon: '🔋',
                    title: 'Warte auf die Antwort',
                    text: 'Als Generator bist du heute besonders kraftvoll. Höre auf dein Sakral und warte auf die richtige Antwort, bevor du handelst.',
                    color: '#ff6b9d'
                  },
                  'Manifestor': {
                    icon: '⚡',
                    title: 'Informiere andere',
                    text: 'Als Manifestor hast du heute die Kraft, Dinge in Gang zu setzen. Vergiss nicht, andere zu informieren, bevor du handelst.',
                    color: '#FFD700'
                  },
                  'Projektor': {
                    icon: '🎯',
                    title: 'Warte auf Einladung',
                    text: 'Als Projektor ist heute ein guter Tag, um auf Einladungen zu warten. Deine Weisheit wird gebraucht und anerkannt.',
                    color: '#4ecdc4'
                  },
                  'Reflektor': {
                    icon: '🌙',
                    title: 'Beobachte & Reflektiere',
                    text: 'Als Reflektor spiegelst du heute besonders klar. Nimm dir Zeit, die Energien um dich herum zu beobachten.',
                    color: '#9ca3af'
                  }
                };
                
                const tip = tips[hdType as keyof typeof tips] || tips.Generator;
                
                return (
                  <Card sx={{ 
                    background: `linear-gradient(135deg, ${tip.color}10, ${tip.color}05)`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${tip.color}30`,
                    borderRadius: 3,
                    mb: { xs: 3, md: 4 },
                    boxShadow: `0 4px 16px ${tip.color}15`
                  }}>
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 }, mb: { xs: 1.5, md: 2 } }}>
                        <Box component="span" sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' } }}>{tip.icon}</Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: { xs: '0.65rem', md: '0.7rem' }, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            DEIN HD-TIPP HEUTE
                          </Typography>
                          <Typography variant="h6" sx={{ color: tip.color, fontWeight: 700, lineHeight: 1.3, fontSize: { xs: '1rem', md: '1.1rem' }, mt: 0.5 }}>
                            {tip.title}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, mb: { xs: 2, md: 2.5 }, fontSize: { xs: '0.85rem', md: '0.9rem' } }}>
                        {tip.text}
                      </Typography>
                      
                      <Button
                        component="a"
                        href="/resonanzanalyse/sofort"
                        variant="text"
                        sx={{
                          color: tip.color,
                          fontSize: '0.9rem',
                          p: 0,
                          minWidth: 'auto',
                          fontWeight: 600,
                          '&:hover': {
                            background: 'transparent',
                            textDecoration: 'underline',
                            opacity: 0.8,
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        Mehr über deinen Typ erfahren →
                      </Button>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Letzte Mond-Einträge */}
              {profileData?.moonData && profileData.moonData.length > 0 && (
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  mb: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ color: '#FFD700', mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Moon size={20} />
                      Letzte Mond-Einträge
                    </Typography>
                    
                    <List dense>
                      {profileData.moonData.slice(0, 3).map((entry) => (
                        <ListItem key={entry.id} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <Moon size={16} style={{ color: '#FFD700' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={entry.phase}
                            secondary={`${entry.date} - ${entry.notes}`}
                            sx={{
                              '& .MuiListItemText-primary': { color: '#ffffff', fontSize: '0.9rem' },
                              '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Letzte Matching-Analysen */}
              {profileData?.matchingHistory && profileData.matchingHistory.length > 0 && (
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  mb: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ color: '#FFD700', mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Heart size={20} />
                      Letzte Matching-Analysen
                    </Typography>
                    
                    <List dense>
                      {profileData.matchingHistory.slice(0, 3).map((match) => (
                        <ListItem key={match.id} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <Heart size={16} style={{ color: '#FFD700' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={`${match.person2} (${match.score}%)`}
                            secondary={match.date}
                            sx={{
                              '& .MuiListItemText-primary': { color: '#ffffff', fontSize: '0.9rem' },
                              '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Letzte Coaching-Sessions */}
              {profileData?.coachingSessions && profileData.coachingSessions.length > 0 && (
                <Card sx={{ 
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 3,
                  mb: 4,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ color: '#FFD700', mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BookOpen size={20} />
                      Letzte Coaching-Sessions
                    </Typography>
                    
                    <List dense>
                      {profileData.coachingSessions.slice(0, 3).map((session) => (
                        <ListItem key={session.id} sx={{ px: 0 }}>
                          <ListItemIcon>
                            <BookOpen size={16} style={{ color: '#FFD700' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={`${session.coach} - ${session.type}`}
                            secondary={`${session.date} (${session.status})`}
                            sx={{
                              '& .MuiListItemText-primary': { color: '#ffffff', fontSize: '0.9rem' },
                              '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}
          </Grid>
        </Grid>

          </Container>
        </PageLayout>
      </Box>
    </AccessControl>
  );
}

// Hauptkomponente mit ProtectedRoute
export default function ProfilPage() {
  return (
    <ProtectedRoute requiredRole="basic">
      <ProfilContent />
    </ProtectedRoute>
  );
}
