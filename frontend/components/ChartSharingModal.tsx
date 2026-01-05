'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  X, 
  Download, 
  Copy, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  MessageCircle,
  QrCode,
  FileText,
  Image,
  Link,
  Check,
  ExternalLink,
  Eye,
  Users,
  TrendingUp
} from 'lucide-react';
import { useSharing, ShareOptions } from '../lib/sharingService';

interface ChartSharingModalProps {
  open: boolean;
  onClose: () => void;
  chartData: any;
}

export default function ChartSharingModal({ open, onClose, chartData }: ChartSharingModalProps) {
  const { isSharing, shareData, error, shareChart, shareToSocial, copyLink, downloadImage, downloadPDF, generateEmailShare } = useSharing();
  const [activeTab, setActiveTab] = useState(0);
  const [shareOptions, setShareOptions] = useState<ShareOptions>({
    includeProfile: true,
    includeTransits: true,
    include3D: false,
    includeAudio: false,
    format: 'image',
    quality: 'high',
    watermark: true,
    socialMedia: {
      facebook: false,
      twitter: false,
      instagram: false,
      linkedin: false,
      whatsapp: false
    }
  });
  const [customMessage, setCustomMessage] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleShare = async () => {
    try {
      await shareChart(chartData, shareOptions);
    } catch (error) {
      console.error('Sharing-Fehler:', error);
    }
  };

  const handleSocialShare = async (platform: string) => {
    try {
      await shareToSocial(platform);
    } catch (error) {
      console.error('Social Media Sharing-Fehler:', error);
    }
  };

  const handleCopyLink = async () => {
    try {
      await copyLink();
      // Erfolgs-Feedback
    } catch (error) {
      console.error('Link-Kopieren-Fehler:', error);
    }
  };

  const handleDownloadImage = async () => {
    try {
      await downloadImage();
    } catch (error) {
      console.error('Bild-Download-Fehler:', error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      await downloadPDF();
    } catch (error) {
      console.error('PDF-Download-Fehler:', error);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'image': return <Image size={20} />;
      case 'pdf': return <FileText size={20} />;
      case 'link': return <Link size={20} />;
      case 'qr': return <QrCode size={20} />;
      default: return <Share2 size={20} />;
    }
  };

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'low': return 'Niedrig';
      case 'medium': return 'Mittel';
      case 'high': return 'Hoch';
      default: return 'Mittel';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'rgba(15,15,35,0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(254,243,199,0.2)',
          borderRadius: 3
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#fef3c7',
        borderBottom: '1px solid rgba(254,243,199,0.2)',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            color: 'white'
          }}>
            <Share2 size={24} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ color: '#fef3c7', fontWeight: 700, mb: 0.5 }}>
              Chart teilen
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'rgba(254,243,199,0.8)' }}>
              Teile dein Human Design Chart
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#fef3c7' }}>
          <X size={24} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Tab Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'rgba(254,243,199,0.2)', px: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(254,243,199,0.7)',
                '&.Mui-selected': {
                  color: '#fef3c7'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#fef3c7'
              }
            }}
          >
            <Tab label="Einstellungen" icon={<Share2 size={16} />} />
            <Tab label="Teilen" icon={<Users size={16} />} />
            <Tab label="Download" icon={<Download size={16} />} />
            <Tab label="Statistiken" icon={<TrendingUp size={16} />} />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          <AnimatePresence mode="wait">
            {activeTab === 0 && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h6" sx={{ color: '#fef3c7', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Share2 size={20} />
                  Sharing-Einstellungen
                </Typography>

                <Grid container spacing={3}>
                  {/* Format-Auswahl */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(254,243,199,0.1)',
                      borderRadius: 2
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2 }}>
                          Format
                        </Typography>
                        
                        <Grid container spacing={1}>
                          {['image', 'pdf', 'link', 'qr'].map((format) => (
                            <Grid item xs={6} key={format}>
                              <Button
                                variant={shareOptions.format === format ? 'contained' : 'outlined'}
                                fullWidth
                                onClick={() => setShareOptions(prev => ({ ...prev, format: format as any }))}
                                startIcon={getFormatIcon(format)}
                                sx={{
                                  background: shareOptions.format === format ? 'linear-gradient(135deg, #8b5cf6, #a855f7)' : 'transparent',
                                  color: '#fef3c7',
                                  border: '1px solid rgba(254,243,199,0.3)',
                                  '&:hover': {
                                    background: shareOptions.format === format ? 'linear-gradient(135deg, #7c3aed, #9333ea)' : 'rgba(254,243,199,0.1)'
                                  }
                                }}
                              >
                                {format.charAt(0).toUpperCase() + format.slice(1)}
                              </Button>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Qualität */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(254,243,199,0.1)',
                      borderRadius: 2
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2 }}>
                          Qualität
                        </Typography>
                        
                        <Grid container spacing={1}>
                          {['low', 'medium', 'high'].map((quality) => (
                            <Grid item xs={4} key={quality}>
                              <Button
                                variant={shareOptions.quality === quality ? 'contained' : 'outlined'}
                                fullWidth
                                onClick={() => setShareOptions(prev => ({ ...prev, quality: quality as any }))}
                                sx={{
                                  background: shareOptions.quality === quality ? 'linear-gradient(135deg, #8b5cf6, #a855f7)' : 'transparent',
                                  color: '#fef3c7',
                                  border: '1px solid rgba(254,243,199,0.3)',
                                  fontSize: '0.8rem',
                                  '&:hover': {
                                    background: shareOptions.quality === quality ? 'linear-gradient(135deg, #7c3aed, #9333ea)' : 'rgba(254,243,199,0.1)'
                                  }
                                }}
                              >
                                {getQualityLabel(quality)}
                              </Button>
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Optionen */}
                  <Grid item xs={12}>
                    <Card sx={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(254,243,199,0.1)',
                      borderRadius: 2
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2 }}>
                          Optionen
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={shareOptions.includeProfile}
                                  onChange={(e) => setShareOptions(prev => ({ ...prev, includeProfile: e.target.checked }))}
                                  sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                      color: '#8b5cf6',
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                      backgroundColor: '#8b5cf6',
                                    },
                                  }}
                                />
                              }
                              label="Profil-Informationen"
                              sx={{ color: '#fef3c7' }}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={shareOptions.includeTransits}
                                  onChange={(e) => setShareOptions(prev => ({ ...prev, includeTransits: e.target.checked }))}
                                  sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                      color: '#8b5cf6',
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                      backgroundColor: '#8b5cf6',
                                    },
                                  }}
                                />
                              }
                              label="Transit-Informationen"
                              sx={{ color: '#fef3c7' }}
                            />
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={shareOptions.watermark}
                                  onChange={(e) => setShareOptions(prev => ({ ...prev, watermark: e.target.checked }))}
                                  sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                      color: '#8b5cf6',
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                      backgroundColor: '#8b5cf6',
                                    },
                                  }}
                                />
                              }
                              label="Wasserzeichen"
                              sx={{ color: '#fef3c7' }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Benutzerdefinierte Nachricht */}
                  <Grid item xs={12}>
                    <Card sx={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(254,243,199,0.1)',
                      borderRadius: 2
                    }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2 }}>
                          Benutzerdefinierte Nachricht
                        </Typography>
                        
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          placeholder="Füge eine persönliche Nachricht hinzu..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              color: '#fef3c7',
                              '& fieldset': { borderColor: 'rgba(254,243,199,0.3)' },
                              '&:hover fieldset': { borderColor: 'rgba(254,243,199,0.5)' },
                              '&.Mui-focused fieldset': { borderColor: '#fef3c7' }
                            },
                            '& .MuiInputLabel-root': { color: 'rgba(254,243,199,0.7)' }
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </motion.div>
            )}

            {activeTab === 1 && (
              <motion.div
                key="sharing"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h6" sx={{ color: '#fef3c7', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Users size={20} />
                  Chart teilen
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                    {error}
                  </Alert>
                )}

                {!shareData ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2 }}>
                      Chart vorbereiten
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)', mb: 3 }}>
                      Klicke auf "Chart teilen" um dein Human Design Chart zu generieren und zu teilen.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleShare}
                      disabled={isSharing}
                      startIcon={isSharing ? <CircularProgress size={20} /> : <Share2 size={20} />}
                      sx={{
                        background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                        color: 'white',
                        px: 4,
                        py: 2,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #7c3aed, #9333ea)'
                        }
                      }}
                    >
                      {isSharing ? 'Wird vorbereitet...' : 'Chart teilen'}
                    </Button>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {/* Share-URL */}
                    <Grid item xs={12}>
                      <Card sx={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(254,243,199,0.1)',
                        borderRadius: 2
                      }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2 }}>
                            Share-URL
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            <TextField
                              fullWidth
                              value={shareData.shareUrl}
                              InputProps={{ readOnly: true }}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  color: '#fef3c7',
                                  backgroundColor: 'rgba(255,255,255,0.05)',
                                  '& fieldset': { borderColor: 'rgba(254,243,199,0.3)' }
                                }
                              }}
                            />
                            <Button
                              variant="outlined"
                              onClick={handleCopyLink}
                              startIcon={<Copy size={16} />}
                              sx={{
                                color: '#fef3c7',
                                border: '1px solid rgba(254,243,199,0.3)',
                                '&:hover': {
                                  borderColor: '#fef3c7',
                                  backgroundColor: 'rgba(254,243,199,0.1)'
                                }
                              }}
                            >
                              Kopieren
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Social Media */}
                    <Grid item xs={12}>
                      <Card sx={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(254,243,199,0.1)',
                        borderRadius: 2
                      }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2 }}>
                            Social Media
                          </Typography>
                          
                          <Grid container spacing={2}>
                            <Grid item xs={6} sm={4}>
                              <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => handleSocialShare('facebook')}
                                startIcon={<Facebook size={16} />}
                                sx={{
                                  color: '#1877f2',
                                  border: '1px solid #1877f2',
                                  '&:hover': {
                                    backgroundColor: 'rgba(24,119,242,0.1)'
                                  }
                                }}
                              >
                                Facebook
                              </Button>
                            </Grid>
                            
                            <Grid item xs={6} sm={4}>
                              <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => handleSocialShare('twitter')}
                                startIcon={<Twitter size={16} />}
                                sx={{
                                  color: '#1da1f2',
                                  border: '1px solid #1da1f2',
                                  '&:hover': {
                                    backgroundColor: 'rgba(29,161,242,0.1)'
                                  }
                                }}
                              >
                                Twitter
                              </Button>
                            </Grid>
                            
                            <Grid item xs={6} sm={4}>
                              <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => handleSocialShare('linkedin')}
                                startIcon={<Linkedin size={16} />}
                                sx={{
                                  color: '#0077b5',
                                  border: '1px solid #0077b5',
                                  '&:hover': {
                                    backgroundColor: 'rgba(0,119,181,0.1)'
                                  }
                                }}
                              >
                                LinkedIn
                              </Button>
                            </Grid>
                            
                            <Grid item xs={6} sm={4}>
                              <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => handleSocialShare('whatsapp')}
                                startIcon={<MessageCircle size={16} />}
                                sx={{
                                  color: '#25d366',
                                  border: '1px solid #25d366',
                                  '&:hover': {
                                    backgroundColor: 'rgba(37,211,102,0.1)'
                                  }
                                }}
                              >
                                WhatsApp
                              </Button>
                            </Grid>
                            
                            <Grid item xs={6} sm={4}>
                              <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => window.open(generateEmailShare(), '_blank')}
                                startIcon={<Mail size={16} />}
                                sx={{
                                  color: '#fef3c7',
                                  border: '1px solid rgba(254,243,199,0.3)',
                                  '&:hover': {
                                    backgroundColor: 'rgba(254,243,199,0.1)'
                                  }
                                }}
                              >
                                E-Mail
                              </Button>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                )}
              </motion.div>
            )}

            {activeTab === 2 && (
              <motion.div
                key="download"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h6" sx={{ color: '#fef3c7', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Download size={20} />
                  Download
                </Typography>

                {shareData ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Card sx={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(254,243,199,0.1)',
                        borderRadius: 2
                      }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Image size={48} color="#8b5cf6" style={{ marginBottom: '16px' }} />
                          <Typography variant="h6" sx={{ color: '#fef3c7', mb: 1 }}>
                            Als Bild
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)', mb: 2 }}>
                            Download als PNG-Bild
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={handleDownloadImage}
                            startIcon={<Download size={16} />}
                            sx={{
                              background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #7c3aed, #9333ea)'
                              }
                            }}
                          >
                            Download
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Card sx={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(254,243,199,0.1)',
                        borderRadius: 2
                      }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <FileText size={48} color="#8b5cf6" style={{ marginBottom: '16px' }} />
                          <Typography variant="h6" sx={{ color: '#fef3c7', mb: 1 }}>
                            Als PDF
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)', mb: 2 }}>
                            Download als PDF-Dokument
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={handleDownloadPDF}
                            startIcon={<Download size={16} />}
                            sx={{
                              background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #7c3aed, #9333ea)'
                              }
                            }}
                          >
                            Download
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2 }}>
                      Chart nicht verfügbar
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)' }}>
                      Teile zuerst dein Chart, um Downloads zu ermöglichen.
                    </Typography>
                  </Box>
                )}
              </motion.div>
            )}

            {activeTab === 3 && (
              <motion.div
                key="stats"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h6" sx={{ color: '#fef3c7', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp size={20} />
                  Statistiken
                </Typography>

                {shareData ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <Card sx={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(254,243,199,0.1)',
                        borderRadius: 2
                      }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Eye size={32} color="#3b82f6" style={{ marginBottom: '8px' }} />
                          <Typography variant="h4" sx={{ color: '#3b82f6', fontWeight: 700, mb: 1 }}>
                            0
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)' }}>
                            Aufrufe
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Card sx={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(254,243,199,0.1)',
                        borderRadius: 2
                      }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Users size={32} color="#22c55e" style={{ marginBottom: '8px' }} />
                          <Typography variant="h4" sx={{ color: '#22c55e', fontWeight: 700, mb: 1 }}>
                            0
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)' }}>
                            Shares
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} sm={4}>
                      <Card sx={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(254,243,199,0.1)',
                        borderRadius: 2
                      }}>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Download size={32} color="#f59e0b" style={{ marginBottom: '8px' }} />
                          <Typography variant="h4" sx={{ color: '#f59e0b', fontWeight: 700, mb: 1 }}>
                            0
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)' }}>
                            Downloads
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2 }}>
                      Keine Statistiken verfügbar
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)' }}>
                      Teile dein Chart, um Statistiken zu sehen.
                    </Typography>
                  </Box>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid rgba(254,243,199,0.2)' }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#fef3c7',
            border: '1px solid rgba(254,243,199,0.3)',
            '&:hover': {
              backgroundColor: 'rgba(254,243,199,0.1)'
            }
          }}
        >
          Schließen
        </Button>
      </DialogActions>
    </Dialog>
  );
}
