"use client";

import React, { useState, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Paper,
  Chip,
  Menu,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Fade,
  Zoom
} from '@mui/material';
import {
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  Eye,
  EyeOff,
  Filter,
  Star,
  Settings,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Bodygraph from './Bodygraph';
import { DefinedState, CenterId, GateId } from '@/lib/hd-bodygraph/types';
import { CENTERS, CHANNELS, GATES } from '@/lib/hd-bodygraph/data';
import { getGateDescription } from '@/lib/human-design/gate-descriptions';

interface PremiumBodygraphSectionProps {
  defined: DefinedState;
  chartData?: any;
  userName?: string;
}

interface HoveredElement {
  type: 'center' | 'channel' | 'gate';
  id: string | number;
  info: any;
  x: number;
  y: number;
}

export default function PremiumBodygraphSection({
  defined,
  chartData,
  userName
}: PremiumBodygraphSectionProps) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [expertMode, setExpertMode] = useState(false);
  const [showDefinedOnly, setShowDefinedOnly] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<HoveredElement | null>(null);
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState<null | HTMLElement>(null);
  const [shareMenuAnchor, setShareMenuAnchor] = useState<null | HTMLElement>(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const bodygraphRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(200, prev + 10));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(50, prev - 10));
  const handleZoomChange = (_: Event, value: number | number[]) => {
    setZoomLevel(value as number);
  };

  const handleDownload = async (format: 'png' | 'pdf' | 'svg') => {
    if (!bodygraphRef.current) return;
    
    setDownloadMenuAnchor(null);
    
    try {
      if (format === 'png') {
        // PNG Export Logic
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // Implementation für PNG Export
      } else if (format === 'pdf') {
        // PDF Export Logic
      } else if (format === 'svg') {
        // SVG Export Logic
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const handleShare = async (platform: 'link' | 'whatsapp' | 'instagram') => {
    setShareMenuAnchor(null);
    
    if (platform === 'link') {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } else if (platform === 'whatsapp') {
      const text = encodeURIComponent(`Schau dir mein Human Design Chart an: ${window.location.href}`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    } else if (platform === 'instagram') {
      // Instagram Share Logic
    }
  };

  const handleElementHover = useCallback((type: 'center' | 'channel' | 'gate', id: string | number, info: any) => {
    // Get mouse position for tooltip placement
    const handleMouseMove = (event: MouseEvent) => {
      const rect = bodygraphRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      setHoveredElement({
        type,
        id,
        info,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      });
    };
    
    // Add temporary mouse move listener
    window.addEventListener('mousemove', handleMouseMove);
    
    // Cleanup after a short delay
    setTimeout(() => {
      window.removeEventListener('mousemove', handleMouseMove);
    }, 100);
  }, []);

  const handleElementLeave = useCallback(() => {
    setHoveredElement(null);
  }, []);

  const getElementInfo = (type: 'center' | 'channel' | 'gate', id: string | number) => {
    if (type === 'center') {
      const center = CENTERS.find(c => c.id === id as CenterId);
      return {
        title: center?.label || `Center ${id}`,
        description: center?.label ? `${center.label} Zentrum` : '',
        gates: center?.gates || []
      };
    } else if (type === 'channel') {
      const channel = CHANNELS.find(c => c.a === Number(id) || c.b === Number(id));
      return {
        title: channel?.id || `Channel ${id}`,
        description: channel ? `Kanal ${channel.id}` : ''
      };
    } else if (type === 'gate') {
      const gate = GATES.find(g => g.id === Number(id));
      const gateDesc = gate ? getGateDescription(gate.id) : null;
      return {
        title: gate?.label || `Gate ${id}`,
        description: gateDesc?.description || (gate?.label ? `${gate.label} Tor` : '')
      };
    }
    return null;
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h2"
          sx={{
            background: 'linear-gradient(135deg, #F29F05, #FFD700)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 800,
            mb: 1,
            fontSize: { xs: '2rem', md: '3rem' }
          }}
        >
          Deine energetische Landkarte ✨
        </Typography>
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontWeight: 300,
            fontStyle: 'italic',
            mt: 1
          }}
        >
          Sie zeigt dir nicht, wer du sein sollst –<br />
          sondern wo du bereits ganz bist.
        </Typography>
      </Box>

      {/* Premium Bodygraph Container mit Glow-Frame */}
      <Box
        ref={bodygraphRef}
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, rgba(11, 10, 15, 0.95) 0%, rgba(26, 26, 26, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          borderRadius: 4,
          border: '1px solid rgba(242, 159, 5, 0.3)',
          boxShadow: `
            0 0 60px rgba(242, 159, 5, 0.2),
            0 8px 32px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
          p: { xs: 2, md: 4 },
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -2,
            left: -2,
            right: -2,
            bottom: -2,
            background: 'radial-gradient(circle at 50% 50%, rgba(242, 159, 5, 0.15) 0%, transparent 70%)',
            borderRadius: 4,
            zIndex: -1,
            animation: 'pulseGlow 4s ease-in-out infinite',
            '@keyframes pulseGlow': {
              '0%, 100%': { opacity: 0.3 },
              '50%': { opacity: 0.6 }
            }
          }
        }}
      >
        {/* Aura-Feld im Hintergrund */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '120%',
            height: '120%',
            background: 'radial-gradient(circle, rgba(242, 159, 5, 0.08) 0%, transparent 60%)',
            borderRadius: '50%',
            zIndex: 0,
            pointerEvents: 'none',
            animation: 'auraPulse 6s ease-in-out infinite',
            '@keyframes auraPulse': {
              '0%, 100%': { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.3 },
              '50%': { transform: 'translate(-50%, -50%) scale(1.1)', opacity: 0.5 }
            }
          }}
        />

        {/* Bodygraph mit Zoom */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: { xs: 500, md: 700 },
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'center',
            transition: 'transform 0.3s ease'
          }}
        >
          <Bodygraph
            defined={defined}
            width={600}
            height={800}
            showLabels={!expertMode}
            showGateNumbers={!expertMode}
            onElementHover={(type, id, info) => {
              // Get current mouse position for tooltip
              const updateTooltipPosition = (event: MouseEvent) => {
                const rect = bodygraphRef.current?.getBoundingClientRect();
                if (rect) {
                  setHoveredElement({
                    type: type as 'center' | 'channel' | 'gate',
                    id: typeof id === 'string' ? (isNaN(Number(id)) ? id : Number(id)) : id,
                    info: info || {},
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top
                  });
                }
              };
              
              // Add one-time listener to get position
              const listener = (event: MouseEvent) => {
                updateTooltipPosition(event);
                window.removeEventListener('mousemove', listener);
              };
              window.addEventListener('mousemove', listener);
            }}
            onElementLeave={handleElementLeave}
            showDefinedOnly={showDefinedOnly}
            showChannels={true}
          />
        </Box>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoveredElement && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                left: Math.min(hoveredElement.x + 20, (bodygraphRef.current?.offsetWidth || 800) - 280),
                top: Math.max(10, Math.min(hoveredElement.y - 10, (bodygraphRef.current?.offsetHeight || 600) - 200)),
                zIndex: 1000,
                pointerEvents: 'none'
              }}
            >
              <Paper
                sx={{
                  background: 'rgba(11, 10, 15, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(242, 159, 5, 0.5)',
                  borderRadius: 2,
                  p: 2,
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(242, 159, 5, 0.3)',
                  maxWidth: 250
                }}
              >
                {(() => {
                  const info = getElementInfo(hoveredElement.type, hoveredElement.id);
                  if (!info) return null;
                  
                  return (
                    <>
                      <Typography variant="subtitle2" sx={{ color: '#F29F05', fontWeight: 700, mb: 0.5 }}>
                        {info.title}
                      </Typography>
                      {hoveredElement.type === 'center' && (
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', display: 'block', mb: 1 }}>
                          {defined.centers?.[hoveredElement.id as CenterId] ? 'Definiert' : 'Undefiniert'}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '0.85rem' }}>
                        {info.description}
                      </Typography>
                      {hoveredElement.type === 'center' && info.gates && info.gates.length > 0 && (
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {info.gates.map((gate: number) => (
                            <Chip
                              key={gate}
                              label={`Tor ${gate}`}
                              size="small"
                              sx={{
                                background: 'rgba(242, 159, 5, 0.2)',
                                color: '#F29F05',
                                border: '1px solid rgba(242, 159, 5, 0.3)',
                                fontSize: '0.7rem',
                                height: 20
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </>
                  );
                })()}
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>

      {/* Controls Bar */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'center',
          alignItems: 'center',
          mt: 4,
          pt: 3,
          borderTop: '1px solid rgba(242, 159, 5, 0.2)'
        }}
      >
        {/* Zoom Control */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            p: 1.5,
            border: '1px solid rgba(242, 159, 5, 0.2)'
          }}
        >
          <IconButton
            size="small"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 50}
            sx={{
              color: '#F29F05',
              '&:hover': { background: 'rgba(242, 159, 5, 0.1)' },
              '&:disabled': { color: 'rgba(255, 255, 255, 0.3)' }
            }}
          >
            <ZoomOut size={18} />
          </IconButton>
          <Slider
            value={zoomLevel}
            onChange={handleZoomChange}
            min={50}
            max={200}
            step={10}
            sx={{
              width: 120,
              color: '#F29F05',
              '& .MuiSlider-thumb': {
                boxShadow: '0 0 10px rgba(242, 159, 5, 0.5)'
              }
            }}
          />
          <IconButton
            size="small"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 200}
            sx={{
              color: '#F29F05',
              '&:hover': { background: 'rgba(242, 159, 5, 0.1)' },
              '&:disabled': { color: 'rgba(255, 255, 255, 0.3)' }
            }}
          >
            <ZoomIn size={18} />
          </IconButton>
          <Typography variant="body2" sx={{ color: 'white', minWidth: 45, textAlign: 'center', fontWeight: 600 }}>
            {zoomLevel}%
          </Typography>
        </Box>

        {/* Download Button */}
        <Button
          variant="outlined"
          startIcon={<Download size={18} />}
          onClick={(e) => setDownloadMenuAnchor(e.currentTarget)}
          sx={{
            color: '#F29F05',
            borderColor: 'rgba(242, 159, 5, 0.5)',
            background: 'rgba(242, 159, 5, 0.05)',
            '&:hover': {
              borderColor: '#F29F05',
              background: 'rgba(242, 159, 5, 0.15)'
            }
          }}
        >
          Download
        </Button>
        <Menu
          anchorEl={downloadMenuAnchor}
          open={Boolean(downloadMenuAnchor)}
          onClose={() => setDownloadMenuAnchor(null)}
          PaperProps={{
            sx: {
              background: 'rgba(11, 10, 15, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.3)'
            }
          }}
        >
          <MenuItem onClick={() => handleDownload('png')} sx={{ color: 'white' }}>
            Als PNG speichern
          </MenuItem>
          <MenuItem onClick={() => handleDownload('pdf')} sx={{ color: 'white' }}>
            Als PDF speichern
          </MenuItem>
          <MenuItem onClick={() => handleDownload('svg')} sx={{ color: 'white' }}>
            Als SVG speichern
          </MenuItem>
        </Menu>

        {/* Share Button */}
        <Button
          variant="outlined"
          startIcon={linkCopied ? <Check size={18} /> : <Share2 size={18} />}
          onClick={(e) => setShareMenuAnchor(e.currentTarget)}
          sx={{
            color: '#F29F05',
            borderColor: 'rgba(242, 159, 5, 0.5)',
            background: 'rgba(242, 159, 5, 0.05)',
            '&:hover': {
              borderColor: '#F29F05',
              background: 'rgba(242, 159, 5, 0.15)'
            }
          }}
        >
          {linkCopied ? 'Link kopiert!' : 'Teilen'}
        </Button>
        <Menu
          anchorEl={shareMenuAnchor}
          open={Boolean(shareMenuAnchor)}
          onClose={() => setShareMenuAnchor(null)}
          PaperProps={{
            sx: {
              background: 'rgba(11, 10, 15, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.3)'
            }
          }}
        >
          <MenuItem onClick={() => handleShare('link')} sx={{ color: 'white' }}>
            <Copy size={16} style={{ marginRight: 8 }} />
            Link kopieren
          </MenuItem>
          <MenuItem onClick={() => handleShare('whatsapp')} sx={{ color: 'white' }}>
            WhatsApp
          </MenuItem>
          <MenuItem onClick={() => handleShare('instagram')} sx={{ color: 'white' }}>
            Instagram
          </MenuItem>
        </Menu>

        {/* Modus Toggle */}
        <FormControlLabel
          control={
            <Switch
              checked={expertMode}
              onChange={(e) => setExpertMode(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#F29F05'
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#F29F05'
                }
              }}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Star size={16} />
              <Typography variant="body2" sx={{ color: 'white' }}>
                {expertMode ? 'Expert Mode' : 'Beginner Mode'}
              </Typography>
            </Box>
          }
          sx={{ ml: 2 }}
        />

        {/* Filter Button */}
        <IconButton
          onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
          sx={{
            color: '#F29F05',
            border: '1px solid rgba(242, 159, 5, 0.3)',
            '&:hover': { background: 'rgba(242, 159, 5, 0.1)' }
          }}
        >
          <Filter size={18} />
        </IconButton>
        <Menu
          anchorEl={filterMenuAnchor}
          open={Boolean(filterMenuAnchor)}
          onClose={() => setFilterMenuAnchor(null)}
          PaperProps={{
            sx: {
              background: 'rgba(11, 10, 15, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(242, 159, 5, 0.3)'
            }
          }}
        >
          <MenuItem
            onClick={() => {
              setShowDefinedOnly(!showDefinedOnly);
              setFilterMenuAnchor(null);
            }}
            sx={{ color: 'white' }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={showDefinedOnly}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#F29F05'
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#F29F05'
                    }
                  }}
                />
              }
              label="Nur definierte Kanäle"
              sx={{ m: 0 }}
            />
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}

