'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Box,
  Alert,
  IconButton,
  Chip,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface ShareReadingDialogProps {
  open: boolean;
  onClose: () => void;
  readingId: string;
}

export default function ShareReadingDialog({ open, onClose, readingId }: ShareReadingDialogProps) {
  const [accessLevel, setAccessLevel] = useState<'view' | 'comment'>('view');
  const [expiresInDays, setExpiresInDays] = useState<number | ''>(30);
  const [maxViews, setMaxViews] = useState<number | ''>(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateShare = async () => {
    setLoading(true);
    setError(null);
    setShareUrl(null);

    try {
      const response = await fetch(`/api/coach/readings/${readingId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessLevel,
          expiresInDays: expiresInDays === '' ? null : expiresInDays,
          maxViews: maxViews === '' ? null : maxViews,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Fehler beim Erstellen des Shares');
      }

      setShareUrl(data.share.shareUrl);
    } catch (err: any) {
      console.error('Fehler beim Erstellen des Shares:', err);
      setError(err.message || 'Fehler beim Erstellen des Shares');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setShareUrl(null);
    setError(null);
    setCopied(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
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
        Mit Kunde teilen
      </DialogTitle>
      <DialogContent>
        {shareUrl ? (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              Share erfolgreich erstellt!
            </Alert>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
              Teilen Sie diesen Link mit Ihrem Kunden:
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 2,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 1,
                mb: 2,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: '#ffffff',
                  flex: 1,
                  wordBreak: 'break-all',
                }}
              >
                {shareUrl}
              </Typography>
              <IconButton
                onClick={handleCopyLink}
                sx={{
                  color: copied ? '#4caf50' : '#e8b86d',
                  '&:hover': {
                    background: 'rgba(232, 184, 109, 0.1)',
                  },
                }}
              >
                {copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
              </IconButton>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>
              Der Link ist {expiresInDays ? `für ${expiresInDays} Tage` : 'unbegrenzt'} gültig
              {maxViews && ` und kann maximal ${maxViews} mal aufgerufen werden`}.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Zugriff */}
            <FormControl fullWidth>
              <InputLabel
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: '#e8b86d',
                  },
                }}
              >
                Zugriff
              </InputLabel>
              <Select
                value={accessLevel}
                onChange={(e) => setAccessLevel(e.target.value as 'view' | 'comment')}
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
                }}
              >
                <MenuItem value="view">Nur lesen</MenuItem>
                <MenuItem value="comment">Kommentieren (später)</MenuItem>
              </Select>
            </FormControl>

            {/* Gültigkeit */}
            <FormControl fullWidth>
              <InputLabel
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: '#e8b86d',
                  },
                }}
              >
                Gültigkeit
              </InputLabel>
              <Select
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value === '' ? '' : Number(e.target.value))}
                sx={{
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <MenuItem value="">Unbegrenzt</MenuItem>
                <MenuItem value={7}>7 Tage</MenuItem>
                <MenuItem value={30}>30 Tage</MenuItem>
                <MenuItem value={90}>90 Tage</MenuItem>
              </Select>
            </FormControl>

            {/* Max. Aufrufe */}
            <FormControl fullWidth>
              <InputLabel
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-focused': {
                    color: '#e8b86d',
                  },
                }}
              >
                Max. Aufrufe
              </InputLabel>
              <Select
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value === '' ? '' : Number(e.target.value))}
                sx={{
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                }}
              >
                <MenuItem value="">Unbegrenzt</MenuItem>
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
              </Select>
            </FormControl>

            {error && (
              <Alert severity="error">{error}</Alert>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          background: 'rgba(11, 10, 15, 0.95)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          p: 2,
        }}
      >
        {shareUrl ? (
          <Button onClick={handleClose} sx={{ color: '#e8b86d' }}>
            Schließen
          </Button>
        ) : (
          <>
            <Button onClick={handleClose} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Abbrechen
            </Button>
            <Button
              onClick={handleCreateShare}
              disabled={loading}
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #e8b86d 0%, #ffd89b 100%)',
                color: '#000',
                px: 4,
                fontWeight: 600,
                '&:hover:not(:disabled)': {
                  background: 'linear-gradient(135deg, #ffd89b 0%, #e8b86d 100%)',
                },
                '&:disabled': {
                  opacity: 0.5,
                },
              }}
            >
              {loading ? 'Wird erstellt...' : 'Teilen'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

