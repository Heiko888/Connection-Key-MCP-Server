export interface ChartTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    // Zentren
    definedCenter: string;
    undefinedCenter: string;
    definedCenterBorder: string;
    undefinedCenterBorder: string;
    
    // Kanäle
    definedChannel: string;
    undefinedChannel: string;
    
    // Gates
    definedGate: string;
    undefinedGate: string;
    definedGateBorder: string;
    undefinedGateBorder: string;
    
    // Hintergrund
    background: string;
    backgroundSecondary: string;
    
    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    
    // Akzente
    accent: string;
    accentHover: string;
    success: string;
    warning: string;
    error: string;
  };
}

export const chartThemes: ChartTheme[] = [
  {
    id: 'classic',
    name: 'Klassisch',
    description: 'Traditionelle Human Design Farben',
    colors: {
      definedCenter: '#FFD700',
      undefinedCenter: '#E0E0E0',
      definedCenterBorder: '#B8860B',
      undefinedCenterBorder: '#A0A0A0',
      definedChannel: '#FFD700',
      undefinedChannel: '#E0E0E0',
      definedGate: '#FFD700',
      undefinedGate: '#E0E0E0',
      definedGateBorder: '#B8860B',
      undefinedGateBorder: '#A0A0A0',
      background: '#FFFFFF',
      backgroundSecondary: '#F8F9FA',
      textPrimary: '#1A1A1A',
      textSecondary: '#4A4A4A',
      textMuted: '#8A8A8A',
      accent: '#8B5CF6',
      accentHover: '#7C3AED',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    }
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Dunkles Theme für bessere Augen',
    colors: {
      definedCenter: '#FFD700',
      undefinedCenter: '#374151',
      definedCenterBorder: '#B8860B',
      undefinedCenterBorder: '#4B5563',
      definedChannel: '#FFD700',
      undefinedChannel: '#374151',
      definedGate: '#FFD700',
      undefinedGate: '#374151',
      definedGateBorder: '#B8860B',
      undefinedGateBorder: '#4B5563',
      background: '#1F2937',
      backgroundSecondary: '#111827',
      textPrimary: '#F9FAFB',
      textSecondary: '#D1D5DB',
      textMuted: '#9CA3AF',
      accent: '#8B5CF6',
      accentHover: '#7C3AED',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    }
  },
  {
    id: 'ocean',
    name: 'Ozean',
    description: 'Blaue Ozean-Farben',
    colors: {
      definedCenter: '#0EA5E9',
      undefinedCenter: '#E0F2FE',
      definedCenterBorder: '#0284C7',
      undefinedCenterBorder: '#BAE6FD',
      definedChannel: '#0EA5E9',
      undefinedChannel: '#E0F2FE',
      definedGate: '#0EA5E9',
      undefinedGate: '#E0F2FE',
      definedGateBorder: '#0284C7',
      undefinedGateBorder: '#BAE6FD',
      background: '#F0F9FF',
      backgroundSecondary: '#E0F2FE',
      textPrimary: '#0C4A6E',
      textSecondary: '#075985',
      textMuted: '#0369A1',
      accent: '#0EA5E9',
      accentHover: '#0284C7',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    }
  },
  {
    id: 'sunset',
    name: 'Sonnenuntergang',
    description: 'Warme Orange- und Pink-Töne',
    colors: {
      definedCenter: '#F97316',
      undefinedCenter: '#FED7AA',
      definedCenterBorder: '#EA580C',
      undefinedCenterBorder: '#FDBA74',
      definedChannel: '#F97316',
      undefinedChannel: '#FED7AA',
      definedGate: '#F97316',
      undefinedGate: '#FED7AA',
      definedGateBorder: '#EA580C',
      undefinedGateBorder: '#FDBA74',
      background: '#FFF7ED',
      backgroundSecondary: '#FFEDD5',
      textPrimary: '#9A3412',
      textSecondary: '#C2410C',
      textMuted: '#EA580C',
      accent: '#EC4899',
      accentHover: '#DB2777',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    }
  },
  {
    id: 'forest',
    name: 'Wald',
    description: 'Grüne Natur-Farben',
    colors: {
      definedCenter: '#059669',
      undefinedCenter: '#D1FAE5',
      definedCenterBorder: '#047857',
      undefinedCenterBorder: '#A7F3D0',
      definedChannel: '#059669',
      undefinedChannel: '#D1FAE5',
      definedGate: '#059669',
      undefinedGate: '#D1FAE5',
      definedGateBorder: '#047857',
      undefinedGateBorder: '#A7F3D0',
      background: '#F0FDF4',
      backgroundSecondary: '#DCFCE7',
      textPrimary: '#064E3B',
      textSecondary: '#065F46',
      textMuted: '#047857',
      accent: '#059669',
      accentHover: '#047857',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    }
  },
  {
    id: 'cosmic',
    name: 'Kosmisch',
    description: 'Lila und Pink für mystische Vibes',
    colors: {
      definedCenter: '#8B5CF6',
      undefinedCenter: '#EDE9FE',
      definedCenterBorder: '#7C3AED',
      undefinedCenterBorder: '#DDD6FE',
      definedChannel: '#8B5CF6',
      undefinedChannel: '#EDE9FE',
      definedGate: '#8B5CF6',
      undefinedGate: '#EDE9FE',
      definedGateBorder: '#7C3AED',
      undefinedGateBorder: '#DDD6FE',
      background: '#FAF5FF',
      backgroundSecondary: '#F3E8FF',
      textPrimary: '#581C87',
      textSecondary: '#7C2D12',
      textMuted: '#A21CAF',
      accent: '#EC4899',
      accentHover: '#DB2777',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    }
  },
  {
    id: 'planetarisch',
    name: 'Planetarisch',
    description: 'Dunkles Theme mit planetarischen Farben (Sonne, Mond, Planeten)',
    colors: {
      definedCenter: '#FFD700',
      undefinedCenter: '#2D1B3D',
      definedCenterBorder: '#F29F05',
      undefinedCenterBorder: '#4A2C5A',
      definedChannel: '#FFD700',
      undefinedChannel: '#3D2B4D',
      definedGate: '#FFD700',
      undefinedGate: '#2D1B3D',
      definedGateBorder: '#F29F05',
      undefinedGateBorder: '#4A2C5A',
      background: '#0F0A1A',
      backgroundSecondary: '#1A0F2E',
      textPrimary: '#FFD700',
      textSecondary: '#F29F05',
      textMuted: '#8C1D04',
      accent: '#FFD700',
      accentHover: '#F29F05',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444'
    }
  }
];

export const getThemeById = (id: string): ChartTheme => {
  return chartThemes.find(theme => theme.id === id) || chartThemes[0];
};

export const getDefaultTheme = (): ChartTheme => {
  return chartThemes[0];
};
