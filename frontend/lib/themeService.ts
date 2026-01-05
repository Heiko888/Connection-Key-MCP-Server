// Theme-Service für Human Design Chart

export interface ThemeColors {
  // Background
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  
  // Chart Elements
  centerActive: string;
  centerInactive: string;
  channelActive: string;
  channelInactive: string;
  gateActive: string;
  gateInactive: string;
  planetActive: string;
  planetInactive: string;
  
  // UI Elements
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  
  // Borders and Shadows
  border: string;
  borderSecondary: string;
  shadow: string;
  glow: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  isDark: boolean;
  category: 'cosmic' | 'nature' | 'minimal' | 'vibrant' | 'custom';
}

export const themes: { [key: string]: Theme } = {
  cosmic: {
    id: 'cosmic',
    name: 'Dating Design',
    description: 'Modernes Dating-Design mit Pink und Teal Akzenten',
    isDark: true,
    category: 'cosmic',
    colors: {
      background: `
        radial-gradient(circle at 20% 20%, rgba(255, 107, 157, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(78, 205, 196, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #0F0F23 0%, #1A1A2E 100%)
      `,
      backgroundSecondary: 'rgba(255,255,255,0.05)',
      backgroundTertiary: 'rgba(255,255,255,0.02)',
      textPrimary: '#ffffff',
      textSecondary: 'rgba(255,255,255,0.8)',
      textTertiary: 'rgba(255,255,255,0.6)',
      centerActive: '#ff6b9d',
      centerInactive: 'rgba(255, 107, 157, 0.3)',
      channelActive: '#4ecdc4',
      channelInactive: 'rgba(78, 205, 196, 0.3)',
      gateActive: '#10b981',
      gateInactive: 'rgba(16,185,129,0.3)',
      planetActive: '#667eea',
      planetInactive: 'rgba(102, 126, 234, 0.3)',
      primary: '#ff6b9d',
      secondary: '#4ecdc4',
      accent: '#FFD700',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      border: 'rgba(255,255,255,0.1)',
      borderSecondary: 'rgba(255,255,255,0.05)',
      shadow: 'rgba(0,0,0,0.3)',
      glow: 'rgba(255, 107, 157, 0.4)'
    }
  },
  
  nature: {
    id: 'nature',
    name: 'Natur',
    description: 'Erdige Töne und natürliche Farben',
    isDark: false,
    category: 'nature',
    colors: {
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 25%, #bbf7d0 50%, #86efac 75%, #4ade80 100%)',
      backgroundSecondary: 'rgba(255,255,255,0.8)',
      backgroundTertiary: 'rgba(255,255,255,0.6)',
      textPrimary: '#1f2937',
      textSecondary: 'rgba(31,41,55,0.8)',
      textTertiary: 'rgba(31,41,55,0.6)',
      centerActive: '#059669',
      centerInactive: 'rgba(5,150,105,0.3)',
      channelActive: '#d97706',
      channelInactive: 'rgba(217,119,6,0.3)',
      gateActive: '#7c3aed',
      gateInactive: 'rgba(124,58,237,0.3)',
      planetActive: '#dc2626',
      planetInactive: 'rgba(220,38,38,0.3)',
      primary: '#059669',
      secondary: '#10b981',
      accent: '#d97706',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      border: 'rgba(31,41,55,0.2)',
      borderSecondary: 'rgba(31,41,55,0.1)',
      shadow: 'rgba(0,0,0,0.1)',
      glow: 'rgba(5,150,105,0.4)'
    }
  },
  
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Saubere, reduzierte Farbpalette',
    isDark: true,
    category: 'minimal',
    colors: {
      background: 'linear-gradient(135deg, #1f2937 0%, #374151 25%, #4b5563 50%, #6b7280 75%, #9ca3af 100%)',
      backgroundSecondary: 'rgba(255,255,255,0.1)',
      backgroundTertiary: 'rgba(255,255,255,0.05)',
      textPrimary: '#f9fafb',
      textSecondary: 'rgba(249,250,251,0.8)',
      textTertiary: 'rgba(249,250,251,0.6)',
      centerActive: '#3b82f6',
      centerInactive: 'rgba(59,130,246,0.3)',
      channelActive: '#f59e0b',
      channelInactive: 'rgba(245,158,11,0.3)',
      gateActive: '#10b981',
      gateInactive: 'rgba(16,185,129,0.3)',
      planetActive: '#ef4444',
      planetInactive: 'rgba(239,68,68,0.3)',
      primary: '#3b82f6',
      secondary: '#60a5fa',
      accent: '#f59e0b',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      border: 'rgba(249,250,251,0.2)',
      borderSecondary: 'rgba(249,250,251,0.1)',
      shadow: 'rgba(0,0,0,0.2)',
      glow: 'rgba(59,130,246,0.4)'
    }
  },
  
  vibrant: {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Lebendige, energiegeladene Farben',
    isDark: true,
    category: 'vibrant',
    colors: {
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4c1d95 50%, #7c3aed 75%, #a855f7 100%)',
      backgroundSecondary: 'rgba(255,255,255,0.1)',
      backgroundTertiary: 'rgba(255,255,255,0.05)',
      textPrimary: '#fef3c7',
      textSecondary: 'rgba(254,243,199,0.8)',
      textTertiary: 'rgba(254,243,199,0.6)',
      centerActive: '#f59e0b',
      centerInactive: 'rgba(245,158,11,0.3)',
      channelActive: '#ec4899',
      channelInactive: 'rgba(236,72,153,0.3)',
      gateActive: '#10b981',
      gateInactive: 'rgba(16,185,129,0.3)',
      planetActive: '#ef4444',
      planetInactive: 'rgba(239,68,68,0.3)',
      primary: '#f59e0b',
      secondary: '#fbbf24',
      accent: '#ec4899',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      border: 'rgba(254,243,199,0.3)',
      borderSecondary: 'rgba(254,243,199,0.2)',
      shadow: 'rgba(0,0,0,0.3)',
      glow: 'rgba(245,158,11,0.5)'
    }
  },
  
  ocean: {
    id: 'ocean',
    name: 'Ozean',
    description: 'Tiefe Blau- und Türkistöne',
    isDark: true,
    category: 'nature',
    colors: {
      background: 'linear-gradient(135deg, #0c4a6e 0%, #075985 25%, #0369a1 50%, #0284c7 75%, #0ea5e9 100%)',
      backgroundSecondary: 'rgba(255,255,255,0.1)',
      backgroundTertiary: 'rgba(255,255,255,0.05)',
      textPrimary: '#f0f9ff',
      textSecondary: 'rgba(240,249,255,0.8)',
      textTertiary: 'rgba(240,249,255,0.6)',
      centerActive: '#06b6d4',
      centerInactive: 'rgba(6,182,212,0.3)',
      channelActive: '#f59e0b',
      channelInactive: 'rgba(245,158,11,0.3)',
      gateActive: '#10b981',
      gateInactive: 'rgba(16,185,129,0.3)',
      planetActive: '#ef4444',
      planetInactive: 'rgba(239,68,68,0.3)',
      primary: '#06b6d4',
      secondary: '#22d3ee',
      accent: '#f59e0b',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      border: 'rgba(240,249,255,0.2)',
      borderSecondary: 'rgba(240,249,255,0.1)',
      shadow: 'rgba(0,0,0,0.3)',
      glow: 'rgba(6,182,212,0.4)'
    }
  },
  
  sunset: {
    id: 'sunset',
    name: 'Sonnenuntergang',
    description: 'Warme Orange- und Rottöne',
    isDark: true,
    category: 'nature',
    colors: {
      background: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 25%, #f97316 50%, #fb923c 75%, #fdba74 100%)',
      backgroundSecondary: 'rgba(255,255,255,0.1)',
      backgroundTertiary: 'rgba(255,255,255,0.05)',
      textPrimary: '#fef3c7',
      textSecondary: 'rgba(254,243,199,0.8)',
      textTertiary: 'rgba(254,243,199,0.6)',
      centerActive: '#f59e0b',
      centerInactive: 'rgba(245,158,11,0.3)',
      channelActive: '#ec4899',
      channelInactive: 'rgba(236,72,153,0.3)',
      gateActive: '#10b981',
      gateInactive: 'rgba(16,185,129,0.3)',
      planetActive: '#ef4444',
      planetInactive: 'rgba(239,68,68,0.3)',
      primary: '#f59e0b',
      secondary: '#fbbf24',
      accent: '#ec4899',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      border: 'rgba(254,243,199,0.2)',
      borderSecondary: 'rgba(254,243,199,0.1)',
      shadow: 'rgba(0,0,0,0.3)',
      glow: 'rgba(245,158,11,0.4)'
    }
  }
};

