
import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Paper, Chip, Grid, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Zap, Star, Target, Eye, Crown, HelpCircle, Palette, Share2 } from 'lucide-react';
import { useAudio } from '@/lib/audioService';
import { useTheme } from '@/lib/themeService';
// import { getCurrentTransits, getCurrentTransitsWithGates } from '@/lib/planetsData';
import { getGateData } from '@/lib/gatesData';
// const AnimatedMoon = dynamic(() => import('@/components/AnimatedMoon'), { ssr: false });
const GateDetailsModal = dynamic(() => import('@/components/GateDetailsModal'), { ssr: false });
const PlanetTransitModal = dynamic(() => import('@/components/PlanetTransitModal'), { ssr: false });
const HDChart3D = dynamic(() => import('@/components/HDChart3D'), { ssr: false });
// Komponenten werden lazy geladen um SSR-Probleme zu vermeiden
import dynamic from 'next/dynamic';

// PlanetData Interface definieren
interface LocalPlanetData {
  name: string;
  currentPosition: number;
  currentGate: string;
  color: string;
  size?: number;
  symbol?: string;
  isRetrograde?: boolean;
  [key: string]: unknown;
}

const AudioControls = dynamic(() => import('@/components/AudioControls'), { ssr: false });
const ThemeSelector = dynamic(() => import('@/components/ThemeSelector'), { ssr: false });
const ChartSharingModal = dynamic(() => import('@/components/ChartSharingModal'), { ssr: false });
// planetsData wird lazy geladen um SSR-Probleme zu vermeiden
// Services werden jetzt über Hooks verwaltet (SSR-sicher)

interface HumanDesignChartProps {
  hdType: string;
  profile: string;
  authority: string;
  strategy: string;
  centers: {
    [key: string]: {
      defined: boolean;
      color: string;
      gates: string[];
      description: string;
    };
  };
  channels: {
    [key: string]: {
      active: boolean;
      from: string;
      to: string;
      description: string;
      color: string;
    };
  };
  gates: {
    [key: string]: {
      active: boolean;
      center: string;
      description: string;
      color: string;
    };
  };
  planets: {
    [key: string]: {
      name: string;
      symbol: string;
      position: number;
      gate: string;
      line: number;
      color: string;
      description: string;
    };
  };
  onElementClick?: (element: { type: string; id: string; data?: Record<string, unknown> }) => void;
  showAudioControls?: boolean;
}

const centers = {
  head: { x: 50, y: 10, name: 'Kopf', color: '#fbbf24', description: 'Inspiration & Fragen' },
  ajna: { x: 50, y: 25, name: 'Ajna', color: '#8b5cf6', description: 'Denken & Konzepte' },
  throat: { x: 50, y: 40, name: 'Kehle', color: '#06b6d4', description: 'Sprechen & Handeln' },
  g: { x: 50, y: 55, name: 'G-Zentrum', color: '#10b981', description: 'Identität & Liebe' },
  heart: { x: 50, y: 70, name: 'Herz', color: '#ef4444', description: 'Willenskraft & Ego' },
  spleen: { x: 30, y: 55, name: 'Milz', color: '#f59e0b', description: 'Intuition & Angst' },
  sacral: { x: 70, y: 55, name: 'Sakral', color: '#ec4899', description: 'Lebenskraft & Sexualität' },
  solar: { x: 50, y: 75, name: 'Solar Plexus', color: '#FFEAA7', description: 'Emotionen & Sensibilität' },
  root: { x: 50, y: 85, name: 'Wurzel', color: '#7c3aed', description: 'Stress & Druck' }
};

// Alle 36 Kanäle des Human Design Systems
const channels = [
  // Kopf-Zentrum Kanäle
  { id: '1-8', from: 'head', to: 'throat', color: '#fbbf24', description: 'Inspiration & Expression' },
  { id: '2-14', from: 'ajna', to: 'g', color: '#8b5cf6', description: 'The Higher Mind & Direction' },
  { id: '4-63', from: 'ajna', to: 'head', color: '#8b5cf6', description: 'Mental Pressure & Doubt' },
  { id: '11-56', from: 'ajna', to: 'throat', color: '#8b5cf6', description: 'Curiosity & Discovery' },
  { id: '17-62', from: 'ajna', to: 'throat', color: '#8b5cf6', description: 'Acceptance & Organization' },
  { id: '24-61', from: 'ajna', to: 'head', color: '#8b5cf6', description: 'Awareness & Mystery' },
  { id: '47-64', from: 'ajna', to: 'head', color: '#8b5cf6', description: 'Abstraction & Confusion' },
  
  // Ajna-Zentrum Kanäle
  { id: '3-60', from: 'sacral', to: 'root', color: '#ec4899', description: 'Mutation & Innovation' },
  { id: '5-15', from: 'g', to: 'throat', color: '#10b981', description: 'Rhythm & Timing' },
  { id: '9-52', from: 'sacral', to: 'root', color: '#ec4899', description: 'Focus & Concentration' },
  { id: '16-48', from: 'throat', to: 'spleen', color: '#06b6d4', description: 'The Wave Length & Depth' },
  { id: '20-34', from: 'throat', to: 'sacral', color: '#06b6d4', description: 'Charisma & Exploration' },
  { id: '23-43', from: 'throat', to: 'ajna', color: '#06b6d4', description: 'Structuring & Individuality' },
  { id: '35-36', from: 'throat', to: 'spleen', color: '#06b6d4', description: 'Transitoriness & Crisis' },
  
  // Kehlkopf-Zentrum Kanäle
  { id: '6-59', from: 'sacral', to: 'heart', color: '#ec4899', description: 'Intimacy & Reproduction' },
  { id: '7-31', from: 'throat', to: 'g', color: '#06b6d4', description: 'Leadership & Recognition' },
  { id: '10-20', from: 'g', to: 'throat', color: '#10b981', description: 'Self-Expression & Awakening' },
  { id: '12-22', from: 'throat', to: 'heart', color: '#06b6d4', description: 'Openness & Social Being' },
  { id: '13-33', from: 'g', to: 'throat', color: '#10b981', description: 'The Witness & Proving' },
  { id: '21-45', from: 'heart', to: 'throat', color: '#ef4444', description: 'Money & Materialism' },
  
  // G-Zentrum Kanäle
  { id: '18-58', from: 'spleen', to: 'root', color: '#f59e0b', description: 'Judgment & Correction' },
  { id: '19-49', from: 'spleen', to: 'heart', color: '#f59e0b', description: 'Synthesis & Sensitivity' },
  { id: '25-51', from: 'heart', to: 'g', color: '#ef4444', description: 'Initiation & Shock' },
  { id: '26-44', from: 'spleen', to: 'heart', color: '#f59e0b', description: 'Surrender & Transference' },
  { id: '37-40', from: 'heart', to: 'g', color: '#ef4444', description: 'Community & Aloneness' },
  { id: '57-10', from: 'spleen', to: 'g', color: '#f59e0b', description: 'Perfected Form & Self-Expression' },
  
  // Herz-Zentrum Kanäle
  { id: '27-50', from: 'spleen', to: 'sacral', color: '#f59e0b', description: 'Preservation & Nurturing' },
  { id: '28-38', from: 'spleen', to: 'root', color: '#f59e0b', description: 'Struggle & Purpose' },
  { id: '29-46', from: 'spleen', to: 'heart', color: '#f59e0b', description: 'Discovery & Success' },
  { id: '30-41', from: 'root', to: 'sacral', color: '#7c3aed', description: 'Recognition & Fantasy' },
  { id: '32-54', from: 'spleen', to: 'root', color: '#f59e0b', description: 'Transformation & Ambition' },
  { id: '39-55', from: 'root', to: 'spleen', color: '#7c3aed', description: 'Emotion & Spirit' },
  
  // Milz-Zentrum Kanäle
  { id: '42-53', from: 'root', to: 'spleen', color: '#7c3aed', description: 'Maturation & Development' },
  
  // Sakral-Zentrum Kanäle (bereits oben definiert)
  
  // Solar Plexus Kanäle
  { id: '14-2', from: 'g', to: 'ajna', color: '#10b981', description: 'The Higher Mind & Direction' },
  { id: '15-5', from: 'throat', to: 'g', color: '#10b981', description: 'Rhythm & Timing' },
  { id: '22-12', from: 'heart', to: 'throat', color: '#ef4444', description: 'Openness & Social Being' },
  { id: '33-13', from: 'throat', to: 'g', color: '#10b981', description: 'The Witness & Proving' },
  { id: '45-21', from: 'throat', to: 'heart', color: '#ef4444', description: 'Money & Materialism' },
  { id: '51-25', from: 'g', to: 'heart', color: '#ef4444', description: 'Initiation & Shock' },
  
  // Wurzel-Zentrum Kanäle
  { id: '38-28', from: 'root', to: 'spleen', color: '#7c3aed', description: 'Struggle & Purpose' },
  { id: '40-37', from: 'g', to: 'heart', color: '#ef4444', description: 'Community & Aloneness' },
  { id: '44-26', from: 'heart', to: 'spleen', color: '#ef4444', description: 'Surrender & Transference' },
  { id: '46-29', from: 'heart', to: 'spleen', color: '#ef4444', description: 'Discovery & Success' },
  { id: '48-16', from: 'spleen', to: 'throat', color: '#f59e0b', description: 'The Wave Length & Depth' },
  { id: '50-27', from: 'sacral', to: 'spleen', color: '#ec4899', description: 'Preservation & Nurturing' },
  { id: '52-9', from: 'root', to: 'sacral', color: '#7c3aed', description: 'Focus & Concentration' },
  { id: '53-42', from: 'spleen', to: 'root', color: '#f59e0b', description: 'Maturation & Development' },
  { id: '54-32', from: 'root', to: 'spleen', color: '#7c3aed', description: 'Transformation & Ambition' },
  { id: '55-39', from: 'spleen', to: 'root', color: '#f59e0b', description: 'Emotion & Spirit' },
  { id: '58-18', from: 'root', to: 'spleen', color: '#7c3aed', description: 'Judgment & Correction' },
  { id: '59-6', from: 'heart', to: 'sacral', color: '#ef4444', description: 'Intimacy & Reproduction' },
  { id: '60-3', from: 'root', to: 'sacral', color: '#7c3aed', description: 'Mutation & Innovation' },
  { id: '61-24', from: 'head', to: 'ajna', color: '#fbbf24', description: 'Awareness & Mystery' },
  { id: '62-17', from: 'throat', to: 'ajna', color: '#06b6d4', description: 'Acceptance & Organization' },
  { id: '63-4', from: 'head', to: 'ajna', color: '#fbbf24', description: 'Mental Pressure & Doubt' },
  { id: '64-47', from: 'head', to: 'ajna', color: '#fbbf24', description: 'Abstraction & Confusion' }
];

