'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  Divider,
  Switch,
  FormControlLabel
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  X, 
  Star, 
  Moon, 
  Sun, 
  Droplets, 
  Zap, 
  Download, 
  Upload,
  Eye,
  Check,
  Sparkles
} from 'lucide-react';
import { useTheme, Theme } from '../lib/themeService';

interface ThemeSelectorProps {
  open: boolean;
  onClose: () => void;
}

export default function ThemeSelector({ open, onClose }: ThemeSelectorProps) {
  const { currentTheme, themes, changeTheme, getThemesByCategory } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleThemeSelect = (themeId: string) => {
    changeTheme(themeId);
    setPreviewTheme(null);
  };

  const handleThemePreview = (theme: Theme) => {
    setPreviewTheme(theme);
  };

  const handlePreviewApply = () => {
    if (previewTheme) {
      changeTheme(previewTheme.id);
      setPreviewTheme(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'cosmic': return <Star size={20} />;
      case 'nature': return <Droplets size={20} />;
      case 'minimal': return <Moon size={20} />;
      case 'vibrant': return <Zap size={20} />;
      default: return <Palette size={20} />;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'cosmic': return 'Kosmisch';
      case 'nature': return 'Natur';
      case 'minimal': return 'Minimal';
      case 'vibrant': return 'Vibrant';
      default: return 'Sonstige';
    }
  };

  const categories = ['cosmic', 'nature', 'minimal', 'vibrant'];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: currentTheme?.colors?.background || '#1a1a2e',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${currentTheme?.colors?.border || 'rgba(255,255,255,0.2)'}`,
          borderRadius: 3
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: currentTheme?.colors?.textPrimary || '#ffffff',
        borderBottom: `1px solid ${currentTheme?.colors?.border || 'rgba(255,255,255,0.2)'}`,
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${currentTheme?.colors?.primary || '#FFD700'}, ${currentTheme?.colors?.secondary || '#fbbf24'})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: 'white'
          }}>
            <Palette size={24} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ color: currentTheme?.colors?.textPrimary || '#ffffff', fontWeight: 700, mb: 0.5 }}>
              Theme-Auswahl
            </Typography>
            <Typography variant="subtitle1" sx={{ color: currentTheme?.colors?.textSecondary || 'rgba(255,255,255,0.7)' }}>
              Wähle dein bevorzugtes Design
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: currentTheme?.colors?.textPrimary || '#ffffff' }}>
          <X size={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Tab Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: currentTheme?.colors?.border || 'rgba(255,255,255,0.2)', px: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: currentTheme?.colors?.textSecondary || 'rgba(255,255,255,0.7)',
                '&.Mui-selected': {
                  color: currentTheme?.colors?.textPrimary || '#ffffff'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: currentTheme?.colors?.primary || '#FFD700'
              }
            }}
          >
            <Tab label="Alle Themes" icon={<Palette size={16} />} />
            <Tab label="Kosmisch" icon={<Star size={16} />} />
            <Tab label="Natur" icon={<Droplets size={16} />} />
            <Tab label="Minimal" icon={<Moon size={16} />} />
            <Tab label="Vibrant" icon={<Zap size={16} />} />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          <AnimatePresence mode="wait">
            {activeTab === 0 && (
              <motion.div
                key="all-themes"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Grid container spacing={2}>
                  {themes.map((theme) => (
                    <Grid item xs={12} sm={6} md={4} key={theme.id}>
                      <Card sx={{
                        background: theme?.colors?.backgroundSecondary || 'rgba(255,255,255,0.1)',
                        border: `2px solid ${theme.id === currentTheme?.id ? theme?.colors?.primary || '#FFD700' : theme?.colors?.border || 'rgba(255,255,255,0.2)'}`,
                        borderRadius: 2,
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${theme?.colors?.shadow || 'rgba(0,0,0,0.3)'}`,
                          transition: 'all 0.2s ease'
                        }
                      }}
                      onClick={() => handleThemeSelect(theme.id)}
                      onMouseEnter={() => handleThemePreview(theme)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          {/* Theme Preview */}
                          <Box sx={{
                            height: '80px',
                            background: theme?.colors?.background || '#1a1a2e',
                            borderRadius: 1,
                            mb: 2,
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            {/* Mini Chart Elements */}
                            <Box sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '40px',
                              height: '40px'
                            }}>
                              {/* Center */}
                              <Box sx={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: theme?.colors?.centerActive || '#FFD700',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                boxShadow: `0 0 10px ${theme?.colors?.glow || '#FFD700'}`
                              }} />
                              
                              {/* Gates */}
                              {[0, 60, 120, 180, 240, 300].map((angle, index) => (
                                <Box
                                  key={index}
                                  sx={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: theme?.colors?.gateActive || '#fbbf24',
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-20px)`
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                          
                          {/* Theme Info */}
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ 
                              color: theme?.colors?.textPrimary || '#ffffff', 
                              fontWeight: 600, 
                              mb: 0.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 1
                            }}>
                              {getCategoryIcon(theme.category)}
                              {theme.name}
                            </Typography>
                            
                            <Typography variant="body2" sx={{ 
                              color: theme?.colors?.textSecondary || 'rgba(255,255,255,0.7)', 
                              mb: 2,
                              fontSize: '0.8rem'
                            }}>
                              {theme.description}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                              <Chip
                                label={theme.isDark ? 'Dunkel' : 'Hell'}
                                size="small"
                                sx={{
                                  bgcolor: theme.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
                                  color: theme?.colors?.textPrimary || '#ffffff',
                                  fontSize: '0.7rem'
                                }}
                              />
                              <Chip
                                label={getCategoryName(theme.category)}
                                size="small"
                                sx={{
                                  bgcolor: `${theme?.colors?.primary || '#FFD700'}20`,
                                  color: theme?.colors?.primary || '#FFD700',
                                  fontSize: '0.7rem'
                                }}
                              />
                            </Box>
                          </Box>
                          
                          {/* Active Indicator */}
                          {theme.id === currentTheme?.id && (
                            <Box sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: theme?.colors?.success || '#10b981',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}>
                              <Check size={16} />
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            )}

            {activeTab > 0 && (
              <motion.div
                key={`category-${activeTab}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Grid container spacing={2}>
                  {getThemesByCategory(categories[activeTab - 1]).map((theme: Theme) => (
                    <Grid item xs={12} sm={6} md={4} key={theme.id}>
                      <Card sx={{
                        background: theme?.colors?.backgroundSecondary || 'rgba(255,255,255,0.1)',
                        border: `2px solid ${theme.id === currentTheme?.id ? theme?.colors?.primary || '#FFD700' : theme?.colors?.border || 'rgba(255,255,255,0.2)'}`,
                        borderRadius: 2,
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${theme?.colors?.shadow || 'rgba(0,0,0,0.3)'}`,
                          transition: 'all 0.2s ease'
                        }
                      }}
                      onClick={() => handleThemeSelect(theme.id)}
                      onMouseEnter={() => handleThemePreview(theme)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          {/* Theme Preview */}
                          <Box sx={{
                            height: '80px',
                            background: theme?.colors?.background || '#1a1a2e',
                            borderRadius: 1,
                            mb: 2,
                            position: 'relative',
                            overflow: 'hidden'
                          }}>
                            {/* Mini Chart Elements */}
                            <Box sx={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              width: '40px',
                              height: '40px'
                            }}>
                              {/* Center */}
                              <Box sx={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: theme?.colors?.centerActive || '#FFD700',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                boxShadow: `0 0 10px ${theme?.colors?.glow || '#FFD700'}`
                              }} />
                              
                              {/* Gates */}
                              {[0, 60, 120, 180, 240, 300].map((angle, index) => (
                                <Box
                                  key={index}
                                  sx={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: theme?.colors?.gateActive || '#fbbf24',
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-20px)`
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                          
                          {/* Theme Info */}
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ 
                              color: theme?.colors?.textPrimary || '#ffffff', 
                              fontWeight: 600, 
                              mb: 0.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 1
                            }}>
                              {getCategoryIcon(theme.category)}
                              {theme.name}
                            </Typography>
                            
                            <Typography variant="body2" sx={{ 
                              color: theme?.colors?.textSecondary || 'rgba(255,255,255,0.7)', 
                              mb: 2,
                              fontSize: '0.8rem'
                            }}>
                              {theme.description}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                              <Chip
                                label={theme.isDark ? 'Dunkel' : 'Hell'}
                                size="small"
                                sx={{
                                  bgcolor: theme.isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)',
                                  color: theme?.colors?.textPrimary || '#ffffff',
                                  fontSize: '0.7rem'
                                }}
                              />
                            </Box>
                          </Box>
                          
                          {/* Active Indicator */}
                          {theme.id === currentTheme?.id && (
                            <Box sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              background: theme?.colors?.success || '#10b981',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}>
                              <Check size={16} />
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: `1px solid ${currentTheme?.colors?.border || 'rgba(255,255,255,0.2)'}` }}>
        <Button
          onClick={onClose}
          sx={{
            color: currentTheme?.colors?.textPrimary || '#ffffff',
            border: `1px solid ${currentTheme?.colors?.border || 'rgba(255,255,255,0.2)'}`,
            '&:hover': {
              backgroundColor: currentTheme?.colors?.backgroundSecondary || 'rgba(255,255,255,0.1)'
            }
          }}
        >
          Schließen
        </Button>
      </DialogActions>
    </Dialog>
  );
}
