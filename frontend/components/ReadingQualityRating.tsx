'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Slider,
  TextField,
  Button,
  Alert,
  Tooltip,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

interface ReadingQualityRatingProps {
  readingId: string;
  versionId?: string;
  promptId?: string;
  promptVersion?: string;
  onSaved?: () => void;
}

export default function ReadingQualityRating({
  readingId,
  versionId,
  promptId,
  promptVersion,
  onSaved,
}: ReadingQualityRatingProps) {
  const [scoreClarity, setScoreClarity] = useState<number>(3);
  const [scoreStructure, setScoreStructure] = useState<number>(3);
  const [scoreDepth, setScoreDepth] = useState<number>(3);
  const [scoreRelevance, setScoreRelevance] = useState<number>(3);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const calculateOverall = () => {
    return Math.round((scoreClarity * 0.3 + scoreStructure * 0.2 + scoreDepth * 0.25 + scoreRelevance * 0.25) * 100) / 100;
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/coach/readings-v2/${readingId}/quality`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          versionId,
          promptId,
          promptVersion,
          scoreClarity,
          scoreStructure,
          scoreDepth,
          scoreRelevance,
          feedbackText: feedbackText.trim() || null,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Fehler beim Speichern der Bewertung');
      }

      setSuccess(true);
      // Reset form
      setScoreClarity(3);
      setScoreStructure(3);
      setScoreDepth(3);
      setScoreRelevance(3);
      setFeedbackText('');

      if (onSaved) {
        onSaved();
      }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Speichern der Bewertung');
    } finally {
      setLoading(false);
    }
  };

  const ScoreSlider = ({
    label,
    value,
    onChange,
    tooltip,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    tooltip: string;
  }) => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 500, mr: 1 }}>
          {label}
        </Typography>
        <Tooltip title={tooltip} arrow>
          <InfoIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: 18, cursor: 'help' }} />
        </Tooltip>
        <Typography variant="body2" sx={{ color: '#e8b86d', ml: 'auto', fontWeight: 600 }}>
          {value}/5
        </Typography>
      </Box>
      <Slider
        value={value}
        onChange={(_, newValue) => onChange(newValue as number)}
        min={1}
        max={5}
        step={1}
        marks
        sx={{
          color: '#e8b86d',
          '& .MuiSlider-thumb': {
            '&:hover': {
              boxShadow: '0 0 0 8px rgba(232, 184, 109, 0.16)',
            },
          },
          '& .MuiSlider-mark': {
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          },
          '& .MuiSlider-markLabel': {
            color: 'rgba(255, 255, 255, 0.7)',
          },
        }}
      />
    </Box>
  );

  return (
    <Card
      sx={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        mb: 4,
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          sx={{
            color: '#ffffff',
            fontWeight: 600,
            mb: 3,
          }}
        >
          Reading bewerten
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Bewertung erfolgreich gespeichert!
          </Alert>
        )}

        <ScoreSlider
          label="Klarheit"
          value={scoreClarity}
          onChange={setScoreClarity}
          tooltip="Verständlichkeit für Laien. Ist das Reading klar und nachvollziehbar?"
        />

        <ScoreSlider
          label="Struktur"
          value={scoreStructure}
          onChange={setScoreStructure}
          tooltip="Logischer Aufbau. Ist das Reading gut strukturiert und nachvollziehbar?"
        />

        <ScoreSlider
          label="Tiefe"
          value={scoreDepth}
          onChange={setScoreDepth}
          tooltip="Substanz statt Floskeln. Enthält das Reading echte Erkenntnisse?"
        />

        <ScoreSlider
          label="Relevanz"
          value={scoreRelevance}
          onChange={setScoreRelevance}
          tooltip="Passung zum ReadingType. Entspricht das Reading dem erwarteten Inhalt?"
        />

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 3 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
            Gesamt-Score: <strong style={{ color: '#e8b86d' }}>{calculateOverall()}/5</strong>
          </Typography>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Optionales Feedback"
          placeholder="Was war gut? Was fehlte? Was könnte verbessert werden?"
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
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
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: '#e8b86d',
              },
            },
          }}
        />

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          fullWidth
          sx={{
            background: 'linear-gradient(135deg, #e8b86d 0%, #ffd89b 100%)',
            color: '#000',
            py: 1.5,
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
          {loading ? 'Wird gespeichert...' : 'Bewertung speichern'}
        </Button>
      </CardContent>
    </Card>
  );
}

