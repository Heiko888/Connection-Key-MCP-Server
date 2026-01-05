"use client";

import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  IconButton, 
  Tooltip, 
  Menu, 
  MenuItem, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Download, 
  FileText, 
  Image, 
  FileImage, 
  Settings,
  Share2,
  Printer
} from 'lucide-react';
import Bodygraph from './Bodygraph';
import { DefinedState, BodygraphProps } from '@/lib/hd-bodygraph/types';
import { ChartData } from '@/lib/hd-bodygraph/chartService';
import { BodygraphExportService, ExportOptions } from '@/lib/hd-bodygraph/exportService';

interface EnhancedBodygraphProps extends BodygraphProps {
  chartData?: ChartData;
  showExportButtons?: boolean;
  showSettings?: boolean;
}

export default function EnhancedBodygraph({
  defined,
  chartData,
  showExportButtons = true,
  showSettings = true,
  ...bodygraphProps
}: EnhancedBodygraphProps) {
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'svg',
    width: 800,
    height: 1000,
    includeLabels: true,
    includeGateNumbers: true,
    includeMetadata: true
  });

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExport = async (format: 'svg' | 'png' | 'pdf') => {
    setExporting(true);
    setExportError(null);
    
    try {
      const options = { ...exportOptions, format };
      
      switch (format) {
        case 'svg':
          await BodygraphExportService.quickExportSVG(defined!, exportOptions.filename);
          break;
        case 'png':
          await BodygraphExportService.quickExportPNG(defined!, exportOptions.filename);
          break;
        case 'pdf':
          await BodygraphExportService.quickExportPDF(defined!, chartData, exportOptions.filename);
          break;
      }
    } catch (error) {
      setExportError(error instanceof Error ? error.message : 'Export fehlgeschlagen');
    } finally {
      setExporting(false);
      handleExportClose();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const pngBlob = await BodygraphExportService.exportPNG(defined!);
        const file = new File([pngBlob], 'bodygraph.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'Human Design Bodygraph',
          text: 'Mein Human Design Bodygraph',
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        const svgString = await BodygraphExportService.exportSVG(defined!);
        await navigator.clipboard.writeText(svgString);
        alert('SVG wurde in die Zwischenablage kopiert!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Export Error Alert */}
      {exportError && (
        <Alert 
          severity="error" 
          onClose={() => setExportError(null)}
          sx={{ mb: 2 }}
        >
          {exportError}
        </Alert>
      )}

      {/* Export Buttons */}
      {showExportButtons && (
        <Box sx={{ 
          position: 'absolute', 
          top: 10, 
          right: 10, 
          zIndex: 10,
          display: 'flex',
          gap: 1,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 2,
          p: 1,
          backdropFilter: 'blur(10px)'
        }}>
          <Tooltip title="Export">
            <IconButton
              onClick={handleExportClick}
              disabled={exporting}
              size="small"
            >
              {exporting ? <CircularProgress size={20} /> : <Download size={20} />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Drucken">
            <IconButton onClick={handlePrint} size="small">
              <Printer size={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Teilen">
            <IconButton onClick={handleShare} size="small">
              <Share2 size={20} />
            </IconButton>
          </Tooltip>

          {showSettings && (
            <Tooltip title="Einstellungen">
              <IconButton 
                onClick={() => setSettingsOpen(true)} 
                size="small"
              >
                <Settings size={20} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      {/* Bodygraph */}
      <Bodygraph 
        defined={defined}
        {...bodygraphProps}
      />

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportClose}
      >
        <MenuItem onClick={() => handleExport('svg')}>
          <FileText size={16} style={{ marginRight: 8 }} />
          Als SVG exportieren
        </MenuItem>
        <MenuItem onClick={() => handleExport('png')}>
          <Image size={16} style={{ marginRight: 8 }} />
          Als PNG exportieren
        </MenuItem>
        <MenuItem onClick={() => handleExport('pdf')}>
          <FileImage size={16} style={{ marginRight: 8 }} />
          Als PDF exportieren
        </MenuItem>
      </Menu>

      {/* Settings Dialog */}
      <Dialog 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export-Einstellungen</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Abmessungen
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box>
                  <Typography variant="body2">Breite:</Typography>
                  <input
                    type="number"
                    value={exportOptions.width}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      width: parseInt(e.target.value) || 800 
                    }))}
                    style={{ width: 80, padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
                  />
                </Box>
                <Box>
                  <Typography variant="body2">Höhe:</Typography>
                  <input
                    type="number"
                    value={exportOptions.height}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      height: parseInt(e.target.value) || 1000 
                    }))}
                    style={{ width: 80, padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
                  />
                </Box>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Inhalt
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={exportOptions.includeLabels}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      includeLabels: e.target.checked 
                    }))}
                  />
                  {' '}Zentren-Labels anzeigen
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={exportOptions.includeGateNumbers}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      includeGateNumbers: e.target.checked 
                    }))}
                  />
                  {' '}Gate-Nummern anzeigen
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={exportOptions.includeMetadata}
                    onChange={(e) => setExportOptions(prev => ({ 
                      ...prev, 
                      includeMetadata: e.target.checked 
                    }))}
                  />
                  {' '}Metadaten hinzufügen
                </label>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Dateiname
              </Typography>
              <input
                type="text"
                value={exportOptions.filename || ''}
                onChange={(e) => setExportOptions(prev => ({ 
                  ...prev, 
                  filename: e.target.value 
                }))}
                placeholder="bodygraph-export"
                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>
            Schließen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
