'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Collapse
} from '@mui/material';
import {
  Edit3,
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Palette,
  Settings
} from 'lucide-react';
import { DefinedState, CenterId, GateId } from '@/lib/hd-bodygraph/types';
import { ChartTheme, chartThemes } from '@/lib/hd-bodygraph/themes';

interface ChartEditorProps {
  defined: DefinedState;
  onDefinedChange: (defined: DefinedState) => void;
  theme: ChartTheme;
  onThemeChange: (theme: ChartTheme) => void;
  onSave?: () => void;
  onReset?: () => void;
}

// Alle 9 Zentren
const centers: { id: CenterId; name: string; description: string }[] = [
  { id: 'HEAD', name: 'Kopf', description: 'Inspiration und Druck' },
  { id: 'AJNA', name: 'Ajna', description: 'Konzeptualisierung und Gewissheit' },
  { id: 'THROAT', name: 'Kehle', description: 'Manifestation und Kommunikation' },
  { id: 'G', name: 'G-Zentrum', description: 'Identität und Richtung' },
  { id: 'HEART', name: 'Herz', description: 'Willenskraft und Ego' },
  { id: 'SACRAL', name: 'Sakral', description: 'Lebenskraft und Sexualität' },
  { id: 'SPLEEN', name: 'Milz', description: 'Intuition und Gesundheit' },
  { id: 'SOLAR', name: 'Solar Plexus', description: 'Emotionen und Bewusstsein' },
  { id: 'ROOT', name: 'Wurzel', description: 'Stress und Druck' }
];

// Wichtige Kanäle
const channels: { id: string; name: string; description: string }[] = [
  { id: '1-8', name: '1-8', description: 'Inspiration und Kreativität' },
  { id: '10-20', name: '10-20', description: 'Ganzheit und Selbstliebe' },
  { id: '20-34', name: '20-34', description: 'Ganzheit und Kraft' },
  { id: '34-57', name: '34-57', description: 'Kraft und Intuition' },
  { id: '11-56', name: '11-56', description: 'Neugier und Abenteuer' },
  { id: '2-14', name: '2-14', description: 'Höhere Selbst und Karma' },
  { id: '3-60', name: '3-60', description: 'Mutation und Innovation' },
  { id: '4-63', name: '4-63', description: 'Logik und Zweifel' },
  { id: '5-15', name: '5-15', description: 'Rhythmus und Demut' },
  { id: '6-59', name: '6-59', description: 'Intimität und Reproduktion' }
];

// Wichtige Gates
const gates: { id: GateId; name: string; description: string }[] = [
  { id: 1, name: 'Gate 1', description: 'Kreativität' },
  { id: 8, name: 'Gate 8', description: 'Beitrag' },
  { id: 10, name: 'Gate 10', description: 'Selbstliebe' },
  { id: 20, name: 'Gate 20', description: 'Gegenwart' },
  { id: 34, name: 'Gate 34', description: 'Kraft' },
  { id: 57, name: 'Gate 57', description: 'Intuition' },
  { id: 11, name: 'Gate 11', description: 'Frieden' },
  { id: 56, name: 'Gate 56', description: 'Stimulation' },
  { id: 2, name: 'Gate 2', description: 'Höheres Selbst' },
  { id: 14, name: 'Gate 14', description: 'Kraft' }
];

