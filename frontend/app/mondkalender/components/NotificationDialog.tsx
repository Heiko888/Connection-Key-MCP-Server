import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, Typography, Box, Chip, Alert } from '@mui/material';
import { Bell, Calendar, MessageSquare } from 'lucide-react';
import { createMoonNotification } from '../moonApi';

interface NotificationDialogProps {
  open: boolean;
  onClose: () => void;
  notificationForm: {
    moon_phase: string;
    notification_type: 'full_moon' | 'new_moon' | 'quarter_moon' | 'custom';
    message: string;
    scheduled_date: string;
  };
  setNotificationForm: React.Dispatch<React.SetStateAction<{
    moon_phase: string;
    notification_type: 'full_moon' | 'new_moon' | 'quarter_moon' | 'custom';
    message: string;
    scheduled_date: string;
  }>>;
  onSubmit: () => void;
}

const moonPhases = [
  { value: 'Vollmond', label: 'Vollmond 🌕', description: 'Höhepunkt, Erleuchtung und Manifestation' },
  { value: 'Neumond', label: 'Neumond 🌑', description: 'Neuer Anfang, Intention setzen' },
  { value: 'Erstes Viertel', label: 'Erstes Viertel 🌓', description: 'Entscheidungen treffen und handeln' },
  { value: 'Letztes Viertel', label: 'Letztes Viertel 🌗', description: 'Loslassen und Vergebung' },
  { value: 'Zunehmender Sichelmond', label: 'Zunehmender Sichelmond 🌒', description: 'Wachstum und Entwicklung' },
  { value: 'Zunehmender Gibbous', label: 'Zunehmender Gibbous 🌔', description: 'Verfeinerung und Perfektionierung' },
  { value: 'Abnehmender Gibbous', label: 'Abnehmender Gibbous 🌖', description: 'Dankbarkeit und Weitergabe' },
  { value: 'Abnehmender Sichelmond', label: 'Abnehmender Sichelmond 🌘', description: 'Ruhe und Regeneration' }
];

const notificationTypes = [
  { value: 'full_moon', label: 'Vollmond', icon: '🌕', description: 'Benachrichtigung bei Vollmond' },
  { value: 'new_moon', label: 'Neumond', icon: '🌑', description: 'Benachrichtigung bei Neumond' },
  { value: 'quarter_moon', label: 'Viertelmond', icon: '🌓', description: 'Benachrichtigung bei Viertelmond' },
  { value: 'custom', label: 'Benutzerdefiniert', icon: '🔔', description: 'Benutzerdefinierte Benachrichtigung' }
];