const planetSymbols = {
  sun: '☉',
  earth: '⊕',
  moon: '☽',
  northNode: '☊',
  southNode: '☋',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇'
};

function HumanDesignChart({ 
  hdType, 
  profile, 
  authority, 
  strategy,
  centers: centerData, 
  channels: channelData, 
  gates: gateData,
  planets: planetData,
  onElementClick,
  showAudioControls = false
}: HumanDesignChartProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [activeChannels, setActiveChannels] = useState<string[]>([]);
  const [definedCenters, setDefinedCenters] = useState<string[]>([]);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [showGateDetails, setShowGateDetails] = useState(false);
  const [selectedGateId, setSelectedGateId] = useState<string>('');
  const [showPlanetDetails, setShowPlanetDetails] = useState(false);
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>('');
  const [is3DMode, setIs3DMode] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showSharingModal, setShowSharingModal] = useState(false);
  
  // Theme Hook (lazy initialisiert) - wird jetzt über useTheme Hook verwaltet

  // Services werden jetzt über Hooks verwaltet (SSR-sicher)
  const [planetsData, setPlanetsData] = useState<Record<string, LocalPlanetData> | null>(null);
  
  // Audio und Theme Hooks
  const audioService = useAudio();
  const themeService = useTheme();

  // planetsData lazy laden
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('@/lib/planetsData').then(module => {
        setPlanetsData(module.planetsData as unknown as Record<string, LocalPlanetData>);
      });
    }
  }, []);

  useEffect(() => {
    if (!centerData || !channelData) return;
    
    const activeChannelsList = Object.keys(channelData).filter(id => channelData[id].active);
    const definedCentersList = Object.keys(centerData).filter(center => centerData[center].defined);
    
    setActiveChannels(activeChannelsList);
    setDefinedCenters(definedCentersList);
  }, [channelData, centerData]);

  // Sicherheitscheck für Daten
  if (!centerData || !channelData || !gateData || !planetData) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        p: 8,
        minHeight: 400,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 2,
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Typography sx={{ color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
          ⚠️ Keine Chart-Daten verfügbar
        </Typography>
      </Box>
    );
  }

  const getChannelPath = (from: string, to: string) => {
    const fromCenter = centers[from as keyof typeof centers];
    const toCenter = centers[to as keyof typeof centers];
    
    if (!fromCenter || !toCenter) return '';
    
    return `M ${fromCenter.x} ${fromCenter.y} L ${toCenter.x} ${toCenter.y}`;
  };

  const isChannelActive = (channelId: string) => {
    return activeChannels.includes(channelId);
  };

  const handleCenterClick = (centerName: string) => {
    setSelectedCenter(selectedCenter === centerName ? null : centerName);
    setSelectedChannel(null);
    setSelectedPlanet(null);
    
    if (onElementClick) {
      onElementClick({
        type: 'center',
        id: centerName,
        data: {
          name: centers[centerName as keyof typeof centers]?.name || centerName,
          description: centerData[centerName]?.description || '',
          gates: centerData[centerName]?.gates || [],
          defined: centerData[centerName]?.defined || false
        }
      });
    }
  };

  const handleChannelClick = (channelId: string) => {
    setSelectedChannel(selectedChannel === channelId ? null : channelId);
    setSelectedCenter(null);
    setSelectedPlanet(null);
    
    if (onElementClick) {
      const channel = channelData[channelId];
      const channelInfo = channels.find(c => c.id === channelId);
      onElementClick({
        type: 'channel',
        id: channelId,
        data: {
          name: channelInfo?.description || channelId,
          description: channel?.description || '',
          from: channel?.from || '',
          to: channel?.to || '',
          active: channel?.active || false
        }
      });
    }
  };

  const handlePlanetClick = (planetId: string) => {
    setSelectedPlanet(selectedPlanet === planetId ? null : planetId);
    setSelectedCenter(null);
    setSelectedChannel(null);
    
    if (onElementClick) {
      const planet = planetData[planetId];
      onElementClick({
        type: 'planet',
        id: planetId,
        data: {
          name: planet?.name || planetId,
          description: planet?.description || '',
          symbol: planet?.symbol || '',
          gate: planet?.gate || '',
          line: planet?.line || 1
        }
      });
    }
  };

  // Erweiterte Gate-Positionierung für alle 64 Tore
  const getGatePosition = (gateId: string, centerName: string, index: number) => {
    const center = centers[centerName as keyof typeof centers];
    if (!center) return { x: 50, y: 50 };
    
    // Definiere spezifische Positionen für jedes Zentrum
    const gatePositions: { [key: string]: { x: number; y: number }[] } = {
      head: [
        { x: -3, y: -2 }, { x: -2, y: -3 }, { x: 0, y: -3 }, { x: 2, y: -3 }, { x: 3, y: -2 },
        { x: 3, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 3 }, { x: -2, y: 2 }, { x: -3, y: 0 }
      ],
      ajna: [
        { x: -3, y: -2 }, { x: -2, y: -3 }, { x: 0, y: -3 }, { x: 2, y: -3 }, { x: 3, y: -2 },
        { x: 3, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 3 }, { x: -2, y: 2 }, { x: -3, y: 0 }
      ],
      throat: [
        { x: -3, y: -2 }, { x: -2, y: -3 }, { x: 0, y: -3 }, { x: 2, y: -3 }, { x: 3, y: -2 },
        { x: 3, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 3 }, { x: -2, y: 2 }, { x: -3, y: 0 }
      ],
      g: [
        { x: -3, y: -2 }, { x: -2, y: -3 }, { x: 0, y: -3 }, { x: 2, y: -3 }, { x: 3, y: -2 },
        { x: 3, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 3 }, { x: -2, y: 2 }, { x: -3, y: 0 }
      ],
      heart: [
        { x: -3, y: -2 }, { x: -2, y: -3 }, { x: 0, y: -3 }, { x: 2, y: -3 }, { x: 3, y: -2 },
        { x: 3, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 3 }, { x: -2, y: 2 }, { x: -3, y: 0 }
      ],
      spleen: [
        { x: -3, y: -2 }, { x: -2, y: -3 }, { x: 0, y: -3 }, { x: 2, y: -3 }, { x: 3, y: -2 },
        { x: 3, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 3 }, { x: -2, y: 2 }, { x: -3, y: 0 }
      ],
      sacral: [
        { x: -3, y: -2 }, { x: -2, y: -3 }, { x: 0, y: -3 }, { x: 2, y: -3 }, { x: 3, y: -2 },
        { x: 3, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 3 }, { x: -2, y: 2 }, { x: -3, y: 0 }
      ],
      solar: [
        { x: -3, y: -2 }, { x: -2, y: -3 }, { x: 0, y: -3 }, { x: 2, y: -3 }, { x: 3, y: -2 },
        { x: 3, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 3 }, { x: -2, y: 2 }, { x: -3, y: 0 }
      ],
      root: [
        { x: -3, y: -2 }, { x: -2, y: -3 }, { x: 0, y: -3 }, { x: 2, y: -3 }, { x: 3, y: -2 },
        { x: 3, y: 0 }, { x: 2, y: 2 }, { x: 0, y: 3 }, { x: -2, y: 2 }, { x: -3, y: 0 }
      ]
    };
    
    const positions = gatePositions[centerName] || gatePositions.head;
    const position = positions[index % positions.length];
    
    return {
      x: center.x + position.x,
      y: center.y + position.y
    };
  };

  return (
    <motion.div
      
      
      
    >
      <Card sx={{
              background: `
                radial-gradient(ellipse at top, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(ellipse at bottom, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
                linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)
              `,
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              border: '1px solid rgba(254,243,199,0.2)',
              overflow: 'visible',
              position: 'relative'
            }}>
              {/* Animated Stars */}
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                zIndex: 1
              }}>
                {[...Array(15)].map((_, i) => {
                  const starPositions = [
                    { left: 10, top: 15, size: 1.5, delay: 0.5, duration: 3 },
                    { left: 85, top: 25, size: 2, delay: 1.2, duration: 4 },
                    { left: 45, top: 35, size: 1.8, delay: 0.8, duration: 3.5 },
                    { left: 75, top: 45, size: 2.2, delay: 1.5, duration: 4.2 },
                    { left: 20, top: 55, size: 1.6, delay: 0.3, duration: 3.8 },
                    { left: 90, top: 65, size: 2.1, delay: 1.8, duration: 4.5 },
                    { left: 30, top: 75, size: 1.9, delay: 0.7, duration: 3.2 },
                    { left: 60, top: 85, size: 2.3, delay: 1.3, duration: 4.8 },
                    { left: 15, top: 95, size: 1.7, delay: 0.4, duration: 3.6 },
                    { left: 80, top: 5, size: 2.4, delay: 1.6, duration: 4.3 },
                    { left: 50, top: 15, size: 1.4, delay: 0.9, duration: 3.7 },
                    { left: 25, top: 25, size: 2.5, delay: 1.1, duration: 4.1 },
                    { left: 70, top: 35, size: 1.3, delay: 0.6, duration: 3.4 },
                    { left: 40, top: 45, size: 2.6, delay: 1.7, duration: 4.6 },
                    { left: 95, top: 55, size: 1.2, delay: 0.2, duration: 3.9 }
                  ];
                  const pos = starPositions[i];
                  
                  return (
                    <Box
                      key={i}
                      sx={{
                        position: 'absolute',
                        width: pos.size,
                        height: pos.size,
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderRadius: '50%',
                        left: `${pos.left}%`,
                        top: `${pos.top}%`,
                        animation: `twinkle ${pos.duration}s infinite ease-in-out`,
                        animationDelay: `${pos.delay}s`,
                        '@keyframes twinkle': {
                          '0%, 100%': { opacity: 0.3, transform: 'scale(1)' },
                          '50%': { opacity: 1, transform: 'scale(1.2)' }
                        }
                      }}
                    />
                  );
                })}
              </Box>
              

              
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <motion.div
                
                
              >
                <User size={28} color="#fef3c7" />
              </motion.div>
              <Typography variant="h4" sx={{
                color: '#fef3c7',
                fontWeight: 700,
                ml: 2,
                background: 'linear-gradient(45deg, #fef3c7, #fbbf24, #fef3c7)',
                backgroundSize: '200% 200%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradientShift 3s ease-in-out infinite'
              }}>
                Deine energetische Landkarte ✨
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip
                label={hdType}
                icon={<Star size={16} />}
                sx={{
                  background: 'rgba(254,243,199,0.2)',
                  color: '#fef3c7',
                  border: '1px solid rgba(254,243,199,0.3)',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(254,243,199,0.3)',
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 12px rgba(254,243,199,0.3)'
                  }
                }}
              />
              <Chip
                label={profile}
                icon={<Crown size={16} />}
                sx={{
                  background: 'rgba(168,85,247,0.2)',
                  color: '#c4b5fd',
                  border: '1px solid rgba(168,85,247,0.3)',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    background: 'rgba(168,85,247,0.3)',
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 12px rgba(168,85,247,0.3)'
                  }
                }}
              />
              <IconButton
                onClick={() => setShowHelp(true)}
                sx={{
                  color: '#fef3c7',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(254,243,199,0.1)',
                    transform: 'scale(1.1)',
                    boxShadow: '0 4px 12px rgba(254,243,199,0.2)'
                  }
                }}
              >
                <HelpCircle size={20} />
              </IconButton>
            </Box>
          </Box>

          {/* Strategy & Authority */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Paper sx={{
              p: 2,
              background: 'rgba(34,197,94,0.2)',
              border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: 2,
              flex: 1,
              minWidth: '200px'
            }}>
              <Typography sx={{ color: '#86efac', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Target size={16} />
                Deine Strategie
              </Typography>
              <Typography sx={{ color: 'rgba(134,239,172,0.8)', fontSize: '1.1rem', fontWeight: 700 }}>
                {strategy}
              </Typography>
            </Paper>
            <Paper sx={{
              p: 2,
              background: 'rgba(59,130,246,0.2)',
              border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: 2,
              flex: 1,
              minWidth: '200px'
            }}>
              <Typography sx={{ color: '#93c5fd', fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Eye size={16} />
                Deine Authority
              </Typography>
              <Typography sx={{ color: 'rgba(147,197,253,0.8)', fontSize: '1.1rem', fontWeight: 700 }}>
                {authority}
              </Typography>
            </Paper>
          </Box>

          {/* Controls */}
          <Box sx={{ mb: 2, textAlign: 'center', display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant={is3DMode ? 'contained' : 'outlined'}
              onClick={() => setIs3DMode(!is3DMode)}
              startIcon={<Eye size={20} />}
              sx={{
                background: is3DMode && themeService.currentTheme?.colors ? `linear-gradient(135deg, ${themeService.currentTheme.colors.primary}, ${themeService.currentTheme.colors.secondary})` : 'transparent',
                color: themeService.currentTheme?.colors?.textPrimary || '#ffffff',
                border: `1px solid ${themeService.currentTheme?.colors?.border || 'rgba(255,255,255,0.2)'}`,
                borderRadius: 3,
                px: 3,
                py: 1,
                '&:hover': {
                  background: is3DMode && themeService.currentTheme?.colors ? `linear-gradient(135deg, ${themeService.currentTheme.colors.primary}, ${themeService.currentTheme.colors.secondary})` : (themeService.currentTheme?.colors?.backgroundSecondary || 'rgba(255,255,255,0.1)'),
                  borderColor: themeService.currentTheme?.colors?.textPrimary || '#ffffff'
                }
              }}
            >
              {is3DMode ? '3D-Modus aktiv' : '3D-Modus aktivieren'}
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => setShowThemeSelector(true)}
              startIcon={<Palette size={20} />}
              sx={{
                color: themeService.currentTheme?.colors?.textPrimary || '#ffffff',
                border: `1px solid ${themeService.currentTheme?.colors?.border || 'rgba(255,255,255,0.2)'}`,
                borderRadius: 3,
                px: 3,
                py: 1,
                '&:hover': {
                  background: themeService.currentTheme?.colors?.backgroundSecondary || 'rgba(255,255,255,0.1)',
                  borderColor: themeService.currentTheme?.colors?.textPrimary || '#ffffff'
                }
              }}
            >
              Theme wechseln
            </Button>
            
            <Button
              variant="outlined"
              onClick={() => setShowSharingModal(true)}
              startIcon={<Share2 size={20} />}
              sx={{
                color: themeService.currentTheme?.colors?.textPrimary || '#ffffff',
                border: `1px solid ${themeService.currentTheme?.colors?.border || 'rgba(255,255,255,0.2)'}`,
                borderRadius: 3,
                px: 3,
                py: 1,
                '&:hover': {
                  background: themeService.currentTheme?.colors?.backgroundSecondary || 'rgba(255,255,255,0.1)',
                  borderColor: themeService.currentTheme?.colors?.textPrimary || '#ffffff'
                }
              }}
            >
              Chart teilen
            </Button>
          </Box>

          {/* Chart Container */}
          <Box sx={{
            position: 'relative',
            width: '100%',
            height: '600px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 3,
            border: '1px solid rgba(254,243,199,0.1)',
            overflow: 'hidden'
          }}>
            {/* 3D Chart or SVG Chart */}
            {is3DMode ? (
              <HDChart3D
                hdType={hdType}
                profile={profile}
                authority={authority}
                strategy={strategy}
                centerData={centerData}
                channelData={channelData}
                gateData={gateData}
                planetData={planetData}
              />
            ) : (
              <svg
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              style={{ position: 'absolute', top: 0, left: 0 }}
            >
              {/* Background Grid */}
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(254,243,199,0.1)" strokeWidth="0.1"/>
                </pattern>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="planetGlow">
                  <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <rect width="100" height="100" fill="url(#grid)" />
              
              {/* Channels - Alle Kanäle anzeigen */}
              {channels.map((channel) => {
                const isActive = isChannelActive(channel.id);
                const path = getChannelPath(channel.from, channel.to);
                
                return (
                  <motion.path
                    key={channel.id}
                    d={path}
                    stroke={isActive ? channel.color : 'rgba(254,243,199,0.2)'}
                    strokeWidth={isActive ? '1.2' : '0.4'}
                    fill="none"
                    strokeLinecap="round"
                    filter={isActive ? 'url(#glow)' : 'none'}
                    strokeDasharray={isActive ? 'none' : '2,2'}
                    
                    animate={{ 
                      pathLength: 1, 
                      opacity: isActive ? 1 : 0.4 
                    }}
                    transition={{ 
                      duration: 2, 
                      ease: "easeInOut",
                      delay: mounted ? Math.random() * 0.8 : 0
                    }}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleChannelClick(channel.id)}
                    whileHover={{ 
                      strokeWidth: isActive ? '1.8' : '0.8', 
                      filter: 'url(#glow)',
                      transition: { duration: 0.2 }
                    }}
                    onMouseEnter={() => setHoveredElement(`channel-${channel.id}`)}
                    onMouseLeave={() => setHoveredElement(null)}
                  />
                );
              })}
              
              {/* Centers */}
              {Object.entries(centers).map(([centerName, center]) => {
                const isDefined = definedCenters.includes(centerName);
                const isSelected = selectedCenter === centerName;
                const isHovered = hoveredElement === centerName;
                
                return (
                  <motion.g key={centerName}>
                    {/* Center Background */}
                    <motion.circle
                      cx={center.x}
                      cy={center.y}
                      r={isDefined ? '3' : '2.5'}
                      fill={isDefined ? center.color : 'rgba(254,243,199,0.1)'}
                      stroke={isSelected ? '#fef3c7' : isHovered ? center.color : 'rgba(254,243,199,0.3)'}
                      strokeWidth={isSelected ? '0.5' : isHovered ? '0.4' : '0.2'}
                      filter={isDefined || isHovered ? 'url(#glow)' : 'none'}
                      
                      animate={{ 
                        scale: isHovered ? 1.2 : 1, 
                        opacity: 1,
                        r: isHovered ? (isDefined ? '3.5' : '3') : (isDefined ? '3' : '2.5')
                      }}
                      transition={{ 
                        duration: 0.3, 
                        ease: "easeOut",
                        delay: mounted ? Math.random() * 0.3 : 0
                      }}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleCenterClick(centerName)}
                      whileHover={{ 
                        scale: 1.3, 
                        filter: 'url(#glow)',
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.9 }}
                      onMouseEnter={() => setHoveredElement(`center-${centerName}`)}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    
                    {/* Center Label */}
                    <motion.text
                      x={center.x}
                      y={center.y + (centerName === 'root' ? 6 : -6)}
                      textAnchor="middle"
                      fill="#fef3c7"
                      fontSize="2"
                      fontWeight="600"
                      
                      
                      
                    >
                      {center.name}
                    </motion.text>
                  </motion.g>
                );
              })}
              
              {/* Gates - Alle Tore anzeigen */}
              {Object.entries(gateData).map(([gateId, gate], index) => {
                const center = centers[gate.center as keyof typeof centers];
                if (!center) return null;
                
                const position = getGatePosition(gateId, gate.center, index);
                
                return (
                  <motion.g key={gateId}>
                    {/* Gate Circle */}
                    <motion.circle
                      cx={position.x}
                      cy={position.y}
                      r={gate.active ? "1.4" : "1.0"}
                      fill={gate.active ? gate.color : 'rgba(254,243,199,0.2)'}
                      stroke={gate.active ? gate.color : 'rgba(254,243,199,0.4)'}
                      strokeWidth={gate.active ? "0.3" : "0.15"}
                      filter={gate.active ? "url(#glow)" : "none"}
                      
                      
                      transition={{ 
                        duration: 0.6, 
                        delay: 1.5 + (index * 0.03)
                      }}
                      style={{ cursor: 'pointer' }}
                      whileHover={{ 
                        scale: gate.active ? 1.8 : 1.4, 
                        filter: 'url(#glow)',
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.8 }}
                      onMouseEnter={() => setHoveredElement(`gate-${gateId}`)}
                      onMouseLeave={() => setHoveredElement(null)}
                      onClick={async () => {
                        setSelectedGateId(gateId);
                        setShowGateDetails(true);
                        
                        // Audio-Beschreibung abspielen
                        if (audioService.speak) {
                          const gateData = getGateData(parseInt(gateId));
                          const gateName = gateData?.name || `Tor ${gateId}`;
                          const gateDescription = gateData?.description || gate.description;
                          
                          await audioService.speak(
                            `${gateName}. ${gateDescription}. Dieses Tor aktiviert spezifische Energien in deinem Chart.`
                          );
                        }
                        
                        if (onElementClick) {
                          onElementClick({
                            type: 'gate',
                            id: gateId,
                            data: {
                              name: `Tor ${gateId}`,
                              description: gate.description,
                              center: gate.center,
                              active: gate.active
                            }
                          });
                        }
                      }}
                    />
                    
                    {/* Gate Number */}
                    <motion.text
                      x={position.x}
                      y={position.y + 0.4}
                      textAnchor="middle"
                      fill={gate.active ? "#fef3c7" : "rgba(254,243,199,0.7)"}
                      fontSize={gate.active ? "1.4" : "1.0"}
                      fontWeight="700"
                      
                      
                      
                    >
                      {gateId}
                    </motion.text>
                  </motion.g>
                );
              })}
              
              {/* Planets with Transit Information */}
              {planetsData && Object.entries(planetsData).map(([planetId, planet], index) => {
                const planetData = planet as LocalPlanetData;
                const angle = (planetData.currentPosition * Math.PI) / 180;
                const radius = 35;
                const x = 50 + radius * Math.cos(angle);
                const y = 50 + radius * Math.sin(angle);
                const isSelected = selectedPlanet === planetId;
                
                return (
                  <motion.g key={planetId}>
                    {/* Planet Background */}
                    <motion.circle
                      cx={x}
                      cy={y}
                      r={planetData.size as number}
                      fill={planetData.color as string}
                      stroke={isSelected ? '#fef3c7' : planetData.color as string}
                      strokeWidth={isSelected ? '0.3' : '0.1'}
                      filter="url(#planetGlow)"
                      
                      
                      transition={{ 
                        duration: 0.6, 
                        delay: 2 + (index * 0.1)
                      }}
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        setSelectedPlanetId(planetId);
                        setShowPlanetDetails(true);
                        handlePlanetClick(planetId);
                      }}
                      whileHover={{ 
                        scale: 1.6, 
                        filter: 'url(#planetGlow)',
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.8 }}
                      onMouseEnter={() => setHoveredElement(`planet-${planetId}`)}
                      onMouseLeave={() => setHoveredElement(null)}
                    />
                    
                    {/* Planet Symbol */}
                    <motion.text
                      x={x}
                      y={y + 0.5}
                      textAnchor="middle"
                      fill="#fef3c7"
                      fontSize="1.5"
                      fontWeight="700"
                      
                      
                      
                    >
                      {planetSymbols[planetData.symbol as keyof typeof planetSymbols] || planetData.symbol}
                    </motion.text>

                    {/* Retrograde Indicator */}
                    {planetData.isRetrograde && (
                      <motion.circle
                        cx={x + 2}
                        cy={y - 2}
                        r="0.8"
                        fill="#ef4444"
                        
                        
                        
                      />
                    )}

                    {/* Current Gate Indicator */}
                    <motion.text
                      x={x + 3}
                      y={y + 3}
                      textAnchor="middle"
                      fill={planet.color as string}
                      fontSize="0.8"
                      fontWeight="700"
                      
                      
                      
                    >
                      {planet.currentGate as string}
                    </motion.text>
                  </motion.g>
                );
              })}
            </svg>
            )}

            {/* Hover Tooltip */}
            <AnimatePresence>
              {hoveredElement && (
                <motion.div
                  
                  
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                    pointerEvents: 'none'
                  }}
                >
                  <Paper sx={{
                    p: 2,
                    background: 'rgba(0,0,0,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(254,243,199,0.3)',
                    borderRadius: 2,
                    minWidth: '200px',
                    textAlign: 'center'
                  }}>
                    {hoveredElement.startsWith('center-') && (
                      <Box>
                        <Typography sx={{
                          color: '#fef3c7',
                          fontWeight: 700,
                          fontSize: '1rem',
                          mb: 1
                        }}>
                          {centers[hoveredElement.replace('center-', '') as keyof typeof centers]?.name}
                        </Typography>
                        <Typography sx={{
                          color: 'rgba(254,243,199,0.8)',
                          fontSize: '0.8rem',
                          lineHeight: 1.4
                        }}>
                          {centerData[hoveredElement.replace('center-', '')]?.description || 
                           centers[hoveredElement.replace('center-', '') as keyof typeof centers]?.description}
                        </Typography>
                      </Box>
                    )}
                    {hoveredElement.startsWith('gate-') && (
                      <Box>
                        <Typography sx={{
                          color: '#fef3c7',
                          fontWeight: 700,
                          fontSize: '1rem',
                          mb: 1
                        }}>
                          Tor {hoveredElement.replace('gate-', '')}
                        </Typography>
                        <Typography sx={{
                          color: 'rgba(254,243,199,0.8)',
                          fontSize: '0.8rem',
                          lineHeight: 1.4
                        }}>
                          {gateData[hoveredElement.replace('gate-', '')]?.description}
                        </Typography>
                      </Box>
                    )}
                    {hoveredElement.startsWith('planet-') && (
                      <Box>
                        <Typography sx={{
                          color: '#fef3c7',
                          fontWeight: 700,
                          fontSize: '1rem',
                          mb: 1
                        }}>
                          {planetData[hoveredElement.replace('planet-', '')]?.name}
                        </Typography>
                        <Typography sx={{
                          color: 'rgba(254,243,199,0.8)',
                          fontSize: '0.8rem',
                          lineHeight: 1.4
                        }}>
                          {planetData[hoveredElement.replace('planet-', '')]?.description}
                        </Typography>
                      </Box>
                    )}
                    {hoveredElement.startsWith('channel-') && (
                      <Box>
                        <Typography sx={{
                          color: '#fef3c7',
                          fontWeight: 700,
                          fontSize: '1rem',
                          mb: 1
                        }}>
                          Kanal {hoveredElement.replace('channel-', '')}
                        </Typography>
                        <Typography sx={{
                          color: 'rgba(254,243,199,0.8)',
                          fontSize: '0.8rem',
                          lineHeight: 1.4
                        }}>
                          {channelData[hoveredElement.replace('channel-', '')]?.description}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating Info Panel */}
            <AnimatePresence>
              {(selectedCenter || selectedChannel || selectedPlanet) && (
                <motion.div
                  
                  
                  exit={{ opacity: 0, x: 20 }}
                  style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    maxWidth: '350px'
                  }}
                >
                  <Paper sx={{
                    p: 3,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(254,243,199,0.2)',
                    borderRadius: 2
                  }}>
                    {selectedCenter && (
                      <Box>
                        <Typography sx={{
                          color: '#fef3c7',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          mb: 1
                        }}>
                          {centers[selectedCenter as keyof typeof centers]?.name}
                        </Typography>
                        <Typography sx={{
                          color: 'rgba(254,243,199,0.8)',
                          fontSize: '0.9rem',
                          mb: 1,
                          lineHeight: 1.5
                        }}>
                          {centerData[selectedCenter]?.description || centers[selectedCenter as keyof typeof centers]?.description}
                        </Typography>
                        {/* Aktive Tore anzeigen */}
                        {centerData[selectedCenter]?.gates && centerData[selectedCenter].gates.length > 0 ? (
                          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Typography sx={{
                              color: '#FFD700',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              mb: 1
                            }}>
                              🎯 Aktive Tore:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {centerData[selectedCenter].gates.map((gate: string) => (
                                <Chip
                                  key={gate}
                                  label={`Tor ${gate}`}
                                  size="small"
                                  sx={{
                                    bgcolor: 'rgba(255,215,0,0.2)',
                                    color: '#FFD700',
                                    border: '1px solid rgba(255,215,0,0.3)',
                                    fontSize: '0.7rem',
                                    height: '20px'
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Typography sx={{
                              color: '#fbbf24',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              mb: 1
                            }}>
                              📚 Keine aktiven Tore
                            </Typography>
                            <Typography sx={{
                              color: 'rgba(254,243,199,0.7)',
                              fontSize: '0.75rem',
                              lineHeight: 1.4
                            }}>
                              Dieses Zentrum hat derzeit keine aktiven Tore. Das bedeutet, dass du hier offen für äußere Einflüsse bist und von anderen lernen kannst.
                            </Typography>
                          </Box>
                        )}
                        
                        {/* Zentrum-Status */}
                        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {centerData[selectedCenter]?.defined ? (
                            <Chip
                              label="Definiert - Deine Stärke"
                              size="small"
                              sx={{
                                background: 'rgba(34,197,94,0.2)',
                                color: '#86efac',
                                border: '1px solid rgba(34,197,94,0.3)',
                                fontSize: '0.7rem'
                              }}
                            />
                          ) : (
                            <Chip
                              label="Undefiniert - Lernbereich"
                              size="small"
                              sx={{
                                background: 'rgba(251,191,36,0.2)',
                                color: '#fbbf24',
                                border: '1px solid rgba(251,191,36,0.3)',
                                fontSize: '0.7rem'
                              }}
                            />
                          )}
                        </Box>
                        
                        {/* Zentrum-spezifische Details */}
                        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, border: '1px solid rgba(255,255,255,0.1)' }}>
                          <Typography sx={{
                            color: '#FFD700',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            mb: 1
                          }}>
                            📖 Zentrum-Details:
                          </Typography>
                          <Typography sx={{
                            color: 'rgba(254,243,199,0.7)',
                            fontSize: '0.75rem',
                            lineHeight: 1.4
                          }}>
                            {centerData[selectedCenter]?.defined 
                              ? 'Dieses Zentrum ist für dich eine natürliche Stärke. Du hast eine natürliche Neigung dazu, hier zu sein und deine Energie optimal zu nutzen.'
                              : 'Dieses Zentrum ist für dich ein Lernbereich. Hier kannst du deine Fähigkeiten und Stärken entwickeln, indem du auf andere Menschen und Situationen aufmerksam wirst.'
                            }
                          </Typography>
                        </Box>
                      </Box>
                    )}
                    
                    {selectedChannel && (
                      <Box>
                        <Typography sx={{
                          color: '#fef3c7',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          mb: 1
                        }}>
                          Kanal {selectedChannel}
                        </Typography>
                        <Typography sx={{
                          color: 'rgba(254,243,199,0.8)',
                          fontSize: '0.9rem',
                          lineHeight: 1.5
                        }}>
                          {channelData[selectedChannel]?.description}
                        </Typography>
                        {isChannelActive(selectedChannel) && (
                          <Chip
                            label="Aktiv - Dein Talent"
                            size="small"
                            sx={{
                              background: 'rgba(34,197,94,0.2)',
                              color: '#86efac',
                              border: '1px solid rgba(34,197,94,0.3)',
                              mt: 1
                            }}
                          />
                        )}
                      </Box>
                    )}
                    
                    {selectedPlanet && (
                      <Box>
                        <Typography sx={{
                          color: '#fef3c7',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          {planetSymbols[planetData[selectedPlanet].symbol as keyof typeof planetSymbols] || planetData[selectedPlanet].symbol}
                          {planetData[selectedPlanet].name}
                        </Typography>
                        <Typography sx={{
                          color: 'rgba(254,243,199,0.8)',
                          fontSize: '0.9rem',
                          mb: 1
                        }}>
                          Gate {planetData[selectedPlanet].gate} • Line {planetData[selectedPlanet].line}
                        </Typography>
                        <Typography sx={{
                          color: 'rgba(254,243,199,0.8)',
                          fontSize: '0.9rem',
                          lineHeight: 1.5
                        }}>
                          {planetData[selectedPlanet].description}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Legend */}
            <Box sx={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap'
            }}>
              <Chip
                label="Definierte Zentren"
                size="small"
                sx={{
                  background: 'rgba(34,197,94,0.2)',
                  color: '#86efac',
                  border: '1px solid rgba(34,197,94,0.3)'
                }}
              />
              <Chip
                label="Aktive Kanäle"
                size="small"
                sx={{
                  background: 'rgba(59,130,246,0.2)',
                  color: '#93c5fd',
                  border: '1px solid rgba(59,130,246,0.3)'
                }}
              />
              <Chip
                label="Planeten"
                size="small"
                sx={{
                  background: 'rgba(251,191,36,0.2)',
                  color: '#fde047',
                  border: '1px solid rgba(251,191,36,0.3)'
                }}
              />
            </Box>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
            <Paper sx={{
              p: 2,
              textAlign: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(254,243,199,0.1)',
              borderRadius: 2,
              flex: 1,
              minWidth: '200px'
            }}>
              <Typography sx={{ color: '#fef3c7', fontWeight: 600, mb: 1 }}>
                Definiert
              </Typography>
              <Typography sx={{ color: 'rgba(254,243,199,0.8)', fontSize: '1.5rem', fontWeight: 700 }}>
                {definedCenters.length}/9
              </Typography>
            </Paper>
            <Paper sx={{
              p: 2,
              textAlign: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(254,243,199,0.1)',
              borderRadius: 2,
              flex: 1,
              minWidth: '200px'
            }}>
              <Typography sx={{ color: '#fef3c7', fontWeight: 600, mb: 1 }}>
                Kanäle
              </Typography>
              <Typography sx={{ color: 'rgba(254,243,199,0.8)', fontSize: '1.5rem', fontWeight: 700 }}>
                {activeChannels.length}
              </Typography>
            </Paper>
            <Paper sx={{
              p: 2,
              textAlign: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(254,243,199,0.1)',
              borderRadius: 2,
              flex: 1,
              minWidth: '200px'
            }}>
              <Typography sx={{ color: '#fef3c7', fontWeight: 600, mb: 1 }}>
                Gates
              </Typography>
              <Typography sx={{ color: 'rgba(254,243,199,0.8)', fontSize: '1.5rem', fontWeight: 700 }}>
                {Object.keys(gateData).filter(id => gateData[id].active).length}
              </Typography>
            </Paper>
            <Paper sx={{
              p: 2,
              textAlign: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(254,243,199,0.1)',
              borderRadius: 2,
              flex: 1,
              minWidth: '200px'
            }}>
              <Typography sx={{ color: '#fef3c7', fontWeight: 600, mb: 1 }}>
                Planeten
              </Typography>
              <Typography sx={{ color: 'rgba(254,243,199,0.8)', fontSize: '1.5rem', fontWeight: 700 }}>
                {Object.keys(planetData).length}
              </Typography>
            </Paper>
          </Box>
        </CardContent>
      </Card>

      {/* Help Dialog */}
      <Dialog
        open={showHelp}
        onClose={() => setShowHelp(false)}
        maxWidth="lg"
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
        <DialogTitle sx={{ color: '#fef3c7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <HelpCircle size={24} />
          Human Design Chart verstehen
        </DialogTitle>
        <DialogContent>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ 
              mb: 3,
              '& .MuiTab-root': { color: 'rgba(254,243,199,0.7)' },
              '& .Mui-selected': { color: '#fef3c7' }
            }}
          >
            <Tab label="Grundlagen" />
            <Tab label="Zentren" />
            <Tab label="Kanäle" />
            <Tab label="Planeten" />
            <Tab label="Dein Typ" />
          </Tabs>
          
          {activeTab === 0 && (
            <Box>
              <Typography sx={{ color: '#fef3c7', fontWeight: 600, mb: 2, fontSize: '1.2rem' }}>
                Was ist Human Design?
              </Typography>
              <Typography sx={{ color: 'rgba(254,243,199,0.8)', mb: 3, lineHeight: 1.6 }}>
                Human Design ist ein System, das Astrologie, I Ging, Chakren und Quantenphysik kombiniert. 
                Es zeigt dir deine einzigartige energetische Konfiguration und wie du am besten funktionierst.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Paper sx={{
                  p: 2,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(254,243,199,0.1)',
                  borderRadius: 2,
                  flex: 1,
                  minWidth: '300px'
                }}>
                  <Typography sx={{ color: '#fef3c7', fontWeight: 600, mb: 1 }}>
                    Definiert vs. Undefiniert
                  </Typography>
                  <Typography sx={{ color: 'rgba(254,243,199,0.8)', fontSize: '0.9rem' }}>
                    <strong>Definierte Zentren</strong> sind deine stabilen Energien - deine Stärken.<br/>
                    <strong>Undefinierte Zentren</strong> sind deine Lernbereiche - wo du wachsen kannst.
                  </Typography>
                </Paper>
                <Paper sx={{
                  p: 2,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(254,243,199,0.1)',
                  borderRadius: 2,
                  flex: 1,
                  minWidth: '300px'
                }}>
                  <Typography sx={{ color: '#fef3c7', fontWeight: 600, mb: 1 }}>
                    Strategy & Authority
                  </Typography>
                  <Typography sx={{ color: 'rgba(254,243,199,0.8)', fontSize: '0.9rem' }}>
                    <strong>Strategy</strong> zeigt dir, wie du am besten handelst.<br/>
                    <strong>Authority</strong> ist dein innerer Entscheidungsmechanismus.
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box>
              <Typography sx={{ color: '#fef3c7', fontWeight: 600, mb: 2, fontSize: '1.2rem' }}>
                Die 9 Zentren
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(centers).map(([centerName, center]) => (
                  <Grid item xs={12} sm={6} md={4} key={centerName}>
                    <Paper sx={{
                      p: 2,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(254,243,199,0.1)',
                      borderRadius: 2
                    }}>
                      <Typography sx={{
                        color: center.color,
                        fontWeight: 600,
                        mb: 1
                      }}>
                        {center.name}
                      </Typography>
                      <Typography sx={{
                        color: 'rgba(254,243,199,0.8)',
                        fontSize: '0.9rem',
                        lineHeight: 1.4
                      }}>
                        {center.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box>
              <Typography sx={{ color: '#fef3c7', fontWeight: 600, mb: 2, fontSize: '1.2rem' }}>
                Kanäle - Deine Talente
              </Typography>
              <Typography sx={{ color: 'rgba(254,243,199,0.8)', mb: 3, lineHeight: 1.6 }}>
                Kanäle verbinden zwei Zentren und zeigen deine natürlichen Talente und Fähigkeiten. 
                Aktive Kanäle sind deine einzigartigen Gaben.
              </Typography>
              <Grid container spacing={2}>
                {channels.slice(0, 12).map((channel) => (
                  <Grid item xs={12} sm={6} key={channel.id}>
                    <Paper sx={{
                      p: 2,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(254,243,199,0.1)',
                      borderRadius: 2
                    }}>
                      <Typography sx={{
                        color: channel.color,
                        fontWeight: 600,
                        mb: 1
                      }}>
                        Kanal {channel.id}
                      </Typography>
                      <Typography sx={{
                        color: 'rgba(254,243,199,0.8)',
                        fontSize: '0.9rem',
                        lineHeight: 1.4
                      }}>
                        {channel.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {activeTab === 3 && (
            <Box>
              <Typography sx={{ color: '#fef3c7', fontWeight: 600, mb: 2, fontSize: '1.2rem' }}>
                Planeten - Astrologische Einflüsse
              </Typography>
              <Typography sx={{ color: 'rgba(254,243,199,0.8)', mb: 3, lineHeight: 1.6 }}>
                Die Planeten zeigen, wie astrologische Energien in deinem Human Design wirken. 
                Jeder Planet hat eine spezifische Bedeutung und Einfluss.
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(planetData).map(([planetId, planet]) => (
                  <Grid item xs={12} sm={6} md={4} key={planetId}>
                    <Paper sx={{
                      p: 2,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(254,243,199,0.1)',
                      borderRadius: 2
                    }}>
                      <Typography sx={{
                        color: '#fef3c7',
                        fontWeight: 600,
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        {planetSymbols[planet.symbol as keyof typeof planetSymbols] || planet.symbol}
                        {planet.name}
                      </Typography>
                      <Typography sx={{
                        color: 'rgba(254,243,199,0.8)',
                        fontSize: '0.9rem',
                        lineHeight: 1.4
                      }}>
                        {planet.description}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
          
          {activeTab === 4 && (
            <Box>
              <Typography sx={{ color: '#fef3c7', fontWeight: 600, mb: 2, fontSize: '1.2rem' }}>
                Dein Typ: {hdType}
              </Typography>
              <Typography sx={{ color: 'rgba(254,243,199,0.8)', mb: 3, lineHeight: 1.6 }}>
                Dein Human Design Typ bestimmt deine grundlegende Natur und wie du am besten funktionierst.
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{
                    p: 3,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(254,243,199,0.1)',
                    borderRadius: 2
                  }}>
                    <Typography sx={{ color: '#fef3c7', fontWeight: 600, mb: 1 }}>
                      Deine Strategy: {strategy}
                    </Typography>
                    <Typography sx={{ color: 'rgba(254,243,199,0.8)', lineHeight: 1.6 }}>
                      Als {hdType} solltest du {strategy.toLowerCase()}. Das bedeutet, dass du am besten 
                      funktionierst, wenn du auf diese Weise handelst.
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{
                    p: 3,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(254,243,199,0.1)',
                    borderRadius: 2
                  }}>
                    <Typography sx={{ color: '#fef3c7', fontWeight: 600, mb: 1 }}>
                      Deine Authority: {authority}
                    </Typography>
                    <Typography sx={{ color: 'rgba(254,243,199,0.8)', lineHeight: 1.6 }}>
                      Deine {authority} Authority ist dein innerer Kompass. Vertraue auf sie, 
                      wenn du Entscheidungen triffst.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowHelp(false)}
            sx={{ color: '#fef3c7' }}
          >
            Verstanden
          </Button>
        </DialogActions>
      </Dialog>

      {/* Gate Details Modal */}
      <GateDetailsModal
        open={showGateDetails}
        onClose={() => setShowGateDetails(false)}
        gateId={selectedGateId}
        gateData={gateData[selectedGateId]}
      />

      {/* Planet Transit Modal */}
      {planetsData?.[selectedPlanetId] && (
        <PlanetTransitModal
          open={showPlanetDetails}
          onClose={() => setShowPlanetDetails(false)}
          planet={planetsData[selectedPlanetId] as unknown as import('@/lib/planetsData').PlanetData}
        />
      )}

      {/* Audio Controls */}
      {showAudioControls && (
        <AudioControls
          chartData={{
            hdType,
            profile,
            authority,
            strategy,
            definedCenters,
            activeChannels,
            activeGates: Object.keys(gateData).filter(gate => gateData[gate].active)
          }}
        />
      )}

      {/* Theme Selector */}
      <ThemeSelector
        open={showThemeSelector}
        onClose={() => setShowThemeSelector(false)}
      />

      {/* Chart Sharing Modal */}
      <ChartSharingModal
        open={showSharingModal}
        onClose={() => setShowSharingModal(false)}
        chartData={{
          hdType,
          profile,
          authority,
          strategy,
          definedCenters,
          activeChannels,
          activeGates: Object.keys(gateData).filter(gate => gateData[gate].active)
        }}
      />
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(254,243,199,0.3)); }
          50% { filter: drop-shadow(0 0 20px rgba(254,243,199,0.8)); }
        }
        
        @keyframes wave {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
      `}</style>

      {/* Current Transits Section */}
      <motion.div
        
        
        
      >
        <Box sx={{ mt: 3 }}>
          <Paper sx={{
            p: 3,
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(254,243,199,0.2)',
            borderRadius: 3
          }}>
            <Typography variant="h6" sx={{ 
              color: '#fef3c7', 
              fontWeight: 700, 
              mb: 3, 
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}>
              <Zap size={24} />
              Aktuelle Planeten-Transite
              <Zap size={24} />
            </Typography>

            <Grid container spacing={2}>
              {(() => {
                // Robuste Fallback Planeten-Daten mit allen erforderlichen Eigenschaften
                const fallbackPlanets = [
                  {
                    id: 'sun',
                    name: 'Sonne',
                    symbol: '☉',
                    color: '#fbbf24',
                    currentGate: 45,
                    currentLine: 2,
                    speed: 1,
                    isRetrograde: false,
                    transitEffect: 'Aktuell aktiviert Tor 45 - Das Tor der Sammlung und des Zusammenkommens'
                  },
                  {
                    id: 'moon',
                    name: 'Mond',
                    symbol: '☽',
                    color: '#e5e7eb',
                    currentGate: 8,
                    currentLine: 4,
                    speed: 13.2,
                    isRetrograde: false,
                    transitEffect: 'Aktuell aktiviert Tor 8 - Das Tor des Beitrags und der Teilhabe'
                  },
                  {
                    id: 'mercury',
                    name: 'Merkur',
                    symbol: '☿',
                    color: '#06b6d4',
                    currentGate: 62,
                    currentLine: 1,
                    speed: 1.4,
                    isRetrograde: true,
                    transitEffect: 'Aktuell aktiviert Tor 62 - Das Tor der Details und der Präzision'
                  },
                  {
                    id: 'venus',
                    name: 'Venus',
                    symbol: '♀',
                    color: '#f97316',
                    currentGate: 27,
                    currentLine: 3,
                    speed: 1.2,
                    isRetrograde: false,
                    transitEffect: 'Aktuell aktiviert Tor 27 - Das Tor der Fürsorge und des Schutzes'
                  },
                  {
                    id: 'mars',
                    name: 'Mars',
                    symbol: '♂',
                    color: '#ef4444',
                    currentGate: 10,
                    currentLine: 5,
                    speed: 0.5,
                    isRetrograde: false,
                    transitEffect: 'Aktuell aktiviert Tor 10 - Das Tor des Tretens und des Gehens'
                  },
                  {
                    id: 'jupiter',
                    name: 'Jupiter',
                    symbol: '♃',
                    color: '#8b5cf6',
                    currentGate: 44,
                    currentLine: 6,
                    speed: 0.08,
                    isRetrograde: false,
                    transitEffect: 'Aktuell aktiviert Tor 44 - Das Tor der Annäherung und des Herangehens'
                  }
                ];

                try {
                  // Verwende direkt die Fallback-Planeten-Daten für Stabilität
                  const planets = fallbackPlanets;
                  return planets.slice(0, 6).map((planet) => {
                    // Sicherheits-Checks für alle Planeten-Eigenschaften
                    if (!planet || !planet.id || !planet.symbol) {
                      console.warn('Invalid planet data:', planet);
                      return null;
                    }
                    
                    return (
                      <Grid item xs={12} sm={6} md={4} key={planet.id}>
                        <Card sx={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(254,243,199,0.1)',
                          borderRadius: 2,
                          cursor: 'pointer',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.08)',
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s ease'
                          }
                        }}
                        onClick={() => {
                          setSelectedPlanetId(planet.id);
                          setShowPlanetDetails(true);
                        }}
                        >
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Box sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${planet.color}, ${planet.color}80)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.2rem',
                              color: 'white',
                              position: 'relative'
                            }}>
                              {planet.symbol}
                              {planet.isRetrograde && (
                                <Box sx={{
                                  position: 'absolute',
                                  top: -2,
                                  right: -2,
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  background: '#ef4444',
                                  fontSize: '0.6rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  R
                                </Box>
                              )}
                            </Box>
                            <Box>
                              <Typography variant="subtitle1" sx={{ color: '#fef3c7', fontWeight: 600, fontSize: '0.9rem' }}>
                                {planet.name}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(254,243,199,0.7)', fontSize: '0.7rem' }}>
                                Tor {planet.currentGate} • Linie {planet.currentLine}
                              </Typography>
                              {(() => {
                                const gateData = getGateData(planet.currentGate);
                                return gateData ? (
                                  <Typography variant="caption" sx={{ 
                                    color: 'rgba(254,243,199,0.5)', 
                                    fontSize: '0.65rem',
                                    display: 'block',
                                    mt: 0.5
                                  }}>
                                    {gateData.name}
                                  </Typography>
                                ) : null;
                              })()}
                            </Box>
                          </Box>
                          
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(254,243,199,0.8)', 
                            fontSize: '0.8rem',
                            lineHeight: 1.4,
                            mb: 1
                          }}>
                            {planet.transitEffect}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            <Chip
                              label={`${planet.speed}°/Tag`}
                              size="small"
                              sx={{
                                bgcolor: `${planet.color}20`,
                                color: planet.color,
                                border: `1px solid ${planet.color}40`,
                                fontSize: '0.6rem',
                                height: '20px'
                              }}
                            />
                            {planet.isRetrograde && (
                              <Chip
                                label="Retrograde"
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(239,68,68,0.2)',
                                  color: '#ef4444',
                                  border: '1px solid rgba(239,68,68,0.3)',
                                  fontSize: '0.6rem',
                                  height: '20px'
                                }}
                              />
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                    );
                  });
                } catch (error) {
                  console.error('Error loading planet transits:', error);
                  return [];
                }
              })()}
            </Grid>
          </Paper>
        </Box>
      </motion.div>

      {/* Profile Information Section - Separate */}
      <motion.div
        
        
        
      >
        <Box sx={{ mt: 3 }}>
          <Paper sx={{
            p: 3,
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(254,243,199,0.2)',
            borderRadius: 3
          }}>
            <Typography variant="h6" sx={{ 
              color: '#fef3c7', 
              fontWeight: 700, 
              mb: 3, 
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}>
              <Star size={24} />
              Dein Human Design Profil
              <Star size={24} />
            </Typography>

            <Grid container spacing={3}>
              {/* Profile */}
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1" sx={{ color: '#fef3c7', fontWeight: 700, mb: 1, fontSize: '1rem' }}>
                    Profil
                  </Typography>
                  <Chip
                    label={profile}
                    sx={{
                      bgcolor: 'rgba(168,85,247,0.2)',
                      color: '#c4b5fd',
                      border: '1px solid rgba(168,85,247,0.3)',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      height: '36px'
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)', mt: 1, fontSize: '0.8rem' }}>
                    Deine Lebensaufgabe
                  </Typography>
                </Box>
              </Grid>

              {/* Type */}
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1" sx={{ color: '#fef3c7', fontWeight: 700, mb: 1, fontSize: '1rem' }}>
                    Typ
                  </Typography>
                  <Chip
                    label={hdType}
                    sx={{
                      bgcolor: 'rgba(251,191,36,0.2)',
                      color: '#fde047',
                      border: '1px solid rgba(251,191,36,0.3)',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      height: '36px'
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)', mt: 1, fontSize: '0.8rem' }}>
                    Deine Grundnatur
                  </Typography>
                </Box>
              </Grid>

              {/* Authority */}
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1" sx={{ color: '#fef3c7', fontWeight: 700, mb: 1, fontSize: '1rem' }}>
                    Autorität
                  </Typography>
                  <Chip
                    label={authority}
                    sx={{
                      bgcolor: 'rgba(59,130,246,0.2)',
                      color: '#93c5fd',
                      border: '1px solid rgba(59,130,246,0.3)',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      height: '36px'
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)', mt: 1, fontSize: '0.8rem' }}>
                    Dein innerer Kompass
                  </Typography>
                </Box>
              </Grid>

              {/* Strategy */}
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="subtitle1" sx={{ color: '#fef3c7', fontWeight: 700, mb: 1, fontSize: '1rem' }}>
                    Strategie
                  </Typography>
                  <Chip
                    label={strategy}
                    sx={{
                      bgcolor: 'rgba(34,197,94,0.2)',
                      color: '#86efac',
                      border: '1px solid rgba(34,197,94,0.3)',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      height: '36px'
                    }}
                  />
                  <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)', mt: 1, fontSize: '0.8rem' }}>
                    Dein Handlungsweg
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Detailed Information */}
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(254,243,199,0.2)' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#fef3c7', fontWeight: 700, mb: 1 }}>
                      Definierten Zentren
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#10b981', fontWeight: 800 }}>
                      {definedCenters.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)' }}>
                      Deine stabilen Energien
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#fef3c7', fontWeight: 700, mb: 1 }}>
                      Aktive Kanäle
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#fbbf24', fontWeight: 800 }}>
                      {activeChannels.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)' }}>
                      Deine natürlichen Talente
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#fef3c7', fontWeight: 700, mb: 1 }}>
                      Aktive Tore
                    </Typography>
                    <Typography variant="h4" sx={{ color: '#8b5cf6', fontWeight: 800 }}>
                      {Object.keys(gateData).filter(gate => gateData[gate].active).length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)' }}>
                      Deine aktiven Energien
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      </motion.div>

      {/* Extended Profile Information Section */}
      <motion.div
        
        
        
      >
        <Box sx={{ mt: 4 }}>
          <Paper sx={{
            p: 4,
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(254,243,199,0.2)',
            borderRadius: 3
          }}>
            <Typography variant="h5" sx={{ 
              color: '#fef3c7', 
              fontWeight: 700, 
              mb: 3, 
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2
            }}>
              <Star size={28} />
              Detaillierte Profil-Informationen
              <Star size={28} />
            </Typography>

            <Grid container spacing={4}>
              {/* Profile Details */}
              <Grid item xs={12} md={6}>
                <Card sx={{
                  background: 'rgba(168,85,247,0.1)',
                  border: '1px solid rgba(168,85,247,0.3)',
                  borderRadius: 2
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ 
                      color: '#c4b5fd', 
                      fontWeight: 700, 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Crown size={20} />
                      Profil {profile} - Deine Lebensaufgabe
                    </Typography>
                    <Typography sx={{ color: 'rgba(254,243,199,0.8)', lineHeight: 1.6, mb: 2 }}>
                      Dein Profil {profile} zeigt dir deine spezifische Lebensaufgabe und wie du am besten 
                      durch das Leben navigierst. Es ist dein persönlicher Wegweiser.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label="Lebensaufgabe" size="small" sx={{ bgcolor: 'rgba(168,85,247,0.2)', color: '#c4b5fd' }} />
                      <Chip label="Persönlicher Weg" size="small" sx={{ bgcolor: 'rgba(168,85,247,0.2)', color: '#c4b5fd' }} />
                      <Chip label="Navigation" size="small" sx={{ bgcolor: 'rgba(168,85,247,0.2)', color: '#c4b5fd' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Type Details */}
              <Grid item xs={12} md={6}>
                <Card sx={{
                  background: 'rgba(251,191,36,0.1)',
                  border: '1px solid rgba(251,191,36,0.3)',
                  borderRadius: 2
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ 
                      color: '#fde047', 
                      fontWeight: 700, 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <User size={20} />
                      {hdType} - Deine Grundnatur
                    </Typography>
                    <Typography sx={{ color: 'rgba(254,243,199,0.8)', lineHeight: 1.6, mb: 2 }}>
                      Als {hdType} hast du eine spezifische Art, Energie zu verarbeiten und zu nutzen. 
                      Dein Typ bestimmt, wie du am besten funktionierst und mit der Welt interagierst.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label="Energie-Typ" size="small" sx={{ bgcolor: 'rgba(251,191,36,0.2)', color: '#fde047' }} />
                      <Chip label="Grundnatur" size="small" sx={{ bgcolor: 'rgba(251,191,36,0.2)', color: '#fde047' }} />
                      <Chip label="Funktionsweise" size="small" sx={{ bgcolor: 'rgba(251,191,36,0.2)', color: '#fde047' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Authority Details */}
              <Grid item xs={12} md={6}>
                <Card sx={{
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: 2
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ 
                      color: '#93c5fd', 
                      fontWeight: 700, 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Eye size={20} />
                      {authority} Authority - Dein innerer Kompass
                    </Typography>
                    <Typography sx={{ color: 'rgba(254,243,199,0.8)', lineHeight: 1.6, mb: 2 }}>
                      Deine {authority} Authority ist dein innerer Entscheidungsmechanismus. 
                      Sie zeigt dir, wie du am besten Entscheidungen triffst, die zu dir passen.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label="Entscheidungen" size="small" sx={{ bgcolor: 'rgba(59,130,246,0.2)', color: '#93c5fd' }} />
                      <Chip label="Innerer Kompass" size="small" sx={{ bgcolor: 'rgba(59,130,246,0.2)', color: '#93c5fd' }} />
                      <Chip label="Vertrauen" size="small" sx={{ bgcolor: 'rgba(59,130,246,0.2)', color: '#93c5fd' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Strategy Details */}
              <Grid item xs={12} md={6}>
                <Card sx={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: 2
                }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ 
                      color: '#86efac', 
                      fontWeight: 700, 
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Target size={20} />
                      {strategy} - Dein Handlungsweg
                    </Typography>
                    <Typography sx={{ color: 'rgba(254,243,199,0.8)', lineHeight: 1.6, mb: 2 }}>
                      Deine Strategie &quot;{strategy}&quot; zeigt dir den besten Weg, wie du handeln solltest. 
                      Sie ist dein Leitfaden für erfolgreiche Entscheidungen und Handlungen.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label="Handlungsweg" size="small" sx={{ bgcolor: 'rgba(34,197,94,0.2)', color: '#86efac' }} />
                      <Chip label="Strategie" size="small" sx={{ bgcolor: 'rgba(34,197,94,0.2)', color: '#86efac' }} />
                      <Chip label="Erfolg" size="small" sx={{ bgcolor: 'rgba(34,197,94,0.2)', color: '#86efac' }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Additional Information */}
            <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(254,243,199,0.2)' }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#fef3c7', fontWeight: 700, mb: 1 }}>
                      Definierten Zentren
                    </Typography>
                    <Typography variant="h3" sx={{ color: '#10b981', fontWeight: 800 }}>
                      {definedCenters.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)' }}>
                      Deine stabilen Energien
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#fef3c7', fontWeight: 700, mb: 1 }}>
                      Aktive Kanäle
                    </Typography>
                    <Typography variant="h3" sx={{ color: '#fbbf24', fontWeight: 800 }}>
                      {activeChannels.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)' }}>
                      Deine natürlichen Talente
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#fef3c7', fontWeight: 700, mb: 1 }}>
                      Aktive Tore
                    </Typography>
                    <Typography variant="h3" sx={{ color: '#8b5cf6', fontWeight: 800 }}>
                      {Object.keys(gateData).filter(gate => gateData[gate].active).length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(254,243,199,0.7)' }}>
                      Deine aktiven Energien
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      </motion.div>
    </motion.div>
  );
}


// Exportiere die Komponente direkt - wird als dynamische Komponente geladen
export default HumanDesignChart;