class ThemeService {
  private currentTheme: Theme;
  private listeners: ((theme: Theme) => void)[] = [];

  constructor() {
    // Standard-Theme setzen
    this.currentTheme = themes.cosmic;
    
    // Theme aus localStorage laden (nur im Browser)
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('hd-chart-theme');
      if (savedTheme && themes[savedTheme]) {
        this.currentTheme = themes[savedTheme];
      }
    }
  }

  // Aktuelles Theme abrufen
  getCurrentTheme(): Theme {
    return this.currentTheme;
  }

  // Theme wechseln
  setTheme(themeId: string): void {
    if (themes[themeId]) {
      this.currentTheme = themes[themeId];
      if (typeof window !== 'undefined') {
        localStorage.setItem('hd-chart-theme', themeId);
      }
      this.notifyListeners();
    }
  }

  // Alle verfügbaren Themes abrufen
  getThemes(): Theme[] {
    return Object.values(themes);
  }

  // Themes nach Kategorie filtern
  getThemesByCategory(category: string): Theme[] {
    return Object.values(themes).filter(theme => theme.category === category);
  }

  // Theme-Listener hinzufügen
  addThemeListener(listener: (theme: Theme) => void): void {
    this.listeners.push(listener);
  }

  // Theme-Listener entfernen
  removeThemeListener(listener: (theme: Theme) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  // Listener benachrichtigen
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentTheme));
  }

  // CSS-Variablen für das aktuelle Theme generieren
  generateCSSVariables(): { [key: string]: string } {
    const colors = this.currentTheme.colors;
    return {
      '--hd-bg': colors.background,
      '--hd-bg-secondary': colors.backgroundSecondary,
      '--hd-bg-tertiary': colors.backgroundTertiary,
      '--hd-text-primary': colors.textPrimary,
      '--hd-text-secondary': colors.textSecondary,
      '--hd-text-tertiary': colors.textTertiary,
      '--hd-center-active': colors.centerActive,
      '--hd-center-inactive': colors.centerInactive,
      '--hd-channel-active': colors.channelActive,
      '--hd-channel-inactive': colors.channelInactive,
      '--hd-gate-active': colors.gateActive,
      '--hd-gate-inactive': colors.gateInactive,
      '--hd-planet-active': colors.planetActive,
      '--hd-planet-inactive': colors.planetInactive,
      '--hd-primary': colors.primary,
      '--hd-secondary': colors.secondary,
      '--hd-accent': colors.accent,
      '--hd-success': colors.success,
      '--hd-warning': colors.warning,
      '--hd-error': colors.error,
      '--hd-border': colors.border,
      '--hd-border-secondary': colors.borderSecondary,
      '--hd-shadow': colors.shadow,
      '--hd-glow': colors.glow
    };
  }

  // Theme auf DOM anwenden
  applyTheme(): void {
    const root = document.documentElement;
    const variables = this.generateCSSVariables();
    
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Body-Klasse für Dark/Light Mode
    if (this.currentTheme.isDark) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }

  // Benutzerdefiniertes Theme erstellen
  createCustomTheme(name: string, colors: Partial<ThemeColors>): Theme {
    const customTheme: Theme = {
      id: `custom-${Date.now()}`,
      name,
      description: 'Benutzerdefiniertes Theme',
      isDark: true,
      category: 'custom',
      colors: {
        ...themes.cosmic.colors, // Basis-Farben
        ...colors // Überschreiben mit benutzerdefinierten Farben
      }
    };
    
    return customTheme;
  }

  // Theme exportieren
  exportTheme(themeId: string): string {
    const theme = themes[themeId];
    if (theme) {
      return JSON.stringify(theme, null, 2);
    }
    return '';
  }

  // Theme importieren
  importTheme(themeJson: string): boolean {
    try {
      const theme = JSON.parse(themeJson) as Theme;
      if (theme.id && theme.name && theme.colors) {
        themes[theme.id] = theme;
        return true;
      }
    } catch (error) {
      console.error('Fehler beim Importieren des Themes:', error);
    }
    return false;
  }
}

