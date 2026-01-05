"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import PageLayout from '../components/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

import { KnowledgeService, KnowledgeEntry } from "../../lib/knowledge/knowledgeService";
import { 
  TextField, 
  Alert, 
  IconButton, 
  Box, 
  Typography, 
  InputAdornment, 
  Grid,
  Chip,
  CircularProgress,
  Snackbar,
  Paper
} from "@mui/material";
import { 
  BookOpen, 
  Search, 
  Heart, 
  Sparkles, 
} from "lucide-react";



function KnowledgeContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Knowledge-Entries laden
  useEffect(() => {
    const loadKnowledgeEntries = async () => {
      try {
        setLoading(true);
        setError(null);
        const entries = await KnowledgeService.getKnowledgeEntries();
        setKnowledgeEntries(entries);
      } catch (err) {
        console.error('Fehler beim Laden der Knowledge-Entries:', err);
        setError('Fehler beim Laden der Daten');
      } finally {
        setLoading(false);
      }
    };

    loadKnowledgeEntries();
  }, []);


  const filteredEntries = knowledgeEntries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || entry.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = async (id: string) => {
    try {
      const updatedEntry = await KnowledgeService.toggleFavorite(id);
      if (updatedEntry) {
        setKnowledgeEntries(prev => 
          prev.map(entry => 
            entry.id === id ? updatedEntry : entry
          )
        );
        setSnackbarMessage(updatedEntry.isFavorite ? 'Zu Favoriten hinzugefügt' : 'Aus Favoriten entfernt');
        setSnackbarOpen(true);
      }
    } catch (err) {
      console.error('Fehler beim Umschalten des Favoriten-Status:', err);
      setSnackbarMessage('Fehler beim Aktualisieren der Favoriten');
      setSnackbarOpen(true);
    }
  };

  const categories = ["all", ...Array.from(new Set(knowledgeEntries.map(entry => entry.category)))];

  if (loading) {
    return (
      <PageLayout activePage="knowledge" showLogo={true}>
        <Box sx={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CircularProgress sx={{ color: '#F29F05' }} />
        </Box>
      </PageLayout>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
        radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
        radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
        linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 60%)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Gold Stars Background */}
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 }}>
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: Math.random() * 2,
            }}
            style={{
              position: 'absolute',
              width: `${10 + i * 2}px`,
              height: `${10 + i * 2}px`,
              background: `radial-gradient(circle, rgba(242, 159, 5, ${0.6 - i * 0.05}), transparent 70%)`,
              borderRadius: '50%',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              pointerEvents: 'none',
            }}
          />
        ))}
      </Box>

      <PageLayout activePage="knowledge" showLogo={true} maxWidth="lg">
        <Box sx={{ position: 'relative', zIndex: 2, py: { xs: 2, md: 4 } }}>
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Paper 
                elevation={3} 
                sx={{ 
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(242, 159, 5, 0.3)',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
                  p: { xs: 3, md: 5 },
                  mb: 4,
                  textAlign: 'center'
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography 
                    variant="h2" 
                    sx={{ 
                      color: '#FFFFFF', 
                      fontWeight: 800, 
                      mb: 2,
                      fontSize: { xs: '2rem', md: '3rem' }
                    }}
                  >
                    <Sparkles size={40} style={{ marginRight: 12, display: 'inline-block', color: '#F29F05' }} />
                    Wissensdatenbank
                    <Sparkles size={40} style={{ marginLeft: 12, display: 'inline-block', color: '#F29F05' }} />
                  </Typography>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      mb: 2,
                      fontWeight: 400,
                      maxWidth: 800,
                      mx: 'auto',
                      lineHeight: 1.6
                    }}
                  >
                    Entdecke tiefes Wissen über Human Design, Mondphasen und energetische Prinzipien
                  </Typography>
                </Box>
              </Paper>
            </motion.div>

            {/* Search and Filter Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Paper sx={{
                borderRadius: 4,
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(242, 159, 5, 0.3)',
                boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)',
                p: { xs: 3, md: 4 },
                mb: 4
              }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      placeholder="Suche nach Wissen..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search style={{ color: '#F29F05' }} />
                          </InputAdornment>
                        ),
                        sx: {
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: '#FFFFFF',
                            '& fieldset': {
                              borderColor: 'rgba(242, 159, 5, 0.3)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(242, 159, 5, 0.5)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#F29F05',
                            },
                          },
                          '& .MuiInputBase-input::placeholder': {
                            color: 'rgba(255, 255, 255, 0.5)',
                            opacity: 1
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {categories.map((category) => (
                        <Chip
                          key={category}
                          label={category === "all" ? "Alle" : category}
                          onClick={() => setSelectedCategory(category)}
                          sx={{
                            backgroundColor: selectedCategory === category 
                              ? '#F29F05' 
                              : 'rgba(255, 255, 255, 0.1)',
                            color: selectedCategory === category ? '#0C0909' : '#FFFFFF',
                            border: '1px solid rgba(242, 159, 5, 0.3)',
                            fontWeight: selectedCategory === category ? 700 : 500,
                            '&:hover': {
                              backgroundColor: selectedCategory === category 
                                ? '#FFB347' 
                                : 'rgba(242, 159, 5, 0.2)',
                              borderColor: 'rgba(242, 159, 5, 0.5)',
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </motion.div>

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 3,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#FFFFFF',
                    '& .MuiAlert-icon': {
                      color: '#EF4444'
                    }
                  }}
                >
                  {error}
                </Alert>
              </motion.div>
            )}

            {/* Knowledge Entries */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Grid container spacing={3}>
                {filteredEntries.map((entry, index) => (
                  <Grid item xs={12} md={6} key={entry.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Paper sx={{
                        borderRadius: 4,
                        background: 'rgba(255,255,255,0.08)',
                        backdropFilter: 'blur(20px)',
                        border: '2px solid rgba(242, 159, 5, 0.3)',
                        boxShadow: '0 8px 32px rgba(242, 159, 5, 0.15)',
                        height: '100%',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'rgba(242, 159, 5, 0.5)',
                          boxShadow: '0 12px 40px rgba(242, 159, 5, 0.25)',
                          transform: 'translateY(-4px)'
                        }
                      }}>
                        <Box sx={{ p: { xs: 2, md: 3 } }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Typography variant="h6" sx={{ 
                              color: '#FFFFFF', 
                              fontWeight: 700,
                              mb: 1,
                              fontSize: { xs: '1.1rem', md: '1.25rem' }
                            }}>
                              {entry.title}
                            </Typography>
                            <IconButton
                              onClick={() => toggleFavorite(entry.id)}
                              sx={{ 
                                color: entry.isFavorite ? '#F29F05' : 'rgba(255,255,255,0.6)',
                                '&:hover': {
                                  backgroundColor: 'rgba(242, 159, 5, 0.1)',
                                  color: '#F29F05'
                                }
                              }}
                            >
                              <Heart style={{ 
                                fill: entry.isFavorite ? '#F29F05' : 'none',
                                stroke: entry.isFavorite ? '#F29F05' : 'rgba(255,255,255,0.6)'
                              }} />
                            </IconButton>
                          </Box>
                          
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(255,255,255,0.9)',
                            mb: 2,
                            lineHeight: 1.6
                          }}>
                            {entry.content}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                            {entry.tags.map((tag) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(242, 159, 5, 0.2)',
                                  color: '#FFFFFF',
                                  border: '1px solid rgba(242, 159, 5, 0.3)',
                                  fontSize: '0.75rem',
                                  fontWeight: 500
                                }}
                              />
                            ))}
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                              <Chip
                                label={entry.category}
                                size="small"
                                sx={{
                                  backgroundColor: 'rgba(242, 159, 5, 0.2)',
                                  color: '#FFFFFF',
                                  border: '1px solid rgba(242, 159, 5, 0.3)',
                                  fontSize: '0.7rem',
                                  fontWeight: 500
                                }}
                              />
                              <Chip
                                label={entry.difficulty}
                                size="small"
                                sx={{
                                  backgroundColor: entry.difficulty === 'Anfänger' ? 'rgba(16, 185, 129, 0.2)' : 
                                                  entry.difficulty === 'Mittel' ? 'rgba(242, 159, 5, 0.2)' : 
                                                  'rgba(239, 68, 68, 0.2)',
                                  color: entry.difficulty === 'Anfänger' ? '#10B981' : 
                                         entry.difficulty === 'Mittel' ? '#F29F05' : '#EF4444',
                                  border: `1px solid ${entry.difficulty === 'Anfänger' ? 'rgba(16, 185, 129, 0.3)' : 
                                                      entry.difficulty === 'Mittel' ? 'rgba(242, 159, 5, 0.3)' : 
                                                      'rgba(239, 68, 68, 0.3)'}`,
                                  fontSize: '0.7rem',
                                  fontWeight: 500
                                }}
                              />
                            </Box>
                            <Typography variant="caption" sx={{ 
                              color: 'rgba(255,255,255,0.6)',
                              fontSize: '0.8rem'
                            }}>
                              {entry.readTime}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ 
                              color: 'rgba(255,255,255,0.6)',
                              fontSize: '0.8rem'
                            }}>
                              {entry.author}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: 'rgba(255,255,255,0.6)',
                              fontSize: '0.8rem'
                            }}>
                              {new Date(entry.createdAt).toLocaleDateString('de-DE')}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
              
              {filteredEntries.length === 0 && (
                <Paper sx={{
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(242, 159, 5, 0.3)',
                  boxShadow: '0 8px 32px rgba(242, 159, 5, 0.15)',
                  p: 6,
                  textAlign: 'center'
                }}>
                  <BookOpen size={64} style={{ color: '#F29F05', marginBottom: 16 }} />
                  <Typography variant="h6" sx={{ color: '#FFFFFF', mb: 2, fontWeight: 600 }}>
                    Keine Ergebnisse gefunden
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                    Versuche andere Suchbegriffe oder Kategorien
                  </Typography>
                </Paper>
              )}
            </motion.div>
          </Box>
        </PageLayout>
        
        {/* Snackbar für Benachrichtigungen */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{
            '& .MuiSnackbarContent-root': {
              borderRadius: 3,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.3)',
              color: '#FFFFFF',
              boxShadow: '0 8px 32px rgba(242, 159, 5, 0.2)'
            }
          }}
        />
      </Box>
  );
}

// Hauptkomponente mit ProtectedRoute
export default function KnowledgePage() {
  return (
    <KnowledgeContent />
  );
}
