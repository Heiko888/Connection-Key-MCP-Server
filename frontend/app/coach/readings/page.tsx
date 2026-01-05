
'use client';

import React, { useState, useEffect } from 'react';
import CoachAuth from '@/components/CoachAuth';
import CoachNavigation from '@/components/CoachNavigation';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface Reading {
  id: string;
  reading_type: string;
  client_name: string;
  reading_data: any;
  created_at: string;
  updated_at?: string;
}

function ReadingsOverviewContent() {
  const router = useRouter();
  const [readings, setReadings] = useState<Reading[]>([]);
  const [filteredReadings, setFilteredReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  });
  const [mounted, setMounted] = useState(false);
  const [starPositions, setStarPositions] = useState<Array<{left: number, top: number, size: number, opacity: number}>>([]);

  useEffect(() => {
    setMounted(true);
    // Generate random positions only on client
    const stars = Array.from({ length: 50 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
    }));
    setStarPositions(stars);
  }, []);

  // Readings laden
  useEffect(() => {
    fetchReadings();
  }, []);

  // Filter anwenden
  useEffect(() => {
    let filtered = [...readings];

    // Suche
    if (searchQuery) {
      filtered = filtered.filter((reading) =>
        reading.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Typ-Filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((reading) => reading.reading_type === typeFilter);
    }

    setFilteredReadings(filtered);
  }, [searchQuery, typeFilter, readings]);

  const fetchReadings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/coach/readings');
      
      // Prüfe ob Response JSON ist
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Ungültige Antwort vom Server: ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Laden der Readings');
      }

      setReadings(data.readings || []);
      setFilteredReadings(data.readings || []);
    } catch (err: any) {
      console.error('Fehler beim Laden:', err);
      setError(err.message || 'Fehler beim Laden der Readings');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/coach/readings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Fehler beim Löschen');
      }

      // Erfolgreich gelöscht - Liste aktualisieren
      setReadings((prev) => prev.filter((r) => r.id !== id));
      setFilteredReadings((prev) => prev.filter((r) => r.id !== id));
      setDeleteDialog({ open: false, id: null });
    } catch (err: any) {
      console.error('Fehler beim Löschen:', err);
      setError(err.message || 'Fehler beim Löschen des Readings');
    }
  };

  const getReadingTypeLabel = (type: string) => {
    switch (type) {
      case 'human-design':
      case 'single':
        return 'Human Design';
      case 'connectionKey':
      case 'connection':
        return 'Connection Key';
      case 'penta':
        return 'Penta / Gruppenresonanz';
      default:
        return type;
    }
  };

  const getReadingTypeColor = (type: string) => {
    switch (type) {
      case 'human-design':
      case 'single':
        return '#e8b86d'; // Gold
      case 'connectionKey':
      case 'connection':
        return '#4fc3f7'; // Hellblau
      case 'penta':
        return '#4caf50'; // Grün
      default:
        return '#90caf9';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        background: `
          radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
          radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
          linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 100%)
        `,
        backgroundAttachment: 'fixed',
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        overflowX: 'hidden',
        pt: 0,
        pb: 8,
        // Stelle sicher, dass der Hintergrund die volle Seite abdeckt
        '&::before': {
          content: '""',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(ellipse 100% 50% at 50% 0%, rgba(242, 159, 5, 0.15) 0%, transparent 70%),
            radial-gradient(ellipse 80% 40% at 20% 100%, rgba(140, 29, 4, 0.12) 0%, transparent 70%),
            radial-gradient(ellipse 60% 30% at 80% 100%, rgba(242, 159, 5, 0.10) 0%, transparent 70%),
            linear-gradient(180deg, #0b0a0f 0%, #0b0a0f 100%)
          `,
          backgroundAttachment: 'fixed',
          zIndex: -1,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Animierte Sterne im Hintergrund - nur nach Mount */}
      {mounted && starPositions.length > 0 && starPositions.map((star, i) => (
        <motion.div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            width: `${star.size}px`,
            height: `${star.size}px`,
            background: '#F29F05',
            borderRadius: '50%',
            left: `${star.left}%`,
            top: `${star.top}%`,
            pointerEvents: 'none',
            opacity: star.opacity,
            zIndex: 0,
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

      {/* Animierte Planeten-Orbits - nur nach Mount */}
      {mounted && Array.from({ length: 3 }).map((_, i) => (
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
            zIndex: 0,
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

      {/* Pulsierende Planeten - nur nach Mount */}
      {mounted && Array.from({ length: 5 }).map((_, i) => (
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
            zIndex: 0,
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

      <Box sx={{ position: 'relative', zIndex: 100, pt: 0, mt: 0 }}>
        <CoachNavigation />
      </Box>

      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          zIndex: 10,
          width: '100%',
          pt: 2,
        }}
      >
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 6 } }}>
          <Box sx={{ 
            position: 'relative', 
            width: { xs: '100%', md: 600 }, 
            maxWidth: 600, 
            height: { xs: 120, md: 180 }, 
            mx: 'auto' 
          }}>
            <Image
              src="/images/connection-key-optimized.png"
              alt="The Connection Key"
              fill
              style={{ objectFit: 'contain' }}
              priority
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </Box>
        </Box>

        {/* Header */}
        <Box sx={{ mb: { xs: 3, md: 4 }, textAlign: 'center', px: { xs: 1, md: 0 } }}>
          <Typography
            variant="h3"
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              mb: { xs: 1, md: 1 },
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              lineHeight: { xs: 1.2, md: 1.3 },
            }}
          >
            Deine Readings
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              mb: { xs: 2, md: 3 },
              fontSize: { xs: '0.875rem', md: '1rem' },
              lineHeight: { xs: 1.5, md: 1.6 },
            }}
          >
            Verwalte und exportiere deine Human Design Readings
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => router.push('/coach/readings/create')}
            sx={{
              background: 'linear-gradient(135deg, #e8b86d 0%, #ffd89b 100%)',
              color: '#000',
              fontWeight: 600,
              px: { xs: 3, md: 4 },
              py: { xs: 1, md: 1.5 },
              fontSize: { xs: '0.8125rem', md: '1rem' },
              '&:hover': {
                background: 'linear-gradient(135deg, #ffd89b 0%, #e8b86d 100%)',
              },
            }}
          >
            Neues Reading erstellen
          </Button>
        </Box>

        {/* Filter & Suche */}
        <Card
          sx={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            mb: { xs: 2, md: 3 },
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Grid container spacing={{ xs: 1.5, md: 2 }} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Nach Name suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: { xs: '1rem', md: '1.25rem' } }} />
                      </InputAdornment>
                    ),
                    sx: {
                      color: '#fff',
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e8b86d',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: { xs: '0.875rem', md: '1rem' } }}>Typ filtern</InputLabel>
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    label="Typ filtern"
                    sx={{
                      color: '#fff',
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e8b86d',
                      },
                      '& .MuiSvgIcon-root': {
                        color: '#fff',
                      },
                    }}
                  >
                    <MenuItem value="all">Alle Typen</MenuItem>
                    <MenuItem value="single">Human Design</MenuItem>
                    <MenuItem value="connection">Connection Key</MenuItem>
                    <MenuItem value="penta">Penta / Gruppenresonanz</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    textAlign: { xs: 'left', md: 'center' },
                    fontSize: { xs: '0.8125rem', md: '0.875rem' },
                  }}
                >
                  {filteredReadings.length} von {readings.length}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: '#e8b86d' }} />
          </Box>
        )}

        {/* Readings Liste */}
        {!loading && filteredReadings.length === 0 && (
          <Card
            sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
              py: 8,
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ color: '#fff', mb: 2 }}>
                {searchQuery || typeFilter !== 'all'
                  ? 'Keine Readings gefunden'
                  : 'Noch keine Readings erstellt'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 3 }}>
                {searchQuery || typeFilter !== 'all'
                  ? 'Versuche andere Suchkriterien'
                  : 'Erstelle dein erstes Reading'}
              </Typography>
              {!searchQuery && typeFilter === 'all' && (
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/coach/readings/create')}
                  sx={{
                    borderColor: '#e8b86d',
                    color: '#e8b86d',
                    '&:hover': {
                      borderColor: '#ffd89b',
                      background: 'rgba(232, 184, 109, 0.1)',
                    },
                  }}
                >
                  Neues Reading erstellen
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {!loading && filteredReadings.length > 0 && (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {filteredReadings.map((reading) => (
              <Grid item xs={12} md={6} lg={4} key={reading.id}>
                <Card
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: { xs: 'none', md: 'translateY(-4px)' },
                      boxShadow: { xs: 'none', md: '0 8px 24px rgba(232, 184, 109, 0.3)' },
                      borderColor: 'rgba(232, 184, 109, 0.5)',
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
                    {/* Typ Badge */}
                    <Chip
                      label={getReadingTypeLabel(reading.reading_type)}
                      size="small"
                      sx={{
                        mb: { xs: 1.5, md: 2 },
                        background: getReadingTypeColor(reading.reading_type),
                        color: '#000',
                        fontWeight: 600,
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                        height: { xs: 24, md: 28 },
                      }}
                    />

                    {/* Name */}
                    <Typography
                      variant="h6"
                      sx={{
                        color: '#fff',
                        fontWeight: 600,
                        mb: { xs: 0.5, md: 1 },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: { xs: '1rem', md: '1.25rem' },
                      }}
                    >
                      {reading.client_name || 'Unbenannt'}
                    </Typography>

                    {/* Datum */}
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                        display: 'block',
                        mb: { xs: 1.5, md: 2 },
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                      }}
                    >
                      Erstellt: {formatDate(reading.created_at)}
                    </Typography>

                    {/* Daten-Preview */}
                    {reading.reading_data && (
                      <Box sx={{ mb: 2 }}>
                        {reading.reading_data.geburtsdatum && (
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                            📅 {reading.reading_data.geburtsdatum}
                          </Typography>
                        )}
                        {reading.reading_data.geburtsort && (
                          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.6)', ml: 2 }}>
                            📍 {reading.reading_data.geburtsort}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Aktionen */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <IconButton
                        size="small"
                        onClick={() => router.push(`/coach/readings/${reading.id}`)}
                        sx={{
                          color: '#e8b86d',
                          border: '1px solid rgba(232, 184, 109, 0.3)',
                          '&:hover': {
                            background: 'rgba(232, 184, 109, 0.1)',
                            borderColor: '#e8b86d',
                          },
                        }}
                        title="Anzeigen"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => router.push(`/coach/readings/create?id=${reading.id}`)}
                        sx={{
                          color: '#4fc3f7',
                          border: '1px solid rgba(79, 195, 247, 0.3)',
                          '&:hover': {
                            background: 'rgba(79, 195, 247, 0.1)',
                            borderColor: '#4fc3f7',
                          },
                        }}
                        title="Bearbeiten"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{
                          color: '#f44336',
                          border: '1px solid rgba(244, 67, 54, 0.3)',
                          '&:hover': {
                            background: 'rgba(244, 67, 54, 0.1)',
                            borderColor: '#f44336',
                          },
                        }}
                        onClick={() => setDeleteDialog({ open: true, id: reading.id })}
                        title="Löschen"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, id: null })}
        PaperProps={{
          sx: {
            background: 'rgba(30, 30, 30, 0.98)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#fff' }}>Reading löschen?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Möchtest du dieses Reading wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, id: null })} sx={{ color: '#fff' }}>
            Abbrechen
          </Button>
          <Button
            onClick={() => deleteDialog.id && handleDelete(deleteDialog.id)}
            sx={{
              color: '#f44336',
              '&:hover': {
                background: 'rgba(244, 67, 54, 0.1)',
              },
            }}
          >
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function ReadingsPage() {
  return (
    <CoachAuth>
      <ReadingsOverviewContent />
    </CoachAuth>
  );
}