// Singleton-Instanz - lazy initialisiert
let themeServiceInstance: ThemeService | null = null;

export const getThemeService = (): ThemeService => {
  if (!themeServiceInstance) {
    themeServiceInstance = new ThemeService();
  }
  return themeServiceInstance;
};

// Für Rückwärtskompatibilität - nur im Browser
export const themeService = typeof window !== 'undefined' ? getThemeService() : null as any;

// React Hook für Theme-Management - SSR-sicher
export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = React.useState<Theme | null>(null);
  const [themes, setThemes] = React.useState<Theme[]>([]);
  const [themeService, setThemeService] = React.useState<any>(null);

  React.useEffect(() => {
    // ThemeService nur im Browser initialisieren
    if (typeof window !== 'undefined') {
      const service = getThemeService();
      setThemeService(service);
      setCurrentTheme(service.getCurrentTheme());
      setThemes(service.getThemes());
      
      const handleThemeChange = (theme: Theme) => {
        setCurrentTheme(theme);
        service.applyTheme();
      };

      service.addThemeListener(handleThemeChange);
      service.applyTheme(); // Initial anwenden

      return () => {
        service.removeThemeListener(handleThemeChange);
      };
    }
  }, []);

  const changeTheme = (themeId: string) => {
    if (themeService) {
      themeService.setTheme(themeId);
    }
  };

  const getThemesByCategory = (category: string) => {
    if (themeService) {
      return themeService.getThemesByCategory(category);
    }
    return [];
  };

  return {
    currentTheme,
    themes,
    changeTheme,
    getThemesByCategory
  };
};

// React Import für Hook
import React from 'react';
