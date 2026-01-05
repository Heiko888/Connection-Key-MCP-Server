"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Tooltip,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Search,
  Filter,
  Star,
  Diamond,
  Crown,
  Lock,
  Globe,
  Eye,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  List
} from 'lucide-react';
import Link from 'next/link';

// Kompakte Seiten-Datenbank für das Widget
const widgetPages = [
  // Öffentliche Seiten
  { id: 'home', title: 'Startseite', path: '/', category: 'Öffentlich', package: 'free', icon: '🏠' },
  { id: 'login', title: 'Anmelden', path: '/login', category: 'Öffentlich', package: 'free', icon: '🔐' },
  { id: 'register', title: 'Registrieren', path: '/register', category: 'Öffentlich', package: 'free', icon: '📝' },
  { id: 'pricing', title: 'Preise', path: '/pricing', category: 'Öffentlich', package: 'free', icon: '💰' },

  // Benutzer-Seiten
  { id: 'dashboard', title: 'Dashboard', path: '/dashboard', category: 'Benutzer', package: 'basic', icon: '📊' },
  { id: 'profile', title: 'Profil', path: '/profil', category: 'Benutzer', package: 'basic', icon: '👤' },
  { id: 'settings', title: 'Einstellungen', path: '/settings', category: 'Benutzer', package: 'basic', icon: '⚙️' },

  // Human Design
  { id: 'chart', title: 'Chart', path: '/chart', category: 'Human Design', package: 'basic', icon: '🧬' },
  { id: 'energetische-signatur', title: 'Energetische Signatur', path: '/energetische-signatur', category: 'Human Design', package: 'basic', icon: '📋' },
  { id: 'bodygraph-advanced', title: 'Bodygraph', path: '/bodygraph-advanced', category: 'Human Design', package: 'premium', icon: '🔬' },
  { id: 'centers', title: 'Zentren', path: '/centers', category: 'Human Design', package: 'basic', icon: '⚪' },
  { id: 'gates', title: 'Tore', path: '/gates', category: 'Human Design', package: 'basic', icon: '🚪' },

  // Kosmos
  { id: 'mondkalender', title: 'Mondkalender', path: '/mondkalender', category: 'Kosmos', package: 'basic', icon: '🌙' },
  { id: 'planets', title: 'Planeten', path: '/planets', category: 'Kosmos', package: 'basic', icon: '🪐' },
  { id: 'sun', title: 'Sonne', path: '/planets/sun', category: 'Kosmos', package: 'basic', icon: '☀️' },
  { id: 'moon', title: 'Mond', path: '/planets/moon', category: 'Kosmos', package: 'basic', icon: '🌙' },

  // Dating
  { id: 'dating', title: 'Dating', path: '/dating', category: 'Dating', package: 'premium', icon: '💕' },
  { id: 'swipe', title: 'Swipe', path: '/swipe', category: 'Dating', package: 'premium', icon: '💫' },
  { id: 'match-tips', title: 'Match-Tipps', path: '/dating/match-tips', category: 'Dating', package: 'premium', icon: '💡' },

  // Community
  { id: 'community', title: 'Community', path: '/community', category: 'Community', package: 'basic', icon: '👥' },
  { id: 'vip-community', title: 'VIP Community', path: '/vip-community', category: 'Community', package: 'vip', icon: '👑' },

  // Coaching
  { id: 'coaching', title: 'Coaching', path: '/coaching', category: 'Coaching', package: 'vip', icon: '🎯' },

  // Tools
  { id: 'reading', title: 'Readings', path: '/reading', category: 'Tools', package: 'premium', icon: '📖' },
  { id: 'journal', title: 'Journal', path: '/journal', category: 'Tools', package: 'basic', icon: '📔' },
  { id: 'ai-chat', title: 'AI Chat', path: '/ai-chat', category: 'Tools', package: 'premium', icon: '🤖' },

  // Analytics
  { id: 'analytics', title: 'Analytics', path: '/analytics', category: 'Analytics', package: 'premium', icon: '📈' },
  { id: 'realtime-analysis', title: 'Realtime', path: '/realtime-analysis', category: 'Analytics', package: 'premium', icon: '⚡' }
];

