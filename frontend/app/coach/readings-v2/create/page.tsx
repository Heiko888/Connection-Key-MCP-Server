'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  CircularProgress,
  Chip,
  Alert,
} from '@mui/material';
import Image from 'next/image';
import { motion } from 'framer-motion';
import CoachAuth from '@/components/CoachAuth';
import GlobalNavigation, { MenuItem as NavigationMenuItem } from '@/app/components/GlobalNavigation';
import { getAllReadingTypes, getReadingType } from '@/lib/readingTypes';
import { getReadingSchema, validateSchemaInput, readingSchemas } from '@/lib/readingSchemas';
import { getAvailableVersions, getDefaultVersion, type PromptVersion } from '@/lib/prompts/promptRegistry';
import type { ReadingField } from '@/lib/readingSchemas';

function CreateReadingV2PageContent() {
  const [selectedReadingType, setSelectedReadingType] = useState<string>('');
  const [selectedPromptVersion, setSelectedPromptVersion] = useState<string>('');
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [starPositions, setStarPositions] = useState<Array<{left: number, top: number, size: number, opacity: number}>>([]);

  // Initialize mounted state and star positions
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

  // Coach Navigation Menu Items
  const coachMenuItems: NavigationMenuItem[] = [
    { href: '/coach', label: 'Home' },
    { href: '/coach/dashboard', label: 'Dashboard' },
    { href: '/coach/readings-v2', label: 'Readings' },
    { href: '/coach/agents', label: 'Agents' },
  ];
  const [result, setResult] = useState<
    | {
        success: true;
        readingId: string;
        jobId: string;
        status: 'pending';
      }
    | {
        success: false;
        reading: {
          id: string;
          status: string;
          errorMessage: string | null;
        };
      }
    | null
  >(null);
  const [jobStatus, setJobStatus] = useState<'pending' | 'running' | 'completed' | 'failed' | null>(null);
  const [jobProgress, setJobProgress] = useState<number | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);

  const readingTypes = getAllReadingTypes();
  const readingConfig = selectedReadingType ? getReadingType(selectedReadingType) : null;
  
  // Schema laden mit besserer Fehlerbehandlung
  let schema = null;
  if (readingConfig?.schemaKey) {
    schema = getReadingSchema(readingConfig.schemaKey);
    // Debug: Log Schema-Informationen wenn nicht gefunden
    if (!schema) {
      console.error('[Schema Error]', {
        readingType: selectedReadingType,
        schemaKey: readingConfig.schemaKey,
        availableSchemas: Object.keys(readingSchemas),
        readingConfig: readingConfig,
      });
    }
  } else if (readingConfig && !readingConfig.schemaKey) {
    console.warn('[Schema Warning] Reading-Typ hat kein schemaKey:', {
      readingType: selectedReadingType,
      readingConfig: readingConfig,
    });
  }
  const availablePromptVersions = selectedReadingType ? getAvailableVersions(selectedReadingType) : [];
  const defaultPromptVersion = selectedReadingType ? getDefaultVersion(selectedReadingType) : null;

  // Setze Default-Prompt-Version wenn Reading-Type gewählt wird
  const handleReadingTypeChange = (value: string) => {
    setSelectedReadingType(value);
    // Reset input values when reading type changes
    setInputValues({});
    setResult(null);
    
    // Setze Default-Prompt-Version
    const defaultVersion = getDefaultVersion(value);
    setSelectedPromptVersion(defaultVersion || '');
  };

  // Handler für Schema-Felder (einfach, flach)
  const handleInputChange = (fieldKey: string, value: any) => {
    setInputValues((prev) => ({
      ...prev,
      [fieldKey]: value,
    }));
  };

  // Polling-Funktion für Job-Status
  const startJobPolling = (jobId: string, readingId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/coach/readings/jobs/${jobId}`);
        const data = await response.json();

        if (data.success && data.job) {
          setJobStatus(data.job.status);
          setJobProgress(data.job.progress);

          if (data.job.status === 'completed') {
            clearInterval(pollInterval);
            // Navigate to reading detail page
            window.location.href = `/coach/readings-v2/${readingId}`;
          } else if (data.job.status === 'failed') {
            clearInterval(pollInterval);
            setJobError(data.job.error || 'Job fehlgeschlagen');
            setResult({
              success: false,
              reading: {
                id: readingId,
                status: 'error',
                errorMessage: data.job.error || 'Job fehlgeschlagen',
              },
            });
          }
        }
      } catch (error) {
        console.error('Fehler beim Polling des Job-Status:', error);
        // Bei Fehler weiterpolling (max. 5 Minuten)
      }
    }, 3000); // Alle 3 Sekunden

    // Cleanup nach 5 Minuten (falls Job hängt)
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 300_000);
  };

  const validateInputs = (): string | null => {
    if (!selectedReadingType || !readingConfig) {
      return 'Bitte wählen Sie einen Reading-Typ aus';
    }

    if (!schema) {
      // Detaillierte Fehlermeldung für Debugging
      const schemaKey = readingConfig.schemaKey;
      if (!schemaKey) {
        return `Reading-Typ "${selectedReadingType}" hat kein schemaKey definiert`;
      }
      return `Schema nicht gefunden für Reading-Typ "${selectedReadingType}" (schemaKey: "${schemaKey}"). Verfügbare Schemas: ${Object.keys(readingSchemas).join(', ')}`;
    }

    const validation = validateSchemaInput(schema, inputValues);
    if (!validation.valid) {
      return validation.error || 'Validierungsfehler';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateInputs();
    if (validationError) {
      setResult({
        success: false,
        reading: {
          id: '',
          status: 'error',
          errorMessage: validationError,
        },
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/coach/readings-v2/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          readingType: selectedReadingType,
          input: inputValues,
          promptVersion: selectedPromptVersion || undefined,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult({
          success: true,
          readingId: data.readingId,
          jobId: data.jobId,
          status: data.status,
        });
        setJobStatus('pending');
        setJobProgress(0);
        // Starte Polling
        startJobPolling(data.jobId, data.readingId);
      } else if (data.reading) {
        setResult({
          success: false,
          reading: data.reading,
        });
      } else {
        setResult({
          success: false,
          reading: {
            id: '',
            status: 'error',
            errorMessage: data.error || 'Unbekannter Fehler',
          },
        });
      }
    } catch (error) {
      setResult({
        success: false,
        reading: {
          id: '',
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Unbekannter Fehler',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // Renderer für Schema-Felder (dynamisch, kein Hardcoding)
  const renderSchemaField = (field: ReadingField): React.ReactNode => {
    const value = inputValues[field.key];

    switch (field.type) {
      case 'text':
        return (
          <TextField
            key={field.key}
            fullWidth
            id={field.key}
            label={field.label}
            value={value || ''}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            disabled={loading}
            required={field.required}
            placeholder={field.placeholder}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                color: '#ffffff',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#e8b86d',
                },
                '& .MuiInputBase-input': {
                  background: 'rgba(255, 255, 255, 0.1)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-focused': {
                  color: '#e8b86d',
                },
              },
            }}
          />
        );

      case 'textarea':
        return (
          <TextField
            key={field.key}
            fullWidth
            id={field.key}
            label={field.label}
            multiline
            rows={4}
            value={value || ''}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            disabled={loading}
            required={field.required}
            placeholder={field.placeholder}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                color: '#ffffff',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#e8b86d',
                },
                '& .MuiInputBase-input': {
                  background: 'rgba(255, 255, 255, 0.1)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-focused': {
                  color: '#e8b86d',
                },
              },
            }}
          />
        );

      case 'number':
        return (
          <TextField
            key={field.key}
            fullWidth
            id={field.key}
            label={field.label}
            type="number"
            value={value || ''}
            onChange={(e) => handleInputChange(field.key, Number(e.target.value))}
            disabled={loading}
            required={field.required}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                color: '#ffffff',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#e8b86d',
                },
                '& .MuiInputBase-input': {
                  background: 'rgba(255, 255, 255, 0.1)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-focused': {
                  color: '#e8b86d',
                },
              },
            }}
          />
        );

      case 'date':
        return (
          <TextField
            key={field.key}
            fullWidth
            id={field.key}
            label={field.label}
            type="date"
            value={value || ''}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            disabled={loading}
            required={field.required}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                color: '#ffffff',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#e8b86d',
                },
                '& .MuiInputBase-input': {
                  background: 'rgba(255, 255, 255, 0.1)',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-focused': {
                  color: '#e8b86d',
                },
              },
            }}
          />
        );

      case 'select':
        return (
          <FormControl
            key={field.key}
            fullWidth
            required={field.required}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.4)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e8b86d',
              },
            }}
          >
            <InputLabel
              id={`${field.key}-label`}
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                '&.Mui-focused': {
                  color: '#e8b86d',
                },
              }}
            >
              {field.label}
            </InputLabel>
            <Select
              labelId={`${field.key}-label`}
              id={field.key}
              value={value || ''}
              onChange={(e) => handleInputChange(field.key, e.target.value)}
              disabled={loading}
              label={field.label}
              sx={{
                color: '#ffffff',
                '& .MuiSelect-select': {
                  background: 'rgba(255, 255, 255, 0.1)',
                },
                '& .MuiSvgIcon-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    background: 'rgba(11, 10, 15, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    '& .MuiMenuItem-root': {
                      color: '#ffffff',
                      '&:hover': {
                        background: 'rgba(232, 184, 109, 0.2)',
                      },
                      '&.Mui-selected': {
                        background: 'rgba(232, 184, 109, 0.3)',
                        '&:hover': {
                          background: 'rgba(232, 184, 109, 0.4)',
                        },
                      },
                    },
                  },
                },
              }}
            >
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'boolean':
        return (
          <FormControlLabel
            key={field.key}
            control={
              <Switch
                checked={value === true}
                onChange={(e) => handleInputChange(field.key, e.target.checked)}
                disabled={loading}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#e8b86d',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#e8b86d',
                  },
                }}
              />
            }
            label={field.label}
            sx={{
              mb: 3,
              color: '#ffffff',
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
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
        pt: 0,
        pb: 8,
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          pt: 4,
        }}
      >
        <GlobalNavigation 
          menuItems={coachMenuItems} 
          showAuthButtons={false}
          showLogo={false}
        />
      </Container>

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

      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          pt: 4,
        }}
      >
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 6 } }}>
          <Box
            sx={{
              position: 'relative',
              width: { xs: '100%', md: 600 },
              maxWidth: 600,
              height: { xs: 120, md: 180 },
              mx: 'auto',
            }}
          >
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

        {/* Content */}
        <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
          <Typography
            variant="h3"
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              mb: { xs: 2, md: 3 },
              textAlign: 'center',
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              px: { xs: 2, md: 0 },
            }}
          >
            Reading erstellen (v2)
          </Typography>

          {/* Beschreibung */}
          <Box
            sx={{
              background: 'rgba(242, 159, 5, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(242, 159, 5, 0.3)',
              borderRadius: 2,
              p: { xs: 2, md: 3 },
              mb: { xs: 3, md: 4 },
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: '#F29F05',
                fontWeight: 600,
                mb: { xs: 1.5, md: 2 },
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              💡 Professionelle Human Design Readings erstellen
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.9)',
                mb: { xs: 1.5, md: 2 },
                fontSize: { xs: '0.875rem', md: '1rem' },
                lineHeight: { xs: 1.6, md: 1.8 },
                px: { xs: 1, md: 0 },
              }}
            >
              Erstelle individuelle Human Design oder Connection Key Readings für deine Klienten. 
              Gib die Geburtsdaten ein, wähle den Reading-Typ und die gewünschte Prompt-Version aus. 
              Das System generiert automatisch ein professionelles, personalisiertes Reading basierend auf 
              den Human Design Prinzipien.
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                lineHeight: { xs: 1.5, md: 1.6 },
                fontStyle: 'italic',
              }}
            >
              Nach der Erstellung kannst du das Reading im Dashboard verwalten, bearbeiten und als PDF exportieren.
            </Typography>
          </Box>

          {/* Formular */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              p: { xs: 2, md: 4 },
              mb: { xs: 3, md: 4 },
            }}
          >
            {/* Reading-Type Select */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel
                id="reading-type-label"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: '#e8b86d',
                  },
                }}
              >
                Reading-Typ
              </InputLabel>
              <Select
                labelId="reading-type-label"
                id="readingType"
                value={selectedReadingType}
                onChange={(e) => handleReadingTypeChange(e.target.value)}
                disabled={loading}
                label="Reading-Typ"
                sx={{
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e8b86d',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiSelect-select': {
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      background: 'rgba(11, 10, 15, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      '& .MuiMenuItem-root': {
                        color: '#ffffff',
                        '&:hover': {
                          background: 'rgba(232, 184, 109, 0.2)',
                        },
                        '&.Mui-selected': {
                          background: 'rgba(232, 184, 109, 0.3)',
                          '&:hover': {
                            background: 'rgba(232, 184, 109, 0.4)',
                          },
                        },
                      },
                    },
                  },
                }}
              >
                {readingTypes.map((type) => (
                  <MenuItem key={type.key} value={type.key}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Beschreibung */}
          {readingConfig?.description && (
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 3,
                fontStyle: 'italic',
              }}
            >
              {readingConfig.description}
            </Typography>
          )}

          {/* Prompt-Version Select (nur wenn Reading-Type gewählt) */}
          {selectedReadingType && availablePromptVersions.length > 0 && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel
                id="prompt-version-label"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: '#e8b86d',
                  },
                }}
              >
                Prompt-Version
              </InputLabel>
              <Select
                labelId="prompt-version-label"
                id="promptVersion"
                value={selectedPromptVersion || defaultPromptVersion || ''}
                onChange={(e) => setSelectedPromptVersion(e.target.value)}
                disabled={loading}
                label="Prompt-Version"
                sx={{
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e8b86d',
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                  },
                  '& .MuiSelect-select': {
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      background: 'rgba(11, 10, 15, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      '& .MuiMenuItem-root': {
                        color: '#ffffff',
                        '&:hover': {
                          background: 'rgba(232, 184, 109, 0.2)',
                        },
                        '&.Mui-selected': {
                          background: 'rgba(232, 184, 109, 0.3)',
                          '&:hover': {
                            background: 'rgba(232, 184, 109, 0.4)',
                          },
                        },
                      },
                    },
                  },
                }}
              >
                {availablePromptVersions.map(({ version, prompt }) => (
                  <MenuItem key={version} value={version}>
                    <Box>
                      <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500 }}>
                        {prompt.label}
                        {prompt.status === 'stable' && (
                          <Chip
                            label="Stabil"
                            size="small"
                            sx={{
                              ml: 1,
                              background: 'rgba(76, 175, 80, 0.2)',
                              color: '#4caf50',
                              fontSize: '0.7rem',
                            }}
                          />
                        )}
                        {prompt.status === 'experimental' && (
                          <Chip
                            label="Experimental"
                            size="small"
                            sx={{
                              ml: 1,
                              background: 'rgba(255, 152, 0, 0.2)',
                              color: '#ff9800',
                              fontSize: '0.7rem',
                            }}
                          />
                        )}
                        {prompt.status === 'deprecated' && (
                          <Chip
                            label="Deprecated"
                            size="small"
                            sx={{
                              ml: 1,
                              background: 'rgba(244, 67, 54, 0.2)',
                              color: '#f44336',
                              fontSize: '0.7rem',
                            }}
                          />
                        )}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.75rem' }}>
                        {prompt.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

            {/* Schema-Warnung */}
            {selectedReadingType && readingConfig && !schema && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Schema nicht gefunden für Reading-Typ "{selectedReadingType}".
                  {readingConfig.schemaKey ? (
                    <> Schema-Key: "{readingConfig.schemaKey}". Verfügbare Schemas: {Object.keys(readingSchemas).join(', ')}</>
                  ) : (
                    <> Dieser Reading-Typ hat kein schemaKey definiert.</>
                  )}
                </Typography>
              </Alert>
            )}

            {/* Dynamische Input-Felder aus Schema */}
            {schema && schema.fields.length > 0 && (
              <Box sx={{ mb: 3 }}>
                {schema.fields.map((field) => renderSchemaField(field))}
              </Box>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading || !selectedReadingType}
              sx={{
                background: loading
                  ? 'rgba(255, 255, 255, 0.2)'
                  : 'linear-gradient(135deg, #e8b86d 0%, #ffd89b 100%)',
                color: '#000',
                px: { xs: 3, md: 4 },
                py: { xs: 1.25, md: 1.5 },
                fontSize: { xs: '0.875rem', md: '1rem' },
                fontWeight: 600,
                textTransform: 'none',
                '&:hover:not(:disabled)': {
                  background: 'linear-gradient(135deg, #ffd89b 0%, #e8b86d 100%)',
                  transform: { xs: 'none', md: 'translateY(-2px)' },
                },
                '&:disabled': {
                  opacity: 0.5,
                  cursor: 'not-allowed',
                },
              }}
            >
              {loading ? (
                <>
                  {jobStatus === 'pending' && 'Wird erstellt...'}
                  {jobStatus === 'running' && `Wird generiert... ${jobProgress !== null ? `${jobProgress}%` : ''}`}
                  {!jobStatus && 'Wird erstellt...'}
                </>
              ) : (
                'Reading generieren'
              )}
            </Button>
          </Box>

          {/* Job Status Display */}
          {result && result.success && (
            <Box sx={{ mt: 3 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                  Reading wird erstellt...
                </Typography>
                {jobStatus === 'pending' && (
                  <Typography variant="body2">
                    Job wurde gestartet. Bitte warten Sie, während das Reading generiert wird.
                  </Typography>
                )}
                {jobStatus === 'running' && (
                  <Typography variant="body2">
                    MCP-Generierung läuft... {jobProgress !== null && `${jobProgress}%`}
                  </Typography>
                )}
                {jobError && (
                  <Alert severity="error" sx={{ mt: 1 }}>
                    {jobError}
                  </Alert>
                )}
              </Alert>
            </Box>
          )}

          {/* Result Display */}
          {result && !result.success && result.reading && (
            <Box sx={{ mt: 4 }}>
              <Box
                sx={{
                  background: 'rgba(244, 67, 54, 0.1)',
                  border: '1px solid rgba(244, 67, 54, 0.3)',
                  borderRadius: 2,
                  p: 4,
                }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: '#f44336',
                    fontWeight: 600,
                    mb: 2,
                  }}
                >
                  Fehler
                </Typography>
                <Typography
                  sx={{
                    color: '#ffcdd2',
                    mb: 2,
                  }}
                >
                  {result.reading.errorMessage || 'Unbekannter Fehler'}
                </Typography>
                {result.reading.id && (
                  <Button
                    variant="outlined"
                    onClick={() => window.location.href = `/coach/readings-v2/${result.reading.id}`}
                    sx={{
                      borderColor: '#f44336',
                      color: '#f44336',
                      '&:hover': {
                        borderColor: '#d32f2f',
                        background: 'rgba(244, 67, 54, 0.1)',
                      },
                    }}
                  >
                    Reading anzeigen
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default function CreateReadingV2Page() {
  return (
    <CoachAuth>
      <CreateReadingV2PageContent />
    </CoachAuth>
  );
}
