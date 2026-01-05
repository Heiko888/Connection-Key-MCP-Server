"use client";

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { Calculator, CheckCircle } from 'lucide-react';

interface ChartCalculationWidgetProps {
  onChartCalculated?: (chartData: any) => void;
}

export default function ChartCalculationWidget({ onChartCalculated }: ChartCalculationWidgetProps) {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [latitude, setLatitude] = useState('52.52');
  const [longitude, setLongitude] = useState('13.405');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleCalculate = async () => {
    if (!birthDate || !birthTime) {
      setError('Bitte Geburtsdatum und Zeit eingeben');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/charts/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthDate,
          birthTime,
          birthPlace: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            timezone: 'Europe/Berlin'
          }
        })
      });

      if (!response.ok) {
        const { parseErrorResponse } = await import('@/lib/utils/refactorErrorTextPattern');
        const errorMessage = await parseErrorResponse(response, 'Berechnung fehlgeschlagen');
        setError(errorMessage);
        return;
      }

      const data = await response.json();

      if (data.success) {
        setResult(data.chart);
        if (onChartCalculated) {
          onChartCalculated(data.chart);
        }
      } else {
        setError(data.error || 'Berechnung fehlgeschlagen');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler bei der Chart-Berechnung';
      setError(errorMessage);
      console.error('Chart calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: 4,
      p: 4
    }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Calculator size={32} color="#8B5CF6" />
        <Box>
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
            Chart Berechnung
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            ✨ Mit echten astronomischen Daten (astronomy-engine)
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {result && (
        <Alert 
          severity="success" 
          icon={<CheckCircle />}
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Chart erfolgreich berechnet!
          </Typography>
          <Typography variant="body2">
            Typ: <strong>{result.type}</strong> | 
            Profil: <strong>{result.profile}</strong> | 
            Autorität: <strong>{result.authority}</strong>
          </Typography>
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        <TextField
          label="Geburtsdatum"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={{
            '& .MuiInputBase-root': {
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(255,255,255,0.2)'
            },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }
          }}
        />

        <TextField
          label="Geburtszeit (24h Format)"
          type="time"
          value={birthTime}
          onChange={(e) => setBirthTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          sx={{
            '& .MuiInputBase-root': {
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(255,255,255,0.2)'
            },
            '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }
          }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Breitengrad"
            type="number"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            fullWidth
            helperText="z.B. 52.52 für Berlin"
            sx={{
              '& .MuiInputBase-root': {
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(255,255,255,0.2)'
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.5)' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }
            }}
          />
          <TextField
            label="Längengrad"
            type="number"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            fullWidth
            helperText="z.B. 13.405 für Berlin"
            sx={{
              '& .MuiInputBase-root': {
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(255,255,255,0.2)'
              },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiFormHelperText-root': { color: 'rgba(255,255,255,0.5)' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' }
            }}
          />
        </Box>
      </Box>

      <Button
        variant="contained"
        fullWidth
        onClick={handleCalculate}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : <Calculator size={20} />}
        sx={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #667eea 100%)',
          color: 'white',
          py: 1.5,
          fontWeight: 'bold',
          '&:hover': {
            background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
          },
          '&:disabled': {
            background: 'rgba(139, 92, 246, 0.3)',
            color: 'rgba(255,255,255,0.5)'
          }
        }}
      >
        {loading ? 'Berechne Chart...' : 'Chart berechnen'}
      </Button>

      {result && (
        <Box sx={{ mt: 3, p: 3, backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: 2 }}>
          <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
            📊 Chart Details:
          </Typography>
          
          <Box sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', lineHeight: 1.8 }}>
            <Box sx={{ mb: 1 }}>
              <strong>Typ:</strong> {result.type}
            </Box>
            <Box sx={{ mb: 1 }}>
              <strong>Profil:</strong> {result.profile}
            </Box>
            <Box sx={{ mb: 1 }}>
              <strong>Autorität:</strong> {result.authority}
            </Box>
            <Box sx={{ mb: 1 }}>
              <strong>Strategie:</strong> {result.strategy}
            </Box>
            
            {result.definedCenters && result.definedCenters.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <strong>Definierte Zentren ({result.definedCenters.length}):</strong>
                <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {result.definedCenters.map((center: string) => (
                    <Box 
                      key={center}
                      sx={{ 
                        px: 1.5, 
                        py: 0.5, 
                        backgroundColor: 'rgba(139, 92, 246, 0.3)', 
                        borderRadius: 1,
                        fontSize: '0.85rem'
                      }}
                    >
                      {center}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {result.personality && (
              <Box sx={{ mt: 2 }}>
                <strong>Persönlichkeits-Sonne:</strong> Tor {result.personality.sun.gate}.{result.personality.sun.line}
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Paper>
  );
}

