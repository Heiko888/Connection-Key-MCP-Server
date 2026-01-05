import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Paper, Alert, Chip } from '@mui/material';
import { User, Heart, Target, Zap, Star } from 'lucide-react';

interface HumanDesignDialogProps {
  open: boolean;
  onClose: () => void;
  hdForm: {
    hd_type: string;
    birth_date: string;
    birth_time: string;
    birth_location: string;
  };
  setHdForm: React.Dispatch<React.SetStateAction<{
    hd_type: string;
    birth_date: string;
    birth_time: string;
    birth_location: string;
  }>>;
  onSubmit: () => void;
}

const hdTypes = [
  {
    value: 'Manifesting Generator',
    label: 'Manifesting Generator',
    icon: '⚡',
    description: 'Energie + Manifestation',
    color: '#f59e0b',
    details: 'Kombiniert die Energie eines Generators mit der Initiative eines Manifestors. Du bist am besten, wenn du auf deine innere Autorität hörst und dann handelst.'
  },
  {
    value: 'Generator',
    label: 'Generator',
    icon: '🔋',
    description: 'Sakrale Energie',
    color: '#10b981',
    details: 'Du bist hier, um zu arbeiten und zu erschaffen. Deine Sakrale Energie ist dein Kraftwerk. Warte auf die richtige Frage, bevor du handelst.'
  },
  {
    value: 'Manifestor',
    label: 'Manifestor',
    icon: '🚀',
    description: 'Initiative Energie',
    color: '#ef4444',
    details: 'Du bist hier, um zu initiieren und andere zu informieren. Du hast die Kraft, Dinge in Bewegung zu setzen. Informiere andere über deine Pläne.'
  },
  {
    value: 'Projector',
    label: 'Projector',
    icon: '👁️',
    description: 'Fokussierte Energie',
    color: '#8b5cf6',
    details: 'Du bist hier, um andere zu führen und zu beraten. Du siehst, was andere nicht sehen. Warte auf Einladungen, bevor du deine Weisheit teilst.'
  },
  {
    value: 'Reflector',
    label: 'Reflector',
    icon: '🌙',
    description: 'Lunare Energie',
    color: '#06b6d4',
    details: 'Du bist ein Spiegel der Gesellschaft. Du reflektierst die Energie deiner Umgebung. Nimm dir Zeit für Entscheidungen und folge dem Mondzyklus.'
  }
];

export default function HumanDesignDialog({ open, onClose, hdForm, setHdForm, onSubmit }: HumanDesignDialogProps) {
  const [selectedHdType, setSelectedHdType] = useState<string>(hdForm.hd_type || 'Generator');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedHdType(hdForm.hd_type || 'Generator');
      setIsSubmitting(false);
    }
  }, [open, hdForm.hd_type]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      setHdForm(prev => ({ ...prev, hd_type: selectedHdType }));
      await onSubmit();
      onClose();
    } catch (error) {
      console.error('Fehler beim Speichern des HD-Typs:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const getHdTypeColor = (hdType: string) => {
    const type = hdTypes.find(t => t.value === hdType);
    return type?.color || '#718096';
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
          <User size={24} color="#fef3c7" />
          <Typography variant="h6">
            Human Design Typ auswählen
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Heart size={20} />
            Wähle deinen Human Design Typ
          </Typography>
          <Typography sx={{
            color: 'rgba(254,243,199,0.8)',
            mb: 3,
            lineHeight: 1.6
          }}>
            Dein Human Design Typ bestimmt, wie du am besten mit der Welt interagierst und welche Mondphasen für dich optimal sind.
          </Typography>
        </Box>

        {/* HD Type Selection */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
            {hdTypes.map((hdType) => (
              <Paper
                key={hdType.value}
                onClick={() => setSelectedHdType(hdType.value)}
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  background: selectedHdType === hdType.value 
                    ? `linear-gradient(135deg, ${hdType.color}20 0%, ${hdType.color}10 100%)`
                    : 'rgba(255,255,255,0.05)',
                  border: selectedHdType === hdType.value 
                    ? `2px solid ${hdType.color}`
                    : '1px solid rgba(254,243,199,0.1)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${hdType.color}15 0%, ${hdType.color}05 100%)`,
                    borderColor: hdType.color,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>
                    {hdType.icon}
                  </Typography>
                  <Typography sx={{
                    color: selectedHdType === hdType.value ? hdType.color : '#fef3c7',
                    fontWeight: selectedHdType === hdType.value ? 700 : 600,
                    fontSize: '1rem',
                    mb: 0.5
                  }}>
                    {hdType.label}
                  </Typography>
                  <Typography sx={{
                    color: 'rgba(254,243,199,0.7)',
                    fontSize: '0.9rem',
                    mb: 2
                  }}>
                    {hdType.description}
                  </Typography>
                </Box>
                
                <Typography sx={{
                  color: 'rgba(254,243,199,0.8)',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  textAlign: 'left'
                }}>
                  {hdType.details}
                </Typography>

                {selectedHdType === hdType.value && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Chip
                      label="Ausgewählt"
                      icon={<Star size={16} />}
                      sx={{
                        background: 'rgba(34,197,94,0.2)',
                        color: '#86efac',
                        border: '1px solid rgba(34,197,94,0.3)',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        </Box>

        {/* Selected Type Info */}
        {selectedHdType && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Target size={20} />
              Dein ausgewählter Typ
            </Typography>
            <Paper sx={{
              p: 3,
              background: `linear-gradient(135deg, ${getHdTypeColor(selectedHdType)}15 0%, ${getHdTypeColor(selectedHdType)}05 100%)`,
              border: `1px solid ${getHdTypeColor(selectedHdType)}`,
              borderRadius: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography sx={{ fontSize: '2rem' }}>
                  {hdTypes.find(t => t.value === selectedHdType)?.icon}
                </Typography>
                <Box>
                  <Typography sx={{
                    color: getHdTypeColor(selectedHdType),
                    fontWeight: 700,
                    fontSize: '1.2rem'
                  }}>
                    {selectedHdType}
                  </Typography>
                  <Typography sx={{
                    color: 'rgba(254,243,199,0.7)',
                    fontSize: '0.9rem'
                  }}>
                    {hdTypes.find(t => t.value === selectedHdType)?.description}
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{
                color: 'rgba(254,243,199,0.8)',
                lineHeight: 1.6
              }}>
                {hdTypes.find(t => t.value === selectedHdType)?.details}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Info Alert */}
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
            <strong>Human Design + Mondphasen:</strong> Dein HD-Typ wird verwendet, um personalisierte Empfehlungen für optimale Mondphasen und Rituale zu generieren. 
            Du kannst deinen Typ jederzeit ändern.
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
          {isSubmitting ? 'Speichere...' : 'HD-Typ speichern'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
