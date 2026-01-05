"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Divider,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { 
  Menu, 
  Home, 
  BarChart3, 
  BookOpen, 
  Users, 
  Moon, 
  BookText, 
  Heart, 
  DollarSign, 
  User, 
  Settings,
  X,
  LayoutDashboard
} from 'lucide-react';
import Link from "next/link";

// Statische Vollmond-Komponente (ohne Animation)
const StaticFullMoon = () => (
  <Box
    sx={{
      width: 24,
      height: 24,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #f0f0f0 40%, #e0e0e0 60%, #d0d0d0 100%)',
      boxShadow: '0 0 20px rgba(255, 255, 255, 0.8), inset 0 0 20px rgba(255, 255, 255, 0.3)',
      position: 'relative',
      marginTop: 4
    }}
  >
    {/* Mondkrater für Realismus */}
    <Box
      sx={{
        position: 'absolute',
        top: '25%',
        left: '20%',
        width: 3,
        height: 3,
        borderRadius: '50%',
        background: 'rgba(200, 200, 200, 0.6)',
        boxShadow: 'inset 0 0 2px rgba(0, 0, 0, 0.3)'
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        top: '60%',
        left: '70%',
        width: 2,
        height: 2,
        borderRadius: '50%',
        background: 'rgba(180, 180, 180, 0.5)',
        boxShadow: 'inset 0 0 1px rgba(0, 0, 0, 0.2)'
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        width: 1.5,
        height: 1.5,
        borderRadius: '50%',
        background: 'rgba(190, 190, 190, 0.4)',
        boxShadow: 'inset 0 0 1px rgba(0, 0, 0, 0.1)'
      }}
    />
  </Box>
);

const pages = [
  { label: "Start", href: "/", icon: Home },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Reading", href: "/reading", icon: BookOpen },
  { label: "Coaching", href: "/coaching", icon: Users },
  { label: "Mondkalender", href: "/mondkalender", icon: Moon },
  { label: "Dating", href: "/dating", icon: Heart },
  { label: "Journal", href: "/journal", icon: BookText },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Profil", href: "/profil", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Pricing", href: "/subscription", icon: DollarSign },
  { label: "Admin", href: "/admin", icon: Settings },
];

export default function SimpleMoonlightHeader({ current }: { current?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // User aus Token holen
  const [username, setUsername] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUsername(payload.username);
        } catch {}
      }
    }
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 280, pt: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 3, mb: 2 }}>
        <Image
          src="/images/ChatGPT Image 25. Aug. 2025, 13_02_47.png"
          alt="Logo"
          width={32}
          height={32}
          style={{ borderRadius: 6, objectFit: 'contain', background: '#fff' }}
          priority
        />
        <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#4b2e83', lineHeight: 1 }}>
            Kosmische Verbindungen
          </Typography>
          <StaticFullMoon />
        </Box>
      </Box>
      
      <Divider sx={{ mb: 1 }} />
      
      {/* Navigation */}
      <List sx={{ py: 0 }}>
        {pages.map((page) => {
          const IconComponent = page.icon;
          const isActive = current === page.href;
          return (
            <ListItem 
              key={page.href} 
              component={Link} 
              href={page.href}
              onClick={handleDrawerToggle}
              sx={{
                backgroundColor: isActive ? 'rgba(75, 46, 131, 0.15)' : 'transparent',
                borderLeft: isActive ? '4px solid #4b2e83' : '4px solid transparent',
                borderRadius: '0 12px 12px 0',
                mx: 1,
                mb: 1,
                py: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: isActive ? 'rgba(75, 46, 131, 0.2)' : 'rgba(75, 46, 131, 0.08)',
                  transform: 'translateX(4px)',
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 44 }}>
                <Box sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  background: isActive ? 'linear-gradient(135deg, #4b2e83, #6b46c1)' : 'rgba(75, 46, 131, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease'
                }}>
                  <IconComponent 
                    size={18} 
                    style={{ 
                      color: isActive ? '#fff' : '#4b2e83',
                      transition: 'all 0.3s ease'
                    }} 
                  />
                </Box>
              </ListItemIcon>
              <ListItemText 
                primary={page.label} 
                sx={{ 
                  color: isActive ? '#4b2e83' : '#374151',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.95rem',
                  transition: 'all 0.3s ease'
                }} 
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{ 
        background: 'linear-gradient(135deg, #4b2e83 0%, #6b46c1 100%)', 
        color: '#fff', 
        boxShadow: '0 2px 12px rgba(75, 46, 131, 0.3)',
        height: { xs: 65, md: 70 }
      }}>
        <Toolbar sx={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          height: '100%',
          px: { xs: 2, md: 3 }
        }}>
          {/* Logo und Titel */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Image
              src="/images/ChatGPT Image 25. Aug. 2025, 13_02_47.png"
              alt="Logo"
              width={40}
              height={40}
              style={{ 
                borderRadius: 8, 
                objectFit: 'contain', 
                background: '#fff', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)' 
              }}
              priority
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700, 
                  color: "#fff", 
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                  display: { xs: 'none', sm: 'block' },
                  lineHeight: 1
                }}
              >
                Kosmische Verbindungen
              </Typography>
              <StaticFullMoon />
            </Box>
          </Box>

          {/* Desktop Navigation - Kompakt */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.5, mx: 2 }}>
              {pages.slice(0, 6).map((page) => {
                const isActive = current === page.href;
                return (
                  <Button
                    key={page.href}
                    component={Link}
                    href={page.href}
                    sx={{
                      color: isActive ? '#ffd700' : '#fff',
                      backgroundColor: isActive ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                      borderRadius: 1.5,
                      px: 1.5,
                      py: 0.5,
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.85rem',
                      textTransform: 'none',
                      minWidth: 'auto',
                      '&:hover': {
                        backgroundColor: isActive ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255,255,255,0.1)',
                      }
                    }}
                  >
                    {page.label}
                  </Button>
                );
              })}
            </Box>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ ml: 'auto' }}
            >
              <Menu size={22} />
            </IconButton>
          )}

          {/* User Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {username ? (
              <Typography sx={{ 
                color: '#ffd700', 
                fontWeight: 600, 
                fontSize: { xs: '0.85rem', md: '0.9rem' },
                display: { xs: 'none', sm: 'block' }
              }}>
                {username}
              </Typography>
            ) : (
              <>
                <Button 
                  component={Link} 
                  href="#" 
                  variant="outlined" 
                  size="small"
                  sx={{ 
                    color: '#fff', 
                    borderColor: 'rgba(255,255,255,0.5)', 
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    px: 1.2,
                    py: 0.5,
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  Anmelden
                </Button>
                <Button 
                  component={Link} 
                  href="#" 
                  variant="contained" 
                  size="small"
                  sx={{ 
                    bgcolor: '#ffd700', 
                    color: '#23233a', 
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    px: 1.2,
                    py: 0.5,
                    '&:hover': {
                      bgcolor: '#fbbf24'
                    }
                  }}
                >
                  Login
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 280,
            border: 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={handleDrawerToggle}>
            <X size={18} />
          </IconButton>
        </Box>
        {drawer}
      </Drawer>
    </>
  );
}
