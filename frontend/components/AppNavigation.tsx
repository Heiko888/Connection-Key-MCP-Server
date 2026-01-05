"use client";
import React, { useState } from 'react';
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
  Avatar
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
  Public
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const drawerWidth = 280;

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ReactElement;
  description?: string;
  category?: string;
}

const navigationItems: NavigationItem[] = [
  // Hauptseiten
  { name: "Chart", path: "/chart", icon: <BarChart />, category: "Hauptseiten" },
  { name: "Mondkalender", path: "/mondkalender", icon: <Event />, category: "Hauptseiten" },
  
  // Human Design
  { name: "Human Design Chart", path: "/human-design-chart", icon: <Psychology />, category: "Human Design" },
  
  // Wissen & Journal
  { name: "Knowledge", path: "/knowledge", icon: <MenuBook />, category: "Wissen & Journal" },
  { name: "Journal", path: "/journal", icon: <MenuBook />, category: "Wissen & Journal" },
  { name: "Resonanzanalyse", path: "/resonanzanalyse", icon: <MenuBook />, category: "Wissen & Journal" },
  
  // Community & Dating
  { name: "Community", path: "/community", icon: <Group />, category: "Community & Social" },
  { name: "Dating", path: "/dating", icon: <Favorite />, category: "Community & Social" },
  
  // Profil & Einstellungen
  { name: "Profil", path: "/profil", icon: <Person />, category: "Profil & Einstellungen" },
  { name: "Settings", path: "/settings", icon: <Settings />, category: "Profil & Einstellungen" },
  
  // Pricing & Subscription
  { name: "Pricing", path: "/pricing", icon: <Star />, category: "Pricing & Subscription" },
  
  // Admin
  { name: "Admin", path: "/admin", icon: <Settings />, category: "Admin" },
  { name: "Seitenanzeige", path: "/seitenanzeige", icon: <Public />, category: "Admin" }
];

interface AppNavigationProps {
  currentPath?: string;
}

export default function AppNavigation({ currentPath = '/' }: AppNavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Kein Logout erforderlich - App ist öffentlich
    handleProfileMenuClose();
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

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
    <Box sx={{ 
        p: 3, 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          🧬 HD App
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Human Design Navigation
        </Typography>
      </Box>

      {/* Navigation Items */}
      <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
        {Object.entries(groupedItems).map(([category, items]) => (
          <Box key={category} sx={{ mb: 3 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                px: 3, 
                py: 1, 
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {category}
            </Typography>
      <List>
              {items.map((item) => (
            <ListItem 
                  key={item.path}
                  component={Link}
                  href={item.path}
              sx={{
                    mx: 1,
                borderRadius: 2,
                mb: 0.5,
                    backgroundColor: currentPath === item.path ? 'rgba(255,255,255,0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  <ListItemIcon sx={{ color: currentPath === item.path ? '#FFD700' : 'rgba(255,255,255,0.7)', minWidth: 40 }}>
                    {item.icon}
                </ListItemIcon>
                <ListItemText 
                    primary={item.name}
                  sx={{ 
                    '& .MuiListItemText-primary': {
                        color: currentPath === item.path ? '#FFD700' : 'white',
                        fontWeight: currentPath === item.path ? 'bold' : 'normal',
                        fontSize: '0.9rem'
                    }
                  }} 
                />
            </ListItem>
              ))}
      </List>
            <Divider sx={{ mx: 2, my: 1, borderColor: 'rgba(255,255,255,0.1)' }} />
          </Box>
        ))}
      </Box>

      {/* Footer - Kein Logout erforderlich */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="body2" sx={{ 
          color: 'rgba(255,255,255,0.6)', 
          textAlign: 'center',
          fontSize: '0.75rem'
        }}>
          🧬 HD App - Öffentlich zugänglich
        </Typography>
      </Box>
    </Box>
  );

  return (
    <>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          background: 'rgba(15, 15, 35, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
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
            component="div" 
            sx={{ 
              flexGrow: 1,
              background: 'linear-gradient(45deg, #FFD700, #FFA500)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}
          >
            🧬 HD App
          </Typography>

          {/* Profile Menu */}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="profile-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#FFD700' }}>
              <AccountCircle />
            </Avatar>
          </IconButton>
          
          <Menu
            id="profile-menu"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            sx={{
              '& .MuiPaper-root': {
                background: 'rgba(15, 15, 35, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white'
              }
            }}
          >
            <MenuItem onClick={handleProfileMenuClose} component={Link} href="/profil">
              <ListItemIcon><Person fontSize="small" /></ListItemIcon>
              Profil
            </MenuItem>
            <MenuItem onClick={handleProfileMenuClose} component={Link} href="/settings">
              <ListItemIcon><Settings fontSize="small" /></ListItemIcon>
              Einstellungen
            </MenuItem>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
            <MenuItem onClick={handleProfileMenuClose}>
              <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
              Öffentliche App
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        sx={{
            display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
              width: drawerWidth,
              background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
              border: 'none'
          },
        }}
      >
        {drawer}
      </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
              border: 'none'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
}
