"use client";
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Card, CardContent, Typography, Box, Chip, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Grid, List, ListItem, ListItemIcon, ListItemText, Divider, Avatar, Badge, LinearProgress, Switch, FormControlLabel, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, CheckCircle, Star, RotateCcw, Share2, Bookmark, Settings, Download, Upload, Languages, Flag, MessageCircle, BookOpen, Users, Award, Heart, Moon } from 'lucide-react';
import { useNotifications } from './NotificationService';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isComplete: boolean;
  completionPercentage: number;
  lastUpdated: Date;
  translator: string;
  status: 'complete' | 'in_progress' | 'planned' | 'needs_review';
}

interface Translation {
  key: string;
  value: string;
  context?: string;
  category: string;
  isTranslated: boolean;
  needsReview: boolean;
  lastModified: Date;
  translator?: string;
}

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const languages: Language[] = [
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    isComplete: true,
    completionPercentage: 100,
    lastUpdated: new Date('2024-01-15'),
    translator: 'HD App Team',
    status: 'complete'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    isComplete: true,
    completionPercentage: 95,
    lastUpdated: new Date('2024-01-14'),
    translator: 'Sarah Miller',
    status: 'complete'
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    isComplete: false,
    completionPercentage: 78,
    lastUpdated: new Date('2024-01-10'),
    translator: 'Luna Rodriguez',
    status: 'in_progress'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    isComplete: false,
    completionPercentage: 65,
    lastUpdated: new Date('2024-01-08'),
    translator: 'Pierre Dubois',
    status: 'in_progress'
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    isComplete: false,
    completionPercentage: 45,
    lastUpdated: new Date('2024-01-05'),
    translator: 'Marco Rossi',
    status: 'in_progress'
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    isComplete: false,
    completionPercentage: 30,
    lastUpdated: new Date('2024-01-03'),
    translator: 'Ana Silva',
    status: 'planned'
  },
  {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    isComplete: false,
    completionPercentage: 20,
    lastUpdated: new Date('2024-01-01'),
    translator: 'Jan van der Berg',
    status: 'planned'
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    isComplete: false,
    completionPercentage: 15,
    lastUpdated: new Date('2023-12-28'),
    translator: 'Ivan Petrov',
    status: 'planned'
  }
];

const mockTranslations: Translation[] = [
  {
    key: 'welcome.title',
    value: 'Willkommen bei der Human Design App',
    context: 'Hauptseite Begrüßung',
    category: 'general',
    isTranslated: true,
    needsReview: false,
    lastModified: new Date('2024-01-15'),
    translator: 'HD App Team'
  },
  {
    key: 'welcome.subtitle',
    value: 'Entdecke dein einzigartiges Design und lebe authentisch',
    context: 'Hauptseite Untertitel',
    category: 'general',
    isTranslated: true,
    needsReview: false,
    lastModified: new Date('2024-01-15'),
    translator: 'HD App Team'
  },
  {
    key: 'dating.title',
    value: 'Dating nach Human Design',
    context: 'Dating-Seite Titel',
    category: 'dating',
    isTranslated: true,
    needsReview: false,
    lastModified: new Date('2024-01-14'),
    translator: 'HD App Team'
  },
  {
    key: 'moon.calendar',
    value: 'Mondkalender',
    context: 'Mondkalender-Seite',
    category: 'moon',
    isTranslated: true,
    needsReview: false,
    lastModified: new Date('2024-01-13'),
    translator: 'HD App Team'
  },
  {
    key: 'energy.generator',
    value: 'Generator',
    context: 'Human Design Typ',
    category: 'types',
    isTranslated: true,
    needsReview: false,
    lastModified: new Date('2024-01-12'),
    translator: 'HD App Team'
  },
  {
    key: 'energy.projector',
    value: 'Projector',
    context: 'Human Design Typ',
    category: 'types',
    isTranslated: true,
    needsReview: false,
    lastModified: new Date('2024-01-12'),
    translator: 'HD App Team'
  },
  {
    key: 'energy.manifestor',
    value: 'Manifestor',
    context: 'Human Design Typ',
    category: 'types',
    isTranslated: true,
    needsReview: false,
    lastModified: new Date('2024-01-12'),
    translator: 'HD App Team'
  },
  {
    key: 'energy.reflector',
    value: 'Reflector',
    context: 'Human Design Typ',
    category: 'types',
    isTranslated: true,
    needsReview: false,
    lastModified: new Date('2024-01-12'),
    translator: 'HD App Team'
  }
];