export default function ChartEditor({
  defined,
  onDefinedChange,
  theme,
  onThemeChange,
  onSave,
  onReset
}: ChartEditorProps) {
  const [expandedSections, setExpandedSections] = useState({
    centers: true,
    channels: true,
    gates: true,
    themes: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleCenter = (centerId: CenterId) => {
    const newDefined = {
      ...defined,
      centers: {
        ...defined.centers,
        [centerId]: !defined.centers?.[centerId]
      }
    };
    onDefinedChange(newDefined);
  };

  const toggleChannel = (channelId: string) => {
    const newDefined = {
      ...defined,
      channels: {
        ...defined.channels,
        [channelId]: !defined.channels?.[channelId]
      }
    };
    onDefinedChange(newDefined);
  };

  const toggleGate = (gateId: GateId) => {
    const newDefined = {
      ...defined,
      gates: {
        ...defined.gates,
        [gateId]: !defined.gates?.[gateId]
      }
    };
    onDefinedChange(newDefined);
  };

  const getActiveCount = (type: 'centers' | 'channels' | 'gates') => {
    const data = defined[type] || {};
    return Object.values(data).filter(Boolean).length;
  };

  return (
    <Card sx={{
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
    }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Edit3 size={20} color="white" />
            </Box>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              Chart-Bearbeitung
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Speichern">
              <IconButton
                onClick={onSave}
                sx={{
                  color: '#10B981',
                  '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.1)' }
                }}
              >
                <Save size={20} />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Zurücksetzen">
              <IconButton
                onClick={onReset}
                sx={{
                  color: '#F59E0B',
                  '&:hover': { backgroundColor: 'rgba(245, 158, 11, 0.1)' }
                }}
              >
                <RotateCcw size={20} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Zentren */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              p: 1,
              borderRadius: 2,
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
            }}
            onClick={() => toggleSection('centers')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                Zentren
              </Typography>
              <Chip
                label={`${getActiveCount('centers')}/9`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  color: '#8B5CF6',
                  fontWeight: 600
                }}
              />
            </Box>
            {expandedSections.centers ? <ChevronUp size={20} color="white" /> : <ChevronDown size={20} color="white" />}
          </Box>
          
          <Collapse in={expandedSections.centers}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {centers.map((center) => (
                <Grid item xs={12} sm={6} md={4} key={center.id}>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!defined.centers?.[center.id]}
                          onChange={() => toggleCenter(center.id)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#8B5CF6',
                              '& + .MuiSwitch-track': {
                                backgroundColor: '#8B5CF6'
                              }
                            }
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                            {center.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {center.description}
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Collapse>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />

        {/* Kanäle */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              p: 1,
              borderRadius: 2,
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
            }}
            onClick={() => toggleSection('channels')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                Kanäle
              </Typography>
              <Chip
                label={`${getActiveCount('channels')}/${channels.length}`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(236, 72, 153, 0.2)',
                  color: '#EC4899',
                  fontWeight: 600
                }}
              />
            </Box>
            {expandedSections.channels ? <ChevronUp size={20} color="white" /> : <ChevronDown size={20} color="white" />}
          </Box>
          
          <Collapse in={expandedSections.channels}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {channels.map((channel) => (
                <Grid item xs={12} sm={6} md={4} key={channel.id}>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!defined.channels?.[channel.id]}
                          onChange={() => toggleChannel(channel.id)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#EC4899',
                              '& + .MuiSwitch-track': {
                                backgroundColor: '#EC4899'
                              }
                            }
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                            {channel.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {channel.description}
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Collapse>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />

        {/* Gates */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              p: 1,
              borderRadius: 2,
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
            }}
            onClick={() => toggleSection('gates')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                Gates
              </Typography>
              <Chip
                label={`${getActiveCount('gates')}/${gates.length}`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  color: '#10B981',
                  fontWeight: 600
                }}
              />
            </Box>
            {expandedSections.gates ? <ChevronUp size={20} color="white" /> : <ChevronDown size={20} color="white" />}
          </Box>
          
          <Collapse in={expandedSections.gates}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {gates.map((gate) => (
                <Grid item xs={12} sm={6} md={4} key={gate.id}>
                  <Box sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={!!defined.gates?.[gate.id]}
                          onChange={() => toggleGate(gate.id)}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#10B981',
                              '& + .MuiSwitch-track': {
                                backgroundColor: '#10B981'
                              }
                            }
                          }}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                            {gate.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            {gate.description}
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Collapse>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />

        {/* Farbthemen */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              p: 1,
              borderRadius: 2,
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)' }
            }}
            onClick={() => toggleSection('themes')}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Palette size={20} color="white" />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                Farbthemen
              </Typography>
              <Chip
                label={theme.name}
                size="small"
                sx={{
                  backgroundColor: 'rgba(245, 158, 11, 0.2)',
                  color: '#F59E0B',
                  fontWeight: 600
                }}
              />
            </Box>
            {expandedSections.themes ? <ChevronUp size={20} color="white" /> : <ChevronDown size={20} color="white" />}
          </Box>
          
          <Collapse in={expandedSections.themes}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {chartThemes.map((themeOption) => (
                <Grid item xs={12} sm={6} md={4} key={themeOption.id}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: theme.id === themeOption.id ? '2px solid #8B5CF6' : '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                    onClick={() => onThemeChange(themeOption)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <Box sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: themeOption.colors.definedCenter,
                        border: `2px solid ${themeOption.colors.definedCenterBorder}`
                      }} />
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>
                        {themeOption.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                      {themeOption.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Collapse>
        </Box>
      </CardContent>
    </Card>
  );
}
