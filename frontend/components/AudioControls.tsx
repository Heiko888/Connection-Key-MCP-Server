'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Divider,
  Chip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Settings,
  Mic,
  MicOff,
  Volume1,
  Volume,
  Gauge,
  Zap
} from 'lucide-react';
import { useAudio, AudioConfig } from '../lib/audioService';

interface AudioControlsProps {
  onElementClick?: (element: any) => void;
  onElementHover?: (element: any) => void;
  chartData?: any;
}

export default function AudioControls({ onElementClick, onElementHover, chartData }: AudioControlsProps) {
  const { isEnabled, isPlaying, voices, toggleAudio, updateConfig, speak, stop, config } = useAudio();
  const [showSettings, setShowSettings] = useState(false);
  const [testPlaying, setTestPlaying] = useState(false);

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    updateConfig({ volume: newValue as number / 100 });
  };

  const handleRateChange = (event: Event, newValue: number | number[]) => {
    updateConfig({ rate: newValue as number / 10 });
  };

  const handlePitchChange = (event: Event, newValue: number | number[]) => {
    updateConfig({ pitch: newValue as number / 10 });
  };

  const handleVoiceChange = (event: any) => {
    updateConfig({ voice: event.target.value });
  };

  const handleTestAudio = async () => {
    setTestPlaying(true);
    try {
      await speak("Audio-System funktioniert korrekt. Du kannst jetzt die Human Design Chart-Beschreibungen hören.");
    } catch (error) {
      console.error('Audio-Fehler:', error);
    } finally {
      setTestPlaying(false);
    }
  };

  const handleChartOverview = async () => {
    if (chartData) {
      try {
        await speak(`
          Dein Human Design Chart zeigt, dass du ein ${chartData.hdType} mit dem Profil ${chartData.profile} bist. 
          Deine Autorität ist ${chartData.authority} und deine Strategie ist ${chartData.strategy}. 
          Du hast ${chartData.definedCenters?.length || 0} definierte Zentren, ${chartData.activeChannels?.length || 0} aktive Kanäle 
          und ${chartData.activeGates?.length || 0} aktive Tore. 
          Dieses Chart zeigt deine einzigartige energetische Konstitution und deine natürlichen Talente.
        `);
      } catch (error) {
        console.error('Audio-Fehler:', error);
      }
    }
  };

  const getVolumeIcon = () => {
    if (config.volume === 0) return <VolumeX size={20} />;
    if (config.volume < 0.3) return <Volume1 size={20} />;
    if (config.volume < 0.7) return <Volume2 size={20} />;
    return <Volume size={20} />;
  };

  const getRateIcon = () => {
    if (config.rate < 0.7) return <Gauge size={20} />;
    if (config.rate < 1.3) return <Zap size={20} />;
    return <Zap size={20} />;
  };

  return (
    <Box sx={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      zIndex: 1000,
      background: 'rgba(0,0,0,0.8)',
      borderRadius: 3,
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(254,243,199,0.2)',
      minWidth: '300px'
    }}>
      {/* Main Controls */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#fef3c7', display: 'flex', alignItems: 'center', gap: 1 }}>
            {isEnabled ? <Mic size={20} /> : <MicOff size={20} />}
            Audio-Kontrollen
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Einstellungen">
              <IconButton
                onClick={() => setShowSettings(!showSettings)}
                sx={{ color: '#fef3c7' }}
              >
                <Settings size={20} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isEnabled ? 'Audio deaktivieren' : 'Audio aktivieren'}>
              <IconButton
                onClick={toggleAudio}
                sx={{ color: isEnabled ? '#22c55e' : '#ef4444' }}
              >
                {isEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleTestAudio}
            disabled={!isEnabled || testPlaying}
            startIcon={testPlaying ? <Pause size={16} /> : <Play size={16} />}
            sx={{
              color: '#fef3c7',
              borderColor: 'rgba(254,243,199,0.3)',
              '&:hover': {
                borderColor: '#fef3c7',
                backgroundColor: 'rgba(254,243,199,0.1)'
              }
            }}
          >
            {testPlaying ? 'Test läuft...' : 'Test'}
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            onClick={handleChartOverview}
            disabled={!isEnabled || isPlaying || !chartData}
            startIcon={<Play size={16} />}
            sx={{
              color: '#fef3c7',
              borderColor: 'rgba(254,243,199,0.3)',
              '&:hover': {
                borderColor: '#fef3c7',
                backgroundColor: 'rgba(254,243,199,0.1)'
              }
            }}
          >
            Übersicht
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            onClick={stop}
            disabled={!isPlaying}
            startIcon={<Square size={16} />}
            sx={{
              color: '#fef3c7',
              borderColor: 'rgba(254,243,199,0.3)',
              '&:hover': {
                borderColor: '#fef3c7',
                backgroundColor: 'rgba(254,243,199,0.1)'
              }
            }}
          >
            Stop
          </Button>
        </Box>

        {/* Status */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            label={isEnabled ? 'Aktiviert' : 'Deaktiviert'}
            size="small"
            sx={{
              bgcolor: isEnabled ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
              color: isEnabled ? '#22c55e' : '#ef4444',
              border: `1px solid ${isEnabled ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`
            }}
          />
          
          {isPlaying && (
            <Chip
              label="Wiedergabe"
              size="small"
              sx={{
                bgcolor: 'rgba(59,130,246,0.2)',
                color: '#3b82f6',
                border: '1px solid rgba(59,130,246,0.3)'
              }}
            />
          )}
        </Box>
      </Box>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Divider sx={{ borderColor: 'rgba(254,243,199,0.2)' }} />
            
            <Box sx={{ p: 2 }}>
              {/* Volume Control */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#fef3c7', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getVolumeIcon()}
                  Lautstärke: {Math.round(config.volume * 100)}%
                </Typography>
                <Slider
                  value={config.volume * 100}
                  onChange={handleVolumeChange}
                  min={0}
                  max={100}
                  sx={{
                    color: '#8b5cf6',
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#8b5cf6',
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: '#8b5cf6',
                    },
                  }}
                />
              </Box>

              {/* Rate Control */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#fef3c7', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getRateIcon()}
                  Geschwindigkeit: {config.rate.toFixed(1)}x
                </Typography>
                <Slider
                  value={config.rate * 10}
                  onChange={handleRateChange}
                  min={5}
                  max={20}
                  step={1}
                  sx={{
                    color: '#8b5cf6',
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#8b5cf6',
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: '#8b5cf6',
                    },
                  }}
                />
              </Box>

              {/* Pitch Control */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ color: '#fef3c7', mb: 1 }}>
                  Tonhöhe: {config.pitch.toFixed(1)}
                </Typography>
                <Slider
                  value={config.pitch * 10}
                  onChange={handlePitchChange}
                  min={5}
                  max={20}
                  step={1}
                  sx={{
                    color: '#8b5cf6',
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#8b5cf6',
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: '#8b5cf6',
                    },
                  }}
                />
              </Box>

              {/* Voice Selection */}
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: 'rgba(254,243,199,0.7)' }}>Stimme</InputLabel>
                  <Select
                    value={config.voice}
                    onChange={handleVoiceChange}
                    label="Stimme"
                    sx={{
                      color: '#fef3c7',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(254,243,199,0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(254,243,199,0.5)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#fef3c7',
                      },
                    }}
                  >
                    {voices.map((voice) => (
                      <MenuItem key={voice.name} value={voice.name} sx={{ color: '#fef3c7' }}>
                        {voice.name} ({voice.lang})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Language Selection */}
              <Box sx={{ mb: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ color: 'rgba(254,243,199,0.7)' }}>Sprache</InputLabel>
                  <Select
                    value={config.language}
                    onChange={(e) => updateConfig({ language: e.target.value })}
                    label="Sprache"
                    sx={{
                      color: '#fef3c7',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(254,243,199,0.3)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(254,243,199,0.5)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#fef3c7',
                      },
                    }}
                  >
                    <MenuItem value="de-DE" sx={{ color: '#fef3c7' }}>Deutsch</MenuItem>
                    <MenuItem value="en-US" sx={{ color: '#fef3c7' }}>English</MenuItem>
                    <MenuItem value="fr-FR" sx={{ color: '#fef3c7' }}>Français</MenuItem>
                    <MenuItem value="es-ES" sx={{ color: '#fef3c7' }}>Español</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}
