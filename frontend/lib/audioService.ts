// Audio-Service für Human Design Chart

export interface AudioConfig {
  enabled: boolean;
  volume: number;
  rate: number;
  pitch: number;
  voice: string;
  language: string;
}

export interface AudioElement {
  id: string;
  name: string;
  description: string;
  type: 'center' | 'channel' | 'gate' | 'planet' | 'profile' | 'authority' | 'strategy';
  audioText: string;
}

class AudioService {
  private synth: SpeechSynthesis;
  private config: AudioConfig;
  private isPlaying: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    // SSR-Sicherheit: window nur im Browser verfügbar
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
    } else {
      // Fallback für SSR
      this.synth = {} as SpeechSynthesis;
    }
    
    this.config = {
      enabled: true,
      volume: 0.8,
      rate: 0.9,
      pitch: 1.0,
      voice: '',
      language: 'de-DE'
    };
  }

  // Verfügbare Stimmen abrufen
  getVoices(): SpeechSynthesisVoice[] {
    if (typeof window !== 'undefined' && this.synth.getVoices) {
      return this.synth.getVoices();
    }
    return [];
  }

  // Deutsche Stimmen filtern
  getGermanVoices(): SpeechSynthesisVoice[] {
    return this.getVoices().filter(voice => 
      voice.lang.startsWith('de') || voice.lang.includes('German')
    );
  }

  // Standard-Stimme setzen
  setDefaultVoice(): void {
    const germanVoices = this.getGermanVoices();
    if (germanVoices.length > 0) {
      // Bevorzuge weibliche Stimmen für bessere Verständlichkeit
      const femaleVoice = germanVoices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('anna') ||
        voice.name.toLowerCase().includes('petra')
      );
      
      this.config.voice = femaleVoice ? femaleVoice.name : germanVoices[0].name;
    }
  }

  // Konfiguration aktualisieren
  updateConfig(newConfig: Partial<AudioConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Aktuelle Konfiguration abrufen
  getConfig(): AudioConfig {
    return { ...this.config };
  }

  // Audio abspielen
  speak(text: string, options?: Partial<AudioConfig>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.config.enabled || !text.trim() || typeof window === 'undefined') {
        resolve();
        return;
      }

      // Vorherige Wiedergabe stoppen
      this.stop();

      const utterance = new (window as any).SpeechSynthesisUtterance(text);
      const config = { ...this.config, ...options };

      // Stimme setzen
      if (config.voice) {
        const voices = this.getVoices();
        const selectedVoice = voices.find(voice => voice.name === config.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }

      // Einstellungen anwenden
      utterance.volume = config.volume;
      utterance.rate = config.rate;
      utterance.pitch = config.pitch;
      utterance.lang = config.language;

      // Event-Handler
      utterance.onstart = () => {
        this.isPlaying = true;
      };

      utterance.onend = () => {
        this.isPlaying = false;
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event: any) => {
        this.isPlaying = false;
        this.currentUtterance = null;
        reject(new Error(`Audio-Fehler: ${event.error}`));
      };

      this.currentUtterance = utterance;
      if (typeof window !== 'undefined') {
        this.synth.speak(utterance);
      }
    });
  }

  // Audio stoppen
  stop(): void {
    if (typeof window !== 'undefined' && this.synth.speaking) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.currentUtterance = null;
  }

  // Ist Audio aktiv?
  isAudioPlaying(): boolean {
    return this.isPlaying;
  }

  // Text für Human Design Elemente generieren
  generateAudioText(element: AudioElement): string {
    const baseText = `${element.name}. ${element.description}`;
    
    switch (element.type) {
      case 'center':
        return `${element.name} Zentrum. ${element.description}. Dieses Zentrum ist ein wichtiger Teil deines Human Design Charts.`;
      
      case 'channel':
        return `Kanal ${element.name}. ${element.description}. Dieser Kanal verbindet zwei Zentren in deinem Chart.`;
      
      case 'gate':
        return `Tor ${element.name}. ${element.description}. Dieses Tor aktiviert spezifische Energien in deinem Chart.`;
      
      case 'planet':
        return `Planet ${element.name}. ${element.description}. Dieser Planet beeinflusst dein Human Design Chart.`;
      
      case 'profile':
        return `Profil ${element.name}. ${element.description}. Dein Profil zeigt deine Lebensaufgabe und deine Art, die Welt zu erleben.`;
      
      case 'authority':
        return `Autorität ${element.name}. ${element.description}. Deine Autorität ist dein innerer Kompass für Entscheidungen.`;
      
      case 'strategy':
        return `Strategie ${element.name}. ${element.description}. Deine Strategie zeigt dir den besten Weg für Entscheidungen.`;
      
      default:
        return baseText;
    }
  }

  // Human Design Chart beschreiben
  async describeChart(chartData: {
    hdType: string;
    profile: string;
    authority: string;
    strategy: string;
    definedCenters: string[];
    activeChannels: string[];
    activeGates: string[];
  }): Promise<void> {
    const description = `
      Dein Human Design Chart zeigt, dass du ein ${chartData.hdType} mit dem Profil ${chartData.profile} bist. 
      Deine Autorität ist ${chartData.authority} und deine Strategie ist ${chartData.strategy}. 
      Du hast ${chartData.definedCenters.length} definierte Zentren, ${chartData.activeChannels.length} aktive Kanäle 
      und ${chartData.activeGates.length} aktive Tore. 
      Dieses Chart zeigt deine einzigartige energetische Konstitution und deine natürlichen Talente.
    `;

    await this.speak(description);
  }

  // Element-Hover-Audio
  async playHoverAudio(element: AudioElement): Promise<void> {
    const text = `${element.name}`;
    await this.speak(text, { volume: 0.5, rate: 1.2 });
  }

  // Element-Click-Audio
  async playClickAudio(element: AudioElement): Promise<void> {
    const text = this.generateAudioText(element);
    await this.speak(text);
  }

  // Chart-Übersicht
  async playChartOverview(chartData: any): Promise<void> {
    const overview = `
      Willkommen zu deinem Human Design Chart. 
      Du bist ein ${chartData.hdType} mit dem Profil ${chartData.profile}. 
      Klicke auf die verschiedenen Elemente, um mehr über sie zu erfahren. 
      Du kannst auch die Audio-Beschreibungen aktivieren, um eine vollständige Übersicht zu erhalten.
    `;

    await this.speak(overview);
  }

  // Accessibility-Features
  async announceAccessibility(): Promise<void> {
    const announcement = `
      Audio-Unterstützung aktiviert. 
      Du kannst jetzt auf die verschiedenen Elemente des Charts klicken, 
      um Audio-Beschreibungen zu hören. 
      Verwende die Audio-Kontrollen, um Lautstärke und Geschwindigkeit anzupassen.
    `;

    await this.speak(announcement);
  }

  // Test-Audio
  async testAudio(): Promise<void> {
    const testText = "Audio-System funktioniert korrekt. Du kannst jetzt die Human Design Chart-Beschreibungen hören.";
    await this.speak(testText);
  }
}

