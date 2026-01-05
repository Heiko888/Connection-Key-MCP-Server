"use client";

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Plus, 
  X, 
  Download, 
  Share2, 
  RotateCcw,
  Users,
  BarChart3,
  Eye,
  EyeOff
} from 'lucide-react';
import Bodygraph from './Bodygraph';
import { DefinedState } from '@/lib/hd-bodygraph/types';
import { ChartData, ChartService } from '@/lib/hd-bodygraph/chartService';
import { BodygraphExportService } from '@/lib/hd-bodygraph/exportService';

interface ComparisonChart {
  id: string;
  name: string;
  data: ChartData;
  defined: DefinedState;
  visible: boolean;
}

export default function BodygraphComparison() {
  const [charts, setCharts] = useState<ComparisonChart[]>([]);
  const [availableCharts, setAvailableCharts] = useState<ChartData[]>([]);
  const [addChartDialogOpen, setAddChartDialogOpen] = useState(false);
  const [selectedChartId, setSelectedChartId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'overlay'>('side-by-side');

  // Lade verfügbare Charts beim Mount
  useEffect(() => {
    loadAvailableCharts();
  }, []);

  const loadAvailableCharts = async () => {
    setLoading(true);
    try {
      const charts = ChartService.getDemoCharts();
      setAvailableCharts(charts);
    } catch (error) {
      setError('Fehler beim Laden der Charts');
    } finally {
      setLoading(false);
    }
  };

  const addChart = () => {
    if (!selectedChartId) return;

    const chartData = availableCharts.find(c => c.id === selectedChartId);
    if (!chartData) return;

    const newChart: ComparisonChart = {
      id: `comparison-${Date.now()}`,
      name: chartData.name,
      data: chartData,
      defined: chartData.defined,
      visible: true
    };

    setCharts(prev => [...prev, newChart]);
    setSelectedChartId('');
    setAddChartDialogOpen(false);
  };

  const removeChart = (chartId: string) => {
    setCharts(prev => prev.filter(c => c.id !== chartId));
  };

  const toggleChartVisibility = (chartId: string) => {
    setCharts(prev => prev.map(c => 
      c.id === chartId ? { ...c, visible: !c.visible } : c
    ));
  };

  const addDemoChart = (type: 'generator' | 'projector' | 'manifestor' | 'reflector') => {
    const demoData = ChartService.generateDemoChart(type);
    const newChart: ComparisonChart = {
      id: `demo-${type}-${Date.now()}`,
      name: `Demo ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      data: demoData,
      defined: demoData.defined,
      visible: true
    };

    setCharts(prev => [...prev, newChart]);
  };

  const exportComparison = async (format: 'svg' | 'png' | 'pdf') => {
    // Export logic for comparison view
    try {
      const visibleCharts = charts.filter(c => c.visible);
      if (visibleCharts.length === 0) return;

      if (visibleCharts.length === 1) {
        // Single chart export
        await BodygraphExportService.quickExportSVG(visibleCharts[0].defined);
      } else {
        // Multiple charts export - create combined view
        // This would require more complex logic to combine multiple bodygraphs
        alert('Multi-Chart Export wird noch implementiert');
      }
    } catch (error) {
      setError('Export fehlgeschlagen');
    }
  };

  const resetComparison = () => {
    setCharts([]);
  };

  const getComparisonStats = () => {
    const visibleCharts = charts.filter(c => c.visible);
    if (visibleCharts.length < 2) return null;

    const stats = {
      commonCenters: [] as string[],
      commonChannels: [] as string[],
      commonGates: [] as number[],
      uniqueCenters: [] as string[],
      uniqueChannels: [] as string[],
      uniqueGates: [] as number[]
    };

    // Find common elements
    const allCenters = visibleCharts.map(c => 
      Object.keys(c.defined.centers || {}).filter(center => c.defined.centers![center as keyof typeof c.defined.centers])
    );
    const allChannels = visibleCharts.map(c => 
      Object.keys(c.defined.channels || {}).filter(channel => c.defined.channels![channel])
    );
    const allGates = visibleCharts.map(c => 
      Object.keys(c.defined.gates || {}).filter(gate => c.defined.gates![parseInt(gate)])
    );

    // Find intersections
    if (allCenters.length > 0) {
      stats.commonCenters = allCenters.reduce((acc, centers) => 
        acc.filter(center => centers.includes(center))
      );
    }

    if (allChannels.length > 0) {
      stats.commonChannels = allChannels.reduce((acc, channels) => 
        acc.filter(channel => channels.includes(channel))
      );
    }

    if (allGates.length > 0) {
      stats.commonGates = allGates.reduce((acc, gates) => 
        acc.filter(gate => gates.includes(gate))
      ).map(gate => parseInt(gate));
    }

    return stats;
  };

  const stats = getComparisonStats();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#1a1a2e', fontWeight: 800 }}>
          🧬 Bodygraph Vergleich
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Plus size={16} />}
            onClick={() => setAddChartDialogOpen(true)}
            disabled={loading}
          >
            Chart hinzufügen
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<RotateCcw size={16} />}
            onClick={resetComparison}
            disabled={charts.length === 0}
          >
            Zurücksetzen
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Comparison Stats */}
      {stats && (
        <Card sx={{ mb: 3, bgcolor: 'rgba(83, 52, 131, 0.05)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: '#533483' }}>
              <BarChart3 size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Vergleichsstatistiken
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Gemeinsame Zentren ({stats.commonCenters.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {stats.commonCenters.map(center => (
                    <Chip key={center} label={center} size="small" color="primary" />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Gemeinsame Kanäle ({stats.commonChannels.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {stats.commonChannels.map(channel => (
                    <Chip key={channel} label={channel} size="small" color="secondary" />
                  ))}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" gutterBottom>
                  Gemeinsame Gates ({stats.commonGates.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {stats.commonGates.map(gate => (
                    <Chip key={gate} label={`Gate ${gate}`} size="small" color="success" />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      {charts.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <Users size={64} style={{ color: '#6c757d', marginBottom: 16 }} />
            <Typography variant="h6" sx={{ color: '#6c757d', mb: 2 }}>
              Keine Charts zum Vergleichen
            </Typography>
            <Typography variant="body2" sx={{ color: '#6c757d', mb: 3 }}>
              Füge Charts hinzu, um sie zu vergleichen
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={() => addDemoChart('generator')}
              >
                Demo Generator
              </Button>
              <Button
                variant="outlined"
                onClick={() => addDemoChart('projector')}
              >
                Demo Projector
              </Button>
              <Button
                variant="outlined"
                onClick={() => addDemoChart('manifestor')}
              >
                Demo Manifestor
              </Button>
              <Button
                variant="outlined"
                onClick={() => addDemoChart('reflector')}
              >
                Demo Reflector
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {charts.map((chart) => (
            <Grid item xs={12} md={charts.length === 1 ? 12 : 6} key={chart.id}>
              <Card sx={{ 
                opacity: chart.visible ? 1 : 0.5,
                transition: 'opacity 0.3s ease'
              }}>
                <CardContent>
                  {/* Chart Header */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2 
                  }}>
                    <Typography variant="h6" sx={{ color: '#1a1a2e' }}>
                      {chart.name}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => toggleChartVisibility(chart.id)}
                      >
                        {chart.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </IconButton>
                      
                      <IconButton
                        size="small"
                        onClick={() => removeChart(chart.id)}
                        color="error"
                      >
                        <X size={16} />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Chart Info */}
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={chart.data.type} 
                      size="small" 
                      color="primary" 
                      sx={{ mr: 1 }} 
                    />
                    <Chip 
                      label={chart.data.profile} 
                      size="small" 
                      color="secondary" 
                      sx={{ mr: 1 }} 
                    />
                    <Chip 
                      label={chart.data.authority} 
                      size="small" 
                      color="success" 
                    />
                  </Box>

                  {/* Bodygraph */}
                  {chart.visible && (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Bodygraph 
                        defined={chart.defined}
                        width={400}
                        height={500}
                        showLabels={true}
                        showGateNumbers={true}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Chart Dialog */}
      <Dialog 
        open={addChartDialogOpen} 
        onClose={() => setAddChartDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Chart hinzufügen</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Verfügbare Charts</InputLabel>
            <Select
              value={selectedChartId}
              onChange={(e) => setSelectedChartId(e.target.value)}
              label="Verfügbare Charts"
            >
              {availableCharts.map((chart) => (
                <MenuItem key={chart.id} value={chart.id}>
                  {chart.name} ({chart.type})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {availableCharts.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Keine Charts verfügbar. Erstelle zuerst Charts in der Chart-Seite.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddChartDialogOpen(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={addChart} 
            variant="contained"
            disabled={!selectedChartId}
          >
            Hinzufügen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