const getStatusColor = (status: Language['status']) => {
  switch (status) {
    case 'complete':
      return '#22c55e';
    case 'in_progress':
      return '#f59e0b';
    case 'planned':
      return '#3b82f6';
    case 'needs_review':
      return '#ef4444';
    default:
      return '#6b7280';
  }
};

const getStatusIcon = (status: Language['status']) => {
  switch (status) {
    case 'complete':
      return <CheckCircle size={16} />;
    case 'in_progress':
      return <RotateCcw size={16} />;
    case 'planned':
      return <Star size={16} />;
    case 'needs_review':
      return <MessageCircle size={16} />;
    default:
      return <Star size={16} />;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'general':
      return <Globe size={16} />;
    case 'dating':
      return <Heart size={16} />;
    case 'moon':
      return <Moon size={16} />;
    case 'types':
      return <Star size={16} />;
    case 'energy':
      return <Star size={16} />;
    case 'relationships':
      return <Users size={16} />;
    case 'career':
      return <Award size={16} />;
    case 'spirituality':
      return <Moon size={16} />;
    default:
      return <BookOpen size={16} />;
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('de');
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }

    // Load translations for current language
    loadTranslations(currentLanguage);
  }, [currentLanguage]);

  const loadTranslations = async (language: string) => {
    // In a real app, this would load from an API or translation files
    const mockTranslationsForLanguage: Record<string, string> = {
      'welcome.title': language === 'en' ? 'Welcome to the Human Design App' : 'Willkommen bei der Human Design App',
      'welcome.subtitle': language === 'en' ? 'Discover your unique design and live authentically' : 'Entdecke dein einzigartiges Design und lebe authentisch',
      'dating.title': language === 'en' ? 'Dating by Human Design' : 'Dating nach Human Design',
      'moon.calendar': language === 'en' ? 'Moon Calendar' : 'Mondkalender',
      'energy.generator': 'Generator',
      'energy.projector': 'Projector',
      'energy.manifestor': 'Manifestor',
      'energy.reflector': 'Reflector',
    };
    
    setTranslations(mockTranslationsForLanguage);
  };

  const t = (key: string, params?: Record<string, string>): string => {
    let translation = translations[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, value);
      });
    }
    
    return translation;
  };

  const setLanguage = (language: string) => {
    setCurrentLanguage(language);
    localStorage.setItem('preferred-language', language);
  };

  const isRTL = ['ar', 'he', 'fa'].includes(currentLanguage);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default function LanguageSystem() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [showLanguageDetails, setShowLanguageDetails] = useState(false);
  const [showTranslationEditor, setShowTranslationEditor] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [savedLanguages, setSavedLanguages] = useState<string[]>([]);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [translationQuality, setTranslationQuality] = useState<'basic' | 'premium' | 'professional'>('premium');
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Load saved languages
    const saved = localStorage.getItem('saved-languages');
    if (saved) {
      setSavedLanguages(JSON.parse(saved));
    }

    // Load settings
    const settings = localStorage.getItem('language-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setAutoTranslate(parsed.autoTranslate || false);
      setTranslationQuality(parsed.translationQuality || 'premium');
    }
  }, []);

  const filteredLanguages = languages.filter(language => {
    const matchesStatus = filterStatus === 'all' || language.status === filterStatus;
    return matchesStatus;
  });

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setShowLanguageDetails(true);
  };

  const handleSaveLanguage = (languageCode: string) => {
    const newSaved = [...savedLanguages, languageCode];
    setSavedLanguages(newSaved);
    localStorage.setItem('saved-languages', JSON.stringify(newSaved));
    
    addNotification({
      type: 'success',
      title: '💾 Gespeichert',
      message: 'Sprache wurde zu deinen Favoriten hinzugefügt!',
    });
  };

  const handleSettingsChange = (setting: string, value: any) => {
    const newSettings = {
      autoTranslate,
      translationQuality,
      [setting]: value
    };
    
    localStorage.setItem('language-settings', JSON.stringify(newSettings));
    
    if (setting === 'autoTranslate') {
      setAutoTranslate(value);
    } else if (setting === 'translationQuality') {
      setTranslationQuality(value);
    }
    
    addNotification({
      type: 'success',
      title: '⚙️ Einstellungen gespeichert',
      message: 'Deine Spracheinstellungen wurden aktualisiert!',
    });
  };

  const handleExportTranslations = (languageCode: string) => {
    addNotification({
      type: 'info',
      title: '📤 Export gestartet',
      message: `Übersetzungen für ${languageCode} werden exportiert...`,
    });
    
    // Simulate export
    setTimeout(() => {
      addNotification({
        type: 'success',
        title: '✅ Export abgeschlossen',
        message: `Übersetzungen für ${languageCode} erfolgreich exportiert!`,
      });
    }, 2000);
  };

  const handleImportTranslations = (languageCode: string) => {
    addNotification({
      type: 'info',
      title: '📥 Import gestartet',
      message: `Übersetzungen für ${languageCode} werden importiert...`,
    });
    
    // Simulate import
    setTimeout(() => {
      addNotification({
        type: 'success',
        title: '✅ Import abgeschlossen',
        message: `Übersetzungen für ${languageCode} erfolgreich importiert!`,
      });
    }, 2000);
  };

  return (
    <Box>
      {/* Settings Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.2)',
          p: 3,
          mb: 4
        }}>
          <Typography variant="h6" sx={{ color: 'text.primary', mb: 3, fontWeight: 600 }}>
            🌍 Spracheinstellungen
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                🔧 Übersetzungseinstellungen:
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={autoTranslate}
                        onChange={(e) => handleSettingsChange('autoTranslate', e.target.checked)}
                      />
                    }
                    label="Automatische Übersetzung"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <FormControl>
                    <InputLabel>Übersetzungsqualität</InputLabel>
                    <Select
                      value={translationQuality}
                      onChange={(e) => handleSettingsChange('translationQuality', e.target.value)}
                      label="Übersetzungsqualität"
                    >
                      <MenuItem value="basic">Basic</MenuItem>
                      <MenuItem value="premium">Premium</MenuItem>
                      <MenuItem value="professional">Professional</MenuItem>
                    </Select>
                  </FormControl>
                </ListItem>
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                📊 Statistiken:
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Globe size={16} color="#8B5CF6" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Unterstützte Sprachen" 
                    secondary={`${languages.length} Sprachen`} 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircle size={16} color="#8B5CF6" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Vollständige Übersetzungen" 
                    secondary={`${languages.filter(l => l.isComplete).length} Sprachen`} 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Globe size={16} color="#8B5CF6" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Übersetzungsschlüssel" 
                    secondary={`${mockTranslations.length} Schlüssel`} 
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </Card>
      </motion.div>

      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: 3,
          border: '1px solid rgba(255,255,255,0.2)',
          p: 3,
          mb: 4
        }}>
          <Typography variant="h6" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>
            🔍 Filter
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label="Alle Sprachen"
              onClick={() => setFilterStatus('all')}
              color={filterStatus === 'all' ? 'primary' : 'default'}
              variant={filterStatus === 'all' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Vollständig"
              onClick={() => setFilterStatus('complete')}
              color={filterStatus === 'complete' ? 'primary' : 'default'}
              variant={filterStatus === 'complete' ? 'filled' : 'outlined'}
            />
            <Chip
              label="In Bearbeitung"
              onClick={() => setFilterStatus('in_progress')}
              color={filterStatus === 'in_progress' ? 'primary' : 'default'}
              variant={filterStatus === 'in_progress' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Geplant"
              onClick={() => setFilterStatus('planned')}
              color={filterStatus === 'planned' ? 'primary' : 'default'}
              variant={filterStatus === 'planned' ? 'filled' : 'outlined'}
            />
            <Chip
              label="Überprüfung nötig"
              onClick={() => setFilterStatus('needs_review')}
              color={filterStatus === 'needs_review' ? 'primary' : 'default'}
              variant={filterStatus === 'needs_review' ? 'filled' : 'outlined'}
            />
          </Box>
        </Card>
      </motion.div>

      {/* Languages Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Grid container spacing={3}>
          {filteredLanguages.map((language, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={language.code}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${getStatusColor(language.status)}15, ${getStatusColor(language.status)}05)`,
                    border: `1px solid ${getStatusColor(language.status)}30`,
                    borderRadius: 3,
                    height: '100%',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 12px 30px ${getStatusColor(language.status)}20`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Language Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Typography variant="h3">
                        {language.flag}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                          {language.nativeName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {language.name}
                        </Typography>
                      </Box>
                      {language.isComplete && (
                        <Badge
                          badgeContent="✓"
                          color="success"
                          sx={{
                            '& .MuiBadge-badge': {
                              fontSize: '0.8rem',
                              fontWeight: 600,
                            },
                          }}
                        />
                      )}
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          Fortschritt
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {language.completionPercentage}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={language.completionPercentage}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: 'rgba(255,255,255,0.1)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getStatusColor(language.status),
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>

                    {/* Status and Translator */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip
                        icon={getStatusIcon(language.status)}
                        label={language.status}
                        size="small"
                        sx={{
                          backgroundColor: `${getStatusColor(language.status)}20`,
                          color: getStatusColor(language.status),
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>

                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      Übersetzer: {language.translator}
                    </Typography>

                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                      Letzte Aktualisierung: {language.lastUpdated.toLocaleDateString('de-DE')}
                    </Typography>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => handleLanguageSelect(language)}
                        sx={{
                          flex: 1,
                          backgroundColor: getStatusColor(language.status),
                          '&:hover': {
                            backgroundColor: getStatusColor(language.status),
                            opacity: 0.9,
                          },
                        }}
                      >
                        Details
                      </Button>
                      <IconButton
                        onClick={() => handleSaveLanguage(language.code)}
                        sx={{ color: savedLanguages.includes(language.code) ? 'primary.main' : 'text.secondary' }}
                      >
                        <Bookmark size={16} />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Language Details Dialog */}
      <Dialog
        open={showLanguageDetails}
        onClose={() => setShowLanguageDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Typography variant="h4" sx={{ mb: 1 }}>
            {selectedLanguage?.flag} {selectedLanguage?.nativeName}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {selectedLanguage?.name} • {selectedLanguage?.completionPercentage}% abgeschlossen
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            {/* Language Info */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                📊 Sprache-Informationen:
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Globe size={16} color="#8B5CF6" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Sprachcode" 
                    secondary={selectedLanguage?.code} 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Globe size={16} color="#8B5CF6" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Übersetzer" 
                    secondary={selectedLanguage?.translator} 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <CheckCircle size={16} color="#8B5CF6" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Status" 
                    secondary={selectedLanguage?.status} 
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Star size={16} color="#8B5CF6" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Letzte Aktualisierung" 
                    secondary={selectedLanguage?.lastUpdated.toLocaleDateString('de-DE')} 
                  />
                </ListItem>
              </List>
            </Grid>

            {/* Progress Info */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                📈 Fortschritt:
              </Typography>
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={selectedLanguage?.completionPercentage || 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getStatusColor(selectedLanguage?.status || 'planned'),
                      borderRadius: 4,
                    },
                  }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, textAlign: 'center' }}>
                  {selectedLanguage?.completionPercentage}% abgeschlossen
                </Typography>
              </Box>
            </Grid>

            {/* Translation Categories */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                📚 Übersetzungskategorien:
              </Typography>
              <Grid container spacing={2}>
                {['general', 'dating', 'moon', 'types', 'energy', 'relationships', 'career', 'spirituality'].map((category) => {
                  const categoryTranslations = mockTranslations.filter(t => t.category === category);
                  const translatedCount = categoryTranslations.filter(t => t.isTranslated).length;
                  const totalCount = categoryTranslations.length;
                  const percentage = totalCount > 0 ? Math.round((translatedCount / totalCount) * 100) : 0;
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={category}>
                      <Card sx={{ p: 2, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                          {getCategoryIcon(category)}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, textTransform: 'capitalize' }}>
                          {category}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {translatedCount}/{totalCount} ({percentage}%)
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            mt: 1,
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: percentage === 100 ? '#22c55e' : '#8B5CF6',
                              borderRadius: 2,
                            },
                          }}
                        />
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => handleExportTranslations(selectedLanguage?.code || '')}
            startIcon={<Download size={16} />}
          >
            Exportieren
          </Button>
          <Button
            onClick={() => handleImportTranslations(selectedLanguage?.code || '')}
            startIcon={<Upload size={16} />}
          >
            Importieren
          </Button>
          <Button onClick={() => setShowLanguageDetails(false)} variant="contained">
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