// Singleton-Instanz - lazy initialisiert
let audioServiceInstance: AudioService | null = null;

export const getAudioService = (): AudioService => {
  if (!audioServiceInstance) {
    audioServiceInstance = new AudioService();
  }
  return audioServiceInstance;
};

// Für Rückwärtskompatibilität - nur im Browser
export const audioService = typeof window !== 'undefined' ? getAudioService() : null as any;

// Hook für React-Komponenten - SSR-sicher
export const useAudio = () => {
  const [isEnabled, setIsEnabled] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([]);
  const [audioService, setAudioService] = React.useState<any>(null);

  React.useEffect(() => {
    // AudioService nur im Browser initialisieren
    if (typeof window !== 'undefined') {
      const service = getAudioService();
      setAudioService(service);
      setIsEnabled(service.getConfig().enabled);
      setIsPlaying(service.isAudioPlaying());
      
      // Stimmen laden
      const loadVoices = () => {
        const availableVoices = service.getVoices();
        setVoices(availableVoices);
        
        if (availableVoices.length > 0 && !service.getConfig().voice) {
          service.setDefaultVoice();
        }
      };

      loadVoices();
      
      // Event-Listener für Stimmen-Änderungen
      const handleVoicesChanged = () => {
        loadVoices();
      };

      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);

      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);

  const toggleAudio = () => {
    if (!audioService) return;
    
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    audioService.updateConfig({ enabled: newEnabled });
    
    if (!newEnabled) {
      audioService.stop();
    }
  };

  const updateConfig = (config: Partial<AudioConfig>) => {
    if (audioService) {
      audioService.updateConfig(config);
    }
  };

  const speak = (text: string, options?: Partial<AudioConfig>) => {
    if (audioService) {
      return audioService.speak(text, options);
    }
    return Promise.resolve();
  };

  const stop = () => {
    if (audioService) {
      audioService.stop();
    }
  };

  return {
    isEnabled,
    isPlaying,
    voices,
    toggleAudio,
    updateConfig,
    speak,
    stop,
    config: audioService ? audioService.getConfig() : { enabled: false, volume: 0.8, rate: 0.9, pitch: 1.0, voice: '', language: 'de-DE' }
  };
};

// React Import für Hook
import React from 'react';
