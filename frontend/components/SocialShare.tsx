"use client";

import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Button,
  Typography,
  Stack,
  TextField,
  Snackbar,
  Alert,
  Tooltip,
  Divider,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import {
  Share2,
  X,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MessageCircle,
  Download,
  Eye,
  EyeOff,
  Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SocialShareProps {
  title?: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  chartData?: any;
  type?: 'chart' | 'transit' | 'profile' | 'general';
  onShare?: (platform: string) => void;
}

export default function SocialShare({
  title = 'Mein Human Design Chart',
  description = 'Entdecke dein einzigartiges Human Design auf Kosmische Verbindungen',
  url,
  imageUrl,
  chartData,
  type = 'general',
  onShare
}: SocialShareProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [anonymize, setAnonymize] = useState(true);
  const [shareUrl, setShareUrl] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleOpen = async () => {
    setOpen(true);
    if (!shareUrl) {
      await generateShareUrl();
    }
  };

  const handleClose = () => {
    setOpen(false);
    setCopied(false);
  };

  const generateShareUrl = async () => {
    setGenerating(true);
    try {
      // Generate share link with or without personal data
      const baseUrl = url || window.location.href;
      
      if (anonymize && chartData) {
        // Create anonymous share link
        const response = await fetch('/api/share/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            data: chartData,
            anonymize: true
          })
        });
        
        const { shareId } = await response.json();
        setShareUrl(`${window.location.origin}/share/${shareId}`);
      } else {
        setShareUrl(baseUrl);
      }
    } catch (error) {
      console.error('Error generating share URL:', error);
      setShareUrl(url || window.location.href);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
      onShare?.('clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);

    let shareLink = '';

    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'noopener,noreferrer,width=600,height=600');
      onShare?.(platform);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl
        });
        onShare?.('native');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleDownloadImage = async () => {
    // TODO: Implement chart-to-image conversion
    onShare?.('download');
  };

  const socialPlatforms = [
    { 
      name: 'Facebook', 
      icon: Facebook, 
      color: '#1877F2',
      action: () => handleShare('facebook')
    },
    { 
      name: 'Twitter', 
      icon: Twitter, 
      color: '#1DA1F2',
      action: () => handleShare('twitter')
    },
    { 
      name: 'LinkedIn', 
      icon: Linkedin, 
      color: '#0A66C2',
      action: () => handleShare('linkedin')
    },
    { 
      name: 'WhatsApp', 
      icon: MessageCircle, 
      color: '#25D366',
      action: () => handleShare('whatsapp')
    },
    { 
      name: 'Email', 
      icon: Mail, 
      color: '#EA4335',
      action: () => handleShare('email')
    }
  ];

  return (
    <>
      {/* Share Button */}
      <Tooltip title="Teilen">
        <IconButton
          onClick={handleOpen}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              transform: 'scale(1.05)'
            },
            transition: 'all 0.3s ease'
          }}
        >
          <Share2 size={20} />
        </IconButton>
      </Tooltip>

      {/* Share Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(20, 25, 45, 0.98) 0%, rgba(30, 35, 60, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Share2 size={24} color="#FFD700" />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 700 }}>
              Teilen
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {/* Privacy Toggle */}
            {chartData && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Box sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(255, 215, 0, 0.1)',
                  border: '1px solid rgba(255, 215, 0, 0.3)'
                }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={anonymize}
                        onChange={(e) => {
                          setAnonymize(e.target.checked);
                          setShareUrl(''); // Reset URL to regenerate
                        }}
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#FFD700'
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#FFD700'
                          }
                        }}
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {anonymize ? <EyeOff size={16} /> : <Eye size={16} />}
                        <Typography variant="body2" sx={{ color: 'white' }}>
                          {anonymize ? 'Anonymisiert teilen' : 'Mit persönlichen Daten'}
                        </Typography>
                      </Box>
                    }
                  />
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', ml: 5 }}>
                    {anonymize 
                      ? 'Dein Chart wird ohne Namen und Geburtsdaten geteilt'
                      : 'Vollständiges Chart mit allen Details'
                    }
                  </Typography>
                </Box>
              </motion.div>
            )}

            {/* Share URL */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                Link
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={generating ? 'Generiere Link...' : shareUrl}
                  disabled={generating}
                  InputProps={{
                    readOnly: true,
                    sx: {
                      color: 'white',
                      background: 'rgba(255,255,255,0.05)',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }
                    }
                  }}
                />
                <Tooltip title={copied ? 'Kopiert!' : 'Link kopieren'}>
                  <Button
                    onClick={handleCopy}
                    disabled={generating}
                    variant="contained"
                    sx={{
                      minWidth: 'auto',
                      px: 2,
                      background: copied 
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: copied
                          ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                          : 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
                      }
                    }}
                  >
                    <Copy size={18} />
                  </Button>
                </Tooltip>
              </Box>
            </motion.div>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            {/* Social Platforms */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                Auf Social Media teilen
              </Typography>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                gap: 2
              }}>
                {socialPlatforms.map((platform, index) => {
                  const Icon = platform.icon;
                  return (
                    <motion.div
                      key={platform.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.35 + index * 0.05 }}
                    >
                      <Button
                        fullWidth
                        onClick={platform.action}
                        disabled={generating}
                        sx={{
                          py: 2,
                          flexDirection: 'column',
                          gap: 1,
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'white',
                          '&:hover': {
                            background: `${platform.color}20`,
                            borderColor: platform.color,
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <Icon size={24} color={platform.color} />
                        <Typography variant="caption">{platform.name}</Typography>
                      </Button>
                    </motion.div>
                  );
                })}
              </Box>
            </motion.div>

            {/* Additional Actions */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Stack spacing={1}>
                {/* Native Share (Mobile) */}
                {navigator.share && (
                  <Button
                    fullWidth
                    onClick={handleNativeShare}
                    disabled={generating}
                    startIcon={<Share2 size={18} />}
                    sx={{
                      justifyContent: 'flex-start',
                      color: 'white',
                      background: 'rgba(255,255,255,0.05)',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    Mehr Optionen
                  </Button>
                )}

                {/* Download as Image */}
                {type === 'chart' && (
                  <Button
                    fullWidth
                    onClick={handleDownloadImage}
                    disabled={generating}
                    startIcon={<Download size={18} />}
                    sx={{
                      justifyContent: 'flex-start',
                      color: 'white',
                      background: 'rgba(255,255,255,0.05)',
                      '&:hover': {
                        background: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    Als Bild herunterladen
                  </Button>
                )}
              </Stack>
            </motion.div>

            {/* Referral Info (for VIP users) */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Box sx={{
                p: 2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 165, 0, 0.1) 100%)',
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  💡 <strong>Tipp:</strong> Teile deine Erfahrung und hilf anderen, ihr wahres Selbst zu entdecken!
                </Typography>
              </Box>
            </motion.div>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          sx={{ 
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white'
          }}
        >
          Link wurde kopiert! 📋
        </Alert>
      </Snackbar>
    </>
  );
}

