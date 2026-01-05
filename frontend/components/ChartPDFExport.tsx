
import { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, Grid } from '@mui/material';
import { Download, FileText, Image, Settings, X } from 'lucide-react';

interface ChartData {
  type: string;
  profile: string;
  authority: string;
  strategy: string;
  centers: Record<string, { defined: boolean }>;
  gates: Array<{ id: number; active: boolean; center: string }>;
}

interface ChartPDFExportProps {
  open: boolean;
  onClose: () => void;
  chartData: ChartData;
  onExport: (options: ExportOptions) => void;
}

interface ExportOptions {
  includeChart: boolean;
  includeTransits: boolean;
  includePlanets: boolean;
  includeDetails: boolean;
  format: 'pdf' | 'png' | 'svg';
  quality: 'low' | 'medium' | 'high';
}

export default function ChartPDFExport({ open, onClose, chartData, onExport }: ChartPDFExportProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeChart: true,
    includeTransits: true,
    includePlanets: true,
    includeDetails: true,
    format: 'pdf',
    quality: 'high'
  });

  const handleExport = () => {
    onExport(exportOptions);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #0f0f23 0%, #533483 100%)',
        color: '#FFD700',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Download size={20} />
          Chart Export
        </Box>
        <Button onClick={onClose} sx={{ color: '#FFD700', minWidth: 'auto' }}>
          <X size={20} />
        </Button>
      </DialogTitle>
      
      <DialogContent sx={{ bgcolor: '#1a1a2e', color: 'white', pt: 3 }}>
        <Grid container spacing={3}>
          {/* Export Format */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Export Format
              </InputLabel>
              <Select
                value={exportOptions.format}
                onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'pdf' | 'png' | 'svg' }))}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FFD700'
                  }
                }}
              >
                <MenuItem value="pdf">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FileText size={16} />
                    PDF Dokument
                  </Box>
                </MenuItem>
                <MenuItem value="png">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Image size={16} />
                    PNG Bild
                  </Box>
                </MenuItem>
                <MenuItem value="svg">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Image size={16} />
                    SVG Vektor
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Quality */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Qualität
              </InputLabel>
              <Select
                value={exportOptions.quality}
                onChange={(e) => setExportOptions(prev => ({ ...prev, quality: e.target.value as 'low' | 'medium' | 'high' }))}
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(255,255,255,0.3)'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#FFD700'
                  }
                }}
              >
                <MenuItem value="low">Niedrig (schnell)</MenuItem>
                <MenuItem value="medium">Mittel (ausgewogen)</MenuItem>
                <MenuItem value="high">Hoch (beste Qualität)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Content Options */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ color: '#FFD700', mb: 2 }}>
              Inhalt einschließen:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportOptions.includeChart}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeChart: e.target.checked }))}
                      sx={{
                        color: '#FFD700',
                        '&.Mui-checked': { color: '#FFD700' }
                      }}
                    />
                  }
                  label="Human Design Chart"
                  sx={{ color: 'rgba(255,255,255,0.8)' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportOptions.includeTransits}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeTransits: e.target.checked }))}
                      sx={{
                        color: '#FFD700',
                        '&.Mui-checked': { color: '#FFD700' }
                      }}
                    />
                  }
                  label="Aktuelle Transits"
                  sx={{ color: 'rgba(255,255,255,0.8)' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportOptions.includePlanets}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includePlanets: e.target.checked }))}
                      sx={{
                        color: '#FFD700',
                        '&.Mui-checked': { color: '#FFD700' }
                      }}
                    />
                  }
                  label="Planeten-Positionen"
                  sx={{ color: 'rgba(255,255,255,0.8)' }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={exportOptions.includeDetails}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeDetails: e.target.checked }))}
                      sx={{
                        color: '#FFD700',
                        '&.Mui-checked': { color: '#FFD700' }
                      }}
                    />
                  }
                  label="Detaillierte Beschreibungen"
                  sx={{ color: 'rgba(255,255,255,0.8)' }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Preview */}
          <Grid item xs={12}>
            <Box sx={{
              bgcolor: 'rgba(255,255,255,0.05)',
              borderRadius: 2,
              p: 2,
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Typography variant="subtitle2" sx={{ color: '#FFD700', mb: 1 }}>
                Export Vorschau:
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {chartData?.type} - Profil {chartData?.profile} - {chartData?.authority}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                Format: {exportOptions.format.toUpperCase()} | Qualität: {exportOptions.quality}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ bgcolor: '#1a1a2e', p: 2 }}>
        <Button onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Abbrechen
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          startIcon={<Download />}
          sx={{
            bgcolor: '#FFD700',
            color: '#0f0f23',
            '&:hover': { bgcolor: '#FFA500' }
          }}
        >
          Export starten
        </Button>
      </DialogActions>
    </Dialog>
  );
}