// Paket-Informationen
const packageInfo = {
  free: { name: 'Kostenlos', color: '#4CAF50', icon: <Globe size={12} /> },
  basic: { name: 'Basic', color: '#2196F3', icon: <Star size={12} /> },
  premium: { name: 'Premium', color: '#9C27B0', icon: <Diamond size={12} /> },
  vip: { name: 'VIP', color: '#FF9800', icon: <Crown size={12} /> },
  admin: { name: 'Admin', color: '#F44336', icon: <Lock size={12} /> }
};

interface SeitenuebersichtWidgetProps {
  maxHeight?: number;
  showFilters?: boolean;
  compact?: boolean;
}

export default function SeitenuebersichtWidget({ 
  maxHeight = 400, 
  showFilters = true, 
  compact = false 
}: SeitenuebersichtWidgetProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle');
  const [selectedPackage, setSelectedPackage] = useState('Alle');
  const [expanded, setExpanded] = useState(false);

  // Kategorien extrahieren
  const categories = ['Alle', ...new Set(widgetPages.map(page => page.category))];

  // Gefilterte Seiten
  const filteredPages = useMemo(() => {
    return widgetPages.filter(page => {
      const matchesSearch = page.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Alle' || page.category === selectedCategory;
      const matchesPackage = selectedPackage === 'Alle' || page.package === selectedPackage;
      
      return matchesSearch && matchesCategory && matchesPackage;
    });
  }, [searchTerm, selectedCategory, selectedPackage]);

  const getPackageColor = (packageId: string) => {
    return packageInfo[packageId as keyof typeof packageInfo]?.color || '#4CAF50';
  };

  const getPackageIcon = (packageId: string) => {
    return packageInfo[packageId as keyof typeof packageInfo]?.icon || <Globe size={12} />;
  };

  return (
    <Card sx={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '16px',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      height: '100%'
    }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <List size={20} color="#4ecdc4" style={{ marginRight: 8 }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
              Seitenübersicht
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ color: 'rgba(255,255,255,0.7)' }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </Box>

        {/* Filter */}
        {showFilters && (
          <Collapse in={expanded}>
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Seiten durchsuchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search size={16} color="rgba(255,255,255,0.7)" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        '& fieldset': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#4ecdc4',
                        },
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: 'rgba(255,255,255,0.7)',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={6} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Kategorie</InputLabel>
                    <Select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#4ecdc4',
                        },
                      }}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Paket</InputLabel>
                    <Select
                      value={selectedPackage}
                      onChange={(e) => setSelectedPackage(e.target.value)}
                      sx={{
                        color: 'white',
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#4ecdc4',
                        },
                      }}
                    >
                      <MenuItem value="Alle">Alle Pakete</MenuItem>
                      <MenuItem value="basic">Basic</MenuItem>
                      <MenuItem value="premium">Premium</MenuItem>
                      <MenuItem value="vip">VIP</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        )}

        {/* Seiten-Liste */}
        <Box sx={{ 
          maxHeight: maxHeight, 
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'rgba(255,255,255,0.5)',
          },
        }}>
          <Grid container spacing={1}>
            {filteredPages.slice(0, compact ? 6 : 12).map((page) => (
              <Grid item xs={12} sm={6} key={page.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    p: 1.5,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                      borderColor: getPackageColor(page.package)
                    }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ mr: 1, fontSize: '1.2rem' }}>
                          {page.icon}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>
                            {page.title}
                          </Typography>
                          <Chip
                            label={packageInfo[page.package as keyof typeof packageInfo]?.name}
                            size="small"
                            sx={{
                              background: getPackageColor(page.package),
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '0.6rem',
                              height: '18px'
                            }}
                          />
                        </Box>
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Seite ansehen">
                          <IconButton
                            size="small"
                            component={Link}
                            href={page.path}
                            sx={{ color: 'rgba(255,255,255,0.7)' }}
                          >
                            <Eye size={14} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="In neuem Tab öffnen">
                          <IconButton
                            size="small"
                            onClick={() => window.open(page.path, '_blank')}
                            sx={{ color: 'rgba(255,255,255,0.7)' }}
                          >
                            <ExternalLink size={14} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            {filteredPages.length} von {widgetPages.length} Seiten
          </Typography>
          {filteredPages.length > (compact ? 6 : 12) && (
            <Button
              size="small"
              component={Link}
              href="/seitenliste"
              sx={{ 
                color: '#4ecdc4', 
                ml: 1,
                fontSize: '0.7rem'
              }}
            >
              Alle anzeigen
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
