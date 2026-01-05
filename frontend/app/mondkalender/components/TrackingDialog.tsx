import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Slider, 
  Typography, 
  Box, 
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput
} from '@mui/material';
import { MoonPhase } from '../moonApi';

interface TrackingDialogProps {
  open: boolean;
  onClose: () => void;
  trackingForm: {
    mood: number;
    energy: number;
    notes: string;
    rituals_completed: string[];
  };
  setTrackingForm: React.Dispatch<React.SetStateAction<{
    mood: number;
    energy: number;
    notes: string;
    rituals_completed: string[];
  }>>;
  onSubmit: () => void;
  currentPhase: MoonPhase | null;
}

const availableRituals = [
  'Meditation',
  'Mondwasser trinken',
  'Kristall aufladen',
  'Intentionen setzen',
  'Dankbarkeit praktizieren',
  'Reflexion',
  'Energiearbeit',
  'Ritual-Bad',
  'Mondlicht-Spaziergang',
  'Journaling',
  'Visualisierung',
  'Atemübungen'
];

export default function TrackingDialog({ 
  open, 
  onClose, 
  trackingForm, 
  setTrackingForm, 
  onSubmit,
  currentPhase 
}: TrackingDialogProps) {
  const [newRitual, setNewRitual] = useState('');

  const handleAddRitual = () => {
    if (newRitual && !trackingForm.rituals_completed.includes(newRitual)) {
      setTrackingForm(prev => ({
        ...prev,
        rituals_completed: [...prev.rituals_completed, newRitual]
      }));
      setNewRitual('');
    }
  };

  const handleRemoveRitual = (ritual: string) => {
    setTrackingForm(prev => ({
      ...prev,
      rituals_completed: prev.rituals_completed.filter(r => r !== ritual)
    }));
  };

  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
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
        borderBottom: '1px solid rgba(254,243,199,0.2)'
      }}>
        Moon-Tracking für heute
        {currentPhase && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
            <Typography sx={{ color: 'rgba(254,243,199,0.8)', mr: 1 }}>
              {currentPhase.icon} {currentPhase.name}
            </Typography>
          </Box>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2 }}>
            Wie fühlst du dich heute? (1-10)
          </Typography>
          <Box sx={{ px: 2 }}>
            <Typography sx={{ color: 'rgba(254,243,199,0.8)', mb: 1 }}>
              Stimmung: {trackingForm.mood}/10
            </Typography>
            <Slider
              value={trackingForm.mood}
              onChange={(_, value) => setTrackingForm(prev => ({ ...prev, mood: value as number }))}
              min={1}
              max={10}
              step={1}
              marks
              sx={{
                '& .MuiSlider-track': {
                  backgroundColor: '#fef3c7'
                },
                '& .MuiSlider-thumb': {
                  backgroundColor: '#fef3c7',
                  '&:hover': {
                    backgroundColor: '#fde68a'
                  }
                },
                '& .MuiSlider-mark': {
                  backgroundColor: 'rgba(254,243,199,0.5)'
                },
                '& .MuiSlider-markLabel': {
                  color: 'rgba(254,243,199,0.8)'
                }
              }}
            />
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2 }}>
            Wie ist deine Energie? (1-10)
          </Typography>
          <Box sx={{ px: 2 }}>
            <Typography sx={{ color: 'rgba(254,243,199,0.8)', mb: 1 }}>
              Energie: {trackingForm.energy}/10
            </Typography>
            <Slider
              value={trackingForm.energy}
              onChange={(_, value) => setTrackingForm(prev => ({ ...prev, energy: value as number }))}
              min={1}
              max={10}
              step={1}
              marks
              sx={{
                '& .MuiSlider-track': {
                  backgroundColor: '#fef3c7'
                },
                '& .MuiSlider-thumb': {
                  backgroundColor: '#fef3c7',
                  '&:hover': {
                    backgroundColor: '#fde68a'
                  }
                },
                '& .MuiSlider-mark': {
                  backgroundColor: 'rgba(254,243,199,0.5)'
                },
                '& .MuiSlider-markLabel': {
                  color: 'rgba(254,243,199,0.8)'
                }
              }}
            />
          </Box>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2 }}>
            Notizen (optional)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={trackingForm.notes}
            onChange={(e) => setTrackingForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Wie war dein Tag? Was hast du bemerkt?"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#fef3c7',
                '& fieldset': {
                  borderColor: 'rgba(254,243,199,0.3)'
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(254,243,199,0.5)'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#fef3c7'
                }
              },
              '& .MuiInputBase-input': {
                color: '#fef3c7',
                '&::placeholder': {
                  color: 'rgba(254,243,199,0.6)',
                  opacity: 1
                }
              }
            }}
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ color: '#fef3c7', mb: 2 }}>
            Rituale durchgeführt
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {trackingForm.rituals_completed.map((ritual, index) => (
              <Chip
                key={index}
                label={ritual}
                onDelete={() => handleRemoveRitual(ritual)}
                sx={{
                  background: 'rgba(254,243,199,0.2)',
                  color: '#fef3c7',
                  border: '1px solid rgba(254,243,199,0.3)',
                  '& .MuiChip-deleteIcon': {
                    color: 'rgba(254,243,199,0.8)',
                    '&:hover': {
                      color: '#fef3c7'
                    }
                  }
                }}
              />
            ))}
          </Box>

          <FormControl fullWidth>
            <InputLabel sx={{ color: 'rgba(254,243,199,0.8)' }}>
              Ritual hinzufügen
            </InputLabel>
            <Select
              value={newRitual}
              onChange={(e) => setNewRitual(e.target.value)}
              input={<OutlinedInput label="Ritual hinzufügen" />}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: '#fef3c7',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(254,243,199,0.3)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(254,243,199,0.5)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#fef3c7'
                },
                '& .MuiSelect-icon': {
                  color: 'rgba(254,243,199,0.8)'
                }
              }}
            >
              {availableRituals.map((ritual) => (
                <MenuItem 
                  key={ritual} 
                  value={ritual}
                  sx={{
                    color: '#1f2937',
                    '&:hover': {
                      backgroundColor: 'rgba(254,243,199,0.2)'
                    }
                  }}
                >
                  {ritual}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button
            onClick={handleAddRitual}
            disabled={!newRitual}
            sx={{
              mt: 1,
              color: '#fef3c7',
              borderColor: 'rgba(254,243,199,0.3)',
              '&:hover': {
                borderColor: '#fef3c7',
                backgroundColor: 'rgba(254,243,199,0.1)'
              },
              '&:disabled': {
                color: 'rgba(254,243,199,0.3)',
                borderColor: 'rgba(254,243,199,0.1)'
              }
            }}
            variant="outlined"
          >
            Hinzufügen
          </Button>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 3, 
        borderTop: '1px solid rgba(254,243,199,0.2)',
        gap: 2
      }}>
        <Button 
          onClick={onClose}
          sx={{
            color: 'rgba(254,243,199,0.8)',
            '&:hover': {
              backgroundColor: 'rgba(254,243,199,0.1)'
            }
          }}
        >
          Abbrechen
        </Button>
        <Button 
          onClick={handleSubmit}
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
            }
          }}
        >
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
}
