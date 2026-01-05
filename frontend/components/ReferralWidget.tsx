"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Gift,
  Copy,
  Share2,
  Users,
  TrendingUp,
  Award,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { referralSystem, ReferralStats } from '@/lib/referral/ReferralSystem';
import { useAuth } from '@/lib/hooks/useAuth';

export default function ReferralWidget() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadReferralData = React.useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Generate or get referral code
      const code = await referralSystem.generateReferralCode(user.id);
      setReferralCode(code);

      // Get stats
      const referralStats = await referralSystem.getReferralStats(user.id);
      setStats(referralStats);

    } catch (error) {
      console.error('Error loading referral data:', error);
      // Set default values on error
      setReferralCode('');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadReferralData();
    } else {
      setLoading(false);
    }
  }, [user, loadReferralData]);

  const handleCopy = async () => {
    if (!referralCode) return;
    
    const referralUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/register?ref=${referralCode}`
      : '';
    
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(referralUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleShare = () => {
    if (!referralCode) return;
    
    const referralUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/register?ref=${referralCode}`
      : '';
    const text = `Entdecke dein Human Design Chart! Nutze meinen Code ${referralCode} und erhalte einen Bonus 🎁`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'Kosmische Verbindungen Einladung',
        text,
        url: referralUrl
      }).catch((error) => {
        console.error('Error sharing:', error);
      });
    }
  };

  if (loading || !user) {
    return (
      <Card sx={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 3
      }}>
        <CardContent>
          <Stack alignItems="center" py={4}>
            {loading ? (
              <CircularProgress sx={{ color: '#FFD700' }} />
            ) : (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Bitte melde dich an, um deinen Referral-Code zu sehen.
              </Typography>
            )}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card sx={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 215, 0, 0.3)',
        borderRadius: 3
      }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Gift size={32} color="#FFD700" />
              <Box>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                  Freunde einladen
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Verdiene 10 Credits pro Freund
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            {/* Referral Code */}
            <Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                Dein Einladungscode
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={referralCode}
                  InputProps={{
                    readOnly: true,
                    sx: {
                      color: '#FFD700',
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      background: 'rgba(255,255,255,0.05)',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }
                    }
                  }}
                />
                <Tooltip title={copied ? 'Kopiert!' : 'Link kopieren'}>
                  <Button
                    onClick={handleCopy}
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
                <Tooltip title="Teilen">
                  <Button
                    onClick={handleShare}
                    variant="contained"
                    sx={{
                      minWidth: 'auto',
                      px: 2,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
                      }
                    }}
                  >
                    <Share2 size={18} />
                  </Button>
                </Tooltip>
              </Box>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            {/* Stats */}
            {stats && (
              <Stack direction="row" spacing={2}>
                <Box flex={1} sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center'
                }}>
                  <Users size={24} color="#667eea" />
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mt: 1 }}>
                    {stats.totalReferrals}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Einladungen
                  </Typography>
                </Box>

                <Box flex={1} sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center'
                }}>
                  <CheckCircle size={24} color="#10b981" />
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mt: 1 }}>
                    {stats.successfulReferrals}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Erfolgreich
                  </Typography>
                </Box>

                <Box flex={1} sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  textAlign: 'center'
                }}>
                  <Award size={24} color="#FFD700" />
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mt: 1 }}>
                    {stats.totalRewards}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Credits
                  </Typography>
                </Box>
              </Stack>
            )}

            {/* Info */}
            <Alert 
              severity="info"
              icon={<Gift size={20} />}
              sx={{
                background: 'rgba(102, 126, 234, 0.1)',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                color: 'white',
                '& .MuiAlert-icon': {
                  color: '#667eea'
                }
              }}
            >
              <Typography variant="body2">
                <strong>Wie es funktioniert:</strong> Teile deinen Code, dein Freund erhält 5 Credits Willkommensbonus 
                und du erhältst 10 Credits sobald er ein Premium-Paket abonniert! 🎉
              </Typography>
            </Alert>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
}

