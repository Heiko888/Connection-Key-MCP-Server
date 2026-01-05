"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
  Fab,
  Badge,
  SwipeableDrawer,
  BottomNavigation,
  BottomNavigationAction
} from '@mui/material';
import {
  Menu,
  Home,
  MessageCircle,
  Heart,
  Calendar,
  User,
  Settings,
  Bell,
  Search,
  Plus,
  Users,
  Moon,
  Crown
} from 'lucide-react';

interface MobileOptimizedLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (path: string) => void;
}

const navigationItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <Home size={20} />, badge: 0 },
  { path: '/chat-new', label: 'Chat', icon: <MessageCircle size={20} />, badge: 3 },
  { path: '/dating', label: 'Dating', icon: <Heart size={20} />, badge: 1 },
  { path: '/mondkalender', label: 'Mond', icon: <Moon size={20} />, badge: 0 },
  { path: '/community', label: 'Community', icon: <Users size={20} />, badge: 0 }
];

const bottomNavigationItems = [
  { path: '/dashboard', label: 'Home', icon: <Home size={24} /> },
  { path: '/chat-new', label: 'Chat', icon: <MessageCircle size={24} /> },
  { path: '/dating', label: 'Dating', icon: <Heart size={24} /> },
  { path: '/mondkalender', label: 'Mond', icon: <Moon size={24} /> },
  { path: '/community', label: 'Community', icon: <Users size={24} /> }
];

export default function MobileOptimizedLayout({ 
  children, 
  currentPage = '/dashboard',
  onNavigate 
}: MobileOptimizedLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState(0);
  const [notifications, setNotifications] = useState(5);

  useEffect(() => {
    // Set initial bottom navigation value based on current page
    const index = bottomNavigationItems.findIndex(item => item.path === currentPage);
    if (index !== -1) {
      setBottomNavValue(index);
    }
  }, [currentPage]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
    setDrawerOpen(false);
  };

  const handleBottomNavChange = (event: React.SyntheticEvent, newValue: number) => {
    setBottomNavValue(newValue);
    const path = bottomNavigationItems[newValue].path;
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const drawer = (
    <Box sx={{ width: 280, height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="div">
          HD App
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Human Design Community
        </Typography>
      </Box>
      
      <List sx={{ pt: 2 }}>
        {navigationItems.map((item, index) => (
          <ListItem
            key={index}
            button
            onClick={() => handleNavigation(item.path)}
            sx={{
              mx: 1,
              borderRadius: 1,
              bgcolor: currentPage === item.path ? 'primary.main' : 'transparent',
              color: currentPage === item.path ? 'primary.contrastText' : 'text.primary',
              '&:hover': {
                bgcolor: currentPage === item.path ? 'primary.dark' : 'action.hover'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              {item.badge > 0 ? (
                <Badge badgeContent={item.badge} color="error">
                  {item.icon}
                </Badge>
              ) : (
                item.icon
              )}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 2, borderTop: 1, borderColor: 'divider' }}>
        <ListItem button onClick={() => handleNavigation('/settings')}>
          <ListItemIcon>
            <Settings size={20} />
          </ListItemIcon>
          <ListItemText primary="Einstellungen" />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top App Bar */}
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <Menu />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            HD App
          </Typography>

          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Search />
          </IconButton>

          <IconButton color="inherit">
            <Badge badgeContent={notifications} color="error">
              <Bell />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <SwipeableDrawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        onOpen={handleDrawerToggle}
        swipeAreaWidth={20}
        disableSwipeToOpen={false}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
      >
        {drawer}
      </SwipeableDrawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pb: isMobile ? 7 : 0, // Add bottom padding for mobile bottom nav
          minHeight: isMobile ? 'calc(100vh - 56px - 56px)' : 'calc(100vh - 56px)'
        }}
      >
        {children}
      </Box>

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            zIndex: 1000
          }}
          onClick={() => handleNavigation('/chat-new')}
        >
          <Plus />
        </Fab>
      )}

      {/* Bottom Navigation for Mobile */}
      {isMobile && (
        <BottomNavigation
          value={bottomNavValue}
          onChange={handleBottomNavChange}
          showLabels
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider'
          }}
        >
          {bottomNavigationItems.map((item, index) => (
            <BottomNavigationAction
              key={index}
              label={item.label}
              icon={item.icon}
              sx={{
                '&.Mui-selected': {
                  color: 'primary.main'
                }
              }}
            />
          ))}
        </BottomNavigation>
      )}

      {/* Tablet-specific optimizations */}
      {isTablet && !isMobile && (
        <Box
          sx={{
            position: 'fixed',
            top: 64,
            left: 0,
            width: 240,
            height: 'calc(100vh - 64px)',
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
            zIndex: 1000,
            overflow: 'auto'
          }}
        >
          {drawer}
        </Box>
      )}
    </Box>
  );
}
