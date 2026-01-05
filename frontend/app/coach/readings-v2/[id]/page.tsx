'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DownloadIcon from '@mui/icons-material/Download';
import Image from 'next/image';
import CoachAuth from '@/components/CoachAuth';
import CoachNavigation from '@/components/CoachNavigation';
import ReadingQualityRating from '@/components/ReadingQualityRating';
import ShareReadingDialog from '@/components/ShareReadingDialog';
import { getReadingType } from '@/lib/readingTypes';
import { diffText, countDifferences, type DiffLine } from '@/lib/utils/textDiff';

interface ReadingData {
  id: string;
  readingType: string;
  clientName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  currentVersionId: string;
}

interface VersionSummary {
  id: string;
  versionNumber: number;
  createdAt: string;
  mcpRuntimeMs: number | null;
  schemaVersion: string;
}

interface VersionDetail {
  id: string;
  input: Record<string, any>;
  generatedText: string | null;
  readingType: string;
  schemaVersion: string;
  versionNumber: number;
  createdAt: string;
  mcpRuntimeMs: number | null;
  status: string;
  promptId?: string;
  promptVersion?: string;
  error?: string;
}

function ReadingDetailPageContent() {
  const params = useParams();
  const router = useRouter();
  const readingId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reading, setReading] = useState<ReadingData | null>(null);
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<VersionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [compareVersionA, setCompareVersionA] = useState<VersionDetail | null>(null);
  const [compareVersionB, setCompareVersionB] = useState<VersionDetail | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    if (readingId) {
      loadReading();
    }
  }, [readingId]);

  const loadReading = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lade Reading-Basis-Daten
      const readingResponse = await fetch(`/api/coach/readings-v2/${readingId}`);
      if (!readingResponse.ok) {
        const data = await readingResponse.json();
        throw new Error(data.error || `HTTP ${readingResponse.status}`);
      }
      const readingData = await readingResponse.json();
      if (!readingData.success || !readingData.reading) {
        throw new Error('Ungültige Antwort vom Server');
      }
      setReading(readingData.reading);

      // Lade Versionen-Liste
      const versionsResponse = await fetch(`/api/coach/readings-v2/${readingId}/versions`);
      if (!versionsResponse.ok) {
        throw new Error('Fehler beim Laden der Versionen');
      }
      const versionsData = await versionsResponse.json();
      if (versionsData.success) {
        setVersions(versionsData.versions);
        // Lade aktuelle Version
        if (versionsData.versions.length > 0) {
          const currentVersionId = readingData.reading.currentVersionId || versionsData.versions[0].id;
          await loadVersion(currentVersionId);
        }
      }
    } catch (err: any) {
      console.error('Fehler beim Laden des Readings:', err);
      setError(err.message || 'Fehler beim Laden des Readings');
    } finally {
      setLoading(false);
    }
  };

  const loadVersion = async (versionId: string) => {
    try {
      const response = await fetch(`/api/coach/readings-v2/${readingId}/versions/${versionId}`);
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Version');
      }
      const data = await response.json();
      if (data.success && data.version) {
        setSelectedVersion(data.version);
      }
    } catch (err: any) {
      console.error('Fehler beim Laden der Version:', err);
    }
  };

  const handleGenerateNewVersion = async () => {
    try {
      setGenerating(true);
      setGenerateError(null);

      const response = await fetch(`/api/coach/readings-v2/${readingId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Generierung fehlgeschlagen');
      }

      // Reload reading to show new version
      await loadReading();
    } catch (err: any) {
      console.error('Fehler bei Generierung:', err);
      setGenerateError(err.message || 'Fehler bei Generierung');
    } finally {
      setGenerating(false);
    }
  };

  const handleActivateVersion = async (versionId: string) => {
    try {
      const response = await fetch(`/api/coach/readings-v2/${readingId}/activate-version`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ versionId }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Fehler beim Aktivieren der Version');
      }

      // Reload um currentVersionId zu aktualisieren
      await loadReading();
    } catch (err: any) {
      console.error('Fehler beim Aktivieren der Version:', err);
      setError(err.message || 'Fehler beim Aktivieren der Version');
    }
  };

  const handleOpenCompare = () => {
    if (selectedVersion) {
      setCompareVersionA(selectedVersion);
      setCompareVersionB(null);
      setCompareDialogOpen(true);
    }
  };

  const handleCompareVersionB = async (versionId: string) => {
    const response = await fetch(`/api/coach/readings-v2/${readingId}/versions/${versionId}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.version) {
        setCompareVersionB(data.version);
      }
    }
  };

  // Diff-Berechnung
  const diff = compareVersionA && compareVersionB
    ? diffText(compareVersionA.generatedText || '', compareVersionB.generatedText || '')
    : [];
  const diffStats = diff.length > 0 ? countDifferences(diff) : null;

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: '#0b0a0f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress sx={{ color: '#e8b86d' }} />
      </Box>
    );
  }

  if (error || !reading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: '#0b0a0f',
          pt: 0,
          pb: 8,
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 100, pt: 0, mt: 0 }}>
          <CoachNavigation />
        </Box>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 10, pt: 4 }}>
          <Alert severity="error" sx={{ mt: 4 }}>
            {error || 'Reading nicht gefunden'}
          </Alert>
        </Container>
      </Box>
    );
  }

  const readingConfig = getReadingType(reading.readingType);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('de-DE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#0b0a0f',
        pt: 0,
        pb: 8,
      }}
    >
      {/* Navigation Header */}
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
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  color: '#ffffff',
                  fontWeight: 700,
                  mb: 1,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                }}
              >
                {readingConfig?.label || reading.readingType}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  mb: 0.5,
                }}
              >
                Erstellt: {formatDate(reading.createdAt)}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                {versions.length > 0 && (
                  <>
                    {versions.length} Version{versions.length !== 1 ? 'en' : ''} verfügbar
                  </>
                )}
              </Typography>
            </Box>
            <Chip
              label={reading.status}
              color={getStatusColor(reading.status) as any}
              sx={{
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            />
          </Box>

          {/* Versions-Dropdown */}
          {versions.length > 0 && (
            <Box
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                p: 3,
                mb: 4,
              }}
            >
              <FormControl fullWidth>
                <InputLabel
                  id="version-select-label"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-focused': {
                      color: '#e8b86d',
                    },
                  }}
                >
                  Version auswählen
                </InputLabel>
                <Select
                  labelId="version-select-label"
                  id="version-select"
                  value={selectedVersion?.id || ''}
                  onChange={(e) => {
                    const versionId = e.target.value;
                    loadVersion(versionId);
                  }}
                  label="Version auswählen"
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
                  {versions.map((version) => (
                    <MenuItem key={version.id} value={version.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Box>
                          <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: selectedVersion?.id === version.id ? 600 : 400 }}>
                            Version {version.versionNumber}
                            {version.id === reading.currentVersionId && ' (Aktuell)'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            {formatDate(version.createdAt)}
                            {version.mcpRuntimeMs && ` • ${version.mcpRuntimeMs}ms`}
                          </Typography>
                        </Box>
                        <Chip
                          label={version.schemaVersion}
                          size="small"
                          sx={{ ml: 2, background: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' }}
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Input-Übersicht (aus ausgewählter Version) */}
          {selectedVersion && (
            <Box
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 2,
                p: 4,
                mb: 4,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  color: '#ffffff',
                  fontWeight: 600,
                  mb: 3,
                }}
              >
                Eingabedaten (Version {versions.findIndex((v) => v.id === selectedVersion.id) + 1})
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontStyle: 'italic',
                }}
              >
                Eingabedaten sind in der Version gespeichert und können in den Metadaten eingesehen werden.
              </Typography>
            </Box>
          )}

          {/* Analyse-Text */}
          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              p: 4,
              mb: 4,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: '#ffffff',
                fontWeight: 600,
                mb: 3,
              }}
            >
              Generierter Text
            </Typography>
            {selectedVersion ? (
              selectedVersion.status === 'pending' ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: '#ffc107', mb: 2 }} />
                  <Typography
                    sx={{
                      color: '#ffc107',
                      fontWeight: 600,
                    }}
                  >
                    Reading wird erstellt...
                  </Typography>
                </Box>
              ) : selectedVersion.status === 'error' ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Analyse fehlgeschlagen
                  </Typography>
                  <Typography sx={{ mb: 2 }}>
                    {selectedVersion.error || 'MCP-Server hat aktuell keinen verwertbaren Text geliefert.'}
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handleGenerateNewVersion}
                    disabled={generating}
                    sx={{
                      borderColor: '#e8b86d',
                      color: '#e8b86d',
                      '&:hover': {
                        borderColor: '#ffd89b',
                        background: 'rgba(232, 184, 109, 0.1)',
                      },
                    }}
                  >
                    {generating ? 'Wird generiert...' : 'Erneut generieren'}
                  </Button>
                </Alert>
              ) : selectedVersion.generatedText ? (
                <>
                  <Typography
                    sx={{
                      color: '#ffffff',
                      whiteSpace: 'pre-line',
                      lineHeight: 1.8,
                      mb: 3,
                    }}
                  >
                    {selectedVersion.generatedText}
                  </Typography>

                  {/* Metadaten (Debug-freundlich) */}
                  <Accordion
                    sx={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      '&:before': {
                        display: 'none',
                      },
                      '&.Mui-expanded': {
                        margin: 0,
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />}
                      sx={{
                        '& .MuiAccordionSummary-content': {
                          my: 1,
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontWeight: 600,
                        }}
                      >
                        Metadaten (Debug)
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          <strong>Reading Type:</strong> {selectedVersion.readingType}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          <strong>Schema Version:</strong> {selectedVersion.schemaVersion}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          <strong>Version Number:</strong> {selectedVersion.versionNumber}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          <strong>MCP Runtime:</strong> {selectedVersion.mcpRuntimeMs ? `${selectedVersion.mcpRuntimeMs}ms` : 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          <strong>Erstellt:</strong> {formatDate(selectedVersion.createdAt)}
                        </Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </>
              ) : (
                <Typography
                  sx={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontStyle: 'italic',
                  }}
                >
                  Noch kein Text generiert
                </Typography>
              )
            ) : (
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontStyle: 'italic',
                }}
              >
                Keine Version ausgewählt
              </Typography>
            )}
          </Box>

          {/* Aktionen */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              mb: 4,
            }}
          >
            <Button
              variant="contained"
              onClick={handleGenerateNewVersion}
              disabled={generating}
              sx={{
                background: 'linear-gradient(135deg, #e8b86d 0%, #ffd89b 100%)',
                color: '#000',
                px: { xs: 2, md: 4 },
                py: { xs: 1, md: 1.5 },
                fontSize: { xs: '0.8125rem', md: '1rem' },
                fontWeight: 600,
                textTransform: 'none',
                '&:hover:not(:disabled)': {
                  background: 'linear-gradient(135deg, #ffd89b 0%, #e8b86d 100%)',
                },
                '&:disabled': {
                  opacity: 0.5,
                },
              }}
            >
              {generating ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 2, color: '#000' }} />
                  Wird generiert...
                </>
              ) : (
                'Neue Version generieren'
              )}
            </Button>

            {selectedVersion && selectedVersion.id !== reading.currentVersionId && (
              <Button
                variant="outlined"
                onClick={() => handleActivateVersion(selectedVersion.id)}
                sx={{
                  borderColor: '#e8b86d',
                  color: '#e8b86d',
                  px: { xs: 2, md: 4 },
                  py: { xs: 1, md: 1.5 },
                  fontSize: { xs: '0.8125rem', md: '1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#ffd89b',
                    background: 'rgba(232, 184, 109, 0.1)',
                  },
                }}
              >
                Diese Version aktivieren
              </Button>
            )}

            {versions.length > 1 && (
              <Button
                variant="outlined"
                startIcon={<CompareArrowsIcon sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />}
                onClick={handleOpenCompare}
                sx={{
                  borderColor: '#e8b86d',
                  color: '#e8b86d',
                  px: { xs: 2, md: 4 },
                  py: { xs: 1, md: 1.5 },
                  fontSize: { xs: '0.8125rem', md: '1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#ffd89b',
                    background: 'rgba(232, 184, 109, 0.1)',
                  },
                }}
              >
                Versionen vergleichen
              </Button>
            )}

            {selectedVersion && selectedVersion.generatedText && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />}
                  onClick={() => {
                    const url = `/api/coach/readings-v2/${readingId}/versions/${selectedVersion.id}/pdf`;
                    window.open(url, '_blank');
                  }}
                  sx={{
                    borderColor: '#e8b86d',
                    color: '#e8b86d',
                    px: { xs: 2, md: 4 },
                    py: { xs: 1, md: 1.5 },
                    fontSize: { xs: '0.8125rem', md: '1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#ffd89b',
                      background: 'rgba(232, 184, 109, 0.1)',
                    },
                  }}
                >
                  PDF herunterladen
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    // Öffne Kundenansicht in neuem Tab
                    const url = `/readings/${readingId}`;
                    window.open(url, '_blank');
                  }}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    px: { xs: 2, md: 4 },
                    py: { xs: 1, md: 1.5 },
                    fontSize: { xs: '0.8125rem', md: '1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      background: 'rgba(255, 255, 255, 0.05)',
                    },
                  }}
                >
                  Kundenansicht öffnen
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    router.push(`/coach/readings/${readingId}/review`);
                  }}
                  sx={{
                    borderColor: '#ff9800',
                    color: '#ff9800',
                    px: { xs: 2, md: 4 },
                    py: { xs: 1, md: 1.5 },
                    fontSize: { xs: '0.8125rem', md: '1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#ffb74d',
                      background: 'rgba(255, 152, 0, 0.1)',
                    },
                  }}
                >
                  Qualität bewerten
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShareDialogOpen(true)}
                  sx={{
                    borderColor: '#2196f3',
                    color: '#2196f3',
                    px: { xs: 2, md: 4 },
                    py: { xs: 1, md: 1.5 },
                    fontSize: { xs: '0.8125rem', md: '1rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#64b5f6',
                      background: 'rgba(33, 150, 243, 0.1)',
                    },
                  }}
                >
                  Mit Kunde teilen
                </Button>
              </>
            )}
          </Box>
          {generateError && (
            <Alert severity="error" sx={{ mb: 4 }}>
              {generateError}
            </Alert>
          )}

          {/* Reading-Bewertung */}
          {selectedVersion && selectedVersion.generatedText && (
            <ReadingQualityRating
              readingId={readingId}
              versionId={selectedVersion.id}
              promptId={selectedVersion.promptId || undefined}
              promptVersion={selectedVersion.promptVersion || undefined}
            />
          )}

        </Box>
      </Container>

      {/* Compare Dialog */}
      <Dialog
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(11, 10, 15, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#ffffff', fontWeight: 600 }}>
          Versionen vergleichen
          {diffStats && (
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Chip
                label={`${diffStats.added} hinzugefügt`}
                size="small"
                sx={{ background: 'rgba(76, 175, 80, 0.2)', color: '#4caf50' }}
              />
              <Chip
                label={`${diffStats.removed} entfernt`}
                size="small"
                sx={{ background: 'rgba(244, 67, 54, 0.2)', color: '#f44336' }}
              />
              {diffStats.changed > 0 && (
                <Chip
                  label={`${diffStats.changed} geändert`}
                  size="small"
                  sx={{ background: 'rgba(255, 152, 0, 0.2)', color: '#ff9800' }}
                />
              )}
            </Box>
          )}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Version A</InputLabel>
                <Select
                  value={compareVersionA?.id || ''}
                  onChange={async (e) => {
                    const versionId = e.target.value;
                    const response = await fetch(`/api/coach/readings-v2/${readingId}/versions/${versionId}`);
                    if (response.ok) {
                      const data = await response.json();
                      if (data.success && data.version) {
                        setCompareVersionA(data.version);
                      }
                    }
                  }}
                  sx={{ color: '#ffffff' }}
                >
                  {versions.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      Version {v.versionNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {compareVersionA && (
                <Box
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    p: 2,
                    maxHeight: '500px',
                    overflow: 'auto',
                  }}
                >
                  <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                    Version {compareVersionA.versionNumber}
                  </Typography>
                  {compareVersionA.generatedText ? (
                    <Box>
                      {diff.length > 0 && compareVersionB ? (
                        // Diff-Ansicht
                        diff.map((line: DiffLine, index: number) => {
                          if (line.type === 'removed' || (line.type === 'equal' && line.content)) {
                            return (
                              <Typography
                                key={`a-${index}`}
                                component="div"
                                sx={{
                                  color: line.type === 'removed' ? '#f44336' : '#ffffff',
                                  backgroundColor: line.type === 'removed' ? 'rgba(244, 67, 54, 0.1)' : 'transparent',
                                  textDecoration: line.type === 'removed' ? 'line-through' : 'none',
                                  whiteSpace: 'pre-line',
                                  lineHeight: 1.8,
                                  px: line.type === 'removed' ? 1 : 0,
                                  py: line.type === 'removed' ? 0.5 : 0,
                                }}
                              >
                                {line.content}
                              </Typography>
                            );
                          }
                          return null;
                        })
                      ) : (
                        // Normale Ansicht
                        <Typography
                          sx={{
                            color: '#ffffff',
                            whiteSpace: 'pre-line',
                            lineHeight: 1.8,
                          }}
                        >
                          {compareVersionA.generatedText}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
                      Kein Text verfügbar
                    </Typography>
                  )}
                </Box>
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>Version B</InputLabel>
                <Select
                  value={compareVersionB?.id || ''}
                  onChange={(e) => {
                    const versionId = e.target.value;
                    handleCompareVersionB(versionId);
                  }}
                  sx={{ color: '#ffffff' }}
                >
                  {versions.map((v) => (
                    <MenuItem key={v.id} value={v.id}>
                      Version {v.versionNumber}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {compareVersionB && (
                <Box
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    p: 2,
                    maxHeight: '500px',
                    overflow: 'auto',
                  }}
                >
                  <Typography variant="h6" sx={{ color: '#ffffff', mb: 2 }}>
                    Version {compareVersionB.versionNumber}
                  </Typography>
                  {compareVersionB.generatedText ? (
                    <Box>
                      {diff.length > 0 && compareVersionA ? (
                        // Diff-Ansicht
                        diff.map((line: DiffLine, index: number) => {
                          if (line.type === 'added' || (line.type === 'equal' && line.content)) {
                            return (
                              <Typography
                                key={`b-${index}`}
                                component="div"
                                sx={{
                                  color: line.type === 'added' ? '#4caf50' : '#ffffff',
                                  backgroundColor: line.type === 'added' ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                                  whiteSpace: 'pre-line',
                                  lineHeight: 1.8,
                                  px: line.type === 'added' ? 1 : 0,
                                  py: line.type === 'added' ? 0.5 : 0,
                                }}
                              >
                                {line.content}
                              </Typography>
                            );
                          }
                          return null;
                        })
                      ) : (
                        // Normale Ansicht
                        <Typography
                          sx={{
                            color: '#ffffff',
                            whiteSpace: 'pre-line',
                            lineHeight: 1.8,
                          }}
                        >
                          {compareVersionB.generatedText}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
                      Kein Text verfügbar
                    </Typography>
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setCompareDialogOpen(false)}
            sx={{ color: '#ffffff' }}
          >
            Schließen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Share Dialog */}
      <ShareReadingDialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        readingId={readingId}
      />
    </Box>
  );
}

export default function ReadingDetailPage() {
  return (
    <CoachAuth>
      <ReadingDetailPageContent />
    </CoachAuth>
  );
}
