"use client";
import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Divider,
  useTheme,
  useMediaQuery,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  Collapse,
  Badge,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Dashboard,
  Person,
  Settings,
  Logout,
  Login,
  AccountCircle,
  Close,
  BarChart,
  Event,
  MenuBook,
  Group,
  Favorite,
  Psychology,
  Star,
  FlashOn,
  GpsFixed,
  Public,
  ExpandMore,
  ExpandLess,
  AttachMoney as DollarSign,
  People as Users,
  MenuBook as BookOpen,
  Favorite as Heart,
  Language as Globe,
  Nightlight as Moon,
  Assessment as BarChart3,
  FitnessCenter as Activity,
  Psychology as Brain,
  Event as Calendar,
  Article as BookText,
  Person as User,
  Dashboard as LayoutDashboard
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const drawerWidth = 320;

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ReactElement;
  category?: string;
  description?: string;
  badge?: string;
  isNew?: boolean;
  isPremium?: boolean;
}

const navigationItems: NavigationItem[] = [
  // Hauptseiten
  { name: "Start", path: "/", icon: <Home />, category: "Hauptseiten", description: "Zurück zur Startseite" },
  { name: "Dashboard", path: "/dashboard", icon: <Dashboard />, category: "Hauptseiten", description: "Ihr persönliches Dashboard" },
  { name: "Chart", path: "/chart", icon: <BarChart />, category: "Hauptseiten", description: "Human Design Chart berechnen" },
  { name: "Mondkalender", path: "/mondkalender", icon: <Event />, category: "Hauptseiten", description: "Mondphasen und Tracking" },
  
  // Human Design
  { name: "Human Design Chart", path: "/human-design-chart", icon: <Psychology />, category: "Human Design", description: "Detailliertes Human Design Chart" },
  
  // Wissen & Journal
  { name: "Knowledge", path: "/knowledge", icon: <MenuBook />, category: "Wissen & Journal", description: "Wissensdatenbank" },
  { name: "Journal", path: "/journal", icon: <MenuBook />, category: "Wissen & Journal", description: "Persönliches Journal" },
  { name: "Resonanzanalyse", path: "/resonanzanalyse", icon: <MenuBook />, category: "Wissen & Journal", description: "Resonanzanalyse-System" },
  
  // Community & Dating
  { name: "Community", path: "/community", icon: <Group />, category: "Community & Social", description: "Community-Zugang" },
  { name: "Dating", path: "/dating", icon: <Favorite />, category: "Community & Social", description: "Dating-System" },
  { name: "Swipe", path: "/swipe", icon: <Heart />, category: "Community & Social", description: "Swipe-Funktion" },
  { name: "Matching", path: "/matching", icon: <Heart />, category: "Community & Social", description: "Matching-System" },
  
  // Coaching
  { name: "Coaching", path: "/coaching", icon: <Users />, category: "Coaching", description: "Coaching-Übersicht" },
  
  // Planeten & Astrologie
  { name: "Planeten", path: "/planets", icon: <Globe />, category: "Planeten & Astrologie", description: "Alle Planeten im Überblick" },
  { name: "Sonne", path: "/planets/sun", icon: <Star />, category: "Planeten & Astrologie", description: "Die Sonne im Human Design" },
  { name: "Mond", path: "/planets/moon", icon: <Moon />, category: "Planeten & Astrologie", description: "Der Mond im Human Design" },
  { name: "Merkur", path: "/planets/mercury", icon: <Star />, category: "Planeten & Astrologie", description: "Merkur im Human Design" },
  { name: "Venus", path: "/planets/venus", icon: <Star />, category: "Planeten & Astrologie", description: "Venus im Human Design" },
  { name: "Mars", path: "/planets/mars", icon: <Star />, category: "Planeten & Astrologie", description: "Mars im Human Design" },
  { name: "Jupiter", path: "/planets/jupiter", icon: <Star />, category: "Planeten & Astrologie", description: "Jupiter im Human Design" },
  { name: "Saturn", path: "/planets/saturn", icon: <Star />, category: "Planeten & Astrologie", description: "Saturn im Human Design" },
  { name: "Uranus", path: "/planets/uranus", icon: <Star />, category: "Planeten & Astrologie", description: "Uranus im Human Design" },
  { name: "Neptun", path: "/planets/neptune", icon: <Star />, category: "Planeten & Astrologie", description: "Neptun im Human Design" },
  { name: "Pluto", path: "/planets/pluto", icon: <Star />, category: "Planeten & Astrologie", description: "Pluto im Human Design" },
  { name: "Chiron", path: "/chiron", icon: <Star />, category: "Planeten & Astrologie", description: "Chiron - Der verwundete Heiler" },
  { name: "Inkarnationskreuz", path: "/planets/incarnation-cross", icon: <Star />, category: "Planeten & Astrologie", description: "Die 12 Inkarnationskreuze" },
  
  // Premium Features
  { name: "Analytics", path: "/analytics", icon: <BarChart3 />, category: "Premium Features", description: "Human Design Analytics", isPremium: true },
  { name: "Realtime Analysis", path: "/realtime-analysis", icon: <Activity />, category: "Premium Features", description: "Echtzeit-Analyse", isPremium: true },
  { name: "AI Chart Analysis", path: "/ai-chart-analysis", icon: <Brain />, category: "Premium Features", description: "KI-Chart-Analyse", isPremium: true },
  { name: "AI Compatibility", path: "/ai-compatibility", icon: <Brain />, category: "Premium Features", description: "KI-Kompatibilität", isPremium: true },
  { name: "Gamification", path: "/gamification", icon: <Star />, category: "Premium Features", description: "Gamification-System", isPremium: true },
  { name: "Live Events", path: "/live-events", icon: <Calendar />, category: "Premium Features", description: "Live-Events", isPremium: true },
  
  // Mobile & Apps
  { name: "Mobile App", path: "/mobile-app", icon: <Star />, category: "Mobile & Apps", description: "Mobile App Download" },
  { name: "Mobile Dashboard", path: "/mobile-dashboard", icon: <Star />, category: "Mobile & Apps", description: "Mobile-optimiertes Dashboard" },
  { name: "PWA Install", path: "/pwa-install", icon: <Star />, category: "Mobile & Apps", description: "Progressive Web App" },
  
  // Profil & Einstellungen
  { name: "Profil", path: "/profil", icon: <Person />, category: "Profil & Einstellungen", description: "Benutzerprofil" },
  { name: "Profil Einrichten", path: "/profil-einrichten", icon: <Person />, category: "Profil & Einstellungen", description: "Profil einrichten" },
  { name: "Settings", path: "/settings", icon: <Settings />, category: "Profil & Einstellungen", description: "Anwendungseinstellungen" },
  
  // Pricing & Subscription
  { name: "Pricing", path: "/pricing", icon: <DollarSign />, category: "Pricing & Subscription", description: "Preisübersicht" },
  
  // Admin
  { name: "Admin", path: "/admin", icon: <Settings />, category: "Admin", description: "Admin-Dashboard" },
  { name: "Seitenanzeige", path: "/seitenanzeige", icon: <Public />, category: "Admin", description: "Übersicht aller Seiten" }
];

