"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
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
  ListItemButton,
  Divider,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  Paper,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Stack,
  TextField,
  Tooltip,
  Drawer,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Download,
  Save,
  CheckCircle,
  Sparkles,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Star,
  Activity,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  LogOut,
  HelpCircle,
  Info,
  MoreVertical,
  Globe,
  Trash2,
  Key,
  Database,
  Zap,
  Target,
  Menu as MenuIcon,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useHydrationSafe } from '../../hooks/useHydrationSafe';
import AccessControl from '../../components/AccessControl';
import { useRouter } from 'next/navigation';
import Logo from '../components/Logo';
import PageLayout from '../components/PageLayout';

// UserSubscription Interface
interface UserSubscription {
  packageId: 'basic' | 'premium' | 'vip';
  status: 'active' | 'inactive' | 'expired';
  startDate?: string;
  endDate?: string;
  autoRenew?: boolean;
  paymentMethod?: string;
  billingCycle?: string;
}


// Settings Features - Reduziert auf 5 Hauptbereiche
const settingsFeatures = [
  {
    icon: <User size={32} />,
    title: "Profil & persönliche Daten",
    description: "Verwalte deinen Namen, deine E-Mail-Adresse und weitere Profildaten.",
    color: "linear-gradient(135deg, #F29F05, #8C1D04)",
    stats: "100% sicher"
  },
  {
    icon: <Bell size={32} />,
    title: "Benachrichtigungen",
    description: "Bestimme, welche Hinweise du per E-Mail oder in der App erhalten möchtest.",
    color: "linear-gradient(135deg, #F29F05, #8C1D04)",
    stats: "Vollständig anpassbar"
  },
  {
    icon: <Shield size={32} />,
    title: "Datenschutz & Sicherheit",
    description: "Kontrolliere deine Privatsphäre, Sicherheitsoptionen und gespeicherte Daten.",
    color: "linear-gradient(135deg, #F29F05, #8C1D04)",
    stats: "DSGVO-konform"
  },
  {
    icon: <Palette size={32} />,
    title: "Design & Layout",
    description: "Passe Themes, Farben und Layout der App an deinen Geschmack an.",
    color: "linear-gradient(135deg, #F29F05, #8C1D04)",
    stats: "Mehrere Themes"
  },
  {
    icon: <Key size={32} />,
    title: "Konto & Mitgliedschaft",
    description: "Verwalte dein Konto, dein Abo und deine Mitgliedschaft bei The Connection Key.",
    color: "linear-gradient(135deg, #F29F05, #8C1D04)",
    stats: "Transparent"
  }
];

// Settings Categories
const settingsCategories = [
  {
    step: "1",
    title: "Profil bearbeiten",
    description: "Aktualisiere deine persönlichen Informationen und Profildaten",
    icon: <User size={24} />
  },
  {
    step: "2",
    title: "Benachrichtigungen anpassen",
    description: "Wähle aus, welche Benachrichtigungen du erhalten möchtest",
    icon: <Bell size={24} />
  },
  {
    step: "3",
    title: "Sicherheit erhöhen",
    description: "Aktiviere 2FA und andere Sicherheitsfeatures",
    icon: <Shield size={24} />
  },
  {
    step: "4",
    title: "Design personalisieren",
    description: "Wähle dein bevorzugtes Theme und Layout",
    icon: <Palette size={24} />
  }
];