export default function NotificationDialog({ open, onClose, notificationForm, setNotificationForm, onSubmit }: NotificationDialogProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setErrors({});
      setIsSubmitting(false);
    }
  }, [open]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!notificationForm.moon_phase) {
      newErrors.moon_phase = 'Bitte wähle eine Mondphase aus';
    }

    if (!notificationForm.message.trim()) {
      newErrors.message = 'Bitte gib eine Nachricht ein';
    }

    if (!notificationForm.scheduled_date) {
      newErrors.scheduled_date = 'Bitte wähle ein Datum aus';
    } else {
      const selectedDate = new Date(notificationForm.scheduled_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.scheduled_date = 'Das Datum darf nicht in der Vergangenheit liegen';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit();
      onClose();
    } catch (error) {
      console.error('Fehler beim Erstellen der Benachrichtigung:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const getDefaultMessage = (moonPhase: string, type: string) => {
    if (type === 'custom') return '';
    
    const phase = moonPhases.find(p => p.value === moonPhase);
    if (!phase) return '';

    switch (type) {
      case 'full_moon':
        return `Vollmond heute! ${phase.description}`;
      case 'new_moon':
        return `Neumond heute! ${phase.description}`;
      case 'quarter_moon':
        return `Viertelmond heute! ${phase.description}`;
      default:
        return `${phase.label} - ${phase.description}`;
    }
  };

  const handleMoonPhaseChange = (moonPhase: string) => {
    setNotificationForm(prev => ({
      ...prev,
      moon_phase: moonPhase,
      message: getDefaultMessage(moonPhase, prev.notification_type)
    }));
  };

  const handleTypeChange = (type: string) => {
    setNotificationForm(prev => ({
      ...prev,
      notification_type: type as 'full_moon' | 'new_moon' | 'quarter_moon' | 'custom',
      message: getDefaultMessage(prev.moon_phase, type)
    }));
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(135deg, rgba(102,126,234,0.95) 0%, rgba(118,75,162,0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(254,243,199,0.2)',
          borderRadius: 3
        }
      }}
    >
      <DialogTitle sx={{
        color: '#fef3c7',
        fontWeight: 700,
        textAlign: 'center',
        borderBottom: '1px solid rgba(254,243,199,0.2)',
        pb: 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Bell size={24} color="#fef3c7" />
          <Typography variant="h6">
            Moon-Benachrichtigung erstellen
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calendar size={20} />
            Benachrichtigungstyp
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: 'rgba(254,243,199,0.8)' }}>
              Typ der Benachrichtigung
            </InputLabel>
            <Select
              value={notificationForm.notification_type}
              onChange={(e) => handleTypeChange(e.target.value)}
              sx={{
                color: '#fef3c7',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(254,243,199,0.3)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(254,243,199,0.5)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#fef3c7'
                }
              }}
            >
              {notificationTypes.map((type) => (
                <MenuItem key={type.value} value={type.value} sx={{ color: '#1f2937' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '1.2rem' }}>{type.icon}</Typography>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{type.label}</Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: 'rgba(31,41,55,0.7)' }}>
                        {type.description}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            🌙 Mondphase
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: 'rgba(254,243,199,0.8)' }}>
              Wähle eine Mondphase
            </InputLabel>
            <Select
              value={notificationForm.moon_phase}
              onChange={(e) => handleMoonPhaseChange(e.target.value)}
              error={!!errors.moon_phase}
              sx={{
                color: '#fef3c7',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.moon_phase ? 'rgba(239,68,68,0.5)' : 'rgba(254,243,199,0.3)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.moon_phase ? 'rgba(239,68,68,0.7)' : 'rgba(254,243,199,0.5)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: errors.moon_phase ? '#ef4444' : '#fef3c7'
                }
              }}
            >
              {moonPhases.map((phase) => (
                <MenuItem key={phase.value} value={phase.value} sx={{ color: '#1f2937' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '1.2rem' }}>{phase.label.split(' ')[1]}</Typography>
                    <Box>
                      <Typography sx={{ fontWeight: 600 }}>{phase.label.split(' ')[0]}</Typography>
                      <Typography sx={{ fontSize: '0.8rem', color: 'rgba(31,41,55,0.7)' }}>
                        {phase.description}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {errors.moon_phase && (
            <Typography sx={{ color: '#fca5a5', fontSize: '0.8rem', mt: 0.5 }}>
              {errors.moon_phase}
            </Typography>
          )}
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calendar size={20} />
            Termin
          </Typography>
          <TextField
            type="datetime-local"
            value={notificationForm.scheduled_date}
            onChange={(e) => setNotificationForm(prev => ({ ...prev, scheduled_date: e.target.value }))}
            error={!!errors.scheduled_date}
            helperText={errors.scheduled_date}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fef3c7',
                '& fieldset': {
                  borderColor: errors.scheduled_date ? 'rgba(239,68,68,0.5)' : 'rgba(254,243,199,0.3)'
                },
                '&:hover fieldset': {
                  borderColor: errors.scheduled_date ? 'rgba(239,68,68,0.7)' : 'rgba(254,243,199,0.5)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: errors.scheduled_date ? '#ef4444' : '#fef3c7'
                }
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(254,243,199,0.8)'
              },
              '& .MuiFormHelperText-root': {
                color: '#fca5a5'
              }
            }}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <MessageSquare size={20} />
            Nachricht
          </Typography>
          <TextField
            multiline
            rows={3}
            value={notificationForm.message}
            onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
            error={!!errors.message}
            helperText={errors.message}
            placeholder="Deine Moon-Benachrichtigung..."
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#fef3c7',
                backgroundColor: 'rgba(255,255,255,0.1)',
                '& fieldset': {
                  borderColor: errors.message ? 'rgba(239,68,68,0.5)' : 'rgba(254,243,199,0.3)'
                },
                '&:hover fieldset': {
                  borderColor: errors.message ? 'rgba(239,68,68,0.7)' : 'rgba(254,243,199,0.5)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: errors.message ? '#ef4444' : '#fef3c7'
                }
              },
              '& .MuiInputLabel-root': {
                color: 'rgba(254,243,199,0.8)'
              },
              '& .MuiFormHelperText-root': {
                color: '#fca5a5'
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(254,243,199,0.5)',
                opacity: 1
              }
            }}
          />
        </Box>

        <Alert
          severity="info"
          sx={{
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.2)',
            color: '#93c5fd',
            '& .MuiAlert-icon': {
              color: '#93c5fd'
            }
          }}
        >
          <Typography sx={{ fontSize: '0.9rem' }}>
            <strong>Tipp:</strong> Die Benachrichtigung wird automatisch zur geplanten Zeit gesendet. 
            Du kannst mehrere Benachrichtigungen für verschiedene Mondphasen erstellen.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions sx={{
        p: 3,
        borderTop: '1px solid rgba(254,243,199,0.2)',
        gap: 2
      }}>
        <Button
          onClick={handleClose}
          disabled={isSubmitting}
          sx={{
            color: 'rgba(254,243,199,0.8)',
            '&:hover': {
              backgroundColor: 'rgba(254,243,199,0.1)'
            },
            '&:disabled': {
              color: 'rgba(254,243,199,0.3)'
            }
          }}
        >
          Abbrechen
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            color: '#1f2937',
            fontWeight: 700,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            '&:hover': {
              background: 'linear-gradient(135deg, #fde68a 0%, #fef3c7 100%)',
              transform: 'translateY(-1px)',
              boxShadow: '0 8px 25px rgba(254,243,199,0.3)'
            },
            '&:disabled': {
              background: 'rgba(254,243,199,0.3)',
              color: 'rgba(31,41,55,0.5)',
              transform: 'none',
              boxShadow: 'none'
            }
          }}
        >
          {isSubmitting ? 'Erstelle...' : 'Benachrichtigung erstellen'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