interface MobileNavigationProps {
  currentPath?: string;
}

export default function MobileNavigation({ currentPath = '/' }: MobileNavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [userPackage, setUserPackage] = useState('free');
  const [username, setUsername] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const packageData = localStorage.getItem("userPackage");
      if (token) {
        try {
          const base64Payload = token.split('.')[1];
          if (base64Payload) {
            import('@/lib/utils/safeJson').then(({ safeJsonParse }) => {
              const payload = safeJsonParse<any>(atob(base64Payload), null);
              if (payload && payload.username) {
                setUsername(payload.username);
              }
            });
          }
        } catch {}
      }
      if (packageData) {
        setUserPackage(packageData);
      }
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCategoryToggle = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPackage');
    setUsername(null);
    setUserPackage('free');
    router.push('/');
    handleDrawerToggle();
  };

  // Gruppiere Navigation Items nach Kategorien
  const groupedItems = navigationItems.reduce((acc, item) => {
    const category = item.category || 'Sonstiges';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  // Filtere Items basierend auf User-Paket
  const packageHierarchy: Record<string, number> = {
    'free': 0,
    'basic': 1,
    'premium': 2,
    'vip': 3,
    'admin': 4
  };

  const hasAccess = (item: NavigationItem) => {
    if (!item.isPremium) return true;
    return packageHierarchy[userPackage] >= 2; // Premium oder höher
  };

  const filteredItems = Object.entries(groupedItems)
    .map(([category, items]) => [category, items.filter(hasAccess)] as [string, NavigationItem[]])
    .filter(([_, items]) => items.length > 0);

  const drawer = (
    <Box sx={{ 
      width: drawerWidth, 
      height: '100%',
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#FFD700', fontWeight: 700 }}>
            🌙 HD App
          </Typography>
          <IconButton onClick={handleDrawerToggle} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
        
        {username && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#FFD700', color: '#000' }}>
              {username.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2" sx={{ color: 'white' }}>
              {username}
            </Typography>
            <Chip 
              label={userPackage.toUpperCase()} 
              size="small"
              sx={{ 
                background: 'rgba(255, 215, 0, 0.2)', 
                color: '#FFD700',
                fontSize: '0.7rem'
              }} 
            />
          </Box>
        )}
      </Box>

      {/* Navigation Content */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
        {filteredItems.map(([category, items]) => {
          const categoryName = category as string;
          return (
            <Box key={categoryName} sx={{ mb: 1 }}>
              <ListItem 
                onClick={() => handleCategoryToggle(categoryName)}
                sx={{
                  cursor: 'pointer',
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.05)',
                  }
                }}
              >
                <ListItemIcon sx={{ color: '#FFD700', minWidth: 40 }}>
                  {expandedCategories.includes(categoryName) ? <ExpandLess /> : <ExpandMore />}
                </ListItemIcon>
                <ListItemText 
                  primary={
                    <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600 }}>
                      {categoryName}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {items.length} Seiten
                    </Typography>
                  }
                />
              </ListItem>
              
              <Collapse in={expandedCategories.includes(categoryName)} timeout="auto" unmountOnExit>
              <List dense sx={{ pl: 2 }}>
                {items.map((item) => (
                  <ListItem 
                    key={item.path}
                    component={Link}
                    href={item.path}
                    onClick={handleDrawerToggle}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      backgroundColor: currentPath === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.05)',
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: currentPath === item.path ? '#FFD700' : 'rgba(255,255,255,0.7)', 
                      minWidth: 40 
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: currentPath === item.path ? '#FFD700' : 'white',
                              fontWeight: currentPath === item.path ? 'bold' : 'normal'
                            }}
                          >
                            {item.name}
                          </Typography>
                          {item.isNew && (
                            <Chip 
                              label="NEW" 
                              size="small" 
                              sx={{ 
                                background: '#22c55e', 
                                color: 'white',
                                fontSize: '0.6rem',
                                height: 16
                              }} 
                            />
                          )}
                          {item.isPremium && (
                            <Chip 
                              label="PREMIUM" 
                              size="small" 
                              sx={{ 
                                background: '#f59e0b', 
                                color: 'white',
                                fontSize: '0.6rem',
                                height: 16
                              }} 
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                          {item.description}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
          );
        })}
      </Box>

      {/* Footer */}
      <Box sx={{ 
        p: 2, 
        borderTop: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)'
      }}>
        {username ? (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Logout />}
            onClick={handleLogout}
            sx={{
              borderColor: 'rgba(255,255,255,0.3)',
              color: 'white',
              '&:hover': {
                borderColor: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.1)'
              }
            }}
          >
            Abmelden
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Login />}
              onClick={() => { router.push('/login'); handleDrawerToggle(); }}
              sx={{
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'white',
                flex: 1,
                '&:hover': {
                  borderColor: '#FFD700',
                  backgroundColor: 'rgba(255, 215, 0, 0.1)'
                }
              }}
            >
              Anmelden
            </Button>
            <Button
              variant="contained"
              startIcon={<AccountCircle />}
              onClick={() => { router.push('/register'); handleDrawerToggle(); }}
              sx={{
                background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                color: '#000',
                flex: 1,
                '&:hover': {
                  background: 'linear-gradient(45deg, #FFA500, #FF8C00)'
                }
              }}
            >
              Registrieren
            </Button>
          </Box>
        )}
        
        <Typography variant="caption" sx={{ 
          color: 'rgba(255,255,255,0.6)', 
          textAlign: 'center',
          display: 'block',
          mt: 1
        }}>
          🧬 Human Design App
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          background: 'rgba(15, 15, 35, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#FFD700',
              fontWeight: 'bold',
              flexGrow: 1,
              textAlign: 'center'
            }}
          >
            🌙 HD App
          </Typography>
          
          {username && (
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#FFD700', color: '#000' }}>
              {username.charAt(0).toUpperCase()}
            </Avatar>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            border: 'none',
            background: 'transparent'
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Floating Action Button für Desktop */}
      {!isMobile && (
        <Fab
          color="primary"
          aria-label="navigation"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            background: 'linear-gradient(45deg, #FFD700, #FFA500)',
            color: '#000',
            '&:hover': {
              background: 'linear-gradient(45deg, #FFA500, #FF8C00)',
              transform: 'scale(1.1)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <MenuIcon />
        </Fab>
      )}
    </>
  );
}