function SettingsContent() {
  const router = useRouter();
  const { user } = useAuth();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState('profile');
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const { isClient: hydrationSafe, localStorage: safeLocalStorage } = useHydrationSafe();

  // Settings states
  const [settings, setSettings] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    birthDate: "",
    notifications: true,
    emailNotifications: true,
    pushNotifications: true,
    darkMode: true,
    language: 'de',
    privacy: 'public'
  });

  const [colorTheme, setColorTheme] = useState<'light' | 'dark'>('dark');

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Load user subscription data - verwende useAuth als primäre Quelle
  useEffect(() => {
    if (!hydrationSafe) return;
    
    try {
      // PRIORITÄT 1: useAuth().user.package (kommt aus Supabase)
      let currentPlan = user?.package || 'basic';
      
      // PRIORITÄT 2: localStorage.userPackage (wird von useAuth gesetzt)
      if (!currentPlan || currentPlan === 'basic') {
        const storedPackage = safeLocalStorage.getItem('userPackage');
        if (storedPackage && ['basic', 'premium', 'vip', 'admin'].includes(storedPackage)) {
          currentPlan = storedPackage as 'basic' | 'premium' | 'vip' | 'admin';
        }
      }
      
      const userData = JSON.parse(safeLocalStorage.getItem('userData') || '{}');
      
      setUserSubscription({
        userId: user?.id || userData.id || 'unknown',
        packageId: currentPlan,
        plan: currentPlan,
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: false,
        paymentMethod: 'none',
        billingCycle: 'monthly'
      });

      // Load user settings
      setSettings({
        name: userData.firstName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        location: userData.location || '',
        birthDate: userData.birthDate || '',
        notifications: userData.notifications !== false,
        emailNotifications: userData.emailNotifications !== false,
        pushNotifications: userData.pushNotifications !== false,
        darkMode: userData.darkMode !== false,
        language: userData.language || 'de',
        privacy: userData.privacy || 'public'
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserSubscription({
        userId: 'unknown',
        packageId: 'basic',
        plan: 'basic',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: false,
        paymentMethod: 'none',
        billingCycle: 'monthly'
      });
    }
  }, [hydrationSafe]);

  // Settings menu handlers
  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => setSuccess(false), 3000);
    }, 1000);
  };

  const handleThemeChange = () => {
    const newTheme = colorTheme === 'light' ? 'dark' : 'light';
    setColorTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleExportData = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    const userId = safeLocalStorage.getItem("userId");
    if (!userId) {
      setError("Keine User-ID gefunden.");
      setLoading(false);
      return;
    }
    
    try {
      // Supabase: Benutzerdaten abrufen
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        if (typeof window !== 'undefined') {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `userdata_${userId}.json`;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError("Fehler beim Export.");
      }
    } catch {
      setError("Fehler beim Export.");
    } finally {
      setLoading(false);
    }
  };

  const settingsTabs = [
    { id: 'profile', label: 'Profil & persönliche Daten', icon: <User size={20} /> },
    { id: 'notifications', label: 'Benachrichtigungen', icon: <Bell size={20} /> },
    { id: 'privacy', label: 'Datenschutz & Sicherheit', icon: <Shield size={20} /> },
    { id: 'appearance', label: 'Design & Layout', icon: <Palette size={20} /> },
    { id: 'account', label: 'Konto & Mitgliedschaft', icon: <Settings size={20} /> }
  ];

  return (
    <AccessControl 
      path="/settings" 
      userSubscription={userSubscription ? {
        ...userSubscription,
        packageId: userSubscription.packageId as 'basic' | 'premium' | 'vip' | 'admin'
      } : undefined}
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
        position: 'relative',
        overflow: 'hidden',
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
        
        {/* Globaler Header kommt aus AppHeader */}

        {/* Hero Section */}
        <PageLayout activePage="settings" showLogo={true}>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 8 }, px: { xs: 2, md: 0 } }}>
              <Typography variant="h1" sx={{
                color: '#FFFFFF',
                fontWeight: 800,
                mb: { xs: 1, md: 1.5 },
                fontSize: { xs: '2rem', sm: '2.5rem', md: '4rem' },
                letterSpacing: '-0.01em',
                lineHeight: { xs: 1.2, md: 1.1 }
              }}>
                Einstellungen
              </Typography>
              
              <Typography variant="h5" sx={{
                color: '#C7C7C7',
                mb: { xs: 2, md: 2.5 },
                maxWidth: { xs: '100%', md: 700 },
                mx: 'auto',
                lineHeight: { xs: 1.5, md: 1.6 },
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.2rem' },
                px: { xs: 1, md: 0 }
              }}>
                Verwalte deine persönlichen Daten, Privatsphäre und dein App-Erlebnis – alles an einem Ort.
              </Typography>
              
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={1.5}
                justifyContent="center"
                sx={{ mb: 2 }}
              >
                <Button
                  onClick={() => setActiveTab('profile')}
                  variant="contained"
                  size="large"
                  sx={{
                    background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                    px: 5,
                    py: 2,
                    borderRadius: 6, // 24px
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'none',
                    minWidth: { xs: '100%', sm: 'auto' },
                    boxShadow: '0 8px 25px rgba(242, 159, 5, 0.30), 0 0 20px rgba(255, 122, 0, 0.05)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                      transform: 'scale(1.02) translateY(-2px)',
                      boxShadow: '0 12px 35px rgba(242, 159, 5, 0.45), 0 0 30px rgba(255, 122, 0, 0.08)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Profildaten öffnen
                </Button>
                
                <Button
                  onClick={() => setActiveTab('notifications')}
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'rgba(242, 159, 5, 0.6)', // +10% heller
                    color: '#F29F05',
                    px: 5,
                    py: 2,
                    borderRadius: 6, // 24px
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'none',
                    minWidth: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      borderColor: '#F29F05',
                      backgroundColor: 'rgba(242, 159, 5, 0.1)',
                      transform: 'scale(1.02) translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(242, 159, 5, 0.3), 0 0 15px rgba(242, 159, 5, 0.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Benachrichtigungen bearbeiten
                </Button>
              </Stack>

              {/* Stats als Badges */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: { xs: 0.75, md: 1 },
                mb: { xs: 4, md: 6 },
                flexWrap: 'wrap',
                px: { xs: 2, md: 0 }
              }}>
                <Chip
                  label="100% Datenschutz"
                  sx={{
                    background: 'rgba(242, 159, 5, 0.15)',
                    color: '#F29F05',
                    fontWeight: 600,
                    fontSize: '0.625rem', // 10px
                    px: 2,
                    py: 0.75, // 6-8px
                    height: 'auto',
                    border: '1px solid rgba(242, 159, 5, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em'
                  }}
                />
                <Chip
                  label="DSGVO-konform"
                  sx={{
                    background: 'rgba(242, 159, 5, 0.15)',
                    color: '#F29F05',
                    fontWeight: 600,
                    fontSize: '0.625rem', // 10px
                    px: 2,
                    py: 0.75, // 6-8px
                    height: 'auto',
                    border: '1px solid rgba(242, 159, 5, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em'
                  }}
                />
                <Chip
                  label="24/7 verfügbar"
                  sx={{
                    background: 'rgba(242, 159, 5, 0.15)',
                    color: '#F29F05',
                    fontWeight: 600,
                    fontSize: '0.625rem', // 10px
                    px: 2,
                    py: 0.75, // 6-8px
                    height: 'auto',
                    border: '1px solid rgba(242, 159, 5, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em'
                  }}
                />
                <Chip
                  label="SSL-verschlüsselt"
                  sx={{
                    background: 'rgba(242, 159, 5, 0.15)',
                    color: '#F29F05',
                    fontWeight: 600,
                    fontSize: '0.625rem', // 10px
                    px: 2,
                    py: 0.75, // 6-8px
                    height: 'auto',
                    border: '1px solid rgba(242, 159, 5, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em'
                  }}
                />
              </Box>
            </Box>
          </motion.div>

          {/* So funktioniert's - Kompakt */}
          <Box sx={{ mb: 5, textAlign: 'center' }}>
            <Typography variant="body2" sx={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: { xs: '0.875rem', md: '0.95rem' }
            }}>
              <Typography component="span" sx={{ fontWeight: 600, color: '#F29F05', mr: 1 }}>
                So funktioniert&apos;s:
              </Typography>
              Wähle einen Bereich, passe deine Einstellungen an – wir speichern alles automatisch für dich.
            </Typography>
          </Box>

          {/* Settings Features */}
          <Box sx={{ mb: 7 }}>
            <Typography variant="h2" sx={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' }
            }}>
              ✨ Einstellungsbereiche
            </Typography>
            <Typography variant="h6" sx={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.7)',
              mb: 5,
              maxWidth: 600,
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.1rem' }
            }}>
              Alle wichtigen Einstellungen an einem Ort
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              {settingsFeatures.map((feature, index) => (
                <Grid item xs={12} sm={6} md={index < 3 ? 4 : 6} key={index} sx={{ mb: { xs: 2, md: 0 } }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <Card sx={{
                      background: 'rgba(242, 159, 5, 0.08)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: { xs: 2, md: 3 },
                      border: '1px solid rgba(242, 159, 5, 0.20)',
                      p: { xs: 2.5, md: 3 },
                      height: '100%',
                      minHeight: { xs: 'auto', md: '200px' },
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: { xs: 'none', md: 'scale(1.01) translateY(-2px)' },
                        background: { xs: 'rgba(242, 159, 5, 0.08)', md: 'rgba(242, 159, 5, 0.12)' },
                        boxShadow: { xs: 'none', md: '0 15px 45px rgba(242, 159, 5, 0.35), 0 0 20px rgba(242, 159, 5, 0.08)' },
                        border: { xs: '1px solid rgba(242, 159, 5, 0.20)', md: '1px solid rgba(242, 159, 5, 0.40)' },
                        '& .feature-icon': {
                          transform: { xs: 'none', md: 'scale(1.05)' }
                        }
                      }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.25 }}> {/* 10px */}
                        <Box 
                          className="feature-icon"
                          sx={{ 
                            display: 'inline-flex',
                            p: 2,
                            borderRadius: 2,
                            background: feature.color,
                            color: '#F8C48A', // Helleres Icon
                            transition: 'all 0.2s ease',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                            flexShrink: 0,
                            '& svg': {
                              width: 20,
                              height: 20
                            }
                          }}
                        >
                          {React.cloneElement(feature.icon, { size: 20 })}
                        </Box>
                        <Box sx={{ flex: 1, ml: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h5" sx={{ 
                              color: 'white', 
                              fontWeight: 700, 
                              fontSize: { xs: '1.2rem', md: '1.5rem' }
                            }}>
                              {feature.title}
                            </Typography>
                            {(feature as any).tooltip && (
                              <Tooltip 
                                title={(feature as any).tooltip}
                                arrow
                                placement="top"
                                componentsProps={{
                                  tooltip: {
                                    sx: {
                                      bgcolor: 'rgba(0, 0, 0, 0.9)',
                                      border: '1px solid rgba(242, 159, 5, 0.3)',
                                      fontSize: '0.85rem'
                                    }
                                  }
                                }}
                              >
                                <IconButton size="small" sx={{ ml: 1, color: 'rgba(255, 255, 255, 0.6)' }}>
                                  <Info size={16} />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                          <Typography variant="body1" sx={{ 
                            color: 'rgba(255,255,255,0.8)',
                            lineHeight: 1.7,
                            mb: 2,
                            fontSize: { xs: '0.9rem', md: '1rem' }
                          }}>
                            {feature.description}
                          </Typography>
                          <Chip
                            label={feature.stats}
                            sx={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: { xs: '0.8rem', md: '0.9rem' }
                            }}
                          />
                        </Box>
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>


          {/* Sticky Navigation Tabs */}
          <Box sx={{ 
            position: 'sticky',
            top: { xs: 60, md: 80 },
            zIndex: 100,
            background: 'rgba(11, 10, 15, 0.9)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(242, 159, 5, 0.2)',
            py: { xs: 1, md: 1.25 },
            mb: { xs: 3, md: 4 },
            mx: { xs: -2, md: 0 },
            px: { xs: 2, md: 0 }
          }}>
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 0.75, md: 1 }, 
              overflowX: { xs: 'auto', md: 'visible' },
              overflowY: 'hidden',
              flexWrap: { xs: 'nowrap', md: 'wrap' },
              justifyContent: { xs: 'flex-start', md: 'center' },
              pb: { xs: 1, md: 0 },
              '&::-webkit-scrollbar': {
                height: '4px'
              },
              '&::-webkit-scrollbar-track': {
                background: 'rgba(255, 255, 255, 0.05)'
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(242, 159, 5, 0.3)',
                borderRadius: '2px'
              }
            }}>
              {settingsTabs.map((tab) => (
                <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'contained' : 'outlined'}
                onClick={() => setActiveTab(tab.id)}
                startIcon={React.cloneElement(tab.icon, { size: { xs: 18, md: 20 } })}
                sx={{
                  background: activeTab === tab.id 
                    ? 'rgba(255, 122, 0, 0.2)'
                    : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#F29F05',
                  border: activeTab === tab.id 
                    ? '1px solid rgba(255, 122, 0, 0.6)'
                    : '1px solid rgba(242, 159, 5, 0.3)',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  px: { xs: 2, md: 3 },
                  py: { xs: 1, md: 1.2 },
                  fontSize: { xs: '0.75rem', md: '0.9375rem' },
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  minWidth: { xs: 'auto', md: 'auto' },
                  '& .MuiButton-startIcon': {
                    marginRight: { xs: '6px', md: '8px' },
                    marginLeft: 0
                  },
                  '&:hover': {
                    background: activeTab === tab.id 
                      ? 'rgba(255, 122, 0, 0.25)' 
                      : 'rgba(242, 159, 5, 0.1)',
                    borderColor: 'rgba(242, 159, 5, 0.5)',
                    transform: { xs: 'none', md: 'translateY(-1px)' }
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Box component="span" sx={{ 
                  display: { xs: 'none', sm: 'inline' },
                  '@media (max-width: 600px)': {
                    display: 'none'
                  }
                }}>
                  {tab.label}
                </Box>
                <Box component="span" sx={{ 
                  display: { xs: 'inline', sm: 'none' },
                  '@media (min-width: 600px)': {
                    display: 'none'
                  }
                }}>
                  {tab.label.split(' ')[0]}
                </Box>
              </Button>
              ))}
            </Box>
          </Box>

          {/* Content based on active tab */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Grid container spacing={{ xs: 2, md: 4 }}>
                <Grid item xs={12} md={6}>
                  <Card sx={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: { xs: 2, md: 3 },
                    p: { xs: 2.5, md: 3 },
                    mb: { xs: 2, md: 0 }
                  }}>
                    <Typography variant="h6" sx={{ 
                      color: 'white', 
                      mb: 3, 
                      display: 'flex', 
                      alignItems: 'center',
                      fontWeight: 700,
                      fontSize: { xs: '1.125rem', md: '1.25rem' } // 18px
                    }}>
                      <User size={22} style={{ marginRight: 12, color: '#F8C48A' }} />
                      Persönliche Daten
                    </Typography>
                    
                    <Box sx={{ mb: 2.25 }}> {/* 18px */}
                      <Typography variant="body2" sx={{ 
                        color: '#E4E4E4', // Mehr Kontrast
                        mb: 0.75, // 6px
                        fontSize: '0.75rem', // 12px
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Vorname
                      </Typography>
                      <Box
                        component="input"
                        type="text"
                        value={settings.name}
                        onChange={handleInputChange}
                        name="name"
                        placeholder="Dein Vorname"
                        sx={{
                          width: '100%',
                          p: 1.5,
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: 3, // 12px
                          color: 'white',
                          fontSize: '0.9375rem', // 15px
                          lineHeight: 1.5,
                          '&:focus': {
                            outline: 'none',
                            borderColor: 'rgba(242, 159, 5, 0.7)',
                            boxShadow: '0 0 0 3px rgba(242, 159, 5, 0.05)'
                          },
                          '::placeholder': {
                            color: 'rgba(255, 255, 255, 0.5)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 2.25 }}> {/* 18px */}
                      <Typography variant="body2" sx={{ 
                        color: '#E4E4E4', // Mehr Kontrast
                        mb: 0.75, // 6px
                        fontSize: '0.75rem', // 12px
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        E-Mail
                      </Typography>
                      <Box
                        component="input"
                        type="email"
                        value={settings.email}
                        onChange={handleInputChange}
                        name="email"
                        placeholder="deine@email.com"
                        sx={{
                          width: '100%',
                          p: 1.5,
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: 3, // 12px
                          color: 'white',
                          fontSize: '0.9375rem', // 15px
                          lineHeight: 1.5,
                          '&:focus': {
                            outline: 'none',
                            borderColor: 'rgba(242, 159, 5, 0.7)',
                            boxShadow: '0 0 0 3px rgba(242, 159, 5, 0.05)'
                          },
                          '::placeholder': {
                            color: 'rgba(255, 255, 255, 0.5)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 2.25 }}> {/* 18px */}
                      <Typography variant="body2" sx={{ 
                        color: '#E4E4E4', // Mehr Kontrast
                        mb: 0.75, // 6px
                        fontSize: '0.75rem', // 12px
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Telefon
                      </Typography>
                      <Box
                        component="input"
                        type="tel"
                        value={settings.phone}
                        onChange={handleInputChange}
                        name="phone"
                        placeholder="+49 123 456789"
                        sx={{
                          width: '100%',
                          p: 1.5,
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: 3, // 12px
                          color: 'white',
                          fontSize: '0.9375rem', // 15px
                          lineHeight: 1.5,
                          '&:focus': {
                            outline: 'none',
                            borderColor: 'rgba(242, 159, 5, 0.7)',
                            boxShadow: '0 0 0 3px rgba(242, 159, 5, 0.05)'
                          },
                          '::placeholder': {
                            color: 'rgba(255, 255, 255, 0.5)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 2.25 }}> {/* 18px */}
                      <Typography variant="body2" sx={{ 
                        color: '#E4E4E4', // Mehr Kontrast
                        mb: 0.75, // 6px
                        fontSize: '0.75rem', // 12px
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Standort
                      </Typography>
                      <Box
                        component="input"
                        type="text"
                        value={settings.location}
                        onChange={handleInputChange}
                        name="location"
                        placeholder="Berlin, Deutschland"
                        sx={{
                          width: '100%',
                          p: 1.5,
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: 3, // 12px
                          color: 'white',
                          fontSize: { xs: '0.9rem', md: '1rem' },
                          '&:focus': {
                            outline: 'none',
                            borderColor: '#F29F05',
                            boxShadow: '0 0 0 3px rgba(242, 159, 5, 0.3)'
                          },
                          '::placeholder': {
                            color: 'rgba(255, 255, 255, 0.5)'
                          }
                        }}
                      />
                    </Box>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 3,
                    p: { xs: 3, md: 4 }
                  }}>
                    <Typography variant="h6" sx={{ 
                      color: 'white', 
                      mb: 3, 
                      display: 'flex', 
                      alignItems: 'center',
                      fontWeight: 700,
                      fontSize: { xs: '1.1rem', md: '1.25rem' }
                    }}>
                      <Calendar size={24} style={{ marginRight: 12, color: 'rgba(255, 255, 255, 0.95)' }} />
                      Geburtsdaten & Account
                    </Typography>
                    
                    <Box sx={{ mb: 2.5 }}>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.6)', 
                        mb: 1,
                        fontSize: { xs: '0.8rem', md: '0.85rem' },
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Geburtsdatum
                      </Typography>
                      <Box
                        component="input"
                        type="date"
                        value={settings.birthDate}
                        onChange={handleInputChange}
                        name="birthDate"
                        sx={{
                          width: '100%',
                          p: { xs: 1.2, md: 1.5 },
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: 2,
                          color: 'white',
                          fontSize: { xs: '0.9rem', md: '1rem' },
                          '&:focus': {
                            outline: 'none',
                            borderColor: '#F29F05',
                            boxShadow: '0 0 0 3px rgba(242, 159, 5, 0.3)'
                          }
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" sx={{ 
                        color: 'rgba(255,255,255,0.6)', 
                        mb: 1,
                        fontSize: { xs: '0.8rem', md: '0.85rem' },
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Human Design Typ
                      </Typography>
                      <Box
                        component="select"
                        sx={{
                          width: '100%',
                          p: { xs: 1.2, md: 1.5 },
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: 2,
                          color: 'white',
                          fontSize: { xs: '0.9rem', md: '1rem' },
                          '&:focus': {
                            outline: 'none',
                            borderColor: '#F29F05',
                            boxShadow: '0 0 0 3px rgba(242, 159, 5, 0.3)'
                          }
                        }}
                      >
                        <option value="">Wähle deinen Typ</option>
                        <option value="Generator">Generator</option>
                        <option value="Projector">Projector</option>
                        <option value="Manifestor">Manifestor</option>
                        <option value="Reflector">Reflector</option>
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      onClick={handleSave}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <Save size={20} />}
                      sx={{
                        background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                        color: 'white',
                        fontWeight: 700,
                        '&:hover': { 
                          background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(242, 159, 5, 0.40)'
                        },
                        width: '100%',
                        py: { xs: 1.3, md: 1.5 },
                        fontSize: { xs: '0.95rem', md: '1rem' },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {loading ? 'Speichern...' : 'Änderungen speichern'}
                    </Button>
                  </Card>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card sx={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 3,
                p: 4
              }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center' }}>
                  <Bell size={24} style={{ marginRight: 12 }} />
                  Benachrichtigungseinstellungen
                </Typography>

                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Bell size={20} color="#FFD700" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Alle Benachrichtigungen" 
                      secondary="Erhalte Updates über neue Matches und Nachrichten"
                      sx={{ 
                        '& .MuiListItemText-primary': { color: 'white' },
                        '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                    <Switch
                      checked={settings.notifications}
                      onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#FFD700',
                          '& + .MuiSwitch-track': {
                            backgroundColor: '#FFD700',
                          },
                        },
                      }}
                    />
                  </ListItem>

                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Mail size={20} color="#FFD700" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="E-Mail Benachrichtigungen" 
                      secondary="Erhalte wichtige Updates per E-Mail"
                      sx={{ 
                        '& .MuiListItemText-primary': { color: 'white' },
                        '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#FFD700',
                          '& + .MuiSwitch-track': {
                            backgroundColor: '#FFD700',
                          },
                        },
                      }}
                    />
                  </ListItem>

                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Bell size={20} color="#FFD700" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Push-Benachrichtigungen" 
                      secondary="Erhalte sofortige Benachrichtigungen auf deinem Gerät"
                      sx={{ 
                        '& .MuiListItemText-primary': { color: 'white' },
                        '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#FFD700',
                          '& + .MuiSwitch-track': {
                            backgroundColor: '#FFD700',
                          },
                        },
                      }}
                    />
                  </ListItem>
                </List>
              </Card>
            </motion.div>
          )}

          {activeTab === 'privacy' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card sx={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 3,
                p: 4
              }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center' }}>
                  <Shield size={24} style={{ marginRight: 12 }} />
                  Datenschutz & Sicherheit
                </Typography>

                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Eye size={20} color="#FFD700" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Profil-Sichtbarkeit" 
                      secondary="Wer kann dein Profil sehen"
                      sx={{ 
                        '& .MuiListItemText-primary': { color: 'white' },
                        '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                    <Box
                      component="select"
                      value={settings.privacy}
                      onChange={(e) => setSettings({...settings, privacy: e.target.value})}
                      sx={{
                        p: 1,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: 1,
                        color: 'white',
                        minWidth: 120
                      }}
                    >
                      <option value="public">Öffentlich</option>
                      <option value="friends">Nur Freunde</option>
                      <option value="private">Privat</option>
                    </Box>
                  </ListItem>

                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Lock size={20} color="#FFD700" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Zwei-Faktor-Authentifizierung" 
                      secondary="Erhöhe die Sicherheit deines Kontos"
                      sx={{ 
                        '& .MuiListItemText-primary': { color: 'white' },
                        '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{
                        borderColor: '#FFD700',
                        color: '#FFD700',
                        '&:hover': { borderColor: '#fbbf24', background: 'rgba(255, 215, 0, 0.1)' }
                      }}
                    >
                      Aktivieren
                    </Button>
                  </ListItem>
                </List>
              </Card>
            </motion.div>
          )}

          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card sx={{
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 3,
                p: 4
              }}>
                <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center' }}>
                  <Palette size={24} style={{ marginRight: 12 }} />
                  Erscheinungsbild
                </Typography>

                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      {colorTheme === 'dark' ? <Moon size={20} color="#FFD700" /> : <Sun size={20} color="#FFD700" />}
                    </ListItemIcon>
                    <ListItemText 
                      primary="Dark Mode" 
                      secondary="Schalte zwischen hellem und dunklem Modus um"
                      sx={{ 
                        '& .MuiListItemText-primary': { color: 'white' },
                        '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                    <Switch
                      checked={colorTheme === 'dark'}
                      onChange={handleThemeChange}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#FFD700',
                          '& + .MuiSwitch-track': {
                            backgroundColor: '#FFD700',
                          },
                        },
                      }}
                    />
                  </ListItem>

                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Globe size={20} color="#FFD700" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Sprache" 
                      secondary="Wähle deine bevorzugte Sprache"
                      sx={{ 
                        '& .MuiListItemText-primary': { color: 'white' },
                        '& .MuiListItemText-secondary': { color: 'rgba(255,255,255,0.7)' }
                      }}
                    />
                    <Box
                      component="select"
                      value={settings.language}
                      onChange={(e) => setSettings({...settings, language: e.target.value})}
                      sx={{
                        p: 1,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: 1,
                        color: 'white',
                        minWidth: 120
                      }}
                    >
                      <option value="de">Deutsch</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="es">Español</option>
                    </Box>
                  </ListItem>
                </List>
              </Card>
            </motion.div>
          )}

          {activeTab === 'account' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Card sx={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 3,
                    p: { xs: 3, md: 4 }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Download size={24} style={{ marginRight: 12, color: 'rgba(255, 255, 255, 0.95)' }} />
                      <Typography variant="h6" sx={{ 
                        color: 'white', 
                        fontWeight: 700,
                        fontSize: { xs: '1.1rem', md: '1.25rem' }
                      }}>
                        Daten exportieren
                      </Typography>
                      <Tooltip 
                        title="Exportiere deine Daten als JSON oder PDF"
                        arrow
                        placement="top"
                        componentsProps={{
                          tooltip: {
                            sx: {
                              bgcolor: 'rgba(0, 0, 0, 0.9)',
                              border: '1px solid rgba(242, 159, 5, 0.3)',
                              fontSize: '0.85rem'
                            }
                          }
                        }}
                      >
                        <IconButton size="small" sx={{ ml: 1, color: 'rgba(255, 255, 255, 0.6)' }}>
                          <Info size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    
                    <Typography sx={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      mb: 3,
                      fontSize: { xs: '0.9rem', md: '1rem' }
                    }}>
                      Lade alle deine Daten als JSON-Datei herunter
                    </Typography>

                    <Button
                      variant="contained"
                      onClick={handleExportData}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <Download size={20} />}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        fontWeight: 600,
                        '&:hover': { 
                          background: 'rgba(255, 255, 255, 0.15)',
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          transform: 'translateY(-2px)'
                        },
                        width: '100%',
                        py: { xs: 1.3, md: 1.5 },
                        fontSize: { xs: '0.95rem', md: '1rem' },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {loading ? 'Exportieren...' : 'Daten exportieren'}
                    </Button>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 3,
                    p: 4
                  }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 3, display: 'flex', alignItems: 'center' }}>
                      <LogOut size={24} style={{ marginRight: 12 }} />
                      Konto verwalten
                    </Typography>
                    
                    <List>
                      <ListItem sx={{ px: 0, py: 1 }}>
                        <Button
                          variant="outlined"
                          fullWidth
                          sx={{
                            borderColor: '#ef4444',
                            color: '#ef4444',
                            '&:hover': { borderColor: '#dc2626', background: 'rgba(239, 68, 68, 0.1)' }
                          }}
                        >
                          <LogOut size={16} style={{ marginRight: 8 }} />
                          Abmelden
                        </Button>
                      </ListItem>
                      
                      <ListItem sx={{ px: 0, py: 1 }}>
                        <Button
                          variant="outlined"
                          fullWidth
                          sx={{
                            borderColor: '#ef4444',
                            color: '#ef4444',
                            '&:hover': { borderColor: '#dc2626', background: 'rgba(239, 68, 68, 0.1)' }
                          }}
                        >
                          <Trash2 size={16} style={{ marginRight: 8 }} />
                          Konto löschen
                        </Button>
                      </ListItem>
                    </List>
                  </Card>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {/* Success/Error Messages */}
          {success && (
            <Alert severity="success" sx={{ mt: 3, background: 'rgba(16, 185, 129, 0.1)', color: 'white' }}>
              <CheckCircle size={20} style={{ marginRight: 8 }} />
              Änderungen erfolgreich gespeichert!
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 3, background: 'rgba(239, 68, 68, 0.1)', color: 'white' }}>
              {error}
            </Alert>
          )}

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Card sx={{
              background: 'rgba(242, 159, 5, 0.08)',
              backdropFilter: 'blur(20px)',
              borderRadius: { xs: 2, md: 4 },
              border: '1px solid rgba(242, 159, 5, 0.20)',
              textAlign: 'center',
              p: { xs: 3, md: 5 },
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
              mt: { xs: 5, md: 8 },
              mx: { xs: 2, md: 0 },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(242, 159, 5, 0.10), rgba(140, 29, 4, 0.10))',
                zIndex: 0
              }
            }}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ mb: 3 }}>
                  <Settings size={48} color="#F29F05" style={{ marginBottom: 16 }} />
                </Box>
                <Typography variant="h3" sx={{ 
                  color: '#FFFFFF', 
                  fontWeight: 800, 
                  mb: 2,
                  fontSize: { xs: '1.8rem', md: '2.5rem' }
                }}>
                  🚀 Einstellungen gespeichert. Was möchtest du als Nächstes tun?
                </Typography>
                <Typography variant="h6" sx={{ 
                  color: 'rgba(255,255,255,0.85)', 
                  mb: 5,
                  maxWidth: 700,
                  mx: 'auto',
                  lineHeight: 1.8,
                  fontSize: { xs: '1rem', md: '1.2rem' }
                }}>
                  Deine Änderungen sind aktiv. Du kannst jederzeit zurückkommen und alles wieder anpassen.
                </Typography>
                
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={1.75} // 14px
                  justifyContent="center"
                  sx={{ mb: 3 }}
                >
                  <Button
                    component={Link}
                    href="/dashboard"
                    variant="contained"
                    size="large"
                    sx={{
                      background: 'linear-gradient(135deg, #F29F05, #8C1D04)',
                      px: 6,
                      py: 2.5,
                      borderRadius: 3,
                      fontWeight: 700,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      minWidth: { xs: '100%', sm: '300px' },
                      boxShadow: '0 10px 30px rgba(242, 159, 5, 0.35)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #8C1D04, #F29F05)',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 15px 40px rgba(242, 159, 5, 0.45)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Zum Dashboard
                  </Button>
                  
                  <Button
                    component={Link}
                    href="/profil"
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'rgba(242, 159, 5, 0.5)',
                      color: '#F29F05',
                      px: 6,
                      py: 2.5,
                      borderRadius: 3,
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      minWidth: { xs: '100%', sm: '300px' },
                      '&:hover': {
                        borderColor: '#F29F05',
                        backgroundColor: 'rgba(242, 159, 5, 0.10)',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(242, 159, 5, 0.25)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Profil ansehen
                  </Button>
                </Stack>

                <Typography sx={{ 
                  color: 'rgba(255,255,255,0.6)', 
                  mt: 3,
                  fontSize: '0.9rem'
                }}>
                  100% sicher • DSGVO-konform • 24/7 verfügbar
                </Typography>
              </Box>
            </Card>
          </motion.div>
        </PageLayout>
      </Box>
    </AccessControl>
  );
}

// Hauptkomponente mit ProtectedRoute
export default function SettingsPage() {
  return (
    <ProtectedRoute requiredRole="basic">
      <SettingsContent />
    </ProtectedRoute>
  );
}