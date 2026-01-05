'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';

interface WizardData {
  mode: 'single' | 'connection' | 'penta' | null;
  singleData?: any;
  connectionData?: any;
  pentaData?: any;
  selectedSections?: string[];
  formatData?: any;
  additionalText?: string;
  agentConfig?: any;
}

interface ReadingGeneratorProps {
  wizardData: WizardData;
  mode: string;
  readingId?: string | null;
}

export default function ReadingGenerator({
  wizardData,
  mode,
  readingId,
}: ReadingGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState<string>('');

  const handleGenerate = async () => {
    if (!mode || !wizardData) {
      setError('Bitte fülle alle erforderlichen Felder aus.');
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(false);
    setProgress('Reading wird vorbereitet...');

    try {
      // Transformiere Daten in API-Format
      let readingType: string;
      let clientName: string;
      let readingData: any;

      if (mode === 'single') {
        readingType = 'single';
        clientName = wizardData.singleData?.person?.name || 'Klient';
        readingData = {
          person: {
            name: wizardData.singleData?.person?.name || '',
            relation: wizardData.singleData?.person?.relation || '',
            geburtsdatum: wizardData.singleData?.person?.birthDate || '',
            geburtszeit: wizardData.singleData?.person?.birthTime || '',
            geburtsort: wizardData.singleData?.person?.birthPlace || '',
          },
          focus: wizardData.singleData?.focus || '',
          context: wizardData.singleData?.context || '',
        };
      } else if (mode === 'connection') {
        readingType = 'connection';
        clientName = wizardData.connectionData?.personA?.name || 'Klient';
        readingData = {
          personA: {
            name: wizardData.connectionData?.personA?.name || '',
            relation: wizardData.connectionData?.personA?.relation || '',
            geburtsdatum: wizardData.connectionData?.personA?.birthDate || '',
            geburtszeit: wizardData.connectionData?.personA?.birthTime || '',
            geburtsort: wizardData.connectionData?.personA?.birthPlace || '',
          },
          personB: {
            name: wizardData.connectionData?.personB?.name || '',
            relation: wizardData.connectionData?.personB?.relation || '',
            geburtsdatum: wizardData.connectionData?.personB?.birthDate || '',
            geburtszeit: wizardData.connectionData?.personB?.birthTime || '',
            geburtsort: wizardData.connectionData?.personB?.birthPlace || '',
          },
          focus: wizardData.connectionData?.focus || '',
          context: wizardData.connectionData?.context || '',
        };
      } else {
        // penta
        readingType = 'penta';
        clientName = wizardData.pentaData?.people?.[0]?.name || 'Gruppe';
        readingData = {
          group_size: wizardData.pentaData?.groupSize || 3,
          people: (wizardData.pentaData?.people || []).map((p: any) => ({
            name: p.name || '',
            rolle: p.relation || '',
            geburtsdatum: p.birthDate || '',
            geburtszeit: p.birthTime || '',
            geburtsort: p.birthPlace || '',
          })),
          focus: wizardData.pentaData?.focus || '',
          context: wizardData.pentaData?.context || '',
        };
      }

      // Füge Format- und Sektions-Daten hinzu
      readingData = {
        ...readingData,
        reading_title: wizardData.formatData?.title || '',
        format: wizardData.formatData?.format || 'standard',
        template: wizardData.formatData?.template || '',
        send_email: wizardData.formatData?.sendEmail || false,
        show_in_dashboard: wizardData.formatData?.showInDashboard || false,
        save_as_template: wizardData.formatData?.saveAsTemplate || false,
        enabled_sections: wizardData.selectedSections || [],
        additionalText: wizardData.additionalText || '',
        agentConfig: wizardData.agentConfig || {},
      };

      setProgress('Chart wird berechnet...');

      const url = readingId
        ? `/api/coach/readings/${readingId}`
        : '/api/coach/readings';
      const method = readingId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reading_type: readingType,
          client_name: clientName,
          reading_data: readingData,
        }),
      });

      setProgress('KI-Agent generiert Reading-Text...');

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || `Fehler beim ${readingId ? 'Aktualisieren' : 'Erstellen'} des Readings`
        );
      }

      setProgress('Reading erfolgreich generiert!');
      setSuccess(true);

      // Nach 2 Sekunden zur Reading-Detail-Seite weiterleiten
      setTimeout(() => {
        if (data.reading?.id) {
          window.location.href = `/coach/readings/${data.reading.id}`;
        } else if (readingId) {
          window.location.href = `/coach/readings/${readingId}`;
        }
      }, 2000);
    } catch (err: any) {
      console.error('Fehler beim Generieren:', err);
      setError(err.message || 'Fehler beim Generieren des Readings');
      setGenerating(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Card
        sx={{
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(242, 159, 5, 0.3)',
        }}
      >
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              sx={{
                color: '#F29F05',
                fontWeight: 600,
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              🤖 Reading-Generierung
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Starte die automatische Generierung des Reading-Textes durch den KI-Agenten.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              ✅ Reading erfolgreich generiert! Du wirst weitergeleitet...
            </Alert>
          )}

          {generating && progress && (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={20} sx={{ color: '#F29F05' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {progress}
              </Typography>
            </Box>
          )}

          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={generating || success || !mode}
            fullWidth
            sx={{
              background: 'linear-gradient(135deg, #F29F05 0%, #8C1D04 100%)',
              color: '#000',
              fontWeight: 600,
              py: 1.5,
              '&:hover': {
                background: 'linear-gradient(135deg, #8C1D04 0%, #F29F05 100%)',
              },
              '&.Mui-disabled': {
                opacity: 0.5,
              },
            }}
          >
            {generating
              ? 'Reading wird generiert...'
              : success
              ? 'Erfolgreich generiert!'
              : 'Reading jetzt generieren'}
          </Button>

          {wizardData.agentConfig && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label={`Tiefe: ${wizardData.agentConfig.readingDepth || 'detailed'}`}
                size="small"
                sx={{
                  background: 'rgba(242, 159, 5, 0.2)',
                  color: '#F29F05',
                  border: '1px solid rgba(242, 159, 5, 0.3)',
                }}
              />
              <Chip
                label={`Stil: ${wizardData.agentConfig.tone || 'warm'}`}
                size="small"
                sx={{
                  background: 'rgba(242, 159, 5, 0.2)',
                  color: '#F29F05',
                  border: '1px solid rgba(242, 159, 5, 0.3)',
                }}
              />
              <Chip
                label={`Länge: ${wizardData.agentConfig.length || 'medium'}`}
                size="small"
                sx={{
                  background: 'rgba(242, 159, 5, 0.2)',
                  color: '#F29F05',
                  border: '1px solid rgba(242, 159, 5, 0.3)',
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

